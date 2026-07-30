import { getStripe, paymentsLive } from '../../../lib/stripe'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode } from '../../../lib/account'
import { tierByGuests, EMAIL_VERIFICATION_ENABLED } from '../../../lib/pricing'
import { siteUrl } from '../../../lib/mail'

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
  if (!isValidEmail(ownerEmail)) return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime()) || reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
  }

  const tier = tierByGuests(maxGuests)
  if (tier.priceCents <= 0) {
    return Response.json({ error: 'Cette formule est gratuite : aucun paiement nécessaire.' }, { status: 400 })
  }

  // L'adresse doit être vérifiée (code à 6 chiffres) avant d'aller au paiement.
  // (Désactivable via EMAIL_VERIFICATION_ENABLED tant que l'envoi d'e-mails n'est pas fiable.)
  if (EMAIL_VERIFICATION_ENABLED) {
    const check = await verifyAndConsumeCode(ownerEmail, body.code)
    if (!check.ok) return Response.json({ error: check.error }, { status: check.status })
  }

  const shots = Math.min(50, Math.max(1, parseInt(shotsPerGuest, 10) || 10))
  const cleanName = name.trim().slice(0, 80)
  const base = siteUrl()
  const stripe = getStripe()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: ownerEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: tier.priceCents,
          product_data: { name: `Time to Flash — « ${cleanName} » (jusqu'à ${tier.maxGuests} invités)` },
        },
      }],
      success_url: `${base}/create/paiement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/create?tier=${tier.maxGuests}`,
      // Toutes les infos de l'événement voyagent avec le paiement : on crée l'événement au retour.
      metadata: {
        owner_token: String(ownerToken),
        owner_email: ownerEmail,
        name: cleanName,
        host_names: hostNames ? String(hostNames).trim().slice(0, 80) : '',
        shots_per_guest: String(shots),
        max_guests: String(tier.maxGuests),
        reveal_at: reveal.toISOString(),
      },
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe checkout:', err)
    return Response.json({ error: 'Impossible de démarrer le paiement. Réessayez.' }, { status: 502 })
  }
}
