// ============================================================
//  Chaque heure : les adresses mortes et les désinscriptions vues par Brevo
//  sont recopiées sur les fiches des participants (voir lib/adresses-brevo).
//
//  Une heure de retard au plus : l'organisateur voit le badge « adresse
//  incorrecte » le jour même, à temps pour prévenir la personne autrement.
//
//  Protégée par CRON_SECRET, comme les autres.
// ============================================================
import { synchroniserAdresses } from '../../../../lib/adresses-brevo'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    // Deux jours plutôt qu'un : une heure manquée ne fait rien perdre.
    const res = await synchroniserAdresses(2)
    return Response.json({ ok: true, ...res })
  } catch (err) {
    console.error('cron/adresses:', err)
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
