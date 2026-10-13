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
import { sendMail, siteUrl } from './mail'
import { lien } from './langue-lien'
import { CONTACT_EMAIL } from './pricing'
import { makeToken } from './account'
import { isRevealed } from './phase'
import { t } from './i18n'
import { langueDe } from './langue-serveur'
import {
  surveyOrgaEmail, surveyInviteEmail, recapAdmin,
  avisOrgaEmail, essaiEmail, essaiPhotoEmail, offreEssaiEmail, rappelOffreEmail,
  lienRetourEssai, lienCadeau, EXPEDITEUR_CLEMENT,
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
    'select=id,name,owner_email,avis_token,reveal_at,reveal_paused,max_guests,langue' +
      `&reveal_at=lte.${seuil}` +
      '&survey_mailed_at=is.null' +
      '&owner_email=not.is.null' +
      '&purged_at=is.null' +
      '&is_demo=is.false' +
      // Les essais gratuits ont leur propre mail (offreEssais) : le livre
      // d'or offert pour le vrai événement, à la place des étoiles.
      '&or=(paid_cents.is.null,paid_cents.gt.0,promo_code.not.is.null,max_guests.gt.5,is_test.is.true)' +
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
      link: lienAvisOrga(ev.avis_token),
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


// ---------- 4. Les essais gratuits ----------
// Un essai : formule gratuite (5 participants), sans code. Les soirées
// offertes par un code (fondateur, partenaire) sont de vrais événements :
// elles n'entrent pas dans ce parcours.
const ESSAI = '&paid_cents=eq.0&promo_code=is.null&max_guests=lte.5&is_demo=is.false&is_test=is.false&purged_at=is.null&owner_email=not.is.null'

const lienAppareil = (ev, langue) => `${siteUrl()}${lien(`/j/${ev.id}`, langue)}`
const qrAppareil = (ev) => `${siteUrl()}/api/qr/${ev.id}`

// Branche « aucune photo ».
// Mail 1, le lendemain matin de la création : « Prenez votre première
// photo ». Si la révélation est déjà passée (essai d'un soir), on saute
// directement au mail 2. Mail 2, une fois la soirée révélée, si toujours
// rien : « comment votre test s'est-il passé ? ». Une réponse arrête tout.
export async function relanceEssais(now = new Date()) {
  const il = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
  const commun = 'select=id,name,owner_email,avis_token,langue,created_at,reveal_at' +
    ESSAI + '&essai_reponse=is.null'
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
      // Des photos : ce n'est plus un essai resté en plan, on ne dit rien ici
      // (la branche « photos » prend le relais après la révélation).
      if (!relance) await updateRow('events', `id=eq.${ev.id}`, { essai_mailed_at: now.toISOString(), essai_relance_at: now.toISOString() })
      return
    }
    const langue = langueDe(ev)
    const eventName = ev.name || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langue)
    // Déjà révélé au premier passage : l'appareil est fermé, inviter à
    // photographier n'aurait plus de sens.
    const dejaRevele = new Date(ev.reveal_at).getTime() <= now.getTime()
    const question = relance || dejaRevele
    const mail = question
      ? essaiEmail({ langue, eventName, lien: lienRetourEssai(ev.avis_token) })
      : essaiPhotoEmail({ langue, eventName, lienAppareil: lienAppareil(ev, langue), qrUrl: qrAppareil(ev) })
    const res = await sendMail({
      to: ev.owner_email, subject: mail.subject, html: mail.html,
      expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
    })
    await updateRow('events', `id=eq.${ev.id}`, relance
      ? { essai_relance_at: now.toISOString() }
      : dejaRevele
        ? { essai_mailed_at: now.toISOString(), essai_relance_at: now.toISOString() }
        : { essai_mailed_at: now.toISOString() })
    if (res?.ok) envoyes++
  }
  for (const ev of Array.isArray(premiers.data) ? premiers.data : []) await traiter(ev, false)
  for (const ev of Array.isArray(derniers.data) ? derniers.data : []) await traiter(ev, true)
  return envoyes
}

// L'organisateur de l'essai a-t-il déjà créé un vrai événement depuis ?
async function aCreeUnVraiEvenement(ev, depuis) {
  const { data } = await selectRows(
    'events',
    `owner_email=eq.${encodeURIComponent(ev.owner_email)}` +
      `&id=neq.${ev.id}` +
      `&created_at=gt.${depuis}` +
      '&is_demo=is.false' +
      '&or=(paid_cents.gt.0,promo_code.not.is.null,max_guests.gt.5)' +
      '&select=id&limit=1'
  )
  return Array.isArray(data) && data.length > 0
}

// 23 h 59 à Paris, `jours` jours après `date`.
function finDeJourParis(date, jours) {
  const cible = new Date(date.getTime() + jours * 24 * 3600 * 1000)
  const [a, m, j] = cible.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }).split('-').map(Number)
  const approx = new Date(Date.UTC(a, m - 1, j, 23, 59, 59))
  const decalage = new Date(approx.toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getTime()
    - new Date(approx.toLocaleString('en-US', { timeZone: 'UTC' })).getTime()
  return new Date(approx.getTime() - decalage)
}

const DUREE_OFFRE_JOURS = 7

// Branche « photos ».
// Mail 3, le lendemain de la révélation : le livre d'or offert pour le vrai
// événement, 7 jours. Il remplace pour les essais le mail d'avis aux étoiles
// (deux mails le même jour, c'est un de trop). Mail 4, la veille de la fin
// de l'offre, si rien n'a été créé entre-temps.
export async function offreEssais(now = new Date()) {
  const il = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString()
  let offres = 0
  let rappels = 0

  // --- Mail 3 ---
  // Révélé depuis au moins 8 h (le cron passe le matin : une révélation de la
  // veille au soir est prise), et depuis moins de 10 jours : un déploiement
  // n'arrose pas tout l'historique.
  const { data: essais } = await selectRows(
    'events',
    'select=id,name,owner_email,avis_token,langue,created_at,reveal_at,reveal_paused,max_guests' +
      ESSAI +
      '&survey_mailed_at=is.null' +
      `&reveal_at=lte.${il(8)}` +
      `&reveal_at=gte.${il(24 * 10)}` +
      `&order=reveal_at.desc&limit=${LOT}`
  )
  for (const ev of Array.isArray(essais) ? essais : []) {
    const [invites, photos] = await Promise.all([
      selectRows('guests', `event_id=eq.${ev.id}&select=id`),
      selectRows('photos', `event_id=eq.${ev.id}&select=id`),
    ])
    // Album encore fermé (pause, formule dépassée) : « vos photos sont
    // révélées » serait faux. On repassera.
    const ouvert = isRevealed({
      revealAt: ev.reveal_at,
      revealPaused: ev.reveal_paused,
      maxGuests: ev.max_guests,
      guestCount: Array.isArray(invites.data) ? invites.data.length : 0,
    })
    if (!ouvert) continue

    const photoCount = Array.isArray(photos.data) ? photos.data.length : 0
    // Aucune photo : c'est la branche « aucune photo » qui s'en occupe.
    if (!photoCount) {
      await updateRow('events', `id=eq.${ev.id}`, { survey_mailed_at: now.toISOString() })
      continue
    }

    const langue = langueDe(ev)
    const eventName = ev.name || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langue)

    // Déjà passé au vrai événement : pas d'offre, le mail d'avis habituel.
    if (await aCreeUnVraiEvenement(ev, ev.created_at)) {
      const dejaDonne = await selectRows('feedback', `event_id=eq.${ev.id}&role=eq.organisateur&select=id&limit=1`)
      if (!(Array.isArray(dejaDonne.data) && dejaDonne.data.length)) {
        const mail = avisOrgaEmail({ langue, eventName, link: lienAvisOrga(ev.avis_token) })
        await sendMail({
          to: ev.owner_email, subject: mail.subject, html: mail.html,
          expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
        })
      }
      await updateRow('events', `id=eq.${ev.id}`, { survey_mailed_at: now.toISOString() })
      continue
    }

    const fin = finDeJourParis(now, DUREE_OFFRE_JOURS)
    const mail = offreEssaiEmail({
      langue, eventName, photoCount,
      lienCreer: lienCadeau(ev.avis_token, langue),
      fin: fin.toISOString(),
    })
    const res = await sendMail({
      to: ev.owner_email, subject: mail.subject, html: mail.html,
      expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
    })
    // Marqué même en cas d'échec, comme les autres envois de l'enquête.
    await updateRow('events', `id=eq.${ev.id}`, {
      survey_mailed_at: now.toISOString(),
      essai_offre_at: now.toISOString(),
      essai_offre_fin: fin.toISOString(),
    })
    if (res?.ok) offres++
  }

  // --- Mail 4 ---
  // L'offre se termine dans moins de 48 h : le cron du matin la prend la
  // veille du dernier jour.
  const horizon = new Date(now.getTime() + 48 * 3600 * 1000).toISOString()
  const { data: aRappeler } = await selectRows(
    'events',
    'select=id,owner_email,avis_token,langue,essai_offre_at,essai_offre_fin' +
      `&essai_offre_fin=gt.${now.toISOString()}` +
      `&essai_offre_fin=lte.${horizon}` +
      '&essai_offre_rappel_at=is.null' +
      '&essai_offre_event_id=is.null' +
      '&owner_email=not.is.null' +
      `&limit=${LOT}`
  )
  for (const ev of Array.isArray(aRappeler) ? aRappeler : []) {
    if (await aCreeUnVraiEvenement(ev, ev.essai_offre_at)) {
      await updateRow('events', `id=eq.${ev.id}`, { essai_offre_rappel_at: now.toISOString() })
      continue
    }
    const langue = langueDe(ev)
    const mail = rappelOffreEmail({ langue, lienCreer: lienCadeau(ev.avis_token, langue), fin: ev.essai_offre_fin })
    const res = await sendMail({
      to: ev.owner_email, subject: mail.subject, html: mail.html,
      expediteur: EXPEDITEUR_CLEMENT, repondreA: CONTACT_EMAIL,
    })
    await updateRow('events', `id=eq.${ev.id}`, { essai_offre_rappel_at: now.toISOString() })
    if (res?.ok) rappels++
  }

  return { offres, rappels }
}
