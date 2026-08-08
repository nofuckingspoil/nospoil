import { rpc, deletePhoto } from '../../../../lib/supabase'

// Supprime une photo du participant (vérifiée par device_token) et libère un cliché.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { photoId, deviceToken } = body
  if (!photoId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const { ok, data } = await rpc('delete_photo', {
    p_photo_id: photoId,
    p_device_token: deviceToken,
  })

  if (!ok || data?.status === 'error') {
    return Response.json({ error: data?.message || 'Suppression impossible.' }, { status: 400 })
  }

  if (data?.storage_path) await deletePhoto(data.storage_path)
  return Response.json({ shotsTaken: data.shots_taken })
}
