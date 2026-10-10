// ============================================================
//  Guides partenaires : comment accompagner ses mariés avec Time to Flash,
//  un guide par métier (/pro/guide/wedding-planners, /lieux-de-reception,
//  /photographes). Français seulement.
//
//  Les réglages et conseils viennent du guide de l'organisateur
//  (lib/guide.js) : 8 à 10 clichés pour un mariage, recharge de 1 à 5,
//  co-organisateurs qui relisent et masquent avant la révélation, album
//  gardé six mois. Ne rien promettre ici que l'appli ne fait pas.
// ============================================================

const PHRASE_BASE = '« Pour récupérer les photos de vos invités, je vous propose Time to Flash : un QR code sur les tables, chacun photographie la soirée depuis son téléphone, sans appli, et vous découvrez tout le lendemain, comme une pellicule qu’on fait développer. »'

const ANNONCE = '« Ce soir, c’est vous les photographes. Scannez le QR code sur votre table : vous avez chacun 8 photos, pas une de plus. Alors visez bien. On découvrira tout ensemble demain. »'

const REGLAGES = [
  { t: 'Nombre de clichés', d: '8 à 10 par invité pour un mariage sur une journée, 12 pour un mariage sur deux jours. Moins de clichés, ce sont des photos plus choisies.' },
  { t: 'Recharge', d: 'Activez-la (1 à 5 photos de plus) : elle est offerte automatiquement à l’invité qui a tout utilisé. La contrainte au départ, l’enthousiasme à l’arrivée.' },
  { t: 'Révélation', d: 'Le lendemain vers 11 h pour l’effet « on se raconte la veille », ou une semaine après pour l’effet carte postale. Jamais pendant la fête.' },
  { t: 'Co-organisateurs', d: 'Les mariés peuvent ajouter un témoin ou un proche : ils voient les photos avant la révélation et peuvent en masquer, discrètement.' },
]

const APRES_COMMUN = [
  { t: 'Relire avant la révélation', d: 'Entre la fin de la fête et la révélation, les mariés (et leurs co-organisateurs) sont les seuls à voir les photos. Ils masquent ce qui gêne quelqu’un, pas ce qui n’est pas joli.' },
  { t: 'Télécharger l’album complet', d: 'Les photos restent en ligne six mois après la révélation, puis sont supprimées (les mariés sont prévenus par mail avant). Conseillez-leur de tout télécharger dès le premier jour.' },
  { t: 'Faire imprimer', d: 'Les tirages papier se commandent depuis l’album. Ce sont souvent les photos des invités qui finissent au mur.' },
]

const PIEGES = [
  { t: 'Un invité n’arrive pas à scanner', d: 'Il scanne depuis le téléphone d’un voisin, qui lui envoie le lien par message : le lien fonctionne exactement comme le QR code.' },
  { t: 'Sur Android, une appli de QR code', d: 'Dites aux invités de scanner avec l’appareil photo du téléphone, pas avec une appli de QR code : ces applis ouvrent la page dans un mini-navigateur où le déclencheur ne répond pas. Si c’est arrivé, un bouton propose d’ouvrir la page dans Chrome.' },
  { t: 'Le réseau est faible dans la salle', d: 'Prévoyez le code wifi des invités à côté du QR code, ou vérifiez la couverture mobile lors de la visite technique.' },
]

export const GUIDES = {
  planner: {
    titreMeta: 'Guide partenaire wedding planner : accompagner vos mariés avec Time to Flash',
    description: 'Quand proposer Time to Flash à vos mariés, quels réglages choisir, où poser les QR codes, quoi dire au micro : le guide des wedding planners partenaires.',
    titre: 'Accompagner vos mariés avec Time to Flash',
    intro: 'Vous coordonnez déjà le jour J : Time to Flash s’y glisse en dix minutes. Voici quand en parler, comment le régler et ce qu’il faut prévoir pour que tous les invités jouent le jeu.',
    etapes: [
      {
        n: '01', t: 'Quand en parler à vos mariés',
        d: 'Au moment du rétroplanning photo et animations, deux à trois mois avant. C’est la question que les mariés se posent rarement d’eux-mêmes, et c’est là que vous faites la différence.',
        citation: PHRASE_BASE,
        aide: 'Si vous leur offrez votre code partenaire, dites-le : « C’est offert de ma part. »',
      },
      {
        n: '02', t: 'Créer l’événement ensemble',
        d: 'Deux façons de faire : vous transmettez le code aux mariés, qui créent leur événement en quelques minutes ; ou vous le créez pour eux et vous les ajoutez comme co-organisateurs. Dans les deux cas, voici les réglages qui marchent pour un mariage :',
        reglages: true,
      },
      {
        n: '03', t: 'Une semaine avant',
        liste: [
          'Imprimer les QR codes : un chevalet par table, plus le bar, l’accueil et les toilettes (le meilleur taux de scan de la soirée).',
          'Préparer l’affiche aux prénoms des mariés avec notre générateur.',
          'Briefer le DJ ou un témoin sur l’annonce au micro.',
          'Faire écrire aux mariés le message de révélation, pendant qu’ils ont le temps.',
          'Vérifier le réseau ou le wifi du lieu.',
        ],
      },
      {
        n: '04', t: 'Le jour J',
        d: 'Les QR codes sont posés avant l’arrivée des invités. Au début du dîner, trente secondes au micro suffisent :',
        citation: ANNONCE,
        liste: ['Prenez la première photo vous-même et montrez-la : le jeu devient réel.', 'Vérifiez que les enfants et les ados ont scanné : ils prennent souvent les meilleures photos.'],
      },
      { n: '05', t: 'Après le mariage', apres: true },
    ],
    checklist: [
      { quand: 'J-60', items: ['Proposer Time to Flash aux mariés', 'Créer l’événement ou leur transmettre le code'] },
      { quand: 'J-7', items: ['Imprimer les QR codes et l’affiche', 'Briefer le DJ ou un témoin', 'Préparer le message de révélation'] },
      { quand: 'Jour J', items: ['Poser les QR codes avant l’arrivée', 'Annonce au micro au début du dîner', 'Première photo, enfants et ados'] },
      { quand: 'Après', items: ['Relecture par les mariés', 'Révélation et message aux invités', 'Téléchargement de l’album complet'] },
    ],
  },
  lieu: {
    titreMeta: 'Guide partenaire lieu de réception : proposer Time to Flash aux mariés',
    description: 'Comment intégrer Time to Flash à vos mariages : en parler à la visite, placer les QR codes, gérer le wifi, annoncer le jeu. Le guide des lieux partenaires.',
    titre: 'Proposer Time to Flash aux mariés que vous accueillez',
    intro: 'Pour votre équipe, c’est une affiche de plus à poser au moment du dressage. Pour les mariés, ce sont toutes les photos de leurs invités. Voici comment l’intégrer à vos mariages.',
    etapes: [
      {
        n: '01', t: 'Quand en parler aux mariés',
        d: 'À la visite ou à la signature, au moment où vous présentez ce qui est inclus. Une ligne dans votre brochure ou votre devis suffit à la faire exister.',
        citation: PHRASE_BASE,
        aide: 'Si vous leur offrez votre code partenaire, présentez-le comme une attention du lieu.',
      },
      {
        n: '02', t: 'Les réglages à conseiller',
        d: 'Les mariés créent leur événement eux-mêmes avec votre code. Ces réglages marchent pour un mariage :',
        reglages: true,
      },
      {
        n: '03', t: 'Le rôle de votre équipe',
        liste: [
          'Poser les QR codes au moment du dressage : un chevalet par table, plus l’accueil, le bar et les toilettes.',
          'Afficher le code wifi des invités à côté du QR code si la couverture mobile est faible dans la salle.',
          'Prévenir le maître d’hôtel ou le DJ : une annonce au micro au début du dîner change tout.',
        ],
      },
      {
        n: '04', t: 'Le jour J',
        d: 'Trente secondes au micro, au début du dîner, par le DJ ou un témoin :',
        citation: ANNONCE,
      },
      {
        n: '05', t: 'Après le mariage', apres: true,
        aide: 'Une photo des invités montre votre lieu vivant, en pleine fête. Si vous souhaitez en réutiliser pour votre communication, demandez d’abord l’accord des mariés (et des personnes reconnaissables).',
      },
    ],
    checklist: [
      { quand: 'Visite', items: ['Présenter Time to Flash aux mariés', 'Leur transmettre le code s’ils le souhaitent'] },
      { quand: 'J-7', items: ['Vérifier que les mariés ont imprimé leurs QR codes', 'Prévoir le code wifi des invités'] },
      { quand: 'Jour J', items: ['QR codes posés au dressage', 'Annonce au micro au début du dîner'] },
      { quand: 'Après', items: ['Demander l’accord des mariés pour réutiliser des photos'] },
    ],
  },
  photo: {
    titreMeta: 'Guide partenaire photographe de mariage : Time to Flash en complément',
    description: 'Présenter Time to Flash comme un complément à votre reportage, choisir les bons réglages, faire patienter les mariés pendant la retouche : le guide des photographes partenaires.',
    titre: 'Time to Flash en complément de votre reportage',
    intro: 'Vos photos restent la référence. Celles des invités racontent ce que vous ne pouvez pas voir : les tables, les coulisses, la piste à 3 h du matin. Voici comment le présenter et le régler pour que les deux se complètent.',
    etapes: [
      {
        n: '01', t: 'Comment le présenter',
        d: 'Au rendez-vous de préparation, en même temps que la liste des photos de groupe. Présentez-le comme le carnet de souvenirs de la soirée, pas comme un second reportage :',
        citation: '« Moi, je fais le reportage. Pour tout ce que je ne verrai pas, je vous propose Time to Flash : vos invités photographient la soirée depuis leur téléphone, et vous découvrez leurs photos le lendemain. »',
        aide: 'Si vous leur offrez votre code partenaire, c’est une attention de plus dans votre prestation.',
      },
      {
        n: '02', t: 'Les réglages qui gardent les rôles clairs',
        d: 'Un nombre limité de clichés et le rendu d’appareil jetable font des photos des invités un souvenir spontané, qui ne se compare pas à votre travail. Pour un mariage :',
        reglages: true,
        aide: 'La révélation du lendemain a un autre avantage : les mariés ont déjà des photos à regarder pendant que vous retouchez les vôtres.',
      },
      {
        n: '03', t: 'Le jour J',
        liste: [
          'Un mot au moment des photos de groupe ou au cocktail, quand tout le monde est réuni : « N’oubliez pas le QR code sur vos tables. »',
          'Laissez les invités couvrir ce qui vous échappe : la soirée, la piste, les tables pendant que vous êtes avec les mariés.',
        ],
        citation: ANNONCE,
      },
      { n: '04', t: 'Après le mariage', apres: true },
    ],
    checklist: [
      { quand: 'Préparation', items: ['Présenter Time to Flash avec la liste des photos de groupe', 'Transmettre le code s’ils le souhaitent'] },
      { quand: 'Jour J', items: ['Rappel du QR code aux photos de groupe ou au cocktail'] },
      { quand: 'Après', items: ['Révélation des photos des invités le lendemain', 'Livraison de votre reportage, à votre rythme'] },
    ],
  },
}

export { REGLAGES, APRES_COMMUN, PIEGES }
export const cheminGuide = (cle) => `/pro/guide/${{ planner: 'wedding-planners', lieu: 'lieux-de-reception', photo: 'photographes' }[cle]}`
