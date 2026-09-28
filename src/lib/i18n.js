// ============================================================
//  Les langues de Time to Flash : français, anglais, allemand.
//
//  Fichier PARTAGÉ avec l'app native (copié à l'octet près) : il doit rester
//  pur, sans import ni accès au navigateur.
//
//  Chaque texte s'écrit à côté du code qui l'affiche, dans ses trois langues :
//
//    t({ fr: 'Bonjour', en: 'Hello', de: 'Hallo' })
//
//  Côté site, dans un composant React, on prend `t` et `lang` de useLangue()
//  (components/Langue.js) : le rendu serveur connaît ainsi la bonne langue.
//  Côté serveur (API, mails), on passe la langue en second argument :
//  t({ … }, langue).
// ============================================================

export const LANGUES = ['fr', 'en', 'de']
export const LANGUE_PAR_DEFAUT = 'fr'

// Nom de chaque langue, écrit dans cette langue (pour le sélecteur).
export const NOMS_LANGUES = { fr: 'Français', en: 'English', de: 'Deutsch' }

// Pour les dates, les nombres et les montants (Intl, toLocaleString…).
export const LOCALES = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE' }

export function langueValide(l) {
  return LANGUES.includes(l) ? l : null
}

// Langue courante du navigateur ou de l'app. Sur le serveur, on ne s'y fie
// JAMAIS (elle serait partagée entre visiteurs) : on passe la langue en
// argument.
//
// Elle est rangée sur globalThis pour que les fichiers partagés, qui n'ont
// pas le droit d'importer quoi que ce soit, puissent la lire aussi :
//   const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr
globalThis.__ttfLangue = globalThis.__ttfLangue || LANGUE_PAR_DEFAUT

export function definirLangue(l) {
  if (langueValide(l)) globalThis.__ttfLangue = l
}

export function langueCourante() {
  return langueValide(globalThis.__ttfLangue) || LANGUE_PAR_DEFAUT
}

// Choisit le texte dans la bonne langue. Repli sur le français si une langue
// manque, pour ne jamais afficher un trou.
export function t(textes, langue) {
  if (textes == null || typeof textes !== 'object') return textes
  const l = langueValide(langue) || langueCourante()
  return textes[l] ?? textes.fr
}

export function localeDe(langue) {
  return LOCALES[langueValide(langue) || langueCourante()]
}

// Devine la langue à partir d'une liste de préférences (en-tête
// Accept-Language du navigateur, ou langues du téléphone). Français ou
// allemand si le visiteur les parle, sinon anglais. Sans aucune indication
// (robots d'indexation), le français.
export function devinerLangue(preferences) {
  const liste = Array.isArray(preferences)
    ? preferences.map((p, i) => ({ code: String(p || ''), q: 1 - i / 100 }))
    : String(preferences || '')
        .split(',')
        .map((part) => {
          const [code, ...params] = part.trim().split(';')
          const qp = params.find((p) => p.trim().startsWith('q='))
          return { code, q: qp ? parseFloat(qp.trim().slice(2)) || 0 : 1 }
        })
  const codes = liste
    .filter((x) => x.code && x.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.code.toLowerCase().slice(0, 2))
  if (!codes.length) return LANGUE_PAR_DEFAUT
  for (const c of codes) if (langueValide(c)) return c
  return 'en'
}
