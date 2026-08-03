import { nomEvenement } from '../../../lib/og'

// Titre et description propres à l'événement : sans eux, un lien collé dans une
// messagerie affichait le titre générique du site, sans rapport avec l'album.
export async function generateMetadata({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  const titre = nom ? `L'album de ${nom}` : "L'album de la soirée"
  const desc = 'Les photos prises par tous les invités, développées après la fête.'
  return {
    title: titre,
    description: desc,
    // L'album ne doit pas se retrouver dans un moteur de recherche.
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: titre, description: desc },
  }
}

export default function GalleryLayout({ children }) {
  return children
}
