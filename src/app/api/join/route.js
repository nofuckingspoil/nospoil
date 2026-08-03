import { rpc, updateRow, selectRows } from '../../../lib/supabase'
import { checkEmailShape } from '../../../lib/email-check'
import { sendMail, guestAccessEmail, siteUrl } from '../../../lib/mail'
import { makeToken } from '../../../lib/account'

// Envoie à l'invité son lien d'accès permanent, une seule fois.
//
// Rien ne part sur un événement déjà révélé : le lien sert à protéger des poses
// et des photos en cours de soirée. Passé la révélation, l'album est ouvert et
// c'est le mail d'album qui prend le relais.
async function sendGuestAccess(guestId, eventName, shotsPerGuest, email, revealAt) {
  const reveal = revealAt ? new Date(revealAt).getTime() : NaN
  if (Number.isFinite(reveal) && reveal <= Date.now()) return

  const { data } = await selectRows('guests', `id=eq.${guestId}&select=token,access_mailed_at`)
  const g = Array.isArray(data) ? data[0] : null
  if (!g || g.access_mailed_at) return // déjà envoyé : on ne le harcèle pas

  const token = g.token || makeToken()
  if (!g.token) await updateRow('guests', `id=eq.${guestId}`, { token })

  const mail = guestAccessEmail({
    eventName: eventName || 'votre événement',
    link: `${siteUrl()}/mes-photos?t=${token}`,
    shotsPerGuest,
  })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html })
  // Horodaté même en cas d'échec : mieux vaut un lien manquant qu'un mail
  // renvoyé à chaque photo prise.
  if (sent?.ok) await updateRow('guests', `id=eq.${guestId}`, { access_mailed_at: new Date().toISOString() })
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, deviceToken, displayName } = body

  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  // Dernier filet : le navigateur peut être contourné, pas le serveur.
  // Une adresse mal formée n'est jamais enregistrée — mieux vaut aucun
  // contact qu'un contact qui ne recevra rien.
  const forme = checkEmailShape(body.email)
  const email = forme.ok && !forme.empty ? forme.email : ''

  const { ok, data } = await rpc('join_event', {
    p_event_id: eventId,
    p_device_token: deviceToken,
    p_display_name: displayName ?? '',
    p_phone: '',
  })

  if (!ok) {
    console.error('join_event error:', data)
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
  if (data?.status === 'error') {
    return Response.json({ error: data.message }, { status: 404 })
  }

  // Signe de vie (indicateur « joue en ce moment ») + adresse mail éventuelle.
  // Une adresse vide n'écrase pas celle déjà enregistrée : un invité qui
  // revient sans la resaisir ne doit pas perdre son inscription à l'album.
  try {
    const patch = { last_active_at: new Date().toISOString() }
    if (email) patch.email = email
    await updateRow('guests', `id=eq.${data.guest_id}`, patch)
  } catch {}

  // Lien d'accès personnel : envoyé une seule fois, dès qu'une adresse est
  // connue. Sans lui, l'identité de l'invité disparaît avec son navigateur.
  // Un échec d'envoi ne doit jamais empêcher quelqu'un de photographier.
  if (email) {
    try { await sendGuestAccess(data.guest_id, data.event_name, data.shots_per_guest, email, data.reveal_at) }
    catch (err) { console.error('mail accès invité:', err) }
  }

  return Response.json({
    email,
    guestId: data.guest_id,
    displayName: data.display_name,
    shotsTaken: data.shots_taken,
    shotsPerGuest: data.shots_per_guest,
    eventName: data.event_name,
    hostNames: data.host_names,
    revealAt: data.reveal_at,
  })
}
