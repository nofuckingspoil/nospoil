'use client'
// ============================================================
//  L'image à partager : les tirages de la soirée jetés sur une table.
//
//  Un carrousel de dix images demande dix enregistrements, puis dix
//  sélections dans Instagram, dans le bon ordre. Personne ne va au bout.
//  Une seule image demande un geste, et c'est elle qui parle pour nous :
//  qui la voit passer reconnaît le rendu et se demande d'où il vient.
//
//  Tout se dessine dans le téléphone, comme les affiches QR : aucun serveur,
//  aucun coût, et le rendu est identique à ce que l'aperçu montrait.
// ============================================================

import { compressToBlob } from './camera'
import { developperContexte, tamponDate } from './film'

// ---------- Formats ----------
// Deux seulement, et pas trois : la story est le geste rapide, la publication
// celui qui reste sur le profil. Le format carré n'apporte rien de plus et
// ferait un choix de plus à prendre.
export const FORMATS = [
  { key: 'story', label: 'Story', sub: 'Plein écran', w: 1080, h: 1920 },
  { key: 'post', label: 'Publication', sub: 'Pour le fil', w: 1080, h: 1350 },
]

// ---------- Fonds ----------
// Le blanc des tirages a besoin d'un fond qui le porte : le papier crème du
// site, ou la nuit, qui fait ressortir les photos comme sur une table sombre.
export const FONDS = [
  {
    key: 'papier',
    label: 'Papier',
    fond: '#E7E1D4',
    encre: '#221A12',
    doux: 'rgba(34,26,18,.5)',
    accent: '#C2451F',
    cadre: '#FFFCF6',
    ombre: 'rgba(60,40,20,.26)',
    lueur: 'rgba(255,226,170,.5)',
    vignette: 'rgba(70,45,20,.2)',
  },
  {
    key: 'nuit',
    label: 'Nuit',
    fond: '#17120E',
    encre: '#F6F0E4',
    doux: 'rgba(246,240,228,.5)',
    accent: '#F07A4E',
    cadre: '#FBF7EF',
    ombre: 'rgba(0,0,0,.55)',
    lueur: 'rgba(255,190,120,.22)',
    vignette: 'rgba(0,0,0,.5)',
  },
]

export function formatParId(k) { return FORMATS.find((f) => f.key === k) || FORMATS[0] }
export function fondParId(k) { return FONDS.find((f) => f.key === k) || FONDS[0] }

// Six tirages : trois rangées de deux, une pile équilibrée. Au-delà de sept
// ils se mangent entre eux et on ne voit plus aucun visage.
export const NB_TIRAGES = 6

// ---------- Hasard tenu en laisse ----------
// Le désordre doit être reproductible : l'aperçu et le fichier enregistré
// doivent être la même image. Même graine, mêmes angles.
function suite(graine) {
  let s = graine >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// ---------- Géométrie d'un tirage ----------
// Proportions d'un vrai polaroid : une marge fine sur trois côtés, une large
// en bas, celle sur laquelle on écrit au feutre.
const MARGE = 0.055
const BANDE = 0.17
const RAPPORT = 1 + MARGE + BANDE // hauteur totale / largeur

// Ce qu'une ligne laisse voir de la précédente. En dessous de 0,8 les tirages
// se chevauchent vraiment, ce qui est tout l'effet recherché.
const RECOUVREMENT = 0.72

/**
 * Où poser chaque tirage, en pixels, dans la zone qui leur est réservée.
 *
 * Des colonnes qui alternent, chacune penchée dans son sens, et qui se
 * chevauchent franchement : c'est le chevauchement qui fait « jetés sur la
 * table » plutôt que « collés dans un album ». Les tailles varient aussi
 * légèrement, sinon l'œil retrouve la grille sous le désordre.
 *
 * Le nombre de colonnes n'est pas fixé d'avance : il se déduit du format.
 * Six tirages sur deux colonnes tiennent debout dans une story, mais se
 * ratatinaient dans une publication, deux fois moins haute ; trois colonnes
 * les y rendent une fois et demie plus grands. On essaie donc chaque
 * découpage et on garde celui qui donne les plus grands tirages.
 *
 * Le tremblé est borné à quinze degrés : au-delà, on ne lit plus les visages.
 */
function largeurPour(n, cols, zw, zh) {
  const lignes = Math.ceil(n / cols)
  const parLargeur = zw * Math.min(0.78, 1.2 / cols)
  const parHauteur = zh / (RAPPORT * (RECOUVREMENT * lignes + (1 - RECOUVREMENT)))
  return Math.min(parLargeur, parHauteur)
}

// Ramener une valeur entre deux bords, en restant au milieu si la place
// manque : mieux vaut déborder également des deux côtés que d'un seul.
function borne(v, min, max) {
  if (min > max) return (min + max) / 2
  return v < min ? min : v > max ? max : v
}

function disposer(n, zx, zy, zw, zh, graine) {
  const alea = suite(graine)

  let cols = 1
  let base = 0
  for (let c = 1; c <= Math.min(3, n); c++) {
    const L = largeurPour(n, c, zw, zh)
    if (L > base) { base = L; cols = c }
  }

  const lignes = Math.ceil(n / cols)
  const hBase = base * RAPPORT
  // Le pas entre deux lignes est fixe, et non étalé sur toute la zone : étalé,
  // la pile s'aérait en story (la plus haute) jusqu'à redevenir une grille.
  // Le bloc obtenu est ensuite centré, avec l'air en haut et en bas plutôt
  // qu'entre les tirages.
  const pas = hBase * RECOUVREMENT
  const bloc = hBase + pas * (lignes - 1)
  const y0 = zy + Math.max(0, (zh - bloc) / 2)
  const places = []

  for (let i = 0; i < n; i++) {
    const ligne = Math.floor(i / cols)
    const col = i % cols
    // Une dernière ligne incomplète se recentre : laissée alignée à gauche,
    // elle donnait une image bancale, lourde d'un côté.
    const surLigne = Math.min(cols, n - ligne * cols)
    const fx = (col + 0.5) / cols + (cols - surLigne) / (2 * cols)
    // Chaque tirage n'a pas tout à fait la taille du voisin : c'est ce petit
    // écart qui empêche de deviner la grille.
    const L = base * (0.93 + alea() * 0.15)
    const H = L * RAPPORT
    // Les tirages penchent alternativement, en repartant à chaque ligne : deux
    // voisins inclinés dans le même sens font un escalier, pas une pile.
    const sens = (i + ligne) % 2 === 0 ? -1 : 1
    const angle = ((sens * (5 + alea() * 10)) * Math.PI) / 180

    // Un tirage penché déborde de son propre cadre : c'est sa boîte tournée
    // qu'il faut garder dans la zone, sinon les colonnes du bord se font
    // rogner par le bord de l'image.
    const co = Math.abs(Math.cos(angle))
    const si = Math.abs(Math.sin(angle))
    const demiL = (L * co + H * si) / 2
    const demiH = (L * si + H * co) / 2
    const cx = borne(zx + zw * fx + (alea() - 0.5) * (zw / cols) * 0.16, zx + demiL, zx + zw - demiL)
    const cy = borne(y0 + hBase / 2 + pas * ligne + (alea() - 0.5) * hBase * 0.09, zy + demiH, zy + zh - demiH)
    places.push({ cx, cy, L, H, angle })
  }
  return places
}

// ---------- Texte ----------

export function police(variable, repli) {
  if (typeof window === 'undefined') return repli
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    return v || repli
  } catch { return repli }
}

// Un prénom composé ne doit pas sortir du cadre : on rétrécit jusqu'à ce que
// ça rentre, plutôt que de couper au milieu d'un mot.
export function ajuste(ctx, texte, maxLargeur, taille, fabrique) {
  let t = taille
  for (let i = 0; i < 24; i++) {
    ctx.font = fabrique(t)
    if (ctx.measureText(texte).width <= maxLargeur) break
    t *= 0.94
  }
  return t
}

function petitesCapitales(ctx, texte, x, y, taille, couleur, mono) {
  ctx.save()
  ctx.font = `700 ${taille}px ${mono}`
  ctx.fillStyle = couleur
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  try { ctx.letterSpacing = `${Math.round(taille * 0.2)}px` } catch {}
  // `letterSpacing` n'existe pas partout : sans lui le texte se décale vers la
  // gauche puisque le navigateur ne compte pas l'espace ajouté. On mesure
  // toujours après avoir posé le réglage, jamais avant.
  ctx.fillText(texte.toUpperCase(), x, y)
  ctx.restore()
}

// ---------- Le dessin ----------

/**
 * Composer l'image.
 *
 * `tirages` : [{ img, who, takenAt }] déjà décodés. On ne télécharge rien ici,
 * pour que l'aperçu puisse travailler sur les mini-versions et l'enregistrement
 * sur la pleine qualité, sans dupliquer la mise en page.
 */
export function dessinerCollage(canvas, {
  tirages,
  format = 'story',
  fond = 'papier',
  titre = '',
  surtitre = 'Les souvenirs de',
  pied = '',
  pellicule = null,
  avecDate = false,
  graine = 1,
  echelle = 1,
} = {}) {
  const F = formatParId(format)
  const C = fondParId(fond)
  const w = Math.round(F.w * echelle)
  const h = Math.round(F.h * echelle)
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const display = police('--font-display', 'system-ui, sans-serif')
  const mono = police('--font-mono', 'ui-monospace, monospace')

  // 1. Le fond
  ctx.fillStyle = C.fond
  ctx.fillRect(0, 0, w, h)

  // 2. Le flash : la lumière chaude qui tombe au milieu de la table. C'est
  //    elle qui relie le fond aux tirages, sinon les photos ont l'air posées
  //    sur un aplat de couleur.
  const halo = ctx.createRadialGradient(w / 2, h * 0.52, 0, w / 2, h * 0.52, w * 0.85)
  halo.addColorStop(0, C.lueur)
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, w, h)

  // 3. L'en-tête : d'abord à qui appartient la soirée.
  const hautZone = w * 0.215
  const basZone = w * 0.125
  const marge = w * 0.07

  petitesCapitales(ctx, surtitre, w / 2, w * 0.058, Math.round(w * 0.024), C.accent, mono)

  if (titre) {
    const taille = ajuste(ctx, titre, w - marge * 2, w * 0.095, (t) => `800 ${t}px ${display}`)
    ctx.fillStyle = C.encre
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${taille}px ${display}`
    ctx.fillText(titre, w / 2, w * 0.128)
  }

  // 4. Les tirages
  const places = disposer(tirages.length, marge, hautZone, w - marge * 2, h - hautZone - basZone, graine)

  tirages.forEach((t, i) => {
    const p = places[i]
    if (!p || !t.img) return
    const { cx, cy, L, H, angle } = p
    const cote = L * (1 - MARGE * 2)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)

    // Le cadre blanc, avec son ombre portée. L'ombre part avant la photo :
    // dessinée après, elle se poserait par-dessus les tirages voisins.
    ctx.save()
    ctx.shadowColor = C.ombre
    ctx.shadowBlur = L * 0.07
    ctx.shadowOffsetY = L * 0.022
    ctx.fillStyle = C.cadre
    ctx.fillRect(-L / 2, -H / 2, L, H)
    ctx.restore()

    // La photo, recadrée au carré par le centre. Portrait ou paysage, tout
    // rentre dans le même cadre : c'est ce qui rend la pile régulière.
    const carre = tirageCarre(t.img, Math.round(cote), pellicule, avecDate ? tamponDate(t.takenAt) : '')
    if (carre) ctx.drawImage(carre, -L / 2 + L * MARGE, -H / 2 + L * MARGE, cote, cote)

    ctx.restore()
  })

  // 5. La signature. Le point orange est l'obturateur : c'est notre marque, on
  //    la pose sans écrire le nom en gros.
  const yPied = h - basZone * 0.62
  const tailleP = Math.round(w * 0.026)
  ctx.save()
  ctx.font = `700 ${tailleP}px ${mono}`
  try { ctx.letterSpacing = `${Math.round(tailleP * 0.2)}px` } catch {}
  const largeurP = ctx.measureText('TIMETOFLASH.FR').width
  ctx.restore()
  const rayon = tailleP * 0.3
  const decal = rayon * 2 + tailleP * 0.55
  petitesCapitales(ctx, 'timetoflash.fr', w / 2 + decal / 2, yPied, tailleP, C.doux, mono)
  ctx.beginPath()
  ctx.arc(w / 2 - largeurP / 2 - decal / 2 + rayon, yPied, rayon, 0, Math.PI * 2)
  ctx.fillStyle = C.accent
  ctx.fill()

  if (pied) {
    petitesCapitales(ctx, pied, w / 2, yPied + tailleP * 1.9, Math.round(w * 0.019), C.doux, mono)
  }

  // 6. Les coins qui s'assombrissent, comme au bord d'une photo au flash.
  const rayonV = Math.hypot(w, h) / 2
  const v = ctx.createRadialGradient(w / 2, h / 2, rayonV * 0.55, w / 2, h / 2, rayonV)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, C.vignette)
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)

  return canvas
}

// Un tirage carré, développé à part. Passer par un canvas intermédiaire est ce
// qui permet de réutiliser exactement la recette des pellicules de l'album :
// le rendu de l'image partagée est celui que la personne voyait à l'écran.
function tirageCarre(img, cote, pellicule, date) {
  const sw = img.width || img.naturalWidth
  const sh = img.height || img.naturalHeight
  if (!sw || !sh || !cote) return null
  const c = document.createElement('canvas')
  c.width = cote
  c.height = cote
  const ctx = c.getContext('2d')
  const source = Math.min(sw, sh)
  ctx.drawImage(img, (sw - source) / 2, (sh - source) / 2, source, source, 0, 0, cote, cote)
  try { developperContexte(ctx, cote, cote, pellicule, date) } catch {}
  return c
}

// ---------- Choix des photos ----------

/**
 * La sélection automatique de la soirée.
 *
 * D'abord les photos que les gens ont aimées, mais jamais deux fois la même
 * personne tant que tout le monde n'a pas eu son tour : une pile où le même
 * visage revient cinq fois ne raconte pas la fête, elle raconte un téléphone.
 * L'ordre rendu est chronologique, pour que la soirée se lise de haut en bas.
 */
export function selectionAuto(photos, max = 6) {
  const visibles = photos.filter((p) => !p.hidden)
  const classees = [...visibles].sort(
    (a, b) => (b.favs || 0) - (a.favs || 0) || new Date(a.takenAt) - new Date(b.takenAt)
  )
  const pris = []
  const vus = new Set()
  for (let tour = 0; pris.length < max && tour < 6; tour++) {
    for (const p of classees) {
      if (pris.length >= max) break
      if (pris.includes(p)) continue
      const compte = pris.filter((x) => x.guestId === p.guestId).length
      if (compte > tour) continue
      pris.push(p)
      vus.add(p.guestId)
    }
  }
  return chronologique(pris)
}

export function chronologique(photos) {
  return [...photos].sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))
}

/** Ramener une liste à ce que la pile peut porter, sans perdre les préférées. */
export function reduire(photos, max = 6) {
  if (photos.length <= max) return chronologique(photos)
  const classees = [...photos].sort(
    (a, b) => (b.favs || 0) - (a.favs || 0) || new Date(a.takenAt) - new Date(b.takenAt)
  )
  return chronologique(classees.slice(0, max))
}

// ---------- Sortie ----------

export async function collageEnBlob(canvas) {
  return compressToBlob(canvas, { maxSize: Math.max(canvas.width, canvas.height), quality: 0.92 })
}
