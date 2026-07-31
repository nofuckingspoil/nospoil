import { insertRow } from '../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../lib/mail'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode } from '../../../lib/account'
import { EMAIL_VERIFICATION_ENABLED, SHOTS_MIN, SHOTS_MAX } from '../../../lib/pricing'
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
  const guests = Math.min(500, Math.max(5, parseInt(maxGuests, 10) || 5)) // palier choisi
  const expires = purgeDate(reveal) // rétention : 6 mois après la révélation (CGV art. 8)

  const { ok, data } = await insertRow('events', {
    owner_token: ownerToken,
    owner_email: ownerEmail,
    name: name.trim().slice(0, 80),
    host_names: hostNames ? hostNames.trim().slice(0, 80) : null,
    shots_per_guest: shots,
    max_guests: guests,
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
    cgv_accepted_at: new Date().toISOString(),
    withdrawal_waived_at: body.withdrawalWaived === true ? new Date().toISOString() : null,
    cgv_version: LEGAL_UPDATED,
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
