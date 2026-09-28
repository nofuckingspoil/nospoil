import { getStripe, paymentsLive } from '../../../../lib/stripe'
import { selectRows, updateRow } from '../../../../lib/supabase'
import { tierByGuests, upgradeCents } from '../../../../lib/pricing'
import { siteUrl } from '../../../../lib/mail'
import { membrePar } from '../../../../lib/equipe'
import { appliquerAgrandissement } from '../../../../lib/upgrade'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'
import { erreur } from '../../../../lib/messages-serveur'

export const runtime = 'nodejs'

// Au-delà, on considère que la page de paiement a été abandonnée. Stripe
// laisse ses sessions ouvertes 24 h : s'aligner dessus bloquerait tout un
// week-end à cause d'un onglet fermé, alors qu'un participant attend à la porte.
const MINUTES_PAIEMENT = 20

// L'état du dernier paiement ouvert pour cet événement.
// Renvoie { paye, ouvert, session } : tout à faux si rien n'est en cours.
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
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!paymentsLive()) {
    return Response.json({ error: t({ fr: "Le paiement n'est pas encore activé.", en: 'Payment is not enabled yet.', de: 'Die Zahlung ist noch nicht aktiviert.' }, langue) }, { status: 400 })
  }

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const { eventId, maxGuests } = body
  if (!eventId) return Response.json({ error: t({ fr: 'Événement manquant.', en: 'Event missing.', de: 'Event fehlt.' }, langue) }, { status: 400 })
  if (!estUuid(eventId)) return identifiantInvalide(langue)

  const { data } = await selectRows(
    'events',
    `id=eq.${eventId}&select=id,name,owner_token,owner_email,max_guests,reveal_at,reveal_paused,upgrade_pending_session,upgrade_pending_at,langue`
  )
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: erreur('introuvable', langue) }, { status: 404 })

  // Un co-organisateur peut régler l'agrandissement, et c'est voulu : la
  // formule se remplit en pleine soirée, quand celui qui a créé l'événement
  // danse ou dort. Lui réserver ce paiement, c'était laisser des participants à la
  // porte jusqu'au lendemain matin, et le bouton lui était déjà montré, pour
  // ne lui rendre qu'un refus.
  const membre = await membrePar(eventId, ownerToken)
  if (!membre) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const cible = tierByGuests(maxGuests)
  if (cible.maxGuests <= (ev.max_guests || 0)) {
    return Response.json({ error: t({ fr: 'Cette formule n’est pas plus grande que la vôtre.', en: 'This plan is not bigger than yours.', de: 'Dieses Paket ist nicht größer als Ihres.' }, langue) }, { status: 400 })
  }

  const montant = upgradeCents(ev.max_guests, cible.maxGuests)
  if (montant <= 0) {
    return Response.json({ error: t({ fr: 'Aucun complément à régler pour cette formule.', en: 'Nothing extra to pay for this plan.', de: 'Für dieses Paket ist nichts nachzuzahlen.' }, langue) }, { status: 400 })
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
      message: t({ fr: 'Cet agrandissement a déjà été réglé : il vient d’être appliqué.', en: 'This upgrade has already been paid for: it has just been applied.', de: 'Diese Erweiterung wurde bereits bezahlt: Sie wurde soeben übernommen.' }, langue),
    })
  }
  if (enCours?.ouvert) {
    return Response.json({
      error: t({
        fr: 'Un paiement pour cet agrandissement est déjà en cours, ouvert il y a moins de ' +
          `${MINUTES_PAIEMENT} minutes. Attendez qu’il aboutisse avant d’en lancer un autre : ` +
          'inutile de régler deux fois.',
        en: `A payment for this upgrade is already in progress, started less than ${MINUTES_PAIEMENT} minutes ago. ` +
          'Wait for it to go through before starting another: there is no need to pay twice.',
        de: `Eine Zahlung für diese Erweiterung läuft bereits, gestartet vor weniger als ${MINUTES_PAIEMENT} Minuten. ` +
          'Warten Sie, bis sie abgeschlossen ist, bevor Sie eine neue starten: Sie müssen nicht zweimal bezahlen.',
      }, langue),
    }, { status: 409 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // La page de paiement Stripe dans la langue de celui qui règle.
      locale: langue,
      // L'adresse de celui qui règle, pas celle du propriétaire : c'est lui
      // qui recevra le reçu Stripe, et c'est sa carte.
      customer_email: membre.email || ev.owner_email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: montant,
          product_data: {
            name: t({
              fr: `Time to Flash, « ${ev.name} » : passage à ${cible.maxGuests} participants`,
              en: `Time to Flash, “${ev.name}”: upgrade to ${cible.maxGuests} guests`,
              de: `Time to Flash, „${ev.name}“: Erweiterung auf ${cible.maxGuests} Gäste`,
            }, langue),
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
    return Response.json({ error: t({ fr: 'Impossible de démarrer le paiement. Réessayez.', en: 'Payment could not be started. Please try again.', de: 'Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.' }, langue) }, { status: 502 })
  }
}
