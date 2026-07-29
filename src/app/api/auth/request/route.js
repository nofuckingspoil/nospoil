import { insertRow, updateRow, selectRows } from '../../../../lib/supabase'
import { sendMail, loginEmail, siteUrl } from '../../../../lib/mail'
import { eventsForEmail, normalizeEmail, isValidEmail, makeCode, makeToken } from '../../../../lib/account'

const FIFTEEN_MIN = 15 * 60 * 1000

// Demande de connexion : on envoie un mail contenant un lien magique ET un code à 6 chiffres.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)

  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  const events = await eventsForEmail(email)
  if (!events.length) {
    return Response.json(
      { error: "Aucun événement n'est associé à cette adresse. Vérifiez le mail utilisé lors de la création." },
      { status: 404 }
    )
  }

  // Garde-fou anti-spam : pas plus d'un mail toutes les 45 secondes par adresse.
  const recent = await selectRows(
    'login_codes',
    `email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1&select=created_at`
  )
  const last = Array.isArray(recent.data) ? recent.data[0] : null
  if (last && Date.now() - new Date(last.created_at).getTime() < 45 * 1000) {
    return Response.json(
      { error: 'Un mail vient de vous être envoyé. Patientez une minute avant d\'en redemander un.' },
      { status: 429 }
    )
  }

  // Les demandes précédentes encore valables sont annulées : un seul code actif à la fois.
  await updateRow('login_codes', `email=eq.${encodeURIComponent(email)}&used_at=is.null`, {
    used_at: new Date().toISOString(),
  })

  const code = makeCode()
  const token = makeToken()
  const { ok } = await insertRow('login_codes', {
    email,
    code,
    token,
    expires_at: new Date(Date.now() + FIFTEEN_MIN).toISOString(),
  })
  if (!ok) {
    return Response.json({ error: 'Impossible de préparer la connexion. Réessayez.' }, { status: 500 })
  }

  const link = `${siteUrl()}/connexion?t=${token}`
  const mail = loginEmail({ code, link })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html })
  if (!sent.ok) {
    return Response.json({ error: "L'envoi du mail a échoué. Réessayez dans un instant." }, { status: 502 })
  }

  return Response.json({ ok: true })
}
