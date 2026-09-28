import { carteOG, nomEvenement, TAILLE_OG } from '../../../../lib/og'
import { langueDeParams } from '../../../../lib/langue-lien'
import { t } from '../../../../lib/i18n'

// Le texte alternatif dépend de la langue : il passe par
// generateImageMetadata plutôt que par une constante `alt`.
const ALT = {
  fr: "Invitation à l'album photo collectif",
  en: 'Invitation to the shared photo album',
  de: 'Einladung zum gemeinsamen Fotoalbum',
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
    titre: nom || t({ fr: 'Vous êtes invité', en: "You're invited", de: 'Sie sind eingeladen' }, lang),
    accroche: t({
      fr: 'Prenez les photos de la soirée, découvrez-les toutes ensuite.',
      en: 'Take photos at the party, then discover them all afterwards.',
      de: 'Fotografieren Sie die Feier und entdecken Sie danach alle Bilder.',
    }, lang),
    langue: lang,
  })
}
