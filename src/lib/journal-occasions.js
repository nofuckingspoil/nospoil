// ============================================================
//  Journal : articles par occasion (anniversaire, entre amis, retraite).
//  Fusionnés dans journal.js. L'ancien article « album photo partagé
//  mariage » a été fondu dans partager-photos-mariage-invites (journal.js)
//  le 10/10/2026 et redirige vers lui (voir next.config.js).
// ============================================================

export const POSTS_OCCASIONS = [
  {
    // Vise « idée anniversaire 30 ans », « que faire pour ses 30 ans ».
    slug: 'idees-anniversaire-30-ans',
    cat: 'Anniversaire',
    title: 'Idée anniversaire 30 ans : 15 idées pour marquer le coup',
    excerpt: 'Idée anniversaire 30 ans : 15 idées concrètes de lieux, de thèmes, d’animations et de cadeaux collectifs pour fêter ses 30 ans sans se ruiner.',
    author: 'Camille Rouzaud',
    date: '2026-10-02',
    read: '7 min',
    caption: 'Des amis dansent sous les confettis à une soirée de 30 ans',
    image: '/journal/idees-anniversaire-30-ans.webp',
    body: `
<p>Trente ans, c’est l’anniversaire qu’on a envie de marquer sans en faire une montagne. Assez rond pour mériter une vraie fête, assez jeune pour qu’elle ressemble encore à une soirée entre amis. Voici 15 idées concrètes, classées par envie, pour organiser ses 30 ans ou ceux de quelqu’un d’autre.</p>

<h2>Le lieu : sortir du salon</h2>

<h3>1. Le gîte pour un week-end</h3>
<p>Une grande maison louée pour deux nuits, à une ou deux heures de route. Tout le monde partage les frais, chacun apporte un plat, et la fête dure deux jours au lieu de quatre heures. C’est souvent la formule la plus mémorable, et pas forcément la plus chère par personne.</p>

<h3>2. La salle privatisée d’un bar</h3>
<p>Beaucoup de bars prêtent une arrière-salle sans frais de location, en échange d’un minimum de consommation. Pas de ménage, pas de voisins, et la musique est déjà là.</p>

<h3>3. Le pique-nique géant</h3>
<p>Si ton anniversaire tombe entre mai et septembre : un parc, des nappes, une enceinte, des jeux de plein air. Simple, peu cher, et les amis avec enfants peuvent venir.</p>

<h3>4. La guinguette ou le bateau</h3>
<p>Une péniche ou une guinguette au bord de l’eau donne tout de suite un air de fête, sans décoration à prévoir. Réserve tôt : les beaux jours partent vite.</p>

<h2>Le thème : un fil conducteur</h2>

<h3>5. La soirée « année de naissance »</h3>
<p>Musique, déguisements et quiz sur l’année où tu es né. Les playlists se font toutes seules, et chacun a quelque chose à raconter sur les objets de son enfance.</p>

<h3>6. La soirée « dress code couleur »</h3>
<p>Tout le monde en blanc, en rouge ou en paillettes. C’est facile à suivre, ça ne coûte rien, et les photos de groupe sont spectaculaires.</p>

<h3>7. Le dîner « 30 plats »</h3>
<p>Chaque invité apporte un petit plat ou une bouchée qui lui rappelle un souvenir avec toi. On les goûte en écoutant l’histoire. Émotion garantie, et le buffet est réglé.</p>

<h2>L’animation : faire vivre la soirée</h2>

<h3>8. Le quiz sur la personne fêtée</h3>
<p>Vingt questions préparées en secret par les amis proches : son premier job, sa pire coupe de cheveux, le prénom de son premier chat. Fais des équipes, prévois un petit lot. Ça brise la glace entre les groupes d’amis qui ne se connaissent pas.</p>

<h3>9. Le blind test des 30 ans</h3>
<p>Une chanson par année, de ta naissance à aujourd’hui. Trente extraits, trente souvenirs, et une ambiance qui monte toute seule.</p>

<h3>10. Le karaoké</h3>
<p>Une enceinte, un micro, une appli de paroles sur la télé. Ou une salle de karaoké privatisée pour deux heures, avant d’aller danser.</p>

<h3>11. L’appareil photo jetable partagé</h3>
<p>Un QR code sur les tables : chaque invité le scanne et son téléphone devient un appareil photo jetable, avec un nombre de clichés compté et aucune photo visible avant la révélation. Le lendemain, à l’heure choisie, tout l’album apparaît d’un coup. C’est ce que fait <a href="/anniversaire-30-ans">Time to Flash pour un anniversaire de 30 ans</a> : rien à installer, et c’est 4,99 € pour 30 invités, en paiement unique. Le réveil du lendemain a tout de suite meilleure allure.</p>

<h3>12. L’escape game ou l’activité en équipe</h3>
<p>Pour lancer la journée avant la soirée : escape game, karting, atelier cocktails, cours de cuisine. Une activité commune crée des souvenirs et des blagues pour toute la soirée.</p>

<h2>Les cadeaux collectifs : une cagnotte bien pensée</h2>

<h3>13. L’expérience plutôt que l’objet</h3>
<p>Un saut en parachute, un week-end dans une ville rêvée, un cours de pilotage, un concert. À trente ans, on a souvent assez d’objets ; un souvenir à vivre fait plus d’effet.</p>

<h3>14. Le livre des 30 ans</h3>
<p>Chaque ami écrit une page : un souvenir, une photo, un vœu pour la décennie qui vient. Assemblé en livre, c’est le cadeau qu’on garde toute sa vie. Il faut s’y prendre un mois à l’avance pour collecter les textes.</p>

<h3>15. La lettre à ouvrir à 40 ans</h3>
<p>Chaque invité écrit un mot à glisser dans une boîte scellée, à ouvrir pour les 40 ans. C’est gratuit, c’est touchant, et ça donne déjà rendez-vous pour la prochaine fête.</p>

<h2>Organiser les 30 ans de quelqu’un d’autre</h2>
<p>Tu organises pour ton conjoint, ta sœur ou ton meilleur ami ? Quelques règles simples :</p>
<ul>
<li><strong>Renseigne-toi sans en avoir l’air</strong> : grande fête ou petit comité, danse ou dîner, surprise ou pas. Certaines personnes adorent les surprises, d’autres les détestent.</li>
<li><strong>Fais la liste avec un proche</strong> : il manque toujours quelqu’un d’important. Pense aux amis d’enfance, aux collègues proches, aux amis perdus de vue qu’il serait drôle de revoir.</li>
<li><strong>Répartis les rôles</strong> : un ami gère la musique, un autre le quiz, un autre la cagnotte. Tu gardes la coordination.</li>
<li><strong>Prévois le moment fort</strong> : l’entrée de la personne fêtée, le gâteau, le discours. Un seul moment bien préparé suffit à faire une soirée.</li>
</ul>

<h2>Garder un souvenir de la soirée</h2>
<p>C’est le piège classique des fêtes réussies : tout le monde a passé une excellente soirée, et le lendemain il n’y a presque pas de photos, ou elles sont éparpillées dans trente téléphones. Trois réflexes :</p>
<ul>
<li>désigne quelqu’un pour les photos de groupe, au début de la soirée, quand tout le monde est encore présentable ;</li>
<li>prévois un endroit où toutes les photos se retrouvent, un album partagé ou un appareil jetable partagé ;</li>
<li>fais imprimer quelques tirages et offre-les à la personne fêtée dans la semaine. Elle les gardera bien plus longtemps qu’un message.</li>
</ul>

<h2>Organiser ses 30 ans : le rétroplanning</h2>
<ul>
<li><strong>Deux mois avant</strong> : fixe la date, le budget et le lieu. Envoie un « save the date ».</li>
<li><strong>Un mois avant</strong> : invitations, choix du thème, réservation du traiteur ou organisation du buffet partagé.</li>
<li><strong>Deux semaines avant</strong> : playlist, quiz, animation, décoration.</li>
<li><strong>La veille</strong> : courses, rappel aux invités, batterie des enceintes.</li>
</ul>
<p>Si tu organises une surprise, désigne un complice pour occuper la personne fêtée et garde une seule conversation de groupe pour les invités, sans elle.</p>

<h2>Le bon dosage</h2>
<p>Pas besoin de cocher les quinze idées. Une bonne fête de 30 ans, c’est souvent un lieu sympa, un fil conducteur, une ou deux animations, et des souvenirs qui restent. Choisis ce qui ressemble à la personne fêtée. Pour d’autres idées selon l’âge et l’occasion, jette un œil à nos pages <a href="/anniversaire">anniversaire</a> et <a href="/occasions">toutes les occasions</a>.</p>
`,
    faq: [
      {
        q: 'Que faire pour ses 30 ans ?',
        a: 'Les formules qui marchent le mieux : un week-end dans un gîte avec ses amis proches, une soirée à thème dans une salle privatisée, ou un dîner suivi d’une soirée dansante. Ajoute une ou deux animations (quiz, blind test, appareil photo jetable partagé) pour que la soirée laisse des souvenirs.',
      },
      {
        q: 'Quelle animation pour un anniversaire de 30 ans ?',
        a: 'Le quiz sur la personne fêtée, le blind test d’une chanson par année, le karaoké et l’appareil photo jetable partagé sont des animations simples qui font participer tout le monde, même les invités qui ne se connaissent pas.',
      },
      {
        q: 'Quel cadeau collectif pour des 30 ans ?',
        a: 'Une expérience à vivre (voyage, concert, activité insolite) ou un livre où chaque ami écrit une page avec un souvenir et une photo. Les deux se financent facilement avec une cagnotte entre amis.',
      },
      {
        q: 'Quel budget prévoir pour une fête de 30 ans ?',
        a: 'Tout dépend du format. Un pique-nique ou une soirée à la maison avec un buffet partagé coûte très peu. Un gîte pour le week-end se partage entre tous les invités. Une salle privatisée de bar ne coûte souvent que les consommations. Fixe le budget avant de choisir le lieu.',
      },
    ],
  },
  {
    // Vise « idée pot de départ retraite », « organiser un pot de départ à la retraite ».
    slug: 'idees-pot-de-depart-retraite',
    cat: 'Retraite',
    title: 'Pot de départ à la retraite : idées, buffet et organisation',
    excerpt: 'Pot de départ à la retraite : le buffet (quantités par personne, budget), des animations originales, les discours, le cadeau collectif et le déroulé type.',
    author: 'Tom Bréval',
    date: '2026-10-01',
    updated: '2026-10-10',
    read: '10 min',
    caption: 'Des collègues lèvent leur verre pour une collègue qui part en retraite',
    image: '/journal/idees-pot-de-depart-retraite.webp',
    body: `
<p>Un départ à la retraite, ce n’est pas un pot comme les autres. C’est la fin de dizaines d’années de travail, parfois dans la même entreprise, et la personne qui part s’en souviendra longtemps. Bonne nouvelle : un pot réussi ne demande pas un gros budget, juste un peu d’organisation. Voici le mode d’emploi : l’organisation, le buffet (avec les quantités par personne), des animations originales, le cadeau collectif et les pièges à éviter.</p>

<h2>Organiser le pot de départ : les bases</h2>

<h3>La date</h3>
<p>Le plus simple : la dernière semaine de travail, un jeudi ou un vendredi en fin de journée. Vérifie d’abord avec la personne qui part, puis les congés des collègues proches. Pour un départ en juillet ou en décembre, avance d’une semaine : les équipes sont souvent incomplètes.</p>

<h3>Le lieu</h3>
<p>Trois options classiques :</p>
<ul>
<li><strong>Dans les locaux</strong> : salle de réunion, cafétéria, terrasse. Gratuit et pratique, tout le monde peut passer.</li>
<li><strong>Au restaurant ou dans un bar</strong> : plus festif, mais il faut réserver et prévoir le partage de la note.</li>
<li><strong>Chez la personne ou dans une salle louée</strong> : pour un pot qui mélange collègues, famille et amis, souvent un samedi.</li>
</ul>

<h3>Le budget</h3>
<p>Il vient en général de trois sources : un budget de l’entreprise ou du comité social, une cagnotte entre collègues, et parfois la participation de la personne qui part, qui « offre le pot ». Mets-toi d’accord dès le départ sur qui paie quoi : c’est la source de malentendus la plus fréquente.</p>

<h3>Les invités</h3>
<p>Pense large : l’équipe actuelle, mais aussi les anciens collègues partis ailleurs, les clients ou partenaires de longue date, et pourquoi pas le conjoint. Demande à la personne qui part une liste de « ceux qui comptent ». Envoie l’invitation au moins trois semaines avant.</p>

<h3>Le discours</h3>
<p>Prévois deux ou trois prises de parole, pas plus, et cinq minutes chacune au maximum. Le manager pour le parcours, un collègue proche pour les anecdotes, et la personne qui part pour le mot de la fin. Les meilleures anecdotes se collectent discrètement à l’avance auprès des collègues. Évite la liste des postes occupés : raconte plutôt deux ou trois histoires qui la résument.</p>

<h2>Le buffet du pot de départ à la retraite</h2>
<p>C’est souvent le poste qui inquiète le plus : peur de manquer, peur de trop jeter. Bonne nouvelle, les quantités se calculent assez simplement, à partir de deux questions : combien de temps dure le pot, et remplace-t-il un repas ?</p>

<h3>Quel format choisir</h3>
<ul>
<li><strong>Le pot apéritif</strong> (1 h à 1 h 30, en fin de journée) : quelques bouchées salées, un gâteau, des boissons. C’est le format le plus courant dans les locaux de l’entreprise.</li>
<li><strong>L’apéritif dînatoire</strong> (2 h et plus, à partir de 18 h 30) : il remplace le dîner, il faut donc des bouchées plus consistantes et en plus grand nombre.</li>
<li><strong>Le buffet repas</strong> (le midi, ou un samedi avec la famille) : entrées, plats froids ou chauds, fromage, dessert, comme un vrai repas.</li>
</ul>

<h3>Les quantités par personne</h3>
<p>Les repères ci-dessous sont ceux qu’utilisent couramment les traiteurs. Ajoute 10 % de marge si tu ne sais pas exactement combien de personnes passeront.</p>
<table>
<thead><tr><th>Format</th><th>Salé</th><th>Sucré</th><th>Boissons</th></tr></thead>
<tbody>
<tr><td>Pot apéritif (1 h à 1 h 30)</td><td>6 à 8 pièces</td><td>2 à 3 pièces, ou une part de gâteau</td><td>2 à 3 verres</td></tr>
<tr><td>Apéritif dînatoire (2 h et plus)</td><td>12 à 16 pièces</td><td>3 à 5 pièces</td><td>4 à 5 verres</td></tr>
<tr><td>Buffet repas</td><td>Une entrée, un plat, du fromage</td><td>Un dessert</td><td>4 à 5 verres</td></tr>
</tbody>
</table>
<p>Si tu fais toi-même les courses, quelques repères utiles pour un apéritif dînatoire : 50 à 80 g de charcuterie et autant de fromage par personne, une baguette pour quatre ou cinq personnes, une bonne poignée de crudités à tremper, et un demi-litre d’eau par personne. Pour les boissons, une bouteille de vin ou de crémant sert environ six verres : compte une bouteille pour deux à trois personnes sur la soirée, et autant de boissons sans alcool que de boissons alcoolisées.</p>

<h3>Les boissons</h3>
<ul>
<li><strong>Le verre du discours</strong> : un crémant ou un champagne pour trinquer au moment des discours, c’est le geste qui marque le coup.</li>
<li><strong>Les boissons sans alcool</strong> : jus, eaux pétillantes, une citronnade maison. Une bonne partie des invités conduit, ou ne boit pas : prévois-en largement.</li>
<li><strong>Dans les locaux de l’entreprise</strong>, le Code du travail n’autorise que le vin, la bière, le cidre et le poiré, et ton règlement intérieur peut être plus strict. Vérifie avec les ressources humaines avant de prévoir un cocktail.</li>
<li><strong>Le café</strong> en fin de pot, surtout s’il a lieu le midi.</li>
</ul>

<h3>Le budget du buffet</h3>
<p>À titre indicatif, et selon ta région :</p>
<ul>
<li><strong>Buffet fait maison</strong> ou participatif : environ 5 à 10&nbsp;€ par personne, boissons comprises.</li>
<li><strong>Buffet mixte</strong> (quelques pièces de traiteur, le reste acheté ou préparé) : environ 10 à 15&nbsp;€ par personne.</li>
<li><strong>Traiteur complet</strong>, avec service : souvent 20 à 35&nbsp;€ par personne et plus pour un apéritif dînatoire.</li>
</ul>
<p>Demande toujours deux ou trois devis, et pose les questions qui fâchent : le service est-il compris, la vaisselle, la livraison, le ramassage ?</p>

<h3>Fait maison, traiteur ou participatif ?</h3>
<ul>
<li><strong>Le buffet participatif</strong> : chaque collègue apporte quelque chose. C’est convivial et presque gratuit, à une condition : un tableau partagé où chacun inscrit ce qu’il apporte (salé, sucré, boissons), sinon tu te retrouves avec douze quiches et aucun dessert.</li>
<li><strong>Le traiteur</strong> : zéro stress, une présentation soignée, mais un budget plus élevé. Idéal au-delà de cinquante personnes.</li>
<li><strong>Le mixte</strong> : les pièces salées chez le traiteur, le gâteau chez le boulanger ou le pâtissier, les boissons au supermarché. C’est souvent le meilleur compromis.</li>
</ul>

<h3>Des idées de buffet</h3>
<p><strong>Côté salé :</strong> mini-quiches, cakes salés coupés en dés, verrines (houmous, guacamole, tzatziki), wraps roulés et tranchés, brochettes tomate cerise et mozzarella, gougères, mini-burgers, un plateau de charcuterie et de fromages, des crudités avec deux ou trois sauces.</p>
<p><strong>Côté sucré :</strong> mignardises, brochettes de fruits, cookies, mini-tartelettes, et surtout <strong>le gâteau</strong>, avec un message ou une photo de la personne qui part.</p>
<p><strong>La touche personnelle :</strong> les plats préférés de la personne fêtée, une spécialité de sa région d’origine, ou un buffet qui annonce sa retraite : un tour du monde en bouchées si elle rêve de voyager, un buffet du potager si elle va enfin cultiver son jardin.</p>
<p>Dernier conseil : pense aux régimes particuliers (végétarien, sans gluten, sans porc) et étiquette les plats. Personne n’aime deviner ce qu’il y a dans une verrine.</p>

<h2>Idées d’animation pour un pot de départ</h2>
<h3>Les classiques qui marchent toujours</h3>
<ul>
<li><strong>Le diaporama des années</strong> : photos d’équipe, séminaires, fêtes de fin d’année. Demande des photos aux collègues un mois avant. Les vieilles photos font toujours rire.</li>
<li><strong>Le quiz sur la carrière</strong> : en quelle année est-elle arrivée ? Quel était son premier bureau ? Quel logiciel a-t-elle maudit le plus ? Par équipes, avec un lot symbolique.</li>
<li><strong>Le livre d’or</strong> : un beau carnet qui circule pendant le pot, pour que chacun écrive un mot. Pour les collègues absents ou en télétravail, collecte les messages à l’avance et colle-les dedans.</li>
<li><strong>La vidéo surprise</strong> : quelques messages filmés par des anciens collègues, la famille, ou même un client fidèle.</li>
</ul>

<h3>Des animations originales pour un départ en retraite</h3>
<ul>
<li><strong>L’appareil photo jetable partagé</strong> : un QR code sur les tables, chaque invité le scanne avec son téléphone et prend quelques clichés, sans les voir. Le lendemain, toutes les photos apparaissent d’un coup dans un album privé que la personne fêtée peut garder. C’est ce que propose <a href="/depart-retraite">Time to Flash pour un départ en retraite</a>, sans application à installer, et c’est 14,99&nbsp;€ pour 50 invités.</li>
<li><strong>Le livre d’or audio</strong> : chaque invité enregistre un petit message vocal, signé d’un selfie, depuis son téléphone. Les organisateurs les écoutent et peuvent les faire découvrir à la personne qui part. Chez Time to Flash, c’est une option à 9,99&nbsp;€, qui s’ajoute à n’importe quelle formule payante.</li>
<li><strong>Le diplôme du jeune retraité</strong> : un faux diplôme solennel, remis avec un « kit de survie » (un réveil cassé, un agenda vide, un chapeau de jardinier, une carte de pêche). Effet garanti au moment des discours.</li>
<li><strong>La une de journal</strong> : une fausse page de quotidien qui raconte sa carrière, avec gros titre, photos d’archives et « témoignages » de collègues. Elle se lit pendant le pot et s’encadre ensuite.</li>
<li><strong>La carte des envies</strong> : une grande carte du monde (ou de France) où chacun épingle un endroit à visiter, avec un mot. La personne repart avec son programme de retraite.</li>
<li><strong>La boîte à conseils</strong> : chaque invité écrit sur une carte un conseil pour bien vivre sa retraite, sérieux ou non. On en lit quelques-uns à voix haute, et la boîte part avec la personne fêtée.</li>
<li><strong>Le blind test de sa carrière</strong> : les tubes de l’année de son arrivée, puis ceux de chaque décennie passée dans l’entreprise. Par équipes, avec un buzzer.</li>
<li><strong>Le « bingo des expressions »</strong> : une grille avec les phrases fétiches de la personne qui part. On coche pendant les discours.</li>
</ul>
<p>Une ou deux animations suffisent : le cœur du pot reste les discours et les moments où chacun vient dire un mot à la personne qui part.</p>

<h2>Le cadeau collectif de départ en retraite</h2>
<p>La cagnotte est la règle. Lance-la un mois avant, avec un message clair et sans montant imposé : chacun donne ce qu’il veut, et personne ne doit se sentir obligé. Quelques idées selon la personne :</p>
<ul>
<li><strong>Le projet de retraite</strong> : la personne rêve de voyager, de jardiner, de peindre, de se mettre au vélo ? Finance le premier pas : un bon de voyage, du matériel, un stage.</li>
<li><strong>L’expérience</strong> : un week-end, un vol en montgolfière, un dîner dans un grand restaurant, des places de concert.</li>
<li><strong>Le souvenir de l’équipe</strong> : un livre avec un message et une photo de chaque collègue. C’est souvent le cadeau qu’on garde le plus longtemps.</li>
<li><strong>L’album photo de la fête</strong> : les photos prises par tout le monde pendant le pot, rassemblées dans un album. Avec Time to Flash, tu peux commander des tirages papier directement depuis l’album, et les offrir quelques jours après en souvenir.</li>
</ul>
<p>Une bonne combinaison : un cadeau tourné vers l’avenir (le projet de retraite), et un souvenir tourné vers le passé (le livre ou l’album).</p>

<h2>Le déroulé type d’un pot de départ</h2>
<p>Pour un pot en fin de journée, d’environ deux heures, voici un déroulé qui fonctionne :</p>
<ol>
<li><strong>L’accueil (30 minutes)</strong> : boissons, buffet, livre d’or qui circule, QR code de l’appareil photo sur les tables. Les invités arrivent au fil de l’eau, laisse-leur le temps.</li>
<li><strong>Les discours (15 minutes)</strong> : quand la majorité est là, pas trop tard pour que personne ne soit déjà parti. Le manager, un collègue proche, puis la personne fêtée.</li>
<li><strong>Le cadeau (5 minutes)</strong> : remis juste après les discours, devant tout le monde. Prévois quelqu’un pour prendre la photo.</li>
<li><strong>L’animation (20 à 30 minutes)</strong> : diaporama, quiz ou vidéo surprise. Une seule suffit.</li>
<li><strong>La fin libre</strong> : chacun vient dire un mot à la personne qui part. C’est souvent le moment qu’elle préfère.</li>
</ol>
<p>Pour une fête plus longue, le samedi avec la famille, garde le même ordre et ajoute un repas et un peu de musique.</p>

<h2>Les pièges à éviter</h2>
<ul>
<li><strong>Organiser sans demander</strong> : certaines personnes détestent être au centre de l’attention. Demande-lui ce qu’elle souhaite, quitte à garder une surprise pour une partie.</li>
<li><strong>Les discours trop longs</strong> : au-delà de cinq minutes, l’attention baisse. Trois discours courts valent mieux qu’un long.</li>
<li><strong>Les blagues qui piquent</strong> : une anecdote drôle, oui. Une allusion à un conflit ou à la santé, non. En cas de doute, ne la raconte pas.</li>
<li><strong>Oublier les absents</strong> : les collègues en télétravail, sur un autre site ou déjà partis aimeraient souvent participer. Envoie-leur le lien de la cagnotte et propose-leur d’envoyer un message.</li>
<li><strong>Oublier les photos</strong> : c’est le piège le plus courant. Tout le monde profite du moment, personne ne prend de photos, et le lendemain il ne reste rien. Désigne quelqu’un, ou donne un appareil à tout le monde.</li>
</ul>

<h2>Le bon esprit</h2>
<p>Un pot de départ réussi tient en peu de choses : la bonne date, les bonnes personnes, deux ou trois discours sincères et un souvenir à emporter. Pour d’autres idées selon l’occasion, va voir <a href="/occasions">toutes les occasions</a>.</p>
`,
    faq: [
      {
        q: 'Comment organiser un pot de départ à la retraite ?',
        a: 'Fixe la date avec la personne qui part (souvent la dernière semaine), choisis le lieu (locaux, restaurant ou salle), clarifie le budget (entreprise, cagnotte, participation de la personne), invite largement trois semaines avant, et prévois deux ou trois discours courts.',
      },
      {
        q: 'Quel cadeau collectif pour un départ à la retraite ?',
        a: 'Un cadeau lié au projet de retraite (voyage, jardinage, matériel pour une passion), une expérience à vivre, ou un souvenir de l’équipe comme un livre de messages ou un album des photos de la fête avec des tirages papier.',
      },
      {
        q: 'Combien donner pour une cagnotte de départ en retraite ?',
        a: 'Il n’y a pas de règle : chacun donne selon ses moyens et sa proximité avec la personne. Lance la cagnotte sans montant imposé, pour que personne ne se sente obligé.',
      },
      {
        q: 'Que mettre dans un buffet de départ à la retraite ?',
        a: 'Des bouchées salées faciles à manger debout (mini-quiches, cakes salés, verrines, wraps, brochettes, charcuterie et fromages), quelques douceurs et un gâteau personnalisé, des boissons sans alcool en quantité et un crémant pour trinquer. Ajoute une touche personnelle : les plats préférés de la personne ou une spécialité de sa région.',
      },
      {
        q: 'Combien de pièces par personne pour un pot de départ ?',
        a: 'Pour un pot d’une heure à une heure et demie, compte 6 à 8 pièces salées et 2 à 3 pièces sucrées par personne. Pour un apéritif dînatoire qui remplace le repas, compte 12 à 16 pièces salées et 3 à 5 sucrées. Ajoute 10 % de marge.',
      },
      {
        q: 'Quelle animation originale pour un départ en retraite ?',
        a: 'Un appareil photo jetable partagé que tous les invités utilisent avec leur téléphone, un livre d’or audio de messages vocaux, un faux diplôme de jeune retraité avec son kit de survie, une fausse une de journal sur sa carrière, une carte du monde où chacun épingle un voyage à faire, ou un blind test des tubes de ses années dans l’entreprise.',
      },
    ],
  },
  {
    // Vise « partager photos week-end entre amis », « album photo vacances entre amis ».
    slug: 'photos-week-end-entre-amis',
    cat: 'Entre amis',
    title: 'Partager les photos d’un week-end entre amis sans chaos',
    excerpt: 'Partager les photos d’un week-end ou de vacances entre amis : les solutions au groupe WhatsApp à 400 photos, et comment faire un bel album de groupe.',
    author: 'Léa Ferrand',
    date: '2026-09-30',
    read: '6 min',
    caption: 'Une bande d’amis sur les marches d’une maison de campagne au coucher du soleil',
    image: '/journal/photos-week-end-entre-amis.webp',
    body: `
<p>Un week-end entre amis se termine toujours de la même façon. Dans la voiture du retour, quelqu’un écrit « envoyez vos photos ! » dans le groupe. Pendant deux jours, 400 images arrivent en vrac, entre les messages et les vocaux. Trois semaines plus tard, personne ne retrouve la photo du coucher de soleil, et l’album dont tout le monde parlait n’existe pas.</p>
<p>Voici comment partager les photos d’un week-end ou de vacances entre amis sans ce chaos, et comment en faire un album qu’on aura envie de rouvrir.</p>

<h2>Le problème du groupe WhatsApp</h2>
<p>Le groupe de conversation est le réflexe naturel, et il a de vrais défauts :</p>
<ul>
<li><strong>Les photos sont compressées</strong> : elles s’affichent bien sur un téléphone, mais perdent en définition. Difficile ensuite d’en faire un tirage correct.</li>
<li><strong>Tout est mélangé</strong> : photos, messages, liens, vocaux. Retrouver une image demande de remonter des centaines de messages.</li>
<li><strong>Tout le monde envoie tout</strong> : douze versions de la même photo de groupe, des rafales entières, et les bonnes images sont noyées.</li>
<li><strong>Rien n’est rangé</strong> : les photos remplissent la mémoire de chaque téléphone, et personne ne fait le tri.</li>
</ul>
<p>On a comparé plus en détail le groupe WhatsApp et l’album partagé dans <a href="/journal/whatsapp-google-photos-mariage">WhatsApp, Google Photos ou appli dédiée</a>. Ce qui vaut pour un mariage vaut aussi pour un week-end.</p>

<h2>Les solutions</h2>

<h3>L’album partagé Google Photos ou iCloud</h3>
<p>Un album commun où chacun dépose ses photos. La qualité est préservée et tout est rangé au même endroit. Deux limites : il faut que tout le monde soit sur le même système (un album iCloud exclut les amis sous Android pour l’ajout de photos, un album Google demande un compte Google), et il faut que chacun pense à y déposer ses photos. Entre amis motivés, ça marche ; dans un groupe plus large, l’album reste souvent à moitié vide.</p>

<h3>Le dossier partagé</h3>
<p>Un dossier dans un service de stockage en ligne. Pratique pour tout récupérer, peu agréable à regarder. C’est une bonne solution d’archive, pas un album.</p>

<h3>L’appareil photo jetable partagé</h3>
<p>Le principe est différent : au lieu de tout mitrailler et de trier ensuite, chaque ami a un nombre de clichés compté pour tout le séjour, comme avec un vrai jetable. On scanne un QR code, l’appareil s’ouvre dans le navigateur, sans application ni compte. On ne voit pas ses photos. Au retour, à l’heure choisie, tout se révèle d’un coup dans un album commun.</p>
<p>Sur un séjour de plusieurs jours, <a href="/week-end-entre-amis">Time to Flash pour un week-end entre amis</a> fonctionne avec une date de début, une date de fin et une date de révélation, et envoie des rappels aux participants pendant le séjour pour qu’ils pensent à utiliser leurs clichés. Pour dix amis, c’est 1,99 € en paiement unique, et c’est gratuit jusqu’à cinq.</p>
<p>L’intérêt : moins de photos, mais des photos choisies. Et la soirée de révélation devient un prétexte pour se retrouver.</p>

<h2>Comment faire un bel album de week-end ou de vacances</h2>
<ol>
<li><strong>Décide de l’outil avant de partir</strong>, pas au retour. Une fois les photos dispersées, plus personne ne les rassemble.</li>
<li><strong>Désigne un responsable de l’album</strong> : celui qui crée l’album, envoie le lien, et relance gentiment.</li>
<li><strong>Limite les doublons</strong> : une seule personne envoie la photo de groupe, les autres gardent leurs rafales pour eux.</li>
<li><strong>Trie au retour</strong> : garde trente à cinquante photos qui racontent le séjour, dans l’ordre chronologique.</li>
<li><strong>Donne un rendu commun</strong> : un même filtre sur toutes les photos donne de l’unité à l’album. Dans l’album Time to Flash, tu peux choisir parmi cinq pellicules, dont un rendu Jetable chaud et granuleux avec la date incrustée, conservé dans les fichiers téléchargés.</li>
<li><strong>Fais imprimer</strong> : quelques tirages papier, commandés depuis l’album, à offrir à chacun ou à afficher dans la maison de vacances l’année suivante.</li>
</ol>

<h2>Pendant le séjour : qui prend les photos ?</h2>
<p>Dans chaque groupe, il y a un photographe officieux. Il revient avec trois cents photos, et il n’apparaît sur aucune. Pour un album plus juste :</p>
<ul>
<li><strong>Fais tourner l’appareil</strong> : chacun prend quelques photos, chacun apparaît sur celles des autres.</li>
<li><strong>Pense aux moments calmes</strong> : le café du matin, la balade, la route. Ce sont souvent ceux qu’on regrette de ne pas avoir photographiés.</li>
<li><strong>Range le téléphone le reste du temps</strong> : avec quelques clichés chacun, on profite davantage et on photographie mieux.</li>
</ul>

<h2>La soirée de révélation</h2>
<p>Si tu choisis une révélation différée, profites-en : fixe-la à un moment où tout le monde peut se retrouver, en vrai ou au téléphone. Un apéro une semaine après le retour, une visio du dimanche soir, ou simplement le lendemain matin, sur la route du retour. Découvrir les photos ensemble, c’est revivre le séjour une deuxième fois, et souvent le début de la planification du suivant.</p>

<h2>Idées de photos à faire en groupe</h2>
<p>Les photos de groupe les plus réussies sont souvent celles qu’on a prévues. Quelques idées :</p>
<ul>
<li><strong>La photo d’arrivée</strong> : tout le monde devant la maison ou la voiture, à peine débarqué.</li>
<li><strong>La photo du même endroit chaque jour</strong> : même cadrage, à la même heure. Mises côte à côte, elles racontent le séjour.</li>
<li><strong>Les coulisses</strong> : la cuisine en plein chaos, la partie de cartes, la sieste au soleil.</li>
<li><strong>Les portraits croisés</strong> : chacun photographie la personne à sa droite, sans prévenir.</li>
<li><strong>Le repas vu d’en haut</strong> : la table pleine, prise debout sur une chaise.</li>
<li><strong>La photo de départ</strong> : les mêmes, au même endroit, avec trois jours de fatigue en plus.</li>
</ul>
<p>Un petit défi rend le jeu plus drôle : une liste de photos à faire, à cocher pendant le séjour. Avec des clichés comptés, chacun réfléchit avant d’appuyer.</p>

<h2>Le bon réflexe</h2>
<p>Le secret d’un bel album de vacances entre amis, ce n’est pas le nombre de photos, c’est de décider avant de partir où elles iront. Pour un séjour plus long, va voir notre page <a href="/vacances-entre-amis">vacances entre amis</a>.</p>
`,
    faq: [
      {
        q: 'Comment partager les photos d’un week-end entre amis ?',
        a: 'Évite le groupe de conversation, qui compresse et mélange tout. Crée avant le départ un album partagé commun (Google Photos, iCloud si tout le monde a un iPhone) ou un appareil photo jetable partagé comme Time to Flash, qui rassemble les photos de chacun dans un seul album révélé au retour.',
      },
      {
        q: 'Comment faire un album photo de vacances entre amis ?',
        a: 'Choisis l’outil avant de partir, désigne un responsable, limite les doublons, trie au retour pour garder trente à cinquante photos dans l’ordre, applique un même rendu à toutes les photos, et fais imprimer les meilleures.',
      },
      {
        q: 'Un album partagé fonctionne-t-il entre iPhone et Android ?',
        a: 'Un album iCloud ne permet pas aux utilisateurs d’Android d’ajouter des photos. Un album Google Photos demande un compte Google. Time to Flash marche dans n’importe quel navigateur, sur iPhone comme sur Android, sans compte.',
      },
      {
        q: 'Combien coûte un appareil photo jetable partagé pour un week-end ?',
        a: 'Avec Time to Flash, c’est gratuit jusqu’à cinq participants, puis 1,99 € pour dix et 4,99 € pour trente, en paiement unique sans abonnement.',
      },
    ],
  },
  {
    // Vise « appareil photo jetable EVJF », « appareil jetable EVG ».
    slug: 'appareil-photo-jetable-evjf',
    cat: 'Entre amis',
    title: 'Appareil photo jetable EVJF : carton ou application ?',
    excerpt: 'Appareil photo jetable pour un EVJF ou un EVG : le vrai prix du carton, ses limites, l’alternative numérique et des idées de défis photo.',
    author: 'Camille Rouzaud',
    date: '2026-09-29',
    read: '6 min',
    caption: 'Un EVJF dans une ruelle, une amie vise le groupe avec un appareil jetable',
    image: '/journal/appareil-photo-jetable-evjf.webp',
    body: `
<p>L’appareil photo jetable est devenu un classique de l’EVJF et de l’EVG. On en glisse un dans chaque sac, on se lance des défis, et on découvre les photos plus tard. Reste une question pratique : vrais jetables en carton, ou application sur le téléphone ? Voici le comparatif honnête, avec le budget, les inconvénients, et des idées de défis pour en profiter.</p>

<h2>Pourquoi un jetable à l’EVJF ou à l’EVG ?</h2>
<p>Parce qu’il change la façon de prendre des photos. Avec un nombre de poses limité, on choisit ses moments. Sans écran pour vérifier, on ne refait pas la photo dix fois. Et la surprise du développement prolonge la fête : on revit le week-end en découvrant les images. C’est exactement l’esprit d’un enterrement de vie de jeune fille ou de garçon.</p>

<h2>Le jetable en carton : le vrai budget</h2>
<p>Les prix varient beaucoup selon les modèles, les vendeurs et les labos, mais voici des ordres de grandeur réalistes :</p>
<ul>
<li><strong>L’appareil</strong> : compte en général entre 12 et 25 € pièce pour un jetable de 27 poses. Les modèles personnalisés (étui à ton nom, couleur assortie) coûtent souvent plus cher.</li>
<li><strong>Le développement</strong> : souvent entre 10 et 20 € par pellicule pour le développement et la numérisation, davantage si tu veux aussi des tirages.</li>
</ul>
<p>Pour un groupe de huit, avec un appareil chacun, la note atteint vite 200 € ou plus. Tu peux réduire en partageant un appareil pour deux, au prix de moins de photos par personne.</p>

<h2>Les inconvénients du carton</h2>
<ul>
<li><strong>Le développement</strong> : il faut récupérer tous les appareils, les apporter au labo, et attendre souvent une à deux semaines.</li>
<li><strong>Les photos ratées</strong> : flash oublié, doigt devant l’objectif, contre-jour. En soirée, une bonne partie des poses peut sortir trop sombre.</li>
<li><strong>Les appareils perdus</strong> : un week-end d’EVJF, ce sont des sacs, des bars, des taxis. Il y a souvent un appareil qui ne revient pas, avec ses 27 souvenirs.</li>
<li><strong>Le partage</strong> : une fois numérisées, les photos arrivent par lot, à redistribuer à chacune ou chacun.</li>
</ul>
<p>Le charme est réel, et certains groupes l’assument pleinement. Mais il faut le savoir avant d’acheter. Le même comparatif pour un mariage est dans <a href="/journal/appareil-photo-jetable-mariage">appareil photo jetable de mariage : le carton ou l’appli ?</a></p>

<h2>L’alternative numérique</h2>
<p>Un appareil photo jetable sur le téléphone garde ce qui fait le charme du jetable, sans les contraintes du carton. Avec <a href="/evjf-evg">Time to Flash pour un EVJF ou un EVG</a> :</p>
<ul>
<li>chacun scanne un QR code, et l’appareil s’ouvre dans le navigateur, sans application ni compte ;</li>
<li>chacun a un nombre de clichés compté (de 3 à 15, c’est toi qui choisis) ;</li>
<li>personne ne voit ses photos avant la révélation ;</li>
<li>toutes les photos arrivent dans un seul album privé, avec un rendu Jetable chaud et granuleux et la date incrustée, si tu le choisis ;</li>
<li>sur un week-end, des rappels sont envoyés aux participants pour qu’ils pensent à utiliser leurs clichés.</li>
</ul>
<p>Côté budget : gratuit jusqu’à cinq participants, 1,99 € pour dix, 4,99 € pour trente, en paiement unique. Rien à perdre dans un taxi, et aucun labo à trouver.</p>
<p>Le revers : pas d’objet à tenir en main, ni de tirage papier immédiat. Tu peux en revanche commander des tirages depuis l’album, une fois les photos révélées.</p>

<h2>Carton ou appli : le résumé</h2>
<table>
<thead><tr><th></th><th>Jetable en carton</th><th>Jetable numérique</th></tr></thead>
<tbody>
<tr><td><strong>Budget pour 8</strong></td><td>Souvent 200 € ou plus</td><td>1,99 €</td></tr>
<tr><td><strong>Objet à tenir</strong></td><td>Oui</td><td>Non, le téléphone</td></tr>
<tr><td><strong>Développement</strong></td><td>Labo, une à deux semaines</td><td>Aucun</td></tr>
<tr><td><strong>Risque de perte</strong></td><td>Réel</td><td>Aucun</td></tr>
<tr><td><strong>Photos de nuit</strong></td><td>Souvent sombres</td><td>Celles du téléphone</td></tr>
<tr><td><strong>Partage</strong></td><td>À redistribuer</td><td>Album commun</td></tr>
</tbody>
</table>

<h2>Organiser le jetable de l’EVJF en 4 étapes</h2>
<ol>
<li><strong>Crée l’événement quelques jours avant</strong> : le nom de l’EVJF ou de l’EVG, le nombre de participants, le nombre de clichés par personne, et l’heure de la révélation.</li>
<li><strong>Choisis le bon nombre de clichés</strong> : pour une journée, 8 à 10 par personne suffisent ; pour un week-end, monte vers 12 à 15.</li>
<li><strong>Partage le QR code</strong> : envoie-le dans le groupe avant le départ, ou imprime-le sur une petite carte glissée dans le kit de chaque participant.</li>
<li><strong>Garde le secret</strong> : si la future mariée ou le futur marié ne doit rien savoir, n’en parle qu’au dernier moment, et lance le jeu au début du week-end.</li>
</ol>

<h2>Idées de défis photo pour l’EVJF ou l’EVG</h2>
<p>Avec des clichés comptés, les défis prennent tout leur sens. Imprime une liste ou envoie-la dans le groupe :</p>
<ul>
<li>la future mariée (ou le futur marié) avec un inconnu qui porte la même couleur ;</li>
<li>tout le groupe dans une cabine, une voiture ou un ascenseur ;</li>
<li>une photo qui reproduit une vieille photo d’enfance ;</li>
<li>le meilleur fou rire de la journée ;</li>
<li>la tenue la plus improbable croisée dans la rue ;</li>
<li>le toast le plus solennel ;</li>
<li>un portrait de chaque participante ou participant pris par quelqu’un d’autre ;</li>
<li>le moment exact où la mission secrète a été accomplie ;</li>
<li>le groupe au réveil, le lendemain, sans retouche.</li>
</ul>
<p>Attribue un point par défi réussi, et révèle le classement en même temps que les photos.</p>

<h2>Quand révéler les photos ?</h2>
<p>Deux options, toutes les deux excellentes.</p>
<p><strong>Au retour</strong> : le lendemain ou le soir du retour, quand tout le monde est rentré. On revit le week-end ensemble, à distance, dans la conversation de groupe. C’est le choix le plus simple.</p>
<p><strong>Le jour du mariage</strong> : tu fixes la révélation au jour J, ou au lendemain du mariage. Les photos de l’EVJF deviennent une surprise de plus, et un beau cadeau pour la future mariée ou le futur marié. Attention à la durée : l’album est conservé six mois sur Time to Flash, donc ça marche si le mariage a lieu dans les mois qui suivent. Et avant la révélation, en tant qu’organisateur, tu peux masquer une photo un peu trop compromettante.</p>
<p>Pour d’autres idées selon l’occasion, va voir <a href="/occasions">toutes les occasions</a>.</p>
`,
    faq: [
      {
        q: 'Combien coûte un appareil photo jetable pour un EVJF ?',
        a: 'Un jetable en carton coûte en général entre 12 et 25 € pièce, plus 10 à 20 € de développement et de numérisation par pellicule, selon les modèles et les labos. Pour un groupe de huit, compte souvent 200 € ou plus. Un jetable numérique comme Time to Flash est gratuit jusqu’à cinq participants et coûte 1,99 € pour dix.',
      },
      {
        q: 'Peut-on avoir un appareil photo jetable personnalisé pour un EVJF ?',
        a: 'Oui, on trouve des jetables en carton avec un étui personnalisé, souvent plus chers. Avec Time to Flash, l’événement porte le nom que tu choisis, et tu peux imprimer une affiche avec le QR code pour le groupe.',
      },
      {
        q: 'Quelle appli appareil photo jetable pour un EVG ?',
        a: 'Time to Flash fonctionne sans application à installer : chacun scanne un QR code, prend un nombre de photos compté sans les voir, et tout se révèle d’un coup dans un album privé, à l’heure choisie.',
      },
      {
        q: 'Peut-on révéler les photos de l’EVJF le jour du mariage ?',
        a: 'Oui, il suffit de fixer la date de révélation au jour du mariage ou au lendemain. L’album étant conservé six mois sur Time to Flash, c’est possible si le mariage a lieu dans les mois qui suivent l’EVJF.',
      },
    ],
  },
]

// Traductions : une entrée par slug, mêmes champs que journal-en.js.
export const POSTS_OCCASIONS_EN = {
  'idees-anniversaire-30-ans': {
    title: '30th birthday ideas: 15 ways to celebrate turning 30',
    excerpt: '30th birthday ideas: 15 practical ideas for venues, themes, party activities and group gifts to celebrate turning 30 without breaking the bank.',
    caption: 'Friends dancing under confetti at a 30th birthday party',
    body: `
<p>Thirty is the birthday you want to mark without making a huge fuss. Round enough to deserve a proper party, young enough for it to still feel like a night out with friends. Here are 15 practical ideas, sorted by mood, for planning your own 30th or someone else’s.</p>

<h2>The venue: get out of the living room</h2>

<h3>1. A cottage for the weekend</h3>
<p>A big house rented for two nights, an hour or two’s drive away. Everyone splits the cost, each person brings a dish, and the party lasts two days instead of four hours. It is often the most memorable option, and not necessarily the most expensive per head.</p>

<h3>2. A pub’s private room</h3>
<p>Plenty of pubs and bars will lend you a back room with no hire fee, in exchange for a minimum spend. No cleaning up, no neighbours, and the music is already there.</p>

<h3>3. A giant picnic</h3>
<p>If your birthday falls between May and September: a park, blankets, a speaker, outdoor games. Simple, cheap, and friends with children can come too.</p>

<h3>4. A riverside bar or a boat</h3>
<p>A boat or a bar by the water instantly feels festive, with no decorating needed. Book early: summer dates go fast.</p>

<h2>The theme: a common thread</h2>

<h3>5. The “year you were born” party</h3>
<p>Music, fancy dress and a quiz about the year you were born. The playlist writes itself, and everyone has something to say about the things they grew up with.</p>

<h3>6. The colour dress code</h3>
<p>Everyone in white, in red or in sequins. It is easy to follow, costs nothing, and the group photos look stunning.</p>

<h3>7. The “30 dishes” dinner</h3>
<p>Each guest brings a small dish or bite that reminds them of a memory with you. You taste them while hearing the story. Guaranteed emotion, and the buffet is sorted.</p>

<h2>Activities: bring the party to life</h2>

<h3>8. A quiz about the birthday person</h3>
<p>Twenty questions prepared in secret by close friends: their first job, their worst haircut, the name of their first cat. Make teams and have a small prize. It breaks the ice between groups of friends who don’t know each other.</p>

<h3>9. The 30-year music quiz</h3>
<p>One song per year, from your birth until today. Thirty clips, thirty memories, and an atmosphere that builds by itself.</p>

<h3>10. Karaoke</h3>
<p>A speaker, a microphone, a lyrics app on the TV. Or a private karaoke room for two hours before going dancing.</p>

<h3>11. A shared disposable camera</h3>
<p>A QR code on the tables: each guest scans it and their phone becomes a disposable camera, with a limited number of shots and no photos visible until the reveal. The next day, at the chosen time, the whole album appears at once. That is what <a href="/anniversaire-30-ans">Time to Flash does for a 30th birthday</a>: nothing to install, and it costs €4.99 for 30 guests, as a one-off payment. The morning after instantly looks better.</p>

<h3>12. An escape room or a team activity</h3>
<p>To kick off the day before the party: escape room, go-karting, cocktail class, cooking class. A shared activity creates memories and in-jokes for the whole evening.</p>

<h2>Group gifts: a well-planned whip-round</h2>

<h3>13. An experience rather than an object</h3>
<p>A skydive, a weekend in a dream city, a driving experience, a concert. At thirty, people often have enough things; a memory to live makes a bigger impression.</p>

<h3>14. The 30th birthday book</h3>
<p>Each friend writes a page: a memory, a photo, a wish for the decade ahead. Bound into a book, it is a gift kept for life. Start a month ahead to collect the pages.</p>

<h3>15. A letter to open at 40</h3>
<p>Each guest writes a note to slip into a sealed box, to be opened on their 40th. It is free, it is touching, and it already sets a date for the next party.</p>

<h2>Planning someone else’s 30th</h2>
<p>Organising for your partner, your sister or your best friend? A few simple rules:</p>
<ul>
<li><strong>Find out discreetly</strong>: big party or small group, dancing or dinner, surprise or not. Some people love surprises, others hate them.</li>
<li><strong>Write the guest list with someone close</strong>: there is always someone important missing. Think of childhood friends, close colleagues, old friends it would be fun to see again.</li>
<li><strong>Share out the roles</strong>: one friend handles the music, another the quiz, another the whip-round. You keep the coordination.</li>
<li><strong>Plan the big moment</strong>: the birthday person’s entrance, the cake, the speech. One well-prepared moment is enough to make an evening.</li>
</ul>

<h2>Keep a memory of the night</h2>
<p>It is the classic trap of a great party: everyone had a brilliant time, and the next day there are hardly any photos, or they are scattered across thirty phones. Three habits:</p>
<ul>
<li>ask someone to take group photos early in the evening, while everyone still looks presentable;</li>
<li>plan one place where all the photos end up, a shared album or a shared disposable camera;</li>
<li>print a few photos and give them to the birthday person within the week. They will keep them far longer than a message.</li>
</ul>

<h2>Planning a 30th: the countdown</h2>
<ul>
<li><strong>Two months before</strong>: set the date, the budget and the venue. Send a save the date.</li>
<li><strong>One month before</strong>: invitations, theme, catering or a shared buffet.</li>
<li><strong>Two weeks before</strong>: playlist, quiz, activities, decorations.</li>
<li><strong>The day before</strong>: shopping, a reminder to guests, charge the speakers.</li>
</ul>
<p>If it is a surprise, appoint an accomplice to keep the birthday person busy, and keep a single group chat for the guests, without them in it.</p>

<h2>Getting the balance right</h2>
<p>You don’t need to tick off all fifteen ideas. A good 30th is often a nice venue, a common thread, one or two activities, and memories that last. Choose what suits the birthday person. For more ideas by age and occasion, have a look at our <a href="/anniversaire">birthday</a> page and <a href="/occasions">all occasions</a>.</p>
`,
    faq: [
      {
        q: 'What should I do for my 30th birthday?',
        a: 'The formats that work best: a weekend in a cottage with close friends, a themed party in a private room, or a dinner followed by dancing. Add one or two activities (quiz, music quiz, shared disposable camera) so the evening leaves memories.',
      },
      {
        q: 'What are good activities for a 30th birthday party?',
        a: 'A quiz about the birthday person, a music quiz with one song per year, karaoke and a shared disposable camera are simple activities that get everyone involved, even guests who don’t know each other.',
      },
      {
        q: 'What is a good group gift for a 30th?',
        a: 'An experience (a trip, a concert, an unusual activity) or a book where each friend writes a page with a memory and a photo. Both are easy to fund with a whip-round among friends.',
      },
      {
        q: 'How much does a 30th birthday party cost?',
        a: 'It depends on the format. A picnic or a party at home with a shared buffet costs very little. A cottage for the weekend is split between all the guests. A pub’s private room often only costs the drinks. Set the budget before choosing the venue.',
      },
    ],
  },
  'idees-pot-de-depart-retraite': {
    title: 'Retirement party ideas: buffet, activities and planning',
    excerpt: 'Retirement party ideas: the buffet (quantities per person, budget), original activities, speeches, the group gift and a running order that works.',
    caption: 'Colleagues raise their glasses to a colleague who is retiring',
    body: `
<p>A retirement send-off is not like any other leaving do. It marks the end of decades of work, sometimes at the same company, and the person leaving will remember it for a long time. The good news: a great retirement party doesn’t need a big budget, just a bit of organisation. Here is how to plan it: the organising, the buffet (with quantities per person), original activities, the group gift and the mistakes to avoid.</p>

<h2>Planning the retirement party: the basics</h2>

<h3>The date</h3>
<p>The simplest option: the last week of work, on a Thursday or Friday late afternoon. Check with the person leaving first, then with close colleagues’ holidays. For a departure in July, August or December, bring it forward a week: teams are often incomplete.</p>

<h3>The venue</h3>
<p>Three classic options:</p>
<ul>
<li><strong>At the office</strong>: a meeting room, the canteen, a terrace. Free and practical, everyone can drop by.</li>
<li><strong>At a restaurant or pub</strong>: more festive, but you need to book and decide how to split the bill.</li>
<li><strong>At their home or in a hired hall</strong>: for a party mixing colleagues, family and friends, often on a Saturday.</li>
</ul>

<h3>The budget</h3>
<p>It usually comes from three sources: a company or social committee budget, a collection among colleagues, and sometimes the person leaving, who “puts some money behind the bar”. Agree from the start who pays for what: it is the most common source of misunderstandings.</p>

<h3>The guests</h3>
<p>Think broadly: the current team, but also former colleagues who moved on, long-standing clients or partners, and why not their partner. Ask the person leaving for a list of “the people who matter”. Send the invitation at least three weeks ahead.</p>

<h3>The speeches</h3>
<p>Plan two or three speeches, no more, and five minutes each at most. The manager for the career, a close colleague for the anecdotes, and the person leaving for the final word. The best stories are gathered quietly from colleagues beforehand. Skip the list of job titles: tell two or three stories that sum them up.</p>

<h2>The retirement party buffet</h2>
<p>This is often the part that worries organisers most: fear of running out, fear of throwing loads away. The good news is that quantities are fairly easy to work out, from two questions: how long does the party last, and does it replace a meal?</p>

<h3>Which format to choose</h3>
<ul>
<li><strong>Drinks and nibbles</strong> (1 to 1.5 hours, late afternoon): a few savoury bites, a cake, drinks. The most common format when the party is held at the office.</li>
<li><strong>A finger food dinner</strong> (2 hours or more, from 6.30pm): it replaces dinner, so you need more substantial bites, and more of them.</li>
<li><strong>A buffet meal</strong> (at lunchtime, or on a Saturday with family): starters, cold or hot dishes, cheese, dessert, like a proper meal.</li>
</ul>

<h3>Quantities per person</h3>
<p>The guidelines below are the ones caterers commonly use. Add a 10% margin if you don’t know exactly how many people will drop by.</p>
<table>
<thead><tr><th>Format</th><th>Savoury</th><th>Sweet</th><th>Drinks</th></tr></thead>
<tbody>
<tr><td>Drinks and nibbles (1 to 1.5 h)</td><td>6 to 8 pieces</td><td>2 to 3 pieces, or a slice of cake</td><td>2 to 3 glasses</td></tr>
<tr><td>Finger food dinner (2 h or more)</td><td>12 to 16 pieces</td><td>3 to 5 pieces</td><td>4 to 5 glasses</td></tr>
<tr><td>Buffet meal</td><td>A starter, a main, some cheese</td><td>A dessert</td><td>4 to 5 glasses</td></tr>
</tbody>
</table>
<p>If you are doing the shopping yourself, a few useful benchmarks for a finger food dinner: 50 to 80 g of cold meats and the same of cheese per person, one baguette for every four or five people, a good handful of crudités for dipping, and half a litre of water per person. For drinks, a bottle of wine or sparkling wine pours about six glasses: allow one bottle for every two or three people over the evening, and as many soft drinks as alcoholic ones.</p>

<h3>Drinks</h3>
<ul>
<li><strong>The toast</strong>: a glass of sparkling wine or champagne when the speeches start is the gesture that marks the occasion.</li>
<li><strong>Soft drinks</strong>: juices, sparkling water, homemade lemonade. Plenty of guests will be driving or don’t drink: be generous.</li>
<li><strong>At the office</strong>, check your company’s rules on alcohol before planning cocktails. In France, for example, the labour code only allows wine, beer, cider and perry at work, and internal rules can be stricter.</li>
<li><strong>Coffee</strong> at the end, especially for a lunchtime party.</li>
</ul>

<h3>The buffet budget</h3>
<p>As a rough guide, and depending on where you live:</p>
<ul>
<li><strong>Homemade or bring-a-dish buffet</strong>: around €5 to €10 per person, drinks included.</li>
<li><strong>Mixed buffet</strong> (a few catered items, the rest bought or homemade): around €10 to €15 per person.</li>
<li><strong>Full catering</strong>, with service: often €20 to €35 per person or more for a finger food dinner.</li>
</ul>
<p>Always ask for two or three quotes, and ask the awkward questions: is service included, the crockery, delivery, clearing up?</p>

<h3>Homemade, caterer or bring-a-dish?</h3>
<ul>
<li><strong>Bring-a-dish</strong>: each colleague brings something. Friendly and almost free, on one condition: a shared sheet where everyone writes down what they are bringing (savoury, sweet, drinks), or you end up with twelve quiches and no dessert.</li>
<li><strong>A caterer</strong>: zero stress, a polished presentation, but a bigger budget. Ideal for more than fifty people.</li>
<li><strong>A mix</strong>: savoury bites from the caterer, the cake from the bakery, drinks from the supermarket. Often the best compromise.</li>
</ul>

<h3>Buffet ideas</h3>
<p><strong>Savoury:</strong> mini quiches, savoury loaf cut into cubes, small pots of dips (hummus, guacamole, tzatziki), sliced wraps, cherry tomato and mozzarella skewers, cheese puffs, mini burgers, a board of cold meats and cheeses, crudités with two or three dips.</p>
<p><strong>Sweet:</strong> petits fours, fruit skewers, cookies, mini tarts, and above all <strong>the cake</strong>, with a message or a photo of the retiree.</p>
<p><strong>The personal touch:</strong> the retiree’s favourite dishes, a speciality from where they grew up, or a buffet that hints at their retirement: a world tour in bites if they dream of travelling, a vegetable garden buffet if they are finally going to grow their own.</p>
<p>One last tip: think about special diets (vegetarian, gluten-free, no pork) and label the dishes. Nobody likes guessing what is in a little pot.</p>

<h2>Retirement party activity ideas</h2>
<h3>The classics that always work</h3>
<ul>
<li><strong>The slideshow through the years</strong>: team photos, away days, Christmas parties. Ask colleagues for photos a month ahead. Old photos always get a laugh.</li>
<li><strong>The career quiz</strong>: what year did they join? Where was their first desk? Which software did they curse the most? In teams, with a token prize.</li>
<li><strong>The guest book</strong>: a nice notebook passed around during the party so everyone can write a message. For absent or remote colleagues, collect messages beforehand and stick them in.</li>
<li><strong>The surprise video</strong>: a few messages filmed by former colleagues, family, or even a loyal client.</li>
</ul>

<h3>Original ideas for a retirement send-off</h3>
<ul>
<li><strong>The shared disposable camera</strong>: a QR code on the tables, each guest scans it with their phone and takes a few shots without seeing them. The next day, all the photos appear at once in a private album the retiree can keep. That is what <a href="/depart-retraite">Time to Flash offers for a retirement party</a>, with no app to install, and it costs €14.99 for 50 guests.</li>
<li><strong>The audio guest book</strong>: each guest records a short voice message, signed with a selfie, from their phone. The hosts listen to them and can share them with the retiree. At Time to Flash, it is a €9.99 option that can be added to any paid plan.</li>
<li><strong>The new retiree’s diploma</strong>: a mock-solemn certificate, handed over with a “survival kit” (a broken alarm clock, an empty diary, a gardening hat, a fishing licence). Guaranteed laughs during the speeches.</li>
<li><strong>The front page</strong>: a fake newspaper front page telling the story of their career, with a big headline, archive photos and “quotes” from colleagues. It gets read during the party and framed afterwards.</li>
<li><strong>The wish map</strong>: a big map of the world where everyone pins a place to visit, with a note. The retiree leaves with their retirement plan.</li>
<li><strong>The advice box</strong>: each guest writes a tip for enjoying retirement on a card, serious or not. A few are read out loud, and the box goes home with the retiree.</li>
<li><strong>The career music quiz</strong>: the hits from the year they joined, then from each decade they spent at the company. In teams, with a buzzer.</li>
<li><strong>Catchphrase bingo</strong>: a grid with the retiree’s favourite expressions. Tick them off during the speeches.</li>
</ul>
<p>One or two activities are enough: the heart of the party is still the speeches, and the moments when everyone comes to have a word with the retiree.</p>

<h2>The group retirement gift</h2>
<p>A collection is the norm. Start it a month ahead, with a clear message and no set amount: everyone gives what they want, and nobody should feel obliged. A few ideas depending on the person:</p>
<ul>
<li><strong>Their retirement plan</strong>: do they dream of travelling, gardening, painting, cycling? Fund the first step: a travel voucher, equipment, a course.</li>
<li><strong>An experience</strong>: a weekend away, a hot-air balloon flight, a dinner at a great restaurant, concert tickets.</li>
<li><strong>A keepsake from the team</strong>: a book with a message and a photo from each colleague. It is often the gift kept the longest.</li>
<li><strong>The party photo album</strong>: the photos everyone took during the party, gathered in one album. With Time to Flash, you can order prints straight from the album and give them a few days later as a keepsake.</li>
</ul>
<p>A good combination: a gift that looks ahead (the retirement plan) and a keepsake that looks back (the book or the album).</p>

<h2>A typical running order</h2>
<p>For an after-work party of about two hours, here is a running order that works:</p>
<ol>
<li><strong>Arrivals (30 minutes)</strong>: drinks, buffet, guest book going round, the camera QR code on the tables. People arrive gradually, give them time.</li>
<li><strong>Speeches (15 minutes)</strong>: once most people are there, and not too late so nobody has already left. The manager, a close colleague, then the retiree.</li>
<li><strong>The gift (5 minutes)</strong>: handed over right after the speeches, in front of everyone. Ask someone to take the photo.</li>
<li><strong>The activity (20 to 30 minutes)</strong>: slideshow, quiz or surprise video. One is enough.</li>
<li><strong>Open ending</strong>: everyone comes to have a word with the retiree. It is often the part they enjoy most.</li>
</ol>
<p>For a longer party on a Saturday with family, keep the same order and add a meal and some music.</p>

<h2>Mistakes to avoid</h2>
<ul>
<li><strong>Planning without asking</strong>: some people hate being the centre of attention. Ask what they would like, even if you keep part of it a surprise.</li>
<li><strong>Speeches that drag on</strong>: after five minutes, attention drops. Three short speeches beat one long one.</li>
<li><strong>Jokes that sting</strong>: a funny story, yes. A reference to a conflict or to health, no. If in doubt, leave it out.</li>
<li><strong>Forgetting those who can’t attend</strong>: remote colleagues, people at another site or who have already left often want to take part. Send them the collection link and invite them to send a message.</li>
<li><strong>Forgetting the photos</strong>: the most common trap. Everyone enjoys the moment, nobody takes pictures, and the next day there is nothing left. Appoint someone, or give everyone a camera.</li>
</ul>

<h2>The right spirit</h2>
<p>A good retirement party comes down to a few things: the right date, the right people, two or three heartfelt speeches and a keepsake to take home. For more ideas by occasion, see <a href="/occasions">all occasions</a>.</p>
`,
    faq: [
      {
        q: 'How do you organise a retirement party?',
        a: 'Set the date with the person leaving (often their last week), choose the venue (office, restaurant or hall), clarify the budget (company, collection, contribution from the retiree), invite people widely three weeks ahead, and plan two or three short speeches.',
      },
      {
        q: 'What is a good group gift for someone retiring?',
        a: 'A gift linked to their retirement plans (travel, gardening, equipment for a hobby), an experience, or a keepsake from the team such as a book of messages or an album of photos from the party with prints.',
      },
      {
        q: 'How much should I give to a retirement collection?',
        a: 'There is no rule: everyone gives according to their means and how close they are to the person. Start the collection with no set amount so nobody feels obliged.',
      },
      {
        q: 'What food should you serve at a retirement party buffet?',
        a: 'Savoury bites that are easy to eat standing up (mini quiches, savoury loaf, dips, wraps, skewers, cold meats and cheese), a few sweet treats and a personalised cake, plenty of soft drinks and some sparkling wine for the toast. Add a personal touch: the retiree’s favourite dishes or a speciality from where they grew up.',
      },
      {
        q: 'How many pieces per person for a retirement party?',
        a: 'For a party of one to one and a half hours, allow 6 to 8 savoury pieces and 2 to 3 sweet pieces per person. For a finger food dinner that replaces a meal, allow 12 to 16 savoury and 3 to 5 sweet pieces. Add a 10% margin.',
      },
      {
        q: 'What are some original activities for a retirement party?',
        a: 'A shared disposable camera every guest uses with their phone, an audio guest book of voice messages, a mock diploma for the new retiree with a survival kit, a fake newspaper front page about their career, a world map where everyone pins a trip to take, or a music quiz of the hits from their years at the company.',
      },
    ],
  },
  'photos-week-end-entre-amis': {
    title: 'How to share photos from a weekend away with friends',
    excerpt: 'Sharing photos from a weekend or holiday with friends: alternatives to the 400-photo WhatsApp chaos, and how to make a group album you’ll reopen.',
    caption: 'A group of friends on the steps of a country house at sunset',
    body: `
<p>A weekend away with friends always ends the same way. In the car on the way back, someone writes “send your photos!” in the group chat. For two days, 400 pictures pour in, mixed up with messages and voice notes. Three weeks later, nobody can find the sunset photo, and the album everyone talked about doesn’t exist.</p>
<p>Here is how to share photos from a weekend or holiday with friends without the chaos, and turn them into an album you will actually want to reopen.</p>

<h2>The problem with the WhatsApp group</h2>
<p>The group chat is the natural reflex, and it has real drawbacks:</p>
<ul>
<li><strong>Photos are compressed</strong>: they look fine on a phone but lose detail. Hard to get a decent print out of them afterwards.</li>
<li><strong>Everything is mixed up</strong>: photos, messages, links, voice notes. Finding a picture means scrolling back through hundreds of messages.</li>
<li><strong>Everyone sends everything</strong>: twelve versions of the same group shot, whole bursts, and the good pictures get buried.</li>
<li><strong>Nothing is organised</strong>: the photos fill up every phone’s storage, and nobody sorts them.</li>
</ul>
<p>We compared the WhatsApp group and the shared album in more detail in <a href="/journal/whatsapp-google-photos-mariage">WhatsApp, Google Photos or a dedicated app</a>. What applies to a wedding applies to a weekend too.</p>

<h2>The solutions</h2>

<h3>A shared Google Photos or iCloud album</h3>
<p>A common album where everyone adds their photos. Quality is preserved and everything is in one place. Two limits: everyone needs to be on the same system (an iCloud album won’t let Android friends add photos, a Google album needs a Google account), and everyone has to remember to upload. Among keen friends, it works; in a bigger group, the album often stays half empty.</p>

<h3>A shared folder</h3>
<p>A folder in an online storage service. Handy for collecting everything, not much fun to browse. It is a good archive, not an album.</p>

<h3>The shared disposable camera</h3>
<p>The idea is different: instead of snapping everything and sorting later, each friend gets a limited number of shots for the whole trip, like a real disposable. You scan a QR code, the camera opens in the browser, with no app and no account. You can’t see your photos. Once you are home, at the chosen time, everything is revealed at once in a shared album.</p>
<p>For a trip of several days, <a href="/week-end-entre-amis">Time to Flash for a weekend with friends</a> works with a start date, an end date and a reveal date, and sends reminders to participants during the trip so they remember to use their shots. For ten friends, it costs €1.99 as a one-off payment, and it is free for up to five.</p>
<p>The benefit: fewer photos, but chosen ones. And the reveal becomes an excuse to get together again.</p>

<h2>How to make a great weekend or holiday album</h2>
<ol>
<li><strong>Choose the tool before you leave</strong>, not when you get back. Once the photos are scattered, nobody gathers them.</li>
<li><strong>Put someone in charge of the album</strong>: the person who creates it, sends the link and gives a gentle nudge.</li>
<li><strong>Limit duplicates</strong>: one person shares the group shot, the others keep their bursts to themselves.</li>
<li><strong>Sort when you get back</strong>: keep thirty to fifty photos that tell the story of the trip, in order.</li>
<li><strong>Give it a common look</strong>: the same filter on every photo gives the album unity. In the Time to Flash album, you can choose from five film looks, including a warm, grainy Disposable look with the date printed in the corner, kept in the downloaded files.</li>
<li><strong>Print some</strong>: a few prints, ordered from the album, to give to everyone or to pin up in the holiday house next year.</li>
</ol>

<h2>During the trip: who takes the photos?</h2>
<p>Every group has an unofficial photographer. They come home with three hundred photos and appear in none of them. For a fairer album:</p>
<ul>
<li><strong>Pass the camera around</strong>: everyone takes a few photos, everyone appears in the others’.</li>
<li><strong>Think of the quiet moments</strong>: morning coffee, the walk, the drive. They are often the ones you regret not capturing.</li>
<li><strong>Put the phone away the rest of the time</strong>: with a few shots each, you enjoy the moment more and take better pictures.</li>
</ul>

<h2>The reveal evening</h2>
<p>If you choose a delayed reveal, make the most of it: set it for a time when everyone can get together, in person or on the phone. Drinks a week after you get back, a Sunday evening video call, or simply the next morning on the drive home. Discovering the photos together means living the trip a second time, and it is often how planning the next one begins.</p>

<h2>Group photo ideas</h2>
<p>The best group photos are often the ones you planned. A few ideas:</p>
<ul>
<li><strong>The arrival shot</strong>: everyone in front of the house or the car, just arrived.</li>
<li><strong>The same spot every day</strong>: same framing, same time. Side by side, they tell the story of the trip.</li>
<li><strong>Behind the scenes</strong>: the kitchen in chaos, the card game, the nap in the sun.</li>
<li><strong>Crossed portraits</strong>: everyone photographs the person on their right, without warning.</li>
<li><strong>The meal from above</strong>: the full table, shot standing on a chair.</li>
<li><strong>The departure shot</strong>: the same people, in the same place, with three days’ worth of tiredness.</li>
</ul>
<p>A little challenge makes it more fun: a list of photos to take, to tick off during the trip. With limited shots, everyone thinks before pressing the button.</p>

<h2>The right habit</h2>
<p>The secret of a great holiday album with friends is not the number of photos, it is deciding before you leave where they will go. For a longer trip, see our <a href="/vacances-entre-amis">holidays with friends</a> page.</p>
`,
    faq: [
      {
        q: 'How do I share photos from a weekend with friends?',
        a: 'Avoid the group chat, which compresses and mixes everything. Before leaving, create a common shared album (Google Photos, or iCloud if everyone has an iPhone) or a shared disposable camera such as Time to Flash, which gathers everyone’s photos in one album revealed once you are home.',
      },
      {
        q: 'How do I make a holiday photo album with friends?',
        a: 'Choose the tool before you leave, put someone in charge, limit duplicates, sort when you get back to keep thirty to fifty photos in order, give all the photos the same look, and print the best ones.',
      },
      {
        q: 'Does a shared album work between iPhone and Android?',
        a: 'An iCloud album does not let Android users add photos. A Google Photos album requires a Google account. Time to Flash works in any browser, on iPhone and Android alike, with no account.',
      },
      {
        q: 'How much does a shared disposable camera cost for a weekend?',
        a: 'With Time to Flash, it is free for up to five participants, then €1.99 for ten and €4.99 for thirty, as a one-off payment with no subscription.',
      },
    ],
  },
  'appareil-photo-jetable-evjf': {
    title: 'Hen party disposable camera: film or app?',
    excerpt: 'Disposable cameras for a hen or stag do: the real cost of film cameras, their drawbacks, the digital alternative and photo challenge ideas.',
    caption: 'A hen party in a narrow street, one friend aiming a disposable camera at the group',
    body: `
<p>The disposable camera has become a hen and stag do classic. You slip one into everyone’s bag, set a few challenges, and discover the photos later. That leaves a practical question: real film cameras, or an app on the phone? Here is an honest comparison, with the budget, the drawbacks, and challenge ideas to make the most of it.</p>

<h2>Why a disposable camera for a hen or stag do?</h2>
<p>Because it changes the way you take photos. With a limited number of shots, you choose your moments. With no screen to check, you don’t retake the photo ten times. And the surprise of the developed film makes the party last longer: you relive the weekend as you discover the pictures. That is exactly the spirit of a hen or stag do.</p>

<h2>Film disposables: the real budget</h2>
<p>Prices vary a lot depending on the model, the seller and the lab, but here are realistic ballpark figures:</p>
<ul>
<li><strong>The camera</strong>: usually around €12 to €25 each for a 27-shot disposable. Personalised models (custom wrap, matching colours) often cost more.</li>
<li><strong>Developing</strong>: often around €10 to €20 per roll for developing and scanning, more if you also want prints.</li>
</ul>
<p>For a group of eight, with one camera each, the bill can easily reach €200 or more. You can cut it by sharing one camera between two, at the cost of fewer photos each.</p>

<h2>The drawbacks of film</h2>
<ul>
<li><strong>Developing</strong>: you have to collect every camera, take them to a lab, and often wait one to two weeks.</li>
<li><strong>Failed shots</strong>: forgotten flash, a finger over the lens, backlight. At night, a good share of the shots can come out too dark.</li>
<li><strong>Lost cameras</strong>: a hen weekend means handbags, bars and taxis. There is often one camera that never comes back, with its 27 memories.</li>
<li><strong>Sharing</strong>: once scanned, the photos arrive in batches, to be passed on to everyone.</li>
</ul>
<p>The charm is real, and some groups fully embrace it. But it is worth knowing before you buy. The same comparison for a wedding is in <a href="/journal/appareil-photo-jetable-mariage">wedding disposable cameras: film or app?</a></p>

<h2>The digital alternative</h2>
<p>A disposable camera on your phone keeps what makes a disposable charming, without the hassle of film. With <a href="/evjf-evg">Time to Flash for a hen or stag do</a>:</p>
<ul>
<li>everyone scans a QR code and the camera opens in their browser, with no app and no account;</li>
<li>everyone gets a limited number of shots (3 to 15, you choose);</li>
<li>nobody sees their photos before the reveal;</li>
<li>all the photos land in one private album, with a warm, grainy Disposable look and the date printed in the corner, if you choose it;</li>
<li>over a weekend, reminders are sent to participants so they remember to use their shots.</li>
</ul>
<p>Budget: free for up to five participants, €1.99 for ten, €4.99 for thirty, as a one-off payment. Nothing to lose in a taxi, and no lab to find.</p>
<p>The downside: no object to hold, and no instant prints. You can, however, order prints from the album once the photos are revealed.</p>

<h2>Film or app: the summary</h2>
<table>
<thead><tr><th></th><th>Film disposable</th><th>Digital disposable</th></tr></thead>
<tbody>
<tr><td><strong>Budget for 8</strong></td><td>Often €200 or more</td><td>€1.99</td></tr>
<tr><td><strong>Object to hold</strong></td><td>Yes</td><td>No, the phone</td></tr>
<tr><td><strong>Developing</strong></td><td>Lab, one to two weeks</td><td>None</td></tr>
<tr><td><strong>Risk of loss</strong></td><td>Real</td><td>None</td></tr>
<tr><td><strong>Night photos</strong></td><td>Often dark</td><td>As good as the phone</td></tr>
<tr><td><strong>Sharing</strong></td><td>To be passed on</td><td>One shared album</td></tr>
</tbody>
</table>

<h2>Setting up the hen party disposable in 4 steps</h2>
<ol>
<li><strong>Create the event a few days before</strong>: the name of the hen or stag do, the number of participants, shots per person, and the reveal time.</li>
<li><strong>Pick the right number of shots</strong>: for a day, 8 to 10 each is enough; for a weekend, go up to 12 to 15.</li>
<li><strong>Share the QR code</strong>: send it in the group chat before you set off, or print it on a small card slipped into each person’s goody bag.</li>
<li><strong>Keep the secret</strong>: if the bride or groom to be mustn’t know, mention it only at the last minute and start the game at the beginning of the weekend.</li>
</ol>

<h2>Photo challenge ideas for a hen or stag do</h2>
<p>With limited shots, challenges really come into their own. Print a list or send it in the group:</p>
<ul>
<li>the bride (or groom) to be with a stranger wearing the same colour;</li>
<li>the whole group in a photo booth, a car or a lift;</li>
<li>a photo recreating an old childhood picture;</li>
<li>the best fit of giggles of the day;</li>
<li>the most unlikely outfit spotted in the street;</li>
<li>the most solemn toast;</li>
<li>a portrait of each participant taken by someone else;</li>
<li>the exact moment the secret mission was completed;</li>
<li>the group waking up the next morning, no retouching.</li>
</ul>
<p>Award a point per challenge completed, and reveal the scores at the same time as the photos.</p>

<h2>When to reveal the photos?</h2>
<p>Two options, both excellent.</p>
<p><strong>Once you are home</strong>: the next day or the evening you get back, when everyone is home. You relive the weekend together, from a distance, in the group chat. It is the simplest choice.</p>
<p><strong>On the wedding day</strong>: you set the reveal for the big day, or the day after the wedding. The hen or stag photos become one more surprise, and a lovely gift for the bride or groom. Mind the timing: the album is kept for six months on Time to Flash, so it works if the wedding is within the following months. And before the reveal, as the organiser, you can hide a photo that is a little too compromising.</p>
<p>For more ideas by occasion, see <a href="/occasions">all occasions</a>.</p>
`,
    faq: [
      {
        q: 'How much does a disposable camera for a hen party cost?',
        a: 'A film disposable usually costs around €12 to €25 each, plus €10 to €20 per roll for developing and scanning, depending on the model and the lab. For a group of eight, expect €200 or more. A digital disposable such as Time to Flash is free for up to five participants and costs €1.99 for ten.',
      },
      {
        q: 'Can I get a personalised disposable camera for a hen do?',
        a: 'Yes, you can find film disposables with a personalised wrap, usually at a higher price. With Time to Flash, the event carries the name you choose, and you can print a sign with the QR code for the group.',
      },
      {
        q: 'Which disposable camera app works for a stag do?',
        a: 'Time to Flash works with no app to install: everyone scans a QR code, takes a limited number of photos without seeing them, and everything is revealed at once in a private album, at the time you choose.',
      },
      {
        q: 'Can the hen party photos be revealed on the wedding day?',
        a: 'Yes, simply set the reveal date to the wedding day or the day after. As the album is kept for six months on Time to Flash, this works if the wedding takes place within the months following the hen do.',
      },
    ],
  },
}

export const POSTS_OCCASIONS_DE = {
  'idees-anniversaire-30-ans': {
    title: 'Ideen zum 30. Geburtstag: 15 Ideen zum Feiern',
    excerpt: 'Ideen zum 30. Geburtstag: 15 konkrete Ideen für Location, Motto, Programm und Gruppengeschenk, um den 30. zu feiern, ohne pleite zu gehen.',
    caption: 'Freunde tanzen im Konfetti auf einer Feier zum 30. Geburtstag',
    body: `
<p>Der 30. ist der Geburtstag, den man feiern möchte, ohne gleich ein Riesending daraus zu machen. Rund genug für ein richtiges Fest, jung genug, dass es sich noch wie ein Abend unter Freunden anfühlt. Hier sind 15 konkrete Ideen, sortiert nach Stimmung, um den eigenen 30. oder den eines anderen zu planen.</p>

<h2>Die Location: raus aus dem Wohnzimmer</h2>

<h3>1. Ein Ferienhaus fürs Wochenende</h3>
<p>Ein großes Haus für zwei Nächte, ein bis zwei Autostunden entfernt. Alle teilen die Kosten, jeder bringt ein Gericht mit, und die Feier dauert zwei Tage statt vier Stunden. Oft die unvergesslichste Variante, und pro Kopf nicht unbedingt die teuerste.</p>

<h3>2. Der Nebenraum einer Bar</h3>
<p>Viele Bars und Kneipen überlassen Ihnen einen Nebenraum ohne Miete, gegen einen Mindestumsatz. Kein Aufräumen, keine Nachbarn, und die Musik ist schon da.</p>

<h3>3. Das große Picknick</h3>
<p>Wenn Ihr Geburtstag zwischen Mai und September liegt: ein Park, Decken, eine Box, Spiele im Freien. Einfach, günstig, und Freunde mit Kindern können mitkommen.</p>

<h3>4. Strandbar oder Boot</h3>
<p>Ein Boot oder eine Bar am Wasser wirkt sofort festlich, ganz ohne Deko. Früh reservieren: Die schönen Tage sind schnell weg.</p>

<h2>Das Motto: ein roter Faden</h2>

<h3>5. Die Party zum Geburtsjahr</h3>
<p>Musik, Verkleidung und ein Quiz über das Jahr, in dem Sie geboren wurden. Die Playlist schreibt sich von selbst, und jeder hat etwas über die Dinge seiner Kindheit zu erzählen.</p>

<h3>6. Der Farb-Dresscode</h3>
<p>Alle in Weiß, in Rot oder mit Pailletten. Leicht umzusetzen, kostet nichts, und die Gruppenfotos sind spektakulär.</p>

<h3>7. Das Essen der „30 Gerichte“</h3>
<p>Jeder Gast bringt ein kleines Gericht oder einen Happen mit, der ihn an eine Erinnerung mit Ihnen erinnert. Man probiert und hört die Geschichte dazu. Rührung garantiert, und das Buffet ist erledigt.</p>

<h2>Das Programm: Leben in die Feier bringen</h2>

<h3>8. Das Quiz über das Geburtstagskind</h3>
<p>Zwanzig Fragen, heimlich von engen Freunden vorbereitet: der erste Job, die schlimmste Frisur, der Name der ersten Katze. Bilden Sie Teams, besorgen Sie einen kleinen Preis. Das bricht das Eis zwischen Freundeskreisen, die sich nicht kennen.</p>

<h3>9. Das Musikquiz der 30 Jahre</h3>
<p>Ein Song pro Jahr, von der Geburt bis heute. Dreißig Ausschnitte, dreißig Erinnerungen, und die Stimmung steigt von allein.</p>

<h3>10. Karaoke</h3>
<p>Eine Box, ein Mikrofon, eine Songtext-App auf dem Fernseher. Oder ein privater Karaoke-Raum für zwei Stunden, bevor es zum Tanzen geht.</p>

<h3>11. Die gemeinsame Einwegkamera</h3>
<p>Ein QR-Code auf den Tischen: Jeder Gast scannt ihn, und sein Handy wird zur Einwegkamera, mit begrenzten Aufnahmen und ohne sichtbare Fotos bis zur Präsentation. Am nächsten Tag, zur gewählten Uhrzeit, erscheint das ganze Album auf einmal. Genau das macht <a href="/anniversaire-30-ans">Time to Flash zum 30. Geburtstag</a>: nichts zu installieren, und es kostet 4,99 € für 30 Gäste, als Einmalzahlung. Der Morgen danach sieht gleich besser aus.</p>

<h3>12. Escape Room oder Teamaktivität</h3>
<p>Als Auftakt vor der Party: Escape Room, Kartfahren, Cocktailkurs, Kochkurs. Eine gemeinsame Aktivität schafft Erinnerungen und Insider-Witze für den ganzen Abend.</p>

<h2>Gruppengeschenke: eine gut durchdachte Sammelaktion</h2>

<h3>13. Ein Erlebnis statt eines Gegenstands</h3>
<p>Ein Fallschirmsprung, ein Wochenende in einer Traumstadt, ein Fahrtraining, ein Konzert. Mit dreißig hat man oft genug Dinge; ein Erlebnis beeindruckt mehr.</p>

<h3>14. Das Buch zum 30.</h3>
<p>Jeder Freund schreibt eine Seite: eine Erinnerung, ein Foto, einen Wunsch für das kommende Jahrzehnt. Als Buch gebunden, ist es ein Geschenk fürs Leben. Fangen Sie einen Monat vorher an, die Seiten zu sammeln.</p>

<h3>15. Der Brief zum 40.</h3>
<p>Jeder Gast schreibt ein paar Zeilen, die in eine versiegelte Box kommen, die zum 40. geöffnet wird. Kostenlos, berührend, und die nächste Feier ist schon verabredet.</p>

<h2>Den 30. für jemand anderen organisieren</h2>
<p>Sie planen für Ihren Partner, Ihre Schwester oder Ihren besten Freund? Ein paar einfache Regeln:</p>
<ul>
<li><strong>Erkundigen Sie sich unauffällig</strong>: große Party oder kleiner Kreis, Tanzen oder Essen, Überraschung oder nicht. Manche lieben Überraschungen, andere hassen sie.</li>
<li><strong>Schreiben Sie die Gästeliste mit einer vertrauten Person</strong>: Es fehlt immer jemand Wichtiges. Denken Sie an Kindheitsfreunde, enge Kollegen, alte Bekannte, die man gern wiedersehen würde.</li>
<li><strong>Verteilen Sie die Aufgaben</strong>: Ein Freund kümmert sich um die Musik, eine andere um das Quiz, ein Dritter um die Sammelaktion. Sie behalten die Koordination.</li>
<li><strong>Planen Sie den großen Moment</strong>: den Auftritt des Geburtstagskinds, die Torte, die Rede. Ein gut vorbereiteter Moment reicht für einen gelungenen Abend.</li>
</ul>

<h2>Eine Erinnerung an den Abend behalten</h2>
<p>Die klassische Falle gelungener Partys: Alle hatten einen großartigen Abend, und am nächsten Tag gibt es kaum Fotos, oder sie sind auf dreißig Handys verstreut. Drei Gewohnheiten:</p>
<ul>
<li>bitten Sie jemanden, früh am Abend Gruppenfotos zu machen, solange alle noch vorzeigbar sind;</li>
<li>planen Sie einen Ort, an dem alle Fotos landen, ein gemeinsames Album oder eine gemeinsame Einwegkamera;</li>
<li>lassen Sie ein paar Abzüge drucken und schenken Sie sie dem Geburtstagskind in der Woche danach. Die bleiben viel länger als eine Nachricht.</li>
</ul>

<h2>Den 30. planen: der Countdown</h2>
<ul>
<li><strong>Zwei Monate vorher</strong>: Datum, Budget und Location festlegen. Eine „Save the Date“-Nachricht schicken.</li>
<li><strong>Einen Monat vorher</strong>: Einladungen, Motto, Catering oder gemeinsames Buffet.</li>
<li><strong>Zwei Wochen vorher</strong>: Playlist, Quiz, Programm, Deko.</li>
<li><strong>Am Vortag</strong>: Einkäufe, Erinnerung an die Gäste, Boxen aufladen.</li>
</ul>
<p>Bei einer Überraschung bestimmen Sie einen Komplizen, der das Geburtstagskind beschäftigt, und halten Sie eine einzige Gruppenunterhaltung für die Gäste, ohne das Geburtstagskind.</p>

<h2>Die richtige Dosis</h2>
<p>Sie müssen nicht alle fünfzehn Ideen abhaken. Ein guter 30. ist oft eine schöne Location, ein roter Faden, ein oder zwei Programmpunkte und Erinnerungen, die bleiben. Wählen Sie, was zum Geburtstagskind passt. Mehr Ideen nach Alter und Anlass finden Sie auf unseren Seiten <a href="/anniversaire">Geburtstag</a> und <a href="/occasions">alle Anlässe</a>.</p>
`,
    faq: [
      {
        q: 'Was kann man zum 30. Geburtstag machen?',
        a: 'Am besten funktionieren: ein Wochenende in einem Ferienhaus mit engen Freunden, eine Mottoparty in einem gemieteten Raum oder ein Essen mit anschließendem Tanzen. Ergänzen Sie ein oder zwei Programmpunkte (Quiz, Musikquiz, gemeinsame Einwegkamera), damit der Abend Erinnerungen hinterlässt.',
      },
      {
        q: 'Welches Programm passt zum 30. Geburtstag?',
        a: 'Ein Quiz über das Geburtstagskind, ein Musikquiz mit einem Song pro Jahr, Karaoke und eine gemeinsame Einwegkamera sind einfache Programmpunkte, bei denen alle mitmachen, auch Gäste, die sich nicht kennen.',
      },
      {
        q: 'Welches Gruppengeschenk zum 30.?',
        a: 'Ein Erlebnis (Reise, Konzert, ungewöhnliche Aktivität) oder ein Buch, in dem jeder Freund eine Seite mit einer Erinnerung und einem Foto gestaltet. Beides lässt sich leicht über eine Sammelaktion im Freundeskreis finanzieren.',
      },
      {
        q: 'Was kostet eine Feier zum 30. Geburtstag?',
        a: 'Das hängt vom Format ab. Ein Picknick oder eine Feier zu Hause mit gemeinsamem Buffet kostet sehr wenig. Ein Ferienhaus fürs Wochenende teilen sich alle Gäste. Der Nebenraum einer Bar kostet oft nur die Getränke. Legen Sie das Budget fest, bevor Sie die Location wählen.',
      },
    ],
  },
  'idees-pot-de-depart-retraite': {
    // Vise « Abschiedsfeier Ruhestand Ideen », « Buffet Abschied Ruhestand »,
    // « Ausstand Ruhestand ». Google.de : guides Ausstand (karrierebibel,
    // kuechenfibel) ; Kaffee und Kuchen l'après-midi, Umtrunk après le travail.
    title: 'Abschiedsfeier Ruhestand: Ideen, Buffet und Planung',
    excerpt: 'Abschiedsfeier zum Ruhestand: das Buffet (Mengen pro Person, Budget), originelle Ideen fürs Programm, die Reden, das Gruppengeschenk und ein bewährter Ablauf.',
    caption: 'Kollegen stoßen auf eine Kollegin an, die in den Ruhestand geht',
    body: `
<p>Der Abschied in den Ruhestand ist kein Ausstand wie jeder andere. Er markiert das Ende von Jahrzehnten im Beruf, manchmal im selben Unternehmen, und die Person, die geht, wird sich lange an diesen Tag erinnern. Die gute Nachricht: Eine gelungene Abschiedsfeier braucht kein großes Budget, nur etwas Organisation. Hier ist die Anleitung: die Planung, das Buffet (mit Mengen pro Person), originelle Ideen fürs Programm, das Gruppengeschenk und die Fehler, die Sie vermeiden sollten.</p>

<h2>Die Abschiedsfeier zum Ruhestand planen: die Grundlagen</h2>

<h3>Wer lädt ein?</h3>
<p>In vielen Betrieben ist es üblich, dass die Person, die geht, zum Ausstand einlädt und Essen und Getränke ausgibt. Beim Abschied in den Ruhestand übernehmen oft auch das Team oder das Unternehmen die Organisation, als Dankeschön für die vielen Jahre. Beides ist in Ordnung, Hauptsache, es ist vorher geklärt: Sprechen Sie offen mit der Person, statt sie mit einer Feier zu überraschen, die sie am Ende selbst bezahlen soll.</p>

<h3>Das Datum</h3>
<p>Am einfachsten: die letzte Arbeitswoche, an einem Donnerstag oder Freitag, nach Feierabend ab etwa 16 oder 17 Uhr. So geht keine Arbeitszeit verloren, und auch die Führungsebene ist meist einverstanden. Sprechen Sie das Datum zuerst mit der Person ab, die geht, und prüfen Sie dann den Urlaub der engsten Kollegen. Fällt der Abschied in die Sommerferien oder zwischen die Jahre, planen Sie lieber eine Woche früher: Die Teams sind dann selten vollständig.</p>

<h3>Der Ort</h3>
<p>Drei klassische Möglichkeiten:</p>
<ul>
<li><strong>Im Betrieb</strong>: Besprechungsraum, Kantine, Pausenraum, Terrasse. Kostenlos und praktisch, jeder kann kurz vorbeischauen.</li>
<li><strong>Im Restaurant oder in einer Bar</strong>: festlicher, aber Sie müssen reservieren und klären, wie die Rechnung aufgeteilt wird.</li>
<li><strong>Zu Hause oder in einem gemieteten Raum</strong>: für eine Feier mit Kollegen, Familie und Freunden, oft an einem Samstag.</li>
</ul>

<h3>Das Budget</h3>
<p>Es kommt meist aus drei Quellen: einem Budget des Unternehmens oder der Abteilung, einer Sammlung unter Kollegen und manchmal einem Beitrag der Person selbst, die „einen ausgibt“. Klären Sie von Anfang an, wer was zahlt: Das ist die häufigste Quelle für Missverständnisse.</p>

<h3>Die Gäste</h3>
<p>Denken Sie großzügig: das aktuelle Team, aber auch frühere Kollegen, die inzwischen woanders arbeiten, langjährige Kunden oder Partner und warum nicht den Ehepartner oder die Ehepartnerin. Bitten Sie die Person, die geht, um eine Liste der Menschen, die ihr wichtig sind. Verschicken Sie die Einladung mindestens drei Wochen vorher.</p>

<h3>Die Reden</h3>
<p>Planen Sie zwei oder drei Reden, nicht mehr, und höchstens fünf Minuten pro Rede. Die Führungskraft für den beruflichen Weg, ein enger Kollege für die Anekdoten und die Person, die geht, für das Schlusswort. Die besten Geschichten sammeln Sie vorher unauffällig bei den Kollegen. Verzichten Sie auf die Aufzählung aller Positionen: Erzählen Sie lieber zwei oder drei Geschichten, die alles auf den Punkt bringen.</p>

<h2>Das Buffet für die Abschiedsfeier zum Ruhestand</h2>
<p>Das Buffet macht den meisten Organisatoren Sorgen: Reicht es? Bleibt zu viel übrig? Die Mengen lassen sich recht einfach berechnen, wenn Sie zwei Fragen beantworten: Wie lange dauert die Feier, und ersetzt sie eine Mahlzeit?</p>

<h3>Das passende Format</h3>
<ul>
<li><strong>Kaffee und Kuchen</strong> (am Nachmittag, eine Stunde): der Klassiker für einen Abschied im Büro. Kuchen vom Bäcker oder selbst gebacken, Kaffee, Tee, Saft, ein paar herzhafte Kleinigkeiten.</li>
<li><strong>Der Umtrunk mit Fingerfood</strong> (eine bis anderthalb Stunden, nach Feierabend): ein paar herzhafte Häppchen, etwas Süßes, Getränke und ein Glas Sekt zum Anstoßen.</li>
<li><strong>Das Fingerfood-Buffet am Abend</strong> (zwei Stunden und mehr, ab etwa 18 Uhr): Es ersetzt das Abendessen, die Häppchen müssen also sättigender und zahlreicher sein.</li>
<li><strong>Das Buffet als Mahlzeit</strong> (mittags oder an einem Samstag mit der Familie): Salate, kalte oder warme Gerichte, Käse, Dessert, wie ein richtiges Essen.</li>
</ul>

<h3>Die Mengen pro Person</h3>
<p>Die folgenden Werte sind gängige Richtwerte von Caterern. Rechnen Sie 10 % Reserve dazu, wenn Sie nicht genau wissen, wie viele Gäste kommen.</p>
<table>
<thead><tr><th>Format</th><th>Herzhaft</th><th>Süß</th><th>Getränke</th></tr></thead>
<tbody>
<tr><td>Kaffee und Kuchen (1 Std.)</td><td>2 bis 3 kleine Häppchen</td><td>1 bis 2 Stück Kuchen</td><td>2 bis 3 Tassen oder Gläser</td></tr>
<tr><td>Umtrunk (1 bis 1,5 Std.)</td><td>6 bis 8 Häppchen</td><td>2 bis 3 Stück, oder ein Stück Kuchen</td><td>2 bis 3 Gläser</td></tr>
<tr><td>Fingerfood-Buffet am Abend (ab 2 Std.)</td><td>12 bis 16 Häppchen</td><td>3 bis 5 Stück</td><td>4 bis 5 Gläser</td></tr>
<tr><td>Buffet als Mahlzeit</td><td>Salat oder Vorspeise, Hauptgericht, Käse</td><td>Ein Dessert</td><td>4 bis 5 Gläser</td></tr>
</tbody>
</table>
<p>Wenn Sie selbst einkaufen, ein paar Anhaltspunkte für ein Fingerfood-Buffet am Abend: 50 bis 80 g Aufschnitt und ebenso viel Käse pro Person, ein bis zwei Brötchen oder Brezeln pro Person, eine gute Handvoll Gemüsesticks zum Dippen und einen halben Liter Wasser pro Person. Eine Flasche Wein oder Sekt reicht für etwa sechs Gläser: Rechnen Sie über den Abend mit einer Flasche für zwei bis drei Personen, und mit ebenso vielen alkoholfreien wie alkoholischen Getränken.</p>

<h3>Die Getränke</h3>
<ul>
<li><strong>Das Glas zur Rede</strong>: ein Sekt oder Crémant zum Anstoßen während der Reden. Diese Geste macht den Moment feierlich.</li>
<li><strong>Alkoholfreie Getränke</strong>: Säfte, Schorlen, Mineralwasser, eine selbst gemachte Limonade. Viele Gäste fahren noch Auto oder trinken keinen Alkohol: Planen Sie großzügig.</li>
<li><strong>Alkohol im Betrieb</strong>: Ob und welcher Alkohol im Unternehmen erlaubt ist, kann die Hausordnung oder eine betriebliche Regelung festlegen, und manche Betriebe verbieten ihn ganz. Fragen Sie vorher bei der Personalabteilung nach, bevor Sie Sekt oder Bier einplanen.</li>
<li><strong>Der Kaffee</strong> zum Schluss, vor allem, wenn die Feier mittags stattfindet.</li>
</ul>

<h3>Das Budget fürs Buffet</h3>
<p>Als grobe Orientierung, je nach Region:</p>
<ul>
<li><strong>Selbst gemachtes</strong> oder gemeinsames Buffet: etwa 5 bis 10&nbsp;€ pro Person, Getränke inklusive.</li>
<li><strong>Gemischtes Buffet</strong> (ein paar Platten vom Caterer, der Rest gekauft oder selbst gemacht): etwa 10 bis 15&nbsp;€ pro Person.</li>
<li><strong>Kompletter Caterer</strong> mit Service: oft 20 bis 35&nbsp;€ pro Person und mehr für ein Fingerfood-Buffet am Abend.</li>
</ul>
<p>Holen Sie immer zwei oder drei Angebote ein, und stellen Sie die unangenehmen Fragen: Sind Service, Geschirr, Lieferung und Abholung inbegriffen?</p>

<h3>Selbst gemacht, Caterer oder Mitbring-Buffet?</h3>
<ul>
<li><strong>Das Mitbring-Buffet</strong>: Jeder Kollege bringt etwas mit. Gesellig und fast kostenlos, unter einer Bedingung: eine gemeinsame Liste, in die jeder einträgt, was er mitbringt (herzhaft, süß, Getränke). Sonst haben Sie am Ende zwölf Nudelsalate und keinen Nachtisch.</li>
<li><strong>Der Caterer</strong>: kein Stress, schön angerichtet, aber teurer. Ideal ab fünfzig Personen.</li>
<li><strong>Die Mischung</strong>: die herzhaften Platten vom Caterer oder der Metzgerei, der Kuchen oder die Torte vom Bäcker oder Konditor, die Getränke aus dem Supermarkt. Oft der beste Kompromiss.</li>
</ul>

<h3>Ideen fürs Buffet</h3>
<p><strong>Herzhaft:</strong> Mini-Quiches, herzhafte Muffins, kleine Gläser mit Dips (Hummus, Guacamole, Tzatziki), Wraps in Scheiben, Tomate-Mozzarella-Spieße, Laugengebäck, Mini-Frikadellen, belegte Brötchenhälften, eine Platte mit Aufschnitt und Käse, Gemüsesticks mit zwei oder drei Dips, ein Kartoffel- oder Nudelsalat.</p>
<p><strong>Süß:</strong> Blechkuchen, Muffins, Obstspieße, Cookies, kleine Törtchen, und vor allem <strong>die Torte</strong>, mit einer Botschaft oder einem Foto der Person, die geht.</p>
<p><strong>Die persönliche Note:</strong> die Lieblingsgerichte der gefeierten Person, eine Spezialität aus ihrer Heimatregion, oder ein Buffet, das ihren Ruhestand ankündigt: eine Weltreise in Häppchen, wenn sie vom Reisen träumt, ein Buffet aus dem Gemüsegarten, wenn sie endlich Zeit für den Garten hat.</p>
<p>Ein letzter Tipp: Denken Sie an besondere Ernährungsweisen (vegetarisch, glutenfrei, ohne Schweinefleisch) und beschriften Sie die Platten. Niemand rät gern, was in einem Glas steckt.</p>

<h2>Ideen fürs Programm der Abschiedsfeier</h2>
<h3>Klassiker, die immer funktionieren</h3>
<ul>
<li><strong>Die Diashow der Jahre</strong>: Teamfotos, Betriebsausflüge, Weihnachtsfeiern. Bitten Sie die Kollegen einen Monat vorher um Fotos. Alte Fotos sorgen immer für Lacher.</li>
<li><strong>Das Karriere-Quiz</strong>: In welchem Jahr hat sie angefangen? Wo stand ihr erster Schreibtisch? Welche Software hat sie am meisten verflucht? In Teams, mit einem symbolischen Preis.</li>
<li><strong>Das Gästebuch</strong>: ein schönes Heft, das während der Feier herumgeht, damit jeder ein paar Worte schreibt. Für Kollegen, die nicht da sind oder im Homeoffice arbeiten, sammeln Sie die Nachrichten vorher und kleben sie ein.</li>
<li><strong>Das Überraschungsvideo</strong>: ein paar Videobotschaften von ehemaligen Kollegen, der Familie oder sogar einem treuen Kunden.</li>
</ul>

<h3>Originelle Ideen für den Abschied in den Ruhestand</h3>
<ul>
<li><strong>Die gemeinsame digitale Einwegkamera</strong>: ein QR-Code auf den Tischen, jeder Gast scannt ihn mit dem Handy und macht ein paar Aufnahmen, ohne sie zu sehen. Am nächsten Tag erscheinen alle Fotos auf einmal in einem privaten Album, das die gefeierte Person behalten kann. Das bietet <a href="/depart-retraite">Time to Flash für den Abschied in den Ruhestand</a>, ohne App-Installation, für 14,99&nbsp;€ bei 50 Gästen.</li>
<li><strong>Das Audio-Gästebuch</strong>: Jeder Gast nimmt mit seinem Handy eine kurze Sprachnachricht auf, mit einem Selfie dazu. Die Organisatoren hören sie sich an und können sie der Person vorspielen, die geht. Bei Time to Flash ist das eine Option für 9,99&nbsp;€, die Sie zu jedem kostenpflichtigen Paket dazubuchen können.</li>
<li><strong>Die Ruhestandsurkunde</strong>: eine feierliche Urkunde für den „frischgebackenen Ruheständler“, überreicht mit einem Überlebenspaket (ein kaputter Wecker, ein leerer Terminkalender, ein Gärtnerhut, ein Angelschein). Bei den Reden ein garantierter Lacher.</li>
<li><strong>Die Abschiedszeitung</strong>: eine selbst gemachte Zeitung, die die berufliche Laufbahn erzählt, mit großer Schlagzeile, Archivfotos und „Stimmen“ aus dem Kollegenkreis. Sie wird während der Feier gelesen und danach eingerahmt.</li>
<li><strong>Die Wunschkarte</strong>: eine große Welt- oder Deutschlandkarte, auf der jeder einen Ort markiert, den die Person besuchen sollte, mit ein paar Worten dazu. So geht sie mit ihrem Reiseprogramm für den Ruhestand nach Hause.</li>
<li><strong>Die Ratschlag-Box</strong>: Jeder Gast schreibt auf eine Karte einen Tipp für einen gelungenen Ruhestand, ernst gemeint oder nicht. Ein paar werden laut vorgelesen, und die Box nimmt die gefeierte Person mit.</li>
<li><strong>Das Musikquiz ihrer Laufbahn</strong>: die Hits aus dem Jahr ihres Einstiegs, dann aus jedem Jahrzehnt im Unternehmen. In Teams, mit Buzzer.</li>
<li><strong>Das Lieblingssprüche-Bingo</strong>: ein Raster mit den typischen Sätzen der Person, die geht. Während der Reden wird angekreuzt.</li>
</ul>
<p>Ein oder zwei Programmpunkte genügen: Im Mittelpunkt stehen die Reden und die Momente, in denen jeder der Person persönlich ein paar Worte sagt.</p>

<h2>Das Gruppengeschenk zum Ruhestand</h2>
<p>Die Sammlung ist die Regel, oft mit einer Abschiedskarte, die herumgeht. Starten Sie sie einen Monat vorher, mit einer klaren Nachricht und ohne festen Betrag: Jeder gibt, was er möchte, und niemand soll sich verpflichtet fühlen. Ein paar Ideen, je nach Person:</p>
<ul>
<li><strong>Das Ruhestandsprojekt</strong>: Träumt die Person vom Reisen, Gärtnern, Malen oder Radfahren? Finanzieren Sie den ersten Schritt: einen Reisegutschein, Ausrüstung, einen Kurs.</li>
<li><strong>Ein Erlebnis</strong>: ein Wochenende, eine Ballonfahrt, ein Essen in einem besonderen Restaurant, Konzertkarten.</li>
<li><strong>Die Erinnerung ans Team</strong>: ein Buch mit einer Nachricht und einem Foto von jedem Kollegen. Oft das Geschenk, das am längsten aufbewahrt wird.</li>
<li><strong>Das Fotoalbum der Feier</strong>: die Fotos, die alle während der Feier gemacht haben, in einem Album gesammelt. Mit Time to Flash können Sie Abzüge direkt aus dem Album bestellen und sie ein paar Tage später als Erinnerung überreichen.</li>
</ul>
<p>Eine gute Kombination: ein Geschenk, das nach vorne blickt (das Ruhestandsprojekt), und eine Erinnerung, die zurückblickt (das Buch oder das Album).</p>

<h2>Der typische Ablauf einer Abschiedsfeier</h2>
<p>Für eine Feier nach Feierabend von etwa zwei Stunden hat sich dieser Ablauf bewährt:</p>
<ol>
<li><strong>Ankommen (30 Minuten)</strong>: Getränke, Buffet, das Gästebuch geht herum, der QR-Code der Kamera liegt auf den Tischen. Die Gäste kommen nach und nach, lassen Sie ihnen Zeit.</li>
<li><strong>Die Reden (15 Minuten)</strong>: wenn die meisten da sind, und nicht zu spät, damit noch niemand gegangen ist. Die Führungskraft, ein enger Kollege, dann die gefeierte Person.</li>
<li><strong>Das Geschenk (5 Minuten)</strong>: direkt nach den Reden, vor allen überreicht. Bitten Sie jemanden, das Foto zu machen.</li>
<li><strong>Der Programmpunkt (20 bis 30 Minuten)</strong>: Diashow, Quiz oder Überraschungsvideo. Einer reicht.</li>
<li><strong>Offenes Ende</strong>: Jeder kommt vorbei und sagt der Person ein paar Worte. Oft ihr liebster Moment.</li>
</ol>
<p>Für eine längere Feier am Samstag mit der Familie behalten Sie dieselbe Reihenfolge und ergänzen ein Essen und etwas Musik.</p>

<h2>Fehler, die Sie vermeiden sollten</h2>
<ul>
<li><strong>Planen, ohne zu fragen</strong>: Manche Menschen stehen ungern im Mittelpunkt. Fragen Sie, was sich die Person wünscht, auch wenn Sie einen Teil als Überraschung behalten.</li>
<li><strong>Zu lange Reden</strong>: Nach fünf Minuten sinkt die Aufmerksamkeit. Drei kurze Reden sind besser als eine lange.</li>
<li><strong>Witze, die verletzen</strong>: eine lustige Anekdote, ja. Eine Anspielung auf einen Konflikt oder die Gesundheit, nein. Im Zweifel lieber weglassen.</li>
<li><strong>Die Abwesenden vergessen</strong>: Kollegen im Homeoffice, an einem anderen Standort oder bereits ausgeschieden möchten oft dabei sein. Schicken Sie ihnen den Link zur Sammlung und laden Sie sie ein, eine Nachricht zu schicken.</li>
<li><strong>Die Fotos vergessen</strong>: die häufigste Falle. Alle genießen den Moment, niemand fotografiert, und am nächsten Tag bleibt nichts. Bestimmen Sie jemanden, oder geben Sie allen eine Kamera.</li>
</ul>

<h2>Worauf es ankommt</h2>
<p>Eine gelungene Abschiedsfeier braucht wenig: das richtige Datum, die richtigen Menschen, zwei oder drei ehrliche Reden und eine Erinnerung zum Mitnehmen. Mehr Ideen nach Anlass finden Sie unter <a href="/occasions">alle Anlässe</a>.</p>
`,
    faq: [
      {
        q: 'Wie organisiert man eine Abschiedsfeier zum Ruhestand?',
        a: 'Legen Sie das Datum mit der Person fest, die geht (oft die letzte Arbeitswoche, nach Feierabend), wählen Sie den Ort (Betrieb, Restaurant oder gemieteter Raum), klären Sie, wer zahlt (Unternehmen, Sammlung, Beitrag der Person), laden Sie drei Wochen vorher großzügig ein und planen Sie zwei oder drei kurze Reden.',
      },
      {
        q: 'Welches Gruppengeschenk zum Ruhestand?',
        a: 'Ein Geschenk passend zu den Plänen für den Ruhestand (Reisen, Garten, Ausrüstung für ein Hobby), ein Erlebnis oder eine Erinnerung ans Team wie ein Buch mit Nachrichten oder ein Album mit den Fotos der Feier und Abzügen.',
      },
      {
        q: 'Wie viel gibt man in die Sammlung zum Ruhestand?',
        a: 'Es gibt keine feste Regel: Jeder gibt nach seinen Möglichkeiten und je nachdem, wie nah er der Person steht. Starten Sie die Sammlung ohne festen Betrag, damit sich niemand verpflichtet fühlt.',
      },
      {
        q: 'Was gehört auf ein Buffet zum Abschied in den Ruhestand?',
        a: 'Herzhafte Häppchen, die sich im Stehen essen lassen (Mini-Quiches, Wraps, Spieße, Laugengebäck, belegte Brötchen, Aufschnitt und Käse), etwas Süßes und eine persönliche Torte, reichlich alkoholfreie Getränke und ein Sekt zum Anstoßen. Dazu eine persönliche Note: die Lieblingsgerichte der Person oder eine Spezialität aus ihrer Heimat.',
      },
      {
        q: 'Wie viele Häppchen pro Person für eine Abschiedsfeier?',
        a: 'Für einen Umtrunk von einer bis anderthalb Stunden rechnen Sie mit 6 bis 8 herzhaften und 2 bis 3 süßen Häppchen pro Person. Ersetzt das Buffet das Abendessen, sind es 12 bis 16 herzhafte und 3 bis 5 süße. Planen Sie 10 % Reserve ein.',
      },
      {
        q: 'Welche originelle Idee für die Abschiedsfeier zum Ruhestand?',
        a: 'Eine gemeinsame digitale Einwegkamera, die alle Gäste mit ihrem Handy nutzen, ein Audio-Gästebuch mit Sprachnachrichten, eine Ruhestandsurkunde mit Überlebenspaket, eine Abschiedszeitung über die Laufbahn, eine Weltkarte, auf der jeder ein Reiseziel markiert, oder ein Musikquiz mit den Hits aus ihren Jahren im Unternehmen.',
      },
    ],
  },
  'photos-week-end-entre-amis': {
    title: 'Fotos vom Wochenende mit Freunden teilen, ohne Chaos',
    excerpt: 'Fotos vom Wochenende oder Urlaub mit Freunden teilen: Lösungen gegen das WhatsApp-Chaos mit 400 Bildern und Tipps für ein schönes Gruppenalbum.',
    caption: 'Eine Freundesgruppe auf den Stufen eines Landhauses bei Sonnenuntergang',
    body: `
<p>Ein Wochenende mit Freunden endet immer gleich. Im Auto auf der Rückfahrt schreibt jemand in die Gruppe: „Schickt eure Fotos!“ Zwei Tage lang trudeln 400 Bilder ein, vermischt mit Nachrichten und Sprachnachrichten. Drei Wochen später findet niemand mehr das Sonnenuntergangsfoto, und das Album, von dem alle gesprochen haben, gibt es nicht.</p>
<p>So teilen Sie die Fotos vom Wochenende oder Urlaub mit Freunden ohne dieses Chaos, und machen daraus ein Album, das Sie gern wieder öffnen.</p>

<h2>Das Problem mit der WhatsApp-Gruppe</h2>
<p>Die Gruppenunterhaltung ist der natürliche Reflex, und sie hat echte Nachteile:</p>
<ul>
<li><strong>Die Fotos werden komprimiert</strong>: Auf dem Handy sehen sie gut aus, verlieren aber an Schärfe. Ein ordentlicher Abzug wird danach schwierig.</li>
<li><strong>Alles ist vermischt</strong>: Fotos, Nachrichten, Links, Sprachnachrichten. Um ein Bild zu finden, muss man Hunderte Nachrichten zurückscrollen.</li>
<li><strong>Jeder schickt alles</strong>: zwölf Versionen desselben Gruppenfotos, ganze Serien, und die guten Bilder gehen unter.</li>
<li><strong>Nichts ist geordnet</strong>: Die Fotos füllen den Speicher jedes Handys, und niemand sortiert sie.</li>
</ul>
<p>Einen ausführlicheren Vergleich zwischen WhatsApp-Gruppe und geteiltem Album finden Sie in <a href="/journal/whatsapp-google-photos-mariage">WhatsApp, Google Fotos oder eigene App</a>. Was für eine Hochzeit gilt, gilt auch fürs Wochenende.</p>

<h2>Die Lösungen</h2>

<h3>Ein geteiltes Album in Google Fotos oder iCloud</h3>
<p>Ein gemeinsames Album, in das jeder seine Fotos legt. Die Qualität bleibt erhalten, und alles ist an einem Ort. Zwei Grenzen: Alle müssen auf demselben System sein (in ein iCloud-Album können Freunde mit Android keine Fotos hochladen, ein Google-Album verlangt ein Google-Konto), und jeder muss ans Hochladen denken. Unter motivierten Freunden klappt das; in einer größeren Gruppe bleibt das Album oft halb leer.</p>

<h3>Ein geteilter Ordner</h3>
<p>Ein Ordner in einem Online-Speicher. Praktisch zum Einsammeln, wenig schön zum Anschauen. Ein gutes Archiv, aber kein Album.</p>

<h3>Die gemeinsame Einwegkamera</h3>
<p>Das Prinzip ist ein anderes: Statt alles zu knipsen und hinterher zu sortieren, hat jeder für die ganze Reise eine begrenzte Zahl an Aufnahmen, wie bei einer echten Einwegkamera. Man scannt einen QR-Code, die Kamera öffnet sich im Browser, ohne App und ohne Konto. Die eigenen Fotos sieht man nicht. Nach der Rückkehr, zur gewählten Uhrzeit, erscheint alles auf einmal in einem gemeinsamen Album.</p>
<p>Für eine Reise über mehrere Tage arbeitet <a href="/week-end-entre-amis">Time to Flash fürs Wochenende mit Freunden</a> mit einem Start- und einem Enddatum sowie einem Präsentationstermin und schickt den Teilnehmern während der Reise Erinnerungen, damit sie an ihre Aufnahmen denken. Für zehn Freunde kostet es 1,99 € als Einmalzahlung, bis fünf Personen ist es kostenlos.</p>
<p>Der Vorteil: weniger Fotos, aber ausgewählte. Und die Präsentation wird zum Anlass, sich wiederzusehen.</p>

<h2>So entsteht ein schönes Wochenend- oder Urlaubsalbum</h2>
<ol>
<li><strong>Wählen Sie das Werkzeug vor der Abreise</strong>, nicht nach der Rückkehr. Sind die Fotos erst verstreut, sammelt sie niemand mehr ein.</li>
<li><strong>Bestimmen Sie einen Albumverantwortlichen</strong>: die Person, die das Album anlegt, den Link schickt und freundlich erinnert.</li>
<li><strong>Vermeiden Sie Doppelte</strong>: Eine Person teilt das Gruppenfoto, die anderen behalten ihre Serien für sich.</li>
<li><strong>Sortieren Sie nach der Rückkehr</strong>: Behalten Sie dreißig bis fünfzig Fotos, die die Reise erzählen, in chronologischer Reihenfolge.</li>
<li><strong>Geben Sie dem Album einen gemeinsamen Look</strong>: Derselbe Filter auf allen Fotos sorgt für Einheit. Im Album von Time to Flash können Sie zwischen fünf Filmlooks wählen, darunter ein warmer, körniger Einweg-Look mit eingeblendetem Datum, der in den heruntergeladenen Dateien erhalten bleibt.</li>
<li><strong>Lassen Sie drucken</strong>: ein paar Abzüge, aus dem Album bestellt, für jeden oder für die Pinnwand im Ferienhaus nächstes Jahr.</li>
</ol>

<h2>Während der Reise: Wer fotografiert?</h2>
<p>In jeder Gruppe gibt es einen inoffiziellen Fotografen. Er kommt mit dreihundert Fotos zurück und ist auf keinem zu sehen. Für ein gerechteres Album:</p>
<ul>
<li><strong>Lassen Sie die Kamera kreisen</strong>: Jeder macht ein paar Fotos, jeder ist auf denen der anderen.</li>
<li><strong>Denken Sie an die ruhigen Momente</strong>: der Kaffee am Morgen, der Spaziergang, die Fahrt. Oft genau die, die man später vermisst.</li>
<li><strong>Legen Sie das Handy den Rest der Zeit weg</strong>: Mit wenigen Aufnahmen pro Person genießt man mehr und fotografiert besser.</li>
</ul>

<h2>Der Abend der Präsentation</h2>
<p>Wenn Sie eine verzögerte Präsentation wählen, nutzen Sie sie: Legen Sie sie auf einen Zeitpunkt, an dem sich alle treffen können, persönlich oder am Telefon. Ein Treffen eine Woche nach der Rückkehr, ein Videoanruf am Sonntagabend oder einfach der nächste Morgen auf der Heimfahrt. Die Fotos gemeinsam zu entdecken heißt, die Reise ein zweites Mal zu erleben, und oft beginnt so die Planung der nächsten.</p>

<h2>Ideen für Gruppenfotos</h2>
<p>Die besten Gruppenfotos sind oft die geplanten. Ein paar Ideen:</p>
<ul>
<li><strong>Das Ankunftsfoto</strong>: alle vor dem Haus oder dem Auto, gerade angekommen.</li>
<li><strong>Jeden Tag derselbe Ort</strong>: gleicher Ausschnitt, gleiche Uhrzeit. Nebeneinander erzählen sie die Reise.</li>
<li><strong>Hinter den Kulissen</strong>: die chaotische Küche, die Kartenrunde, das Nickerchen in der Sonne.</li>
<li><strong>Gekreuzte Porträts</strong>: Jeder fotografiert die Person rechts von sich, ohne Vorwarnung.</li>
<li><strong>Das Essen von oben</strong>: der volle Tisch, im Stehen auf einem Stuhl fotografiert.</li>
<li><strong>Das Abschiedsfoto</strong>: dieselben Leute am selben Ort, mit drei Tagen Müdigkeit mehr.</li>
</ul>
<p>Eine kleine Challenge macht es lustiger: eine Liste von Fotos, die während der Reise abgehakt werden. Mit begrenzten Aufnahmen überlegt jeder, bevor er abdrückt.</p>

<h2>Die richtige Gewohnheit</h2>
<p>Das Geheimnis eines schönen Urlaubsalbums mit Freunden ist nicht die Zahl der Fotos, sondern vor der Abreise zu entscheiden, wohin sie kommen. Für eine längere Reise sehen Sie sich unsere Seite <a href="/vacances-entre-amis">Urlaub mit Freunden</a> an.</p>
`,
    faq: [
      {
        q: 'Wie teilt man Fotos vom Wochenende mit Freunden?',
        a: 'Meiden Sie die Gruppenunterhaltung, die alles komprimiert und vermischt. Legen Sie vor der Abreise ein gemeinsames Album an (Google Fotos, oder iCloud, wenn alle ein iPhone haben) oder nutzen Sie eine gemeinsame Einwegkamera wie Time to Flash, die die Fotos aller in einem Album sammelt, das nach der Rückkehr präsentiert wird.',
      },
      {
        q: 'Wie gestaltet man ein Urlaubsfotoalbum mit Freunden?',
        a: 'Wählen Sie das Werkzeug vor der Abreise, bestimmen Sie einen Verantwortlichen, vermeiden Sie Doppelte, sortieren Sie nach der Rückkehr dreißig bis fünfzig Fotos in Reihenfolge, geben Sie allen Fotos denselben Look und lassen Sie die besten drucken.',
      },
      {
        q: 'Funktioniert ein geteiltes Album zwischen iPhone und Android?',
        a: 'In ein iCloud-Album können Android-Nutzer keine Fotos hochladen. Ein Google-Fotos-Album verlangt ein Google-Konto. Time to Flash funktioniert in jedem Browser, auf iPhone wie auf Android, ohne Konto.',
      },
      {
        q: 'Was kostet eine gemeinsame Einwegkamera fürs Wochenende?',
        a: 'Mit Time to Flash ist es bis fünf Teilnehmer kostenlos, danach 1,99 € für zehn und 4,99 € für dreißig, als Einmalzahlung ohne Abo.',
      },
    ],
  },
  'appareil-photo-jetable-evjf': {
    title: 'Einwegkamera für den JGA: analog oder App?',
    excerpt: 'Einwegkamera für den Junggesellenabschied: die echten Kosten der analogen Kamera, ihre Nachteile, die digitale Alternative und Foto-Challenges.',
    caption: 'Ein Junggesellenabschied in einer Gasse, eine Freundin richtet eine Einwegkamera auf die Gruppe',
    body: `
<p>Die Einwegkamera ist ein Klassiker beim Junggesellenabschied (JGA) geworden. Man steckt jedem eine in die Tasche, stellt ein paar Aufgaben und entdeckt die Fotos später. Bleibt eine praktische Frage: echte analoge Einwegkameras oder eine App auf dem Handy? Hier der ehrliche Vergleich, mit Budget, Nachteilen und Ideen für Foto-Challenges.</p>

<h2>Warum eine Einwegkamera beim JGA?</h2>
<p>Weil sie verändert, wie man fotografiert. Mit begrenzten Aufnahmen wählt man seine Momente. Ohne Display zum Kontrollieren macht man das Foto nicht zehnmal. Und die Überraschung beim Entwickeln verlängert das Fest: Man erlebt das Wochenende noch einmal, während man die Bilder entdeckt. Genau der Geist eines Junggesellinnen- oder Junggesellenabschieds.</p>

<h2>Die analoge Einwegkamera: das echte Budget</h2>
<p>Die Preise schwanken stark je nach Modell, Händler und Labor, aber hier realistische Größenordnungen:</p>
<ul>
<li><strong>Die Kamera</strong>: meist zwischen 12 und 25 € pro Stück für eine Einwegkamera mit 27 Aufnahmen. Personalisierte Modelle (eigene Hülle, passende Farbe) kosten oft mehr.</li>
<li><strong>Die Entwicklung</strong>: oft zwischen 10 und 20 € pro Film für Entwicklung und Scan, mehr, wenn Sie auch Abzüge möchten.</li>
</ul>
<p>Für eine Gruppe von acht Personen mit je einer Kamera kommen schnell 200 € oder mehr zusammen. Sie können sparen, indem sich zwei eine Kamera teilen, dafür gibt es weniger Fotos pro Person.</p>

<h2>Die Nachteile der analogen Kamera</h2>
<ul>
<li><strong>Die Entwicklung</strong>: Alle Kameras müssen eingesammelt und ins Labor gebracht werden, und oft wartet man ein bis zwei Wochen.</li>
<li><strong>Misslungene Fotos</strong>: vergessener Blitz, Finger vor der Linse, Gegenlicht. Nachts kann ein guter Teil der Aufnahmen zu dunkel werden.</li>
<li><strong>Verlorene Kameras</strong>: Ein JGA-Wochenende bedeutet Taschen, Bars und Taxis. Oft kommt eine Kamera nie zurück, mit ihren 27 Erinnerungen.</li>
<li><strong>Das Teilen</strong>: Nach dem Scan kommen die Fotos stapelweise und müssen an alle verteilt werden.</li>
</ul>
<p>Der Charme ist echt, und manche Gruppen nehmen das bewusst in Kauf. Aber man sollte es vor dem Kauf wissen. Denselben Vergleich für die Hochzeit finden Sie in <a href="/journal/appareil-photo-jetable-mariage">Einwegkamera zur Hochzeit: analog oder App?</a></p>

<h2>Die digitale Alternative</h2>
<p>Eine Einwegkamera auf dem Handy behält, was den Charme ausmacht, ohne die Nachteile des Films. Mit <a href="/evjf-evg">Time to Flash für den JGA</a>:</p>
<ul>
<li>jeder scannt einen QR-Code, und die Kamera öffnet sich im Browser, ohne App und ohne Konto;</li>
<li>jeder hat eine begrenzte Zahl an Aufnahmen (3 bis 15, Sie entscheiden);</li>
<li>niemand sieht seine Fotos vor der Präsentation;</li>
<li>alle Fotos landen in einem privaten Album, auf Wunsch mit einem warmen, körnigen Einweg-Look und eingeblendetem Datum;</li>
<li>über ein Wochenende bekommen die Teilnehmer Erinnerungen, damit sie an ihre Aufnahmen denken.</li>
</ul>
<p>Zum Budget: bis fünf Teilnehmer kostenlos, 1,99 € für zehn, 4,99 € für dreißig, als Einmalzahlung. Nichts, was im Taxi liegen bleibt, und kein Labor, das man suchen muss.</p>
<p>Die Kehrseite: kein Gegenstand zum Anfassen und keine sofortigen Abzüge. Sie können aber Abzüge aus dem Album bestellen, sobald die Fotos für alle sichtbar sind.</p>

<h2>Analog oder App: die Zusammenfassung</h2>
<table>
<thead><tr><th></th><th>Analoge Einwegkamera</th><th>Digitale Einwegkamera</th></tr></thead>
<tbody>
<tr><td><strong>Budget für 8</strong></td><td>Oft 200 € oder mehr</td><td>1,99 €</td></tr>
<tr><td><strong>Zum Anfassen</strong></td><td>Ja</td><td>Nein, das Handy</td></tr>
<tr><td><strong>Entwicklung</strong></td><td>Labor, ein bis zwei Wochen</td><td>Keine</td></tr>
<tr><td><strong>Verlustrisiko</strong></td><td>Real</td><td>Keins</td></tr>
<tr><td><strong>Fotos bei Nacht</strong></td><td>Oft dunkel</td><td>Wie das Handy</td></tr>
<tr><td><strong>Teilen</strong></td><td>Muss verteilt werden</td><td>Gemeinsames Album</td></tr>
</tbody>
</table>

<h2>Die JGA-Einwegkamera in 4 Schritten</h2>
<ol>
<li><strong>Legen Sie das Event ein paar Tage vorher an</strong>: Name des JGA, Zahl der Teilnehmer, Aufnahmen pro Person und Uhrzeit der Präsentation.</li>
<li><strong>Wählen Sie die richtige Zahl an Aufnahmen</strong>: Für einen Tag reichen 8 bis 10 pro Person; für ein Wochenende eher 12 bis 15.</li>
<li><strong>Teilen Sie den QR-Code</strong>: Schicken Sie ihn vor der Abfahrt in die Gruppe oder drucken Sie ihn auf ein kleines Kärtchen für jedes Goodie-Bag.</li>
<li><strong>Bewahren Sie das Geheimnis</strong>: Wenn die Braut oder der Bräutigam nichts wissen darf, erwähnen Sie es erst im letzten Moment und starten Sie das Spiel zu Beginn des Wochenendes.</li>
</ol>

<h2>Ideen für Foto-Challenges beim JGA</h2>
<p>Mit begrenzten Aufnahmen kommen Challenges erst richtig zur Geltung. Drucken Sie eine Liste aus oder schicken Sie sie in die Gruppe:</p>
<ul>
<li>die Braut (oder der Bräutigam) mit einer fremden Person in derselben Farbe;</li>
<li>die ganze Gruppe in einem Fotoautomaten, einem Auto oder einem Aufzug;</li>
<li>ein Foto, das ein altes Kinderfoto nachstellt;</li>
<li>der beste Lachanfall des Tages;</li>
<li>das unwahrscheinlichste Outfit, das auf der Straße auftaucht;</li>
<li>der feierlichste Toast;</li>
<li>ein Porträt jeder Person, aufgenommen von jemand anderem;</li>
<li>der genaue Moment, in dem die geheime Mission erfüllt wurde;</li>
<li>die Gruppe beim Aufwachen am nächsten Morgen, unretuschiert.</li>
</ul>
<p>Vergeben Sie einen Punkt pro erfüllter Challenge und verkünden Sie die Rangliste zusammen mit den Fotos.</p>

<h2>Wann werden die Fotos präsentiert?</h2>
<p>Zwei Möglichkeiten, beide hervorragend.</p>
<p><strong>Nach der Rückkehr</strong>: am nächsten Tag oder am Abend der Heimkehr, wenn alle zu Hause sind. Man erlebt das Wochenende gemeinsam noch einmal, aus der Ferne, in der Gruppenunterhaltung. Die einfachste Wahl.</p>
<p><strong>Am Hochzeitstag</strong>: Sie legen die Präsentation auf den großen Tag oder den Tag danach. Die JGA-Fotos werden zu einer weiteren Überraschung und einem schönen Geschenk für Braut oder Bräutigam. Achten Sie auf den Zeitraum: Bei Time to Flash wird das Album sechs Monate aufbewahrt, es funktioniert also, wenn die Hochzeit in den folgenden Monaten stattfindet. Und vor der Präsentation können Sie als Organisator ein etwas zu kompromittierendes Foto ausblenden.</p>
<p>Mehr Ideen nach Anlass finden Sie unter <a href="/occasions">alle Anlässe</a>.</p>
`,
    faq: [
      {
        q: 'Was kostet eine Einwegkamera für den JGA?',
        a: 'Eine analoge Einwegkamera kostet meist zwischen 12 und 25 € pro Stück, dazu 10 bis 20 € pro Film für Entwicklung und Scan, je nach Modell und Labor. Für eine Gruppe von acht rechnen Sie oft mit 200 € oder mehr. Eine digitale Einwegkamera wie Time to Flash ist bis fünf Teilnehmer kostenlos und kostet 1,99 € für zehn.',
      },
      {
        q: 'Gibt es personalisierte Einwegkameras für den JGA?',
        a: 'Ja, es gibt analoge Einwegkameras mit personalisierter Hülle, meist zu einem höheren Preis. Bei Time to Flash trägt das Event den Namen, den Sie wählen, und Sie können ein Plakat mit dem QR-Code für die Gruppe drucken.',
      },
      {
        q: 'Welche Einwegkamera-App eignet sich für den JGA?',
        a: 'Time to Flash funktioniert ohne App-Installation: Jeder scannt einen QR-Code, macht eine begrenzte Zahl an Fotos, ohne sie zu sehen, und alles wird zur gewählten Uhrzeit auf einmal in einem privaten Album präsentiert.',
      },
      {
        q: 'Kann man die JGA-Fotos am Hochzeitstag präsentieren?',
        a: 'Ja, legen Sie den Präsentationstermin einfach auf den Hochzeitstag oder den Tag danach. Da das Album bei Time to Flash sechs Monate aufbewahrt wird, klappt das, wenn die Hochzeit in den Monaten nach dem JGA stattfindet.',
      },
    ],
  },
}
