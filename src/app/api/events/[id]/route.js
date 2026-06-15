import { selectRows } from '../../../../lib/supabase'

export async function GET(request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,shots_per_guest,reveal_at,status,owner_token`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Vérifie si la requête vient de l'organisateur (appareil qui a créé l'événement)
  const ownerToken = request.headers.get('x-owner-token')
  const isOwner = !!ownerToken && ownerToken === ev.owner_token

  // Infos publiques : nécessaires aux invités (nom, date, nb de clichés)
  const payload = {
    id: ev.id,
    name: ev.name,
    hostNames: ev.host_names,
    shotsPerGuest: ev.shots_per_guest,
    revealAt: ev.reveal_at,
    status: ev.status,
    revealed: new Date(ev.reveal_at).getTime() <= Date.now(),
    isOwner,
  }

  // Données du tableau de bord : réservées à l'organisateur
  if (isOwner) {
    const [guests, photos] = await Promise.all([
      selectRows('guests', `event_id=eq.${id}&select=id`),
      selectRows('photos', `event_id=eq.${id}&select=id`),
    ])
    payload.guestCount = Array.isArray(guests.data) ? guests.data.length : 0
    payload.photoCount = Array.isArray(photos.data) ? photos.data.length : 0
  }

  return Response.json(payload)
}
