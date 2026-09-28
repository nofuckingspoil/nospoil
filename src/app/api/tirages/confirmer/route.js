// ============================================================
//  Retour de l'invité après le paiement Stripe.
//
//  L'album rappelle cette route avec l'identifiant de la session de paiement :
//  si Stripe confirme, la commande passe à « payée » et part chez Prodigi
//  (une seule fois, voir lib/commande-tirages). L'app iPhone fait de même
//  quand l'invité referme la page de paiement.
// ============================================================
import { confirmerSession } from '../../../../lib/commande-tirages'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { sessionId } = body
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!/^cs_[A-Za-z0-9_]+$/.test(String(sessionId || ''))) {
    return Response.json({ error: t({ fr: 'Paiement inconnu.', en: 'Unknown payment.', de: 'Unbekannte Zahlung.' }, langue) }, { status: 400 })
  }
  const c = await confirmerSession(String(sessionId))
  if (!c) return Response.json({ error: t({ fr: 'Paiement introuvable.', en: 'Payment not found.', de: 'Zahlung nicht gefunden.' }, langue) }, { status: 404 })

  return Response.json({
    statut: c.statut,
    nombre: c.nombre,
    format: c.format,
    total: c.total_cents,
    photoIds: (c.lignes || []).map((l) => l.photoId),
    rendu: c.rendu,
    // Ce que l'imprimeur nous facture : affiché en local seulement, pour juger
    // la marge pendant les essais. Jamais montré à un invité en ligne.
    ...(process.env.NODE_ENV !== 'production' && c.cout_imprimeur_cents != null
      ? { imprimeur: { nom: c.imprimeur, id: c.imprimeur_commande_id, cout: { total: c.cout_imprimeur_cents } } }
      : {}),
  })
}
