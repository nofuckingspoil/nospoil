// ============================================================
//  Rappels à l'organisateur (tâche planifiée quotidienne — voir vercel.json).
//
//  Le tableau de bord ne sert que si on l'ouvre au bon moment. Deux mails :
//   1. Le matin de l'événement  → « c'est aujourd'hui », avec le QR.
//   2. Le lendemain             → « vos photos vous attendent ».
//
//  Chaque envoi est marqué en base : un événement ne reçoit jamais deux fois
//  le même rappel, même si le cron repasse.
//
//  Protégée par CRON_SECRET, comme /api/cron/purge.
// ============================================================
import { selectRows, updateRow } from '../../../../lib/supabase'
import { sendMail, eventDayEmail, afterPartyEmail, siteUrl } from '../../../../lib/mail'
import { notifyGuestsOfAlbum } from '../../../../lib/notify-guests'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH = 50
const HOUR = 60 * 60 * 1000

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function frDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

const champs = 'id,name,owner_email,owner_token,starts_at,reveal_at,shots_per_guest'

// --- 1. Le matin de l'événement ---
// On vise les événements qui commencent dans les 24 h à venir : le cron
// tourne une fois par jour, donc chaque événement est attrapé une fois.
async function nudgeEventDay(now, base) {
  const horizon = new Date(now.getTime() + 24 * HOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    `select=${champs}` +
      `&starts_at=gt.${now.toISOString()}` +
      `&starts_at=lte.${horizon}` +
      `&nudged_day_at=is.null` +
      `&owner_email=not.is.null` +
      `&purged_at=is.null` +
      `&order=starts_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/nudge: lecture "jour J" impossible', data)
    return 0
  }

  let sent = 0
  for (const ev of data) {
    const mail = eventDayEmail({
      eventName: ev.name,
      ownerUrl: `${base}/event/${ev.id}?k=${ev.owner_token}`,
      shotsPerGuest: ev.shots_per_guest,
    })
    const res = await sendMail({ to: ev.owner_email, subject: mail.subject, html: mail.html })
    // On marque même en cas d'échec : mieux vaut un rappel manqué qu'une
    // boucle qui renvoie le même mail tous les jours.
    await updateRow('events', `id=eq.${ev.id}`, { nudged_day_at: now.toISOString() })
    if (res?.ok) sent++
  }
  return sent
}

// --- 2. Le lendemain de la fête ---
// L'événement est terminé (plus de 12 h après le début) mais pas encore révélé :
// c'est le moment où l'organisateur peut encore vérifier et masquer.
async function nudgeAfterParty(now, base) {
  const fini = new Date(now.getTime() - 12 * HOUR).toISOString()
  const { ok, data } = await selectRows(
    'events',
    `select=${champs}` +
      `&starts_at=lte.${fini}` +
      `&reveal_at=gt.${now.toISOString()}` +
      `&nudged_after_at=is.null` +
      `&owner_email=not.is.null` +
      `&purged_at=is.null` +
      `&order=starts_at.desc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/nudge: lecture "lendemain" impossible', data)
    return 0
  }

  let sent = 0
  for (const ev of data) {
    const [photos, guests] = await Promise.all([
      selectRows('photos', `select=id&event_id=eq.${ev.id}`),
      selectRows('guests', `select=id&event_id=eq.${ev.id}`),
    ])
    const photoCount = Array.isArray(photos.data) ? photos.data.length : 0
    const guestCount = Array.isArray(guests.data) ? guests.data.length : 0

    // Aucune photo : rien à annoncer, et un mail vide ferait mauvais effet.
    if (photoCount === 0) {
      await updateRow('events', `id=eq.${ev.id}`, { nudged_after_at: now.toISOString() })
      continue
    }

    const mail = afterPartyEmail({
      eventName: ev.name,
      ownerUrl: `${base}/event/${ev.id}?k=${ev.owner_token}`,
      photoCount,
      guestCount,
      revealDate: frDate(ev.reveal_at),
    })
    const res = await sendMail({ to: ev.owner_email, subject: mail.subject, html: mail.html })
    await updateRow('events', `id=eq.${ev.id}`, { nudged_after_at: now.toISOString() })
    if (res?.ok) sent++
  }
  return sent
}

// --- 3. Le lien de l'album aux invités qui ont laissé leur adresse ---
// Filet de sécurité : normalement l'envoi part dès la révélation, déclenché
// par le tableau de bord. Ici on rattrape les événements révélés tout seuls.
async function notifyRevealedEvents(now) {
  const { ok, data } = await selectRows(
    'events',
    `select=id,name,reveal_at,reveal_paused` +
      `&reveal_at=lte.${now.toISOString()}` +
      `&reveal_paused=is.false` +
      `&purged_at=is.null` +
      `&order=reveal_at.desc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/nudge: lecture "révélés" impossible', data)
    return 0
  }

  let envoyes = 0
  for (const ev of data) {
    const res = await notifyGuestsOfAlbum(ev)
    envoyes += res.envoyes
  }
  return envoyes
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const now = new Date()
  const base = siteUrl()

  const jourJ = await nudgeEventDay(now, base)
  const lendemain = await nudgeAfterParty(now, base)
  const albums = await notifyRevealedEvents(now)

  return Response.json({ ok: true, jourJ, lendemain, albums })
}
