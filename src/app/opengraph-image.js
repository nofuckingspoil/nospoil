import { carteSite, TAILLE_OG } from '../lib/og-site'

// Aperçu par défaut du site : sert pour l'accueil, et pour toute page qui
// n'a pas défini le sien (mentions légales, CGV, tarifs…).
export const alt = "Time to Flash — l'appareil photo jetable de vos événements"
export const size = TAILLE_OG
export const contentType = 'image/png'

export default function Image() {
  return carteSite({
    titre: "L'appareil photo jetable de vos événements.",
    accroche: "Un QR code, quelques clichés par invité, et toutes les photos qui se révèlent après la fête.",
  })
}
