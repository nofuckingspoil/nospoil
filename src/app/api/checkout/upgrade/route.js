import { getStripe, paymentsLive } from '../../../../lib/stripe'
import { selectRows } from '../../../../lib/supabase'
import { tierByGuests, upgradeCents } from '../../../../lib/pricing'
import { siteUrl } from '../../../../lib/mail'
import { membrePar } from '../../../../lib/equipe'

export const runtime = 'nodejs'

// Ouvre un paiement Stripe pour agrandir la formule d'un événement existant.
// On ne facture que la différence : ce qui a déjà été réglé reste acquis.
export async function POST(request) {
  if (!paymentsLive()) {
    return Response.json({ error: "Le paiement n'est pas encore activé." }, { status: 400 })
  }

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { eventId, maxGuests } = await request.json().catch(() => ({}))
  if (!eventId) return Response.json({ error: 'Événement manquant.' }, { status: 400 })

  const { data } = await selectRows('events', `id=eq.${eventId}&select=id,name,owner_token,owner_email,max_guests`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Un co-organisateur peut régler l'agrandissement, et c'est voulu : la
  // formule se remplit en pleine soirée, quand celui qui a créé l'événement
  // danse ou dort. Lui réserver ce paiement, c'était laisser des invités à la
  // porte jusqu'au lendemain matin — et le bouton lui était déjà montré, pour
  // ne lui rendre qu'un refus.
  const membre = await membrePar(eventId, ownerToken)
  if (!membre) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const cible = tierByGuests(maxGuests)
  if (cible.maxGuests <= (ev.max_guests || 0)) {
    return Response.json({ error: 'Cette formule n’est pas plus grande que la vôtre.' }, { status: 400 })
  }

  const montant = upgradeCents(ev.max_guests, cible.maxGuests)
  if (montant <= 0) {
    return Response.json({ error: 'Aucun complément à régler pour cette formule.' }, { status: 400 })
  }

  const base = siteUrl()
  const stripe = getStripe()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // L'adresse de celui qui règle, pas celle du propriétaire : c'est lui
      // qui recevra le reçu Stripe, et c'est sa carte.
      customer_email: membre.email || ev.owner_email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: montant,
          product_data: {
            name: `Time to Flash — « ${ev.name} » : passage à ${cible.maxGuests} invités`,
          },
        },
      }],
      // Le tableau de bord finalise la mise à niveau au retour.
      success_url: `${base}/event/${ev.id}?upgrade_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/event/${ev.id}`,
      metadata: {
        kind: 'upgrade',
        event_id: String(ev.id),
        max_guests: String(cible.maxGuests),
        from_max_guests: String(ev.max_guests || 0),
      },
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe upgrade:', err)
    return Response.json({ error: 'Impossible de démarrer le paiement. Réessayez.' }, { status: 502 })
  }
}
