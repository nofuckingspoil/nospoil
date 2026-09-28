// ============================================================
//  « Vos photos sur papier », cinq jours après la révélation.
//
//  QUAND
//  Trois jours après le mail des photos préférées (J+2) : le classement du
//  groupe est fait, et ce sont ces photos-là qu'on a envie d'imprimer.
//
//  UNE SEULE FOIS, SANS COLONNE DE SUIVI
//  La tâche passe une fois par jour et ne regarde que les albums révélés il y
//  a entre cinq et six jours. Chaque album tombe donc dans une seule tournée,
//  et personne ne reçoit le mail deux fois. Le prix à payer : une tournée
//  manquée n'est pas rattrapée, ce qui est acceptable pour une relance.
//
//  À QUI
//  Les participants qui ont laissé leur adresse APRÈS la mise en ligne de la
//  phrase « et nos services autour de vos photos » sous le champ mail, et qui
//  n'ont pas demandé à ne plus recevoir ce type de message. Les inscrits
//  d'avant ont lu une promesse plus étroite : ils ne reçoivent rien.
// ============================================================
import 'server-only'
import sharp from 'sharp'
import { selectRows, signPhotos } from './supabase'
import { sendMail, tiragesEmail, siteUrl } from './mail'
import { lienAvisInvite } from './avis-mail'
import { PRIX_APPEL, prixAppel } from './tirages'
import { langueDe } from './langue-serveur'

// À REMPLIR LE JOUR DE LA MISE EN LIGNE de la nouvelle phrase sous le champ
// mail (format '2026-10-15T00:00:00Z'). Tant que c'est vide, personne ne
// reçoit la relance.
export const PROMESSE_SERVICES = '2026-09-28T17:00:00Z' // 28/09/2026, 19 h (Paris) : juste après la mise en ligne

export const APRES_JOURS = 5
const BATCH = 200

// Ce que dit le mail pour un album : les trois photos les plus aimées, ou à
// défaut les premières de la soirée. Séparé de l'envoi pour servir aussi à
// l'aperçu local.
export async function contenuTirages(ev) {
  const phRes = await selectRows(
    'photos',
    `event_id=eq.${ev.id}&hidden=is.false&select=id,storage_path,thumb_path&order=taken_at.asc&limit=500`
  )
  const photos = Array.isArray(phRes.data) ? phRes.data : []
  if (!photos.length) return null

  const favRes = await selectRows('favorites', `event_id=eq.${ev.id}&select=photo_id`)
  const votes = new Map()
  for (const f of Array.isArray(favRes.data) ? favRes.data : []) votes.set(f.photo_id, (votes.get(f.photo_id) || 0) + 1)
  // Les douze plus aimées, parmi lesquelles on en retiendra trois.
  const candidates = [...photos].sort((a, b) => (votes.get(b.id) || 0) - (votes.get(a.id) || 0)).slice(0, 12)

  // Sept jours : le maximum d'une adresse signée.
  const chemins = candidates.map((p) => p.thumb_path || p.storage_path)
  const signees = await signPhotos(chemins, 7 * 24 * 3600)

  // Le format de chaque vignette. Un album mélange les formats (l'appareil
  // photographie en 3:4, mais il y a des photos importées, des paysages, des
  // formats d'écran) : trois vignettes de formats différents ne s'alignent
  // pas. On retient donc les trois plus aimées qui partagent le format de la
  // première, et elles s'affichent entières, à la même taille.
  const mesurees = await Promise.all(candidates.map(async (p) => {
    const url = signees[p.thumb_path || p.storage_path] || null
    if (!url) return null
    try {
      const m = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer())).metadata()
      const couchee = (m.orientation || 1) >= 5 // la photo sera tournée d'un quart
      const [w, h] = couchee ? [m.height, m.width] : [m.width, m.height]
      return { url, ratio: w / h }
    } catch {
      return null
    }
  }))
  const lisibles = mesurees.filter(Boolean)
  if (!lisibles.length) return null
  // Le format de référence : celui de la photo la plus aimée qui a au moins
  // deux sœurs du même format parmi les candidates.
  const proches = (r) => lisibles.filter((m) => Math.abs(m.ratio - r) < 0.06)
  const tete = lisibles.find((m) => proches(m.ratio).length >= 3) || lisibles[0]
  const reference = tete.ratio
  const memeFormat = proches(reference)
  const top = (memeFormat.length >= 3 ? memeFormat : lisibles).slice(0, 3)

  return {
    eventName: ev.name,
    lien: `${siteUrl()}/g/${ev.id}?tirages=1`,
    top,
    ratio: reference,
    prixAppel: PRIX_APPEL,
  }
}

export async function envoyerRelanceTirages(ev) {
  if (!PROMESSE_SERVICES) return { envoyes: 0, echecs: 0, ignore: 'date de la promesse non fixée' }
  const contenu = await contenuTirages(ev)
  if (!contenu) return { envoyes: 0, echecs: 0, ignore: 'album vide' }

  const { ok, data } = await selectRows(
    'guests',
    `event_id=eq.${ev.id}&email=not.is.null&blocked=is.false&survey_optout=not.is.true` +
      `&created_at=gte.${PROMESSE_SERVICES}` +
      `&select=id,email,token,langue&order=created_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) return { envoyes: 0, echecs: 0 }

  let envoyes = 0
  let echecs = 0
  for (const g of data) {
    // La langue du participant, sinon celle de l'événement.
    const langue = langueDe(g, langueDe(ev))
    const mail = tiragesEmail({
      ...contenu,
      prixAppel: prixAppel(langue),
      langue,
      stopLink: g.token ? `${lienAvisInvite(g.token)}&stop=1` : null,
    })
    const res = await sendMail({ to: g.email, subject: mail.subject, html: mail.html })
    if (res?.ok) envoyes++
    else echecs++
  }
  return { envoyes, echecs }
}
