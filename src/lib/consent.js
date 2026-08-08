// ============================================================
//  Consentement aux traceurs publicitaires.
//
//  La loi (article 82 de la loi Informatique et Libertés, contrôlé par la
//  CNIL) interdit de déposer un traceur publicitaire (pixel Meta, mesure
//  Google) avant que le visiteur ait dit oui. Refuser doit être aussi
//  simple qu'accepter, et l'avis doit pouvoir être changé plus tard.
//
//  Trois états possibles :
//    null        le visiteur n'a pas encore répondu → on ne charge RIEN
//    'accepte'   → les traceurs se chargent
//    'refuse'    → on ne charge rien, et on ne redemande pas
// ============================================================

const CLE = 'ttf_consentement'

// Durée de vie du choix. La CNIL recommande de ne pas conserver un refus
// indéfiniment : au bout de six mois, la question peut être reposée.
const DUREE_MS = 6 * 30 * 24 * 3600 * 1000

export function lireConsentement() {
  if (typeof window === 'undefined') return null
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return null
    const { choix, date } = JSON.parse(brut)
    if (!date || Date.now() - date > DUREE_MS) return null
    return choix === 'accepte' || choix === 'refuse' ? choix : null
  } catch {
    return null
  }
}

export function ecrireConsentement(choix) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ choix, date: Date.now() }))
  } catch {}
  // Prévient les composants qui attendent la réponse (pixel Meta, balise
  // Google) sans qu'ils aient à interroger le stockage en boucle.
  try {
    window.dispatchEvent(new CustomEvent('ttf-consentement', { detail: choix }))
  } catch {}
}

export function oublierConsentement() {
  try { localStorage.removeItem(CLE) } catch {}
  try {
    window.dispatchEvent(new CustomEvent('ttf-consentement', { detail: null }))
  } catch {}
}

// S'abonner aux changements. Renvoie la fonction pour se désabonner.
export function surConsentement(callback) {
  if (typeof window === 'undefined') return () => {}
  const h = (e) => callback(e.detail ?? null)
  window.addEventListener('ttf-consentement', h)
  return () => window.removeEventListener('ttf-consentement', h)
}
