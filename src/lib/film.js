'use client'
// ============================================================
//  Pellicules : le rendu argentique de l'album
// ============================================================
// Une même recette sert deux fois : à l'écran (filtres CSS et calques) et à la
// cuisson dans le pixel, quand le participant emporte ses photos. Les deux doivent se
// ressembler, d'où les réglages d'affichage et de cuisson côte à côte dans
// chaque pellicule, plutôt que dispersés entre la feuille de style et le canvas.

import { compressToBlob, decodeImage } from './camera'
import { PELLICULES, pelliculeParId, fabriqueLut } from './pellicules'

// Les recettes vivent dans ./pellicules, lisible aussi du serveur (tirages).
export { PELLICULES, PELLICULE_DEFAUT, pelliculeParId, pellicules, nomPellicule, cssTeinte, tamponDate } from './pellicules'

// ---------- Cuisson (téléchargement) ----------

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

// Développer ce qui est déjà dessiné sur un contexte : même recette que la
// cuisson d'une photo, mais sur un canvas qu'on garde en main. C'est ce dont
// le collage a besoin, chaque tirage étant traité avant d'être posé sur le
// fond.
export function developperContexte(ctx, w, h, pellicule, date) {
  const f = typeof pellicule === 'string' ? pelliculeParId(pellicule) : pellicule
  if (f && f.canaux) { developpe(ctx, w, h, f); voile(ctx, w, h, f) }
  if (date) tampon(ctx, w, h, date)
}
