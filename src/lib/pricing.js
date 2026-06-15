// ============================================================
//  Tarifs Déclic — paiement unique par événement, sans abonnement.
//  Pour changer les prix : modifier UNIQUEMENT ce fichier.
// ============================================================

// Tant que Stripe n'est pas branché, les formules payantes sont
// créées sans encaissement (offert pendant le lancement).
export const PAYMENTS_ENABLED = false

export const TIERS = [
  { maxGuests: 5,   priceCents: 0,    popular: false },
  { maxGuests: 10,  priceCents: 499,  popular: false },
  { maxGuests: 50,  priceCents: 1499, popular: true  },
  { maxGuests: 100, priceCents: 2499, popular: false },
  { maxGuests: 150, priceCents: 2999, popular: false },
]

export function formatPrice(cents) {
  if (!cents) return 'Gratuit'
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

export function tierByGuests(n) {
  const v = Number(n)
  return TIERS.find((t) => t.maxGuests === v) || TIERS[0]
}
