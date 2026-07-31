// ============================================================
//  Vérification d'une adresse mail saisie à la volée.
//
//  Une adresse mal tapée est pire qu'une adresse absente : l'organisateur
//  croit avoir le contact. On empile donc plusieurs filets :
//    1. la forme est-elle plausible ?
//    2. le domaine ressemble-t-il à une faute de frappe connue ?
//    3. (côté serveur) le domaine reçoit-il vraiment du courrier ?
//
//  Aucun filet ne bloque la participation : l'adresse reste facultative.
//  On corrige, on prévient, on n'empêche jamais d'entrer dans la fête.
// ============================================================

// Forme générale. Volontairement permissive : on ne cherche pas à réinventer
// la norme, juste à écarter ce qui ne peut manifestement pas marcher.
const FORME = /^[^\s@,;]+@[^\s@.,;]+(\.[^\s@.,;]+)+$/

// Les domaines réellement utilisés en France. Sert de dictionnaire de
// correction : « gmial.com » est à une lettre de « gmail.com ».
const DOMAINES = [
  'gmail.com', 'googlemail.com',
  'hotmail.fr', 'hotmail.com', 'outlook.fr', 'outlook.com', 'live.fr', 'live.com', 'msn.com',
  'yahoo.fr', 'yahoo.com',
  'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'neuf.fr', 'bbox.fr', 'numericable.fr',
  'laposte.net', 'aol.com', 'gmx.fr', 'gmx.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
]

// Fins de domaine tapées de travers, très fréquentes au clavier.
const FINS_FAUTIVES = {
  con: 'com', cmo: 'com', ocm: 'com', comm: 'com', cim: 'com', copm: 'com', vom: 'com',
  rf: 'fr', ffr: 'fr', f: 'fr',
  ne: 'net', nte: 'net',
}

export function normalizeGuestEmail(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '')
}

// Distance de Levenshtein — nombre de corrections pour passer d'un mot à l'autre.
function distance(a, b) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 2) return 99
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(
        prev[j] + 1,          // suppression
        prev[j - 1] + 1,      // insertion
        diag + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      )
      diag = tmp
    }
  }
  return prev[b.length]
}

// Renvoie une adresse corrigée si le domaine ressemble à une faute connue,
// sinon null. On ne corrige jamais tout seul : on propose.
export function suggestEmail(value) {
  const email = normalizeGuestEmail(value)
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const local = email.slice(0, at)
  const domaine = email.slice(at + 1)
  if (!domaine) return null

  // 1. Fin de domaine manifestement fautive (« .con » pour « .com »)
  const morceaux = domaine.split('.')
  const fin = morceaux[morceaux.length - 1]
  if (FINS_FAUTIVES[fin]) {
    const corrige = [...morceaux.slice(0, -1), FINS_FAUTIVES[fin]].join('.')
    if (corrige !== domaine) return `${local}@${corrige}`
  }

  // 2. Domaine proche d'un domaine courant (« gmial.com », « hotmai.fr »)
  if (DOMAINES.includes(domaine)) return null
  let meilleur = null
  let meilleureDistance = 3 // au-delà de 2 corrections, ce n'est plus une faute de frappe
  for (const candidat of DOMAINES) {
    const d = distance(domaine, candidat)
    if (d < meilleureDistance) { meilleureDistance = d; meilleur = candidat }
  }
  if (meilleur && meilleureDistance <= 2) return `${local}@${meilleur}`

  return null
}

// Contrôle de forme, sans réseau. `ok` à false = inutile d'aller plus loin.
export function checkEmailShape(value) {
  const email = normalizeGuestEmail(value)
  if (!email) return { ok: true, empty: true } // facultatif : vide est valide
  if (email.length > 160) return { ok: false, reason: 'Cette adresse est trop longue.' }
  if (!FORME.test(email)) return { ok: false, reason: "Il manque quelque chose — vérifiez le @ et le point." }
  if (email.includes('..')) return { ok: false, reason: 'Il y a deux points de suite.' }
  const domaine = email.slice(email.lastIndexOf('@') + 1)
  const fin = domaine.split('.').pop()
  if (fin.length < 2) return { ok: false, reason: 'La fin de l’adresse semble incomplète.' }
  return { ok: true, email, suggestion: suggestEmail(email) }
}
