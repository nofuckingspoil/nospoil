import { rpc, insertRow } from '../../../../../lib/supabase'

// Enregistre un téléchargement d'album (bouton « Tout télécharger »).
//
// Le compteur global reste alimenté pour l'admin, mais on garde en plus le
// détail : quel appareil, combien de photos. C'est ce qui permet d'annoncer
// « 12 personnes ont emporté l'album » plutôt qu'un nombre de clics, qu'une
// même personne peut gonfler à elle seule.
export async function POST(request, { params }) {
  const { id } = await params
  if (!id) return Response.json({ error: 'Événement non précisé.' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const photoCount = Math.max(0, parseInt(body.photoCount, 10) || 0)
  const deviceToken = typeof body.deviceToken === 'string' ? body.deviceToken.slice(0, 120) : null

  await rpc('increment_event_download', { p_event_id: id }).catch(() => {})
  // Un échec ici ne doit pas empêcher le téléchargement, déjà lancé côté client.
  try {
    await insertRow('downloads', { event_id: id, device_token: deviceToken, photo_count: photoCount })
  } catch {}

  return Response.json({ ok: true })
}
