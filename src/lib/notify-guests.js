// ============================================================
//  Envoi du lien de l'album aux participants qui ont laissé leur adresse.
//
//  C'est la contrepartie de la collecte : ils ont donné leur mail pour ça,
//  et pour rien d'autre. L'envoi part tout seul dès la révélation.
//
//  Appelé de deux endroits :
//   - la tâche planifiée quotidienne (filet de sécurité) ;
//   - le tableau de bord, quand l'organisateur révèle lui-même
//     (pour que ça parte tout de suite, sans attendre le lendemain).
// ============================================================
import 'server-only'
import { selectRows, updateRow } from './supabase'
import { sendMail, albumReadyEmail, siteUrl } from './mail'
import { isRevealed } from './phase'

// On ne traite jamais plus de N participants par passage : le cron repasse,
// et un gros mariage ne doit pas faire expirer la requête.
const BATCH = 120

// ev : ligne `events` brute (colonnes Postgres).
// Renvoie { envoyes, echecs, ignore? }.
export async function notifyGuestsOfAlbum(ev) {
  if (!ev?.id) return { envoyes: 0, echecs: 0, ignore: 'événement inconnu' }

  // Rien ne part tant que les photos ne sont pas réellement ouvertes : ni avant
  // l'heure, ni pendant une suspension d'urgence, ni tant que la formule
  // souscrite est dépassée. Envoyer le lien d'un album encore fermé serait pire
  // que de ne rien envoyer : le participant cliquerait dans le vide.
  const tous = await selectRows('guests', `event_id=eq.${ev.id}&select=id`)
  const guestCount = Array.isArray(tous.data) ? tous.data.length : 0
  if (!isRevealed({
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount,
  })) {
    return { envoyes: 0, echecs: 0, ignore: 'album non révélé' }
  }

  const { ok, data } = await selectRows(
    'guests',
    `event_id=eq.${ev.id}&email=not.is.null&notified_at=is.null` +
      `&select=id,display_name,email&order=created_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data) || !data.length) return { envoyes: 0, echecs: 0 }

  const photos = await selectRows('photos', `select=id&event_id=eq.${ev.id}&hidden=is.false`)
  const photoCount = Array.isArray(photos.data) ? photos.data.length : 0
  const galleryUrl = `${siteUrl()}/g/${ev.id}`

  let envoyes = 0
  let echecs = 0
  for (const g of data) {
    if (!g.email) continue
    const mail = albumReadyEmail({
      eventName: ev.name,
      galleryUrl,
      photoCount,
      guestName: g.display_name,
    })
    const res = await sendMail({ to: g.email, subject: mail.subject, html: mail.html })
    // On horodate dans tous les cas : un échec ne doit pas déclencher une
    // boucle de renvoi quotidien. Le drapeau permet de le dire à l'organisateur.
    await updateRow('guests', `id=eq.${g.id}`, {
      notified_at: new Date().toISOString(),
      notify_failed: !res?.ok,
    })
    if (res?.ok) envoyes++
    else echecs++
  }

  return { envoyes, echecs }
}
