import { rpc } from '../../../../../lib/supabase'

// Incrémente le compteur de téléchargements d'album (bouton "Tout télécharger")
export async function POST(request, { params }) {
  const { id } = await params
  if (!id) return Response.json({ error: 'Événement non précisé.' }, { status: 400 })
  await rpc('increment_event_download', { p_event_id: id }).catch(() => {})
  return Response.json({ ok: true })
}
