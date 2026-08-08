// ============================================================
//  Moteur du générateur de QR « habillé ».
//
//  La librairie `qrcode` sait produire une image noir et blanc, rien de plus.
//  Ici on lui demande seulement la matrice brute (quels carrés sont noirs),
//  et on redessine tout nous-mêmes : formes des pixels, coins, couleurs,
//  motif central, cadre et texte.
//
//  Un seul « plan » (une liste de formes en unités-module) est produit, puis
//  rendu deux fois : en SVG (aperçu à l'écran + fichier pour l'imprimeur) et
//  en canvas (fichier PNG). Les deux rendus partent du même plan, donc ce
//  qu'on voit à l'écran est exactement ce qu'on télécharge.
//
//  Unité de travail : 1 = un module (un « pixel » du QR). La mise à l'échelle
//  n'arrive qu'au moment du rendu.
// ============================================================

import QRCode from 'qrcode'

// ---------- Réglages disponibles ----------

// Polices volontairement génériques : le fichier PNG est rasterisé par le
// navigateur et le SVG sera rouvert ailleurs (Canva, imprimeur). Une police
// web ne survivrait ni à l'un ni à l'autre ; une famille système, si.
export const FONTS = [
  { key: 'didone', label: 'Chic', css: 'Didot, "Bodoni MT", "Playfair Display", Georgia, serif' },
  { key: 'serif', label: 'Classique', css: 'Georgia, "Times New Roman", serif' },
  { key: 'garamond', label: 'Romantique', css: '"EB Garamond", Garamond, Baskerville, "Palatino Linotype", serif' },
  { key: 'script', label: 'Manuscrite', css: '"Snell Roundhand", "Segoe Script", "Brush Script MT", cursive' },
  { key: 'sans', label: 'Moderne', css: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { key: 'geo', label: 'Géométrique', css: 'Futura, "Century Gothic", "Avenir Next", "Trebuchet MS", sans-serif' },
  { key: 'mono', label: 'Machine à écrire', css: '"Courier New", Courier, monospace' },
]

export const DOT_SHAPES = [
  { key: 'square', label: 'Carrés' },
  { key: 'rounded', label: 'Arrondis' },
  { key: 'dots', label: 'Points' },
]

export const EYE_SHAPES = [
  { key: 'square', label: 'Carrés' },
  { key: 'rounded', label: 'Arrondis' },
  { key: 'circle', label: 'Ronds' },
]

export const CENTERS = [
  { key: 'none', label: 'Rien' },
  { key: 'heart', label: 'Cœur' },
  { key: 'rings', label: 'Alliances' },
  { key: 'camera', label: 'Appareil' },
  { key: 'initials', label: 'Initiales' },
]

// Ambiances prêtes à l'emploi. Trois couleurs : les pixels, les trois coins,
// le fond. Ce sont les coins d'une couleur différente qui font le plus pour
// l'allure : c'est le premier détail que l'œil attrape.
export const STYLES = [
  {
    key: 'minimal', label: 'Minimaliste', swatch: ['#14161F', '#14161F', '#FFFFFF'],
    fg: '#14161F', eye: '#14161F', bg: '#FFFFFF', dots: 'square', eyes: 'square',
  },
  {
    key: 'champetre', label: 'Champêtre', swatch: ['#3F5236', '#46592F', '#F2F0E6'],
    fg: '#3F5236', eye: '#46592F', bg: '#F2F0E6', dots: 'rounded', eyes: 'rounded',
  },
  {
    key: 'boheme', label: 'Bohème', swatch: ['#8C3E20', '#9E4A25', '#F8EFE3'],
    fg: '#8C3E20', eye: '#9E4A25', bg: '#F8EFE3', dots: 'dots', eyes: 'circle',
  },
  {
    key: 'elegant', label: 'Élégant', swatch: ['#1B2A4A', '#6E5520', '#F6F1E7'],
    fg: '#1B2A4A', eye: '#6E5520', bg: '#F6F1E7', dots: 'rounded', eyes: 'circle',
  },
  {
    key: 'romantique', label: 'Romantique', swatch: ['#7A3648', '#8E465A', '#FDF4F3'],
    fg: '#7A3648', eye: '#8E465A', bg: '#FDF4F3', dots: 'dots', eyes: 'rounded',
  },
  {
    key: 'deco', label: 'Art déco', swatch: ['#14161F', '#71571C', '#FFFFFF'],
    fg: '#14161F', eye: '#71571C', bg: '#FFFFFF', dots: 'square', eyes: 'square',
  },
  {
    key: 'nuit', label: 'Nuit étoilée', swatch: ['#F4EBDA', '#F4C14E', '#1B2233'],
    fg: '#F4EBDA', eye: '#F4C14E', bg: '#1B2233', dots: 'dots', eyes: 'circle',
  },
  {
    key: 'flash', label: 'Time to Flash', swatch: ['#14161F', '#A83C1E', '#F4EBDA'],
    fg: '#14161F', eye: '#A83C1E', bg: '#F4EBDA', dots: 'rounded', eyes: 'rounded',
  },
]

export const DEFAULTS = {
  url: '',
  ...pickStyle('minimal'),
  center: 'none',
  initials: '',
  transparent: false,
}

export function pickStyle(key) {
  const s = STYLES.find((x) => x.key === key) || STYLES[0]
  return { style: s.key, fg: s.fg, eye: s.eye, bg: s.bg, dots: s.dots, eyes: s.eyes }
}

// ---------- Contraste : le garde-fou ----------
// Un QR trop peu contrasté est joli à l'écran et illisible le jour J. On
// mesure, et on le dit avant l'impression plutôt qu'après.

function parseHex(hex) {
  let h = String(hex || '').trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function channel(c) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

export function luminance(hex) {
  const { r, g, b } = parseHex(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Renvoie l'alerte à afficher, ou null si tout va bien.
// Seuils : en dessous de 3, aucun téléphone ne s'en sort ; entre 3 et 5, ça
// passe sur un bel écran et ça coince sur un carton imprimé le soir. Les
// ambiances proposées plus haut restent toutes au-dessus de 5 : une alerte
// qui s'allume sur les propres suggestions de l'outil n'est plus écoutée.
export function diagnose(o) {
  const fond = o.transparent ? '#FFFFFF' : o.bg
  const c = contrast(o.fg, fond)
  if (c < 3) {
    return { level: 'bad', text: "Ce QR ne sera pas lu : la couleur des pixels est bien trop proche du fond. Foncez-la, ou éclaircissez le fond." }
  }
  const ce = contrast(o.eye, fond)
  if (ce < 3) {
    return { level: 'bad', text: "La couleur des trois coins est trop proche du fond : les téléphones ne trouveront pas le code. Foncez-la." }
  }
  if (c < 5) {
    return { level: 'warn', text: "Contraste juste : ça peut passer à l'écran, mais échouer une fois imprimé ou dans une salle sombre. Testez le scan avant de commander." }
  }
  if (ce < 4.5) {
    return { level: 'warn', text: "Les trois coins manquent un peu de contraste. Testez le scan avant d'imprimer." }
  }
  if (luminance(o.fg) > luminance(fond)) {
    return { level: 'warn', text: "QR clair sur fond foncé : la plupart des téléphones récents y arrivent, les plus anciens non. Testez avant d'imprimer." }
  }
  return null
}

// ---------- Motifs du centre ----------
// Dessins en repère 24 × 24, remis à l'échelle au moment du plan.
// `evenodd` sert à creuser les formes (un anneau, l'objectif de l'appareil).

const ICONS = {
  heart: {
    d: 'M12 21.3C11.7 21.3 4 16.5 2.3 11.9 1 8.4 3 4.8 6.4 4.3c2-.3 3.9.6 5.6 2.4 1.7-1.8 3.6-2.7 5.6-2.4 3.4.5 5.4 4.1 4.1 7.6C20 16.5 12.3 21.3 12 21.3z',
  },
  rings: {
    // Deux anneaux entrelacés, chacun creusé par evenodd.
    d: 'M9 5.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm0 3.2a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6z'
      + 'M15 5.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm0 3.2a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6z',
    rule: 'evenodd',
  },
  camera: {
    d: 'M9.2 3.4h5.6l1.2 2.2H20a2.4 2.4 0 0 1 2.4 2.4v10A2.4 2.4 0 0 1 20 20.4H4A2.4 2.4 0 0 1 1.6 18V8a2.4 2.4 0 0 1 2.4-2.4h4L9.2 3.4z'
      + 'M12 8.4a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 2.6a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4z',
    rule: 'evenodd',
  },
}

// ---------- Fabrication du plan ----------

function roundRectPath(x, y, w, h, r) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r]
  return `M${x + tl},${y}H${x + w - tr}${tr ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : ''}`
    + `V${y + h - br}${br ? `a${br},${br} 0 0 1 ${-br},${br}` : ''}`
    + `H${x + bl}${bl ? `a${bl},${bl} 0 0 1 ${-bl},${-bl}` : ''}`
    + `V${y + tl}${tl ? `a${tl},${tl} 0 0 1 ${tl},${-tl}` : ''}Z`
}

/**
 * Construit la liste des formes à dessiner.
 * Renvoie { w, h, shapes } en unités-module.
 */
export function buildPlan(text, o) {
  const hasCenter = o.center && o.center !== 'none' && (o.center !== 'initials' || (o.initials || '').trim())
  // Un motif au centre recouvre des données : on monte la correction d'erreur
  // au maximum (« H », 30 % de redondance) pour que le code reste lisible.
  const qr = QRCode.create(text || 'https://timetoflash.fr', {
    errorCorrectionLevel: hasCenter ? 'H' : 'Q',
  })
  const n = qr.modules.size
  const on = (x, y) => qr.modules.data[y * n + x] === 1

  // Marge muette obligatoire autour d'un QR : sans elle, les scanners ne
  // détachent pas le code de ce qui l'entoure.
  const border = 3
  const w = n + border * 2
  const h = w
  const bg = o.transparent ? null : o.bg
  const shapes = []

  // 1. Le fond.
  if (bg) shapes.push({ t: 'rect', x: 0, y: 0, w, h, fill: bg })

  // 2. Les pixels, sauf les trois coins (redessinés à part) et la zone du motif.
  const isEye = (x, y) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)

  const cut = hasCenter ? Math.max(5, Math.round(n * 0.24)) : 0
  const cutFrom = (n - cut) / 2
  const cutTo = cutFrom + cut
  const inCut = (x, y) =>
    cut > 0 && x + 1 > cutFrom && x < cutTo && y + 1 > cutFrom && y < cutTo

  // Léger débord : sans lui, une fine rayure de fond apparaît entre deux
  // carrés voisins sur certains écrans.
  const over = o.dots === 'square' ? 0.04 : 0

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!on(x, y) || isEye(x, y) || inCut(x, y)) continue
      const px = border + x
      const py = border + y
      if (o.dots === 'dots') {
        shapes.push({ t: 'circle', cx: px + 0.5, cy: py + 0.5, r: 0.44, fill: o.fg })
      } else if (o.dots === 'rounded') {
        shapes.push({ t: 'path', d: roundRectPath(px + 0.02, py + 0.02, 0.96, 0.96, 0.34), fill: o.fg })
      } else {
        shapes.push({ t: 'rect', x: px, y: py, w: 1 + over, h: 1 + over, fill: o.fg })
      }
    }
  }

  // 3. Les trois coins : un anneau + une pastille.
  const eyeAt = (ex, ey) => {
    const x = border + ex
    const y = border + ey
    if (o.eyes === 'circle') {
      shapes.push({ t: 'circle', cx: x + 3.5, cy: y + 3.5, r: 3, fill: 'none', stroke: o.eye, sw: 1 })
      shapes.push({ t: 'circle', cx: x + 3.5, cy: y + 3.5, r: 1.5, fill: o.eye })
      return
    }
    const r = o.eyes === 'rounded' ? 2 : 0
    shapes.push({ t: 'path', d: roundRectPath(x + 0.5, y + 0.5, 6, 6, r), fill: 'none', stroke: o.eye, sw: 1 })
    shapes.push({ t: 'path', d: roundRectPath(x + 2, y + 2, 3, 3, Math.max(0, r - 1.2)), fill: o.eye })
  }
  eyeAt(0, 0)
  eyeAt(n - 7, 0)
  eyeAt(0, n - 7)

  // 4. Le motif central, posé sur une pastille aux couleurs du fond pour
  //    rester lisible quel que soit ce qu'il y a dessous.
  if (hasCenter) {
    const cx = border + n / 2
    const size = cut
    shapes.push({
      t: 'path',
      d: roundRectPath(cx - size / 2, cx - size / 2, size, size, size * 0.28),
      fill: o.transparent ? '#FFFFFF' : o.bg,
    })
    if (o.center === 'initials') {
      const txt = (o.initials || '').trim().slice(0, 3).toUpperCase()
      shapes.push({
        t: 'text', x: cx, y: cx + size * 0.2, size: size * 0.55, fill: o.fg,
        font: (FONTS.find((f) => f.key === (o.titreFont || o.font)) || FONTS[0]).css, weight: 700, value: txt,
      })
    } else {
      const icon = ICONS[o.center]
      const s = (size * 0.66) / 24
      shapes.push({
        t: 'path', d: icon.d, fill: o.fg, rule: icon.rule,
        tx: cx - size * 0.33, ty: cx - size * 0.33, scale: s,
      })
    }
  }

  return { w, h, shapes }
}

// ---------- Rendu SVG ----------

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Un groupe (translation + rotation + échelle) sert à poser un dessin fini
// (le QR, une branche de feuillage) n'importe où sur une affiche.
function transform(s) {
  const t = []
  if (s.tx || s.ty) t.push(`translate(${s.tx || 0} ${s.ty || 0})`)
  if (s.rot) t.push(`rotate(${s.rot})`)
  if (s.scale && s.scale !== 1) t.push(`scale(${s.scale})`)
  return t.length ? ` transform="${t.join(' ')}"` : ''
}

export function shapesToSVG(shapes) {
  return shapes.map((s) => {
    const fill = s.fill === 'none' ? 'none' : s.fill
    const stroke = s.stroke
      ? ` stroke="${s.stroke}" stroke-width="${s.sw}"${s.dash ? ` stroke-dasharray="${s.sw * 8} ${s.sw * 6}"` : ''}`
      : ''
    if (s.t === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${fill}"/>`
    if (s.t === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${fill}"${stroke}/>`
    if (s.t === 'text') {
      return `<text x="${s.x}" y="${s.y}" fill="${fill}" font-family="${esc(s.font)}" font-size="${s.size}"`
        + ` font-weight="${s.weight}" text-anchor="${s.anchor || 'middle'}"`
        + (s.italic ? ' font-style="italic"' : '')
        + (s.track ? ` letter-spacing="${(s.track * s.size).toFixed(3)}"` : '')
        + `>${esc(s.value)}</text>`
    }
    if (s.t === 'ellipse') return `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="${fill}"${stroke}${transform(s)}/>`
    if (s.t === 'g') return `<g${transform(s)}>${shapesToSVG(s.shapes)}</g>`
    const rule = s.rule ? ` fill-rule="${s.rule}"` : ''
    return `<path d="${s.d}" fill="${fill}"${rule}${stroke}${transform(s)}/>`
  }).join('')
}

export function toSVG(plan, { title = 'QR code', unit = '' } = {}) {
  const size = unit
    ? ` width="${plan.w}${unit}" height="${plan.h}${unit}"`
    : ` width="${plan.w * 12}" height="${plan.h * 12}"`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${plan.w} ${plan.h}"${size}`
    + ` role="img" aria-label="${esc(title)}">`
    + `<title>${esc(title)}</title>${shapesToSVG(plan.shapes)}</svg>`
}

// ---------- Rendu canvas (pour le PNG) ----------

export function drawOn(canvas, plan, px = 2000) {
  const scale = px / plan.w
  canvas.width = Math.round(plan.w * scale)
  canvas.height = Math.round(plan.h * scale)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(scale, scale)

  paint(ctx, plan.shapes)
  ctx.restore()
  return canvas
}

function paint(ctx, shapes) {
  for (const s of shapes) {
    ctx.save()
    if (s.tx || s.ty) ctx.translate(s.tx || 0, s.ty || 0)
    if (s.rot) ctx.rotate((s.rot * Math.PI) / 180)
    if (s.t === 'g') {
      if (s.scale) ctx.scale(s.scale, s.scale)
      paint(ctx, s.shapes)
      ctx.restore()
      continue
    }
    if (s.t === 'rect') {
      ctx.fillStyle = s.fill
      ctx.fillRect(s.x, s.y, s.w, s.h)
    } else if (s.t === 'circle' || s.t === 'ellipse') {
      ctx.beginPath()
      if (s.t === 'circle') ctx.arc(s.cx, s.cy, s.r, 0, Math.PI * 2)
      else ctx.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2)
      if (s.fill && s.fill !== 'none') { ctx.fillStyle = s.fill; ctx.fill() }
      if (s.stroke) { ctx.strokeStyle = s.stroke; ctx.lineWidth = s.sw; ctx.stroke() }
    } else if (s.t === 'text') {
      ctx.fillStyle = s.fill
      ctx.font = `${s.italic ? 'italic ' : ''}${s.weight} ${s.size}px ${s.font}`
      ctx.textAlign = s.anchor === 'start' ? 'left' : s.anchor === 'end' ? 'right' : 'center'
      ctx.textBaseline = 'alphabetic'
      // Pas partout supporté : sans lui le texte reste bon, juste un peu serré.
      if (s.track && 'letterSpacing' in ctx) ctx.letterSpacing = `${s.track * s.size}px`
      ctx.fillText(s.value, s.x, s.y)
    } else {
      if (s.scale) ctx.scale(s.scale, s.scale)
      const p = new Path2D(s.d)
      if (s.fill && s.fill !== 'none') { ctx.fillStyle = s.fill; ctx.fill(p, s.rule === 'evenodd' ? 'evenodd' : 'nonzero') }
      if (s.stroke) {
        ctx.strokeStyle = s.stroke; ctx.lineWidth = s.sw
        if (s.dash) ctx.setLineDash([s.sw * 8, s.sw * 6])
        ctx.stroke(p)
      }
    }
    ctx.restore()
  }
}

// ---------- Utilitaires ----------

// On accepte « monsite.fr » sans protocole : personne ne tape « https:// ».
export function normalizeUrl(v) {
  const s = String(v || '').trim()
  if (!s) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s
  return `https://${s}`
}

export function fileName(o, ext) {
  const base = (o.titre || 'mariage')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `qr-${base || 'mariage'}.${ext}`
}
