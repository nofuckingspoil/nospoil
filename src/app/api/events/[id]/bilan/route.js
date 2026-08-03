import { selectRows, signPhotos } from '../../../../../lib/supabase'
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

// « vers 18 h » laissait croire à un instant : c'est une tranche entière.
function creneau(h) {
  return `entre ${HEURES[h]} et ${HEURES[(h + 1) % 24]}`
}

function heureCourte(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
}

// Durée en clair : « 6 h 53 », « 48 min ».
function duree(msA, msB) {
  const min = Math.round((msB - msA) / 60000)
  if (min < 1) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const reste = min % 60
  return reste ? `${h} h ${String(reste).padStart(2, '0')}` : `${h} h`
}

export async function GET(request, { params }) {
  const { id } = await params

  const role = await roleFor(id, request.headers.get('x-owner-token'))
  if (!canManage(role)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const { data } = await selectRows(
    'photos',
    `event_id=eq.${id}&select=id,taken_at,guest_id,storage_path,thumb_path,hidden,guests(display_name)&order=taken_at.asc`
  )
  // Une photo masquée par l'organisateur n'est plus dans l'album : elle n'a à
  // peser sur aucun chiffre du bilan, pas même le total.
  const photos = (Array.isArray(data) ? data : []).filter((p) => !p.hidden)

  const invitesRes = await selectRows('guests', `event_id=eq.${id}&select=id`)
  const nbInvites = Array.isArray(invitesRes.data) ? invitesRes.data.length : 0

  // --- Le photographe de la soirée ---
  // À égalité, on départage par la rapidité : celui qui a sorti son quota le
  // plus vite. Deux ex æquo sans vainqueur, ça ne se raconte pas.
  const parInvite = new Map()
  for (const p of photos) {
    if (!p.guest_id) continue
    const t = new Date(p.taken_at).getTime()
    const e = parInvite.get(p.guest_id) || { nom: p.guests?.display_name || 'Un invité', n: 0, debut: t, fin: t }
    e.n++
    if (t < e.debut) e.debut = t
    if (t > e.fin) e.fin = t
    parInvite.set(p.guest_id, e)
  }
  const classement = [...parInvite.values()].sort((a, b) => (b.n - a.n) || ((a.fin - a.debut) - (b.fin - b.debut)))
  const premierDuClassement = classement[0] || null
  const exAequo = !!premierDuClassement && classement.filter((e) => e.n === premierDuClassement.n).length > 1
  const champion = premierDuClassement && premierDuClassement.n > 0
    ? {
        nom: premierDuClassement.nom,
        photos: premierDuClassement.n,
        // Le temps qu'il lui a fallu : ce qui l'a départagé, et ce qui se raconte.
        rapidite: exAequo ? duree(premierDuClassement.debut, premierDuClassement.fin) : null,
      }
    : null

  // --- Le créneau le plus chargé ---
  // Une soirée déborde sur le lendemain : on compte par heure de la journée,
  // ce qui regroupe naturellement « 23 h » et « 1 h » là où ils se sont passés.
  const parHeure = new Array(24).fill(0)
  for (const p of photos) {
    const d = new Date(p.taken_at)
    if (!isNaN(d.getTime())) parHeure[d.getHours()]++
  }
  let pointe = null
  parHeure.forEach((n, h) => { if (n > 0 && (!pointe || n > pointe.n)) pointe = { h, n } })
  const heurePointe = pointe ? { libelle: creneau(pointe.h), photos: pointe.n } : null

  // --- Qui a ouvert le bal, qui a fermé la marche ---
  // « la dernière photo de la nuit » supposait une fête nocturne : un
  // anniversaire d'enfant à 16 h se serait senti moqué.
  const premierClic = photos[0] || null
  const dernierClic = photos.length > 1 ? photos[photos.length - 1] : null

  // Les deux bornes de la soirée, en images : une vignette vaut mieux qu'une heure.
  const aSigner = []
  for (const p of [premierClic, dernierClic]) {
    if (p) aSigner.push(p.thumb_path || p.storage_path)
  }
  const signees = aSigner.length ? await signPhotos(aSigner, 3600) : {}
  const vignette = (p) => (p ? signees[p.thumb_path || p.storage_path] || null : null)
  const dureeFete = premierClic && dernierClic
    ? duree(new Date(premierClic.taken_at).getTime(), new Date(dernierClic.taken_at).getTime())
    : null

  // --- La photo de la soirée ---
  // À égalité de cœurs, gagne celle qui les a rassemblés le plus vite : la même
  // règle que pour le photographe, et ça se raconte mieux qu'un ex æquo.
  const favRes = await selectRows('favorites', `event_id=eq.${id}&select=photo_id,created_at`)
  const parPhoto = new Map()
  for (const f of Array.isArray(favRes.data) ? favRes.data : []) {
    const t = new Date(f.created_at).getTime()
    const e = parPhoto.get(f.photo_id) || { n: 0, debut: t, fin: t }
    e.n++
    if (t < e.debut) e.debut = t
    if (t > e.fin) e.fin = t
    parPhoto.set(f.photo_id, e)
  }
  let favorite = null
  for (const p of photos) {
    const s = parPhoto.get(p.id)
    if (!s) continue
    const mieux = !favorite
      || s.n > favorite.stats.n
      || (s.n === favorite.stats.n && (s.fin - s.debut) < (favorite.stats.fin - favorite.stats.debut))
    if (mieux) favorite = { photo: p, stats: s }
  }
  let photoDeLaSoiree = null
  if (favorite) {
    const url = (await signPhotos([favorite.photo.thumb_path || favorite.photo.storage_path], 3600))[
      favorite.photo.thumb_path || favorite.photo.storage_path
    ] || null
    photoDeLaSoiree = {
      url,
      nom: favorite.photo.guests?.display_name || 'Un invité',
      heure: heureCourte(favorite.photo.taken_at),
      coeurs: favorite.stats.n,
      // Le temps qu'il lui a fallu pour faire l'unanimité.
      rapidite: favorite.stats.n > 1 ? duree(favorite.stats.debut, favorite.stats.fin) : null,
    }
  }

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
    // Moyenne par photographe : le repère qui dit à chacun s'il est au-dessus
    // ou en dessous. Comptée sur ceux qui ont déclenché, pas sur les inscrits —
    // diviser par des gens qui n'ont jamais sorti l'appareil ne veut rien dire.
    moyenne: parInvite.size ? Math.round((photos.length / parInvite.size) * 10) / 10 : 0,
    champion,
    heurePointe,
    premier: premierClic
      ? {
          nom: premierClic.guests?.display_name || 'Un invité',
          heure: heureCourte(premierClic.taken_at),
          url: vignette(premierClic),
        }
      : null,
    dernier: dernierClic
      ? {
          nom: dernierClic.guests?.display_name || 'Un invité',
          heure: heureCourte(dernierClic.taken_at),
          url: vignette(dernierClic),
        }
      : null,
    dureeFete,
    photoDeLaSoiree,
    // Absents tant que personne n'a téléchargé : mieux vaut taire une ligne
    // qu'annoncer un zéro à quelqu'un qui vient de réussir sa soirée.
    telechargements: personnes > 0 ? { personnes, photos: photosEmportees } : null,
  })
}
