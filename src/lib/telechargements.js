// ============================================================
//  Lire les téléchargements honnêtement.
//
//  Le compteur historique (events.download_count) compte chaque appui sur un
//  bouton de téléchargement : une photo seule depuis la visionneuse pèse
//  autant qu'un album entier, et la même personne qui appuie trois fois
//  compte trois fois. La table `downloads` garde le détail (appareil, nombre
//  de photos, heure) : c'est d'elle qu'on tire des chiffres qui veulent dire
//  quelque chose.
// ============================================================

// Album complet : au moins 90 % des photos de l'album d'un coup (quelques
// photos masquées ou ajoutées depuis ne doivent pas le faire basculer).
// Sélection : plusieurs photos, mais pas l'album. Photo seule : une.
export function genreTelechargement(nbPhotos, totalAlbum) {
  const n = Number(nbPhotos) || 0
  if (n <= 1) return 'photo'
  if (totalAlbum > 1 && n >= Math.ceil(totalAlbum * 0.9)) return 'album'
  return 'selection'
}

export const LIBELLES = {
  album: 'album complet',
  selection: 'sélection',
  photo: 'photo seule',
}

// Le résumé d'une soirée : combien d'albums, de sélections, de photos
// seules, et surtout combien de PERSONNES (téléphones distincts).
export function resumerTelechargements(lignes, totalAlbum) {
  const r = { albums: 0, selections: 0, photos: 0, personnes: 0 }
  const vus = new Set()
  for (const l of lignes || []) {
    const g = genreTelechargement(l.photo_count, totalAlbum)
    if (g === 'album') r.albums++
    else if (g === 'selection') r.selections++
    else r.photos++
    vus.add(l.device_token || `inconnu-${l.id || Math.random()}`)
  }
  r.personnes = vus.size
  return r
}
