// ============================================================
//  Trois photos de la soirée, pour le mail de révélation.
//
//  À l'ouverture de l'album, personne n'a encore voté : on prend des photos
//  réparties sur toute la soirée (le début, le milieu, la fin) plutôt que
//  les trois premières, qui montreraient toutes l'apéritif.
//
//  Elles doivent partager le même format : trois vignettes de formats
//  différents ne s'alignent pas dans un mail (même règle que l'ancien mail
//  des tirages, voir relance-tirages.js).
//
//  Calculé UNE fois par événement, pas par participant.
// ============================================================
import 'server-only'
import sharp from 'sharp'
import { selectRows, signPhotos } from './supabase'

// Sept jours : le maximum d'une adresse signée. Au-delà, les vignettes du
// mail s'éteignent ; les liens, eux, continuent de mener à l'album.
const VALIDITE = 7 * 24 * 3600

export async function vignettesAlbum(eventId, nombre = 3) {
  const { data } = await selectRows(
    'photos',
    `event_id=eq.${eventId}&hidden=is.false&select=id,storage_path,thumb_path&order=taken_at.asc&limit=500`
  )
  const photos = Array.isArray(data) ? data : []
  if (photos.length < nombre) return []

  // Neuf candidates réparties sur la soirée, parmi lesquelles on en garde
  // trois du même format.
  const pas = Math.max(1, Math.floor(photos.length / 9))
  const candidates = []
  for (let i = Math.floor(pas / 2); i < photos.length && candidates.length < 9; i += pas) candidates.push(photos[i])

  const chemins = candidates.map((p) => p.thumb_path || p.storage_path)
  const signees = await signPhotos(chemins, VALIDITE)

  const mesurees = await Promise.all(candidates.map(async (p) => {
    const url = signees[p.thumb_path || p.storage_path] || null
    if (!url) return null
    try {
      const m = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer())).metadata()
      const couchee = (m.orientation || 1) >= 5 // la photo sera tournée d'un quart
      const [w, h] = couchee ? [m.height, m.width] : [m.width, m.height]
      return { id: p.id, url, ratio: w / h }
    } catch {
      return null
    }
  }))
  const lisibles = mesurees.filter(Boolean)
  if (lisibles.length < nombre) return []

  // Le format le plus représenté gagne ; à défaut, on prend ce qu'il y a.
  const proches = (r) => lisibles.filter((m) => Math.abs(m.ratio - r) < 0.06)
  const meilleur = lisibles.reduce((a, b) => (proches(b.ratio).length > proches(a.ratio).length ? b : a))
  const memeFormat = proches(meilleur.ratio)
  const choix = memeFormat.length >= nombre ? memeFormat : lisibles
  // Réparties, encore : la première, celle du milieu, la dernière du lot.
  if (choix.length === nombre) return choix
  const idx = Array.from({ length: nombre }, (_, k) => Math.round((k * (choix.length - 1)) / (nombre - 1)))
  return idx.map((k) => choix[k])
}
