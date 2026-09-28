// ============================================================
//  L'avis de Familink : « l'étape d'une commande a changé ».
//
//  L'adresse est à déclarer une fois sur le compte Familink (webhook_url), en
//  ligne seulement. L'avis n'est pas signé : on n'en retient que le numéro de
//  commande, et on relit l'étape directement chez Familink avec notre jeton.
//  À l'expédition, le client reçoit son mail (sans suivi : c'est une lettre).
// ============================================================
import { suivreExpedition } from '../../../../lib/commande-tirages'
import { lireCommandeFamilink } from '../../../../lib/familink'

export const runtime = 'nodejs'

export async function POST(request) {
  const corps = await request.json().catch(() => ({}))
  // Leur notice ne décrit pas ce message : on garde sa forme dans les journaux,
  // pour vérifier qu'on y trouve bien le numéro de commande.
  console.log('tirages: avis Familink reçu', JSON.stringify(corps).slice(0, 600))
  const pk = String(corps?.pk || corps?.order_pk || corps?.order?.pk || corps?.order_id || corps?.data?.pk || corps?.id || '')
  if (!/^[A-Z]{2}\d{2}[A-Z]{2}$/.test(pk)) return Response.json({ ok: true })
  try {
    return Response.json({ ok: true, ...(await suivreExpedition(pk, lireCommandeFamilink)) })
  } catch (err) {
    console.error('tirages: avis Familink', pk, err)
    return Response.json({ ok: false }, { status: 500 })
  }
}
