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

export const POSTS_DE = {}
