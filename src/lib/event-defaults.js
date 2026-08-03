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

// Clichés par invité à la création — réglable jusqu'au jour J.
export const DEFAULT_SHOTS = 5

export function atDay(daysAhead, hour, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

// Proposition par défaut pour la soirée : le prochain samedi à 19h.
export function nextSaturday() {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  d.setHours(19, 0, 0, 0)
  return d
}
