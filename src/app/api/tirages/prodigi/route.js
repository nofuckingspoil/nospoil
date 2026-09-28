// ============================================================
//  L'avis de Prodigi : « l'étape d'une commande a changé ».
//
//  Déclaré commande par commande (callbackUrl), en ligne seulement. L'avis
//  n'est pas signé : on n'en retient que l'identifiant de la commande, et on
//  relit tout le reste directement chez Prodigi avec notre clé. Quand le colis
//  part avec un suivi, le client reçoit le mail d'expédition.
// ============================================================
import { suivreExpedition } from '../../../../lib/commande-tirages'
import { lireCommandeProdigi } from '../../../../lib/prodigi'

export const runtime = 'nodejs'

export async function POST(request) {
  const corps = await request.json().catch(() => ({}))
  const id = String(corps?.data?.order?.id || corps?.order?.id || corps?.subject || '').replace(/^.*\//, '')
  if (!/^ord_\d+$/.test(id)) return Response.json({ ok: true })
  try {
    const res = await suivreExpedition(id, lireCommandeProdigi)
    return Response.json({ ok: true, ...res })
  } catch (err) {
    console.error('tirages: avis Prodigi', id, err)
    return Response.json({ ok: false }, { status: 500 })
  }
}
