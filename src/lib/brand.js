// ============================================================
//  Identité de la marque : tout est centralisé ici.
//  Pour renommer l'app, change UNIQUEMENT ces valeurs.
// ============================================================
export const BRAND = {
  name: 'Time to Flash',
  tagline: "L'appareil photo jetable de vos événements.",
  pitch: "Un QR code, un nombre de clichés limité par participant, et toutes les photos qui se révèlent après la fête. Aucune appli à installer.",
}

// La promesse de la marque dans chaque langue. BRAND garde le français pour
// les usages existants ; marque(langue) donne la bonne version.
const TEXTES_MARQUE = {
  en: {
    tagline: 'The disposable camera for your events.',
    pitch: 'One QR code, a limited number of shots per guest, and every photo revealed after the party. No app to install.',
  },
  de: {
    tagline: 'Die digitale Einwegkamera für Ihre Events.',
    pitch: 'Ein QR-Code, eine begrenzte Anzahl an Fotos pro Gast, alle Bilder werden erst nach Ihrer Feier präsentiert. Keine App nötig.',
  },
}

export function marque(langue) {
  return { ...BRAND, ...(TEXTES_MARQUE[langue] || {}) }
}

// Couleurs d'avatars (cycle), utilisées pour les pastilles participants.
export const AVATAR_COLORS = ['#EE7A45', '#6E466C', '#86C0C9', '#C25540', '#3D5A6C', '#9B5A6E', '#1F8A5B', '#E89A4B']

export function avatarColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
