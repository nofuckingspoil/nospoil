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
  { id: '10x15', nom: '10 × 15 cm', sous: 'Le classique, comme au labo', prix: 0.69 },
  // 15 × 20 plutôt que 13 × 18 : il a exactement la forme des photos de
  // l'appareil (3:4), et c'est le grand format de l'imprimeur.
  { id: '15x20', nom: '15 × 20 cm', sous: 'Le grand format, pour encadrer', prix: 1.29 },
]

export const FINITIONS = [
  { id: 'brillante', nom: 'Brillante', sous: 'Couleurs éclatantes, noirs profonds. La plus choisie' },
  { id: 'mate', nom: 'Mate', sous: 'Douce, sans reflets ni traces de doigts' },
]

// La livraison (grille du 12/10/2026). En France, un prix unique, offert dès
// 20 tirages : la ligne « livraison » ne doit plus peser autant que les photos
// (retour d'un client : 4,90 € de port pour 6,86 € de photos, ça freine). Le
// coût réel de l'enveloppe Familink, qui grimpe avec le nombre de tirages, est
// couvert par le prix du tirage. Le seuil est à 20 et non plus bas : à 20
// tirages livrés gratuitement, le gain reste au-dessus de celui d'une commande
// de 10 (la plupart des gens en prennent une petite dizaine).
// Ailleurs dans l'Union européenne, l'envoi Familink saute à 10,98 € au-delà
// de 15 tirages 10 × 15 (7 en 15 × 20) : deux prix, et jamais offert. La
// Suisse, le Royaume-Uni et la Norvège sont écartés (hors UE, la douane
// compliquerait tout).
//
// [jusqu'à N tirages, prix France, prix Union européenne]
export const LIVRAISON_OFFERTE_DES = 20
const PALIERS_PORT = {
  '10x15': [[15, 2.9, 4.9], [LIVRAISON_OFFERTE_DES - 1, 2.9, 9.9], [Infinity, 0, 9.9]],
  '15x20': [[7, 3.9, 4.9], [LIVRAISON_OFFERTE_DES - 1, 3.9, 9.9], [Infinity, 0, 9.9]],
}

// Les deux coups de pouce de l'écran de commande, jamais en même temps
// (choix de Clément, 13/10/2026) :
//  - de 5 à 9 tirages : « Les préférées de la soirée », ajouter en un geste
//    jusqu'à 5 photos parmi les plus aimées. Entre 5 et 15 tirages 10 × 15,
//    l'enveloppe de l'imprimeur coûte pareil : chaque tirage ajouté rapporte
//    presque tout son prix.
//  - de 10 à 14 tirages : « Plus que X tirages pour la livraison offerte ».
//    Pas au-delà : de 15 à 19 tirages, pousser vers 20 ferait baisser le gain.
export const PLAGE_PREFEREES = [5, 9]
export const PLAGE_RAPPEL_OFFERT = [10, 14]
export const PREFEREES_MAX = 5
const dans = ([min, max], n) => n >= min && n <= max

// Combien de photos préférées proposer pour une commande de `nombre` tirages.
export function nombrePreferees(nombre) {
  return dans(PLAGE_PREFEREES, nombre) ? PREFEREES_MAX : 0
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

// ------------------------------------------------------------
//  Quand les tirages arrivent.
//
//  Familink (Rouen) dépose à La Poste, le soir même, toute commande reçue
//  avant 17 h un jour ouvré ; après 17 h, ou le week-end, elle part le soir du
//  jour ouvré suivant (le pire cas : vendredi 17 h passé, départ lundi soir).
//  La lettre met ensuite 3 à 4 jours ouvrés en France, sans suivi.
//  Pour le reste de l'Union européenne, Familink ne donne pas de délai : on
//  annonce large.
//
//  Tout se calcule à l'heure de Paris, sans dépendre du fuseau de l'appareil.
// ------------------------------------------------------------
export const HEURE_LIMITE = 17
const DELAIS_POSTE = { fr: [3, 4], ue: [5, 8] }

// L'heure d'été européenne : du dernier dimanche de mars au dernier dimanche
// d'octobre, à 1 h UTC.
function dernierDimanche(annee, mois) {
  const d = new Date(Date.UTC(annee, mois + 1, 0))
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d
}
function decalageParis(instant) {
  const a = instant.getUTCFullYear()
  const ete = Date.UTC(a, 2, dernierDimanche(a, 2).getUTCDate(), 1)
  const hiver = Date.UTC(a, 9, dernierDimanche(a, 9).getUTCDate(), 1)
  const t = instant.getTime()
  return t >= ete && t < hiver ? 2 : 1
}

// Pâques (calcul grégorien de Meeus), d'où découlent trois jours fériés.
function paques(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mois = Math.floor((h + l - 7 * m + 114) / 31)
  const jour = ((h + l - 7 * m + 114) % 31) + 1
  return Date.UTC(y, mois - 1, jour)
}
const JOUR = 86400000
function ferie(jour) {
  const d = new Date(jour)
  const a = d.getUTCFullYear(), m = d.getUTCMonth() + 1, j = d.getUTCDate()
  const fixes = ['1-1', '5-1', '5-8', '7-14', '8-15', '11-1', '11-11', '12-25']
  if (fixes.includes(`${m}-${j}`)) return true
  const p = paques(a)
  // Lundi de Pâques, Ascension, lundi de Pentecôte.
  return [p + JOUR, p + 39 * JOUR, p + 50 * JOUR].includes(jour)
}
function ouvre(jour) {
  const s = new Date(jour).getUTCDay()
  return s !== 0 && s !== 6 && !ferie(jour)
}
function jourOuvreSuivant(jour, n = 1) {
  let d = jour
  while (n > 0) { d += JOUR; if (ouvre(d)) n-- }
  return d
}

/**
 * Le départ et l'arrivée prévus d'une commande passée à l'instant `quand`.
 * Les dates rendues sont des jours civils (minuit UTC), à lire avec
 * dateCourte / texteArrivee.
 */
export function estimationLivraison(quand = new Date(), paysCode = 'FR') {
  const instant = quand instanceof Date ? quand : new Date(quand)
  const paris = new Date(instant.getTime() + decalageParis(instant) * 3600000)
  const aujourdhui = Date.UTC(paris.getUTCFullYear(), paris.getUTCMonth(), paris.getUTCDate())
  const ceSoir = ouvre(aujourdhui) && paris.getUTCHours() < HEURE_LIMITE
  const depart = ceSoir ? aujourdhui : jourOuvreSuivant(aujourdhui)
  const pays = PAYS.find((p) => p.code === paysCode) || PAYS[0]
  const [min, max] = DELAIS_POSTE[pays.zone === 'fr' ? 'fr' : 'ue']
  return {
    depart,
    ceSoir,
    demain: !ceSoir && depart - aujourdhui === JOUR,
    du: jourOuvreSuivant(depart, min),
    au: jourOuvreSuivant(depart, max),
  }
}

const NOMS_JOURS = {
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
}
const NOMS_MOIS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
}
function langueDates(langue) {
  const l = langue || globalThis.__ttfLangue
  return NOMS_JOURS[l] ? l : 'fr'
}

// « jeudi 16 octobre », « Thursday 16 October », « Donnerstag, 16. Oktober ».
// `avecMois` à false : « jeudi 16 » (quand le mois suit déjà).
export function dateCourte(jour, langue, avecMois = true) {
  const l = langueDates(langue)
  const d = new Date(jour)
  const nom = NOMS_JOURS[l][d.getUTCDay()], n = d.getUTCDate(), mois = NOMS_MOIS[l][d.getUTCMonth()]
  if (l === 'de') return `${nom}, ${n}.${avecMois ? ` ${mois}` : ''}`
  return `${nom} ${n}${avecMois ? ` ${mois}` : ''}`
}

// « entre le jeudi 16 et le vendredi 17 octobre »
export function texteArrivee(est, langue) {
  const l = langueDates(langue)
  const memeMois = new Date(est.du).getUTCMonth() === new Date(est.au).getUTCMonth()
  const du = dateCourte(est.du, l, !memeMois), au = dateCourte(est.au, l)
  return tr({ fr: `entre le ${du} et le ${au}`, en: `between ${du} and ${au}`, de: `zwischen ${du} und ${au}` }, l)
}

// « postés ce soir », « postés demain soir », « postés lundi soir ».
// En allemand, le verbe va en fin de phrase : « per La Poste » est donc inclus.
// `pluriel` à false pour un seul tirage : « posté ce soir ».
export function texteDepart(est, langue, pluriel = true) {
  const l = langueDates(langue)
  const p = pluriel ? 'postés' : 'posté'
  if (est.ceSoir) return tr({ fr: `${p} ce soir`, en: 'posted this evening', de: 'noch heute Abend per La Poste verschickt' }, l)
  if (est.demain) return tr({ fr: `${p} demain soir`, en: 'posted tomorrow evening', de: 'morgen Abend per La Poste verschickt' }, l)
  const jour = NOMS_JOURS[l][new Date(est.depart).getUTCDay()]
  return tr({ fr: `${p} ${jour} soir`, en: `posted on ${jour} evening`, de: `am ${jour}abend per La Poste verschickt` }, l)
}

// La règle de livraison en une phrase, pour le format et le pays choisis :
// « Livraison 2,90 €, offerte dès 20 tirages. »
export function regleLivraison(formatId, paysCode = 'FR', langue) {
  const l = langueDates(langue)
  const paliers = PALIERS_PORT[formatId] || PALIERS_PORT['10x15']
  const pays = PAYS.find((p) => p.code === paysCode) || PAYS[0]
  const prix = (v) => euros(Math.round(v * 100), l)
  if (pays.zone === 'fr') {
    const n = LIVRAISON_OFFERTE_DES
    return tr({
      fr: `Livraison ${prix(paliers[0][1])}, offerte dès ${n} tirages.`,
      en: `Delivery ${prix(paliers[0][1])}, free from ${n} prints.`,
      de: `Versand ${prix(paliers[0][1])}, ab ${n} Abzügen kostenlos.`,
    }, l)
  }
  const [premier, suivant] = paliers
  return tr({
    fr: `Livraison ${prix(premier[2])}, puis ${prix(suivant[2])} au-delà de ${premier[0]} tirages.`,
    en: `Delivery ${prix(premier[2])}, then ${prix(suivant[2])} for more than ${premier[0]} prints.`,
    de: `Versand ${prix(premier[2])}, ab ${premier[0] + 1} Abzügen ${prix(suivant[2])}.`,
  }, l)
}

// Combien de tirages manquent pour la livraison offerte (France seulement) :
// 0 si elle l'est déjà, null si elle ne peut pas l'être.
export function manquePourOffert(nombre, paysCode = 'FR') {
  const pays = PAYS.find((p) => p.code === paysCode) || PAYS[0]
  if (pays.zone !== 'fr') return null
  return Math.max(0, LIVRAISON_OFFERTE_DES - nombre)
}

// Faut-il afficher « Plus que X tirages pour la livraison offerte » ?
export function rappelOffert(nombre, paysCode = 'FR') {
  return manquePourOffert(nombre, paysCode) != null && dans(PLAGE_RAPPEL_OFFERT, nombre)
}
