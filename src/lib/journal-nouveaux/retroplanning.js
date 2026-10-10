// ============================================================
//  Journal : articles « retroplanning » (10/10/2026).
//  POSTS : articles français (même forme que ALL_POSTS dans journal.js).
//  POSTS_EN / POSTS_DE : traductions, une entrée par slug
//  (title, excerpt, caption, body, faq), comme journal-en.js.
// ============================================================

export const POSTS = [
  {
    // Requêtes visées : « rétroplanning mariage », « retroplanning mariage »,
    // « planning mariage », « checklist mariage », « liste des choses à faire
    // pour un mariage », « organiser son mariage étape par étape », « que faire
    // 6 mois avant le mariage ».
    // Vu dans Google (10/10/2026) : ABC Salles (rétroplanning mois par mois sur
    // 12 mois, sans délais par prestataire), Mariages.net (guide en 14 étapes +
    // FAQ : mariage en 6 mois, qui paie, imprévus, remerciements), diocèse de
    // Paris (rétroplanning religieux : paroisse à J-12 mois), Bridebook et
    // marriage.com (checklists génériques), C&A et modèles Excel/PDF. Aucune
    // page ne réunit 18 mois + lendemain + mois d’après + planning express +
    // délais par prestataire + mairie vérifiée + qui fait quoi. Questions
    // fréquentes : quand commencer, que faire à 6 mois, quand déposer le
    // dossier en mairie, quand envoyer les faire-part, mariage en 3 mois,
    // quels prestataires réserver en premier.
    // Règles mairie vérifiées sur service-public.gouv.fr (fiche F930, mise à
    // jour le 16/09/2026) ; témoins : article 75 du Code civil (2 à 4) ;
    // impôts : impots.gouv.fr (signalement sous 60 jours).
    slug: 'retroplanning-mariage',
    cat: 'Organisation',
    title: 'Rétroplanning mariage : la checklist complète de J-18 mois à J+1',
    excerpt: 'Toutes les tâches à cocher de 18 mois avant au lendemain, les délais par prestataire, la mairie, le budget, et un planning express en 6 ou 3 mois.',
    author: 'Léa Ferrand',
    date: '2026-10-10',
    read: '25 min',
    caption: 'Un couple penché sur un carnet de préparatifs de mariage, sur une table de cuisine le soir',
    body: `
<p>Un <strong>rétroplanning de mariage</strong>, c’est ton calendrier à l’envers : tu pars de la date du jour J et tu remontes le temps pour savoir quoi faire, et surtout quand le faire. Voici le nôtre, le plus complet qu’on ait pu écrire. Il va de 18 mois avant jusqu’au mois qui suit la fête, et pour chaque étape tu trouves la liste des tâches à cocher, la raison pour laquelle elles tombent à ce moment-là, et le piège dans lequel tombent la plupart des couples.</p>
<p>Tu as moins de temps devant toi ? Va directement au <a href="#express-6-mois">planning express en 6 mois</a> ou à la <a href="#express-3-mois">version en 3 mois</a>. Tu cherches juste un délai ? Le <a href="#delais-prestataires">tableau des délais par prestataire</a> et les <a href="#mairie">démarches à la mairie</a> sont plus bas.</p>

<p><strong>Au sommaire</strong></p>
<ol>
  <li><a href="#combien-de-temps">Combien de temps faut-il pour organiser un mariage ?</a></li>
  <li><a href="#m-18">De 18 à 12 mois avant : les fondations</a></li>
  <li><a href="#m-12">De 12 à 9 mois avant : les prestataires rares</a></li>
  <li><a href="#m-9">De 9 à 6 mois avant : le deuxième cercle</a></li>
  <li><a href="#m-6">De 6 à 4 mois avant : les faire-part et le menu</a></li>
  <li><a href="#m-4">De 4 à 2 mois avant : la mairie et les détails</a></li>
  <li><a href="#m-2">De 2 à 1 mois avant : l’assemblage</a></li>
  <li><a href="#s-3">3 semaines avant</a></li>
  <li><a href="#s-2">2 semaines avant</a></li>
  <li><a href="#semaine-j">La semaine du mariage</a></li>
  <li><a href="#veille">La veille</a></li>
  <li><a href="#jour-j">Le jour J</a></li>
  <li><a href="#lendemain">Le lendemain</a></li>
  <li><a href="#mois-apres">Le mois d’après</a></li>
  <li><a href="#express-6-mois">Organiser son mariage en 6 mois</a></li>
  <li><a href="#express-3-mois">Organiser son mariage en 3 mois</a></li>
  <li><a href="#delais-prestataires">Les délais de réservation par prestataire</a></li>
  <li><a href="#mairie">Mairie : dossier, publication des bans et délais</a></li>
  <li><a href="#budget">La répartition du budget par poste</a></li>
  <li><a href="#qui-fait-quoi">Qui fait quoi : mariés, témoins, familles, wedding planner</a></li>
  <li><a href="#photos">Les photos dans le rétroplanning</a></li>
  <li><a href="#resume">Le rétroplanning en une phrase par période</a></li>
</ol>

<h2 id="combien-de-temps">Combien de temps faut-il pour organiser un mariage ?</h2>
<p>La réponse honnête : <strong>12 à 18 mois</strong> si tu veux choisir tes prestataires plutôt que de prendre ceux qui restent. Mais on peut faire beaucoup plus court, à condition d’accepter quelques compromis.</p>
<table>
<thead><tr><th>Temps devant toi</th><th>Ce que ça donne</th></tr></thead>
<tbody>
<tr><td><strong>18 mois et plus</strong></td><td>Le choix total : lieu très demandé, samedi de juin, photographe coup de cœur.</td></tr>
<tr><td><strong>12 mois</strong></td><td>Le rythme le plus courant. Confortable si tu restes un peu souple sur la date.</td></tr>
<tr><td><strong>6 à 9 mois</strong></td><td>Faisable sans drame, surtout hors saison ou un vendredi. Il faut décider vite.</td></tr>
<tr><td><strong>3 mois</strong></td><td>Possible pour un mariage simple ou de taille raisonnable, avec un lieu « tout compris ».</td></tr>
</tbody>
</table>
<p>Quatre choses font varier ce délai bien plus que ta motivation : <strong>la saison</strong> (les samedis de mai à septembre partent les premiers), <strong>le nombre d’invités</strong> (moins il y a de lieux capables de t’accueillir, plus il faut s’y prendre tôt), <strong>le type de lieu</strong> (un domaine clé en main simplifie tout) et <strong>ta souplesse sur la date</strong>.</p>

<h3>Les quatre décisions à prendre avant tout le reste</h3>
<p>Chaque prestataire que tu contacteras te posera les mêmes questions : quelle date, combien de personnes, quel budget, quel genre de fête. Réponds-y avant de visiter quoi que ce soit.</p>
<ul>
  <li><strong>Le budget total</strong>, et qui y participe (vous deux, vos familles). Un chiffre plafond, pas une intention.</li>
  <li><strong>Le nombre d’invités</strong>, en fourchette : « entre 80 et 110 » suffit pour commencer.</li>
  <li><strong>La saison</strong>, et deux ou trois dates possibles. Une seule date, c’est se priver de la moitié des lieux.</li>
  <li><strong>Le format</strong> : mairie seule, mairie et cérémonie religieuse, cérémonie laïque, fête sur une journée ou sur un week-end avec brunch.</li>
</ul>

<h3>Construire ton propre rétroplanning</h3>
<p>La checklist ci-dessous est un modèle. Pour la suivre, rien ne vaut un tableur partagé entre vous deux (Google Sheets ou équivalent), avec ces colonnes :</p>
<table>
<thead><tr><th>Tâche</th><th>Échéance</th><th>Qui</th><th>Statut</th><th>Montant</th><th>Acompte versé</th><th>Solde dû le</th></tr></thead>
<tbody>
<tr><td>Réserver le photographe</td><td>J-12 mois</td><td>Camille</td><td>Fait</td><td>1 800 €</td><td>540 €</td><td>J-15 jours</td></tr>
<tr><td>Envoyer les faire-part</td><td>J-5 mois</td><td>Hugo</td><td>À faire</td><td>320 €</td><td>-</td><td>-</td></tr>
</tbody>
</table>
<p>Deux règles qui changent tout : <strong>chaque tâche a un seul responsable</strong> (« on s’en occupe » veut dire « personne »), et vous faites un point fixe de trente minutes par semaine, toujours le même jour. Ajoute un onglet pour les invités et un pour le budget, et tu as tout au même endroit.</p>

<h2 id="m-18">Rétroplanning mariage de 18 à 12 mois avant : les fondations</h2>
<p>C’est la période des grandes décisions. Peu de tâches, mais chacune conditionne toutes les autres.</p>
<h3>À cocher</h3>
<ul>
  <li>Annoncer vos fiançailles à vos proches (avant les réseaux sociaux, ils apprécieront).</li>
  <li>Fixer le budget total et les participations éventuelles des familles.</li>
  <li>Écrire une première liste d’invités, en fourchette.</li>
  <li>Choisir la saison et deux ou trois dates possibles. Vérifie les ponts, les vacances scolaires, et les dates impossibles pour les proches indispensables (un accouchement prévu, un autre mariage, des examens).</li>
  <li>Décider du format : civil seul, religieux, laïque, un jour ou un week-end.</li>
  <li>Décider si vous faites appel à un wedding planner, et pour quelle formule (organisation complète ou simple coordination du jour J).</li>
  <li>Visiter trois à cinq lieux de réception, puis réserver le vôtre (contrat signé, acompte versé).</li>
  <li>Vérifier que la mairie peut célébrer le mariage à cette date et à une heure compatible avec le lieu.</li>
  <li>Pour un mariage religieux, prendre contact avec la paroisse ou la communauté.</li>
  <li>Réserver le traiteur s’il n’est pas imposé par le lieu.</li>
  <li>Pour un samedi de mai à septembre, réserver dès maintenant le photographe et le vidéaste.</li>
  <li>Te renseigner sur une assurance annulation mariage, et lire ses exclusions avant de signer.</li>
  <li>Ouvrir le tableur de suivi.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> le lieu fixe la date, la capacité d’accueil, souvent le traiteur et une grosse part du budget. Tout le reste en découle. Les lieux les plus demandés partent un à deux ans à l’avance pour les samedis d’été.</p>
<p><strong>Le piège à éviter :</strong> réserver le lieu avant de connaître son nombre d’invités. Un lieu de 80 places quand la liste grimpe à 120, c’est la première crise du mariage. Le second piège, c’est de signer sans lire les conditions : heure de fin, limiteur de son, traiteur imposé, droit de bouchon, hébergement, ménage, caution. On a listé <a href="/journal/questions-lieu-reception-mariage">les questions à poser au lieu de réception</a> avant de signer.</p>

<h2 id="m-12">De 12 à 9 mois avant : les prestataires rares</h2>
<p>Le lieu est réservé, la date est fixée. Place aux prestataires qui ne font qu’un mariage par jour.</p>
<h3>À cocher</h3>
<ul>
  <li>Choisir et réserver le photographe si ce n’est pas fait : rencontre-le, et demande à voir la galerie complète d’un mariage entier.</li>
  <li>Réserver le vidéaste, si vous en voulez un.</li>
  <li>Réserver le DJ ou le groupe de musique.</li>
  <li>Réserver l’officiant de cérémonie laïque, si vous en prévoyez une.</li>
  <li>Choisir vos témoins (et vos demoiselles ou garçons d’honneur), et le leur demander de vive voix.</li>
  <li>Envoyer le save the date, surtout si une partie des invités vient de loin ou si vous vous mariez en haute saison.</li>
  <li>Créer le site du mariage : date, lieu, hébergements, plan d’accès.</li>
  <li>Poser une option sur des hébergements pour les invités si le lieu est isolé (chambres, gîtes, hôtel voisin).</li>
  <li>Commencer les essayages de robe si elle est faite sur commande.</li>
  <li>Définir l’ambiance du mariage : couleurs, style, quelques images de référence.</li>
  <li>En haute saison, réserver aussi le fleuriste.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> photographe, vidéaste, DJ et officiant ne peuvent faire qu’une prestation par jour. Les samedis partent dans l’ordre d’arrivée des demandes, et les meilleurs sont souvent complets un an à l’avance.</p>
<p><strong>Le piège à éviter :</strong> choisir son photographe sur ses dix plus belles photos Instagram. Demande un reportage complet, de la préparation à la soirée, et vérifie l’heure de fin incluse dans la formule : beaucoup s’arrêtent avant la vraie soirée. Pour savoir combien y consacrer, regarde notre guide du <a href="/journal/budget-photo-mariage">budget photo de mariage</a>.</p>

<h2 id="m-9">De 9 à 6 mois avant : le deuxième cercle</h2>
<p>Les incontournables sont réservés. Tu passes aux prestataires plus nombreux, mais qui se remplissent eux aussi en saison.</p>
<h3>À cocher</h3>
<ul>
  <li>Commander la robe si elle est faite sur commande (les délais de fabrication se comptent souvent en mois).</li>
  <li>Commencer à regarder le costume ou la tenue du second marié.</li>
  <li>Réserver le fleuriste si ce n’est pas fait.</li>
  <li>Réserver coiffure et maquillage (l’essai viendra plus tard).</li>
  <li>Réserver la location de matériel : mobilier, vaisselle, éclairage, tente si une partie se passe dehors.</li>
  <li>Prévoir les transports : voiture des mariés, navette pour les invités si le lieu est éloigné ou si l’on boit.</li>
  <li>Ouvrir la liste de mariage ou la cagnotte.</li>
  <li>Réserver le voyage de noces, et vérifier la validité des passeports.</li>
  <li>Écrire un plan B météo pour tout ce qui est prévu en extérieur (vin d’honneur, cérémonie laïque).</li>
  <li>Choisir le modèle des faire-part.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> fleuristes, maquilleuses et loueurs ont plus de disponibilités que les photographes, mais pas en juin. Côté voyage, les prix montent à mesure que la date approche.</p>
<p><strong>Le piège à éviter :</strong> réserver les billets d’avion du voyage de noces à ton futur nom d’usage. Le nom sur le billet doit être celui du passeport que tu présenteras à l’embarquement, et il y a de fortes chances que ce soit ton nom actuel.</p>

<h2 id="m-6">De 6 à 4 mois avant : les faire-part et le menu</h2>
<p>C’est la réponse à la question « que faire 6 mois avant le mariage ? » : prévenir officiellement tout le monde, et choisir ce que vous allez servir.</p>
<h3>À cocher</h3>
<ul>
  <li>Envoyer les faire-part, avec une date limite de réponse fixée 6 à 8 semaines avant le mariage.</li>
  <li>Faire la dégustation chez le traiteur, choisir le menu, et recenser les régimes particuliers (végétariens, allergies, menus enfants).</li>
  <li>Commander ou louer le costume.</li>
  <li>Choisir les alliances (la gravure et la mise à taille prennent plusieurs semaines).</li>
  <li>Demander le dossier de mariage à la mairie et sa date limite de dépôt.</li>
  <li>Prendre rendez-vous chez le notaire si vous faites un contrat de mariage.</li>
  <li>Prévenir vos employeurs : le Code du travail prévoit 4 jours de congé pour son mariage, à poser autour de la date.</li>
  <li>Commander le gâteau ou la pièce montée.</li>
  <li>Rencontrer l’officiant laïque et commencer à construire la cérémonie.</li>
  <li>Écrire une première version du déroulé de la journée.</li>
  <li>Réfléchir à ce que feront les invités entre deux temps forts : jeux, livre d’or, animation photo (on a rassemblé <a href="/journal/idees-animation-mariage">des idées d’animation de mariage</a>).</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> un faire-part ne part que quand toutes les infos pratiques sont figées (lieux, horaires, hébergements). Et le traiteur a besoin de temps pour ajuster son menu après la dégustation.</p>
<p><strong>Le piège à éviter :</strong> oublier la date limite de réponse. Sans elle, les confirmations arrivent jusqu’à la veille, et ton traiteur, lui, veut un chiffre ferme bien avant.</p>

<h2 id="m-4">De 4 à 2 mois avant : la mairie et les détails</h2>
<p>Les grandes réservations sont faites. On entre dans les démarches et dans les détails qui font la personnalité du mariage.</p>
<h3>À cocher</h3>
<ul>
  <li>Déposer le dossier de mariage à la mairie, dans les délais qu’elle t’a donnés (le détail est <a href="#mairie">plus bas</a>).</li>
  <li>Relancer les invités qui n’ont pas répondu.</li>
  <li>Commencer le plan de table.</li>
  <li>Faire l’essai coiffure et maquillage.</li>
  <li>Premier essayage de la robe avec la couturière, retouches.</li>
  <li>Choisir la musique des moments clés : entrée de la cérémonie, sortie, ouverture du bal. Prépare aussi la liste des morceaux à ne jamais passer.</li>
  <li>Écrire vos vœux, si la cérémonie en prévoit.</li>
  <li>Préparer la papeterie du jour : menus, marque-places, plan de table, panneaux.</li>
  <li>Laisser les témoins organiser l’EVJF ou l’EVG, en leur donnant tes limites.</li>
  <li>Acheter les accessoires (chaussures, voile, bijoux) et commencer à porter les chaussures à la maison.</li>
  <li>Caler un rendez-vous de préparation avec le photographe un mois avant.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> la mairie a besoin d’un dossier complet pour publier les bans, et certaines pièces ont une durée de validité courte. Trop tôt, elles expirent ; trop tard, tu cours.</p>
<p><strong>Le piège à éviter :</strong> commander ta copie d’acte de naissance six mois avant. Elle doit dater de moins de trois mois au moment du dépôt (moins de six mois si elle vient de l’étranger), elle ne sera donc plus valable.</p>

<h2 id="m-2">De 2 à 1 mois avant : l’assemblage</h2>
<p>Tout est réservé. Le travail consiste maintenant à faire que chaque prestataire ait la même version de la journée.</p>
<h3>À cocher</h3>
<ul>
  <li>Donner le nombre définitif de convives au traiteur, à la date prévue dans le contrat.</li>
  <li>Faire le rendez-vous de préparation avec le photographe : déroulé, lieux des photos de couple, personnes à ne pas rater. Prépare ta <a href="/journal/shot-list-mariage">shot list de mariage</a> et la liste des <a href="/journal/photos-de-groupe-mariage">photos de groupe</a>.</li>
  <li>Mettre en place l’animation photo des invités et imprimer ses supports (voir <a href="#photos">les photos dans le rétroplanning</a>).</li>
  <li>Finaliser le plan de table.</li>
  <li>Écrire le déroulé heure par heure et l’envoyer à tous les prestataires (notre modèle de <a href="/journal/deroule-jour-j-mariage">déroulé du jour J</a> te fait gagner du temps).</li>
  <li>Désigner un référent pour le jour J : un proche organisé (ou le wedding planner) qui répond aux prestataires à votre place.</li>
  <li>Passer l’audition à la mairie si elle vous convoque.</li>
  <li>Caler les discours : qui parle, à quel moment, combien de temps.</li>
  <li>Établir le calendrier des derniers paiements (soldes, pourboires).</li>
  <li>Prévoir les cadeaux des invités et ceux des témoins (quelques idées de <a href="/cadeau-mariage-temoins">cadeaux pour les témoins</a>).</li>
  <li>Monter le kit de secours (voir <a href="#semaine-j">la semaine du mariage</a>).</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> les prestataires ont besoin d’informations précises un mois avant pour s’organiser. Et le traiteur fixe sa commande à partir de ton chiffre.</p>
<p><strong>Le piège à éviter :</strong> garder le déroulé dans ta tête. Si chaque prestataire a une heure différente pour le vin d’honneur, il y aura un trou de quarante minutes. Une seule version, envoyée à tout le monde.</p>

<h2 id="s-3">3 semaines avant</h2>
<h3>À cocher</h3>
<ul>
  <li>Dernier essayage de la robe et du costume, avec les chaussures et les sous-vêtements du jour.</li>
  <li>Confirmer chaque prestataire par écrit : heure d’arrivée, adresse exacte, contact sur place, besoins en électricité.</li>
  <li>Prévoir avec le traiteur le repas des prestataires qui restent toute la soirée (photographe, vidéaste, DJ).</li>
  <li>Imprimer la papeterie du jour.</li>
  <li>Valider la playlist avec le DJ.</li>
  <li>Faire la liste de qui apporte quoi (décoration, matériel, rallonges).</li>
  <li>Rassembler les pièces d’identité demandées par la mairie pour le jour même.</li>
  <li>Prendre rendez-vous chez le coiffeur pour la coupe ou la couleur, deux à trois semaines avant, jamais la veille.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> c’est le dernier moment où une retouche, une impression ratée ou un prestataire mal informé se rattrapent sans panique.</p>
<p><strong>Le piège à éviter :</strong> tester un nouveau soin du visage ou une nouvelle couleur maintenant. Une réaction de peau se voit sur toutes les photos.</p>

<h2 id="s-2">2 semaines avant</h2>
<h3>À cocher</h3>
<ul>
  <li>Envoyer le déroulé final à tous les prestataires et au référent du jour J.</li>
  <li>Briefer les témoins sur leurs rôles : alliances, discours, urne, annonce de l’animation photo au micro.</li>
  <li>Préparer les enveloppes de solde et de pourboires, étiquetées par prestataire.</li>
  <li>Imprimer le plan de table définitif.</li>
  <li>Confirmer navettes et hébergements.</li>
  <li>Regarder les tendances météo et confirmer le plan B avec le lieu.</li>
  <li>Emballer les cadeaux des invités.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> à deux semaines, plus rien ne doit changer. Ce qui reste, c’est de transmettre.</p>
<p><strong>Le piège à éviter :</strong> vouloir tout régler toi-même. Chaque tâche que tu confies maintenant, c’est une minute de plus avec tes invités le jour J.</p>

<h2 id="semaine-j">La semaine du mariage</h2>
<h3>À cocher</h3>
<ul>
  <li>Récupérer la robe et le costume.</li>
  <li>Déposer la décoration au lieu, si le lieu le permet.</li>
  <li>Dernier point téléphonique avec le traiteur (nombre final, régimes) et avec le lieu (horaires d’accès).</li>
  <li>Préparer un sac par moment de la journée : mairie (pièces d’identité, alliances), cérémonie, soirée, nuit.</li>
  <li>Boucler le kit de secours : aiguille et fil, épingles, pansements, antidouleurs, mouchoirs, déodorant, chargeur, ruban adhésif double face, ballerines de rechange.</li>
  <li>Préparer la valise du voyage de noces.</li>
  <li>Confier à un proche la responsabilité de l’urne et des cadeaux.</li>
  <li>Dormir, manger, marcher. Sérieusement.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> tout ce qui est prêt avant le jeudi te laisse un vendredi tranquille.</p>
<p><strong>Le piège à éviter :</strong> te lancer dans un nouveau projet fait maison la dernière semaine. Les 150 étiquettes calligraphiées à la main, c’était pour le mois dernier.</p>

<h2 id="veille">La veille</h2>
<h3>À cocher</h3>
<ul>
  <li>Installer la décoration, ou briefer l’équipe qui s’en charge.</li>
  <li>Poser les QR codes de l’animation photo, ou confier la mission à quelqu’un (on a testé <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a> pour qu’il soit scanné).</li>
  <li>Répéter la cérémonie laïque ou religieuse avec l’officiant, les témoins et les enfants d’honneur.</li>
  <li>Remettre les alliances au témoin qui les gardera.</li>
  <li>Charger les téléphones et une batterie externe.</li>
  <li>Réunir la tenue complète et tous les accessoires dans une même pièce.</li>
  <li>Dîner léger, se coucher tôt.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> la répétition dissipe le stress de la cérémonie, et l’installation de la veille évite de passer le matin du mariage à monter des tables.</p>
<p><strong>Le piège à éviter :</strong> la soirée d’accueil des invités qui finit à deux heures du matin. Tu as un mariage demain.</p>

<h2 id="jour-j">Le jour J</h2>
<p>Le minutage complet, heure par heure, est dans notre article sur le <a href="/journal/deroule-jour-j-mariage">déroulé du jour J</a>. Ici, la liste de ce qui ne doit pas t’échapper.</p>
<h3>À cocher</h3>
<ul>
  <li>Prendre un vrai petit-déjeuner.</li>
  <li>Emporter les pièces d’identité pour la mairie.</li>
  <li>Confier ton téléphone au référent : c’est lui que les prestataires appellent.</li>
  <li>Prendre dix minutes seuls tous les deux, quelque part dans la journée.</li>
  <li>Faire annoncer l’animation photo au micro par un témoin ou le DJ.</li>
  <li>Manger pendant le repas, même si tout le monde vient te parler.</li>
  <li>Laisser le référent remettre les soldes et les pourboires en fin de soirée.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> parce que c’est le jour où tu n’es plus organisateur. Tout ce qui précède sert à ça.</p>
<p><strong>Le piège à éviter :</strong> un planning sans marge. Ajoute quinze minutes à chaque transition : les photos de groupe, les trajets et les embrassades prennent toujours plus longtemps que prévu.</p>

<h2 id="lendemain">Le lendemain</h2>
<h3>À cocher</h3>
<ul>
  <li>Le brunch, si vous en avez prévu un.</li>
  <li>Ranger, rendre le matériel loué, faire l’état des lieux et récupérer la caution.</li>
  <li>Récupérer la décoration, les cadeaux et l’urne.</li>
  <li>Découvrir les photos de vos invités avec eux : c’est le moment idéal pour une <a href="/journal/revelation-photos-lendemain-mariage">révélation des photos le lendemain du mariage</a>.</li>
  <li>Envoyer un premier message de remerciement à tous les invités.</li>
  <li>Mettre la robe et le costume de côté pour le pressing.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> la plupart des lieux exigent d’être rendus le lendemain. Et c’est le jour où tout le monde a encore envie de revivre la fête.</p>
<p><strong>Le piège à éviter :</strong> ne rien prévoir pour le rangement. Désigne une équipe avant le mariage, sinon ce sera vous deux, seuls, avec trois cents verres.</p>

<h2 id="mois-apres">Le mois d’après</h2>
<p>Le mariage est passé, mais la checklist n’est pas tout à fait finie.</p>
<h3>À cocher</h3>
<ul>
  <li><strong>Les remerciements :</strong> envoyer les cartes dans le mois ou les deux mois qui suivent, idéalement avec une photo du mariage.</li>
  <li><strong>Les prestataires :</strong> régler les derniers soldes, et laisser un avis à ceux qui l’ont mérité (sur Google ou les plateformes de mariage). C’est ce qui les fait vivre.</li>
  <li><strong>Les photos :</strong> le photographe livre en général entre quelques semaines et quelques mois, selon son contrat (on détaille les <a href="/journal/delai-livraison-photos-mariage">délais de livraison des photos de mariage</a>). Sauvegarde tout à deux endroits différents, puis commande tes tirages ou ton livre photo.</li>
  <li><strong>La robe :</strong> la déposer vite dans un pressing habitué aux robes de mariée (les taches de vin et d’herbe se fixent avec le temps), puis la ranger dans une housse en tissu, ou la revendre tant que le modèle est récent.</li>
  <li><strong>Le livret de famille :</strong> il vous est remis à la fin de la cérémonie en mairie. Range-le avec vos papiers importants.</li>
  <li><strong>Le nom d’usage :</strong> le mariage ne change pas ton nom automatiquement. Tu peux utiliser le nom de ton époux ou ton épouse, ou les deux accolés dans l’ordre de ton choix. C’est facultatif, et tes papiers actuels restent valables. Si tu choisis de l’utiliser, mets à jour ta carte d’identité ou ton passeport, puis préviens tes organismes (Sécurité sociale, banque, employeur, mutuelle).</li>
  <li><strong>Les impôts :</strong> signale ton mariage sur impots.gouv.fr dans les 60 jours, depuis le service de gestion du prélèvement à la source. L’année du mariage, vous faites en principe une déclaration commune, avec la possibilité d’opter pour des déclarations séparées.</li>
</ul>
<p><strong>Pourquoi maintenant :</strong> plus les remerciements tardent, plus ils sont difficiles à écrire. Et un avis rédigé à chaud est bien plus utile aux futurs mariés.</p>
<p><strong>Le piège à éviter :</strong> laisser les photos des invités dispersées sur cinquante téléphones. Si personne ne les rassemble dans la semaine, elles disparaissent dans les pellicules de chacun.</p>

<h2 id="express-6-mois">Organiser son mariage en 6 mois : le planning express</h2>
<p>Six mois suffisent pour un beau mariage, à condition de prendre les décisions dans le bon ordre et vite. Le principe : tout ce qui se fait normalement entre 18 et 6 mois tient dans les six premières semaines.</p>
<h3>Mois 1 (J-6 mois) : verrouiller l’essentiel</h3>
<ul>
  <li>Budget, fourchette d’invités, format : décidés en un week-end.</li>
  <li>Lieu réservé dans les quinze jours. Sois souple : un vendredi, un dimanche ou un mois de mars ouvrent beaucoup de portes, souvent à des tarifs plus doux.</li>
  <li>Privilégie un lieu qui inclut traiteur, mobilier et vaisselle : trois réservations en une.</li>
  <li>Mairie contactée tout de suite pour la date.</li>
  <li>Photographe réservé dans la foulée (c’est le prestataire le plus difficile à trouver en dernière minute).</li>
  <li>Save the date envoyé par message dès que le lieu est signé.</li>
</ul>
<h3>Mois 2 (J-5 mois) : les autres prestataires</h3>
<ul>
  <li>DJ, officiant laïque, fleuriste, coiffure et maquillage.</li>
  <li>Robe : vise le prêt-à-porter ou les créatrices qui ont du stock. Le sur-mesure est souvent trop long.</li>
  <li>Faire-part envoyés (version numérique acceptée).</li>
  <li>Témoins choisis et prévenus.</li>
</ul>
<h3>Mois 3 (J-4 mois) : menu et tenues</h3>
<ul>
  <li>Dégustation, menu, costume, alliances.</li>
  <li>Notaire si contrat de mariage.</li>
  <li>Voyage de noces réservé (ou reporté à plus tard, c’est très bien aussi).</li>
</ul>
<h3>Mois 4 à 6 : on rejoint le planning classique</h3>
<p>À partir de J-3 mois, tu suis le rétroplanning normal : <a href="#m-4">dossier de mairie</a>, plan de table, <a href="#m-2">assemblage</a>, puis les dernières semaines.</p>
<p><strong>Le piège à éviter :</strong> chercher le prestataire parfait. En planning express, un très bon prestataire disponible vaut mieux qu’un prestataire idéal complet. Fixe-toi une règle : trois devis maximum par poste, décision sous 48 heures.</p>

<h2 id="express-3-mois">Organiser son mariage en 3 mois</h2>
<p>Trois mois, c’est serré mais faisable, à une condition : simplifier le format. Moins d’invités, un seul lieu pour la cérémonie et la réception, un repas plus simple (cocktail dînatoire, buffet, food trucks).</p>
<h3>Semaines 1 et 2</h3>
<ul>
  <li>Budget, liste d’invités courte, format simplifié.</li>
  <li>Mairie : appelle tout de suite. Le dossier, l’audition et la publication des bans prennent plusieurs semaines, et certaines mairies affichent complet longtemps à l’avance le samedi.</li>
  <li>Lieu tout compris réservé.</li>
  <li>Photographe réservé : vise les dates en semaine, les fins de saison, ou les photographes qui proposent des demi-journées.</li>
  <li>Invitations par message ou faire-part numérique, avec réponse sous quinze jours.</li>
</ul>
<h3>Semaines 3 à 6</h3>
<ul>
  <li>Dossier de mariage déposé.</li>
  <li>Tenues en prêt-à-porter ou en location, retouches lancées immédiatement.</li>
  <li>Musique : DJ disponible ou playlist bien préparée et une bonne enceinte.</li>
  <li>Fleurs : un fleuriste pour le bouquet et quelques centres de table, pas plus.</li>
  <li>Alliances (évite les gravures longues).</li>
</ul>
<h3>Semaines 7 à 12</h3>
<ul>
  <li>Plan de table, déroulé, référent du jour J.</li>
  <li>Animation photo des invités : elle se met en place en quelques minutes, c’est le genre de chose qu’on peut faire tard.</li>
  <li>Puis la checklist classique à partir de <a href="#s-3">3 semaines avant</a>.</li>
</ul>
<p><strong>Le piège à éviter :</strong> vouloir un mariage de 150 personnes en trois mois. Le délai se gère ; la taille, beaucoup moins.</p>

<h2 id="delais-prestataires">Les délais de réservation par prestataire</h2>
<p>Voici les délais à viser pour un mariage un samedi de haute saison (mai à septembre). Hors saison ou en semaine, tu peux souvent les raccourcir. Ce sont des fourchettes prudentes, tirées des recommandations des professionnels et des guides de mariage : la seule vraie réponse est celle du prestataire que tu as repéré, alors demande tôt.</p>
<table>
<thead><tr><th>Prestataire</th><th>Délai conseillé</th><th>À savoir</th></tr></thead>
<tbody>
<tr><td><strong>Lieu de réception</strong></td><td>12 à 18 mois</td><td>Jusqu’à deux ans pour les lieux très demandés le samedi en été.</td></tr>
<tr><td><strong>Wedding planner</strong></td><td>12 à 18 mois</td><td>Pour une organisation complète. Une coordination du jour J se réserve plutôt 3 à 6 mois avant.</td></tr>
<tr><td><strong>Traiteur</strong></td><td>10 à 14 mois</td><td>Souvent imposé ou recommandé par le lieu : vérifie-le avant de chercher.</td></tr>
<tr><td><strong>Photographe</strong></td><td>10 à 14 mois</td><td>Un seul mariage par jour : les plus demandés partent plus tôt encore.</td></tr>
<tr><td><strong>Vidéaste</strong></td><td>9 à 12 mois</td><td>Même logique que le photographe.</td></tr>
<tr><td><strong>DJ ou groupe</strong></td><td>8 à 12 mois</td><td>Un groupe de musiciens se réserve plutôt vers 12 mois.</td></tr>
<tr><td><strong>Officiant laïque</strong></td><td>6 à 12 mois</td><td>Prévois plusieurs rendez-vous de préparation avant le jour J.</td></tr>
<tr><td><strong>Robe de mariée sur commande</strong></td><td>Commande 8 à 10 mois avant</td><td>Prêt-à-porter : 3 à 4 mois suffisent, retouches comprises.</td></tr>
<tr><td><strong>Costume</strong></td><td>4 à 6 mois (sur mesure)</td><td>Location ou prêt-à-porter : 2 à 3 mois.</td></tr>
<tr><td><strong>Fleuriste</strong></td><td>6 à 9 mois</td><td>Plus court hors saison.</td></tr>
<tr><td><strong>Coiffure et maquillage</strong></td><td>6 à 9 mois</td><td>Essai 2 à 3 mois avant.</td></tr>
<tr><td><strong>Hébergement des invités</strong></td><td>6 à 9 mois</td><td>Pose des options tôt si le lieu est isolé.</td></tr>
<tr><td><strong>Faire-part</strong></td><td>Commande 5 à 7 mois avant</td><td>Envoi 4 à 6 mois avant. Save the date : 8 à 12 mois avant.</td></tr>
<tr><td><strong>Location de matériel, transport</strong></td><td>3 à 6 mois</td><td>Plus tôt pour une tente ou des navettes en juin.</td></tr>
<tr><td><strong>Gâteau ou pièce montée</strong></td><td>3 à 6 mois</td><td>Parfois inclus chez le traiteur.</td></tr>
<tr><td><strong>Alliances</strong></td><td>3 à 4 mois</td><td>Gravure et mise à taille prennent plusieurs semaines.</td></tr>
<tr><td><strong>Borne photo</strong></td><td>3 à 6 mois</td><td>Les loueurs ont un nombre de bornes limité le samedi.</td></tr>
<tr><td><strong>Appareil photo jetable numérique</strong></td><td>1 à 2 mois</td><td>Se crée en quelques minutes ; le délai sert surtout à imprimer les QR codes et à prévenir les invités.</td></tr>
</tbody>
</table>
<p>Pour l’ordre de réservation, retiens cette règle simple : <strong>d’abord ce qui est unique</strong> (le lieu), <strong>puis ce qui ne fait qu’un mariage par jour</strong> (photographe, vidéaste, DJ, officiant), <strong>puis tout le reste</strong>.</p>

<h2 id="mairie">Mairie : dossier de mariage, publication des bans et délais</h2>
<p>En France, seul le mariage civil a une valeur légale. Il est célébré par le maire ou un adjoint, en mairie, et il doit précéder toute cérémonie religieuse. Les règles ci-dessous viennent de la fiche officielle de service-public.gouv.fr (mise à jour en septembre 2026) ; chaque mairie a ensuite son organisation propre, alors pose-lui tes questions tôt.</p>

<h3>Dans quelle commune se marier ?</h3>
<p>Dans une commune avec laquelle l’un de vous a un lien durable : celle où l’un de vous a son domicile ou sa résidence, ou celle où l’un de vos parents a son domicile ou sa résidence. La célébration a lieu à la mairie, ou dans un bâtiment communal choisi par le maire, comme une salle des fêtes de la commune.</p>

<h3>Le dossier de mariage</h3>
<p>Le dossier se retire en mairie ou se télécharge sur le site de la commune. Les pièces les plus courantes :</p>
<ul>
  <li>une pièce d’identité pour chacun ;</li>
  <li>un justificatif de domicile ou de résidence ;</li>
  <li>une copie intégrale ou un extrait avec filiation de l’acte de naissance, de <strong>moins de 3 mois</strong> s’il a été délivré en France (moins de 6 mois s’il vient d’un état civil étranger) ;</li>
  <li>les informations sur les témoins (nom, prénoms, date et lieu de naissance, profession, domicile) et la copie de leur pièce d’identité ;</li>
  <li>le certificat du notaire si vous avez fait un contrat de mariage.</li>
</ul>
<p>Le Code civil prévoit <strong>2 témoins au minimum et 4 au maximum</strong>, majeurs, de la famille ou non. Si l’un de vous est étranger ou né à l’étranger, la mairie peut demander des pièces supplémentaires (certificat de coutume, certificat de célibat, traductions, apostille ou légalisation selon le pays) : compte plus de temps.</p>
<p>Bon à savoir : le certificat médical prénuptial n’est plus exigé depuis 2008. Si un vieux guide te le réclame, il est périmé.</p>

<h3>L’audition des futurs époux</h3>
<p>L’officier d’état civil vous reçoit tous les deux ensemble, et peut aussi demander à vous voir séparément. Cette audition est obligatoire : il s’agit de vérifier que les conditions du mariage sont remplies.</p>

<h3>La publication des bans</h3>
<p>Une fois le dossier validé, la mairie affiche la publication des bans pendant <strong>10 jours</strong>, à la mairie du mariage et à celle du domicile de chacun. Le mariage ne peut pas être célébré avant le 10e jour qui suit la publication, et il doit l’être dans l’année qui suit. Une dispense de publication peut être demandée au procureur de la République, mais seulement pour un motif grave.</p>

<h3>Quand déposer le dossier ?</h3>
<p>La loi ne fixe pas de date limite de dépôt : c’est chaque mairie qui organise son calendrier. En pratique, beaucoup demandent un dossier complet un à deux mois avant la date, parfois davantage en été. Fais deux choses :</p>
<ul>
  <li><strong>Dès que le lieu est réservé</strong>, appelle la mairie pour bloquer la date et l’heure, et demande-lui sa date limite de dépôt.</li>
  <li><strong>Environ 3 à 4 mois avant</strong>, commande tes actes de naissance (ils doivent avoir moins de 3 mois au dépôt), puis dépose le dossier dans le délai indiqué.</li>
</ul>

<h3>Contrat de mariage, cérémonie religieuse, cérémonie laïque</h3>
<ul>
  <li><strong>Contrat de mariage :</strong> il se signe chez le notaire avant le mariage. Sans contrat, vous êtes mariés sous le régime légal de la communauté réduite aux acquêts. Prends rendez-vous deux à trois mois avant au moins, le temps d’en discuter.</li>
  <li><strong>Mariage religieux :</strong> il se célèbre après le mariage civil, souvent le même jour. Pour un mariage catholique, les diocèses conseillent de contacter la paroisse environ un an avant, pour le temps de préparation.</li>
  <li><strong>Cérémonie laïque :</strong> elle n’a aucune valeur légale. Le passage à la mairie reste obligatoire, éventuellement quelques jours avant, avec un cercle restreint.</li>
</ul>

<h2 id="budget">La répartition du budget par poste</h2>
<p>Les estimations du coût moyen d’un mariage en France qui circulent tournent souvent autour de 15 000 à 20 000 €, mais l’écart réel est immense, de quelques milliers d’euros à beaucoup plus. Plutôt qu’un montant, retiens des proportions. Voici les fourchettes qu’on retrouve le plus souvent dans les guides de mariage :</p>
<table>
<thead><tr><th>Poste</th><th>Part du budget</th><th>Sur 15 000 €</th></tr></thead>
<tbody>
<tr><td><strong>Lieu de réception</strong></td><td>20 à 30 %</td><td>3 000 à 4 500 €</td></tr>
<tr><td><strong>Traiteur, boissons et service</strong></td><td>20 à 30 %</td><td>3 000 à 4 500 €</td></tr>
<tr><td><strong>Photo et vidéo</strong></td><td>8 à 12 %</td><td>1 200 à 1 800 €</td></tr>
<tr><td><strong>Tenues et beauté</strong></td><td>5 à 10 %</td><td>750 à 1 500 €</td></tr>
<tr><td><strong>Fleurs et décoration</strong></td><td>5 à 10 %</td><td>750 à 1 500 €</td></tr>
<tr><td><strong>Musique et animations</strong></td><td>5 à 10 %</td><td>750 à 1 500 €</td></tr>
<tr><td><strong>Alliances</strong></td><td>2 à 5 %</td><td>300 à 750 €</td></tr>
<tr><td><strong>Papeterie (save the date, faire-part, menus)</strong></td><td>1 à 3 %</td><td>150 à 450 €</td></tr>
<tr><td><strong>Transports et hébergement</strong></td><td>1 à 3 %</td><td>150 à 450 €</td></tr>
<tr><td><strong>Marge pour les imprévus</strong></td><td>5 à 10 %</td><td>750 à 1 500 €</td></tr>
</tbody>
</table>
<p>Ces fourchettes ne s’additionnent pas à 100 % : ce sont des repères, à ajuster selon vos priorités. Le lieu et le traiteur pèsent ensemble près de la moitié du budget dans la plupart des mariages, ce qui explique pourquoi le nombre d’invités est le premier levier d’économie. La marge pour les imprévus, elle, n’est pas facultative : il y a toujours une rallonge de dernière minute.</p>
<p>Pour la partie image, on détaille les ordres de grandeur et les postes où l’on peut économiser sans regret dans notre article sur le <a href="/journal/budget-photo-mariage">budget photo de mariage</a>.</p>

<h3>Le calendrier des paiements</h3>
<p>Le budget ne se dépense pas d’un coup. La plupart des prestataires demandent un acompte à la réservation (souvent 20 à 50 %), puis le solde peu avant ou juste après le mariage. Note chaque échéance dans ton tableur : c’est ce qui évite la mauvaise surprise de cinq soldes à régler la même semaine.</p>

<h2 id="qui-fait-quoi">Qui fait quoi : mariés, témoins, familles, wedding planner</h2>
<p>Un mariage bien organisé, c’est surtout un mariage bien réparti. Voici une répartition qui fonctionne, à adapter à votre entourage.</p>
<table>
<thead><tr><th>Qui</th><th>Ce qui lui revient</th></tr></thead>
<tbody>
<tr><td><strong>Les mariés</strong></td><td>Les décisions : budget, liste d’invités, choix des prestataires, contrats, mairie, vœux. Ce qui ne se délègue pas.</td></tr>
<tr><td><strong>Les témoins</strong></td><td>EVJF et EVG, soutien dans les dernières semaines, garde des alliances, discours, signature du registre, annonce des animations au micro, gestion de l’urne.</td></tr>
<tr><td><strong>Les familles</strong></td><td>Leur partie de la liste d’invités, l’accueil, l’aide à l’installation et au rangement, parfois une participation financière.</td></tr>
<tr><td><strong>Le référent du jour J</strong></td><td>Un proche organisé (ou le wedding planner) : seul interlocuteur des prestataires le jour même, gardien du déroulé.</td></tr>
<tr><td><strong>Le wedding planner</strong></td><td>Selon la formule : tout de A à Z, une partie seulement (recherche de prestataires, décoration), ou la coordination du jour J.</td></tr>
</tbody>
</table>
<p>Sur la question « qui paie quoi », la tradition voulait que la famille de la mariée prenne la réception à sa charge. Aujourd’hui, la plupart des couples financent l’essentiel eux-mêmes, et les familles participent si elles le souhaitent. L’important est d’en parler franchement dès la fixation du budget, pas au moment de la facture.</p>
<p>Faut-il un wedding planner ? Si vous avez peu de temps, un mariage loin de chez vous, ou beaucoup d’invités, la question se pose vraiment. On détaille <a href="/journal/services-wedding-planner">ce que fait un wedding planner et ses différentes formules</a>.</p>

<h2 id="photos">Les photos dans le rétroplanning</h2>
<p>Les photos sont l’un des rares postes dont il reste quelque chose le lendemain. Elles ont donc leur place à plusieurs étapes du rétroplanning, pas seulement au moment de réserver le photographe.</p>

<h3>12 mois avant : réserver le photographe</h3>
<p>C’est l’un des premiers prestataires à réserver après le lieu, pour une raison simple : il ne fait qu’un mariage par jour. Vérifie trois choses avant de signer : une galerie complète, l’heure de fin incluse, et le délai de livraison écrit dans le contrat.</p>

<h3>1 mois avant : la shot list et les photos de groupe</h3>
<p>Au rendez-vous de préparation, arrive avec deux listes : les moments et les détails à ne pas rater (ta <a href="/journal/shot-list-mariage">shot list de mariage</a>), et les <a href="/journal/photos-de-groupe-mariage">photos de groupe</a> à faire, avec les noms. Désigne aussi un proche qui connaît les deux familles pour rassembler les gens : le photographe ne sait pas qui est l’oncle Gérard.</p>

<h3>1 à 2 mois avant : prévoir l’animation photo des invités</h3>
<p>Ton photographe couvre les temps officiels. Les fous rires à la table du fond, la grand-mère sur la piste à minuit, tes invités les voient mieux que lui. Plusieurs façons de les récupérer : une borne photo, des appareils jetables en carton sur les tables, un album partagé où chacun dépose ses photos après coup, ou un appareil photo jetable sur le téléphone de chaque invité. On les compare dans notre <a href="/journal/comparatif-animations-photo-mariage">comparatif des animations photo de mariage</a>.</p>
<p>Si tu choisis l’appareil jetable numérique, c’est le bon moment pour le mettre en place. Avec <a href="/">Time to Flash</a>, par exemple :</p>
<ul>
  <li><strong>Crée l’événement</strong> : le nombre de photos par invité (entre 3 et 15), la date de révélation de l’album (par défaut le lendemain). C’est gratuit jusqu’à 5 invités, de quoi tester avec tes témoins, puis un paiement unique selon le nombre d’invités (29,99 € jusqu’à 100), sans abonnement.</li>
  <li><strong>Imprime les QR codes</strong> : depuis ton tableau de bord, ou avec le <a href="/generateur-qr-code-mariage">générateur d’affiche QR code</a> gratuit, à vos prénoms et à votre date.</li>
  <li><strong>Préviens les invités</strong> : une ligne sur le site du mariage ou le faire-part, deux phrases dans le discours du témoin. On a écrit <a href="/journal/brief-invites">le brief invités à copier-coller</a>.</li>
</ul>
<p>La différence avec un album partagé classique : ce n’est pas une galerie où l’on dépose ses photos le lendemain, c’est un jeu pendant la fête. Chaque invité a un nombre de poses limité, personne ne voit les photos avant la révélation, et l’album s’ouvre d’un coup pour tout le monde.</p>

<h3>Le jour J : poser les QR codes</h3>
<p>La veille ou le matin, quelqu’un pose les QR codes là où les invités ont le temps de les scanner : sur les tables, au bar, à l’entrée, et même aux toilettes. Tous nos tests sont dans <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a>. Pense aussi à vérifier le réseau du lieu lors de ta visite : si ça capte mal, lis <a href="/journal/pas-de-reseau-salle-mariage">nos solutions quand il n’y a pas de réseau dans la salle</a>.</p>

<h3>Le lendemain : la révélation</h3>
<p>Au brunch ou au réveil, l’album des invités se dévoile pour tout le monde en même temps. Comment en faire un vrai moment, on te le raconte dans <a href="/journal/revelation-photos-lendemain-mariage">la révélation des photos le lendemain du mariage</a>. Les photos restent disponibles 6 mois : télécharge-les dans le mois qui suit, avec celles du photographe, et garde les plus belles pour les cartes de remerciement.</p>

<h2 id="resume">Le rétroplanning en une phrase par période</h2>
<ul>
  <li><strong>18 à 12 mois :</strong> budget, invités, date, lieu.</li>
  <li><strong>12 à 9 mois :</strong> photographe, vidéaste, DJ, officiant, témoins, save the date.</li>
  <li><strong>9 à 6 mois :</strong> robe, fleuriste, beauté, transports, voyage.</li>
  <li><strong>6 à 4 mois :</strong> faire-part, menu, costume, alliances, notaire.</li>
  <li><strong>4 à 2 mois :</strong> dossier de mairie, plan de table, essais, musique.</li>
  <li><strong>2 à 1 mois :</strong> chiffre final au traiteur, rendez-vous photographe, animation photo, déroulé.</li>
  <li><strong>3 semaines à la veille :</strong> confirmer, transmettre, déléguer, dormir.</li>
  <li><strong>Après :</strong> révélation, remerciements, avis, photos, papiers.</li>
</ul>
<p>Et si tu ne retiens qu’une chose : réserve d’abord ce qui est unique, transmets tout par écrit, et confie le jour J à quelqu’un d’autre que toi. Le reste suit.</p>
`,
    faq: [
      {
        q: 'Quand commencer à organiser son mariage ?',
        a: 'L’idéal est de commencer 12 à 18 mois avant, surtout pour un samedi de mai à septembre : c’est le délai qui permet de choisir son lieu et son photographe. On peut faire beaucoup plus court (6 mois, voire 3) en restant souple sur la date et en simplifiant le format.',
      },
      {
        q: 'Que faire 6 mois avant le mariage ?',
        a: 'Six mois avant, on envoie les faire-part avec une date limite de réponse, on fait la dégustation chez le traiteur, on choisit le costume et les alliances, et on demande le dossier de mariage à la mairie. C’est aussi le moment de prévenir son employeur et de prendre rendez-vous chez le notaire si l’on fait un contrat de mariage.',
      },
      {
        q: 'Combien de temps avant faut-il déposer le dossier de mariage à la mairie ?',
        a: 'La loi ne fixe pas de délai de dépôt : chaque mairie a le sien, souvent un à deux mois avant la date, parfois plus en été. Le mariage ne peut être célébré qu’à partir du 10e jour après la publication des bans. Attention, l’acte de naissance doit dater de moins de 3 mois au moment du dépôt.',
      },
      {
        q: 'Quand envoyer les faire-part et le save the date ?',
        a: 'Le save the date part 8 à 12 mois avant, surtout si des invités viennent de loin. Le faire-part part 4 à 6 mois avant, avec une date limite de réponse fixée 6 à 8 semaines avant le mariage, pour donner un chiffre ferme au traiteur.',
      },
      {
        q: 'Peut-on organiser un mariage en 3 mois ?',
        a: 'Oui, à condition de simplifier : moins d’invités, un lieu tout compris pour la cérémonie et la réception, des tenues en prêt-à-porter. Appelle la mairie dès la première semaine, car le dossier, l’audition et la publication des bans prennent plusieurs semaines.',
      },
      {
        q: 'Quels prestataires réserver en premier pour un mariage ?',
        a: 'D’abord le lieu de réception, qui fixe la date et la capacité. Ensuite ceux qui ne font qu’un mariage par jour : photographe, vidéaste, DJ et officiant laïque, puis le traiteur s’il n’est pas imposé par le lieu. Fleuriste, beauté, faire-part et alliances viennent après.',
      },
    ],
  },
]

export const POSTS_EN = {
  'retroplanning-mariage': {
    title: 'Wedding planning timeline: the complete month-by-month checklist',
    excerpt: 'Every task to tick off from 18 months out to the day after, vendor booking times, French town hall paperwork, budget split, and 6 or 3 month plans.',
    caption: 'A couple leaning over a wedding planning notebook at the kitchen table in the evening',
    body: `
<p>A <strong>wedding planning timeline</strong> is your calendar in reverse: you start from the wedding date and work backwards to know what to do, and above all when to do it. Here is ours, the most complete one we could write. It runs from 18 months before the wedding to the month after, and for each stage you get a checklist, the reason those tasks belong right there, and the trap most couples fall into.</p>
<p>Short on time? Jump straight to the <a href="#express-6-mois">6-month express plan</a> or the <a href="#express-3-mois">3-month version</a>. Just looking for a lead time? The <a href="#delais-prestataires">vendor booking table</a> and the <a href="#mairie">French town hall paperwork</a> are further down.</p>

<p><strong>Contents</strong></p>
<ol>
  <li><a href="#combien-de-temps">How long does it take to plan a wedding?</a></li>
  <li><a href="#m-18">18 to 12 months out: the foundations</a></li>
  <li><a href="#m-12">12 to 9 months out: the vendors who book up first</a></li>
  <li><a href="#m-9">9 to 6 months out: the second circle</a></li>
  <li><a href="#m-6">6 to 4 months out: invitations and menu</a></li>
  <li><a href="#m-4">4 to 2 months out: paperwork and details</a></li>
  <li><a href="#m-2">2 to 1 month out: pulling it together</a></li>
  <li><a href="#s-3">3 weeks out</a></li>
  <li><a href="#s-2">2 weeks out</a></li>
  <li><a href="#semaine-j">Wedding week</a></li>
  <li><a href="#veille">The day before</a></li>
  <li><a href="#jour-j">The wedding day</a></li>
  <li><a href="#lendemain">The day after</a></li>
  <li><a href="#mois-apres">The month after</a></li>
  <li><a href="#express-6-mois">Planning a wedding in 6 months</a></li>
  <li><a href="#express-3-mois">Planning a wedding in 3 months</a></li>
  <li><a href="#delais-prestataires">How far ahead to book each vendor</a></li>
  <li><a href="#mairie">Getting married in France: the town hall side</a></li>
  <li><a href="#budget">How to split your wedding budget</a></li>
  <li><a href="#qui-fait-quoi">Who does what: couple, wedding party, families, planner</a></li>
  <li><a href="#photos">Photos in your wedding timeline</a></li>
  <li><a href="#resume">The whole timeline, one line per stage</a></li>
</ol>

<h2 id="combien-de-temps">How long does it take to plan a wedding?</h2>
<p>The honest answer: <strong>12 to 18 months</strong> if you want to choose your vendors rather than take whoever is left. But you can do it in far less, as long as you accept a few compromises.</p>
<table>
<thead><tr><th>Time you have</th><th>What it looks like</th></tr></thead>
<tbody>
<tr><td><strong>18 months or more</strong></td><td>Full choice: the in-demand venue, a Saturday in June, the photographer you fell for.</td></tr>
<tr><td><strong>12 months</strong></td><td>The most common pace. Comfortable if you stay a little flexible on the date.</td></tr>
<tr><td><strong>6 to 9 months</strong></td><td>Very doable, especially off-season or on a Friday. You will need to decide quickly.</td></tr>
<tr><td><strong>3 months</strong></td><td>Possible for a simple or mid-sized wedding with an all-inclusive venue.</td></tr>
</tbody>
</table>
<p>Four things shift that timeline far more than your motivation: <strong>the season</strong> (Saturdays from May to September go first), <strong>the guest count</strong> (the fewer venues that can host you, the earlier you need to book), <strong>the type of venue</strong> (an all-inclusive estate simplifies everything) and <strong>how flexible you are on the date</strong>.</p>

<h3>The four decisions to make before anything else</h3>
<p>Every vendor you contact will ask the same questions: what date, how many people, what budget, what kind of party. Answer them before you visit a single venue.</p>
<ul>
  <li><strong>Your total budget</strong>, and who contributes (the two of you, your families). A ceiling, not a wish.</li>
  <li><strong>Your guest count</strong>, as a range: "between 80 and 110" is enough to start.</li>
  <li><strong>The season</strong>, plus two or three possible dates. Holding out for one single date rules out half the venues.</li>
  <li><strong>The format</strong>: civil ceremony only, civil plus religious, a celebrant-led ceremony, a one-day party or a full weekend with a brunch.</li>
</ul>

<h3>Building your own planning timeline</h3>
<p>The checklist below is a template. To actually follow it, nothing beats a spreadsheet shared between the two of you (Google Sheets or similar), with these columns:</p>
<table>
<thead><tr><th>Task</th><th>Deadline</th><th>Who</th><th>Status</th><th>Amount</th><th>Deposit paid</th><th>Balance due</th></tr></thead>
<tbody>
<tr><td>Book the photographer</td><td>12 months out</td><td>Sam</td><td>Done</td><td>€1,800</td><td>€540</td><td>2 weeks out</td></tr>
<tr><td>Send the invitations</td><td>5 months out</td><td>Alex</td><td>To do</td><td>€320</td><td>-</td><td>-</td></tr>
</tbody>
</table>
<p>Two rules make all the difference: <strong>every task has one owner</strong> ("we’ll handle it" means nobody will), and you hold a fixed thirty-minute check-in every week, on the same day. Add a tab for guests and one for the budget, and everything lives in one place.</p>

<h2 id="m-18">Wedding planning timeline, 18 to 12 months out: the foundations</h2>
<p>This is the season of big decisions. Few tasks, but each one shapes everything that follows.</p>
<h3>Checklist</h3>
<ul>
  <li>Tell your close family and friends about the engagement (before social media; they will appreciate it).</li>
  <li>Set the total budget and any family contributions.</li>
  <li>Draft a first guest list, as a range.</li>
  <li>Pick a season and two or three possible dates. Check bank holidays, school holidays, and dates that are impossible for key people (a due date, another wedding, exams).</li>
  <li>Decide on the format: civil only, religious, celebrant-led, one day or a weekend.</li>
  <li>Decide whether to hire a wedding planner, and for what (full planning or day-of coordination).</li>
  <li>Visit three to five venues, then book yours (contract signed, deposit paid).</li>
  <li>If you are marrying in France, check that the town hall can hold the civil ceremony on that date, at a time that works with the venue.</li>
  <li>For a religious wedding, get in touch with your parish or community.</li>
  <li>Book the caterer if the venue does not impose one.</li>
  <li>For a Saturday between May and September, book the photographer and videographer now.</li>
  <li>Look into wedding insurance, and read the exclusions before you sign.</li>
  <li>Set up your tracking spreadsheet.</li>
</ul>
<p><strong>Why now:</strong> the venue sets the date, the capacity, often the caterer, and a big chunk of the budget. Everything else flows from it. The most sought-after venues are booked one to two years ahead for summer Saturdays.</p>
<p><strong>The trap:</strong> booking the venue before you know your guest count. An 80-seat venue when the list climbs to 120 is the first crisis of the wedding. The second trap is signing without reading the terms: end time, sound limiter, imposed caterer, corkage fee, accommodation, cleaning, deposit. We listed <a href="/journal/questions-lieu-reception-mariage">the questions to ask your wedding venue</a> before signing.</p>

<h2 id="m-12">12 to 9 months out: the vendors who book up first</h2>
<p>The venue is booked and the date is set. Now for the vendors who can only do one wedding a day.</p>
<h3>Checklist</h3>
<ul>
  <li>Choose and book your photographer if you haven’t already: meet them, and ask to see a full gallery from one entire wedding.</li>
  <li>Book a videographer, if you want one.</li>
  <li>Book the DJ or band.</li>
  <li>Book a celebrant if you are planning a non-legal, personalised ceremony.</li>
  <li>Choose your witnesses (and bridesmaids or groomsmen), and ask them in person.</li>
  <li>Send save-the-dates, especially if guests are travelling or you are marrying in peak season.</li>
  <li>Build your wedding website: date, venue, accommodation, directions.</li>
  <li>Reserve a block of rooms for guests if the venue is remote (hotel, guesthouses, holiday lets).</li>
  <li>Start trying on dresses if yours will be made to order.</li>
  <li>Define the look and feel: colours, style, a handful of reference images.</li>
  <li>In peak season, book the florist too.</li>
</ul>
<p><strong>Why now:</strong> photographers, videographers, DJs and celebrants can only work one wedding a day. Saturdays go on a first-come, first-served basis, and the best are often booked a year ahead.</p>
<p><strong>The trap:</strong> choosing a photographer from their ten best Instagram shots. Ask for a full story, from getting ready to the dance floor, and check what time the package ends: many stop before the party really starts. For how much to set aside, see our guide to <a href="/journal/budget-photo-mariage">the wedding photography budget</a>.</p>

<h2 id="m-9">9 to 6 months out: the second circle</h2>
<p>The must-haves are booked. Time for vendors who are easier to find, but who still fill up in season.</p>
<h3>Checklist</h3>
<ul>
  <li>Order the dress if it is made to order (production times often run to several months).</li>
  <li>Start looking at suits or the second partner’s outfit.</li>
  <li>Book the florist if you haven’t yet.</li>
  <li>Book hair and makeup (the trial comes later).</li>
  <li>Book rentals: furniture, tableware, lighting, a marquee if anything happens outdoors.</li>
  <li>Sort transport: the couple’s car, a shuttle for guests if the venue is far away or people will be drinking.</li>
  <li>Set up your gift registry or honeymoon fund.</li>
  <li>Book the honeymoon, and check passport expiry dates.</li>
  <li>Write a wet-weather plan for anything planned outdoors (drinks reception, outdoor ceremony).</li>
  <li>Choose your invitation design.</li>
</ul>
<p><strong>Why now:</strong> florists, makeup artists and rental companies have more availability than photographers, just not in June. On the travel side, prices climb as the date gets closer.</p>
<p><strong>The trap:</strong> booking honeymoon flights under your future married name. The name on the ticket has to match the passport you will show at the gate, and that is most likely your current name.</p>

<h2 id="m-6">6 to 4 months out: invitations and menu</h2>
<p>This is the answer to "what should I do 6 months before the wedding?": officially invite everyone, and choose what you will serve.</p>
<h3>Checklist</h3>
<ul>
  <li>Send the invitations, with an RSVP deadline 6 to 8 weeks before the wedding.</li>
  <li>Do the tasting with your caterer, choose the menu, and collect dietary needs (vegetarian, allergies, children’s meals).</li>
  <li>Order or rent the suit.</li>
  <li>Choose your rings (engraving and resizing take several weeks).</li>
  <li>If you are marrying in France, ask the town hall for the marriage file and its submission deadline.</li>
  <li>Book a notary if you want a prenuptial agreement (a "contrat de mariage" in France).</li>
  <li>Tell your employers. In France, the Labour Code gives employees 4 days of leave for their own wedding; elsewhere, check your contract.</li>
  <li>Order the cake.</li>
  <li>Meet your celebrant and start shaping the ceremony.</li>
  <li>Write a first draft of the day’s schedule.</li>
  <li>Think about what guests will do between the big moments: games, a guest book, a photo activity (we gathered <a href="/journal/idees-animation-mariage">wedding entertainment ideas</a>).</li>
</ul>
<p><strong>Why now:</strong> invitations should only go out once every practical detail is locked (venues, times, accommodation). And your caterer needs time to fine-tune the menu after the tasting.</p>
<p><strong>The trap:</strong> forgetting the RSVP deadline. Without one, replies trickle in until the day before, while your caterer needs a firm number long before that.</p>

<h2 id="m-4">4 to 2 months out: paperwork and details</h2>
<p>The big bookings are done. Now come the formalities and the details that give the wedding its personality.</p>
<h3>Checklist</h3>
<ul>
  <li>In France, submit the marriage file to the town hall within the deadline it gave you (details <a href="#mairie">below</a>).</li>
  <li>Chase guests who haven’t replied.</li>
  <li>Start the seating plan.</li>
  <li>Do the hair and makeup trial.</li>
  <li>First dress fitting with the seamstress, alterations.</li>
  <li>Pick music for the key moments: ceremony entrance, exit, first dance. Draw up a "do not play" list too.</li>
  <li>Write your vows, if your ceremony includes them.</li>
  <li>Prepare the on-the-day stationery: menus, place cards, seating chart, signs.</li>
  <li>Let your wedding party plan the hen or stag do, and tell them your limits.</li>
  <li>Buy accessories (shoes, veil, jewellery) and start wearing the shoes around the house.</li>
  <li>Schedule a planning meeting with your photographer one month out.</li>
</ul>
<p><strong>Why now:</strong> a French town hall needs a complete file before it can publish the banns, and some documents expire quickly. Too early and they lapse; too late and you are rushing.</p>
<p><strong>The trap:</strong> ordering your French birth certificate copy six months ahead. It must be less than three months old when you submit the file (less than six months if issued abroad), so it would no longer be valid.</p>

<h2 id="m-2">2 to 1 month out: pulling it together</h2>
<p>Everything is booked. The job now is making sure every vendor has the same version of the day.</p>
<h3>Checklist</h3>
<ul>
  <li>Give the caterer your final headcount, by the date in your contract.</li>
  <li>Hold the planning meeting with your photographer: schedule, portrait locations, people not to miss. Bring your <a href="/journal/shot-list-mariage">wedding shot list</a> and your list of <a href="/journal/photos-de-groupe-mariage">group photos</a>.</li>
  <li>Set up the guest photo activity and print its materials (see <a href="#photos">photos in your wedding timeline</a>).</li>
  <li>Finalise the seating plan.</li>
  <li>Write the hour-by-hour schedule and send it to every vendor (our <a href="/journal/deroule-jour-j-mariage">wedding day timeline</a> template saves time).</li>
  <li>Appoint a day-of point person: an organised friend (or your planner) who answers vendors on your behalf.</li>
  <li>Attend the town hall interview if you are called in.</li>
  <li>Plan the speeches: who speaks, when, and for how long.</li>
  <li>Map out the final payments (balances, tips).</li>
  <li>Sort gifts for guests and for your witnesses (a few ideas for <a href="/cadeau-mariage-temoins">wedding party gifts</a>).</li>
  <li>Put together your emergency kit (see <a href="#semaine-j">wedding week</a>).</li>
</ul>
<p><strong>Why now:</strong> vendors need precise information a month out to organise themselves. And the caterer places orders based on your number.</p>
<p><strong>The trap:</strong> keeping the schedule in your head. If every vendor has a different time for the drinks reception, you will get a forty-minute gap. One version, sent to everyone.</p>

<h2 id="s-3">3 weeks out</h2>
<h3>Checklist</h3>
<ul>
  <li>Final dress and suit fittings, with the actual shoes and underwear you will wear.</li>
  <li>Confirm each vendor in writing: arrival time, exact address, on-site contact, power needs.</li>
  <li>Arrange meals with the caterer for vendors who stay all evening (photographer, videographer, DJ).</li>
  <li>Print the on-the-day stationery.</li>
  <li>Sign off the playlist with your DJ.</li>
  <li>List who brings what (decorations, equipment, extension cables).</li>
  <li>Gather the ID documents the town hall wants on the day.</li>
  <li>Book your haircut or colour two to three weeks out, never the day before.</li>
</ul>
<p><strong>Why now:</strong> this is the last point where a fitting issue, a printing error or a poorly briefed vendor can be fixed without panic.</p>
<p><strong>The trap:</strong> trying a new facial or a new hair colour now. A skin reaction shows up in every single photo.</p>

<h2 id="s-2">2 weeks out</h2>
<h3>Checklist</h3>
<ul>
  <li>Send the final schedule to every vendor and to your day-of point person.</li>
  <li>Brief your witnesses on their roles: rings, speeches, the card box, announcing the photo activity on the mic.</li>
  <li>Prepare labelled envelopes for each vendor’s balance and tip.</li>
  <li>Print the final seating chart.</li>
  <li>Confirm shuttles and accommodation.</li>
  <li>Check the long-range forecast and confirm the wet-weather plan with the venue.</li>
  <li>Wrap the guest favours.</li>
</ul>
<p><strong>Why now:</strong> two weeks out, nothing should change any more. What is left is handing things over.</p>
<p><strong>The trap:</strong> trying to handle everything yourself. Every task you hand off now is one more minute with your guests on the day.</p>

<h2 id="semaine-j">Wedding week</h2>
<h3>Checklist</h3>
<ul>
  <li>Collect the dress and suit.</li>
  <li>Drop decorations at the venue, if it allows.</li>
  <li>Final call with the caterer (final numbers, dietary needs) and with the venue (access times).</li>
  <li>Pack one bag per part of the day: town hall (ID, rings), ceremony, evening, overnight.</li>
  <li>Finish the emergency kit: needle and thread, safety pins, plasters, painkillers, tissues, deodorant, phone charger, double-sided tape, spare flat shoes.</li>
  <li>Pack for the honeymoon.</li>
  <li>Put a trusted person in charge of the card box and gifts.</li>
  <li>Sleep, eat, go for walks. Seriously.</li>
</ul>
<p><strong>Why now:</strong> everything ready by Thursday buys you a calm Friday.</p>
<p><strong>The trap:</strong> starting a new DIY project in the final week. Those 150 hand-lettered tags were a job for last month.</p>

<h2 id="veille">The day before</h2>
<h3>Checklist</h3>
<ul>
  <li>Set up the decorations, or brief the team doing it.</li>
  <li>Place the QR codes for the photo activity, or give someone that job (we tested <a href="/journal/ou-poser-le-qr-code">where to put the QR code</a> so it actually gets scanned).</li>
  <li>Rehearse the ceremony with the celebrant or officiant, witnesses and any children in the wedding party.</li>
  <li>Hand the rings to the witness who will keep them.</li>
  <li>Charge phones and a power bank.</li>
  <li>Lay out the full outfit and every accessory in one room.</li>
  <li>Light dinner, early night.</li>
</ul>
<p><strong>Why now:</strong> the rehearsal takes the edge off ceremony nerves, and setting up the day before means you don’t spend the wedding morning carrying tables.</p>
<p><strong>The trap:</strong> the welcome drinks that end at 2am. You are getting married tomorrow.</p>

<h2 id="jour-j">The wedding day</h2>
<p>The full hour-by-hour plan is in our article on <a href="/journal/deroule-jour-j-mariage">the wedding day timeline</a>. Here is what must not slip.</p>
<h3>Checklist</h3>
<ul>
  <li>Eat a proper breakfast.</li>
  <li>Bring your ID for the civil ceremony.</li>
  <li>Hand your phone to the point person: vendors call them, not you.</li>
  <li>Take ten minutes alone together at some point in the day.</li>
  <li>Have a witness or the DJ announce the photo activity on the mic.</li>
  <li>Eat during dinner, even if everyone comes over to talk.</li>
  <li>Let the point person hand over balances and tips at the end of the night.</li>
</ul>
<p><strong>Why now:</strong> because this is the day you stop being the organiser. Everything before was for this.</p>
<p><strong>The trap:</strong> a schedule with no slack. Add fifteen minutes to every transition: group photos, travel and hugs always take longer than planned.</p>

<h2 id="lendemain">The day after</h2>
<h3>Checklist</h3>
<ul>
  <li>The brunch, if you planned one.</li>
  <li>Tidy up, return rentals, do the venue walkthrough and get your deposit back.</li>
  <li>Collect decorations, gifts and the card box.</li>
  <li>Discover your guests’ photos together: it is the perfect moment for a <a href="/journal/revelation-photos-lendemain-mariage">day-after photo reveal</a>.</li>
  <li>Send a first thank-you message to all your guests.</li>
  <li>Set the dress and suit aside for cleaning.</li>
</ul>
<p><strong>Why now:</strong> most venues have to be handed back the next day. And it is the day everyone still wants to relive the party.</p>
<p><strong>The trap:</strong> planning nothing for the clean-up. Name a crew before the wedding, or it will be the two of you, alone, with three hundred glasses.</p>

<h2 id="mois-apres">The month after</h2>
<p>The wedding is over, but the checklist isn’t quite.</p>
<h3>Checklist</h3>
<ul>
  <li><strong>Thank-you cards:</strong> send them within one or two months, ideally with a photo from the day.</li>
  <li><strong>Vendors:</strong> settle the last balances, and leave a review for those who earned it (on Google or wedding platforms). It is what keeps them in business.</li>
  <li><strong>Photos:</strong> photographers usually deliver within a few weeks to a few months, depending on the contract (we cover <a href="/journal/delai-livraison-photos-mariage">wedding photo delivery times</a>). Back everything up in two places, then order prints or an album.</li>
  <li><strong>The dress:</strong> take it to a cleaner experienced with wedding dresses quickly (wine and grass stains set over time), then store it in a fabric garment bag, or sell it while the style is still current.</li>
  <li><strong>The family record book:</strong> in France, the "livret de famille" is handed to you at the end of the town hall ceremony. File it with your important papers.</li>
  <li><strong>Name change:</strong> in France, marriage does not change your name automatically. You may use your spouse’s surname, or both names in the order you choose. It is optional and your current documents stay valid. If you choose to use it, update your ID card or passport, then tell the relevant organisations (health insurance, bank, employer). Outside France, rules differ: check with your own authorities.</li>
  <li><strong>Taxes (France):</strong> report your marriage on impots.gouv.fr within 60 days, through the withholding tax service. For the year of the wedding, couples normally file a joint return, with the option of filing separately.</li>
</ul>
<p><strong>Why now:</strong> the longer thank-yous wait, the harder they are to write. And a review written while it is fresh is far more useful to future couples.</p>
<p><strong>The trap:</strong> leaving your guests’ photos scattered across fifty phones. If nobody gathers them within the week, they vanish into everyone’s camera roll.</p>

<h2 id="express-6-mois">Planning a wedding in 6 months: the express plan</h2>
<p>Six months is enough for a beautiful wedding, as long as you make decisions in the right order, and fast. The idea: everything that normally happens between 18 and 6 months out fits into the first six weeks.</p>
<h3>Month 1 (6 months out): lock the essentials</h3>
<ul>
  <li>Budget, guest range and format: decided in one weekend.</li>
  <li>Venue booked within two weeks. Be flexible: a Friday, a Sunday or a March date opens a lot of doors, often at gentler prices.</li>
  <li>Favour a venue that includes catering, furniture and tableware: three bookings in one.</li>
  <li>If marrying in France, call the town hall immediately about the date.</li>
  <li>Photographer booked right after (the hardest vendor to find at the last minute).</li>
  <li>Save-the-date sent by message as soon as the venue contract is signed.</li>
</ul>
<h3>Month 2 (5 months out): the other vendors</h3>
<ul>
  <li>DJ, celebrant, florist, hair and makeup.</li>
  <li>Dress: aim for off-the-rack or designers with stock. Made-to-order is often too slow.</li>
  <li>Invitations sent (digital is fine).</li>
  <li>Witnesses chosen and asked.</li>
</ul>
<h3>Month 3 (4 months out): menu and outfits</h3>
<ul>
  <li>Tasting, menu, suit, rings.</li>
  <li>Notary, if you want a prenup.</li>
  <li>Honeymoon booked (or postponed, which is perfectly fine too).</li>
</ul>
<h3>Months 4 to 6: back on the standard timeline</h3>
<p>From 3 months out, follow the regular plan: <a href="#m-4">paperwork</a>, seating plan, <a href="#m-2">pulling it together</a>, then the final weeks.</p>
<p><strong>The trap:</strong> hunting for the perfect vendor. On an express timeline, a very good vendor who is free beats an ideal one who is booked. Set yourself a rule: three quotes per category at most, decision within 48 hours.</p>

<h2 id="express-3-mois">Planning a wedding in 3 months</h2>
<p>Three months is tight but doable, on one condition: simplify the format. Fewer guests, one venue for ceremony and reception, a simpler meal (standing dinner, buffet, food trucks).</p>
<h3>Weeks 1 and 2</h3>
<ul>
  <li>Budget, short guest list, simplified format.</li>
  <li>If marrying in France, call the town hall straight away. The file, the interview and the banns take several weeks, and some town halls are fully booked on Saturdays well in advance.</li>
  <li>All-inclusive venue booked.</li>
  <li>Photographer booked: look at weekday dates, end of season, or photographers who offer half-day packages.</li>
  <li>Invitations by message or digital card, with replies within two weeks.</li>
</ul>
<h3>Weeks 3 to 6</h3>
<ul>
  <li>Marriage file submitted.</li>
  <li>Off-the-rack or rented outfits, alterations started immediately.</li>
  <li>Music: an available DJ, or a well-prepared playlist and a good speaker.</li>
  <li>Flowers: a florist for the bouquet and a few centrepieces, no more.</li>
  <li>Rings (skip lengthy engravings).</li>
</ul>
<h3>Weeks 7 to 12</h3>
<ul>
  <li>Seating plan, schedule, day-of point person.</li>
  <li>Guest photo activity: it takes minutes to set up, exactly the kind of thing you can do late.</li>
  <li>Then the standard checklist from <a href="#s-3">3 weeks out</a>.</li>
</ul>
<p><strong>The trap:</strong> wanting a 150-guest wedding in three months. Time can be managed; size, much less so.</p>

<h2 id="delais-prestataires">How far ahead to book each vendor</h2>
<p>These are the lead times to aim for on a peak-season Saturday (May to September). Off-season or on a weekday, you can often shorten them. They are cautious ranges drawn from vendor recommendations and wedding guides: the only real answer comes from the vendor you have your eye on, so ask early.</p>
<table>
<thead><tr><th>Vendor</th><th>Book</th><th>Good to know</th></tr></thead>
<tbody>
<tr><td><strong>Venue</strong></td><td>12 to 18 months</td><td>Up to two years for in-demand venues on summer Saturdays.</td></tr>
<tr><td><strong>Wedding planner</strong></td><td>12 to 18 months</td><td>For full planning. Day-of coordination is usually booked 3 to 6 months out.</td></tr>
<tr><td><strong>Caterer</strong></td><td>10 to 14 months</td><td>Often imposed or recommended by the venue: check before searching.</td></tr>
<tr><td><strong>Photographer</strong></td><td>10 to 14 months</td><td>One wedding a day: the most in-demand go even earlier.</td></tr>
<tr><td><strong>Videographer</strong></td><td>9 to 12 months</td><td>Same logic as the photographer.</td></tr>
<tr><td><strong>DJ or band</strong></td><td>8 to 12 months</td><td>A live band is better booked around 12 months.</td></tr>
<tr><td><strong>Celebrant</strong></td><td>6 to 12 months</td><td>Expect several preparation meetings before the day.</td></tr>
<tr><td><strong>Made-to-order dress</strong></td><td>Order 8 to 10 months out</td><td>Off-the-rack: 3 to 4 months is enough, alterations included.</td></tr>
<tr><td><strong>Suit</strong></td><td>4 to 6 months (tailored)</td><td>Rental or off-the-rack: 2 to 3 months.</td></tr>
<tr><td><strong>Florist</strong></td><td>6 to 9 months</td><td>Shorter off-season.</td></tr>
<tr><td><strong>Hair and makeup</strong></td><td>6 to 9 months</td><td>Trial 2 to 3 months out.</td></tr>
<tr><td><strong>Guest accommodation</strong></td><td>6 to 9 months</td><td>Hold rooms early if the venue is remote.</td></tr>
<tr><td><strong>Invitations</strong></td><td>Order 5 to 7 months out</td><td>Send 4 to 6 months out. Save-the-dates: 8 to 12 months out.</td></tr>
<tr><td><strong>Rentals, transport</strong></td><td>3 to 6 months</td><td>Earlier for a marquee or shuttles in June.</td></tr>
<tr><td><strong>Cake</strong></td><td>3 to 6 months</td><td>Sometimes included by the caterer.</td></tr>
<tr><td><strong>Rings</strong></td><td>3 to 4 months</td><td>Engraving and resizing take several weeks.</td></tr>
<tr><td><strong>Photo booth</strong></td><td>3 to 6 months</td><td>Rental companies have a limited number of booths on Saturdays.</td></tr>
<tr><td><strong>Digital disposable camera</strong></td><td>1 to 2 months</td><td>Set up in minutes; the lead time is mostly for printing QR codes and telling guests.</td></tr>
</tbody>
</table>
<p>For booking order, remember one simple rule: <strong>first what is unique</strong> (the venue), <strong>then whoever can only do one wedding a day</strong> (photographer, videographer, DJ, celebrant), <strong>then everything else</strong>.</p>

<h2 id="mairie">Getting married in France: the town hall side</h2>
<p>This section is for couples marrying in France, where only the civil ceremony is legally binding. It is performed by the mayor or a deputy at the town hall (the "mairie"), and it must take place before any religious ceremony. The rules below come from the official French government guidance on service-public.gouv.fr (updated September 2026); each town hall then has its own way of working, so ask your questions early. Marrying elsewhere? Check the rules of the country where the legal ceremony will happen.</p>

<h3>Which town can you marry in?</h3>
<p>One with which at least one of you has a lasting connection: where one of you lives or is resident, or where one of your parents lives or is resident. The ceremony takes place at the town hall, or in a municipal building chosen by the mayor, such as the local village hall.</p>

<h3>The marriage file</h3>
<p>You collect it at the town hall or download it from the town’s website. The most common documents:</p>
<ul>
  <li>ID for each of you;</li>
  <li>proof of address or residence;</li>
  <li>a full copy or extract of your birth certificate, <strong>less than 3 months old</strong> if issued in France (less than 6 months if issued abroad);</li>
  <li>details of your witnesses (name, date and place of birth, occupation, address) and a copy of their ID;</li>
  <li>the notary’s certificate if you signed a prenuptial agreement.</li>
</ul>
<p>French law requires <strong>at least 2 and at most 4 witnesses</strong>, all adults, related to you or not. If one of you is a foreign national or was born abroad, the town hall may ask for extra documents (certificate of custom, certificate of no impediment, sworn translations, apostille or legalisation depending on the country): allow more time.</p>
<p>Good to know: the pre-marriage medical certificate has not been required since 2008. If an old guide asks for one, it is out of date.</p>

<h3>The interview</h3>
<p>The registrar meets the two of you together, and may also ask to see you separately. The interview is compulsory: it checks that the conditions for marriage are met.</p>

<h3>Publishing the banns</h3>
<p>Once the file is approved, the town hall publishes the banns for <strong>10 days</strong>, at the town hall where you marry and at the town hall of each partner’s home. The wedding cannot take place before the 10th day after publication, and must take place within the following year. An exemption can be requested from the public prosecutor, but only for a serious reason.</p>

<h3>When to submit the file</h3>
<p>The law sets no submission deadline: each town hall runs its own calendar. In practice, many want a complete file one to two months before the date, sometimes more in summer. Do two things:</p>
<ul>
  <li><strong>As soon as the venue is booked</strong>, call the town hall to hold the date and time, and ask for its submission deadline.</li>
  <li><strong>About 3 to 4 months out</strong>, order your birth certificates (they must be under 3 months old when submitted), then file within the deadline.</li>
</ul>

<h3>Prenups, religious and celebrant-led ceremonies</h3>
<ul>
  <li><strong>Prenuptial agreement:</strong> signed at a notary’s office before the wedding. Without one, French couples are married under the default regime of community of property limited to assets acquired during the marriage. Book at least two to three months ahead to discuss it.</li>
  <li><strong>Religious wedding:</strong> it takes place after the civil ceremony, often the same day. For a Catholic wedding, French dioceses recommend contacting the parish about a year ahead, to allow for marriage preparation.</li>
  <li><strong>Celebrant-led ceremony:</strong> it has no legal value in France. The town hall ceremony remains compulsory, possibly a few days earlier with a small group.</li>
</ul>

<h2 id="budget">How to split your wedding budget</h2>
<p>Estimates of the average cost of a wedding in France often land around €15,000 to €20,000, but real budgets vary enormously, from a few thousand euros to far more. Rather than a figure, work with proportions. Here are the ranges most wedding guides agree on:</p>
<table>
<thead><tr><th>Category</th><th>Share of budget</th><th>On €15,000</th></tr></thead>
<tbody>
<tr><td><strong>Venue</strong></td><td>20 to 30%</td><td>€3,000 to €4,500</td></tr>
<tr><td><strong>Catering, drinks and service</strong></td><td>20 to 30%</td><td>€3,000 to €4,500</td></tr>
<tr><td><strong>Photo and video</strong></td><td>8 to 12%</td><td>€1,200 to €1,800</td></tr>
<tr><td><strong>Outfits and beauty</strong></td><td>5 to 10%</td><td>€750 to €1,500</td></tr>
<tr><td><strong>Flowers and decor</strong></td><td>5 to 10%</td><td>€750 to €1,500</td></tr>
<tr><td><strong>Music and entertainment</strong></td><td>5 to 10%</td><td>€750 to €1,500</td></tr>
<tr><td><strong>Rings</strong></td><td>2 to 5%</td><td>€300 to €750</td></tr>
<tr><td><strong>Stationery (save-the-dates, invitations, menus)</strong></td><td>1 to 3%</td><td>€150 to €450</td></tr>
<tr><td><strong>Transport and accommodation</strong></td><td>1 to 3%</td><td>€150 to €450</td></tr>
<tr><td><strong>Contingency</strong></td><td>5 to 10%</td><td>€750 to €1,500</td></tr>
</tbody>
</table>
<p>These ranges don’t add up to 100%: they are benchmarks to adjust to your priorities. Venue and catering together account for close to half the budget at most weddings, which is why the guest count is your biggest lever for saving money. The contingency line is not optional: there is always a last-minute extra.</p>
<p>For the photo side, we break down typical prices and where you can save without regret in our guide to <a href="/journal/budget-photo-mariage">the wedding photography budget</a>.</p>

<h3>The payment schedule</h3>
<p>The budget isn’t spent in one go. Most vendors ask for a deposit at booking (often 20 to 50%), then the balance shortly before or just after the wedding. Log every due date in your spreadsheet: it saves you from five balances landing in the same week.</p>

<h2 id="qui-fait-quoi">Who does what: couple, wedding party, families, planner</h2>
<p>A well-organised wedding is above all a well-shared one. Here is a split that works; adapt it to your people.</p>
<table>
<thead><tr><th>Who</th><th>What they own</th></tr></thead>
<tbody>
<tr><td><strong>The couple</strong></td><td>The decisions: budget, guest list, vendor choices, contracts, legal paperwork, vows. The things you can’t delegate.</td></tr>
<tr><td><strong>Witnesses and wedding party</strong></td><td>Hen and stag dos, support in the final weeks, keeping the rings, speeches, signing the register, announcing activities on the mic, minding the card box.</td></tr>
<tr><td><strong>Families</strong></td><td>Their side of the guest list, welcoming guests, help with set-up and clean-up, sometimes a financial contribution.</td></tr>
<tr><td><strong>Day-of point person</strong></td><td>An organised friend (or your planner): the only contact for vendors on the day, keeper of the schedule.</td></tr>
<tr><td><strong>Wedding planner</strong></td><td>Depending on the package: everything from A to Z, one part only (vendor search, styling), or day-of coordination.</td></tr>
</tbody>
</table>
<p>On "who pays for what", tradition had the bride’s family cover the reception. Today most couples fund the bulk themselves, and families contribute if they wish. What matters is talking about it openly when you set the budget, not when the invoice arrives.</p>
<p>Do you need a wedding planner? If you are short on time, marrying far from home, or hosting a large crowd, it is a real question. We explain <a href="/journal/services-wedding-planner">what a wedding planner does and the different packages</a>.</p>

<h2 id="photos">Photos in your wedding timeline</h2>
<p>Photos are one of the few things still around the day after. So they belong at several points in your timeline, not just when you book the photographer.</p>

<h3>12 months out: book the photographer</h3>
<p>They are among the first vendors to book after the venue, for a simple reason: one wedding a day. Check three things before signing: a full gallery, what time the package ends, and the delivery time written into the contract.</p>

<h3>1 month out: the shot list and group photos</h3>
<p>Bring two lists to your planning meeting: the moments and details you don’t want missed (your <a href="/journal/shot-list-mariage">wedding shot list</a>), and the <a href="/journal/photos-de-groupe-mariage">group photos</a> you want, with names. Also appoint someone who knows both families to round people up: your photographer has no idea who Uncle Gerard is.</p>

<h3>1 to 2 months out: plan the guest photo activity</h3>
<p>Your photographer covers the official moments. The giggles at the back table, grandma on the dance floor at midnight: your guests see those better than anyone. There are several ways to capture them: a photo booth, cardboard disposable cameras on the tables, a shared album where everyone uploads their photos afterwards, or a disposable camera on every guest’s phone. We compare them in our <a href="/journal/comparatif-animations-photo-mariage">wedding photo activity comparison</a>.</p>
<p>If you go for the digital disposable camera, now is the time to set it up. With <a href="/">Time to Flash</a>, for example:</p>
<ul>
  <li><strong>Create your event</strong>: the number of shots per guest (between 3 and 15) and when the album is revealed (the next day by default). It is free for up to 5 guests, enough to test it with your wedding party, then a one-off payment based on guest count (€29.99 for up to 100), no subscription.</li>
  <li><strong>Print the QR codes</strong>: from your dashboard, or with the free <a href="/generateur-qr-code-mariage">QR code poster generator</a>, with your names and date.</li>
  <li><strong>Tell your guests</strong>: one line on the wedding website or invitation, two sentences in the best man’s or maid of honour’s speech. We wrote <a href="/journal/brief-invites">a guest brief you can copy and paste</a>.</li>
</ul>
<p>The difference from a regular shared album: it isn’t a gallery where people drop their photos the next day, it is a game during the party. Each guest gets a limited number of shots, nobody sees the photos before the reveal, and the album opens for everyone at once.</p>

<h3>On the day: place the QR codes</h3>
<p>The day before or that morning, someone places the QR codes where guests have time to scan them: on the tables, at the bar, at the entrance, even in the toilets. All our tests are in <a href="/journal/ou-poser-le-qr-code">where to put the QR code</a>. Also check the phone signal when you visit the venue: if it is weak, read <a href="/journal/pas-de-reseau-salle-mariage">our fixes for venues with no signal</a>.</p>

<h3>The day after: the reveal</h3>
<p>Over brunch or first thing in the morning, the guests’ album opens for everyone at the same time. How to turn it into a real moment is in <a href="/journal/revelation-photos-lendemain-mariage">the day-after photo reveal</a>. Photos stay available for 6 months: download them within the month, along with the photographer’s, and keep the best for your thank-you cards.</p>

<h2 id="resume">The whole timeline, one line per stage</h2>
<ul>
  <li><strong>18 to 12 months:</strong> budget, guests, date, venue.</li>
  <li><strong>12 to 9 months:</strong> photographer, videographer, DJ, celebrant, wedding party, save-the-dates.</li>
  <li><strong>9 to 6 months:</strong> dress, florist, beauty, transport, honeymoon.</li>
  <li><strong>6 to 4 months:</strong> invitations, menu, suit, rings, notary.</li>
  <li><strong>4 to 2 months:</strong> legal paperwork, seating plan, trials, music.</li>
  <li><strong>2 to 1 month:</strong> final headcount, photographer meeting, photo activity, schedule.</li>
  <li><strong>3 weeks to the day before:</strong> confirm, hand over, delegate, sleep.</li>
  <li><strong>Afterwards:</strong> reveal, thank-yous, reviews, photos, paperwork.</li>
</ul>
<p>And if you remember only one thing: book what is unique first, put everything in writing, and hand the wedding day to someone other than yourself. The rest follows.</p>
`,
    faq: [
      {
        q: 'When should you start planning a wedding?',
        a: 'Ideally 12 to 18 months ahead, especially for a Saturday between May and September: that is the window that lets you choose your venue and photographer. You can plan in far less time (6 months, even 3) by staying flexible on the date and simplifying the format.',
      },
      {
        q: 'What should you do 6 months before the wedding?',
        a: 'Six months out, send the invitations with an RSVP deadline, do the caterer tasting, choose the suit and rings, and, if marrying in France, ask the town hall for the marriage file. It is also the time to tell your employer and book a notary if you want a prenuptial agreement.',
      },
      {
        q: 'How far in advance do you submit the marriage file in France?',
        a: 'French law sets no deadline: each town hall has its own, often one to two months before the date, sometimes more in summer. The wedding can only take place from the 10th day after the banns are published. Note that your French birth certificate copy must be less than 3 months old when you submit it.',
      },
      {
        q: 'When should you send save-the-dates and invitations?',
        a: 'Save-the-dates go out 8 to 12 months ahead, especially if guests are travelling. Invitations go out 4 to 6 months ahead, with an RSVP deadline 6 to 8 weeks before the wedding so you can give your caterer a firm number.',
      },
      {
        q: 'Can you plan a wedding in 3 months?',
        a: 'Yes, if you simplify: fewer guests, one all-inclusive venue for ceremony and reception, off-the-rack outfits. If marrying in France, call the town hall in week one, because the file, the interview and the banns take several weeks.',
      },
      {
        q: 'Which wedding vendors should you book first?',
        a: 'The venue first, since it sets the date and capacity. Then those who can only do one wedding a day: photographer, videographer, DJ and celebrant, plus the caterer if the venue does not impose one. Florist, beauty, stationery and rings come after.',
      },
    ],
  },
}

export const POSTS_DE = {}
