import { rpc } from '../../../lib/supabase'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, deviceToken, displayName, phone } = body

  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const { ok, data } = await rpc('join_event', {
    p_event_id: eventId,
    p_device_token: deviceToken,
    p_display_name: displayName ?? '',
    p_phone: (phone ?? '').toString().slice(0, 30),
  })

  if (!ok) {
    console.error('join_event error:', data)
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
  if (data?.status === 'error') {
    return Response.json({ error: data.message }, { status: 404 })
  }

  return Response.json({
    guestId: data.guest_id,
    displayName: data.display_name,
    shotsTaken: data.shots_taken,
    shotsPerGuest: data.shots_per_guest,
    eventName: data.event_name,
    hostNames: data.host_names,
    revealAt: data.reveal_at,
  })
}
