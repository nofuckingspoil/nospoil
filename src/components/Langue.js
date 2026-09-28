'use client'

// La langue de la page, disponible dans tous les composants du navigateur.
//
//   const { t, lang, lien, locale } = useLangue()
//   t({ fr: 'Bonjour', en: 'Hello', de: 'Hallo' })
//
// Le rendu serveur connaît ainsi la bonne langue : pas de page qui s'affiche
// en français puis bascule.

import { createContext, useContext, useMemo } from 'react'
import { LANGUES, NOMS_LANGUES, LOCALES, definirLangue, t as choisir } from '../lib/i18n'
import { lien as lienLangue, sansLangue } from '../lib/langue-lien'

const Contexte = createContext('fr')

export function LangueProvider({ lang, children }) {
  // Dans le navigateur, les fonctions hors React (mails, partages, messages
  // d'erreur) lisent aussi cette langue.
  if (typeof window !== 'undefined') definirLangue(lang)
  return <Contexte.Provider value={lang}>{children}</Contexte.Provider>
}

export function useLangue() {
  const lang = useContext(Contexte)
  return useMemo(
    () => ({
      lang,
      locale: LOCALES[lang],
      t: (textes) => choisir(textes, lang),
      lien: (chemin) => lienLangue(chemin, lang),
    }),
    [lang]
  )
}

// Change de langue : mémorise le choix puis recharge la page dans la
// nouvelle langue (même adresse, avec ou sans préfixe /en /de).
export function changerLangue(nouvelle) {
  if (!LANGUES.includes(nouvelle)) return
  document.cookie = `ttf_langue=${nouvelle}; path=/; max-age=31536000; samesite=lax`
  const { pathname, search, hash } = window.location
  const base = sansLangue(pathname)
  const aPrefixe = /^\/(en|de)(\/|$)/.test(pathname)
  // Les pages de l'application gardent leur adresse ; les pages vitrines
  // prennent celle de leur langue.
  const appli = /^\/(j|g|event|admin|connexion|mes-evenements|mes-photos|avis|create)(\/|$)/.test(base)
  const cible = appli && !aPrefixe ? base : lienLangue(base, nouvelle)
  window.location.assign(cible + search + hash)
}

// Petit sélecteur FR · EN · DE.
export function SelecteurLangue({ className = '', style }) {
  const { lang, t } = useLangue()
  return (
    <div
      className={`selecteur-langue ${className}`}
      style={{ display: 'inline-flex', gap: 2, alignItems: 'center', ...style }}
      role="group"
      aria-label={t({ fr: 'Langue', en: 'Language', de: 'Sprache' })}
    >
      {LANGUES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          title={NOMS_LANGUES[l]}
          aria-pressed={l === lang}
          onClick={() => l !== lang && changerLangue(l)}
          style={{
            background: 'none',
            border: 0,
            padding: '4px 6px',
            cursor: l === lang ? 'default' : 'pointer',
            font: 'inherit',
            fontFamily: 'var(--f-mono, monospace)',
            fontSize: 12,
            letterSpacing: '0.06em',
            color: 'inherit',
            opacity: l === lang ? 1 : 0.55,
            fontWeight: l === lang ? 700 : 400,
            textDecoration: l === lang ? 'underline' : 'none',
            textUnderlineOffset: 3,
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
