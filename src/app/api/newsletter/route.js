import { normalizeEmail, isValidEmail } from '../../../lib/account'

export const runtime = 'nodejs'

// D'où vient le contact, et dans quelle liste Brevo il atterrit. Séparer les
// deux compte : le lecteur du guide prépare un événement, l'abonné du blog
// passait par là : on ne leur écrira pas la même chose.
//
// Les identifiants correspondent aux listes créées dans le compte Brevo
// (CRM › Contacts › Listes). Une variable d'environnement peut les remplacer
// sans toucher au code, par exemple pour un compte de test.
const LISTES = {
  journal: Number(process.env.BREVO_LIST_JOURNAL) || 3, // « Time to Flash — Blog »
  guide: Number(process.env.BREVO_LIST_GUIDE) || 4,     // « Time to Flash — Guide »
}
const SOURCES = Object.keys(LISTES)

// Inscription à la newsletter du journal : ajoute/actualise le contact dans Brevo.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }
  const source = SOURCES.includes(body.source) ? body.source : 'journal'

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
        attributes: { SOURCE: source },
        // L'attribut SOURCE renseigne, la liste regroupe : c'est elle qui
        // permet d'écrire à tout le monde d'un coup, plus tard.
        listIds: [LISTES[source]],
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
