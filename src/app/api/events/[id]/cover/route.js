import { selectRows, updateRow, uploadPhoto, deletePhoto } from '../../../../../lib/supabase'
import { roleFor, canManage } from '../../../../../lib/authz'

export const runtime = 'nodejs'
export const maxDuration = 30

// Upload de la photo de couverture (réservé à l'organisateur de l'événement)
export async function POST(request, { params }) {
  const { id } = await params

  let form
  try { form = await request.formData() } catch { return Response.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const file = form.get('file')
  const ownerToken = form.get('ownerToken')
  if (!file || typeof file === 'string' || !ownerToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const { ok: found, data } = await selectRows('events', `id=eq.${id}&select=owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!found || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) return Response.json({ error: 'Image trop lourde.' }, { status: 413 })

  const path = `${id}/cover.jpg`
  const up = await uploadPhoto(path, bytes, 'image/jpeg')
  if (!up.ok) {
    console.error('cover upload error', up.status)
    return Response.json({ error: "Échec de l'envoi de l'image." }, { status: 500 })
  }

  // Nouvelle photo : le cadrage précédent ne veut plus rien dire.
  const upd = await updateRow('events', `id=eq.${id}`, { cover_url: path, cover_pos: null })
  if (!upd.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  return Response.json({ ok: true })
}

// Retire la photo de couverture : l'écran d'accueil retrouve son dégradé.
export async function DELETE(request, { params }) {
  const { id } = await params
  const ownerToken = request.headers.get('x-owner-token')
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const { data } = await selectRows('events', `id=eq.${id}&select=cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  const upd = await updateRow('events', `id=eq.${id}`, { cover_url: null, cover_pos: null })
  if (!upd.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  // Le fichier part ensuite : si l'effacement échoue, mieux vaut un fichier
  // orphelin qu'une couverture qui réapparaît.
  if (ev.cover_url) { try { await deletePhoto(ev.cover_url) } catch {} }

  return Response.json({ ok: true })
}
