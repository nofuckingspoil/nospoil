import { carteOG, nomEvenement, TAILLE_OG } from '../../../../lib/og'
import { langueDeParams } from '../../../../lib/langue-lien'
import { t } from '../../../../lib/i18n'

// Le texte alternatif dépend de la langue : il passe par
// generateImageMetadata plutôt que par une constante `alt`.
const ALT = {
  fr: "L'album photo de l'événement",
  en: 'The event photo album',
  de: 'Das Fotoalbum des Events',
}

export async function generateImageMetadata({ params }) {
  const lang = await langueDeParams(params)
  return [{ id: 'carte', alt: t(ALT, lang), size: TAILLE_OG, contentType: 'image/png' }]
}

export default async function Image({ params }) {
  const { id } = await params
  const lang = await langueDeParams(params)
  const nom = await nomEvenement(id)
  return carteOG({
    titre: nom || t({ fr: 'Les photos sont là', en: 'The photos are here', de: 'Die Fotos sind da' }, lang),
    accroche: t({
      fr: "L'album de la soirée, pris par tous les participants.",
      en: 'The event album, shot by every guest.',
      de: 'Das Album der Feier, fotografiert von allen Gästen.',
    }, lang),
    langue: lang,
  })
}
