// ============================================================
//  Connexion à Stripe (encaissement des formules payantes).
//  À n'utiliser QUE dans les routes API : la clé secrète ne doit jamais
//  se retrouver côté navigateur.
// ============================================================
import 'server-only'
import Stripe from 'stripe'

// Le paiement est actif seulement si la clé secrète est configurée.
// Tant qu'elle est absente, tout le site fonctionne comme avant (offert).
export function paymentsLive() {
  return !!process.env.STRIPE_SECRET_KEY
}

let _stripe = null
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  return _stripe
}
