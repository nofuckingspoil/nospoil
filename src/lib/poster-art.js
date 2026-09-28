// ============================================================
//  Moteur d'affiche.
//
//  Le QR n'est qu'un élément : ce qu'on fabrique ici, c'est le support qu'on
//  pose sur les tables : une affiche aux couleurs du mariage, avec les
//  prénoms, la date, la consigne, et le code au milieu.
//
//  Tout est dessiné dans la même liste de formes que le QR (voir qr-art.js),
//  ce qui donne trois sorties fidèles à l'aperçu : le PNG, le SVG, et
//  l'impression navigateur. Les distances sont en millimètres : un A4 fait
//  210 × 297, un SVG en millimètres sort à la bonne taille chez l'imprimeur.
// ============================================================

import { buildPlan, FONTS, contrast, luminance } from './qr-art'
import { t } from './i18n'

// ---------- Formats ----------
// `per` = nombre d'exemplaires par page A4. Au-delà de 1, on compose une
// planche à découper plutôt que de laisser l'organisateur bricoler.
export const FORMATS = [
  { key: 'a4', label: 'Affiche A4', sub: 'Entrée, bar, vestiaire', per: 1, w: 210, h: 297 },
  { key: 'a5', label: 'Affiche A5', sub: '2 par page, à découper', per: 2, w: 148, h: 210 },
  { key: 'chevalet', label: 'Chevalet de table', sub: '2 par page, à plier en deux', per: 2, w: 105, h: 148, fold: true },
  { key: 'cartons', label: 'Petits cartons', sub: '9 par page, à disperser', per: 9, w: 63, h: 90 },
  { key: 'carre', label: 'Carré pour écran', sub: 'Réseaux, télé, projection', per: 1, w: 180, h: 180, screen: true },
  { key: 'qr', label: 'QR code seul', sub: 'Sans habillage, à intégrer', per: 1, w: 0, h: 0, bare: true },
]

// ---------- Mises en page ----------
export const MODELES = [
  { key: 'epure', label: 'Épuré', sub: 'Un filet, rien de plus' },
  { key: 'arche', label: 'Arche', sub: 'Le code dans une arche' },
  { key: 'botanique', label: 'Botanique', sub: 'Feuillages dans les coins' },
  { key: 'deco', label: 'Art déco', sub: 'Cadre à angles coupés' },
  { key: 'polaroid', label: 'Photo', sub: 'Le code posé comme un cliché' },
  { key: 'ruban', label: 'Bandeau', sub: 'Vos prénoms en négatif' },
]

export const POSTER_DEFAULTS = {
  format: 'a4',
  modele: 'epure',
  surtitre: 'Le mariage de',
  titre: 'Léa & Tom',
  date: '12 juin 2027',
  accroche: 'Ce soir, le photographe, c’est vous.',
  consigne: 'Scannez pour partager vos photos',
  pied: 'Aucune application à installer',
  titreFont: 'didone',
  texteFont: 'sans',
  plaque: false,
}

// ---------- Textes traduits ----------
// FORMATS, MODELES et POSTER_DEFAULTS gardent leurs textes français
// (compatibilité) ; ces fonctions renvoient les mêmes objets dans la langue
// voulue. Pendant le rendu, TOUJOURS passer la langue de la page.

const NOMS_FORMATS = {
  a4: { label: { fr: 'Affiche A4', en: 'A4 poster', de: 'A4-Poster' }, sub: { fr: 'Entrée, bar, vestiaire', en: 'Entrance, bar, cloakroom', de: 'Eingang, Bar, Garderobe' } },
  a5: { label: { fr: 'Affiche A5', en: 'A5 poster', de: 'A5-Poster' }, sub: { fr: '2 par page, à découper', en: '2 per page, to cut out', de: '2 pro Seite, zum Ausschneiden' } },
  chevalet: { label: { fr: 'Chevalet de table', en: 'Table tent', de: 'Tischaufsteller' }, sub: { fr: '2 par page, à plier en deux', en: '2 per page, to fold in half', de: '2 pro Seite, zum Falten' } },
  cartons: { label: { fr: 'Petits cartons', en: 'Small cards', de: 'Kärtchen' }, sub: { fr: '9 par page, à disperser', en: '9 per page, to scatter around', de: '9 pro Seite, zum Verteilen' } },
  carre: { label: { fr: 'Carré pour écran', en: 'Square for screens', de: 'Quadrat für Bildschirme' }, sub: { fr: 'Réseaux, télé, projection', en: 'Social media, TV, projector', de: 'Social Media, TV, Beamer' } },
  qr: { label: { fr: 'QR code seul', en: 'QR code only', de: 'Nur QR-Code' }, sub: { fr: 'Sans habillage, à intégrer', en: 'No design, to use in your own', de: 'Ohne Gestaltung, zum Einbauen' } },
}

const NOMS_MODELES = {
  epure: { label: { fr: 'Épuré', en: 'Clean', de: 'Schlicht' }, sub: { fr: 'Un filet, rien de plus', en: 'A fine line, nothing more', de: 'Eine feine Linie, mehr nicht' } },
  arche: { label: { fr: 'Arche', en: 'Arch', de: 'Bogen' }, sub: { fr: 'Le code dans une arche', en: 'The code inside an arch', de: 'Der Code in einem Bogen' } },
  botanique: { label: { fr: 'Botanique', en: 'Botanical', de: 'Botanisch' }, sub: { fr: 'Feuillages dans les coins', en: 'Foliage in the corners', de: 'Blätter in den Ecken' } },
  deco: { label: { fr: 'Art déco', en: 'Art Deco', de: 'Art déco' }, sub: { fr: 'Cadre à angles coupés', en: 'Frame with cut corners', de: 'Rahmen mit abgeschrägten Ecken' } },
  polaroid: { label: { fr: 'Photo', en: 'Photo', de: 'Foto' }, sub: { fr: 'Le code posé comme un cliché', en: 'The code framed like a snapshot', de: 'Der Code wie ein Schnappschuss' } },
  ruban: { label: { fr: 'Bandeau', en: 'Banner', de: 'Banner' }, sub: { fr: 'Vos prénoms en négatif', en: 'Your names reversed out', de: 'Ihre Namen in Negativschrift' } },
}

const traduire = (liste, noms, langue) => liste.map((x) => (noms[x.key]
  ? { ...x, label: t(noms[x.key].label, langue), sub: t(noms[x.key].sub, langue) }
  : x))

export const formatsDe = (langue) => traduire(FORMATS, NOMS_FORMATS, langue)
export const modelesDe = (langue) => traduire(MODELES, NOMS_MODELES, langue)

// Les textes d'exemple dessinés sur l'affiche, dans la langue de la page.
export function posterDefaults(langue) {
  return {
    ...POSTER_DEFAULTS,
    surtitre: t({ fr: POSTER_DEFAULTS.surtitre, en: 'The wedding of', de: 'Die Hochzeit von' }, langue),
    date: t({ fr: POSTER_DEFAULTS.date, en: '12 June 2027', de: '12. Juni 2027' }, langue),
    accroche: t({ fr: POSTER_DEFAULTS.accroche, en: 'Tonight, you’re the photographer.', de: 'Heute Abend sind Sie der Fotograf.' }, langue),
    consigne: t({ fr: POSTER_DEFAULTS.consigne, en: 'Scan to share your photos', de: 'Scannen und Fotos teilen' }, langue),
    pied: t({ fr: POSTER_DEFAULTS.pied, en: 'No app to install', de: 'Keine App nötig' }, langue),
  }
}

// ---------- Couleurs ----------

function parse(hex) {
  let h = String(hex || '').trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

// Mélange deux couleurs sans passer par la transparence : un aplat opaque
// s'imprime proprement, une teinte à 12 % d'opacité pas toujours.
export function mix(a, b, t) {
  const A = parse(a)
  const B = parse(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase()
}

const font = (key) => (FONTS.find((f) => f.key === key) || FONTS[0]).css

// ---------- Mesure du texte ----------
// On mesure pour deux raisons : couper les lignes trop longues, et réduire la
// taille d'un titre à rallonge plutôt que de le laisser déborder.

let banc = null
function measurer() {
  if (banc) return banc
  if (typeof document === 'undefined') return null
  banc = document.createElement('canvas').getContext('2d')
  return banc
}

function width(v, css, size, weight = 400, italic = false) {
  const c = measurer()
  if (!c) return String(v).length * size * 0.5 // rendu serveur : approximation
  c.font = `${italic ? 'italic ' : ''}${weight} 100px ${css}`
  return (c.measureText(String(v)).width / 100) * size
}

function wrap(v, css, size, weight, italic, max, maxLines = 2) {
  const mots = String(v).trim().split(/\s+/)
  const lignes = []
  let cur = ''
  for (const m of mots) {
    const essai = cur ? `${cur} ${m}` : m
    if (cur && width(essai, css, size, weight, italic) > max) {
      lignes.push(cur)
      cur = m
    } else cur = essai
  }
  if (cur) lignes.push(cur)
  return lignes.slice(0, maxLines)
}

// Réduit la taille jusqu'à ce que ça rentre : un « Marie-Charlotte & Jean-
// Baptiste » ne doit pas sortir du cadre parce qu'il est long.
function fit(v, css, size, weight, max, min = 0.4) {
  let s = size
  while (s > size * min && width(v, css, s, weight) > max) s -= size * 0.02
  return s
}

// ---------- Ornements ----------

function roundRect(x, y, w, h, r) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r]
  return `M${x + tl},${y}H${x + w - tr}${tr ? `a${tr},${tr} 0 0 1 ${tr},${tr}` : ''}`
    + `V${y + h - br}${br ? `a${br},${br} 0 0 1 ${-br},${br}` : ''}`
    + `H${x + bl}${bl ? `a${bl},${bl} 0 0 1 ${-bl},${-bl}` : ''}`
    + `V${y + tl}${tl ? `a${tl},${tl} 0 0 1 ${tl},${-tl}` : ''}Z`
}

// Une arche : un rectangle dont le haut est un demi-cercle.
function arche(x, y, w, h) {
  const r = w / 2
  return `M${x},${y + h}V${y + r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h}Z`
}

// Un cadre aux quatre angles coupés en biais.
function pan(x, y, w, h, c) {
  return `M${x + c},${y}H${x + w - c}L${x + w},${y + c}V${y + h - c}L${x + w - c},${y + h}`
    + `H${x + c}L${x},${y + h - c}V${y + c}Z`
}

// Une branche : une tige fine et des feuilles alternées, dessinée plutôt
// qu'importée : une image aurait été prisonnière de ses propres couleurs.
// Les feuilles restent petites : grossies, elles tournent au serpentin.
function branche(len, couleur) {
  const cx = len * 0.55
  const cy = -len * 0.16
  const shapes = [{
    t: 'path', fill: 'none', stroke: couleur, sw: len * 0.006,
    d: `M0,0 Q${cx},${cy} ${len},${-len * 0.05}`,
  }]
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.1
    // Point courant et pente de la courbe de Bézier quadratique : la feuille
    // suit la tige au lieu de flotter à côté.
    const px = 2 * (1 - t) * t * cx + t * t * len
    const py = 2 * (1 - t) * t * cy + t * t * (-len * 0.05)
    const dx = 2 * (1 - t) * cx + 2 * t * (len - cx)
    const dy = 2 * (1 - t) * cy + 2 * t * (-len * 0.05 - cy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const cote = i % 2 ? 1 : -1
    const taille = 1 - Math.abs(i - 4) * 0.07
    shapes.push({
      t: 'ellipse', cx: len * 0.055 * taille, cy: 0,
      rx: len * 0.055 * taille, ry: len * 0.021 * taille, fill: couleur,
      tx: px, ty: py, rot: angle + 42 * cote,
    })
  }
  return shapes
}

// ---------- L'affiche ----------

// Ce qu'il y a derrière le code une fois posé : le papier, la pastille claire,
// le fond de l'arche ou le blanc du cadre photo. Le QR reprend cette couleur
// comme fond, sinon on verrait un carré rapporté au milieu du décor.
export function fondDuCode(o) {
  const papier = o.bg
  const sombre = luminance(papier) < 0.35
  if (o.modele === 'polaroid') return sombre ? '#FFFFFF' : mix(papier, '#FFFFFF', 0.8)
  if (o.modele === 'arche' && !o.plaque) return mix(o.eye, papier, 0.8)
  if (o.plaque) return sombre ? '#FFFFFF' : mix(papier, '#FFFFFF', 0.6)
  return papier
}


export function buildPoster(o) {
  const fmt = FORMATS.find((f) => f.key === o.format) || FORMATS[0]
  const modele = o.modele

  const W = fmt.w
  const H = fmt.h
  const papier = o.bg
  const encre = o.fg
  const accent = o.eye
  const sombre = luminance(papier) < 0.35
  const plaque = fondDuCode(o)

  const petit = fmt.key === 'cartons'
  const M = W * (petit ? 0.09 : 0.11)
  const maxW = W - M * 2
  const shapes = []

  const fTitre = font(o.titreFont)
  const fTexte = font(o.texteFont)

  // Le code lui-même, dessiné à part puis posé comme un bloc.
  const qr = buildPlan(o.target, { ...o, frame: 'none', bg: plaque, transparent: false })

  // --- Fond et décor ---
  shapes.push({ t: 'rect', x: 0, y: 0, w: W, h: H, fill: papier })

  const bandeau = modele === 'ruban'
  const hautBandeau = bandeau ? H * 0.3 : 0

  if (modele === 'deco') {
    const c = W * 0.055
    shapes.push({ t: 'path', d: pan(M * 0.5, M * 0.5, W - M, H - M, c), fill: 'none', stroke: accent, sw: W * 0.006 })
    shapes.push({ t: 'path', d: pan(M * 0.5 + W * 0.018, M * 0.5 + W * 0.018, W - M - W * 0.036, H - M - W * 0.036, c * 0.72), fill: 'none', stroke: accent, sw: W * 0.002 })
  }
  if (modele === 'botanique') {
    const len = W * 0.32
    const vert = mix(accent, papier, 0.15)
    // Coin haut-gauche et coin bas-droit : les seules zones qu'aucun texte
    // n'occupe, quelle que soit la longueur des prénoms. Les branches restent
    // à l'intérieur du format : rien ne les rognerait à l'impression.
    shapes.push({ t: 'g', tx: W * 0.035, ty: H * 0.05, rot: 32, shapes: branche(len, vert) })
    shapes.push({ t: 'g', tx: W * 0.965, ty: H * 0.95, rot: 212, shapes: branche(len, vert) })
  }
  if (bandeau) {
    shapes.push({ t: 'rect', x: 0, y: 0, w: W, h: hautBandeau, fill: accent })
  }

  // --- Contenu, empilé puis centré ---
  const bloc = []
  const gap = W * 0.035

  const encreSur = bandeau ? papier : mix(encre, papier, 0.35)
  const sTitre = W * (petit ? 0.042 : 0.032)
  const tTitre = W * (petit ? 0.16 : 0.135)
  const tDate = W * (petit ? 0.045 : 0.034)

  if (o.surtitre) {
    bloc.push({ h: sTitre * 1.2, draw: (y) => [{
      t: 'text', x: W / 2, y: y + sTitre, size: sTitre, fill: encreSur,
      font: fTexte, weight: 500, track: 0.22, value: o.surtitre.toUpperCase(),
    }] })
  }
  if (o.titre) {
    const size = fit(o.titre, fTitre, tTitre, 400, maxW)
    bloc.push({ h: size * 1.08, gapAvant: gap * 0.5, draw: (y) => [{
      t: 'text', x: W / 2, y: y + size * 0.86, size, fill: bandeau ? papier : encre,
      font: fTitre, weight: 400, value: o.titre,
    }] })
  }
  if (o.date) {
    bloc.push({ h: tDate * 1.3, gapAvant: gap * 0.35, draw: (y) => [{
      t: 'text', x: W / 2, y: y + tDate, size: tDate, fill: bandeau ? mix(papier, accent, 0.25) : mix(encre, papier, 0.3),
      font: fTexte, weight: 400, track: 0.1, value: o.date,
    }] })
  }

  // Le filet sépare l'identité du mariage de la consigne pratique.
  if (!bandeau && modele !== 'polaroid') {
    bloc.push({ h: 0, gapAvant: gap, draw: (y) => [{
      t: 'rect', x: W / 2 - W * 0.09, y, w: W * 0.18, h: W * 0.0035, fill: accent,
    }] })
  }

  if (o.accroche && !petit) {
    const size = W * 0.042
    const lignes = wrap(o.accroche, fTitre, size, 400, true, maxW * 0.92)
    bloc.push({ h: lignes.length * size * 1.35, gapAvant: gap, draw: (y) => lignes.map((l, i) => ({
      t: 'text', x: W / 2, y: y + size * (1 + i * 1.35), size, fill: mix(encre, papier, 0.15),
      font: fTitre, weight: 400, italic: true, value: l,
    })) })
  }

  // --- Le code, avec le décor propre au modèle ---
  const qrW = W * (petit ? 0.5 : modele === 'polaroid' ? 0.44 : 0.44)
  const cadrePola = qrW * 0.1
  const basPola = qrW * 0.3
  const hQr = modele === 'polaroid' ? qrW + cadrePola * 2 + basPola : qrW
  bloc.push({ h: hQr, gapAvant: gap * (modele === 'arche' ? 2.6 : 1.25), draw: (y) => {
    const out = []
    const x = W / 2 - qrW / 2
    if (modele === 'arche') {
      const pad = qrW * 0.2
      out.push({ t: 'path', d: arche(x - pad, y - pad * 0.9, qrW + pad * 2, qrW + pad * 2.1), fill: plaque })
    }
    if (modele === 'polaroid') {
      const bw = qrW + cadrePola * 2
      const bh = qrW + cadrePola * 2 + basPola
      const legende = o.consigne || ''
      const tLeg = fit(legende, font('script'), qrW * 0.13, 400, bw * 0.86, 0.5)
      out.push({ t: 'g', tx: W / 2, ty: y + bh / 2, rot: -2.2, shapes: [
        // Une ombre portée fabriquée à la main : un second rectangle décalé,
        // qui s'imprime là où un flou CSS n'existerait pas.
        { t: 'rect', x: -bw / 2 + bw * 0.012, y: -bh / 2 + bw * 0.014, w: bw, h: bh, fill: mix(papier, encre, 0.16) },
        { t: 'rect', x: -bw / 2, y: -bh / 2, w: bw, h: bh, fill: plaque },
        { t: 'g', tx: -qrW / 2, ty: -bh / 2 + cadrePola, scale: qrW / qr.w, shapes: qr.shapes },
        { t: 'text', x: 0, y: bh / 2 - basPola * 0.32, size: tLeg, fill: mix(encre, papier, 0.15),
          font: font('script'), weight: 400, value: legende },
      ] })
      return out
    }
    if (o.plaque && modele !== 'arche' && modele !== 'polaroid') {
      const pad = qrW * 0.09
      out.push({ t: 'path', d: roundRect(x - pad, y - pad, qrW + pad * 2, qrW + pad * 2, qrW * 0.08), fill: plaque })
    }
    out.push({ t: 'g', tx: x, ty: y, scale: qrW / qr.w, shapes: qr.shapes })
    return out
  } })

  // Sur le modèle photo, la consigne est déjà écrite sous le cliché.
  if (o.consigne && modele !== 'polaroid') {
    const size = W * (petit ? 0.05 : 0.038)
    const lignes = wrap(o.consigne, fTexte, size, 700, false, maxW)
    bloc.push({ h: lignes.length * size * 1.3, gapAvant: gap, draw: (y) => lignes.map((l, i) => ({
      t: 'text', x: W / 2, y: y + size * (1 + i * 1.3), size, fill: encre,
      font: fTexte, weight: 700, value: l,
    })) })
  }
  if (o.pied && !petit) {
    const size = W * 0.026
    bloc.push({ h: size * 1.3, gapAvant: gap * 0.7, draw: (y) => [{
      t: 'text', x: W / 2, y: y + size, size, fill: mix(encre, papier, 0.45),
      font: fTexte, weight: 400, track: 0.06, value: o.pied,
    }] })
  }

  // Le bandeau tient l'identité : le reste se centre dans l'espace restant.
  const dansBandeau = bandeau ? bloc.slice(0, 3) : []
  const dansPage = bandeau ? bloc.slice(3) : bloc

  const total = (arr) => arr.reduce((s, b, i) => s + b.h + (i ? (b.gapAvant || 0) : 0), 0)

  if (bandeau) {
    let y = (hautBandeau - total(dansBandeau)) / 2
    for (const [i, b] of dansBandeau.entries()) {
      if (i) y += b.gapAvant || 0
      shapes.push(...b.draw(y))
      y += b.h
    }
  }

  const hautLibre = bandeau ? hautBandeau : 0
  const dispo = H - hautLibre
  let y = hautLibre + Math.max(M * 0.6, (dispo - total(dansPage)) / 2)
  for (const [i, b] of dansPage.entries()) {
    if (i) y += b.gapAvant || 0
    shapes.push(...b.draw(y))
    y += b.h
  }

  return { w: W, h: H, shapes, qrW, plaque }
}

// ---------- Planche à imprimer ----------
// Un A4 qui porte plusieurs exemplaires, avec des repères de découpe discrets
// et, pour le chevalet, un trait de pliage.

const A4 = { w: 210, h: 297 }

export function buildSheet(poster, fmt) {
  if (fmt.per === 1) return poster
  const cols = fmt.per === 9 ? 3 : 1
  const rows = fmt.per / cols
  const marge = 8
  const dispoW = A4.w - marge * 2
  const dispoH = A4.h - marge * 2
  const cellW = dispoW / cols
  const cellH = dispoH / rows
  const scale = Math.min(cellW / poster.w, cellH / poster.h) * 0.97
  const w = poster.w * scale
  const h = poster.h * scale

  const shapes = [{ t: 'rect', x: 0, y: 0, w: A4.w, h: A4.h, fill: '#FFFFFF' }]
  const trait = mix('#FFFFFF', '#14161F', 0.28)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = marge + c * cellW + (cellW - w) / 2
      const y = marge + r * cellH + (cellH - h) / 2
      shapes.push({ t: 'g', tx: x, ty: y, scale, shapes: poster.shapes })
      // Repères de découpe : quatre traits courts hors du dessin, pour ne pas
      // salir l'affiche elle-même.
      const t = 3
      for (const [px, py, dx, dy] of [
        [x, y, -t, 0], [x + w, y, t, 0], [x, y + h, -t, 0], [x + w, y + h, t, 0],
        [x, y, 0, -t], [x + w, y, 0, -t], [x, y + h, 0, t], [x + w, y + h, 0, t],
      ]) {
        shapes.push({ t: 'path', d: `M${px},${py}l${dx},${dy}`, fill: 'none', stroke: trait, sw: 0.2 })
      }
    }
  }
  if (fmt.fold) {
    shapes.push({
      t: 'path', d: `M${marge},${A4.h / 2}H${A4.w - marge}`,
      fill: 'none', stroke: trait, sw: 0.25, dash: true,
    })
  }
  return { w: A4.w, h: A4.h, shapes, sheet: true }
}

// ---------- Garde-fou lisibilité ----------
// Reprend le diagnostic du QR, mais sur la couleur réellement située derrière
// le code une fois posé sur l'affiche.

export function diagnosePoster(o, langue) {
  const fmt = FORMATS.find((f) => f.key === o.format) || FORMATS[0]
  if (fmt.bare) return null
  const sombre = luminance(o.bg) < 0.35
  const fond = fondDuCode(o)
  const c = contrast(o.fg, fond)
  const ce = contrast(o.eye, fond)
  if (c < 3 || ce < 3) {
    return {
      level: 'bad',
      text: sombre && !o.plaque
        ? t({
          fr: "Le code se fond dans l'affiche. Activez la pastille claire derrière le QR, ou foncez la couleur des pixels.",
          en: 'The code blends into the poster. Turn on the light patch behind the QR code, or make the pixels darker.',
          de: 'Der Code verschwindet im Poster. Aktivieren Sie das helle Feld hinter dem QR-Code oder dunkeln Sie die Pixel ab.',
        }, langue)
        : t({
          fr: "Ce QR ne sera pas lu : la couleur des pixels est trop proche du fond de l'affiche.",
          en: 'This QR code won’t scan: the colour of the pixels is too close to the poster background.',
          de: 'Dieser QR-Code wird nicht gelesen: Die Farbe der Pixel ist dem Hintergrund des Posters zu ähnlich.',
        }, langue),
    }
  }
  if (c < 5 || ce < 4.5) {
    return { level: 'warn', text: t({
      fr: "Contraste juste entre le code et l'affiche : ça passe à l'écran, ça peut échouer une fois imprimé. Testez le scan avant de commander.",
      en: 'Borderline contrast between the code and the poster: it works on screen, but may fail once printed. Test the scan before you order.',
      de: 'Knapper Kontrast zwischen Code und Poster: Auf dem Bildschirm klappt es, gedruckt kann es scheitern. Testen Sie den Scan, bevor Sie bestellen.',
    }, langue) }
  }
  if (luminance(o.fg) > luminance(fond)) {
    return { level: 'warn', text: t({
      fr: 'QR clair sur fond foncé : les téléphones récents y arrivent, les plus anciens non. Testez avant d’imprimer.',
      en: 'Light QR code on a dark background: recent phones can read it, older ones can’t. Test before printing.',
      de: 'Heller QR-Code auf dunklem Hintergrund: Neuere Handys schaffen das, ältere nicht. Testen Sie vor dem Drucken.',
    }, langue) }
  }
  return null
}
