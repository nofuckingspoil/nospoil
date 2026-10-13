// ============================================================
//  Le livre d'or offert après un essai est-il encore valable ?
//
//  Appelé par la création quand on arrive par le bouton du mail
//  (/create?cadeau=…), pour afficher le cadeau. Simple affichage : le
//  serveur revérifie au moment de créer ou de payer.
// ============================================================
import { cadeauValide } from '../../../lib/cadeau-essai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const jeton = new URL(request.url).searchParams.get('c') || ''
  const essai = await cadeauValide(jeton)
  return Response.json(essai ? { ok: true, fin: essai.essai_offre_fin } : { ok: false })
}
