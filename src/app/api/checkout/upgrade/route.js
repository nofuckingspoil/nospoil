import { getStripe, paymentsLive } from '../../../../lib/stripe'
import { selectRows, updateRow } from '../../../../lib/supabase'
import { tierByGuests, upgradeCents } from '../../../../lib/pricing'
import { siteUrl } from '../../../../lib/mail'
import { membrePar } from '../../../../lib/equipe'
import { appliquerAgrandissement } from '../../../../lib/upgrade'

export const runtime = 'nodejs'

// Au-delà, on considère que la page de paiement a été abandonnée. Stripe
// laisse ses sessions ouvertes 24 h : s'aligner dessus bloquerait tout un
// week-end à cause d'un onglet fermé, alors qu'un invité attend à la porte.
const MINUTES_PAIEMENT = 20

// L'état du dernier paiement ouvert pour cet événement.
// Renvoie { paye, ouvert, session } — tout à faux si rien n'est en cours.
async function paiementEnCours(stripe, ev) {
  if (!ev.upgrade_pending_session || !stripe) return null
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(ev.upgrade_pending_session)
  } catch {
    return null // session inconnue de Stripe : on repart de zéro
  }
  if (session?.payment_status === 'paid') return { paye: true, session }

  const depuis = ev.upgrade_pending_at ? Date.now() - new Date(ev.upgrade_pending_at).getTime() : Infinity
  const frais = depuis < MINUTES_PAIEMENT * 60 * 1000
  if (session?.status === 'open' && frais) return { ouvert: true, session }
  return null
}

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

  const { data } = await selectRows(
    'events',
    `id=eq.${eventId}&select=id,name,owner_token,owner_email,max_guests,reveal_at,reveal_paused,upgrade_pending_session,upgrade_pending_at`
  )
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

  // ---- Un paiement est-il déjà passé, ou en train de passer ? ----
  //
  // C'est ici que se joue le « ne pas payer deux fois ». Détecter le doublon
  // après coup laissait une soirée avec deux règlements et un remboursement à
  // faire ; on refuse maintenant d'ouvrir le second.
  const enCours = await paiementEnCours(stripe, ev)
  if (enCours?.paye) {
    // Réglé, mais jamais appliqué : le payeur a fermé l'onglet avant de
    // revenir. On le rattrape séance tenante plutôt que d'encaisser une
    // seconde fois pour la même chose.
    const applique = await appliquerAgrandissement(ev, enCours.session)
    return Response.json({
      alreadyPaid: true,
      maxGuests: applique.maxGuests || ev.max_guests,
      message: 'Cet agrandissement a déjà été réglé — il vient d’être appliqué.',
    })
  }
  if (enCours?.ouvert) {
    return Response.json({
      error: 'Un paiement pour cet agrandissement est déjà en cours, ouvert il y a moins de ' +
        `${MINUTES_PAIEMENT} minutes. Attendez qu’il aboutisse avant d’en lancer un autre — ` +
        'inutile de régler deux fois.',
    }, { status: 409 })
  }

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
    // Retenu avant même que la personne n'ait payé : c'est ce qui permettra
    // de refuser un second paiement pendant qu'elle saisit sa carte.
    await updateRow('events', `id=eq.${ev.id}`, {
      upgrade_pending_session: session.id,
      upgrade_pending_at: new Date().toISOString(),
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe upgrade:', err)
    return Response.json({ error: 'Impossible de démarrer le paiement. Réessayez.' }, { status: 502 })
  }
}
