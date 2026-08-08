import { carteOG, nomEvenement, TAILLE_OG } from '../../../lib/og'

export const size = TAILLE_OG
export const contentType = 'image/png'
export const alt = "L'album photo de l'événement"

export default async function Image({ params }) {
  const { id } = await params
  const nom = await nomEvenement(id)
  return carteOG({
    titre: nom || 'Les photos sont là',
    accroche: "L'album de la soirée, pris par tous les participants.",
  })
}
