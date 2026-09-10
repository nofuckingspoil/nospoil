import { rpc, deletePhoto, selectRows } from '../../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { peutSupprimer } from '../../../../lib/photo-mode'
import { isRevealed } from '../../../../lib/phase'

// Supprime une photo du participant (vérifiée par device_token) et libère un cliché.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { photoId, deviceToken } = body
  if (!photoId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }
  if (!estUuid(photoId)) return identifiantInvalide()

  // Les deux rendus se lisent AVANT la suppression : la fonction en base ne
  // rend que le fichier pleine qualité, et les copies allégées restaient sur R2
  // à occuper de la place pour une photo qui n'existe plus.
  const avant = await selectRows('photos', `id=eq.${photoId}&select=thumb_path,view_path,event_id`)
  const thumb = Array.isArray(avant.data) ? avant.data[0]?.thumb_path : null
  const vue = Array.isArray(avant.data) ? avant.data[0]?.view_path : null
  const eventId = Array.isArray(avant.data) ? avant.data[0]?.event_id : null

  // Le mode photo de l'événement ferme la porte, et le serveur la ferme aussi :
  // l'interface cache le bouton, mais la route reste appelable directement.
  // Après la révélation, chacun redevient maître de ses photos, quel que soit le
  // mode : le jeu est fini, et le droit à l'effacement, lui, ne s'éteint pas.
  if (eventId) {
    const evRes = await selectRows('events', `id=eq.${eventId}&select=photo_mode,reveal_at,reveal_paused`)
    const ev = Array.isArray(evRes.data) ? evRes.data[0] : null
    const ouvert = ev ? isRevealed({ revealAt: ev.reveal_at, revealPaused: ev.reveal_paused }) : true
    if (ev && !ouvert && !peutSupprimer(ev.photo_mode)) {
      return Response.json(
        { error: "Sur cet événement, une photo prise ne se reprend pas : elle se découvrira à la révélation." },
        { status: 409 }
      )
    }
  }

  const { ok, data } = await rpc('delete_photo', {
    p_photo_id: photoId,
    p_device_token: deviceToken,
  })

  if (!ok || data?.status === 'error') {
    return Response.json({ error: data?.message || 'Suppression impossible.' }, { status: 400 })
  }

  if (data?.storage_path) await deletePhoto(data.storage_path)
  if (thumb && thumb !== data?.storage_path) await deletePhoto(thumb)
  if (vue && vue !== data?.storage_path) await deletePhoto(vue)
  return Response.json({ shotsTaken: data.shots_taken })
}
