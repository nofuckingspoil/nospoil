// ============================================================
//  Les envois programmés de l'enquête (appelés par la tâche quotidienne).
//
//  Trois choses, dans cet ordre :
//   1. J+2 après la révélation → questionnaire à l'organisateur ;
//   2. J+3 → questionnaire aux participants qui ne sont JAMAIS allés jusqu'à
//      l'album, et à eux seuls ;
//   3. le récap de ce qui est arrivé depuis la veille.
//
//  Le point 2 est le cœur du dispositif. La question posée dans l'album ne
//  voit, par construction, que les gens qui y sont arrivés : c'est-à-dire pas
//  ceux qui ont buté sur le QR code, sur la caméra ou sur le lien perdu.
//  Ceux-là sont exactement ceux qu'il faut entendre, et le seul moyen de les
//  joindre est le mail. On marque leur réponse comme venue « par mail » : si
//  leurs notes sont plus basses, la comparaison le dira noir sur blanc.
// ============================================================
import 'server-only'
import { selectRows, updateRow } from './supabase'
import { sendMail } from './mail'
import { makeToken } from './account'
import { isRevealed } from './phase'
import {
  surveyOrgaEmail, surveyInviteEmail, recapAdmin,
  lienAvisOrga, lienAvisInvite,
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
// rien de précis), ni une semaine après (il a tout oublié). À J+2 il a
// partagé l'album, vu les réactions, et sait encore ce qui a coincé.
export async function enqueteOrganisateurs(now = new Date()) {
  const seuil = new Date(now.getTime() - 2 * JOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    'select=id,name,owner_email,owner_token,reveal_at,reveal_paused,max_guests' +
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

    const mail = surveyOrgaEmail({
      eventName: ev.name || 'votre événement',
      link: lienAvisOrga(ev.owner_token),
    })
    const res = await sendMail({ to: ev.owner_email, subject: mail.subject, html: mail.html })
    // Marqué même en cas d'échec : une enquête n'est pas un service dû, et
    // mieux vaut la manquer qu'entrer dans une boucle de renvoi quotidien.
    await updateRow('events', `id=eq.${ev.id}`, { survey_mailed_at: now.toISOString() })
    if (res?.ok) envoyes++
  }
  return envoyes
}

// ---------- 2. Les participants qui ne sont jamais venus jusqu'à l'album ----------
// Un jour après le mail d'album, pour ne pas empiler deux messages le même
// matin. Envoyé une seule fois, sans aucune relance.
export async function enqueteInvites(now = new Date()) {
  const seuil = new Date(now.getTime() - 3 * JOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    'select=id,name,reveal_at,reveal_paused,max_guests' +
      `&reveal_at=lte.${seuil}` +
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
        '&album_opened_at=is.null' +   // le cœur du filtre : ceux qui ne sont jamais venus
        '&feedback_at=is.null' +       // et qui n'ont pas déjà répondu autrement
        '&survey_mailed_at=is.null' +
        '&survey_optout=is.false' +
        '&select=id,email,token&order=created_at.asc'
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

      const mail = surveyInviteEmail({
        eventName: ev.name || 'votre événement',
        link: lienAvisInvite(token),
        stopLink: `${lienAvisInvite(token)}&stop=1`,
      })
      const envoi = await sendMail({ to: g.email, subject: mail.subject, html: mail.html })
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
