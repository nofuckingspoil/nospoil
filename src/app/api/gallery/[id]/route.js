import { selectRows, signPhotos } from '../../../../lib/supabase'

export async function GET(request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,reveal_at,owner_token,gallery_code`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]
  const revealed = new Date(ev.reveal_at).getTime() <= Date.now()

  // L'organisateur (appareil créateur) peut voir les photos avant la révélation.
  const ownerToken = request.headers.get('x-owner-token')
  const isOwner = !!ownerToken && ownerToken === ev.owner_token
  const canView = revealed || isOwner

  if (!canView) {
    return Response.json({
      revealed: false,
      name: ev.name,
      hostNames: ev.host_names,
      revealAt: ev.reveal_at,
    })
  }

  // Galerie protégée par un code (facultatif) : exigé pour les invités, jamais pour l'organisateur/admin
  if (ev.gallery_code && !isOwner) {
    const given = (request.headers.get('x-gallery-code') || '').trim()
    if (given !== ev.gallery_code) {
      return Response.json({
        revealed,
        needCode: true,
        name: ev.name,
        hostNames: ev.host_names,
        revealAt: ev.reveal_at,
      })
    }
  }

  // Photos + prénom de l'auteur (jointure via la clé étrangère guest_id)
  const photosRes = await selectRows(
    'photos',
    `event_id=eq.${id}&select=id,storage_path,thumb_path,taken_at,guest_id,hidden,guests(display_name)&order=taken_at.asc`
  )
  let rows = Array.isArray(photosRes.data) ? photosRes.data : []

  // Les invités ne voient jamais les photos masquées ; l'organisateur/admin voit tout.
  if (!isOwner) rows = rows.filter((r) => !r.hidden)

  // On signe la pleine qualité ET les mini-versions en un seul appel
  const allPaths = []
  for (const r of rows) {
    allPaths.push(r.storage_path)
    if (r.thumb_path) allPaths.push(r.thumb_path)
  }
  const signed = await signPhotos(allPaths, 3600)

  const photos = rows
    .map((r) => ({
      id: r.id,
      url: signed[r.thumb_path] || signed[r.storage_path], // mini-version pour l'album (léger)
      fullUrl: signed[r.storage_path],                     // pleine qualité (ouverture / téléchargement)
      who: r.guests?.display_name || 'Invité',
      guestId: r.guest_id,
      takenAt: r.taken_at,
      hidden: !!r.hidden,
    }))
    .filter((p) => p.fullUrl)

  // Liste des invités (pour le filtre "point de vue")
  const guestMap = {}
  for (const p of photos) guestMap[p.guestId] = p.who
  const guests = Object.entries(guestMap).map(([id, name]) => ({ id, name }))

  return Response.json({
    revealed,
    isOwner,
    ownerPreview: isOwner && !revealed, // aperçu organisateur avant révélation
    name: ev.name,
    hostNames: ev.host_names,
    revealAt: ev.reveal_at,
    photos,
    guests,
  })
}
