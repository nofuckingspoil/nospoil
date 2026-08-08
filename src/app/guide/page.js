import { Fragment } from 'react'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import { BRAND } from '../../lib/brand'
import { GUIDE, CHAPTERS, CHECKLIST } from '../../lib/guide'
import GuideGate from './GuideGate'

const URL = 'https://timetoflash.fr/guide'

export const metadata = {
  title: GUIDE.title,
  description: GUIDE.promise,
  alternates: { canonical: '/guide' },
  openGraph: {
    title: `${GUIDE.title} | ${BRAND.name}`,
    description: GUIDE.promise,
    url: URL,
    type: 'article',
  },
}

// Le premier chapitre est offert : on montre la qualité avant de demander
// l'adresse. Le reste passe derrière le formulaire.
const [FIRST, ...REST] = CHAPTERS

function Chapter({ c }) {
  return (
    <section className="gd-chap" id={`chapitre-${c.n}`}>
      <span className="gd-chap-n">Chapitre {c.n}</span>
      <h2>{c.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: c.body }} />
    </section>
  )
}

export default function GuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: GUIDE.title,
    description: GUIDE.promise,
    inLanguage: 'fr-FR',
    mainEntityOfPage: URL,
    publisher: { '@type': 'Organization', name: BRAND.name, url: 'https://timetoflash.fr' },
  }

  return (
    <main className="dj" aria-label={GUIDE.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav large />

      <div className="dj-wrap dj-head gd-head">
        <span className="dj-eyebrow">guide gratuit</span>
        <h1>{GUIDE.title}</h1>
        <p>{GUIDE.promise}</p>
        <div className="gd-meta">
          <span>{CHAPTERS.length} chapitres</span>
          <span>{GUIDE.readingTime}</span>
          <span>Aide-mémoire inclus</span>
        </div>
      </div>

      <div className="dj-wrap">
        <div className="dj-prose">
          {/* SOMMAIRE (visible de tous) : c'est lui qui donne envie de la suite. */}
          <section className="gd-toc">
            <h2>Au programme</h2>
            <ol>
              {CHAPTERS.map((c) => (
                <li key={c.n}>
                  <strong>{c.title}</strong>
                  <span>{c.teaser}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Chapitre 1 en accès libre. */}
          <Chapter c={FIRST} />

          <GuideGate exchange={GUIDE.exchange}>
            {/* Un rappel posé au milieu de la lecture, sur le ton du guide :
                on rappelle que rien n'est figé, on ne presse personne. */}
            {REST.map((c) => (
              <Fragment key={c.n}>
                <Chapter c={c} />
                {c.n === 4 && (
                  <div className="dj-cta">
                    <div>
                      <h3>Créer l'événement prend deux minutes</h3>
                      <span>Les réglages vus dans les chapitres précédents se modifient jusqu'au jour J.</span>
                    </div>
                    <Link className="dj-btn dj-btn--dark" href="/create?tier=5">Créer mon événement</Link>
                  </div>
                )}
              </Fragment>
            ))}

            <section className="gd-chap">
              <span className="gd-chap-n">Aide-mémoire</span>
              <h2>La checklist de l'organisateur</h2>
              <div className="gd-check">
                {CHECKLIST.map((b) => (
                  <div key={b.when} className="gd-check-col">
                    <h3>{b.when}</h3>
                    <ul>{b.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>
          </GuideGate>

          <div className="dj-cta">
            <div>
              <h3>Prêt à lancer votre événement ?</h3>
              <span>Gratuit jusqu'à 5 participants, sans carte bancaire.</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href="/create?tier=5">Créer mon événement</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
