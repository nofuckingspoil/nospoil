import { getStripe, paymentsLive } from '../../../lib/stripe'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode } from '../../../lib/account'
import { tierByGuests, EMAIL_VERIFICATION_ENABLED, SHOTS_MIN, SHOTS_MAX } from '../../../lib/pricing'
import { siteUrl } from '../../../lib/mail'
import { LEGAL_UPDATED } from '../../../lib/legal'
import { quotePromo } from '../../../lib/promo'

export const runtime = 'nodejs'

// Crée une session de paiement Stripe pour une formule payante.
// L'événement n'est PAS encore créé : il le sera après confirmation du paiement.
export async function POST(request) {
  if (!paymentsLive()) {
    return Response.json({ error: "Le paiement n'est pas encore activé." }, { status: 400 })
  }
  const body = await request.json().catch(() => ({}))
  const { ownerToken, name, hostNames, revealAt, shotsPerGuest, maxGuests } = body
  const ownerEmail = normalizeEmail(body.ownerEmail)

  if (!ownerToken) return Response.json({ error: 'Appareil non identifié.' }, { status: 400 })
  if (!name || !name.trim()) return Response.json({ error: "Donne un nom à ton événement." }, { status: 400 })

  // L'adresse est facultative ici : Stripe la demande de toute façon pendant le
  // paiement, et on la récupère au retour. On l'exige seulement si elle doit
  // être vérifiée par code en amont, ou si elle a été fournie mais mal formée.
  if (EMAIL_VERIFICATION_ENABLED && !isValidEmail(ownerEmail)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }
  if (ownerEmail && !isValidEmail(ownerEmail)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime()) || reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
  }

  // Date de la fête : à défaut, estimée à la veille au soir de la révélation.
  const startRaw = body.startsAt ? new Date(body.startsAt) : null
  const startsAt = startRaw && !isNaN(startRaw.getTime()) ? startRaw : new Date(reveal.getTime() - 13 * 3600 * 1000)

  const tier = tierByGuests(maxGuests)
  if (tier.priceCents <= 0) {
    return Response.json({ error: 'Cette formule est gratuite : aucun paiement nécessaire.' }, { status: 400 })
  }

  // Code promo : revérifié ici même si le navigateur l'a déjà fait vérifier.
  // Un prix annoncé par le client ne prouve rien.
  let promo = null
  if (body.promo) {
    const q = await quotePromo(body.promo, tier.maxGuests)
    if (!q.ok) return Response.json({ error: q.error }, { status: 400 })
    // Plus rien à encaisser : ce n'est plus une vente, c'est une création
    // directe. Le navigateur doit passer par /api/events.
    if (q.free) return Response.json({ free: true, code: q.code, error: 'Ce code offre la formule : aucun paiement nécessaire.' }, { status: 400 })
    promo = q
  }

  // L'adresse doit être vérifiée (code à 6 chiffres) avant d'aller au paiement.
  // (Désactivable via EMAIL_VERIFICATION_ENABLED tant que l'envoi d'e-mails n'est pas fiable.)
  if (EMAIL_VERIFICATION_ENABLED) {
    const check = await verifyAndConsumeCode(ownerEmail, body.code)
    if (!check.ok) return Response.json({ error: check.error }, { status: check.status })
  }

  // Formule payante : l'acceptation des CGV ET la renonciation au droit de
  // rétractation sont exigées avant d'ouvrir le paiement (CGV art. 6 et 9.2).
  if (body.cgvAccepted !== true) {
    return Response.json({ error: 'Vous devez accepter les conditions générales.' }, { status: 400 })
  }
  if (body.withdrawalWaived !== true) {
    return Response.json({ error: "Vous devez demander l'exécution immédiate du service." }, { status: 400 })
  }
  const consentAt = new Date().toISOString()

  // Variante du tunnel d'où vient la demande. Liste fermée : le client ne doit
  // pas pouvoir faire pointer l'annulation vers n'importe quelle adresse.
  const CANCEL_PATHS = { long: '/create', court: '/create/express', express: '/create/paiement-direct' }
  const cancelPath = CANCEL_PATHS[body.flow] || CANCEL_PATHS.long

  const shots = Math.min(SHOTS_MAX, Math.max(SHOTS_MIN, parseInt(shotsPerGuest, 10) || 5)) // bornes annoncées dans les CGV (art. 4)
  const cleanName = name.trim().slice(0, 80)
  const base = siteUrl()
  const stripe = getStripe()

  // La remise est présentée comme une remise, pas comme un prix plus bas venu
  // de nulle part : Stripe affiche « Réduction » sous le montant d'origine.
  let discounts
  if (promo) {
    try {
      const coupon = promo.promo.kind === 'percent'
        ? await stripe.coupons.create({ percent_off: promo.promo.value, duration: 'once', name: `Code ${promo.code}` })
        : await stripe.coupons.create({ amount_off: tier.priceCents - promo.priceCents, currency: 'eur', duration: 'once', name: `Code ${promo.code}` })
      discounts = [{ coupon: coupon.id }]
    } catch (err) {
      console.error('coupon stripe:', err)
      discounts = undefined // repli plus bas : on facture directement le prix remisé
    }
  }
  // Sans coupon, on facture le montant remisé : mieux vaut une remise discrète
  // qu'un organisateur qui paie le plein tarif.
  const unitAmount = promo && !discounts ? promo.priceCents : tier.priceCents

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      discounts,
      // Sans adresse fournie, Stripe la demande lui-même sur sa page de paiement.
      customer_email: ownerEmail || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: { name: `Time to Flash — « ${cleanName} » (jusqu'à ${tier.maxGuests} invités)` },
        },
      }],
      success_url: `${base}/create/paiement?session_id={CHECKOUT_SESSION_ID}`,
      // Une annulation doit ramener sur la variante d'où l'on vient, sinon la
      // comparaison entre les tunnels est faussée.
      cancel_url: `${base}${cancelPath}?tier=${tier.maxGuests}`,
      // Toutes les infos de l'événement voyagent avec le paiement : on crée l'événement au retour.
      metadata: {
        owner_token: String(ownerToken),
        owner_email: ownerEmail || '',
        name: cleanName,
        host_names: hostNames ? String(hostNames).trim().slice(0, 80) : '',
        shots_per_guest: String(shots),
        max_guests: String(tier.maxGuests),
        starts_at: startsAt.toISOString(),
        reveal_at: reveal.toISOString(),
        // Preuve du consentement, horodatée par le serveur avant le paiement.
        cgv_accepted_at: consentAt,
        withdrawal_waived_at: consentAt,
        cgv_version: LEGAL_UPDATED,
        // Le code voyage avec le paiement : il ne sera décompté qu'au retour,
        // une fois l'événement réellement créé.
        promo_code: promo ? promo.code : '',
        is_test: promo && promo.marksTest ? '1' : '',
      },
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe checkout:', err)
    return Response.json({ error: 'Impossible de démarrer le paiement. Réessayez.' }, { status: 502 })
  }
}
