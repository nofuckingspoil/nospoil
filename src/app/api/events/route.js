import { insertRow } from '../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../lib/mail'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode, ensureAccount } from '../../../lib/account'
import { EMAIL_VERIFICATION_ENABLED, SHOTS_MIN, SHOTS_MAX, tierByGuests } from '../../../lib/pricing'
import { quotePromo, consumePromo } from '../../../lib/promo'
import { purgeDate } from '../../../lib/retention'
import { LEGAL_UPDATED } from '../../../lib/legal'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { ownerToken, name, hostNames, revealAt, shotsPerGuest, maxGuests } = body
  const ownerEmail = normalizeEmail(body.ownerEmail)

  if (!ownerToken) {
    return Response.json({ error: 'Appareil non identifié.' }, { status: 400 })
  }
  if (!name || !name.trim()) {
    return Response.json({ error: "Donne un nom à ton événement." }, { status: 400 })
  }
  if (!isValidEmail(ownerEmail)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }
  // L'acceptation des CGV est exigée côté serveur aussi : sans elle, la case
  // cochée dans le navigateur ne prouverait rien.
  if (body.cgvAccepted !== true) {
    return Response.json({ error: 'Vous devez accepter les conditions générales.' }, { status: 400 })
  }

  // L'adresse doit être vérifiée : on exige le code à 6 chiffres envoyé par mail.
  // (Désactivable via EMAIL_VERIFICATION_ENABLED tant que l'envoi d'e-mails n'est pas fiable.)
  if (EMAIL_VERIFICATION_ENABLED) {
    const check = await verifyAndConsumeCode(ownerEmail, body.code)
    if (!check.ok) {
      return Response.json({ error: check.error }, { status: check.status })
    }
  }

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime())) {
    return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
  }
  if (reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: 'La date de révélation doit être dans le futur.' }, { status: 400 })
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
      return Response.json({ error: 'Cette formule doit être réglée.' }, { status: 402 })
    }
    const q = await quotePromo(body.promo, guests)
    if (!q.ok || !q.free) {
      return Response.json({ error: q.ok ? 'Ce code ne rend pas cette formule gratuite.' : q.error }, { status: 402 })
    }
    // Décompté avant la création : deux demandes simultanées ne peuvent pas
    // dépasser le nombre d'utilisations prévu.
    if (!(await consumePromo(q.code, 0))) {
      return Response.json({ error: 'Ce code promo n’est plus disponible.' }, { status: 409 })
    }
    promoCode = q.code
    isTest = q.marksTest
  }

  const expires = purgeDate(reveal) // rétention : 6 mois après la révélation (CGV art. 8)

  // Date de la fête : pilote l'affichage du tableau de bord. À défaut, on
  // l'estime à la veille au soir de la révélation.
  const start = body.startsAt ? new Date(body.startsAt) : new Date(reveal.getTime() - 13 * 3600 * 1000)

  // Une adresse connue, c'est une personne : son compte existe dès maintenant.
  const compte = await ensureAccount(ownerEmail)

  const { ok, data } = await insertRow('events', {
    owner_token: ownerToken,
    owner_email: ownerEmail,
    owner_account_id: compte,
    name: name.trim().slice(0, 80),
    host_names: hostNames ? hostNames.trim().slice(0, 80) : null,
    shots_per_guest: shots,
    max_guests: guests,
    starts_at: (isNaN(start.getTime()) ? new Date(reveal.getTime() - 13 * 3600 * 1000) : start).toISOString(),
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
    cgv_accepted_at: new Date().toISOString(),
    withdrawal_waived_at: body.withdrawalWaived === true ? new Date().toISOString() : null,
    cgv_version: LEGAL_UPDATED,
    promo_code: promoCode,
    paid_cents: 0, // création sans paiement : formule gratuite, ou offerte par un code
    is_test: isTest,
  })

  if (!ok || !data?.id) {
    console.error('create event error:', data)
    return Response.json({ error: "Erreur lors de la création de l'événement." }, { status: 500 })
  }

  // Mail d'accès organisateur : filet de sécurité si l'appareil ou le lien est perdu.
  // Un échec d'envoi ne doit pas empêcher la création de l'événement.
  try {
    const base = siteUrl()
    const mail = eventCreatedEmail({
      eventName: name.trim().slice(0, 80),
      ownerUrl: `${base}/event/${data.id}?k=${ownerToken}`,
      joinUrl: `${base}/j/${data.id}`,
      revealAt: reveal.toISOString(),
    })
    await sendMail({ to: ownerEmail, subject: mail.subject, html: mail.html })
  } catch (err) {
    console.error('mail création événement:', err)
  }

  return Response.json({ id: data.id })
}
