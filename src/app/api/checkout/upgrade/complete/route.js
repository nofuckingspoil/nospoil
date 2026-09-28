import { after } from 'next/server'
import { getStripe } from '../../../../../lib/stripe'
import { selectRows } from '../../../../../lib/supabase'
import { membrePar } from '../../../../../lib/equipe'
import { alerterDoublePaiement } from '../../../../../lib/paiement-double'
import { appliquerAgrandissement } from '../../../../../lib/upgrade'
import { t, langueValide } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'
import { erreur } from '../../../../../lib/messages-serveur'

export const runtime = 'nodejs'

// Applique une mise à niveau de formule au retour du paiement.
//
// Idempotent par nature : la formule ne fait que monter. Rappelée deux fois
// (page rechargée), la route ne trouve rien à relever et se contente de
// confirmer. Le vrai travail est fait par appliquerAgrandissement, partagé
// avec l'ouverture d'un paiement, qui rattrape le cas de l'onglet fermé.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  const stripe = getStripe()
  if (!stripe) return Response.json({ error: t({ fr: 'Paiement indisponible.', en: 'Payment unavailable.', de: 'Zahlung nicht verfügbar.' }, langue) }, { status: 400 })

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const { sessionId } = body
  if (!sessionId) return Response.json({ error: t({ fr: 'Session manquante.', en: 'Session missing.', de: 'Sitzung fehlt.' }, langue) }, { status: 400 })

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return Response.json({ error: t({ fr: 'Session de paiement introuvable.', en: 'Payment session not found.', de: 'Zahlungssitzung nicht gefunden.' }, langue) }, { status: 404 })
  }
  if (!session || session.payment_status !== 'paid') {
    return Response.json({ error: t({ fr: "Le paiement n'a pas été confirmé.", en: 'The payment has not been confirmed.', de: 'Die Zahlung wurde nicht bestätigt.' }, langue) }, { status: 402 })
  }

  const m = session.metadata || {}
  if (m.kind !== 'upgrade' || !m.event_id) {
    return Response.json({ error: t({ fr: 'Ce paiement ne concerne pas une mise à niveau.', en: 'This payment is not for an upgrade.', de: 'Diese Zahlung betrifft keine Erweiterung.' }, langue) }, { status: 400 })
  }

  const { data } = await selectRows(
    'events',
    `id=eq.${m.event_id}&select=id,name,owner_token,owner_email,reveal_at,reveal_paused,max_guests,upgrade_session_id,langue`
  )
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: erreur('introuvable', langue) }, { status: 404 })

  // Même porte que pour l'ouverture du paiement : un co-organisateur qui a
  // réglé doit pouvoir finaliser. Lui refuser ici serait le pire des cas : 
  // l'argent prélevé, et la formule inchangée.
  const membre = await membrePar(ev.id, ownerToken)
  if (!membre) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const applique = await appliquerAgrandissement(ev, session)
  if (!applique.ok) return Response.json({ error: t({ fr: 'Mise à niveau impossible.', en: 'Upgrade not possible.', de: 'Erweiterung nicht möglich.' }, langue) }, { status: 500 })

  // Rien à relever : le plus souvent une page rechargée, avec la même session.
  // Une session différente veut dire que deux règlements ont abouti pour la
  // même chose malgré le verrou posé à l'ouverture du paiement : il reste la
  // fenêtre de quelques secondes où deux personnes cliquent en même temps. La
  // formule ne monte qu'une fois : le second est à rembourser, et personne ne
  // le verrait si on n'en disait rien ici.
  if (applique.deja && ev.upgrade_session_id && ev.upgrade_session_id !== session.id) {
    after(async () => { try {
      await alerterDoublePaiement({
        eventName: ev.name,
        eventId: ev.id,
        email: membre.email || session.customer_email,
        montantCents: session.amount_total,
        sessionId: session.id,
      })
    } catch (err) { console.error('alerte double paiement:', err) } })
  }

  return Response.json({
    ok: true,
    maxGuests: applique.maxGuests,
    alreadyApplied: !!applique.deja,
    notified: applique.notified || null,
    // Montant encaissé : sert à déclarer la vente à la publicité.
    paidCents: session.amount_total ?? 0,
    sessionId: session.id,
  })
}
