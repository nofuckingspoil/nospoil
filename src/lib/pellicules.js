// ============================================================
//  Pellicules : les recettes, sans rien d'autre.
//
//  Séparées de film.js (qui cuit les photos dans le navigateur) pour servir
//  aussi au serveur : les tirages papier sont préparés là, avec exactement les
//  mêmes réglages. Aucun import, aucun accès au navigateur : ce fichier doit
//  rester lisible des deux côtés.
// ============================================================

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

// Les noms et descriptions dans chaque langue. PELLICULES garde le français
// (l'app et le serveur l'importent tel quel).
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr
const TEXTES = {
  aucune: {
    nom: { fr: 'Original', en: 'Original', de: 'Original' },
    resume: { fr: 'La photo telle qu\'elle a été prise', en: 'The photo just as it was taken', de: 'Das Foto so, wie es aufgenommen wurde' },
  },
  jetable: {
    nom: { fr: 'Jetable', en: 'Disposable', de: 'Einweg' },
    resume: { fr: 'Le Kodak des soirées : chaud, contrasté, granuleux', en: 'The party Kodak: warm, punchy, grainy', de: 'Die Party-Kodak: warm, kontrastreich, körnig' },
  },
  retro: {
    nom: { fr: 'Rétro', en: 'Retro', de: 'Retro' },
    resume: { fr: 'Le sépia doré de l\'album, sans grain ni coins sombres', en: 'The album\'s golden sepia, no grain or dark corners', de: 'Das goldene Sepia des Albums, ohne Korn und dunkle Ecken' },
  },
  nb: {
    nom: { fr: 'Noir & blanc', en: 'Black & white', de: 'Schwarzweiß' },
    resume: { fr: 'Argentique dur, gros grain', en: 'Hard film look, heavy grain', de: 'Harter Analoglook, grobes Korn' },
  },
  instant: {
    nom: { fr: 'Instantané', en: 'Instant', de: 'Sofortbild' },
    resume: { fr: 'Le tirage qui se développe : délavé, doux, un peu vert', en: 'The print that develops in your hand: faded, soft, a little green', de: 'Das Bild, das sich entwickelt: verblasst, weich, leicht grünlich' },
  },
}

// Les copies traduites sont gardées : un même identifiant rend toujours le
// même objet, ce qui évite de redessiner les aperçus à chaque rendu.
const CACHE = {}
function traduite(p, langue) {
  const x = p && TEXTES[p.id]
  if (!x) return p
  const nom = tr(x.nom, langue)
  const resume = tr(x.resume, langue)
  if (nom === p.nom && resume === p.resume) return p
  const cle = `${p.id}|${nom}`
  if (!CACHE[cle]) CACHE[cle] = { ...p, nom, resume }
  return CACHE[cle]
}

// Les pellicules avec leurs noms dans la langue voulue (par défaut, celle de
// l'appareil ; côté serveur, toujours la passer).
export function pellicules(langue) {
  return PELLICULES.map((p) => traduite(p, langue))
}

// `langue` facultative : le nom et la description sont alors traduits.
export function pelliculeParId(id, langue) {
  return traduite(PELLICULES.find((p) => p.id === id) || PELLICULES[0], langue)
}

export function nomPellicule(id, langue) {
  return pelliculeParId(id, langue).nom
}

// Le dégradé de teinte, en CSS d'un côté, en canvas de l'autre.
export function cssTeinte(f) {
  return f?.teinte ? `linear-gradient(150deg, ${f.teinte[0]}, ${f.teinte[1]})` : null
}

// La date des appareils à date-back : jour, mois, année sur deux chiffres.
//
// `fuseau` sert au serveur, qui vit en heure universelle : une photo prise à
// minuit et demi à Paris y porterait la date de la veille. Sans fuseau, c'est
// l'heure du téléphone qui compte, comme à l'écran.
export function tamponDate(iso, fuseau) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  if (fuseau) {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('fr-FR', { timeZone: fuseau, day: '2-digit', month: 'numeric', year: '2-digit' })
        .formatToParts(d).map((x) => [x.type, x.value])
    )
    return `${p.day} ${p.month} '${p.year}`
  }
  return `${String(d.getDate()).padStart(2, '0')} ${d.getMonth() + 1} '${String(d.getFullYear()).slice(-2)}`
}


// ---------- La cuisson, commune au navigateur et au serveur ----------

// Table de correspondance 0→255 pour un canal : contraste, dominante, gain,
// puis relevé des noirs. Calculée une fois, appliquée à des millions de pixels.
export function fabriqueLut(contraste, [gamma, gain, delave]) {
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
