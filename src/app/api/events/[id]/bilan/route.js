import { selectRows } from '../../../../../lib/supabase'
import { roleFor, canManage } from '../../../../../lib/authz'

export const runtime = 'nodejs'

// ============================================================
//  « La soirée en chiffres » — le bilan montré à l'organisateur
//  une fois l'album ouvert.
//
//  Réservé à l'organisateur : ces chiffres nomment des invités
//  (le plus prolifique, l'auteur de la dernière photo), ce qui
//  n'a rien à faire dans une page publique.
// ============================================================

const HEURES = ['minuit', '1 h', '2 h', '3 h', '4 h', '5 h', '6 h', '7 h', '8 h', '9 h', '10 h', '11 h',
  'midi', '13 h', '14 h', '15 h', '16 h', '17 h', '18 h', '19 h', '20 h', '21 h', '22 h', '23 h']

export async function GET(request, { params }) {
  const { id } = await params

  const role = await roleFor(id, request.headers.get('x-owner-token'))
  if (!canManage(role)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const { data } = await selectRows(
    'photos',
    `event_id=eq.${id}&select=taken_at,guest_id,guests(display_name)&order=taken_at.asc`
  )
  const photos = Array.isArray(data) ? data : []

  const invitesRes = await selectRows('guests', `event_id=eq.${id}&select=id`)
  const nbInvites = Array.isArray(invitesRes.data) ? invitesRes.data.length : 0

  // --- Le photographe de la soirée ---
  const parInvite = new Map()
  for (const p of photos) {
    if (!p.guest_id) continue
    const e = parInvite.get(p.guest_id) || { nom: p.guests?.display_name || 'Un invité', n: 0 }
    e.n++
    parInvite.set(p.guest_id, e)
  }
  let champion = null
  for (const e of parInvite.values()) if (!champion || e.n > champion.n) champion = e

  // --- L'heure de pointe ---
  // Une soirée déborde sur le lendemain : on compte par heure de la journée,
  // ce qui regroupe naturellement « 23 h » et « 1 h » là où ils se sont passés.
  const parHeure = new Array(24).fill(0)
  for (const p of photos) {
    const d = new Date(p.taken_at)
    if (!isNaN(d.getTime())) parHeure[d.getHours()]++
  }
  let heurePointe = null
  parHeure.forEach((n, h) => { if (n > 0 && (!heurePointe || n > heurePointe.n)) heurePointe = { h, n } })

  // --- La dernière photo de la nuit ---
  const derniere = photos.length ? photos[photos.length - 1] : null

  // --- Qui a emporté l'album ---
  const dlRes = await selectRows('downloads', `event_id=eq.${id}&select=device_token,photo_count`)
  const dls = Array.isArray(dlRes.data) ? dlRes.data : []
  // Une même personne qui télécharge trois fois reste une personne.
  const personnes = new Set(dls.map((d) => d.device_token).filter(Boolean)).size
  const photosEmportees = dls.reduce((t, d) => t + (d.photo_count || 0), 0)

  return Response.json({
    photoCount: photos.length,
    guestCount: nbInvites,
    // Nombre d'invités ayant réellement déclenché, souvent plus parlant que le
    // nombre de connectés : c'est le nombre de gens qui ont joué le jeu.
    photographes: parInvite.size,
    champion: champion && champion.n > 0 ? { nom: champion.nom, photos: champion.n } : null,
    heurePointe: heurePointe ? { libelle: HEURES[heurePointe.h], photos: heurePointe.n } : null,
    derniere: derniere
      ? { nom: derniere.guests?.display_name || 'Un invité', at: derniere.taken_at }
      : null,
    // Absents tant que personne n'a téléchargé : mieux vaut taire une ligne
    // qu'annoncer un zéro à quelqu'un qui vient de réussir sa soirée.
    telechargements: personnes > 0 ? { personnes, photos: photosEmportees } : null,
  })
}
