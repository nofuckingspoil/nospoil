import { selectRows } from '../../../../lib/supabase'

export async function GET(_request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,shots_per_guest,reveal_at,status,created_at`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Compteurs (invités + photos) pour le tableau de bord organisateur
  const [guests, photos] = await Promise.all([
    selectRows('guests', `event_id=eq.${id}&select=id`),
    selectRows('photos', `event_id=eq.${id}&select=id`),
  ])

  return Response.json({
    id: ev.id,
    name: ev.name,
    hostNames: ev.host_names,
    shotsPerGuest: ev.shots_per_guest,
    revealAt: ev.reveal_at,
    status: ev.status,
    revealed: new Date(ev.reveal_at).getTime() <= Date.now(),
    guestCount: Array.isArray(guests.data) ? guests.data.length : 0,
    photoCount: Array.isArray(photos.data) ? photos.data.length : 0,
  })
}
