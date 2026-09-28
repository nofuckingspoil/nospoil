// ============================================================
//  « Votre album collaboratif » : la carte qui clôt la révélation.
//
//  Le résumé de soirée se terminait sur un bouton. Il se termine maintenant
//  sur une carte qui rassemble en un écran ce que la soirée a produit : les
//  trois chiffres, les deux bornes en images, et les deux faits qui se
//  racontent.
//
//  Rien ici n'est demandé au serveur : la galerie porte déjà l'auteur, l'heure
//  et la vignette de chaque photo. Tout se calcule sur place.
//
//  Ce qui n'y figure pas est aussi un choix : ni photo préférée (les votes
//  arrivent après, une carte figée mentirait), ni téléchargements (annoncer un
//  zéro à quelqu'un qui vient de réussir sa soirée n'a aucun intérêt).
// ============================================================

// Traductions : fichier partagé, donc aucun import. La langue vient du
// paramètre `langue`, sinon de celle de l'appareil.
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr
const langueDe = (l) => (['fr', 'en', 'de'].includes(l || globalThis.__ttfLangue) ? (l || globalThis.__ttfLangue) : 'fr')

const HEURES = ['minuit', '1 h', '2 h', '3 h', '4 h', '5 h', '6 h', '7 h', '8 h', '9 h', '10 h', '11 h',
  'midi', '13 h', '14 h', '15 h', '16 h', '17 h', '18 h', '19 h', '20 h', '21 h', '22 h', '23 h']

const HEURES_EN = ['midnight', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am',
  'noon', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm']

// « entre 21 h et 22 h », « between 9 pm and 10 pm », « zwischen 21 und 22 Uhr ».
function creneau(h, langue) {
  const l = langueDe(langue)
  const h2 = (h + 1) % 24
  if (l === 'en') return `between ${HEURES_EN[h]} and ${HEURES_EN[h2]}`
  if (l === 'de') return `zwischen ${h} und ${h2} Uhr`
  return `entre ${HEURES[h]} et ${HEURES[h2]}`
}

function heure(iso, langue) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const mm = String(d.getMinutes()).padStart(2, '0')
  const l = langueDe(langue)
  if (l === 'en') return `${String(d.getHours()).padStart(2, '0')}:${mm}`
  if (l === 'de') return `${d.getHours()}:${mm} Uhr`
  return `${d.getHours()}h${mm}`
}

// Durée en clair : « 6 h 53 », « 48 min ».
function duree(a, b, langue) {
  const min = Math.round((b - a) / 60000)
  if (min < 1) return null
  const l = langueDe(langue)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const reste = min % 60
  if (l === 'en') return reste ? `${h} hr ${reste} min` : `${h} hr${h > 1 ? 's' : ''}`
  if (l === 'de') return reste ? `${h} Std. ${reste} Min.` : `${h} Std.`
  return reste ? `${h} h ${String(reste).padStart(2, '0')}` : `${h} h`
}

/**
 * Les chiffres de la soirée, calculés à partir de ce que la galerie a déjà.
 *
 * `photos` : la liste de l'album, dans l'ordre où elles ont été prises.
 * `guests` : [{ id, name }], pour nommer le photographe en chef.
 * `langue` : facultative (par défaut, celle de l'appareil) ; sur le site,
 * pendant le rendu, toujours la passer.
 */
export function chiffresSoiree({ photos = [], guests = [], langue } = {}) {
  const prises = photos.filter((p) => !p.hidden)
  const parAuteur = new Map()
  for (const p of prises) {
    if (!p.guestId) continue
    const t = new Date(p.takenAt).getTime()
    const e = parAuteur.get(p.guestId) || { nom: p.who || tr({ fr: 'Un participant', en: 'A guest', de: 'Ein Gast' }, langue), n: 0, debut: t, fin: t }
    e.n++
    if (t < e.debut) e.debut = t
    if (t > e.fin) e.fin = t
    parAuteur.set(p.guestId, e)
  }

  // Le photographe en chef, départagé comme dans le bilan de l'organisateur :
  // à nombre égal de clichés, gagne celui qui a sorti les siens le plus vite.
  // Deux ex æquo sans vainqueur, ça ne se raconte pas.
  const classement = [...parAuteur.values()]
    .sort((a, b) => (b.n - a.n) || ((a.fin - a.debut) - (b.fin - b.debut)))
  const tete = classement[0] || null
  const partage = !!tete && classement.filter((e) => e.n === tete.n).length > 1
  const champion = tete && tete.n > 1
    ? {
        nom: tete.nom,
        photos: tete.n,
        // Le temps qu'il lui a fallu : c'est ce qui l'a départagé, et c'est ce
        // qui se raconte. Sans égalité, il n'y a rien à justifier.
        rapidite: partage ? duree(tete.debut, tete.fin, langue) : null,
      }
    : null

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
      ? { libelle: creneau(pointe.h, langue), photos: pointe.n }
      : null,
    premier: premier ? { url: premier.url, heure: heure(premier.takenAt, langue) } : null,
    dernier: dernier ? { url: dernier.url, heure: heure(dernier.takenAt, langue) } : null,
    duree: premier && dernier
      ? duree(new Date(premier.takenAt).getTime(), new Date(dernier.takenAt).getTime(), langue)
      : null,
    // La date de la soirée, celle de la première photo : c'est le jour dont
    // les gens se souviennent, pas celui où l'album a été créé.
    date: premier ? premier.takenAt : null,
  }
}
