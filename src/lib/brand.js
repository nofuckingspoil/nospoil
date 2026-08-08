// ============================================================
//  Identité de la marque : tout est centralisé ici.
//  Pour renommer l'app, change UNIQUEMENT ces valeurs.
// ============================================================
export const BRAND = {
  name: 'Time to Flash',
  tagline: "L'appareil photo jetable de vos événements.",
  pitch: "Un QR code, un nombre de clichés limité par participant, et toutes les photos qui se révèlent après la fête. Aucune appli à installer.",
}

// Couleurs d'avatars (cycle), utilisées pour les pastilles participants.
export const AVATAR_COLORS = ['#EE7A45', '#6E466C', '#86C0C9', '#C25540', '#3D5A6C', '#9B5A6E', '#1F8A5B', '#E89A4B']

export function avatarColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
