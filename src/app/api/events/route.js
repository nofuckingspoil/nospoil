import { after } from 'next/server'
import { insertRow } from '../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../lib/mail'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode, ensureAccount } from '../../../lib/account'
import { EMAIL_VERIFICATION_FREE, SHOTS_MIN, SHOTS_MAX, tierByGuests } from '../../../lib/pricing'
import { quotePromo, consumePromo } from '../../../lib/promo'
import { purgeDate } from '../../../lib/retention'
import { LEGAL_UPDATED } from '../../../lib/legal'
import { modeValide } from '../../../lib/photo-mode'
import { t, langueValide } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'
import { resumeAppareil } from '../../../lib/avis'

// D'où vient l'organisateur : retenu par son navigateur (lib/provenance.js).
function provenanceDe(p) {
  const court = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null
  if (!p || typeof p !== 'object') return {}
  return { prov_source: court(p.s, 80), prov_medium: court(p.m, 80), prov_campagne: court(p.c, 120), prov_page: court(p.p, 200) }
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { ownerToken, name, hostNames, revealAt, shotsPerGuest, maxGuests } = body
  const ownerEmail = normalizeEmail(body.ownerEmail)
  // La langue de l'organisateur : mémorisée sur l'événement pour tous ses mails.
  const langue = langueValide(body.langue) || langueRequete(request)

  if (!ownerToken) {
    return Response.json({ error: t({ fr: 'Appareil non identifié.', en: 'Device not identified.', de: 'Gerät nicht erkannt.' }, langue) }, { status: 400 })
  }
  if (!name || !name.trim()) {
    return Response.json({ error: t({ fr: "Donne un nom à ton événement.", en: 'Give your event a name.', de: 'Geben Sie Ihrem Event einen Namen.' }, langue) }, { status: 400 })
  }
  if (!isValidEmail(ownerEmail)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }
  // L'acceptation des CGV est exigée côté serveur aussi : sans elle, la case
  // cochée dans le navigateur ne prouverait rien.
  if (body.cgvAccepted !== true) {
    return Response.json({ error: t({ fr: 'Vous devez accepter les conditions générales.', en: 'You must accept the terms and conditions.', de: 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren.' }, langue) }, { status: 400 })
  }

  // Cette route crée sans passer par la caisse : personne d'autre ne vérifiera
  // l'adresse. On exige donc le code à 6 chiffres envoyé par mail, y compris
  // quand un code promo rend gratuite une formule normalement payante.
  // (Repasser EMAIL_VERIFICATION_FREE à false rouvre la création sans code.)
  if (EMAIL_VERIFICATION_FREE) {
    const check = await verifyAndConsumeCode(ownerEmail, body.code, 'connexion', langue)
    if (!check.ok) {
      return Response.json({ error: check.error }, { status: check.status })
    }
  }

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime())) {
    return Response.json({ error: t({ fr: 'Date de révélation invalide.', en: 'Invalid reveal date.', de: 'Ungültiger Präsentationstermin.' }, langue) }, { status: 400 })
  }
  if (reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: t({ fr: 'La date de révélation doit être dans le futur.', en: 'The reveal date must be in the future.', de: 'Der Präsentationstermin muss in der Zukunft liegen.' }, langue) }, { status: 400 })
  }

  const shots = Math.min(SHOTS_MAX, Math.max(SHOTS_MIN, parseInt(shotsPerGuest, 10) || 5)) // bornes annoncées dans les CGV (art. 4)
  const tier = tierByGuests(maxGuests)
  const guests = tier.maxGuests // palier choisi, ramené à un palier réel du tarif

  // Cette route crée un événement sans passer par la caisse. Elle ne doit donc
  // ouvrir une formule payante que sur présentation d'un code qui l'offre :
  // sans ce contrôle, il suffisait de demander 200 participants pour les obtenir.
  let promoCode = null
  let isTest = false
  if (tier.priceCents > 0) {
    if (!body.promo) {
      return Response.json({ error: t({ fr: 'Cette formule doit être réglée.', en: 'This plan must be paid for.', de: 'Dieses Paket muss bezahlt werden.' }, langue) }, { status: 402 })
    }
    const q = await quotePromo(body.promo, guests, langue)
    if (!q.ok || !q.free) {
      return Response.json({ error: q.ok ? t({ fr: 'Ce code ne rend pas cette formule gratuite.', en: 'This code does not make this plan free.', de: 'Mit diesem Code wird dieses Paket nicht kostenlos.' }, langue) : q.error }, { status: 402 })
    }
    // Décompté avant la création : deux demandes simultanées ne peuvent pas
    // dépasser le nombre d'utilisations prévu.
    if (!(await consumePromo(q.code, 0))) {
      return Response.json({ error: t({ fr: 'Ce code promo n’est plus disponible.', en: 'This promo code is no longer available.', de: 'Dieser Gutscheincode ist nicht mehr verfügbar.' }, langue) }, { status: 409 })
    }
    promoCode = q.code
    isTest = q.marksTest
  }

  const expires = purgeDate(reveal) // rétention : 6 mois après la révélation (CGV art. 8)

  // Date de la fête : pilote l'affichage du tableau de bord. À défaut, on
  // l'estime à la veille au soir de la révélation.
  const start = body.startsAt ? new Date(body.startsAt) : new Date(reveal.getTime() - 13 * 3600 * 1000)
  const debut = isNaN(start.getTime()) ? new Date(reveal.getTime() - 13 * 3600 * 1000) : start

  // Heure de fin : elle règle la cadence des rappels aux participants. Non
  // renseignée, elle sera estimée à la lecture (voir lib/rappels.js). Une fin
  // absurde (avant le début, après la révélation) est ignorée plutôt que
  // refusée : rien ici ne mérite de bloquer une création.
  const finBrute = body.endsAt ? new Date(body.endsAt) : null
  const fin = finBrute && !isNaN(finBrute.getTime())
    && finBrute.getTime() > debut.getTime()
    && finBrute.getTime() <= reveal.getTime()
    ? finBrute
    : null

  // Une adresse connue, c'est une personne : son compte existe dès maintenant.
  const compte = await ensureAccount(ownerEmail, null, { langue })

  const { ok, data } = await insertRow('events', {
    owner_token: ownerToken,
    owner_email: ownerEmail,
    owner_account_id: compte,
    name: name.trim().slice(0, 80),
    host_names: hostNames ? hostNames.trim().slice(0, 80) : null,
    shots_per_guest: shots,
    // Une valeur inconnue retombe sur « libre » : un mode photo mal transmis ne
    // doit pas priver les participants de leurs propres photos par surprise.
    photo_mode: modeValide(body.photoMode),
    max_guests: guests,
    starts_at: debut.toISOString(),
    ends_at: fin ? fin.toISOString() : null,
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
    cgv_accepted_at: new Date().toISOString(),
    withdrawal_waived_at: body.withdrawalWaived === true ? new Date().toISOString() : null,
    cgv_version: LEGAL_UPDATED,
    promo_code: promoCode,
    paid_cents: 0, // création sans paiement : formule gratuite, ou offerte par un code
    is_test: isTest,
    // Un code qui offre la formule offre aussi le livre d'or (codes
    // fondateur) ; une soirée de test l'a d'office.
    livre_or_actif: !!promoCode,
    livre_or_option: isTest ? 'test' : promoCode ? 'offert' : null,
    // Parcours court : réglages à faire juste après (voir /create/parametrer).
    reglages_etape: body.flow === 'nouveau' ? 'bravo' : null,
    ...provenanceDe(body.provenance),
    // iPhone, Android ou ordinateur, et le navigateur : rien de plus.
    appareil_orga: resumeAppareil(request.headers.get('user-agent')),
    langue,
  })

  if (!ok || !data?.id) {
    console.error('create event error:', data)
    return Response.json({ error: t({ fr: "Erreur lors de la création de l'événement.", en: 'Error while creating the event.', de: 'Fehler beim Erstellen des Events.' }, langue) }, { status: 500 })
  }

  // Mail d'accès organisateur : filet de sécurité si l'appareil ou le lien est perdu.
  // Un échec d'envoi ne doit pas empêcher la création de l'événement. Après la
  // réponse : l'organisateur attendait l'envoi avant de voir son tableau de bord.
  after(async () => { try {
    const base = siteUrl()
    const mail = eventCreatedEmail({
      langue,
      eventName: name.trim().slice(0, 80),
      ownerUrl: `${base}/event/${data.id}`,
      joinUrl: `${base}/j/${data.id}`,
      revealAt: reveal.toISOString(),
    })
    await sendMail({ to: ownerEmail, subject: mail.subject, html: mail.html })
  } catch (err) {
    console.error('mail création événement:', err)
  } })

  return Response.json({ id: data.id })
}
