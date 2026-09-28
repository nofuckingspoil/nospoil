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

// Petit assistant de langue (fichier partagé : aucun import autorisé).
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr

const MODE_OPTIONS_TRAD = {
  en: {
    libre: {
      title: 'Open album',
      sub: 'Everyone can look back at their photos whenever they like, and delete a bad one to retake it.',
      court: 'they can look back at their photos and retake a bad one',
    },
    confirmation: {
      title: 'One chance',
      sub: 'The photo appears right after the shot: you keep it or retake it. Once kept, it joins the roll and can’t be seen again.',
      court: 'they see each photo once, to keep it or retake it',
    },
    jetable: {
      title: 'True disposable',
      sub: 'Nobody sees anything. Every photo goes into the roll blurred, and is discovered at the reveal, like a film being developed.',
      court: 'they see nothing, just like with a real disposable camera',
    },
  },
  de: {
    libre: {
      title: 'Offenes Album',
      sub: 'Jeder kann seine Fotos jederzeit ansehen und ein misslungenes löschen, um es neu aufzunehmen.',
      court: 'sie sehen ihre Fotos und können ein misslungenes neu machen',
    },
    confirmation: {
      title: 'Nur eine Chance',
      sub: 'Das Foto erscheint direkt nach dem Auslösen: behalten oder neu aufnehmen. Einmal behalten, wandert es in den Film und ist nicht mehr zu sehen.',
      court: 'sie sehen jedes Foto einmal, um es zu behalten oder neu zu machen',
    },
    jetable: {
      title: 'Echte Einwegkamera',
      sub: 'Niemand sieht etwas. Jedes Foto landet verschwommen im Film und wird bei der Enthüllung entdeckt, wie ein Film, der entwickelt wird.',
      court: 'sie sehen nichts, wie bei einer echten Einwegkamera',
    },
  },
}

// Les options dans la langue voulue (mêmes clés et même forme que MODE_OPTIONS).
export function modeOptions(langue) {
  return MODE_OPTIONS.map((o) => ({
    ...o,
    ...tr({ fr: {}, en: MODE_OPTIONS_TRAD.en[o.key], de: MODE_OPTIONS_TRAD.de[o.key] }, langue),
  }))
}
