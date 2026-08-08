// ============================================================
//  Mesure des conversions publicitaires (Meta + Google).
//
//  ⬇️  LES SEULES LIGNES À MODIFIER  ⬇️
//  Ces identifiants ne sont pas des secrets : ils sont visibles dans le code
//  de n'importe quelle page qui les utilise. Une ligne laissée vide = l'outil
//  correspondant n'est pas chargé du tout.
// ============================================================

// Pixel « Time to Flash — Site web », créé le 07/08/2026 dans le portefeuille
// Time to Flash (et non celui d'Escape Game en Ligne, qui a le sien).
export const META_PIXEL_ID = '902314949139850'

// Google Analytics 4 : la mesure d'audience. Propriété « Time to Flash — Site
// web », créée le 07/08/2026 dans un compte Analytics « Time to Flash » séparé
// de celui d'Escape Game en Ligne.
export const GA4_ID = 'G-KH7NP499E8'

// Google Ads : le compte publicitaire. Format : AW-XXXXXXXXX
export const GOOGLE_ADS_ID = ''

// Étiquettes de conversion Google Ads. Chaque conversion créée dans Google Ads
// donne une étiquette de la forme « AW-123456789/AbC-D_efGh12 » : c'est cette
// chaîne complète qu'on colle ici.
export const GOOGLE_ADS_CONVERSIONS = {
  achat: '',    // une vente
  prospect: '', // un événement gratuit créé
}

// ------------------------------------------------------------
//  Où les traceurs ont le droit d'exister.
//
//  Nulle part près des photos. Un album, une page d'invitation ou l'appareil
//  photo sont des lieux privés : y charger un script publicitaire reviendrait
//  à annoncer à Meta que telle personne assiste à tel mariage. Cela n'apporte
//  rien aux campagnes (un participant n'achète pas) et c'est exactement ce que
//  la politique de confidentialité promet de ne pas faire.
//
//  Restent les pages vitrines et le tunnel de création : là où se trouvent
//  les acheteurs, et les seules conversions qui intéressent la publicité.
// ------------------------------------------------------------
const CHEMINS_SANS_TRACEUR = ['/g/', '/j/', '/mes-photos', '/essai', '/admin', '/avis']

export function pageMesurable(chemin) {
  if (!chemin) return false
  return !CHEMINS_SANS_TRACEUR.some((p) => chemin === p || chemin.startsWith(p))
}

// ------------------------------------------------------------
//  Ne pas se compter soi-même.
//
//  Nos propres visites gonflent l'audience et brouillent les campagnes : elles
//  ressemblent à des visiteurs qui reviennent sans jamais acheter. Ouvrir une
//  fois https://timetoflash.fr/?nomesure=1 marque ce navigateur, et plus aucun
//  traceur ne s'y charge, sur aucune page. ?nomesure=0 annule la marque.
//
//  Le marquage se fait par navigateur et par appareil (ordinateur, téléphone,
//  navigation privée), et non par adresse IP : une IP change au gré de la box
//  et du réseau mobile, ce marqueur non.
// ------------------------------------------------------------
const CLE_EXCLUSION = 'ttf_sans_mesure'

let annonceFaite = false

export function mesureExclue() {
  if (typeof window === 'undefined') return false
  try {
    const demande = new URLSearchParams(window.location.search).get('nomesure')
    if (demande === '1') localStorage.setItem(CLE_EXCLUSION, '1')
    if (demande === '0') localStorage.removeItem(CLE_EXCLUSION)

    // Sans retour visible, impossible de savoir si le réglage a bien pris.
    if (demande && !annonceFaite) {
      annonceFaite = true
      alert(demande === '1'
        ? 'Ce navigateur ne sera plus compté dans les statistiques.'
        : 'Ce navigateur est de nouveau compté dans les statistiques.')
    }

    return localStorage.getItem(CLE_EXCLUSION) === '1'
  } catch {
    // Stockage bloqué par le navigateur : on mesure comme avant.
    return false
  }
}

// ------------------------------------------------------------
//  Envoi d'un événement.
//
//  Un seul appel dans le code du site, deux destinataires. Si le visiteur n'a
//  pas consenti, aucun des deux outils n'est chargé : les fonctions n'existent
//  pas, et tout ce qui suit ne fait rien.
// ------------------------------------------------------------
export function track(nom, params, options) {
  if (typeof window === 'undefined') return

  // --- Meta ---
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', nom, params || {}, options || {})
    } catch {
      // Une mesure ratée ne doit jamais casser un paiement ou une création.
    }
  }

  // --- Google ---
  if (typeof window.gtag === 'function') {
    try {
      // Google ne connaît pas les noms d'événements de Meta : on traduit.
      const etiquette = nom === 'Purchase' ? GOOGLE_ADS_CONVERSIONS.achat
        : nom === 'Lead' ? GOOGLE_ADS_CONVERSIONS.prospect
        : ''

      // La conversion Google Ads : ce que les campagnes apprennent à répéter.
      if (etiquette) {
        window.gtag('event', 'conversion', {
          send_to: etiquette,
          value: params?.value,
          currency: params?.currency,
          // Même identifiant que côté Meta : évite qu'une page rechargée
          // compte la vente deux fois.
          transaction_id: options?.eventID,
        })
      }

      // L'événement dans Analytics, pour lire les parcours. Les noms suivent
      // la nomenclature de Google, sinon les rapports restent vides.
      const nomGoogle = { Purchase: 'purchase', Lead: 'generate_lead', InitiateCheckout: 'begin_checkout' }[nom]
      if (nomGoogle) {
        window.gtag('event', nomGoogle, {
          value: params?.value,
          currency: params?.currency,
          transaction_id: options?.eventID,
        })
      }
    } catch {}
  }
}
