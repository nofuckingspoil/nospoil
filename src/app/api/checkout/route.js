import { getStripe, paymentsLive } from '../../../lib/stripe'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode } from '../../../lib/account'
import { tierByGuests, EMAIL_VERIFICATION_PAID, SHOTS_MIN, SHOTS_MAX } from '../../../lib/pricing'
import { modeValide } from '../../../lib/photo-mode'
import { siteUrl } from '../../../lib/mail'
import { LEGAL_UPDATED } from '../../../lib/legal'
import { quotePromo } from '../../../lib/promo'
import { t, langueValide } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'
import { lien } from '../../../lib/langue-lien'

export const runtime = 'nodejs'

// Crée une session de paiement Stripe pour une formule payante.
// L'événement n'est PAS encore créé : il le sera après confirmation du paiement.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  // La langue de l'organisateur : page de paiement Stripe, puis événement.
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!paymentsLive()) {
    return Response.json({ error: t({ fr: "Le paiement n'est pas encore activé.", en: 'Payment is not enabled yet.', de: 'Die Zahlung ist noch nicht aktiviert.' }, langue) }, { status: 400 })
  }
  const { ownerToken, name, hostNames, revealAt, shotsPerGuest, maxGuests } = body
  const ownerEmail = normalizeEmail(body.ownerEmail)

  if (!ownerToken) return Response.json({ error: t({ fr: 'Appareil non identifié.', en: 'Device not identified.', de: 'Gerät nicht erkannt.' }, langue) }, { status: 400 })
  if (!name || !name.trim()) return Response.json({ error: t({ fr: "Donne un nom à ton événement.", en: 'Give your event a name.', de: 'Geben Sie Ihrem Event einen Namen.' }, langue) }, { status: 400 })

  // L'adresse est facultative ici : Stripe la demande de toute façon pendant le
  // paiement, et on la récupère au retour. On l'exige seulement si elle doit
  // être vérifiée par code en amont, ou si elle a été fournie mais mal formée.
  if (EMAIL_VERIFICATION_PAID && !isValidEmail(ownerEmail)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }
  if (ownerEmail && !isValidEmail(ownerEmail)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime()) || reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: t({ fr: 'Date de révélation invalide.', en: 'Invalid reveal date.', de: 'Ungültiges Enthüllungsdatum.' }, langue) }, { status: 400 })
  }

  // Date de la fête : à défaut, estimée à la veille au soir de la révélation.
  const startRaw = body.startsAt ? new Date(body.startsAt) : null
  const startsAt = startRaw && !isNaN(startRaw.getTime()) ? startRaw : new Date(reveal.getTime() - 13 * 3600 * 1000)

  // Heure de fin de la fête : elle règle les rappels aux participants. Elle
  // voyage avec le paiement comme les autres dates, et n'est retenue que si
  // elle tient entre le début et la révélation.
  const endRaw = body.endsAt ? new Date(body.endsAt) : null
  const endsAt = endRaw && !isNaN(endRaw.getTime())
    && endRaw.getTime() > startsAt.getTime()
    && endRaw.getTime() <= reveal.getTime()
    ? endRaw
    : null

  const tier = tierByGuests(maxGuests)
  if (tier.priceCents <= 0) {
    return Response.json({ error: t({ fr: 'Cette formule est gratuite : aucun paiement nécessaire.', en: 'This plan is free: no payment needed.', de: 'Dieses Paket ist kostenlos: Keine Zahlung nötig.' }, langue) }, { status: 400 })
  }

  // Code promo : revérifié ici même si le navigateur l'a déjà fait vérifier.
  // Un prix annoncé par le client ne prouve rien.
  let promo = null
  if (body.promo) {
    const q = await quotePromo(body.promo, tier.maxGuests, langue)
    if (!q.ok) return Response.json({ error: q.error }, { status: 400 })
    // Plus rien à encaisser : ce n'est plus une vente, c'est une création
    // directe. Le navigateur doit passer par /api/events.
    if (q.free) return Response.json({ free: true, code: q.code, error: t({ fr: 'Ce code offre la formule : aucun paiement nécessaire.', en: 'This code makes the plan free: no payment needed.', de: 'Mit diesem Code ist das Paket geschenkt: Keine Zahlung nötig.' }, langue) }, { status: 400 })
    promo = q
  }

  // L'adresse doit être vérifiée (code à 6 chiffres) avant d'aller au paiement.
  // (Éteint par défaut : Stripe vérifie déjà l'adresse pendant le paiement.)
  if (EMAIL_VERIFICATION_PAID) {
    const check = await verifyAndConsumeCode(ownerEmail, body.code, 'connexion', langue)
    if (!check.ok) return Response.json({ error: check.error }, { status: check.status })
  }

  // Formule payante : l'acceptation des CGV ET la renonciation au droit de
  // rétractation sont exigées avant d'ouvrir le paiement (CGV art. 6 et 9.2).
  if (body.cgvAccepted !== true) {
    return Response.json({ error: t({ fr: 'Vous devez accepter les conditions générales.', en: 'You must accept the terms and conditions.', de: 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren.' }, langue) }, { status: 400 })
  }
  if (body.withdrawalWaived !== true) {
    return Response.json({ error: t({ fr: "Vous devez demander l'exécution immédiate du service.", en: 'You must request immediate performance of the service.', de: 'Sie müssen die sofortige Ausführung der Leistung verlangen.' }, langue) }, { status: 400 })
  }
  const consentAt = new Date().toISOString()

  // Variante du tunnel d'où vient la demande. Liste fermée : le client ne doit
  // pas pouvoir faire pointer l'annulation vers n'importe quelle adresse.
  const CANCEL_PATHS = { long: '/create', court: '/create/express', express: '/create/paiement-direct', nouveau: '/create' }
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
      // La page de paiement Stripe dans la langue de l'organisateur.
      locale: langue,
      discounts,
      // Sans adresse fournie, Stripe la demande lui-même sur sa page de paiement.
      customer_email: ownerEmail || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: { name: t({
            fr: `Time to Flash, « ${cleanName} » (jusqu'à ${tier.maxGuests} participants)`,
            en: `Time to Flash, “${cleanName}” (up to ${tier.maxGuests} guests)`,
            de: `Time to Flash, „${cleanName}“ (bis zu ${tier.maxGuests} Gäste)`,
          }, langue) },
        },
      }],
      success_url: `${base}/create/paiement?session_id={CHECKOUT_SESSION_ID}`,
      // Une annulation doit ramener sur la variante d'où l'on vient, sinon la
      // comparaison entre les tunnels est faussée.
      cancel_url: `${base}${lien(cancelPath, langue)}?tier=${tier.maxGuests}`,
      // Toutes les infos de l'événement voyagent avec le paiement : on crée l'événement au retour.
      metadata: {
        owner_token: String(ownerToken),
        owner_email: ownerEmail || '',
        name: cleanName,
        host_names: hostNames ? String(hostNames).trim().slice(0, 80) : '',
        shots_per_guest: String(shots),
        max_guests: String(tier.maxGuests),
        // Le mode photo voyage avec le paiement comme le reste : sans lui, un
        // événement payé retombait sur « album ouvert » alors que l'organisateur
        // avait choisi le vrai jetable.
        photo_mode: modeValide(body.photoMode),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt ? endsAt.toISOString() : '',
        reveal_at: reveal.toISOString(),
        // Preuve du consentement, horodatée par le serveur avant le paiement.
        cgv_accepted_at: consentAt,
        withdrawal_waived_at: consentAt,
        cgv_version: LEGAL_UPDATED,
        // Le code voyage avec le paiement : il ne sera décompté qu'au retour,
        // une fois l'événement réellement créé.
        promo_code: promo ? promo.code : '',
        // Parcours court : les réglages se font au retour du paiement.
        parcours: body.flow === 'nouveau' ? 'court' : '',
        // D'où vient l'organisateur (Stripe limite chaque valeur à 500 caractères).
        prov_source: String(body.provenance?.s || '').slice(0, 80),
        prov_medium: String(body.provenance?.m || '').slice(0, 80),
        prov_campagne: String(body.provenance?.c || '').slice(0, 120),
        prov_page: String(body.provenance?.p || '').slice(0, 200),
        is_test: promo && promo.marksTest ? '1' : '',
        // La langue de l'organisateur, mémorisée sur l'événement au retour.
        langue,
      },
    })
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('stripe checkout:', err)
    return Response.json({ error: t({ fr: 'Impossible de démarrer le paiement. Réessayez.', en: 'Payment could not be started. Please try again.', de: 'Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.' }, langue) }, { status: 502 })
  }
}
