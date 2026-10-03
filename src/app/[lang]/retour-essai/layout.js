// Ouverte depuis un lien personnel : rien à faire dans un moteur de recherche.
import { langueDeParams } from '../../../lib/langue-lien'
import { t } from '../../../lib/i18n'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return {
    title: t({ fr: 'Votre essai', en: 'Your trial', de: 'Ihr Test' }, lang),
    robots: { index: false, follow: false },
  }
}

export default function RetourEssaiLayout({ children }) {
  return children
}
