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

// La livraison suit les enveloppes de l'imprimeur (Familink, à Rouen) : une
// lettre jusqu'à 5 tirages 10 × 15, une plus grande jusqu'à 20, une enveloppe
// cartonnée au-delà. Chaque palier couvre ce que Familink nous facture pour
// l'envoi, TVA comprise, avec une petite marge. Deux zones seulement : la
// France métropolitaine, et le reste de l'Union européenne (la Suisse, le
// Royaume-Uni et la Norvège sont écartés : hors UE, la douane compliquerait
// tout).
//
// [jusqu'à N tirages, prix France, prix Union européenne]
const PALIERS_PORT = {
  '10x15': [[5, 3.9, 4.9], [20, 4.9, 6.9], [62, 5.9, 11.9], [Infinity, 7.9, 15.9]],
  '15x20': [[8, 4.9, 6.9], [31, 5.9, 11.9], [Infinity, 7.9, 15.9]],
}

const UE = 'ue'
export const PAYS = [
  { code: 'FR', nom: 'France métropolitaine', zone: 'fr' },
  { code: 'BE', nom: 'Belgique', zone: UE },
  { code: 'LU', nom: 'Luxembourg', zone: UE },
  { code: 'DE', nom: 'Allemagne', zone: UE },
  { code: 'ES', nom: 'Espagne', zone: UE },
  { code: 'IT', nom: 'Italie', zone: UE },
  { code: 'PT', nom: 'Portugal', zone: UE },
  { code: 'NL', nom: 'Pays-Bas', zone: UE },
  { code: 'AT', nom: 'Autriche', zone: UE },
  { code: 'IE', nom: 'Irlande', zone: UE },
  { code: 'DK', nom: 'Danemark', zone: UE },
  { code: 'SE', nom: 'Suède', zone: UE },
  { code: 'FI', nom: 'Finlande', zone: UE },
  { code: 'PL', nom: 'Pologne', zone: UE },
  { code: 'CZ', nom: 'Tchéquie', zone: UE },
  { code: 'GR', nom: 'Grèce', zone: UE },
]

// Le prix de la livraison (en euros) pour une commande donnée.
export function prixPort(formatId, nombre, paysCode = 'FR') {
  const paliers = PALIERS_PORT[formatId] || PALIERS_PORT['10x15']
  const palier = paliers.find(([max]) => nombre <= max) || paliers[paliers.length - 1]
  const pays = PAYS.find((p) => p.code === paysCode) || PAYS[0]
  return pays.zone === 'fr' ? palier[1] : palier[2]
}

// Le plus petit prix de livraison en France, affiché avant le choix du format.
export const PORT = PALIERS_PORT['10x15'][0][1]

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
  const port = n > 0 ? Math.round(prixPort(f.id, n, pays.code) * 100) : 0
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
