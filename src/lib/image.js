// ============================================================
//  « Ce fichier est-il vraiment une image ? »
//
//  On ne se fie ni au nom du fichier ni au type annoncé par le navigateur :
//  les deux sont écrits par celui qui envoie. On lit les tout premiers octets,
//  que chaque format d'image commence par une signature reconnaissable.
//
//  Le but n'est pas de trier le JPEG du PNG : le stockage réétiquette tout en
//  « image/jpeg », donc rien de ce qui est déposé ici ne peut être exécuté par
//  un navigateur. Le but est de refuser ce qui n'est pas une image du tout,
//  pour ne pas transformer l'album en hébergeur de fichiers quelconques.
// ============================================================
import 'server-only'

function commencePar(bytes, offset, signature) {
  if (bytes.length < offset + signature.length) return false
  for (let i = 0; i < signature.length; i++) {
    if (bytes[offset + i] !== signature[i]) return false
  }
  return true
}

const texte = (s) => [...s].map((c) => c.charCodeAt(0))

// ============================================================
//  La mini-version d'une photo, fabriquée ici quand elle n'arrive pas.
//
//  Le site prépare la sienne dans le navigateur avant l'envoi. L'app native,
//  elle, confie le transfert au système, qui ne sait poster qu'un seul fichier :
//  ses photos arrivaient donc sans mini-version, et c'est la photo entière
//  (2000 px, ~1,3 Mo) qui redescendait ensuite sur le téléphone des
//  participants, dans l'album comme sur le mur du groupe.
//
//  640 px de large, qualité 60 : environ 60 Ko. De quoi remplir une vignette,
//  et vingt fois plus léger que l'original.
// ============================================================
export async function miniature(bytes, { taille = 640, qualite = 60 } = {}) {
  try {
    const { default: sharp } = await import('sharp')
    return await sharp(bytes)
      // L'orientation est écrite dans les métadonnées de la photo, et la
      // conversion les jette : sans cette rotation, les photos prises en
      // tenant le téléphone de travers ressortaient couchées.
      .rotate()
      .resize({ width: taille, height: taille, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: qualite, mozjpeg: true })
      .toBuffer()
  } catch {
    // Pas de mini-version : on retombera sur la photo entière, comme avant.
    return null
  }
}

export function estImage(bytes) {
  if (!bytes || bytes.length < 12) return false

  if (commencePar(bytes, 0, [0xff, 0xd8, 0xff])) return true                       // JPEG
  if (commencePar(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true // PNG
  if (commencePar(bytes, 0, texte('GIF8'))) return true                            // GIF
  if (commencePar(bytes, 0, texte('RIFF')) && commencePar(bytes, 8, texte('WEBP'))) return true // WebP
  if (commencePar(bytes, 4, texte('ftyp'))) return true                            // HEIC / HEIF (iPhone)

  return false
}
