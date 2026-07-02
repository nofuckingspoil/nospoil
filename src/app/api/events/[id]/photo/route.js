import { selectRows, updateRow, deleteRows, deletePhoto } from '../../../../../lib/supabase'

// Vérifie que la requête vient de l'organisateur ou d'un admin (même owner_token).
async function requireOwner(id, request) {
  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return false
  const { data } = await selectRows('events', `id=eq.${id}&select=owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  return !!ev && ev.owner_token === ownerToken
}

// Masquer / réafficher une photo (hidden true|false)
export async function PATCH(request, { params }) {
  const { id } = await params
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }
  const body = await request.json().catch(() => ({}))
  const { photoId, hidden } = body
  if (!photoId) return Response.json({ error: 'Photo non précisée.' }, { status: 400 })

  const upd = await updateRow('photos', `id=eq.${photoId}&event_id=eq.${id}`, { hidden: !!hidden })
  if (!upd.ok) return Response.json({ error: 'Action impossible.' }, { status: 500 })
  return Response.json({ ok: true, hidden: !!hidden })
}

// Supprimer définitivement une photo (fichier + ligne)
export async function DELETE(request, { params }) {
  const { id } = await params
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }
  const photoId = new URL(request.url).searchParams.get('photoId')
  if (!photoId) return Response.json({ error: 'Photo non précisée.' }, { status: 400 })

  const { data } = await selectRows('photos', `id=eq.${photoId}&event_id=eq.${id}&select=storage_path`)
  const ph = Array.isArray(data) ? data[0] : null
  if (!ph) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  const del = await deleteRows('photos', `id=eq.${photoId}&event_id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })
  if (ph.storage_path) await deletePhoto(ph.storage_path)

  return Response.json({ ok: true })
}
