import { getStripe } from '../../../../../lib/stripe'
import { selectRows } from '../../../../../lib/supabase'
import { membrePar } from '../../../../../lib/equipe'
import { activerLivreOrPaye } from '../../../../../lib/livre-or'
import { t, langueValide } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'
import { erreur } from '../../../../../lib/messages-serveur'

export const runtime = 'nodejs'

// Active le livre d'or au retour du paiement. Idempotent : une page
// rechargée ne fait que confirmer.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  const stripe = getStripe()
  if (!stripe) return Response.json({ error: t({ fr: 'Paiement indisponible.', en: 'Payment unavailable.', de: 'Zahlung nicht verfügbar.' }, langue) }, { status: 400 })

  const ownerToken = request.headers.get('x-owner-token')
  const { sessionId } = body
  if (!ownerToken || !sessionId) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  let session
  try { session = await stripe.checkout.sessions.retrieve(sessionId) } catch {
    return Response.json({ error: t({ fr: 'Session de paiement introuvable.', en: 'Payment session not found.', de: 'Zahlungssitzung nicht gefunden.' }, langue) }, { status: 404 })
  }
  if (session?.payment_status !== 'paid') {
    return Response.json({ error: t({ fr: "Le paiement n'a pas été confirmé.", en: 'The payment has not been confirmed.', de: 'Die Zahlung wurde nicht bestätigt.' }, langue) }, { status: 402 })
  }
  const m = session.metadata || {}
  if (m.kind !== 'livre_or' || !m.event_id) {
    return Response.json({ error: t({ fr: 'Ce paiement ne concerne pas le livre d’or.', en: 'This payment is not for the guestbook.', de: 'Diese Zahlung betrifft nicht das Gästebuch.' }, langue) }, { status: 400 })
  }

  const { data } = await selectRows('events', `id=eq.${m.event_id}&select=id,livre_or_actif`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: erreur('introuvable', langue) }, { status: 404 })
  if (!(await membrePar(ev.id, ownerToken))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const r = await activerLivreOrPaye(ev, session)
  if (!r.ok) return Response.json({ error: t({ fr: 'Activation impossible.', en: 'Activation not possible.', de: 'Aktivierung nicht möglich.' }, langue) }, { status: 500 })
  return Response.json({ ok: true, deja: !!r.deja, paidCents: session.amount_total ?? 0 })
}
