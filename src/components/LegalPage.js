import Link from 'next/link'
import Logo from './Logo'
import { BRAND } from '../lib/brand'
import { LEGAL_UPDATED, LEGAL_DOCS } from '../lib/legal'

// Gabarit commun aux pages légales (mentions, CGV, confidentialité).
export default function LegalPage({ doc }) {
  return (
    <div className="legal">
      <nav className="legal-nav">
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/" className="mono small legal-back">← Retour au site</Link>
      </nav>

      <article className="legal-wrap">
        <h1>{doc.title}</h1>
        <p className="legal-updated">Dernière mise à jour : {LEGAL_UPDATED}</p>
        <div className="legal-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />

        <div className="legal-other">
          <span className="eyebrow-mute">Voir aussi</span>
          <div>
            {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
              <Link key={d.slug} href={`/${d.slug}`}>{d.shortTitle || d.title}</Link>
            ))}
          </div>
        </div>
      </article>

      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
          <span className="mono">© 2026 · Hébergé en UE · RGPD</span>
        </div>
      </footer>
    </div>
  )
}
