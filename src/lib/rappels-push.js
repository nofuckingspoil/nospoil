// ============================================================
//  Les rappels de soirée envoyés aux téléphones Android.
//
//  L'ÉQUIVALENT ANDROID DE CE QUE FAIT L'IPHONE TOUT SEUL.
//
//  Sur iPhone, l'extrait d'app qui s'ouvre au scan du QR code pose ses rappels
//  dans le téléphone, à l'avance, et ils partent même hors connexion. Android
//  ne sait pas faire cela : un navigateur ne peut pas programmer une
//  notification pour dans deux heures. C'est donc le serveur qui doit compter
//  les heures et frapper au bon moment, et c'est ce fichier.
//
//  LES MÊMES MOMENTS QUE L'IPHONE. Les horaires ne sont pas réinventés ici :
//  ils viennent de `lib/rappels.js`, le fichier de calcul partagé entre le site
//  et l'application. Chaque participant garde son décalage de quelques minutes,
//  pour que cinquante téléphones ne vibrent pas à la même seconde.
//
//  ON NE REJOUE JAMAIS UN RAPPEL MANQUÉ. La tâche repasse toutes les dix
//  minutes ; si elle a été coupée deux heures, elle ne rattrape pas les deux
//  rappels ratés d'un coup. Elle envoie le dernier, et oublie les autres : un
//  rappel de 22 h reçu à minuit n'aide personne.
// ============================================================
import 'server-only'
import { selectRows, updateRow } from './supabase'
import { momentsRappels } from './rappels'
import { quotaExceeded } from './phase'
import { envoyerPush, pushConfigure } from './push-envoi'

// Aucune fête ne commence il y a plus de trente-six heures et n'est encore en
// cours. Sans cette borne, chaque passage relirait tous les événements du site.
const FENETRE_H = 36
const EVENEMENTS_MAX = 40
const ABONNES_MAX = 300

// Un rappel de soirée ne survit pas à la soirée : si le téléphone est éteint,
// le service de notification le garde deux heures, puis le jette. Mieux vaut
// rien qu'un rappel reçu au petit matin.
const TTL_RAPPEL = 2 * 3600
// La révélation, elle, attend une journée : l'album ne se périme pas.
const TTL_REVELATION = 24 * 3600

function nombreDePhotos(n) {
  return n === 1 ? 'une photo' : `${n} photos`
}

// Les mots sont ceux de l'iPhone, au caractère près (RappelsDuClip.swift dans
// le dépôt de l'application). Deux participants côte à côte, l'un sur Android
// et l'autre sur iPhone, doivent lire exactement la même chose.
function messageRappel(nomEvenement, restantes, eventId) {
  const nom = (nomEvenement || '').trim()
  return {
    titre: nom ? `${nom}, la soirée continue` : 'La soirée continue',
    corps: `Il vous reste ${nombreDePhotos(restantes)} à prendre. Elles rejoindront l'album de la fête.`,
    url: `/j/${eventId}`,
    tag: `ttf-rappel-${eventId}`,
  }
}

function messageRevelation(nomEvenement, eventId) {
  const nom = (nomEvenement || '').trim()
  return {
    titre: nom ? `${nom} : c'est la révélation` : "C'est la révélation",
    corps: "L'album vient de s'ouvrir. Découvrez la soirée par les yeux des autres.",
    url: `/g/${eventId}`,
    tag: `ttf-revelation-${eventId}`,
  }
}

// ------------------------------------------------------------
//  1. Les rappels pendant la fête
// ------------------------------------------------------------

export async function envoyerRappelsPush(maintenant = Date.now()) {
  if (!pushConfigure()) return { envoyes: 0, echecs: 0, ignore: 'notifications non configurées' }

  const now = new Date(maintenant)
  const depuis = new Date(maintenant - FENETRE_H * 3600 * 1000)

  // Les fêtes en cours : commencées, pas encore révélées, pas supprimées.
  const { ok, data } = await selectRows(
    'events',
    'select=id,name,starts_at,ends_at,reveal_at,reminder_offsets,shots_per_guest,bonus_shots,max_guests' +
      `&starts_at=lte.${now.toISOString()}` +
      `&starts_at=gte.${depuis.toISOString()}` +
      `&reveal_at=gt.${now.toISOString()}` +
      '&purged_at=is.null' +
      `&order=starts_at.desc&limit=${EVENEMENTS_MAX}`
  )
  if (!ok || !Array.isArray(data)) return { envoyes: 0, echecs: 0, ignore: 'lecture impossible' }

  let envoyes = 0
  let echecs = 0

  for (const ev of data) {
    try {
      const abonnes = await selectRows(
        'push_subscriptions',
        `event_id=eq.${ev.id}&select=id,guest_id,endpoint,p256dh,auth,last_sent_at&limit=${ABONNES_MAX}`
      )
      const liste = Array.isArray(abonnes.data) ? abonnes.data : []
      if (!liste.length) continue

      const invites = await selectRows(
        'guests',
        `event_id=eq.${ev.id}&select=id,shots_taken,bonus_shots,blocked`
      )
      const fiches = Array.isArray(invites.data) ? invites.data : []

      // Formule dépassée : l'appareil photo est verrouillé pour tout le monde.
      // Inviter à photographier serait envoyer les gens contre un mur.
      if (quotaExceeded({ maxGuests: ev.max_guests, guestCount: fiches.length })) continue

      const parId = new Map(fiches.map((g) => [g.id, g]))
      const dates = {
        startsAt: ev.starts_at,
        endsAt: ev.ends_at,
        revealAt: ev.reveal_at,
        rappels: ev.reminder_offsets,
      }

      for (const abo of liste) {
        const g = parId.get(abo.guest_id)
        if (!g || g.blocked) continue

        // Tous les moments prévus pour CE participant, y compris les passés :
        // c'est en les comparant à la dernière marque qu'on sait lequel est dû.
        const moments = momentsRappels(dates, abo.guest_id, 0)
        const deja = abo.last_sent_at ? Date.parse(abo.last_sent_at) : 0
        const dus = moments.filter((q) => q <= maintenant && q > deja)
        if (!dus.length) continue

        // On ne garde que le plus récent : voir « on ne rejoue jamais » en tête
        // de fichier. La marque prend l'heure PRÉVUE du rappel, pas celle de
        // l'envoi, pour que le rappel suivant reste attendu à son heure.
        const dernier = Math.max(...dus)
        const restantes = Math.max(
          0,
          (ev.shots_per_guest || 0) + (g.bonus_shots || 0) - (g.shots_taken || 0)
        )

        // Pellicule finie : rien à dire, mais la marque avance quand même,
        // sinon on reposerait la question à chaque passage.
        if (restantes > 0) {
          const res = await envoyerPush(abo, messageRappel(ev.name, restantes, ev.id), TTL_RAPPEL)
          if (res.ok) envoyes++
          else if (!res.disparu) echecs++
          // Abonnement disparu : la ligne vient d'être effacée, rien à marquer.
          if (res.disparu) continue
        }

        await updateRow('push_subscriptions', `id=eq.${abo.id}`, {
          last_sent_at: new Date(dernier).toISOString(),
        })
      }
    } catch (err) {
      // Une soirée qui échoue ne doit pas priver les suivantes de leurs rappels.
      console.error('rappels-push: envoi impossible pour', ev.id, err)
      echecs++
    }
  }

  return { envoyes, echecs, evenements: data.length }
}

// ------------------------------------------------------------
//  2. La révélation
// ------------------------------------------------------------
//
// Ce que l'iPhone ne peut pas faire : ses huit heures sont écoulées depuis
// longtemps quand l'album s'ouvre, le lendemain. Un téléphone Android abonné,
// lui, reste joignable. C'est la notification qui compte le plus, et elle part
// en même temps que le mail, pour ceux qui n'ont pas laissé d'adresse.
//
// `ev` : la ligne `events` brute, déjà vérifiée comme révélée par l'appelant.

export async function envoyerRevelationPush(ev) {
  if (!pushConfigure() || !ev?.id) return { envoyes: 0, echecs: 0 }

  const { ok, data } = await selectRows(
    'push_subscriptions',
    `event_id=eq.${ev.id}&revealed_at=is.null&select=id,endpoint,p256dh,auth&limit=${ABONNES_MAX}`
  )
  if (!ok || !Array.isArray(data) || !data.length) return { envoyes: 0, echecs: 0 }

  const message = messageRevelation(ev.name, ev.id)
  let envoyes = 0
  let echecs = 0

  for (const abo of data) {
    const res = await envoyerPush(abo, message, TTL_REVELATION)
    if (res.disparu) continue
    if (res.ok) envoyes++
    else echecs++
    // Marqué même en cas d'échec : réessayer indéfiniment ferait vibrer le
    // téléphone d'un participant plusieurs jours après la fête.
    await updateRow('push_subscriptions', `id=eq.${abo.id}`, { revealed_at: new Date().toISOString() })
  }

  return { envoyes, echecs }
}
