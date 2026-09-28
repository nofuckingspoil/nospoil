import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'
import { BRAND } from '../../../lib/brand'
import { aideDe } from '../../../lib/aide'
import { t } from '../../../lib/i18n'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'

// Les liens du contenu partagé (« /guide ») prennent le préfixe de la langue.
function liensDansLaLangue(html, lang) {
  return html.replace(/href="(\/[^/"][^"]*)"/g, (_, chemin) => `href="${lien(chemin, lang)}"`)
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const AIDE = aideDe(lang)
  return {
    title: AIDE.title,
    description: AIDE.subtitle,
    alternates: alternates('/aide', lang),
    openGraph: {
      title: `${AIDE.title} | ${BRAND.name}`,
      description: AIDE.subtitle,
      url: SITE_URL + lien('/aide', lang),
      type: 'article',
      locale: localeOG(lang),
    },
  }
}

export default async function AidePage({ params }) {
  const lang = await langueDeParams(params)
  const AIDE = aideDe(lang)
  return (
    <main className="dj" aria-label={t({ fr: 'Aide', en: 'Help', de: 'Hilfe' }, lang)}>
      <SiteNav large />

      <div className="dj-wrap dj-head gd-head">
        <span className="dj-eyebrow">{t({ fr: 'aide', en: 'help', de: 'Hilfe' }, lang)}</span>
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
          <div dangerouslySetInnerHTML={{ __html: liensDansLaLangue(AIDE.body, lang) }} />

          <div className="dj-guide">
            <div>
              <h3>{t({
                fr: "Avant l'événement, plutôt que pendant",
                en: 'Before the event, rather than during it',
                de: 'Lieber vor dem Event als währenddessen',
              }, lang)}</h3>
              <span>
                {t({
                  fr: "La plupart de ces pannes s'évitent en préparant bien le jour J : où poser le QR code, quoi faire dire au micro, comment débloquer les timides.",
                  en: 'Most of these problems can be avoided by preparing the day well: where to put the QR code, what to have announced on the mic, how to get shy guests going.',
                  de: 'Die meisten dieser Probleme lassen sich mit guter Vorbereitung vermeiden: wo der QR-Code hinkommt, was am Mikrofon gesagt wird, wie man schüchterne Gäste aus der Reserve lockt.',
                }, lang)}
              </span>
            </div>
            <Link className="dj-btn" href={lien('/journal/evenement-cree-et-maintenant', lang)}>
              {t({ fr: 'Lire le déroulé', en: 'Read the run-through', de: 'Zum Ablauf' }, lang)}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
