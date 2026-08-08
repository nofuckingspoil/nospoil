import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import { BRAND } from '../../lib/brand'
import { AIDE } from '../../lib/aide'

const URL = 'https://timetoflash.fr/aide'

export const metadata = {
  title: AIDE.title,
  description: AIDE.subtitle,
  alternates: { canonical: '/aide' },
  openGraph: {
    title: `${AIDE.title} | ${BRAND.name}`,
    description: AIDE.subtitle,
    url: URL,
    type: 'article',
  },
}

export default function AidePage() {
  return (
    <main className="dj" aria-label="Aide">
      <SiteNav large />

      <div className="dj-wrap dj-head gd-head">
        <span className="dj-eyebrow">aide</span>
        <h1>{AIDE.title}</h1>
        <p>{AIDE.subtitle}</p>
      </div>

      <div className="dj-wrap">
        <div className="dj-hero">
          <div className="dj-hero-media">
            <img src={AIDE.image} alt={AIDE.caption} fetchPriority="high" decoding="async" />
          </div>
        </div>

        <div className="dj-prose">
          <p className="dj-lede">{AIDE.intro}</p>
          <div dangerouslySetInnerHTML={{ __html: AIDE.body }} />

          <div className="dj-guide">
            <div>
              <h3>Avant l'événement, plutôt que pendant</h3>
              <span>
                La plupart de ces pannes s'évitent en préparant bien le jour J : où poser
                le QR code, quoi faire dire au micro, comment débloquer les timides.
              </span>
            </div>
            <Link className="dj-btn" href="/journal/evenement-cree-et-maintenant">Lire le déroulé</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
