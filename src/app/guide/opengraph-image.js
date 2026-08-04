import { carteSite, TAILLE_OG } from '../../lib/og-site'
import { GUIDE, CHAPTERS } from '../../lib/guide'

// Aperçu du guide : c'est la page qu'on partage le plus en message privé,
// elle mérite sa propre carte plutôt que celle de l'accueil.
export const alt = `${GUIDE.title} — ${GUIDE.subtitle}`
export const size = TAILLE_OG
export const contentType = 'image/png'

export default function Image() {
  return carteSite({
    etiquette: 'Guide gratuit',
    titre: GUIDE.title,
    accroche: "Combien de clichés donner, quand révéler l'album, comment faire scanner tout le monde.",
    pied: `${CHAPTERS.length} chapitres · ${GUIDE.readingTime}`,
  })
}
