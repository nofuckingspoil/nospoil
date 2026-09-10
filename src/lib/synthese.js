// ============================================================
//  « Votre album collaboratif » : la carte qui clôt la révélation.
//
//  Le résumé de soirée se terminait sur un bouton. Il se termine maintenant
//  sur une carte qui rassemble en un écran ce que la soirée a produit : les
//  trois chiffres, les deux bornes en images, et les deux faits qui se
//  racontent. C'est l'écran le plus partageable du produit, et c'est pour
//  cela qu'il s'enregistre et qu'il se partage.
//
//  Rien ici n'est demandé au serveur : la galerie porte déjà l'auteur, l'heure
//  et la vignette de chaque photo. Tout se calcule sur place, et la même
//  recette dessine la carte à l'écran et l'image qu'on emporte.
//
//  Ce qui n'y figure pas est aussi un choix : ni photo préférée (les votes
//  arrivent après, une carte figée mentirait), ni téléchargements (annoncer un
//  zéro à quelqu'un qui vient de réussir sa soirée n'a aucun intérêt).
// ============================================================

import { FORMATS, formatParId, police, ajuste } from './collage'

const HEURES = ['minuit', '1 h', '2 h', '3 h', '4 h', '5 h', '6 h', '7 h', '8 h', '9 h', '10 h', '11 h',
  'midi', '13 h', '14 h', '15 h', '16 h', '17 h', '18 h', '19 h', '20 h', '21 h', '22 h', '23 h']

export { FORMATS }

function heure(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
}

// Durée en clair : « 6 h 53 », « 48 min ».
function duree(a, b) {
  const min = Math.round((b - a) / 60000)
  if (min < 1) return null
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const reste = min % 60
  return reste ? `${h} h ${String(reste).padStart(2, '0')}` : `${h} h`
}

/**
 * Les chiffres de la soirée, calculés à partir de ce que la galerie a déjà.
 *
 * `photos` : la liste de l'album, dans l'ordre où elles ont été prises.
 * `guests` : [{ id, name }], pour nommer le photographe en chef.
 */
export function chiffresSoiree({ photos = [], guests = [] } = {}) {
  const prises = photos.filter((p) => !p.hidden)
  const parAuteur = new Map()
  for (const p of prises) {
    if (!p.guestId) continue
    const e = parAuteur.get(p.guestId) || { nom: p.who || 'Un participant', n: 0 }
    e.n++
    parAuteur.set(p.guestId, e)
  }

  // Le photographe en chef ne se proclame pas à égalité : un ex æquo ne se
  // raconte pas, on préfère ne rien dire.
  const classement = [...parAuteur.values()].sort((a, b) => b.n - a.n)
  const tete = classement[0] || null
  const partage = !!tete && classement.filter((e) => e.n === tete.n).length > 1
  const champion = tete && tete.n > 1 && !partage ? { nom: tete.nom, photos: tete.n } : null

  // Le créneau le plus chargé se compte par heure de la journée : une soirée
  // qui déborde sur le lendemain garde ainsi ses photos ensemble.
  const parHeure = new Array(24).fill(0)
  for (const p of prises) {
    const d = new Date(p.takenAt)
    if (!isNaN(d.getTime())) parHeure[d.getHours()]++
  }
  let pointe = null
  parHeure.forEach((n, h) => { if (n > 0 && (!pointe || n > pointe.n)) pointe = { h, n } })

  const premier = prises[0] || null
  const dernier = prises.length > 1 ? prises[prises.length - 1] : null

  return {
    photos: prises.length,
    photographes: parAuteur.size,
    moyenne: parAuteur.size ? Math.round((prises.length / parAuteur.size) * 10) / 10 : 0,
    champion,
    pointe: pointe
      ? { libelle: `entre ${HEURES[pointe.h]} et ${HEURES[(pointe.h + 1) % 24]}`, photos: pointe.n }
      : null,
    premier: premier ? { url: premier.url, heure: heure(premier.takenAt) } : null,
    dernier: dernier ? { url: dernier.url, heure: heure(dernier.takenAt) } : null,
    duree: premier && dernier
      ? duree(new Date(premier.takenAt).getTime(), new Date(dernier.takenAt).getTime())
      : null,
    // La date de la soirée, celle de la première photo : c'est le jour dont
    // les gens se souviennent, pas celui où l'album a été créé.
    date: premier ? premier.takenAt : null,
  }
}

function dateLongue(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

// Les coins arrondis n'existent pas partout : sans eux la carte reste juste,
// avec des angles droits.
function arrondi(ctx, x, y, l, h, r) {
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, l, h, r)
  else ctx.rect(x, y, l, h)
}

// Une photo recadrée au centre dans un rectangle, coins arrondis.
function vignette(ctx, img, x, y, l, h, rayon) {
  if (!img) return
  const sw = img.width || img.naturalWidth
  const sh = img.height || img.naturalHeight
  if (!sw || !sh) return
  const echelle = Math.max(l / sw, h / sh)
  const dl = sw * echelle
  const dh = sh * echelle
  ctx.save()
  arrondi(ctx, x, y, l, h, rayon)
  ctx.clip()
  ctx.drawImage(img, x + (l - dl) / 2, y + (h - dh) / 2, dl, dh)
  ctx.restore()
}

/**
 * La carte, dessinée sur un canvas : c'est elle qu'on enregistre et qu'on
 * partage. Les deux formats sortent du même code, il n'y a rien à tenir en
 * double.
 *
 * `images` : { premiere, derniere } déjà décodées (des `Image`), ou rien.
 */
export function dessinerSynthese(canvas, {
  chiffres,
  nom = '',
  images = {},
  format = 'post',
} = {}) {
  const F = formatParId(format)
  const w = F.w
  const h = F.h
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const display = police('--font-display', 'system-ui, sans-serif')
  const corps = police('--font-body', 'system-ui, sans-serif')
  const mono = police('--font-mono', 'ui-monospace, monospace')

  // Les couleurs du produit, en dur : l'image doit sortir pareille quel que
  // soit le thème du navigateur qui la fabrique.
  const NUIT = '#0E1017'
  const CREME = '#E7E1D4'
  const ACCENT = '#FF8A5C'
  const AMBRE = '#F4C14E'
  const DOUX = 'rgba(255,255,255,.55)'
  const TRAIT = 'rgba(255,255,255,.12)'

  ctx.fillStyle = NUIT
  ctx.fillRect(0, 0, w, h)

  // Une lueur chaude en haut : la même que sur les images à partager, pour que
  // les deux se reconnaissent comme sortant du même endroit.
  const halo = ctx.createRadialGradient(w / 2, h * 0.1, 0, w / 2, h * 0.1, w * 0.9)
  halo.addColorStop(0, 'rgba(236,91,51,.16)')
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.fillRect(0, 0, w, h)

  const marge = Math.round(w * 0.085)
  const large = w - marge * 2

  // Tout se pose par le HAUT, jamais par la ligne de base : mélanger les deux
  // faisait chevaucher le titre et sa date, et c'est exactement ce qui s'était
  // passé au premier essai.
  ctx.textBaseline = 'top'

  // Une étiquette en petites capitales espacées, posée par son coin haut-gauche
  // (ou centrée, au choix). Elle rend la hauteur consommée.
  function etiquette(texte, x, y, taille, couleur, aligne = 'left', gras = 700) {
    ctx.save()
    ctx.textBaseline = 'top'
    ctx.textAlign = aligne
    ctx.font = `${gras} ${taille}px ${mono}`
    ctx.fillStyle = couleur
    try { ctx.letterSpacing = `${Math.round(taille * 0.18)}px` } catch {}
    ctx.fillText(texte.toUpperCase(), x, y)
    ctx.restore()
    return Math.round(taille * 1.25)
  }

  let y = Math.round(h * 0.062)

  y += etiquette('🎉 Votre album collaboratif', w / 2, y, Math.round(w * 0.026), AMBRE, 'center')
  y += Math.round(w * 0.035)

  if (nom) {
    const taille = ajuste(ctx, nom, large, Math.round(w * 0.095), (t) => `800 ${t}px ${display}`)
    ctx.font = `800 ${taille}px ${display}`
    ctx.fillStyle = CREME
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(nom, w / 2, y)
    y += Math.round(taille * 1.12)
  }

  const sousTitre = [chiffres.date ? dateLongue(chiffres.date) : '', chiffres.duree ? `${chiffres.duree} de fête` : '']
    .filter(Boolean)
    .join(' · ')
  if (sousTitre) {
    y += etiquette(sousTitre, w / 2, y, Math.round(w * 0.021), DOUX, 'center', 400)
  }

  // --- Les trois chiffres ---
  y += Math.round(w * 0.06)
  const colonnes = [
    { n: String(chiffres.photos), l: chiffres.photos > 1 ? 'photos prises' : 'photo prise' },
    { n: String(chiffres.photographes), l: chiffres.photographes > 1 ? 'photographes' : 'photographe' },
    { n: String(chiffres.moyenne).replace('.', ','), l: 'chacun' },
  ]
  const tailleN = Math.round(w * 0.09)
  const pas = large / 3
  colonnes.forEach((c, i) => {
    const cx = marge + pas * i + pas / 2
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.font = `800 ${tailleN}px ${display}`
    ctx.fillStyle = ACCENT
    ctx.fillText(c.n, cx, y)
    ctx.font = `400 ${Math.round(w * 0.026)}px ${corps}`
    ctx.fillStyle = DOUX
    ctx.fillText(c.l, cx, y + Math.round(tailleN * 1.08))
  })
  y += Math.round(tailleN * 1.08) + Math.round(w * 0.026 * 1.3) + Math.round(w * 0.055)

  // --- Les deux bornes de la soirée, en images ---
  // Une seule des deux peut manquer (un album d'une seule photo, une vignette
  // qui n'a pas voulu se charger) : on dessine ce qu'on a.
  const bornes = [
    images.premiere && chiffres.premier
      ? { img: images.premiere, txt: `La première · ${chiffres.premier.heure}` } : null,
    images.derniere && chiffres.dernier
      ? { img: images.derniere, txt: `La dernière · ${chiffres.dernier.heure}` } : null,
  ].filter(Boolean)

  if (bornes.length) {
    const gouttiere = Math.round(w * 0.025)
    const lv = bornes.length > 1 ? Math.round((large - gouttiere) / 2) : Math.round(large * 0.62)
    const hv = Math.round(lv * (format === 'story' ? 1.3 : 1.15))
    const rayon = Math.round(w * 0.022)
    const x0 = bornes.length > 1 ? marge : Math.round((w - lv) / 2)
    bornes.forEach((p, i) => {
      const x = x0 + (lv + gouttiere) * i
      ctx.fillStyle = 'rgba(255,255,255,.05)'
      arrondi(ctx, x, y, lv, hv, rayon)
      ctx.fill()
      vignette(ctx, p.img, x, y, lv, hv, rayon)

      // Un voile sous la légende : sur une photo claire, le texte blanc
      // disparaissait.
      ctx.save()
      arrondi(ctx, x, y, lv, hv, rayon)
      ctx.clip()
      const voile = ctx.createLinearGradient(0, y + hv * 0.7, 0, y + hv)
      voile.addColorStop(0, 'rgba(0,0,0,0)')
      voile.addColorStop(1, 'rgba(0,0,0,.62)')
      ctx.fillStyle = voile
      ctx.fillRect(x, y + hv * 0.7, lv, hv * 0.3)
      ctx.restore()

      const tailleL = Math.round(w * 0.02)
      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.font = `400 ${tailleL}px ${mono}`
      ctx.fillStyle = 'rgba(255,255,255,.92)'
      ctx.fillText(p.txt, x + Math.round(w * 0.018), y + hv - Math.round(w * 0.018))
      ctx.restore()
    })
    y += hv + Math.round(w * 0.05)
  }

  // --- Les deux faits qui se racontent ---
  const faits = []
  if (chiffres.champion) {
    faits.push({ k: 'Photographe en chef', v: chiffres.champion.nom, e: `${chiffres.champion.photos} clichés` })
  }
  if (chiffres.pointe) {
    faits.push({ k: 'Ça a le plus flashé', v: chiffres.pointe.libelle, e: `${chiffres.pointe.photos} photos` })
  }
  if (faits.length) {
    ctx.strokeStyle = TRAIT
    ctx.lineWidth = Math.max(1, Math.round(w * 0.0015))
    ctx.beginPath()
    ctx.moveTo(marge, y)
    ctx.lineTo(w - marge, y)
    ctx.stroke()
    y += Math.round(w * 0.035)

    const tailleV = Math.round(w * 0.029)
    const tailleE = Math.round(w * 0.023)
    for (const f of faits) {
      etiquette(f.k, marge, y + Math.round(tailleV * 0.15), Math.round(w * 0.019), DOUX)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.font = `700 ${tailleV}px ${corps}`
      ctx.fillStyle = CREME
      ctx.fillText(f.v, w - marge, y)
      ctx.font = `400 ${tailleE}px ${corps}`
      ctx.fillStyle = DOUX
      ctx.fillText(f.e, w - marge, y + Math.round(tailleV * 1.25))
      y += Math.round(tailleV * 1.25) + Math.round(tailleE * 1.5)
    }
  }

  // --- La signature, tout en bas ---
  const yPied = h - Math.round(w * 0.075)
  etiquette('Time to Flash', marge, yPied, Math.round(w * 0.024), 'rgba(255,255,255,.7)')
  etiquette('timetoflash.fr', w - marge, yPied, Math.round(w * 0.022), 'rgba(255,255,255,.38)', 'right', 400)

  return canvas
}

// Le fichier emporté : du JPEG, comme les images à partager de l'onglet
// « Créer ». Une carte en PNG pèserait trois fois plus pour rien.
export async function syntheseEnBlob(canvas) {
  return new Promise((r) => canvas.toBlob((b) => r(b), 'image/jpeg', 0.92))
}
