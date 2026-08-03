import { BRAND } from '../../../lib/brand'
import { nomEvenement } from '../../../lib/og'

// Le titre nommait « un » album sans dire lequel : collé dans une messagerie,
// le lien ne disait pas à quelle fête on était convié.
export async function generateMetadata({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  const titre = nom ? `Participez à l'album de ${nom}` : 'Participez à l’album collectif !'
  const desc = `Scannez, prenez vos photos, et découvrez l’album après la fête. ${BRAND.pitch}`
  return {
    title: titre,
    description: desc,
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: titre, description: desc },
  }
}

export default function JoinLayout({ children }) {
  return children
}
