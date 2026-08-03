import { selectRows, insertRow, deleteRows } from '../../../../../lib/supabase'
import { estSuspendu, MESSAGE_SUSPENDU } from '../../../../../lib/authz'

export const runtime = 'nodejs'

// Met (ou retire) une photo en favori.
//
// Anonyme par construction : l'appareil sert uniquement à empêcher un même
// invité de voter dix fois. Aucune route ne renvoie jamais qui a aimé quoi.
export async function POST(request, { params }) {
  const { id } = await params
  const { photoId, deviceToken, on } = await request.json().catch(() => ({}))

  if (!id || !photoId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }
  if (await estSuspendu(id)) {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

  // La photo appartient-elle bien à cet album, et y est-elle visible ?
  const { data } = await selectRows('photos', `id=eq.${photoId}&select=id,event_id,hidden`)
  const photo = Array.isArray(data) ? data[0] : null
  if (!photo || photo.event_id !== id || photo.hidden) {
    return Response.json({ error: 'Photo introuvable.' }, { status: 404 })
  }

  const filtre = `photo_id=eq.${photoId}&device_token=eq.${encodeURIComponent(deviceToken)}`
  if (on === false) {
    await deleteRows('favorites', filtre)
  } else {
    // Deuxième clic sur un cœur déjà posé : la contrainte d'unicité refuse,
    // et c'est très bien — le compte ne bouge pas.
    await insertRow('favorites', { photo_id: photoId, event_id: id, device_token: deviceToken })
  }

  const compte = await selectRows('favorites', `photo_id=eq.${photoId}&select=id`)
  return Response.json({ count: Array.isArray(compte.data) ? compte.data.length : 0 })
}
