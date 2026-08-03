import { nomEvenement } from '../../../lib/og'

// Le lien de l'événement circule plus qu'on ne le croit : l'organisateur se
// l'envoie à lui-même, le transmet à la personne qui l'aide, le garde en
// favori. Sans ces lignes, il s'affichait partout sous le titre générique du
// site, sans dire de quelle fête il s'agissait.
export async function generateMetadata({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  const titre = nom ? `Tableau de bord de ${nom}` : 'Le tableau de bord de votre événement'
  const desc = 'Vos invités, vos photos et vos réglages, au même endroit.'
  return {
    title: titre,
    description: desc,
    // Page privée : elle n'a rien à faire dans un moteur de recherche.
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: titre, description: desc },
  }
}

export default function EventLayout({ children }) {
  return children
}
