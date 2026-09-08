// ============================================================
//  Les rappels de la soirée : quand relancer les participants.
//
//  Trois dates encadrent désormais un événement : le début, la fin, la
//  révélation. La fin est la nouvelle venue, et c'est elle qui rend les
//  rappels justes : un vin d'honneur de deux heures et un mariage qui court
//  jusqu'à quatre heures du matin ne se relancent pas de la même façon.
//
//  DEUX PRINCIPES.
//
//  1. Par défaut, on calcule. L'organisateur n'a rien à régler : la durée de
//     sa fête donne le nombre de rappels et leur écartement. Il peut ensuite
//     choisir ses propres moments, et revenir à l'automatique.
//
//  2. Tout le monde n'est pas prévenu à la même seconde. Cinquante téléphones
//     qui vibrent ensemble, c'est une alarme d'immeuble, pas un rappel. Chaque
//     participant reçoit donc le sien avec un décalage de quelques minutes,
//     tiré de son identifiant : toujours le même pour lui, différent de celui
//     du voisin.
//
//  Fichier PUR (aucun import) : il est partagé tel quel avec l'application
//  iPhone, qui pose les notifications à partir de ces mêmes calculs.
// ============================================================

const MIN = 60 * 1000

// Durée retenue quand la fin n'est PAS renseignée : les événements créés avant
// l'existence du champ, et ceux dont l'organisateur n'a rien dit. Douze heures,
// comme la fenêtre qui sert déjà à décider qu'une fête est finie (lib/phase.js) :
// mieux vaut supposer trop long que fermer l'appareil photo au milieu du bal.
export const DUREE_PAR_DEFAUT_MIN = 12 * 60

// Durée PROPOSÉE à la création, qui est autre chose : c'est une soirée type,
// que l'organisateur ajuste sous les yeux. Personne n'organise une fête de
// douze heures par défaut.
export const DUREE_PROPOSEE_MIN = 6 * 60

// Décalage maximal entre deux participants, en minutes.
const ECART_MAX_MIN = 20

// ---------- Les trois dates ----------

function t(v) {
  const d = new Date(v || 0).getTime()
  return Number.isFinite(d) && d > 0 ? d : null
}

// Fin de l'événement, telle qu'on doit la lire partout ailleurs.
// À défaut : six heures de fête, sans jamais déborder sur la révélation.
export function finDe(ev) {
  const debut = t(ev?.startsAt)
  const reveal = t(ev?.revealAt)
  const fin = t(ev?.endsAt)
  if (fin && (!debut || fin > debut)) return reveal ? Math.min(fin, reveal) : fin
  if (!debut) return reveal
  const estimee = debut + DUREE_PAR_DEFAUT_MIN * MIN
  return reveal ? Math.min(estimee, reveal) : estimee
}

// Durée de la fête, en minutes.
export function dureeMin(ev) {
  const debut = t(ev?.startsAt)
  const fin = finDe(ev)
  if (!debut || !fin || fin <= debut) return DUREE_PAR_DEFAUT_MIN
  return Math.round((fin - debut) / MIN)
}

// Fin proposée à la création : le soir même, six heures après le début.
export function finParDefaut(debut) {
  const d = new Date(debut)
  if (isNaN(d.getTime())) return null
  return new Date(d.getTime() + DUREE_PROPOSEE_MIN * MIN)
}

// ---------- Le plan automatique ----------

// Combien de rappels pour une fête de cette longueur ? Un rappel toutes les
// deux ou trois heures : assez pour ressortir le téléphone, jamais assez pour
// devenir une sonnerie de fond.
export function nombreRappels(minutes) {
  if (minutes < 180) return 1 // un vin d'honneur : un seul, au milieu
  if (minutes < 420) return 2 // la soirée classique : deux, espacés de deux heures
  if (minutes < 660) return 3
  return 4
}

// Les rappels calculés, en minutes après le début.
//
// On ne relance personne dans la première demi-heure (tout le monde arrive, et
// la pellicule est intacte), ni dans le dernier quart d'heure (il est trop tard
// pour sortir son téléphone). Entre les deux, on répartit à intervalle égal.
export function rappelsAutomatiques(ev) {
  const duree = dureeMin(ev)
  const n = nombreRappels(duree)
  const margeDebut = Math.min(45, Math.round(duree * 0.2))
  const margeFin = Math.min(30, Math.round(duree * 0.15))
  const debut = margeDebut
  const fin = Math.max(debut + 1, duree - margeFin)
  const pas = (fin - debut) / (n + 1)

  const out = []
  for (let i = 1; i <= n; i++) {
    const m = Math.round((debut + pas * i) / 5) * 5 // arrondi aux 5 minutes
    if (m > 0 && m < duree && !out.includes(m)) out.push(m)
  }
  return out
}

// Le plan retenu : celui de l'organisateur s'il en a choisi un, sinon le nôtre.
// Un tableau vide est un choix, pas un oubli : il veut le silence.
export function planRappels(ev) {
  const choisis = ev?.rappels
  if (Array.isArray(choisis)) return nettoyerRappels(choisis, dureeMin(ev))
  return rappelsAutomatiques(ev)
}

// L'organisateur choisit-il lui-même ses moments ?
export function rappelsPersonnalises(ev) {
  return Array.isArray(ev?.rappels)
}

// Remise en ordre d'une liste venue du dehors : des minutes entières, dans les
// bornes de la fête, sans doublon, triées. Six au maximum : au delà, ce n'est
// plus un rappel, c'est du harcèlement.
export function nettoyerRappels(liste, duree = DUREE_PAR_DEFAUT_MIN) {
  if (!Array.isArray(liste)) return []
  const max = Math.max(1, Math.round(duree))
  const vus = new Set()
  for (const v of liste) {
    const m = Math.round(Number(v))
    if (!Number.isFinite(m) || m <= 0 || m > max) continue
    vus.add(m)
  }
  return [...vus].sort((a, b) => a - b).slice(0, 6)
}

// ---------- Le décalage propre à chaque participant ----------

// Un nombre stable entre 0 et 1, tiré d'une chaîne (l'identifiant du
// participant). Le même téléphone retrouve toujours son décalage : un rappel
// reprogrammé ne saute pas d'un quart d'heure à chaque photo prise.
function grain(cle) {
  const s = String(cle || '')
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

// De combien de minutes on peut décaler sans empiéter sur le rappel voisin.
function ecartPossible(plan) {
  if (!plan.length) return 0
  let espace = plan.length > 1 ? Math.min(...plan.slice(1).map((m, i) => m - plan[i])) : ECART_MAX_MIN * 4
  return Math.max(0, Math.min(ECART_MAX_MIN, Math.floor(espace / 4)))
}

// Les moments de rappel d'UN participant, en dates absolues (millisecondes).
//
// `cle` : son identifiant. Sans clé, on renvoie les moments théoriques, ceux
// que le tableau de bord montre à l'organisateur.
//
// On écarte ce qui n'a plus d'objet : un rappel passé, ou tombant après la
// révélation (l'album est ouvert, il n'y a plus rien à photographier).
export function momentsRappels(ev, cle = null, maintenant = Date.now()) {
  const debut = t(ev?.startsAt)
  if (!debut) return []
  const reveal = t(ev?.revealAt)
  const plan = planRappels(ev)
  const ecart = cle ? ecartPossible(plan) : 0
  const g = ecart ? grain(cle) : 0.5

  const out = []
  for (const minutes of plan) {
    const decalage = ecart ? Math.round((g * 2 - 1) * ecart) : 0
    const quand = debut + (minutes + decalage) * MIN
    if (quand <= maintenant) continue
    if (reveal && quand >= reveal) continue
    out.push(quand)
  }
  return out
}

// ---------- Affichage ----------

// « 20:30 », dans l'heure locale de celui qui regarde.
export function heureDe(ms) {
  try {
    return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

// Une minute après le début, ramenée à l'heure qu'il sera ce soir-là.
export function heureDuRappel(startsAt, minutes) {
  const debut = t(startsAt)
  if (!debut) return ''
  return heureDe(debut + Math.round(Number(minutes) || 0) * MIN)
}

// Le jour d'un rappel, en court : « dim. 13 sept. ». Une soirée qui passe
// minuit relance ses participants le lendemain : l'heure seule ne suffit plus.
export function jourDuRappel(startsAt, minutes, court = false) {
  const debut = t(startsAt)
  if (!debut) return ''
  const quand = new Date(debut + Math.round(Number(minutes) || 0) * MIN)
  try {
    // En court, le jour de la semaine suffit : dans une liste d'horaires, la
    // date complète répétée trois fois noie l'information.
    return court
      ? quand.toLocaleDateString('fr-FR', { weekday: 'short' })
      : quand.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch { return '' }
}

// Ce rappel tombe-t-il un autre jour que le début de la fête ?
export function autreJourQueLeDebut(startsAt, minutes) {
  const debut = t(startsAt)
  if (!debut) return false
  const a = new Date(debut)
  const b = new Date(debut + Math.round(Number(minutes) || 0) * MIN)
  return a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate()
}

// L'inverse : une heure choisie dans un champ (« 23:15 ») redevient un nombre
// de minutes après le début. Une heure plus petite que celle du début appartient
// au lendemain : une fête qui commence à 19 h finit après minuit.
export function minutesDepuisHeure(startsAt, hhmm) {
  const debut = t(startsAt)
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim())
  if (!debut || !m) return null
  const d = new Date(debut)
  d.setHours(Number(m[1]), Number(m[2]), 0, 0)
  // Les secondes du début sont ignorées : sans cela, un événement commencé à
  // 15 h 41 min 43 s transformait « 17:30 » en 17:29 à l'affichage.
  const base = new Date(debut)
  base.setSeconds(0, 0)
  let minutes = Math.round((d.getTime() - base.getTime()) / MIN)
  if (minutes <= 0) minutes += 24 * 60
  return minutes
}
