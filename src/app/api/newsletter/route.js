import { normalizeEmail, isValidEmail } from '../../../lib/account'

export const runtime = 'nodejs'

// Inscription à la newsletter du journal : ajoute/actualise le contact dans Brevo.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  const key = process.env.BREVO_API_KEY
  if (!key) {
    // Pas de config Brevo : on ne bloque pas l'utilisateur, on log seulement.
    console.error('newsletter: BREVO_API_KEY manquante')
    return Response.json({ ok: true })
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        updateEnabled: true,
        attributes: { SOURCE: 'journal' },
      }),
      cache: 'no-store',
    })
    // 201 = créé, 204 = mis à jour. Un doublon renvoie parfois 400 "already exists" → on l'accepte.
    if (res.status >= 300 && res.status !== 400) {
      const detail = await res.text().catch(() => '')
      console.error('newsletter: échec Brevo', res.status, detail)
      return Response.json({ error: "L'inscription a échoué. Réessaie." }, { status: 502 })
    }
    return Response.json({ ok: true })
  } catch (err) {
    console.error('newsletter: erreur réseau', err)
    return Response.json({ error: 'Réseau indisponible. Réessaie.' }, { status: 502 })
  }
}
