// ============================================================
//  Guide de l'organisateur : l'aimant à contacts (« lead magnet »).
//  Une page /guide, réservée contre une adresse mail.
//
//  Le contenu vit ici pour rester modifiable sans toucher à la mise en page :
//  chaque chapitre a un titre, une accroche affichée AVANT l'inscription
//  (le sommaire, qui donne envie), et un corps en HTML affiché APRÈS.
//
//  Le corps est rendu dans .dj-prose (mêmes styles que les articles du blog),
//  donc les balises disponibles sont celles du journal : <p>, <h3>, <ul>/<li>,
//  <strong>, <a>, <table>.
// ============================================================

export const GUIDE = {
  slug: 'guide',
  title: 'Réussir vos photos participatives',
  subtitle: "Le guide de l'organisateur",
  // Promesse affichée en haut de page, avant l'inscription.
  promise:
    "Sept chapitres courts pour que vos participants jouent le jeu, que vos photos soient réussies, et que la révélation soit un moment, pas un dossier de plus sur votre téléphone.",
  readingTime: '12 min de lecture',
  // Ce qu'on demande en échange, dit franchement.
  exchange:
    "Laissez votre adresse mail : le guide s'ouvre immédiatement sur cette page, et vous recevrez le lien pour le retrouver plus tard. Un mail par mois maximum, désinscription en un clic.",
}

export const CHAPTERS = [
  {
    n: 1,
    title: 'Choisir le bon nombre de clichés',
    teaser: "Pourquoi 5 photos valent mieux que 15 sur une soirée courte, et le tableau à consulter selon votre type d'événement.",
    body: `
<p>C'est le réglage qui change tout, et le plus souvent mal choisi. Trop de clichés, et la contrainte disparaît : vos participants mitraillent, vous récupérez 400 photos floues. Trop peu, et certains n'osent pas les utiliser, de peur de « gâcher ».</p>
<p>La bonne règle : <strong>plus l'événement est court et dense, moins il faut de clichés</strong>. Une soirée intense se raconte très bien en 5 photos par personne. Une semaine de vacances a besoin de respiration.</p>
<table>
  <thead><tr><th>Type d'événement</th><th>Durée</th><th>Clichés conseillés</th></tr></thead>
  <tbody>
    <tr><td>Soirée d'anniversaire, EVJF</td><td>1 soirée</td><td>5</td></tr>
    <tr><td>Mariage (cérémonie + soirée)</td><td>1 journée</td><td>8 à 10</td></tr>
    <tr><td>Mariage sur deux jours, week-end</td><td>2 à 3 jours</td><td>12</td></tr>
    <tr><td>Vacances entre amis, voyage</td><td>1 semaine</td><td>15</td></tr>
    <tr><td>Séminaire, soirée d'entreprise</td><td>1 à 2 jours</td><td>6 à 8</td></tr>
  </tbody>
</table>
<h3>Et la recharge ?</h3>
<p>Vous pouvez prévoir une recharge de 1 à 5 photos, offerte automatiquement au participant qui a épuisé son quota. C'est un excellent réglage : ceux qui s'en fichent ne la demanderont jamais, et ceux qui ont pris goût au jeu repartent pour un tour.</p>
<p>Notre conseil : <strong>quota bas + recharge activée</strong>. Vous obtenez la contrainte au départ, et l'enthousiasme à l'arrivée.</p>
<p>Ces deux réglages se choisissent à la création de l'événement, et restent modifiables jusqu'au jour J : rien n'est figé. <a href="/create?tier=5">Créer mon événement</a>.</p>
`,
  },
  {
    n: 2,
    title: 'Choisir le bon moment de révélation',
    teaser: "Le lendemain matin ou une semaine après ? Les deux marchent, mais pas pour les mêmes raisons.",
    body: `
<p>La date de révélation n'est pas un détail technique : c'est la fin de votre histoire. Deux écoles, aucune n'a tort.</p>
<h3>Le lendemain matin (11 h)</h3>
<p>L'effet « on se retrouve au petit-déjeuner ». Tout le monde a encore la soirée en tête, les téléphones traînent, et les photos arrivent au moment exact où l'on commence à se raconter la veille. C'est le choix le plus festif, et celui qui génère le plus de partages.</p>
<h3>Une semaine après</h3>
<p>L'effet carte postale. La fête est retombée, le quotidien a repris, et la galerie surgit comme un rappel. C'est plus émouvant, souvent plus regardé longuement. À privilégier pour un mariage.</p>
<h3>Ce qu'il faut éviter</h3>
<ul>
  <li><strong>Le soir même, pendant la fête.</strong> Tout le monde se met à regarder son téléphone au lieu de danser, et vous n'avez plus le temps de faire le tri.</li>
  <li><strong>Plus d'un mois après.</strong> L'élan est perdu, une partie des participants ne rouvrira pas le lien.</li>
</ul>
<p>Dans tous les cas, gardez-vous <strong>au moins quelques heures entre la fin de l'événement et la révélation</strong> : c'est votre fenêtre pour relire la galerie tranquillement (voir chapitre 5).</p>
`,
  },
  {
    n: 3,
    title: 'Faire scanner le QR code par tout le monde',
    teaser: "Où poser le code, quoi dire au micro, et l'astuce pour les participants qui n'y arrivent pas seuls.",
    body: `
<p>C'est le seul vrai obstacle de la soirée : un participant qui n'a pas scanné ne prendra aucune photo. Voici ce qui fonctionne.</p>
<h3>Multipliez les points de contact</h3>
<ul>
  <li><strong>Sur les tables</strong> : un petit chevalet par table, c'est le plus efficace. Les gens scannent en s'asseyant, avant l'apéritif.</li>
  <li><strong>Aux toilettes</strong>, sans blague : tout le monde y passe, seul, avec son téléphone à la main. Le meilleur taux de scan de la soirée.</li>
  <li><strong>Sur le plan de table ou le livret</strong> : pour ceux qui arrivent en avance.</li>
  <li><strong>Au bar</strong> : le moment d'attente est parfait.</li>
</ul>
<p>Une fois votre événement créé, son QR code est prêt à imprimer. Vous pouvez aussi passer par notre <a href="/generateur-qr-code-mariage">générateur d'affiche</a> pour obtenir une page à poser sur les tables, avec vos prénoms et votre date.</p>
<h3>Le mot au micro (à faire dire au DJ ou au témoin)</h3>
<p>Trente secondes suffisent, et le ton compte plus que le contenu :</p>
<p><em>« Ce soir, c'est vous les photographes. Scannez le QR code sur votre table : vous avez chacun 8 photos, pas une de plus. Alors visez bien. On découvrira tout ensemble demain matin. »</em></p>
<p>Les trois éléments à ne pas oublier : <strong>le nombre de photos</strong> (c'est ce qui crée le jeu), <strong>le moment de la révélation</strong> (c'est ce qui crée l'attente), et <strong>« aucune appli à installer »</strong> (c'est ce qui lève la dernière réticence).</p>
<h3>L'astuce pour les récalcitrants</h3>
<p>Il y aura toujours quelqu'un dont l'appareil photo ne scanne pas, ou qui a un téléphone trop ancien. Solution : <strong>faites-le scanner depuis le téléphone de quelqu'un d'autre</strong>, puis envoyez-lui le lien par message. Le lien fonctionne exactement comme le QR code. Personne n'est laissé de côté.</p>
`,
  },
  {
    n: 4,
    title: 'Lancer la dynamique (et gérer les timides)',
    teaser: "Comment obtenir des photos vivantes plutôt que trente fois la même table sous le même angle.",
    body: `
<p>Le scan est fait, mais personne n'ose commencer. C'est normal : avec un quota limité, chacun attend « le bon moment ». Votre rôle est de le déclencher.</p>
<h3>Prenez la première photo vous-même</h3>
<p>Dès que la galerie existe, prenez une photo et montrez-la autour de vous. L'effet est immédiat : le compteur est lancé, le jeu devient réel.</p>
<h3>Donnez des idées, pas des ordres</h3>
<p>Une liste de suggestions affichée sur les tables débloque énormément de monde. Par exemple :</p>
<ul>
  <li>Une photo de la personne assise en face de vous</li>
  <li>Un détail que personne ne remarquera (les chaussures, le gâteau, une main)</li>
  <li>Quelqu'un qui rit vraiment</li>
  <li>La piste de danse vue d'en haut</li>
  <li>Une photo volée des mariés / du héros du jour</li>
</ul>
<h3>Confiez un rôle aux enfants et aux ados</h3>
<p>Ils prennent les meilleures photos, systématiquement : ils sont à hauteur différente, ils n'ont aucune inhibition, et ils vont là où les adultes ne vont pas. Assurez-vous qu'ils aient scanné.</p>
<h3>Rassurez sur la photo ratée</h3>
<p>Beaucoup de participants n'osent pas déclencher de peur de gâcher une pose. Dites-leur : <strong>une photo ratée peut être supprimée, et la place se libère</strong>. Ils ne pourront jamais dépasser leur quota, mais ils ne sont pas punis pour un flou. Ça débloque énormément de monde.</p>
`,
  },
  {
    n: 5,
    title: 'Relire la galerie avant que tout le monde la voie',
    teaser: "La demi-heure la plus importante : vous seul voyez les photos, et vous décidez de ce qui sort.",
    body: `
<p>Entre la fin de l'événement et la révélation, <strong>vous êtes le seul à voir les photos</strong>. Vos participants, eux, ne voient que les leurs. C'est votre fenêtre de tri, et il faut la prendre au sérieux : c'est ce qui différencie une galerie qu'on partage d'une galerie qu'on regrette.</p>
<h3>Ce qu'il faut chercher</h3>
<ul>
  <li>La photo prise à 3 h du matin dont l'auteur ne se souvient pas</li>
  <li>Celle où quelqu'un est manifestement mal à l'aise</li>
  <li>Le doublon exact (la même scène par cinq personnes)</li>
  <li>Le cadrage totalement noir ou totalement flou</li>
</ul>
<p>Masquer une photo est discret : personne n'est notifié, et l'auteur ne saura pas qu'elle a été retirée.</p>
<h3>Faites-le à plusieurs</h3>
<p>Vous pouvez inviter des <strong>co-organisateurs</strong> : les mariés, un témoin, un ami de confiance. Ils voient les photos avant la révélation et peuvent faire le tri avec vous. C'est particulièrement utile pour un mariage : les mariés découvrent leurs photos en avant-première, et personne ne porte seul la responsabilité de ce qui sort.</p>
<h3>Le bon dosage</h3>
<p>Résistez à l'envie de tout lisser. Les photos imparfaites (le flou de mouvement, le cadrage de travers, l'œil fermé) sont exactement ce qui donne son âme à une galerie participative. Retirez ce qui gêne quelqu'un, pas ce qui n'est pas joli.</p>
`,
  },
  {
    n: 6,
    title: 'Réussir le moment de la révélation',
    teaser: "Une galerie qui s'ouvre sans prévenir n'est pas un événement. Voici comment en faire un.",
    body: `
<p>Vos participants reçoivent une notification à l'ouverture de la galerie. Mais un message de votre part au même moment change complètement l'ampleur de la chose.</p>
<h3>Préparez le message à l'avance</h3>
<p>Écrivez-le avant l'événement, pendant que vous avez du temps. Le jour venu, vous n'aurez qu'à l'envoyer dans le groupe de discussion :</p>
<p><em>« Ça y est, la pellicule est développée 🎞️ 142 photos, prises par vous 47. Voici ce que vous avez vu de notre soirée : [lien]. On n'avait rien vu de tout ça. »</em></p>
<h3>Donnez un chiffre</h3>
<p>« 142 photos par 47 personnes » est infiniment plus fort que « les photos sont dispo ». Le chiffre raconte la participation collective : c'est ce qui donne envie de cliquer tout de suite.</p>
<h3>Relancez une fois, une seule</h3>
<p>Deux ou trois jours après, un second message avec une photo marquante en aperçu récupère les retardataires. Au-delà, laissez vivre.</p>
`,
  },
  {
    n: 7,
    title: 'Après la fête : télécharger et archiver',
    teaser: "Ce qu'il faut faire dans les six mois, et ce que vous pouvez oublier.",
    body: `
<p>Une seule chose est vraiment importante après la révélation : <strong>télécharger l'album complet</strong>. Vos photos restent en ligne six mois après la révélation, puis sont supprimées automatiquement (vous êtes prévenu par mail avant, plusieurs fois).</p>
<h3>La routine en trois gestes</h3>
<ul>
  <li><strong>Le jour de la révélation</strong> : téléchargez l'album complet en une fois, et rangez-le au même endroit que le reste de vos photos.</li>
  <li><strong>Dans la semaine</strong> : envoyez le lien de la galerie aux absents. Elle reste accessible à tous ceux qui ont le lien.</li>
  <li><strong>Avant les six mois</strong> : vérifiez que votre téléchargement est bien à l'abri (disque externe, cloud, clé USB). Après ça, vous pouvez oublier.</li>
</ul>
<h3>Le conseil qu'on donne toujours</h3>
<p>Faites imprimer une dizaine de photos. Une galerie participative produit des images qu'aucun photographe professionnel n'aurait pu prendre : le point de vue de vos participants. Ce sont souvent celles qui finissent au mur.</p>
`,
  },
]

// Aide-mémoire final, affiché après les chapitres.
export const CHECKLIST = [
  {
    when: 'J-30',
    items: [
      "Créer l'événement et choisir le nombre de clichés",
      'Fixer la date de révélation (voir chapitre 2)',
      'Activer la recharge de photos',
      'Inviter les co-organisateurs',
    ],
  },
  {
    when: 'J-7',
    items: [
      'Imprimer les QR codes (tables, toilettes, bar)',
      'Préparer la liste de suggestions de photos',
      'Briefer le DJ ou le témoin sur le mot au micro',
      'Écrire le message de révélation à l\'avance',
    ],
  },
  {
    when: 'Jour J',
    items: [
      'Poser les QR codes avant l\'arrivée des participants',
      'Faire passer le message au micro en début de soirée',
      'Prendre la première photo soi-même',
      'Vérifier que les enfants et les ados ont scanné',
    ],
  },
  {
    when: 'Après',
    items: [
      'Relire la galerie et masquer ce qui gêne',
      'Envoyer le message de révélation avec le chiffre',
      'Télécharger l\'album complet',
      'Relancer une fois, deux ou trois jours après',
    ],
  },
]
