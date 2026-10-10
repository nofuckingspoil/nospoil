import PageCreation from './PageCreation'
import { alternates, langueDeParams } from '../../../lib/langue-lien'

// Adresse canonique sans paramètres : les liens /create?tier=100 (boutons des
// formules) sortaient dans Google comme une page à part (Search Console, 10/10/2026).
export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return { alternates: alternates('/create', lang) }
}

export default function Page() {
  return <PageCreation />
}
