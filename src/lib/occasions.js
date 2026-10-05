// ============================================================
//  Les pages par occasion : anniversaires, EVJF, week-ends, retraites.
//
//  Un tiers des événements créés n'étaient pas des mariages
//  (anniversaires, départs en retraite, week-ends entre amis), alors que tout le site ne parlait que de mariage. Chaque occasion a
//  maintenant sa page, indexable, reliée au menu de pied de page.
//
//  Ici vit ce qui sert partout (le nom court, la formule conseillée,
//  l'exemple de nom proposé à la création). Les longs textes de chaque page
//  vivent dans occasions/ : la page de création, qui lit ce fichier, n'a
//  pas à les embarquer.
// ============================================================

// L'ordre est celui des liens dans le pied de page et sur /occasions.
// `tier` : la formule proposée par défaut en venant de la page.
// `articles` : les articles du journal affichés en bas de la page.
export const OCCASIONS = [
  {
    slug: 'anniversaire',
    ecran: { viseur: 2, album: [1, 3], prenoms: ['Camille', 'Hugo'] },
    tier: 30,
    tiers: [10, 30, 50, 100],
    ic: '🎂',
    nom: { fr: 'Anniversaire', en: 'Birthday party', de: 'Geburtstag' },
    exemple: { fr: 'Ex : Les 35 ans de Léa', en: "E.g. Léa's 35th", de: 'Z. B. Leas 35. Geburtstag' },
    articles: ['idees-anniversaire-30-ans', 'photos-soiree-dansante-telephone', 'dix-cliches'],
  },
  {
    slug: 'anniversaire-30-ans',
    ecran: { viseur: 1, album: [2, 4], prenoms: ['Inès', 'Max'] },
    tier: 30,
    tiers: [10, 30, 50, 100],
    ic: '🥳',
    nom: { fr: 'Anniversaire 30 ans', en: '30th birthday', de: '30. Geburtstag' },
    exemple: { fr: 'Ex : Les 30 ans de Thomas', en: "E.g. Thomas's 30th", de: 'Z. B. Thomas’ 30. Geburtstag' },
    articles: ['idees-anniversaire-30-ans', 'photos-soiree-dansante-telephone', 'photos-mariage-effet-argentique'],
  },
  {
    slug: 'anniversaire-40-ans',
    ecran: { viseur: 1, album: [2, 3], prenoms: ['Claire', 'Julien'] },
    tier: 50,
    tiers: [30, 50, 100, 150],
    ic: '🎉',
    nom: { fr: 'Anniversaire 40 ans', en: '40th birthday', de: '40. Geburtstag' },
    exemple: { fr: 'Ex : Les 40 ans de Sophie', en: "E.g. Sophie's 40th", de: 'Z. B. Sophies 40. Geburtstag' },
    articles: ['idees-anniversaire-30-ans', 'dix-cliches', 'livre-photo-mariage-invites'],
  },
  {
    slug: 'anniversaire-50-ans',
    ecran: { viseur: 2, album: [1, 4], prenoms: ['Anne', 'Lucas'] },
    tier: 50,
    tiers: [30, 50, 100, 150],
    ic: '🥂',
    nom: { fr: 'Anniversaire 50 ans', en: '50th birthday', de: '50. Geburtstag' },
    exemple: { fr: 'Ex : Les 50 ans de Patrick', en: "E.g. Patrick's 50th", de: 'Z. B. Patricks 50. Geburtstag' },
    articles: ['idees-anniversaire-30-ans', 'livre-photo-mariage-invites', '300-photos-lendemain'],
  },
  {
    slug: 'evjf-evg',
    ecran: { viseur: 1, album: [3, 2], prenoms: ['Manon', 'Sarah'] },
    tier: 30,
    tiers: [10, 30, 50],
    ic: '👯',
    nom: { fr: 'EVJF et EVG', en: 'Hen and stag parties', de: 'Junggesellenabschied' },
    exemple: { fr: "Ex : L'EVJF de Julie", en: "E.g. Julie's hen party", de: 'Z. B. JGA von Julia' },
    articles: ['appareil-photo-jetable-evjf', 'appareil-photo-jetable-mariage', 'droit-image-photos-mariage'],
  },
  {
    slug: 'week-end-entre-amis',
    ecran: { viseur: 3, album: [1, 4], prenoms: ['Léo', 'Chloé'] },
    tier: 10,
    tiers: [5, 10, 30, 50],
    ic: '🏡',
    nom: { fr: 'Week-end entre amis', en: 'Weekend with friends', de: 'Wochenende mit Freunden' },
    exemple: { fr: 'Ex : Week-end à Biarritz', en: 'E.g. Weekend in Brighton', de: 'Z. B. Wochenende an der Ostsee' },
    articles: ['photos-week-end-entre-amis', 'whatsapp-google-photos-mariage', 'dix-cliches'],
  },
  {
    slug: 'vacances-entre-amis',
    ecran: { viseur: 1, album: [3, 4], prenoms: ['Emma', 'Nico'] },
    tier: 10,
    tiers: [5, 10, 30, 50],
    ic: '🌴',
    nom: { fr: 'Vacances entre amis', en: 'Holidays with friends', de: 'Urlaub mit Freunden' },
    exemple: { fr: 'Ex : Vacances en Crète', en: 'E.g. Summer in Crete', de: 'Z. B. Sommer auf Kreta' },
    articles: ['photos-week-end-entre-amis', 'whatsapp-google-photos-mariage', 'livre-photo-mariage-invites'],
  },
  {
    slug: 'bapteme',
    ecran: { viseur: 1, album: [2, 3], prenoms: ['Hélène', 'Paul'] },
    tier: 30,
    tiers: [10, 30, 50, 100],
    ic: '🕊️',
    nom: { fr: 'Baptême', en: 'Christening', de: 'Taufe' },
    exemple: { fr: 'Ex : Le baptême de Louise', en: "E.g. Louise's christening", de: 'Z. B. Taufe von Louise' },
    articles: ['livre-photo-mariage-invites', 'photos-de-groupe-mariage', 'droit-image-photos-mariage'],
  },
  {
    slug: 'depart-retraite',
    ecran: { viseur: 3, album: [2, 4], prenoms: ['Sandrine', 'Karim'] },
    tier: 50,
    tiers: [30, 50, 100, 150],
    ic: '🎁',
    nom: { fr: 'Départ en retraite', en: 'Retirement party', de: 'Ruhestand' },
    exemple: { fr: 'Ex : Le départ en retraite de Martine', en: "E.g. Martine's retirement party", de: 'Z. B. Martines Abschied in den Ruhestand' },
    articles: ['idees-pot-de-depart-retraite', 'livre-photo-mariage-invites', 'droit-image-photos-mariage'],
  },
]

export const SLUGS_OCCASIONS = OCCASIONS.map((o) => o.slug)

export function occasion(slug) {
  return OCCASIONS.find((o) => o.slug === slug) || null
}

// Le nom de la fête affiché sur les écrans redessinés (« Les 30 ans de
// Thomas ») : l'exemple de la création, sans son « Ex : ».
export function nomFete(slug, langue = 'fr') {
  const e = exempleNom(slug, langue)
  return e ? e.replace(/^(Ex :|E\.g\.|Z\. B\.)\s*/, '') : null
}

// La date incrustée sur les photos de démonstration (façon jetable) et
// l'heure affichée sous les cartes de l'album.
export const JOUR_DEMO = { tampon: "14 6 '26", texte: { fr: '14 juin', en: '14 June', de: '14. Juni' } }

// L'exemple de nom à proposer à la création (« Ex : Les 30 ans de Thomas »),
// ou null pour garder l'exemple de mariage.
export function exempleNom(slug, langue = 'fr') {
  const o = occasion(slug)
  return o ? o.exemple[langue] || o.exemple.fr : null
}
