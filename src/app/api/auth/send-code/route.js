import { insertRow, updateRow, selectRows } from '../../../../lib/supabase'
import { sendMail, verifyEmail } from '../../../../lib/mail'
import { normalizeEmail, isValidEmail, makeCode, makeToken } from '../../../../lib/account'
import { ipDe, tropDeDemandes, messageTrop } from '../../../../lib/rate-limit'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

const FIFTEEN_MIN = 15 * 60 * 1000

// Envoie un code à 6 chiffres pour vérifier une adresse (utilisé à la création d'un événement).
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  const langue = langueValide(body.langue) || langueRequete(request)

  if (!isValidEmail(email)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }

  // Plafond par machine : le garde-fou par adresse, juste en dessous, ne voit
  // pas celui qui arrose mille adresses différentes.
  if (await tropDeDemandes(ipDe(request), 'auth-send-code', { max: 20, minutes: 60 })) {
    return Response.json({ error: messageTrop(langue) }, { status: 429 })
  }

  // Garde-fou anti-spam : pas plus d'un envoi toutes les 45 secondes par adresse.
  const recent = await selectRows(
    'login_codes',
    `email=eq.${encodeURIComponent(email)}&purpose=eq.connexion&order=created_at.desc&limit=1&select=created_at`
  )
  const last = Array.isArray(recent.data) ? recent.data[0] : null
  if (last && Date.now() - new Date(last.created_at).getTime() < 45 * 1000) {
    return Response.json(
      { error: t({
        fr: 'Un code vient de vous être envoyé. Patientez une minute avant d\'en redemander un.',
        en: 'A code has just been sent to you. Please wait a minute before asking for another one.',
        de: 'Ihnen wurde gerade ein Code geschickt. Bitte warten Sie eine Minute, bevor Sie einen neuen anfordern.',
      }, langue) },
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
    return Response.json({ error: t({ fr: 'Impossible d\'envoyer le code. Réessayez.', en: 'The code could not be sent. Please try again.', de: 'Der Code konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' }, langue) }, { status: 500 })
  }

  const mail = verifyEmail({ code, langue })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })
  if (!sent.ok) {
    return Response.json({ error: t({ fr: "L'envoi du mail a échoué. Réessayez dans un instant.", en: 'The email could not be sent. Please try again in a moment.', de: 'Die E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es gleich noch einmal.' }, langue) }, { status: 502 })
  }

  return Response.json({ ok: true })
}
