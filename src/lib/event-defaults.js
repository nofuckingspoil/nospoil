// ============================================================
//  Valeurs de départ d'un événement.
//
//  Servent surtout au tunnel « express » (/create/express), où l'on paie
//  d'abord et où l'on nomme et date ensuite : l'événement doit bien être créé
//  avec quelque chose, puis se compléter depuis le tableau de bord.
// ============================================================

// Nom provisoire. Sert aussi de marqueur : tant que l'événement le porte,
// le tableau de bord sait qu'il reste à nommer.
export const DEFAULT_EVENT_NAME = 'Mon événement'

// Le marqueur ci-dessus reste en français (c'est lui qu'on enregistre et
// qu'on compare). Pour l'AFFICHER, passer par ces fonctions.
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr

export function nomEvenementParDefaut(langue) {
  return tr({ fr: DEFAULT_EVENT_NAME, en: 'My event', de: 'Mein Event' }, langue)
}

// Nom d'un événement tel qu'on l'affiche : le nom provisoire est traduit,
// un vrai nom choisi par l'organisateur est rendu tel quel.
export function nomAffiche(nom, langue) {
  return nom === DEFAULT_EVENT_NAME ? nomEvenementParDefaut(langue) : nom
}

// Clichés par participant à la création, réglable jusqu'au jour J.
export const DEFAULT_SHOTS = 5

export function atDay(daysAhead, hour, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

// Proposition par défaut pour le début : maintenant, à la minute près.
//
// On crée le plus souvent son album le jour même, voire pendant la fête. Pas
// d'arrondi au quart d'heure suivant : un début à 14 h 15 créé à 14 h 07 aurait
// gardé l'appareil fermé huit minutes, la soirée n'ayant « pas commencé ».
export function maintenant() {
  const d = new Date()
  d.setSeconds(0, 0)
  return d
}

// Fin proposée : le lendemain du début, à 8 h. La fête peut durer toute la
// nuit, et la révélation tombe le lendemain (voir REVELATION_PROPOSEE).
export const FIN_PROPOSEE = { days: 1, hour: 8 }

export function finProposee(debut) {
  return atDay(FIN_PROPOSEE.days, FIN_PROPOSEE.hour, debut)
}

// Révélation proposée : le lendemain à midi. Les photos prises au petit matin
// avec un réseau faible ont le temps d'arriver, et l'album se découvre au
// réveil plutôt que pendant qu'on dort.
export const REVELATION_PROPOSEE = { key: 'd1-12', days: 1, hour: 12 }

export function revelationProposee(debut) {
  return atDay(REVELATION_PROPOSEE.days, REVELATION_PROPOSEE.hour, debut)
}

// L'ancienne proposition (le prochain samedi à 19h), gardée pour qui l'importe
// encore.
export function nextSaturday() {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  d.setHours(19, 0, 0, 0)
  return d
}
