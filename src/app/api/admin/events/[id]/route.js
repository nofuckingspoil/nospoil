import { selectRows, deleteRows, updateRow, signPhotos, deletePhotos } from '../../../../../lib/supabase'

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
    `id=eq.${id}&select=id,name,host_names,owner_email,cover_url,created_at,reveal_at,status,max_guests,shots_per_guest,bonus_shots,download_count,gallery_code,expires_at,purged_at,cgv_accepted_at,withdrawal_waived_at,cgv_version,guests(count),photos(count)`
  )
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Tous les participants, du plus récemment actif au plus ancien : c'est la vue
  // qui permet de comprendre en un coup d'œil qui a joué le jeu.
  const guestsRes = await selectRows(
    'guests',
    `event_id=eq.${id}&select=id,display_name,phone,email,shots_taken,bonus_shots,created_at,last_active_at,notified_at,notify_failed&order=last_active_at.desc.nullslast,created_at.asc`
  )
  const guestRows = Array.isArray(guestsRes.data) ? guestsRes.data : []
  const guests = guestRows.map((g) => ({
    id: g.id,
    name: g.display_name || null,
    phone: g.phone || null,
    email: g.email || null,
    shotsTaken: g.shots_taken || 0,
    // Quota réel de ce participant : la base de l'événement plus sa recharge à lui.
    shotsTotal: (ev.shots_per_guest || 0) + (g.bonus_shots || 0),
    bonusUsed: (g.bonus_shots || 0) > 0,
    joinedAt: g.created_at,
    lastActiveAt: g.last_active_at || null,
    notifiedAt: g.notified_at || null,
    notifyFailed: !!g.notify_failed,
  }))

  // Numéros collectés (participants ayant laissé un téléphone)
  const contacts = guestRows
    .filter((g) => g.phone)
    .map((g) => ({ name: g.display_name, phone: g.phone }))

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
      who: r.guests?.display_name || 'Participant',
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
      shotsPerGuest: ev.shots_per_guest,
      bonusShots: ev.bonus_shots ?? 0,
      downloadCount: ev.download_count || 0,
      galleryCode: ev.gallery_code || null,
      guestCount: ev.guests?.[0]?.count ?? 0,
      photoCount: ev.photos?.[0]?.count ?? 0,
      expiresAt: ev.expires_at || null,
      purgedAt: ev.purged_at || null,
      cgvAcceptedAt: ev.cgv_accepted_at || null,
      withdrawalWaivedAt: ev.withdrawal_waived_at || null,
      cgvVersion: ev.cgv_version || null,
    },
    guests,
    contacts,
    photos,
  })
}

// --- Suspension immédiate d'un événement ---
// Sert aux demandes urgentes (signalement, contenu problématique) : l'album
// devient inaccessible et plus aucune photo ne peut être prise, mais rien
// n'est détruit : on peut réactiver une fois la situation éclaircie.
export async function PATCH(request, { params }) {
  if (!authed(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  const { id } = await params
  const { status } = await request.json().catch(() => ({}))

  if (!['active', 'suspended'].includes(status)) {
    return Response.json({ error: 'Statut inconnu.' }, { status: 400 })
  }

  const { ok } = await updateRow('events', `id=eq.${id}`, { status })
  if (!ok) return Response.json({ error: 'Modification impossible.' }, { status: 500 })
  return Response.json({ ok: true, status })
}

// --- Suppression complète d'un événement (photos, participants, fichiers) ---
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
