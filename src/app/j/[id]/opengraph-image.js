import { carteOG, nomEvenement, TAILLE_OG } from '../../../lib/og'

export const size = TAILLE_OG
export const contentType = 'image/png'
export const alt = "Invitation à l'album photo collectif"

export default async function Image({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  return carteOG({
    titre: nom || 'Vous êtes invité',
    accroche: 'Prenez les photos de la soirée, découvrez-les toutes ensuite.',
  })
}
