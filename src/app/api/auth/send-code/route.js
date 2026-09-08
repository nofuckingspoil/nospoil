import { insertRow, updateRow, selectRows } from '../../../../lib/supabase'
import { sendMail, verifyEmail } from '../../../../lib/mail'
import { normalizeEmail, isValidEmail, makeCode, makeToken } from '../../../../lib/account'
import { ipDe, tropDeDemandes, MESSAGE_TROP } from '../../../../lib/rate-limit'

const FIFTEEN_MIN = 15 * 60 * 1000

// Envoie un code à 6 chiffres pour vérifier une adresse (utilisé à la création d'un événement).
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)

  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  // Plafond par machine : le garde-fou par adresse, juste en dessous, ne voit
  // pas celui qui arrose mille adresses différentes.
  if (await tropDeDemandes(ipDe(request), 'auth-send-code', { max: 20, minutes: 60 })) {
    return Response.json({ error: MESSAGE_TROP }, { status: 429 })
  }

  // Garde-fou anti-spam : pas plus d'un envoi toutes les 45 secondes par adresse.
  const recent = await selectRows(
    'login_codes',
    `email=eq.${encodeURIComponent(email)}&purpose=eq.connexion&order=created_at.desc&limit=1&select=created_at`
  )
  const last = Array.isArray(recent.data) ? recent.data[0] : null
  if (last && Date.now() - new Date(last.created_at).getTime() < 45 * 1000) {
    return Response.json(
      { error: 'Un code vient de vous être envoyé. Patientez une minute avant d\'en redemander un.' },
      { status: 429 }
    )
  }

  // Un seul code actif à la fois par adresse.
  await updateRow('login_codes', `email=eq.${encodeURIComponent(email)}&purpose=eq.connexion&used_at=is.null`, {
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
    return Response.json({ error: 'Impossible d\'envoyer le code. Réessayez.' }, { status: 500 })
  }

  const mail = verifyEmail({ code })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })
  if (!sent.ok) {
    return Response.json({ error: "L'envoi du mail a échoué. Réessayez dans un instant." }, { status: 502 })
  }

  return Response.json({ ok: true })
}
