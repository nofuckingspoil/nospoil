// ============================================================
//  Journal : articles « wedding-planners » (10/10/2026).
//  POSTS : articles français (même forme que ALL_POSTS dans journal.js).
//  POSTS_EN / POSTS_DE : traductions, une entrée par slug
//  (title, excerpt, caption, body, faq), comme journal-en.js.
//  Trois articles pour les wedding planners (vouvoiement, cible: 'pro',
//  appel final vers /pro) et un déroulé du jour J pour pros et mariés
//  (tutoiement).
// ============================================================

export const POSTS = [
  {
    // Requêtes : « prestations wedding planner », « services wedding planner »,
    // « offre wedding planner », « idées de services complémentaires wedding
    // planner », « comment se démarquer wedding planner ».
    // Google (10/10/2026) : en tête, des guides de création d'activité
    // (Superindep, Abby, Legalplace) et des annuaires (Mariages.net, 1001salles)
    // qui listent les trois formules (complète, partielle, jour J) et les
    // missions (budget, prestataires, rétroplanning, coordination). Très peu
    // détaillent les services complémentaires : au mieux une liste (papeterie,
    // design, gestion des invités, location) sans marge ni argumentaire. Côté
    // anglais, les pages sur les « add-on services » (QC Event School, etc.)
    // citent brunch du lendemain, EVJF, mariage à l'étranger, voyage de noces.
    // Angle : chaque service avec intérêt mariés / effort et marge / comment le
    // vendre, tableau récapitulatif, et méthode de présentation (packs).
    slug: 'services-wedding-planner',
    image: '/journal/services-wedding-planner.webp',
    cat: 'Prestataires',
    cible: 'pro',
    title: 'Prestations wedding planner : 12 services pour vous démarquer',
    excerpt: 'Les trois formules classiques, puis 12 services complémentaires à ajouter à votre offre : ce que les mariés y gagnent, la marge, et comment les vendre.',
    author: 'Tom Bréval',
    date: '2026-10-10',
    read: '13 min',
    caption: 'Une wedding planner pose des marque-places sur une table nappée de blanc, la veille d’un mariage, dans une salle encore en travaux',
    body: `
<p>Les prestations d’un wedding planner tiennent souvent en trois lignes sur une plaquette : organisation complète, organisation partielle, coordination du jour J. Les mariés comparent ces trois lignes d’un planner à l’autre, et la discussion finit vite sur le prix. Pour sortir de cette comparaison, il faut une offre qui ne ressemble pas à celle du voisin.</p>
<p>Ce guide reprend les formules de base (ce qu’elles contiennent, comment les cadrer), puis passe en revue <strong>12 services complémentaires</strong> à ajouter à votre offre. Pour chacun : ce que les mariés y gagnent, l’effort ou la marge qu’il représente pour vous, et la manière de le présenter sans avoir l’air de faire du remplissage.</p>

<h2>Les prestations d’un wedding planner : les trois formules de base</h2>
<p>Presque tous les wedding planners en France construisent leur offre autour des trois mêmes formules. Les noms varient, le contenu beaucoup moins.</p>

<h3>L’organisation complète</h3>
<p>Vous prenez le projet de A à Z, souvent 12 à 18 mois avant la date : définition du budget, recherche du lieu, sélection et négociation des prestataires, suivi des contrats et des échéances de paiement, direction artistique, rétroplanning, gestion des invités, puis coordination le jour J. C’est la formule la plus rentable par dossier, mais aussi celle qui mobilise le plus d’heures : un mariage complet, c’est des dizaines de rendez-vous, de visites et d’échanges de mails.</p>

<h3>L’organisation partielle</h3>
<p>Les mariés ont déjà avancé (souvent le lieu et le traiteur sont réservés) et vous confient le reste : quelques prestataires à trouver, la décoration, le déroulé, la coordination. C’est la formule où le périmètre dérape le plus facilement. Écrivez noir sur blanc, dans le devis, la liste des prestataires que vous prenez en charge et le nombre de rendez-vous inclus.</p>

<h3>La coordination du jour J</h3>
<p>Le nom est trompeur : personne ne coordonne bien un mariage qu’il découvre le matin même. En pratique, vous commencez un à trois mois avant : reprise de tous les contrats, appel à chaque prestataire, visite technique du lieu, construction du déroulé, puis présence du matin jusqu’à la soirée. C’est souvent la porte d’entrée des mariés qui pensaient « tout faire eux-mêmes » et qui réalisent, à deux mois du mariage, qu’ils ne veulent pas passer la journée à gérer le traiteur.</p>

<table>
<thead><tr><th>Formule</th><th>Vous démarrez</th><th>Ce que vous prenez en charge</th><th>Fourchette constatée</th></tr></thead>
<tbody>
<tr><td><strong>Organisation complète</strong></td><td>12 à 18 mois avant</td><td>Tout, du budget au jour J</td><td>Environ 3&nbsp;000 à 6&nbsp;000&nbsp;€, bien plus en haut de gamme</td></tr>
<tr><td><strong>Organisation partielle</strong></td><td>4 à 9 mois avant</td><td>Une partie des prestataires, déco, déroulé, jour J</td><td>Environ 1&nbsp;500 à 3&nbsp;500&nbsp;€</td></tr>
<tr><td><strong>Coordination jour J</strong></td><td>1 à 3 mois avant</td><td>Reprise du dossier, déroulé, présence le jour J</td><td>Environ 900 à 2&nbsp;500&nbsp;€</td></tr>
</tbody>
</table>
<p>Ces fourchettes viennent des grilles publiées par des wedding planners et des guides spécialisés en 2026. Elles varient beaucoup selon la région, l’expérience et le nombre d’invités : ce sont des ordres de grandeur, pas une grille à appliquer.</p>
<p><strong>Forfait ou pourcentage ?</strong> Certains planners facturent un pourcentage du budget total (on lit souvent 10 à 15&nbsp;%), mais la plupart affichent un forfait. Le forfait rassure les mariés (ils savent ce qu’ils paient) et vous évite le soupçon de pousser les dépenses pour augmenter vos honoraires.</p>

<h2>Pourquoi ajouter des services complémentaires</h2>
<p>Trois raisons, dans l’ordre d’importance.</p>
<ul>
<li><strong>Vous démarquer.</strong> Sur les trois formules, tous les planners se ressemblent. Ce qui fait signer, c’est souvent un détail que les mariés n’ont vu nulle part ailleurs.</li>
<li><strong>Augmenter le panier moyen</strong> sans multiplier les dossiers. Un service à 300&nbsp;€ vendu sur la moitié de vos mariages pèse vite autant qu’un mariage de plus dans l’année, pour beaucoup moins de week-ends sacrifiés.</li>
<li><strong>Simplifier la vie des mariés.</strong> Un seul interlocuteur au lieu de cinq : c’est précisément ce qu’ils achètent en prenant un wedding planner.</li>
</ul>
<p>Avant la liste, une distinction utile. Un service complémentaire peut se vendre de trois façons :</p>
<ol>
<li><strong>Vous le faites vous-même</strong> (papeterie, design, gestion des invités) : marge forte, mais c’est votre temps.</li>
<li><strong>Vous le sous-traitez et le refacturez</strong> avec une marge : peu de temps, mais vous êtes responsable du résultat.</li>
<li><strong>Vous recommandez un partenaire</strong> : aucun risque, parfois une commission d’apport. Dans ce cas, dites-le clairement aux mariés. La transparence sur ce point est un argument de confiance, pas une faiblesse.</li>
</ol>

<h2>12 services complémentaires pour wedding planner</h2>

<h3>1. Le design et la scénographie</h3>
<p><strong>Pour les mariés :</strong> une direction artistique cohérente, du faire-part aux centres de table, au lieu d’une addition d’idées Pinterest qui ne vont pas ensemble.</p>
<p><strong>Effort et marge :</strong> c’est l’un des services les mieux valorisés, parce qu’il repose sur votre goût et votre carnet d’adresses. Il demande en revanche du temps de conception (moodboard, plan d’implantation, choix des matières) et, si vous louez la décoration, du stockage et de la manutention.</p>
<p><strong>Comment le vendre :</strong> montrez des planches de tendances réalisées pour de vrais mariages, et proposez-le en deux niveaux : la conception seule (les mariés achètent et installent), ou la conception avec location et installation.</p>

<h3>2. La papeterie</h3>
<p><strong>Pour les mariés :</strong> faire-part, menus, marque-places, plan de table, signalétique et livret dans la même charte graphique, sans courir après trois imprimeurs.</p>
<p><strong>Effort et marge :</strong> si vous maîtrisez un outil de mise en page, la marge est bonne. Sinon, travaillez avec un graphiste ou un atelier de papeterie et refacturez. Attention aux allers-retours de relecture (orthographe des prénoms, horaires) : fixez un nombre de corrections.</p>
<p><strong>Comment le vendre :</strong> mettez une pièce imprimée sur la table du premier rendez-vous. Un menu ou un plan de table réussi se touche, et se vend mieux qu’un fichier.</p>

<h3>3. La gestion des invités</h3>
<p><strong>Pour les mariés :</strong> plus de tableur à jour sur trois téléphones. Vous centralisez les réponses, les régimes alimentaires, les enfants, les allergies, les besoins de transport, et vous construisez le plan de table avec eux.</p>
<p><strong>Effort et marge :</strong> peu technique, mais chronophage dans les deux derniers mois (les retardataires, les « +1 » de dernière minute). Facturez-le au forfait, avec une date limite de modifications.</p>
<p><strong>Comment le vendre :</strong> demandez aux mariés combien de messages ils reçoivent déjà de leur famille au sujet du mariage. Ils comprennent vite ce qu’ils gagnent à vous les rediriger.</p>

<h3>4. L’hébergement et le transport des invités</h3>
<p><strong>Pour les mariés :</strong> leurs invités savent où dormir, comment venir et comment rentrer, et personne ne reprend le volant à 4&nbsp;h du matin.</p>
<p><strong>Effort et marge :</strong> négocier des blocs de chambres et organiser des navettes demande peu de créativité mais beaucoup de suivi. Un point juridique à vérifier : si vous <em>vendez</em> vous-même un ensemble transport et hébergement à prix global, vous pouvez tomber dans la vente de voyages, qui impose une immatriculation auprès d’Atout France. Le plus simple est souvent de négocier les tarifs et de laisser chaque invité réserver et payer directement.</p>
<p><strong>Comment le vendre :</strong> pour un mariage dans un lieu isolé, c’est presque un argument de sécurité. Présentez-le comme tel.</p>

<h3>5. L’accompagnement administratif en mairie</h3>
<p><strong>Pour les mariés :</strong> un dossier de mariage complet du premier coup. Chaque mairie fixe ses propres délais de dépôt, et la publication des bans dure au moins dix jours avant la cérémonie : les mariés qui découvrent ces étapes tard s’en souviennent.</p>
<p><strong>Effort et marge :</strong> vous ne pouvez pas faire les démarches à leur place, mais vous pouvez préparer la liste des pièces, les dates limites, les témoins à déclarer, et vous charger du lien avec la mairie pour l’organisation pratique (horaires, nombre de places, photos autorisées ou non). Effort faible une fois votre modèle prêt.</p>
<p><strong>Comment le vendre :</strong> plutôt qu’en option payante, intégrez-le dans vos formules haut de gamme. C’est un service peu coûteux pour vous et très rassurant pour eux.</p>

<h3>6. La cérémonie laïque</h3>
<p><strong>Pour les mariés :</strong> une cérémonie qui leur ressemble, écrite avec eux, avec des intervenants qui savent quand se lever et quoi lire.</p>
<p><strong>Effort et marge :</strong> si vous officiez vous-même, c’est un service à part entière (entretiens, écriture, répétition). Sinon, travaillez avec un officiant partenaire et gardez la coordination : placement, musique, entrée du cortège, timing.</p>
<p><strong>Comment le vendre :</strong> proposez un déroulé type de cérémonie dès le premier rendez-vous. Les mariés qui hésitent entre « juste la mairie » et une cérémonie laïque se décident souvent en voyant à quoi elle pourrait ressembler.</p>

<h3>7. Les animations du vin d’honneur et de la soirée</h3>
<p><strong>Pour les mariés :</strong> un vin d’honneur qui ne ressemble pas à deux heures d’attente pendant les photos, et une soirée qui ne repose pas uniquement sur le DJ.</p>
<p><strong>Effort et marge :</strong> musiciens, caricaturiste, jeux en bois, bar à cocktails, dégustation : vous travaillez avec des partenaires, votre valeur est dans la sélection et la coordination. On en a listé beaucoup dans <a href="/journal/idees-animation-mariage">nos idées d’animation de mariage</a>.</p>
<p><strong>Comment le vendre :</strong> proposez deux ou trois animations adaptées au profil des invités (beaucoup d’enfants, beaucoup de personnes âgées, invités qui ne se connaissent pas), pas un catalogue.</p>

<h3>8. L’animation photo des invités</h3>
<p><strong>Pour les mariés :</strong> les photos que le photographe ne peut pas prendre. Il est avec les mariés pendant les portraits, il ne voit pas la table du fond, le fou rire au bar, la grand-mère sur la piste à 1&nbsp;h du matin. Les invités, eux, sont partout.</p>
<p>Il existe plusieurs façons de le faire : une borne photo, un livre d’or avec appareil instantané, une galerie partagée, ou une animation appareil photo jetable dans le téléphone des invités. On compare ces options dans <a href="/journal/comparatif-animations-photo-mariage">photobooth, borne, miroir ou jetable : lequel choisir ?</a></p>
<p>Prenons l’exemple de la formule appareil jetable, que nous avons construite avec <strong>Time to Flash</strong>. Chaque invité scanne un QR code, tape son prénom, et son téléphone devient un appareil jetable : aucune application à installer, un nombre de photos compté (de 3 à 15, au choix), un rendu pellicule, et des photos cachées jusqu’à la révélation. Le lendemain, l’album s’ouvre d’un coup pour tout le monde.</p>
<p><strong>Ce que vous gérez, concrètement :</strong></p>
<ul>
<li><strong>La création de l’événement</strong> : le nombre de photos par invité, le moment de la révélation (par défaut le lendemain), la pellicule. Vous pouvez inviter les mariés comme co-organisateurs.</li>
<li><strong>Le kit d’impression</strong> : le QR code seul, l’affiche A4, les chevalets de table et les petits cartons sortent prêts à imprimer depuis le tableau de bord. Vous les intégrez à votre signalétique.</li>
<li><strong>L’annonce</strong> : une phrase dans la fiche du DJ ou dans le mot des témoins au vin d’honneur.</li>
<li><strong>Le tri avant la révélation</strong>, avec les mariés si vous le souhaitez : l’organisateur voit les photos avant tout le monde et peut retirer celles qui gênent.</li>
</ul>
<p><strong>Le temps que ça vous prend :</strong> une demi-heure de préparation suffit en pratique (création, impression, une ligne dans le déroulé), puis quelques minutes le jour J pour poser les affiches. Rien à monter, pas de technicien, pas de caution.</p>
<p><strong>Effort et marge :</strong> le coût est un paiement unique selon le nombre d’invités, par exemple 34,99&nbsp;€ jusqu’à 150 invités ou 59,99&nbsp;€ jusqu’à 300. Vous pouvez l’inclure dans vos formules comme une signature, ou le proposer en option.</p>
<p><strong>Comment le vendre :</strong> montrez-le. Faites scanner le QR code aux mariés pendant le rendez-vous, laissez-les prendre une photo. C’est une expérience qu’ils n’ont généralement pas vue dans les autres mariages, et elle complète le photographe au lieu de le concurrencer.</p>

<h3>9. Le livret de cérémonie et les kits invités</h3>
<p><strong>Pour les mariés :</strong> des invités qui savent ce qui se passe et quand. Le livret de cérémonie, le programme du week-end, et les petits kits qui sauvent une soirée (éventails, mouchoirs, pansements pour les talons, chaussons de danse).</p>
<p><strong>Effort et marge :</strong> faible, surtout si vous le combinez avec la papeterie. La marge vient de l’achat groupé et de l’assemblage.</p>
<p><strong>Comment le vendre :</strong> en complément d’une autre prestation, jamais seul. Une corbeille de kits dans le vestiaire, c’est le genre de détail dont les invités parlent aux mariés.</p>

<h3>10. Le week-end complet : veille et brunch du lendemain</h3>
<p><strong>Pour les mariés :</strong> un mariage sur deux ou trois jours, de plus en plus courant, sans que la logistique du dîner de la veille et du brunch retombe sur eux.</p>
<p><strong>Effort et marge :</strong> c’est souvent le même lieu et les mêmes prestataires. Un brunch se coordonne avec beaucoup moins d’énergie que le jour J, ce qui en fait l’un des meilleurs rapports temps passé sur chiffre d’affaires.</p>
<p><strong>Comment le vendre :</strong> présentez le brunch comme la fin du mariage, pas comme un repas en plus. C’est aussi le moment idéal pour la révélation des photos des invités, que tout le monde découvre ensemble (voir <a href="/journal/revelation-photos-lendemain-mariage">la révélation au lendemain</a>).</p>

<h3>11. L’accompagnement des témoins et l’EVJF ou l’EVG</h3>
<p><strong>Pour les mariés :</strong> des témoins qui savent ce qu’on attend d’eux, et un enterrement de vie de jeune fille ou de garçon qui ne déborde pas sur la semaine du mariage.</p>
<p><strong>Effort et marge :</strong> une réunion de briefing des témoins prend une heure. L’organisation complète d’un EVJF est un vrai dossier, avec un client différent (les témoins). À vous de voir si vous voulez ce marché.</p>
<p><strong>Comment le vendre :</strong> le briefing des témoins s’intègre facilement à toutes vos formules. Il vous fait gagner du temps le jour J, et les témoins deviennent vos alliés (et, souvent, vos futurs clients).</p>

<h3>12. L’après-mariage</h3>
<p><strong>Pour les mariés :</strong> rien à gérer au retour : restitution des locations, retours de vaisselle, cartes de remerciement, conservation de la robe, centralisation des photos.</p>
<p><strong>Effort et marge :</strong> faible, et il prolonge la relation après le jour J. C’est aussi la fenêtre où les mariés sont les plus enclins à laisser un avis et à vous recommander.</p>
<p><strong>Comment le vendre :</strong> en option à la signature, ou offert dans la formule complète. On revient sur l’intérêt de ce moment pour votre réputation dans <a href="/journal/trouver-clients-wedding-planner">comment trouver des clients</a>.</p>

<h2>Le tableau récapitulatif</h2>
<table>
<thead><tr><th>Service</th><th>Votre effort</th><th>Marge possible</th><th>Quand le proposer</th></tr></thead>
<tbody>
<tr><td>Design et scénographie</td><td>Élevé</td><td>Forte</td><td>Premier rendez-vous</td></tr>
<tr><td>Papeterie</td><td>Moyen</td><td>Bonne</td><td>Après la signature</td></tr>
<tr><td>Gestion des invités</td><td>Moyen</td><td>Moyenne</td><td>Six mois avant</td></tr>
<tr><td>Hébergement et transport</td><td>Moyen</td><td>Faible à moyenne</td><td>Dès le choix du lieu</td></tr>
<tr><td>Accompagnement mairie</td><td>Faible</td><td>Faible (argument)</td><td>À la signature</td></tr>
<tr><td>Cérémonie laïque</td><td>Élevé si vous officiez</td><td>Bonne</td><td>Premier rendez-vous</td></tr>
<tr><td>Animations</td><td>Faible à moyen</td><td>Moyenne</td><td>Quatre à six mois avant</td></tr>
<tr><td>Animation photo des invités</td><td>Très faible</td><td>Selon votre choix</td><td>Premier rendez-vous (démonstration)</td></tr>
<tr><td>Livret et kits</td><td>Faible</td><td>Moyenne</td><td>Avec la papeterie</td></tr>
<tr><td>Week-end et brunch</td><td>Moyen</td><td>Bonne</td><td>À la signature</td></tr>
<tr><td>Témoins et EVJF</td><td>Faible à élevé</td><td>Variable</td><td>Trois à six mois avant</td></tr>
<tr><td>Après-mariage</td><td>Faible</td><td>Faible (fidélisation)</td><td>À la signature</td></tr>
</tbody>
</table>

<h2>Comment présenter vos services complémentaires</h2>
<p>Une liste de douze options en bas d’un devis fait fuir. Trois approches marchent mieux.</p>
<p><strong>Des packs plutôt qu’un menu.</strong> Regroupez les services par logique : un pack « invités » (gestion des invités, hébergement, navettes, kits), un pack « design » (scénographie, papeterie, livret), un pack « week-end » (veille, brunch, après-mariage). Les mariés choisissent un pack, pas dix lignes.</p>
<p><strong>Une signature incluse partout.</strong> Choisissez un ou deux services peu coûteux pour vous et très visibles pour les invités, et incluez-les dans toutes vos formules. C’est ce qui fera dire aux invités « c’était organisé par qui ? ».</p>
<p><strong>Le bon moment.</strong> Au premier rendez-vous, parlez de ce qui fait signer (design, cérémonie, une démonstration). Les options logistiques (navettes, kits, après-mariage) se proposent plus tard, quand les mariés commencent à mesurer tout ce qu’il reste à faire.</p>

<h2>Comment se démarquer en tant que wedding planner</h2>
<p>Les services complémentaires ne suffisent pas s’ils ressemblent à ceux de tout le monde. Quatre leviers font la différence.</p>
<ul>
<li><strong>Une spécialité claire.</strong> Mariages à la campagne, petits mariages, mariages multiculturels, mariages écoresponsables : un positionnement précis se retient mieux qu’un « tous types de mariages ».</li>
<li><strong>Une méthode visible.</strong> Montrez votre rétroplanning, votre déroulé, votre fiche prestataires (on vous donne un modèle dans <a href="/journal/deroule-jour-j-mariage">le déroulé du jour J heure par heure</a>). Les mariés achètent de la sérénité : prouvez-la.</li>
<li><strong>Une expérience pour les invités.</strong> Les mariés ne retiennent pas votre tableur, ils retiennent ce que leurs invités leur ont dit. Une animation qui implique tout le monde, un livret soigné, une navette à l’heure : c’est ce qui circule après le mariage.</li>
<li><strong>Un suivi après le jour J.</strong> La plupart des prestataires disparaissent le lendemain. Un message le matin de la révélation des photos, un retour sur la soirée, une demande d’avis au bon moment : c’est la meilleure publicité que vous puissiez avoir.</li>
</ul>

<h2>En résumé</h2>
<ul>
<li>Cadrez vos trois formules de base avec un périmètre écrit (prestataires inclus, nombre de rendez-vous).</li>
<li>Choisissez parmi les services complémentaires ceux qui correspondent à votre spécialité, pas tous.</li>
<li>Regroupez-les en packs, et incluez partout une signature visible par les invités.</li>
<li>Prolongez la relation après le mariage : c’est là que naissent les recommandations.</li>
</ul>
<p>Si l’animation photo des invités vous intéresse comme service à proposer à vos mariés, nous avons ouvert un espace dédié aux prestataires : <a href="/pro">proposer Time to Flash à vos mariés</a>. Et pour structurer votre activité, voyez aussi <a href="/journal/devenir-wedding-planner-outils">les outils du wedding planner en 2026</a>.</p>
`,
    faq: [
      {
        q: 'Quelles sont les prestations d’un wedding planner ?',
        a: 'Un wedding planner propose en général trois formules : l’organisation complète (du budget au jour J), l’organisation partielle (une partie des prestataires et la coordination) et la coordination du jour J, qui commence en réalité un à trois mois avant. Beaucoup y ajoutent des services complémentaires comme le design, la papeterie, la gestion des invités ou l’hébergement.',
      },
      {
        q: 'Quels services complémentaires un wedding planner peut-il proposer ?',
        a: 'Les plus courants sont le design et la scénographie, la papeterie, la gestion des invités, l’hébergement et les navettes, la cérémonie laïque, les animations et l’animation photo des invités, le brunch du lendemain et l’après-mariage. L’important est de choisir ceux qui collent à votre spécialité et de les regrouper en packs.',
      },
      {
        q: 'Combien coûte une coordination du jour J ?',
        a: 'Les fourchettes constatées en France en 2026 vont d’environ 900 € pour un planner débutant à 2 500 € pour un professionnel expérimenté, parfois plus en haut de gamme. Le prix dépend de la région, du nombre d’invités et du temps de préparation inclus en amont.',
      },
      {
        q: 'Comment un wedding planner peut-il se démarquer ?',
        a: 'En choisissant une spécialité claire, en montrant sa méthode (rétroplanning, déroulé, fiche prestataires), en proposant une expérience dont les invités parlent, et en restant présent après le mariage. Une démonstration concrète en rendez-vous convainc davantage qu’une liste de prestations.',
      },
      {
        q: 'Un wedding planner peut-il vendre l’hébergement des invités ?',
        a: 'Il peut négocier des tarifs et coordonner les réservations. En revanche, vendre lui-même un ensemble transport et hébergement à prix global peut relever de la vente de voyages, qui impose une immatriculation auprès d’Atout France. Renseignez-vous avant de facturer ce type de prestation.',
      },
    ],
  },
  {
    // Requêtes : « devenir wedding planner », « outils wedding planner »,
    // « logiciel wedding planner », « formation wedding planner ».
    // Google (10/10/2026) : en tête, des guides de création d'entreprise
    // (Abby, Shine, Legalplace, Propulse by CA, Superindep, Assurup) qui
    // couvrent statut (micro-entreprise), formation (pas obligatoire, titres
    // RNCP, Qualiopi/CPF), assurance RC Pro et tarifs (fourchettes de
    // l'International Wedding Institute : 1 500 € à plus de 10 000 €). Aucun
    // ne détaille vraiment les outils. Sur « logiciel wedding planner », des
    // pages éditeurs (Anolla, Bridebook, Event Boss) et, en anglais, des
    // comparatifs Aisle Planner / HoneyBook / Dubsado / Planning Pod.
    // Autres questions : salaire, diplôme, BIC ou BNC, comment trouver ses
    // premiers clients. Ajout utile : facturation électronique (réception
    // obligatoire depuis le 01/09/2026, émission au 01/09/2027 pour les
    // micro-entreprises). Outils cités : tous vérifiés par recherche, sans prix.
    slug: 'devenir-wedding-planner-outils',
    image: '/journal/devenir-wedding-planner-outils.webp',
    cat: 'Prestataires',
    cible: 'pro',
    title: 'Devenir wedding planner : statut, formation et outils en 2026',
    excerpt: 'Statut, formation, réseau, premiers clients et tarifs : comment devenir wedding planner en France, puis la boîte à outils 2026 classée par usage.',
    author: 'Tom Bréval',
    date: '2026-10-10',
    read: '13 min',
    caption: 'Un bureau à domicile le soir : un ordinateur portable ouvert sur un rétroplanning, des échantillons de tissu et un carnet de rendez-vous',
    body: `
<p>Devenir wedding planner attire beaucoup de monde, et pour de bonnes raisons : un métier concret, du contact humain, la satisfaction de voir une journée se dérouler comme prévu. C’est aussi un métier d’indépendant, saisonnier, où l’on gagne sa vie avec son carnet d’adresses et sa capacité à tenir des dizaines de détails en même temps.</p>
<p>Ce guide couvre les étapes pour se lancer en France (statut, formation, réseau, premiers clients, tarifs), puis la boîte à outils d’un wedding planner en 2026, classée par usage. Tous les outils cités existent et ont été vérifiés en octobre 2026 ; nous n’indiquons pas de prix, qui changent trop souvent.</p>

<h2>Devenir wedding planner : à quoi ressemble le métier</h2>
<p>Un wedding planner vend trois choses : du temps (celui que les mariés n’ont pas), un réseau (des prestataires fiables, à des conditions négociées) et du sang-froid (le jour J, c’est lui qui gère la pluie, le traiteur en retard et l’oncle qui veut faire un discours de vingt minutes).</p>
<p>Quelques réalités à connaître avant de vous lancer :</p>
<ul>
<li><strong>La saison est courte.</strong> L’essentiel des mariages se concentre entre mai et septembre, surtout le samedi. Le nombre de mariages que vous pouvez coordonner dans l’année est donc limité par le calendrier, pas seulement par votre énergie.</li>
<li><strong>Le travail se fait surtout en amont.</strong> Visites, rendez-vous, devis, relances : le jour J n’est que la partie visible.</li>
<li><strong>Les clients signent longtemps à l’avance.</strong> Souvent 12 à 18 mois avant la date pour une organisation complète. Votre première année d’activité sert en grande partie à remplir la suivante.</li>
<li><strong>Chaque client est nouveau.</strong> On se marie rarement deux fois avec le même planner : votre activité repose sur les recommandations et la visibilité.</li>
</ul>

<h3>Les compétences qui comptent vraiment</h3>
<ul>
<li><strong>L’organisation</strong>, évidemment : tenir plusieurs mariages en parallèle, chacun avec ses échéances, sans rien oublier.</li>
<li><strong>La négociation</strong> : obtenir un meilleur tarif, une heure de plus, un geste commercial, sans abîmer la relation avec le prestataire.</li>
<li><strong>Le sens du service</strong> : les mariés vous écriront le dimanche soir. À vous de fixer un cadre, sans paraître distant.</li>
<li><strong>Le calme</strong> : le jour J, votre visage donne le ton. Si vous paniquez, tout le monde panique.</li>
<li><strong>Un minimum de goût et de culture visuelle</strong>, même si vous ne proposez pas de design : les mariés vous demanderont votre avis sur tout.</li>
<li><strong>Le permis de conduire et de l’endurance physique</strong> : les journées de mariage dépassent souvent quinze heures, debout.</li>
</ul>

<h2>Quel statut pour devenir wedding planner</h2>
<p>La plupart des wedding planners démarrent en <strong>micro-entreprise</strong> : création en ligne, comptabilité simplifiée, cotisations calculées sur le chiffre d’affaires. C’est le statut idéal pour tester l’activité. Ses limites : un plafond de chiffre d’affaires (vérifiez le montant en vigueur sur le site de l’Urssaf), et l’impossibilité de déduire vos frais, ce qui pèse si vous achetez ou louez beaucoup de décoration.</p>
<p>Quand l’activité grandit, le passage en société (EURL, SASU) se discute avec un expert-comptable : il permet de déduire les charges, de séparer patrimoine personnel et professionnel, et de recruter.</p>
<p><strong>Activité commerciale ou libérale ?</strong> La réponse dépend de ce que vous facturez. Si vous revendez des prestations ou louez du matériel, l’activité est plutôt commerciale ; si vous vendez surtout du conseil, elle peut être considérée comme libérale. Cela change le régime fiscal (BIC ou BNC) et les cotisations. Faites valider votre cas par la CCI ou un expert-comptable au moment de l’immatriculation.</p>
<p><strong>Quatre points à ne pas oublier :</strong></p>
<ul>
<li><strong>Une assurance responsabilité civile professionnelle.</strong> Elle n’est pas toujours obligatoire, mais un lieu ou un client vous la demandera, et un incident le jour J peut coûter cher.</li>
<li><strong>Des conditions générales de vente solides</strong> : acomptes, échéancier, annulation, report, périmètre exact de chaque formule.</li>
<li><strong>La vente de voyages.</strong> Si vous vendez vous-même des ensembles transport et hébergement à prix global (mariage à l’étranger, week-end tout compris pour les invités), vous pouvez être soumis à l’immatriculation auprès d’Atout France. Renseignez-vous avant de proposer ce type de prestation.</li>
<li><strong>La facturation électronique.</strong> Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques ; les micro-entreprises devront aussi les émettre à partir du 1er septembre 2027. Choisissez dès maintenant un outil de facturation qui le prend en charge.</li>
</ul>

<h2>Formation wedding planner : utile, pas obligatoire</h2>
<p>Aucun diplôme n’est exigé pour exercer. Une formation reste utile pour trois raisons : apprendre la méthode (budget, rétroplanning, contrats), rencontrer des professionnels, et rassurer les premiers clients.</p>
<p>Les options les plus courantes :</p>
<ul>
<li><strong>Les écoles et organismes spécialisés dans les métiers du mariage</strong>, en présentiel ou à distance. Certains délivrent un titre inscrit au RNCP (le répertoire national des certifications). Vérifiez sur le site de France Compétences que le titre est bien actif, et que l’organisme est certifié Qualiopi si vous voulez financer la formation avec votre CPF.</li>
<li><strong>Les formations générales en événementiel</strong> : BTS, licences professionnelles et bachelors en communication ou gestion de projets événementiels, parfois avec une spécialisation mariage.</li>
<li><strong>L’assistanat</strong> : travailler comme assistant ou assistante d’un wedding planner établi pendant une ou deux saisons. C’est souvent la formation la plus formatrice, et la plus utile pour le réseau.</li>
</ul>
<p>Méfiez-vous des formations courtes qui promettent de « devenir wedding planner en quelques semaines » avec un certificat maison. Demandez le programme détaillé, le profil des formateurs, et parlez à d’anciens élèves.</p>

<h2>Construire son réseau de prestataires</h2>
<p>Votre carnet d’adresses est votre principal actif. Il se construit prestataire par prestataire :</p>
<ul>
<li><strong>Les lieux de réception d’abord.</strong> Ce sont eux qui voient passer les mariés en premier. Visitez-les, présentez-vous, demandez à être sur leur liste de prestataires recommandés.</li>
<li><strong>Un ou deux prestataires par catégorie</strong> (traiteur, photographe, fleuriste, DJ, location), avec une alternative à chaque fois. Testez-les quand c’est possible : un repas chez le traiteur, une soirée avec le DJ.</li>
<li><strong>Une fiche par prestataire</strong> : tarifs indicatifs, conditions, délais, ce qu’il fait bien, ce qu’il ne fait pas.</li>
<li><strong>Des échanges dans les deux sens.</strong> Recommandez vos partenaires, envoyez-leur les photos des mariages où vous avez travaillé ensemble, citez-les sur vos réseaux. Un réseau qui ne fonctionne que dans un sens s’épuise vite.</li>
</ul>

<h2>Trouver ses premiers clients</h2>
<p>Sans portfolio, difficile de convaincre. Les solutions classiques pour en constituer un :</p>
<ul>
<li><strong>Un shooting d’inspiration</strong> (on parle aussi de « styled shoot ») avec des prestataires partenaires : un lieu, une décoration, un photographe, des mannequins. Tout le monde y gagne des images.</li>
<li><strong>Des mariages de proches</strong> à tarif réduit, à condition de les traiter comme de vrais dossiers (contrat, déroulé, photos).</li>
<li><strong>Des missions d’assistanat</strong> chez un planner établi, avec son accord pour montrer votre travail.</li>
</ul>
<p>Ensuite viennent les canaux d’acquisition (lieux partenaires, Instagram, Google, annuaires, salons). On les détaille avec un plan d’action sur 90 jours dans <a href="/journal/trouver-clients-wedding-planner">comment trouver des clients quand on est wedding planner</a>.</p>

<h2>Combien facturer</h2>
<p>Les tarifs varient énormément selon la région, l’expérience et le positionnement. Voici les fourchettes qu’on retrouve le plus souvent en 2026 sur les sites de wedding planners et dans les guides spécialisés :</p>
<table>
<thead><tr><th>Formule</th><th>Débutant</th><th>Expérimenté</th></tr></thead>
<tbody>
<tr><td>Coordination jour J</td><td>Environ 900 à 1&nbsp;500&nbsp;€</td><td>Environ 1&nbsp;500 à 2&nbsp;500&nbsp;€</td></tr>
<tr><td>Organisation partielle</td><td>Environ 1&nbsp;500 à 2&nbsp;500&nbsp;€</td><td>Environ 2&nbsp;500 à 3&nbsp;500&nbsp;€ et plus</td></tr>
<tr><td>Organisation complète</td><td>Environ 3&nbsp;000 à 4&nbsp;000&nbsp;€</td><td>Environ 4&nbsp;000 à 6&nbsp;000&nbsp;€, au-delà de 10&nbsp;000&nbsp;€ en haut de gamme</td></tr>
</tbody>
</table>
<p>Pour fixer vos propres prix, partez de vos heures. Notez le temps réellement passé sur vos premiers mariages (rendez-vous, trajets, mails compris), ajoutez vos charges et vos cotisations, et regardez combien il vous reste par heure. Sur un premier mariage complet, le taux horaire réel est souvent bien plus bas que ce qu’on imaginait : mieux vaut le découvrir tôt.</p>
<p>Le forfait est plus répandu que le pourcentage du budget. Il est plus lisible pour les mariés, et vous protège quand ils réduisent leur budget en cours de route. Pour enrichir votre offre au-delà des trois formules, voyez <a href="/journal/services-wedding-planner">les 12 services complémentaires à proposer</a>.</p>

<h2>Outils wedding planner : la boîte à outils 2026 par usage</h2>
<p>Vous n’avez pas besoin de dix abonnements pour démarrer. Un tableur, un agenda partagé et un outil de facturation suffisent pour les premiers mariages. Voici les outils qu’on croise le plus chez les wedding planners, classés par usage, pour choisir quand le besoin se présente.</p>

<h3>Gestion de projet et rétroplanning</h3>
<p>Chaque mariage est un projet de plusieurs mois avec des dizaines de tâches et d’échéances. Les outils généralistes font très bien l’affaire :</p>
<ul>
<li><strong>Trello</strong> : des tableaux de cartes, simples à prendre en main. Une colonne par période (J-12 mois, J-6 mois, J-1 mois), une carte par tâche.</li>
<li><strong>Notion</strong> : très flexible, on peut y construire une base par mariage (rétroplanning, prestataires, budget, invités). Demande un peu de temps de mise en place.</li>
<li><strong>Asana, ClickUp, monday.com</strong> : plus structurés, utiles si vous travaillez à plusieurs.</li>
<li><strong>Google Sheets ou Airtable</strong> : pour ceux qui pensent en tableaux. Airtable ajoute des vues (calendrier, galerie) à une base de données.</li>
</ul>
<p>Pour la trame elle-même, partez de notre <a href="/journal/retroplanning-mariage">rétroplanning de mariage mois par mois</a> et transformez-le en modèle réutilisable.</p>

<h3>Les logiciels pensés pour les wedding planners</h3>
<p>Il existe des logiciels conçus spécialement pour les organisateurs de mariages, qui réunissent rétroplanning, budget, invités, plan de table et portail client :</p>
<ul>
<li><strong>Aisle Planner</strong> : très complet sur les outils propres au mariage (déroulé, guides de style, plans de table, invités).</li>
<li><strong>Planning Pod</strong> : orienté organisateurs d’événements et lieux qui gèrent beaucoup de dates.</li>
<li><strong>HoneyBook et Dubsado</strong> : surtout de la gestion client (devis, contrats, paiements, automatisations). Au moment où nous écrivons, HoneyBook s’adresse aux entreprises des États-Unis, du Canada, du Royaume-Uni et d’Australie.</li>
<li><strong>Anolla</strong> : un logiciel français orienté lieux de mariage, avec plans de table, menus et plannings des prestataires.</li>
</ul>
<p>La plupart de ces outils sont anglophones et pensés pour le marché nord-américain. Avant de vous abonner, vérifiez la langue de l’interface côté mariés, la conformité de la facturation avec les règles françaises, et l’hébergement des données.</p>

<h3>Devis, facturation et comptabilité</h3>
<ul>
<li><strong>Abby, Tiime, Indy, Freebe</strong> : des outils français de devis et de facturation, pensés pour les indépendants et les micro-entrepreneurs.</li>
<li><strong>Pennylane</strong> : plutôt pour une société avec un expert-comptable.</li>
<li><strong>Yousign</strong> : signature électronique française, pratique pour les contrats et les devis signés à distance.</li>
</ul>
<p>Avec la réforme de la facturation électronique, vérifiez que votre outil est relié à une plateforme agréée, ou le deviendra avant septembre 2027.</p>

<h3>CRM : suivre vos demandes</h3>
<p>Un CRM (un fichier clients intelligent) sert à ne perdre aucune demande : qui vous a contacté, quand, pour quelle date, d’où vient le contact, où en est la discussion.</p>
<ul>
<li><strong>folk</strong> : un CRM français simple, apprécié des indépendants.</li>
<li><strong>HubSpot</strong> : une version gratuite suffit largement pour démarrer.</li>
<li><strong>Pipedrive</strong> : très visuel, organisé en étapes de vente.</li>
</ul>
<p>Au début, un tableur avec une ligne par demande et une colonne « source » fait le travail. L’essentiel est de noter d’où vient chaque contact : c’est ce qui vous dira où investir votre temps.</p>

<h3>Plans de table</h3>
<ul>
<li><strong>PerfectTablePlan</strong> : un logiciel dédié, qui gère aussi les grands banquets.</li>
<li><strong>Canva</strong> : pour la version imprimée du plan de table, avec des modèles.</li>
<li>Les modules intégrés des logiciels métier (Aisle Planner, Anolla).</li>
</ul>

<h3>Moodboards et design</h3>
<ul>
<li><strong>Pinterest</strong> : la base pour recueillir les envies des mariés (demandez-leur un tableau partagé).</li>
<li><strong>Milanote</strong> : des planches libres où l’on mélange images, notes et échantillons, idéales pour présenter une direction artistique.</li>
<li><strong>Canva</strong> : pour mettre en forme moodboards, propositions et papeterie.</li>
</ul>

<h3>Communication avec les mariés et les invités</h3>
<ul>
<li><strong>WhatsApp Business</strong> : séparer vos échanges pro de vos messages personnels, avec des réponses rapides et des horaires d’absence.</li>
<li><strong>Calendly</strong> : laisser les mariés réserver un rendez-vous sans dix messages d’allers-retours.</li>
<li><strong>Google Drive</strong> : un dossier partagé par mariage (contrats, devis, déroulé).</li>
<li><strong>Joy (withjoy)</strong> ou le site de mariage proposé par Mariages.net : pour le site des mariés et les réponses des invités.</li>
</ul>

<h3>Animations clé en main</h3>
<p>Certaines animations se gèrent comme des outils : vous les préparez en quelques minutes, sans technicien, et elles enrichissent votre offre. C’est le cas de <strong>Time to Flash</strong>, l’animation appareil photo jetable dans le téléphone des invités : un QR code à scanner, aucune application à installer, un nombre de photos compté par invité, et un album révélé d’un coup le lendemain. Le kit d’impression (affiche, chevalets, cartons) sort prêt depuis le tableau de bord, et vous pouvez trier les photos avant la révélation. Le prix est un paiement unique par mariage, par exemple 34,99&nbsp;€ jusqu’à 150 invités.</p>
<p>Pour comparer avec la location d’une borne photo, voyez <a href="/journal/prix-photobooth-mariage">combien coûte un photobooth de mariage</a>.</p>

<h3>Le kit physique du jour J</h3>
<p>Le meilleur outil reste souvent une valise bien faite. Celle des planners expérimentés contient presque toujours : ciseaux, ruban adhésif double face, fil de pêche, épingles, kit de couture, détachant, mouchoirs, pansements, antidouleurs, chargeurs et batterie externe, rallonge, briquet, pinces, ficelle, collants de rechange, et une version papier du déroulé et des contacts (le téléphone finit toujours par manquer de batterie).</p>

<h2>Le récapitulatif</h2>
<table>
<thead><tr><th>Usage</th><th>Pour démarrer</th><th>Quand l’activité grandit</th></tr></thead>
<tbody>
<tr><td>Rétroplanning et tâches</td><td>Trello, Google Sheets</td><td>Notion, Asana, ClickUp, Aisle Planner</td></tr>
<tr><td>Devis et factures</td><td>Abby, Tiime, Freebe, Indy</td><td>Pennylane avec un expert-comptable</td></tr>
<tr><td>Contrats</td><td>PDF signé</td><td>Yousign</td></tr>
<tr><td>Suivi des demandes</td><td>Tableur</td><td>folk, HubSpot, Pipedrive</td></tr>
<tr><td>Plan de table</td><td>Canva</td><td>PerfectTablePlan, logiciel métier</td></tr>
<tr><td>Moodboards</td><td>Pinterest</td><td>Milanote</td></tr>
<tr><td>Échanges avec les mariés</td><td>WhatsApp Business, Google Drive</td><td>Calendly, portail client d’un logiciel métier</td></tr>
<tr><td>Animation des invités</td><td>Time to Flash, location de borne</td><td>Une signature incluse dans vos formules</td></tr>
</tbody>
</table>

<h2>Les erreurs fréquentes quand on se lance</h2>
<ul>
<li><strong>Accumuler les outils avant les clients.</strong> Un logiciel métier ne remplit pas un agenda. Commencez simple.</li>
<li><strong>Sous-estimer ses heures.</strong> Notez tout pendant la première saison, vous ajusterez vos prix sur des chiffres réels.</li>
<li><strong>Un périmètre flou.</strong> « Organisation partielle » ne veut rien dire tant que la liste des prestataires inclus n’est pas écrite.</li>
<li><strong>Négliger les contrats.</strong> Acompte, annulation, report : ces clauses servent rarement, mais quand elles servent, elles sauvent une année.</li>
<li><strong>Attendre d’être parfait pour se montrer.</strong> Un compte Instagram avec trois vrais mariages vaut mieux qu’un site parfait sans aucune photo.</li>
</ul>

<h2>En résumé</h2>
<ul>
<li>Démarrez en micro-entreprise, avec une assurance et des CGV solides.</li>
<li>La formation n’est pas obligatoire, l’assistanat est souvent le meilleur apprentissage.</li>
<li>Construisez votre réseau en commençant par les lieux de réception.</li>
<li>Fixez vos prix à partir de vos heures réelles, au forfait.</li>
<li>Un tableur, un outil de facturation et un agenda suffisent pour commencer ; ajoutez les autres outils quand le besoin apparaît.</li>
</ul>
<p>Si vous cherchez une animation simple à ajouter à vos formules, découvrez l’espace prestataires : <a href="/pro">proposer Time to Flash à vos mariés</a>.</p>
`,
    faq: [
      {
        q: 'Faut-il un diplôme pour devenir wedding planner ?',
        a: 'Non, aucun diplôme n’est obligatoire en France. Une formation (école spécialisée, formation en événementiel ou assistanat chez un planner établi) aide à apprendre la méthode et à rassurer les premiers clients. Si vous voulez la financer avec le CPF, vérifiez que l’organisme est certifié Qualiopi.',
      },
      {
        q: 'Quel statut choisir pour devenir wedding planner ?',
        a: 'La micro-entreprise est le statut le plus courant pour démarrer, grâce à sa simplicité. Quand le chiffre d’affaires et les frais augmentent, une société (EURL, SASU) permet de déduire les charges. Faites valider la nature de votre activité (commerciale ou libérale) par la CCI ou un expert-comptable.',
      },
      {
        q: 'Combien gagne un wedding planner ?',
        a: 'Cela dépend du nombre de mariages par an et des formules vendues. À titre indicatif, une coordination du jour J se facture environ 900 à 2 500 € et une organisation complète environ 3 000 à 6 000 €, davantage en haut de gamme. Le revenu réel dépend ensuite de vos charges, de vos cotisations et du temps passé par dossier.',
      },
      {
        q: 'Quel logiciel utiliser quand on est wedding planner ?',
        a: 'Pour démarrer, un outil de gestion de projet (Trello, Notion), un tableur et un logiciel de facturation français (Abby, Tiime, Indy, Freebe) suffisent. Les logiciels métier comme Aisle Planner ou Planning Pod réunissent tout, mais sont surtout pensés pour le marché anglophone : vérifiez la langue et la conformité de la facturation.',
      },
      {
        q: 'La facturation électronique concerne-t-elle les wedding planners ?',
        a: 'Oui. Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques, et les micro-entreprises devront aussi les émettre à partir du 1er septembre 2027. Choisissez un outil de facturation compatible dès maintenant.',
      },
    ],
  },
  {
    // Requêtes : « trouver des clients wedding planner », « comment trouver des
    // clients wedding planner », « marketing wedding planner », « instagram
    // wedding planner ».
    // Google (10/10/2026) : en tête, des guides généralistes (Le Blog du
    // Dirigeant, Wisestart « premiers clients ») qui insistent sur trois
    // piliers : portfolio Instagram/Pinterest, réseau de prescripteurs (lieux,
    // traiteurs, photographes), avis Google (10 à 15 avis détaillés, demandés
    // deux à trois semaines après le mariage). Côté anglais (Planning Pod, QC
    // Event School, ClickUp) : niche, réseau, salons, réseaux sociaux. Aucun ne
    // donne de calendrier d'action concret. Angle : canaux un par un avec
    // actions précises, plan sur 90 jours en tableau, indicateurs, et
    // l'argument différenciant en rendez-vous (démonstration de l'appareil
    // jetable, révélation du lendemain comme occasion de recontacter et de
    // demander un avis). Salon du Mariage de Paris : deux éditions en 2026
    // (janvier et septembre, Porte de Versailles), vérifié.
    slug: 'trouver-clients-wedding-planner',
    image: '/journal/trouver-clients-wedding-planner.webp',
    cat: 'Prestataires',
    cible: 'pro',
    title: 'Trouver des clients wedding planner : 8 canaux, un plan 90 jours',
    excerpt: 'Lieux partenaires, Instagram, Google, avis, salons, parrainage : comment trouver des clients quand on est wedding planner, avec un plan sur 90 jours.',
    author: 'Camille Rouzaud',
    date: '2026-10-10',
    read: '13 min',
    caption: 'Une wedding planner photographie au téléphone une table dressée dans une grange, avant l’arrivée des invités',
    body: `
<p>Trouver des clients quand on est wedding planner ne ressemble à aucun autre métier de service. Le mariage est un achat rare, chargé d’émotion, qui se décide souvent plus d’un an à l’avance et engage plusieurs milliers d’euros. Personne ne signe avec un planner dont il n’a jamais vu le travail ni entendu parler.</p>
<p>Ce guide passe en revue les huit canaux qui amènent vraiment des mariés, avec des actions concrètes pour chacun, puis un plan d’action sur 90 jours. On termine par ce qui fait signer en rendez-vous : un argument que les mariés n’ont pas entendu ailleurs.</p>

<h2>Comment les mariés trouvent leur wedding planner</h2>
<p>Avant de choisir vos canaux, regardez le parcours des mariés. Il suit presque toujours le même ordre :</p>
<ol>
<li><strong>Ils choisissent la date et le lieu.</strong> Le lieu est souvent le premier prestataire réservé, et donc le premier à leur recommander d’autres prestataires.</li>
<li><strong>Ils cherchent l’inspiration</strong> sur Instagram et Pinterest, et commencent à suivre des comptes.</li>
<li><strong>Ils tapent « wedding planner + ville »</strong> sur Google, ou parcourent un annuaire spécialisé.</li>
<li><strong>Ils demandent autour d’eux</strong> : amis mariés récemment, témoins, collègues.</li>
<li><strong>Ils vérifient</strong> : avis Google, compte Instagram, site. C’est à cette étape que beaucoup de planners perdent le contact sans le savoir.</li>
</ol>
<p>Conséquence : vous devez être présent au moment où le lieu recommande, au moment où les mariés cherchent, et surtout au moment où ils vérifient.</p>

<h2>Canal 1 : les lieux de réception partenaires</h2>
<p>C’est le canal le plus puissant, parce que le lieu voit les mariés avant tout le monde. Un domaine qui accueille trente mariages par an et vous recommande, c’est une source de demandes régulière.</p>
<p><strong>Comment s’y prendre :</strong></p>
<ul>
<li>Listez les lieux de votre zone qui correspondent à votre positionnement (pas tous : ceux où vous voulez travailler).</li>
<li>Demandez une visite, venez avec un dossier court : qui vous êtes, deux ou trois mariages en photos, votre façon de travailler avec un lieu (respect des horaires, des règles, du matériel).</li>
<li>Proposez un service concret au lieu : coordonner un mariage où les mariés n’ont pas de planner, participer à leurs portes ouvertes, monter un shooting d’inspiration chez eux pour leurs propres réseaux.</li>
<li>Après chaque mariage dans un lieu, envoyez au gérant les plus belles photos (avec l’accord du photographe). C’est le meilleur moyen de rester dans sa liste.</li>
</ul>
<p>Pour comprendre ce que les mariés demandent à un lieu, et donc ce qu’un lieu attend d’un planner, voyez <a href="/journal/questions-lieu-reception-mariage">les questions à poser à un lieu de réception</a>.</p>

<h2>Canal 2 : le réseau de prestataires</h2>
<p>Photographes, traiteurs, fleuristes, DJ, officiants : chacun rencontre des mariés qui n’ont pas encore de planner. Et chacun préfère travailler avec un planner qui facilite sa journée.</p>
<ul>
<li><strong>Recommandez avant de demander.</strong> Un prestataire à qui vous avez envoyé deux clients vous renverra l’ascenseur.</li>
<li><strong>Organisez un shooting d’inspiration collectif</strong> : chacun y gagne des images pour ses réseaux, et vous devenez celui ou celle qui fédère.</li>
<li><strong>Soyez le prestataire avec qui c’est agréable de travailler</strong> : une fiche technique claire envoyée à l’avance, un repas prévu, un horaire respecté. Les photographes et les DJ parlent entre eux.</li>
</ul>

<h2>Canal 3 : les annuaires et plateformes spécialisés</h2>
<p>Mariages.net, Zankyou et les annuaires régionaux reçoivent beaucoup de visites de mariés en recherche. Les vitrines de base sont souvent gratuites, les mises en avant payantes.</p>
<ul>
<li><strong>Soignez la vitrine gratuite</strong> avant de payer quoi que ce soit : photos réelles, description précise (zone, spécialité, formules, « à partir de »), réponse rapide aux demandes.</li>
<li><strong>Répondez vite.</strong> Les mariés contactent souvent plusieurs planners en même temps : le premier qui répond avec une proposition de rendez-vous a un avantage net.</li>
<li><strong>Collectez des avis sur la plateforme</strong> aussi, pas seulement sur Google.</li>
<li><strong>Testez une option payante sur une saison</strong>, en notant la source de chaque demande. Vous saurez si elle se rembourse.</li>
</ul>

<h2>Canal 4 : les salons du mariage</h2>
<p>Le Salon du Mariage de Paris (Porte de Versailles) a eu deux éditions en 2026, fin janvier et début septembre ; la plupart des grandes villes ont aussi leur salon, souvent à l’automne et en hiver. Un stand coûte cher, en argent et en week-ends : il se prépare.</p>
<ul>
<li><strong>Un stand qui montre, pas qui empile.</strong> Une table dressée comme dans un vrai mariage, un écran avec vos réalisations, une démonstration à faire vivre.</li>
<li><strong>Un formulaire de contact</strong> avec la date et le lieu du mariage, et le consentement explicite à être recontacté (c’est une obligation du RGPD, le règlement européen sur les données personnelles).</li>
<li><strong>Une relance sous 48 heures</strong>, personnalisée avec ce que vous vous êtes dit sur le stand.</li>
<li><strong>Visitez avant d’exposer</strong> : passer une journée en visiteur dans un salon vous dira s’il attire votre clientèle.</li>
</ul>

<h2>Canal 5 : Instagram et Pinterest</h2>
<h3>Instagram pour un wedding planner</h3>
<p>Instagram fait office de portfolio : la plupart des mariés y passent avant de vous écrire. Quelques règles qui changent tout :</p>
<ul>
<li><strong>Une bio qui répond en trois secondes</strong> : métier, zone, spécialité, lien de contact. « Wedding planner en Bretagne, mariages en extérieur, coordination et organisation complète ».</li>
<li><strong>Des stories à la une organisées comme un site</strong> : réalisations, formules, avis, coulisses, « comment je travaille ».</li>
<li><strong>Des coulisses, pas seulement des photos parfaites.</strong> L’installation à 8&nbsp;h, le rétroplanning, la visite technique, la valise du jour J : c’est ce qui montre aux mariés à quoi ressemble le fait de travailler avec vous.</li>
<li><strong>Des vidéos courtes (reels)</strong> : un avant/après de l’installation, une journée en 30 secondes, une erreur à éviter. Ce sont elles qui vous font découvrir par des comptes qui ne vous suivent pas.</li>
<li><strong>Identifiez le lieu et les prestataires</strong> sur chaque publication, et proposez-leur la collaboration (publication commune) : votre contenu apparaît aussi chez eux.</li>
<li><strong>La régularité compte plus que la fréquence.</strong> Deux ou trois publications par semaine pendant un an valent mieux qu’un mois quotidien suivi de trois mois de silence.</li>
</ul>
<h3>Pinterest</h3>
<p>Pinterest fonctionne comme un moteur de recherche visuel : une épingle peut amener des visites pendant des mois, voire des années, là où une publication Instagram s’éteint en quelques jours. Créez des tableaux par thème (décoration champêtre, mariage d’hiver, cérémonie laïque) et faites pointer chaque épingle vers la page correspondante de votre site.</p>

<h2>Canal 6 : Google Business Profile et les avis</h2>
<p>Quand des mariés tapent « wedding planner » suivi d’une ville, Google affiche souvent une carte avec trois fiches d’entreprise avant les sites. Être dans ces trois fiches est l’un des leviers les plus rentables, et il est gratuit.</p>
<ul>
<li><strong>Créez et vérifiez votre fiche</strong> Google Business Profile, avec la catégorie la plus proche de votre métier, votre zone d’intervention, vos horaires de rendez-vous.</li>
<li><strong>Ajoutez des photos régulièrement</strong>, avec des descriptions qui mentionnent les lieux et les villes.</li>
<li><strong>Demandez un avis à chaque couple</strong>, avec un lien direct. Les guides spécialisés citent souvent un seuil d’une dizaine d’avis détaillés à partir duquel un profil inspire vraiment confiance.</li>
<li><strong>Répondez à tous les avis</strong>, y compris les négatifs, calmement et avec des faits.</li>
</ul>
<p><strong>Le bon moment pour demander un avis :</strong> quand l’émotion est encore là, mais que les mariés ont repris leur souffle. Les deux à trois semaines qui suivent le mariage sont souvent citées. On revient plus bas sur un moment encore meilleur.</p>

<h2>Canal 7 : votre site et le référencement local</h2>
<p>Votre site sert à deux choses : rassurer les mariés qui vérifient, et être trouvé sur Google.</p>
<ul>
<li><strong>Une page par zone ou par lieu</strong> où vous travaillez souvent : « Wedding planner à Annecy », « Mariage au domaine de X ». Avec de vraies photos et un vrai texte, pas une copie de la page d’accueil.</li>
<li><strong>Une page formules avec des prix « à partir de ».</strong> Les mariés qui ne voient aucun ordre de prix partent souvent chez celui qui en affiche un.</li>
<li><strong>Des articles utiles</strong> qui répondent aux questions des mariés : le rétroplanning, le budget, le déroulé du jour J, les meilleurs lieux de votre région. Ce contenu se partage, se retrouve sur Google, et prouve votre expertise avant même le rendez-vous.</li>
<li><strong>Un formulaire court</strong> : date, lieu (ou région), nombre d’invités, formule souhaitée, comment ils vous ont connu.</li>
</ul>

<h2>Canal 8 : le bouche-à-oreille et le parrainage</h2>
<p>Les témoins et les invités d’un mariage réussi sont vos futurs clients, ou connaissent vos futurs clients. Ce canal se provoque :</p>
<ul>
<li><strong>Soyez identifiable le jour J</strong> : une carte de visite au vestiaire, votre nom dans le livret, une présentation par le DJ s’il annonce les prestataires.</li>
<li><strong>Restez en contact avec les mariés</strong> après le mariage : un message à la révélation des photos, une carte à leur premier anniversaire de mariage.</li>
<li><strong>Remerciez les recommandations</strong> : un mot, un cadeau, un geste pour les mariés qui vous envoient un couple.</li>
</ul>

<h2>Le premier rendez-vous : une trame en cinq temps</h2>
<p>Tous les canaux ci-dessus mènent au même endroit : un rendez-vous, en visio ou autour d’un café. C’est là que tout se joue, et beaucoup de planners l’abordent sans trame.</p>
<ol>
<li><strong>Écouter d’abord.</strong> Laissez les mariés raconter leur mariage idéal, leurs inquiétudes, ce qu’ils ont déjà réservé. Prenez des notes, posez des questions sur leurs invités autant que sur la décoration.</li>
<li><strong>Reformuler.</strong> « Si je résume : un mariage à la campagne, 120 invités, beaucoup d’enfants, et votre crainte principale, c’est la logistique des trajets. » Les mariés se sentent compris, et vous vérifiez que vous avez bien entendu.</li>
<li><strong>Montrer votre méthode</strong> avec des documents réels : un rétroplanning, un déroulé, une fiche prestataires d’un mariage passé (anonymisée).</li>
<li><strong>Faire vivre une expérience</strong> : un objet, une démonstration, quelque chose qu’ils n’ont pas vu chez les autres (on y vient juste après).</li>
<li><strong>Fixer la suite</strong> : une date d’envoi du devis, une date de rappel. Un rendez-vous qui se termine sur « on se tient au courant » se transforme rarement en contrat.</li>
</ol>

<h2>L’argument qui fait signer en rendez-vous</h2>
<p>En premier rendez-vous, les mariés ont souvent déjà vu deux ou trois planners. Tous ont parlé de budget, de rétroplanning et de prestataires de confiance. Ce qui fait la différence, c’est une chose qu’ils n’ont vue nulle part ailleurs, et qu’ils peuvent essayer tout de suite.</p>
<p>Quelques exemples : un livret de déroulé imprimé pour un vrai mariage, une maquette de table, une expérience pour les invités. Par exemple, l’appareil photo jetable dans le téléphone des invités : vous tendez un QR code, les mariés le scannent, leur téléphone devient un appareil jetable avec quelques poses comptées, sans rien installer. En trente secondes, ils imaginent leurs invités le faire à leur mariage. C’est ce que propose <a href="/appareil-jetable-mariage">Time to Flash</a>, et c’est un argument qui complète le photographe au lieu de le concurrencer.</p>
<p>Cette animation a un autre avantage pour vous, moins visible : <strong>l’album des invités se révèle le lendemain</strong> (ou au moment que vous choisissez). C’est une occasion idéale de recontacter les mariés :</p>
<ul>
<li>Le matin de la révélation, un message court : « Les photos de vos invités viennent d’être révélées, allez voir ! »</li>
<li>Les mariés découvrent leur soirée vue par leurs invités, souvent avec beaucoup d’émotion.</li>
<li>Quelques jours plus tard, quand ils ont tout regardé, vous leur envoyez le lien pour laisser un avis. Ils ont encore le mariage en tête, et une raison de vous remercier.</li>
</ul>
<p>C’est la différence entre un prestataire qui disparaît le dimanche matin et un planner qui accompagne les mariés jusqu’au bout. Pour aller plus loin sur ce moment, voyez <a href="/journal/revelation-photos-lendemain-mariage">la révélation des photos au lendemain</a>, et pour d’autres services qui vous distinguent, <a href="/journal/services-wedding-planner">les 12 services complémentaires du wedding planner</a>.</p>

<h2>Le plan d’action sur 90 jours</h2>
<p>Voici un plan réaliste pour un planner qui démarre ou qui veut relancer son activité, à raison de quelques heures par semaine.</p>
<table>
<thead><tr><th>Période</th><th>Actions</th><th>Résultat attendu</th></tr></thead>
<tbody>
<tr><td><strong>Semaines 1 et 2</strong></td><td>Définir votre spécialité et votre zone. Créer ou refaire la fiche Google Business Profile. Réécrire la bio Instagram et les stories à la une. Préparer un dossier de présentation d’une page.</td><td>Des bases qui rassurent au moment de la vérification</td></tr>
<tr><td><strong>Semaines 3 et 4</strong></td><td>Lister 15 lieux et 15 prestataires cibles. Demander un avis à tous vos anciens mariés. Mettre en ligne une page formules avec des prix « à partir de ».</td><td>Premiers avis, liste de prospection prête</td></tr>
<tr><td><strong>Mois 2</strong></td><td>Visiter 2 ou 3 lieux par semaine. Organiser un shooting d’inspiration avec des prestataires partenaires. Publier 2 ou 3 fois par semaine sur Instagram, dont au moins une vidéo courte. Créer la vitrine gratuite sur un ou deux annuaires.</td><td>Premiers partenariats, contenu neuf</td></tr>
<tr><td><strong>Mois 3</strong></td><td>Publier le shooting avec tous les partenaires identifiés. Écrire deux articles utiles sur votre site (déroulé, lieux de votre région). Relancer les lieux visités avec les photos. Préparer votre démonstration de rendez-vous.</td><td>Premières demandes issues des partenaires et de Google</td></tr>
</tbody>
</table>
<p>Pendant ces 90 jours, notez pour chaque demande sa source. Au bout de trois mois, vous saurez quels canaux méritent votre temps, et lesquels arrêter.</p>

<h2>Les indicateurs à suivre</h2>
<ul>
<li><strong>Le nombre de demandes par mois</strong>, et leur source.</li>
<li><strong>Le taux de rendez-vous</strong> : combien de demandes deviennent un rendez-vous. S’il est faible, travaillez votre délai et votre façon de répondre.</li>
<li><strong>Le taux de signature</strong> : combien de rendez-vous deviennent un contrat. S’il est faible, travaillez votre argument de rendez-vous et vos prix affichés.</li>
<li><strong>Le nombre d’avis</strong>, et leur fraîcheur : un avis récent rassure plus qu’un avis d’il y a trois ans.</li>
</ul>

<h2>Les erreurs qui coûtent des clients</h2>
<ul>
<li><strong>Répondre en trois jours.</strong> Les mariés ont souvent déjà un rendez-vous ailleurs.</li>
<li><strong>Être partout un peu.</strong> Mieux vaut deux canaux bien tenus que six abandonnés.</li>
<li><strong>Des photos sans contexte.</strong> Indiquez le lieu, la saison, le nombre d’invités, ce que vous avez fait : les mariés se projettent mieux.</li>
<li><strong>Oublier les anciens mariés.</strong> Ce sont vos meilleurs commerciaux, à condition de leur donner une raison de parler de vous.</li>
</ul>

<h2>En résumé</h2>
<ul>
<li>Les lieux et les prestataires partenaires sont votre premier canal : visitez, recommandez, partagez vos photos.</li>
<li>Instagram et Google servent surtout au moment où les mariés vérifient : soignez la bio, la fiche et les avis.</li>
<li>Un plan sur 90 jours, une source notée pour chaque demande, et vous saurez où investir votre temps.</li>
<li>En rendez-vous, montrez une expérience que les mariés n’ont pas vue ailleurs, et prévoyez une raison de les recontacter après le mariage.</li>
</ul>
<p>Si la démonstration de l’appareil jetable vous parle comme argument de rendez-vous, découvrez l’espace prestataires : <a href="/pro">proposer Time to Flash à vos mariés</a>. Et pour structurer votre activité, voyez aussi <a href="/journal/devenir-wedding-planner-outils">les outils du wedding planner en 2026</a>.</p>
`,
    faq: [
      {
        q: 'Comment trouver ses premiers clients quand on est wedding planner ?',
        a: 'Commencez par constituer un portfolio (shooting d’inspiration avec des prestataires, mariages de proches traités comme de vrais dossiers), puis démarchez les lieux de réception de votre zone. Une fiche Google Business Profile soignée et quelques avis détaillés rassurent les mariés qui vous découvrent.',
      },
      {
        q: 'Instagram est-il indispensable pour un wedding planner ?',
        a: 'C’est devenu le portfolio par défaut : la plupart des mariés regardent le compte Instagram d’un planner avant de le contacter. Une bio claire, des stories à la une organisées et des coulisses régulières comptent plus qu’un grand nombre d’abonnés.',
      },
      {
        q: 'Faut-il exposer dans un salon du mariage ?',
        a: 'Un salon peut apporter beaucoup de contacts, mais un stand coûte cher en argent et en temps. Visitez le salon en tant que visiteur avant d’exposer, préparez un stand qui montre votre travail, et relancez chaque contact sous 48 heures avec son consentement.',
      },
      {
        q: 'Quand demander un avis aux mariés ?',
        a: 'Quand l’émotion est encore présente mais que les mariés ont repris leur souffle, souvent dans les deux à trois semaines qui suivent le mariage. La révélation des photos des invités, le lendemain ou quelques jours après, est aussi une excellente occasion de reprendre contact.',
      },
      {
        q: 'Combien de temps faut-il pour trouver des clients ?',
        a: 'Les mariés signent souvent 12 à 18 mois avant leur date, donc les efforts d’une saison remplissent surtout la suivante. Un plan suivi pendant 90 jours permet en général de voir arriver les premières demandes issues des partenaires et de Google, et de savoir quels canaux garder.',
      },
    ],
  },
  {
    // Requêtes : « déroulé mariage », « déroulé jour J mariage », « timing
    // mariage », « planning jour J mariage modèle », « horaires mariage ».
    // Google (10/10/2026) : Mariages.net (rétro-planning du jour J), ABC Salles
    // (timing de la réception, rôle du maître de cérémonie), planning.wedding,
    // un modèle payant sur Gumroad, marriage.com. Les pages restent générales
    // (« l'heure de la cérémonie dicte le reste ») avec peu de tableaux
    // complets ; côté anglais, Joy et Zola donnent des timelines heure par
    // heure et conseillent des marges de 30 min et d'envoyer le déroulé aux
    // prestataires deux semaines avant. Angle : tableau complet de 9 h à 4 h
    // pour un mariage français (mairie + laïque ou religieuse, vin d'honneur,
    // dîner, soirée), variantes, marges chiffrées, qui tient le déroulé, fiche
    // prestataires, créneau QR au vin d'honneur et révélation le lendemain.
    // Rappel vérifié : le mariage civil doit précéder la cérémonie religieuse.
    slug: 'deroule-jour-j-mariage',
    image: '/journal/deroule-jour-j-mariage.webp',
    cat: 'Organisation',
    title: 'Déroulé mariage : le planning du jour J heure par heure',
    excerpt: 'Un modèle de déroulé de mariage de 9 h à 4 h du matin, ses variantes (hiver, matin, brunch), les marges à prévoir et la fiche à donner aux prestataires.',
    author: 'Camille Rouzaud',
    date: '2026-10-10',
    read: '12 min',
    caption: 'Une feuille de déroulé du jour J scotchée sur une porte de cuisine, éclairée au flash pendant un mariage',
    body: `
<p>Un bon déroulé de mariage, c’est ce qui te permet de vivre ta journée au lieu de la gérer. C’est un tableau heure par heure, partagé avec tous les prestataires, qui dit qui fait quoi, où et quand, du maquillage du matin à la dernière navette.</p>
<p>On te donne ici un modèle complet, de 9&nbsp;h à 4&nbsp;h du matin, pour un mariage type en France : mairie, cérémonie laïque ou religieuse, vin d’honneur, dîner et soirée. Puis les variantes (mariage d’hiver, cérémonie le matin, brunch du lendemain), les marges à prévoir, qui doit tenir le déroulé, et la fiche à envoyer aux prestataires. Ce modèle sert aussi aux wedding planners qui veulent une trame de départ.</p>

<h2>Le déroulé du jour J : par où commencer</h2>
<p>Un déroulé se construit à l’envers, à partir de trois points fixes :</p>
<ul>
<li><strong>L’heure de la mairie</strong>, que la mairie fixe souvent elle-même. C’est le point le moins négociable de la journée.</li>
<li><strong>L’heure du coucher du soleil</strong>, si tu veux des photos de couple dans la belle lumière. En juin, le soleil se couche vers 22&nbsp;h dans une grande partie de la France ; en octobre, vers 19&nbsp;h.</li>
<li><strong>L’heure de fin imposée par le lieu</strong> (et par le contrat du DJ), qui fixe la fin de la soirée.</li>
</ul>
<p>Entre ces points, tu places les moments clés, puis tu ajoutes les trajets et les marges. Ce travail commence quelques semaines avant le mariage : il fait partie des dernières étapes de <a href="/journal/retroplanning-mariage">ton rétroplanning</a>.</p>

<h2>Le modèle : déroulé de mariage heure par heure</h2>
<p>Hypothèse : mariage un samedi de juin, 100 invités, mairie à 14&nbsp;h, cérémonie laïque (ou religieuse) à 16&nbsp;h sur le lieu de réception ou à proximité, puis vin d’honneur, dîner et soirée au même endroit.</p>
<table>
<thead><tr><th>Heure</th><th>Ce qui se passe</th><th>Qui est concerné</th></tr></thead>
<tbody>
<tr><td><strong>9&nbsp;h</strong></td><td>Petit-déjeuner, début de la coiffure et du maquillage (en commençant par les proches, les mariés passent en dernier)</td><td>Mariés, témoins, coiffeuse, maquilleuse</td></tr>
<tr><td><strong>9&nbsp;h 30</strong></td><td>Arrivée du wedding planner ou du coordinateur sur le lieu, accueil du fleuriste et du décorateur</td><td>Coordinateur, fleuriste, lieu</td></tr>
<tr><td><strong>10&nbsp;h 30</strong></td><td>Livraison des bouquets et boutonnières aux deux lieux de préparatifs</td><td>Fleuriste, témoins</td></tr>
<tr><td><strong>11&nbsp;h</strong></td><td>Arrivée du photographe aux préparatifs (détails, robe, alliances, ambiance)</td><td>Photographe</td></tr>
<tr><td><strong>12&nbsp;h</strong></td><td>Déjeuner léger pour tout le monde dans les préparatifs (personne ne doit arriver à la mairie le ventre vide)</td><td>Mariés, proches</td></tr>
<tr><td><strong>12&nbsp;h 45</strong></td><td>Habillage des mariés</td><td>Mariés, témoins, photographe</td></tr>
<tr><td><strong>13&nbsp;h 15</strong></td><td>Découverte des mariés (first look) et quelques portraits, si vous le souhaitez</td><td>Mariés, photographe</td></tr>
<tr><td><strong>13&nbsp;h 30</strong></td><td>Départ vers la mairie</td><td>Mariés, chauffeur</td></tr>
<tr><td><strong>13&nbsp;h 40</strong></td><td>Arrivée des invités devant la mairie</td><td>Invités, témoins</td></tr>
<tr><td><strong>14&nbsp;h</strong></td><td>Cérémonie civile (souvent 20 à 30 minutes)</td><td>Mariés, témoins, officier d’état civil</td></tr>
<tr><td><strong>14&nbsp;h 30</strong></td><td>Sortie de mairie, haie d’honneur, lancer de pétales, photo de groupe sur les marches</td><td>Tous, photographe</td></tr>
<tr><td><strong>15&nbsp;h</strong></td><td>Trajet vers le lieu de la cérémonie laïque (ou vers l’église)</td><td>Tous</td></tr>
<tr><td><strong>15&nbsp;h 30</strong></td><td>Installation des invités, musique d’accueil, distribution des livrets</td><td>Invités, coordinateur, musiciens</td></tr>
<tr><td><strong>16&nbsp;h</strong></td><td>Cérémonie laïque ou religieuse (45 minutes à 1 heure)</td><td>Mariés, officiant, intervenants</td></tr>
<tr><td><strong>17&nbsp;h</strong></td><td>Sortie de cérémonie, début du vin d’honneur</td><td>Tous, traiteur</td></tr>
<tr><td><strong>17&nbsp;h 15</strong></td><td>Les affiches QR code de l’animation photo sont en place (bar, tables hautes, entrée), et le DJ ou les témoins l’annoncent au micro</td><td>Coordinateur, DJ ou témoins</td></tr>
<tr><td><strong>17&nbsp;h 30</strong></td><td>Photos de groupe (famille, amis, collègues), liste préparée à l’avance</td><td>Photographe, un témoin qui appelle les groupes</td></tr>
<tr><td><strong>18&nbsp;h 15</strong></td><td>Les mariés profitent du vin d’honneur avec leurs invités</td><td>Mariés</td></tr>
<tr><td><strong>19&nbsp;h 30</strong></td><td>Les invités passent en salle et trouvent leur table</td><td>Invités, coordinateur, traiteur</td></tr>
<tr><td><strong>19&nbsp;h 50</strong></td><td>Entrée des mariés dans la salle</td><td>Mariés, DJ</td></tr>
<tr><td><strong>20&nbsp;h</strong></td><td>Entrée du dîner</td><td>Traiteur</td></tr>
<tr><td><strong>20&nbsp;h 45</strong></td><td>Premiers discours (témoins, parents), entre deux plats</td><td>Témoins, parents, DJ</td></tr>
<tr><td><strong>21&nbsp;h 15</strong></td><td>Plat principal</td><td>Traiteur</td></tr>
<tr><td><strong>21&nbsp;h 30</strong></td><td>Quinze minutes de portraits de couple dehors, dans la lumière du coucher de soleil</td><td>Mariés, photographe</td></tr>
<tr><td><strong>22&nbsp;h 15</strong></td><td>Fromage, animation ou vidéo des proches</td><td>Traiteur, témoins</td></tr>
<tr><td><strong>23&nbsp;h</strong></td><td>Dessert, pièce montée ou gâteau</td><td>Traiteur, DJ</td></tr>
<tr><td><strong>23&nbsp;h 30</strong></td><td>Ouverture du bal</td><td>Mariés, DJ</td></tr>
<tr><td><strong>0&nbsp;h</strong></td><td>Soirée dansante. Le photographe part souvent entre minuit et 1&nbsp;h : c’est là que les photos des invités prennent le relais</td><td>Tous</td></tr>
<tr><td><strong>1&nbsp;h 30</strong></td><td>Buffet de nuit (soupe à l’oignon, salé, bonbons)</td><td>Traiteur</td></tr>
<tr><td><strong>3&nbsp;h</strong></td><td>Dernières chansons, selon l’heure de fin prévue au contrat</td><td>DJ</td></tr>
<tr><td><strong>4&nbsp;h</strong></td><td>Dernières navettes, fermeture du lieu</td><td>Invités, lieu, chauffeurs</td></tr>
<tr><td><strong>Le lendemain</strong></td><td>Brunch (par exemple de 11&nbsp;h à 15&nbsp;h) et révélation de l’album photo des invités</td><td>Mariés, proches</td></tr>
</tbody>
</table>
<p>Ce tableau est une base. Les horaires exacts dépendent de ta mairie, de la distance entre les lieux et de ton traiteur : demande-lui le temps de service réel pour son menu, c’est souvent ce qui fait dériver une soirée.</p>

<h2>Les trois moments à ne pas rater</h2>
<h3>L’annonce de l’animation photo au vin d’honneur</h3>
<p>Le vin d’honneur est le meilleur moment pour lancer une animation photo : les invités ont les mains libres, ils attendent les mariés, et la lumière est encore belle. Si tu utilises un QR code (galerie partagée ou appareil photo jetable comme <a href="/appareil-jetable-mariage">Time to Flash</a>), les affiches doivent être en place à la sortie de la cérémonie, et quelqu’un doit l’annoncer au micro dans le premier quart d’heure. Sans annonce, une affiche seule fait peu de scans. On t’explique où les placer dans <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a>, et tu peux créer une affiche gratuitement avec notre <a href="/generateur-qr-code-mariage">générateur d’affiche QR code</a>.</p>

<h3>Les photos de groupe</h3>
<p>C’est le créneau qui déborde le plus souvent. Prépare une liste courte (dix groupes maximum), donne-la au photographe et à un témoin qui connaît les deux familles et qui appelle les groupes. Le détail est dans <a href="/journal/photos-de-groupe-mariage">comment réussir les photos de groupe</a>.</p>

<h3>La révélation de l’album le lendemain</h3>
<p>Si les photos de tes invités restent cachées jusqu’au lendemain, la révélation devient un deuxième moment fort, idéalement pendant le brunch ou en fin de matinée. Tout le monde découvre la soirée vue par les autres, en même temps. C’est expliqué dans <a href="/journal/revelation-photos-lendemain-mariage">la révélation des photos au lendemain</a>.</p>

<h2>Les variantes du déroulé</h2>
<h3>Mariage d’hiver</h3>
<p>En décembre, la nuit tombe vers 17&nbsp;h. Avance tout ce qui demande de la lumière : photos de couple avant la mairie (avec une découverte le matin), photos de groupe juste après la cérémonie, à l’intérieur si besoin. Le vin d’honneur se fait au chaud, souvent plus court (une heure suffit), et le dîner peut commencer plus tôt, vers 19&nbsp;h. Prévois un vestiaire et des plaids pour les trajets.</p>

<h3>Cérémonie le matin</h3>
<p>Mairie vers 11&nbsp;h, vin d’honneur à midi, puis déjeuner assis vers 13&nbsp;h 30. L’après-midi se passe en jeux, en animations ou en temps libre, et la soirée continue avec un dîner plus léger (buffet, food trucks) avant la soirée dansante. Avantage : tes invités profitent de la lumière du jour. Inconvénient : une très longue journée, où il faut prévoir des temps calmes, surtout pour les enfants et les plus âgés.</p>

<h3>Mairie la veille ou en semaine</h3>
<p>De plus en plus de couples passent à la mairie le vendredi en petit comité, et gardent le samedi pour la cérémonie laïque et la fête. Le déroulé du samedi démarre alors plus tard : préparatifs à 11&nbsp;h, cérémonie laïque à 16&nbsp;h, et le reste à l’identique.</p>

<h3>Mariage religieux</h3>
<p>En France, le mariage civil doit avoir lieu avant la cérémonie religieuse. Les horaires de l’église ou du lieu de culte sont fixés avec la paroisse ou l’officiant, parfois plusieurs mois à l’avance. Compte environ 45 minutes pour une cérémonie sans messe, et plus d’une heure avec une messe.</p>

<h3>Le brunch du lendemain</h3>
<p>Un créneau large (11&nbsp;h à 15&nbsp;h par exemple) laisse chacun arriver à son rythme. Prévois une ou deux tables pour les plus fatigués, de la place pour les enfants, et un moment pour lancer la révélation des photos des invités : tout le monde est là, téléphone en main, pour les découvrir ensemble.</p>

<h2>La veille et le matin : ce qui doit être prêt</h2>
<p>Un déroulé tenu le jour J se prépare la veille. Avant d’aller dormir, vérifie que ces points sont réglés :</p>
<ul>
<li><strong>La décoration installée</strong>, ou au moins déposée sur le lieu, avec une personne désignée pour la mise en place du matin.</li>
<li><strong>La répétition de la cérémonie laïque</strong> faite avec les intervenants : qui entre quand, qui lit quoi, où se placer.</li>
<li><strong>Les alliances confiées</strong> à un témoin, pas dans la poche des mariés.</li>
<li><strong>Les enveloppes des prestataires</strong> à régler le jour J préparées et confiées au coordinateur, avec la liste.</li>
<li><strong>Les affiches et chevalets</strong> (plan de table, QR code photo, signalétique) rangés dans une boîte étiquetée.</li>
<li><strong>Un kit de secours</strong> : épingles, kit de couture, mouchoirs, pansements, antidouleurs, chargeur, détachant.</li>
<li><strong>Le déroulé imprimé</strong> en plusieurs exemplaires : coordinateur, témoins, traiteur, DJ.</li>
</ul>

<h2>Les enfants dans le déroulé</h2>
<p>Avec beaucoup d’enfants, le déroulé type demande quelques ajustements. Fais servir leur repas plus tôt (vers 19&nbsp;h 30, pendant que les adultes finissent le vin d’honneur), prévois une animatrice ou un coin calme avec des coussins et un film à partir de 21&nbsp;h, et préviens les parents de l’heure à laquelle les plus petits pourront aller se coucher si le lieu propose des chambres. Les enfants sont aussi d’excellents photographes : avec une animation photo par QR code, ils participent comme les grands, depuis le téléphone d’un parent.</p>

<h2>Le plan B pluie</h2>
<p>Un plan B ne s’improvise pas le matin. Note dans le déroulé : l’endroit de repli pour la cérémonie laïque et le vin d’honneur, la personne qui décide, et l’heure limite de décision (souvent la veille au soir ou le matin vers 10&nbsp;h, pour laisser le temps au lieu et au traiteur de réorganiser). Prévois aussi des parapluies pour la sortie de mairie et les photos de groupe : un parapluie transparent fait de très belles photos sous la pluie.</p>

<h2>Les marges à prévoir</h2>
<p>Un déroulé sans marge est un déroulé qui déraille dès la sortie de mairie. Voici les moments qui prennent presque toujours plus de temps que prévu :</p>
<table>
<thead><tr><th>Moment</th><th>Durée prévue</th><th>Marge conseillée</th></tr></thead>
<tbody>
<tr><td>Coiffure et maquillage</td><td>45 min par personne</td><td>+ 30 min sur l’ensemble</td></tr>
<tr><td>Trajets entre deux lieux</td><td>Temps de l’application</td><td>+ 15 min (cortège, stationnement)</td></tr>
<tr><td>Sortie de mairie ou de cérémonie</td><td>15 min</td><td>+ 15 min (tout le monde veut féliciter)</td></tr>
<tr><td>Photos de groupe</td><td>30 min</td><td>+ 15 min</td></tr>
<tr><td>Passage du vin d’honneur à la salle</td><td>15 min</td><td>+ 15 min</td></tr>
<tr><td>Discours</td><td>3 à 5 min chacun</td><td>Limiter le nombre plutôt que la durée</td></tr>
<tr><td>Service d’un plat</td><td>Selon le traiteur</td><td>Demander le temps réel</td></tr>
</tbody>
</table>
<p>Une astuce : ne mets pas toutes les marges à la fin. Places-en une petite après chaque moment à risque, pour qu’un retard ne se répercute pas sur toute la soirée.</p>

<h2>Qui tient le déroulé</h2>
<p><strong>Pas toi.</strong> Le jour J, tu ne dois pas regarder ta montre. Trois possibilités :</p>
<ul>
<li><strong>Un wedding planner ou un coordinateur du jour J</strong> : c’est son métier, il connaît les prestataires et anticipe les retards.</li>
<li><strong>Un témoin ou un proche organisé</strong>, qui accepte de passer une partie de la journée un œil sur l’horloge. Choisis quelqu’un qui n’a pas déjà un rôle chargé (discours, lecture, animation).</li>
<li><strong>Le duo DJ et maître d’hôtel du traiteur</strong>, pour la soirée : ce sont eux qui rythment le dîner et les discours. Ils doivent avoir le même déroulé que tout le monde.</li>
</ul>
<p>Dans tous les cas, une seule personne prend les décisions quand ça dérape (la pluie, un retard, un plat qui tarde). Les prestataires doivent savoir qui c’est.</p>

<h2>La fiche à donner aux prestataires</h2>
<p>Le déroulé complet est pour la personne qui coordonne. Chaque prestataire, lui, a besoin d’une fiche d’une page avec ce qui le concerne. Envoie-la deux semaines avant le mariage, puis confirme par message la semaine du jour J.</p>
<p><strong>Ce que la fiche doit contenir :</strong></p>
<ul>
<li>Les adresses exactes (préparatifs, mairie, cérémonie, réception) et les accès (parking, porte de livraison, code du portail).</li>
<li>Le contact de la personne qui coordonne, et un contact de secours.</li>
<li>L’heure d’arrivée, de montage et de démontage de ce prestataire.</li>
<li>Les moments clés qui le concernent (entrée des mariés, discours, ouverture du bal, pièce montée).</li>
<li>Le plan B en cas de pluie.</li>
<li>Le repas prévu pour lui, et l’heure à laquelle il peut le prendre.</li>
<li>Pour le photographe : la liste des photos de groupe et des personnes importantes à ne pas oublier.</li>
<li>Pour le DJ : les musiques des moments clés, la liste des discours, et les annonces à faire (dont l’animation photo au vin d’honneur).</li>
</ul>
<p>Pour tes invités, une version encore plus courte suffit : les heures et les adresses, sur le site du mariage ou dans un message. On t’a préparé le texte à leur envoyer dans <a href="/journal/brief-invites">le brief invités</a>.</p>

<h2>Les erreurs classiques</h2>
<ul>
<li><strong>Trop de discours.</strong> Au-delà de quatre ou cinq, la salle décroche. Répartis-les entre les plats.</li>
<li><strong>Oublier de manger.</strong> Les mariés sont souvent sollicités pendant tout le dîner. Demande au traiteur de vous servir en premier, et protège ce moment.</li>
<li><strong>Un vin d’honneur sans toi.</strong> Si les photos de groupe et de couple prennent tout le vin d’honneur, tu ne vois pas tes invités. Limite-les.</li>
<li><strong>Pas de plan B pluie.</strong> Il doit être écrit dans le déroulé, avec l’heure limite à laquelle on décide.</li>
<li><strong>Un déroulé que seuls les mariés connaissent.</strong> S’il n’est pas partagé avec chaque prestataire, il ne sert à rien.</li>
</ul>

<h2>En résumé</h2>
<ul>
<li>Pars des points fixes (mairie, coucher du soleil, heure de fin) et construis à l’envers.</li>
<li>Place une marge après chaque moment à risque.</li>
<li>Confie le déroulé à quelqu’un d’autre que toi, et envoie une fiche d’une page à chaque prestataire deux semaines avant.</li>
<li>Prévois l’annonce de l’animation photo au vin d’honneur, et la révélation de l’album le lendemain.</li>
</ul>
<p>Pour l’animation photo, tu peux <a href="/create">créer ton album Time to Flash</a> (gratuit jusqu’à 5 invités, pour faire un essai avec tes témoins). Et si tu es wedding planner et que tu veux proposer cette animation à tes mariés, tout est sur <a href="/pro">l’espace prestataires</a>.</p>
`,
    faq: [
      {
        q: 'Comment faire le déroulé de son mariage ?',
        a: 'Pars des points fixes : l’heure de la mairie, l’heure du coucher du soleil si tu veux des portraits dans la belle lumière, et l’heure de fin imposée par le lieu. Place ensuite les moments clés (cérémonie, vin d’honneur, dîner, ouverture du bal), ajoute les trajets et une marge après chaque moment à risque.',
      },
      {
        q: 'Combien de temps dure un vin d’honneur ?',
        a: 'En général entre une heure et deux heures et demie. Il doit laisser le temps aux photos de groupe et de couple, tout en permettant aux mariés de profiter de leurs invités. En hiver, une heure suffit souvent.',
      },
      {
        q: 'À quelle heure commence le dîner d’un mariage ?',
        a: 'Le plus souvent vers 20 h pour un mariage avec cérémonie l’après-midi, après un vin d’honneur qui commence vers 17 h. En hiver ou avec une cérémonie le matin, il peut commencer plus tôt.',
      },
      {
        q: 'Qui doit tenir le déroulé le jour J ?',
        a: 'Un wedding planner ou un coordinateur du jour J, ou à défaut un témoin organisé qui n’a pas déjà un rôle chargé. Les mariés ne doivent pas avoir à regarder leur montre, et les prestataires doivent savoir qui prend les décisions en cas d’imprévu.',
      },
      {
        q: 'Quand envoyer le déroulé aux prestataires ?',
        a: 'Environ deux semaines avant le mariage, sous forme d’une fiche d’une page par prestataire avec les adresses, les contacts, ses horaires et les moments qui le concernent. Confirme ensuite par message la semaine du mariage.',
      },
      {
        q: 'Quand annoncer l’animation photo des invités ?',
        a: 'Au début du vin d’honneur, dans le premier quart d’heure : les invités ont les mains libres et attendent les mariés. Les affiches QR code doivent être en place à la sortie de la cérémonie, et le DJ ou les témoins l’annoncent au micro.',
      },
    ],
  },
]

export const POSTS_EN = {
  // EN : « wedding planner services », « wedding planner add-on services »,
  // « how to stand out as a wedding planner ». Pages en tête : QC Event
  // School, Designbeep, Planning Pod (add-ons : brunch, bachelorette,
  // destination weddings, honeymoon travel, sustainability, consulting).
  'services-wedding-planner': {
    title: 'Wedding planner services: 12 add-ons that set you apart',
    excerpt: 'The three classic wedding planner packages, then 12 add-on services to build into your offer: what couples gain, your margin, and how to sell each one.',
    caption: 'A wedding planner lays out place cards on a white tablecloth the evening before a wedding, in a hall still being set up',
    body: `
<p>Wedding planner services often fit on three lines of a brochure: full planning, partial planning, day-of coordination. Couples compare those three lines from one planner to the next, and the conversation quickly turns to price. To get out of that comparison, you need an offer that doesn’t look like everyone else’s.</p>
<p>This guide covers the core packages (what goes in them, how to scope them), then walks through <strong>12 add-on services</strong> you can build into your offer. For each one: what the couple gains, the effort or margin it represents for you, and how to present it without it feeling like padding.</p>

<h2>Wedding planner services: the three core packages</h2>
<p>Almost every planner builds their offer around the same three packages. The names vary; the contents much less so.</p>

<h3>Full planning</h3>
<p>You run the project from start to finish, often 12 to 18 months before the date: budget, venue search, vendor selection and negotiation, contracts and payment schedules, design direction, planning timeline, guest management, then coordination on the day. It is the most profitable package per wedding, and also the one that eats the most hours: dozens of meetings, site visits and email threads.</p>

<h3>Partial planning</h3>
<p>The couple has already made progress (usually the venue and caterer are booked) and hands you the rest: a few vendors to find, the decor, the schedule, the coordination. This is the package where scope creeps most easily. Write down, in the quote, exactly which vendors you take on and how many meetings are included.</p>

<h3>Day-of coordination</h3>
<p>The name is misleading: nobody coordinates a wedding well if they discover it that morning. In practice you start one to three months before: review every contract, call every vendor, do a technical walkthrough of the venue, build the run of show, then stay from morning to evening. It is often the entry point for couples who planned to “do it all themselves” and realise, two months out, that they don’t want to spend the day managing the caterer.</p>

<table>
<thead><tr><th>Package</th><th>You start</th><th>What you handle</th><th>Typical range in France</th></tr></thead>
<tbody>
<tr><td><strong>Full planning</strong></td><td>12 to 18 months out</td><td>Everything, from budget to the day</td><td>Roughly €3,000 to €6,000, far more at the high end</td></tr>
<tr><td><strong>Partial planning</strong></td><td>4 to 9 months out</td><td>Some vendors, decor, schedule, the day</td><td>Roughly €1,500 to €3,500</td></tr>
<tr><td><strong>Day-of coordination</strong></td><td>1 to 3 months out</td><td>File review, run of show, presence on the day</td><td>Roughly €900 to €2,500</td></tr>
</tbody>
</table>
<p>These ranges come from rates published by French planners and specialist guides in 2026. They vary a lot by region, experience, country and guest count: treat them as orders of magnitude, not a price list.</p>
<p><strong>Flat fee or percentage?</strong> Some planners charge a percentage of the total budget (10 to 15% is often quoted), but most use a flat fee. A flat fee reassures couples (they know what they are paying) and spares you the suspicion of pushing spending up to raise your own fee.</p>

<h2>Why add extra services</h2>
<p>Three reasons, in order of importance.</p>
<ul>
<li><strong>To stand out.</strong> On the three core packages, all planners look alike. What gets a contract signed is often a detail the couple hasn’t seen anywhere else.</li>
<li><strong>To raise your average booking value</strong> without taking on more weddings. A €300 service sold to half your couples soon weighs as much as one extra wedding a year, for far fewer lost weekends.</li>
<li><strong>To make the couple’s life simpler.</strong> One point of contact instead of five: that is exactly what they are buying when they hire a planner.</li>
</ul>
<p>Before the list, a useful distinction. An add-on can be sold in three ways:</p>
<ol>
<li><strong>You do it yourself</strong> (stationery, design, guest management): high margin, but it is your time.</li>
<li><strong>You subcontract and re-invoice</strong> with a margin: little time, but you are responsible for the result.</li>
<li><strong>You refer a partner</strong>: no risk, sometimes a referral fee. In that case, tell the couple. Being open about it builds trust; it is not a weakness.</li>
</ol>

<h2>12 add-on services for wedding planners</h2>

<h3>1. Design and styling</h3>
<p><strong>For the couple:</strong> a coherent creative direction, from invitations to centrepieces, instead of a pile of Pinterest ideas that don’t go together.</p>
<p><strong>Effort and margin:</strong> one of the best-valued services, because it rests on your taste and your contacts. It does take design time (moodboard, floor plan, materials) and, if you rent out decor, storage and handling.</p>
<p><strong>How to sell it:</strong> show mood boards made for real weddings, and offer two levels: design only (the couple buys and sets up), or design with rental and installation.</p>

<h3>2. Stationery</h3>
<p><strong>For the couple:</strong> invitations, menus, place cards, seating chart, signage and order of service in one visual identity, without chasing three printers.</p>
<p><strong>Effort and margin:</strong> if you are comfortable with a layout tool, the margin is good. If not, work with a designer or stationery studio and re-invoice. Watch the proofing rounds (spelling of names, times): cap the number of revisions.</p>
<p><strong>How to sell it:</strong> put a printed piece on the table at the first meeting. A beautiful menu or seating chart is something people touch, and it sells better than a file.</p>

<h3>3. Guest management</h3>
<p><strong>For the couple:</strong> no more spreadsheet half-updated on three phones. You centralise RSVPs, dietary needs, children, allergies and transport, and build the seating plan with them.</p>
<p><strong>Effort and margin:</strong> not technical, but time-consuming in the last two months (late replies, last-minute plus-ones). Charge a flat fee with a cut-off date for changes.</p>
<p><strong>How to sell it:</strong> ask the couple how many messages their family already sends them about the wedding. They quickly see the value of redirecting them to you.</p>

<h3>4. Guest accommodation and transport</h3>
<p><strong>For the couple:</strong> guests know where to sleep, how to get there and how to get home, and nobody drives at 4 a.m.</p>
<p><strong>Effort and margin:</strong> negotiating room blocks and organising shuttles takes little creativity but a lot of follow-up. A legal point to check: if you <em>sell</em> a bundle of transport and accommodation at a single price yourself, you may fall under package travel rules. In France this requires registration with Atout France, and most countries have similar rules. The simplest approach is often to negotiate rates and let each guest book and pay directly.</p>
<p><strong>How to sell it:</strong> for a wedding at a remote venue, it is almost a safety argument. Present it that way.</p>

<h3>5. Help with the legal paperwork</h3>
<p><strong>For the couple:</strong> a complete marriage file, first time. In France, each town hall sets its own filing deadlines and the banns are published for at least ten days before the ceremony: couples who discover these steps late remember it. Other countries have their own notice periods.</p>
<p><strong>Effort and margin:</strong> you can’t do the formalities for them, but you can prepare the document list, the deadlines and the witnesses, and handle the practical side with the registry office (times, seating, whether photos are allowed). Low effort once your template is ready.</p>
<p><strong>How to sell it:</strong> rather than as a paid option, include it in your premium packages. It costs you little and reassures them a lot.</p>

<h3>6. The symbolic ceremony</h3>
<p><strong>For the couple:</strong> a ceremony that feels like them, written with them, with speakers who know when to stand up and what to read.</p>
<p><strong>Effort and margin:</strong> if you officiate yourself, it is a service in its own right (interviews, writing, rehearsal). Otherwise, work with a partner celebrant and keep the coordination: seating, music, processional, timing.</p>
<p><strong>How to sell it:</strong> show a sample ceremony outline at the first meeting. Couples torn between “just the legal bit” and a symbolic ceremony often decide once they see what it could look like.</p>

<h3>7. Entertainment for the drinks reception and the party</h3>
<p><strong>For the couple:</strong> a drinks reception that doesn’t feel like two hours of waiting during photos, and an evening that doesn’t rest on the DJ alone.</p>
<p><strong>Effort and margin:</strong> musicians, caricaturist, lawn games, cocktail bar, tastings: you work with partners, and your value lies in selection and coordination. We list plenty in <a href="/journal/idees-animation-mariage">our wedding entertainment ideas</a>.</p>
<p><strong>How to sell it:</strong> suggest two or three activities that fit the guest profile (lots of children, lots of older guests, guests who don’t know each other), not a catalogue.</p>

<h3>8. Guest photo activity</h3>
<p><strong>For the couple:</strong> the photos the photographer can’t take. They are with the couple during portraits; they don’t see the back table, the laughter at the bar, grandma on the dance floor at 1 a.m. The guests are everywhere.</p>
<p>There are several ways to do it: a photo booth, a guest book with an instant camera, a shared gallery, or a disposable camera activity on the guests’ phones. We compare them in <a href="/journal/comparatif-animations-photo-mariage">photo booth, selfie booth, mirror or disposable: which to choose?</a></p>
<p>Take the disposable camera format, which is what we built with <strong>Time to Flash</strong>. Each guest scans a QR code, types their first name, and their phone becomes a disposable camera: no app to install, a limited number of shots (3 to 15, your choice), a film look, and photos hidden until the reveal. The next day, the album opens all at once for everyone.</p>
<p><strong>What you handle, in practice:</strong></p>
<ul>
<li><strong>Setting up the event</strong>: shots per guest, when the reveal happens (the next day by default), the film look. You can invite the couple as co-organisers.</li>
<li><strong>The print kit</strong>: the QR code alone, an A4 poster, table tents and small cards come ready to print from the dashboard. You fold them into your signage.</li>
<li><strong>The announcement</strong>: one line in the DJ’s sheet or in the best man’s or maid of honour’s words during the drinks reception.</li>
<li><strong>Reviewing before the reveal</strong>, with the couple if you like: the organiser sees the photos before anyone else and can remove any that cause offence.</li>
</ul>
<p><strong>How long it takes you:</strong> in practice half an hour of preparation is enough (setup, printing, a line in the run of show), then a few minutes on the day to put up the posters. Nothing to assemble, no technician, no deposit.</p>
<p><strong>Effort and margin:</strong> it is a one-off payment based on guest count, for example €34.99 for up to 150 guests or €59.99 for up to 300. You can include it in your packages as a signature touch, or offer it as an option.</p>
<p><strong>How to sell it:</strong> show it. Have the couple scan the QR code during the meeting and take a photo. It is usually something they haven’t seen at other weddings, and it complements the photographer rather than competing with them.</p>

<h3>9. Order of service and guest kits</h3>
<p><strong>For the couple:</strong> guests who know what is happening and when. The order of service, the weekend programme, and the little kits that save an evening (fans, tissues, blister plasters, dancing flip-flops).</p>
<p><strong>Effort and margin:</strong> low, especially combined with stationery. The margin comes from bulk buying and assembly.</p>
<p><strong>How to sell it:</strong> alongside another service, never alone. A basket of kits in the cloakroom is the kind of detail guests mention to the couple.</p>

<h3>10. The whole weekend: the night before and the day-after brunch</h3>
<p><strong>For the couple:</strong> a two- or three-day wedding, increasingly common, without the logistics of the welcome dinner and brunch falling on them.</p>
<p><strong>Effort and margin:</strong> it is often the same venue and the same vendors. A brunch takes far less energy to coordinate than the wedding day, which makes it one of the best ratios of time spent to revenue.</p>
<p><strong>How to sell it:</strong> present the brunch as the end of the wedding, not as an extra meal. It is also the perfect moment to reveal the guests’ photos, which everyone discovers together (see <a href="/journal/revelation-photos-lendemain-mariage">the next-day reveal</a>).</p>

<h3>11. Supporting the wedding party, and the hen or stag do</h3>
<p><strong>For the couple:</strong> a wedding party who knows what is expected of them, and a hen or stag do that doesn’t spill into wedding week.</p>
<p><strong>Effort and margin:</strong> a briefing meeting with the wedding party takes an hour. Organising a whole hen do is a real project, with a different client (the friends). Decide whether you want that market.</p>
<p><strong>How to sell it:</strong> the wedding party briefing fits easily into every package. It saves you time on the day, and the wedding party become your allies (and often your future clients).</p>

<h3>12. After the wedding</h3>
<p><strong>For the couple:</strong> nothing to deal with when they get back: rentals returned, tableware collected, thank-you cards, dress care, photos gathered in one place.</p>
<p><strong>Effort and margin:</strong> low, and it extends the relationship past the wedding day. It is also the window when couples are most willing to leave a review and recommend you.</p>
<p><strong>How to sell it:</strong> as an option at signing, or included in full planning. We come back to why this moment matters for your reputation in <a href="/journal/trouver-clients-wedding-planner">how to find wedding planning clients</a>.</p>

<h2>The summary table</h2>
<table>
<thead><tr><th>Service</th><th>Your effort</th><th>Possible margin</th><th>When to offer it</th></tr></thead>
<tbody>
<tr><td>Design and styling</td><td>High</td><td>High</td><td>First meeting</td></tr>
<tr><td>Stationery</td><td>Medium</td><td>Good</td><td>After signing</td></tr>
<tr><td>Guest management</td><td>Medium</td><td>Medium</td><td>Six months out</td></tr>
<tr><td>Accommodation and transport</td><td>Medium</td><td>Low to medium</td><td>Once the venue is chosen</td></tr>
<tr><td>Legal paperwork help</td><td>Low</td><td>Low (selling point)</td><td>At signing</td></tr>
<tr><td>Symbolic ceremony</td><td>High if you officiate</td><td>Good</td><td>First meeting</td></tr>
<tr><td>Entertainment</td><td>Low to medium</td><td>Medium</td><td>Four to six months out</td></tr>
<tr><td>Guest photo activity</td><td>Very low</td><td>Up to you</td><td>First meeting (demo)</td></tr>
<tr><td>Order of service and kits</td><td>Low</td><td>Medium</td><td>With stationery</td></tr>
<tr><td>Weekend and brunch</td><td>Medium</td><td>Good</td><td>At signing</td></tr>
<tr><td>Wedding party and hen do</td><td>Low to high</td><td>Variable</td><td>Three to six months out</td></tr>
<tr><td>After the wedding</td><td>Low</td><td>Low (loyalty)</td><td>At signing</td></tr>
</tbody>
</table>

<h2>How to present your add-ons</h2>
<p>A list of twelve options at the bottom of a quote scares people off. Three approaches work better.</p>
<p><strong>Bundles rather than a menu.</strong> Group services by logic: a “guests” bundle (guest management, accommodation, shuttles, kits), a “design” bundle (styling, stationery, order of service), a “weekend” bundle (welcome dinner, brunch, after the wedding). Couples choose a bundle, not ten lines.</p>
<p><strong>A signature included everywhere.</strong> Pick one or two services that cost you little and are very visible to guests, and include them in every package. That is what makes guests ask “who organised this?”.</p>
<p><strong>The right moment.</strong> At the first meeting, talk about what gets contracts signed (design, ceremony, a live demo). Logistics options (shuttles, kits, after the wedding) come later, when the couple starts to realise how much is left to do.</p>

<h2>How to stand out as a wedding planner</h2>
<p>Add-ons are not enough if they look like everyone else’s. Four levers make the difference.</p>
<ul>
<li><strong>A clear specialty.</strong> Countryside weddings, small weddings, multicultural weddings, low-impact weddings: a precise positioning is easier to remember than “all kinds of weddings”.</li>
<li><strong>A visible method.</strong> Show your planning timeline, your run of show, your vendor sheet (there is a template in <a href="/journal/deroule-jour-j-mariage">the hour-by-hour wedding day timeline</a>). Couples are buying peace of mind: prove it.</li>
<li><strong>An experience for the guests.</strong> Couples don’t remember your spreadsheet; they remember what their guests told them. An activity that involves everyone, a thoughtful order of service, a shuttle on time: that is what gets talked about afterwards.</li>
<li><strong>Follow-up after the day.</strong> Most vendors vanish the next morning. A message on the morning the photos are revealed, some feedback on the evening, a review request at the right time: that is the best advertising you can get.</li>
</ul>

<h2>In short</h2>
<ul>
<li>Scope your three core packages in writing (vendors included, number of meetings).</li>
<li>Choose the add-ons that match your specialty, not all of them.</li>
<li>Group them into bundles, and include a signature touch guests can see in every package.</li>
<li>Stay in touch after the wedding: that is where referrals are born.</li>
</ul>
<p>If a guest photo activity appeals to you as a service for your couples, we have opened a space for wedding professionals: <a href="/pro">offer Time to Flash to your couples</a>. And to structure your business, see also <a href="/journal/devenir-wedding-planner-outils">the wedding planner’s toolkit for 2026</a>.</p>
`,
    faq: [
      {
        q: 'What services does a wedding planner offer?',
        a: 'Most planners offer three packages: full planning (from budget to the day), partial planning (some vendors plus coordination) and day-of coordination, which in practice starts one to three months before. Many add extra services such as design, stationery, guest management or accommodation.',
      },
      {
        q: 'What add-on services can a wedding planner offer?',
        a: 'The most common are design and styling, stationery, guest management, accommodation and shuttles, symbolic ceremonies, entertainment and guest photo activities, the day-after brunch and post-wedding services. The key is to pick the ones that fit your specialty and group them into bundles.',
      },
      {
        q: 'How much does day-of coordination cost?',
        a: 'In France in 2026, typical rates range from about €900 for a new planner to €2,500 for an experienced one, sometimes more at the high end. The price depends on the region, the guest count and how much preparation is included beforehand.',
      },
      {
        q: 'How can a wedding planner stand out?',
        a: 'By choosing a clear specialty, showing their method (planning timeline, run of show, vendor sheet), offering an experience guests talk about, and staying present after the wedding. A live demo in a meeting is more convincing than a list of services.',
      },
      {
        q: 'Can a wedding planner sell guest accommodation?',
        a: 'They can negotiate rates and coordinate bookings. Selling a bundle of transport and accommodation at a single price, however, may count as package travel, which in France requires registration with Atout France. Check the rules in your country before invoicing this kind of service.',
      },
    ],
  },
  // EN : « how to become a wedding planner », « wedding planner software »,
  // « wedding planner tools ». Pages en tête : comparatifs Maroo, Agiled,
  // Planning Pod (Aisle Planner, HoneyBook, Dubsado, Planning Pod) ; HoneyBook
  // annonce les États-Unis, le Canada, le Royaume-Uni et l'Australie.
  'devenir-wedding-planner-outils': {
    title: 'How to become a wedding planner: setup, training and tools',
    excerpt: 'Business setup, training, network, first clients and pricing for wedding planners, with a focus on France, then the 2026 toolkit sorted by use.',
    caption: 'A home office in the evening: an open laptop showing a planning timeline, fabric swatches and an appointment book',
    body: `
<p>Becoming a wedding planner appeals to a lot of people, for good reasons: concrete work, human contact, the satisfaction of watching a day unfold as planned. It is also a freelance, seasonal job, where you earn a living through your contacts and your ability to keep dozens of details in your head at once.</p>
<p>This guide covers the steps to get started (business setup, training, network, first clients, pricing), with a focus on France where the rules differ from country to country, then a wedding planner’s toolkit for 2026, sorted by use. Every tool mentioned exists and was checked in October 2026; we don’t give prices, which change too often.</p>

<h2>Becoming a wedding planner: what the job looks like</h2>
<p>A wedding planner sells three things: time (the time the couple doesn’t have), a network (reliable vendors on negotiated terms) and composure (on the day, they are the one handling the rain, the late caterer and the uncle who wants to give a twenty-minute speech).</p>
<p>A few realities to know before you start:</p>
<ul>
<li><strong>The season is short.</strong> Most weddings fall between May and September, mostly on Saturdays. The number of weddings you can coordinate in a year is limited by the calendar, not just your energy.</li>
<li><strong>Most of the work happens beforehand.</strong> Visits, meetings, quotes, follow-ups: the wedding day is just the visible part.</li>
<li><strong>Clients book far ahead.</strong> Often 12 to 18 months before the date for full planning. Your first year in business largely fills the next one.</li>
<li><strong>Every client is new.</strong> People rarely marry twice with the same planner: your business runs on referrals and visibility.</li>
</ul>

<h3>The skills that really matter</h3>
<ul>
<li><strong>Organisation</strong>, of course: running several weddings in parallel, each with its own deadlines, without forgetting anything.</li>
<li><strong>Negotiation</strong>: getting a better rate, an extra hour, a goodwill gesture, without damaging the relationship with the vendor.</li>
<li><strong>A sense of service</strong>: couples will message you on Sunday evenings. It is up to you to set boundaries without seeming distant.</li>
<li><strong>Calm</strong>: on the day, your face sets the tone. If you panic, everyone panics.</li>
<li><strong>Some taste and visual culture</strong>, even if you don’t offer design: couples will ask your opinion on everything.</li>
<li><strong>A driving licence and stamina</strong>: wedding days often run past fifteen hours, on your feet.</li>
</ul>

<h2>Setting up your business</h2>
<p>In France, most wedding planners start as a <strong>micro-entrepreneur</strong> (a simplified sole-trader status): online registration, light bookkeeping, social charges calculated on turnover. It is ideal for testing the business. Its limits: a turnover ceiling (check the current amount on the Urssaf website), and no deduction of expenses, which hurts if you buy or rent a lot of decor. As the business grows, moving to a company structure is a conversation to have with an accountant. In other countries, the equivalent is usually a sole proprietorship before forming a company.</p>
<p><strong>Commercial or professional activity?</strong> In France the answer depends on what you invoice. If you resell services or rent equipment, the activity is rather commercial; if you mainly sell advice, it may count as a liberal profession. That changes the tax regime and contributions. Have your case checked by the chamber of commerce or an accountant when you register.</p>
<p><strong>Four points not to forget:</strong></p>
<ul>
<li><strong>Professional liability insurance.</strong> Not always mandatory, but venues and clients will ask for it, and an incident on the day can be expensive.</li>
<li><strong>Solid terms and conditions</strong>: deposits, payment schedule, cancellation, postponement, the exact scope of each package.</li>
<li><strong>Package travel rules.</strong> If you sell transport and accommodation bundles at a single price yourself (destination weddings, all-inclusive weekends for guests), you may need to register as a travel operator (with Atout France in France). Check before offering this.</li>
<li><strong>E-invoicing in France.</strong> Since 1 September 2026, all French businesses must be able to receive electronic invoices; micro-businesses will also have to issue them from 1 September 2027. Choose an invoicing tool that supports it now.</li>
</ul>

<h2>Wedding planner training: useful, not required</h2>
<p>No qualification is required to work as a wedding planner in France (nor in most countries). Training is still useful for three reasons: learning the method (budget, planning timeline, contracts), meeting professionals, and reassuring your first clients.</p>
<ul>
<li><strong>Schools and training providers specialising in weddings</strong>, in person or online. In France, some award a qualification listed on the national register (RNCP). Check that it is active on the France Compétences website, and that the provider is Qualiopi-certified if you want to fund it with your training account (CPF).</li>
<li><strong>General event management courses</strong>: vocational diplomas and bachelor’s degrees in event management, sometimes with a wedding specialisation.</li>
<li><strong>Assisting</strong>: working as an assistant to an established planner for one or two seasons. It is often the most formative option, and the most useful for your network.</li>
</ul>
<p>Be wary of short courses promising to make you a wedding planner “in a few weeks” with an in-house certificate. Ask for the detailed syllabus, the trainers’ backgrounds, and talk to former students.</p>

<h2>Building your vendor network</h2>
<p>Your contact book is your main asset. It is built one vendor at a time:</p>
<ul>
<li><strong>Venues first.</strong> They see couples before anyone else. Visit them, introduce yourself, ask to be on their recommended vendor list.</li>
<li><strong>One or two vendors per category</strong> (caterer, photographer, florist, DJ, rentals), with a back-up each time. Test them when you can: a meal with the caterer, an evening with the DJ.</li>
<li><strong>A sheet per vendor</strong>: indicative prices, terms, lead times, what they do well, what they don’t do.</li>
<li><strong>Two-way referrals.</strong> Recommend your partners, send them photos from weddings you worked on together, tag them on social media. A network that only works one way soon runs dry.</li>
</ul>

<h2>Finding your first clients</h2>
<p>Without a portfolio, it is hard to convince anyone. The classic ways to build one:</p>
<ul>
<li><strong>A styled shoot</strong> with partner vendors: a venue, decor, a photographer, models. Everyone comes away with images.</li>
<li><strong>Weddings of friends and family</strong> at a reduced rate, as long as you treat them as real projects (contract, run of show, photos).</li>
<li><strong>Assisting</strong> an established planner, with their permission to show your work.</li>
</ul>
<p>Then come the acquisition channels (partner venues, Instagram, Google, directories, wedding fairs). We cover them with a 90-day action plan in <a href="/journal/trouver-clients-wedding-planner">how to find wedding planning clients</a>.</p>

<h2>What to charge</h2>
<p>Rates vary hugely by region, experience and positioning. Here are the ranges most often seen in France in 2026 on planners’ websites and in specialist guides:</p>
<table>
<thead><tr><th>Package</th><th>New planner</th><th>Experienced planner</th></tr></thead>
<tbody>
<tr><td>Day-of coordination</td><td>Roughly €900 to €1,500</td><td>Roughly €1,500 to €2,500</td></tr>
<tr><td>Partial planning</td><td>Roughly €1,500 to €2,500</td><td>Roughly €2,500 to €3,500 and up</td></tr>
<tr><td>Full planning</td><td>Roughly €3,000 to €4,000</td><td>Roughly €4,000 to €6,000, over €10,000 at the high end</td></tr>
</tbody>
</table>
<p>To set your own prices, start from your hours. Log the time you actually spend on your first weddings (meetings, travel and emails included), add your costs and contributions, and see what is left per hour. Many first-time planners are surprised by how low that hourly figure turns out to be on a first full-planning wedding.</p>
<p>A flat fee is more common than a percentage of the budget. It is clearer for couples, and protects you when they cut their budget along the way. To enrich your offer beyond the three packages, see <a href="/journal/services-wedding-planner">12 add-on services to offer</a>.</p>

<h2>Wedding planner tools: the 2026 toolkit by use</h2>
<p>You don’t need ten subscriptions to get started. A spreadsheet, a shared calendar and an invoicing tool are enough for your first weddings. Here are the tools planners use most, sorted by use, so you can choose when the need arises.</p>

<h3>Project management and planning timeline</h3>
<ul>
<li><strong>Trello</strong>: boards of cards, easy to pick up. One column per period (12 months out, 6 months out, 1 month out), one card per task.</li>
<li><strong>Notion</strong>: very flexible; you can build a database per wedding (timeline, vendors, budget, guests). Takes some time to set up.</li>
<li><strong>Asana, ClickUp, monday.com</strong>: more structured, useful if you work as a team.</li>
<li><strong>Google Sheets or Airtable</strong>: for people who think in tables. Airtable adds views (calendar, gallery) to a database.</li>
</ul>
<p>For the framework itself, start from our <a href="/journal/retroplanning-mariage">month-by-month wedding planning timeline</a> and turn it into a reusable template.</p>

<h3>Software built for wedding planners</h3>
<ul>
<li><strong>Aisle Planner</strong>: very complete on wedding-specific tools (timelines, style guides, seating charts, guests).</li>
<li><strong>Planning Pod</strong>: aimed at event planners and venues handling many dates.</li>
<li><strong>HoneyBook and Dubsado</strong>: mostly client management (proposals, contracts, payments, automations). At the time of writing, HoneyBook serves businesses in the US, Canada, the UK and Australia.</li>
<li><strong>Anolla</strong>: French software aimed at wedding venues, with seating plans, menus and vendor schedules.</li>
</ul>
<p>Most of these tools are built for the North American market. Before subscribing, check the language couples will see, whether invoicing meets your local rules, and where the data is hosted.</p>

<h3>Quotes, invoicing and accounting</h3>
<ul>
<li><strong>Abby, Tiime, Indy, Freebe</strong>: French quoting and invoicing tools for freelancers and micro-entrepreneurs.</li>
<li><strong>Pennylane</strong>: more for a company working with an accountant.</li>
<li><strong>Yousign</strong>: French e-signature, handy for contracts and quotes signed remotely.</li>
</ul>
<p>Outside France, use the invoicing tool that fits your local tax rules; inside France, check that yours is connected to an approved e-invoicing platform, or will be before September 2027.</p>

<h3>CRM: tracking enquiries</h3>
<p>A CRM (a smart client file) means you never lose an enquiry: who contacted you, when, for which date, where they came from, where the conversation stands.</p>
<ul>
<li><strong>folk</strong>: a simple French CRM popular with freelancers.</li>
<li><strong>HubSpot</strong>: the free version is plenty to start.</li>
<li><strong>Pipedrive</strong>: very visual, organised in sales stages.</li>
</ul>
<p>At first, a spreadsheet with one row per enquiry and a “source” column does the job. What matters is recording where each contact came from: that tells you where to invest your time.</p>

<h3>Seating plans</h3>
<ul>
<li><strong>PerfectTablePlan</strong>: dedicated software that also handles large banquets.</li>
<li><strong>Canva</strong>: for the printed version of the seating chart, with templates.</li>
<li>Built-in modules in planner software (Aisle Planner, Anolla).</li>
</ul>

<h3>Mood boards and design</h3>
<ul>
<li><strong>Pinterest</strong>: the starting point for collecting the couple’s ideas (ask them for a shared board).</li>
<li><strong>Milanote</strong>: free-form boards mixing images, notes and swatches, ideal for presenting a creative direction.</li>
<li><strong>Canva</strong>: to lay out mood boards, proposals and stationery.</li>
</ul>

<h3>Communicating with couples and guests</h3>
<ul>
<li><strong>WhatsApp Business</strong>: keep work chats separate from personal messages, with quick replies and away hours.</li>
<li><strong>Calendly</strong>: let couples book a meeting without ten back-and-forth messages.</li>
<li><strong>Google Drive</strong>: one shared folder per wedding (contracts, quotes, run of show).</li>
<li><strong>Joy (withjoy)</strong> or Zola: for the couple’s wedding website and guest RSVPs.</li>
</ul>

<h3>Turnkey guest activities</h3>
<p>Some activities work like tools: you set them up in minutes, without a technician, and they enrich your offer. That is the case with <strong>Time to Flash</strong>, the disposable camera activity on guests’ phones: a QR code to scan, no app to install, a limited number of shots per guest, and an album revealed all at once the next day. The print kit (poster, table tents, cards) comes ready from the dashboard, and you can review the photos before the reveal. It is a one-off payment per wedding, for example €34.99 for up to 150 guests.</p>
<p>To compare with renting a photo booth, see <a href="/journal/prix-photobooth-mariage">how much a wedding photo booth costs</a>.</p>

<h3>The physical wedding-day kit</h3>
<p>The best tool is often a well-packed case. Experienced planners’ cases almost always contain: scissors, double-sided tape, fishing line, pins, a sewing kit, stain remover, tissues, plasters, painkillers, chargers and a power bank, an extension lead, a lighter, pliers, string, spare tights, and a paper copy of the run of show and contacts (phones always run out of battery eventually).</p>

<h2>The summary</h2>
<table>
<thead><tr><th>Use</th><th>To get started</th><th>As the business grows</th></tr></thead>
<tbody>
<tr><td>Timeline and tasks</td><td>Trello, Google Sheets</td><td>Notion, Asana, ClickUp, Aisle Planner</td></tr>
<tr><td>Quotes and invoices</td><td>Abby, Tiime, Freebe, Indy (France)</td><td>Pennylane with an accountant</td></tr>
<tr><td>Contracts</td><td>Signed PDF</td><td>Yousign</td></tr>
<tr><td>Enquiry tracking</td><td>Spreadsheet</td><td>folk, HubSpot, Pipedrive</td></tr>
<tr><td>Seating plan</td><td>Canva</td><td>PerfectTablePlan, planner software</td></tr>
<tr><td>Mood boards</td><td>Pinterest</td><td>Milanote</td></tr>
<tr><td>Talking to couples</td><td>WhatsApp Business, Google Drive</td><td>Calendly, a client portal</td></tr>
<tr><td>Guest activity</td><td>Time to Flash, photo booth rental</td><td>A signature included in your packages</td></tr>
</tbody>
</table>

<h2>Common mistakes when starting out</h2>
<ul>
<li><strong>Collecting tools before clients.</strong> Software doesn’t fill a calendar. Start simple.</li>
<li><strong>Underestimating your hours.</strong> Log everything during your first season and adjust your prices on real figures.</li>
<li><strong>A vague scope.</strong> “Partial planning” means nothing until the list of included vendors is written down.</li>
<li><strong>Neglecting contracts.</strong> Deposits, cancellation, postponement: these clauses rarely come into play, but when they do, they save a year.</li>
<li><strong>Waiting to be perfect before showing your work.</strong> An Instagram account with three real weddings beats a perfect website with no photos.</li>
</ul>

<h2>In short</h2>
<ul>
<li>Start with the simplest business structure, with insurance and solid terms.</li>
<li>Training isn’t required; assisting is often the best apprenticeship.</li>
<li>Build your network starting with venues.</li>
<li>Set flat fees based on your real hours.</li>
<li>A spreadsheet, an invoicing tool and a calendar are enough to begin; add other tools as the need appears.</li>
</ul>
<p>If you are looking for a simple activity to add to your packages, visit our space for wedding professionals: <a href="/pro">offer Time to Flash to your couples</a>.</p>
`,
    faq: [
      {
        q: 'Do you need a qualification to become a wedding planner?',
        a: 'No qualification is required in France, nor in most countries. Training (a specialist school, an event management course or assisting an established planner) helps you learn the method and reassures your first clients. In France, check the provider is Qualiopi-certified if you want to fund it through your CPF.',
      },
      {
        q: 'What business structure should a wedding planner choose?',
        a: 'In France, the micro-entrepreneur status is the most common way to start, thanks to its simplicity. As turnover and expenses grow, a company structure lets you deduct costs. Have the nature of your activity (commercial or professional) checked by the chamber of commerce or an accountant.',
      },
      {
        q: 'How much does a wedding planner earn?',
        a: 'It depends on the number of weddings per year and the packages sold. As a guide, in France day-of coordination is charged at roughly €900 to €2,500 and full planning at roughly €3,000 to €6,000, more at the high end. Actual income then depends on your costs, contributions and time spent per wedding.',
      },
      {
        q: 'What software do wedding planners use?',
        a: 'To start, a project management tool (Trello, Notion), a spreadsheet and an invoicing tool that fits your local rules are enough. Planner software such as Aisle Planner or Planning Pod brings everything together, but is built mainly for English-speaking markets: check language and invoicing compliance.',
      },
      {
        q: 'Does e-invoicing apply to wedding planners in France?',
        a: 'Yes. Since 1 September 2026, all French businesses must be able to receive electronic invoices, and micro-businesses will also have to issue them from 1 September 2027. Choose a compatible invoicing tool now.',
      },
    ],
  },
  // EN : « how to get wedding planning clients », « wedding planner
  // marketing », « instagram for wedding planners ». Pages en tête : Planning
  // Pod, QC Event School, ClickUp, Heropost (Instagram : portfolio + coulisses,
  // régularité). Aucune ne donne un plan daté : on garde le plan 90 jours.
  'trouver-clients-wedding-planner': {
    title: 'How to get wedding planning clients: 8 channels, 90-day plan',
    excerpt: 'Partner venues, Instagram, Google, reviews, wedding fairs, referrals: how to find wedding planning clients, with a concrete 90-day action plan.',
    caption: 'A wedding planner photographs a set table in a barn with her phone, before the guests arrive',
    body: `
<p>Finding wedding planning clients is unlike any other service business. A wedding is a rare, emotional purchase, often decided more than a year ahead and worth several thousand euros. Nobody signs with a planner whose work they have never seen and whom nobody has mentioned.</p>
<p>This guide goes through the eight channels that genuinely bring in couples, with concrete actions for each, then a 90-day action plan. We finish with what wins contracts in a meeting: an argument couples haven’t heard elsewhere.</p>

<h2>How couples find their wedding planner</h2>
<p>Before choosing channels, look at the couple’s journey. It almost always follows the same order:</p>
<ol>
<li><strong>They pick the date and the venue.</strong> The venue is often the first vendor booked, and so the first to recommend others.</li>
<li><strong>They look for inspiration</strong> on Instagram and Pinterest, and start following accounts.</li>
<li><strong>They search “wedding planner + town”</strong> on Google, or browse a wedding directory.</li>
<li><strong>They ask around</strong>: recently married friends, the wedding party, colleagues.</li>
<li><strong>They check</strong>: Google reviews, Instagram, website. This is where many planners lose contact without ever knowing.</li>
</ol>
<p>The upshot: you need to be there when the venue recommends, when the couple searches, and above all when they check.</p>

<h2>Channel 1: partner venues</h2>
<p>This is the most powerful channel, because the venue sees couples before anyone else. An estate that hosts thirty weddings a year and recommends you is a steady source of enquiries.</p>
<ul>
<li>List the venues in your area that match your positioning (not all of them: the ones you want to work in).</li>
<li>Ask for a visit and bring a short pack: who you are, two or three weddings in photos, how you work with a venue (respecting timings, rules and equipment).</li>
<li>Offer the venue something concrete: coordinating a wedding where the couple has no planner, joining their open days, organising a styled shoot on site for their own social media.</li>
<li>After each wedding at a venue, send the manager the best photos (with the photographer’s permission). It is the best way to stay on their list.</li>
</ul>
<p>To understand what couples ask a venue, and therefore what a venue expects from a planner, see <a href="/journal/questions-lieu-reception-mariage">the questions to ask a wedding venue</a>.</p>

<h2>Channel 2: your vendor network</h2>
<p>Photographers, caterers, florists, DJs, celebrants: each of them meets couples who don’t yet have a planner. And each prefers to work with a planner who makes their day easier.</p>
<ul>
<li><strong>Refer before you ask.</strong> A vendor you have sent two clients to will return the favour.</li>
<li><strong>Organise a group styled shoot</strong>: everyone gets images for their social media, and you become the one who brings people together.</li>
<li><strong>Be the planner vendors enjoy working with</strong>: a clear technical sheet sent ahead, a meal provided, timings respected. Photographers and DJs talk to each other.</li>
</ul>

<h2>Channel 3: wedding directories and platforms</h2>
<p>Directories (The Knot and WeddingWire in the US, Hitched and Bridebook in the UK, Mariages.net and Zankyou in France, plus regional directories) get a lot of traffic from couples who are searching. Basic listings are often free; premium placement is paid.</p>
<ul>
<li><strong>Polish the free listing</strong> before paying for anything: real photos, a precise description (area, specialty, packages, “from” prices), quick replies.</li>
<li><strong>Reply fast.</strong> Couples often contact several planners at once: the first to reply with a meeting suggestion has a clear edge.</li>
<li><strong>Collect reviews on the platform</strong> too, not just on Google.</li>
<li><strong>Test a paid option for one season</strong>, recording the source of each enquiry. You will know whether it pays for itself.</li>
</ul>

<h2>Channel 4: wedding fairs</h2>
<p>Most large cities have a wedding fair, often in autumn and winter (in France, the Salon du Mariage in Paris ran two editions in 2026, in late January and early September). A stand costs a lot, in money and weekends: prepare it.</p>
<ul>
<li><strong>A stand that shows rather than stacks.</strong> A table set as at a real wedding, a screen with your work, a live demo.</li>
<li><strong>A contact form</strong> asking for the wedding date and venue, with explicit consent to be contacted (a GDPR requirement in Europe).</li>
<li><strong>Follow up within 48 hours</strong>, personalised with what you discussed at the stand.</li>
<li><strong>Visit before you exhibit</strong>: a day as a visitor tells you whether the fair attracts your kind of client.</li>
</ul>

<h2>Channel 5: Instagram and Pinterest</h2>
<h3>Instagram for wedding planners</h3>
<p>Instagram works as your portfolio: most couples look at it before writing to you. A few rules that change everything:</p>
<ul>
<li><strong>A bio that answers in three seconds</strong>: job, area, specialty, contact link. “Wedding planner in Provence, outdoor weddings, coordination and full planning.”</li>
<li><strong>Story highlights organised like a website</strong>: weddings, packages, reviews, behind the scenes, “how I work”.</li>
<li><strong>Behind the scenes, not just perfect photos.</strong> Set-up at 8 a.m., the planning timeline, the site visit, the wedding-day case: that shows couples what working with you feels like.</li>
<li><strong>Short videos (reels)</strong>: a before-and-after of the set-up, a wedding day in 30 seconds, a mistake to avoid. These are what get you discovered by accounts that don’t follow you.</li>
<li><strong>Tag the venue and vendors</strong> on every post, and invite them to collaborate (a joint post): your content also appears on their profile.</li>
<li><strong>Consistency beats frequency.</strong> Two or three posts a week for a year beat a month of daily posts followed by three months of silence.</li>
</ul>
<h3>Pinterest</h3>
<p>Pinterest works like a visual search engine: a pin can bring visits for months or even years, whereas an Instagram post fades within days. Create boards by theme (rustic decor, winter wedding, symbolic ceremony) and link each pin to the matching page on your website.</p>

<h2>Channel 6: Google Business Profile and reviews</h2>
<p>When couples search “wedding planner” plus a town, Google often shows a map with three business listings before the websites. Being in those three is one of the most profitable levers, and it is free.</p>
<ul>
<li><strong>Create and verify your Google Business Profile</strong>, with the category closest to your job, your service area and your meeting hours.</li>
<li><strong>Add photos regularly</strong>, with descriptions that mention venues and towns.</li>
<li><strong>Ask every couple for a review</strong>, with a direct link. Specialist guides often quote around ten detailed reviews as the point where a profile really inspires trust.</li>
<li><strong>Reply to every review</strong>, including negative ones, calmly and with facts.</li>
</ul>
<p><strong>The right time to ask for a review:</strong> while the emotion is still there, but once the couple has caught their breath. The two to three weeks after the wedding are often mentioned. Below, we look at an even better moment.</p>

<h2>Channel 7: your website and local SEO</h2>
<ul>
<li><strong>One page per area or venue</strong> where you often work: “Wedding planner in the Cotswolds”, “Weddings at X estate”. With real photos and real text, not a copy of the home page.</li>
<li><strong>A packages page with “from” prices.</strong> Couples who see no price at all often go to the planner who shows one.</li>
<li><strong>Useful articles</strong> answering couples’ questions: planning timeline, budget, wedding-day schedule, the best venues in your area. This content gets shared, found on Google, and proves your expertise before the first meeting.</li>
<li><strong>A short form</strong>: date, venue (or region), guest count, package wanted, how they heard of you.</li>
</ul>

<h2>Channel 8: word of mouth and referrals</h2>
<p>The wedding party and guests at a successful wedding are your future clients, or know them. This channel can be encouraged:</p>
<ul>
<li><strong>Be identifiable on the day</strong>: a business card at the cloakroom, your name in the order of service, a mention by the DJ if they thank the vendors.</li>
<li><strong>Stay in touch with the couple</strong> after the wedding: a message when the photos are revealed, a card on their first anniversary.</li>
<li><strong>Thank referrals</strong>: a note, a gift, a gesture for couples who send someone your way.</li>
</ul>

<h2>The first meeting: a five-step outline</h2>
<p>All the channels above lead to the same place: a meeting, by video call or over coffee. That is where it all happens, and many planners go in without an outline.</p>
<ol>
<li><strong>Listen first.</strong> Let the couple describe their ideal wedding, their worries, what they have already booked. Take notes, and ask about their guests as much as about the decor.</li>
<li><strong>Rephrase.</strong> “So, to sum up: a countryside wedding, 120 guests, lots of children, and your main worry is getting everyone there and back.” The couple feels understood, and you check you heard correctly.</li>
<li><strong>Show your method</strong> with real documents: a planning timeline, a run of show, a vendor sheet from a past wedding (anonymised).</li>
<li><strong>Create an experience</strong>: an object, a demo, something they haven’t seen elsewhere (more on that just below).</li>
<li><strong>Set the next step</strong>: a date for sending the quote, a date for a follow-up call. A meeting that ends with “let’s keep in touch” rarely turns into a contract.</li>
</ol>

<h2>The argument that wins the meeting</h2>
<p>By the first meeting, couples have often already seen two or three planners. All of them talked about budgets, timelines and trusted vendors. What makes the difference is something they haven’t seen anywhere else, and can try on the spot.</p>
<p>A few examples: a printed run of show from a real wedding, a table mock-up, an experience for the guests. For instance, a disposable camera on the guests’ phones: you hand over a QR code, the couple scans it, and their phone becomes a disposable camera with a few shots, without installing anything. Within thirty seconds they picture their guests doing it at their wedding. That is what <a href="/appareil-jetable-mariage">Time to Flash</a> offers, and it complements the photographer rather than competing with them.</p>
<p>This activity has another, less visible advantage for you: <strong>the guests’ album is revealed the next day</strong> (or whenever you choose). It is the perfect reason to get back in touch with the couple:</p>
<ul>
<li>On the morning of the reveal, a short message: “Your guests’ photos have just been revealed, go and have a look!”</li>
<li>The couple discovers their evening through their guests’ eyes, often with a lot of emotion.</li>
<li>A few days later, once they have seen everything, you send them the link to leave a review. The wedding is still fresh, and they have a reason to thank you.</li>
</ul>
<p>That is the difference between a vendor who vanishes on Sunday morning and a planner who sees the couple through to the end. For more on that moment, see <a href="/journal/revelation-photos-lendemain-mariage">the next-day photo reveal</a>, and for other services that set you apart, <a href="/journal/services-wedding-planner">12 add-on services for wedding planners</a>.</p>

<h2>The 90-day action plan</h2>
<p>A realistic plan for a planner starting out or relaunching their business, a few hours a week.</p>
<table>
<thead><tr><th>Period</th><th>Actions</th><th>Expected result</th></tr></thead>
<tbody>
<tr><td><strong>Weeks 1 and 2</strong></td><td>Define your specialty and area. Create or redo your Google Business Profile. Rewrite your Instagram bio and highlights. Prepare a one-page presentation pack.</td><td>Foundations that reassure couples when they check</td></tr>
<tr><td><strong>Weeks 3 and 4</strong></td><td>List 15 target venues and 15 target vendors. Ask all your past couples for a review. Publish a packages page with “from” prices.</td><td>First reviews, prospect list ready</td></tr>
<tr><td><strong>Month 2</strong></td><td>Visit 2 or 3 venues a week. Organise a styled shoot with partner vendors. Post 2 or 3 times a week on Instagram, including at least one short video. Create free listings on one or two directories.</td><td>First partnerships, fresh content</td></tr>
<tr><td><strong>Month 3</strong></td><td>Publish the styled shoot with every partner tagged. Write two useful articles on your site (wedding-day schedule, venues in your area). Follow up with the venues you visited, with photos. Prepare your meeting demo.</td><td>First enquiries from partners and Google</td></tr>
</tbody>
</table>
<p>Throughout these 90 days, record the source of every enquiry. After three months, you will know which channels deserve your time and which to drop.</p>

<h2>The numbers to track</h2>
<ul>
<li><strong>Enquiries per month</strong>, and where they come from.</li>
<li><strong>Meeting rate</strong>: how many enquiries become a meeting. If it is low, work on your response time and how you reply.</li>
<li><strong>Signing rate</strong>: how many meetings become a contract. If it is low, work on your meeting argument and your published prices.</li>
<li><strong>Number of reviews</strong>, and how recent they are: a recent review reassures more than one from three years ago.</li>
</ul>

<h2>Mistakes that cost clients</h2>
<ul>
<li><strong>Replying three days later.</strong> The couple often already has a meeting elsewhere.</li>
<li><strong>Being a little bit everywhere.</strong> Two channels done well beat six abandoned ones.</li>
<li><strong>Photos without context.</strong> Say the venue, season, guest count and what you did: couples picture themselves more easily.</li>
<li><strong>Forgetting past couples.</strong> They are your best sales team, as long as you give them a reason to talk about you.</li>
</ul>

<h2>In short</h2>
<ul>
<li>Partner venues and vendors are your first channel: visit, refer, share your photos.</li>
<li>Instagram and Google matter most when couples check you out: polish the bio, the profile and the reviews.</li>
<li>A 90-day plan and a source recorded for every enquiry tell you where to invest your time.</li>
<li>In meetings, show an experience couples haven’t seen elsewhere, and plan a reason to get back in touch after the wedding.</li>
</ul>
<p>If the disposable camera demo appeals to you as a meeting argument, visit our space for wedding professionals: <a href="/pro">offer Time to Flash to your couples</a>. And to structure your business, see also <a href="/journal/devenir-wedding-planner-outils">the wedding planner’s toolkit for 2026</a>.</p>
`,
    faq: [
      {
        q: 'How do you get your first wedding planning clients?',
        a: 'Start by building a portfolio (a styled shoot with vendors, friends’ weddings treated as real projects), then approach the venues in your area. A well-kept Google Business Profile and a few detailed reviews reassure couples discovering you.',
      },
      {
        q: 'Is Instagram essential for a wedding planner?',
        a: 'It has become the default portfolio: most couples look at a planner’s Instagram before getting in touch. A clear bio, organised highlights and regular behind-the-scenes content matter more than a large follower count.',
      },
      {
        q: 'Should I exhibit at a wedding fair?',
        a: 'A fair can bring many contacts, but a stand costs a lot of money and time. Visit as a guest first, prepare a stand that shows your work, and follow up with each contact within 48 hours, with their consent.',
      },
      {
        q: 'When should you ask a couple for a review?',
        a: 'While the emotion is still there but the couple has caught their breath, often in the two to three weeks after the wedding. The reveal of the guests’ photos, the next day or a few days later, is also an excellent reason to get back in touch.',
      },
      {
        q: 'How long does it take to find clients?',
        a: 'Couples often book 12 to 18 months before their date, so one season’s efforts mostly fill the next. Following a plan for 90 days usually brings the first enquiries from partners and Google, and shows you which channels to keep.',
      },
    ],
  },
  // EN : « wedding day timeline », « wedding day schedule template »,
  // « wedding timeline hour by hour ». Pages en tête : Joy, Zola, Mayfair
  // Farms (journée de 10 à 14 h, marges de 30 min, envoyer aux prestataires
  // deux semaines avant). Version adaptée : on garde le mariage à la
  // française (mairie, vin d'honneur, dîner tardif) en l'expliquant.
  'deroule-jour-j-mariage': {
    title: 'Wedding day timeline: an hour-by-hour schedule template',
    excerpt: 'A wedding day timeline from 9 a.m. to 4 a.m., its variations (winter, morning ceremony, brunch), the buffers to build in and the vendor sheet to send.',
    caption: 'A wedding-day schedule taped to a kitchen door, lit by a camera flash during a wedding',
    body: `
<p>A good wedding day timeline is what lets you live your day instead of managing it. It is an hour-by-hour table, shared with every vendor, saying who does what, where and when, from morning make-up to the last shuttle.</p>
<p>Here is a complete template, from 9 a.m. to 4 a.m., based on a typical French wedding: a civil ceremony at the town hall, a symbolic or religious ceremony, a drinks reception, dinner and a party that runs late. If your wedding follows a different rhythm, the logic stays the same. Then come the variations (winter wedding, morning ceremony, next-day brunch), the buffers to plan, who should run the timeline, and the sheet to send to vendors. Wedding planners can use it as a starting framework too.</p>

<h2>The wedding day timeline: where to start</h2>
<p>A timeline is built backwards from three fixed points:</p>
<ul>
<li><strong>The time of the legal ceremony</strong>, often set by the registry office or town hall. It is the least negotiable point of the day.</li>
<li><strong>Sunset</strong>, if you want couple portraits in golden light. In June, the sun sets around 10 p.m. in much of France; in October, around 7 p.m.</li>
<li><strong>The end time set by the venue</strong> (and the DJ’s contract), which fixes the end of the evening.</li>
</ul>
<p>Between those points, you place the key moments, then add travel and buffers. This work happens a few weeks before the wedding: it is one of the last steps in <a href="/journal/retroplanning-mariage">your planning timeline</a>.</p>

<h2>The template: an hour-by-hour wedding schedule</h2>
<p>Assumptions: a Saturday in June, 100 guests, town hall at 2 p.m., a symbolic (or religious) ceremony at 4 p.m. at or near the venue, then drinks, dinner and party at the same place.</p>
<table>
<thead><tr><th>Time</th><th>What happens</th><th>Who is involved</th></tr></thead>
<tbody>
<tr><td><strong>9:00</strong></td><td>Breakfast, hair and make-up begin (starting with family and friends; the couple goes last)</td><td>Couple, wedding party, hair and make-up</td></tr>
<tr><td><strong>9:30</strong></td><td>Planner or coordinator arrives at the venue, welcomes the florist and decorator</td><td>Coordinator, florist, venue</td></tr>
<tr><td><strong>10:30</strong></td><td>Bouquets and buttonholes delivered to both getting-ready locations</td><td>Florist, wedding party</td></tr>
<tr><td><strong>11:00</strong></td><td>Photographer arrives for getting ready (details, outfits, rings, atmosphere)</td><td>Photographer</td></tr>
<tr><td><strong>12:00</strong></td><td>Light lunch for everyone getting ready (nobody should reach the ceremony hungry)</td><td>Couple, family and friends</td></tr>
<tr><td><strong>12:45</strong></td><td>The couple gets dressed</td><td>Couple, wedding party, photographer</td></tr>
<tr><td><strong>13:15</strong></td><td>First look and a few portraits, if you want them</td><td>Couple, photographer</td></tr>
<tr><td><strong>13:30</strong></td><td>Departure for the town hall</td><td>Couple, driver</td></tr>
<tr><td><strong>13:40</strong></td><td>Guests gather outside the town hall</td><td>Guests, wedding party</td></tr>
<tr><td><strong>14:00</strong></td><td>Civil ceremony (often 20 to 30 minutes)</td><td>Couple, witnesses, registrar</td></tr>
<tr><td><strong>14:30</strong></td><td>Exit, confetti, group photo on the steps</td><td>Everyone, photographer</td></tr>
<tr><td><strong>15:00</strong></td><td>Travel to the symbolic ceremony (or the church)</td><td>Everyone</td></tr>
<tr><td><strong>15:30</strong></td><td>Guests take their seats, welcome music, orders of service handed out</td><td>Guests, coordinator, musicians</td></tr>
<tr><td><strong>16:00</strong></td><td>Symbolic or religious ceremony (45 minutes to 1 hour)</td><td>Couple, celebrant, speakers</td></tr>
<tr><td><strong>17:00</strong></td><td>Ceremony exit, drinks reception begins</td><td>Everyone, caterer</td></tr>
<tr><td><strong>17:15</strong></td><td>QR code posters for the photo activity are in place (bar, high tables, entrance), and the DJ or the wedding party announce it on the mic</td><td>Coordinator, DJ or wedding party</td></tr>
<tr><td><strong>17:30</strong></td><td>Group photos (family, friends, colleagues), list prepared in advance</td><td>Photographer, a friend who calls the groups</td></tr>
<tr><td><strong>18:15</strong></td><td>The couple enjoys the drinks reception with their guests</td><td>Couple</td></tr>
<tr><td><strong>19:30</strong></td><td>Guests move to the dining room and find their table</td><td>Guests, coordinator, caterer</td></tr>
<tr><td><strong>19:50</strong></td><td>The couple’s entrance</td><td>Couple, DJ</td></tr>
<tr><td><strong>20:00</strong></td><td>Starter served</td><td>Caterer</td></tr>
<tr><td><strong>20:45</strong></td><td>First speeches (wedding party, parents), between courses</td><td>Wedding party, parents, DJ</td></tr>
<tr><td><strong>21:15</strong></td><td>Main course</td><td>Caterer</td></tr>
<tr><td><strong>21:30</strong></td><td>Fifteen minutes of couple portraits outside, in the sunset light</td><td>Couple, photographer</td></tr>
<tr><td><strong>22:15</strong></td><td>Cheese course, an activity or a video from friends</td><td>Caterer, wedding party</td></tr>
<tr><td><strong>23:00</strong></td><td>Dessert, croquembouche or cake</td><td>Caterer, DJ</td></tr>
<tr><td><strong>23:30</strong></td><td>First dance, dance floor opens</td><td>Couple, DJ</td></tr>
<tr><td><strong>00:00</strong></td><td>Party. The photographer often leaves between midnight and 1 a.m.: this is when guests’ photos take over</td><td>Everyone</td></tr>
<tr><td><strong>01:30</strong></td><td>Late-night snacks (onion soup is a French classic)</td><td>Caterer</td></tr>
<tr><td><strong>03:00</strong></td><td>Last songs, depending on the end time in the contract</td><td>DJ</td></tr>
<tr><td><strong>04:00</strong></td><td>Last shuttles, venue closes</td><td>Guests, venue, drivers</td></tr>
<tr><td><strong>The next day</strong></td><td>Brunch (for example 11 a.m. to 3 p.m.) and reveal of the guests’ photo album</td><td>Couple, family and friends</td></tr>
</tbody>
</table>
<p>This table is a base. Exact times depend on your registry office, the distance between venues and your caterer: ask them for the real service time of their menu, which is often what makes an evening slip.</p>

<h2>Three moments not to miss</h2>
<h3>Announcing the photo activity at the drinks reception</h3>
<p>The drinks reception is the best time to launch a photo activity: guests have their hands free, they are waiting for the couple, and the light is still good. If you use a QR code (a shared gallery or a disposable camera like <a href="/appareil-jetable-mariage">Time to Flash</a>), the posters must be in place when guests come out of the ceremony, and someone should announce it on the mic within the first fifteen minutes. A poster alone gets few scans. We explain where to put them in <a href="/journal/ou-poser-le-qr-code">where to place the QR code</a>, and you can create a poster for free with our <a href="/generateur-qr-code-mariage">QR code poster generator</a>.</p>

<h3>Group photos</h3>
<p>This is the slot that overruns most often. Prepare a short list (ten groups at most), give it to the photographer and to a friend who knows both families and can call the groups. Details in <a href="/journal/photos-de-groupe-mariage">how to get wedding group photos right</a>.</p>

<h3>The next-day album reveal</h3>
<p>If your guests’ photos stay hidden until the next day, the reveal becomes a second highlight, ideally during brunch or late morning. Everyone discovers the evening through other people’s eyes, at the same time. It is explained in <a href="/journal/revelation-photos-lendemain-mariage">the next-day photo reveal</a>.</p>

<h2>Timeline variations</h2>
<h3>Winter wedding</h3>
<p>In December, night falls around 5 p.m. in France. Bring forward everything that needs daylight: couple portraits before the ceremony (with a morning first look), group photos right after the ceremony, indoors if needed. The drinks reception happens somewhere warm, often shorter (an hour is enough), and dinner can start earlier, around 7 p.m. Plan a cloakroom and blankets for the journeys.</p>

<h3>Morning ceremony</h3>
<p>Ceremony around 11 a.m., drinks at noon, then a seated lunch around 1:30 p.m. The afternoon is for games, activities or free time, and the evening continues with a lighter dinner (buffet, food trucks) before the party. The upside: your guests enjoy the daylight. The downside: a very long day, so plan quiet moments, especially for children and older guests.</p>

<h3>Legal ceremony the day before</h3>
<p>More and more couples do the legal part on the Friday with close family, and keep Saturday for the symbolic ceremony and the party. Saturday’s timeline then starts later: getting ready at 11 a.m., symbolic ceremony at 4 p.m., and the rest unchanged.</p>

<h3>Religious wedding</h3>
<p>In France, the civil marriage must take place before the religious ceremony. Church times are set with the parish or officiant, sometimes months in advance. Allow about 45 minutes for a ceremony without Mass, and over an hour with one.</p>

<h3>The next-day brunch</h3>
<p>A wide time slot (11 a.m. to 3 p.m., for example) lets everyone arrive at their own pace. Plan a table or two for the most tired, space for children, and a moment to launch the reveal of the guests’ photos: everyone is there, phone in hand, to discover them together.</p>

<h2>The night before and the morning: what must be ready</h2>
<p>A timeline that holds on the day is prepared the night before. Before going to bed, check that these are sorted:</p>
<ul>
<li><strong>Decor set up</strong>, or at least dropped off at the venue, with someone named to install it in the morning.</li>
<li><strong>The symbolic ceremony rehearsed</strong> with the speakers: who enters when, who reads what, where to stand.</li>
<li><strong>The rings handed</strong> to a member of the wedding party, not in the couple’s pocket.</li>
<li><strong>Envelopes for vendors</strong> to be paid on the day prepared and given to the coordinator, with a list.</li>
<li><strong>Posters and table signs</strong> (seating plan, photo QR code, signage) packed in a labelled box.</li>
<li><strong>An emergency kit</strong>: pins, sewing kit, tissues, plasters, painkillers, charger, stain remover.</li>
<li><strong>The timeline printed</strong> in several copies: coordinator, wedding party, caterer, DJ.</li>
</ul>

<h2>Children in the timeline</h2>
<p>With lots of children, the template needs a few adjustments. Have their meal served earlier (around 7:30 p.m., while the adults finish their drinks), plan a childminder or a quiet corner with cushions and a film from 9 p.m., and tell parents when the youngest can go to bed if the venue has rooms. Children are also great photographers: with a QR code photo activity, they join in like the grown-ups, from a parent’s phone.</p>

<h2>The wet-weather plan</h2>
<p>A plan B can’t be improvised on the morning. Write into the timeline: the fallback location for the symbolic ceremony and drinks, who decides, and the decision deadline (often the night before or around 10 a.m., to give the venue and caterer time to reorganise). Bring umbrellas for leaving the town hall and for group photos too: clear umbrellas make lovely photos in the rain.</p>

<h2>Buffers to build in</h2>
<p>A timeline without buffers derails as soon as you leave the ceremony. These moments almost always take longer than planned:</p>
<table>
<thead><tr><th>Moment</th><th>Planned time</th><th>Suggested buffer</th></tr></thead>
<tbody>
<tr><td>Hair and make-up</td><td>45 min per person</td><td>+ 30 min overall</td></tr>
<tr><td>Travel between venues</td><td>Map app estimate</td><td>+ 15 min (convoy, parking)</td></tr>
<tr><td>Leaving the ceremony</td><td>15 min</td><td>+ 15 min (everyone wants to congratulate you)</td></tr>
<tr><td>Group photos</td><td>30 min</td><td>+ 15 min</td></tr>
<tr><td>Moving from drinks to dinner</td><td>15 min</td><td>+ 15 min</td></tr>
<tr><td>Speeches</td><td>3 to 5 min each</td><td>Limit the number rather than the length</td></tr>
<tr><td>Serving a course</td><td>Depends on the caterer</td><td>Ask for the real time</td></tr>
</tbody>
</table>
<p>A tip: don’t put all the buffers at the end. Place a small one after each risky moment, so a delay doesn’t ripple through the whole evening.</p>

<h2>Who runs the timeline</h2>
<p><strong>Not you.</strong> On the day, you shouldn’t be looking at your watch. Three options:</p>
<ul>
<li><strong>A wedding planner or day-of coordinator</strong>: it is their job; they know the vendors and anticipate delays.</li>
<li><strong>An organised friend or family member</strong> willing to spend part of the day with an eye on the clock. Choose someone without a heavy role already (speech, reading, activity).</li>
<li><strong>The DJ and the caterer’s head waiter</strong>, for the evening: they set the pace of dinner and speeches. They need the same timeline as everyone else.</li>
</ul>
<p>Either way, one person makes the decisions when things go wrong (rain, a delay, a late course). Vendors need to know who that is.</p>

<h2>The vendor sheet</h2>
<p>The full timeline is for the person coordinating. Each vendor needs a one-page sheet with what concerns them. Send it two weeks before the wedding, then confirm by message in the week of the wedding.</p>
<p><strong>What the sheet should include:</strong></p>
<ul>
<li>Exact addresses (getting ready, town hall, ceremony, reception) and access (parking, delivery door, gate code).</li>
<li>The coordinator’s contact, and a back-up contact.</li>
<li>That vendor’s arrival, set-up and take-down times.</li>
<li>The key moments that concern them (entrance, speeches, first dance, cake).</li>
<li>The wet-weather plan.</li>
<li>The meal planned for them, and when they can eat.</li>
<li>For the photographer: the group photo list and the important people not to miss.</li>
<li>For the DJ: music for key moments, the speech list, and the announcements to make (including the photo activity at the drinks reception).</li>
</ul>
<p>For guests, an even shorter version is enough: times and addresses, on the wedding website or in a message. We have prepared the text to send them in <a href="/journal/brief-invites">the guest brief</a>.</p>

<h2>Classic mistakes</h2>
<ul>
<li><strong>Too many speeches.</strong> Beyond four or five, the room drifts off. Spread them between courses.</li>
<li><strong>Forgetting to eat.</strong> The couple is often in demand throughout dinner. Ask the caterer to serve you first, and protect that moment.</li>
<li><strong>A drinks reception without you.</strong> If group and couple photos take up the whole drinks reception, you don’t see your guests. Keep them short.</li>
<li><strong>No wet-weather plan.</strong> It must be written into the timeline, with the cut-off time for deciding.</li>
<li><strong>A timeline only the couple knows.</strong> If it isn’t shared with every vendor, it is useless.</li>
</ul>

<h2>In short</h2>
<ul>
<li>Start from the fixed points (legal ceremony, sunset, end time) and work backwards.</li>
<li>Put a buffer after each risky moment.</li>
<li>Hand the timeline to someone other than you, and send a one-page sheet to each vendor two weeks before.</li>
<li>Plan the photo activity announcement at the drinks reception, and the album reveal the next day.</li>
</ul>
<p>For the photo activity, you can <a href="/create">create your Time to Flash album</a> (free for up to 5 guests, so you can try it with your wedding party). And if you are a wedding planner who wants to offer this activity to your couples, everything is in <a href="/pro">our space for wedding professionals</a>.</p>
`,
    faq: [
      {
        q: 'How do you build a wedding day timeline?',
        a: 'Start from the fixed points: the time of the legal ceremony, sunset if you want portraits in golden light, and the end time set by the venue. Then place the key moments (ceremony, drinks, dinner, first dance), add travel time and a buffer after each risky moment.',
      },
      {
        q: 'How long should the drinks reception last?',
        a: 'Usually between one and two and a half hours. It needs to leave time for group and couple photos while letting the couple enjoy their guests. In winter, an hour is often enough.',
      },
      {
        q: 'What time does a French wedding dinner start?',
        a: 'Most often around 8 p.m. for a wedding with an afternoon ceremony, after a drinks reception that starts around 5 p.m. In winter or with a morning ceremony, it can start earlier.',
      },
      {
        q: 'Who should run the timeline on the day?',
        a: 'A wedding planner or day-of coordinator, or failing that an organised friend who doesn’t already have a heavy role. The couple shouldn’t have to check the time, and vendors should know who makes the decisions if something unexpected happens.',
      },
      {
        q: 'When should you send the timeline to vendors?',
        a: 'About two weeks before the wedding, as a one-page sheet per vendor with addresses, contacts, their times and the moments that concern them. Then confirm by message in the week of the wedding.',
      },
      {
        q: 'When should you announce the guest photo activity?',
        a: 'At the start of the drinks reception, within the first fifteen minutes: guests have their hands free and are waiting for the couple. The QR code posters should be in place as guests leave the ceremony, and the DJ or wedding party announce it on the mic.',
      },
    ],
  },
}

// Version allemande : adaptation pour l'Allemagne (vouvoiement « Sie »),
// vocabulaire selon le glossaire du 10/10/2026 (Präsentation, Präsentationstermin).
export const POSTS_DE = {
  // DE : « Hochzeitsplaner Leistungen », « Weddingplaner Leistungen »,
  // « Hochzeitsplaner Kosten ». In Deutschland heißen die Pakete meist
  // Komplettplanung, Teilplanung und Tagesbegleitung (auch « Wedding Day
  // Management »). Preise nach deutschen Ratgebern (10/10/2026) : Tagesbegleitung
  // im unteren vierstelligen Bereich, Komplettplanung etwa 3.000 bis 8.000 €.
  // Angepasst : Standesamt statt mairie, Pauschalreiserecht statt Atout France,
  // Junggesellenabschied (JGA) statt EVJF, freie Trauung statt cérémonie laïque.
  'services-wedding-planner': {
    title: 'Hochzeitsplaner Leistungen: 12 Zusatzservices, die Sie abheben',
    excerpt: 'Die drei klassischen Pakete eines Hochzeitsplaners und 12 Zusatzleistungen für Ihr Angebot: was das Brautpaar davon hat, Ihre Marge und wie Sie sie verkaufen.',
    caption: 'Eine Hochzeitsplanerin legt am Vorabend einer Hochzeit Platzkarten auf eine weiß eingedeckte Tafel, im noch halb aufgebauten Saal',
    body: `
<p>Die Leistungen eines Hochzeitsplaners passen oft auf drei Zeilen einer Broschüre: Komplettplanung, Teilplanung, Tagesbegleitung. Brautpaare vergleichen diese drei Zeilen von Planer zu Planer, und das Gespräch landet schnell beim Preis. Aus diesem Vergleich kommen Sie nur heraus, wenn Ihr Angebot nicht aussieht wie das der Konkurrenz.</p>
<p>Dieser Leitfaden geht zuerst die Grundpakete durch (was hineingehört, wie Sie sie abgrenzen) und stellt dann <strong>12 Zusatzleistungen</strong> vor, mit denen Sie Ihr Angebot erweitern können. Zu jeder Leistung: was das Brautpaar davon hat, welchen Aufwand oder welche Marge sie für Sie bedeutet und wie Sie sie präsentieren, ohne dass es nach Lückenfüller aussieht.</p>

<h2>Leistungen eines Hochzeitsplaners: die drei Grundpakete</h2>
<p>Fast alle Hochzeitsplaner und Weddingplaner in Deutschland bauen ihr Angebot um dieselben drei Pakete herum. Die Namen unterscheiden sich, der Inhalt deutlich weniger.</p>

<h3>Die Komplettplanung</h3>
<p>Sie übernehmen das Projekt von Anfang bis Ende, oft 12 bis 18 Monate vor dem Termin: Budget, Locationsuche, Auswahl und Verhandlung der Dienstleister, Verträge und Zahlungsfristen, Gestaltungskonzept, Zeitplan, Gästemanagement und schließlich die Koordination am Hochzeitstag. Pro Hochzeit ist das das lukrativste Paket, aber auch das, was die meisten Stunden frisst: Dutzende Termine, Besichtigungen und E-Mail-Verläufe.</p>

<h3>Die Teilplanung</h3>
<p>Das Brautpaar hat schon einiges erledigt (meist sind Location und Caterer gebucht) und gibt Ihnen den Rest: ein paar Dienstleister, die Deko, den Ablauf, die Koordination. Bei diesem Paket gerät der Umfang am leichtesten aus dem Ruder. Schreiben Sie ins Angebot, welche Dienstleister Sie genau übernehmen und wie viele Termine enthalten sind.</p>

<h3>Die Tagesbegleitung</h3>
<p>Der Name täuscht: Niemand koordiniert eine Hochzeit gut, die er erst am Morgen kennenlernt. In der Praxis beginnen Sie ein bis drei Monate vorher: alle Verträge durchsehen, jeden Dienstleister anrufen, die Location technisch besichtigen, den Ablaufplan erstellen und dann vom Morgen bis in die Nacht vor Ort sein. Für viele Paare, die „alles selbst machen“ wollten, ist das der Einstieg: Zwei Monate vor der Hochzeit merken sie, dass sie den Tag nicht damit verbringen möchten, den Caterer zu dirigieren.</p>

<table>
<thead><tr><th>Paket</th><th>Sie starten</th><th>Was Sie übernehmen</th><th>Übliche Spanne</th></tr></thead>
<tbody>
<tr><td><strong>Komplettplanung</strong></td><td>12 bis 18 Monate vorher</td><td>Alles, vom Budget bis zum Hochzeitstag</td><td>Etwa 3.000 bis 8.000&nbsp;€, im Luxussegment deutlich mehr</td></tr>
<tr><td><strong>Teilplanung</strong></td><td>4 bis 9 Monate vorher</td><td>Ein Teil der Dienstleister, Deko, Ablauf, Hochzeitstag</td><td>Etwa 1.500 bis 4.000&nbsp;€</td></tr>
<tr><td><strong>Tagesbegleitung</strong></td><td>1 bis 3 Monate vorher</td><td>Übernahme der Planung, Ablaufplan, Präsenz am Hochzeitstag</td><td>Etwa 1.000 bis 2.500&nbsp;€</td></tr>
</tbody>
</table>
<p>Diese Spannen stammen aus veröffentlichten Preisen von Hochzeitsplanern und aus Ratgebern von 2026. Sie hängen stark von Region, Erfahrung und Gästezahl ab: Es sind Größenordnungen, keine Preisliste zum Abschreiben.</p>
<p><strong>Pauschale oder Prozentsatz?</strong> Manche Planer berechnen einen Anteil am Gesamtbudget (oft genannt werden 10 bis 15&nbsp;%), die meisten arbeiten aber mit Pauschalen. Eine Pauschale gibt dem Brautpaar Sicherheit (es weiß, was es zahlt) und schützt Sie vor dem Verdacht, die Ausgaben hochzutreiben, um Ihr Honorar zu erhöhen.</p>

<h2>Warum sich Zusatzleistungen lohnen</h2>
<p>Drei Gründe, nach Wichtigkeit geordnet.</p>
<ul>
<li><strong>Sie heben sich ab.</strong> Bei den drei Grundpaketen ähneln sich alle Planer. Den Ausschlag gibt oft ein Detail, das das Paar nirgendwo sonst gesehen hat.</li>
<li><strong>Sie erhöhen den Umsatz pro Hochzeit</strong>, ohne mehr Hochzeiten anzunehmen. Eine Leistung für 300&nbsp;€, die Sie bei der Hälfte Ihrer Paare verkaufen, bringt schnell so viel wie eine zusätzliche Hochzeit im Jahr, mit viel weniger geopferten Wochenenden.</li>
<li><strong>Sie machen dem Paar das Leben leichter.</strong> Ein Ansprechpartner statt fünf: Genau das kauft man ein, wenn man einen Hochzeitsplaner bucht.</li>
</ul>
<p>Vor der Liste eine nützliche Unterscheidung. Eine Zusatzleistung lässt sich auf drei Arten verkaufen:</p>
<ol>
<li><strong>Sie erbringen sie selbst</strong> (Papeterie, Gestaltung, Gästemanagement): hohe Marge, aber es ist Ihre Zeit.</li>
<li><strong>Sie vergeben sie weiter und berechnen sie mit Aufschlag</strong>: wenig Zeitaufwand, aber Sie haften für das Ergebnis.</li>
<li><strong>Sie empfehlen einen Partner</strong>: kein Risiko, manchmal eine Vermittlungsprovision. Sagen Sie das dem Paar dann offen. Transparenz an dieser Stelle schafft Vertrauen und ist keine Schwäche.</li>
</ol>

<h2>12 Zusatzleistungen für Hochzeitsplaner</h2>

<h3>1. Gestaltung und Dekorationskonzept</h3>
<p><strong>Für das Brautpaar:</strong> ein stimmiges Gesamtbild, von der Einladung bis zum Tischschmuck, statt einer Sammlung von Pinterest-Ideen, die nicht zusammenpassen.</p>
<p><strong>Aufwand und Marge:</strong> eine der am besten bezahlten Leistungen, weil sie auf Ihrem Geschmack und Ihren Kontakten beruht. Sie kostet aber Konzeptionszeit (Moodboard, Aufbauplan, Materialauswahl) und, wenn Sie Deko vermieten, Lagerplatz und Transport.</p>
<p><strong>So verkaufen Sie sie:</strong> Zeigen Sie Moodboards, die Sie für echte Hochzeiten erstellt haben, und bieten Sie zwei Stufen an: nur das Konzept (das Paar kauft und dekoriert selbst) oder Konzept mit Verleih und Aufbau.</p>

<h3>2. Papeterie</h3>
<p><strong>Für das Brautpaar:</strong> Einladungen, Menükarten, Platzkarten, Sitzplan, Beschilderung und Kirchenheft oder Programm im selben Design, ohne drei Druckereien hinterherzulaufen.</p>
<p><strong>Aufwand und Marge:</strong> Wenn Sie ein Layoutprogramm beherrschen, ist die Marge gut. Sonst arbeiten Sie mit einer Grafikerin oder einem Papeterie-Atelier zusammen und berechnen weiter. Vorsicht bei Korrekturschleifen (Schreibweise der Namen, Uhrzeiten): Legen Sie die Zahl der Korrekturen fest.</p>
<p><strong>So verkaufen Sie sie:</strong> Legen Sie beim ersten Termin ein gedrucktes Stück auf den Tisch. Eine gelungene Menükarte oder ein Sitzplan zum Anfassen verkauft sich besser als eine Datei.</p>

<h3>3. Gästemanagement</h3>
<p><strong>Für das Brautpaar:</strong> keine Tabelle mehr, die auf drei Handys unterschiedlich aktuell ist. Sie sammeln Zu- und Absagen, Essenswünsche, Kinder, Allergien und Fahrtbedarf, und Sie erstellen mit dem Paar den Sitzplan.</p>
<p><strong>Aufwand und Marge:</strong> wenig technisch, aber zeitintensiv in den letzten zwei Monaten (Nachzügler, spontane Begleitpersonen). Berechnen Sie eine Pauschale mit einem Stichtag für Änderungen.</p>
<p><strong>So verkaufen Sie es:</strong> Fragen Sie das Paar, wie viele Nachrichten es schon jetzt von der Familie zur Hochzeit bekommt. Es versteht schnell, was es gewinnt, wenn diese Nachrichten bei Ihnen landen.</p>

<h3>4. Unterkunft und Transport der Gäste</h3>
<p><strong>Für das Brautpaar:</strong> Die Gäste wissen, wo sie schlafen, wie sie hinkommen und wie sie zurückfahren, und niemand setzt sich um 4&nbsp;Uhr morgens ans Steuer.</p>
<p><strong>Aufwand und Marge:</strong> Zimmerkontingente verhandeln und Shuttles organisieren braucht wenig Kreativität, aber viel Nachfassen. Ein rechtlicher Punkt, den Sie prüfen sollten: Wenn Sie selbst Transport und Unterkunft als Paket zu einem Gesamtpreis <em>verkaufen</em>, kann das als Pauschalreise gelten. Dann treffen Sie die Pflichten eines Reiseveranstalters, unter anderem eine Insolvenzabsicherung. Am einfachsten ist es meist, Konditionen auszuhandeln und jeden Gast direkt buchen und bezahlen zu lassen.</p>
<p><strong>So verkaufen Sie es:</strong> Bei einer abgelegenen Location ist das fast ein Sicherheitsargument. Stellen Sie es auch so dar.</p>

<h3>5. Begleitung rund ums Standesamt</h3>
<p><strong>Für das Brautpaar:</strong> eine Anmeldung zur Eheschließung, die beim ersten Mal vollständig ist. Die Anmeldung ist frühestens sechs Monate vor dem Termin möglich, die nötigen Unterlagen hängen von der persönlichen Situation ab, und bei einem ausländischen Partner kann die Beschaffung der Dokumente Wochen oder Monate dauern. Wer das spät entdeckt, vergisst es nicht.</p>
<p><strong>Aufwand und Marge:</strong> Die Anmeldung kann das Paar nur selbst erledigen. Sie können aber die Liste der Unterlagen, die Fristen und die Fragen ans Standesamt vorbereiten (Wunschtermin, Trauung an einem Außentrauort, Zahl der Plätze, ob fotografiert werden darf) und sich um die praktische Abstimmung kümmern. Trauzeugen sind übrigens nicht mehr vorgeschrieben, viele Paare wissen das nicht. Geringer Aufwand, sobald Ihre Vorlage steht.</p>
<p><strong>So verkaufen Sie es:</strong> Statt als kostenpflichtige Option nehmen Sie es lieber in Ihre höherpreisigen Pakete auf. Für Sie kostet es wenig, für das Paar ist es sehr beruhigend.</p>

<h3>6. Die freie Trauung</h3>
<p><strong>Für das Brautpaar:</strong> eine Zeremonie, die zu ihm passt, gemeinsam geschrieben, mit Mitwirkenden, die wissen, wann sie aufstehen und was sie vorlesen.</p>
<p><strong>Aufwand und Marge:</strong> Wenn Sie selbst als Traurednerin oder Trauredner auftreten, ist das eine eigene Leistung (Gespräche, Rede schreiben, Probe). Sonst arbeiten Sie mit einem freien Redner zusammen und behalten die Koordination: Bestuhlung, Musik, Einzug, Timing.</p>
<p><strong>So verkaufen Sie sie:</strong> Zeigen Sie schon beim ersten Termin einen Beispielablauf. Paare, die zwischen „nur Standesamt“ und freier Trauung schwanken, entscheiden sich oft, sobald sie sehen, wie ihre Zeremonie aussehen könnte.</p>

<h3>7. Programm für Sektempfang und Party</h3>
<p><strong>Für das Brautpaar:</strong> ein Sektempfang, der sich nicht anfühlt wie zwei Stunden Warten, während die Fotos gemacht werden, und eine Party, die nicht nur am DJ hängt.</p>
<p><strong>Aufwand und Marge:</strong> Livemusik, Karikaturist, Holzspiele, Cocktailbar, Weinprobe: Sie arbeiten mit Partnern, Ihr Wert liegt in Auswahl und Koordination. Viele Ideen haben wir in <a href="/journal/idees-animation-mariage">unseren Ideen für die Hochzeitsunterhaltung</a> gesammelt.</p>
<p><strong>So verkaufen Sie es:</strong> Schlagen Sie zwei oder drei Programmpunkte vor, die zu den Gästen passen (viele Kinder, viele ältere Gäste, Gäste, die sich nicht kennen), keinen Katalog.</p>

<h3>8. Fotoaktion für die Gäste</h3>
<p><strong>Für das Brautpaar:</strong> die Fotos, die der Fotograf nicht machen kann. Er ist beim Paarshooting, er sieht den hinteren Tisch nicht, den Lachanfall an der Bar, die Oma um 1&nbsp;Uhr auf der Tanzfläche. Die Gäste dagegen sind überall.</p>
<p>Dafür gibt es mehrere Wege: eine Fotobox, ein Gästebuch mit Sofortbildkamera, eine geteilte Galerie oder eine digitale Einwegkamera auf den Handys der Gäste. Die Möglichkeiten vergleichen wir in <a href="/journal/comparatif-animations-photo-mariage">Fotobox, Fotospiegel oder Einwegkamera: was passt?</a></p>
<p>Nehmen wir als Beispiel die Einwegkamera, die wir mit <strong>Time to Flash</strong> gebaut haben. Jeder Gast scannt einen QR-Code, gibt seinen Vornamen ein, und sein Handy wird zur Einwegkamera: keine App zu installieren, eine begrenzte Zahl an Fotos (3 bis 15, frei wählbar), ein analoger Filmlook, und die Fotos bleiben verborgen. Am nächsten Tag wird das Album für alle gleichzeitig sichtbar.</p>
<p><strong>Was Sie konkret übernehmen:</strong></p>
<ul>
<li><strong>Das Event anlegen</strong>: Fotos pro Gast, Präsentationstermin (standardmäßig am nächsten Tag), Filmlook. Sie können das Brautpaar als Mitveranstalter einladen.</li>
<li><strong>Die Druckvorlagen</strong>: der QR-Code allein, das A4-Plakat, die Tischaufsteller und kleine Kärtchen kommen druckfertig aus dem Dashboard. Sie bauen sie in Ihre Beschilderung ein.</li>
<li><strong>Die Ansage</strong>: ein Satz im Ablauf für den DJ oder in der kurzen Rede der Trauzeugen beim Sektempfang.</li>
<li><strong>Die Durchsicht vor der Präsentation</strong>, auf Wunsch mit dem Paar: Wer das Event verwaltet, sieht die Fotos vor allen anderen und kann unpassende entfernen.</li>
</ul>
<p><strong>Ihr Zeitaufwand:</strong> In der Praxis reicht eine halbe Stunde Vorbereitung (Anlegen, Drucken, eine Zeile im Ablaufplan), dazu ein paar Minuten am Hochzeitstag, um die Plakate aufzustellen. Kein Aufbau, kein Techniker, keine Kaution.</p>
<p><strong>Aufwand und Marge:</strong> Die Kosten sind eine einmalige Zahlung je nach Gästezahl, zum Beispiel 34,99&nbsp;€ bis 150 Gäste oder 59,99&nbsp;€ bis 300. Sie können es als Markenzeichen in Ihre Pakete aufnehmen oder als Option anbieten.</p>
<p><strong>So verkaufen Sie es:</strong> Zeigen Sie es. Lassen Sie das Paar beim Termin den QR-Code scannen und ein Foto machen. Die meisten haben so etwas auf anderen Hochzeiten noch nicht erlebt, und es ergänzt den Fotografen, statt ihm Konkurrenz zu machen.</p>

<h3>9. Programmheft und Gäste-Sets</h3>
<p><strong>Für das Brautpaar:</strong> Gäste, die wissen, was wann passiert. Das Kirchenheft oder Programm der Trauung, der Wochenendplan und die kleinen Sets, die einen Abend retten (Fächer, Taschentücher, Blasenpflaster, Tanzschuhe).</p>
<p><strong>Aufwand und Marge:</strong> gering, vor allem zusammen mit der Papeterie. Die Marge kommt aus Sammeleinkauf und Konfektionierung.</p>
<p><strong>So verkaufen Sie es:</strong> als Ergänzung einer anderen Leistung, nie allein. Ein Körbchen mit Sets an der Garderobe ist genau die Art Detail, von der Gäste dem Paar erzählen.</p>

<h3>10. Das ganze Wochenende: Vorabend und Brunch</h3>
<p><strong>Für das Brautpaar:</strong> eine Hochzeit über zwei oder drei Tage, wie sie immer häufiger wird, ohne dass die Organisation des Vorabends und des Brunchs am nächsten Tag an ihm hängen bleibt.</p>
<p><strong>Aufwand und Marge:</strong> oft dieselbe Location und dieselben Dienstleister. Ein Brunch lässt sich mit viel weniger Energie koordinieren als der Hochzeitstag, und deshalb ist er eine der Leistungen mit dem besten Verhältnis von Zeit zu Umsatz.</p>
<p><strong>So verkaufen Sie es:</strong> Stellen Sie den Brunch als Abschluss der Hochzeit vor, nicht als zusätzliche Mahlzeit. Er ist auch der ideale Moment, um die Fotos der Gäste gemeinsam anzuschauen (siehe <a href="/journal/revelation-photos-lendemain-mariage">die Präsentation am nächsten Tag</a>).</p>

<h3>11. Trauzeugen und Junggesellenabschied (JGA)</h3>
<p><strong>Für das Brautpaar:</strong> Trauzeugen, die wissen, was von ihnen erwartet wird, und ein JGA, der nicht in die Hochzeitswoche hineinragt.</p>
<p><strong>Aufwand und Marge:</strong> Ein Briefing der Trauzeugen dauert eine Stunde. Einen JGA komplett zu organisieren ist ein eigenes Projekt mit anderen Kunden (den Trauzeugen und Freunden). Entscheiden Sie, ob Sie diesen Markt wollen.</p>
<p><strong>So verkaufen Sie es:</strong> Das Briefing der Trauzeugen passt in jedes Paket. Es spart Ihnen am Hochzeitstag Zeit, und die Trauzeugen werden zu Ihren Verbündeten (und oft zu künftigen Kunden).</p>

<h3>12. Nach der Hochzeit</h3>
<p><strong>Für das Brautpaar:</strong> nach der Rückkehr nichts mehr zu erledigen: Rückgabe der Mietsachen, Geschirr, Dankeskarten, Reinigung des Kleides, Fotos an einem Ort.</p>
<p><strong>Aufwand und Marge:</strong> gering, und die Beziehung reicht über den Hochzeitstag hinaus. In diesen Wochen sind Paare auch am ehesten bereit, eine Bewertung zu schreiben und Sie weiterzuempfehlen.</p>
<p><strong>So verkaufen Sie es:</strong> als Option bei Vertragsabschluss oder als Geschenk in der Komplettplanung. Warum dieser Moment für Ihren Ruf zählt, lesen Sie in <a href="/journal/trouver-clients-wedding-planner">wie Sie als Hochzeitsplaner Kunden gewinnen</a>.</p>

<h2>Die Übersicht in einer Tabelle</h2>
<table>
<thead><tr><th>Leistung</th><th>Ihr Aufwand</th><th>Mögliche Marge</th><th>Wann anbieten</th></tr></thead>
<tbody>
<tr><td>Gestaltung und Deko-Konzept</td><td>Hoch</td><td>Hoch</td><td>Erster Termin</td></tr>
<tr><td>Papeterie</td><td>Mittel</td><td>Gut</td><td>Nach Vertragsabschluss</td></tr>
<tr><td>Gästemanagement</td><td>Mittel</td><td>Mittel</td><td>Sechs Monate vorher</td></tr>
<tr><td>Unterkunft und Transport</td><td>Mittel</td><td>Gering bis mittel</td><td>Sobald die Location steht</td></tr>
<tr><td>Begleitung Standesamt</td><td>Gering</td><td>Gering (Argument)</td><td>Bei Vertragsabschluss</td></tr>
<tr><td>Freie Trauung</td><td>Hoch, wenn Sie selbst reden</td><td>Gut</td><td>Erster Termin</td></tr>
<tr><td>Programm</td><td>Gering bis mittel</td><td>Mittel</td><td>Vier bis sechs Monate vorher</td></tr>
<tr><td>Fotoaktion für die Gäste</td><td>Sehr gering</td><td>Nach Ihrer Wahl</td><td>Erster Termin (Vorführung)</td></tr>
<tr><td>Programmheft und Sets</td><td>Gering</td><td>Mittel</td><td>Mit der Papeterie</td></tr>
<tr><td>Wochenende und Brunch</td><td>Mittel</td><td>Gut</td><td>Bei Vertragsabschluss</td></tr>
<tr><td>Trauzeugen und JGA</td><td>Gering bis hoch</td><td>Unterschiedlich</td><td>Drei bis sechs Monate vorher</td></tr>
<tr><td>Nach der Hochzeit</td><td>Gering</td><td>Gering (Kundenbindung)</td><td>Bei Vertragsabschluss</td></tr>
</tbody>
</table>

<h2>So präsentieren Sie Ihre Zusatzleistungen</h2>
<p>Zwölf Optionen am Ende eines Angebots schrecken ab. Drei Ansätze funktionieren besser.</p>
<p><strong>Pakete statt Speisekarte.</strong> Bündeln Sie die Leistungen nach Logik: ein Paket „Gäste“ (Gästemanagement, Unterkunft, Shuttles, Sets), ein Paket „Gestaltung“ (Deko-Konzept, Papeterie, Programmheft), ein Paket „Wochenende“ (Vorabend, Brunch, Nachbereitung). Das Paar wählt ein Paket, nicht zehn Zeilen.</p>
<p><strong>Ein Markenzeichen in jedem Paket.</strong> Wählen Sie ein oder zwei Leistungen, die Sie wenig kosten und die Gäste deutlich sehen, und nehmen Sie sie in alle Pakete auf. Genau das bringt Gäste dazu zu fragen: „Wer hat das organisiert?“</p>
<p><strong>Der richtige Zeitpunkt.</strong> Beim ersten Termin sprechen Sie über das, was zur Unterschrift führt (Gestaltung, Trauung, eine Vorführung). Logistische Optionen (Shuttles, Sets, Nachbereitung) bieten Sie später an, wenn das Paar merkt, wie viel noch zu tun ist.</p>

<h2>So heben Sie sich als Hochzeitsplaner ab</h2>
<p>Zusatzleistungen helfen wenig, wenn sie aussehen wie bei allen anderen. Vier Hebel machen den Unterschied.</p>
<ul>
<li><strong>Eine klare Spezialisierung.</strong> Hochzeiten auf dem Land, kleine Hochzeiten, interkulturelle Hochzeiten, nachhaltige Hochzeiten: Eine genaue Positionierung bleibt besser im Kopf als „Hochzeiten aller Art“.</li>
<li><strong>Eine sichtbare Methode.</strong> Zeigen Sie Ihre Zeitplanung, Ihren Ablaufplan, Ihr Dienstleister-Infoblatt (eine Vorlage finden Sie in <a href="/journal/deroule-jour-j-mariage">dem Tagesablauf der Hochzeit Stunde für Stunde</a>). Paare kaufen Gelassenheit ein: Beweisen Sie sie.</li>
<li><strong>Ein Erlebnis für die Gäste.</strong> Paare erinnern sich nicht an Ihre Tabelle, sondern an das, was ihre Gäste ihnen erzählt haben. Eine Aktion, bei der alle mitmachen, ein schönes Programmheft, ein pünktlicher Shuttle: Davon wird nach der Hochzeit erzählt.</li>
<li><strong>Präsenz nach dem Hochzeitstag.</strong> Die meisten Dienstleister sind am nächsten Tag verschwunden. Eine Nachricht am Morgen, an dem die Gästefotos sichtbar werden, ein Rückblick auf den Abend, eine Bitte um Bewertung im richtigen Moment: Bessere Werbung gibt es nicht.</li>
</ul>

<h2>Kurz zusammengefasst</h2>
<ul>
<li>Grenzen Sie Ihre drei Grundpakete schriftlich ab (enthaltene Dienstleister, Zahl der Termine).</li>
<li>Wählen Sie die Zusatzleistungen, die zu Ihrer Spezialisierung passen, nicht alle.</li>
<li>Bündeln Sie sie zu Paketen und nehmen Sie überall ein Markenzeichen auf, das die Gäste sehen.</li>
<li>Bleiben Sie nach der Hochzeit in Kontakt: Dort entstehen Empfehlungen.</li>
</ul>
<p>Wenn Sie die Fotoaktion für Gäste als Leistung für Ihre Brautpaare interessiert, haben wir einen eigenen Bereich für Dienstleister eingerichtet: <a href="/pro">Time to Flash Ihren Brautpaaren anbieten</a>. Und um Ihr Geschäft aufzustellen, lesen Sie auch <a href="/journal/devenir-wedding-planner-outils">Hochzeitsplaner werden: Gründung, Ausbildung und Tools</a>.</p>
`,
    faq: [
      {
        q: 'Welche Leistungen bietet ein Hochzeitsplaner?',
        a: 'Meist drei Pakete: die Komplettplanung (vom Budget bis zum Hochzeitstag), die Teilplanung (ein Teil der Dienstleister plus Koordination) und die Tagesbegleitung, die in Wirklichkeit ein bis drei Monate vorher beginnt. Viele ergänzen das um Zusatzleistungen wie Gestaltung, Papeterie, Gästemanagement oder Unterkunft.',
      },
      {
        q: 'Welche Zusatzleistungen kann ein Weddingplaner anbieten?',
        a: 'Am häufigsten sind Gestaltung und Deko-Konzept, Papeterie, Gästemanagement, Unterkunft und Shuttles, die freie Trauung, Programm und Fotoaktion für die Gäste, der Brunch am nächsten Tag und die Nachbereitung. Wichtig ist, die Leistungen zu wählen, die zu Ihrer Spezialisierung passen, und sie zu Paketen zu bündeln.',
      },
      {
        q: 'Was kostet eine Tagesbegleitung durch einen Hochzeitsplaner?',
        a: 'Übliche Spannen in Deutschland liegen 2026 bei etwa 1.000 bis 2.500 €, im Premiumsegment auch darüber. Der Preis hängt von Region, Gästezahl und der enthaltenen Vorbereitungszeit ab.',
      },
      {
        q: 'Wie kann sich ein Hochzeitsplaner von der Konkurrenz abheben?',
        a: 'Mit einer klaren Spezialisierung, einer sichtbaren Methode (Zeitplan, Ablaufplan, Dienstleister-Infoblatt), einem Erlebnis, von dem die Gäste erzählen, und Präsenz nach der Hochzeit. Eine konkrete Vorführung beim Termin überzeugt mehr als eine Liste von Leistungen.',
      },
      {
        q: 'Darf ein Hochzeitsplaner Unterkünfte für die Gäste verkaufen?',
        a: 'Er kann Konditionen verhandeln und die Buchungen koordinieren. Verkauft er dagegen selbst Transport und Unterkunft als Paket zu einem Gesamtpreis, kann das als Pauschalreise gelten, mit den Pflichten eines Reiseveranstalters wie der Insolvenzabsicherung. Lassen Sie das prüfen, bevor Sie solche Leistungen berechnen.',
      },
    ],
  },
  // DE : « Hochzeitsplaner werden », « Weddingplaner werden », « Hochzeitsplaner
  // Ausbildung », « Hochzeitsplaner Software ». Google.de (10/10/2026) :
  // Gründungsratgeber (selbststaendigkeit.de, gruenderplattform.de, sevdesk)
  // mit Gewerbeanmeldung, IHK-Pflichtmitgliedschaft, Fragebogen zur steuerlichen
  // Erfassung (ELSTER), keine geschützte Ausbildung, IHK-Zertifikatslehrgänge
  // (z. B. IHK Köln), Fernlehrgänge, Veranstaltungskaufleute, Eventmanagement.
  // Angepasst : micro-entreprise → Einzelunternehmen + Kleinunternehmerregelung
  // (25.000 / 100.000 € seit 2025), Atout France → Pauschalreiserecht,
  // facturation électronique → E-Rechnung (Empfang seit 01/01/2025, nur B2B,
  // Kleinunternehmer vom Ausstellen ausgenommen), RNCP/CPF → IHK-Zertifikat,
  // ZFU-Zulassung, Bildungsgutschein. Tools : französische Tools ersetzt durch
  // Lexware Office, sevDesk ; Anolla und folk gestrichen. Keine Preise.
  'devenir-wedding-planner-outils': {
    title: 'Hochzeitsplaner werden: Gründung, Ausbildung und Tools 2026',
    excerpt: 'Gewerbe, Ausbildung, Netzwerk, erste Kunden und Preise: So werden Sie Hochzeitsplaner in Deutschland. Dazu der Werkzeugkasten 2026, nach Einsatz sortiert.',
    caption: 'Ein Arbeitsplatz zu Hause am Abend: ein aufgeklappter Laptop mit einem Zeitplan, Stoffmuster und ein Terminkalender',
    body: `
<p>Hochzeitsplaner werden: Das reizt viele, aus guten Gründen. Ein greifbarer Beruf, viel Kontakt mit Menschen und die Genugtuung, wenn ein Tag so abläuft wie geplant. Es ist aber auch ein Beruf für Selbstständige, saisonal, in dem man von seinen Kontakten lebt und davon, Dutzende Details gleichzeitig im Blick zu behalten.</p>
<p>Dieser Leitfaden zeigt die Schritte für den Start in Deutschland (Gründung, Ausbildung, Netzwerk, erste Kunden, Preise) und danach den Werkzeugkasten eines Weddingplaners 2026, sortiert nach Einsatzzweck. Alle genannten Tools gibt es wirklich, wir haben sie im Oktober 2026 geprüft; Preise nennen wir nicht, weil sie sich zu oft ändern.</p>

<h2>Hochzeitsplaner werden: wie der Beruf wirklich aussieht</h2>
<p>Ein Hochzeitsplaner verkauft drei Dinge: Zeit (die das Brautpaar nicht hat), ein Netzwerk (verlässliche Dienstleister zu ausgehandelten Konditionen) und Nervenstärke (am Hochzeitstag kümmert er sich um den Regen, den verspäteten Caterer und den Onkel, der zwanzig Minuten reden will).</p>
<p>Ein paar Tatsachen, die Sie vor dem Start kennen sollten:</p>
<ul>
<li><strong>Die Saison ist kurz.</strong> Die meisten Hochzeiten finden zwischen Mai und September statt, vor allem samstags. Wie viele Hochzeiten Sie im Jahr betreuen können, begrenzt also der Kalender, nicht nur Ihre Energie.</li>
<li><strong>Die Arbeit passiert vor allem vorher.</strong> Besichtigungen, Termine, Angebote, Nachfassen: Der Hochzeitstag ist nur der sichtbare Teil.</li>
<li><strong>Kunden buchen lange im Voraus.</strong> Für eine Komplettplanung oft 12 bis 18 Monate vor dem Termin. Ihr erstes Jahr dient zu einem großen Teil dazu, das nächste zu füllen.</li>
<li><strong>Jeder Kunde ist neu.</strong> Man heiratet selten zweimal mit demselben Planer: Ihr Geschäft lebt von Empfehlungen und Sichtbarkeit.</li>
</ul>

<h3>Die Fähigkeiten, auf die es ankommt</h3>
<ul>
<li><strong>Organisation</strong>, natürlich: mehrere Hochzeiten parallel führen, jede mit eigenen Fristen, ohne etwas zu vergessen.</li>
<li><strong>Verhandlungsgeschick</strong>: einen besseren Preis, eine Stunde mehr, ein Entgegenkommen erreichen, ohne die Beziehung zum Dienstleister zu belasten.</li>
<li><strong>Serviceorientierung</strong>: Brautpaare schreiben Ihnen am Sonntagabend. Setzen Sie einen Rahmen, ohne distanziert zu wirken.</li>
<li><strong>Ruhe</strong>: Am Hochzeitstag gibt Ihr Gesicht den Ton an. Wenn Sie in Panik geraten, geraten alle in Panik.</li>
<li><strong>Ein Mindestmaß an Geschmack und visueller Bildung</strong>, auch wenn Sie keine Gestaltung anbieten: Das Paar wird Sie zu allem nach Ihrer Meinung fragen.</li>
<li><strong>Führerschein und körperliche Ausdauer</strong>: Hochzeitstage dauern oft mehr als fünfzehn Stunden, im Stehen.</li>
</ul>

<h2>Gründung: Gewerbe, Finanzamt und Kleinunternehmerregelung</h2>
<p>Als Hochzeitsplaner betreiben Sie in aller Regel ein <strong>Gewerbe</strong>. Die üblichen Schritte:</p>
<ol>
<li><strong>Gewerbeanmeldung</strong> beim Gewerbeamt Ihrer Stadt oder Gemeinde, gegen eine Gebühr, die je nach Ort unterschiedlich ist. Viele Kommunen bieten das inzwischen online an.</li>
<li><strong>Fragebogen zur steuerlichen Erfassung</strong> beim Finanzamt, online über ELSTER. Danach erhalten Sie Ihre Steuernummer für die Rechnungen.</li>
<li><strong>IHK-Mitgliedschaft</strong>: Mit der Gewerbeanmeldung werden Sie automatisch Mitglied der Industrie- und Handelskammer. Die IHK ist auch eine gute erste Anlaufstelle für Gründungsberatung.</li>
</ol>
<p>Die meisten starten als <strong>Einzelunternehmen</strong>, oft mit der <strong>Kleinunternehmerregelung</strong>: Sie weisen keine Umsatzsteuer aus, was Ihre Preise für Privatkunden attraktiver macht und die Buchhaltung vereinfacht. Seit 2025 gelten dafür 25.000&nbsp;€ Umsatz im Vorjahr und 100.000&nbsp;€ im laufenden Jahr; prüfen Sie die aktuellen Grenzen bei Finanzamt oder IHK. Der Haken: Sie können sich die Vorsteuer nicht erstatten lassen, was ins Gewicht fällt, wenn Sie viel Deko kaufen oder mieten.</p>
<p>Wächst das Geschäft, lohnt sich ein Gespräch mit einer Steuerberaterin oder einem Steuerberater über die Umsatzsteuerpflicht und später über eine GmbH oder UG (Haftungsbeschränkung, Mitarbeitende). Gewerbesteuer fällt bei Einzelunternehmen erst oberhalb eines Freibetrags an.</p>
<p><strong>Fünf Punkte, die Sie nicht vergessen sollten:</strong></p>
<ul>
<li><strong>Eine Betriebshaftpflichtversicherung.</strong> Sie ist nicht vorgeschrieben, aber Locations und Kunden fragen danach, und ein Schaden am Hochzeitstag kann teuer werden.</li>
<li><strong>Die Krankenversicherung.</strong> Als Selbstständige kümmern Sie sich selbst darum, ob gesetzlich oder privat. Planen Sie den Beitrag von Anfang an in Ihre Preise ein.</li>
<li><strong>Solide Allgemeine Geschäftsbedingungen und Verträge</strong>: Anzahlung, Zahlungsplan, Stornierung, Verschiebung, genauer Umfang jedes Pakets.</li>
<li><strong>Das Pauschalreiserecht.</strong> Wenn Sie selbst Transport und Unterkunft als Paket zu einem Gesamtpreis verkaufen (Hochzeit im Ausland, Wochenende für die Gäste), können Sie als Reiseveranstalter gelten, mit Pflichten wie der Insolvenzabsicherung. Informieren Sie sich, bevor Sie so etwas anbieten.</li>
<li><strong>Die E-Rechnung.</strong> Seit dem 1. Januar 2025 müssen alle Unternehmen in Deutschland elektronische Rechnungen empfangen können. Die Pflicht zum Ausstellen wird bis Ende 2027 schrittweise eingeführt, gilt aber nur zwischen Unternehmen: Rechnungen an Brautpaare als Privatpersonen sind nicht betroffen, und Kleinunternehmer sind vom Ausstellen ausgenommen. Wählen Sie trotzdem ein Rechnungsprogramm, das E-Rechnungen beherrscht.</li>
</ul>

<h2>Hochzeitsplaner Ausbildung: nützlich, aber keine Pflicht</h2>
<p>Hochzeitsplaner ist kein geschützter Beruf, eine bestimmte Ausbildung ist nicht vorgeschrieben. Eine Weiterbildung lohnt sich trotzdem aus drei Gründen: Sie lernen die Methode (Budget, Zeitplan, Verträge), Sie treffen Profis, und Sie geben den ersten Kunden Sicherheit.</p>
<p>Die häufigsten Wege:</p>
<ul>
<li><strong>IHK-Zertifikatslehrgänge</strong>: Mehrere IHKs bieten berufsbegleitende Lehrgänge zur Hochzeitsplanerin oder zum Hochzeitsplaner an, mit Inhalten von der Gründung über Kalkulation bis zur Zusammenarbeit mit Dienstleistern.</li>
<li><strong>Fernlehrgänge und private Akademien</strong> für Hochzeits- und Eventplanung. Achten Sie bei Fernlehrgängen auf die Zulassung durch die Staatliche Zentralstelle für Fernunterricht (ZFU). Wer arbeitssuchend ist, kann unter Umständen einen Bildungsgutschein der Agentur für Arbeit nutzen, wenn der Kurs dafür zertifiziert ist.</li>
<li><strong>Allgemeine Wege ins Eventgeschäft</strong>: die Ausbildung zur Veranstaltungskauffrau oder zum Veranstaltungskaufmann, ein Studium im Eventmanagement, manchmal mit Schwerpunkt Hochzeiten.</li>
<li><strong>Assistenz</strong>: eine oder zwei Saisons als Assistentin oder Assistent eines etablierten Planers. Oft die lehrreichste Ausbildung, und die beste fürs Netzwerk.</li>
</ul>
<p>Vorsicht bei Kurzkursen, die versprechen, Sie „in wenigen Wochen zum Weddingplaner“ zu machen, mit einem hauseigenen Zertifikat. Verlangen Sie den ausführlichen Lehrplan, fragen Sie nach dem Hintergrund der Dozenten und sprechen Sie mit ehemaligen Teilnehmenden.</p>

<h2>Ein Netzwerk aus Dienstleistern aufbauen</h2>
<p>Ihre Kontakte sind Ihr wichtigstes Kapital. Sie entstehen Dienstleister für Dienstleister:</p>
<ul>
<li><strong>Zuerst die Locations.</strong> Sie sehen die Brautpaare als Erste. Besichtigen Sie sie, stellen Sie sich vor, bitten Sie darum, auf ihre Empfehlungsliste zu kommen.</li>
<li><strong>Ein oder zwei Dienstleister pro Kategorie</strong> (Catering, Fotografie, Floristik, DJ, Verleih), jeweils mit einer Alternative. Testen Sie sie, wenn es geht: ein Essen beim Caterer, ein Abend mit dem DJ.</li>
<li><strong>Ein Infoblatt pro Dienstleister</strong>: Richtpreise, Konditionen, Vorlaufzeiten, was er gut kann und was nicht.</li>
<li><strong>Austausch in beide Richtungen.</strong> Empfehlen Sie Ihre Partner, schicken Sie ihnen die Fotos gemeinsamer Hochzeiten, nennen Sie sie in Ihren Kanälen. Ein Netzwerk, das nur in eine Richtung funktioniert, erschöpft sich schnell.</li>
</ul>

<h2>Die ersten Kunden finden</h2>
<p>Ohne Portfolio ist es schwer zu überzeugen. Die klassischen Wege, eines aufzubauen:</p>
<ul>
<li><strong>Ein Styled Shoot</strong> mit Partnern: eine Location, eine Deko, ein Fotograf, ein Model-Paar. Alle bekommen Bilder.</li>
<li><strong>Hochzeiten im Freundeskreis</strong> zum reduzierten Preis, wenn Sie sie wie echte Aufträge behandeln (Vertrag, Ablaufplan, Fotos).</li>
<li><strong>Assistenzeinsätze</strong> bei einem etablierten Planer, mit seinem Einverständnis, Ihre Arbeit zu zeigen.</li>
</ul>
<p>Danach kommen die Kanäle zur Kundengewinnung (Partner-Locations, Instagram, Google, Verzeichnisse, Messen). Wir beschreiben sie mit einem 90-Tage-Plan in <a href="/journal/trouver-clients-wedding-planner">wie Sie als Hochzeitsplaner Kunden gewinnen</a>.</p>

<h2>Was Sie berechnen können</h2>
<p>Die Preise schwanken stark nach Region, Erfahrung und Positionierung. Diese Spannen findet man 2026 am häufigsten auf den Websites von Hochzeitsplanern und in Ratgebern:</p>
<table>
<thead><tr><th>Paket</th><th>Einsteiger</th><th>Erfahren</th></tr></thead>
<tbody>
<tr><td>Tagesbegleitung</td><td>Etwa 1.000 bis 1.500&nbsp;€</td><td>Etwa 1.500 bis 2.500&nbsp;€</td></tr>
<tr><td>Teilplanung</td><td>Etwa 1.500 bis 2.500&nbsp;€</td><td>Etwa 2.500 bis 4.000&nbsp;€ und mehr</td></tr>
<tr><td>Komplettplanung</td><td>Etwa 3.000 bis 5.000&nbsp;€</td><td>Etwa 5.000 bis 8.000&nbsp;€, im Luxussegment deutlich mehr</td></tr>
</tbody>
</table>
<p>Für Ihre eigenen Preise gehen Sie von Ihren Stunden aus. Notieren Sie bei Ihren ersten Hochzeiten die tatsächlich aufgewendete Zeit (Termine, Fahrten und E-Mails eingeschlossen), ziehen Sie Kosten, Steuern und Versicherungen ab und schauen Sie, was pro Stunde übrig bleibt. Bei einer ersten Komplettplanung liegt der echte Stundensatz oft weit unter dem, was man sich vorgestellt hat: Besser, Sie merken das früh.</p>
<p>Pauschalen sind verbreiteter als ein Prozentsatz vom Budget. Sie sind für das Paar leichter zu verstehen und schützen Sie, wenn das Budget unterwegs schrumpft. Um Ihr Angebot über die drei Pakete hinaus zu erweitern, lesen Sie <a href="/journal/services-wedding-planner">die 12 Zusatzleistungen für Hochzeitsplaner</a>.</p>

<h2>Hochzeitsplaner Tools: der Werkzeugkasten 2026 nach Einsatz</h2>
<p>Für den Start brauchen Sie keine zehn Abos. Eine Tabelle, ein geteilter Kalender und ein Rechnungsprogramm reichen für die ersten Hochzeiten. Hier die Tools, die man bei Hochzeitsplanern am häufigsten sieht, sortiert nach Einsatz, damit Sie wählen können, wenn der Bedarf da ist.</p>

<h3>Projektmanagement und Zeitplanung</h3>
<p>Jede Hochzeit ist ein Projekt über mehrere Monate mit Dutzenden Aufgaben und Fristen. Allgemeine Tools erledigen das sehr gut:</p>
<ul>
<li><strong>Trello</strong>: Boards mit Karten, schnell gelernt. Eine Spalte pro Zeitraum (12 Monate vorher, 6 Monate vorher, 1 Monat vorher), eine Karte pro Aufgabe.</li>
<li><strong>Notion</strong>: sehr flexibel, Sie können eine Datenbank pro Hochzeit anlegen (Zeitplan, Dienstleister, Budget, Gäste). Braucht etwas Einrichtungszeit.</li>
<li><strong>Asana, ClickUp, monday.com</strong>: strukturierter, nützlich, wenn Sie im Team arbeiten.</li>
<li><strong>Google Sheets oder Airtable</strong>: für alle, die in Tabellen denken. Airtable ergänzt eine Datenbank um Ansichten (Kalender, Galerie).</li>
</ul>
<p>Für das Gerüst selbst nehmen Sie unseren <a href="/journal/retroplanning-mariage">Zeitplan für die Hochzeitsplanung Monat für Monat</a> und machen daraus eine wiederverwendbare Vorlage.</p>

<h3>Software speziell für Hochzeitsplaner</h3>
<p>Es gibt Programme, die eigens für Hochzeitsplaner gebaut sind und Zeitplan, Budget, Gäste, Sitzplan und Kundenportal vereinen:</p>
<ul>
<li><strong>Aisle Planner</strong>: sehr umfassend bei den hochzeitsspezifischen Werkzeugen (Ablaufplan, Stilguides, Sitzpläne, Gäste).</li>
<li><strong>Planning Pod</strong>: ausgerichtet auf Eventplaner und Locations mit vielen Terminen.</li>
<li><strong>HoneyBook und Dubsado</strong>: vor allem Kundenverwaltung (Angebote, Verträge, Zahlungen, Automatisierungen). Zum Zeitpunkt, an dem wir das schreiben, richtet sich HoneyBook an Unternehmen in den USA, Kanada, Großbritannien und Australien.</li>
</ul>
<p>Diese Tools sind fast alle englischsprachig und für den nordamerikanischen Markt gedacht. Prüfen Sie vor einem Abo die Sprache der Oberfläche auf Seite des Paares, ob die Rechnungen den deutschen Vorgaben entsprechen und wo die Daten gespeichert werden (Stichwort DSGVO).</p>

<h3>Angebote, Rechnungen und Buchhaltung</h3>
<ul>
<li><strong>Lexware Office</strong> (früher lexoffice) und <strong>sevDesk</strong>: verbreitete deutsche Cloud-Programme für Angebote, Rechnungen und Buchhaltung, gedacht für Selbstständige und kleine Unternehmen.</li>
<li><strong>DATEV</strong>: das Programm, mit dem viele Steuerberater arbeiten. Fragen Sie Ihre Kanzlei, welche Schnittstelle sie bevorzugt.</li>
<li><strong>Yousign oder DocuSign</strong>: elektronische Signatur, praktisch für Verträge und Angebote, die aus der Ferne unterschrieben werden.</li>
</ul>
<p>Achten Sie wegen der E-Rechnung darauf, dass Ihr Programm Formate wie XRechnung oder ZUGFeRD empfangen und erstellen kann.</p>

<h3>CRM: Anfragen nachverfolgen</h3>
<p>Ein CRM (eine intelligente Kundenkartei) sorgt dafür, dass keine Anfrage verloren geht: wer Sie kontaktiert hat, wann, für welches Datum, woher der Kontakt kommt, wie weit das Gespräch ist.</p>
<ul>
<li><strong>HubSpot</strong>: Die kostenlose Version reicht für den Start völlig.</li>
<li><strong>Pipedrive</strong>: sehr übersichtlich, nach Verkaufsphasen organisiert.</li>
</ul>
<p>Am Anfang tut es eine Tabelle mit einer Zeile pro Anfrage und einer Spalte „Quelle“. Wichtig ist, bei jedem Kontakt zu notieren, woher er kommt: Daran sehen Sie, wo sich Ihre Zeit lohnt.</p>

<h3>Sitzpläne</h3>
<ul>
<li><strong>PerfectTablePlan</strong>: ein eigenes Programm, das auch große Bankette schafft.</li>
<li><strong>Canva</strong>: für die gedruckte Version des Sitzplans, mit Vorlagen.</li>
<li>Die eingebauten Module der Branchensoftware (zum Beispiel Aisle Planner).</li>
</ul>

<h3>Moodboards und Gestaltung</h3>
<ul>
<li><strong>Pinterest</strong>: die Basis, um die Wünsche des Paares zu sammeln (bitten Sie um ein geteiltes Board).</li>
<li><strong>Milanote</strong>: freie Boards, auf denen man Bilder, Notizen und Muster mischt, ideal, um ein Gestaltungskonzept vorzustellen.</li>
<li><strong>Canva</strong>: um Moodboards, Vorschläge und Papeterie zu gestalten.</li>
</ul>

<h3>Kommunikation mit Brautpaar und Gästen</h3>
<ul>
<li><strong>WhatsApp Business</strong>: Berufliches von Privatem trennen, mit Schnellantworten und Abwesenheitszeiten.</li>
<li><strong>Calendly</strong>: Das Paar bucht einen Termin, ohne zehn Nachrichten hin und her.</li>
<li><strong>Google Drive</strong>: ein geteilter Ordner pro Hochzeit (Verträge, Angebote, Ablaufplan).</li>
<li><strong>Joy (withjoy)</strong> oder die Hochzeitshomepage von <strong>Bridebook</strong>: für die Website des Paares und die Rückmeldungen der Gäste.</li>
</ul>

<h3>Fertige Gäste-Aktionen</h3>
<p>Manche Programmpunkte lassen sich wie ein Tool handhaben: in wenigen Minuten vorbereitet, ohne Techniker, und sie erweitern Ihr Angebot. Ein Beispiel ist <strong>Time to Flash</strong>, die digitale Einwegkamera auf den Handys der Gäste: ein QR-Code zum Scannen, keine App zu installieren, eine begrenzte Zahl an Fotos pro Gast und ein Album, das am nächsten Tag für alle gleichzeitig sichtbar wird. Die Druckvorlagen (Plakat, Tischaufsteller, Kärtchen) kommen fertig aus dem Dashboard, und Sie können die Fotos vor der Präsentation durchsehen. Der Preis ist eine einmalige Zahlung pro Hochzeit, zum Beispiel 34,99&nbsp;€ bis 150 Gäste.</p>
<p>Zum Vergleich mit einer gemieteten Fotobox lesen Sie <a href="/journal/prix-photobooth-mariage">was eine Fotobox für die Hochzeit kostet</a>.</p>

<h3>Der Notfallkoffer für den Hochzeitstag</h3>
<p>Das beste Werkzeug ist oft ein gut gepackter Koffer. Bei erfahrenen Planern enthält er fast immer: Schere, doppelseitiges Klebeband, Angelschnur, Stecknadeln, Nähset, Fleckenentferner, Taschentücher, Pflaster, Schmerztabletten, Ladegeräte und Powerbank, Verlängerungskabel, Feuerzeug, Klammern, Schnur, Ersatzstrumpfhose und eine Papierversion des Ablaufplans und der Kontakte (dem Handy geht irgendwann immer der Akku aus).</p>

<h2>Die Übersicht</h2>
<table>
<thead><tr><th>Einsatz</th><th>Für den Start</th><th>Wenn das Geschäft wächst</th></tr></thead>
<tbody>
<tr><td>Zeitplan und Aufgaben</td><td>Trello, Google Sheets</td><td>Notion, Asana, ClickUp, Aisle Planner</td></tr>
<tr><td>Angebote und Rechnungen</td><td>Lexware Office, sevDesk</td><td>Dazu eine Steuerkanzlei (oft mit DATEV)</td></tr>
<tr><td>Verträge</td><td>Unterschriebenes PDF</td><td>Yousign, DocuSign</td></tr>
<tr><td>Anfragen nachverfolgen</td><td>Tabelle</td><td>HubSpot, Pipedrive</td></tr>
<tr><td>Sitzplan</td><td>Canva</td><td>PerfectTablePlan, Branchensoftware</td></tr>
<tr><td>Moodboards</td><td>Pinterest</td><td>Milanote</td></tr>
<tr><td>Austausch mit dem Paar</td><td>WhatsApp Business, Google Drive</td><td>Calendly, Kundenportal einer Branchensoftware</td></tr>
<tr><td>Aktion für die Gäste</td><td>Time to Flash, gemietete Fotobox</td><td>Ein Markenzeichen in all Ihren Paketen</td></tr>
</tbody>
</table>

<h2>Typische Fehler beim Start</h2>
<ul>
<li><strong>Tools vor Kunden sammeln.</strong> Eine Branchensoftware füllt keinen Kalender. Fangen Sie einfach an.</li>
<li><strong>Die eigenen Stunden unterschätzen.</strong> Notieren Sie in der ersten Saison alles, dann passen Sie Ihre Preise an echte Zahlen an.</li>
<li><strong>Ein unklarer Umfang.</strong> „Teilplanung“ bedeutet nichts, solange die Liste der enthaltenen Dienstleister nicht schriftlich steht.</li>
<li><strong>Verträge vernachlässigen.</strong> Anzahlung, Stornierung, Verschiebung: Diese Klauseln braucht man selten, aber wenn, dann retten sie ein Jahr.</li>
<li><strong>Warten, bis alles perfekt ist.</strong> Ein Instagram-Konto mit drei echten Hochzeiten ist mehr wert als eine perfekte Website ohne ein einziges Foto.</li>
</ul>

<h2>Kurz zusammengefasst</h2>
<ul>
<li>Melden Sie ein Gewerbe an, prüfen Sie die Kleinunternehmerregelung, und sorgen Sie für Versicherung und solide Verträge.</li>
<li>Eine Ausbildung ist keine Pflicht; Assistenz ist oft die beste Schule.</li>
<li>Bauen Sie Ihr Netzwerk auf, angefangen bei den Locations.</li>
<li>Legen Sie Ihre Preise anhand Ihrer echten Stunden fest, als Pauschale.</li>
<li>Eine Tabelle, ein Rechnungsprogramm und ein Kalender reichen für den Anfang; weitere Tools kommen, wenn der Bedarf da ist.</li>
</ul>
<p>Wenn Sie einen einfachen Programmpunkt für Ihre Pakete suchen, schauen Sie in unseren Bereich für Dienstleister: <a href="/pro">Time to Flash Ihren Brautpaaren anbieten</a>.</p>
`,
    faq: [
      {
        q: 'Braucht man eine Ausbildung, um Hochzeitsplaner zu werden?',
        a: 'Nein, Hochzeitsplaner ist in Deutschland kein geschützter Beruf. Eine Weiterbildung (IHK-Zertifikatslehrgang, Fernlehrgang, Ausbildung im Eventbereich oder Assistenz bei einem etablierten Planer) hilft aber, die Methode zu lernen und ersten Kunden Sicherheit zu geben. Achten Sie bei Fernlehrgängen auf die ZFU-Zulassung.',
      },
      {
        q: 'Muss ich als Weddingplaner ein Gewerbe anmelden?',
        a: 'In aller Regel ja: Die Tätigkeit gilt als Gewerbe, Sie melden sie beim Gewerbeamt Ihrer Gemeinde an und werden damit Mitglied der IHK. Beim Finanzamt füllen Sie über ELSTER den Fragebogen zur steuerlichen Erfassung aus. Viele starten als Einzelunternehmen mit der Kleinunternehmerregelung.',
      },
      {
        q: 'Was verdient ein Hochzeitsplaner?',
        a: 'Das hängt von der Zahl der Hochzeiten pro Jahr und den verkauften Paketen ab. Als Richtwert liegt eine Tagesbegleitung bei etwa 1.000 bis 2.500 € und eine Komplettplanung bei etwa 3.000 bis 8.000 €, im Luxussegment mehr. Was am Ende bleibt, hängt von Kosten, Steuern, Versicherungen und der Zeit pro Auftrag ab.',
      },
      {
        q: 'Welche Software nutzen Hochzeitsplaner?',
        a: 'Für den Start reichen ein Projekttool (Trello, Notion), eine Tabelle und ein deutsches Rechnungsprogramm wie Lexware Office oder sevDesk. Branchenlösungen wie Aisle Planner oder Planning Pod vereinen alles, sind aber vor allem für den englischsprachigen Markt gedacht: Prüfen Sie Sprache, Rechnungsstellung und Datenspeicherung.',
      },
      {
        q: 'Betrifft die E-Rechnung auch Hochzeitsplaner?',
        a: 'Ja, beim Empfang: Seit dem 1. Januar 2025 müssen alle Unternehmen elektronische Rechnungen empfangen können, etwa von Dienstleistern. Die Pflicht zum Ausstellen gilt nur zwischen Unternehmen und wird bis Ende 2027 schrittweise eingeführt; Rechnungen an Brautpaare als Privatpersonen sind nicht betroffen, und Kleinunternehmer sind ausgenommen.',
      },
    ],
  },
  // DE : « Hochzeitsplaner Kunden gewinnen », « Weddingplaner Kunden
  // finden », « Marketing Hochzeitsplaner », « Instagram Hochzeitsplaner ».
  // Angepasst : Mariages.net/Zankyou → WeddyPlace und Bridebook (beide in
  // Deutschland aktiv, geprüft) ; Salon du Mariage de Paris → TrauDich!
  // (2026 u. a. in Berlin, Köln, München, Hannover, Mainz, geprüft) und
  // regionale Messen, meist zwischen Oktober und Februar ; RGPD → DSGVO ;
  // Google Business Profile → Google Unternehmensprofil.
  'trouver-clients-wedding-planner': {
    title: 'Hochzeitsplaner Kunden gewinnen: 8 Kanäle und ein 90-Tage-Plan',
    excerpt: 'Partner-Locations, Instagram, Google, Bewertungen, Messen, Empfehlungen: So gewinnen Sie als Hochzeitsplaner Kunden, mit einem konkreten Plan für 90 Tage.',
    caption: 'Eine Hochzeitsplanerin fotografiert mit dem Handy eine gedeckte Tafel in einer Scheune, bevor die Gäste kommen',
    body: `
<p>Als Hochzeitsplaner Kunden zu gewinnen funktioniert anders als in fast jedem anderen Dienstleistungsberuf. Eine Hochzeit ist ein seltener Kauf, voller Gefühle, oft mehr als ein Jahr im Voraus entschieden und mehrere tausend Euro schwer. Niemand bucht einen Planer, dessen Arbeit er nie gesehen und von dem er nie gehört hat.</p>
<p>Dieser Leitfaden geht die acht Kanäle durch, über die tatsächlich Brautpaare kommen, mit konkreten Schritten für jeden, und dann einen Plan für 90 Tage. Zum Schluss geht es um das, was im Termin zur Unterschrift führt: ein Argument, das das Paar woanders noch nicht gehört hat.</p>

<h2>Wie Brautpaare ihren Hochzeitsplaner finden</h2>
<p>Bevor Sie Ihre Kanäle wählen, schauen Sie sich den Weg des Paares an. Er folgt fast immer derselben Reihenfolge:</p>
<ol>
<li><strong>Datum und Location stehen fest.</strong> Die Location wird oft als Erstes gebucht und empfiehlt deshalb als Erste weitere Dienstleister.</li>
<li><strong>Das Paar sucht Inspiration</strong> auf Instagram und Pinterest und folgt den ersten Konten.</li>
<li><strong>Es tippt „Hochzeitsplaner + Stadt“</strong> bei Google ein oder stöbert in einem Hochzeitsportal.</li>
<li><strong>Es fragt herum</strong>: Freunde, die kürzlich geheiratet haben, Trauzeugen, Kollegen.</li>
<li><strong>Es prüft</strong>: Google-Bewertungen, Instagram-Konto, Website. An dieser Stelle verlieren viele Planer den Kontakt, ohne es zu merken.</li>
</ol>
<p>Daraus folgt: Sie müssen präsent sein, wenn die Location empfiehlt, wenn das Paar sucht, und vor allem, wenn es prüft.</p>

<h2>Kanal 1: Partner-Locations</h2>
<p>Der stärkste Kanal, weil die Location das Paar vor allen anderen sieht. Ein Gut mit dreißig Hochzeiten im Jahr, das Sie empfiehlt, ist eine verlässliche Quelle für Anfragen.</p>
<p><strong>So gehen Sie vor:</strong></p>
<ul>
<li>Listen Sie die Locations in Ihrer Region auf, die zu Ihrer Positionierung passen (nicht alle: die, in denen Sie arbeiten möchten).</li>
<li>Bitten Sie um eine Besichtigung und bringen Sie eine kurze Mappe mit: wer Sie sind, zwei oder drei Hochzeiten in Bildern, wie Sie mit einer Location zusammenarbeiten (Zeiten, Regeln, Material respektieren).</li>
<li>Bieten Sie der Location etwas Konkretes an: eine Hochzeit koordinieren, bei der das Paar keinen Planer hat, bei ihrem Tag der offenen Tür dabei sein, bei ihr einen Styled Shoot für ihre eigenen Kanäle organisieren.</li>
<li>Schicken Sie nach jeder Hochzeit dem Betreiber die schönsten Fotos (mit Zustimmung des Fotografen). So bleiben Sie am besten auf seiner Liste.</li>
</ul>
<p>Was Paare eine Location fragen und was eine Location deshalb von einem Planer erwartet, lesen Sie in <a href="/journal/questions-lieu-reception-mariage">den Fragen an eine Hochzeitslocation</a>.</p>

<h2>Kanal 2: das Netzwerk aus Dienstleistern</h2>
<p>Fotografen, Caterer, Floristen, DJs, Trauredner: Alle treffen Paare, die noch keinen Planer haben. Und alle arbeiten lieber mit einem Planer, der ihnen den Tag erleichtert.</p>
<ul>
<li><strong>Empfehlen Sie, bevor Sie fragen.</strong> Ein Dienstleister, dem Sie zwei Kunden geschickt haben, revanchiert sich.</li>
<li><strong>Organisieren Sie einen gemeinsamen Styled Shoot</strong>: Alle bekommen Bilder für ihre Kanäle, und Sie werden zu der Person, die zusammenbringt.</li>
<li><strong>Seien Sie der Dienstleister, mit dem man gern arbeitet</strong>: ein klares Infoblatt vorab, ein eingeplantes Essen, eingehaltene Zeiten. Fotografen und DJs reden miteinander.</li>
</ul>

<h2>Kanal 3: Hochzeitsportale und Verzeichnisse</h2>
<p>Portale wie WeddyPlace und Bridebook sowie regionale Verzeichnisse werden von vielen Paaren auf der Suche besucht. Ein Basiseintrag ist oft kostenlos, hervorgehobene Platzierungen kosten Geld.</p>
<ul>
<li><strong>Pflegen Sie den kostenlosen Eintrag</strong>, bevor Sie irgendetwas bezahlen: echte Fotos, eine genaue Beschreibung (Region, Spezialisierung, Pakete, „ab“-Preise), schnelle Antworten auf Anfragen.</li>
<li><strong>Antworten Sie schnell.</strong> Paare schreiben oft mehrere Planer gleichzeitig an: Wer zuerst mit einem Terminvorschlag antwortet, hat einen klaren Vorteil.</li>
<li><strong>Sammeln Sie Bewertungen auch auf dem Portal</strong>, nicht nur bei Google.</li>
<li><strong>Testen Sie eine bezahlte Option eine Saison lang</strong> und notieren Sie die Quelle jeder Anfrage. Dann wissen Sie, ob sie sich rechnet.</li>
</ul>

<h2>Kanal 4: Hochzeitsmessen</h2>
<p>Hochzeitsmessen finden meist zwischen Herbst und Frühjahr statt. Neben regionalen Messen tourt zum Beispiel die TrauDich! durch mehrere Großstädte, darunter Berlin, Köln, München und Hannover. Ein Stand kostet viel, an Geld und an Wochenenden: Er will vorbereitet sein.</p>
<ul>
<li><strong>Ein Stand, der zeigt statt stapelt.</strong> Eine Tafel, gedeckt wie auf einer echten Hochzeit, ein Bildschirm mit Ihren Arbeiten, eine Vorführung, die man erleben kann.</li>
<li><strong>Ein Kontaktformular</strong> mit Datum und Ort der Hochzeit und der ausdrücklichen Einwilligung, kontaktiert zu werden (das verlangt die DSGVO, die europäische Datenschutz-Grundverordnung).</li>
<li><strong>Nachfassen innerhalb von 48 Stunden</strong>, persönlich, mit Bezug auf das Gespräch am Stand.</li>
<li><strong>Besuchen Sie, bevor Sie ausstellen</strong>: Ein Tag als Besucher zeigt Ihnen, ob die Messe Ihre Kundschaft anzieht.</li>
</ul>

<h2>Kanal 5: Instagram und Pinterest</h2>
<h3>Instagram für Hochzeitsplaner</h3>
<p>Instagram ist Ihr Portfolio: Die meisten Paare schauen dort vorbei, bevor sie Ihnen schreiben. Ein paar Regeln, die viel ändern:</p>
<ul>
<li><strong>Eine Bio, die in drei Sekunden antwortet</strong>: Beruf, Region, Spezialisierung, Kontaktlink. „Hochzeitsplanerin in Hamburg, Hochzeiten im Grünen, Tagesbegleitung und Komplettplanung“.</li>
<li><strong>Story-Highlights, aufgebaut wie eine Website</strong>: Hochzeiten, Pakete, Bewertungen, hinter den Kulissen, „so arbeite ich“.</li>
<li><strong>Einblicke hinter die Kulissen, nicht nur perfekte Bilder.</strong> Der Aufbau um 8&nbsp;Uhr, der Zeitplan, die Technikbesichtigung, der Notfallkoffer: Das zeigt Paaren, wie es ist, mit Ihnen zu arbeiten.</li>
<li><strong>Kurze Videos (Reels)</strong>: ein Vorher-nachher vom Aufbau, ein Hochzeitstag in 30 Sekunden, ein Fehler, den man vermeiden sollte. Damit entdecken Sie Konten, die Ihnen noch nicht folgen.</li>
<li><strong>Markieren Sie Location und Dienstleister</strong> in jedem Beitrag und schlagen Sie ihnen einen Collab-Beitrag vor: Ihr Inhalt erscheint dann auch bei ihnen.</li>
<li><strong>Regelmäßigkeit zählt mehr als Häufigkeit.</strong> Zwei oder drei Beiträge pro Woche über ein Jahr sind mehr wert als ein Monat täglich und danach drei Monate Funkstille.</li>
</ul>
<h3>Pinterest</h3>
<p>Pinterest funktioniert wie eine visuelle Suchmaschine: Ein Pin kann monate- oder sogar jahrelang Besucher bringen, während ein Instagram-Beitrag nach wenigen Tagen verpufft. Legen Sie Boards nach Themen an (Boho-Deko, Winterhochzeit, freie Trauung) und verlinken Sie jeden Pin auf die passende Seite Ihrer Website.</p>

<h2>Kanal 6: Google Unternehmensprofil und Bewertungen</h2>
<p>Wenn Paare „Hochzeitsplaner“ und eine Stadt eingeben, zeigt Google oft eine Karte mit drei Unternehmenseinträgen vor den Websites. In diesen drei Einträgen zu stehen ist einer der rentabelsten Hebel, und er ist kostenlos.</p>
<ul>
<li><strong>Legen Sie Ihr Google Unternehmensprofil an und bestätigen Sie es</strong>, mit der passendsten Kategorie, Ihrem Einsatzgebiet und Ihren Terminzeiten.</li>
<li><strong>Laden Sie regelmäßig Fotos hoch</strong>, mit Beschreibungen, die Locations und Orte nennen.</li>
<li><strong>Bitten Sie jedes Paar um eine Bewertung</strong>, mit einem direkten Link. Ratgeber nennen oft rund zehn ausführliche Bewertungen als Schwelle, ab der ein Profil wirklich Vertrauen weckt.</li>
<li><strong>Antworten Sie auf alle Bewertungen</strong>, auch auf negative, ruhig und mit Fakten.</li>
</ul>
<p><strong>Der richtige Moment für die Bitte um eine Bewertung:</strong> wenn die Gefühle noch da sind, das Paar aber wieder durchgeatmet hat. Oft werden die zwei bis drei Wochen nach der Hochzeit genannt. Weiter unten kommen wir auf einen noch besseren Moment.</p>

<h2>Kanal 7: Ihre Website und lokales SEO</h2>
<p>Ihre Website hat zwei Aufgaben: Paare beruhigen, die prüfen, und bei Google gefunden werden.</p>
<ul>
<li><strong>Eine Seite pro Region oder Location</strong>, in der Sie oft arbeiten: „Hochzeitsplaner am Bodensee“, „Hochzeit auf Schloss X“. Mit echten Fotos und echtem Text, keine Kopie der Startseite.</li>
<li><strong>Eine Seite mit Paketen und „ab“-Preisen.</strong> Paare, die keine Preisgrößenordnung sehen, gehen oft zu dem, der eine nennt.</li>
<li><strong>Hilfreiche Artikel</strong>, die die Fragen von Paaren beantworten: Zeitplan, Budget, Tagesablauf, die schönsten Locations Ihrer Region. Solche Inhalte werden geteilt, bei Google gefunden und beweisen Ihre Erfahrung schon vor dem Termin.</li>
<li><strong>Ein kurzes Formular</strong>: Datum, Location (oder Region), Gästezahl, gewünschtes Paket, wie man auf Sie aufmerksam wurde.</li>
</ul>

<h2>Kanal 8: Mundpropaganda und Empfehlungen</h2>
<p>Trauzeugen und Gäste einer gelungenen Hochzeit sind Ihre künftigen Kunden oder kennen sie. Diesen Kanal kann man anstoßen:</p>
<ul>
<li><strong>Seien Sie am Hochzeitstag erkennbar</strong>: eine Visitenkarte an der Garderobe, Ihr Name im Programmheft, eine Erwähnung durch den DJ, wenn er die Dienstleister vorstellt.</li>
<li><strong>Bleiben Sie mit dem Paar in Kontakt</strong>: eine Nachricht, wenn die Gästefotos sichtbar werden, eine Karte zum ersten Hochzeitstag.</li>
<li><strong>Bedanken Sie sich für Empfehlungen</strong>: ein paar Zeilen, ein Geschenk, eine Geste für Paare, die Ihnen ein anderes Paar schicken.</li>
</ul>

<h2>Der erste Termin: ein Ablauf in fünf Schritten</h2>
<p>Alle Kanäle oben führen an denselben Ort: einen Termin, per Video oder bei einem Kaffee. Dort entscheidet sich alles, und viele Planer gehen ohne Plan hinein.</p>
<ol>
<li><strong>Zuerst zuhören.</strong> Lassen Sie das Paar von seiner Traumhochzeit erzählen, von Sorgen und von dem, was schon gebucht ist. Machen Sie Notizen, fragen Sie so viel nach den Gästen wie nach der Deko.</li>
<li><strong>Zusammenfassen.</strong> „Wenn ich es zusammenfasse: eine Hochzeit auf dem Land, 120 Gäste, viele Kinder, und Ihre größte Sorge ist die Logistik der Anfahrt.“ Das Paar fühlt sich verstanden, und Sie prüfen, ob Sie richtig zugehört haben.</li>
<li><strong>Ihre Methode zeigen</strong>, mit echten Unterlagen: ein Zeitplan, ein Ablaufplan, ein Dienstleister-Infoblatt einer früheren Hochzeit (anonymisiert).</li>
<li><strong>Etwas erleben lassen</strong>: ein Gegenstand, eine Vorführung, etwas, das das Paar bei anderen nicht gesehen hat (dazu gleich mehr).</li>
<li><strong>Die nächsten Schritte festlegen</strong>: ein Datum für das Angebot, ein Termin für den Rückruf. Ein Gespräch, das mit „wir hören voneinander“ endet, wird selten zum Vertrag.</li>
</ol>

<h2>Das Argument, das im Termin überzeugt</h2>
<p>Beim ersten Termin hat das Paar oft schon zwei oder drei Planer gesehen. Alle haben über Budget, Zeitplan und verlässliche Dienstleister gesprochen. Den Unterschied macht etwas, das es nirgendwo sonst gesehen hat und sofort ausprobieren kann.</p>
<p>Ein paar Beispiele: ein gedrucktes Ablaufheft einer echten Hochzeit, ein Tischmodell, ein Erlebnis für die Gäste. Zum Beispiel die digitale Einwegkamera auf den Handys der Gäste: Sie reichen einen QR-Code, das Paar scannt ihn, und sein Handy wird zur Einwegkamera mit wenigen gezählten Aufnahmen, ohne etwas zu installieren. In dreißig Sekunden stellt es sich vor, wie seine Gäste das auf der Hochzeit machen. Genau das bietet <a href="/appareil-jetable-mariage">Time to Flash</a>, und das Argument ergänzt den Fotografen, statt ihm Konkurrenz zu machen.</p>
<p>Diese Aktion hat für Sie noch einen weniger sichtbaren Vorteil: <strong>Das Album der Gäste wird am nächsten Tag präsentiert</strong> (oder zu dem Zeitpunkt, den Sie bestimmen). Ein idealer Anlass, sich beim Paar wieder zu melden:</p>
<ul>
<li>Am Morgen der Präsentation eine kurze Nachricht: „Die Fotos Ihrer Gäste sind jetzt sichtbar, schauen Sie rein!“</li>
<li>Das Paar sieht seinen Abend durch die Augen der Gäste, oft sehr bewegt.</li>
<li>Ein paar Tage später, wenn es alles angeschaut hat, schicken Sie den Link für eine Bewertung. Die Hochzeit ist noch frisch, und das Paar hat einen Grund, Ihnen zu danken.</li>
</ul>
<p>Das ist der Unterschied zwischen einem Dienstleister, der am Sonntagmorgen verschwunden ist, und einem Planer, der das Paar bis zum Schluss begleitet. Mehr zu diesem Moment lesen Sie in <a href="/journal/revelation-photos-lendemain-mariage">der Präsentation der Fotos am nächsten Tag</a>, und für weitere Leistungen, mit denen Sie sich abheben, in <a href="/journal/services-wedding-planner">den 12 Zusatzleistungen für Hochzeitsplaner</a>.</p>

<h2>Der Plan für 90 Tage</h2>
<p>Hier ein realistischer Plan für einen Planer, der startet oder sein Geschäft neu ankurbeln will, mit ein paar Stunden pro Woche.</p>
<table>
<thead><tr><th>Zeitraum</th><th>Maßnahmen</th><th>Erwartetes Ergebnis</th></tr></thead>
<tbody>
<tr><td><strong>Woche 1 und 2</strong></td><td>Spezialisierung und Region festlegen. Google Unternehmensprofil anlegen oder überarbeiten. Instagram-Bio und Story-Highlights neu schreiben. Eine einseitige Vorstellungsmappe vorbereiten.</td><td>Eine Grundlage, die beim Prüfen überzeugt</td></tr>
<tr><td><strong>Woche 3 und 4</strong></td><td>15 Locations und 15 Dienstleister als Ziel auflisten. Alle bisherigen Paare um eine Bewertung bitten. Eine Seite mit Paketen und „ab“-Preisen veröffentlichen.</td><td>Erste Bewertungen, fertige Akquiseliste</td></tr>
<tr><td><strong>Monat 2</strong></td><td>2 oder 3 Locations pro Woche besuchen. Einen Styled Shoot mit Partnern organisieren. 2 oder 3 Beiträge pro Woche auf Instagram, davon mindestens ein kurzes Video. Kostenlose Einträge in ein oder zwei Portalen anlegen.</td><td>Erste Partnerschaften, neue Inhalte</td></tr>
<tr><td><strong>Monat 3</strong></td><td>Den Styled Shoot mit allen Partnern markiert veröffentlichen. Zwei hilfreiche Artikel auf Ihrer Website schreiben (Tagesablauf, Locations Ihrer Region). Bei den besuchten Locations mit Fotos nachfassen. Ihre Vorführung für den Termin vorbereiten.</td><td>Erste Anfragen über Partner und Google</td></tr>
</tbody>
</table>
<p>Notieren Sie in diesen 90 Tagen bei jeder Anfrage die Quelle. Nach drei Monaten wissen Sie, welche Kanäle Ihre Zeit verdienen und welche Sie aufgeben.</p>

<h2>Die Kennzahlen, die Sie verfolgen sollten</h2>
<ul>
<li><strong>Die Zahl der Anfragen pro Monat</strong> und ihre Quelle.</li>
<li><strong>Die Terminquote</strong>: wie viele Anfragen zu einem Termin werden. Ist sie niedrig, arbeiten Sie an Antwortzeit und Antwortstil.</li>
<li><strong>Die Abschlussquote</strong>: wie viele Termine zu einem Vertrag werden. Ist sie niedrig, arbeiten Sie an Ihrem Argument im Termin und an den angezeigten Preisen.</li>
<li><strong>Die Zahl der Bewertungen</strong> und wie frisch sie sind: Eine aktuelle Bewertung beruhigt mehr als eine von vor drei Jahren.</li>
</ul>

<h2>Fehler, die Kunden kosten</h2>
<ul>
<li><strong>Nach drei Tagen antworten.</strong> Dann hat das Paar oft schon einen Termin woanders.</li>
<li><strong>Überall ein bisschen sein.</strong> Lieber zwei gut gepflegte Kanäle als sechs verwaiste.</li>
<li><strong>Fotos ohne Zusammenhang.</strong> Nennen Sie Location, Jahreszeit, Gästezahl und was Sie gemacht haben: So kann sich das Paar besser hineinversetzen.</li>
<li><strong>Frühere Paare vergessen.</strong> Sie sind Ihre besten Verkäufer, wenn Sie ihnen einen Grund geben, über Sie zu sprechen.</li>
</ul>

<h2>Kurz zusammengefasst</h2>
<ul>
<li>Partner-Locations und Dienstleister sind Ihr erster Kanal: besuchen, empfehlen, Fotos teilen.</li>
<li>Instagram und Google zählen vor allem, wenn das Paar prüft: Pflegen Sie Bio, Profil und Bewertungen.</li>
<li>Ein Plan über 90 Tage und die Quelle jeder Anfrage notiert, dann wissen Sie, wo sich Ihre Zeit lohnt.</li>
<li>Zeigen Sie im Termin ein Erlebnis, das das Paar woanders nicht gesehen hat, und sorgen Sie für einen Anlass, sich nach der Hochzeit wieder zu melden.</li>
</ul>
<p>Wenn Sie die Vorführung der Einwegkamera als Argument im Termin anspricht, schauen Sie in unseren Bereich für Dienstleister: <a href="/pro">Time to Flash Ihren Brautpaaren anbieten</a>. Und um Ihr Geschäft aufzustellen, lesen Sie auch <a href="/journal/devenir-wedding-planner-outils">Hochzeitsplaner werden: Gründung, Ausbildung und Tools</a>.</p>
`,
    faq: [
      {
        q: 'Wie finde ich als Hochzeitsplaner meine ersten Kunden?',
        a: 'Bauen Sie zuerst ein Portfolio auf (Styled Shoot mit Partnern, Hochzeiten im Freundeskreis wie echte Aufträge behandelt) und sprechen Sie dann die Locations Ihrer Region an. Ein gepflegtes Google Unternehmensprofil und ein paar ausführliche Bewertungen beruhigen Paare, die Sie gerade entdecken.',
      },
      {
        q: 'Ist Instagram für Hochzeitsplaner unverzichtbar?',
        a: 'Es ist das Standard-Portfolio geworden: Die meisten Paare schauen sich das Instagram-Konto eines Planers an, bevor sie Kontakt aufnehmen. Eine klare Bio, geordnete Story-Highlights und regelmäßige Einblicke hinter die Kulissen zählen mehr als viele Follower.',
      },
      {
        q: 'Lohnt sich ein Stand auf einer Hochzeitsmesse?',
        a: 'Eine Messe kann viele Kontakte bringen, aber ein Stand kostet viel Geld und Zeit. Besuchen Sie die Messe zuerst als Gast, bereiten Sie einen Stand vor, der Ihre Arbeit zeigt, und fassen Sie bei jedem Kontakt innerhalb von 48 Stunden nach, mit seiner Einwilligung.',
      },
      {
        q: 'Wann sollte ich das Brautpaar um eine Bewertung bitten?',
        a: 'Wenn die Gefühle noch frisch sind, das Paar aber wieder durchgeatmet hat, oft in den zwei bis drei Wochen nach der Hochzeit. Die Präsentation der Gästefotos am nächsten Tag oder ein paar Tage später ist ebenfalls ein sehr guter Anlass, sich wieder zu melden.',
      },
      {
        q: 'Wie lange dauert es, bis Anfragen kommen?',
        a: 'Paare buchen oft 12 bis 18 Monate vor ihrem Termin, die Arbeit einer Saison füllt also vor allem die nächste. Mit einem konsequent verfolgten 90-Tage-Plan sehen Sie in der Regel die ersten Anfragen über Partner und Google und wissen, welche Kanäle Sie behalten.',
      },
    ],
  },
  // DE : « Tagesablauf Hochzeit », « Ablaufplan Hochzeit », « Hochzeit Ablauf »,
  // « Zeitplan Hochzeitstag Vorlage ». Google.de (10/10/2026) : Bridebook
  // (Hochzeitsprogramm, Sektempfang 30 bis 60 Min nach der Trauung), Vorlagen
  // bei Jotform, ClickUp, Gumroad ; kaum vollständige Tabellen mit Uhrzeiten.
  // Angepasst an deutsche Gewohnheiten : Trauung an der Location (freie Trauung
  // oder Außentrauort des Standesamts), Gratulationen und Sektempfang, Kaffee
  // und Kuchen mit Hochzeitstorte, Abendessen ab 19 Uhr, Eröffnungstanz nach
  // dem Essen, Mitternachtssnack, Brautstraußwurf, Katerfrühstück. Varianten :
  // Standesamt am Vormittag, Standesamt am Vortag, kirchliche Trauung (Kirchen
  // setzen in der Regel die standesamtliche Trauung voraus), Winter. Anrede Sie.
  'deroule-jour-j-mariage': {
    title: 'Tagesablauf Hochzeit: der Ablaufplan Stunde für Stunde',
    excerpt: 'Ein Tagesablauf für die Hochzeit von 9 Uhr bis in die Nacht, mit Varianten (Standesamt, Kirche, Winter), Puffern und dem Infoblatt für die Dienstleister.',
    caption: 'Ein Ablaufplan für den Hochzeitstag, mit Klebeband an eine Küchentür geklebt, im Blitzlicht während einer Hochzeit',
    body: `
<p>Ein guter Tagesablauf für die Hochzeit sorgt dafür, dass Sie Ihren Tag erleben, statt ihn zu managen. Er ist eine Tabelle Stunde für Stunde, die alle Dienstleister kennen, und sagt, wer was wo und wann macht, vom Make-up am Morgen bis zum letzten Taxi.</p>
<p>Hier finden Sie eine vollständige Vorlage von 9&nbsp;Uhr bis in die Nacht für eine typische Hochzeit in Deutschland: Trauung, Sektempfang, Kaffee und Kuchen, Abendessen, Eröffnungstanz und Party. Danach die Varianten (Standesamt am Vormittag, kirchliche Trauung, Winterhochzeit, Brunch am nächsten Tag), die Puffer, die Sie einplanen sollten, wer den Ablauf in der Hand hält, und das Infoblatt für die Dienstleister. Die Vorlage eignet sich auch für Hochzeitsplaner, die ein Gerüst zum Anpassen suchen.</p>

<h2>Der Ablaufplan für die Hochzeit: Wo fangen Sie an?</h2>
<p>Ein Ablaufplan entsteht rückwärts, von drei festen Punkten aus:</p>
<ul>
<li><strong>Die Uhrzeit der Trauung.</strong> Beim Standesamt legt meist das Amt die verfügbaren Termine fest, oft mit wenigen Samstagsterminen. Das ist der am wenigsten verhandelbare Punkt des Tages.</li>
<li><strong>Der Sonnenuntergang</strong>, wenn Sie Paarfotos im schönsten Licht möchten. Im Juni geht die Sonne in Deutschland je nach Region zwischen etwa 21:15 Uhr im Süden und 22 Uhr im Norden unter, Anfang Oktober gegen 19 Uhr.</li>
<li><strong>Das Ende, das die Location vorgibt</strong> (und der Vertrag mit dem DJ). Viele Locations erlauben Musik draußen nur bis 22 Uhr und haben eine feste Endzeit für drinnen.</li>
</ul>
<p>Zwischen diese Punkte setzen Sie die wichtigen Momente, dann ergänzen Sie Fahrten und Puffer. Diese Arbeit beginnt einige Wochen vor der Hochzeit und gehört zu den letzten Schritten <a href="/journal/retroplanning-mariage">Ihrer Hochzeitsplanung</a>.</p>

<h2>Die Vorlage: Tagesablauf der Hochzeit Stunde für Stunde</h2>
<p>Annahme: eine Hochzeit an einem Samstag im Juni, 100 Gäste, Trauung um 14&nbsp;Uhr direkt an der Location (eine freie Trauung oder die standesamtliche Trauung, wenn die Location ein Außentrauort des Standesamts ist), danach Sektempfang, Kaffee und Kuchen, Abendessen und Party am selben Ort.</p>
<table>
<thead><tr><th>Uhrzeit</th><th>Was passiert</th><th>Wer ist beteiligt</th></tr></thead>
<tbody>
<tr><td><strong>9:00</strong></td><td>Frühstück, Beginn von Frisur und Make-up (zuerst Trauzeugen und Familie, das Brautpaar zuletzt)</td><td>Brautpaar, Trauzeugen, Friseurin, Visagistin</td></tr>
<tr><td><strong>9:30</strong></td><td>Hochzeitsplaner oder Koordinatorin trifft an der Location ein, empfängt Floristik und Deko</td><td>Koordination, Floristik, Location</td></tr>
<tr><td><strong>10:30</strong></td><td>Brautstrauß und Anstecker werden an beide Getting-Ready-Orte geliefert</td><td>Floristik, Trauzeugen</td></tr>
<tr><td><strong>11:00</strong></td><td>Fotograf kommt zum Getting Ready (Details, Kleid, Ringe, Stimmung)</td><td>Fotograf</td></tr>
<tr><td><strong>12:00</strong></td><td>Leichtes Mittagessen für alle beim Getting Ready (niemand sollte mit leerem Magen zur Trauung)</td><td>Brautpaar, Familie</td></tr>
<tr><td><strong>12:30</strong></td><td>Das Brautpaar zieht sich an</td><td>Brautpaar, Trauzeugen, Fotograf</td></tr>
<tr><td><strong>13:00</strong></td><td>First Look und erste Paarfotos, wenn Sie möchten</td><td>Brautpaar, Fotograf</td></tr>
<tr><td><strong>13:30</strong></td><td>Ankunft der Gäste, Wasser und Erfrischungen zur Begrüßung</td><td>Gäste, Trauzeugen, Service</td></tr>
<tr><td><strong>13:50</strong></td><td>Gäste nehmen Platz, Programmhefte, Musik zum Ankommen</td><td>Gäste, Koordination, Musiker</td></tr>
<tr><td><strong>14:00</strong></td><td>Trauung (standesamtlich oft 20 bis 30 Minuten, freie Trauung meist 30 bis 45 Minuten)</td><td>Brautpaar, Standesbeamtin oder Trauredner, Mitwirkende</td></tr>
<tr><td><strong>14:45</strong></td><td>Auszug, Spalier, Konfetti oder Seifenblasen, ein Gruppenfoto mit allen Gästen</td><td>Alle, Fotograf</td></tr>
<tr><td><strong>15:00</strong></td><td>Sektempfang und Gratulationen (bei 100 Gästen dauert allein das Gratulieren gut eine halbe Stunde)</td><td>Alle, Service</td></tr>
<tr><td><strong>15:15</strong></td><td>Die QR-Code-Plakate der Fotoaktion stehen (Bar, Stehtische, Eingang), DJ oder Trauzeugen sagen sie an</td><td>Koordination, DJ oder Trauzeugen</td></tr>
<tr><td><strong>15:45</strong></td><td>Gruppenfotos (Familie, Freunde, Kollegen), Liste vorher vorbereitet</td><td>Fotograf, ein Trauzeuge, der die Gruppen aufruft</td></tr>
<tr><td><strong>16:15</strong></td><td>Kaffee und Kuchen, Anschneiden der Hochzeitstorte</td><td>Alle, Konditorei, Service</td></tr>
<tr><td><strong>17:15</strong></td><td>Paarshooting (30 bis 45 Minuten)</td><td>Brautpaar, Fotograf</td></tr>
<tr><td><strong>18:00</strong></td><td>Zeit für die Gäste: Rasenspiele, Getränke, Kinderprogramm</td><td>Alle</td></tr>
<tr><td><strong>18:45</strong></td><td>Die Gäste gehen in den Saal und suchen ihren Platz</td><td>Gäste, Koordination, Service</td></tr>
<tr><td><strong>19:00</strong></td><td>Einzug des Brautpaars, kurze Begrüßung</td><td>Brautpaar, DJ</td></tr>
<tr><td><strong>19:15</strong></td><td>Vorspeise</td><td>Catering</td></tr>
<tr><td><strong>19:45</strong></td><td>Erste Reden (Trauzeugen, Eltern), zwischen zwei Gängen</td><td>Trauzeugen, Eltern, DJ</td></tr>
<tr><td><strong>20:15</strong></td><td>Hauptgang oder Eröffnung des Buffets</td><td>Catering</td></tr>
<tr><td><strong>21:15</strong></td><td>Eine Viertelstunde Paarfotos draußen im Abendlicht</td><td>Brautpaar, Fotograf</td></tr>
<tr><td><strong>21:30</strong></td><td>Dessert, danach ein oder zwei Programmpunkte der Trauzeugen (kurz halten)</td><td>Catering, Trauzeugen</td></tr>
<tr><td><strong>22:15</strong></td><td>Eröffnungstanz</td><td>Brautpaar, DJ</td></tr>
<tr><td><strong>22:30</strong></td><td>Party. Der Fotograf geht oft kurz nach dem Eröffnungstanz: Ab hier übernehmen die Fotos der Gäste</td><td>Alle</td></tr>
<tr><td><strong>23:30</strong></td><td>Brautstraußwurf</td><td>Brautpaar, DJ</td></tr>
<tr><td><strong>0:00</strong></td><td>Mitternachtssnack (Currywurst, Gulaschsuppe, Brezeln)</td><td>Catering</td></tr>
<tr><td><strong>2:00</strong></td><td>Letzte Lieder, je nach vereinbarter Endzeit</td><td>DJ</td></tr>
<tr><td><strong>2:30</strong></td><td>Taxis und Shuttles, die Location schließt</td><td>Gäste, Location, Fahrer</td></tr>
<tr><td><strong>Am nächsten Tag</strong></td><td>Katerfrühstück oder Brunch (zum Beispiel von 11 bis 14 Uhr) und Präsentation des Fotoalbums der Gäste</td><td>Brautpaar, enge Gäste</td></tr>
</tbody>
</table>
<p>Diese Tabelle ist eine Grundlage. Die genauen Zeiten hängen von Standesamt, Entfernungen und Catering ab: Fragen Sie Ihren Caterer nach der echten Servierzeit für sein Menü, sie ist oft der Grund, warum ein Abend aus dem Takt gerät. Die Torte wird übrigens nicht überall zum Kaffee angeschnitten; manche Paare heben sie für den Abend auf, direkt nach dem Dessert oder zu Mitternacht.</p>

<h2>Drei Momente, die Sie nicht verpassen sollten</h2>
<h3>Die Ansage der Fotoaktion beim Sektempfang</h3>
<p>Der Sektempfang ist der beste Moment, um eine Fotoaktion zu starten: Die Gäste haben die Hände frei, sie warten auf das Brautpaar, und das Licht ist noch schön. Wenn Sie mit einem QR-Code arbeiten (geteilte Galerie oder digitale Einwegkamera wie <a href="/appareil-jetable-mariage">Time to Flash</a>), müssen die Plakate stehen, wenn die Gäste aus der Trauung kommen, und jemand muss die Aktion in der ersten Viertelstunde ansagen. Ohne Ansage wird ein Plakat allein selten gescannt. Wo Sie es am besten platzieren, lesen Sie in <a href="/journal/ou-poser-le-qr-code">wo der QR-Code hingehört</a>, und ein Plakat erstellen Sie kostenlos mit unserem <a href="/generateur-qr-code-mariage">QR-Code-Plakatgenerator</a>.</p>

<h3>Die Gruppenfotos</h3>
<p>Dieser Programmpunkt läuft am häufigsten über. Bereiten Sie eine kurze Liste vor (höchstens zehn Gruppen) und geben Sie sie dem Fotografen und einem Trauzeugen, der beide Familien kennt und die Gruppen aufruft. Die Details stehen in <a href="/journal/photos-de-groupe-mariage">so gelingen die Gruppenfotos</a>.</p>

<h3>Die Präsentation des Albums am nächsten Tag</h3>
<p>Wenn die Fotos Ihrer Gäste bis zum nächsten Tag verborgen bleiben, wird ihre Präsentation zu einem zweiten Höhepunkt, am besten beim Brunch oder am späten Vormittag. Alle sehen den Abend gleichzeitig durch die Augen der anderen, und Sie bestimmen den Zeitpunkt. Mehr dazu in <a href="/journal/revelation-photos-lendemain-mariage">der Präsentation der Fotos am nächsten Tag</a>.</p>

<h2>Die Varianten des Ablaufs</h2>
<h3>Standesamt am Vormittag, Feier am selben Tag</h3>
<p>Ein Klassiker in Deutschland: Trauung im Standesamt gegen 11 Uhr, Sektempfang direkt davor (oft mit Kollegen, Nachbarn und Freunden, die nur dazu kommen), dann Fahrt zur Location. Kaffee und Kuchen gegen 15 Uhr, Abendessen ab 18:30 Uhr, danach wie in der Vorlage. Planen Sie zwischen Standesamt und Location genug Zeit ein, damit das Brautpaar kurz durchatmen und Paarfotos machen kann.</p>

<h3>Standesamt am Vortag</h3>
<p>Immer mehr Paare heiraten freitags standesamtlich im kleinen Kreis und behalten den Samstag für die freie Trauung und das Fest. Der Samstag kann dann später beginnen: Getting Ready ab 11 Uhr, freie Trauung um 15 oder 16 Uhr, und der Rest entsprechend verschoben (Kaffee und Kuchen wird dann oft kürzer oder fällt zugunsten eines längeren Sektempfangs weg).</p>

<h3>Kirchliche Trauung</h3>
<p>Die großen Kirchen trauen in der Regel nur Paare, die bereits standesamtlich verheiratet sind. Den Termin legen Sie mit dem Pfarramt fest, oft viele Monate im Voraus. Ein evangelischer Traugottesdienst dauert meist 45 bis 60 Minuten, eine katholische Trauung mit Messe länger. Rechnen Sie die Fahrt von der Kirche zur Location ein, mit Autokorso und Parken.</p>

<h3>Winterhochzeit</h3>
<p>Im Dezember geht die Sonne gegen 16:30 Uhr unter. Ziehen Sie alles vor, was Licht braucht: Paarfotos vor der Trauung (mit einem First Look am Vormittag), Gruppenfotos direkt nach der Trauung, notfalls drinnen. Der Sektempfang findet im Warmen statt, oft kürzer, Kaffee und Kuchen wird gemütlich, und das Abendessen kann früher beginnen, gegen 18 Uhr. Denken Sie an eine Garderobe und Decken für die Wege.</p>

<h3>Der Brunch am nächsten Tag</h3>
<p>Ein großzügiges Zeitfenster (zum Beispiel 11 bis 14 Uhr) lässt alle in ihrem Tempo ankommen. Sorgen Sie für ein, zwei ruhige Tische für die Müdesten, Platz für die Kinder und einen Moment für die Präsentation der Gästefotos: Alle sind da, das Handy in der Hand, um sie gemeinsam anzuschauen.</p>

<h2>Am Vorabend und am Morgen: Was fertig sein muss</h2>
<p>Ein Ablauf, der am Hochzeitstag hält, wird am Vorabend vorbereitet. Prüfen Sie vor dem Schlafengehen diese Punkte:</p>
<ul>
<li><strong>Die Deko ist aufgebaut</strong> oder zumindest an der Location, mit einer Person, die sich am Morgen um den Aufbau kümmert.</li>
<li><strong>Die Probe der freien Trauung</strong> ist mit allen Mitwirkenden gemacht: wer wann einzieht, wer was liest, wer wo steht.</li>
<li><strong>Die Ringe</strong> sind einem Trauzeugen anvertraut, nicht in der Tasche des Brautpaars.</li>
<li><strong>Die Umschläge für Dienstleister</strong>, die am Hochzeitstag bezahlt werden, sind vorbereitet und mit einer Liste der Koordination übergeben.</li>
<li><strong>Plakate und Aufsteller</strong> (Sitzplan, QR-Code der Fotoaktion, Beschilderung) liegen in einer beschrifteten Kiste.</li>
<li><strong>Ein Notfallset</strong>: Stecknadeln, Nähset, Taschentücher, Pflaster, Schmerztabletten, Ladegerät, Fleckenentferner.</li>
<li><strong>Der Ablaufplan ist ausgedruckt</strong>, mehrfach: Koordination, Trauzeugen, Catering, DJ.</li>
</ul>

<h2>Kinder im Tagesablauf</h2>
<p>Mit vielen Kindern braucht die Vorlage ein paar Anpassungen. Lassen Sie ihr Essen früher servieren (gegen 18:30 Uhr, während die Erwachsenen noch draußen sind), planen Sie ab 21 Uhr eine Kinderbetreuung oder eine ruhige Ecke mit Kissen und Film ein, und sagen Sie den Eltern, ab wann die Kleinsten schlafen gehen können, wenn die Location Zimmer hat. Kinder sind übrigens hervorragende Fotografen: Bei einer Fotoaktion per QR-Code machen sie mit dem Handy eines Elternteils mit wie die Großen.</p>

<h2>Der Plan B bei Regen</h2>
<p>Ein Plan B wird nicht am Morgen improvisiert. Schreiben Sie in den Ablauf: den Ausweichort für die freie Trauung und den Sektempfang, wer entscheidet, und bis wann (oft am Vorabend oder morgens gegen 10 Uhr, damit Location und Catering umplanen können). Denken Sie auch an Regenschirme für den Auszug und die Gruppenfotos: Ein durchsichtiger Schirm ergibt sehr schöne Regenfotos.</p>

<h2>Die Puffer, die Sie einplanen sollten</h2>
<p>Ein Ablauf ohne Puffer gerät spätestens nach der Trauung aus dem Takt. Diese Momente dauern fast immer länger als geplant:</p>
<table>
<thead><tr><th>Moment</th><th>Geplante Dauer</th><th>Empfohlener Puffer</th></tr></thead>
<tbody>
<tr><td>Frisur und Make-up</td><td>45 Min pro Person</td><td>+ 30 Min insgesamt</td></tr>
<tr><td>Fahrten zwischen zwei Orten</td><td>Zeit laut Navi</td><td>+ 15 Min (Autokorso, Parken)</td></tr>
<tr><td>Gratulationen nach der Trauung</td><td>30 Min bei 100 Gästen</td><td>+ 15 Min (alle wollen umarmen)</td></tr>
<tr><td>Gruppenfotos</td><td>30 Min</td><td>+ 15 Min</td></tr>
<tr><td>Wechsel vom Sektempfang in den Saal</td><td>15 Min</td><td>+ 15 Min</td></tr>
<tr><td>Reden</td><td>3 bis 5 Min pro Rede</td><td>Lieber die Zahl begrenzen als die Länge</td></tr>
<tr><td>Servieren eines Gangs</td><td>Je nach Catering</td><td>Nach der echten Zeit fragen</td></tr>
</tbody>
</table>
<p>Ein Tipp: Legen Sie nicht alle Puffer ans Ende. Setzen Sie nach jedem riskanten Moment einen kleinen, damit sich eine Verspätung nicht über den ganzen Abend zieht.</p>

<h2>Wer den Ablauf in der Hand hält</h2>
<p><strong>Nicht Sie.</strong> Am Hochzeitstag sollten Sie nicht auf die Uhr schauen. Drei Möglichkeiten:</p>
<ul>
<li><strong>Ein Hochzeitsplaner oder eine Tagesbegleitung</strong>: Das ist ihr Beruf, sie kennen die Dienstleister und sehen Verspätungen kommen.</li>
<li><strong>Ein Trauzeuge oder eine gut organisierte Person aus dem Umfeld</strong>, die einen Teil des Tages ein Auge auf die Uhr hat. Wählen Sie jemanden ohne andere große Aufgabe (Rede, Lesung, Programmpunkt).</li>
<li><strong>DJ und Bankettleitung der Location</strong> für den Abend: Sie geben dem Essen und den Reden den Takt vor. Sie müssen denselben Ablaufplan haben wie alle anderen.</li>
</ul>
<p>In jedem Fall trifft eine einzige Person die Entscheidungen, wenn etwas schiefgeht (Regen, Verspätung, ein Gang, der auf sich warten lässt). Die Dienstleister müssen wissen, wer das ist.</p>

<h2>Das Infoblatt für die Dienstleister</h2>
<p>Der komplette Ablaufplan ist für die Person, die koordiniert. Jeder Dienstleister braucht ein einseitiges Infoblatt mit dem, was ihn betrifft. Schicken Sie es zwei Wochen vor der Hochzeit und bestätigen Sie es in der Hochzeitswoche per Nachricht.</p>
<p><strong>Was auf das Infoblatt gehört:</strong></p>
<ul>
<li>Die genauen Adressen (Getting Ready, Standesamt oder Kirche, Location) und Zufahrten (Parkplatz, Lieferanteneingang, Torcode).</li>
<li>Der Kontakt der koordinierenden Person und ein Notfallkontakt.</li>
<li>Ankunft, Aufbau und Abbau dieses Dienstleisters.</li>
<li>Die wichtigen Momente, die ihn betreffen (Einzug des Brautpaars, Reden, Eröffnungstanz, Torte).</li>
<li>Der Plan B bei Regen.</li>
<li>Das Essen für ihn und wann er es bekommt.</li>
<li>Für den Fotografen: die Liste der Gruppenfotos und der wichtigen Personen, die nicht fehlen dürfen.</li>
<li>Für den DJ: die Musik der wichtigen Momente, die Liste der Reden und die Ansagen (darunter die Fotoaktion beim Sektempfang).</li>
</ul>
<p>Für Ihre Gäste reicht eine noch kürzere Version: Uhrzeiten und Adressen, auf der Hochzeitshomepage oder in einer Nachricht. Den Text dafür haben wir in <a href="/journal/brief-invites">der Gäste-Info</a> vorbereitet.</p>

<h2>Die klassischen Fehler</h2>
<ul>
<li><strong>Zu viele Reden und Spiele.</strong> Ab vier oder fünf Reden schaltet der Saal ab, und lange Hochzeitsspiele bremsen den Abend. Verteilen Sie die Reden zwischen den Gängen und halten Sie die Spiele kurz.</li>
<li><strong>Das Essen vergessen.</strong> Das Brautpaar wird oft das ganze Abendessen über angesprochen. Bitten Sie das Catering, Sie zuerst zu bedienen, und schützen Sie diesen Moment.</li>
<li><strong>Ein Sektempfang ohne Sie.</strong> Wenn Gruppen- und Paarfotos den ganzen Sektempfang füllen, sehen Sie Ihre Gäste nicht. Begrenzen Sie sie.</li>
<li><strong>Kein Plan B bei Regen.</strong> Er gehört in den Ablaufplan, mit der Uhrzeit, bis zu der entschieden wird.</li>
<li><strong>Ein Ablauf, den nur das Brautpaar kennt.</strong> Wenn er nicht mit jedem Dienstleister geteilt wird, nützt er nichts.</li>
</ul>

<h2>Kurz zusammengefasst</h2>
<ul>
<li>Gehen Sie von den festen Punkten aus (Trauung, Sonnenuntergang, Endzeit) und planen Sie rückwärts.</li>
<li>Setzen Sie nach jedem riskanten Moment einen Puffer.</li>
<li>Geben Sie den Ablauf jemand anderem in die Hand und schicken Sie jedem Dienstleister zwei Wochen vorher ein einseitiges Infoblatt.</li>
<li>Planen Sie die Ansage der Fotoaktion beim Sektempfang ein und die Präsentation des Albums am nächsten Tag.</li>
</ul>
<p>Für die Fotoaktion können Sie <a href="/create">Ihr Time to Flash Album erstellen</a> (kostenlos bis 5 Gäste, für einen Test mit Ihren Trauzeugen). Und wenn Sie Hochzeitsplaner sind und diese Aktion Ihren Brautpaaren anbieten möchten, finden Sie alles im <a href="/pro">Bereich für Dienstleister</a>.</p>
`,
    faq: [
      {
        q: 'Wie erstelle ich den Tagesablauf für unsere Hochzeit?',
        a: 'Gehen Sie von den festen Punkten aus: der Uhrzeit der Trauung, dem Sonnenuntergang, wenn Sie Paarfotos im schönsten Licht möchten, und der Endzeit der Location. Setzen Sie dann die wichtigen Momente (Sektempfang, Kaffee und Kuchen, Abendessen, Eröffnungstanz), ergänzen Sie die Fahrten und planen Sie nach jedem riskanten Moment einen Puffer ein.',
      },
      {
        q: 'Wie lange dauert ein Sektempfang nach der Trauung?',
        a: 'Meist zwischen 30 Minuten und einer Stunde, mit Gratulationen und Gruppenfotos auch länger. Bei 100 Gästen braucht allein das Gratulieren gut eine halbe Stunde. Folgt direkt Kaffee und Kuchen, darf der Sektempfang kürzer sein.',
      },
      {
        q: 'Wann ist der Eröffnungstanz?',
        a: 'In Deutschland meist nach dem Abendessen, oft zwischen 21:30 und 22:30 Uhr, und er eröffnet die Party. Manche Paare tanzen direkt nach ihrem Einzug in den Saal. Wichtig ist, dass DJ und Fotograf die Uhrzeit kennen.',
      },
      {
        q: 'Wer sollte am Hochzeitstag den Ablauf in der Hand halten?',
        a: 'Ein Hochzeitsplaner oder eine Tagesbegleitung, sonst ein gut organisierter Trauzeuge ohne andere große Aufgabe. Das Brautpaar sollte nicht auf die Uhr schauen müssen, und die Dienstleister sollten wissen, wer bei Unvorhergesehenem entscheidet.',
      },
      {
        q: 'Wann schicke ich den Ablaufplan an die Dienstleister?',
        a: 'Etwa zwei Wochen vor der Hochzeit, als einseitiges Infoblatt pro Dienstleister mit Adressen, Kontakten, seinen Zeiten und den Momenten, die ihn betreffen. In der Hochzeitswoche bestätigen Sie es noch einmal per Nachricht.',
      },
      {
        q: 'Wann kündige ich die Fotoaktion für die Gäste an?',
        a: 'Zu Beginn des Sektempfangs, in der ersten Viertelstunde: Die Gäste haben die Hände frei und warten auf das Brautpaar. Die QR-Code-Plakate sollten stehen, wenn die Gäste aus der Trauung kommen, und DJ oder Trauzeugen sagen die Aktion am Mikrofon an.',
      },
    ],
  },
}
