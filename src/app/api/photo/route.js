import { rpc, uploadPhoto, deletePhoto, updateRow } from '../../../lib/supabase'

export const runtime = 'nodejs'
// Autorise des images compressées jusqu'à ~8 Mo
export const maxDuration = 30

export async function POST(request) {
  let form
  try { form = await request.formData() } catch { return Response.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const file = form.get('file')
  const thumb = form.get('thumb') // mini-version facultative (pour alléger l'album)
  const eventId = form.get('eventId')
  const guestId = form.get('guestId')
  const deviceToken = form.get('deviceToken')

  if (!file || typeof file === 'string' || !eventId || !guestId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) {
    return Response.json({ error: 'Photo trop lourde.' }, { status: 413 })
  }

  // Chemin : eventId/guestId/horodatage-aléatoire.jpg
  const rand = Math.random().toString(36).slice(2, 8)
  const path = `${eventId}/${guestId}/${Date.now()}-${rand}.jpg`

  const up = await uploadPhoto(path, bytes, 'image/jpeg')
  if (!up.ok) {
    console.error('upload error', up.status)
    return Response.json({ error: "Échec de l'envoi de la photo." }, { status: 500 })
  }

  // Mini-version : on l'envoie à côté (échec silencieux → on retombera sur la pleine qualité)
  let thumbPath = null
  if (thumb && typeof thumb !== 'string') {
    try {
      const tbytes = Buffer.from(await thumb.arrayBuffer())
      if (tbytes.length > 0 && tbytes.length < 2 * 1024 * 1024) {
        const tp = path.replace(/\.jpg$/, '_thumb.jpg')
        const tup = await uploadPhoto(tp, tbytes, 'image/jpeg')
        if (tup.ok) thumbPath = tp
      }
    } catch {}
  }

  // Réserve le cliché (atomique) + enregistre la ligne photo
  const { ok, data } = await rpc('take_photo', {
    p_event_id: eventId,
    p_guest_id: guestId,
    p_device_token: deviceToken,
    p_storage_path: path,
  })

  if (!ok || data?.status === 'error') {
    await deletePhoto(path)
    return Response.json({ error: data?.message || 'Erreur serveur.' }, { status: 500 })
  }
  if (data?.status === 'full') {
    await deletePhoto(path) // on annule l'upload : plus de clichés disponibles
    if (thumbPath) await deletePhoto(thumbPath)
    return Response.json({ full: true, error: data.message }, { status: 409 })
  }

  // Associe la mini-version à la ligne photo créée (repérée par son chemin unique)
  if (thumbPath) {
    await updateRow('photos', `storage_path=eq.${encodeURIComponent(path)}`, { thumb_path: thumbPath })
  }

  // Signe de vie de l'invité : alimente l'indicateur « joue en ce moment »
  // du tableau de bord. Un échec ici ne doit pas faire rater la photo.
  try {
    await updateRow('guests', `id=eq.${guestId}`, { last_active_at: new Date().toISOString() })
  } catch {}

  return Response.json({ shotsTaken: data.shots_taken, shotsPerGuest: data.shots_per_guest })
}
