import { rpc, uploadPhoto, deletePhoto } from '../../../lib/supabase'

export const runtime = 'nodejs'
// Autorise des images compressées jusqu'à ~8 Mo
export const maxDuration = 30

export async function POST(request) {
  let form
  try { form = await request.formData() } catch { return Response.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const file = form.get('file')
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
    return Response.json({ full: true, error: data.message }, { status: 409 })
  }

  return Response.json({ shotsTaken: data.shots_taken, shotsPerGuest: data.shots_per_guest })
}
