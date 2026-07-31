import { rpc, updateRow } from '../../../lib/supabase'
import { checkEmailShape } from '../../../lib/email-check'

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
