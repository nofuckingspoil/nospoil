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

// Traductions : fichier partagé, donc aucun import. La langue vient du
// paramètre `langue`, sinon de celle de l'appareil.
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr

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

const TEXTES_FORMATS = {
  '10x15': { fr: 'Le classique, comme au labo', en: 'The classic, just like the photo lab', de: 'Der Klassiker, wie aus dem Fotolabor' },
  '15x20': { fr: 'Le grand format, pour encadrer', en: 'The large size, for framing', de: 'Das große Format, zum Einrahmen' },
}
const TEXTES_FINITIONS = {
  brillante: {
    nom: { fr: 'Brillante', en: 'Glossy', de: 'Glänzend' },
    sous: { fr: 'Couleurs éclatantes, noirs profonds. La plus choisie', en: 'Vivid colours, deep blacks. The most popular', de: 'Leuchtende Farben, tiefes Schwarz. Am beliebtesten' },
  },
  mate: {
    nom: { fr: 'Mate', en: 'Matte', de: 'Matt' },
    sous: { fr: 'Douce, sans reflets ni traces de doigts', en: 'Soft, with no glare or fingerprints', de: 'Sanft, ohne Spiegelungen und Fingerabdrücke' },
  },
}

// Les formats et finitions avec leurs textes dans la langue voulue.
export function formatsTirage(langue) {
  return FORMATS_TIRAGE.map((f) => ({ ...f, sous: tr(TEXTES_FORMATS[f.id] || { fr: f.sous }, langue) }))
}
export function finitions(langue) {
  return FINITIONS.map((f) => {
    const x = TEXTES_FINITIONS[f.id]
    return x ? { ...f, nom: tr(x.nom, langue), sous: tr(x.sous, langue) } : f
  })
}
export function finitionParId(id, langue) {
  const liste = finitions(langue)
  return liste.find((f) => f.id === id) || liste[0]
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

const NOMS_PAYS = {
  FR: { fr: 'France métropolitaine', en: 'Mainland France', de: 'Frankreich (Festland)' },
  BE: { fr: 'Belgique', en: 'Belgium', de: 'Belgien' },
  LU: { fr: 'Luxembourg', en: 'Luxembourg', de: 'Luxemburg' },
  DE: { fr: 'Allemagne', en: 'Germany', de: 'Deutschland' },
  ES: { fr: 'Espagne', en: 'Spain', de: 'Spanien' },
  IT: { fr: 'Italie', en: 'Italy', de: 'Italien' },
  PT: { fr: 'Portugal', en: 'Portugal', de: 'Portugal' },
  NL: { fr: 'Pays-Bas', en: 'Netherlands', de: 'Niederlande' },
  AT: { fr: 'Autriche', en: 'Austria', de: 'Österreich' },
  IE: { fr: 'Irlande', en: 'Ireland', de: 'Irland' },
  DK: { fr: 'Danemark', en: 'Denmark', de: 'Dänemark' },
  SE: { fr: 'Suède', en: 'Sweden', de: 'Schweden' },
  FI: { fr: 'Finlande', en: 'Finland', de: 'Finnland' },
  PL: { fr: 'Pologne', en: 'Poland', de: 'Polen' },
  CZ: { fr: 'Tchéquie', en: 'Czechia', de: 'Tschechien' },
  GR: { fr: 'Grèce', en: 'Greece', de: 'Griechenland' },
}

function paysTraduit(p, langue) {
  return p && NOMS_PAYS[p.code] ? { ...p, nom: tr(NOMS_PAYS[p.code], langue) } : p
}

// Les pays avec leur nom dans la langue voulue, même ordre que PAYS.
export function listePays(langue) {
  return PAYS.map((p) => paysTraduit(p, langue))
}

export function nomPays(code, langue) {
  return NOMS_PAYS[code] ? tr(NOMS_PAYS[code], langue) : (PAYS.find((p) => p.code === code)?.nom || '')
}

// Le prix de la livraison (en euros) pour une commande donnée.
export function prixPort(formatId, nombre, paysCode = 'FR') {
  const paliers = PALIERS_PORT[formatId] || PALIERS_PORT['10x15']
  const palier = paliers.find(([max]) => nombre <= max) || paliers[paliers.length - 1]
  const pays = PAYS.find((p) => p.code === paysCode) || PAYS[0]
  return pays.zone === 'fr' ? palier[1] : palier[2]
}

// Le plus petit prix de livraison en France, affiché avant le choix du format.
export const PORT = PALIERS_PORT['10x15'][0][1]

// `langue` facultative : le nom du pays est alors traduit.
export function paysLivraison(code, langue) {
  return paysTraduit(PAYS.find((p) => p.code === code) || null, langue)
}

// Au total, tous exemplaires confondus, et par photo.
export const TIRAGES_MAX = 200
export const EXEMPLAIRES_MAX = 20

// `langue` facultative : la description est alors traduite.
export function formatTirage(id, langue) {
  const f = FORMATS_TIRAGE.find((x) => x.id === id) || FORMATS_TIRAGE[0]
  return TEXTES_FORMATS[f.id] ? { ...f, sous: tr(TEXTES_FORMATS[f.id], langue) } : f
}

// Tout se calcule en centimes : 12 × 0,49 en virgule flottante donne
// 5,879999…, et un total faux d'un centime sur un reçu fait mauvais effet.
// `nombre` : le nombre de tirages, exemplaires compris.
export function devisTirages(nombre, formatId, paysCode = 'FR', langue) {
  const f = formatTirage(formatId, langue)
  const pays = paysLivraison(paysCode, langue) || paysTraduit(PAYS[0], langue)
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

// « 5,88 € » en français et en allemand, « €5.88 » en anglais.
export function euros(centimes, langue) {
  const l = langue || globalThis.__ttfLangue
  const n = (centimes / 100).toFixed(2)
  if (l === 'en') return (centimes < 0 ? '-€' : '€') + n.replace('-', '')
  return n.replace('.', ',') + ' €'
}

// « dès 0,49 € » : le prix d'appel affiché avant qu'on ait rien choisi.
export const PRIX_APPEL = euros(Math.round(FORMATS_TIRAGE[0].prix * 100), 'fr')
export function prixAppel(langue) {
  return euros(Math.round(FORMATS_TIRAGE[0].prix * 100), langue)
}
