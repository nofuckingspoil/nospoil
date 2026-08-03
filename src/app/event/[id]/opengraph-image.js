import { carteOG, nomEvenement, TAILLE_OG } from '../../../lib/og'

export const size = TAILLE_OG
export const contentType = 'image/png'
export const alt = "Le tableau de bord de l'événement"

export default async function Image({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  return carteOG({
    titre: nom || 'Votre événement',
    // On rappelle que ce lien-là est celui de l'organisateur, pour qu'il ne
    // soit pas confondu avec l'invitation envoyée aux invités.
    accroche: 'Votre tableau de bord organisateur — lien à garder privé.',
  })
}
