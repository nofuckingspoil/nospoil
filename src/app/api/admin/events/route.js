import { selectRows, signPhotos } from '../../../../lib/supabase'

export const runtime = 'nodejs'

// Tableau de bord admin : tous les événements + compteurs.
// Protégé par la clé secrète ADMIN_KEY (en-tête x-admin-key).
export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  }

  const { ok, data } = await selectRows(
    'events',
    'select=id,name,host_names,cover_url,created_at,reveal_at,status,max_guests,download_count,guests(count),photos(count)&order=created_at.desc'
  )
  if (!ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  const rows = Array.isArray(data) ? data : []

  // Numéros collectés (invités ayant laissé un téléphone), comptés par événement
  const contactsRes = await selectRows('guests', 'phone=not.is.null&select=event_id')
  const contactsByEvent = {}
  for (const g of Array.isArray(contactsRes.data) ? contactsRes.data : []) {
    contactsByEvent[g.event_id] = (contactsByEvent[g.event_id] || 0) + 1
  }

  // Miniatures de couverture : URLs signées temporaires (le bucket est privé)
  const covers = rows.map((e) => e.cover_url).filter(Boolean)
  const signedCovers = covers.length ? await signPhotos(covers, 3600) : {}

  const events = rows.map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    coverUrl: e.cover_url ? signedCovers[e.cover_url] || null : null,
    createdAt: e.created_at,
    revealAt: e.reveal_at,
    status: e.status,
    maxGuests: e.max_guests,
    revealed: new Date(e.reveal_at).getTime() <= Date.now(),
    guestCount: e.guests?.[0]?.count ?? 0,
    photoCount: e.photos?.[0]?.count ?? 0,
    downloadCount: e.download_count || 0,
    contactsCount: contactsByEvent[e.id] || 0,
  }))

  return Response.json({ events })
}
