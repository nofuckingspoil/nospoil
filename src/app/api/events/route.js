import { insertRow } from '../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../lib/mail'
import { normalizeEmail, isValidEmail, verifyAndConsumeCode } from '../../../lib/account'
import { EMAIL_VERIFICATION_ENABLED } from '../../../lib/pricing'

const DAY = 24 * 60 * 60 * 1000

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

  const shots = Math.min(50, Math.max(1, parseInt(shotsPerGuest, 10) || 10))
  const guests = Math.min(500, Math.max(5, parseInt(maxGuests, 10) || 5)) // palier choisi
  const expires = new Date(reveal.getTime() + 60 * DAY) // rétention : 60 jours après la révélation

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
