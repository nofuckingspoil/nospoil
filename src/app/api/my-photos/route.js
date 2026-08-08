import { selectRows, signPhotos } from '../../../lib/supabase'

// Renvoie les photos prises par CET participant (identifié par son appareil),
// avec leur identifiant (pour pouvoir les supprimer) + le compteur de clichés.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, deviceToken } = body
  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const guestRes = await selectRows(
    'guests',
    `event_id=eq.${eventId}&device_token=eq.${deviceToken}&select=id,shots_taken,bonus_shots,events(shots_per_guest)`
  )
  const guest = Array.isArray(guestRes.data) ? guestRes.data[0] : null
  if (!guest) return Response.json({ photos: [], shotsTaken: 0 })

  const base = guest.events?.shots_per_guest ?? 0
  const bonus = guest.bonus_shots || 0

  const photosRes = await selectRows(
    'photos',
    `guest_id=eq.${guest.id}&select=id,storage_path,taken_at&order=taken_at.desc`
  )
  const rows = Array.isArray(photosRes.data) ? photosRes.data : []
  const signed = await signPhotos(rows.map((r) => r.storage_path), 3600)

  const photos = rows
    .map((r) => ({ id: r.id, url: signed[r.storage_path] }))
    .filter((p) => p.url)

  return Response.json({ photos, shotsTaken: guest.shots_taken, shotsPerGuest: base + bonus, bonusUsed: bonus > 0 })
}
