// ============================================================
//  Contrôle de forme des identifiants reçus du navigateur.
//
//  Toutes les clés de la base sont des UUID. Or les requêtes envoyées à
//  PostgREST sont assemblées comme du texte (`id=eq.${eventId}`) : une valeur
//  qui contient un « & » cesse d'être une valeur, elle devient un paramètre
//  supplémentaire glissé dans la requête. On refuse donc la valeur en amont,
//  plutôt que de compter sur la base pour faire le tri.
//
//  Les jetons (organisateur, appareil, participant) ne sont pas concernés :
//  ils sont toujours passés à travers encodeURIComponent avant d'entrer dans
//  une requête, ou comparés en mémoire une fois la ligne lue.
// ============================================================
import 'server-only'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function estUuid(v) {
  return typeof v === 'string' && UUID.test(v.trim())
}

// Réponse commune : un identifiant mal formé n'est pas une panne du serveur,
// c'est une requête qui n'aurait jamais dû partir. On répond 400 sans détailler.
export function identifiantInvalide() {
  return Response.json({ error: 'Identifiant invalide.' }, { status: 400 })
}
