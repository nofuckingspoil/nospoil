// ============================================================
//  Toutes les deux heures : les tirages sont-ils partis ?
//
//  Double l'avis de Familink (voir /api/tirages/familink) : on redemande
//  l'étape des commandes pas encore postées, et le client reçoit son mail
//  d'expédition dès qu'elles le sont. Protégée par CRON_SECRET.
// ============================================================
import { verifierExpeditions, imprimeurChoisi } from '../../../../lib/commande-tirages'
import { lireCommandeFamilink } from '../../../../lib/familink'
import { lireCommandeProdigi } from '../../../../lib/prodigi'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  const lire = imprimeurChoisi() === 'familink' ? lireCommandeFamilink : lireCommandeProdigi
  return Response.json({ ok: true, ...(await verifierExpeditions(lire)) })
}
