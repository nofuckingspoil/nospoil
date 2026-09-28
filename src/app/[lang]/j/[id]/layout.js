import { marque } from '../../../../lib/brand'
import { BANNIERE_APP } from '../../../../lib/banniere-app'
import { nomEvenement } from '../../../../lib/og'
import { langueDeParams, localeOG } from '../../../../lib/langue-lien'
import { t } from '../../../../lib/i18n'

// Le titre nommait « un » album sans dire lequel : collé dans une messagerie,
// le lien ne disait pas à quelle fête on était convié.
export async function generateMetadata({ params }) {
  const { id } = await params
  const lang = await langueDeParams(params)
  const nom = await nomEvenement(id)
  const titre = nom
    ? t({ fr: `Participez à l'album de ${nom}`, en: `Join ${nom}'s album`, de: `Machen Sie mit beim Album: ${nom}` }, lang)
    : t({ fr: 'Participez à l’album collectif !', en: 'Join the shared album!', de: 'Machen Sie mit beim gemeinsamen Album!' }, lang)
  const desc = t({
    fr: 'Scannez, prenez vos photos, et découvrez l’album après la fête.',
    en: 'Scan, take your photos, and discover the album after the party.',
    de: 'Scannen, Fotos aufnehmen und das Album nach der Feier entdecken.',
  }, lang) + ' ' + marque(lang).pitch
  return {
    title: titre,
    description: desc,
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: desc, type: 'website', locale: localeOG(lang) },
    twitter: { card: 'summary_large_image', title: titre, description: desc },
    other: BANNIERE_APP,
  }
}

export default function JoinLayout({ children }) {
  return children
}
