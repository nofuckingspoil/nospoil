import { Fragment } from 'react'
import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'
import SitePied from '../../../components/SitePied'
import { BRAND } from '../../../lib/brand'
import { guideDe, chapitresDe, checklistDe } from '../../../lib/guide'
import { t, LOCALES } from '../../../lib/i18n'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'
import GuideGate from './GuideGate'

// Les liens du contenu partagé (« /create?tier=5 ») prennent le préfixe de
// la langue.
function liensDansLaLangue(html, lang) {
  return html.replace(/href="(\/[^/"][^"]*)"/g, (_, chemin) => `href="${lien(chemin, lang)}"`)
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const GUIDE = guideDe(lang)
  return {
    title: GUIDE.title,
    description: GUIDE.promise,
    alternates: alternates('/guide', lang),
    openGraph: {
      title: `${GUIDE.title} | ${BRAND.name}`,
      description: GUIDE.promise,
      url: SITE_URL + lien('/guide', lang),
      type: 'article',
      locale: localeOG(lang),
    },
  }
}

function Chapter({ c, lang }) {
  return (
    <section className="gd-chap" id={`chapitre-${c.n}`}>
      <span className="gd-chap-n">{t({ fr: `Chapitre ${c.n}`, en: `Chapter ${c.n}`, de: `Kapitel ${c.n}` }, lang)}</span>
      <h2>{c.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: liensDansLaLangue(c.body, lang) }} />
    </section>
  )
}

export default async function GuidePage({ params }) {
  const lang = await langueDeParams(params)
  const GUIDE = guideDe(lang)
  const CHAPTERS = chapitresDe(lang)
  const CHECKLIST = checklistDe(lang)
  // Le premier chapitre est offert : on montre la qualité avant de demander
  // l'adresse. Le reste passe derrière le formulaire.
  const [FIRST, ...REST] = CHAPTERS
  const url = SITE_URL + lien('/guide', lang)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: GUIDE.title,
    description: GUIDE.promise,
    inLanguage: LOCALES[lang],
    mainEntityOfPage: url,
    publisher: { '@type': 'Organization', name: BRAND.name, url: 'https://timetoflash.fr' },
  }

  const creer = t({ fr: 'Créer mon événement', en: 'Create my event', de: 'Mein Event erstellen' }, lang)

  return (
    <main className="dj" aria-label={GUIDE.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav large />

      <div className="dj-wrap dj-head gd-head">
        <span className="dj-eyebrow">{t({ fr: 'guide gratuit', en: 'free guide', de: 'kostenloser Leitfaden' }, lang)}</span>
        <h1>{GUIDE.title}</h1>
        <p>{GUIDE.promise}</p>
        <div className="gd-meta">
          <span>{t({ fr: `${CHAPTERS.length} chapitres`, en: `${CHAPTERS.length} chapters`, de: `${CHAPTERS.length} Kapitel` }, lang)}</span>
          <span>{GUIDE.readingTime}</span>
          <span>{t({ fr: 'Aide-mémoire inclus', en: 'Checklist included', de: 'Mit Checkliste' }, lang)}</span>
        </div>
      </div>

      <div className="dj-wrap">
        <div className="dj-prose">
          {/* SOMMAIRE (visible de tous) : c'est lui qui donne envie de la suite. */}
          <section className="gd-toc">
            <h2>{t({ fr: 'Au programme', en: "What's inside", de: 'Das erwartet Sie' }, lang)}</h2>
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
          <Chapter c={FIRST} lang={lang} />

          <GuideGate exchange={GUIDE.exchange}>
            {/* Un rappel posé au milieu de la lecture, sur le ton du guide :
                on rappelle que rien n'est figé, on ne presse personne. */}
            {REST.map((c) => (
              <Fragment key={c.n}>
                <Chapter c={c} lang={lang} />
                {c.n === 4 && (
                  <div className="dj-cta">
                    <div>
                      <h3>{t({
                        fr: "Créer l'événement prend deux minutes",
                        en: 'Creating the event takes two minutes',
                        de: 'Ein Event zu erstellen dauert zwei Minuten',
                      }, lang)}</h3>
                      <span>{t({
                        fr: "Les réglages vus dans les chapitres précédents se modifient jusqu'au jour J.",
                        en: 'The settings covered in the previous chapters can be changed right up to the big day.',
                        de: 'Die Einstellungen aus den vorigen Kapiteln lassen sich bis zum großen Tag ändern.',
                      }, lang)}</span>
                    </div>
                    <Link className="dj-btn dj-btn--dark" href={lien('/create?tier=5', lang)}>{creer}</Link>
                  </div>
                )}
              </Fragment>
            ))}

            <section className="gd-chap">
              <span className="gd-chap-n">{t({ fr: 'Aide-mémoire', en: 'Checklist', de: 'Checkliste' }, lang)}</span>
              <h2>{t({ fr: "La checklist de l'organisateur", en: "The host's checklist", de: 'Die Checkliste für Gastgeber' }, lang)}</h2>
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
              <h3>{t({ fr: 'Prêt à lancer votre événement ?', en: 'Ready to launch your event?', de: 'Bereit für Ihr Event?' }, lang)}</h3>
              <span>{t({
                fr: "Gratuit jusqu'à 5 participants, sans carte bancaire.",
                en: 'Free for up to 5 guests, no bank card required.',
                de: 'Kostenlos bis 5 Gäste, ohne Kreditkarte.',
              }, lang)}</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href={lien('/create?tier=5', lang)}>{creer}</Link>
          </div>
        </div>
      </div>
      <SitePied lang={lang} />
    </main>
  )
}
