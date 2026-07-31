// ============================================================
//  Tarifs Time to Flash — paiement unique par événement, sans abonnement.
//  Pour changer les prix : modifier UNIQUEMENT ce fichier.
// ============================================================

// Paiement Stripe activé. Le tunnel de paiement ne dépend PAS de l'e-mail :
// après paiement, l'organisateur arrive directement sur son tableau de bord.
export const PAYMENTS_ENABLED = true

// Vérification de l'e-mail par code à la création.
// Désactivé temporairement : l'envoi d'e-mails depuis Vercel est bloqué par Brevo
// (restriction d'IP). À repasser à true dès que l'envoi d'e-mails est fiable.
export const EMAIL_VERIFICATION_ENABLED = false

// Nombre de clichés par invité : bornes annoncées dans les CGV (article 4).
// Toute modification doit être répercutée dans src/lib/legal.js.
export const SHOTS_MIN = 3
export const SHOTS_MAX = 15

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
