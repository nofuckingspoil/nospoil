import { selectRows } from '../../../../../lib/supabase'

// Connexion d'un admin : mail + code → renvoie le jeton organisateur de l'événement.
// L'admin est alors reconnu exactement comme l'organisateur (mêmes pouvoirs).
export async function POST(request, { params }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').toString().trim().toLowerCase()
  const code = (body.code || '').toString().trim()

  if (!email || !code) {
    return Response.json({ error: 'Mail et code requis.' }, { status: 400 })
  }

  const { data } = await selectRows(
    'event_admins',
    `event_id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=code`
  )
  const admin = Array.isArray(data) ? data[0] : null
  if (!admin || admin.code !== code) {
    return Response.json({ error: 'Mail ou code incorrect.' }, { status: 401 })
  }

  const ev = await selectRows('events', `id=eq.${id}&select=owner_token`)
  const owner = Array.isArray(ev.data) ? ev.data[0] : null
  if (!owner?.owner_token) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }

  return Response.json({ ownerToken: owner.owner_token })
}
