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

// Recharge unique offerte à l'invité qui a épuisé son quota. 0 = pas de recharge.
export const BONUS_MAX = 5

export const TIERS = [
  { maxGuests: 5,   priceCents: 0,    popular: false },
  { maxGuests: 10,  priceCents: 499,  popular: false },
  // Anniversaires, EVJF, petits mariages : la tranche 25-40 invités tombait
  // jusqu'ici sur la formule 50, trois fois plus chère que la formule 10.
  { maxGuests: 30,  priceCents: 999,  popular: false },
  { maxGuests: 50,  priceCents: 1499, popular: true  },
  { maxGuests: 100, priceCents: 2499, popular: false },
  { maxGuests: 150, priceCents: 2999, popular: false },
  { maxGuests: 300, priceCents: 4999, popular: false },
]

// Le plus grand palier s'annonce « jusqu'à 300 ». Il bloque comme les autres :
// au-delà, le tarif se fait à la main, et on invite à nous écrire.
export const TOP_TIER = TIERS[TIERS.length - 1]

// Adresse à laquelle on négocie les événements hors barème.
export const CONTACT_EMAIL = 'support@timetoflash.fr'

export function formatPrice(cents) {
  if (!cents) return 'Gratuit'
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

export function tierByGuests(n) {
  const v = Number(n)
  return TIERS.find((t) => t.maxGuests === v) || TIERS[0]
}

// Plus petite formule capable d'accueillir `count` invités.
// Au-delà du dernier palier, on renvoie le dernier (il n'y a rien au-dessus).
export function tierForCount(count) {
  const v = Number(count) || 0
  return TIERS.find((t) => t.maxGuests >= v) || TIERS[TIERS.length - 1]
}

// Montant à régler pour passer d'une formule à une autre : on ne fait jamais
// repayer ce qui l'a déjà été. Jamais négatif (on ne rembourse pas à la baisse).
export function upgradeCents(fromMaxGuests, toMaxGuests) {
  const from = tierByGuests(fromMaxGuests)
  const to = tierByGuests(toMaxGuests)
  return Math.max(0, to.priceCents - from.priceCents)
}

// Que proposer à un organisateur qui a besoin de place pour `count` invités ?
//
// Renvoie la formule à viser et ce qu'il reste à régler, ou `null` quand il est
// déjà au plus grand palier : là, il n'y a plus rien à vendre en ligne, et c'est
// un tarif sur mesure qu'il faut lui proposer. Un seul endroit décide, pour que
// l'écran, le mail et le tableau de bord racontent tous la même chose.
export function upgradeFor(currentMaxGuests, count) {
  const from = Number(currentMaxGuests) || 0
  const cible = tierForCount(count)
  if (cible.maxGuests <= from) return null
  return { maxGuests: cible.maxGuests, priceCents: upgradeCents(from, cible.maxGuests) }
}
