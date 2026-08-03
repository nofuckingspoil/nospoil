import { getStripe } from '../../../../lib/stripe'
import { insertRow, selectRows } from '../../../../lib/supabase'
import { sendMail, eventCreatedEmail, siteUrl } from '../../../../lib/mail'
import { purgeDate } from '../../../../lib/retention'

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
    `stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,owner_token,owner_email`
  )
  const found = Array.isArray(existing.data) ? existing.data[0] : null
  if (found) {
    return Response.json({ id: found.id, ownerToken: found.owner_token, ownerEmail: found.owner_email || null })
  }

  const m = session.metadata || {}

  // L'adresse vient soit de l'assistant (formule gratuite, vérification par code),
  // soit de la page de paiement Stripe : on ne la fait plus saisir deux fois.
  const ownerEmail = m.owner_email || session.customer_details?.email || session.customer_email || null
  // Stripe recueille déjà le nom porté par le moyen de paiement : autant le
  // reprendre plutôt que d'ajouter un champ au tunnel. Absent sur les formules
  // gratuites, qui ne passent pas par le paiement.
  const ownerName = (session.customer_details?.name || '').trim() || null
  const reveal = new Date(m.reveal_at)
  const expires = purgeDate(reveal) // rétention : 6 mois après la révélation (CGV art. 8)
  // Date de la fête (événements payés avant l'ajout du champ : on l'estime).
  const start = m.starts_at ? new Date(m.starts_at) : new Date(reveal.getTime() - 13 * 3600 * 1000)

  const { ok, data } = await insertRow('events', {
    owner_token: m.owner_token,
    owner_email: ownerEmail,
    owner_name: ownerName,
    name: m.name,
    host_names: m.host_names || null,
    shots_per_guest: parseInt(m.shots_per_guest, 10) || 10,
    max_guests: parseInt(m.max_guests, 10) || 5,
    starts_at: (isNaN(start.getTime()) ? new Date(reveal.getTime() - 13 * 3600 * 1000) : start).toISOString(),
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
    stripe_session_id: sessionId,
    // Preuve du consentement recueillie avant le paiement (voir /api/checkout).
    cgv_accepted_at: m.cgv_accepted_at || null,
    withdrawal_waived_at: m.withdrawal_waived_at || null,
    cgv_version: m.cgv_version || null,
  })
  if (!ok || !data?.id) {
    console.error('create paid event error:', data)
    return Response.json({ error: "Erreur lors de la création de l'événement." }, { status: 500 })
  }

  // Mail d'accès organisateur (filet de sécurité).
  if (ownerEmail) {
    try {
      const base = siteUrl()
      const mail = eventCreatedEmail({
        eventName: m.name,
        ownerUrl: `${base}/event/${data.id}?k=${m.owner_token}`,
        joinUrl: `${base}/j/${data.id}`,
        revealAt: reveal.toISOString(),
      })
      await sendMail({ to: ownerEmail, subject: mail.subject, html: mail.html })
    } catch (err) {
      console.error('mail création événement payant:', err)
    }
  }

  return Response.json({ id: data.id, ownerToken: m.owner_token, ownerEmail })
}
