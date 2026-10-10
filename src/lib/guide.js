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
//
//  Fichier PARTAGÉ avec l'app (aucun import). `GUIDE`, `CHAPTERS` et
//  `CHECKLIST` restent la version française ; `guideDe(langue)`,
//  `chapitresDe(langue)` et `checklistDe(langue)` renvoient la version dans
//  la langue voulue (par défaut celle du navigateur ou de l'app,
//  `globalThis.__ttfLangue`). Les liens du corps restent sans préfixe de
//  langue (« /create?tier=5 ») : le site les préfixe à l'affichage.
// ============================================================

const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr

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

// ------------------------------------------------------------
//  English
// ------------------------------------------------------------

const GUIDE_EN = {
  slug: 'guide',
  title: 'Getting great photos from your guests',
  subtitle: "The host's guide",
  promise:
    'Seven short chapters so that your guests play along, your photos turn out well, and the reveal becomes a moment rather than one more folder on your phone.',
  readingTime: '12 min read',
  exchange:
    "Leave your email address: the guide opens straight away on this page, and you'll receive the link so you can find it again later. One email a month at most, unsubscribe in one click.",
}

const CHAPTERS_EN = [
  {
    n: 1,
    title: 'Choosing the right number of shots',
    teaser: 'Why 5 photos beat 15 at a short party, and the table to check for your type of event.',
    body: `
<p>This is the setting that changes everything, and the one most often got wrong. Too many shots and the constraint disappears: your guests fire away and you end up with 400 blurry photos. Too few and some people don't dare use them, for fear of “wasting” one.</p>
<p>The rule of thumb: <strong>the shorter and busier the event, the fewer shots you need</strong>. An intense evening tells its story very well in 5 photos per person. A week's holiday needs more room to breathe.</p>
<table>
  <thead><tr><th>Type of event</th><th>Length</th><th>Recommended shots</th></tr></thead>
  <tbody>
    <tr><td>Birthday party, hen party</td><td>1 evening</td><td>5</td></tr>
    <tr><td>Wedding (ceremony + party)</td><td>1 day</td><td>8 to 10</td></tr>
    <tr><td>Two-day wedding, weekend</td><td>2 to 3 days</td><td>12</td></tr>
    <tr><td>Holiday with friends, trip</td><td>1 week</td><td>15</td></tr>
    <tr><td>Company retreat or party</td><td>1 to 2 days</td><td>6 to 8</td></tr>
  </tbody>
</table>
<h3>What about top-ups?</h3>
<p>You can offer a top-up of 1 to 5 photos, given automatically to a guest who has used up their quota. It's an excellent setting: those who don't care will never ask for it, and those who have caught the bug get another round.</p>
<p>Our advice: <strong>low quota + top-up enabled</strong>. You get the constraint at the start, and the enthusiasm at the end.</p>
<p>Both settings are chosen when you create the event, and can be changed right up to the big day: nothing is set in stone. <a href="/create?tier=5">Create my event</a>.</p>
`,
  },
  {
    n: 2,
    title: 'Choosing the right moment for the reveal',
    teaser: 'The next morning or a week later? Both work, but for different reasons.',
    body: `
<p>The reveal date isn't a technical detail: it's the end of your story. There are two schools of thought, and neither is wrong.</p>
<h3>The next morning (11 am)</h3>
<p>The “see you at breakfast” effect. Everyone still has the party in their head, phones are lying around, and the photos arrive at the exact moment people start retelling the night before. It's the most festive choice, and the one that gets shared the most.</p>
<h3>A week later</h3>
<p>The postcard effect. The party is over, everyday life has resumed, and the gallery pops up like a reminder. It's more moving, and often looked at for longer. The one to go for at a wedding.</p>
<h3>What to avoid</h3>
<ul>
  <li><strong>The same evening, during the party.</strong> Everyone starts looking at their phone instead of dancing, and you no longer have time to go through the photos.</li>
  <li><strong>More than a month later.</strong> The momentum is lost, and some guests won't open the link again.</li>
</ul>
<p>Either way, leave yourself <strong>at least a few hours between the end of the event and the reveal</strong>: that's your window to look through the gallery calmly (see chapter 5).</p>
`,
  },
  {
    n: 3,
    title: 'Getting everyone to scan the QR code',
    teaser: 'Where to put the code, what to say on the mic, and the trick for guests who can’t manage on their own.',
    body: `
<p>This is the only real hurdle of the evening: a guest who hasn't scanned won't take a single photo. Here's what works.</p>
<h3>Multiply the touchpoints</h3>
<ul>
  <li><strong>On the tables</strong>: a small table tent on each table is the most effective. People scan as they sit down, before the drinks.</li>
  <li><strong>In the toilets</strong>, no joke: everyone goes there, alone, phone in hand. The best scan rate of the evening.</li>
  <li><strong>On the seating plan or the order of service</strong>: for those who arrive early.</li>
  <li><strong>At the bar</strong>: the wait is perfect.</li>
</ul>
<p>Once your event has been created, its QR code is ready to print. You can also use our <a href="/generateur-qr-code-mariage">poster generator</a> to get a page to put on the tables, with your names and your date.</p>
<h3>The announcement on the mic (for the DJ or the best man to make)</h3>
<p>Thirty seconds is enough, and the tone matters more than the content:</p>
<p><em>“Tonight, you're the photographers. Scan the QR code on your table: you each have 8 photos, not one more. So aim well. We'll discover them all together tomorrow morning.”</em></p>
<p>The three things not to forget: <strong>the number of photos</strong> (that's what creates the game), <strong>the time of the reveal</strong> (that's what creates the anticipation), and <strong>“no app to install”</strong> (that's what removes the last hesitation).</p>
<h3>The trick for the stragglers</h3>
<p>There will always be someone whose camera won't scan, or whose phone is too old. The solution: <strong>have them scan it from someone else's phone</strong>, then send them the link by message. The link works exactly like the QR code. Nobody is left out.</p>
`,
  },
  {
    n: 4,
    title: 'Getting things going (and handling shy guests)',
    teaser: 'How to get lively photos rather than the same table from the same angle thirty times over.',
    body: `
<p>The scanning is done, but nobody dares to start. That's normal: with a limited quota, everyone waits for “the right moment”. Your job is to set it off.</p>
<h3>Take the first photo yourself</h3>
<p>As soon as the gallery exists, take a photo and show it to the people around you. The effect is immediate: the counter is running, the game becomes real.</p>
<h3>Give ideas, not orders</h3>
<p>A list of suggestions on the tables gets a huge number of people going. For example:</p>
<ul>
  <li>A photo of the person sitting opposite you</li>
  <li>A detail nobody will notice (the shoes, the cake, a hand)</li>
  <li>Someone really laughing</li>
  <li>The dance floor seen from above</li>
  <li>A candid shot of the newlyweds / the guest of honour</li>
</ul>
<h3>Give children and teenagers a role</h3>
<p>They take the best photos, every time: they're at a different height, they have no inhibitions, and they go where adults don't. Make sure they've scanned.</p>
<h3>Reassure people about bad shots</h3>
<p>Many guests don't dare press the shutter for fear of wasting a shot. Tell them: <strong>a bad photo can be deleted, and the space is freed up</strong>. They can never go over their quota, but they aren't punished for a blurry shot. It gets a huge number of people going.</p>
`,
  },
  {
    n: 5,
    title: 'Reviewing the gallery before everyone sees it',
    teaser: 'The most important half hour: only you can see the photos, and you decide what goes out.',
    body: `
<p>Between the end of the event and the reveal, <strong>you are the only one who can see the photos</strong>. Your guests only see their own. This is your window for sorting, and it deserves to be taken seriously: it's what separates a gallery people share from a gallery people regret.</p>
<h3>What to look for</h3>
<ul>
  <li>The photo taken at 3 am that the photographer doesn't remember</li>
  <li>The one where someone is clearly uncomfortable</li>
  <li>The exact duplicate (the same scene by five people)</li>
  <li>The completely black or completely blurred frame</li>
</ul>
<p>Hiding a photo is discreet: nobody is notified, and the person who took it won't know it has been removed.</p>
<h3>Do it with others</h3>
<p>You can invite <strong>co-hosts</strong>: the couple, a best man or bridesmaid, a trusted friend. They see the photos before the reveal and can sort through them with you. It's especially useful for a wedding: the couple get a sneak preview of their photos, and nobody carries the responsibility for what goes out alone.</p>
<h3>Getting the balance right</h3>
<p>Resist the urge to polish everything. Imperfect photos (motion blur, crooked framing, closed eyes) are exactly what gives a shared gallery its soul. Remove what bothers someone, not what isn't pretty.</p>
`,
  },
  {
    n: 6,
    title: 'Making the most of the reveal',
    teaser: 'A gallery that opens without warning isn’t an event. Here’s how to make it one.',
    body: `
<p>Your guests receive a notification when the gallery opens. But a message from you at the same moment completely changes the scale of it.</p>
<h3>Prepare the message in advance</h3>
<p>Write it before the event, while you have time. On the day, all you'll have to do is send it to the group chat:</p>
<p><em>“That's it, the film has been developed 🎞️ 142 photos, taken by 47 of you. Here's what you saw of our party: [link]. We hadn't seen any of it.”</em></p>
<h3>Give a number</h3>
<p>“142 photos by 47 people” is infinitely stronger than “the photos are up”. The number tells the story of everyone taking part: it's what makes people want to click straight away.</p>
<h3>Follow up once, and only once</h3>
<p>Two or three days later, a second message with a standout photo as a preview brings in the latecomers. After that, let it be.</p>
`,
  },
  {
    n: 7,
    title: 'After the party: downloading and archiving',
    teaser: 'What to do within six months, and what you can forget about.',
    body: `
<p>Only one thing really matters after the reveal: <strong>downloading the full album</strong>. Your photos stay online for six months after the reveal, then are deleted automatically (you'll be warned by email beforehand, several times).</p>
<h3>The routine in three steps</h3>
<ul>
  <li><strong>On the day of the reveal</strong>: download the full album in one go, and store it in the same place as the rest of your photos.</li>
  <li><strong>Within the week</strong>: send the gallery link to those who couldn't come. It remains accessible to anyone who has the link.</li>
  <li><strong>Before the six months are up</strong>: check that your download is safely stored (external drive, cloud, USB stick). After that, you can forget about it.</li>
</ul>
<h3>The advice we always give</h3>
<p>Get a dozen photos printed. A shared gallery produces images no professional photographer could have taken: your guests' point of view. They're often the ones that end up on the wall.</p>
`,
  },
]

const CHECKLIST_EN = [
  {
    when: '30 days before',
    items: [
      'Create the event and choose the number of shots',
      'Set the reveal date (see chapter 2)',
      'Enable photo top-ups',
      'Invite the co-hosts',
    ],
  },
  {
    when: '7 days before',
    items: [
      'Print the QR codes (tables, toilets, bar)',
      'Prepare the list of photo suggestions',
      'Brief the DJ or best man on the mic announcement',
      'Write the reveal message in advance',
    ],
  },
  {
    when: 'On the day',
    items: [
      'Put out the QR codes before the guests arrive',
      'Have the announcement made on the mic early in the evening',
      'Take the first photo yourself',
      'Check that the children and teenagers have scanned',
    ],
  },
  {
    when: 'Afterwards',
    items: [
      'Review the gallery and hide anything awkward',
      'Send the reveal message with the numbers',
      'Download the full album',
      'Follow up once, two or three days later',
    ],
  },
]

// ------------------------------------------------------------
//  Deutsch
// ------------------------------------------------------------

const GUIDE_DE = {
  slug: 'guide',
  title: 'So gelingen Ihre gemeinsamen Fotos',
  subtitle: 'Der Leitfaden für Gastgeber',
  promise:
    'Sieben kurze Kapitel, damit Ihre Gäste mitmachen, Ihre Fotos gelingen und die Präsentation zu einem echten Moment wird, statt zu einem weiteren Ordner auf Ihrem Handy.',
  readingTime: '12 Min. Lesezeit',
  exchange:
    'Hinterlassen Sie Ihre E-Mail-Adresse: Der Leitfaden öffnet sich sofort auf dieser Seite, und Sie erhalten den Link, um ihn später wiederzufinden. Höchstens eine E-Mail pro Monat, Abmeldung mit einem Klick.',
}

const CHAPTERS_DE = [
  {
    n: 1,
    title: 'Die richtige Anzahl an Aufnahmen wählen',
    teaser: 'Warum 5 Fotos auf einer kurzen Feier mehr bringen als 15, und die Tabelle für Ihre Art von Event.',
    body: `
<p>Diese Einstellung verändert alles, und sie wird am häufigsten falsch gewählt. Zu viele Aufnahmen, und die Beschränkung verschwindet: Ihre Gäste knipsen drauflos, und Sie bekommen 400 unscharfe Fotos. Zu wenige, und manche trauen sich nicht, sie zu nutzen, aus Angst, eine zu „verschwenden“.</p>
<p>Die Faustregel: <strong>Je kürzer und dichter das Event, desto weniger Aufnahmen braucht es</strong>. Ein intensiver Abend lässt sich sehr gut in 5 Fotos pro Person erzählen. Eine Urlaubswoche braucht mehr Luft.</p>
<table>
  <thead><tr><th>Art des Events</th><th>Dauer</th><th>Empfohlene Aufnahmen</th></tr></thead>
  <tbody>
    <tr><td>Geburtstagsfeier, Junggesellinnenabschied</td><td>1 Abend</td><td>5</td></tr>
    <tr><td>Hochzeit (Trauung + Feier)</td><td>1 Tag</td><td>8 bis 10</td></tr>
    <tr><td>Hochzeit über zwei Tage, Wochenende</td><td>2 bis 3 Tage</td><td>12</td></tr>
    <tr><td>Urlaub mit Freunden, Reise</td><td>1 Woche</td><td>15</td></tr>
    <tr><td>Seminar, Firmenfeier</td><td>1 bis 2 Tage</td><td>6 bis 8</td></tr>
  </tbody>
</table>
<h3>Und das Nachladen?</h3>
<p>Sie können ein Nachladen von 1 bis 5 Fotos vorsehen, das dem Gast automatisch angeboten wird, wenn sein Kontingent aufgebraucht ist. Eine hervorragende Einstellung: Wem es egal ist, der fordert es nie an, und wer Gefallen am Spiel gefunden hat, legt noch eine Runde nach.</p>
<p>Unser Rat: <strong>niedriges Kontingent + Nachladen aktiviert</strong>. So haben Sie die Beschränkung am Anfang und die Begeisterung am Ende.</p>
<p>Beide Einstellungen wählen Sie beim Erstellen des Events, und sie lassen sich bis zum großen Tag ändern: Nichts ist endgültig. <a href="/create?tier=5">Mein Event erstellen</a>.</p>
`,
  },
  {
    n: 2,
    title: 'Den richtigen Präsentationstermin wählen',
    teaser: 'Am nächsten Morgen oder eine Woche später? Beides funktioniert, aber aus unterschiedlichen Gründen.',
    body: `
<p>Der Präsentationstermin ist kein technisches Detail: Er ist das Ende Ihrer Geschichte. Es gibt zwei Schulen, und keine liegt falsch.</p>
<h3>Am nächsten Morgen (11 Uhr)</h3>
<p>Der „Wir sehen uns beim Frühstück“-Effekt. Alle haben die Feier noch im Kopf, die Handys liegen herum, und die Fotos kommen genau in dem Moment, in dem man anfängt, sich vom Vorabend zu erzählen. Die festlichste Wahl, und die, bei der am meisten geteilt wird.</p>
<h3>Eine Woche später</h3>
<p>Der Postkarten-Effekt. Die Feier ist vorbei, der Alltag hat wieder begonnen, und die Galerie taucht auf wie eine Erinnerung. Das ist berührender, und die Fotos werden oft länger angeschaut. Die bessere Wahl für eine Hochzeit.</p>
<h3>Was Sie vermeiden sollten</h3>
<ul>
  <li><strong>Noch am selben Abend, während der Feier.</strong> Alle schauen aufs Handy, statt zu tanzen, und Ihnen bleibt keine Zeit mehr, die Fotos durchzusehen.</li>
  <li><strong>Mehr als einen Monat später.</strong> Der Schwung ist weg, und ein Teil der Gäste öffnet den Link nicht mehr.</li>
</ul>
<p>Lassen Sie sich in jedem Fall <strong>mindestens ein paar Stunden zwischen dem Ende des Events und der Präsentation</strong>: Das ist Ihr Zeitfenster, um die Galerie in Ruhe durchzusehen (siehe Kapitel 5).</p>
`,
  },
  {
    n: 3,
    title: 'Alle Gäste den QR-Code scannen lassen',
    teaser: 'Wo der Code hinkommt, was man am Mikrofon sagt, und der Trick für Gäste, die es allein nicht schaffen.',
    body: `
<p>Das ist die einzige echte Hürde des Abends: Ein Gast, der nicht gescannt hat, macht kein einziges Foto. Das funktioniert:</p>
<h3>Viele Kontaktpunkte schaffen</h3>
<ul>
  <li><strong>Auf den Tischen</strong>: ein kleiner Tischaufsteller pro Tisch ist am wirksamsten. Die Gäste scannen beim Hinsetzen, noch vor dem Aperitif.</li>
  <li><strong>Auf den Toiletten</strong>, kein Witz: Jeder geht einmal hin, allein, mit dem Handy in der Hand. Die beste Scanrate des Abends.</li>
  <li><strong>Auf dem Sitzplan oder im Programmheft</strong>: für alle, die früh da sind.</li>
  <li><strong>An der Bar</strong>: Die Wartezeit ist perfekt dafür.</li>
</ul>
<p>Sobald Ihr Event erstellt ist, ist sein QR-Code druckfertig. Sie können auch unseren <a href="/generateur-qr-code-mariage">Poster-Generator</a> nutzen, um eine Seite für die Tische zu gestalten, mit Ihren Vornamen und Ihrem Datum.</p>
<h3>Die Ansage am Mikrofon (vom DJ oder Trauzeugen)</h3>
<p>Dreißig Sekunden genügen, und der Ton zählt mehr als der Inhalt:</p>
<p><em>„Heute Abend seid ihr die Fotografen. Scannt den QR-Code auf eurem Tisch: Jeder hat 8 Fotos, kein einziges mehr. Also zielt gut. Morgen früh entdecken wir alles gemeinsam.“</em></p>
<p>Die drei Punkte, die Sie nicht vergessen sollten: <strong>die Anzahl der Fotos</strong> (das macht das Spiel aus), <strong>der Präsentationstermin</strong> (das weckt die Vorfreude) und <strong>„keine App nötig“</strong> (das räumt das letzte Zögern aus).</p>
<h3>Der Trick für die Nachzügler</h3>
<p>Es gibt immer jemanden, dessen Kamera nicht scannt oder dessen Handy zu alt ist. Die Lösung: <strong>Lassen Sie den Code mit dem Handy einer anderen Person scannen</strong> und schicken Sie ihm den Link per Nachricht. Der Link funktioniert genauso wie der QR-Code. Niemand bleibt außen vor.</p>
`,
  },
  {
    n: 4,
    title: 'Die Stimmung anstoßen (und schüchterne Gäste abholen)',
    teaser: 'Wie Sie lebendige Fotos bekommen statt dreißigmal denselben Tisch aus demselben Winkel.',
    body: `
<p>Gescannt ist, aber niemand traut sich anzufangen. Das ist normal: Mit einem begrenzten Kontingent wartet jeder auf „den richtigen Moment“. Ihre Aufgabe ist es, ihn auszulösen.</p>
<h3>Machen Sie das erste Foto selbst</h3>
<p>Sobald die Galerie existiert, machen Sie ein Foto und zeigen es herum. Die Wirkung ist sofort da: Der Zähler läuft, das Spiel wird real.</p>
<h3>Geben Sie Ideen, keine Anweisungen</h3>
<p>Eine Liste mit Vorschlägen auf den Tischen hilft enorm vielen Gästen auf die Sprünge. Zum Beispiel:</p>
<ul>
  <li>Ein Foto der Person, die Ihnen gegenübersitzt</li>
  <li>Ein Detail, das niemand bemerken wird (die Schuhe, die Torte, eine Hand)</li>
  <li>Jemand, der richtig lacht</li>
  <li>Die Tanzfläche von oben</li>
  <li>Ein Schnappschuss vom Brautpaar / vom Ehrengast</li>
</ul>
<h3>Geben Sie Kindern und Jugendlichen eine Aufgabe</h3>
<p>Sie machen jedes Mal die besten Fotos: Sie sind auf einer anderen Höhe, haben keine Hemmungen und gehen dorthin, wo Erwachsene nicht hingehen. Achten Sie darauf, dass sie gescannt haben.</p>
<h3>Nehmen Sie die Angst vor dem missglückten Foto</h3>
<p>Viele Gäste trauen sich nicht auszulösen, weil sie Angst haben, eine Aufnahme zu verschwenden. Sagen Sie ihnen: <strong>Ein misslungenes Foto kann gelöscht werden, und der Platz wird wieder frei</strong>. Ihr Kontingent können sie nie überschreiten, aber für ein unscharfes Bild werden sie nicht bestraft. Das hilft enorm vielen Gästen.</p>
`,
  },
  {
    n: 5,
    title: 'Die Galerie durchsehen, bevor alle sie sehen',
    teaser: 'Die wichtigste halbe Stunde: Nur Sie sehen die Fotos, und Sie entscheiden, was veröffentlicht wird.',
    body: `
<p>Zwischen dem Ende des Events und der Präsentation <strong>sind Sie der Einzige, der die Fotos sieht</strong>. Ihre Gäste sehen nur ihre eigenen. Das ist Ihr Zeitfenster zum Aussortieren, und Sie sollten es ernst nehmen: Hier entscheidet sich, ob man eine Galerie gern teilt oder sie bereut.</p>
<h3>Worauf Sie achten sollten</h3>
<ul>
  <li>Das Foto von 3 Uhr morgens, an das sich der Fotograf nicht erinnert</li>
  <li>Das, auf dem sich jemand sichtlich unwohl fühlt</li>
  <li>Das exakte Duplikat (dieselbe Szene von fünf Personen)</li>
  <li>Die komplett schwarze oder komplett unscharfe Aufnahme</li>
</ul>
<p>Ein Foto auszublenden geschieht diskret: Niemand wird benachrichtigt, und die Person, die es gemacht hat, erfährt nicht, dass es entfernt wurde.</p>
<h3>Machen Sie es zu mehreren</h3>
<p>Sie können <strong>Mit-Gastgeber</strong> einladen: das Brautpaar, einen Trauzeugen, einen vertrauten Freund. Sie sehen die Fotos vor der Präsentation und können mit Ihnen aussortieren. Das ist besonders bei einer Hochzeit praktisch: Das Brautpaar sieht seine Fotos vorab, und niemand trägt allein die Verantwortung dafür, was veröffentlicht wird.</p>
<h3>Das richtige Maß</h3>
<p>Widerstehen Sie der Versuchung, alles zu glätten. Unperfekte Fotos (Bewegungsunschärfe, schiefer Bildausschnitt, geschlossene Augen) sind genau das, was einer gemeinsamen Galerie ihre Seele gibt. Entfernen Sie, was jemanden stört, nicht das, was nicht hübsch ist.</p>
`,
  },
  {
    n: 6,
    title: 'Die Präsentation zu einem Erlebnis machen',
    teaser: 'Eine Galerie, die sich ohne Ankündigung öffnet, ist kein Ereignis. So wird eines daraus.',
    body: `
<p>Ihre Gäste erhalten eine Benachrichtigung, wenn sich die Galerie öffnet. Aber eine Nachricht von Ihnen im selben Moment verändert die Wirkung vollständig.</p>
<h3>Bereiten Sie die Nachricht vor</h3>
<p>Schreiben Sie sie vor dem Event, solange Sie Zeit haben. Am Tag selbst müssen Sie sie nur noch in den Gruppenchat schicken:</p>
<p><em>„Es ist so weit, der Film ist entwickelt 🎞️ 142 Fotos, aufgenommen von 47 von euch. Das habt ihr von unserer Feier gesehen: [Link]. Wir hatten nichts davon mitbekommen.“</em></p>
<h3>Nennen Sie eine Zahl</h3>
<p>„142 Fotos von 47 Personen“ wirkt unendlich stärker als „die Fotos sind online“. Die Zahl erzählt davon, dass alle mitgemacht haben: Genau das macht Lust, sofort zu klicken.</p>
<h3>Erinnern Sie einmal, nur ein einziges Mal</h3>
<p>Zwei oder drei Tage später holt eine zweite Nachricht mit einem besonders schönen Foto als Vorschau die Nachzügler ab. Danach lassen Sie es laufen.</p>
`,
  },
  {
    n: 7,
    title: 'Nach der Feier: herunterladen und archivieren',
    teaser: 'Was Sie innerhalb von sechs Monaten tun sollten, und was Sie vergessen können.',
    body: `
<p>Nach der Präsentation ist nur eine Sache wirklich wichtig: <strong>das komplette Album herunterladen</strong>. Ihre Fotos bleiben sechs Monate nach der Präsentation online und werden dann automatisch gelöscht (Sie werden vorher mehrmals per E-Mail gewarnt).</p>
<h3>Die Routine in drei Schritten</h3>
<ul>
  <li><strong>Am Tag der Präsentation</strong>: Laden Sie das komplette Album auf einmal herunter und legen Sie es dort ab, wo auch Ihre übrigen Fotos liegen.</li>
  <li><strong>In derselben Woche</strong>: Schicken Sie den Link zur Galerie an alle, die nicht dabei sein konnten. Sie bleibt für alle erreichbar, die den Link haben.</li>
  <li><strong>Vor Ablauf der sechs Monate</strong>: Prüfen Sie, ob Ihr Download sicher verwahrt ist (externe Festplatte, Cloud, USB-Stick). Danach können Sie es vergessen.</li>
</ul>
<h3>Der Rat, den wir immer geben</h3>
<p>Lassen Sie ein Dutzend Fotos drucken. Eine gemeinsame Galerie liefert Bilder, die kein Profifotograf hätte machen können: den Blickwinkel Ihrer Gäste. Oft sind es genau diese, die am Ende an der Wand hängen.</p>
`,
  },
]

const CHECKLIST_DE = [
  {
    when: '30 Tage vorher',
    items: [
      'Event erstellen und Anzahl der Aufnahmen wählen',
      'Präsentationstermin festlegen (siehe Kapitel 2)',
      'Nachladen von Fotos aktivieren',
      'Mit-Gastgeber einladen',
    ],
  },
  {
    when: '7 Tage vorher',
    items: [
      'QR-Codes drucken (Tische, Toiletten, Bar)',
      'Liste mit Fotovorschlägen vorbereiten',
      'DJ oder Trauzeugen für die Ansage am Mikrofon briefen',
      'Nachricht zur Präsentation vorab schreiben',
    ],
  },
  {
    when: 'Am großen Tag',
    items: [
      'QR-Codes vor Ankunft der Gäste auslegen',
      'Ansage am Mikrofon zu Beginn des Abends machen lassen',
      'Das erste Foto selbst machen',
      'Prüfen, ob Kinder und Jugendliche gescannt haben',
    ],
  },
  {
    when: 'Danach',
    items: [
      'Galerie durchsehen und Störendes ausblenden',
      'Nachricht zur Präsentation mit der Zahl verschicken',
      'Komplettes Album herunterladen',
      'Einmal erinnern, zwei oder drei Tage später',
    ],
  },
]

// ------------------------------------------------------------
//  Choix de la langue
// ------------------------------------------------------------

const VERSIONS = {
  fr: { guide: GUIDE, chapitres: CHAPTERS, checklist: CHECKLIST },
  en: { guide: GUIDE_EN, chapitres: CHAPTERS_EN, checklist: CHECKLIST_EN },
  de: { guide: GUIDE_DE, chapitres: CHAPTERS_DE, checklist: CHECKLIST_DE },
}

// Mêmes formes que GUIDE, CHAPTERS et CHECKLIST. Sans argument : la langue
// du navigateur ou de l'app.
export function guideDe(langue) {
  return tr(VERSIONS, langue).guide
}

export function chapitresDe(langue) {
  return tr(VERSIONS, langue).chapitres
}

export function checklistDe(langue) {
  return tr(VERSIONS, langue).checklist
}
