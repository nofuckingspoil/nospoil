import LegalPage from '../../../components/LegalPage'
import { legalBySlug } from '../../../lib/legal'
import { BRAND } from '../../../lib/brand'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'

const SLUG = 'politique-de-confidentialite'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const doc = legalBySlug(SLUG, lang)
  return {
    title: doc.title,
    description: doc.description,
    alternates: alternates('/' + SLUG, lang),
    openGraph: {
      title: `${doc.title} | ${BRAND.name}`,
      description: doc.description,
      url: SITE_URL + lien('/' + SLUG, lang),
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function Page({ params }) {
  const lang = await langueDeParams(params)
  return <LegalPage doc={legalBySlug(SLUG, lang)} lang={lang} />
}
