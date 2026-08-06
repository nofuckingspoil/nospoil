// ============================================================
//  Matière commune aux pages d'atterrissage publicitaires.
//
//  Chaque page teste un angle différent — le photographe qui part, le
//  téléphone transformé en jetable, le photobooth qu'on ne loue pas. Mais
//  toutes vendent le même produit, au même prix, avec les mêmes garanties.
//  Ce qui ne change pas vit ici ; ce qui distingue un angle vit dans sa page.
// ============================================================

import { TIERS } from './pricing'

// Le geste unique. Une seule adresse sur toutes les pages, pour que la mesure
// publicitaire n'ait qu'une chose à compter, quel que soit l'angle testé.
export const CTA = '/create?tier=50'

// Les formules qui concernent un mariage. Les petites tranches existent, mais
// les afficher ferait hésiter sur un choix qui n'est pas le sien.
export const FORMULES_MARIAGE = TIERS.filter((t) => [50, 100, 150, 300].includes(t.maxGuests))

export const ETAPES = [
  {
    img: '/accueil/affiche.webp',
    pos: 'center 38%',
    alt: 'Affiche à poser sur les tables, avec le QR code du mariage',
    n: '01',
    t: 'Une affiche sur les tables',
    s: "Vos invités scannent le QR code. L'appareil photo s'ouvre dans leur navigateur — aucune application à installer, aucun compte à créer.",
  },
  {
    img: '/accueil/declencheur.webp',
    pos: 'center center',
    alt: "L'appareil photo jetable ouvert dans le navigateur : le viseur, le compteur de poses et le déclencheur",
    n: '02',
    t: 'Un nombre de clichés compté',
    s: "Vous décidez combien de photos chacun peut prendre. Comme un jetable : on ne mitraille pas, on choisit son moment. Et personne ne voit encore rien.",
  },
  {
    img: '/accueil/revelation.webp',
    pos: 'center center',
    alt: 'La galerie du mariage une fois les photos révélées',
    n: '03',
    t: 'La révélation, le lendemain',
    s: "À l'heure que vous avez fixée, tout se développe d'un coup. Des centaines de photos que vous n'aviez jamais vues, prises par ceux qui étaient là.",
  },
]

// ------------------------------------------------------------
//  Les conversations affichées en preuve.
//
//  Pour en ajouter une, on recopie un bloc : aucune autre ligne à toucher.
//  L'interrupteur ci-dessous coupe la section sur TOUTES les pages à la fois.
//
//  Règle qui ne se négocie pas : ces phrases doivent avoir été réellement
//  écrites ou dites. Inventer un témoignage client est une pratique
//  commerciale trompeuse (article L121-2 du Code de la consommation), et
//  c'est interdit par les règles publicitaires de Meta comme de Google.
//
//  Le parler se garde intact — « graaaave », « le rêve », la ponctuation
//  emballée : c'est ce qu'un faux avis n'a jamais. Seuls les accents oubliés
//  se corrigent, parce qu'à l'écran ils ne font pas vrai, ils font coquille.
// ------------------------------------------------------------
export const RETOURS_AUTORISES = true

export const CONVERSATIONS = [
  {
    // Messages reçus le lendemain de la fête. Surnoms affectueux retirés :
    // ils ne parlent qu'à eux, et brouillent la lecture d'un inconnu.
    blocs: [
      { qui: 'Claire', mots: ['Merci pour tout ! Tu nous as régalé', 'Trop bonne idée la vache'], coeur: true },
      { qui: 'Tintin', mots: ["T'es trop un ouf d'avoir fait ça, merci beaucoup"] },
      { qui: 'Claire', mots: ["C'est hilarant", 'Pour moi rien est à jeter ahhaha', 'Merci merci merci 🤩'], coeur: true },
    ],
  },
  {
    // Une conversation de groupe : elles se répondent et se renchérissent, et
    // c'est ce qui la rend vivante. Le « Oui » et le « graaaave » ne tiennent
    // que dans cet ordre — les isoler en trois citations séparées les tuerait.
    blocs: [
      { qui: 'Charlotte', mots: ["C'était une bête d'idée, merci d'avoir organisé ça !"] },
      { qui: 'Maguelonne', mots: ['Oui, le rêve en plus pas besoin de courir après les photos, merci, merci 🙏'], coeur: true },
      { qui: 'Marie-Céleste', mots: ["graaaave, j'ai trop kiffé l'effet jetable"] },
    ],
  },
]

// Questions posées sur toutes les pages. Chaque angle peut en ajouter une qui
// lui est propre — celle que sa promesse fait naître.
export const FAQ_COMMUNE = [
  {
    q: 'Mes invités doivent-ils installer une application ?',
    a: "Non, et c'est tout l'intérêt. Ils scannent le QR code posé sur la table, la caméra s'ouvre dans leur navigateur. Aucun compte, aucun téléchargement, aucune explication à donner — même à votre grand-tante.",
  },
  {
    q: 'Et si une photo est gênante ?',
    a: "Avant la révélation, vous êtes seul à voir les photos. Vous masquez celles que vous ne voulez pas montrer, personne ne le saura jamais. Vous pouvez aussi confier ce tri à un témoin en l'ajoutant comme co-organisateur.",
  },
  {
    q: 'Combien de photos chacun peut-il prendre ?',
    a: "Entre 3 et 15 clichés, c'est vous qui fixez la limite. Vous pouvez prévoir une recharge de quelques photos pour ceux qui ont tout épuisé. C'est cette contrainte qui fait la qualité : quand on n'a que dix photos, on ne photographie pas ses chaussures.",
  },
  {
    q: 'Combien de temps ai-je pour récupérer les photos ?',
    a: "Six mois après la révélation, puis elles sont supprimées automatiquement. On vous prévient par mail bien avant l'échéance pour que vous puissiez tout télécharger en pleine définition.",
  },
  {
    q: "C'est un abonnement ?",
    a: 'Non. Vous payez une fois, pour votre mariage, selon le nombre d\'invités. Rien ne se renouvelle, il n\'y a rien à résilier.',
  },
]
