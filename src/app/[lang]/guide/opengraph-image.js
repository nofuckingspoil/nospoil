import { carteSite, TAILLE_OG } from '../../../lib/og-site'
import { CHAPTERS, guideDe, chapitresDe } from '../../../lib/guide'
import { langueDeParams } from '../../../lib/langue-lien'
import { t } from '../../../lib/i18n'

// Aperçu du guide : c'est la page qu'on partage le plus en message privé,
// elle mérite sa propre carte plutôt que celle de l'accueil.
// Le texte alternatif dépend de la langue : il passe par
// generateImageMetadata plutôt que par une constante `alt`.
export async function generateImageMetadata({ params }) {
  const lang = await langueDeParams(params)
  const guide = guideDe(lang)
  return [{ id: 'carte', alt: `${guide.title} : ${guide.subtitle}`, size: TAILLE_OG, contentType: 'image/png' }]
}

export default async function Image({ params }) {
  const lang = await langueDeParams(params)
  const guide = guideDe(lang)
  const n = chapitresDe(lang).length || CHAPTERS.length
  return carteSite({
    etiquette: t({ fr: 'Guide gratuit', en: 'Free guide', de: 'Kostenloser Leitfaden' }, lang),
    titre: guide.title,
    accroche: t({
      fr: "Combien de clichés donner, quand révéler l'album, comment faire scanner tout le monde.",
      en: 'How many shots to give, when to reveal the album, how to get everyone scanning.',
      de: 'Wie viele Aufnahmen, wann das Album präsentieren, wie alle zum Scannen bringen.',
    }, lang),
    pied: t({
      fr: `${n} chapitres · ${guide.readingTime}`,
      en: `${n} chapters · ${guide.readingTime}`,
      de: `${n} Kapitel · ${guide.readingTime}`,
    }, lang),
    langue: lang,
  })
}
