import Link from 'next/link'
import Logo from './Logo'
import { BRAND } from '../lib/brand'
import { legalUpdated, legalDocs } from '../lib/legal'
import { t } from '../lib/i18n'
import { lien } from '../lib/langue-lien'

// Les liens internes écrits dans le HTML des documents (« /cgv »,
// « /politique-de-confidentialite ») prennent le préfixe de la langue.
function liensDansLaLangue(html, lang) {
  return html.replace(/href="(\/[^/"][^"]*)"/g, (_, chemin) => `href="${lien(chemin, lang)}"`)
}

// Gabarit commun aux pages légales (mentions, CGV, confidentialité).
export default function LegalPage({ doc, lang = 'fr' }) {
  return (
    <div className="legal">
      <nav className="legal-nav">
        <Link href={lien('/', lang)} style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href={lien('/', lang)} className="mono small legal-back">
          {t({ fr: '← Retour au site', en: '← Back to the site', de: '← Zurück zur Website' }, lang)}
        </Link>
      </nav>

      <article className="legal-wrap">
        <h1>{doc.title}</h1>
        <p className="legal-updated">
          {t({ fr: 'Dernière mise à jour : ', en: 'Last updated: ', de: 'Zuletzt aktualisiert: ' }, lang)}
          {legalUpdated(lang)}
        </p>
        <div className="legal-prose" dangerouslySetInnerHTML={{ __html: liensDansLaLangue(doc.html, lang) }} />

        <div className="legal-other">
          <span className="eyebrow-mute">{t({ fr: 'Voir aussi', en: 'See also', de: 'Siehe auch' }, lang)}</span>
          <div>
            {legalDocs(lang).filter((d) => d.slug !== doc.slug).map((d) => (
              <Link key={d.slug} href={lien(`/${d.slug}`, lang)}>{d.shortTitle || d.title}</Link>
            ))}
          </div>
        </div>
      </article>

      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
          <span className="mono">
            {t({ fr: '© 2026 · Hébergé en UE · RGPD', en: '© 2026 · Hosted in the EU · GDPR', de: '© 2026 · Gehostet in der EU · DSGVO' }, lang)}
          </span>
        </div>
      </footer>
    </div>
  )
}
