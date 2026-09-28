// ============================================================
//  Prodigi : l'imprimeur des tirages papier.
//
//  Prodigi reçoit la commande (photos + adresse), imprime dans le laboratoire
//  le plus proche du client et expédie. Nous n'avons rien à manipuler.
//
//  DEUX ENVIRONNEMENTS
//  - le bac à sable (sandbox) : les commandes sont fausses, rien n'est
//    imprimé ni facturé. C'est le seul utilisé tant que PRODIGI_ENV ne vaut
//    pas « live ».
//  - la production : de vraies commandes, facturées sur le compte Prodigi.
//
//  Clé : PRODIGI_API_KEY (tableau de bord Prodigi, Settings > Integrations).
// ============================================================
import 'server-only'

const BASES = {
  sandbox: 'https://api.sandbox.prodigi.com/v4.0',
  live: 'https://api.prodigi.com/v4.0',
}

export function prodigiEnv() {
  return process.env.PRODIGI_ENV === 'live' ? 'live' : 'sandbox'
}

export function prodigiConfigure() {
  return !!process.env.PRODIGI_API_KEY
}

// Nos formats et finitions, traduits dans les références de Prodigi.
// 10×15 = 4×6 pouces ; 13×18 = 5×7 pouces. La gamme « Pro » du 5×7 coûtait
// deux fois plus cher, et son port vers la France près de 11 € : écartée.
const SKU = { '10x15': 'GLOBAL-PHO-4X6', '13x18': 'GLOBAL-PHO-5X7' }
const FINI = { satinee: 'lustre', brillante: 'gloss' }

// La livraison la moins chère : c'est elle que couvrent nos 3,90 €.
const LIVRAISON = 'Budget'

async function appel(chemin, corps) {
  const res = await fetch(`${BASES[prodigiEnv()]}${chemin}`, {
    method: 'POST',
    headers: { 'X-API-Key': process.env.PRODIGI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('prodigi: refus', res.status, JSON.stringify(data).slice(0, 800))
    throw new Error('prodigi')
  }
  return data
}

// `lignes` : une par photo, { url, exemplaires }.
function articles({ format, finition, lignes }) {
  return lignes.map(({ url, exemplaires }) => ({
    sku: SKU[format] || SKU['10x15'],
    copies: exemplaires || 1,
    // La photo entière, jamais rognée : un téléphone photographie en 3:4, le
    // papier est en 2:3, et remplir le papier coupait une tête sur dix. Il
    // reste une fine bande blanche, comme sur un tirage de labo. La demande
    // de prix refuse ce champ : il ne part qu'avec une vraie image.
    ...(url ? { sizing: 'fitPrintArea' } : {}),
    attributes: { finish: FINI[finition] || FINI.satinee },
    assets: [{ printArea: 'default', ...(url ? { url } : {}) }],
  }))
}

// Ce que Prodigi nous facturera pour cette commande, en euros (centimes).
export async function devisProdigi({ format, finition, lignes, pays = 'FR' }) {
  const data = await appel('/quotes', {
    shippingMethod: LIVRAISON,
    destinationCountryCode: pays,
    currencyCode: 'EUR',
    items: articles({ format, finition, lignes: lignes.map((l) => ({ exemplaires: l.exemplaires })) }),
  })
  const q = Array.isArray(data.quotes) ? data.quotes[0] : null
  const c = q?.costSummary || {}
  const cts = (m) => Math.round(parseFloat(m?.amount || '0') * 100)
  return {
    photos: cts(c.items),
    port: cts(c.shipping),
    taxes: cts(c.totalTax),
    total: cts(c.totalCost) || cts(c.items) + cts(c.shipping) + cts(c.totalTax),
    devise: c.items?.currency || 'EUR',
  }
}

// Passe la commande. Chaque ligne porte l'adresse de son fichier, lisible par
// Prodigi pendant plusieurs jours (il télécharge les images après coup).
export async function commanderProdigi({ reference, format, finition, lignes, destinataire, callbackUrl }) {
  const data = await appel('/orders', {
    merchantReference: reference,
    // Prodigi prévient cette adresse à chaque changement d'étape (expédition
    // comprise, avec le numéro de suivi).
    ...(callbackUrl ? { callbackUrl } : {}),
    shippingMethod: LIVRAISON,
    recipient: {
      name: destinataire.nom,
      ...(destinataire.email ? { email: destinataire.email } : {}),
      address: {
        line1: destinataire.adresse,
        ...(destinataire.complement ? { line2: destinataire.complement } : {}),
        postalOrZipCode: destinataire.codePostal,
        townOrCity: destinataire.ville,
        countryCode: destinataire.pays || 'FR',
      },
    },
    items: articles({ format, finition, lignes }),
  })
  return { id: data.order?.id || null, statut: data.order?.status?.stage || null }
}

// Relit une commande chez Prodigi : son étape, et ses expéditions avec leur
// suivi. C'est la seule source qu'on croit, jamais le contenu d'un avis reçu.
export async function lireCommandeProdigi(id) {
  const res = await fetch(`${BASES[prodigiEnv()]}/orders/${encodeURIComponent(id)}`, {
    headers: { 'X-API-Key': process.env.PRODIGI_API_KEY },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  const o = data?.order
  if (!o) return null
  const expeditions = (o.shipments || []).map((e) => ({
    transporteur: e.carrier?.name || '',
    numero: e.tracking?.number || '',
    url: e.tracking?.url || '',
  }))
  return { id: o.id, etape: o.status?.stage || '', expeditions }
}
