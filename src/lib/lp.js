// ============================================================
//  Matière commune aux pages d'atterrissage publicitaires.
//
//  Chaque page teste un angle différent : le photographe qui part, le
//  téléphone transformé en jetable, le photobooth qu'on ne loue pas. Mais
//  toutes vendent le même produit, au même prix, avec les mêmes garanties.
//  Ce qui ne change pas vit ici ; ce qui distingue un angle vit dans sa page.
// ============================================================

import { TIERS, formatPrice } from './pricing'

// Le geste unique. Une seule adresse sur toutes les pages, pour que la mesure
// publicitaire n'ait qu'une chose à compter, quel que soit l'angle testé.
export const CTA = '/create?tier=50'

// Les formules qui concernent un mariage. Les petites tranches existent, mais
// les afficher ferait hésiter sur un choix qui n'est pas le sien.
export const FORMULES_MARIAGE = TIERS.filter((t) => [50, 100, 150, 200].includes(t.maxGuests))

export const ETAPES = [
  {
    img: '/accueil/affiche.webp',
    pos: 'center 38%',
    alt: 'Affiche à poser sur les tables, avec le QR code du mariage',
    n: '01',
    t: 'Une affiche sur les tables',
    s: "Vos invités scannent le QR code. L'appareil photo s'ouvre dans leur navigateur : aucune application à installer, aucun compte à créer.",
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
//  Le parler se garde intact : « graaaave », « le rêve », la ponctuation
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
    // que dans cet ordre : les isoler en trois citations séparées les tuerait.
    blocs: [
      { qui: 'Charlotte', mots: ["C'était une bête d'idée, merci d'avoir organisé ça !"] },
      { qui: 'Maguelonne', mots: ['Oui, le rêve en plus pas besoin de courir après les photos, merci, merci 🙏'], coeur: true },
      { qui: 'Marie-Céleste', mots: ["graaaave, j'ai trop kiffé l'effet jetable"] },
    ],
  },
]

// Questions posées sur toutes les pages. Chaque angle peut en ajouter une qui
// lui est propre, celle que sa promesse fait naître.
export const FAQ_COMMUNE = [
  {
    q: 'Mes invités doivent-ils installer une application ?',
    a: "Non, et c'est tout l'intérêt. Ils scannent le QR code posé sur la table, la caméra s'ouvre dans leur navigateur. Aucun compte, aucun téléchargement, aucune explication à donner, même à votre grand-tante.",
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

// ------------------------------------------------------------
//  Les mêmes contenus en anglais et en allemand.
//
//  Les exports ci-dessus restent en français (ce sont eux que lit la version
//  française) ; les fonctions ci-dessous rendent la version de la langue
//  demandée, avec le français en repli.
// ------------------------------------------------------------

// Un prix dans la langue de la page (« 14,99 € », « €14.99 »). Toujours
// passer la langue : sur le serveur, formatPrice ne la devine pas.
export function prix(cents, langue) {
  return formatPrice(cents, langue || 'fr')
}

const ETAPES_TRAD = {
  en: [
    {
      alt: 'A table card with the wedding QR code',
      t: 'A card on every table',
      s: "Your guests scan the QR code. The camera opens in their browser: no app to install, no account to create.",
    },
    {
      alt: 'The disposable camera open in the browser: viewfinder, shot counter and shutter button',
      t: 'A limited number of shots',
      s: "You decide how many photos each guest can take. Just like a disposable: nobody snaps away, they pick their moment. And nobody sees a thing yet.",
    },
    {
      alt: 'The wedding gallery once the photos are revealed',
      t: 'The reveal, the next day',
      s: "At the time you set, everything develops at once. Hundreds of photos you had never seen, taken by the people who were there.",
    },
  ],
  de: [
    {
      alt: 'Tischaufsteller mit dem QR-Code der Hochzeit',
      t: 'Ein Aufsteller auf jedem Tisch',
      s: 'Ihre Gäste scannen den QR-Code. Die Kamera öffnet sich in ihrem Browser: keine App, kein Konto.',
    },
    {
      alt: 'Die Einwegkamera im Browser: Sucher, Bildzähler und Auslöser',
      t: 'Eine begrenzte Anzahl an Fotos',
      s: 'Sie legen fest, wie viele Fotos jeder Gast machen darf. Wie bei einer Einwegkamera: Man knipst nicht wild drauflos, man wählt seinen Moment. Und noch sieht niemand etwas.',
    },
    {
      alt: 'Die Hochzeitsgalerie nach der Präsentation der Fotos',
      t: 'Die Präsentation, am Tag danach',
      s: 'Zur von Ihnen gewählten Uhrzeit wird alles auf einmal entwickelt. Hunderte Fotos, die Sie noch nie gesehen haben, aufgenommen von denen, die dabei waren.',
    },
  ],
}

export function etapes(langue) {
  const trad = ETAPES_TRAD[langue]
  if (!trad) return ETAPES
  return ETAPES.map((e, i) => ({ ...e, ...trad[i] }))
}

// Les conversations, traduites au plus près de ce qui a été écrit : on garde
// le ton parlé, on n'ajoute rien, on ne retire rien. Les prénoms restent.
const CONVERSATIONS_TRAD = {
  en: [
    [
      ['Thanks for everything! What a treat', 'Such a good idea, wow'],
      ["You're mad for pulling this off, thanks so much"],
      ["It's hilarious", "Honestly there's not one to throw away ahhaha", 'Thank you thank you thank you 🤩'],
    ],
    [
      ['That was a killer idea, thanks for organising it!'],
      ['Yes, a dream, plus no need to chase after the photos, thank you, thank you 🙏'],
      ['tooootally, I loved the disposable effect so much'],
    ],
  ],
  de: [
    [
      ['Danke für alles! Du hast uns echt verwöhnt', 'Was für eine geniale Idee, Wahnsinn'],
      ['Du bist echt verrückt, dass du das gemacht hast, tausend Dank'],
      ['Es ist zum Totlachen', 'Ehrlich, da ist nichts zum Wegwerfen ahhaha', 'Danke danke danke 🤩'],
    ],
    [
      ['Das war eine mega Idee, danke fürs Organisieren!'],
      ['Ja, ein Traum, und man muss niemandem hinterherlaufen wegen der Fotos, danke, danke 🙏'],
      ['sooo krass, ich hab den Einweg-Effekt total gefeiert'],
    ],
  ],
}

export function conversations(langue) {
  const trad = CONVERSATIONS_TRAD[langue]
  if (!trad) return CONVERSATIONS
  return CONVERSATIONS.map((c, k) => ({
    ...c,
    blocs: c.blocs.map((b, i) => ({ ...b, mots: trad[k]?.[i] || b.mots })),
  }))
}

const FAQ_COMMUNE_TRAD = {
  en: [
    {
      q: 'Do my guests need to install an app?',
      a: "No, and that's the whole point. They scan the QR code on the table and the camera opens in their browser. No account, no download, nothing to explain, not even to your great-aunt.",
    },
    {
      q: 'What if a photo is embarrassing?',
      a: "Before the reveal, you're the only one who can see the photos. Hide the ones you don't want to show and nobody will ever know. You can also hand this job to a best man or bridesmaid by adding them as a co-host.",
    },
    {
      q: 'How many photos can each guest take?',
      a: "Between 3 and 15 shots: you set the limit. You can also add a small top-up for those who have used them all. That limit is what makes the photos good: with only ten shots, nobody photographs their shoes.",
    },
    {
      q: 'How long do I have to download the photos?',
      a: "Six months after the reveal, then they are deleted automatically. We email you well before the deadline so you can download everything in full resolution.",
    },
    {
      q: 'Is it a subscription?',
      a: 'No. You pay once for your wedding, based on the number of guests. Nothing renews and there is nothing to cancel.',
    },
  ],
  de: [
    {
      q: 'Müssen meine Gäste eine App installieren?',
      a: 'Nein, und genau darum geht es. Sie scannen den QR-Code auf dem Tisch, die Kamera öffnet sich in ihrem Browser. Kein Konto, kein Download, nichts zu erklären, nicht einmal Ihrer Großtante.',
    },
    {
      q: 'Und wenn ein Foto peinlich ist?',
      a: 'Vor der Präsentation sehen nur Sie die Fotos. Sie blenden aus, was niemand sehen soll. Sie können diese Auswahl auch einem Trauzeugen überlassen, indem Sie ihn als Co-Gastgeber hinzufügen.',
    },
    {
      q: 'Wie viele Fotos darf jeder machen?',
      a: 'Zwischen 3 und 15 Aufnahmen, das Limit legen Sie fest. Für alle, die ihren Film verschossen haben, können Sie ein paar Extrafotos vorsehen. Genau diese Grenze macht die Qualität aus: Wer nur zehn Fotos hat, fotografiert nicht seine Schuhe.',
    },
    {
      q: 'Wie lange habe ich Zeit, die Fotos zu sichern?',
      a: 'Sechs Monate nach der Präsentation, danach werden sie automatisch gelöscht. Wir erinnern Sie rechtzeitig per E-Mail, damit Sie alles in voller Auflösung herunterladen können.',
    },
    {
      q: 'Ist das ein Abo?',
      a: 'Nein. Sie zahlen einmal für Ihre Hochzeit, je nach Anzahl der Gäste. Nichts verlängert sich, nichts muss gekündigt werden.',
    },
  ],
}

export function faqCommune(langue) {
  return FAQ_COMMUNE_TRAD[langue] || FAQ_COMMUNE
}
