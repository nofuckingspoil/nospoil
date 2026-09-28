// ============================================================
//  Familink : l'imprimeur des tirages papier, à Rouen.
//
//  Les photos sont imprimées dans la journée et expédiées par La Poste, en
//  lettre (enveloppe C6 jusqu'à 20 photos, cartonnée au-delà). Imprimées en
//  France : ni douane ni TVA à l'arrivée pour un client français.
//
//  Familink ne recadre rien : on lui envoie des fichiers déjà à la forme
//  exacte du papier (voir mettreEnPage dans lib/cuisson-serveur).
//
//  Jeton : FAMILINK_API_TOKEN. Tant que FAMILINK_ENV ne vaut pas « live »,
//  chaque commande part en bac à sable (rien n'est imprimé ni facturé).
// ============================================================
import 'server-only'

const API = 'https://web.familinkframe.com/api/prints/external-order/'

export function familinkEnv() {
  return process.env.FAMILINK_ENV === 'live' ? 'live' : 'sandbox'
}

export function familinkConfigure() {
  return !!process.env.FAMILINK_API_TOKEN
}

const FORMAT = { '10x15': '10x15cm', '15x20': '15x20cm' }
const FINI = { brillante: 'glossy', mate: 'matte' }

// Leurs tarifs (septembre 2026), en centimes : le prix du tirage, et l'envoi
// selon le nombre de tirages, qui décide de l'enveloppe.
const PRIX_TIRAGE = { '10x15': 15, '15x20': 30 }
const ENVOI = {
  '10x15': [[5, 218, 242], [20, 404, 555], [62, 565, 1098], [129, 765, 1503]],
  '15x20': [[8, 404, 555], [31, 565, 1098], [64, 765, 1503]],
}

// Ce que Familink nous facturera (centimes), ou null si la commande dépasse
// leur plus grande enveloppe.
export function coutFamilink({ format, nombre, pays = 'FR' }) {
  const palier = (ENVOI[format] || ENVOI['10x15']).find(([max]) => nombre <= max)
  if (!palier) return null
  const envoi = pays === 'FR' ? palier[1] : palier[2]
  const photos = nombre * (PRIX_TIRAGE[format] || PRIX_TIRAGE['10x15'])
  return { photos, port: envoi, taxes: 0, total: photos + envoi }
}

// Le plus grand nombre de tirages qu'une enveloppe peut contenir.
export function maxFamilink(format) {
  const paliers = ENVOI[format] || ENVOI['10x15']
  return paliers[paliers.length - 1][0]
}

async function appel(chemin, init = {}) {
  const res = await fetch(`${API}${chemin}`, {
    ...init,
    headers: { Authorization: `Token ${process.env.FAMILINK_API_TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('familink: refus', res.status, JSON.stringify(data).slice(0, 800))
    throw new Error(`familink ${res.status}`)
  }
  return data
}

// Passe la commande. `lignes` : [{ url, exemplaires }], chaque fichier déjà
// mis en page à la forme du papier.
export async function commanderFamilink({ reference, format, finition, lignes, destinataire }) {
  const mots = String(destinataire.nom || '').trim().split(/\s+/)
  const nom = mots.length > 1 ? mots.slice(1).join(' ') : mots[0]
  const prenom = mots.length > 1 ? mots[0] : ''
  const data = await appel('', {
    method: 'POST',
    body: JSON.stringify({
      sandbox: familinkEnv() !== 'live',
      merchant_reference: reference,
      envelope: 'auto',
      recipient: {
        ...(prenom ? { first_name: prenom } : {}),
        last_name: nom,
        address_1: destinataire.adresse,
        ...(destinataire.complement ? { address_2: destinataire.complement } : {}),
        city: destinataire.ville,
        postal_or_zip_code: destinataire.codePostal,
        country_code: destinataire.pays || 'FR',
        ...(destinataire.email ? { email: destinataire.email } : {}),
      },
      photos: lignes.map((l) => ({
        url: l.url,
        copies: l.exemplaires || 1,
        format: FORMAT[format] || FORMAT['10x15'],
        finish: FINI[finition] || FINI.brillante,
      })),
    }),
  })
  return { id: data.pk || null, statut: data.status || null }
}

// Relit une commande : son étape (Not validated, Validated, Printed, Shipped…).
export async function lireCommandeFamilink(pk) {
  const data = await appel(`${encodeURIComponent(pk)}/`).catch(() => null)
  if (!data) return null
  // Une lettre de La Poste : pas de numéro de suivi.
  return { id: data.pk, etape: data.status || '', expediee: data.status === 'Shipped', colis: { transporteur: 'La Poste' } }
}
