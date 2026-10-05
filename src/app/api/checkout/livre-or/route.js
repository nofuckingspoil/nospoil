import { getStripe, paymentsLive } from '../../../../lib/stripe'
import { selectRows, updateRow } from '../../../../lib/supabase'
import { LIVRE_OR_CENTS } from '../../../../lib/pricing'
import { siteUrl } from '../../../../lib/mail'
import { membrePar } from '../../../../lib/equipe'
import { activerLivreOrPaye } from '../../../../lib/livre-or'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'
import { erreur } from '../../../../lib/messages-serveur'

export const runtime = 'nodejs'

// Au-delà, la page de paiement est considérée comme abandonnée (même règle
// que l'agrandissement de formule).
const MINUTES_PAIEMENT = 20

// ============================================================
//  Acheter le livre d'or audio après coup, depuis le tableau de bord.
//
//  Pour l'organisateur qui ne l'a pas pris à la création. Un co-organisateur
//  peut le régler aussi, comme l'agrandissement de formule. Le même verrou
//  empêche de payer deux fois : un paiement réglé mais jamais appliqué est
//  rattrapé, un paiement encore ouvert bloque le second.
// ============================================================
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!paymentsLive()) {
    return Response.json({ error: t({ fr: "Le paiement n'est pas encore activé.", en: 'Payment is not enabled yet.', de: 'Die Zahlung ist noch nicht aktiviert.' }, langue) }, { status: 400 })
  }
  const ownerToken = request.headers.get('x-owner-token')
  const { eventId } = body
  if (!estUuid(eventId)) return identifiantInvalide(langue)

  const { data } = await selectRows('events', `id=eq.${eventId}&select=id,name,owner_email,livre_or_actif,livre_or_session,livre_or_session_at`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: erreur('introuvable', langue) }, { status: 404 })

  const membre = ownerToken ? await membrePar(eventId, ownerToken) : null
  if (!membre) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  if (ev.livre_or_actif) {
    return Response.json({ alreadyActive: true, message: t({ fr: 'Le livre d’or est déjà inclus dans votre soirée.', en: 'The guestbook is already included in your event.', de: 'Das Gästebuch ist in Ihrem Event bereits enthalten.' }, langue) })
  }

  const stripe = getStripe()

  // Un paiement précédent, réglé ou encore ouvert ?
  if (ev.livre_or_session) {
    let precedente = null
    try { precedente = await stripe.checkout.sessions.retrieve(ev.livre_or_session) } catch {}
    if (precedente?.payment_status === 'paid' && precedente.metadata?.kind === 'livre_or') {
      await activerLivreOrPaye(ev, precedente)
      return Response.json({ alreadyActive: true, message: t({ fr: 'Ce livre d’or avait déjà été réglé : il vient d’être activé.', en: 'This guestbook had already been paid for: it has just been turned on.', de: 'Dieses Gästebuch war bereits bezahlt: Es wurde soeben aktiviert.' }, langue) })
    }
    const depuis = ev.livre_or_session_at ? Date.now() - new Date(ev.livre_or_session_at).getTime() : Infinity
    if (precedente?.status === 'open' && depuis < MINUTES_PAIEMENT * 60 * 1000) {
      return Response.json({ error: t({
        fr: `Un paiement pour le livre d’or est déjà en cours, ouvert il y a moins de ${MINUTES_PAIEMENT} minutes. Attendez qu’il aboutisse : inutile de régler deux fois.`,
        en: `A payment for the guestbook is already in progress, started less than ${MINUTES_PAIEMENT} minutes ago. Wait for it to go through: there is no need to pay twice.`,
        de: `Eine Zahlung für das Gästebuch läuft bereits, gestartet vor weniger als ${MINUTES_PAIEMENT} Minuten. Warten Sie, bis sie abgeschlossen ist: Sie müssen nicht zweimal bezahlen.`,
      }, langue) }, { status: 409 })
    }
  }

  try {
    const base = siteUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: langue,
      customer_email: membre.email || ev.owner_email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: LIVRE_OR_CENTS,
          product_data: { name: t({
            fr: `Livre d'or audio, « ${ev.name} »`,
            en: `Audio guestbook, “${ev.name}”`,
            de: `Audio-Gästebuch, „${ev.name}“`,
          }, langue) },
        },
      }],
      success_url: `${base}/event/${ev.id}?livre_or_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/event/${ev.id}`,
      metadata: { kind: 'livre_or', event_id: String(ev.id) },
    })
    await updateRow('events', `id=eq.${ev.id}`, { livre_or_session: session.id, livre_or_session_at: new Date().toISOString() })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe livre d’or:', err)
    return Response.json({ error: t({ fr: 'Impossible de démarrer le paiement. Réessayez.', en: 'Payment could not be started. Please try again.', de: 'Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.' }, langue) }, { status: 502 })
  }
}
