// ============================================================
//  Les envois programmés de l'enquête (appelés par la tâche quotidienne).
//
//  Trois choses, dans cet ordre :
//   1. J+2 après la révélation → questionnaire à l'organisateur ;
//   2. J+1 → questionnaire à tous les participants qui ont laissé leur
//      adresse et n'ont pas encore répondu ;
//   3. le récap de ce qui est arrivé depuis la veille.
//
//  La question posée dans l'album ne voit, par construction, que les gens qui
//  y sont arrivés : pas ceux qui ont buté sur le QR code, sur la caméra ou sur
//  le lien perdu. Le mail les rattrape, avec ceux qui ont fermé la fenêtre de
//  l'album sans répondre. On marque leur réponse comme venue « par mail » : si
//  leurs notes sont plus basses, la comparaison le dira noir sur blanc.
// ============================================================
import 'server-only'
import { selectRows, updateRow } from './supabase'
import { sendMail } from './mail'
import { CONTACT_EMAIL } from './pricing'
import { makeToken } from './account'
import { isRevealed } from './phase'
import { t } from './i18n'
import { langueDe } from './langue-serveur'
import {
  surveyOrgaEmail, surveyInviteEmail, recapAdmin,
  avisOrgaEmail, essaiEmail, lienRetourEssai, EXPEDITEUR_CLEMENT,
  lienAvisOrga, lienAvisInvite, lienDesinscription,
} from './avis-mail'

const JOUR = 24 * 60 * 60 * 1000

// Combien d'événements on regarde par passage.
const LOT = 40
// Plafond d'envois aux participants par passage. Brevo laisse 300 mails par jour
// sur l'offre gratuite, et l'enquête n'a aucune raison de passer devant les
// liens d'album. Ce qui déborde attendra le lendemain : le compte est
// retourné par la route pour que le report se voie.
const PLAFOND_INVITES = 60

// ---------- 1. L'organisateur, deux jours après la révélation ----------
// Ni le jour même (il est dans l'émotion, il note bien et ne se souvient de
// rien de précis), ni une semaine après (il a tout oublié).
//
// Depuis le 03/10/2026 : le lendemain de la révélation (et non plus J+2), un
// mail personnel signé Clément, étoiles cliquables dans le mail. 2 réponses
// sur 24 avec l'ancien questionnaire. Pas d'avis demandé sur une soirée sans
// aucune photo (les essais gratuits ont leur propre question, voir plus bas),
// ni à qui a déjà répondu depuis son tableau de bord.
export async function enqueteOrganisateurs(now = new Date()) {
  const seuil = new Date(now.getTime() - 1 * JOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    'select=id,name,owner_email,owner_token,reveal_at,reveal_paused,max_guests,langue' +
      `&reveal_at=lte.${seuil}` +
      '&survey_mailed_at=is.null' +
      '&owner_email=not.is.null' +
      '&purged_at=is.null' +
      '&is_demo=is.false' +
      `&order=reveal_at.desc&limit=${LOT}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('avis : lecture organisateurs impossible', data)
    return 0
  }

  let envoyes = 0
  for (const ev of data) {
    // Album encore fermé (pause, ou formule dépassée) : demander « comment
    // s'est passée votre soirée ? » à quelqu'un qui attend toujours ses
    // photos serait sourd. On repassera quand ce sera ouvert.
    const invites = await selectRows('guests', `event_id=eq.${ev.id}&select=id`)
    const ouvert = isRevealed({
      revealAt: ev.reveal_at,
      revealPaused: ev.reveal_paused,
      maxGuests: ev.max_guests,
      guestCount: Array.isArray(invites.data) ? invites.data.length : 0,
    })
    if (!ouvert) continue

    const [photos, dejaDonne] = await Promise.all([
      selectRows('photos', `event_id=eq.${ev.id}&select=id&limit=1`),
      selectRows('feedback', `event_id=eq.${ev.id}&role=eq.organisateur&select=id&limit=1`),
    ])
    const aucunePhoto = Array.isArray(photos.data) && photos.data.length === 0
    const aRepondu = Array.isArray(dejaDonne.data) && dejaDonne.data.length > 0
    if (aucunePhoto || aRepondu) {
      await updateRow('events', `id=eq.${ev.id}`, { survey_mailed_at: now.toISOString() })
      continue
    }

    const langue = langueDe(ev)
    const mail = avisOrgaEmail({
      langue,
      eventName: ev.name || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langue),
      link: lienAvisOrga(ev.owner_token),
    })
    const res = await sendMail({
      to: ev.owner_email, subject: mail.subject, html: mail.html,
      expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
    })
    // Marqué même en cas d'échec : une enquête n'est pas un service dû, et
    // mieux vaut la manquer qu'entrer dans une boucle de renvoi quotidien.
    await updateRow('events', `id=eq.${ev.id}`, { survey_mailed_at: now.toISOString() })
    if (res?.ok) envoyes++
  }
  return envoyes
}

// ---------- 2. Les participants, le lendemain de la révélation ----------
// Tous ceux qui ont laissé leur adresse et n'ont pas encore répondu, qu'ils
// aient vu l'album ou non. Jusqu'au 02/10/2026 seuls les non-ouvreurs le
// recevaient : la fenêtre de l'album devait suffire aux autres. Mais l'app et
// l'extrait d'app n'avaient plus que la note d'Apple, dont on ne lit rien, et
// les avis s'étaient taris (2 réponses pour 261 participants en septembre).
// Le lendemain plutôt que trois jours après : c'est encore frais. Envoyé une
// seule fois, sans aucune relance.
export async function enqueteInvites(now = new Date()) {
  const seuil = new Date(now.getTime() - 1 * JOUR).toISOString()
  // Une soirée vieille de plus de dix jours ne reçoit plus rien : un « qu'en
  // avez-vous pensé ? » qui arrive des semaines après tombe à plat, et cela
  // évite d'arroser d'un coup tout l'historique au déploiement.
  const plancher = new Date(now.getTime() - 10 * JOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    'select=id,name,reveal_at,reveal_paused,max_guests,langue' +
      `&reveal_at=lte.${seuil}` +
      `&reveal_at=gte.${plancher}` +
      '&reveal_paused=is.false' +
      '&purged_at=is.null' +
      '&is_demo=is.false' +
      `&order=reveal_at.desc&limit=${LOT}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('avis : lecture événements participants impossible', data)
    return { envoyes: 0, reportes: 0 }
  }

  let envoyes = 0
  let reportes = 0

  for (const ev of data) {
    const res = await selectRows(
      'guests',
      `event_id=eq.${ev.id}` +
        '&email=not.is.null' +
        '&feedback_at=is.null' +       // ceux qui n'ont pas déjà répondu dans l'album
        '&survey_mailed_at=is.null' +
        '&survey_optout=is.false' +
        '&select=id,email,token,langue&order=created_at.asc'
    )
    const invites = Array.isArray(res.data) ? res.data : []
    if (!invites.length) continue

    // L'album doit être réellement ouvert : envoyer un questionnaire sur des
    // photos que la personne ne peut pas encore voir n'aurait aucun sens.
    const tous = await selectRows('guests', `event_id=eq.${ev.id}&select=id`)
    const ouvert = isRevealed({
      revealAt: ev.reveal_at,
      revealPaused: ev.reveal_paused,
      maxGuests: ev.max_guests,
      guestCount: Array.isArray(tous.data) ? tous.data.length : 0,
    })
    if (!ouvert) continue

    for (const g of invites) {
      if (envoyes >= PLAFOND_INVITES) { reportes++; continue }

      // Le jeton est celui du lien personnel « mes photos ». Il peut manquer
      // si le participant a rejoint après la révélation : on le crée alors ici.
      let token = g.token
      if (!token) {
        token = makeToken()
        const maj = await updateRow('guests', `id=eq.${g.id}`, { token })
        if (!maj.ok) continue // sans jeton, le lien ne mènerait nulle part
      }

      const langue = langueDe(g, langueDe(ev))
      const mail = surveyInviteEmail({
        langue,
        eventName: ev.name || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langue),
        link: lienAvisInvite(token),
        stopLink: `${lienAvisInvite(token)}&stop=1`,
      })
      const envoi = await sendMail({ to: g.email, subject: mail.subject, html: mail.html, desinscription: lienDesinscription(token) })
      await updateRow('guests', `id=eq.${g.id}`, { survey_mailed_at: now.toISOString() })
      if (envoi?.ok) envoyes++
    }
  }

  return { envoyes, reportes }
}

// ---------- 3. Le récap ----------
// Tout ce qui est arrivé depuis le dernier passage. Les problèmes ont déjà
// fait l'objet d'une alerte immédiate ; ce message-ci donne la vue d'ensemble,
// et n'existe que les jours où il y a eu des réponses.
export async function recapDuJour() {
  const { ok, data } = await selectRows(
    'feedback',
    'digested_at=is.null&select=id,role,canal,rating,nps,nps_reason,issues,issue_detail,suggestion&order=created_at.asc&limit=500'
  )
  if (!ok || !Array.isArray(data) || !data.length) return 0

  const res = await recapAdmin(data)
  // Marqué quoi qu'il arrive : un récap raté ne doit pas faire réapparaître
  // les mêmes avis dans celui du lendemain, qui compterait tout en double.
  const ids = data.map((a) => a.id).filter(Boolean)
  if (ids.length) {
    await updateRow('feedback', `id=in.(${ids.join(',')})`, { digested_at: new Date().toISOString() })
  }
  return res?.ok ? data.length : 0
}


// ---------- 4. Les essais : soirée gratuite, aucune photo ----------
// « Vous avez pu essayer ? » le lendemain matin de la création (le cron
// passe chaque matin), puis une dernière fois une fois la soirée révélée, si
// toujours aucune photo ni réponse. Une réponse arrête tout.
export async function relanceEssais(now = new Date()) {
  const il = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
  const commun = 'select=id,name,owner_email,owner_token,langue,created_at,reveal_at' +
    '&paid_cents=eq.0&is_demo=is.false&is_test=is.false&purged_at=is.null' +
    '&owner_email=not.is.null&essai_reponse=is.null'
  const [premiers, derniers] = await Promise.all([
    // Créées depuis plus de 12 h (donc la veille au plus tard), moins de 7 jours.
    selectRows('events', `${commun}&essai_mailed_at=is.null&created_at=lte.${il(12)}&created_at=gte.${il(24 * 7)}&limit=${LOT}`),
    // Déjà relancées, révélées depuis moins de 7 jours.
    selectRows('events', `${commun}&essai_mailed_at=not.is.null&essai_relance_at=is.null&reveal_at=lte.${now.toISOString()}&reveal_at=gte.${il(24 * 7)}&limit=${LOT}`),
  ])

  let envoyes = 0
  const traiter = async (ev, relance) => {
    const photos = await selectRows('photos', `event_id=eq.${ev.id}&select=id&limit=1`)
    if (!Array.isArray(photos.data) || photos.data.length > 0) {
      // Des photos : ce n'est plus un essai resté en plan, on ne dit rien.
      if (!relance) await updateRow('events', `id=eq.${ev.id}`, { essai_mailed_at: now.toISOString(), essai_relance_at: now.toISOString() })
      return
    }
    const langue = langueDe(ev)
    const mail = essaiEmail({
      langue,
      relance,
      eventName: ev.name || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langue),
      lien: lienRetourEssai(ev.owner_token),
    })
    const res = await sendMail({
      to: ev.owner_email, subject: mail.subject, html: mail.html,
      expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
    })
    await updateRow('events', `id=eq.${ev.id}`, relance ? { essai_relance_at: now.toISOString() } : { essai_mailed_at: now.toISOString() })
    if (res?.ok) envoyes++
  }
  for (const ev of Array.isArray(premiers.data) ? premiers.data : []) await traiter(ev, false)
  for (const ev of Array.isArray(derniers.data) ? derniers.data : []) await traiter(ev, true)
  return envoyes
}
