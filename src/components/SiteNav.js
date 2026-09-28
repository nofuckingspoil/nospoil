'use client'

import Link from 'next/link'
import Logo from './Logo'
import { useLangue, SelecteurLangue, changerLangue } from './Langue'
import { LANGUES, NOMS_LANGUES } from '../lib/i18n'

// ============================================================
//  Barre du site public.
//
//  Elle n'existait que sur l'accueil : depuis un article du blog, on ne
//  pouvait ni se connecter, ni retrouver ses événements, ni en créer un.
//
//  Elle suit maintenant le défilement, et sur téléphone le bouton de
//  création reste posé en bas de l'écran : c'est le seul geste qu'on
//  vient faire, il n'a pas à remonter le chercher.
//
//  `large` aligne la barre sur les pages dont le contenu est plus large
//  que l'accueil : sinon elle paraît rentrée de soixante-dix pixels.
//
//  Le choix de la langue : les trois boutons FR · EN · DE sur ordinateur ;
//  sur téléphone, la barre est déjà pleine, on n'y met que la langue en
//  cours (« EN ▾ ») qui ouvre la liste native du téléphone.
// ============================================================

// Styles propres au sélecteur de la barre : quelques lignes, gardées ici
// plutôt que dans la feuille globale.
const STYLES = `
.vnav-langue-mobile { display: none; }
@media (max-width: 680px) {
  .vnav-langue-large { display: none !important; }
  .vnav-langue-mobile { display: inline-flex; position: relative; align-items: center; gap: 2px;
    font-family: var(--f-mono, monospace); font-size: 12px; letter-spacing: .06em; font-weight: 700;
    color: var(--text2); padding: 4px 2px; }
  .vnav-langue-mobile select { position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; font-size: 16px; border: 0; }
}
@media (max-width: 400px) {
  .vnav { padding-left: 14px !important; padding-right: 14px !important; }
  .vnav-links { gap: 11px !important; }
  .vnav .logo-nom { font-size: 19px !important; }
}
`

function LangueMobile() {
  const { lang, t } = useLangue()
  return (
    <span className="vnav-langue-mobile">
      <span aria-hidden="true">{lang.toUpperCase()}</span>
      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <select
        value={lang}
        onChange={(e) => changerLangue(e.target.value)}
        aria-label={t({ fr: 'Langue', en: 'Language', de: 'Sprache' })}
      >
        {LANGUES.map((l) => (
          <option key={l} value={l} lang={l}>{NOMS_LANGUES[l]}</option>
        ))}
      </select>
    </span>
  )
}

export default function SiteNav({ large = false }) {
  const { t, lien } = useLangue()
  return (
    <>
      <style>{STYLES}</style>
      <div className={`vnav-bar ${large ? 'large' : ''}`}>
        <nav className="vnav">
          <Link href={lien('/')} style={{ textDecoration: 'none' }} aria-label={t({ fr: 'Accueil Time to Flash', en: 'Time to Flash home', de: 'Time to Flash Startseite' })}>
            <Logo nameSize={22} size={36} nameClassName="logo-nom" />
          </Link>
          <div className="vnav-links">
            <Link href={lien('/journal')} className="mono small">Blog</Link>
            {/* « Mes événements » et « Connexion » servaient le même visiteur :
                celui qui revient. La page fusionnée propose déjà la connexion
                quand elle ne trouve aucun événement. */}
            <Link href="/mes-evenements" className="mono small">{t({ fr: 'Mon compte', en: 'My account', de: 'Mein Konto' })}</Link>
            <SelecteurLangue className="vnav-langue-large" style={{ color: 'var(--text2)' }} />
            <LangueMobile />
            <Link href="/create?tier=5" className="btn btn-dark vnav-cta">{t({ fr: 'Créer un événement', en: 'Create an event', de: 'Event erstellen' })}</Link>
          </div>
        </nav>
      </div>

      {/* Téléphone uniquement : le geste principal, toujours à portée de pouce. */}
      <Link href="/create?tier=5" className="vnav-bottom">{t({ fr: 'Créer mon événement →', en: 'Create my event →', de: 'Mein Event erstellen →' })}</Link>
    </>
  )
}
