import { selectRows, signPhotos } from '../../../lib/supabase'

// Renvoie les photos prises par CET invité (identifié par son appareil).
// Ses propres photos lui sont visibles tout de suite ; celles des autres
// restent cachées jusqu'à la révélation (gérée par la galerie).
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, deviceToken } = body
  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const guestRes = await selectRows(
    'guests',
    `event_id=eq.${eventId}&device_token=eq.${deviceToken}&select=id,shots_taken`
  )
  const guest = Array.isArray(guestRes.data) ? guestRes.data[0] : null
  if (!guest) return Response.json({ photos: [] })

  const photosRes = await selectRows(
    'photos',
    `guest_id=eq.${guest.id}&select=storage_path,taken_at&order=taken_at.desc`
  )
  const rows = Array.isArray(photosRes.data) ? photosRes.data : []
  const signed = await signPhotos(rows.map((r) => r.storage_path), 3600)

  const photos = rows.map((r) => signed[r.storage_path]).filter(Boolean)
  return Response.json({ photos })
}
