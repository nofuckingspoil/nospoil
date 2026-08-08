// ============================================================
//  Pages légales : Mentions légales, CGVU, Politique de confidentialité.
//  Le contenu est du HTML simple, rendu par src/app/(legal)/…/page.js
//  avec la classe .legal-prose (styles dans globals.css).
//
//  Pour modifier un texte : c'est ici, et nulle part ailleurs.
//  Pensez à mettre à jour `updated` à chaque changement de fond.
// ============================================================

export const LEGAL_UPDATED = '8 août 2026'

export const COMPANY = {
  name: 'BLACK BY C',
  form: 'Société par actions simplifiée unipersonnelle (SASU) au capital de 300 €',
  address: '2 impasse des Ligures, 44840 Les Sorinières, France',
  rcs: 'RCS de Nantes 898 409 446',
  siret: '898 409 446 00017',
  ape: '70.10Z',
  vat: 'FR27898409446',
  email: 'support@timetoflash.fr',
  director: 'Clément LEMERLE',
}

// ------------------------------------------------------------
//  Mentions légales
// ------------------------------------------------------------

const mentionsLegales = {
  slug: 'mentions-legales',
  title: 'Mentions légales',
  description: "Éditeur, directeur de la publication, hébergeurs et propriété intellectuelle du service Time to Flash.",
  html: `
<h2>1. Éditeur du site</h2>
<p>Le site <strong>timetoflash.fr</strong> et le service Time to Flash sont édités par :</p>
<p>
  <strong>BLACK BY C</strong><br />
  Société par actions simplifiée unipersonnelle (SASU) au capital de 300 €<br />
  Siège social : 2 impasse des Ligures, 44840 Les Sorinières, France<br />
  Immatriculée au Registre du Commerce et des Sociétés de Nantes sous le numéro <strong>898 409 446</strong><br />
  SIRET (siège) : 898 409 446 00017<br />
  Code APE : 70.10Z<br />
  Numéro de TVA intracommunautaire : FR27898409446
</p>
<p>Adresse électronique : <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>2. Directeur de la publication</h2>
<p>Monsieur <strong>Clément LEMERLE</strong>, en qualité de Président de la société BLACK BY C.</p>

<h2>3. Hébergement</h2>
<p>Le site est hébergé par :</p>
<p>
  <strong>Vercel, Inc.</strong><br />
  340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
  <a href="https://vercel.com" rel="nofollow noreferrer" target="_blank">vercel.com</a>
</p>
<p>Les données applicatives et les contenus déposés par les utilisateurs sont hébergés par :</p>
<ul>
  <li><strong>Supabase, Inc.</strong>, société de droit américain, base de données et authentification (<a href="https://supabase.com" rel="nofollow noreferrer" target="_blank">supabase.com</a>)</li>
  <li><strong>Cloudflare, Inc.</strong>, stockage des fichiers (Cloudflare R2), 101 Townsend St, San Francisco, CA 94107, États-Unis (<a href="https://www.cloudflare.com" rel="nofollow noreferrer" target="_blank">cloudflare.com</a>)</li>
</ul>
<p>Les données et contenus sont stockés dans la région <strong>Europe de l'Ouest</strong>.</p>

<h2>4. Propriété intellectuelle</h2>
<p>La marque « Time to Flash », le nom de domaine timetoflash.fr, la charte graphique, les textes, les visuels, la structure du site, les bases de données et le code source constituent la propriété exclusive de BLACK BY C ou font l'objet d'une licence à son profit.</p>
<p>Toute reproduction, représentation, modification, adaptation ou exploitation, totale ou partielle, de ces éléments, par quelque procédé que ce soit et sur quelque support que ce soit, sans l'autorisation écrite préalable de BLACK BY C, est interdite et constituerait une contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
<p>Les photographies déposées par les utilisateurs demeurent la propriété de leurs auteurs respectifs. BLACK BY C ne dispose sur ces contenus que des droits strictement nécessaires à la fourniture du service, dans les conditions prévues aux <a href="/cgv">Conditions Générales de Vente et d'Utilisation</a>.</p>

<h2>5. Responsabilité</h2>
<p>BLACK BY C s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, sans pouvoir en garantir l'exhaustivité ni l'absence totale d'erreur. BLACK BY C se réserve le droit de corriger le contenu du site à tout moment et sans préavis.</p>
<p>L'utilisateur reconnaît utiliser le site sous sa responsabilité exclusive. BLACK BY C ne saurait être tenue responsable des dommages résultant d'une utilisation non conforme du site ou du service, ni d'une interruption imputable au réseau internet, à l'équipement de l'utilisateur ou à un cas de force majeure.</p>

<h2>6. Liens hypertextes</h2>
<p>Le site peut contenir des liens vers des sites tiers. BLACK BY C n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu, leurs pratiques ou leur politique de confidentialité.</p>

<h2>7. Données personnelles et cookies</h2>
<p>Le traitement des données personnelles est décrit dans la <a href="/politique-de-confidentialite">Politique de confidentialité</a>.</p>
<p>Les cookies strictement nécessaires au fonctionnement du service (session, authentification, sécurité) ne requièrent pas de consentement préalable au titre de l'article 82 de la loi Informatique et Libertés.</p>
<p>Le site utilise en outre des <strong>traceurs de mesure d'audience et de publicité</strong> (Meta, Google), qui ne sont déposés qu'après votre <strong>consentement exprès</strong>, recueilli au moyen du bandeau affiché lors de votre première visite. Votre choix est modifiable à tout moment via le lien « Cookies » du pied de page. Le détail figure dans la <a href="/politique-de-confidentialite">Politique de confidentialité</a>.</p>

<h2>8. Signalement d'un contenu illicite</h2>
<p>Conformément au règlement (UE) 2022/2065 sur les services numériques et à la loi n° 2004-575 du 21 juin 2004, tout contenu illicite hébergé sur le service peut être signalé à l'adresse <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, en précisant l'URL ou l'identifiant de l'événement concerné, la nature du contenu litigieux et les motifs du signalement.</p>

<h2>9. Droit applicable</h2>
<p>Les présentes mentions légales sont soumises au droit français.</p>
`,
}

// ------------------------------------------------------------
//  CGVU
// ------------------------------------------------------------

const cgv = {
  slug: 'cgv',
  title: "Conditions Générales de Vente et d'Utilisation",
  shortTitle: 'CGV',
  description: "Formules, prix, paiement, droit de rétractation, conservation des photos et responsabilités du service Time to Flash.",
  html: `
<h2>Article 1 : Objet</h2>
<p>Les présentes Conditions Générales de Vente et d'Utilisation (les « <strong>CGVU</strong> ») régissent la vente et l'utilisation du service <strong>Time to Flash</strong>, accessible à l'adresse timetoflash.fr.</p>
<p>Elles s'appliquent à toute création d'événement, gratuite ou payante, à l'exclusion de toute autre condition. Le fait de créer un événement emporte acceptation pleine et entière des présentes CGVU.</p>

<h2>Article 2 : Identification du vendeur</h2>
<p><strong>BLACK BY C</strong>, SASU au capital de 300 €, dont le siège social est situé 2 impasse des Ligures, 44840 Les Sorinières, immatriculée au RCS de Nantes sous le numéro 898 409 446, TVA intracommunautaire FR27898409446.</p>
<p>Contact : <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>Article 3 : Définitions</h2>
<ul>
  <li><strong>Service</strong> : la solution Time to Flash permettant de collecter les photographies prises par les participants d'un événement et de les révéler après celui-ci.</li>
  <li><strong>Organisateur</strong> : la personne physique ou morale qui crée un Événement et, le cas échéant, règle le prix correspondant.</li>
  <li><strong>Participant</strong> : toute personne accédant à un Événement au moyen du lien ou du QR code communiqué par l'Organisateur, et déposant des contenus.</li>
  <li><strong>Événement</strong> : l'espace créé par l'Organisateur, associé à une Formule et à un nombre maximal de Participants.</li>
  <li><strong>Contenus</strong> : les photographies déposées par les Participants.</li>
  <li><strong>Révélation</strong> : le moment, fixé par l'Organisateur lors de la création de l'Événement, à compter duquel les Contenus deviennent accessibles à l'Organisateur et aux Participants.</li>
</ul>

<h2>Article 4 : Description du Service</h2>
<p>Le Service permet à l'Organisateur de créer un Événement, d'inviter des participants au moyen d'un lien ou d'un QR code, et de collecter les Contenus déposés par ces derniers.</p>
<p>Les caractéristiques essentielles du Service sont les suivantes :</p>
<ul>
  <li><strong>Nombre de prises par Participant</strong> : fixé par l'Organisateur entre <strong>3 et 15 clichés</strong>, identique pour tous les Participants d'un même Événement. Il reste modifiable jusqu'au début de l'Événement, après quoi il est figé. L'Organisateur peut en outre autoriser une <strong>recharge unique</strong> de 1 à 5 clichés supplémentaires, que chaque Participant ayant épuisé ses prises peut demander une seule fois ; cette recharge peut être refusée par l'Organisateur.</li>
  <li><strong>Formats acceptés</strong> : <strong>photographies uniquement</strong>, à l'exclusion des vidéos et des enregistrements sonores. Les images déposées sont automatiquement redimensionnées et compressées.</li>
  <li><strong>Nombre maximal de Participants</strong> : déterminé par la Formule choisie, selon le tableau de l'article 5.</li>
  <li><strong>Accès</strong> : depuis un navigateur web, sans installation d'application, tant pour l'Organisateur que pour les Participants.</li>
</ul>
<p>Les Contenus ne sont pas consultables pendant l'Événement : ils sont révélés à la date de Révélation choisie par l'Organisateur.</p>
<p>L'utilisation du Service suppose un équipement compatible disposant d'un appareil photo et d'une connexion internet, dont l'Organisateur et les Participants font leur affaire personnelle.</p>

<h2>Article 5 : Formules et prix</h2>
<table>
  <thead>
    <tr><th>Formule</th><th>Nombre maximal de Participants</th><th>Prix</th></tr>
  </thead>
  <tbody>
    <tr><td>Découverte</td><td>5</td><td>Gratuit, sans carte bancaire</td></tr>
    <tr><td>10 participants</td><td>10</td><td>1,99 €</td></tr>
    <tr><td>30 participants</td><td>30</td><td>4,99 €</td></tr>
    <tr><td>50 participants</td><td>50</td><td>14,99 €</td></tr>
    <tr><td>100 participants</td><td>100</td><td>29,99 €</td></tr>
    <tr><td>150 participants</td><td>150</td><td>34,99 €</td></tr>
    <tr><td>200 participants</td><td>200</td><td>39,99 €</td></tr>
    <tr><td>300 participants</td><td>300 et au-delà</td><td>59,99 €</td></tr>
  </tbody>
</table>
<p>Les prix sont indiqués <strong>en euros, toutes taxes comprises</strong>. Aucun abonnement n'est souscrit : chaque Formule donne lieu à un <strong>paiement unique</strong>, dû à la création de l'Événement.</p>
<p>BLACK BY C se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au jour de la création de l'Événement.</p>
<p><strong>Dépassement du nombre de Participants.</strong> Le nombre maximal de Participants de la Formule n'empêche jamais un Participant de rejoindre l'Événement ni de prendre des photographies : aucun blocage n'intervient pendant l'Événement, et toutes les photographies sont conservées. En revanche, lorsque le nombre de Participants effectivement inscrits dépasse celui de la Formule souscrite, <strong>l'ouverture de l'album aux Participants (la « révélation ») est suspendue</strong> jusqu'à ce que l'Organisateur souscrive la Formule correspondant au nombre réel de Participants. Cette mise à niveau ne donne lieu au règlement que de la <strong>différence de prix</strong> entre la Formule souscrite et la Formule requise, le montant déjà réglé restant acquis. L'Organisateur en est informé sur son tableau de bord ainsi que par courrier électronique. Aucune suspension n'est appliquée lorsque l'Organisateur a souscrit la Formule la plus élevée, qui n'est assortie d'aucune limite de nombre de Participants.</p>

<h2>Article 6 : Commande et formation du contrat</h2>
<p>La création d'un Événement suppose la saisie des informations demandées, la validation de la Formule choisie et, pour les Formules payantes, le règlement du prix.</p>
<p>Avant toute validation, l'Organisateur a la possibilité de vérifier le détail de sa commande et d'en corriger les éventuelles erreurs. La validation de la commande, précédée de l'acceptation expresse des présentes CGVU, vaut conclusion du contrat.</p>
<p>Un courrier électronique de confirmation récapitulant la commande est adressé à l'Organisateur.</p>

<h2>Article 7 : Paiement</h2>
<p>Le paiement s'effectue en ligne par carte bancaire, par l'intermédiaire du prestataire <strong>Stripe Payments Europe, Ltd.</strong></p>
<p>BLACK BY C n'a accès à aucune donnée de carte bancaire, celles-ci étant collectées et traitées directement par Stripe selon ses propres conditions.</p>
<p>L'Événement est activé dès l'encaissement effectif du paiement.</p>

<h2>Article 8 : Durée et disponibilité de l'Événement</h2>
<p>L'Organisateur dispose d'un délai de <strong>douze (12) mois</strong> à compter du paiement pour organiser son Événement et l'utiliser. Passé ce délai, la Formule est réputée consommée et ne donne lieu à aucun remboursement ni report.</p>
<p>Les Contenus sont conservés puis <strong>supprimés automatiquement six (6) mois après la date de l'Événement</strong>. Pour l'application des présentes, la date de l'Événement s'entend de la <strong>date de Révélation</strong> choisie par l'Organisateur lors de la création de l'Événement : c'est cette date qui fait courir le délai de six mois.</p>
<p>Il appartient à l'Organisateur de télécharger les Contenus qu'il souhaite conserver avant l'expiration de ce délai. Cette suppression est définitive et irréversible.</p>

<h2>Article 9 : Droit de rétractation</h2>
<h3>9.1 Principe</h3>
<p>Conformément à l'article L.221-18 du Code de la consommation, l'Organisateur consommateur dispose en principe d'un délai de quatorze (14) jours à compter de la conclusion du contrat pour exercer son droit de rétractation, sans avoir à motiver sa décision.</p>
<h3>9.2 Renonciation expresse</h3>
<p>Le Service étant fourni immédiatement après le paiement, l'Organisateur est invité, lors de la commande, à <strong>demander expressément l'exécution immédiate du Service et à renoncer à son droit de rétractation</strong>, au moyen d'une case à cocher distincte et non pré-cochée, libellée comme suit :</p>
<blockquote>« Je demande la création immédiate de mon événement et je renonce à mon droit de rétractation de 14 jours. »</p>
<p>Cocher cette case vaut, au sens de l'article L.221-28 du Code de la consommation, demande expresse d'exécution immédiate du Service avant l'expiration du délai de rétractation et renonciation expresse à ce droit, l'Organisateur reconnaissant qu'il le perdra une fois le Service pleinement exécuté.</blockquote>
<p>En l'absence de cette renonciation, le droit de rétractation demeure applicable et peut être exercé par tout moyen dénué d'ambiguïté à l'adresse support@timetoflash.fr, ou au moyen du formulaire type figurant en <strong>Annexe 1</strong>.</p>
<h3>9.3 Effets</h3>
<p>Lorsque l'Organisateur exerce son droit de rétractation alors que l'exécution du Service a commencé à sa demande expresse, il est redevable d'un montant proportionnel au service fourni jusqu'à la communication de sa décision, conformément à l'article L.221-25 du Code de la consommation.</p>
<p>Le remboursement intervient dans un délai maximal de quatorze (14) jours à compter de la réception de la demande, par le même moyen de paiement que celui utilisé lors de la commande.</p>

<h2>Article 10 : Remboursement</h2>
<p>En dehors des cas prévus à l'article 9 et des garanties légales visées à l'article 13, <strong>aucun remboursement n'est accordé</strong>.</p>
<p>En particulier, aucun remboursement ne peut être demandé dès lors qu'au moins un Participant a déposé un Contenu au sein de l'Événement, le Service étant alors réputé exécuté.</p>
<p>Ces stipulations ne font pas obstacle à la mise en œuvre des garanties légales, qui demeurent applicables en toute hypothèse.</p>

<h2>Article 11 : Obligations de l'Organisateur</h2>
<p>L'Organisateur garantit :</p>
<ol>
  <li><strong>Informer les Participants</strong>, préalablement à leur participation, de la finalité de la collecte, de la durée de conservation des Contenus et de leurs droits sur leurs données personnelles ;</li>
  <li><strong>Recueillir les autorisations nécessaires au titre du droit à l'image</strong> (article 9 du Code civil) auprès des personnes figurant sur les Contenus, et notamment auprès des représentants légaux des mineurs ;</li>
  <li>Ne pas détourner le Service de son objet, ni l'utiliser à des fins illicites ;</li>
  <li>Ne pas diffuser les Contenus au-delà du cercle des personnes ayant consenti à leur diffusion.</li>
</ol>
<p>L'Organisateur est seul responsable de l'usage qu'il fait des Contenus après leur téléchargement. Il garantit BLACK BY C contre toute réclamation de tiers fondée sur les Contenus déposés au sein de son Événement.</p>

<h2>Article 12 : Contenus et modération</h2>
<p>Sont strictement interdits les Contenus à caractère illicite, et notamment ceux présentant un caractère pédopornographique, violent, haineux, diffamatoire, portant atteinte à la vie privée ou au droit à l'image d'un tiers, ou contrefaisant.</p>
<p>BLACK BY C agit en qualité d'hébergeur au sens de l'article 6 de la loi n° 2004-575 du 21 juin 2004. Elle n'exerce aucune surveillance générale des Contenus mais s'engage à retirer promptement tout Contenu manifestement illicite porté à sa connaissance à l'adresse support@timetoflash.fr.</p>
<p>Chaque Participant peut supprimer ses propres Contenus avant la Révélation. L'Organisateur dispose également d'une faculté de retrait des Contenus déposés au sein de son Événement.</p>
<p>BLACK BY C se réserve le droit de suspendre ou de supprimer, sans préavis ni remboursement, tout Événement manifestement contraire aux présentes CGVU ou à la loi.</p>

<h2>Article 13 : Garanties légales</h2>
<p>BLACK BY C est tenue des défauts de conformité du contenu numérique et du service numérique dans les conditions prévues aux articles <strong>L.224-25-12 et suivants du Code de la consommation</strong>.</p>
<p>Pour les services numériques fournis de manière continue, la garantie légale de conformité s'applique pendant toute la durée de la fourniture.</p>
<p>L'Organisateur consommateur dispose d'un délai de deux ans à compter de la fourniture pour obtenir la mise en conformité du service. Il peut, dans les conditions légales, obtenir une réduction du prix ou la résolution du contrat.</p>
<p>BLACK BY C est également tenue de la garantie contre les vices cachés dans les conditions des articles 1641 et suivants du Code civil.</p>
<p>Aucune stipulation des présentes CGVU ne peut avoir pour effet de limiter ou d'exclure ces garanties.</p>

<h2>Article 14 : Disponibilité et responsabilité</h2>
<p>BLACK BY C met en œuvre les moyens raisonnables pour assurer la disponibilité et la continuité du Service, sans être tenue à une obligation de résultat.</p>
<p>Le Service peut être interrompu pour des opérations de maintenance, en cas de défaillance d'un prestataire technique, ou en cas de force majeure. BLACK BY C s'efforce d'informer les Organisateurs de toute interruption programmée significative.</p>
<p>BLACK BY C ne saurait être tenue responsable de la perte de Contenus résultant d'une suppression automatique à l'expiration des délais prévus à l'article 8, d'une manipulation de l'Organisateur ou d'un Participant, ou d'un défaut de téléchargement dans les délais.</p>
<p>En tout état de cause, la responsabilité de BLACK BY C, si elle venait à être engagée, est limitée au montant effectivement réglé par l'Organisateur au titre de l'Événement concerné, sauf faute lourde, dol ou dommage corporel.</p>

<h2>Article 15 : Propriété intellectuelle et licence sur les Contenus</h2>
<p>Les Contenus demeurent la propriété de leurs auteurs.</p>
<p>L'Organisateur et les Participants concèdent à BLACK BY C une licence non exclusive, gratuite et limitée à la durée d'hébergement des Contenus, aux seules fins de stockage, de traitement technique et de mise à disposition au sein de l'Événement. Cette licence exclut toute exploitation commerciale, promotionnelle ou publicitaire.</p>
<p>Toute utilisation d'un Contenu à des fins de communication par BLACK BY C suppose l'accord écrit, préalable et spécifique de l'Organisateur et des personnes concernées.</p>

<h2>Article 16 : Données personnelles</h2>
<p>Le traitement des données personnelles est décrit dans la <a href="/politique-de-confidentialite">Politique de confidentialité</a>.</p>
<p>Pour les Contenus déposés au sein d'un Événement, BLACK BY C agit en qualité de <strong>sous-traitant</strong> de l'Organisateur, dans les conditions définies à l'<strong>Annexe 2</strong> des présentes.</p>

<h2>Article 17 : Modification des CGVU</h2>
<p>BLACK BY C peut modifier les présentes CGVU à tout moment. La version applicable est celle en vigueur au jour de la création de l'Événement, dont une copie est adressée à l'Organisateur ou reste accessible sur le site.</p>

<h2>Article 18 : Réclamations et médiation de la consommation</h2>
<p>Toute réclamation doit être adressée en premier lieu à BLACK BY C, à l'adresse <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>. BLACK BY C s'engage à y répondre dans un délai raisonnable.</p>
<p>Conformément à l'article L.612-1 du Code de la consommation, l'Organisateur consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige, après avoir adressé une réclamation écrite préalable à BLACK BY C.</p>
<p>Les coordonnées du médiateur de la consommation compétent seront publiées dans le présent article dès l'adhésion de BLACK BY C au dispositif de médiation, en cours de mise en place.</p>
<p>L'Organisateur consommateur peut également recourir à la plateforme européenne de règlement en ligne des litiges, accessible à l'adresse <a href="https://ec.europa.eu/consumers/odr" rel="nofollow noreferrer" target="_blank">ec.europa.eu/consumers/odr</a>.</p>

<h2>Article 19 : Droit applicable et juridiction</h2>
<p>Les présentes CGVU sont soumises au droit français.</p>
<p>À défaut de résolution amiable, tout litige relève de la compétence des juridictions françaises. Le consommateur peut saisir, à son choix, la juridiction du lieu de son domicile ou celle du lieu du siège de BLACK BY C.</p>

<hr />

<h2>Annexe 1 : Formulaire type de rétractation</h2>
<blockquote>
  <p>À l'attention de BLACK BY C, 2 impasse des Ligures, 44840 Les Sorinières (support@timetoflash.fr)</p>
  <p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de service ci-dessous :</p>
  <p>
    Commandé le : ……………………<br />
    Référence de l'événement : ……………………<br />
    Nom de l'Organisateur : ……………………<br />
    Adresse : ……………………<br />
    Date : ……………………<br />
    Signature (uniquement en cas de notification papier) : ……………………
  </p>
</blockquote>

<h2>Annexe 2 : Accord de sous-traitance (article 28 du RGPD)</h2>
<h3>1. Rôles</h3>
<p>Pour les Contenus déposés par les Participants et les données associées, <strong>l'Organisateur agit en qualité de responsable de traitement</strong> et <strong>BLACK BY C en qualité de sous-traitant</strong>.</p>
<p>BLACK BY C demeure responsable de traitement pour les données relatives à la gestion de son propre compte client (identification de l'Organisateur, facturation, support).</p>

<h3>2. Objet, durée et nature du traitement</h3>
<ul>
  <li><strong>Objet</strong> : collecte, hébergement, mise à disposition différée et suppression des Contenus déposés au sein d'un Événement.</li>
  <li><strong>Durée</strong> : durée de l'Événement, augmentée de la période de conservation prévue à l'article 8.</li>
  <li><strong>Nature des opérations</strong> : collecte, enregistrement, stockage, organisation, consultation, transmission, effacement.</li>
  <li><strong>Catégories de personnes concernées</strong> : Organisateur, Participants, et toute personne figurant sur les Contenus.</li>
  <li><strong>Catégories de données</strong> : images de personnes physiques, prénom ou pseudonyme, horodatage, adresse électronique de l'Organisateur, adresse électronique facultative des Participants (accès à ses propres photographies et envoi du lien de l'album), numéros de téléphone recueillis avant l'abandon de cette collecte, données techniques de connexion.</li>
</ul>
<p><strong>Hors du champ du présent accord</strong> : les réponses données par l'Organisateur ou par les Participants à l'enquête de satisfaction portant sur le Service lui-même. Ces réponses ne sont pas traitées pour le compte de l'Organisateur mais pour celui de BLACK BY C, qui en est responsable de traitement ; elles ne sont jamais communiquées à l'Organisateur. Les conditions en sont détaillées à l'article 3.3 de la politique de confidentialité.</p>

<h3>3. Obligations de BLACK BY C</h3>
<p>BLACK BY C s'engage à :</p>
<ol>
  <li>traiter les données uniquement sur instruction documentée de l'Organisateur, et pour les seules finalités décrites ci-dessus ;</li>
  <li>garantir la confidentialité des données et n'y donner accès qu'aux personnes habilitées ;</li>
  <li>mettre en œuvre des mesures techniques et organisationnelles appropriées (chiffrement en transit, contrôle d'accès, isolation des Événements, journalisation) ;</li>
  <li>assister l'Organisateur dans la réponse aux demandes d'exercice de droits des personnes concernées ;</li>
  <li>notifier l'Organisateur dans les meilleurs délais de toute violation de données ;</li>
  <li>supprimer les données au terme de la prestation, dans les conditions de l'article 8 ;</li>
  <li>mettre à disposition les informations nécessaires pour démontrer le respect de ses obligations.</li>
</ol>

<h3>4. Sous-traitants ultérieurs</h3>
<p>L'Organisateur autorise BLACK BY C à recourir aux sous-traitants ultérieurs suivants :</p>
<table>
  <thead>
    <tr><th>Sous-traitant</th><th>Rôle</th><th>Localisation des données</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>hébergement applicatif</td><td>Europe</td></tr>
    <tr><td>Supabase, Inc.</td><td>base de données, authentification</td><td>Europe de l'Ouest</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>stockage des Contenus (R2)</td><td>Europe de l'Ouest</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>traitement des paiements</td><td>Union européenne</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>envoi des courriers électroniques transactionnels</td><td>Union européenne (France)</td></tr>
  </tbody>
</table>
<p>BLACK BY C informe l'Organisateur de tout changement envisagé, celui-ci disposant d'un délai raisonnable pour formuler des objections.</p>

<h3>5. Transferts hors Union européenne</h3>
<p>Certains des prestataires susvisés sont des sociétés de droit américain susceptibles d'accéder aux données depuis les États-Unis à des fins d'administration technique. Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne et, le cas échéant, par la certification au <em>Data Privacy Framework</em>.</p>

<h3>6. Information des Participants</h3>
<p>L'Organisateur reconnaît qu'il lui appartient d'informer les Participants et de disposer d'une base légale pour le traitement.</p>
<p>BLACK BY C met à disposition, au sein de l'interface de dépôt, une mention d'information à destination des Participants, pour le compte et au nom de l'Organisateur.</p>
`,
}

// ------------------------------------------------------------
//  Politique de confidentialité
// ------------------------------------------------------------

const confidentialite = {
  slug: 'politique-de-confidentialite',
  title: 'Politique de confidentialité',
  description: "Quelles données Time to Flash traite, pourquoi, pendant combien de temps, et comment exercer vos droits.",
  html: `
<p class="legal-lead">Time to Flash est un service qui collecte des photographies prises par les participants d'un événement et les révèle après celui-ci. Ce document explique quelles données sont traitées, pourquoi, pendant combien de temps, et quels sont vos droits.</p>

<h2>1. Qui traite vos données</h2>
<p><strong>BLACK BY C</strong>, SASU au capital de 300 €, 2 impasse des Ligures, 44840 Les Sorinières, RCS Nantes 898 409 446.</p>
<p>Contact : <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>
<p>BLACK BY C n'a pas désigné de délégué à la protection des données, cette désignation n'étant pas obligatoire au regard de son activité. Toute question relative aux données personnelles peut être adressée à l'adresse ci-dessus.</p>

<h2>2. Deux situations à distinguer</h2>
<p><strong>Lorsque vous créez un événement</strong> (vous êtes « Organisateur »), BLACK BY C traite vos données pour son propre compte : elle est <strong>responsable de traitement</strong>.</p>
<p><strong>Lorsque des participants déposent des photographies au sein d'un événement</strong>, c'est l'Organisateur qui décide de la collecte, invite les participants et détermine qui accède aux contenus. BLACK BY C n'intervient alors qu'en qualité de <strong>sous-traitant</strong>, sur instruction de l'Organisateur. Les demandes relatives à ces contenus doivent être adressées en priorité à l'Organisateur de l'événement concerné, BLACK BY C prêtant son assistance pour y répondre.</p>
<p><strong>Une exception : les réponses à l'enquête de satisfaction.</strong> Lorsqu'un Organisateur ou un Participant donne son avis sur le service lui-même, il s'adresse à BLACK BY C et non à l'Organisateur de l'événement. BLACK BY C est alors <strong>responsable de traitement</strong>, et l'Organisateur de l'événement n'a jamais accès à ces réponses. Le détail figure à l'article 3.3.</p>

<h2>3. Données traitées et finalités</h2>
<h3>3.1 Organisateur</h3>
<table>
  <thead>
    <tr><th>Données</th><th>Finalité</th><th>Base légale</th><th>Conservation</th></tr>
  </thead>
  <tbody>
    <tr><td>Adresse électronique, nom ou prénom</td><td>création et gestion du compte, envoi des accès à l'événement</td><td>exécution du contrat</td><td>3 ans à compter du dernier contact</td></tr>
    <tr><td>Données de commande et de facturation</td><td>gestion de la commande, obligations comptables</td><td>exécution du contrat et obligation légale</td><td>10 ans (article L.123-22 du Code de commerce)</td></tr>
    <tr><td>Adresse électronique, contenu des échanges</td><td>traitement des demandes de support</td><td>intérêt légitime</td><td>3 ans à compter du dernier contact</td></tr>
    <tr><td>Acceptation des CGV et, le cas échéant, renonciation au droit de rétractation (horodatage, version des CGV)</td><td>preuve du consentement contractuel</td><td>exécution du contrat et intérêt légitime</td><td>10 ans (durée de prescription commerciale)</td></tr>
    <tr><td>Journaux de connexion techniques</td><td>sécurité du service, prévention des abus</td><td>intérêt légitime</td><td>12 mois</td></tr>
  </tbody>
</table>
<p>Les données de carte bancaire ne sont <strong>jamais</strong> collectées ni conservées par BLACK BY C. Elles sont traitées directement par Stripe.</p>

<h3>3.2 Participants</h3>
<table>
  <thead>
    <tr><th>Données</th><th>Finalité</th><th>Conservation</th></tr>
  </thead>
  <tbody>
    <tr><td>Photographies</td><td>constitution de la galerie de l'événement</td><td>6 mois après la date de révélation, puis suppression automatique</td></tr>
    <tr><td>Prénom ou pseudonyme saisi</td><td>identification des contributions au sein de l'événement</td><td>idem</td></tr>
    <tr><td><strong>Adresse électronique</strong> (facultative)</td><td>envoi, une seule fois, d'un lien d'accès personnel permettant au Participant de retrouver ses propres photographies et ses prises restantes depuis un autre appareil ; envoi du lien de l'album au moment de la révélation ; envoi, une seule fois et sans relance, d'un questionnaire de satisfaction (article 3.3)</td><td>idem</td></tr>
    <tr><td>Numéro de téléphone (facultatif, plus collecté)</td><td>transmission du lien de l'album par l'Organisateur</td><td>idem</td></tr>
    <tr><td>Horodatage, données techniques de connexion</td><td>fonctionnement et sécurité du service</td><td>12 mois</td></tr>
  </tbody>
</table>
<p>Aucun compte n'est requis pour déposer un contenu en tant que participant.</p>
<p>La saisie d'une adresse électronique est <strong>facultative</strong> : le participant peut participer sans la renseigner. Elle sert à lui adresser le lien de l'album lorsque les photographies sont révélées, ainsi que, le cas échéant, le questionnaire de satisfaction décrit à l'article 3.3. Elle n'est utilisée à <strong>aucune fin de prospection commerciale</strong>, n'est jamais transmise à un tiers, et est supprimée avec l'événement.</p>
<p>La collecte du numéro de téléphone a été abandonnée. Les numéros recueillis avant ce changement restent soumis aux mêmes règles et sont supprimés avec l'événement auquel ils se rattachent. Cette collecte ne concernait que les Participants : un Organisateur peut, s'il le souhaite, communiquer son propre numéro dans le questionnaire de satisfaction, dans les conditions prévues à l'article 3.3.</p>
<p>Les photographies sont susceptibles de révéler des informations sensibles : pratique religieuse lors d'une cérémonie, état de santé apparent, appartenance supposée à un groupe. BLACK BY C n'exploite jamais ces informations et n'opère aucune analyse du contenu des images, aucune reconnaissance faciale, aucun profilage.</p>

<h3>3.3 Enquête de satisfaction</h3>
<p>BLACK BY C interroge les Organisateurs et les Participants sur leur expérience du service, afin de corriger ce qui ne fonctionne pas et d'orienter ses développements. Pour ce traitement, BLACK BY C agit en qualité de <strong>responsable de traitement</strong> : les réponses la concernent, elles ne sont <strong>jamais communiquées à l'Organisateur de l'événement</strong>, ni à aucun autre participant.</p>
<table>
  <thead>
    <tr><th>Données</th><th>Finalité</th><th>Base légale</th><th>Conservation</th></tr>
  </thead>
  <tbody>
    <tr><td>Réponses au questionnaire (appréciation, difficultés rencontrées, commentaires libres)</td><td>amélioration du service et correction des dysfonctionnements</td><td>intérêt légitime</td><td>3 ans à compter de la réponse</td></tr>
    <tr><td>Type d'appareil et navigateur utilisés</td><td>reproduire et corriger les difficultés techniques signalées</td><td>intérêt légitime</td><td>3 ans à compter de la réponse</td></tr>
    <tr><td>Numéro de téléphone de l'Organisateur (facultatif)</td><td>entretien téléphonique de quelques minutes, uniquement s'il a été expressément accepté</td><td>consentement</td><td>supprimé après l'entretien, et au plus tard 6 mois après la réponse</td></tr>
  </tbody>
</table>
<p>La participation à l'enquête est <strong>entièrement facultative</strong> et ne conditionne l'accès à aucune fonctionnalité : refuser d'y répondre, ou ne pas répondre du tout, n'a aucune conséquence sur le service rendu.</p>
<p>Un questionnaire n'est envoyé par courrier électronique qu'<strong>une seule fois</strong>, et aucune relance ne suit. Chaque message comporte un lien permettant de ne plus recevoir de sollicitation de ce type, avec effet immédiat ; ce refus ne fait pas obstacle à l'envoi du lien de l'album, qui reste dû au Participant ayant laissé son adresse. Ces messages ne comportent aucune offre commerciale.</p>
<p>Les réponses sont conservées après la suppression de l'événement auquel elles se rapportent, mais <strong>détachées de celui-ci</strong> : elles ne permettent alors plus d'identifier l'événement ni son organisateur, et ne servent qu'à mesurer l'évolution de la qualité du service dans le temps.</p>

<h2>4. Destinataires et sous-traitants</h2>
<p>Les données ne sont ni vendues, ni louées, ni communiquées à des tiers à des fins publicitaires ou commerciales.</p>
<p>Elles sont accessibles aux prestataires techniques suivants, agissant sur instruction de BLACK BY C :</p>
<table>
  <thead>
    <tr><th>Prestataire</th><th>Rôle</th><th>Localisation</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>hébergement du site et de l'application</td><td>Europe</td></tr>
    <tr><td>Supabase, Inc.</td><td>base de données et authentification</td><td>Europe de l'Ouest</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>stockage des fichiers (R2)</td><td>Europe de l'Ouest</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>traitement des paiements</td><td>Union européenne</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>envoi des courriers électroniques transactionnels</td><td>Union européenne (France)</td></tr>
    <tr><td>Meta Platforms Ireland Ltd.</td><td>mesure d'audience publicitaire, <em>uniquement après consentement</em></td><td>Irlande, États-Unis</td></tr>
    <tr><td>Google Ireland Ltd.</td><td>mesure d'audience et publicité, <em>uniquement après consentement</em></td><td>Irlande, États-Unis</td></tr>
  </tbody>
</table>
<p>Meta et Google n'interviennent que sur les pages publiques du site, et jamais au sein d'un événement : <strong>les photographies déposées par les participants ne leur sont à aucun moment transmises</strong>. Voir l'article 10 pour le détail de ces traceurs et les moyens de les refuser.</p>
<p>Les contenus déposés au sein d'un événement sont accessibles à l'Organisateur de cet événement et, après la révélation, aux autres participants de ce même événement.</p>

<h2>5. Transferts hors de l'Union européenne</h2>
<p>Les données et contenus sont stockés en <strong>Europe de l'Ouest</strong>.</p>
<p>Certains prestataires étant des sociétés de droit américain, un accès depuis les États-Unis à des fins d'administration technique ne peut être exclu. Ces transferts sont encadrés par les clauses contractuelles types adoptées par la Commission européenne et, le cas échéant, par la certification des prestataires au <em>Data Privacy Framework</em>.</p>

<h2>6. Durées de conservation</h2>
<p>Les contenus déposés au sein d'un événement sont <strong>supprimés automatiquement six mois après la date de révélation</strong> choisie par l'Organisateur. Cette suppression est définitive et irréversible : il appartient à l'Organisateur de télécharger avant cette échéance les contenus qu'il souhaite conserver.</p>
<p>Les autres durées figurent aux tableaux de l'article 3.</p>

<h2>7. Vos droits</h2>
<p>Conformément au Règlement (UE) 2016/679 et à la loi n° 78-17 du 6 janvier 1978, vous disposez des droits suivants :</p>
<ul>
  <li><strong>accès</strong> à vos données ;</li>
  <li><strong>rectification</strong> des données inexactes ;</li>
  <li><strong>effacement</strong> de vos données ;</li>
  <li><strong>limitation</strong> du traitement ;</li>
  <li><strong>opposition</strong> au traitement fondé sur l'intérêt légitime ;</li>
  <li><strong>portabilité</strong> des données que vous avez fournies ;</li>
  <li><strong>définition de directives</strong> relatives au sort de vos données après votre décès.</li>
</ul>
<p>Ces droits s'exercent à l'adresse <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>. Une réponse vous sera apportée dans un délai d'un mois, susceptible d'être prolongé de deux mois en cas de demande complexe.</p>
<p><strong>Si vous figurez sur une photographie déposée par un tiers</strong> et souhaitez qu'elle soit retirée, écrivez à support@timetoflash.fr en précisant l'identifiant de l'événement. Votre demande sera transmise à l'Organisateur et le contenu litigieux pourra être retiré sans attendre.</p>
<p>Vous disposez enfin du droit d'introduire une réclamation auprès de la <strong>Commission Nationale de l'Informatique et des Libertés</strong> : 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, <a href="https://www.cnil.fr" rel="nofollow noreferrer" target="_blank">www.cnil.fr</a>.</p>

<h2>8. Droit à l'image</h2>
<p>Le droit à l'image, fondé sur l'article 9 du Code civil, est distinct du droit à la protection des données. Toute personne dispose du droit de s'opposer à la captation et à la diffusion de son image.</p>
<p>Il appartient à l'Organisateur de recueillir les autorisations nécessaires auprès des personnes photographiées et, pour les mineurs, auprès de leurs représentants légaux.</p>

<h2>9. Sécurité</h2>
<p>BLACK BY C met en œuvre des mesures techniques et organisationnelles appropriées : chiffrement des communications (HTTPS/TLS), isolation des données entre événements, contrôle des accès, journalisation, sauvegardes, suppression automatisée à échéance.</p>
<p>Aucun système n'étant infaillible, en cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés, vous en seriez informé dans les meilleurs délais, conformément à l'article 34 du RGPD.</p>

<h2>10. Cookies et traceurs</h2>
<p><strong>Cookies strictement nécessaires.</strong> Session, authentification, sécurité. Conformément à l'article 82 de la loi Informatique et Libertés, ils ne requièrent pas votre consentement préalable et ne peuvent être désactivés sans rendre le service inopérant.</p>
<p><strong>Traceurs de mesure d'audience et de publicité.</strong> Le site fait appel au pixel Meta (Meta Platforms Ireland Limited) et aux services Google Analytics et Google Ads (Google Ireland Limited), afin de mesurer la fréquentation du site, d'évaluer l'efficacité de nos campagnes publicitaires et d'en améliorer le ciblage.</p>
<p>Ces traceurs <strong>ne sont déposés qu'après votre consentement exprès</strong>, recueilli au moyen du bandeau affiché lors de votre première visite. Tant que vous n'avez pas accepté, aucun script de ces sociétés n'est chargé. Refuser est aussi simple qu'accepter et n'altère en rien le fonctionnement du service.</p>
<p><strong>Retirer votre consentement.</strong> Votre choix est conservé six mois au maximum. Vous pouvez en changer à tout moment via le lien « Cookies » situé en pied de page, qui rouvre le bandeau.</p>
<p><strong>Base légale :</strong> votre consentement (article 6.1.a du RGPD). <strong>Transferts hors Union européenne :</strong> ces prestataires étant susceptibles de transférer des données vers les États-Unis, ces transferts sont encadrés par le Data Privacy Framework auquel Meta et Google ont adhéré, complété par les clauses contractuelles types de la Commission européenne.</p>
<p>Vous pouvez également vous opposer à ces traitements directement auprès des intéressés : <a href="https://www.facebook.com/settings?tab=ads" rel="nofollow noreferrer" target="_blank">paramètres publicitaires Meta</a> et <a href="https://adssettings.google.com" rel="nofollow noreferrer" target="_blank">paramètres publicitaires Google</a>.</p>

<h2>11. Mineurs</h2>
<p>Le service n'est pas destiné à être utilisé de manière autonome par des personnes de moins de quinze ans.</p>
<p>Des mineurs étant susceptibles de figurer sur les photographies prises lors d'un événement familial, il appartient à l'Organisateur de s'assurer de l'accord des titulaires de l'autorité parentale.</p>

<h2>12. Modification</h2>
<p>La présente politique peut être modifiée pour tenir compte d'évolutions légales ou techniques. La version applicable est celle publiée sur le site à la date de votre utilisation du service.</p>
`,
}

export const LEGAL_DOCS = [mentionsLegales, cgv, confidentialite]

export function legalBySlug(slug) {
  return LEGAL_DOCS.find((d) => d.slug === slug) || null
}
