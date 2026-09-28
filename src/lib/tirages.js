// ============================================================
//  Tirages papier : les formats, les prix, le calcul d'une commande.
//
//  Partagé entre l'album (qui affiche le prix pendant qu'on coche) et le
//  serveur (qui le recalcule, seul prix qui fasse foi : celui que montre le
//  navigateur peut toujours être retouché).
//
//  L'imprimeur n'est pas encore branché. Tant qu'il ne l'est pas, une commande
//  passée en local est simulée (voir /api/tirages), et la fonction reste
//  cachée en ligne : NEXT_PUBLIC_TIRAGES doit valoir « 1 » pour qu'elle
//  apparaisse.
// ============================================================

export function tiragesActifs() {
  return process.env.NEXT_PUBLIC_TIRAGES === '1'
}

export const FORMATS_TIRAGE = [
  { id: '10x15', nom: '10 × 15 cm', sous: 'Le classique, comme au labo', prix: 0.49 },
  // 15 × 20 plutôt que 13 × 18 : il a exactement la forme des photos de
  // l'appareil (3:4), et c'est le grand format de l'imprimeur.
  { id: '15x20', nom: '15 × 20 cm', sous: 'Le grand format, pour encadrer', prix: 0.89 },
]

export const FINITIONS = [
  { id: 'brillante', nom: 'Brillante', sous: 'Couleurs éclatantes, noirs profonds. La plus choisie' },
  { id: 'mate', nom: 'Mate', sous: 'Douce, sans reflets ni traces de doigts' },
]

// Un prix de port par pays, quel que soit le nombre de tirages (Prodigi nous
// facture 4,42 € vers la France, d'où 4,90 €) : une
// enveloppe de 10 ou de 60 photos part au même tarif. Hors de France, les
// montants sont provisoires : à caler sur les tarifs réels de Prodigi.
export const PAYS = [
  { code: 'FR', nom: 'France métropolitaine', port: 4.9 },
  { code: 'BE', nom: 'Belgique', port: 5.9 },
  { code: 'LU', nom: 'Luxembourg', port: 5.9 },
  { code: 'CH', nom: 'Suisse', port: 7.9 },
  { code: 'DE', nom: 'Allemagne', port: 5.9 },
  { code: 'ES', nom: 'Espagne', port: 5.9 },
  { code: 'IT', nom: 'Italie', port: 5.9 },
  { code: 'PT', nom: 'Portugal', port: 5.9 },
  { code: 'NL', nom: 'Pays-Bas', port: 5.9 },
  { code: 'AT', nom: 'Autriche', port: 5.9 },
  { code: 'IE', nom: 'Irlande', port: 5.9 },
  { code: 'DK', nom: 'Danemark', port: 5.9 },
  { code: 'SE', nom: 'Suède', port: 5.9 },
  { code: 'FI', nom: 'Finlande', port: 5.9 },
  { code: 'PL', nom: 'Pologne', port: 5.9 },
  { code: 'CZ', nom: 'Tchéquie', port: 5.9 },
  { code: 'GR', nom: 'Grèce', port: 5.9 },
  { code: 'GB', nom: 'Royaume-Uni', port: 7.9 },
  { code: 'NO', nom: 'Norvège', port: 7.9 },
]
export const PORT = PAYS[0].port

export function paysLivraison(code) {
  return PAYS.find((p) => p.code === code) || null
}

// Au total, tous exemplaires confondus, et par photo.
export const TIRAGES_MAX = 200
export const EXEMPLAIRES_MAX = 20

export function formatTirage(id) {
  return FORMATS_TIRAGE.find((f) => f.id === id) || FORMATS_TIRAGE[0]
}

// Tout se calcule en centimes : 12 × 0,49 en virgule flottante donne
// 5,879999…, et un total faux d'un centime sur un reçu fait mauvais effet.
// `nombre` : le nombre de tirages, exemplaires compris.
export function devisTirages(nombre, formatId, paysCode = 'FR') {
  const f = formatTirage(formatId)
  const pays = paysLivraison(paysCode) || PAYS[0]
  const n = Math.max(0, Math.min(TIRAGES_MAX, Math.floor(nombre) || 0))
  const photos = n * Math.round(f.prix * 100)
  const port = n > 0 ? Math.round(pays.port * 100) : 0
  return { nombre: n, format: f, pays, photos, port, total: photos + port }
}

// Proportions du papier, largeur sur hauteur, pour les aperçus : ce qu'on voit
// à l'écran doit avoir la forme exacte du tirage qu'on recevra.
export const PROPORTIONS = { '10x15': 102 / 152, '15x20': 152 / 203 }

// La bordure blanche de sécurité qui fait le tour de chaque tirage (en mm) et
// la largeur du papier : l'aperçu la dessine à la même échelle.
export const BORDURE_MM = 6
export const LARGEUR_MM = { '10x15': 102, '15x20': 152 }

export function euros(centimes) {
  return (centimes / 100).toFixed(2).replace('.', ',') + ' €'
}

// « dès 0,49 € » : le prix d'appel affiché avant qu'on ait rien choisi.
export const PRIX_APPEL = euros(Math.round(FORMATS_TIRAGE[0].prix * 100))
