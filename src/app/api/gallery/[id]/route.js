import { selectRows, signPhotos } from '../../../../lib/supabase'

export async function GET(_request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,reveal_at`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]
  const revealed = new Date(ev.reveal_at).getTime() <= Date.now()

  if (!revealed) {
    return Response.json({
      revealed: false,
      name: ev.name,
      hostNames: ev.host_names,
      revealAt: ev.reveal_at,
    })
  }

  // Photos + prénom de l'auteur (jointure via la clé étrangère guest_id)
  const photosRes = await selectRows(
    'photos',
    `event_id=eq.${id}&select=storage_path,taken_at,guest_id,guests(display_name)&order=taken_at.asc`
  )
  const rows = Array.isArray(photosRes.data) ? photosRes.data : []

  const signed = await signPhotos(rows.map((r) => r.storage_path), 3600)

  const photos = rows
    .map((r) => ({
      url: signed[r.storage_path],
      who: r.guests?.display_name || 'Invité',
      guestId: r.guest_id,
      takenAt: r.taken_at,
    }))
    .filter((p) => p.url)

  // Liste des invités (pour le filtre "point de vue")
  const guestMap = {}
  for (const p of photos) guestMap[p.guestId] = p.who
  const guests = Object.entries(guestMap).map(([id, name]) => ({ id, name }))

  return Response.json({
    revealed: true,
    name: ev.name,
    hostNames: ev.host_names,
    revealAt: ev.reveal_at,
    photos,
    guests,
  })
}
