import { carteSite, TAILLE_OG } from '../../lib/og-site'
import { langueDeParams } from '../../lib/langue-lien'
import { t } from '../../lib/i18n'

// Aperçu par défaut du site : sert pour l'accueil, et pour toute page qui
// n'a pas défini le sien (mentions légales, CGV, tarifs…).
//
// Le texte alternatif dépend de la langue : il passe donc par
// generateImageMetadata plutôt que par une constante `alt`.
const ALT = {
  fr: "Time to Flash, l'appareil photo jetable de vos événements",
  en: 'Time to Flash, the disposable camera for your events',
  de: 'Time to Flash, die digitale Einwegkamera für Ihre Events',
}

export async function generateImageMetadata({ params }) {
  const lang = await langueDeParams(params)
  return [{ id: 'carte', alt: t(ALT, lang), size: TAILLE_OG, contentType: 'image/png' }]
}

export default async function Image({ params }) {
  const lang = await langueDeParams(params)
  return carteSite({
    langue: lang,
    titre: t({
      fr: "L'appareil photo jetable de vos événements.",
      en: 'The disposable camera for your events.',
      de: 'Die digitale Einwegkamera für Ihre Events.',
    }, lang),
    accroche: t({
      fr: "Un QR code, quelques clichés par participant, et toutes les photos qui se révèlent après la fête.",
      en: 'One QR code, a few shots per guest, and every photo revealed after the party.',
      de: 'Ein QR-Code, ein paar Fotos pro Gast, und alle Bilder werden nach der Feier für alle sichtbar.',
    }, lang),
  })
}
