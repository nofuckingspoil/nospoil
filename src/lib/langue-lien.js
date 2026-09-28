// Adresses selon la langue, utilisables partout (serveur et navigateur).
import { LANGUES, LANGUE_PAR_DEFAUT, langueValide } from './i18n'

export const SITE_URL = 'https://timetoflash.fr'

// Retrouve la langue d'une page à partir de ses paramètres de route.
export async function langueDeParams(params) {
  const p = await params
  return langueValide(p?.lang) || LANGUE_PAR_DEFAUT
}

// '/journal' en anglais → '/en/journal'. Le français reste à la racine.
// Les adresses externes et les ancres sont rendues telles quelles.
export function lien(chemin, langue) {
  if (!chemin || typeof chemin !== 'string' || !chemin.startsWith('/') || chemin.startsWith('//')) return chemin
  if (/^\/(api|_next)\//.test(chemin) || /^\/(fr|en|de)(\/|$|\?|#)/.test(chemin)) return chemin
  if (!langueValide(langue) || langue === LANGUE_PAR_DEFAUT) return chemin
  return chemin === '/' ? `/${langue}` : `/${langue}${chemin}`
}

// Retire un éventuel préfixe de langue d'une adresse.
export function sansLangue(chemin) {
  return String(chemin || '/').replace(/^\/(fr|en|de)(?=\/|$)/, '') || '/'
}

// Pour les métadonnées d'une page vitrine : adresse canonique dans la langue
// courante, et les trois versions déclarées à Google (hreflang).
export function alternates(chemin, langue) {
  const languages = {}
  for (const l of LANGUES) languages[l] = lien(chemin, l)
  languages['x-default'] = chemin
  return { canonical: lien(chemin, langue), languages }
}

// Locale Open Graph (fr_FR, en_GB, de_DE).
export function localeOG(langue) {
  return { fr: 'fr_FR', en: 'en_GB', de: 'de_DE' }[langue] || 'fr_FR'
}
