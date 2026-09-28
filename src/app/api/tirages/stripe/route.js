// ============================================================
//  L'avis de Stripe : « ce paiement de tirages est fait ».
//
//  Filet de sécurité du retour sur l'album : si l'invité referme la page juste
//  après avoir payé, c'est cet avis qui fait partir la commande. À déclarer
//  dans le tableau de bord Stripe (événement checkout.session.completed), avec
//  son secret dans STRIPE_WEBHOOK_TIRAGES_SECRET.
// ============================================================
import { getStripe } from '../../../../lib/stripe'
import { confirmerSession } from '../../../../lib/commande-tirages'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_TIRAGES_SECRET
  if (!stripe || !secret) return new Response('Non configuré.', { status: 404 })

  const brut = await request.text()
  let evenement
  try {
    evenement = stripe.webhooks.constructEvent(brut, request.headers.get('stripe-signature') || '', secret)
  } catch {
    return new Response('Signature invalide.', { status: 400 })
  }

  if (evenement.type === 'checkout.session.completed' || evenement.type === 'checkout.session.async_payment_succeeded') {
    const session = evenement.data.object
    if (session?.metadata?.type === 'tirages') await confirmerSession(session.id)
  }
  return Response.json({ received: true })
}
