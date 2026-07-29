import { selectRows, updateRow } from '../../../../lib/supabase'
import { eventsForEmail, normalizeEmail, isValidEmail } from '../../../../lib/account'

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

  let row = null

  if (token) {
    const { data } = await selectRows('login_codes', `token=eq.${encodeURIComponent(token)}&select=*`)
    row = Array.isArray(data) ? data[0] : null
    if (expired(row)) {
      return Response.json({ error: 'Ce lien a expiré. Demandez-en un nouveau.' }, { status: 401 })
    }
  } else {
    if (!isValidEmail(email) || code.length !== 6) {
      return Response.json({ error: 'Mail ou code manquant.' }, { status: 400 })
    }
    const { data } = await selectRows(
      'login_codes',
      `email=eq.${encodeURIComponent(email)}&used_at=is.null&order=created_at.desc&limit=1&select=*`
    )
    row = Array.isArray(data) ? data[0] : null
    if (expired(row)) {
      return Response.json({ error: 'Ce code a expiré. Demandez-en un nouveau.' }, { status: 401 })
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
      return Response.json({ error: 'Trop de tentatives. Demandez un nouveau code.' }, { status: 429 })
    }
    if (row.code !== code) {
      await updateRow('login_codes', `id=eq.${row.id}`, { attempts: row.attempts + 1 })
      return Response.json({ error: 'Code incorrect.' }, { status: 401 })
    }
  }

  // Code/lien valide : on le consomme et on renvoie les accès aux événements.
  await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
  const events = await eventsForEmail(row.email)

  return Response.json({ email: row.email, events })
}
