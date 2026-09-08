// ============================================================
//  Ce que le participant revoit de ses propres photos avant la révélation.
//
//  Trois promesses différentes, pas trois niveaux de restriction. L'organisateur
//  choisit le jeu auquel il fait jouer sa soirée :
//
//    · libre        : il revoit ses photos et peut en supprimer une ratée.
//                     C'est le comportement historique, et le défaut.
//    · confirmation : il voit chaque cliché une fois, à l'instant du déclic,
//                     pour le garder ou le reprendre. Une fois gardé, il rejoint
//                     la pellicule floutée et ne se supprime plus. Ce qu'on veut
//                     savoir sur le moment (« je n'ai pas coupé la tête ? ») lui
//                     est rendu, sans lui vendre la mèche pour la révélation.
//    · jetable      : jamais vu. La photo apparaît floutée dès le déclic, juste
//                     assez pour confirmer qu'elle est bien partie, et rien
//                     ne se supprime.
//
//  Le mur du groupe (les photos des autres, floutées) reste affiché dans les
//  trois modes : c'est lui qui fait vivre l'attente.
// ============================================================

export const PHOTO_MODES = ['libre', 'confirmation', 'jetable']

// Valeur de repli, jamais un choix : c'est ce qu'on lit d'un événement dont le
// mode est absent ou abîmé. Elle reste « libre », le comportement des
// événements créés avant l'existence du réglage : personne ne doit se réveiller
// avec une pellicule plus fermée que celle qu'il a achetée.
export const MODE_DEFAUT = 'libre'

// Ce qu'on PROPOSE à la création, qui est autre chose : le vrai jetable, parce
// que c'est la promesse du produit. Celui qui veut l'album ouvert le choisit en
// connaissance de cause, sur le même écran.
export const MODE_PROPOSE = 'jetable'

/** Ramène n'importe quelle valeur douteuse au mode par défaut. */
export function modeValide(v) {
  const m = String(v || '').trim()
  return PHOTO_MODES.includes(m) ? m : MODE_DEFAUT
}

/** Le participant peut-il revoir ses propres photos, nettes, avant la révélation ? */
export function revoitSesPhotos(mode) {
  return modeValide(mode) === 'libre'
}

/** Le participant peut-il supprimer une photo déjà enregistrée ? */
export function peutSupprimer(mode) {
  return modeValide(mode) === 'libre'
}

/** Faut-il montrer le cliché juste après le déclic, pour le garder ou le reprendre ? */
export function demandeConfirmation(mode) {
  return modeValide(mode) === 'confirmation'
}

// Les mêmes mots partout : tunnel de création, tableau de bord, aide.
// Le sous-titre dit ce que vit le participant, pas ce que le réglage interdit.
export const MODE_OPTIONS = [
  {
    key: 'libre',
    em: '🖼️',
    title: 'Album ouvert',
    sub: 'Chacun revoit ses photos quand il veut, et peut supprimer une ratée pour la reprendre.',
    court: 'ils revoient leurs photos et peuvent en refaire une ratée',
  },
  {
    key: 'confirmation',
    em: '🎞️',
    title: 'Une seule chance',
    sub: 'La photo s’affiche juste après le déclic : on la garde ou on la reprend. Une fois gardée, elle rejoint la pellicule et ne se revoit plus.',
    court: 'ils voient chaque photo une fois, pour la garder ou la refaire',
  },
  {
    key: 'jetable',
    em: '📷',
    title: 'Vrai jetable',
    sub: 'Personne ne revoit rien. Chaque photo part floutée dans la pellicule, et se découvre à la révélation, comme un film qu’on développe.',
    court: 'ils ne voient rien, comme avec un vrai appareil jetable',
  },
]
