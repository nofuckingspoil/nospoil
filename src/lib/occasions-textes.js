// Les longs textes des pages par occasion, côté serveur seulement.
// Voir occasions.js pour la liste et ce qui sert ailleurs.
import { ANNIVERSAIRES } from './occasions/anniversaires'
import { AUTRES_OCCASIONS, PAGE_OCCASIONS } from './occasions/autres'
import { BAPTEME } from './occasions/bapteme'

const TEXTES = { ...ANNIVERSAIRES, ...AUTRES_OCCASIONS, ...BAPTEME }

// Les textes d'une occasion dans une langue (repli sur le français).
export function textesOccasion(slug, langue = 'fr') {
  const o = TEXTES[slug]
  return o ? o[langue] || o.fr : null
}

export function textesPageOccasions(langue = 'fr') {
  return PAGE_OCCASIONS[langue] || PAGE_OCCASIONS.fr
}
