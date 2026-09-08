// ============================================================
//  Demander le code qui confirmera la suppression d'un compte.
//
//  Il n'y a pas de mot de passe dans Time to Flash : l'identité se prouve par
//  l'adresse mail. Avant d'effacer quoi que ce soit, on envoie donc un code à
//  cette adresse. Sans lui, un téléphone prêté ou perdu suffirait à supprimer
//  le compte de quelqu'un d'autre.
//
//  On ne dit JAMAIS si l'adresse existe : répondre « compte inconnu » offrirait
//  à n'importe qui un moyen de savoir qui est client.
// ============================================================
import { insertRow, updateRow, selectRows } from '../../../../../lib/supabase'
import { sendMail, deleteAccountEmail } from '../../../../../lib/mail'
import { normalizeEmail, isValidEmail, makeCode, makeToken } from '../../../../../lib/account'
import { ipDe, tropDeDemandes, MESSAGE_TROP } from '../../../../../lib/rate-limit'

const QUINZE_MIN = 15 * 60 * 1000

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)

  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  // Deux garde-fous : par machine, puis par adresse. Le premier arrête celui
  // qui arrose mille adresses, le second celui qui s'acharne sur une seule.
  if (await tropDeDemandes(ipDe(request), 'account-delete-code', { max: 10, minutes: 60 })) {
    return Response.json({ error: MESSAGE_TROP }, { status: 429 })
  }

  // Le garde-fou ne regarde QUE les codes de suppression : demander un code
  // de connexion juste avant ne doit pas bloquer l'effacement de son compte.
  const recent = await selectRows(
    'login_codes',
    `email=eq.${encodeURIComponent(email)}&purpose=eq.suppression&order=created_at.desc&limit=1&select=created_at`
  )
  const dernier = Array.isArray(recent.data) ? recent.data[0] : null
  if (dernier && Date.now() - new Date(dernier.created_at).getTime() < 45 * 1000) {
    return Response.json(
      { error: 'Un code vient de vous être envoyé. Patientez une minute avant d\'en redemander un.' },
      { status: 429 }
    )
  }

  // Un seul code de suppression actif à la fois par adresse. On ne touche pas
  // aux codes de connexion en attente, qui ne regardent pas cette porte.
  await updateRow('login_codes', `email=eq.${encodeURIComponent(email)}&purpose=eq.suppression&used_at=is.null`, {
    used_at: new Date().toISOString(),
  })

  const code = makeCode()
  const { ok } = await insertRow('login_codes', {
    email,
    code,
    purpose: 'suppression',
    token: makeToken(),
    expires_at: new Date(Date.now() + QUINZE_MIN).toISOString(),
  })
  if (!ok) {
    return Response.json({ error: 'Impossible d\'envoyer le code. Réessayez.' }, { status: 500 })
  }

  const mail = deleteAccountEmail({ code })
  await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })

  // Toujours la même réponse, que l'adresse existe ou non.
  return Response.json({ ok: true })
}
