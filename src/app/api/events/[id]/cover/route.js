import { selectRows, updateRow, uploadPhoto } from '../../../../../lib/supabase'

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
  if (ev.owner_token !== ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) return Response.json({ error: 'Image trop lourde.' }, { status: 413 })

  const path = `${id}/cover.jpg`
  const up = await uploadPhoto(path, bytes, 'image/jpeg')
  if (!up.ok) {
    console.error('cover upload error', up.status)
    return Response.json({ error: "Échec de l'envoi de l'image." }, { status: 500 })
  }

  const upd = await updateRow('events', `id=eq.${id}`, { cover_url: path })
  if (!upd.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  return Response.json({ ok: true })
}
