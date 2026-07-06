import { selectRows, updateRow, signPhotos, deleteRows, deletePhotos } from '../../../../lib/supabase'

const DAY = 24 * 60 * 60 * 1000

export async function GET(request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,cover_url,shots_per_guest,reveal_at,status,owner_token,gallery_code,download_count`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Vérifie si la requête vient de l'organisateur (appareil qui a créé l'événement)
  const ownerToken = request.headers.get('x-owner-token')
  const isOwner = !!ownerToken && ownerToken === ev.owner_token

  // URL signée temporaire pour la photo de couverture (si présente)
  let coverUrl = null
  if (ev.cover_url) {
    const map = await signPhotos([ev.cover_url], 6 * 3600)
    coverUrl = map[ev.cover_url] || null
  }

  // Infos publiques : nécessaires aux invités (nom, date, nb de clichés)
  const payload = {
    id: ev.id,
    name: ev.name,
    hostNames: ev.host_names,
    coverUrl,
    shotsPerGuest: ev.shots_per_guest,
    revealAt: ev.reveal_at,
    status: ev.status,
    revealed: new Date(ev.reveal_at).getTime() <= Date.now(),
    isOwner,
  }

  // Compteurs publics (participants + photos) — affichés sur l'écran d'album des invités
  const [guests, photos] = await Promise.all([
    selectRows('guests', `event_id=eq.${id}&select=id`),
    selectRows('photos', `event_id=eq.${id}&select=id`),
  ])
  payload.guestCount = Array.isArray(guests.data) ? guests.data.length : 0
  payload.photoCount = Array.isArray(photos.data) ? photos.data.length : 0

  // Numéros collectés + liste des admins : réservés à l'organisateur
  if (isOwner) {
    const list = await selectRows('guests', `event_id=eq.${id}&phone=not.is.null&select=display_name,phone&order=created_at.asc`)
    payload.contacts = (Array.isArray(list.data) ? list.data : []).map((g) => ({ name: g.display_name, phone: g.phone }))

    const admins = await selectRows('event_admins', `event_id=eq.${id}&select=id,name,email,code&order=created_at.asc`)
    payload.admins = (Array.isArray(admins.data) ? admins.data : []).map((a) => ({ id: a.id, name: a.name, email: a.email, code: a.code }))

    payload.galleryCode = ev.gallery_code || null // code d'accès à la galerie (si activé)
    payload.downloadCount = ev.download_count || 0 // nb de "Tout télécharger"
  }

  return Response.json(payload)
}

// Modification de réglages (réservée à l'organisateur/admin) : date de révélation, code galerie
export async function PATCH(request, { params }) {
  const { id } = await params
  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { data } = await selectRows('events', `id=eq.${id}&select=owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (ev.owner_token !== ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const patch = {}

  if (body.revealAt !== undefined) {
    const reveal = new Date(body.revealAt)
    if (isNaN(reveal.getTime())) return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
    patch.reveal_at = reveal.toISOString()
    patch.expires_at = new Date(reveal.getTime() + 60 * DAY).toISOString() // rétention : 60 jours après
  }

  // Code d'accès à la galerie : chaîne pour l'activer, "" ou null pour le retirer
  if (body.galleryCode !== undefined) {
    const code = (body.galleryCode || '').toString().trim()
    patch.gallery_code = code ? code.slice(0, 40) : null
  }

  if (!Object.keys(patch).length) return Response.json({ error: 'Rien à modifier.' }, { status: 400 })

  const upd = await updateRow('events', `id=eq.${id}`, patch)
  if (!upd.ok) return Response.json({ error: 'Modification impossible.' }, { status: 500 })
  return Response.json({ ok: true })
}

// Suppression d'un événement (réservée à l'organisateur) : photos, invités, fichiers et ligne
export async function DELETE(request, { params }) {
  const { id } = await params

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=owner_token,cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (ev.owner_token !== ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  // Fichiers à effacer du Storage : toutes les photos + la couverture éventuelle
  const ph = await selectRows('photos', `event_id=eq.${id}&select=storage_path`)
  const paths = (Array.isArray(ph.data) ? ph.data : []).map((p) => p.storage_path).filter(Boolean)
  if (ev.cover_url) paths.push(ev.cover_url)
  if (paths.length) await deletePhotos(paths)

  // Lignes liées d'abord (contraintes de clés), puis l'événement
  await deleteRows('photos', `event_id=eq.${id}`)
  await deleteRows('guests', `event_id=eq.${id}`)
  const del = await deleteRows('events', `id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  return Response.json({ ok: true })
}
