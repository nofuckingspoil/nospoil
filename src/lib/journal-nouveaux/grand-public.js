// ============================================================
//  Journal : articles « grand-public » (10/10/2026).
//  POSTS : articles français (même forme que ALL_POSTS dans journal.js).
//  POSTS_EN / POSTS_DE : traductions, une entrée par slug
//  (title, excerpt, caption, body, faq), comme journal-en.js.
// ============================================================

export const POSTS = [
  // ----------------------------------------------------------
  // Requêtes visées : « animation mariage originale », « idée animation
  // mariage », « animation mariage invités », « animation vin d’honneur ».
  // EN : « unique wedding entertainment ideas », « cocktail hour ideas ».
  // Vu dans Google (10/10/2026) : ABC Salles, Mariages.net, 1001 Salles,
  // Bridebook alignent des listes (10 à 50 idées) sans prix ni effort,
  // rarement classées par moment de la journée. Sous-sujets récurrents :
  // magicien, caricaturiste, bar à cocktails, jeux en bois, photobooth,
  // quiz des mariés, flash mob, karaoké, livre d’or audio, animations
  // culinaires. Personne ne parle vraiment du rythme (temps morts, ne pas
  // tout empiler) ni des animations interdites (lâcher de lanternes,
  // interdit par arrêté dans plusieurs départements). C’est notre angle.
  // ----------------------------------------------------------
  {
    slug: 'idees-animation-mariage',
    image: '/journal/idees-animation-mariage.webp',
    cat: 'Organisation',
    title: 'Animation mariage originale : 36 idées par moment et budget',
    excerpt: 'Animation mariage originale : 36 idées classées de la cérémonie au brunch, avec prix, effort et conseils de rythme pour ne jamais laisser tes invités s’ennuyer.',
    author: 'Léa Ferrand',
    date: '2026-10-10',
    read: '16 min',
    caption: 'Des invités jouent au mölkky sur la pelouse pendant le vin d’honneur d’un mariage',
    body: `
<p>Tu cherches une <strong>animation de mariage originale</strong>, mais les listes que tu trouves alignent toutes les mêmes idées sans dire combien ça coûte, combien de temps ça prend à préparer, ni à quel moment de la journée ça marche vraiment. Voici 36 idées classées par moment (cérémonie, vin d’honneur, repas, soirée, lendemain), chacune avec son principe, son coût indicatif, l’effort qu’elle demande et le type de mariage auquel elle convient.</p>
<p>Avant de piocher, un conseil qui vaut plus que toutes les idées réunies : <strong>une bonne animation, c’est d’abord une animation placée au bon moment</strong>. On y revient en détail après la liste.</p>

<h2>Avant de choisir : trois règles pour ne pas rater ton animation de mariage</h2>
<ul>
<li><strong>Ne remplis pas chaque minute.</strong> Tes invités viennent aussi pour discuter, manger et danser. Une animation toutes les vingt minutes fatigue tout le monde, toi compris.</li>
<li><strong>Vise les temps morts.</strong> Il y en a toujours au moins quatre dans une journée de mariage (on les détaille plus bas). C’est là qu’une animation change vraiment l’ambiance.</li>
<li><strong>Désigne quelqu’un.</strong> Chaque animation qui demande une coordination doit avoir un responsable qui n’est pas toi : un témoin, un cousin organisé, le wedding planner. Le jour J, tu ne dois rien piloter.</li>
</ul>
<p>Pour chaque idée, on indique l’<strong>effort</strong> : <em>faible</em> (une heure de préparation ou moins), <em>moyen</em> (quelques soirées ou plusieurs personnes à coordonner), <em>fort</em> (un vrai projet, ou un prestataire à trouver et briefer).</p>

<h2>Pendant la cérémonie : 5 idées</h2>
<p>La cérémonie n’est pas le moment des jeux, mais quelques touches la rendent plus personnelle et plus vivante, surtout si elle est laïque.</p>

<h3>1. Les mots des proches</h3>
<p><strong>Le principe :</strong> deux ou trois proches lisent un texte, racontent une anecdote ou témoignent de votre histoire. C’est souvent le moment le plus émouvant de la journée.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> moyen. Il faut choisir les intervenants tôt, leur donner une durée (trois minutes chacun, pas plus) et relire l’ordre de passage.<br>
<strong>Pour quel mariage :</strong> tous, et surtout les cérémonies laïques, où rien n’est imposé.</p>

<h3>2. Un rituel symbolique</h3>
<p><strong>Le principe :</strong> un geste qui matérialise l’union. Mélange de sables colorés dans un même vase, arbre planté ensemble, mains liées par un ruban, ou coffret dans lequel vous enfermez une lettre et une bouteille à ouvrir dans dix ans.<br>
<strong>Coût :</strong> 20 à 80 € selon le rituel.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> cérémonies laïques ou en extérieur. Le coffret à lettres marche aussi très bien en petit comité.</p>

<h3>3. La musique en direct</h3>
<p><strong>Le principe :</strong> un musicien joue pour l’entrée, la sortie et entre les interventions. Un violon, une guitare ou une voix changent complètement l’atmosphère par rapport à une enceinte.<br>
<strong>Coût :</strong> gratuit si un proche joue, sinon comptez en général de 300 à 1 000 € pour un musicien professionnel, davantage pour un quatuor.<br>
<strong>Effort :</strong> moyen (choix des morceaux, répétition, prise électrique si besoin).<br>
<strong>Pour quel mariage :</strong> tous. Si un proche joue, c’est un cadeau qu’il te fait : remercie-le en le citant dans le livret.</p>

<h3>4. Un livret de cérémonie qui occupe</h3>
<p><strong>Le principe :</strong> au-delà du déroulé, le livret contient les paroles d’une chanson que tout le monde reprend, un petit jeu pour les enfants (mots mêlés, coloriage) ou la question du jour que chacun garde en tête pour le vin d’honneur.<br>
<strong>Coût :</strong> moins de 100 € d’impression pour une centaine d’exemplaires, souvent beaucoup moins si tu imprimes toi-même.<br>
<strong>Effort :</strong> moyen (mise en page).<br>
<strong>Pour quel mariage :</strong> ceux où les invités patientent longtemps avant le début, ou avec beaucoup d’enfants.</p>

<h3>5. La sortie sous les pétales</h3>
<p><strong>Le principe :</strong> à la sortie, les invités font une haie et lancent des pétales séchés, de la lavande, des confettis biodégradables ou soufflent des bulles. C’est aussi l’une des photos les plus réussies de la journée.<br>
<strong>Coût :</strong> 20 à 60 €.<br>
<strong>Effort :</strong> faible, à condition de confier la distribution des cornets à deux personnes.<br>
<strong>Pour quel mariage :</strong> tous. Vérifie simplement ce que le lieu autorise : certaines mairies, églises et domaines interdisent le riz ou les confettis.</p>

<h2>Animation vin d’honneur : 10 idées pour le moment le plus long</h2>
<p>Le vin d’honneur dure souvent une heure et demie à deux heures. C’est le moment où les invités qui ne se connaissent pas se croisent, pendant que toi tu fais tes photos de couple. C’est donc là qu’une animation est la plus utile : elle donne un prétexte pour se parler.</p>

<h3>6. L’appareil photo jetable dans le téléphone des invités</h3>
<p><strong>Le principe :</strong> un QR code posé à l’entrée, au bar et sur les tables. Chaque invité le scanne et son téléphone devient un appareil jetable : un nombre de photos limité (tu choisis entre 3 et 15 par personne), rien ne s’affiche avant la révélation, et l’album se dévoile d’un coup pour tout le monde, par défaut le lendemain. Comme les poses sont comptées, chacun réfléchit avant de déclencher : on obtient des photos de toute la journée, prises de dizaines de points de vue, y compris pendant que toi tu étais ailleurs.<br>
<strong>Coût :</strong> avec <a href="/appareil-jetable-mariage">Time to Flash</a>, gratuit jusqu’à 5 invités, puis paiement unique selon le nombre d’invités (14,99 € pour 50, 29,99 € pour 100, 59,99 € pour 300), sans abonnement.<br>
<strong>Effort :</strong> faible. Tu crées l’événement en quelques minutes et tu imprimes le QR code (le <a href="/generateur-qr-code-mariage">générateur d’affiche</a> est gratuit).<br>
<strong>Pour quel mariage :</strong> tous, et surtout ceux qui veulent une animation qui tourne du vin d’honneur jusqu’à la fin de soirée, sans file d’attente ni place à prévoir. Pas d’appli à installer : ça ouvre une page web, donc même les grands-parents s’y mettent. Si tu hésites avec une borne, un miroir ou des jetables en carton, on les a comparés dans <a href="/journal/comparatif-animations-photo-mariage">ce comparatif des animations photo</a>.</p>

<h3>7. Les jeux en bois et la pétanque</h3>
<p><strong>Le principe :</strong> mölkky, palets, jeu de quilles, chamboule-tout, puissance 4 géant, terrain de pétanque. Les invités jouent en équipes improvisées et se rencontrent sans s’en rendre compte.<br>
<strong>Coût :</strong> gratuit si tu empruntes autour de toi, souvent 50 à 150 € en location pour un lot complet.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> champêtres, en extérieur, avec des enfants. Prévois une solution de repli à l’abri si le temps tourne.</p>

<h3>8. Le musicien qui circule</h3>
<p><strong>Le principe :</strong> un saxophoniste, un guitariste ou un trio jazz qui se déplace entre les groupes. Plus vivant qu’une playlist, moins envahissant qu’un concert.<br>
<strong>Coût :</strong> en général 300 à 1 000 € selon la durée et la formation.<br>
<strong>Effort :</strong> moyen (trouver le bon musicien, valider le répertoire).<br>
<strong>Pour quel mariage :</strong> élégants, en domaine ou en château.</p>

<h3>9. Le magicien de proximité</h3>
<p><strong>Le principe :</strong> un magicien passe de groupe en groupe avec des tours faits à quelques centimètres des yeux (cartes, pièces, objets des invités). Il crée des conversations entre des gens qui ne se parlaient pas.<br>
<strong>Coût :</strong> à partir de 400 € environ, souvent davantage selon la notoriété et la durée.<br>
<strong>Effort :</strong> faible une fois réservé.<br>
<strong>Pour quel mariage :</strong> ceux où les deux familles se connaissent peu. Les enfants adorent.</p>

<h3>10. Le caricaturiste ou le portraitiste</h3>
<p><strong>Le principe :</strong> un dessinateur croque les invités en quelques minutes. Chacun repart avec son portrait : c’est à la fois une animation et un petit cadeau.<br>
<strong>Coût :</strong> comptez plusieurs centaines d’euros pour quelques heures.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> moyens et grands mariages. Demande combien de portraits il réalise à l’heure pour éviter la file d’attente.</p>

<h3>11. Le stand de dégustation</h3>
<p><strong>Le principe :</strong> un bar à huîtres, un plateau de fromages commenté, un bar à bière locale ou à spritz, une dégustation des vins du domaine. Le buffet devient un lieu de rassemblement.<br>
<strong>Coût :</strong> très variable, souvent intégré au devis du traiteur.<br>
<strong>Effort :</strong> faible si le traiteur s’en occupe.<br>
<strong>Pour quel mariage :</strong> gourmands, ou quand le vin d’honneur est long.</p>

<h3>12. La grande photo de groupe</h3>
<p><strong>Le principe :</strong> tous les invités réunis sur une seule photo, prise d’en haut (une fenêtre, un balcon, un escabeau). Dix minutes, une photo qui finit souvent encadrée.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible, à condition d’avoir un témoin qui rassemble tout le monde avec un micro. La méthode est ici : <a href="/journal/photos-de-groupe-mariage">réussir les photos de groupe</a>.<br>
<strong>Pour quel mariage :</strong> tous.</p>

<h3>13. Le livre d’or audio</h3>
<p><strong>Le principe :</strong> au lieu d’écrire, les invités laissent un message vocal. La version classique est un téléphone vintage posé sur une table : on décroche, on parle. Tu réécoutes tout après le mariage, avec les voix et les rires.<br>
<strong>Coût :</strong> la location d’un téléphone dédié se trouve souvent entre 150 et 300 €. Si tu utilises déjà Time to Flash, le livre d’or audio est une option à 9,99 € : chaque invité enregistre son message et un selfie depuis son téléphone, sans matériel à installer.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous. C’est l’un des souvenirs que les mariés réécoutent le plus.</p>

<h3>14. Le coin enfants</h3>
<p><strong>Le principe :</strong> un espace avec des coloriages, des jeux, un tapis, et idéalement un ou deux animateurs ou baby-sitters. Les parents profitent, les enfants aussi.<br>
<strong>Coût :</strong> gratuit si des ados de la famille s’en chargent (avec un vrai merci), sinon le tarif d’un animateur ou d’une baby-sitter pour la soirée, souvent quelques centaines d’euros.<br>
<strong>Effort :</strong> moyen.<br>
<strong>Pour quel mariage :</strong> dès qu’il y a plus de cinq ou six enfants.</p>

<h3>15. Le bar à cocktails animé</h3>
<p><strong>Le principe :</strong> un barman prépare devant les invités un ou deux cocktails signature, à vos prénoms ou inspirés de votre histoire.<br>
<strong>Coût :</strong> de quelques centaines d’euros à plus de 1 000 € selon le nombre d’invités et les boissons.<br>
<strong>Effort :</strong> moyen (choix des recettes, coordination avec le traiteur).<br>
<strong>Pour quel mariage :</strong> festifs, vin d’honneur en extérieur.</p>

<h2>Pendant le repas : 8 idées d’animation pour les invités</h2>
<p>Le repas est long, souvent trois heures. Le piège : enchaîner les animations au micro entre chaque plat, laisser refroidir les assiettes et épuiser le traiteur. Garde-toi deux ou trois temps forts, pas plus, et préviens le maître d’hôtel de leur place exacte dans le déroulé.</p>

<h3>16. Le plan de table qui raconte une histoire</h3>
<p><strong>Le principe :</strong> chaque table porte le nom d’un lieu ou d’un souvenir qui compte pour vous (votre premier voyage, la ville de votre rencontre), avec une photo et trois lignes d’explication. Les invités ont un sujet de conversation dès qu’ils s’assoient.<br>
<strong>Coût :</strong> gratuit, à part l’impression.<br>
<strong>Effort :</strong> moyen.<br>
<strong>Pour quel mariage :</strong> tous.</p>

<h3>17. Le quiz des mariés</h3>
<p><strong>Le principe :</strong> une feuille de dix questions sur vous par table, à remplir en équipe entre deux plats, ou le jeu de la chaussure (vous êtes dos à dos et levez votre chaussure ou celle de l’autre pour répondre à « qui des deux… »).<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous, à condition de rester court (dix minutes) et bienveillant.</p>

<h3>18. Les discours préparés et chronométrés</h3>
<p><strong>Le principe :</strong> pas une animation en soi, mais c’est ce qui fait ou défait un repas. Des discours de trois à cinq minutes, répartis entre les plats, avec un ordre de passage annoncé par un maître de cérémonie. Une chanson réécrite ou un petit sketch des témoins entrent dans la même case.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> moyen pour ceux qui parlent, faible pour toi.<br>
<strong>Pour quel mariage :</strong> tous. Au-delà de cinq interventions, tu perds la salle.</p>

<h3>19. Le diaporama ou la vidéo des proches</h3>
<p><strong>Le principe :</strong> vos photos d’enfance, vos premières vacances, ou une vidéo de messages enregistrés par ceux qui ne pouvaient pas venir.<br>
<strong>Coût :</strong> gratuit si le lieu a un vidéoprojecteur (sinon, location à prévoir).<br>
<strong>Effort :</strong> moyen à fort, c’est un vrai montage.<br>
<strong>Pour quel mariage :</strong> tous. Garde-le sous cinq minutes.</p>

<h3>20. Les enveloppes sur les tables</h3>
<p><strong>Le principe :</strong> une enveloppe par table contient des missions (prendre une photo de la table avec la mariée, trouver quelqu’un né le même mois que toi) ou des questions pour faire connaissance. Ça marche très bien en duo avec l’appareil jetable de l’idée 6 : les missions donnent des sujets aux photos.<br>
<strong>Coût :</strong> moins de 30 €.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> ceux où les tables mélangent des invités qui ne se connaissent pas.</p>

<h3>21. Le changement de place au dessert</h3>
<p><strong>Le principe :</strong> au dessert, la moitié de chaque table change de place selon un signe distribué au début (une couleur, une carte). Ou ce sont les mariés qui passent de table en table, en prenant le temps de s’asseoir.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> grands mariages, où l’on a peu parlé à certains invités.</p>

<h3>22. Le dessert spectacle</h3>
<p><strong>Le principe :</strong> sabrage du champagne, pièce montée arrivée en musique, bar à desserts, glacier ou crêpier qui sert à la minute.<br>
<strong>Coût :</strong> variable, souvent une option du traiteur.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous. C’est la transition idéale vers l’ouverture du bal.</p>

<h3>23. Les petits mots pour plus tard</h3>
<p><strong>Le principe :</strong> chaque invité écrit sur une carte un conseil, un souhait ou une prédiction pour vos dix ans de mariage. Vous les ouvrez à cette date.<br>
<strong>Coût :</strong> moins de 30 €.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous, très bien en petit comité.</p>

<h2>Pendant la soirée : 9 idées pour lancer et tenir la piste</h2>
<p>En soirée, le DJ fait l’essentiel. Les animations servent surtout à deux choses : faire venir sur la piste ceux qui n’osent pas, et offrir une alternative à ceux qui ne dansent pas.</p>

<h3>24. L’ouverture de bal qui embarque tout le monde</h3>
<p><strong>Le principe :</strong> vous commencez seuls, puis à un signal convenu les témoins vous rejoignent, puis les familles, puis toute la salle. Version plus ambitieuse : une chorégraphie apprise par un groupe d’amis.<br>
<strong>Coût :</strong> gratuit, ou quelques cours de danse si vous voulez une vraie chorégraphie.<br>
<strong>Effort :</strong> faible à fort selon l’ambition.<br>
<strong>Pour quel mariage :</strong> tous.</p>

<h3>25. Le blind test</h3>
<p><strong>Le principe :</strong> le DJ lance des extraits, les tables ou les familles s’affrontent. Les chansons de votre jeunesse font toujours un carton.<br>
<strong>Coût :</strong> gratuit si le DJ l’intègre.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> ceux où la piste met du temps à démarrer.</p>

<h3>26. Le karaoké</h3>
<p><strong>Le principe :</strong> une demi-heure de karaoké en milieu de soirée, ou en fin de nuit pour les derniers.<br>
<strong>Coût :</strong> souvent moins de 100 € en location de matériel, ou proposé par le DJ.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> entre amis, ambiance décontractée.</p>

<h3>27. Le photobooth</h3>
<p><strong>Le principe :</strong> une borne photo avec accessoires et impression immédiate des photos. Les invités repartent avec leur tirage.<br>
<strong>Coût :</strong> en général 350 à 900 € la soirée. Le détail des prix est ici : <a href="/journal/prix-photobooth-mariage">combien coûte un photobooth</a>.<br>
<strong>Effort :</strong> faible, il faut surtout une prise et environ 4 m².<br>
<strong>Pour quel mariage :</strong> ceux qui tiennent au tirage papier emporté le soir même.</p>

<h3>28. L’en-cas de minuit</h3>
<p><strong>Le principe :</strong> vers minuit ou une heure, un food truck, un stand de crêpes, de frites ou de croque-monsieur. Ça relance la soirée et ça évite les départs à jeun sur la route.<br>
<strong>Coût :</strong> variable, souvent facturé par personne. Une version maison (soupe à l’oignon, croques préparés par le traiteur) coûte bien moins cher.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> ceux qui finissent tard.</p>

<h3>29. Les accessoires de piste</h3>
<p><strong>Le principe :</strong> bracelets lumineux, lunettes, chapeaux, éventails distribués à un moment précis (souvent quand le DJ passe aux tubes). Effet immédiat sur l’ambiance et sur les photos.<br>
<strong>Coût :</strong> moins de 50 € pour une centaine d’invités.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> festifs.</p>

<h3>30. Les étincelles et le feu d’artifice</h3>
<p><strong>Le principe :</strong> des fontaines à étincelles froides autour de la piste pour l’ouverture de bal, ou un vrai feu d’artifice tiré par un professionnel.<br>
<strong>Coût :</strong> quelques centaines d’euros pour les fontaines, souvent 1 000 € et plus pour un feu tiré par un artificier.<br>
<strong>Effort :</strong> fort pour le feu d’artifice : accord du lieu, démarches en mairie, et en été les arrêtés sécheresse peuvent tout interdire au dernier moment.<br>
<strong>Pour quel mariage :</strong> grands mariages en domaine, avec de l’espace et des voisins éloignés.</p>

<h3>31. Le coin calme</h3>
<p><strong>Le principe :</strong> un salon à l’écart de la piste avec canapés, jeux de société, tisanes et lumière douce. Les grands-parents, les non-danseurs et ceux qui veulent juste parler y trouvent leur place.<br>
<strong>Coût :</strong> gratuit à 100 €.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous, surtout avec plusieurs générations.</p>

<h3>32. La danse de vos racines</h3>
<p><strong>Le principe :</strong> une danse traditionnelle de l’une des deux familles (cercle breton, danse orientale, sega, danse grecque), menée par ceux qui la connaissent. Les autres apprennent en direct.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> les mariages qui réunissent deux cultures. C’est souvent le moment dont tout le monde parle le lendemain.</p>

<h2>Le lendemain : 4 idées pour prolonger</h2>
<p>Le retour, brunch ou barbecue du lendemain, est de plus en plus courant. L’ambiance est détendue, les invités sont fatigués : pas besoin de grand spectacle.</p>

<h3>33. Le brunch avec la révélation des photos</h3>
<p><strong>Le principe :</strong> si tes invités ont pris des photos avec un appareil jetable (en carton ou dans leur téléphone), le brunch est le moment parfait pour les découvrir ensemble, projetées sur un mur ou partagées sur les téléphones. Toute la soirée défile, vue par chacun.<br>
<strong>Coût :</strong> gratuit si l’album est déjà prévu.<br>
<strong>Effort :</strong> faible. On explique comment organiser ce moment dans <a href="/journal/revelation-photos-lendemain-mariage">la révélation des photos le lendemain</a>.<br>
<strong>Pour quel mariage :</strong> tous ceux qui ont un retour.</p>

<h3>34. Le tournoi du lendemain</h3>
<p><strong>Le principe :</strong> pétanque, mölkky, foot ou volley, en équipes tirées au sort. On réutilise les jeux du vin d’honneur.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> champêtres, avec un grand terrain.</p>

<h3>35. La baignade ou la balade</h3>
<p><strong>Le principe :</strong> piscine du domaine, lac ou plage à proximité, balade jusqu’à un point de vue. Rien à organiser, sinon prévenir les invités de prendre un maillot.<br>
<strong>Coût :</strong> gratuit.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> l’été, avec hébergement sur place.</p>

<h3>36. Les remerciements en petit comité</h3>
<p><strong>Le principe :</strong> au calme, vous remettez un cadeau aux témoins, aux parents, à ceux qui ont aidé. Sans micro ni salle pleine, c’est souvent plus sincère que pendant le repas.<br>
<strong>Coût :</strong> celui des cadeaux.<br>
<strong>Effort :</strong> faible.<br>
<strong>Pour quel mariage :</strong> tous.</p>

<h2>Le tableau récapitulatif des 36 idées</h2>
<table>
<thead><tr><th>Idée</th><th>Moment</th><th>Budget</th><th>Effort</th></tr></thead>
<tbody>
<tr><td>Les mots des proches</td><td>Cérémonie</td><td>Gratuit</td><td>Moyen</td></tr>
<tr><td>Rituel symbolique</td><td>Cérémonie</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Musique en direct</td><td>Cérémonie</td><td>Gratuit à plus de 300 €</td><td>Moyen</td></tr>
<tr><td>Livret qui occupe</td><td>Cérémonie</td><td>Moins de 100 €</td><td>Moyen</td></tr>
<tr><td>Sortie sous les pétales</td><td>Cérémonie</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Appareil jetable dans les téléphones</td><td>Vin d’honneur et soirée</td><td>Gratuit à moins de 100 €</td><td>Faible</td></tr>
<tr><td>Jeux en bois et pétanque</td><td>Vin d’honneur</td><td>Gratuit à moins de 150 €</td><td>Faible</td></tr>
<tr><td>Musicien qui circule</td><td>Vin d’honneur</td><td>Plus de 300 €</td><td>Moyen</td></tr>
<tr><td>Magicien de proximité</td><td>Vin d’honneur</td><td>Plus de 400 €</td><td>Faible</td></tr>
<tr><td>Caricaturiste</td><td>Vin d’honneur</td><td>Plusieurs centaines d’euros</td><td>Faible</td></tr>
<tr><td>Stand de dégustation</td><td>Vin d’honneur</td><td>Variable</td><td>Faible</td></tr>
<tr><td>Grande photo de groupe</td><td>Vin d’honneur</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Livre d’or audio</td><td>Vin d’honneur</td><td>Moins de 100 € à 300 €</td><td>Faible</td></tr>
<tr><td>Coin enfants</td><td>Vin d’honneur et soirée</td><td>Gratuit à quelques centaines d’euros</td><td>Moyen</td></tr>
<tr><td>Bar à cocktails animé</td><td>Vin d’honneur</td><td>Plus de 300 €</td><td>Moyen</td></tr>
<tr><td>Plan de table qui raconte</td><td>Repas</td><td>Gratuit</td><td>Moyen</td></tr>
<tr><td>Quiz des mariés</td><td>Repas</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Discours chronométrés</td><td>Repas</td><td>Gratuit</td><td>Moyen</td></tr>
<tr><td>Diaporama ou vidéo</td><td>Repas</td><td>Gratuit</td><td>Moyen à fort</td></tr>
<tr><td>Enveloppes sur les tables</td><td>Repas</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Changement de place au dessert</td><td>Repas</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Dessert spectacle</td><td>Repas</td><td>Variable</td><td>Faible</td></tr>
<tr><td>Petits mots pour plus tard</td><td>Repas</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Ouverture de bal collective</td><td>Soirée</td><td>Gratuit</td><td>Faible à fort</td></tr>
<tr><td>Blind test</td><td>Soirée</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Karaoké</td><td>Soirée</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Photobooth</td><td>Soirée</td><td>Plus de 300 €</td><td>Faible</td></tr>
<tr><td>En-cas de minuit</td><td>Soirée</td><td>Variable</td><td>Faible</td></tr>
<tr><td>Accessoires de piste</td><td>Soirée</td><td>Moins de 100 €</td><td>Faible</td></tr>
<tr><td>Étincelles et feu d’artifice</td><td>Soirée</td><td>Plus de 300 €</td><td>Fort</td></tr>
<tr><td>Coin calme</td><td>Soirée</td><td>Gratuit à moins de 100 €</td><td>Faible</td></tr>
<tr><td>Danse de vos racines</td><td>Soirée</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Brunch et révélation des photos</td><td>Lendemain</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Tournoi du lendemain</td><td>Lendemain</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Baignade ou balade</td><td>Lendemain</td><td>Gratuit</td><td>Faible</td></tr>
<tr><td>Remerciements en petit comité</td><td>Lendemain</td><td>Prix des cadeaux</td><td>Faible</td></tr>
</tbody>
</table>
<p>Les prix sont des ordres de grandeur relevés auprès de prestataires en 2026. Ils varient beaucoup selon la région, la saison et la durée : demande toujours un devis.</p>

<h2>Le rythme : où placer tes animations dans la journée</h2>
<p>Une journée de mariage a ses creux, toujours aux mêmes endroits. Repère-les dans ton déroulé et place une animation dans chacun, plutôt que de tout concentrer sur la soirée.</p>
<h3>Les quatre temps morts à combler</h3>
<ul>
<li><strong>Entre la cérémonie et le vin d’honneur.</strong> Le trajet, l’attente pendant que les mariés signent ou font des photos. Une boisson d’accueil et de la musique suffisent souvent.</li>
<li><strong>Pendant tes photos de couple.</strong> Tu t’absentes 30 à 45 minutes en plein vin d’honneur. C’est le moment des jeux en bois, du magicien, du QR code de l’appareil jetable : les invités se photographient entre eux pendant ton absence.</li>
<li><strong>Entre l’installation à table et l’entrée.</strong> Souvent un quart d’heure flottant : le plan de table et les enveloppes occupent naturellement ce moment.</li>
<li><strong>Entre le dessert et l’ouverture du bal.</strong> Le traiteur débarrasse, le DJ s’installe, la salle se vide vers les fumeurs. Le dessert spectacle ou un blind test d’échauffement font le lien.</li>
</ul>
<h3>Ne pas tout empiler</h3>
<p>La tentation est grande d’ajouter « encore une idée ». Pose-toi une seule question pour chaque animation : <strong>est-ce qu’elle remplace un temps mort, ou est-ce qu’elle interrompt un bon moment ?</strong> Un quiz au milieu d’une table qui rit, un sketch pendant que la piste est pleine, un discours au moment où le plat chaud arrive : ce sont les animations qui cassent l’ambiance.</p>
<p>En pratique, un bon équilibre ressemble à ceci : une ou deux touches à la cérémonie, deux animations qui tournent toutes seules au vin d’honneur, deux ou trois temps forts au repas, et en soirée une seule surprise. Le reste, c’est la musique et les conversations.</p>
<h3>Préviens les prestataires</h3>
<p>Chaque animation qui touche au repas doit être connue du traiteur, chaque animation de soirée du DJ. Note-les dans ton <a href="/journal/deroule-jour-j-mariage">déroulé du jour J</a> avec l’heure, la durée et la personne responsable. Et vérifie avant de signer que ton lieu les autorise (feux, bougies, musique dehors) : c’est l’une des <a href="/journal/questions-lieu-reception-mariage">questions à poser au lieu de réception</a>.</p>

<h2>Trois plans selon ton budget</h2>
<h3>Zéro euro</h3>
<p>Les mots des proches à la cérémonie, jeux en bois empruntés et grande photo de groupe au vin d’honneur, plan de table qui raconte et quiz au repas, ouverture de bal collective et danse de vos racines en soirée, tournoi le lendemain. Rien de tout cela ne coûte un centime, et c’est déjà une journée très animée.</p>
<h3>Moins de 100 €</h3>
<p>Le plan précédent, plus des pétales pour la sortie, des enveloppes de missions sur les tables, des accessoires lumineux pour la piste et un appareil jetable numérique pour une cinquantaine d’invités (14,99 € avec Time to Flash). Tu obtiens en prime des centaines de photos de la journée, prises par tes invités.</p>
<h3>Plus de 100 €</h3>
<p>Choisis <strong>une seule</strong> animation « prestataire » et mets-la au moment le plus creux : un magicien ou un musicien pendant tes photos de couple au vin d’honneur, ou un en-cas de minuit pour relancer la soirée. Une animation bien placée vaut mieux que trois qui se marchent dessus.</p>

<h2>Les animations à éviter</h2>
<ul>
<li><strong>Le lâcher de lanternes célestes.</strong> Il est interdit par arrêté préfectoral dans plusieurs départements, à cause des risques d’incendie et de la pollution. Le lâcher de ballons est lui aussi interdit dans certains départements.</li>
<li><strong>Les jeux qui mettent quelqu’un mal à l’aise.</strong> Jarretière aux enchères, gages humiliants, quiz sur les ex : si tu hésites, c’est non.</li>
<li><strong>Les animations trop longues.</strong> Au-delà de quinze minutes, même la meilleure idée lasse.</li>
<li><strong>Celles qui dépendent du réseau sans l’avoir testé.</strong> Si ton animation passe par les téléphones, vérifie la couverture sur place. Les solutions si ça ne capte pas : <a href="/journal/pas-de-reseau-salle-mariage">pas de réseau dans la salle</a>.</li>
</ul>
<p>Pour l’appareil jetable de l’idée 6, tout se prépare en quelques minutes : <a href="/create">crée ton album</a>, imprime le QR code, et laisse tes invités raconter ta journée.</p>
`,
    faq: [
      {
        q: 'Quelle animation originale prévoir pour un mariage ?',
        a: 'Choisis selon le moment : un rituel symbolique à la cérémonie, des jeux en bois ou un appareil photo jetable partagé au vin d’honneur, un quiz des mariés au repas, une danse traditionnelle ou un blind test en soirée. L’originalité vient surtout du lien avec votre histoire, plus que du prix de l’animation.',
      },
      {
        q: 'Comment animer un vin d’honneur ?',
        a: 'Le vin d’honneur est long et tu t’absentes pour tes photos de couple : prévois des animations qui tournent sans toi. Jeux en bois, musicien qui circule, magicien de proximité ou QR code d’appareil jetable sur les tables donnent aux invités un prétexte pour se parler et s’occuper.',
      },
      {
        q: 'Quelles animations de mariage sont gratuites ?',
        a: 'Les mots des proches à la cérémonie, la grande photo de groupe, le quiz des mariés, le plan de table qui raconte votre histoire, le changement de place au dessert, l’ouverture de bal collective, le blind test avec le DJ et le tournoi du lendemain ne coûtent rien. Il suffit d’un responsable pour chacune.',
      },
      {
        q: 'Combien d’animations prévoir pour un mariage ?',
        a: 'Une ou deux touches à la cérémonie, deux animations autonomes au vin d’honneur, deux ou trois temps forts au repas et une surprise en soirée suffisent. Au-delà, les animations se marchent dessus et interrompent les conversations, qui restent le cœur de la journée.',
      },
      {
        q: 'Comment occuper les invités pendant les photos des mariés ?',
        a: 'C’est le principal temps mort de la journée, souvent 30 à 45 minutes. Lance à ce moment les jeux en bois, le musicien ou le magicien, et invite les invités à scanner le QR code de l’appareil jetable : ils se photographient entre eux pendant ton absence.',
      },
      {
        q: 'Le lâcher de lanternes est-il autorisé pour un mariage ?',
        a: 'Il est interdit par arrêté préfectoral dans plusieurs départements, en raison du risque d’incendie et de la pollution, et certains interdisent aussi les lâchers de ballons. Renseigne-toi auprès de la préfecture et du lieu, ou choisis une alternative comme des fontaines à étincelles froides.',
      },
    ],
  },

  // ----------------------------------------------------------
  // Requêtes visées : « questions à poser lieu de réception mariage »,
  // « visite salle de mariage », « choisir lieu de réception mariage ».
  // EN : « questions to ask wedding venue », « wedding venue checklist ».
  // Vu dans Google (10/10/2026) : ABC Salles (30 questions), Mariages.net
  // (20 questions), Bridebook ; en anglais WedSafe (45), Bridal Musings (65),
  // Eastnor Castle (70). Ce sont des listes de questions brutes, rarement
  // expliquées. Sous-sujets récurrents : capacité, exclusivité, plan B
  // pluie, heure de fin, traiteur imposé, droit de bouchon, prestataires
  // partenaires, matériel inclus, parking, hébergement, accessibilité,
  // acompte et annulation. Rarement couverts : réseau et wifi, limiteur de
  // son, arrhes ou acompte, état des lieux et caution, animations
  // autorisées. Notre angle : chaque question expliquée + pièges + checklist.
  // ----------------------------------------------------------
  {
    slug: 'questions-lieu-reception-mariage',
    image: '/journal/questions-lieu-reception-mariage.webp',
    cat: 'Organisation',
    title: 'Questions à poser au lieu de réception de mariage (checklist)',
    excerpt: 'Les questions à poser au lieu de réception de ton mariage, thème par thème, avec ce qui se cache derrière chaque réponse et une checklist à imprimer.',
    author: 'Camille Rouzaud',
    date: '2026-10-10',
    read: '11 min',
    caption: 'Un couple visite une salle de réception vide, carnet de notes à la main',
    body: `
<p>Le lieu de réception est souvent la plus grosse dépense du mariage, et la première signature. Une fois l’acompte versé, revenir en arrière coûte cher. Voici <strong>les questions à poser au lieu de réception de ton mariage</strong>, classées par thème, avec pour chacune la raison pour laquelle elle compte et le piège qu’elle évite. En fin d’article, une checklist à imprimer et à emporter en visite.</p>
<p>Un conseil avant de partir : visite le lieu <strong>à la même saison et à la même heure</strong> que ton mariage si tu peux. Une salle baignée de soleil à 15 h en juin n’a pas la même allure à 23 h en octobre.</p>

<h2>Bien choisir son lieu de réception de mariage : la méthode</h2>
<ul>
<li><strong>Prépare tes chiffres avant la visite</strong> : nombre d’invités (adultes et enfants), budget maximum, deux ou trois dates possibles.</li>
<li><strong>Venez à deux, ou avec un proche.</strong> L’un pose les questions, l’autre note et prend des photos.</li>
<li><strong>Demande les réponses importantes par écrit.</strong> Ce qui n’est pas dans le contrat n’existe pas.</li>
<li><strong>Demande un modèle de contrat</strong> et lis-le au calme chez toi, pas sur place.</li>
</ul>

<h2>1. Capacité et espaces</h2>
<ul>
<li><strong>Combien de personnes en repas assis, et en cocktail ?</strong> Les deux chiffres sont très différents. Une salle annoncée « 200 personnes » l’est souvent debout.</li>
<li><strong>Combien avec une piste de danse et l’espace du DJ ?</strong> La piste et la régie prennent facilement la place de plusieurs tables.</li>
<li><strong>Quelle est la capacité maximale autorisée ?</strong> Un lieu qui reçoit du public a un plafond fixé pour la sécurité. Le dépasser, c’est un problème d’assurance en cas d’incident.</li>
<li><strong>Y a-t-il des espaces séparés</strong> pour la cérémonie laïque, le vin d’honneur, le repas, un coin enfants, un salon calme ?</li>
<li><strong>Le lieu est-il loué en exclusivité ?</strong> Certains domaines accueillent deux événements le même jour, ou laissent un restaurant ouvert au public.</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> une salle trop pleine est inconfortable, une salle trop grande paraît vide. Demande un plan avec la disposition de tables que tu envisages (rondes ou rectangulaires), pas une capacité théorique.</p>

<h2>2. Le plan B en cas de pluie</h2>
<ul>
<li><strong>Où se passent le vin d’honneur et la cérémonie s’il pleut ?</strong> Visite cet espace aussi, avec la même attention que le reste.</li>
<li><strong>Le plan B est-il inclus, ou faut-il louer une tente ?</strong> Et à quel prix ?</li>
<li><strong>Quand doit-on décider ?</strong> La veille, le matin même, deux heures avant ?</li>
<li><strong>Y a-t-il de quoi chauffer ou rafraîchir</strong> les espaces si la météo est extrême ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> beaucoup de lieux sont vendus sur leur jardin. Si le plan B est un hangar ou une salle trop petite, c’est lui qu’il faut juger, car c’est peut-être là que tu passeras la journée.</p>

<h2>3. Horaires et fin de soirée</h2>
<ul>
<li><strong>À quelle heure peut-on accéder au lieu</strong> pour installer la décoration ? La veille est-elle possible, et à quel prix ?</li>
<li><strong>À quelle heure la musique doit-elle s’arrêter</strong>, et à quelle heure faut-il avoir quitté la salle ?</li>
<li><strong>Le rangement est-il à faire le soir même</strong> ou le lendemain matin ?</li>
<li><strong>Le lieu est-il disponible le lendemain</strong> pour un brunch ou un retour ?</li>
<li><strong>Y a-t-il des frais si l’on dépasse l’horaire ?</strong> Certains facturent chaque heure supplémentaire.</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> une fin de musique à 1 h du matin change toute la soirée. Si tu rêves d’une fête jusqu’à l’aube, c’est la première question à poser, avant même de visiter.</p>

<h2>4. Bruit et voisinage</h2>
<ul>
<li><strong>La salle est-elle équipée d’un limiteur de son ?</strong> C’est un appareil qui coupe la sono si le volume dépasse un seuil. À quel niveau est-il réglé ?</li>
<li><strong>La musique est-elle autorisée dehors</strong>, et jusqu’à quelle heure ?</li>
<li><strong>Y a-t-il des voisins proches</strong>, et des plaintes ont-elles déjà eu lieu ?</li>
<li><strong>Faut-il fermer portes et fenêtres</strong> après une certaine heure ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> un limiteur réglé trop bas coupe le son à chaque refrain repris en chœur. Fais parler ton DJ avec le lieu avant de signer avec lui : il saura dire si c’est jouable.</p>

<h2>5. Traiteur imposé ou libre</h2>
<ul>
<li><strong>Le traiteur est-il imposé</strong>, choisi dans une liste, ou totalement libre ?</li>
<li><strong>Si le traiteur est libre, y a-t-il des frais</strong> pour un traiteur extérieur ?</li>
<li><strong>De quel équipement dispose la cuisine</strong> ? Chambre froide, fours, plaques, plonge, puissance électrique suffisante ?</li>
<li><strong>Peut-on organiser une dégustation</strong> avant de signer, si le traiteur est imposé ?</li>
<li><strong>Le gâteau peut-il venir d’un autre pâtissier ?</strong> Certains traiteurs facturent un « droit de découpe ».</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> le traiteur pèse souvent autant que la location. Un lieu bon marché avec un traiteur imposé cher n’est pas un lieu bon marché. Compare toujours le coût total par invité.</p>

<h2>6. Boissons et droit de bouchon</h2>
<ul>
<li><strong>Peut-on apporter ses propres boissons ?</strong></li>
<li><strong>Y a-t-il un droit de bouchon</strong>, c’est-à-dire une somme facturée pour chaque bouteille apportée et ouverte ? Est-il par bouteille ou forfaitaire ?</li>
<li><strong>Est-il le même pour le vin, le champagne et les alcools forts ?</strong> Est-il dégressif ?</li>
<li><strong>Qui assure le service</strong> au bar, et jusqu’à quelle heure ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> tous les lieux ne pratiquent pas le droit de bouchon, et son montant varie beaucoup. Multiplié par le nombre de bouteilles d’un mariage, il peut annuler l’économie d’apporter son vin. Fais le calcul avant de décider.</p>

<h2>7. Matériel inclus</h2>
<ul>
<li><strong>Tables et chaises</strong> : combien, de quelle forme, de quelle taille ? Les chaises sont-elles présentables ou faut-il des housses ?</li>
<li><strong>Nappes, vaisselle, verres</strong> : inclus ou à louer ?</li>
<li><strong>Sono, micro, vidéoprojecteur, écran</strong> : disponibles et en état de marche ?</li>
<li><strong>Éclairage</strong> : la salle peut-elle être tamisée ? Les extérieurs sont-ils éclairés la nuit ?</li>
<li><strong>Chauffage et climatisation</strong> : inclus ou facturés à part ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> la location de tables, chaises, nappes et vaisselle pour cent personnes représente un budget sérieux. Un lieu un peu plus cher mais tout équipé revient parfois moins cher au total.</p>

<h2>8. Hébergement</h2>
<ul>
<li><strong>Combien de couchages sur place</strong>, et à quel prix ?</li>
<li><strong>Faut-il obligatoirement louer tous les hébergements</strong> du domaine ?</li>
<li><strong>À quelle heure faut-il libérer les chambres</strong> le lendemain ?</li>
<li><strong>Quels hôtels ou gîtes à proximité</strong> le lieu recommande-t-il ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> loger sur place évite la route après la soirée. C’est un vrai sujet de sécurité, et un confort énorme pour les invités venus de loin.</p>

<h2>9. Accès et parking</h2>
<ul>
<li><strong>Combien de places de parking</strong>, et peut-on y laisser les voitures la nuit ?</li>
<li><strong>Le lieu est-il facile à trouver</strong> avec un GPS ? Le chemin est-il éclairé la nuit ?</li>
<li><strong>Y a-t-il une gare à proximité</strong>, des taxis ou VTC disponibles tard le soir ?</li>
<li><strong>Un service de navette est-il possible</strong> ou déjà organisé par le lieu ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> à la campagne, trouver un taxi à 2 h du matin relève parfois de l’exploit. Si le retour est compliqué, prévois une navette ou des hébergements.</p>

<h2>10. Accessibilité</h2>
<ul>
<li><strong>Le lieu est-il accessible en fauteuil roulant</strong> ? Escaliers, rampes, ascenseur ?</li>
<li><strong>Y a-t-il des toilettes adaptées</strong> ?</li>
<li><strong>Les différents espaces sont-ils proches</strong>, ou faut-il marcher longtemps sur des graviers ou de l’herbe ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> un grand-parent qui ne peut pas descendre à la salle du repas, c’est une journée gâchée pour lui et pour toi. Pense aussi aux talons sur les pavés et aux poussettes.</p>

<h2>11. Réseau téléphonique et wifi</h2>
<ul>
<li><strong>Le réseau passe-t-il dans la salle ?</strong> Ne te contente pas de la réponse : coupe le wifi de ton téléphone et teste toi-même, à l’intérieur de la salle, pas sur le parking. Si tu peux, teste avec deux opérateurs différents.</li>
<li><strong>Y a-t-il un wifi pour les invités</strong>, qui couvre la salle et pas seulement l’accueil ?</li>
<li><strong>Combien de connexions simultanées supporte-t-il</strong>, et quel est le code ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> les plus beaux lieux (caves voûtées, granges en pierre, vallées) sont souvent les plus mal couverts. Sans réseau, pas de photos partagées, pas d’appel pour un invité perdu, pas de paiement par carte au bar. Les solutions existent : on les détaille dans <a href="/journal/pas-de-reseau-salle-mariage">pas de réseau dans la salle, comment faire</a> et dans <a href="/journal/wifi-lieu-reception-mariage">le wifi du lieu de réception</a>.</p>

<h2>12. Animations et décoration autorisées</h2>
<ul>
<li><strong>Quelles animations sont autorisées ?</strong> Feu d’artifice, fontaines à étincelles, bougies, machine à fumée, confettis, lancer de riz ?</li>
<li><strong>Peut-on fixer de la décoration</strong> aux murs, aux poutres, au plafond ?</li>
<li><strong>Y a-t-il une prise et de la place</strong> pour un photobooth ou un DJ ?</li>
<li><strong>Peut-on installer des jeux en extérieur</strong>, une cérémonie laïque dans le jardin ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> tu ne veux pas découvrir à un mois du mariage que les bougies sont interdites ou que le feu d’artifice est impossible. Si tu cherches encore quoi prévoir, on a rassemblé <a href="/journal/idees-animation-mariage">36 idées d’animation de mariage</a> avec leurs contraintes.</p>

<h2>13. Prestataires imposés et interlocuteur</h2>
<ul>
<li><strong>Y a-t-il des prestataires imposés</strong> ou une liste de partenaires obligatoires (DJ, fleuriste, photographe, location de mobilier) ?</li>
<li><strong>Des frais s’appliquent-ils</strong> si l’on prend un prestataire extérieur ?</li>
<li><strong>Qui sera présent le jour J</strong> côté lieu, et jusqu’à quelle heure ? Qui appeler en cas de souci ?</li>
<li><strong>La déclaration de la musique à la Sacem</strong> est-elle à ta charge, à celle du DJ ou du lieu ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> un prestataire imposé peut être excellent, mais il doit être annoncé avant la signature, pas découvert après. Et le jour J, un responsable du lieu joignable règle en cinq minutes ce qui te gâcherait une heure.</p>

<h2>14. Prix, acompte et paiement</h2>
<ul>
<li><strong>Qu’est-ce qui est inclus dans le prix</strong> exactement ? Ménage, électricité, chauffage, gardiennage, taxe de séjour ?</li>
<li><strong>Le tarif est-il garanti</strong> jusqu’au mariage, ou peut-il être revu si tu signes deux ans à l’avance ?</li>
<li><strong>Quel est le montant de l’acompte</strong> à la réservation, et l’échéancier des paiements suivants ?</li>
<li><strong>Est-ce un acompte ou des arrhes ?</strong></li>
</ul>
<p><strong>Pourquoi ça compte :</strong> la différence entre acompte et arrhes est capitale. En France, avec des <strong>arrhes</strong>, chacun peut se dédire : toi en les perdant, le lieu en te remboursant le double. Avec un <strong>acompte</strong>, l’engagement est ferme : en cas d’annulation, tu peux devoir la totalité du prix. Entre un professionnel et un particulier, les sommes versées d’avance sont considérées comme des arrhes sauf si le contrat dit autre chose : lis bien le mot écrit.</p>

<h2>15. Annulation et report</h2>
<ul>
<li><strong>Que se passe-t-il si tu annules</strong>, selon la date d’annulation ?</li>
<li><strong>Un report de date est-il possible</strong>, et à quelles conditions ?</li>
<li><strong>Que se passe-t-il si c’est le lieu qui annule</strong> (vente, travaux, sinistre) ?</li>
<li><strong>Quelles situations sont prévues comme cas de force majeure</strong> dans le contrat ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> on signe souvent plus d’un an à l’avance. Il peut se passer beaucoup de choses en un an. Un contrat qui ne prévoit que les annulations du client, et jamais celles du lieu, est déséquilibré.</p>

<h2>16. Assurance</h2>
<ul>
<li><strong>Le lieu exige-t-il une attestation de responsabilité civile</strong> ? Ton assurance habitation la couvre-t-elle pour un événement de ce type ?</li>
<li><strong>Le lieu est-il lui-même assuré</strong> pour les accidents survenant chez lui ?</li>
<li><strong>Faut-il une assurance annulation mariage</strong> ? Des contrats spécialisés existent ; compare ce qu’ils couvrent vraiment (maladie, intempéries, défaillance d’un prestataire).</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> un verre de vin rouge sur un canapé ancien ou une vitre cassée peuvent coûter cher. Mieux vaut savoir qui paie avant que ça arrive.</p>

<h2>17. État des lieux et caution</h2>
<ul>
<li><strong>Un état des lieux est-il fait à l’entrée et à la sortie</strong> ? En ta présence ?</li>
<li><strong>Quel est le montant de la caution</strong>, et sous quel délai est-elle rendue ?</li>
<li><strong>Le ménage est-il inclus</strong>, ou faut-il rendre la salle propre ?</li>
<li><strong>Qui gère les déchets</strong>, le tri, les bouteilles vides ?</li>
<li><strong>Le matériel cassé est-il facturé</strong> à l’unité ?</li>
</ul>
<p><strong>Pourquoi ça compte :</strong> la caution est souvent de plusieurs centaines d’euros, parfois davantage. Prends des photos datées de la salle à ton arrivée : c’est ta meilleure protection en cas de désaccord.</p>

<h2>Les pièges classiques quand on visite une salle de mariage</h2>
<ul>
<li><strong>Le prix « à partir de ».</strong> Il correspond souvent à un jour de semaine hors saison, sans ménage ni chauffage. Demande un devis pour ta date, ton nombre d’invités, tout compris.</li>
<li><strong>La capacité debout présentée comme capacité assise.</strong> Fais-toi montrer un plan de tables réel.</li>
<li><strong>Le plan B jamais visité.</strong> Le jardin est magnifique, la salle de repli beaucoup moins.</li>
<li><strong>L’heure de fin découverte trop tard.</strong> Ou la musique coupée à 1 h par un limiteur dont personne ne t’a parlé.</li>
<li><strong>Les frais cachés.</strong> Électricité au compteur, gardiennage obligatoire, droit de bouchon, droit de découpe, frais pour traiteur extérieur.</li>
<li><strong>Le départ du lendemain à 10 h.</strong> Avec des invités couchés à 5 h, c’est la course.</li>
<li><strong>Trop peu de toilettes</strong> pour le nombre d’invités, ou une électricité qui saute quand le traiteur et le DJ branchent tout en même temps.</li>
<li><strong>Les promesses orales.</strong> « Pas de souci pour la veille », « on vous laissera finir plus tard » : si ce n’est pas écrit, ça n’engage personne.</li>
</ul>
<p>Pense aussi à demander des contacts de couples qui s’y sont mariés, ou à lire les avis récents. Et une fois le lieu signé, la suite du calendrier t’attend : <a href="/journal/retroplanning-mariage">le rétroplanning du mariage</a> t’aide à ne rien oublier.</p>

<h2>La checklist à imprimer pour ta visite</h2>
<p>Imprime cette liste, coche au fil de la visite, et note les réponses dans la marge.</p>
<ul>
<li>☐ Capacité en repas assis, avec piste de danse et DJ</li>
<li>☐ Capacité en cocktail et capacité maximale autorisée</li>
<li>☐ Espaces séparés : cérémonie, vin d’honneur, repas, enfants</li>
<li>☐ Location en exclusivité</li>
<li>☐ Plan B pluie visité, inclus ou payant, heure de décision</li>
<li>☐ Chauffage et climatisation</li>
<li>☐ Heure d’accès pour l’installation, veille possible</li>
<li>☐ Heure de fin de la musique et de départ de la salle</li>
<li>☐ Rangement le soir ou le lendemain, lieu disponible pour le brunch</li>
<li>☐ Limiteur de son et niveau réglé, musique dehors jusqu’à quelle heure</li>
<li>☐ Voisins proches, consignes portes et fenêtres</li>
<li>☐ Traiteur imposé, sur liste ou libre, frais pour traiteur extérieur</li>
<li>☐ Équipement de la cuisine et puissance électrique</li>
<li>☐ Gâteau d’un autre pâtissier, droit de découpe</li>
<li>☐ Boissons apportées, droit de bouchon et son montant</li>
<li>☐ Tables, chaises, nappes, vaisselle inclus</li>
<li>☐ Sono, micro, vidéoprojecteur, éclairage intérieur et extérieur</li>
<li>☐ Nombre de couchages, prix, heure de départ le lendemain</li>
<li>☐ Parking, éclairage du chemin, taxis et navettes</li>
<li>☐ Accès fauteuil roulant et toilettes adaptées</li>
<li>☐ Réseau testé dans la salle avec deux opérateurs</li>
<li>☐ Wifi invités : couverture, nombre de connexions, code</li>
<li>☐ Animations autorisées : feu d’artifice, bougies, confettis, fumée</li>
<li>☐ Décoration fixée aux murs et au plafond</li>
<li>☐ Prestataires imposés et frais pour prestataire extérieur</li>
<li>☐ Interlocuteur présent le jour J et son numéro</li>
<li>☐ Déclaration Sacem : à la charge de qui</li>
<li>☐ Ce qui est inclus dans le prix, tarif garanti jusqu’à la date</li>
<li>☐ Acompte ou arrhes, montant et échéancier</li>
<li>☐ Conditions d’annulation et de report, des deux côtés</li>
<li>☐ Attestation de responsabilité civile demandée</li>
<li>☐ État des lieux d’entrée et de sortie, montant de la caution</li>
<li>☐ Ménage, déchets, casse facturée</li>
<li>☐ Modèle de contrat récupéré</li>
</ul>
<p>Une dernière idée pour le jour J : si le réseau passe bien dans la salle, un <a href="/appareil-jetable-mariage">appareil photo jetable partagé</a> transforme le téléphone de chaque invité en appareil photo, avec un QR code sur les tables et un album révélé le lendemain.</p>
`,
    faq: [
      {
        q: 'Quelles questions poser lors de la visite d’une salle de mariage ?',
        a: 'Les essentielles : la capacité en repas assis avec piste de danse, le plan B en cas de pluie, l’heure de fin de la musique, le traiteur imposé ou libre, le droit de bouchon, ce qui est inclus dans le prix, et les conditions d’acompte et d’annulation. Ajoute le réseau téléphonique, l’hébergement et le parking, souvent oubliés.',
      },
      {
        q: 'Quelle est la différence entre acompte et arrhes pour une salle de mariage ?',
        a: 'Avec des arrhes, chacun peut renoncer : toi en les perdant, le lieu en te rendant le double. Avec un acompte, l’engagement est ferme et tu peux devoir la totalité du prix en cas d’annulation. Entre un professionnel et un particulier, les sommes versées d’avance sont des arrhes sauf si le contrat dit le contraire.',
      },
      {
        q: 'Qu’est-ce que le droit de bouchon pour un mariage ?',
        a: 'C’est une somme que le lieu ou le traiteur facture pour chaque bouteille que tu apportes et qui est ouverte, pour compenser le fait qu’il ne vend pas les boissons. Il peut être par bouteille ou forfaitaire, et tous les lieux ne le pratiquent pas. Fais le calcul sur le nombre de bouteilles prévues avant de décider d’apporter ton vin.',
      },
      {
        q: 'Combien de temps à l’avance réserver son lieu de réception ?',
        a: 'Pour un samedi de mai à septembre, les lieux les plus demandés se réservent souvent plus d’un an à l’avance. Hors saison ou en semaine, quelques mois peuvent suffire. Le lieu fixe la date du mariage : c’est la première réservation à faire.',
      },
      {
        q: 'Que vérifier sur le réseau téléphonique d’une salle de mariage ?',
        a: 'Teste toi-même le réseau à l’intérieur de la salle, wifi coupé, idéalement avec deux opérateurs. Demande si un wifi invités couvre toute la salle et combien de connexions il supporte. Sans réseau, les invités ne peuvent ni partager de photos ni appeler un taxi.',
      },
      {
        q: 'Faut-il une assurance pour louer une salle de mariage ?',
        a: 'Beaucoup de lieux demandent une attestation de responsabilité civile, que ton assurance habitation peut parfois fournir : vérifie auprès de ton assureur. L’assurance annulation mariage est facultative ; compare précisément ce qu’elle couvre avant de la souscrire.',
      },
    ],
  },
]

export const POSTS_EN = {
  // EN : « unique wedding entertainment ideas », « cocktail hour ideas »,
  // « wedding guest entertainment ». Top results (Inside Weddings, Easy
  // Weddings, Loverly) list ideas without prices or effort.
  'idees-animation-mariage': {
    title: 'Unique wedding entertainment ideas: 36 ideas by moment and budget',
    excerpt: 'Unique wedding entertainment ideas: 36 ideas from ceremony to brunch, with prices, effort and pacing tips so your guests are never left waiting around.',
    caption: 'Guests playing a lawn game during a wedding cocktail hour',
    body: `
<p>You are looking for <strong>unique wedding entertainment ideas</strong>, but every list you find repeats the same suggestions without saying what they cost, how long they take to prepare, or when in the day they actually work. Here are 36 ideas sorted by moment (ceremony, cocktail hour, dinner, party, next day), each with how it works, a rough cost, the effort involved and the kind of wedding it suits.</p>
<p>Before you pick, one piece of advice worth more than all the ideas put together: <strong>good entertainment is entertainment placed at the right moment</strong>. We come back to this in detail after the list.</p>

<h2>Before choosing: three rules for wedding entertainment that works</h2>
<ul>
<li><strong>Don’t fill every minute.</strong> Your guests also come to talk, eat and dance. An activity every twenty minutes wears everyone out, including you.</li>
<li><strong>Aim for the lulls.</strong> Every wedding day has at least four of them (detailed below). That is where entertainment really changes the mood.</li>
<li><strong>Put someone in charge.</strong> Every activity that needs coordinating should have an owner who is not you: a best man or maid of honour, an organised cousin, the wedding planner. On the day, you should not be running anything.</li>
</ul>
<p>For each idea we give the <strong>effort</strong>: <em>low</em> (an hour of preparation or less), <em>medium</em> (a few evenings, or several people to coordinate), <em>high</em> (a real project, or a supplier to find and brief). Prices are in euros, as rough figures from French suppliers.</p>

<h2>During the ceremony: 5 ideas</h2>
<p>The ceremony is not the time for games, but a few touches make it more personal and more alive, especially if it is a civil or humanist ceremony.</p>

<h3>1. Words from loved ones</h3>
<p><strong>How it works:</strong> two or three people read a text, tell a story or speak about your relationship. It is often the most moving moment of the day.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> medium. Choose the speakers early, give them a time limit (three minutes each, no more) and check the running order.<br>
<strong>Best for:</strong> every wedding, especially non-religious ceremonies where nothing is set in stone.</p>

<h3>2. A symbolic ritual</h3>
<p><strong>How it works:</strong> a gesture that makes the union tangible. Pouring coloured sand into one vase, planting a tree together, handfasting with a ribbon, or sealing a letter and a bottle in a box to open in ten years.<br>
<strong>Cost:</strong> €20 to €80 depending on the ritual.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> outdoor or non-religious ceremonies. The letter box works beautifully at small weddings too.</p>

<h3>3. Live music</h3>
<p><strong>How it works:</strong> a musician plays for the entrance, the exit and between speeches. A violin, a guitar or a voice changes the atmosphere completely compared with a speaker.<br>
<strong>Cost:</strong> free if a friend plays; otherwise usually €300 to €1,000 for a professional musician, more for a quartet.<br>
<strong>Effort:</strong> medium (choosing the pieces, rehearsal, a power socket if needed).<br>
<strong>Best for:</strong> every wedding. If a friend plays, it is a gift: thank them by name in the programme.</p>

<h3>4. A ceremony programme that keeps people busy</h3>
<p><strong>How it works:</strong> besides the running order, the programme includes the lyrics of a song everyone sings, a small game for children (word search, colouring) or a question of the day for guests to discuss at the cocktail hour.<br>
<strong>Cost:</strong> under €100 for around a hundred copies, often much less if you print them yourself.<br>
<strong>Effort:</strong> medium (layout).<br>
<strong>Best for:</strong> weddings where guests wait a long time before the start, or with lots of children.</p>

<h3>5. A petal send-off</h3>
<p><strong>How it works:</strong> as you walk out, guests form an aisle and throw dried petals, lavender or biodegradable confetti, or blow bubbles. It is also one of the best photos of the day.<br>
<strong>Cost:</strong> €20 to €60.<br>
<strong>Effort:</strong> low, as long as two people hand out the cones.<br>
<strong>Best for:</strong> every wedding. Just check what the venue allows: some town halls, churches and estates ban rice or confetti.</p>

<h2>Cocktail hour ideas: 10 ways to fill the longest stretch</h2>
<p>The drinks reception often lasts an hour and a half to two hours. It is when guests who don’t know each other mingle, while you are away having your couple portraits taken. That is why entertainment is most useful here: it gives people a reason to talk.</p>

<h3>6. A disposable camera in every guest’s phone</h3>
<p><strong>How it works:</strong> a QR code at the entrance, at the bar and on the tables. Each guest scans it and their phone becomes a disposable camera: a limited number of shots (you choose between 3 and 15 per person), nothing is shown before the reveal, and the album opens for everyone at once, by default the next day. Because shots are limited, people think before they press the button: you get photos of the whole day from dozens of points of view, including the moments you missed.<br>
<strong>Cost:</strong> with <a href="/appareil-jetable-mariage">Time to Flash</a>, free up to 5 guests, then a one-off payment based on guest numbers (€14.99 for 50, €29.99 for 100, €59.99 for 300), no subscription.<br>
<strong>Effort:</strong> low. You create the event in a few minutes and print the QR code (the <a href="/generateur-qr-code-mariage">poster generator</a> is free).<br>
<strong>Best for:</strong> every wedding, especially if you want something that runs from the cocktail hour to the end of the night with no queue and no floor space. There is no app to install, just a web page, so even grandparents join in. If you are torn between a photo booth, a mirror booth or cardboard disposables, we compared them in <a href="/journal/comparatif-animations-photo-mariage">this guide to wedding photo entertainment</a>.</p>

<h3>7. Lawn games and pétanque</h3>
<p><strong>How it works:</strong> mölkky, giant Jenga, ring toss, skittles, giant Connect 4, a pétanque pitch. Guests play in improvised teams and meet without even noticing.<br>
<strong>Cost:</strong> free if you borrow, often €50 to €150 to hire a full set.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> rustic and outdoor weddings, families with children. Have a sheltered backup in case of rain.</p>

<h3>8. A roaming musician</h3>
<p><strong>How it works:</strong> a saxophonist, guitarist or jazz trio moving between groups. Livelier than a playlist, less intrusive than a concert.<br>
<strong>Cost:</strong> usually €300 to €1,000 depending on length and line-up.<br>
<strong>Effort:</strong> medium (finding the right musician, agreeing the repertoire).<br>
<strong>Best for:</strong> elegant weddings at an estate or château.</p>

<h3>9. A close-up magician</h3>
<p><strong>How it works:</strong> a magician moves from group to group performing tricks inches from people’s eyes (cards, coins, guests’ own objects). It sparks conversations between people who had not spoken yet.<br>
<strong>Cost:</strong> from around €400, often more depending on reputation and length.<br>
<strong>Effort:</strong> low once booked.<br>
<strong>Best for:</strong> weddings where the two families barely know each other. Children love it.</p>

<h3>10. A caricaturist or portrait artist</h3>
<p><strong>How it works:</strong> an artist sketches guests in a few minutes. Everyone leaves with their portrait: entertainment and a favour in one.<br>
<strong>Cost:</strong> several hundred euros for a few hours.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> medium and large weddings. Ask how many portraits they draw per hour to avoid a queue.</p>

<h3>11. A tasting station</h3>
<p><strong>How it works:</strong> an oyster bar, a cheese board with someone explaining it, a local craft beer or spritz bar, a tasting of the estate’s wines. The buffet becomes a gathering point.<br>
<strong>Cost:</strong> varies widely, often part of the caterer’s quote.<br>
<strong>Effort:</strong> low if the caterer handles it.<br>
<strong>Best for:</strong> food lovers, or long cocktail hours.</p>

<h3>12. The big group photo</h3>
<p><strong>How it works:</strong> every guest in one shot, taken from above (a window, a balcony, a stepladder). Ten minutes for a photo that often ends up framed.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low, as long as someone gathers everyone with a microphone. Here is the method: <a href="/journal/photos-de-groupe-mariage">getting wedding group photos right</a>.<br>
<strong>Best for:</strong> every wedding.</p>

<h3>13. An audio guest book</h3>
<p><strong>How it works:</strong> instead of writing, guests leave a voice message. The classic version is a vintage phone on a table: pick up, speak. You listen to everything after the wedding, voices and laughter included.<br>
<strong>Cost:</strong> renting a dedicated phone often costs €150 to €300. If you already use Time to Flash, the audio guest book is a €9.99 add-on: each guest records their message and a selfie from their own phone, with no equipment to set up.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding. It is one of the keepsakes couples replay the most.</p>

<h3>14. A kids’ corner</h3>
<p><strong>How it works:</strong> a space with colouring, games, a play mat, and ideally one or two entertainers or babysitters. Parents relax, children have fun.<br>
<strong>Cost:</strong> free if teenagers in the family take it on (with a proper thank you), otherwise the rate of a babysitter or children’s entertainer for the evening, often a few hundred euros.<br>
<strong>Effort:</strong> medium.<br>
<strong>Best for:</strong> any wedding with more than five or six children.</p>

<h3>15. A cocktail bar with a show</h3>
<p><strong>How it works:</strong> a bartender mixes one or two signature cocktails in front of guests, named after you or inspired by your story.<br>
<strong>Cost:</strong> from a few hundred euros to over €1,000 depending on guest numbers and drinks.<br>
<strong>Effort:</strong> medium (choosing recipes, coordinating with the caterer).<br>
<strong>Best for:</strong> festive weddings, outdoor cocktail hours.</p>

<h2>During dinner: 8 ideas to entertain your guests</h2>
<p>Dinner is long, often three hours. The trap: lining up microphone moments between every course, letting plates go cold and exhausting the caterer. Keep two or three highlights, no more, and tell the head waiter exactly where they fall in the schedule.</p>

<h3>16. A seating plan that tells a story</h3>
<p><strong>How it works:</strong> each table is named after a place or memory that matters to you (your first trip, the city where you met), with a photo and three lines of explanation. Guests have something to talk about the moment they sit down.<br>
<strong>Cost:</strong> free apart from printing.<br>
<strong>Effort:</strong> medium.<br>
<strong>Best for:</strong> every wedding.</p>

<h3>17. The couple quiz</h3>
<p><strong>How it works:</strong> a sheet of ten questions about you on each table, answered as a team between courses, or the shoe game (you sit back to back and raise your shoe or your partner’s to answer “who is more likely to…”).<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding, as long as it stays short (ten minutes) and kind.</p>

<h3>18. Prepared, timed speeches</h3>
<p><strong>How it works:</strong> not entertainment as such, but it makes or breaks a dinner. Speeches of three to five minutes spread between courses, introduced by a master of ceremonies. A rewritten song or a short sketch by the wedding party fits in the same slot.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> medium for the speakers, low for you.<br>
<strong>Best for:</strong> every wedding. Beyond five speeches, you lose the room.</p>

<h3>19. A slideshow or video from friends</h3>
<p><strong>How it works:</strong> childhood photos, your first holidays, or a video of messages from people who could not come.<br>
<strong>Cost:</strong> free if the venue has a projector (otherwise budget for hiring one).<br>
<strong>Effort:</strong> medium to high: it is real editing work.<br>
<strong>Best for:</strong> every wedding. Keep it under five minutes.</p>

<h3>20. Envelopes on the tables</h3>
<p><strong>How it works:</strong> one envelope per table with missions (take a photo of your table with the bride, find someone born in the same month as you) or icebreaker questions. It pairs perfectly with the disposable camera from idea 6: the missions give people something to shoot.<br>
<strong>Cost:</strong> under €30.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> weddings where tables mix guests who don’t know each other.</p>

<h3>21. Switching seats for dessert</h3>
<p><strong>How it works:</strong> at dessert, half of each table moves according to a sign handed out earlier (a colour, a card). Or the couple goes from table to table, taking time to sit down.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> large weddings, where you have barely spoken to some guests.</p>

<h3>22. A show-stopping dessert</h3>
<p><strong>How it works:</strong> sabering champagne, a croquembouche brought in to music, a dessert bar, an ice cream or crêpe stand serving to order.<br>
<strong>Cost:</strong> varies, often a caterer’s option.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding. It is the perfect bridge to the first dance.</p>

<h3>23. Notes for later</h3>
<p><strong>How it works:</strong> each guest writes a piece of advice, a wish or a prediction for your tenth anniversary on a card. You open them on that date.<br>
<strong>Cost:</strong> under €30.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding, lovely at small ones.</p>

<h2>During the party: 9 ideas to fill the dance floor</h2>
<p>In the evening, the DJ does most of the work. Entertainment has two jobs: getting the hesitant onto the dance floor, and offering an alternative to those who don’t dance.</p>

<h3>24. A first dance that pulls everyone in</h3>
<p><strong>How it works:</strong> you start alone, then on a cue the wedding party joins, then the families, then the whole room. The ambitious version: a choreography learned by a group of friends.<br>
<strong>Cost:</strong> free, or a few dance lessons if you want a real routine.<br>
<strong>Effort:</strong> low to high depending on ambition.<br>
<strong>Best for:</strong> every wedding.</p>

<h3>25. A music quiz</h3>
<p><strong>How it works:</strong> the DJ plays snippets and tables or families compete. Songs from your teenage years always go down a storm.<br>
<strong>Cost:</strong> free if the DJ includes it.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> weddings where the dance floor is slow to warm up.</p>

<h3>26. Karaoke</h3>
<p><strong>How it works:</strong> half an hour of karaoke mid-party, or late at night for the last ones standing.<br>
<strong>Cost:</strong> often under €100 to hire the equipment, or offered by the DJ.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> laid-back weddings with lots of friends.</p>

<h3>27. A photo booth</h3>
<p><strong>How it works:</strong> a photo booth with props and instant prints. Guests take their strips home.<br>
<strong>Cost:</strong> usually €350 to €900 for the evening. Price details here: <a href="/journal/prix-photobooth-mariage">how much a photo booth costs</a>.<br>
<strong>Effort:</strong> low; it mainly needs a socket and about 4 m².<br>
<strong>Best for:</strong> couples who want guests to leave with a printed photo that night.</p>

<h3>28. A midnight snack</h3>
<p><strong>How it works:</strong> around midnight or 1 am, a food truck, a crêpe, fries or toastie stand. It revives the party and means nobody drives home on an empty stomach.<br>
<strong>Cost:</strong> varies, often charged per person. A homemade version (onion soup, toasties prepared by the caterer) costs far less.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> weddings that go on late.</p>

<h3>29. Dance floor props</h3>
<p><strong>How it works:</strong> glow bracelets, sunglasses, hats or fans handed out at a set moment (often when the DJ switches to the big hits). An instant boost for the mood and the photos.<br>
<strong>Cost:</strong> under €50 for about a hundred guests.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> party weddings.</p>

<h3>30. Sparklers and fireworks</h3>
<p><strong>How it works:</strong> cold spark fountains around the dance floor for the first dance, or real fireworks set off by a professional.<br>
<strong>Cost:</strong> a few hundred euros for the fountains, often €1,000 or more for a professional display.<br>
<strong>Effort:</strong> high for fireworks: venue approval, paperwork with the local authority, and in summer drought restrictions can ban everything at the last minute.<br>
<strong>Best for:</strong> large estate weddings with space and distant neighbours.</p>

<h3>31. A quiet lounge</h3>
<p><strong>How it works:</strong> a lounge away from the dance floor with sofas, board games, herbal tea and soft lighting. Grandparents, non-dancers and those who just want to talk find their place there.<br>
<strong>Cost:</strong> free to €100.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding, especially with several generations.</p>

<h3>32. A dance from your roots</h3>
<p><strong>How it works:</strong> a traditional dance from one of the families (Breton circle dance, belly dance, sega, Greek dancing, a ceilidh), led by those who know it. Everyone else learns on the spot.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> weddings bringing two cultures together. It is often the moment everyone talks about the next day.</p>

<h2>The next day: 4 ideas to make it last</h2>
<p>The next-day brunch or barbecue is more and more common. The mood is relaxed and guests are tired: no need for a big show.</p>

<h3>33. Brunch with the photo reveal</h3>
<p><strong>How it works:</strong> if your guests took photos with a disposable camera (cardboard or in their phone), brunch is the perfect moment to discover them together, projected on a wall or shared on phones. The whole party plays back, seen through everyone’s eyes.<br>
<strong>Cost:</strong> free if the album is already planned.<br>
<strong>Effort:</strong> low. We explain how to set up this moment in <a href="/journal/revelation-photos-lendemain-mariage">the next-day photo reveal</a>.<br>
<strong>Best for:</strong> every wedding with a next-day gathering.</p>

<h3>34. A next-day tournament</h3>
<p><strong>How it works:</strong> pétanque, mölkky, football or volleyball, with teams drawn at random. Reuse the cocktail hour games.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> rustic weddings with a big lawn.</p>

<h3>35. A swim or a walk</h3>
<p><strong>How it works:</strong> the estate pool, a nearby lake or beach, a walk to a viewpoint. Nothing to organise except telling guests to bring a swimsuit.<br>
<strong>Cost:</strong> free.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> summer weddings with accommodation on site.</p>

<h3>36. Thank-yous in a small circle</h3>
<p><strong>How it works:</strong> in a calm moment, you give gifts to the wedding party, your parents and everyone who helped. Without a microphone or a full room, it often feels more sincere than during dinner.<br>
<strong>Cost:</strong> the price of the gifts.<br>
<strong>Effort:</strong> low.<br>
<strong>Best for:</strong> every wedding.</p>

<h2>Summary table of the 36 ideas</h2>
<table>
<thead><tr><th>Idea</th><th>Moment</th><th>Budget</th><th>Effort</th></tr></thead>
<tbody>
<tr><td>Words from loved ones</td><td>Ceremony</td><td>Free</td><td>Medium</td></tr>
<tr><td>Symbolic ritual</td><td>Ceremony</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Live music</td><td>Ceremony</td><td>Free to €300+</td><td>Medium</td></tr>
<tr><td>Programme that keeps people busy</td><td>Ceremony</td><td>Under €100</td><td>Medium</td></tr>
<tr><td>Petal send-off</td><td>Ceremony</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Disposable camera in guests’ phones</td><td>Cocktail hour and party</td><td>Free to under €100</td><td>Low</td></tr>
<tr><td>Lawn games and pétanque</td><td>Cocktail hour</td><td>Free to under €150</td><td>Low</td></tr>
<tr><td>Roaming musician</td><td>Cocktail hour</td><td>€300+</td><td>Medium</td></tr>
<tr><td>Close-up magician</td><td>Cocktail hour</td><td>€400+</td><td>Low</td></tr>
<tr><td>Caricaturist</td><td>Cocktail hour</td><td>Several hundred euros</td><td>Low</td></tr>
<tr><td>Tasting station</td><td>Cocktail hour</td><td>Varies</td><td>Low</td></tr>
<tr><td>Big group photo</td><td>Cocktail hour</td><td>Free</td><td>Low</td></tr>
<tr><td>Audio guest book</td><td>Cocktail hour</td><td>Under €100 to €300</td><td>Low</td></tr>
<tr><td>Kids’ corner</td><td>Cocktail hour and party</td><td>Free to a few hundred euros</td><td>Medium</td></tr>
<tr><td>Cocktail bar with a show</td><td>Cocktail hour</td><td>€300+</td><td>Medium</td></tr>
<tr><td>Seating plan that tells a story</td><td>Dinner</td><td>Free</td><td>Medium</td></tr>
<tr><td>Couple quiz</td><td>Dinner</td><td>Free</td><td>Low</td></tr>
<tr><td>Timed speeches</td><td>Dinner</td><td>Free</td><td>Medium</td></tr>
<tr><td>Slideshow or video</td><td>Dinner</td><td>Free</td><td>Medium to high</td></tr>
<tr><td>Envelopes on the tables</td><td>Dinner</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Switching seats for dessert</td><td>Dinner</td><td>Free</td><td>Low</td></tr>
<tr><td>Show-stopping dessert</td><td>Dinner</td><td>Varies</td><td>Low</td></tr>
<tr><td>Notes for later</td><td>Dinner</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Group first dance</td><td>Party</td><td>Free</td><td>Low to high</td></tr>
<tr><td>Music quiz</td><td>Party</td><td>Free</td><td>Low</td></tr>
<tr><td>Karaoke</td><td>Party</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Photo booth</td><td>Party</td><td>€300+</td><td>Low</td></tr>
<tr><td>Midnight snack</td><td>Party</td><td>Varies</td><td>Low</td></tr>
<tr><td>Dance floor props</td><td>Party</td><td>Under €100</td><td>Low</td></tr>
<tr><td>Sparklers and fireworks</td><td>Party</td><td>€300+</td><td>High</td></tr>
<tr><td>Quiet lounge</td><td>Party</td><td>Free to under €100</td><td>Low</td></tr>
<tr><td>Dance from your roots</td><td>Party</td><td>Free</td><td>Low</td></tr>
<tr><td>Brunch and photo reveal</td><td>Next day</td><td>Free</td><td>Low</td></tr>
<tr><td>Next-day tournament</td><td>Next day</td><td>Free</td><td>Low</td></tr>
<tr><td>Swim or walk</td><td>Next day</td><td>Free</td><td>Low</td></tr>
<tr><td>Thank-yous in a small circle</td><td>Next day</td><td>Cost of gifts</td><td>Low</td></tr>
</tbody>
</table>
<p>Prices are rough figures from French suppliers in 2026. They vary a lot by region, season and duration: always ask for a quote.</p>

<h2>Pacing: where to place entertainment during the day</h2>
<p>A wedding day has its lulls, always in the same places. Spot them in your schedule and put one activity in each, rather than piling everything into the evening.</p>
<h3>The four lulls to fill</h3>
<ul>
<li><strong>Between the ceremony and the cocktail hour.</strong> The journey, the wait while the couple signs the register or takes photos. A welcome drink and some music are often enough.</li>
<li><strong>During your couple portraits.</strong> You disappear for 30 to 45 minutes in the middle of the cocktail hour. This is the time for lawn games, the magician, the disposable camera QR code: guests photograph each other while you are away.</li>
<li><strong>Between sitting down and the starter.</strong> Often a vague quarter of an hour: the seating plan and table envelopes fill it naturally.</li>
<li><strong>Between dessert and the first dance.</strong> The caterer clears, the DJ sets up, people drift outside. A show-stopping dessert or a warm-up music quiz bridge the gap.</li>
</ul>
<h3>Don’t stack everything</h3>
<p>It is tempting to add “just one more idea”. Ask one question for each activity: <strong>does it fill a lull, or does it interrupt a good moment?</strong> A quiz in the middle of a table that is laughing, a sketch while the dance floor is packed, a speech just as the hot course arrives: those are the activities that kill the mood.</p>
<p>In practice, a good balance looks like this: one or two touches at the ceremony, two self-running activities at the cocktail hour, two or three highlights at dinner, and a single surprise in the evening. The rest is music and conversation.</p>
<h3>Tell your suppliers</h3>
<p>The caterer must know about every activity that touches dinner, and the DJ about every evening one. Put them in your <a href="/journal/deroule-jour-j-mariage">wedding day timeline</a> with the time, duration and person in charge. And before signing, check that your venue allows them (fireworks, candles, outdoor music): it is one of the <a href="/journal/questions-lieu-reception-mariage">questions to ask your wedding venue</a>.</p>

<h2>Three plans for three budgets</h2>
<h3>Zero euros</h3>
<p>Words from loved ones at the ceremony, borrowed lawn games and the big group photo at the cocktail hour, a story-telling seating plan and a quiz at dinner, a group first dance and a dance from your roots in the evening, a tournament the next day. None of it costs a cent, and it already makes for a lively day.</p>
<h3>Under €100</h3>
<p>The plan above, plus petals for the send-off, mission envelopes on the tables, glow props for the dance floor and a digital disposable camera for around fifty guests (€14.99 with Time to Flash). As a bonus, you get hundreds of photos of the day taken by your guests.</p>
<h3>Over €100</h3>
<p>Choose <strong>one</strong> hired act and put it in the emptiest moment: a magician or musician during your portraits at the cocktail hour, or a midnight snack to revive the party. One well-placed act beats three that trip over each other.</p>

<h2>Entertainment to avoid</h2>
<ul>
<li><strong>Sky lantern releases.</strong> They are banned by prefectoral order in several French departments because of fire risk and pollution, and balloon releases are banned in some too. Check local rules wherever you marry.</li>
<li><strong>Games that make someone uncomfortable.</strong> Garter auctions, humiliating dares, quizzes about exes: if in doubt, don’t.</li>
<li><strong>Activities that drag on.</strong> Past fifteen minutes, even the best idea gets tiring.</li>
<li><strong>Anything that relies on mobile signal you have not tested.</strong> If your activity uses phones, check coverage on site. Solutions if there is no signal: <a href="/journal/pas-de-reseau-salle-mariage">no signal at the venue</a>.</li>
</ul>
<p>For the disposable camera in idea 6, everything takes a few minutes: <a href="/create">create your album</a>, print the QR code, and let your guests tell the story of your day.</p>
`,
    faq: [
      {
        q: 'What are some unique wedding entertainment ideas?',
        a: 'Pick by moment: a symbolic ritual at the ceremony, lawn games or a shared disposable camera at the cocktail hour, a couple quiz at dinner, a traditional dance or music quiz at the party. What makes entertainment feel unique is its link to your story, more than its price.',
      },
      {
        q: 'How do you entertain guests during cocktail hour?',
        a: 'Cocktail hour is long and you are away for your portraits, so plan activities that run without you. Lawn games, a roaming musician, a close-up magician or a disposable camera QR code on the tables give guests a reason to talk and something to do.',
      },
      {
        q: 'What wedding entertainment is free?',
        a: 'Words from loved ones, the big group photo, a couple quiz, a seating plan that tells your story, switching seats for dessert, a group first dance, a music quiz run by the DJ and a next-day tournament cost nothing. Each just needs someone in charge.',
      },
      {
        q: 'How much entertainment does a wedding need?',
        a: 'One or two touches at the ceremony, two self-running activities at the cocktail hour, two or three highlights at dinner and one surprise in the evening are enough. Beyond that, activities trip over each other and interrupt the conversations that are the heart of the day.',
      },
      {
        q: 'How do you keep guests busy during the couple’s photos?',
        a: 'It is the main lull of the day, often 30 to 45 minutes. Start the lawn games, musician or magician then, and invite guests to scan the disposable camera QR code: they photograph each other while you are away.',
      },
      {
        q: 'Are sky lanterns allowed at weddings?',
        a: 'In France they are banned by prefectoral order in several departments because of fire risk and pollution, and some also ban balloon releases. Check with local authorities and your venue, or choose an alternative such as cold spark fountains.',
      },
    ],
  },

  // EN : « questions to ask wedding venue », « wedding venue checklist ».
  // Top results (WedSafe, Bridal Musings, Eastnor Castle) give 45 to 70
  // raw questions with little explanation.
  'questions-lieu-reception-mariage': {
    title: 'Questions to ask a wedding venue: the complete checklist',
    excerpt: 'The questions to ask a wedding venue, topic by topic, with what each answer really tells you, the classic traps, and a printable checklist for your visit.',
    caption: 'A couple visiting an empty reception hall, notebook in hand',
    body: `
<p>The venue is often the biggest expense of a wedding, and the first contract you sign. Once the deposit is paid, backing out is expensive. Here are <strong>the questions to ask a wedding venue</strong>, sorted by topic, with why each one matters and the trap it helps you avoid. At the end, a checklist to print and take on your visit.</p>
<p>One tip before you go: if you can, visit the venue <strong>in the same season and at the same time of day</strong> as your wedding. A room bathed in sunlight at 3 pm in June looks very different at 11 pm in October.</p>

<h2>How to choose a wedding venue: the method</h2>
<ul>
<li><strong>Have your numbers ready before the visit</strong>: guest count (adults and children), maximum budget, two or three possible dates.</li>
<li><strong>Go as a pair, or with a friend.</strong> One asks the questions, the other takes notes and photos.</li>
<li><strong>Get the important answers in writing.</strong> If it is not in the contract, it does not exist.</li>
<li><strong>Ask for a sample contract</strong> and read it calmly at home, not on the spot.</li>
</ul>

<h2>1. Capacity and spaces</h2>
<ul>
<li><strong>How many people for a seated dinner, and for a standing reception?</strong> The two figures are very different. A room advertised as “200 people” often means standing.</li>
<li><strong>How many with a dance floor and space for the DJ?</strong> The dance floor and DJ booth easily take the place of several tables.</li>
<li><strong>What is the maximum capacity allowed?</strong> Venues open to the public have a safety limit. Going over it becomes an insurance problem if anything happens.</li>
<li><strong>Are there separate spaces</strong> for the ceremony, the cocktail hour, dinner, a kids’ corner, a quiet lounge?</li>
<li><strong>Is the venue exclusive?</strong> Some estates host two events on the same day, or keep a restaurant open to the public.</li>
</ul>
<p><strong>Why it matters:</strong> an overcrowded room is uncomfortable, an oversized one feels empty. Ask for a floor plan with the table layout you have in mind (round or long tables), not a theoretical capacity.</p>

<h2>2. The rain plan</h2>
<ul>
<li><strong>Where do the ceremony and cocktail hour happen if it rains?</strong> Visit that space too, just as carefully.</li>
<li><strong>Is the backup included, or do you need to rent a marquee?</strong> At what price?</li>
<li><strong>When do you have to decide?</strong> The day before, that morning, two hours ahead?</li>
<li><strong>Can the spaces be heated or cooled</strong> in extreme weather?</li>
</ul>
<p><strong>Why it matters:</strong> many venues are sold on their garden. If the backup is a barn or a room that is too small, that is what you should judge, because you might spend the day there.</p>

<h2>3. Timings and end of the night</h2>
<ul>
<li><strong>What time can you get in</strong> to decorate? Is the day before possible, and at what price?</li>
<li><strong>What time must the music stop</strong>, and what time do you have to leave?</li>
<li><strong>Is clearing up done that night</strong> or the next morning?</li>
<li><strong>Is the venue available the next day</strong> for a brunch?</li>
<li><strong>Are there charges for running late?</strong> Some venues bill every extra hour.</li>
</ul>
<p><strong>Why it matters:</strong> music ending at 1 am changes the whole evening. If you dream of partying until dawn, it is the first question to ask, before you even visit.</p>

<h2>4. Noise and neighbours</h2>
<ul>
<li><strong>Is there a sound limiter?</strong> It is a device that cuts the sound system if the volume goes over a threshold. What level is it set to?</li>
<li><strong>Is music allowed outside</strong>, and until when?</li>
<li><strong>Are there neighbours nearby</strong>, and have there been complaints?</li>
<li><strong>Do doors and windows have to be closed</strong> after a certain time?</li>
</ul>
<p><strong>Why it matters:</strong> a limiter set too low cuts the music every time the room sings along. Have your DJ talk to the venue before you sign with them: they will know whether it is workable.</p>

<h2>5. In-house or outside caterer</h2>
<ul>
<li><strong>Is the caterer imposed</strong>, chosen from a list, or entirely up to you?</li>
<li><strong>If you can choose, is there a fee</strong> for an outside caterer?</li>
<li><strong>How is the kitchen equipped?</strong> Cold room, ovens, hobs, washing-up area, enough electrical power?</li>
<li><strong>Can you have a tasting</strong> before signing, if the caterer is imposed?</li>
<li><strong>Can the cake come from another baker?</strong> Some caterers charge a cake-cutting fee.</li>
</ul>
<p><strong>Why it matters:</strong> catering often costs as much as the venue hire. A cheap venue with an expensive imposed caterer is not a cheap venue. Always compare the total cost per guest.</p>

<h2>6. Drinks and corkage</h2>
<ul>
<li><strong>Can you bring your own drinks?</strong></li>
<li><strong>Is there a corkage fee</strong>, a charge for each bottle you bring and open? Is it per bottle or a flat fee?</li>
<li><strong>Is it the same for wine, champagne and spirits?</strong> Does it go down with volume?</li>
<li><strong>Who staffs the bar</strong>, and until what time?</li>
</ul>
<p><strong>Why it matters:</strong> not every venue charges corkage, and amounts vary widely. Multiplied by the number of bottles at a wedding, it can wipe out the savings of bringing your own. Do the maths before deciding.</p>

<h2>7. Equipment included</h2>
<ul>
<li><strong>Tables and chairs</strong>: how many, what shape and size? Are the chairs presentable, or do you need covers?</li>
<li><strong>Linen, tableware, glasses</strong>: included or to rent?</li>
<li><strong>Sound system, microphone, projector, screen</strong>: available and working?</li>
<li><strong>Lighting</strong>: can the room be dimmed? Are outdoor areas lit at night?</li>
<li><strong>Heating and air conditioning</strong>: included or charged separately?</li>
</ul>
<p><strong>Why it matters:</strong> renting tables, chairs, linen and tableware for a hundred people is a serious budget. A slightly pricier but fully equipped venue sometimes costs less overall.</p>

<h2>8. Accommodation</h2>
<ul>
<li><strong>How many beds on site</strong>, and at what price?</li>
<li><strong>Do you have to book all the accommodation</strong> on the estate?</li>
<li><strong>What time is check-out</strong> the next day?</li>
<li><strong>Which nearby hotels or guesthouses</strong> does the venue recommend?</li>
</ul>
<p><strong>Why it matters:</strong> staying on site means nobody drives after the party. It is a real safety issue, and a huge comfort for guests who travelled far.</p>

<h2>9. Access and parking</h2>
<ul>
<li><strong>How many parking spaces</strong>, and can cars stay overnight?</li>
<li><strong>Is the venue easy to find</strong> by GPS? Is the path lit at night?</li>
<li><strong>Is there a train station nearby</strong>, and are taxis or ride-hailing available late at night?</li>
<li><strong>Is a shuttle possible</strong>, or already offered by the venue?</li>
</ul>
<p><strong>Why it matters:</strong> in the countryside, finding a taxi at 2 am can be a real challenge. If getting home is complicated, plan a shuttle or accommodation.</p>

<h2>10. Accessibility</h2>
<ul>
<li><strong>Is the venue wheelchair accessible?</strong> Stairs, ramps, lift?</li>
<li><strong>Are there accessible toilets?</strong></li>
<li><strong>Are the spaces close together</strong>, or is there a long walk over gravel or grass?</li>
</ul>
<p><strong>Why it matters:</strong> a grandparent who cannot get down to the dining room is a ruined day for them and for you. Think about heels on cobblestones and pushchairs too.</p>

<h2>11. Mobile signal and wifi</h2>
<ul>
<li><strong>Is there mobile signal inside the room?</strong> Don’t settle for the answer: turn off wifi on your phone and test it yourself, inside the room, not in the car park. If you can, test with two different networks.</li>
<li><strong>Is there guest wifi</strong> that covers the room, not just reception?</li>
<li><strong>How many simultaneous connections can it handle</strong>, and what is the password?</li>
</ul>
<p><strong>Why it matters:</strong> the most beautiful venues (vaulted cellars, stone barns, valleys) are often the worst covered. No signal means no shared photos, no calls for a lost guest, no card payments at the bar. There are solutions: see <a href="/journal/pas-de-reseau-salle-mariage">no signal at the venue, what to do</a> and <a href="/journal/wifi-lieu-reception-mariage">wifi at the wedding venue</a>.</p>

<h2>12. Entertainment and decorations allowed</h2>
<ul>
<li><strong>What entertainment is allowed?</strong> Fireworks, spark fountains, candles, smoke machine, confetti, rice?</li>
<li><strong>Can decorations be attached</strong> to walls, beams or the ceiling?</li>
<li><strong>Is there a socket and space</strong> for a photo booth or DJ?</li>
<li><strong>Can you set up outdoor games</strong>, or a ceremony in the garden?</li>
</ul>
<p><strong>Why it matters:</strong> you don’t want to find out a month before the wedding that candles are banned or fireworks impossible. If you are still looking for ideas, we gathered <a href="/journal/idees-animation-mariage">36 wedding entertainment ideas</a> with their constraints.</p>

<h2>13. Required suppliers and your contact</h2>
<ul>
<li><strong>Are any suppliers imposed</strong>, or is there a mandatory list (DJ, florist, photographer, furniture hire)?</li>
<li><strong>Are there fees</strong> for using an outside supplier?</li>
<li><strong>Who from the venue will be there on the day</strong>, and until what time? Who do you call if something goes wrong?</li>
<li><strong>Who handles music licensing</strong>: you, the DJ or the venue?</li>
</ul>
<p><strong>Why it matters:</strong> an imposed supplier can be excellent, but you should be told before signing, not after. And on the day, a reachable venue manager solves in five minutes what would otherwise ruin an hour.</p>

<h2>14. Price, deposit and payment</h2>
<ul>
<li><strong>What exactly is included in the price?</strong> Cleaning, electricity, heating, security, tourist tax?</li>
<li><strong>Is the price guaranteed</strong> until the wedding, or can it change if you book two years ahead?</li>
<li><strong>How much is the deposit</strong> at booking, and what is the payment schedule after that?</li>
<li><strong>What happens to the deposit if you cancel?</strong></li>
</ul>
<p><strong>Why it matters:</strong> the wording of the deposit is crucial. In France, the law distinguishes <em>arrhes</em> (either side can withdraw: you lose them, or the venue pays you back double) from an <em>acompte</em> (a firm commitment: if you cancel, you may owe the full price). Between a business and a consumer, money paid in advance counts as <em>arrhes</em> unless the contract says otherwise. Elsewhere, rules differ: read exactly what your contract says about refunds.</p>

<h2>15. Cancellation and postponement</h2>
<ul>
<li><strong>What happens if you cancel</strong>, depending on when?</li>
<li><strong>Can you move the date</strong>, and on what terms?</li>
<li><strong>What happens if the venue cancels</strong> (sale, building work, damage)?</li>
<li><strong>Which situations does the contract treat as force majeure?</strong></li>
</ul>
<p><strong>Why it matters:</strong> couples often sign more than a year in advance. A lot can happen in a year. A contract that only covers cancellations by the client, never by the venue, is unbalanced.</p>

<h2>16. Insurance</h2>
<ul>
<li><strong>Does the venue require proof of liability insurance?</strong> Does your home insurance cover an event like this?</li>
<li><strong>Is the venue itself insured</strong> for accidents on its premises?</li>
<li><strong>Do you need wedding cancellation insurance?</strong> Specialist policies exist; compare what they really cover (illness, weather, supplier failure).</li>
</ul>
<p><strong>Why it matters:</strong> red wine on an antique sofa or a broken window can be expensive. Better to know who pays before it happens.</p>

<h2>17. Inspection and security deposit</h2>
<ul>
<li><strong>Is there an inspection on arrival and departure</strong>, with you present?</li>
<li><strong>How much is the security deposit</strong>, and how soon is it returned?</li>
<li><strong>Is cleaning included</strong>, or do you have to leave the room clean?</li>
<li><strong>Who handles rubbish</strong>, recycling and empty bottles?</li>
<li><strong>Are breakages charged</strong> per item?</li>
</ul>
<p><strong>Why it matters:</strong> the security deposit is often several hundred euros, sometimes more. Take dated photos of the room when you arrive: it is your best protection in a dispute.</p>

<h2>Classic traps when visiting a wedding venue</h2>
<ul>
<li><strong>The “from” price.</strong> It often means a weekday off-season, without cleaning or heating. Ask for an all-inclusive quote for your date and guest count.</li>
<li><strong>Standing capacity sold as seated capacity.</strong> Ask to see a real table plan.</li>
<li><strong>The rain plan you never saw.</strong> The garden is stunning, the backup room much less so.</li>
<li><strong>Finding out the end time too late.</strong> Or music cut at 1 am by a limiter nobody mentioned.</li>
<li><strong>Hidden costs.</strong> Metered electricity, compulsory security staff, corkage, cake-cutting fee, outside caterer fee.</li>
<li><strong>10 am check-out the next day.</strong> With guests in bed at 5 am, it is a scramble.</li>
<li><strong>Too few toilets</strong> for the number of guests, or power that trips when the caterer and DJ plug everything in at once.</li>
<li><strong>Verbal promises.</strong> “The day before is no problem”, “we’ll let you finish later”: if it is not written down, it commits no one.</li>
</ul>
<p>Also ask for contacts of couples who married there, or read recent reviews. And once the venue is signed, the rest of the calendar awaits: <a href="/journal/retroplanning-mariage">the wedding planning timeline</a> helps you forget nothing.</p>

<h2>The printable checklist for your visit</h2>
<p>Print this list, tick it off during the visit, and note answers in the margin.</p>
<ul>
<li>☐ Seated capacity, with dance floor and DJ</li>
<li>☐ Standing capacity and maximum capacity allowed</li>
<li>☐ Separate spaces: ceremony, cocktail hour, dinner, children</li>
<li>☐ Exclusive hire</li>
<li>☐ Rain plan visited, included or extra, decision time</li>
<li>☐ Heating and air conditioning</li>
<li>☐ Access time for setting up, day before possible</li>
<li>☐ Time the music stops and time to leave</li>
<li>☐ Clearing up that night or next day, venue available for brunch</li>
<li>☐ Sound limiter and its level, outdoor music until when</li>
<li>☐ Nearby neighbours, rules on doors and windows</li>
<li>☐ Caterer imposed, from a list or free, outside caterer fee</li>
<li>☐ Kitchen equipment and electrical power</li>
<li>☐ Cake from another baker, cake-cutting fee</li>
<li>☐ Bringing drinks, corkage and its amount</li>
<li>☐ Tables, chairs, linen, tableware included</li>
<li>☐ Sound system, microphone, projector, indoor and outdoor lighting</li>
<li>☐ Number of beds, price, check-out time</li>
<li>☐ Parking, lit path, taxis and shuttles</li>
<li>☐ Wheelchair access and accessible toilets</li>
<li>☐ Signal tested inside the room on two networks</li>
<li>☐ Guest wifi: coverage, number of connections, password</li>
<li>☐ Entertainment allowed: fireworks, candles, confetti, smoke</li>
<li>☐ Decorations on walls and ceiling</li>
<li>☐ Imposed suppliers and outside supplier fees</li>
<li>☐ Venue contact on the day and their number</li>
<li>☐ Music licensing: whose responsibility</li>
<li>☐ What the price includes, price guaranteed until the date</li>
<li>☐ Deposit terms, amount and payment schedule</li>
<li>☐ Cancellation and postponement terms, on both sides</li>
<li>☐ Proof of liability insurance required</li>
<li>☐ Inspection on arrival and departure, security deposit amount</li>
<li>☐ Cleaning, rubbish, breakage charges</li>
<li>☐ Sample contract collected</li>
</ul>
<p>One last idea for the day itself: if the signal is good in the room, a <a href="/appareil-jetable-mariage">shared disposable camera</a> turns every guest’s phone into a camera, with a QR code on the tables and an album revealed the next day.</p>
`,
    faq: [
      {
        q: 'What questions should you ask when visiting a wedding venue?',
        a: 'The essentials: seated capacity with a dance floor, the rain plan, the time the music must stop, whether the caterer is imposed, corkage, what the price includes, and the deposit and cancellation terms. Add mobile signal, accommodation and parking, which are often forgotten.',
      },
      {
        q: 'Is a wedding venue deposit refundable?',
        a: 'It depends on the contract and the country. In France, money paid in advance between a business and a consumer counts as arrhes unless the contract says otherwise: you can withdraw by losing them, and the venue by paying back double. A firm deposit (acompte) can leave you owing the full price, so read the wording carefully.',
      },
      {
        q: 'What is a corkage fee at a wedding?',
        a: 'It is a charge the venue or caterer applies to each bottle you bring and open, to make up for not selling you drinks. It can be per bottle or a flat fee, and not every venue charges one. Work it out on your expected number of bottles before deciding to bring your own.',
      },
      {
        q: 'How far in advance should you book a wedding venue?',
        a: 'For a Saturday between May and September, the most popular venues are often booked more than a year ahead. Off-season or midweek, a few months may be enough. The venue sets the date, so it is the first booking to make.',
      },
      {
        q: 'What should you check about mobile signal at a wedding venue?',
        a: 'Test the signal yourself inside the room with wifi off, ideally on two networks. Ask whether guest wifi covers the whole room and how many connections it supports. Without signal, guests cannot share photos or call a taxi.',
      },
      {
        q: 'Do you need insurance to hire a wedding venue?',
        a: 'Many venues ask for proof of liability insurance, which your home insurance may provide: check with your insurer. Wedding cancellation insurance is optional; compare exactly what it covers before taking it out.',
      },
    ],
  },
}

export const POSTS_DE = {
  // DE : « Hochzeitsspiele », « Unterhaltung Hochzeit », « Unterhaltung zur
  // Hochzeit Ideen », « Sektempfang Hochzeit Ideen ». Vu dans Google.de
  // (10/10/2026) : Bridebook DE (Unterhaltung zur Hochzeit, Hochzeitsprogramm,
  // Sektempfang), ERGO (Hochzeitsspiele), für Sie (Aufgaben für Gäste) :
  // listes d’idées (Schuhspiel, Hochzeitsbingo, Zauberer, Fotobox, Karaoke)
  // sans prix ni effort, rarement par moment de la journée. Usages adaptés à
  // l’Allemagne : Sektempfang, Kaffee und Kuchen, Baumstammsägen, Kubb,
  // Hochzeitszeitung, Mitternachtssnack, Himmelslaternen interdites dans
  // presque tous les Länder, feu d’artifice soumis à l’Ordnungsamt.
  'idees-animation-mariage': {
    title: 'Hochzeitsspiele und Unterhaltung: 36 Ideen für den ganzen Tag',
    excerpt: '36 Ideen für Hochzeitsspiele und Unterhaltung, von der Trauung bis zum Brunch: mit Preisen, Aufwand und Tipps, damit sich Ihre Gäste nie langweilen.',
    caption: 'Hochzeitsgäste spielen beim Sektempfang Kubb auf dem Rasen',
    body: `
<p>Sie suchen <strong>Hochzeitsspiele und Unterhaltung</strong> für Ihre Feier, aber die Listen, die Sie finden, wiederholen alle dieselben Ideen, ohne zu sagen, was sie kosten, wie viel Vorbereitung sie brauchen und zu welchem Zeitpunkt des Tages sie wirklich funktionieren. Hier sind 36 Ideen, sortiert nach Tagesabschnitt (Trauung, Sektempfang, Hochzeitsessen, Party, Tag danach), jede mit Prinzip, ungefährem Preis, Aufwand und der Art von Hochzeit, zu der sie passt.</p>
<p>Bevor Sie auswählen, ein Rat, der mehr wert ist als alle Ideen zusammen: <strong>Gute Unterhaltung ist vor allem Unterhaltung im richtigen Moment</strong>. Darauf kommen wir nach der Liste ausführlich zurück.</p>

<h2>Unterhaltung bei der Hochzeit: drei Regeln vorab</h2>
<ul>
<li><strong>Füllen Sie nicht jede Minute.</strong> Ihre Gäste kommen auch, um zu reden, zu essen und zu tanzen. Alle zwanzig Minuten ein Programmpunkt ermüdet alle, Sie eingeschlossen.</li>
<li><strong>Zielen Sie auf die Leerlaufzeiten.</strong> Davon gibt es an jedem Hochzeitstag mindestens vier (Details weiter unten). Genau dort verändert Unterhaltung die Stimmung wirklich.</li>
<li><strong>Bestimmen Sie Verantwortliche.</strong> Jeder Programmpunkt, der Koordination braucht, bekommt eine verantwortliche Person, die nicht Sie sind: eine Trauzeugin, ein organisierter Cousin, der Hochzeitsplaner. Am Hochzeitstag steuern Sie nichts.</li>
</ul>
<p>Bei jeder Idee steht der <strong>Aufwand</strong>: <em>gering</em> (höchstens eine Stunde Vorbereitung), <em>mittel</em> (ein paar Abende oder mehrere Personen zu koordinieren), <em>hoch</em> (ein echtes Projekt, oder ein Dienstleister, den man finden und briefen muss).</p>

<h2>Während der Trauung: 5 Ideen</h2>
<p>Die Trauung ist nicht der Moment für Spiele, aber ein paar Elemente machen sie persönlicher und lebendiger, vor allem bei einer freien Trauung.</p>

<h3>1. Worte der Liebsten</h3>
<p><strong>Das Prinzip:</strong> Zwei oder drei nahestehende Menschen lesen einen Text, erzählen eine Anekdote oder berichten von Ihrer Geschichte. Oft der bewegendste Moment des Tages.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> mittel. Sie müssen die Rednerinnen und Redner früh auswählen, ihnen eine Dauer vorgeben (drei Minuten pro Person, nicht mehr) und die Reihenfolge festlegen.<br>
<strong>Für welche Hochzeit:</strong> alle, vor allem freie Trauungen, bei denen nichts vorgegeben ist.</p>

<h3>2. Ein symbolisches Ritual</h3>
<p><strong>Das Prinzip:</strong> eine Geste, die die Verbindung sichtbar macht. Farbiger Sand, der in ein gemeinsames Gefäß fließt, ein Baum, den Sie zusammen pflanzen, Hände, die mit einem Band verbunden werden (Handfasting), oder eine Weinkiste, in die Sie Briefe und eine Flasche legen, die Sie in zehn Jahren öffnen.<br>
<strong>Kosten:</strong> 20 bis 80 € je nach Ritual.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> freie Trauungen oder Trauungen im Freien. Die Weinkiste funktioniert auch im kleinen Kreis sehr gut.</p>

<h3>3. Live-Musik</h3>
<p><strong>Das Prinzip:</strong> Ein Musiker spielt zum Einzug, zum Auszug und zwischen den Beiträgen. Eine Geige, eine Gitarre oder eine Stimme verändern die Atmosphäre völlig im Vergleich zu einem Lautsprecher.<br>
<strong>Kosten:</strong> nichts, wenn jemand aus Ihrem Umfeld spielt, sonst in der Regel 300 bis 1.000 € für einen professionellen Musiker, mehr für ein Quartett.<br>
<strong>Aufwand:</strong> mittel (Auswahl der Stücke, Probe, eventuell Steckdose).<br>
<strong>Für welche Hochzeit:</strong> alle. Wenn ein Freund oder eine Verwandte spielt, ist das ein Geschenk: Bedanken Sie sich mit einer Erwähnung im Programmheft.</p>

<h3>4. Ein Programmheft, das beschäftigt</h3>
<p><strong>Das Prinzip:</strong> Neben dem Ablauf enthält das Programmheft den Text eines Liedes, das alle mitsingen, ein kleines Rätsel für die Kinder (Suchsel, Ausmalbild) oder eine Frage des Tages, die alle mit zum Sektempfang nehmen.<br>
<strong>Kosten:</strong> unter 100 € Druckkosten für rund hundert Exemplare, oft viel weniger, wenn Sie selbst drucken.<br>
<strong>Aufwand:</strong> mittel (Layout).<br>
<strong>Für welche Hochzeit:</strong> wenn die Gäste vor Beginn lange warten, oder wenn viele Kinder dabei sind.</p>

<h3>5. Der Auszug unter Blütenblättern</h3>
<p><strong>Das Prinzip:</strong> Beim Auszug bilden die Gäste ein Spalier und werfen getrocknete Blütenblätter, Lavendel oder biologisch abbaubares Konfetti, oder sie pusten Seifenblasen. Das ist auch eines der schönsten Fotos des Tages. In vielen Regionen folgt danach das Baumstammsägen: Sie sägen gemeinsam einen Stamm durch, die Gäste feuern an.<br>
<strong>Kosten:</strong> 20 bis 60 €.<br>
<strong>Aufwand:</strong> gering, wenn zwei Personen die Tütchen verteilen.<br>
<strong>Für welche Hochzeit:</strong> alle. Prüfen Sie nur, was erlaubt ist: Manche Standesämter, Kirchen und Locations verbieten Reis oder Konfetti.</p>

<h2>Unterhaltung beim Sektempfang: 10 Ideen für den längsten Moment</h2>
<p>Der Sektempfang dauert oft anderthalb bis zwei Stunden, und bei vielen Hochzeiten geht er in Kaffee und Kuchen über. Es ist der Moment, in dem Gäste, die sich nicht kennen, aufeinandertreffen, während Sie Ihr Paarshooting machen. Hier ist Unterhaltung am nützlichsten: Sie gibt einen Vorwand, miteinander ins Gespräch zu kommen.</p>

<h3>6. Die digitale Einwegkamera auf dem Handy der Gäste</h3>
<p><strong>Das Prinzip:</strong> ein QR-Code am Eingang, an der Bar und auf den Tischen. Jeder Gast scannt ihn, und sein Handy wird zur Einwegkamera: eine begrenzte Zahl an Fotos (Sie wählen zwischen 3 und 15 pro Person), vor der Präsentation ist nichts zu sehen, und das Album wird für alle gleichzeitig sichtbar, standardmäßig am Tag nach der Feier; Sie bestimmen den Zeitpunkt. Weil die Aufnahmen gezählt sind, überlegt jeder vor dem Auslösen: So entstehen Fotos vom ganzen Tag, aus Dutzenden Blickwinkeln, auch von Momenten, in denen Sie gerade woanders waren.<br>
<strong>Kosten:</strong> mit <a href="/appareil-jetable-mariage">Time to Flash</a> kostenlos bis 5 Gäste, danach eine einmalige Zahlung je nach Gästezahl (14,99 € für 50, 29,99 € für 100, 59,99 € für 300), ohne Abo.<br>
<strong>Aufwand:</strong> gering. Sie legen das Event in wenigen Minuten an und drucken den QR-Code (der <a href="/generateur-qr-code-mariage">Plakatgenerator</a> ist kostenlos).<br>
<strong>Für welche Hochzeit:</strong> alle, vor allem wenn Sie eine Unterhaltung möchten, die vom Sektempfang bis zum Ende der Party läuft, ohne Warteschlange und ohne Platzbedarf. Keine App zu installieren: Es öffnet sich eine Webseite, also machen auch die Großeltern mit. Wenn Sie zwischen Fotobox, Spiegel-Fotobox und Einwegkameras aus Pappe schwanken, haben wir sie in <a href="/journal/comparatif-animations-photo-mariage">diesem Vergleich der Fotoaktionen</a> gegenübergestellt.</p>

<h3>7. Rasenspiele</h3>
<p><strong>Das Prinzip:</strong> Kubb (Wikingerschach), Mölkky, Boule, Cornhole, Riesen-Jenga oder Riesen-Vier-gewinnt. Die Gäste spielen in spontanen Teams und lernen sich kennen, ohne es zu merken.<br>
<strong>Kosten:</strong> nichts, wenn Sie sich die Spiele leihen, sonst oft 50 bis 150 € Miete für ein komplettes Set.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> ländliche Hochzeiten, im Freien, mit Kindern. Planen Sie einen überdachten Ausweichplatz ein, falls das Wetter umschlägt.</p>

<h3>8. Der Musiker als Walking Act</h3>
<p><strong>Das Prinzip:</strong> ein Saxofonist, ein Gitarrist oder ein Jazztrio, das zwischen den Gruppen umhergeht. Lebendiger als eine Playlist, weniger raumgreifend als ein Konzert.<br>
<strong>Kosten:</strong> in der Regel 300 bis 1.000 € je nach Dauer und Besetzung.<br>
<strong>Aufwand:</strong> mittel (den richtigen Musiker finden, das Repertoire abstimmen).<br>
<strong>Für welche Hochzeit:</strong> elegante Hochzeiten, auf einem Gut oder im Schloss.</p>

<h3>9. Der Close-up-Zauberer</h3>
<p><strong>Das Prinzip:</strong> Ein Zauberer geht von Gruppe zu Gruppe und zeigt Tricks wenige Zentimeter vor den Augen (Karten, Münzen, Gegenstände der Gäste). Er bringt Menschen ins Gespräch, die bisher kein Wort gewechselt haben.<br>
<strong>Kosten:</strong> ab etwa 400 €, oft mehr je nach Bekanntheit und Dauer.<br>
<strong>Aufwand:</strong> gering, sobald er gebucht ist.<br>
<strong>Für welche Hochzeit:</strong> wenn sich die beiden Familien kaum kennen. Kinder lieben es.</p>

<h3>10. Karikaturist oder Schnellzeichner</h3>
<p><strong>Das Prinzip:</strong> Ein Zeichner porträtiert die Gäste in wenigen Minuten. Jeder nimmt sein Bild mit nach Hause: Unterhaltung und kleines Gastgeschenk in einem.<br>
<strong>Kosten:</strong> rechnen Sie mit einigen Hundert Euro für ein paar Stunden.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> mittlere und große Hochzeiten. Fragen Sie, wie viele Porträts er pro Stunde schafft, damit keine Schlange entsteht.</p>

<h3>11. Die Genussstation</h3>
<p><strong>Das Prinzip:</strong> eine Käsestation mit Erklärungen, eine Bar mit Bier aus der Region oder mit Spritz, eine Weinprobe des Weinguts, eine Austernbar für Feinschmecker. Das Buffet wird zum Treffpunkt.<br>
<strong>Kosten:</strong> sehr unterschiedlich, oft Teil des Angebots des Caterers.<br>
<strong>Aufwand:</strong> gering, wenn der Caterer sich kümmert.<br>
<strong>Für welche Hochzeit:</strong> für Genießer, oder wenn der Sektempfang lang ist.</p>

<h3>12. Das große Gruppenfoto</h3>
<p><strong>Das Prinzip:</strong> alle Gäste auf einem einzigen Foto, von oben aufgenommen (aus einem Fenster, von einem Balkon, von einer Leiter). Zehn Minuten, ein Foto, das oft gerahmt wird.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering, wenn ein Trauzeuge mit Mikrofon alle zusammenruft. So klappt es: <a href="/journal/photos-de-groupe-mariage">Gruppenfotos bei der Hochzeit</a>.<br>
<strong>Für welche Hochzeit:</strong> alle.</p>

<h3>13. Das Audio-Gästebuch</h3>
<p><strong>Das Prinzip:</strong> Statt zu schreiben, hinterlassen die Gäste eine Sprachnachricht. Die klassische Version ist ein altes Telefon auf einem Tisch: Hörer abnehmen, sprechen. Nach der Hochzeit hören Sie alles noch einmal, mit Stimmen und Lachen.<br>
<strong>Kosten:</strong> Die Miete eines solchen Telefons liegt oft zwischen 150 und 300 €. Wenn Sie Time to Flash ohnehin nutzen, ist das Audio-Gästebuch eine Option für 9,99 €: Jeder Gast nimmt seine Nachricht und ein Selfie mit dem eigenen Handy auf, ohne Gerät, das Sie aufstellen müssen.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle. Eine der Erinnerungen, die sich Brautpaare am häufigsten wieder anhören.</p>

<h3>14. Die Kinderecke</h3>
<p><strong>Das Prinzip:</strong> ein Bereich mit Malsachen, Spielen, einer Decke, und idealerweise ein oder zwei Betreuerinnen oder Babysitter. Die Eltern genießen den Tag, die Kinder auch.<br>
<strong>Kosten:</strong> nichts, wenn Jugendliche aus der Familie das übernehmen (mit einem echten Dankeschön), sonst das Honorar einer Kinderbetreuung für den Abend, oft einige Hundert Euro.<br>
<strong>Aufwand:</strong> mittel.<br>
<strong>Für welche Hochzeit:</strong> sobald mehr als fünf oder sechs Kinder dabei sind.</p>

<h3>15. Die Cocktailbar mit Barkeeper</h3>
<p><strong>Das Prinzip:</strong> Ein Barkeeper mixt vor den Gästen einen oder zwei Signature-Cocktails, benannt nach Ihnen oder inspiriert von Ihrer Geschichte.<br>
<strong>Kosten:</strong> von einigen Hundert Euro bis über 1.000 €, je nach Gästezahl und Getränken.<br>
<strong>Aufwand:</strong> mittel (Rezepte auswählen, mit dem Caterer abstimmen).<br>
<strong>Für welche Hochzeit:</strong> ausgelassene Feiern, Sektempfang im Freien.</p>

<h2>Beim Hochzeitsessen: 8 Ideen zur Unterhaltung der Gäste</h2>
<p>Das Essen ist lang, oft drei Stunden. Die Falle: zwischen jedem Gang ein Programmpunkt am Mikrofon, kalte Teller und ein erschöpfter Caterer. Gönnen Sie sich zwei oder drei Höhepunkte, nicht mehr, und sagen Sie dem Service genau, wann sie im Ablauf stattfinden.</p>

<h3>16. Die Sitzordnung, die eine Geschichte erzählt</h3>
<p><strong>Das Prinzip:</strong> Jeder Tisch trägt den Namen eines Ortes oder einer Erinnerung, die Ihnen wichtig ist (Ihre erste Reise, die Stadt, in der Sie sich kennengelernt haben), mit einem Foto und drei Zeilen Erklärung. Die Gäste haben ein Gesprächsthema, sobald sie sitzen.<br>
<strong>Kosten:</strong> keine, abgesehen vom Druck.<br>
<strong>Aufwand:</strong> mittel.<br>
<strong>Für welche Hochzeit:</strong> alle.</p>

<h3>17. Das Brautpaar-Quiz und das Schuhspiel</h3>
<p><strong>Das Prinzip:</strong> ein Blatt mit zehn Fragen über Sie pro Tisch, im Team zwischen zwei Gängen auszufüllen, oder das Schuhspiel: Sie sitzen Rücken an Rücken und heben Ihren Schuh oder den des anderen, um Fragen wie „Wer von euch beiden…“ zu beantworten.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle, solange es kurz (zehn Minuten) und liebevoll bleibt.</p>

<h3>18. Vorbereitete Reden mit Zeitlimit</h3>
<p><strong>Das Prinzip:</strong> an sich kein Programmpunkt, aber das, was ein Essen gelingen oder kippen lässt. Reden von drei bis fünf Minuten, verteilt zwischen den Gängen, mit einer Reihenfolge, die ein Zeremonienmeister ansagt. Ein umgedichtetes Lied, ein kleiner Sketch der Trauzeugen oder eine Hochzeitszeitung zum Verteilen gehören in dieselbe Kategorie.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> mittel für die, die sprechen, gering für Sie.<br>
<strong>Für welche Hochzeit:</strong> alle. Ab fünf Beiträgen verlieren Sie den Saal.</p>

<h3>19. Diashow oder Video</h3>
<p><strong>Das Prinzip:</strong> Ihre Kinderfotos, Ihre ersten Urlaube, oder ein Video mit Grüßen von denen, die nicht kommen konnten.<br>
<strong>Kosten:</strong> keine, wenn die Location einen Beamer hat (sonst Miete einplanen).<br>
<strong>Aufwand:</strong> mittel bis hoch, es ist ein echter Schnitt.<br>
<strong>Für welche Hochzeit:</strong> alle. Bleiben Sie unter fünf Minuten.</p>

<h3>20. Umschläge auf den Tischen</h3>
<p><strong>Das Prinzip:</strong> Ein Umschlag pro Tisch enthält Aufgaben (ein Foto des Tisches mit der Braut machen, jemanden finden, der im selben Monat Geburtstag hat) oder Fragen zum Kennenlernen; eine Variante ist das Hochzeitsbingo. Das funktioniert sehr gut zusammen mit der Einwegkamera aus Idee 6: Die Aufgaben liefern die Motive.<br>
<strong>Kosten:</strong> unter 30 €.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> wenn an den Tischen Gäste sitzen, die sich nicht kennen.</p>

<h3>21. Platzwechsel zum Dessert</h3>
<p><strong>Das Prinzip:</strong> Zum Dessert wechselt die Hälfte jedes Tisches den Platz, nach einem Zeichen, das am Anfang verteilt wurde (eine Farbe, eine Karte). Oder Sie als Brautpaar gehen von Tisch zu Tisch und setzen sich jeweils kurz dazu.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> große Hochzeiten, bei denen Sie mit manchen Gästen kaum gesprochen haben.</p>

<h3>22. Das Dessert als Show</h3>
<p><strong>Das Prinzip:</strong> Sektsäbeln, das Anschneiden der Hochzeitstorte mit Musik, ein Dessertbuffet, ein Eiswagen oder ein Crêpes-Stand, der frisch zubereitet.<br>
<strong>Kosten:</strong> unterschiedlich, oft eine Option des Caterers.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle. Der ideale Übergang zum Hochzeitstanz.</p>

<h3>23. Briefe für später</h3>
<p><strong>Das Prinzip:</strong> Jeder Gast schreibt auf eine Karte einen Rat, einen Wunsch oder eine Vorhersage für Ihren zehnten Hochzeitstag. Sie öffnen die Karten an diesem Tag.<br>
<strong>Kosten:</strong> unter 30 €.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle, sehr schön im kleinen Kreis.</p>

<h2>Am Abend: 9 Ideen, um die Tanzfläche zu füllen</h2>
<p>Am Abend erledigt der DJ das Wesentliche. Die Programmpunkte dienen vor allem zwei Dingen: die auf die Tanzfläche zu holen, die sich nicht trauen, und denen eine Alternative zu bieten, die nicht tanzen.</p>

<h3>24. Ein Hochzeitstanz, der alle mitnimmt</h3>
<p><strong>Das Prinzip:</strong> Sie beginnen allein, auf ein vereinbartes Zeichen kommen die Trauzeugen dazu, dann die Familien, dann der ganze Saal. Ehrgeizigere Version: eine Choreografie, die eine Gruppe von Freunden einstudiert hat.<br>
<strong>Kosten:</strong> keine, oder ein paar Tanzstunden, wenn Sie eine echte Choreografie möchten.<br>
<strong>Aufwand:</strong> gering bis hoch, je nach Ehrgeiz.<br>
<strong>Für welche Hochzeit:</strong> alle.</p>

<h3>25. Das Musikquiz</h3>
<p><strong>Das Prinzip:</strong> Der DJ spielt kurze Ausschnitte an, Tische oder Familien treten gegeneinander an. Die Lieder aus Ihrer Jugend kommen immer gut an.<br>
<strong>Kosten:</strong> keine, wenn der DJ es einbaut.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> wenn die Tanzfläche nur langsam in Schwung kommt.</p>

<h3>26. Karaoke</h3>
<p><strong>Das Prinzip:</strong> eine halbe Stunde Karaoke mitten am Abend, oder spät in der Nacht für die Letzten.<br>
<strong>Kosten:</strong> oft unter 100 € Miete für die Technik, oder beim DJ im Angebot.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> unter Freunden, lockere Stimmung.</p>

<h3>27. Die Fotobox</h3>
<p><strong>Das Prinzip:</strong> eine Fotobox mit Requisiten und Sofortdruck. Die Gäste nehmen ihren Abzug mit nach Hause.<br>
<strong>Kosten:</strong> in der Regel 350 bis 900 € für den Abend. Die Preise im Detail: <a href="/journal/prix-photobooth-mariage">was eine Fotobox kostet</a>.<br>
<strong>Aufwand:</strong> gering, nötig sind vor allem eine Steckdose und etwa 4 m².<br>
<strong>Für welche Hochzeit:</strong> wenn Ihnen der Papierabzug wichtig ist, den man noch am selben Abend mitnimmt.</p>

<h3>28. Der Mitternachtssnack</h3>
<p><strong>Das Prinzip:</strong> gegen Mitternacht oder ein Uhr ein Foodtruck oder ein Stand mit Currywurst, Pommes, Flammkuchen oder Gulaschsuppe. Das gibt dem Abend neuen Schwung und schickt niemanden hungrig auf die Heimfahrt.<br>
<strong>Kosten:</strong> unterschiedlich, oft pro Person berechnet. Eine Version vom Caterer (Suppe, belegte Brötchen) ist viel günstiger.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> wenn spät gefeiert wird.</p>

<h3>29. Party-Accessoires</h3>
<p><strong>Das Prinzip:</strong> Knicklichter, Brillen, Hüte oder Fächer, die zu einem bestimmten Moment verteilt werden (oft, wenn der DJ zu den großen Hits wechselt). Sofortige Wirkung auf die Stimmung und auf die Fotos.<br>
<strong>Kosten:</strong> unter 50 € für rund hundert Gäste.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> ausgelassene Feiern.</p>

<h3>30. Kaltfunken und Feuerwerk</h3>
<p><strong>Das Prinzip:</strong> Kaltfunkenfontänen rund um die Tanzfläche für den Hochzeitstanz, oder ein echtes Feuerwerk von einem Pyrotechniker.<br>
<strong>Kosten:</strong> einige Hundert Euro für die Fontänen, oft 1.000 € und mehr für ein Feuerwerk vom Profi.<br>
<strong>Aufwand:</strong> hoch beim Feuerwerk: Zustimmung der Location, Genehmigung oder Anzeige beim Ordnungsamt (außerhalb von Silvester ist privates Feuerwerk genehmigungspflichtig), und im Sommer kann Waldbrandgefahr alles kurzfristig verhindern.<br>
<strong>Für welche Hochzeit:</strong> große Hochzeiten auf einem Gut, mit Platz und weit entfernten Nachbarn.</p>

<h3>31. Die ruhige Ecke</h3>
<p><strong>Das Prinzip:</strong> eine Lounge abseits der Tanzfläche mit Sofas, Gesellschaftsspielen, Tee und gedämpftem Licht. Großeltern, Nicht-Tänzer und alle, die einfach reden wollen, finden dort ihren Platz.<br>
<strong>Kosten:</strong> 0 bis 100 €.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle, vor allem mit mehreren Generationen.</p>

<h3>32. Der Tanz Ihrer Wurzeln</h3>
<p><strong>Das Prinzip:</strong> ein traditioneller Tanz aus einer der beiden Familien (Halay, Sirtaki, Hora, Polonaise, schottischer Ceilidh), angeführt von denen, die ihn kennen. Die anderen lernen ihn direkt mit.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> Hochzeiten, die zwei Kulturen zusammenbringen. Oft der Moment, von dem am nächsten Tag alle reden.</p>

<h2>Am Tag danach: 4 Ideen zum Verlängern</h2>
<p>Ein Katerfrühstück, Brunch oder Grillen am Tag nach der Hochzeit wird immer beliebter. Die Stimmung ist entspannt, die Gäste sind müde: Große Show braucht es nicht.</p>

<h3>33. Brunch mit Präsentation der Fotos</h3>
<p><strong>Das Prinzip:</strong> Wenn Ihre Gäste mit einer Einwegkamera fotografiert haben (aus Pappe oder auf dem Handy), ist der Brunch der perfekte Moment, die Bilder gemeinsam anzuschauen, an eine Wand projiziert oder auf den Handys. Der ganze Abend zieht vorbei, aus der Sicht jedes Einzelnen.<br>
<strong>Kosten:</strong> keine, wenn das Album schon geplant ist.<br>
<strong>Aufwand:</strong> gering. Wie Sie diesen Moment gestalten, erklären wir in <a href="/journal/revelation-photos-lendemain-mariage">der Fotopräsentation am Tag nach der Hochzeit</a>.<br>
<strong>Für welche Hochzeit:</strong> alle mit einem Treffen am Tag danach.</p>

<h3>34. Das Turnier am Tag danach</h3>
<p><strong>Das Prinzip:</strong> Boule, Kubb, Fußball oder Volleyball, in ausgelosten Teams. Die Rasenspiele vom Sektempfang kommen wieder zum Einsatz.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> ländliche Hochzeiten mit großer Wiese.</p>

<h3>35. Baden oder Spazieren</h3>
<p><strong>Das Prinzip:</strong> der Pool des Guts, ein See in der Nähe, ein Spaziergang zu einem Aussichtspunkt. Nichts zu organisieren, außer den Gästen zu sagen, dass sie Badesachen einpacken sollen.<br>
<strong>Kosten:</strong> keine.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> im Sommer, mit Übernachtung vor Ort.</p>

<h3>36. Der Dank im kleinen Kreis</h3>
<p><strong>Das Prinzip:</strong> In Ruhe überreichen Sie den Trauzeugen, den Eltern und allen, die geholfen haben, ein Geschenk. Ohne Mikrofon und vollen Saal ist das oft herzlicher als beim Essen.<br>
<strong>Kosten:</strong> die der Geschenke.<br>
<strong>Aufwand:</strong> gering.<br>
<strong>Für welche Hochzeit:</strong> alle.</p>

<h2>Alle 36 Ideen in einer Tabelle</h2>
<table>
<thead><tr><th>Idee</th><th>Moment</th><th>Budget</th><th>Aufwand</th></tr></thead>
<tbody>
<tr><td>Worte der Liebsten</td><td>Trauung</td><td>Kostenlos</td><td>Mittel</td></tr>
<tr><td>Symbolisches Ritual</td><td>Trauung</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Live-Musik</td><td>Trauung</td><td>Kostenlos bis über 300 €</td><td>Mittel</td></tr>
<tr><td>Programmheft, das beschäftigt</td><td>Trauung</td><td>Unter 100 €</td><td>Mittel</td></tr>
<tr><td>Auszug unter Blütenblättern</td><td>Trauung</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Digitale Einwegkamera auf den Handys</td><td>Sektempfang und Party</td><td>Kostenlos bis unter 100 €</td><td>Gering</td></tr>
<tr><td>Rasenspiele</td><td>Sektempfang</td><td>Kostenlos bis unter 150 €</td><td>Gering</td></tr>
<tr><td>Musiker als Walking Act</td><td>Sektempfang</td><td>Über 300 €</td><td>Mittel</td></tr>
<tr><td>Close-up-Zauberer</td><td>Sektempfang</td><td>Über 400 €</td><td>Gering</td></tr>
<tr><td>Karikaturist</td><td>Sektempfang</td><td>Einige Hundert Euro</td><td>Gering</td></tr>
<tr><td>Genussstation</td><td>Sektempfang</td><td>Unterschiedlich</td><td>Gering</td></tr>
<tr><td>Großes Gruppenfoto</td><td>Sektempfang</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Audio-Gästebuch</td><td>Sektempfang</td><td>Unter 100 € bis 300 €</td><td>Gering</td></tr>
<tr><td>Kinderecke</td><td>Sektempfang und Party</td><td>Kostenlos bis einige Hundert Euro</td><td>Mittel</td></tr>
<tr><td>Cocktailbar mit Barkeeper</td><td>Sektempfang</td><td>Über 300 €</td><td>Mittel</td></tr>
<tr><td>Sitzordnung mit Geschichte</td><td>Essen</td><td>Kostenlos</td><td>Mittel</td></tr>
<tr><td>Brautpaar-Quiz</td><td>Essen</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Reden mit Zeitlimit</td><td>Essen</td><td>Kostenlos</td><td>Mittel</td></tr>
<tr><td>Diashow oder Video</td><td>Essen</td><td>Kostenlos</td><td>Mittel bis hoch</td></tr>
<tr><td>Umschläge auf den Tischen</td><td>Essen</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Platzwechsel zum Dessert</td><td>Essen</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Dessert als Show</td><td>Essen</td><td>Unterschiedlich</td><td>Gering</td></tr>
<tr><td>Briefe für später</td><td>Essen</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Hochzeitstanz mit allen</td><td>Party</td><td>Kostenlos</td><td>Gering bis hoch</td></tr>
<tr><td>Musikquiz</td><td>Party</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Karaoke</td><td>Party</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Fotobox</td><td>Party</td><td>Über 300 €</td><td>Gering</td></tr>
<tr><td>Mitternachtssnack</td><td>Party</td><td>Unterschiedlich</td><td>Gering</td></tr>
<tr><td>Party-Accessoires</td><td>Party</td><td>Unter 100 €</td><td>Gering</td></tr>
<tr><td>Kaltfunken und Feuerwerk</td><td>Party</td><td>Über 300 €</td><td>Hoch</td></tr>
<tr><td>Ruhige Ecke</td><td>Party</td><td>Kostenlos bis unter 100 €</td><td>Gering</td></tr>
<tr><td>Tanz Ihrer Wurzeln</td><td>Party</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Brunch und Präsentation der Fotos</td><td>Tag danach</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Turnier am Tag danach</td><td>Tag danach</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Baden oder Spazieren</td><td>Tag danach</td><td>Kostenlos</td><td>Gering</td></tr>
<tr><td>Dank im kleinen Kreis</td><td>Tag danach</td><td>Preis der Geschenke</td><td>Gering</td></tr>
</tbody>
</table>
<p>Die Preise sind Größenordnungen, die wir 2026 bei Dienstleistern erhoben haben. Sie schwanken stark je nach Region, Saison und Dauer: Fragen Sie immer nach einem Angebot.</p>

<h2>Der Rhythmus: Wo Sie die Programmpunkte im Tagesablauf platzieren</h2>
<p>Ein Hochzeitstag hat seine Durchhänger, immer an denselben Stellen. Markieren Sie sie in Ihrem Ablauf und setzen Sie in jede Lücke einen Programmpunkt, statt alles auf den Abend zu konzentrieren.</p>
<h3>Die vier Leerlaufzeiten, die Sie füllen sollten</h3>
<ul>
<li><strong>Zwischen Trauung und Sektempfang.</strong> Der Weg, das Warten, während das Brautpaar unterschreibt oder Fotos macht. Ein Begrüßungsgetränk und Musik reichen oft.</li>
<li><strong>Während Ihres Paarshootings.</strong> Sie sind mitten im Sektempfang 30 bis 45 Minuten weg. Der Moment für Rasenspiele, den Zauberer, den QR-Code der Einwegkamera: Die Gäste fotografieren sich gegenseitig, während Sie fort sind.</li>
<li><strong>Zwischen dem Platznehmen und der Vorspeise.</strong> Oft eine Viertelstunde, die in der Luft hängt: Die Sitzordnung mit Geschichte und die Umschläge füllen diese Zeit ganz von selbst.</li>
<li><strong>Zwischen Dessert und Hochzeitstanz.</strong> Der Caterer räumt ab, der DJ baut auf, der Saal leert sich Richtung Raucherecke. Das Dessert als Show oder ein Musikquiz zum Aufwärmen schlagen die Brücke.</li>
</ul>
<h3>Nicht alles stapeln</h3>
<p>Die Versuchung ist groß, „noch eine Idee“ hinzuzufügen. Stellen Sie sich bei jedem Programmpunkt eine einzige Frage: <strong>Füllt er eine Leerlaufzeit, oder unterbricht er einen schönen Moment?</strong> Ein Quiz mitten in einer lachenden Tischrunde, ein Sketch, während die Tanzfläche voll ist, eine Rede genau dann, wenn der Hauptgang kommt: Das sind die Programmpunkte, die die Stimmung kippen lassen.</p>
<p>In der Praxis sieht ein gutes Gleichgewicht so aus: ein oder zwei Elemente bei der Trauung, zwei Programmpunkte, die beim Sektempfang von allein laufen, zwei oder drei Höhepunkte beim Essen, und am Abend eine einzige Überraschung. Der Rest ist Musik und Gespräch.</p>
<h3>Sagen Sie es den Dienstleistern</h3>
<p>Jeder Programmpunkt, der das Essen betrifft, muss dem Caterer bekannt sein, jeder am Abend dem DJ. Tragen Sie sie in Ihren <a href="/journal/deroule-jour-j-mariage">Ablauf des Hochzeitstages</a> ein, mit Uhrzeit, Dauer und verantwortlicher Person. Und prüfen Sie vor der Unterschrift, ob Ihre Location sie erlaubt (Feuer, Kerzen, Musik im Freien): Das gehört zu den <a href="/journal/questions-lieu-reception-mariage">Fragen an die Hochzeitslocation</a>.</p>

<h2>Drei Pläne nach Budget</h2>
<h3>Für 0 Euro</h3>
<p>Worte der Liebsten bei der Trauung, geliehene Rasenspiele und das große Gruppenfoto beim Sektempfang, die Sitzordnung mit Geschichte und das Quiz beim Essen, der Hochzeitstanz mit allen und der Tanz Ihrer Wurzeln am Abend, das Turnier am Tag danach. Nichts davon kostet einen Cent, und es ist schon ein sehr lebendiger Tag.</p>
<h3>Unter 100 €</h3>
<p>Der vorige Plan, dazu Blütenblätter für den Auszug, Umschläge mit Aufgaben auf den Tischen, Knicklichter für die Tanzfläche und eine digitale Einwegkamera für rund fünfzig Gäste (14,99 € mit Time to Flash). Obendrein bekommen Sie Hunderte Fotos vom Tag, aufgenommen von Ihren Gästen.</p>
<h3>Über 100 €</h3>
<p>Wählen Sie <strong>einen einzigen</strong> Programmpunkt mit Dienstleister und setzen Sie ihn in die größte Lücke: einen Zauberer oder Musiker während Ihres Paarshootings beim Sektempfang, oder einen Mitternachtssnack, der den Abend neu belebt. Ein gut platzierter Programmpunkt ist besser als drei, die sich gegenseitig auf die Füße treten.</p>

<h2>Was Sie lieber lassen</h2>
<ul>
<li><strong>Himmelslaternen.</strong> Ihr Start ist in Deutschland in praktisch allen Bundesländern verboten, wegen der Brandgefahr. Auch Luftballon-Starts sind vielerorts untersagt oder genehmigungspflichtig.</li>
<li><strong>Spiele, bei denen sich jemand unwohl fühlt.</strong> Strumpfbandversteigerung, peinliche Pfänder, Quizfragen über Ex-Partner, eine Brautentführung, die das Paar nicht möchte: Wenn Sie zögern, ist die Antwort nein. Sagen Sie es den Trauzeugen rechtzeitig.</li>
<li><strong>Zu lange Programmpunkte.</strong> Nach fünfzehn Minuten ermüdet selbst die beste Idee.</li>
<li><strong>Alles, was vom Handynetz abhängt, ohne dass Sie es getestet haben.</strong> Wenn Ihr Programmpunkt über die Handys läuft, prüfen Sie den Empfang vor Ort. Die Lösungen, wenn es kein Netz gibt: <a href="/journal/pas-de-reseau-salle-mariage">kein Netz im Saal</a>.</li>
</ul>
<p>Für die Einwegkamera aus Idee 6 ist alles in wenigen Minuten vorbereitet: <a href="/create">Album anlegen</a>, QR-Code drucken, und Ihre Gäste erzählen Ihren Tag.</p>
`,
    faq: [
      {
        q: 'Welche originelle Unterhaltung passt zu einer Hochzeit?',
        a: 'Wählen Sie nach Tagesabschnitt: ein symbolisches Ritual bei der Trauung, Rasenspiele oder eine digitale Einwegkamera beim Sektempfang, ein Brautpaar-Quiz beim Essen, ein traditioneller Tanz oder ein Musikquiz am Abend. Originell wird es vor allem durch den Bezug zu Ihrer Geschichte, weniger durch den Preis.',
      },
      {
        q: 'Wie unterhält man die Gäste beim Sektempfang?',
        a: 'Der Sektempfang ist lang, und Sie sind für das Paarshooting weg: Planen Sie Programmpunkte, die ohne Sie laufen. Rasenspiele, ein Musiker als Walking Act, ein Close-up-Zauberer oder der QR-Code einer Einwegkamera auf den Tischen geben den Gästen einen Vorwand, ins Gespräch zu kommen.',
      },
      {
        q: 'Welche Hochzeitsspiele und Programmpunkte kosten nichts?',
        a: 'Worte der Liebsten bei der Trauung, das große Gruppenfoto, das Brautpaar-Quiz und das Schuhspiel, die Sitzordnung mit Geschichte, der Platzwechsel zum Dessert, der Hochzeitstanz mit allen, das Musikquiz mit dem DJ und das Turnier am Tag danach kosten nichts. Es braucht nur jeweils eine verantwortliche Person.',
      },
      {
        q: 'Wie viele Programmpunkte sollte man bei einer Hochzeit planen?',
        a: 'Ein oder zwei Elemente bei der Trauung, zwei Programmpunkte beim Sektempfang, die von allein laufen, zwei oder drei Höhepunkte beim Essen und eine Überraschung am Abend reichen. Mehr davon tritt sich gegenseitig auf die Füße und unterbricht die Gespräche, die das Herz des Tages bleiben.',
      },
      {
        q: 'Wie beschäftigt man die Gäste während des Paarshootings?',
        a: 'Das ist die größte Leerlaufzeit des Tages, oft 30 bis 45 Minuten. Starten Sie genau dann Rasenspiele, Musiker oder Zauberer, und laden Sie die Gäste ein, den QR-Code der Einwegkamera zu scannen: Sie fotografieren sich gegenseitig, während Sie weg sind.',
      },
      {
        q: 'Sind Himmelslaternen bei einer Hochzeit erlaubt?',
        a: 'In Deutschland ist der Start von Himmelslaternen in praktisch allen Bundesländern verboten, wegen der Brandgefahr. Auch Luftballon-Starts sind vielerorts untersagt oder genehmigungspflichtig. Fragen Sie im Zweifel beim Ordnungsamt und bei der Location nach, oder wählen Sie eine Alternative wie Kaltfunkenfontänen.',
      },
    ],
  },

  // DE : « Hochzeitslocation Checkliste », « Fragen an die Hochzeitslocation »,
  // « Hochzeitslocation besichtigen ». Vu dans Google.de (10/10/2026) :
  // Bridebook DE (10 Fragen, 21 Fragen, Guide Besichtigung), eventlocations.com,
  // podcasts : listes brutes. Adapté à l’Allemagne : GEMA au lieu de la Sacem,
  // Korkgeld et Tortengeld, Nachtruhe à 22 h dehors, Anzahlung et
  // Stornostaffel au lieu de arrhes/acompte (prudence : § 309 Nr. 5 BGB sur
  // les forfaits en CGV, renvoi à la Verbraucherzentrale), Haftpflicht et
  // Mietsachschäden, Übernachtungssteuer au lieu de la taxe de séjour.
  'questions-lieu-reception-mariage': {
    title: 'Hochzeitslocation Checkliste: die Fragen für Ihre Besichtigung',
    excerpt: 'Die wichtigsten Fragen an die Hochzeitslocation, Thema für Thema: was hinter jeder Antwort steckt, die typischen Fallen und eine Checkliste zum Ausdrucken.',
    caption: 'Ein Paar besichtigt mit einem Notizbuch in der Hand einen leeren Festsaal',
    body: `
<p>Die Location ist oft die größte Ausgabe der Hochzeit und die erste Unterschrift. Ist die Anzahlung einmal geleistet, wird ein Rückzieher teuer. Hier sind <strong>die Fragen an die Hochzeitslocation</strong>, nach Themen sortiert, jeweils mit dem Grund, warum sie zählt, und der Falle, die sie verhindert. Am Ende finden Sie eine Hochzeitslocation Checkliste zum Ausdrucken und Mitnehmen zur Besichtigung.</p>
<p>Ein Rat vorab: Besichtigen Sie die Location, wenn möglich, <strong>zur selben Jahreszeit und zur selben Uhrzeit</strong> wie Ihre Hochzeit. Ein Saal, der im Juni um 15 Uhr in der Sonne liegt, wirkt im Oktober um 23 Uhr ganz anders.</p>

<h2>Die richtige Hochzeitslocation finden: die Methode</h2>
<ul>
<li><strong>Bereiten Sie Ihre Zahlen vor der Besichtigung vor</strong>: Gästezahl (Erwachsene und Kinder), Höchstbudget, zwei oder drei mögliche Termine.</li>
<li><strong>Kommen Sie zu zweit oder mit einer Vertrauensperson.</strong> Einer stellt die Fragen, der andere notiert und fotografiert.</li>
<li><strong>Lassen Sie sich wichtige Antworten schriftlich geben.</strong> Was nicht im Vertrag steht, gibt es nicht.</li>
<li><strong>Fragen Sie nach einem Mustervertrag</strong> und lesen Sie ihn in Ruhe zu Hause, nicht vor Ort.</li>
</ul>

<h2>1. Kapazität und Räume</h2>
<ul>
<li><strong>Wie viele Personen beim gesetzten Essen, und wie viele bei einem Stehempfang?</strong> Die beiden Zahlen sind sehr unterschiedlich. Ein Saal „für 200 Personen“ ist das oft nur stehend.</li>
<li><strong>Wie viele mit Tanzfläche und DJ-Pult?</strong> Tanzfläche und Technik nehmen schnell den Platz mehrerer Tische ein.</li>
<li><strong>Welche Höchstzahl ist zugelassen?</strong> Ein Veranstaltungsort hat eine aus Sicherheitsgründen festgelegte Obergrenze. Wer sie überschreitet, hat im Schadensfall ein Versicherungsproblem.</li>
<li><strong>Gibt es getrennte Bereiche</strong> für eine freie Trauung, den Sektempfang, das Essen, eine Kinderecke, eine ruhige Lounge?</li>
<li><strong>Wird die Location exklusiv vermietet?</strong> Manche Güter richten zwei Feiern am selben Tag aus oder lassen ein Restaurant für andere Gäste geöffnet.</li>
</ul>
<p><strong>Warum das zählt:</strong> Ein zu voller Saal ist unbequem, ein zu großer wirkt leer. Verlangen Sie einen Plan mit der Tischanordnung, die Sie sich vorstellen (rund oder lange Tafeln), keine theoretische Kapazität.</p>

<h2>2. Der Schlechtwetterplan</h2>
<ul>
<li><strong>Wo finden Sektempfang und Trauung bei Regen statt?</strong> Besichtigen Sie diesen Raum genauso aufmerksam wie den Rest.</li>
<li><strong>Ist der Plan B inklusive, oder muss ein Zelt gemietet werden?</strong> Und zu welchem Preis?</li>
<li><strong>Bis wann muss man sich entscheiden?</strong> Am Vortag, am Morgen, zwei Stunden vorher?</li>
<li><strong>Lassen sich die Räume heizen oder kühlen</strong>, wenn das Wetter extrem ist?</li>
</ul>
<p><strong>Warum das zählt:</strong> Viele Locations werden über ihren Garten verkauft. Ist der Plan B eine Scheune ohne Charme oder ein zu kleiner Saal, dann müssen Sie ihn beurteilen, denn vielleicht verbringen Sie dort den ganzen Tag.</p>

<h2>3. Uhrzeiten und Ende der Feier</h2>
<ul>
<li><strong>Ab wann haben Sie Zugang</strong>, um die Deko aufzubauen? Ist der Vortag möglich, und zu welchem Preis?</li>
<li><strong>Wann muss die Musik aufhören</strong>, und wann müssen alle den Saal verlassen haben?</li>
<li><strong>Wird noch in der Nacht aufgeräumt</strong> oder am nächsten Morgen?</li>
<li><strong>Ist die Location am Tag danach verfügbar</strong> für einen Brunch oder ein Katerfrühstück?</li>
<li><strong>Kostet es extra, wenn es später wird?</strong> Manche berechnen jede zusätzliche Stunde.</li>
</ul>
<p><strong>Warum das zählt:</strong> Musikende um 1 Uhr nachts verändert den ganzen Abend. Wenn Sie von einer Party bis zum Morgengrauen träumen, ist das die erste Frage, noch vor der Besichtigung.</p>

<h2>4. Lautstärke und Nachbarn</h2>
<ul>
<li><strong>Hat der Saal einen Schallpegelbegrenzer?</strong> Das ist ein Gerät, das die Anlage abschaltet, wenn die Lautstärke einen Grenzwert überschreitet. Auf welchen Wert ist er eingestellt?</li>
<li><strong>Ist Musik im Freien erlaubt</strong>, und bis wann? In Deutschland gilt draußen vielerorts ab 22 Uhr Nachtruhe.</li>
<li><strong>Gibt es Nachbarn in der Nähe</strong>, und gab es schon Beschwerden?</li>
<li><strong>Müssen Türen und Fenster</strong> ab einer bestimmten Uhrzeit geschlossen bleiben?</li>
</ul>
<p><strong>Warum das zählt:</strong> Ein zu niedrig eingestellter Begrenzer schaltet bei jedem Refrain ab, den alle mitsingen. Lassen Sie Ihren DJ mit der Location sprechen, bevor Sie ihn buchen: Er kann einschätzen, ob das machbar ist.</p>

<h2>5. Vorgegebener oder freier Caterer</h2>
<ul>
<li><strong>Ist der Caterer vorgegeben</strong>, aus einer Liste zu wählen, oder völlig frei?</li>
<li><strong>Wenn der Caterer frei ist: Kostet ein externer Caterer extra?</strong></li>
<li><strong>Wie ist die Küche ausgestattet?</strong> Kühlraum, Öfen, Herd, Spülküche, genug Strom?</li>
<li><strong>Ist ein Probeessen vor der Unterschrift möglich</strong>, wenn der Caterer vorgegeben ist?</li>
<li><strong>Darf die Hochzeitstorte von einer anderen Konditorei kommen?</strong> Manche Caterer berechnen dafür ein „Tortengeld“ (auch Kuchengeld) pro Stück oder pauschal.</li>
</ul>
<p><strong>Warum das zählt:</strong> Der Caterer kostet oft so viel wie die Miete. Eine günstige Location mit einem teuren vorgegebenen Caterer ist keine günstige Location. Vergleichen Sie immer die Gesamtkosten pro Gast.</p>

<h2>6. Getränke und Korkgeld</h2>
<ul>
<li><strong>Dürfen Sie eigene Getränke mitbringen?</strong></li>
<li><strong>Gibt es ein Korkgeld</strong>, also einen Betrag für jede mitgebrachte und geöffnete Flasche? Pro Flasche oder pauschal?</li>
<li><strong>Gilt dasselbe für Wein, Sekt und Spirituosen?</strong> Gibt es eine Staffelung?</li>
<li><strong>Wer übernimmt den Service</strong> an der Bar, und bis wann?</li>
</ul>
<p><strong>Warum das zählt:</strong> Nicht jede Location verlangt Korkgeld, und die Beträge schwanken stark. Multipliziert mit der Zahl der Flaschen einer Hochzeit kann es die Ersparnis durch eigenen Wein zunichtemachen. Rechnen Sie nach, bevor Sie sich entscheiden.</p>

<h2>7. Inklusive Ausstattung</h2>
<ul>
<li><strong>Tische und Stühle</strong>: wie viele, welche Form, welche Größe? Sind die Stühle vorzeigbar oder braucht es Hussen?</li>
<li><strong>Tischwäsche, Geschirr, Gläser</strong>: inklusive oder zu mieten?</li>
<li><strong>Musikanlage, Mikrofon, Beamer, Leinwand</strong>: vorhanden und funktionsfähig?</li>
<li><strong>Licht</strong>: Lässt sich der Saal dimmen? Sind die Außenbereiche nachts beleuchtet?</li>
<li><strong>Heizung und Klimaanlage</strong>: inklusive oder extra berechnet?</li>
</ul>
<p><strong>Warum das zählt:</strong> Tische, Stühle, Tischwäsche und Geschirr für hundert Personen zu mieten, ist ein ernsthafter Budgetposten. Eine etwas teurere, aber voll ausgestattete Location ist am Ende manchmal günstiger.</p>

<h2>8. Übernachtung</h2>
<ul>
<li><strong>Wie viele Betten gibt es vor Ort</strong>, und zu welchem Preis?</li>
<li><strong>Müssen alle Zimmer</strong> der Location verpflichtend gemietet werden?</li>
<li><strong>Bis wann müssen die Zimmer</strong> am nächsten Tag geräumt sein?</li>
<li><strong>Welche Hotels oder Pensionen in der Nähe</strong> empfiehlt die Location?</li>
</ul>
<p><strong>Warum das zählt:</strong> Wer vor Ort übernachtet, setzt sich nach der Feier nicht ans Steuer. Das ist eine echte Sicherheitsfrage und ein enormer Komfort für Gäste, die von weit her kommen.</p>

<h2>9. Anfahrt und Parken</h2>
<ul>
<li><strong>Wie viele Parkplätze gibt es</strong>, und dürfen die Autos über Nacht stehen bleiben?</li>
<li><strong>Ist die Location mit dem Navi leicht zu finden?</strong> Ist der Weg nachts beleuchtet?</li>
<li><strong>Gibt es einen Bahnhof in der Nähe</strong>, und fahren spät am Abend noch Taxis?</li>
<li><strong>Ist ein Shuttle möglich</strong> oder von der Location schon organisiert?</li>
</ul>
<p><strong>Warum das zählt:</strong> Auf dem Land um 2 Uhr nachts ein Taxi zu finden, grenzt manchmal an ein Wunder. Ist die Heimfahrt kompliziert, planen Sie einen Shuttle oder Übernachtungen ein.</p>

<h2>10. Barrierefreiheit</h2>
<ul>
<li><strong>Ist die Location rollstuhlgerecht?</strong> Treppen, Rampen, Aufzug?</li>
<li><strong>Gibt es barrierefreie Toiletten?</strong></li>
<li><strong>Liegen die Bereiche nah beieinander</strong>, oder muss man weit über Kies oder Wiese laufen?</li>
</ul>
<p><strong>Warum das zählt:</strong> Ein Großelternteil, das nicht in den Speisesaal kommt: Das ist ein verdorbener Tag für ihn und für Sie. Denken Sie auch an Absätze auf Kopfsteinpflaster und an Kinderwagen.</p>

<h2>11. Handynetz und WLAN</h2>
<ul>
<li><strong>Gibt es im Saal Empfang?</strong> Verlassen Sie sich nicht auf die Antwort: Schalten Sie das WLAN Ihres Handys aus und testen Sie selbst, im Saal, nicht auf dem Parkplatz. Wenn möglich mit zwei verschiedenen Netzbetreibern.</li>
<li><strong>Gibt es ein WLAN für Gäste</strong>, das den ganzen Saal abdeckt und nicht nur den Empfang?</li>
<li><strong>Wie viele Geräte verkraftet es gleichzeitig</strong>, und wie lautet das Passwort?</li>
</ul>
<p><strong>Warum das zählt:</strong> Die schönsten Locations (Gewölbekeller, Scheunen aus Naturstein, Täler) haben oft den schlechtesten Empfang. Ohne Netz keine geteilten Fotos, kein Anruf für einen verirrten Gast, keine Kartenzahlung an der Bar. Es gibt Lösungen: Wir erklären sie in <a href="/journal/pas-de-reseau-salle-mariage">kein Netz im Saal, was tun</a> und in <a href="/journal/wifi-lieu-reception-mariage">das WLAN der Hochzeitslocation</a>.</p>

<h2>12. Erlaubte Programmpunkte und Deko</h2>
<ul>
<li><strong>Welche Programmpunkte sind erlaubt?</strong> Feuerwerk, Kaltfunken, Kerzen, Nebelmaschine, Konfetti, Reiswerfen?</li>
<li><strong>Darf Deko an Wänden, Balken oder Decke befestigt werden?</strong></li>
<li><strong>Gibt es Strom und Platz</strong> für eine Fotobox oder einen DJ?</li>
<li><strong>Dürfen Spiele im Freien</strong> aufgebaut werden, eine freie Trauung im Garten stattfinden?</li>
</ul>
<p><strong>Warum das zählt:</strong> Sie möchten nicht einen Monat vor der Hochzeit erfahren, dass Kerzen verboten sind oder das Feuerwerk nicht möglich ist. Wenn Sie noch überlegen, was Sie planen: Wir haben <a href="/journal/idees-animation-mariage">36 Ideen für Hochzeitsspiele und Unterhaltung</a> mit ihren Einschränkungen gesammelt.</p>

<h2>13. Vorgegebene Dienstleister und Ansprechpartner</h2>
<ul>
<li><strong>Gibt es vorgegebene Dienstleister</strong> oder eine verbindliche Partnerliste (DJ, Floristik, Fotograf, Möbelverleih)?</li>
<li><strong>Fallen Gebühren an</strong>, wenn Sie einen externen Dienstleister wählen?</li>
<li><strong>Wer ist am Hochzeitstag</strong> von der Location vor Ort, und bis wann? Wen rufen Sie bei Problemen an?</li>
<li><strong>Wer kümmert sich um die GEMA?</strong> Bei einer geschlossenen privaten Feier, bei der Sie die Gäste persönlich kennen, fallen in der Regel keine Gebühren an. Bei sehr großen oder halböffentlichen Feiern kann das anders sein: Klären Sie es mit DJ und Location.</li>
</ul>
<p><strong>Warum das zählt:</strong> Ein vorgegebener Dienstleister kann hervorragend sein, aber er muss vor der Unterschrift genannt werden, nicht danach auftauchen. Und am Hochzeitstag löst ein erreichbarer Verantwortlicher der Location in fünf Minuten, was Ihnen sonst eine Stunde verderben würde.</p>

<h2>14. Preis, Anzahlung und Zahlung</h2>
<ul>
<li><strong>Was ist im Preis genau enthalten?</strong> Reinigung, Strom, Heizung, Sicherheitsdienst, Übernachtungssteuer oder Kurtaxe?</li>
<li><strong>Ist der Preis bis zur Hochzeit garantiert</strong>, oder kann er angepasst werden, wenn Sie zwei Jahre im Voraus unterschreiben?</li>
<li><strong>Wie hoch ist die Anzahlung</strong> bei der Buchung, und wann sind die weiteren Zahlungen fällig?</li>
<li><strong>Was passiert mit der Anzahlung, wenn Sie stornieren?</strong></li>
</ul>
<p><strong>Warum das zählt:</strong> In Deutschland regelt vor allem der Vertrag, was bei einer Absage mit Ihrem Geld passiert. Üblich ist eine Stornostaffel: Je näher die Hochzeit, desto höher der Anteil, den Sie zahlen. Lesen Sie diese Klausel genau. Pauschale Stornogebühren in den AGB dürfen nicht unangemessen hoch sein, und Ihnen muss der Nachweis offenstehen, dass der tatsächliche Schaden der Location geringer ist. Im Zweifel hilft eine Beratung, zum Beispiel bei der Verbraucherzentrale.</p>

<h2>15. Stornierung und Verschiebung</h2>
<ul>
<li><strong>Was passiert, wenn Sie absagen</strong>, je nach Zeitpunkt der Absage?</li>
<li><strong>Ist eine Verschiebung möglich</strong>, und zu welchen Bedingungen?</li>
<li><strong>Was passiert, wenn die Location absagt</strong> (Verkauf, Umbau, Schaden)?</li>
<li><strong>Welche Fälle gelten im Vertrag als höhere Gewalt?</strong></li>
</ul>
<p><strong>Warum das zählt:</strong> Man unterschreibt oft mehr als ein Jahr im Voraus. In einem Jahr kann viel passieren. Ein Vertrag, der nur die Absage des Kunden regelt und nie die der Location, ist unausgewogen.</p>

<h2>16. Versicherung</h2>
<ul>
<li><strong>Verlangt die Location einen Nachweis über eine Haftpflichtversicherung?</strong> Prüfen Sie, ob Ihre private Haftpflicht eine Feier dieser Art abdeckt und ob Schäden an gemieteten Räumen (Mietsachschäden) eingeschlossen sind; sonst gibt es eine Veranstalterhaftpflicht für den Tag.</li>
<li><strong>Ist die Location selbst versichert</strong> für Unfälle auf ihrem Gelände?</li>
<li><strong>Brauchen Sie eine Hochzeitsversicherung?</strong> Es gibt spezielle Policen gegen Ausfall; vergleichen Sie, was sie wirklich abdecken (Krankheit, Unwetter, Ausfall eines Dienstleisters).</li>
</ul>
<p><strong>Warum das zählt:</strong> Ein Glas Rotwein auf einem antiken Sofa oder eine zerbrochene Scheibe können teuer werden. Besser, Sie wissen vorher, wer zahlt.</p>

<h2>17. Übergabe und Kaution</h2>
<ul>
<li><strong>Gibt es eine Abnahme bei Übergabe und Rückgabe</strong>, mit Protokoll? In Ihrer Anwesenheit?</li>
<li><strong>Wie hoch ist die Kaution</strong>, und wann wird sie zurückgezahlt?</li>
<li><strong>Ist die Endreinigung inklusive</strong>, oder müssen Sie den Saal sauber übergeben?</li>
<li><strong>Wer kümmert sich um den Müll</strong>, die Mülltrennung, das Leergut?</li>
<li><strong>Wird zerbrochenes Material</strong> pro Stück berechnet?</li>
</ul>
<p><strong>Warum das zählt:</strong> Die Kaution beträgt oft mehrere Hundert Euro, manchmal mehr. Machen Sie bei Ihrer Ankunft datierte Fotos vom Saal: Das ist Ihr bester Schutz bei Meinungsverschiedenheiten.</p>

<h2>Die typischen Fallen bei der Besichtigung einer Hochzeitslocation</h2>
<ul>
<li><strong>Der Preis „ab“.</strong> Er gilt oft für einen Wochentag außerhalb der Saison, ohne Reinigung und Heizung. Verlangen Sie ein Angebot für Ihr Datum und Ihre Gästezahl, alles inklusive.</li>
<li><strong>Die Stehkapazität als Sitzkapazität verkauft.</strong> Lassen Sie sich einen echten Tischplan zeigen.</li>
<li><strong>Der nie besichtigte Plan B.</strong> Der Garten ist herrlich, der Ausweichsaal viel weniger.</li>
<li><strong>Das Ende der Feier, zu spät entdeckt.</strong> Oder die Musik, die um 1 Uhr von einem Begrenzer abgeschaltet wird, von dem Ihnen niemand erzählt hat.</li>
<li><strong>Versteckte Kosten.</strong> Strom nach Verbrauch, verpflichtender Sicherheitsdienst, Korkgeld, Tortengeld, Gebühren für externe Caterer.</li>
<li><strong>Auschecken um 10 Uhr am nächsten Morgen.</strong> Mit Gästen, die um 5 Uhr ins Bett gegangen sind, wird das ein Wettlauf.</li>
<li><strong>Zu wenige Toiletten</strong> für die Zahl der Gäste, oder eine Sicherung, die rausfliegt, wenn Caterer und DJ alles gleichzeitig einstecken.</li>
<li><strong>Mündliche Zusagen.</strong> „Der Vortag ist kein Problem“, „Sie dürfen bestimmt länger feiern“: Was nicht schriftlich steht, verpflichtet niemanden.</li>
</ul>
<p>Fragen Sie auch nach Kontakten zu Paaren, die dort geheiratet haben, oder lesen Sie aktuelle Bewertungen. Und sobald die Location unterschrieben ist, wartet der Rest des Kalenders: Die <a href="/journal/retroplanning-mariage">Hochzeit Checkliste mit Zeitplan</a> hilft Ihnen, nichts zu vergessen.</p>

<h2>Die Checkliste zum Ausdrucken für Ihre Besichtigung</h2>
<p>Drucken Sie diese Liste aus, haken Sie während der Besichtigung ab und notieren Sie die Antworten am Rand.</p>
<ul>
<li>☐ Kapazität beim gesetzten Essen, mit Tanzfläche und DJ</li>
<li>☐ Kapazität beim Stehempfang und zugelassene Höchstzahl</li>
<li>☐ Getrennte Bereiche: Trauung, Sektempfang, Essen, Kinder</li>
<li>☐ Exklusive Vermietung</li>
<li>☐ Schlechtwetterplan besichtigt, inklusive oder kostenpflichtig, Entscheidungszeitpunkt</li>
<li>☐ Heizung und Klimaanlage</li>
<li>☐ Zugang zum Aufbauen, Vortag möglich</li>
<li>☐ Musikende und Uhrzeit, zu der der Saal verlassen werden muss</li>
<li>☐ Aufräumen nachts oder am nächsten Tag, Location für den Brunch verfügbar</li>
<li>☐ Schallpegelbegrenzer und eingestellter Wert, Musik im Freien bis wann</li>
<li>☐ Nachbarn in der Nähe, Vorgaben zu Türen und Fenstern</li>
<li>☐ Caterer vorgegeben, aus Liste oder frei, Gebühr für externen Caterer</li>
<li>☐ Ausstattung der Küche und Stromleistung</li>
<li>☐ Torte von einer anderen Konditorei, Tortengeld</li>
<li>☐ Eigene Getränke, Korkgeld und seine Höhe</li>
<li>☐ Tische, Stühle, Tischwäsche, Geschirr inklusive</li>
<li>☐ Musikanlage, Mikrofon, Beamer, Licht innen und außen</li>
<li>☐ Zahl der Betten, Preis, Auschecken am nächsten Tag</li>
<li>☐ Parkplätze, beleuchteter Weg, Taxis und Shuttles</li>
<li>☐ Rollstuhlgerechter Zugang und barrierefreie Toiletten</li>
<li>☐ Empfang im Saal mit zwei Netzbetreibern getestet</li>
<li>☐ Gäste-WLAN: Abdeckung, Zahl der Geräte, Passwort</li>
<li>☐ Erlaubte Programmpunkte: Feuerwerk, Kerzen, Konfetti, Nebel</li>
<li>☐ Deko an Wänden und Decke</li>
<li>☐ Vorgegebene Dienstleister und Gebühren für externe</li>
<li>☐ Ansprechpartner am Hochzeitstag und seine Nummer</li>
<li>☐ GEMA: wer kümmert sich</li>
<li>☐ Was im Preis enthalten ist, Preisgarantie bis zum Datum</li>
<li>☐ Anzahlung, Höhe und Zahlungsplan</li>
<li>☐ Storno- und Verschiebungsbedingungen, auf beiden Seiten</li>
<li>☐ Haftpflichtnachweis verlangt, Mietsachschäden abgedeckt</li>
<li>☐ Übergabeprotokoll bei Ankunft und Abreise, Höhe der Kaution</li>
<li>☐ Reinigung, Müll, Bruch berechnet</li>
<li>☐ Mustervertrag mitgenommen</li>
</ul>
<p>Eine letzte Idee für den Hochzeitstag: Wenn der Empfang im Saal gut ist, verwandelt eine <a href="/appareil-jetable-mariage">digitale Einwegkamera für alle</a> das Handy jedes Gastes in eine Kamera, mit einem QR-Code auf den Tischen und einem Album, das am nächsten Tag für alle sichtbar wird.</p>
`,
    faq: [
      {
        q: 'Welche Fragen sollte man bei der Besichtigung einer Hochzeitslocation stellen?',
        a: 'Die wichtigsten: Kapazität beim gesetzten Essen mit Tanzfläche, Schlechtwetterplan, Musikende, vorgegebener oder freier Caterer, Korkgeld, was im Preis enthalten ist sowie Anzahlung und Stornobedingungen. Ergänzen Sie Handyempfang, Übernachtung und Parkplätze, die oft vergessen werden.',
      },
      {
        q: 'Bekommt man die Anzahlung für die Hochzeitslocation bei einer Absage zurück?',
        a: 'Das hängt vor allem vom Vertrag ab. Üblich ist eine Stornostaffel, bei der der zu zahlende Anteil steigt, je näher die Hochzeit rückt. Pauschale Stornogebühren in AGB dürfen nicht unangemessen hoch sein, und Sie dürfen nachweisen, dass der tatsächliche Schaden geringer ist; im Zweifel hilft die Verbraucherzentrale.',
      },
      {
        q: 'Was ist Korkgeld bei einer Hochzeit?',
        a: 'Korkgeld ist ein Betrag, den Location oder Caterer für jede mitgebrachte und geöffnete Flasche berechnen, weil sie die Getränke dann nicht selbst verkaufen. Es kann pro Flasche oder pauschal berechnet werden, und nicht jede Location verlangt es. Rechnen Sie mit der geplanten Flaschenzahl nach, bevor Sie eigenen Wein mitbringen.',
      },
      {
        q: 'Wie früh sollte man die Hochzeitslocation buchen?',
        a: 'Für einen Samstag zwischen Mai und September sind die gefragtesten Locations oft mehr als ein Jahr im Voraus gebucht. Außerhalb der Saison oder unter der Woche reichen manchmal einige Monate. Die Location legt das Hochzeitsdatum fest: Sie ist die erste Buchung.',
      },
      {
        q: 'Was sollte man beim Handyempfang einer Hochzeitslocation prüfen?',
        a: 'Testen Sie den Empfang selbst im Saal, mit ausgeschaltetem WLAN, idealerweise mit zwei Netzbetreibern. Fragen Sie, ob ein Gäste-WLAN den ganzen Saal abdeckt und wie viele Geräte es verkraftet. Ohne Netz können die Gäste weder Fotos teilen noch ein Taxi rufen.',
      },
      {
        q: 'Braucht man eine Versicherung, um eine Hochzeitslocation zu mieten?',
        a: 'Viele Locations verlangen einen Nachweis über eine Haftpflichtversicherung. Prüfen Sie bei Ihrer Versicherung, ob die private Haftpflicht die Feier und Schäden an gemieteten Räumen abdeckt, sonst gibt es eine Veranstalterhaftpflicht für den Tag. Eine Hochzeitsversicherung gegen Ausfall ist freiwillig; vergleichen Sie genau, was sie abdeckt.',
      },
    ],
  },
}
