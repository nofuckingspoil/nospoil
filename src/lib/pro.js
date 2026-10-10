// ============================================================
//  Demandes des prestataires de mariage (page /pro, table demandes_pro).
//
//  Les listes vivent ici, une seule fois : le formulaire les affiche, l'API
//  les vérifie, l'admin les relit. Ajouter un métier = une ligne ici, plus la
//  contrainte `check` de la table (voir demandes_pro.sql).
//
//  Rien n'est donné automatiquement : la demande arrive chez Clément, qui
//  crée le code dans /admin/codes et l'envoie lui-même.
// ============================================================

export const METIERS = [
  { id: 'wedding_planner', fr: 'Wedding planner', en: 'Wedding planner', de: 'Hochzeitsplaner/in' },
  { id: 'photographe', fr: 'Photographe', en: 'Photographer', de: 'Fotograf/in' },
  { id: 'videaste', fr: 'Vidéaste', en: 'Videographer', de: 'Videograf/in' },
  { id: 'lieu', fr: 'Lieu de réception', en: 'Wedding venue', de: 'Hochzeitslocation' },
  { id: 'dj', fr: 'DJ ou musicien', en: 'DJ or musician', de: 'DJ oder Musiker/in' },
  { id: 'traiteur', fr: 'Traiteur', en: 'Caterer', de: 'Caterer' },
  { id: 'autre', fr: 'Autre', en: 'Other', de: 'Sonstiges' },
]

export const VOLUMES = [
  { id: 'moins_10', fr: 'Moins de 10', en: 'Fewer than 10', de: 'Weniger als 10' },
  { id: '10_30', fr: '10 à 30', en: '10 to 30', de: '10 bis 30' },
  { id: 'plus_30', fr: 'Plus de 30', en: 'More than 30', de: 'Mehr als 30' },
]

// Le suivi, côté admin.
export const STATUTS = [
  { id: 'nouvelle', label: 'Nouvelle' },
  { id: 'code_envoye', label: 'Code envoyé' },
  { id: 'partenaire', label: 'Partenaire actif' },
  { id: 'refusee', label: 'Refusée' },
]

// Longueurs maximales acceptées par le serveur (le formulaire les reprend).
export const LIMITES = {
  prenom: 60,
  nom: 80,
  entreprise: 120,
  ville: 80,
  email: 160,
  telephone: 30,
  site: 200,
  message: 2000,
  provenance: 120,
  page_origine: 300,
  note: 2000,
  code_envoye: 60,
}

export const estMetier = (v) => METIERS.some((m) => m.id === v)
export const estVolume = (v) => VOLUMES.some((m) => m.id === v)
export const estStatut = (v) => STATUTS.some((s) => s.id === v)

// Libellé français d'un métier ou d'un volume (mail d'alerte, admin).
export const libelleMetier = (id) => METIERS.find((m) => m.id === id)?.fr || id || '-'
export const libelleVolume = (id) => VOLUMES.find((m) => m.id === id)?.fr || id || '-'
