import { selectRows, deleteRows, signPhotos, deletePhotos } from '../../../../../lib/supabase'

export const runtime = 'nodejs'

function authed(request) {
  const key = request.headers.get('x-admin-key')
  return process.env.ADMIN_KEY && key === process.env.ADMIN_KEY
}

// --- Détails d'un événement + toutes ses photos (vue admin) ---
export async function GET(request, { params }) {
  if (!authed(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,owner_email,cover_url,created_at,reveal_at,status,max_guests,download_count,gallery_code,guests(count),photos(count)`
  )
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Numéros collectés (invités ayant laissé un téléphone)
  const contactsRes = await selectRows('guests', `event_id=eq.${id}&phone=not.is.null&select=display_name,phone&order=created_at.asc`)
  const contacts = (Array.isArray(contactsRes.data) ? contactsRes.data : []).map((g) => ({ name: g.display_name, phone: g.phone }))

  // Toutes les photos (y compris masquées : l'admin voit tout)
  const photosRes = await selectRows(
    'photos',
    `event_id=eq.${id}&select=id,storage_path,thumb_path,taken_at,hidden,guests(display_name)&order=taken_at.asc`
  )
  const rows = Array.isArray(photosRes.data) ? photosRes.data : []
  const allPaths = []
  for (const r of rows) { allPaths.push(r.storage_path); if (r.thumb_path) allPaths.push(r.thumb_path) }
  const signed = allPaths.length ? await signPhotos(allPaths, 3600) : {}

  const photos = rows
    .map((r) => ({
      id: r.id,
      url: signed[r.thumb_path] || signed[r.storage_path],
      fullUrl: signed[r.storage_path],
      who: r.guests?.display_name || 'Invité',
      takenAt: r.taken_at,
      hidden: !!r.hidden,
    }))
    .filter((p) => p.fullUrl)

  return Response.json({
    event: {
      id: ev.id,
      name: ev.name,
      hostNames: ev.host_names,
      ownerEmail: ev.owner_email || null,
      coverUrl: ev.cover_url ? signed[ev.cover_url] || null : null,
      createdAt: ev.created_at,
      revealAt: ev.reveal_at,
      revealed: new Date(ev.reveal_at).getTime() <= Date.now(),
      status: ev.status,
      maxGuests: ev.max_guests,
      downloadCount: ev.download_count || 0,
      galleryCode: ev.gallery_code || null,
      guestCount: ev.guests?.[0]?.count ?? 0,
      photoCount: ev.photos?.[0]?.count ?? 0,
    },
    contacts,
    photos,
  })
}

// --- Suppression complète d'un événement (photos, invités, fichiers) ---
export async function DELETE(request, { params }) {
  if (!authed(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  const { id } = await params

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Fichiers à effacer du stockage : photos (pleine + mini) + couverture
  const ph = await selectRows('photos', `event_id=eq.${id}&select=storage_path,thumb_path`)
  const paths = []
  for (const p of Array.isArray(ph.data) ? ph.data : []) {
    if (p.storage_path) paths.push(p.storage_path)
    if (p.thumb_path) paths.push(p.thumb_path)
  }
  if (ev.cover_url) paths.push(ev.cover_url)
  if (paths.length) await deletePhotos(paths)

  // Lignes liées d'abord (contraintes de clés), puis l'événement
  await deleteRows('photos', `event_id=eq.${id}`)
  await deleteRows('guests', `event_id=eq.${id}`)
  await deleteRows('event_admins', `event_id=eq.${id}`)
  const del = await deleteRows('events', `id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  return Response.json({ ok: true })
}
