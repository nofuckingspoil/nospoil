// Le questionnaire s'ouvre depuis un lien personnel : il n'a rien à faire
// dans un moteur de recherche, et une page d'enquête indexée attirerait des
// réponses d'inconnus qui fausseraient la mesure.
import { langueDeParams } from '../../../lib/langue-lien'
import { t } from '../../../lib/i18n'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return {
    title: t({ fr: 'Votre avis', en: 'Your feedback', de: 'Ihre Meinung' }, lang),
    description: t({
      fr: 'Quelques questions sur votre expérience Time to Flash.',
      en: 'A few questions about your Time to Flash experience.',
      de: 'Ein paar Fragen zu Ihrer Erfahrung mit Time to Flash.',
    }, lang),
    robots: { index: false, follow: false },
  }
}

export default function AvisLayout({ children }) {
  return children
}
