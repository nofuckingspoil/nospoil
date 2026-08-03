import { selectRows, signPhotos } from '../../../../lib/supabase'
import { isRevealed, quotaExceeded } from '../../../../lib/phase'
import { MESSAGE_SUSPENDU } from '../../../../lib/authz'

export async function GET(request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,reveal_at,reveal_paused,owner_token,gallery_code,max_guests,status`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Suspendu par l'administration : l'album se ferme, sans rien détruire.
  if (ev.status === 'suspended') {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

  // Le nombre d'invités décide aussi de l'ouverture : une formule dépassée
  // retient l'album jusqu'à ce que l'organisateur la mette à niveau.
  const guestRows = await selectRows('guests', `event_id=eq.${id}&select=id`)
  const etat = {
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount: Array.isArray(guestRows.data) ? guestRows.data.length : 0,
  }
  // La suspension d'urgence de l'organisateur prime sur l'heure de révélation.
  const revealed = isRevealed(etat)
  const overQuota = quotaExceeded(etat)

  // L'organisateur (appareil créateur) peut voir les photos avant la révélation.
  const ownerToken = request.headers.get('x-owner-token')
  const isOwner = !!ownerToken && ownerToken === ev.owner_token
  const canView = revealed || isOwner

  if (!canView) {
    return Response.json({
      revealed: false,
      paused: !!ev.reveal_paused, // l'organisateur a mis la révélation en pause
      // Formule dépassée : l'invité n'y est pour rien, on reste neutre côté
      // écran (« bientôt »). C'est l'organisateur, et lui seul, qu'on alerte.
      pending: overQuota,
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

  // Favoris : le total par photo, et ceux posés par CET appareil (pour que le
  // cœur reste allumé au retour). Jamais qui a aimé quoi.
  const favRes = await selectRows('favorites', `event_id=eq.${id}&select=photo_id,device_token`)
  const favs = Array.isArray(favRes.data) ? favRes.data : []
  const monJeton = request.headers.get('x-device-token') || ''
  const compte = {}
  const miens = []
  for (const f of favs) {
    compte[f.photo_id] = (compte[f.photo_id] || 0) + 1
    if (monJeton && f.device_token === monJeton) miens.push(f.photo_id)
  }
  for (const p of photos) p.favs = compte[p.id] || 0

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
    mesFavoris: miens,
  })
}
