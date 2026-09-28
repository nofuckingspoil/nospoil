// ============================================================
//  La cuisson des pellicules, côté serveur (tirages papier).
//
//  Le navigateur sait cuire une photo (lib/film.js, sur un canvas) ; l'app
//  iPhone ne le sait pas. Pour que les deux impriment exactement le même
//  fichier, c'est le serveur qui prépare chaque tirage avant de l'envoyer à
//  l'imprimeur. Les calculs sont ceux de film.js, transposés pixel par pixel :
//
//    développement  contraste, dominante, saturation, grain (tables de
//                   pellicules.js, les mêmes qu'au navigateur)
//    voile          la teinte en fondu multiplié, le halo, les coins sombres ;
//                   les dégradés du canvas sont recalculés à la main
//    date           les chiffres orange, en Space Mono (la police de l'écran),
//                   avec leur ombre et leur halo
// ============================================================
import 'server-only'
import sharp from 'sharp'
import { pelliculeParId, fabriqueLut } from './pellicules'
// Les chiffres de la date, dessinés une fois en Space Mono (la police de
// l'écran) par un navigateur, en blanc sur transparent. L'outil de texte du
// serveur ignorait la police fournie et retombait sur une autre ; des images
// ne dépendent de rien.
import CHIFFRES from '../assets/polices/date-chiffres.json'

// « rgba(255,196,92,.22) » → [255, 196, 92, 0.22]
function rgba(txt) {
  const m = String(txt).match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 0]
  const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim())
  return [Number(r), Number(g), Number(b), Number(a)]
}

// Développement et voile, en une seule passe sur les pixels bruts (RVB).
function developperEtVoiler(d, w, h, f) {
  const lr = fabriqueLut(f.contraste, f.canaux.r)
  const lg = fabriqueLut(f.contraste, f.canaux.g)
  const lb = fabriqueLut(f.contraste, f.canaux.b)
  const sat = f.sat == null ? 1 : f.sat
  const bruit = f.bruit || 0
  const borne = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)

  // Teinte : dégradé linéaire du coin haut gauche au coin bas droit, posé en
  // fondu multiplié à 55 %, comme le canvas.
  const t0 = f.teinte ? rgba(f.teinte[0]) : null
  const t1 = f.teinte ? rgba(f.teinte[1]) : null
  const diag2 = w * w + h * h
  const rayon = Math.hypot(w, h) / 2
  // Halo : dégradé rond centré à 42 % de la hauteur, de `halo` à zéro.
  const haloR = rayon * 0.95
  // Coins : dégradé rond centré, transparent jusqu'à 45 % du rayon.
  const vigIn = rayon * 0.45
  const vigA = (f.vignette || 0) * 0.75

  let i = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i += 3) {
      let r = d[i], g = d[i + 1], b = d[i + 2]
      if (sat !== 1) {
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = l + (r - l) * sat
        g = l + (g - l) * sat
        b = l + (b - l) * sat
      }
      r = lr[borne(r)]; g = lg[borne(g)]; b = lb[borne(b)]
      if (bruit) {
        const n = (Math.random() - 0.5) * bruit
        r += n; g += n; b += n
      }
      r = borne(r); g = borne(g); b = borne(b)

      if (t0) {
        const t = Math.min(1, Math.max(0, (x * w + y * h) / diag2))
        const a = (t0[3] + (t1[3] - t0[3]) * t) * 0.55
        const cr = t0[0] + (t1[0] - t0[0]) * t
        const cg = t0[1] + (t1[1] - t0[1]) * t
        const cb = t0[2] + (t1[2] - t0[2]) * t
        r = r * (1 - a) + (r * cr / 255) * a
        g = g * (1 - a) + (g * cg / 255) * a
        b = b * (1 - a) + (b * cb / 255) * a
      }
      if (f.halo) {
        const dist = Math.hypot(x - w / 2, y - h * 0.42)
        const a = f.halo * Math.max(0, 1 - dist / haloR)
        if (a > 0) {
          r = r * (1 - a) + 255 * a
          g = g * (1 - a) + 240 * a
          b = b * (1 - a) + 205 * a
        }
      }
      if (vigA) {
        const dist = Math.hypot(x - w / 2, y - h / 2)
        const a = dist <= vigIn ? 0 : vigA * Math.min(1, (dist - vigIn) / (rayon - vigIn))
        if (a > 0) {
          r = r * (1 - a) + 28 * a
          g = g * (1 - a) + 16 * a
          b = b * (1 - a) + 6 * a
        }
      }
      d[i] = borne(r); d[i + 1] = borne(g); d[i + 2] = borne(b)
    }
  }
}

// Le texte en masque blanc sur transparent, à la taille voulue, entouré
// d'une marge pour que le flou ait la place de baver.
async function masqueTexte(texte, taille, marge) {
  const k = taille / CHIFFRES.taille
  const espacement = Math.round(taille * 0.08)
  const hauteur = Math.round((CHIFFRES.ascendante + CHIFFRES.descendante) * k)
  const morceaux = []
  let x = marge
  for (const ch of texte) {
    const g = CHIFFRES.glyphes[ch] || CHIFFRES.glyphes[' ']
    const largeur = Math.max(1, Math.round(g.largeur * k))
    if (ch !== ' ') {
      const png = Buffer.from(g.png.split(',')[1], 'base64')
      morceaux.push({ input: await sharp(png).resize(largeur, hauteur, { fit: 'fill' }).toBuffer(), left: x, top: marge })
    }
    x += largeur + espacement
  }
  const largeur = x - espacement + marge
  const data = await sharp({ create: { width: largeur, height: hauteur + 2 * marge, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(morceaux).png().toBuffer()
  // La ligne de base, mesurée depuis le haut du masque.
  return { data, largeur, hauteur: hauteur + 2 * marge, base: marge + Math.round(CHIFFRES.ascendante * k) }
}

// Le masque teint d'une couleur (opacité comprise), flouté s'il le faut.
async function calque(masque, couleur, opacite, flou) {
  let img = sharp({ create: { width: masque.largeur, height: masque.hauteur, channels: 4, background: { ...couleur, alpha: opacite } } })
    .composite([{ input: masque.data, blend: 'dest-in' }])
  if (flou > 0.3) img = sharp(await img.png().toBuffer()).blur(flou)
  return img.png().toBuffer()
}

// Les chiffres orange en bas à droite, en trois passes comme au navigateur :
// une ombre sombre (lisible sur un coin clair), le halo orange, puis le trait.
async function calquesDate(w, h, texte) {
  const taille = Math.max(11, Math.round(w * 0.034))
  const marge = Math.round(taille * 1.2)
  const masque = await masqueTexte(texte, taille, marge)
  // Le bord droit du texte et sa ligne de base, placés comme au navigateur.
  const left = w - Math.round(w * 0.045) - (masque.largeur - marge)
  const top = h - Math.round(h * 0.045) - masque.base
  const passes = [
    { couleur: { r: 150, g: 35, b: 0 }, opacite: 0.85, flou: taille * 0.45 / 2, d: 1 },
    { couleur: { r: 255, g: 90, b: 30 }, opacite: 1, flou: taille * 0.6 / 2, d: 0 },
    { couleur: { r: 255, g: 90, b: 30 }, opacite: 1, flou: taille * 0.6 / 2, d: 0 },
    { couleur: { r: 255, g: 154, b: 69 }, opacite: 1, flou: 0, d: 0 },
  ]
  const calques = []
  for (const p of passes) {
    calques.push({ input: await calque(masque, p.couleur, p.opacite, p.flou), left: left + p.d, top: top + p.d })
  }
  return calques
}

/**
 * Prépare une photo pour l'impression. `pellicule` : identifiant de
 * pellicules.js ; `date` : le texte du tampon (vide = pas de date).
 * Renvoie un JPEG. Sans effet ni date, la photo repart telle quelle.
 */
export async function cuireTirage(octets, { pellicule, date } = {}) {
  const f = pelliculeParId(pellicule)
  const aTraiter = !!f?.canaux
  if (!aTraiter && !date) return octets

  const { data, info } = await sharp(octets)
    .rotate() // l'orientation du téléphone, avant tout calcul
    .toColourspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  if (aTraiter) developperEtVoiler(data, w, h, f)

  let sortie = sharp(data, { raw: { width: w, height: h, channels: 3 } })
  if (date) sortie = sortie.composite(await calquesDate(w, h, date))
  return sortie.jpeg({ quality: 92, mozjpeg: true }).toBuffer()
}

// ---------------------------------------------------------------- mise en page
//
// L'imprimeur ne recadre rien : un fichier qui n'a pas exactement la forme du
// papier sort coupé ou déformé. On lui envoie donc le tirage tout fait : une
// feuille blanche aux proportions exactes, à 300 points par pouce, la photo
// posée entière au milieu.
//
// Une bordure blanche de 6 mm fait le tour : l'imprimeur prévient que la coupe
// peut mordre jusqu'à 5 mm de chaque côté. Avec elle, aucun visage n'est coupé.
//
// Le papier est toujours fourni debout. Une photo couchée y est tournée d'un
// quart de tour : on tourne le tirage pour la regarder, comme n'importe quelle
// photo en largeur.
export const PAPIERS_MM = { '10x15': [102, 152], '15x20': [152, 203] }
export const BORDURE_MM = 6
const PPP = 300

export async function mettreEnPage(octets, format) {
  const [lmm, hmm] = PAPIERS_MM[format] || PAPIERS_MM['10x15']
  const px = (mm) => Math.round((mm / 25.4) * PPP)
  const L = px(lmm)
  const H = px(hmm)
  const bord = px(BORDURE_MM)

  // D'abord remettre la photo à l'endroit (l'orientation du téléphone), puis
  // la coucher sur le papier si elle est en largeur. Deux appels à rotate()
  // se remplaceraient : l'orientation passe donc par autoOrient().
  const droite = await sharp(octets).autoOrient().toBuffer({ resolveWithObject: true })
  const couchee = droite.info.width > droite.info.height
  const redressee = await sharp(droite.data).rotate(couchee ? 90 : 0)
    .resize(L - 2 * bord, H - 2 * bord, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = redressee.info

  return sharp({ create: { width: L, height: H, channels: 3, background: '#ffffff' } })
    .composite([{ input: redressee.data, left: Math.round((L - w) / 2), top: Math.round((H - h) / 2) }])
    .withMetadata({ density: PPP })
    .jpeg({ quality: 93, mozjpeg: true })
    .toBuffer()
}
