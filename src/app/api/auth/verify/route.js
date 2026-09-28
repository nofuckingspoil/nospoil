import { selectRows, updateRow } from '../../../../lib/supabase'
import { eventsForEmail, normalizeEmail, isValidEmail } from '../../../../lib/account'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

const MAX_ATTEMPTS = 6

function expired(row) {
  return !row || row.used_at || new Date(row.expires_at).getTime() < Date.now()
}

// Vérifie soit le lien magique (token), soit le code à 6 chiffres (mail + code).
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const token = (body.token || '').toString().trim()
  const email = normalizeEmail(body.email)
  const code = (body.code || '').toString().replace(/\D/g, '')
  const langue = langueValide(body.langue) || langueRequete(request)

  let row = null

  if (token) {
    const { data } = await selectRows('login_codes', `token=eq.${encodeURIComponent(token)}&select=*`)
    row = Array.isArray(data) ? data[0] : null
    if (expired(row)) {
      return Response.json({ error: t({ fr: 'Ce lien a expiré. Demandez-en un nouveau.', en: 'This link has expired. Request a new one.', de: 'Dieser Link ist abgelaufen. Fordern Sie einen neuen an.' }, langue) }, { status: 401 })
    }
  } else {
    if (!isValidEmail(email) || code.length !== 6) {
      return Response.json({ error: t({ fr: 'Mail ou code manquant.', en: 'Email or code missing.', de: 'E-Mail oder Code fehlt.' }, langue) }, { status: 400 })
    }
    const { data } = await selectRows(
      'login_codes',
      `email=eq.${encodeURIComponent(email)}&used_at=is.null&order=created_at.desc&limit=1&select=*`
    )
    row = Array.isArray(data) ? data[0] : null
    if (expired(row)) {
      return Response.json({ error: t({ fr: 'Ce code a expiré. Demandez-en un nouveau.', en: 'This code has expired. Request a new one.', de: 'Dieser Code ist abgelaufen. Fordern Sie einen neuen an.' }, langue) }, { status: 401 })
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
      return Response.json({ error: t({ fr: 'Trop de tentatives. Demandez un nouveau code.', en: 'Too many attempts. Request a new code.', de: 'Zu viele Versuche. Fordern Sie einen neuen Code an.' }, langue) }, { status: 429 })
    }
    if (row.code !== code) {
      await updateRow('login_codes', `id=eq.${row.id}`, { attempts: row.attempts + 1 })
      return Response.json({ error: t({ fr: 'Code incorrect.', en: 'Incorrect code.', de: 'Falscher Code.' }, langue) }, { status: 401 })
    }
  }

  // Code/lien valide : on le consomme et on renvoie les accès aux événements.
  await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
  // La connexion mémorise la langue du compte (mails envoyés plus tard).
  const events = await eventsForEmail(row.email, langue)

  return Response.json({ email: row.email, events })
}
