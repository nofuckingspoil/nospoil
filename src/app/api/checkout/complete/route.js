import { getStripe } from '../../../../lib/stripe'
import { insertRow, selectRows } from '../../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../../lib/mail'

const DAY = 24 * 60 * 60 * 1000
export const runtime = 'nodejs'

// Confirme un paiement Stripe et crée l'événement. Idempotent : rappelable sans
// risque de créer deux fois le même événement (page rechargée, etc.).
export async function POST(request) {
  const stripe = getStripe()
  if (!stripe) return Response.json({ error: 'Paiement indisponible.' }, { status: 400 })

  const { sessionId } = await request.json().catch(() => ({}))
  if (!sessionId) return Response.json({ error: 'Session manquante.' }, { status: 400 })

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return Response.json({ error: 'Session de paiement introuvable.' }, { status: 404 })
  }
  if (!session || session.payment_status !== 'paid') {
    return Response.json({ error: "Le paiement n'a pas été confirmé." }, { status: 402 })
  }

  // Déjà créé pour ce paiement ? On renvoie l'événement existant.
  const existing = await selectRows(
    'events',
    `stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,owner_token`
  )
  const found = Array.isArray(existing.data) ? existing.data[0] : null
  if (found) return Response.json({ id: found.id, ownerToken: found.owner_token })

  const m = session.metadata || {}
  const reveal = new Date(m.reveal_at)
  const expires = new Date(reveal.getTime() + 60 * DAY)

  const { ok, data } = await insertRow('events', {
    owner_token: m.owner_token,
    owner_email: m.owner_email,
    name: m.name,
    host_names: m.host_names || null,
    shots_per_guest: parseInt(m.shots_per_guest, 10) || 10,
    max_guests: parseInt(m.max_guests, 10) || 5,
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
    stripe_session_id: sessionId,
  })
  if (!ok || !data?.id) {
    console.error('create paid event error:', data)
    return Response.json({ error: "Erreur lors de la création de l'événement." }, { status: 500 })
  }

  // Mail d'accès organisateur (filet de sécurité).
  try {
    const base = siteUrl()
    const mail = eventCreatedEmail({
      eventName: m.name,
      ownerUrl: `${base}/event/${data.id}?k=${m.owner_token}`,
      joinUrl: `${base}/j/${data.id}`,
      revealAt: reveal.toISOString(),
    })
    await sendMail({ to: m.owner_email, subject: mail.subject, html: mail.html })
  } catch (err) {
    console.error('mail création événement payant:', err)
  }

  return Response.json({ id: data.id, ownerToken: m.owner_token })
}
