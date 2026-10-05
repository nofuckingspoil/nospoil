// ============================================================
//  La liste des étapes du compteur de parcours.
//
//  Partagée par la route qui les reçoit (/api/etape), le petit envoyeur du
//  site (lib/etapes.js) et la page qui les affiche (/admin/parcours). Un seul
//  endroit, pour qu'aucun des trois ne parle d'une étape que les autres
//  ignorent.
//
//  ATTENTION : ces noms sont aussi envoyés par l'app iPhone et l'extrait
//  d'app (App Clip). Renommer une étape ici, c'est la faire refuser dès la
//  prochaine version de l'app déjà installée. On en ajoute, on n'en renomme
//  jamais.
// ============================================================

// Les invités, dans l'ordre de l'entonnoir. `chaine: true` : l'étape fait
// partie du chemin principal, et l'atteindre prouve qu'on est passé par les
// précédentes (quelqu'un qui a pris une photo a forcément ouvert la page).
// Les autres se comptent à part.
export const ETAPES_INVITE = [
  { id: 'ouverture', label: 'Arrive sur la page de la soirée', chaine: true },
  { id: 'formulaire', label: 'Voit le formulaire prénom + mail', chaine: true },
  { id: 'inscrit', label: 'Inscrit', chaine: true },
  { id: 'camera_ok', label: "Voit l'image de sa caméra", chaine: true },
  { id: 'photo', label: 'Prend sa première photo', chaine: true },
  { id: 'album', label: "Ouvre l'album après la révélation", chaine: false },
]

// Les ennuis, comptés à part : ils ne sont pas une marche de l'escalier, ils
// expliquent pourquoi on en tombe.
export const ETAPES_PROBLEME = [
  { id: 'camera_refus', label: 'Caméra refusée ou en panne' },
  { id: 'camera_secours_site', label: 'Caméra refusée dans l’extrait, repart sur le site' },
  { id: 'camera_secours_app', label: 'Caméra refusée dans l’extrait, va installer l’app' },
  { id: 'envoi_coince', label: "Photo qui n'arrive pas à partir" },
  // Mesurer les photos restées sur les téléphones : sans réseau, le serveur
  // ne voit rien. L'appareil le dit à l'ouverture suivante (detail = combien
  // attendent), puis quand la première arrive enfin (detail = minutes de retard).
  { id: 'attente_ouverture', label: 'Photos encore sur le téléphone à la réouverture' },
  { id: 'envoi_tardif', label: 'Photo arrivée en retard (après coup)' },
  // Le micro du livre d'or qui refuse de démarrer : detail = le message exact
  // de l'iPhone (« repli ok » si le second essai, réglages d'Apple, a pris).
  { id: 'livre_or_erreur', label: "Enregistrement du livre d'or qui ne démarre pas" },
]

// Les organisateurs : le tunnel /create, un écran après l'autre (voir la
// liste ETAPES de src/app/create/page.js). Le premier écran, celui du nom,
// est `crea_ouverture` : il s'affiche à l'arrivée sur la page.
// `crea_code` et `crea_paiement` sont deux branches (formule gratuite : code
// reçu par mail ; formule payante : départ vers Stripe), pas des marches.
export const ETAPES_ORGA = [
  // Le parcours court, la norme depuis le 03/10/2026 : révélation, clichés,
  // photos revues et couverture se règlent après la création (voir
  // /create/parametrer), d'où l'étape « crea_reglages » en bout de chaîne.
  { id: 'crea_ouverture', label: 'Arrive sur la création (écran du nom)', chaine: true },
  { id: 'crea_debut', label: 'Écran : date de début', chaine: true },
  { id: 'crea_fin', label: 'Écran : date de fin', chaine: true },
  { id: 'crea_formule', label: 'Écran : formule', chaine: true },
  { id: 'crea_final', label: 'Écran : mail et récapitulatif', chaine: true },
  { id: 'crea_code', label: 'Écran : code reçu par mail (gratuit)', chaine: false },
  { id: 'crea_paiement', label: 'Part vers le paiement (payant)', chaine: false },
  { id: 'crea_termine', label: 'Événement créé', chaine: true },
  { id: 'crea_reglages', label: 'Termine les réglages (révélation, photos, couverture…)', chaine: true },
  // Écrans de l'ancien parcours long : gardés pour relire l'historique.
  { id: 'crea_revelation', label: 'Ancien parcours : révélation', chaine: false },
  { id: 'crea_cliches', label: 'Ancien parcours : nombre de clichés', chaine: false },
  { id: 'crea_revoir', label: 'Ancien parcours : revoir ses photos', chaine: false },
  { id: 'crea_couverture', label: 'Ancien parcours : photo de couverture', chaine: false },
]

// Les tirages papier, depuis l'album révélé. Le départ est l'ouverture de
// l'album ; la fenêtre d'invitation se compte à part (on peut commander sans
// l'avoir vue, par le bouton du haut ou le mail). `tirages_selection` note par
// où l'on est arrivé (detail : invitation | facade | barre | selection | mail).
export const ETAPES_TIRAGES = [
  { id: 'album', label: "Ouvre l'album après la révélation", chaine: true },
  { id: 'tirages_invitation', label: 'Voit la fenêtre « Et en vrai, sur papier ? »', chaine: false },
  { id: 'tirages_selection', label: 'Commence à choisir ses tirages', chaine: true },
  { id: 'tirages_ecran', label: "Ouvre l'écran de commande", chaine: true },
  { id: 'tirages_paiement', label: 'Part vers le paiement', chaine: true },
  { id: 'tirages_paye', label: 'A payé', chaine: true },
]

export const SUPPORTS = ['site', 'app', 'clip']

const TOUTES = [...ETAPES_INVITE, ...ETAPES_PROBLEME, ...ETAPES_ORGA, ...ETAPES_TIRAGES].map((e) => e.id)

export function etapeConnue(id) {
  return TOUTES.includes(id)
}

// Une étape d'invité n'a de sens qu'attachée à une soirée.
export function etapeInvite(id) {
  return !id.startsWith('crea_')
}
