import { selectRows } from '../../../../lib/supabase'

// Tableau de bord admin : tous les événements + compteurs.
// Protégé par la clé secrète ADMIN_KEY (en-tête x-admin-key).
export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  }

  const { ok, data } = await selectRows(
    'events',
    'select=id,name,host_names,created_at,reveal_at,status,max_guests,guests(count),photos(count)&order=created_at.desc'
  )
  if (!ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  const events = (Array.isArray(data) ? data : []).map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    createdAt: e.created_at,
    revealAt: e.reveal_at,
    status: e.status,
    maxGuests: e.max_guests,
    revealed: new Date(e.reveal_at).getTime() <= Date.now(),
    guestCount: e.guests?.[0]?.count ?? 0,
    photoCount: e.photos?.[0]?.count ?? 0,
  }))

  return Response.json({ events })
}
