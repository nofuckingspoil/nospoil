'use client'
// ============================================================
//  Pellicules : le rendu argentique de l'album
// ============================================================
// Une même recette sert deux fois : à l'écran (filtres CSS et calques) et à la
// cuisson dans le pixel, quand le participant emporte ses photos. Les deux doivent se
// ressembler, d'où les réglages d'affichage et de cuisson côte à côte dans
// chaque pellicule, plutôt que dispersés entre la feuille de style et le canvas.

import { compressToBlob, decodeImage } from './camera'

// Chaque pellicule décrit :
//   css       filtre appliqué à la vignette (affichage)
//   teinte    dégradé en fondu multiplié : [départ, arrivée]
//   halo      lumière chaude au centre, comme un flash de trop près (0 → 1)
//   vignette  assombrissement des coins (0 → 1)
//   grain     opacité du calque de bruit à l'écran (0 → 1)
//   contraste / canaux / sat / bruit   les mêmes effets, à la cuisson.
//   canaux : [gamma, gain, délavé] par canal ; le gamma donne la dominante,
//   le délavé relève les noirs, ce qui fait tout le charme d'un tirage bon marché.
export const PELLICULES = [
  {
    id: 'aucune',
    nom: 'Original',
    resume: 'La photo telle qu\'elle a été prise',
  },
  {
    id: 'jetable',
    nom: 'Jetable',
    resume: 'Le Kodak des soirées : chaud, contrasté, granuleux',
    css: 'sepia(.22) saturate(1.15) contrast(1.16) brightness(1.02)',
    teinte: ['rgba(255,196,92,.22)', 'rgba(236,91,51,.14)'],
    halo: 0.08,
    vignette: 0.45,
    grain: 0.3,
    contraste: 1.13,
    sat: 1.05,
    canaux: { r: [0.94, 1.02, 0.055], g: [1.0, 1.0, 0.048], b: [1.07, 0.95, 0.08] },
    bruit: 13,
  },
  {
    // Le rendu que l'album portait avant les pellicules : doux, doré, sans
    // grain. Certains y tiennent, on ne le retire pas.
    id: 'retro',
    nom: 'Rétro',
    resume: 'Le sépia doré de l\'album, sans grain ni coins sombres',
    css: 'sepia(.34) contrast(1.08) saturate(1.3) brightness(1.02)',
    teinte: ['rgba(244,193,78,.18)', 'rgba(236,91,51,.14)'],
    contraste: 1.08,
    sat: 1.05,
    canaux: { r: [0.96, 1.04, 0], g: [1.0, 1.0, 0], b: [1.1, 0.88, 0] },
    bruit: 0,
  },
  {
    id: 'nb',
    nom: 'Noir & blanc',
    resume: 'Argentique dur, gros grain',
    css: 'grayscale(1) contrast(1.2) brightness(1.04)',
    vignette: 0.38,
    grain: 0.3,
    contraste: 1.2,
    sat: 0,
    canaux: { r: [1.0, 1.0, 0.05], g: [1.0, 1.0, 0.05], b: [1.0, 1.0, 0.05] },
    bruit: 17,
  },
  {
    id: 'instant',
    nom: 'Instantané',
    resume: 'Le tirage qui se développe : délavé, doux, un peu vert',
    css: 'saturate(.85) contrast(.85) brightness(1.12) hue-rotate(4deg)',
    teinte: ['rgba(150,215,205,.20)', 'rgba(255,214,170,.14)'],
    halo: 0.16,
    vignette: 0.2,
    grain: 0.12,
    contraste: 0.85,
    sat: 0.85,
    canaux: { r: [1.04, 0.98, 0.1], g: [0.99, 1.0, 0.125], b: [0.95, 1.0, 0.15] },
    bruit: 7,
  },
]

// L'album s'ouvre comme avant : ceux qui en ont un en cours ne verront rien
// changer. Le jetable et sa date sont à une pastille de là.
export const PELLICULE_DEFAUT = 'retro'

export function pelliculeParId(id) {
  return PELLICULES.find((p) => p.id === id) || PELLICULES[0]
}

// Le dégradé de teinte, en CSS d'un côté, en canvas de l'autre.
export function cssTeinte(f) {
  return f?.teinte ? `linear-gradient(150deg, ${f.teinte[0]}, ${f.teinte[1]})` : null
}

// La date des appareils à date-back : jour, mois, année sur deux chiffres.
export function tamponDate(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')} ${d.getMonth() + 1} '${String(d.getFullYear()).slice(-2)}`
}

// ---------- Cuisson (téléchargement) ----------

// Table de correspondance 0→255 pour un canal : contraste, dominante, gain,
// puis relevé des noirs. Calculée une fois, appliquée à des millions de pixels.
function fabriqueLut(contraste, [gamma, gain, delave]) {
  const t = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) {
    let v = i / 255
    v = (v - 0.5) * contraste + 0.5
    v = Math.pow(Math.max(0, v), gamma)
    v *= gain
    v = delave + v * (1 - delave)
    t[i] = Math.round(v * 255)
  }
  return t
}

const borne = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)

function developpe(ctx, w, h, f) {
  const image = ctx.getImageData(0, 0, w, h)
  const d = image.data
  const lr = fabriqueLut(f.contraste, f.canaux.r)
  const lg = fabriqueLut(f.contraste, f.canaux.g)
  const lb = fabriqueLut(f.contraste, f.canaux.b)
  const sat = f.sat == null ? 1 : f.sat
  const bruit = f.bruit || 0

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]
    if (sat !== 1) {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
      r = l + (r - l) * sat
      g = l + (g - l) * sat
      b = l + (b - l) * sat
    }
    r = lr[borne(r)]; g = lg[borne(g)]; b = lb[borne(b)]
    if (bruit) {
      // Un grain de luminance (le même écart sur les trois canaux) : le bruit
      // coloré fait « photo numérique abîmée », pas « pellicule ».
      const n = (Math.random() - 0.5) * bruit
      r += n; g += n; b += n
    }
    d[i] = r; d[i + 1] = g; d[i + 2] = b
  }
  ctx.putImageData(image, 0, 0)
}

function voile(ctx, w, h, f) {
  const rayon = Math.hypot(w, h) / 2

  if (f.teinte) {
    // À moitié seulement : la dominante est déjà dans les tables de couleur,
    // et deux couches de chaud de suite vireraient à l'orange fluo.
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, f.teinte[0])
    g.addColorStop(1, f.teinte[1])
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.globalAlpha = 0.55
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }
  if (f.halo) {
    const g = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, rayon * 0.95)
    g.addColorStop(0, `rgba(255,240,205,${f.halo})`)
    g.addColorStop(1, 'rgba(255,240,205,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  if (f.vignette) {
    const g = ctx.createRadialGradient(w / 2, h / 2, rayon * 0.45, w / 2, h / 2, rayon)
    g.addColorStop(0, 'rgba(28,16,6,0)')
    g.addColorStop(1, `rgba(28,16,6,${f.vignette * 0.75})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
}

// Les chiffres orange en bas à droite. Le halo compte autant que la couleur :
// sur un vrai tirage, la petite lampe du boîtier bave sur l'émulsion.
function tampon(ctx, w, h, texte) {
  if (!texte) return
  const taille = Math.max(11, Math.round(w * 0.034))
  ctx.save()
  ctx.font = `700 ${taille}px ui-monospace, "Courier New", monospace`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  try { ctx.letterSpacing = `${Math.round(taille * 0.08)}px` } catch {}
  const x = w - Math.round(w * 0.045)
  const y = h - Math.round(h * 0.045)

  // Trois passes. Sans la première, les chiffres disparaissent quand le coin
  // de la photo est clair : un parquet au soleil, une nappe blanche.
  ctx.shadowColor = 'rgba(50,12,0,.6)'
  ctx.shadowBlur = taille * 0.45
  ctx.fillStyle = 'rgba(150,35,0,.85)'
  ctx.fillText(texte, x + 1, y + 1)

  ctx.shadowColor = 'rgba(255,60,0,.95)'
  ctx.shadowBlur = taille * 0.6
  ctx.fillStyle = '#ff5a1e'
  ctx.fillText(texte, x, y)
  ctx.fillText(texte, x, y) // le halo s'épaissit

  ctx.shadowBlur = 0
  ctx.fillStyle = '#ff9a45'
  ctx.fillText(texte, x, y)
  ctx.restore()
}

// Applique la pellicule (et la date) à une photo déjà téléchargée.
// Une photo mal cuite ne doit jamais empêcher l'enregistrement : au moindre
// accroc on rend le fichier d'origine.
export async function cuirePhoto(blob, { pellicule, date } = {}) {
  const f = typeof pellicule === 'string' ? pelliculeParId(pellicule) : pellicule
  const aTraiter = !!(f && f.canaux)
  if (!aTraiter && !date) return blob

  let source = null
  try {
    source = await decodeImage(blob)
    const w = source.width || source.naturalWidth
    const h = source.height || source.naturalHeight
    if (!w || !h) return blob

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source, 0, 0, w, h)

    if (aTraiter) { developpe(ctx, w, h, f); voile(ctx, w, h, f) }
    tampon(ctx, w, h, date)

    const cuite = await compressToBlob(canvas, { maxSize: Math.max(w, h), quality: 0.9 })
    return cuite && cuite.size ? cuite : blob
  } catch {
    return blob
  } finally {
    try { source?.close?.() } catch {}
  }
}
