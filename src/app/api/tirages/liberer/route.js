// ============================================================
//  Faire partir les commandes de tirages en attente.
//
//  À appeler une fois l'accès de production de l'imprimeur branché (et, par
//  précaution, de temps en temps) : voir libererCommandesEnAttente.
//  Protégé par ADMIN_KEY, comme le reste de l'administration.
// ============================================================
import { libererCommandesEnAttente } from '../../../../lib/commande-tirages'
import { verifierAccesFamilink, familinkEnv } from '../../../../lib/familink'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request) {
  const cle = process.env.ADMIN_KEY
  if (!cle || request.headers.get('x-admin-key') !== cle) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  // Contrôle seul, sans rien faire partir : ?verifier=1
  if (new URL(request.url).searchParams.get('verifier') === '1') {
    return Response.json({ imprimeur: process.env.IMPRIMEUR || 'prodigi', env: familinkEnv(), familink: await verifierAccesFamilink() })
  }
  return Response.json(await libererCommandesEnAttente())
}
