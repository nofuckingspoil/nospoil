// ============================================================
//  Codes promotionnels.
//
//  Deux usages, un seul mécanisme :
//   - offrir un événement à un proche (code « offert ») ;
//   - faire de l'affiliation (remise pour l'acheteur, commission
//     calculée pour le partenaire).
//
//  Règle non négociable : le prix se décide ici, côté serveur. Le
//  navigateur ne fait que proposer un code — s'il pouvait annoncer
//  lui-même le montant, n'importe qui s'offrirait la plus grosse
//  formule en modifiant la page.
// ============================================================
import 'server-only'
import { selectRows, rpc } from './supabase'
import { tierByGuests, formatPrice } from './pricing'

// En dessous de ce montant, Stripe refuse d'encaisser (minimum légal de la
// carte bancaire en euros). Une remise qui descend si bas vaut donc gratuité.
const MIN_STRIPE_CENTS = 50

export function normalizePromo(code) {
  return (code || '').toString().trim().toUpperCase().replace(/\s+/g, '').slice(0, 40)
}

// Le code existe-t-il, et est-il encore utilisable ?
export async function findPromo(code) {
  const c = normalizePromo(code)
  if (!c) return { ok: false, error: 'Entre un code promo.' }

  const { data } = await selectRows('promo_codes', `code=eq.${encodeURIComponent(c)}&select=*`)
  const p = Array.isArray(data) ? data[0] : null

  // Un code désactivé se comporte comme un code inexistant : inutile
  // d'apprendre à qui l'a trouvé qu'il a existé.
  if (!p || !p.active) return { ok: false, error: "Ce code promo n'est pas valable." }
  if (p.expires_at && new Date(p.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: 'Ce code promo a expiré.' }
  }
  if (p.max_uses != null && p.uses >= p.max_uses) {
    return { ok: false, error: 'Ce code promo a déjà servi le nombre de fois prévu.' }
  }
  return { ok: true, promo: p }
}

// Montant restant à payer, en centimes.
export function applyPromo(promo, priceCents) {
  if (!promo) return priceCents
  if (promo.kind === 'free') return 0
  if (promo.kind === 'percent') {
    const pct = Math.min(100, Math.max(0, promo.value || 0))
    return Math.max(0, Math.round(priceCents * (1 - pct / 100)))
  }
  if (promo.kind === 'amount') return Math.max(0, priceCents - (promo.value || 0))
  return priceCents
}

// Formulation courte de l'avantage, affichée à l'organisateur et dans l'admin.
export function promoLabel(promo) {
  if (!promo) return ''
  if (promo.kind === 'free') return 'Offert'
  if (promo.kind === 'percent') return `−${promo.value} %`
  return `−${formatPrice(promo.value)}`
}

// Vérification complète : ce code, sur cette formule, donne quoi ?
// Utilisée par le champ « J'ai un code promo » ET rejouée à chaque étape
// sensible — une vérification faite une fois ne protège de rien.
export async function quotePromo(code, maxGuests) {
  const found = await findPromo(code)
  if (!found.ok) return { ok: false, error: found.error }

  const p = found.promo
  const tier = tierByGuests(maxGuests)

  if (tier.priceCents <= 0) {
    return { ok: false, error: 'Cette formule est déjà gratuite : garde ton code pour une autre fois.' }
  }
  if (p.max_guests_allowed != null && tier.maxGuests > p.max_guests_allowed) {
    return { ok: false, error: `Ce code s'arrête à la formule « ${p.max_guests_allowed} invités ».` }
  }

  let priceCents = applyPromo(p, tier.priceCents)
  // Trop peu pour être encaissé : on offre plutôt que d'afficher un paiement
  // que Stripe refusera au dernier moment.
  if (priceCents > 0 && priceCents < MIN_STRIPE_CENTS) priceCents = 0

  return {
    ok: true,
    promo: p,
    code: p.code,
    label: promoLabel(p),
    basePriceCents: tier.priceCents,
    priceCents,
    free: priceCents <= 0,
    // Événement d'essai : à exclure des statistiques.
    marksTest: !!p.marks_test,
  }
}

// Décompte une utilisation. Appelé UNIQUEMENT quand l'événement est
// réellement créé : un code saisi puis abandonné ne doit rien consommer.
export async function consumePromo(code, revenueCents = 0) {
  const c = normalizePromo(code)
  if (!c) return false
  const { ok, data } = await rpc('use_promo_code', { p_code: c, p_revenue_cents: Math.max(0, revenueCents | 0) })
  return !!(ok && data?.status === 'ok')
}

// Passage par un lien partenaire (?promo=…) : mesure ce qu'un partenaire
// amène comme visites, et pas seulement comme ventes.
export async function countPromoVisit(code) {
  const c = normalizePromo(code)
  if (!c) return
  try { await rpc('visit_promo_code', { p_code: c }) } catch {}
}
