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
    'select=id,name,host_names,owner_email,owner_token,cover_url,created_at,reveal_at,status,max_guests,download_count,promo_code,paid_cents,is_test,guests(count),photos(count)' +
      // Les essais du site ne sont pas des événements : ils encombreraient la
      // liste sans rien apprendre, et s'effacent d'eux-mêmes le lendemain.
      '&is_demo=is.false&order=created_at.desc'
  )
  if (!ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  const rows = Array.isArray(data) ? data : []

  // Numéros collectés (participants ayant laissé un téléphone), comptés par événement
  const contactsRes = await selectRows('guests', 'phone=not.is.null&select=event_id')
  const contactsByEvent = {}
  for (const g of Array.isArray(contactsRes.data) ? contactsRes.data : []) {
    contactsByEvent[g.event_id] = (contactsByEvent[g.event_id] || 0) + 1
  }

  // Avis reçus, comptés par événement. On remonte trois choses seulement : le
  // nombre, la note moyenne et l'existence d'un problème signalé, parce que
  // c'est tout ce qu'une ligne de tableau peut dire d'utile : le reste se lit
  // sur la page des avis, à un clic de là.
  const avisRes = await selectRows('feedback', 'select=event_id,rating,issues')
  const avisParEvent = {}
  for (const a of Array.isArray(avisRes.data) ? avisRes.data : []) {
    if (!a.event_id) continue // avis détaché : son événement a été supprimé
    const acc = (avisParEvent[a.event_id] ||= { n: 0, somme: 0, notes: 0, soucis: 0 })
    acc.n++
    if (Number.isFinite(a.rating)) { acc.somme += a.rating; acc.notes++ }
    if ((a.issues || []).some((i) => i !== 'ok')) acc.soucis++
  }

  // Miniatures de couverture : URLs signées temporaires (le bucket est privé)
  const covers = rows.map((e) => e.cover_url).filter(Boolean)
  const signedCovers = covers.length ? await signPhotos(covers, 3600) : {}

  const events = rows.map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    ownerEmail: e.owner_email || null,
    // Le jeton privé de l'organisateur : il ouvre son tableau de bord tel qu'il
    // le voit. Réservé à cette réponse, elle-même derrière la clé admin.
    ownerToken: e.owner_token || null,
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
    promoCode: e.promo_code || null,
    isTest: !!e.is_test,
    // Null pour les événements créés avant l'enregistrement du montant :
    // le tableau de bord retombe alors sur le prix du palier.
    paidCents: e.paid_cents,
    avisCount: avisParEvent[e.id]?.n || 0,
    avisMoyenne: avisParEvent[e.id]?.notes
      ? avisParEvent[e.id].somme / avisParEvent[e.id].notes
      : null,
    avisSoucis: avisParEvent[e.id]?.soucis || 0,
  }))

  return Response.json({ events })
}
