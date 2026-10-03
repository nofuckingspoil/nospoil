// ============================================================
//  Pages légales : Mentions légales, CGVU, Politique de confidentialité.
//  Le contenu est du HTML simple, rendu par src/app/(legal)/…/page.js
//  avec la classe .legal-prose (styles dans globals.css).
//
//  Pour modifier un texte : c'est ici, et nulle part ailleurs.
//  Pensez à mettre à jour `updated` à chaque changement de fond.
// ============================================================

// Sert aussi de numéro de version des CGV enregistré à chaque acceptation
// (api/events, api/checkout) : il reste en français, quelle que soit la langue.
export const LEGAL_UPDATED = '8 août 2026'

// La même date, écrite dans la langue de la page (affichage seulement).
const DATES_MAJ = { fr: LEGAL_UPDATED, en: '8 August 2026', de: '8. August 2026' }

export function legalUpdated(langue) {
  return DATES_MAJ[langue] || LEGAL_UPDATED
}

// Les versions anglaise et allemande sont des traductions de courtoisie :
// seul le texte français engage BLACK BY C. On le dit en tête de chaque page.
const AVERTISSEMENT = {
  en: '<p class="legal-lead"><strong>This translation is provided for convenience. Only the French version is legally binding.</strong></p>\n',
  de: '<p class="legal-lead"><strong>Diese Übersetzung dient nur zur Information. Rechtsverbindlich ist ausschließlich die französische Fassung.</strong></p>\n',
}

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
<p>Elles s'appliquent à toute création d'événement, gratuite ou payante, ainsi qu'à toute commande de tirages photo papier (article 20), à l'exclusion de toute autre condition. Le fait de créer un événement ou de passer commande emporte acceptation pleine et entière des présentes CGVU.</p>

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

<h2>Article 20 : Vente de tirages photo papier</h2>
<h3>20.1 Objet</h3>
<p>Depuis l'album d'un Événement révélé, tout Organisateur ou Participant (l'« <strong>Acheteur</strong> ») peut commander des tirages photo papier des photographies de cet Événement. Les tirages sont destinés à un usage strictement privé.</p>
<h3>20.2 Prix</h3>
<p>Les prix sont indiqués en euros, toutes taxes comprises : un prix par tirage, selon le format, et des frais de livraison selon le pays de destination et le nombre de tirages. La livraison est proposée en France métropolitaine et dans les pays de l'Union européenne listés lors de la commande. Le détail (nombre de tirages, format, finition, rendu, livraison, total) est affiché avant le paiement, puis repris dans le courrier électronique de confirmation.</p>
<h3>20.3 Commande et paiement</h3>
<p>La commande est payable en ligne, au moyen des modes proposés par notre prestataire de paiement Stripe. Le contrat est formé au moment où le paiement est accepté ; l'Acheteur en reçoit la confirmation par courrier électronique.</p>
<h3>20.4 Fabrication et livraison</h3>
<p>Les tirages sont imprimés en France par un laboratoire partenaire, puis expédiés par La Poste, sous enveloppe, à l'adresse indiquée par l'Acheteur. Les envois se font en lettre, sans numéro de suivi. Une fois la commande transmise au laboratoire, les tirages sont postés le jour même (le lundi pour une commande passée le vendredi après 17 h ou le week-end), et le délai de livraison indicatif est de trois (3) à quatre (4) jours ouvrés en France métropolitaine ; en tout état de cause, les tirages sont livrés au plus tard trente (30) jours après la commande, conformément à l'article L.216-1 du Code de la consommation. L'Acheteur est informé par courrier électronique de l'expédition.</p>
<h3>20.5 Rendu des tirages</h3>
<p>Chaque tirage reproduit la photographie entière, entourée d'une bordure blanche. L'aperçu affiché lors de la commande est indicatif : de légères différences de couleur peuvent apparaître entre un écran et une impression sur papier. La qualité d'un tirage dépend de celle de la photographie prise pendant l'Événement.</p>
<h3>20.6 Absence de droit de rétractation</h3>
<p>Les tirages étant confectionnés selon les spécifications de l'Acheteur et nettement personnalisés (choix des photographies, du format, de la finition et du rendu), <strong>le droit de rétractation ne s'applique pas</strong>, conformément à l'article L.221-28, 3° du Code de la consommation. L'Acheteur en est informé avant de passer commande.</p>
<h3>20.7 Garanties et réclamations</h3>
<p>Les tirages bénéficient de la garantie légale de conformité (articles L.217-3 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil). Tout tirage abîmé, mal imprimé ou non reçu peut être signalé à support@timetoflash.fr, avec une photographie du défaut le cas échéant : BLACK BY C procède alors, au choix de l'Acheteur, à une nouvelle impression ou au remboursement des tirages concernés.</p>

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
    <tr><td>Familink</td><td>impression et expédition des tirages photo commandés (nom, adresse postale, photographies commandées)</td><td>France</td></tr>
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

<h3>3.4 Essai du service et nouvelles de Time to Flash</h3>
<p>Le QR code et le bouton « Essayer » de la page d'accueil créent une soirée d'essai personnelle, supprimée avec ses photographies le lendemain. Pour savoir ce qui amène les visiteurs à essayer, BLACK BY C conserve, <strong>sans aucune donnée d'identification</strong>, la provenance de l'essai (site ou campagne d'origine, page d'arrivée) et les étapes franchies (ouverture, prénom donné, photo prise, album vu). Cette provenance est mémorisée dans le navigateur du visiteur, sans cookie publicitaire, et n'est transmise qu'au lancement d'un essai. Base légale : intérêt légitime de BLACK BY C à comprendre l'usage de son site.</p>
<p>L'adresse électronique laissée pendant un essai sert à l'essai lui-même. Elle n'est utilisée pour adresser des <strong>nouvelles de Time to Flash</strong> (idées, nouveautés, offres) que si la personne a coché la case prévue à cet effet, qui n'est jamais cochée par défaut. Base légale : consentement. Chaque message comporte un lien de désinscription, avec effet immédiat. Sans nouvelle activité de sa part pendant trois ans, plus aucun message ne lui est adressé.</p>

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
    <tr><td>Familink</td><td>impression et expédition des tirages photo commandés (nom, adresse postale, photographies commandées)</td><td>France</td></tr>
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

// Version française : c'est elle que lisent le plan du site (sitemap.js,
// qui n'utilise que `slug`) et tout code qui n'indique pas de langue.
export const LEGAL_DOCS = [mentionsLegales, cgv, confidentialite]

// ------------------------------------------------------------
//  English translation (convenience only)
// ------------------------------------------------------------

const mentionsLegalesEn = {
  slug: 'mentions-legales',
  title: 'Legal notice',
  description: 'Publisher, publication director, hosting providers and intellectual property of the Time to Flash service.',
  html: `
<h2>1. Publisher</h2>
<p>The website <strong>timetoflash.fr</strong> and the Time to Flash service are published by:</p>
<p>
  <strong>BLACK BY C</strong><br />
  French simplified joint-stock company with a single shareholder (SASU) with share capital of €300<br />
  Registered office: 2 impasse des Ligures, 44840 Les Sorinières, France<br />
  Registered with the Nantes Trade and Companies Register (RCS) under number <strong>898 409 446</strong><br />
  SIRET (registered office): 898 409 446 00017<br />
  APE code: 70.10Z<br />
  EU VAT number: FR27898409446
</p>
<p>Email: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>2. Publication director</h2>
<p>Mr <strong>Clément LEMERLE</strong>, in his capacity as President of BLACK BY C.</p>

<h2>3. Hosting</h2>
<p>The website is hosted by:</p>
<p>
  <strong>Vercel, Inc.</strong><br />
  340 S Lemon Ave #4133, Walnut, CA 91789, United States<br />
  <a href="https://vercel.com" rel="nofollow noreferrer" target="_blank">vercel.com</a>
</p>
<p>Application data and content uploaded by users are hosted by:</p>
<ul>
  <li><strong>Supabase, Inc.</strong>, a company incorporated under US law, database and authentication (<a href="https://supabase.com" rel="nofollow noreferrer" target="_blank">supabase.com</a>)</li>
  <li><strong>Cloudflare, Inc.</strong>, file storage (Cloudflare R2), 101 Townsend St, San Francisco, CA 94107, United States (<a href="https://www.cloudflare.com" rel="nofollow noreferrer" target="_blank">cloudflare.com</a>)</li>
</ul>
<p>Data and content are stored in the <strong>Western Europe</strong> region.</p>

<h2>4. Intellectual property</h2>
<p>The “Time to Flash” trademark, the timetoflash.fr domain name, the visual identity, texts, visuals, site structure, databases and source code are the exclusive property of BLACK BY C or are licensed to it.</p>
<p>Any reproduction, representation, modification, adaptation or exploitation of these elements, in whole or in part, by any means and on any medium whatsoever, without the prior written consent of BLACK BY C, is prohibited and would constitute an infringement within the meaning of Articles L.335-2 et seq. of the French Intellectual Property Code.</p>
<p>Photographs uploaded by users remain the property of their respective authors. BLACK BY C holds only the rights over such content that are strictly necessary to provide the service, under the conditions set out in the <a href="/cgv">Terms and Conditions of Sale and Use</a>.</p>

<h2>5. Liability</h2>
<p>BLACK BY C endeavours to ensure that the information published on the website is accurate and up to date, but cannot guarantee that it is complete or entirely free from errors. BLACK BY C reserves the right to correct the content of the website at any time and without notice.</p>
<p>Users acknowledge that they use the website under their sole responsibility. BLACK BY C cannot be held liable for any damage resulting from improper use of the website or the service, or from any interruption attributable to the internet network, to the user's equipment or to force majeure.</p>

<h2>6. Hyperlinks</h2>
<p>The website may contain links to third-party websites. BLACK BY C has no control over these websites and accepts no responsibility for their content, practices or privacy policies.</p>

<h2>7. Personal data and cookies</h2>
<p>The processing of personal data is described in the <a href="/politique-de-confidentialite">Privacy policy</a>.</p>
<p>Cookies that are strictly necessary for the service to function (session, authentication, security) do not require prior consent under Article 82 of the French Data Protection Act (loi Informatique et Libertés).</p>
<p>The website also uses <strong>audience measurement and advertising trackers</strong> (Meta, Google), which are only placed after your <strong>express consent</strong>, obtained through the banner displayed on your first visit. You can change your choice at any time via the “Cookies” link in the footer. Details are set out in the <a href="/politique-de-confidentialite">Privacy policy</a>.</p>

<h2>8. Reporting unlawful content</h2>
<p>In accordance with Regulation (EU) 2022/2065 on digital services and French Law No. 2004-575 of 21 June 2004, any unlawful content hosted on the service may be reported to <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, stating the URL or identifier of the event concerned, the nature of the disputed content and the reasons for the report.</p>

<h2>9. Governing law</h2>
<p>This legal notice is governed by French law.</p>
`,
}

const cgvEn = {
  slug: 'cgv',
  title: 'Terms and Conditions of Sale and Use',
  shortTitle: 'Terms of sale',
  description: 'Plans, prices, payment, right of withdrawal, photo retention and liability for the Time to Flash service.',
  html: `
<h2>Article 1: Purpose</h2>
<p>These Terms and Conditions of Sale and Use (the “<strong>Terms</strong>”) govern the sale and use of the <strong>Time to Flash</strong> service, available at timetoflash.fr.</p>
<p>They apply to every event created, whether free or paid, and to every order of paper photo prints (Article 20), to the exclusion of any other terms. Creating an event or placing an order constitutes full and unreserved acceptance of these Terms.</p>

<h2>Article 2: Seller identification</h2>
<p><strong>BLACK BY C</strong>, SASU with share capital of €300, whose registered office is at 2 impasse des Ligures, 44840 Les Sorinières, France, registered with the Nantes Trade and Companies Register under number 898 409 446, EU VAT number FR27898409446.</p>
<p>Contact: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>Article 3: Definitions</h2>
<ul>
  <li><strong>Service</strong>: the Time to Flash solution for collecting the photographs taken by the guests at an event and revealing them afterwards.</li>
  <li><strong>Host</strong>: the natural or legal person who creates an Event and, where applicable, pays the corresponding price.</li>
  <li><strong>Guest</strong>: any person who accesses an Event using the link or QR code provided by the Host and uploads content.</li>
  <li><strong>Event</strong>: the space created by the Host, associated with a Plan and a maximum number of Guests.</li>
  <li><strong>Content</strong>: the photographs uploaded by Guests.</li>
  <li><strong>Reveal</strong>: the moment, set by the Host when creating the Event, from which the Content becomes accessible to the Host and to the Guests.</li>
</ul>

<h2>Article 4: Description of the Service</h2>
<p>The Service allows the Host to create an Event, invite guests by means of a link or QR code, and collect the Content they upload.</p>
<p>The main characteristics of the Service are as follows:</p>
<ul>
  <li><strong>Number of shots per Guest</strong>: set by the Host between <strong>3 and 15 shots</strong>, the same for all Guests of a given Event. It can be changed until the Event starts, after which it is fixed. The Host may also allow a <strong>single top-up</strong> of 1 to 5 additional shots, which each Guest who has used up their shots may request once; the Host may refuse this top-up.</li>
  <li><strong>Accepted formats</strong>: <strong>photographs only</strong>, excluding videos and sound recordings. Uploaded images are automatically resized and compressed.</li>
  <li><strong>Maximum number of Guests</strong>: determined by the chosen Plan, according to the table in Article 5.</li>
  <li><strong>Access</strong>: from a web browser, with no app to install, for both the Host and the Guests.</li>
</ul>
<p>Content cannot be viewed during the Event: it is revealed on the Reveal date chosen by the Host.</p>
<p>Use of the Service requires compatible equipment with a camera and an internet connection, which the Host and the Guests are responsible for providing themselves.</p>

<h2>Article 5: Plans and prices</h2>
<table>
  <thead>
    <tr><th>Plan</th><th>Maximum number of Guests</th><th>Price</th></tr>
  </thead>
  <tbody>
    <tr><td>Discovery</td><td>5</td><td>Free, no bank card required</td></tr>
    <tr><td>10 guests</td><td>10</td><td>€1.99</td></tr>
    <tr><td>30 guests</td><td>30</td><td>€4.99</td></tr>
    <tr><td>50 guests</td><td>50</td><td>€14.99</td></tr>
    <tr><td>100 guests</td><td>100</td><td>€29.99</td></tr>
    <tr><td>150 guests</td><td>150</td><td>€34.99</td></tr>
    <tr><td>200 guests</td><td>200</td><td>€39.99</td></tr>
    <tr><td>300 guests</td><td>300 and above</td><td>€59.99</td></tr>
  </tbody>
</table>
<p>Prices are stated <strong>in euros, including all taxes</strong>. No subscription is taken out: each Plan involves a <strong>one-off payment</strong>, due when the Event is created.</p>
<p>BLACK BY C reserves the right to change its prices at any time. The applicable price is the one displayed on the day the Event is created.</p>
<p><strong>Exceeding the number of Guests.</strong> The maximum number of Guests of the Plan never prevents a Guest from joining the Event or taking photographs: nothing is blocked during the Event, and all photographs are kept. However, where the number of Guests actually registered exceeds that of the Plan purchased, <strong>the opening of the album to Guests (the “reveal”) is suspended</strong> until the Host purchases the Plan corresponding to the actual number of Guests. This upgrade only requires payment of the <strong>price difference</strong> between the Plan purchased and the Plan required, the amount already paid remaining acquired. The Host is informed of this on their dashboard and by email. No suspension applies where the Host has purchased the highest Plan, which has no limit on the number of Guests.</p>

<h2>Article 6: Ordering and formation of the contract</h2>
<p>Creating an Event requires entering the requested information, confirming the chosen Plan and, for paid Plans, paying the price.</p>
<p>Before confirming, the Host can check the details of their order and correct any errors. Confirmation of the order, preceded by express acceptance of these Terms, constitutes conclusion of the contract.</p>
<p>A confirmation email summarising the order is sent to the Host.</p>

<h2>Article 7: Payment</h2>
<p>Payment is made online by bank card, through the payment provider <strong>Stripe Payments Europe, Ltd.</strong></p>
<p>BLACK BY C has no access to any bank card data, which is collected and processed directly by Stripe under its own terms.</p>
<p>The Event is activated as soon as payment has actually been received.</p>

<h2>Article 8: Duration and availability of the Event</h2>
<p>The Host has <strong>twelve (12) months</strong> from payment to hold and use their Event. After this period, the Plan is deemed to have been used and no refund or postponement will be granted.</p>
<p>Content is stored and then <strong>automatically deleted six (6) months after the date of the Event</strong>. For the purposes of these Terms, the date of the Event means the <strong>Reveal date</strong> chosen by the Host when creating the Event: it is this date that starts the six-month period.</p>
<p>It is the Host's responsibility to download any Content they wish to keep before this period expires. This deletion is final and irreversible.</p>

<h2>Article 9: Right of withdrawal</h2>
<h3>9.1 Principle</h3>
<p>In accordance with Article L.221-18 of the French Consumer Code, a Host who is a consumer in principle has fourteen (14) days from the conclusion of the contract to exercise their right of withdrawal, without having to give reasons.</p>
<h3>9.2 Express waiver</h3>
<p>As the Service is provided immediately after payment, the Host is invited, when ordering, to <strong>expressly request immediate performance of the Service and to waive their right of withdrawal</strong>, by means of a separate, unticked checkbox worded as follows:</p>
<blockquote><p>“I request the immediate creation of my event and I waive my 14-day right of withdrawal.”</p></blockquote>
<p>Ticking this box constitutes, within the meaning of Article L.221-28 of the French Consumer Code, an express request for immediate performance of the Service before the end of the withdrawal period and an express waiver of that right, the Host acknowledging that they will lose it once the Service has been fully performed.</p>
<p>In the absence of this waiver, the right of withdrawal remains applicable and may be exercised by any unambiguous statement sent to support@timetoflash.fr, or by using the model form in <strong>Appendix 1</strong>.</p>
<h3>9.3 Effects</h3>
<p>Where the Host exercises their right of withdrawal after performance of the Service has begun at their express request, they must pay an amount proportionate to the service provided until they communicated their decision, in accordance with Article L.221-25 of the French Consumer Code.</p>
<p>The refund is made within fourteen (14) days at most of receipt of the request, using the same means of payment as for the order.</p>

<h2>Article 10: Refunds</h2>
<p>Except in the cases provided for in Article 9 and under the legal guarantees referred to in Article 13, <strong>no refund is granted</strong>.</p>
<p>In particular, no refund may be requested once at least one Guest has uploaded Content to the Event, as the Service is then deemed to have been performed.</p>
<p>These provisions do not prevent the legal guarantees from being invoked, which remain applicable in all cases.</p>

<h2>Article 11: Host's obligations</h2>
<p>The Host undertakes to:</p>
<ol>
  <li><strong>Inform Guests</strong>, before they take part, of the purpose of the collection, the retention period of the Content and their rights over their personal data;</li>
  <li><strong>Obtain the necessary image-rights permissions</strong> (Article 9 of the French Civil Code) from the people appearing in the Content, in particular from the legal representatives of minors;</li>
  <li>Not divert the Service from its purpose, nor use it for unlawful purposes;</li>
  <li>Not share the Content beyond the circle of people who have consented to it being shared.</li>
</ol>
<p>The Host is solely responsible for the use they make of the Content after downloading it. They indemnify BLACK BY C against any third-party claim based on the Content uploaded to their Event.</p>

<h2>Article 12: Content and moderation</h2>
<p>Unlawful Content is strictly prohibited, in particular content that is child pornographic, violent, hateful or defamatory, that infringes the privacy or image rights of a third party, or that is infringing.</p>
<p>BLACK BY C acts as a hosting provider within the meaning of Article 6 of French Law No. 2004-575 of 21 June 2004. It does not carry out any general monitoring of Content but undertakes to promptly remove any manifestly unlawful Content brought to its attention at support@timetoflash.fr.</p>
<p>Each Guest may delete their own Content before the Reveal. The Host may also remove Content uploaded to their Event.</p>
<p>BLACK BY C reserves the right to suspend or delete, without notice or refund, any Event that manifestly breaches these Terms or the law.</p>

<h2>Article 13: Legal guarantees</h2>
<p>BLACK BY C is liable for lack of conformity of digital content and digital services under the conditions set out in <strong>Articles L.224-25-12 et seq. of the French Consumer Code</strong>.</p>
<p>For digital services supplied continuously, the legal guarantee of conformity applies throughout the period of supply.</p>
<p>A Host who is a consumer has two years from supply to have the service brought into conformity. Under the conditions laid down by law, they may obtain a price reduction or termination of the contract.</p>
<p>BLACK BY C is also bound by the guarantee against latent defects under the conditions of Articles 1641 et seq. of the French Civil Code.</p>
<p>No provision of these Terms may limit or exclude these guarantees.</p>

<h2>Article 14: Availability and liability</h2>
<p>BLACK BY C uses reasonable means to ensure the availability and continuity of the Service, without being bound by an obligation of result.</p>
<p>The Service may be interrupted for maintenance, in the event of a failure of a technical provider, or in the event of force majeure. BLACK BY C endeavours to inform Hosts of any significant scheduled interruption.</p>
<p>BLACK BY C cannot be held liable for the loss of Content resulting from automatic deletion at the end of the periods provided for in Article 8, from an action by the Host or a Guest, or from failure to download within the time limits.</p>
<p>In any event, should BLACK BY C be held liable, its liability is limited to the amount actually paid by the Host for the Event concerned, except in the case of gross negligence, wilful misconduct or personal injury.</p>

<h2>Article 15: Intellectual property and licence over the Content</h2>
<p>Content remains the property of its authors.</p>
<p>The Host and the Guests grant BLACK BY C a non-exclusive, royalty-free licence, limited to the period during which the Content is hosted, solely for the purposes of storage, technical processing and making it available within the Event. This licence excludes any commercial, promotional or advertising use.</p>
<p>Any use of Content by BLACK BY C for communication purposes requires the prior, specific written consent of the Host and of the people concerned.</p>

<h2>Article 16: Personal data</h2>
<p>The processing of personal data is described in the <a href="/politique-de-confidentialite">Privacy policy</a>.</p>
<p>For Content uploaded to an Event, BLACK BY C acts as <strong>processor</strong> on behalf of the Host, under the conditions set out in <strong>Appendix 2</strong> to these Terms.</p>

<h2>Article 17: Changes to the Terms</h2>
<p>BLACK BY C may amend these Terms at any time. The applicable version is the one in force on the day the Event is created, a copy of which is sent to the Host or remains available on the website.</p>

<h2>Article 18: Complaints and consumer mediation</h2>
<p>Any complaint must first be sent to BLACK BY C at <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>. BLACK BY C undertakes to reply within a reasonable time.</p>
<p>In accordance with Article L.612-1 of the French Consumer Code, a Host who is a consumer may use a consumer mediator free of charge with a view to the amicable resolution of a dispute, after first sending a written complaint to BLACK BY C.</p>
<p>The contact details of the competent consumer mediator will be published in this article as soon as BLACK BY C has joined the mediation scheme, which is currently being set up.</p>
<p>A Host who is a consumer may also use the European online dispute resolution platform, available at <a href="https://ec.europa.eu/consumers/odr" rel="nofollow noreferrer" target="_blank">ec.europa.eu/consumers/odr</a>.</p>

<h2>Article 19: Governing law and jurisdiction</h2>
<p>These Terms are governed by French law.</p>
<p>Failing amicable resolution, any dispute falls within the jurisdiction of the French courts. Consumers may bring proceedings, at their choice, before the court of their place of residence or that of the registered office of BLACK BY C.</p>

<hr />

<h2>Article 20: Sale of paper photo prints</h2>
<h3>20.1 Purpose</h3>
<p>From the album of a revealed Event, any Host or Guest (the “<strong>Buyer</strong>”) may order paper prints of the photographs from that Event. Prints are intended for strictly private use.</p>
<h3>20.2 Prices</h3>
<p>Prices are stated in euros, including all taxes: a price per print, depending on the format, and delivery charges depending on the destination country and the number of prints. Delivery is offered to metropolitan France and to the European Union countries listed when ordering. The details (number of prints, format, finish, style, delivery, total) are displayed before payment and repeated in the confirmation email.</p>
<h3>20.3 Ordering and payment</h3>
<p>The order is payable online, using the methods offered by our payment provider Stripe. The contract is formed when payment is accepted; the Buyer receives confirmation by email.</p>
<h3>20.4 Production and delivery</h3>
<p>Prints are produced in France by a partner laboratory, then sent by La Poste, in an envelope, to the address given by the Buyer. They are sent as letters, without a tracking number. Once the order has been passed to the laboratory, prints are posted the same day (on Monday for an order placed on Friday after 5 pm or at the weekend), and the indicative delivery time is three (3) to four (4) working days in metropolitan France; in any event, prints are delivered no later than thirty (30) days after the order, in accordance with Article L.216-1 of the French Consumer Code. The Buyer is informed by email when the order is dispatched.</p>
<h3>20.5 Appearance of prints</h3>
<p>Each print reproduces the entire photograph, surrounded by a white border. The preview displayed when ordering is for guidance only: slight differences in colour may appear between a screen and a paper print. The quality of a print depends on that of the photograph taken during the Event.</p>
<h3>20.6 No right of withdrawal</h3>
<p>As the prints are made to the Buyer's specifications and clearly personalised (choice of photographs, format, finish and style), <strong>the right of withdrawal does not apply</strong>, in accordance with Article L.221-28, 3° of the French Consumer Code. The Buyer is informed of this before placing the order.</p>
<h3>20.7 Guarantees and complaints</h3>
<p>Prints are covered by the legal guarantee of conformity (Articles L.217-3 et seq. of the French Consumer Code) and by the guarantee against latent defects (Articles 1641 et seq. of the French Civil Code). Any print that is damaged, badly printed or not received may be reported to support@timetoflash.fr, with a photograph of the defect where applicable: BLACK BY C will then, at the Buyer's choice, reprint the prints concerned or refund them.</p>

<h2>Appendix 1: Model withdrawal form</h2>
<blockquote>
  <p>To BLACK BY C, 2 impasse des Ligures, 44840 Les Sorinières, France (support@timetoflash.fr)</p>
  <p>I hereby give notice that I withdraw from the contract for the provision of the service below:</p>
  <p>
    Ordered on: ……………………<br />
    Event reference: ……………………<br />
    Host's name: ……………………<br />
    Address: ……………………<br />
    Date: ……………………<br />
    Signature (only if this form is notified on paper): ……………………
  </p>
</blockquote>

<h2>Appendix 2: Data processing agreement (Article 28 GDPR)</h2>
<h3>1. Roles</h3>
<p>For the Content uploaded by Guests and the associated data, <strong>the Host acts as controller</strong> and <strong>BLACK BY C as processor</strong>.</p>
<p>BLACK BY C remains the controller for data relating to the management of its own customer account (identification of the Host, invoicing, support).</p>

<h3>2. Subject matter, duration and nature of the processing</h3>
<ul>
  <li><strong>Subject matter</strong>: collection, hosting, deferred provision and deletion of the Content uploaded to an Event.</li>
  <li><strong>Duration</strong>: the duration of the Event, plus the retention period provided for in Article 8.</li>
  <li><strong>Nature of the operations</strong>: collection, recording, storage, organisation, consultation, transmission, erasure.</li>
  <li><strong>Categories of data subjects</strong>: the Host, the Guests, and any person appearing in the Content.</li>
  <li><strong>Categories of data</strong>: images of natural persons, first name or nickname, timestamps, the Host's email address, the Guests' optional email address (access to their own photographs and sending of the album link), telephone numbers collected before this collection was discontinued, technical connection data.</li>
</ul>
<p><strong>Outside the scope of this agreement</strong>: the answers given by the Host or by Guests to the satisfaction survey about the Service itself. These answers are not processed on behalf of the Host but on behalf of BLACK BY C, which is the controller for them; they are never disclosed to the Host. The conditions are detailed in Article 3.3 of the privacy policy.</p>

<h3>3. Obligations of BLACK BY C</h3>
<p>BLACK BY C undertakes to:</p>
<ol>
  <li>process the data only on documented instructions from the Host, and solely for the purposes described above;</li>
  <li>ensure the confidentiality of the data and give access to it only to authorised persons;</li>
  <li>implement appropriate technical and organisational measures (encryption in transit, access control, isolation of Events, logging);</li>
  <li>assist the Host in responding to requests from data subjects exercising their rights;</li>
  <li>notify the Host of any personal data breach without undue delay;</li>
  <li>delete the data at the end of the service, under the conditions of Article 8;</li>
  <li>make available the information necessary to demonstrate compliance with its obligations.</li>
</ol>

<h3>4. Sub-processors</h3>
<p>The Host authorises BLACK BY C to use the following sub-processors:</p>
<table>
  <thead>
    <tr><th>Sub-processor</th><th>Role</th><th>Data location</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>application hosting</td><td>Europe</td></tr>
    <tr><td>Supabase, Inc.</td><td>database, authentication</td><td>Western Europe</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>Content storage (R2)</td><td>Western Europe</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>payment processing</td><td>European Union</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>sending transactional emails</td><td>European Union (France)</td></tr>
    <tr><td>Familink</td><td>printing and dispatch of ordered photo prints (name, postal address, ordered photographs)</td><td>France</td></tr>
  </tbody>
</table>
<p>BLACK BY C informs the Host of any intended change, the Host having a reasonable period in which to object.</p>

<h3>5. Transfers outside the European Union</h3>
<p>Some of the above providers are companies incorporated under US law which may access data from the United States for technical administration purposes. These transfers are governed by the European Commission's standard contractual clauses and, where applicable, by certification under the <em>Data Privacy Framework</em>.</p>

<h3>6. Information for Guests</h3>
<p>The Host acknowledges that it is their responsibility to inform Guests and to have a legal basis for the processing.</p>
<p>BLACK BY C provides, within the upload interface, an information notice for Guests, on behalf of and in the name of the Host.</p>
`,
}

const confidentialiteEn = {
  slug: 'politique-de-confidentialite',
  title: 'Privacy policy',
  description: 'What data Time to Flash processes, why, for how long, and how to exercise your rights.',
  html: `
<p class="legal-lead">Time to Flash is a service that collects photographs taken by the guests at an event and reveals them afterwards. This document explains what data is processed, why, for how long, and what your rights are.</p>

<h2>1. Who processes your data</h2>
<p><strong>BLACK BY C</strong>, SASU with share capital of €300, 2 impasse des Ligures, 44840 Les Sorinières, France, RCS Nantes 898 409 446.</p>
<p>Contact: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>
<p>BLACK BY C has not appointed a data protection officer, as such an appointment is not mandatory given its activity. Any question about personal data may be sent to the address above.</p>

<h2>2. Two situations to distinguish</h2>
<p><strong>When you create an event</strong> (you are the “Host”), BLACK BY C processes your data on its own behalf: it is the <strong>controller</strong>.</p>
<p><strong>When guests upload photographs to an event</strong>, it is the Host who decides on the collection, invites the guests and determines who can access the content. BLACK BY C then acts only as a <strong>processor</strong>, on the Host's instructions. Requests concerning this content should be sent first to the Host of the event concerned, with BLACK BY C assisting in responding to them.</p>
<p><strong>One exception: answers to the satisfaction survey.</strong> When a Host or a Guest gives their opinion on the service itself, they are addressing BLACK BY C and not the Host of the event. BLACK BY C is then the <strong>controller</strong>, and the Host of the event never has access to these answers. Details are given in Article 3.3.</p>

<h2>3. Data processed and purposes</h2>
<h3>3.1 Host</h3>
<table>
  <thead>
    <tr><th>Data</th><th>Purpose</th><th>Legal basis</th><th>Retention</th></tr>
  </thead>
  <tbody>
    <tr><td>Email address, surname or first name</td><td>creating and managing the account, sending access to the event</td><td>performance of the contract</td><td>3 years from the last contact</td></tr>
    <tr><td>Order and billing data</td><td>managing the order, accounting obligations</td><td>performance of the contract and legal obligation</td><td>10 years (Article L.123-22 of the French Commercial Code)</td></tr>
    <tr><td>Email address, content of exchanges</td><td>handling support requests</td><td>legitimate interest</td><td>3 years from the last contact</td></tr>
    <tr><td>Acceptance of the Terms and, where applicable, waiver of the right of withdrawal (timestamp, version of the Terms)</td><td>proof of contractual consent</td><td>performance of the contract and legitimate interest</td><td>10 years (commercial limitation period)</td></tr>
    <tr><td>Technical connection logs</td><td>security of the service, prevention of abuse</td><td>legitimate interest</td><td>12 months</td></tr>
  </tbody>
</table>
<p>Bank card data is <strong>never</strong> collected or stored by BLACK BY C. It is processed directly by Stripe.</p>

<h3>3.2 Guests</h3>
<table>
  <thead>
    <tr><th>Data</th><th>Purpose</th><th>Retention</th></tr>
  </thead>
  <tbody>
    <tr><td>Photographs</td><td>building the event gallery</td><td>6 months after the reveal date, then automatic deletion</td></tr>
    <tr><td>First name or nickname entered</td><td>identifying contributions within the event</td><td>same</td></tr>
    <tr><td><strong>Email address</strong> (optional)</td><td>sending, once only, a personal access link allowing the Guest to find their own photographs and remaining shots from another device; sending the album link at the time of the reveal; sending, once only and without reminders, a satisfaction questionnaire (Article 3.3)</td><td>same</td></tr>
    <tr><td>Telephone number (optional, no longer collected)</td><td>forwarding of the album link by the Host</td><td>same</td></tr>
    <tr><td>Timestamps, technical connection data</td><td>operation and security of the service</td><td>12 months</td></tr>
  </tbody>
</table>
<p>No account is required to upload content as a guest.</p>
<p>Entering an email address is <strong>optional</strong>: guests can take part without providing one. It is used to send them the album link when the photographs are revealed and, where applicable, the satisfaction questionnaire described in Article 3.3. It is used for <strong>no commercial marketing purpose</strong>, is never passed on to a third party, and is deleted with the event.</p>
<p>The collection of telephone numbers has been discontinued. Numbers collected before this change remain subject to the same rules and are deleted with the event to which they relate. This collection only concerned Guests: a Host may, if they wish, provide their own number in the satisfaction questionnaire, under the conditions set out in Article 3.3.</p>
<p>Photographs may reveal sensitive information: religious practice during a ceremony, apparent state of health, presumed membership of a group. BLACK BY C never uses this information and carries out no analysis of image content, no facial recognition and no profiling.</p>

<h3>3.3 Satisfaction survey</h3>
<p>BLACK BY C asks Hosts and Guests about their experience of the service, in order to fix what does not work and to guide its development. For this processing, BLACK BY C acts as <strong>controller</strong>: the answers concern it, and they are <strong>never disclosed to the Host of the event</strong>, nor to any other guest.</p>
<table>
  <thead>
    <tr><th>Data</th><th>Purpose</th><th>Legal basis</th><th>Retention</th></tr>
  </thead>
  <tbody>
    <tr><td>Answers to the questionnaire (rating, difficulties encountered, free comments)</td><td>improving the service and fixing malfunctions</td><td>legitimate interest</td><td>3 years from the answer</td></tr>
    <tr><td>Type of device and browser used</td><td>reproducing and fixing the technical difficulties reported</td><td>legitimate interest</td><td>3 years from the answer</td></tr>
    <tr><td>Host's telephone number (optional)</td><td>a telephone conversation of a few minutes, only if expressly agreed to</td><td>consent</td><td>deleted after the conversation, and at the latest 6 months after the answer</td></tr>
  </tbody>
</table>
<p>Taking part in the survey is <strong>entirely optional</strong> and is not a condition of access to any feature: refusing to answer, or not answering at all, has no effect on the service provided.</p>
<p>A questionnaire is sent by email <strong>once only</strong>, and no reminder follows. Each message contains a link to stop receiving requests of this kind, with immediate effect; this refusal does not prevent the album link from being sent, which remains due to any Guest who left their address. These messages contain no commercial offer.</p>
<p>Answers are kept after the deletion of the event to which they relate, but <strong>detached from it</strong>: they can then no longer identify the event or its host, and are used only to measure changes in the quality of the service over time.</p>

<h3>3.4 Trying the service and news from Time to Flash</h3>
<p>The QR code and the “Try” button on the home page create a personal trial event, deleted with its photographs the following day. To understand what brings visitors to try the service, BLACK BY C keeps, <strong>without any identifying data</strong>, where the trial came from (originating site or campaign, landing page) and the steps reached (opening, first name given, photo taken, album viewed). This origin is stored in the visitor's browser, without any advertising cookie, and is only sent when a trial is started. Legal basis: BLACK BY C's legitimate interest in understanding how its website is used.</p>
<p>The email address left during a trial is used for the trial itself. It is only used to send <strong>news from Time to Flash</strong> (ideas, new features, offers) if the person has ticked the box provided for this purpose, which is never ticked by default. Legal basis: consent. Every message includes an unsubscribe link, effective immediately. If there is no further activity on their part for three years, no more messages are sent to them.</p>

<h2>4. Recipients and processors</h2>
<p>Data is not sold, rented or disclosed to third parties for advertising or commercial purposes.</p>
<p>It is accessible to the following technical providers, acting on the instructions of BLACK BY C:</p>
<table>
  <thead>
    <tr><th>Provider</th><th>Role</th><th>Location</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>hosting of the website and the application</td><td>Europe</td></tr>
    <tr><td>Supabase, Inc.</td><td>database and authentication</td><td>Western Europe</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>file storage (R2)</td><td>Western Europe</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>payment processing</td><td>European Union</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>sending transactional emails</td><td>European Union (France)</td></tr>
    <tr><td>Familink</td><td>printing and dispatch of ordered photo prints (name, postal address, ordered photographs)</td><td>France</td></tr>
    <tr><td>Meta Platforms Ireland Ltd.</td><td>advertising audience measurement, <em>only after consent</em></td><td>Ireland, United States</td></tr>
    <tr><td>Google Ireland Ltd.</td><td>audience measurement and advertising, <em>only after consent</em></td><td>Ireland, United States</td></tr>
  </tbody>
</table>
<p>Meta and Google are only involved on the public pages of the website, and never within an event: <strong>photographs uploaded by guests are never passed on to them</strong>. See Article 10 for details of these trackers and how to refuse them.</p>
<p>Content uploaded to an event is accessible to the Host of that event and, after the reveal, to the other guests of that same event.</p>

<h2>5. Transfers outside the European Union</h2>
<p>Data and content are stored in <strong>Western Europe</strong>.</p>
<p>As some providers are companies incorporated under US law, access from the United States for technical administration purposes cannot be ruled out. These transfers are governed by the standard contractual clauses adopted by the European Commission and, where applicable, by the providers' certification under the <em>Data Privacy Framework</em>.</p>

<h2>6. Retention periods</h2>
<p>Content uploaded to an event is <strong>automatically deleted six months after the reveal date</strong> chosen by the Host. This deletion is final and irreversible: it is the Host's responsibility to download any content they wish to keep before this deadline.</p>
<p>The other periods are set out in the tables in Article 3.</p>

<h2>7. Your rights</h2>
<p>In accordance with Regulation (EU) 2016/679 and French Law No. 78-17 of 6 January 1978, you have the following rights:</p>
<ul>
  <li><strong>access</strong> to your data;</li>
  <li><strong>rectification</strong> of inaccurate data;</li>
  <li><strong>erasure</strong> of your data;</li>
  <li><strong>restriction</strong> of processing;</li>
  <li><strong>objection</strong> to processing based on legitimate interest;</li>
  <li><strong>portability</strong> of the data you have provided;</li>
  <li><strong>setting instructions</strong> on what happens to your data after your death.</li>
</ul>
<p>These rights can be exercised by writing to <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>. You will receive a reply within one month, which may be extended by two months for complex requests.</p>
<p><strong>If you appear in a photograph uploaded by someone else</strong> and would like it removed, write to support@timetoflash.fr stating the event identifier. Your request will be forwarded to the Host and the content in question may be removed without delay.</p>
<p>Finally, you have the right to lodge a complaint with the French data protection authority, the <strong>Commission Nationale de l'Informatique et des Libertés</strong> (CNIL): 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France, <a href="https://www.cnil.fr" rel="nofollow noreferrer" target="_blank">www.cnil.fr</a>.</p>

<h2>8. Image rights</h2>
<p>Image rights, based on Article 9 of the French Civil Code, are distinct from the right to data protection. Everyone has the right to object to their image being captured and shared.</p>
<p>It is the Host's responsibility to obtain the necessary permissions from the people photographed and, for minors, from their legal representatives.</p>

<h2>9. Security</h2>
<p>BLACK BY C implements appropriate technical and organisational measures: encryption of communications (HTTPS/TLS), isolation of data between events, access control, logging, backups, automated deletion at the end of the retention period.</p>
<p>As no system is infallible, in the event of a personal data breach likely to result in a high risk to your rights and freedoms, you would be informed without undue delay, in accordance with Article 34 of the GDPR.</p>

<h2>10. Cookies and trackers</h2>
<p><strong>Strictly necessary cookies.</strong> Session, authentication, security. In accordance with Article 82 of the French Data Protection Act, they do not require your prior consent and cannot be disabled without making the service unusable.</p>
<p><strong>Audience measurement and advertising trackers.</strong> The website uses the Meta pixel (Meta Platforms Ireland Limited) and the Google Analytics and Google Ads services (Google Ireland Limited), in order to measure traffic to the website, assess the effectiveness of our advertising campaigns and improve their targeting.</p>
<p>These trackers <strong>are only placed after your express consent</strong>, obtained through the banner displayed on your first visit. Until you have accepted, no script from these companies is loaded. Refusing is as easy as accepting and does not affect how the service works in any way.</p>
<p><strong>Withdrawing your consent.</strong> Your choice is kept for six months at most. You can change it at any time via the “Cookies” link in the footer, which reopens the banner.</p>
<p><strong>Legal basis:</strong> your consent (Article 6(1)(a) GDPR). <strong>Transfers outside the European Union:</strong> as these providers may transfer data to the United States, these transfers are governed by the Data Privacy Framework to which Meta and Google have signed up, supplemented by the European Commission's standard contractual clauses.</p>
<p>You can also object to this processing directly with the companies concerned: <a href="https://www.facebook.com/settings?tab=ads" rel="nofollow noreferrer" target="_blank">Meta ad settings</a> and <a href="https://adssettings.google.com" rel="nofollow noreferrer" target="_blank">Google ad settings</a>.</p>

<h2>11. Minors</h2>
<p>The service is not intended to be used independently by people under the age of fifteen.</p>
<p>As minors may appear in photographs taken at a family event, it is the Host's responsibility to make sure that the holders of parental authority have given their consent.</p>

<h2>12. Changes</h2>
<p>This policy may be amended to take account of legal or technical developments. The applicable version is the one published on the website on the date you use the service.</p>
`,
}

// ------------------------------------------------------------
//  Deutsche Übersetzung (nur zur Information)
// ------------------------------------------------------------

const mentionsLegalesDe = {
  slug: 'mentions-legales',
  title: 'Impressum',
  description: 'Herausgeber, Verantwortlicher für den Inhalt, Hosting-Anbieter und geistiges Eigentum des Dienstes Time to Flash.',
  html: `
<h2>1. Herausgeber</h2>
<p>Die Website <strong>timetoflash.fr</strong> und der Dienst Time to Flash werden herausgegeben von:</p>
<p>
  <strong>BLACK BY C</strong><br />
  Vereinfachte Aktiengesellschaft französischen Rechts mit einem einzigen Gesellschafter (SASU), Stammkapital 300 €<br />
  Sitz: 2 impasse des Ligures, 44840 Les Sorinières, Frankreich<br />
  Eingetragen im Handels- und Gesellschaftsregister (RCS) Nantes unter der Nummer <strong>898 409 446</strong><br />
  SIRET (Sitz): 898 409 446 00017<br />
  APE-Code: 70.10Z<br />
  Umsatzsteuer-Identifikationsnummer: FR27898409446
</p>
<p>E-Mail: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>2. Verantwortlich für den Inhalt</h2>
<p>Herr <strong>Clément LEMERLE</strong>, in seiner Eigenschaft als Präsident der Gesellschaft BLACK BY C.</p>

<h2>3. Hosting</h2>
<p>Die Website wird gehostet von:</p>
<p>
  <strong>Vercel, Inc.</strong><br />
  340 S Lemon Ave #4133, Walnut, CA 91789, Vereinigte Staaten<br />
  <a href="https://vercel.com" rel="nofollow noreferrer" target="_blank">vercel.com</a>
</p>
<p>Die Anwendungsdaten und die von den Nutzern hochgeladenen Inhalte werden gehostet von:</p>
<ul>
  <li><strong>Supabase, Inc.</strong>, Gesellschaft US-amerikanischen Rechts, Datenbank und Authentifizierung (<a href="https://supabase.com" rel="nofollow noreferrer" target="_blank">supabase.com</a>)</li>
  <li><strong>Cloudflare, Inc.</strong>, Dateispeicherung (Cloudflare R2), 101 Townsend St, San Francisco, CA 94107, Vereinigte Staaten (<a href="https://www.cloudflare.com" rel="nofollow noreferrer" target="_blank">cloudflare.com</a>)</li>
</ul>
<p>Die Daten und Inhalte werden in der Region <strong>Westeuropa</strong> gespeichert.</p>

<h2>4. Geistiges Eigentum</h2>
<p>Die Marke „Time to Flash“, der Domainname timetoflash.fr, das Erscheinungsbild, die Texte, Bilder, die Struktur der Website, die Datenbanken und der Quellcode sind ausschließliches Eigentum von BLACK BY C oder werden ihr in Lizenz überlassen.</p>
<p>Jede vollständige oder teilweise Vervielfältigung, Wiedergabe, Änderung, Bearbeitung oder Verwertung dieser Elemente, gleich mit welchem Verfahren und auf welchem Träger, ohne vorherige schriftliche Genehmigung von BLACK BY C ist untersagt und stellt eine Verletzung im Sinne der Artikel L.335-2 ff. des französischen Gesetzbuchs über geistiges Eigentum (Code de la propriété intellectuelle) dar.</p>
<p>Die von den Nutzern hochgeladenen Fotos bleiben Eigentum ihrer jeweiligen Urheber. BLACK BY C verfügt an diesen Inhalten nur über die Rechte, die für die Erbringung des Dienstes unbedingt erforderlich sind, gemäß den <a href="/cgv">Allgemeinen Verkaufs- und Nutzungsbedingungen</a>.</p>

<h2>5. Haftung</h2>
<p>BLACK BY C bemüht sich um die Richtigkeit und Aktualität der auf der Website veröffentlichten Informationen, kann jedoch weder deren Vollständigkeit noch völlige Fehlerfreiheit garantieren. BLACK BY C behält sich das Recht vor, den Inhalt der Website jederzeit und ohne Vorankündigung zu berichtigen.</p>
<p>Der Nutzer erkennt an, die Website ausschließlich auf eigene Verantwortung zu nutzen. BLACK BY C haftet nicht für Schäden, die aus einer nicht bestimmungsgemäßen Nutzung der Website oder des Dienstes entstehen, noch für Unterbrechungen, die auf das Internet, die Ausstattung des Nutzers oder höhere Gewalt zurückzuführen sind.</p>

<h2>6. Links</h2>
<p>Die Website kann Links zu Websites Dritter enthalten. BLACK BY C hat keinerlei Kontrolle über diese Websites und übernimmt keine Verantwortung für deren Inhalte, Praktiken oder Datenschutzbestimmungen.</p>

<h2>7. Personenbezogene Daten und Cookies</h2>
<p>Die Verarbeitung personenbezogener Daten ist in der <a href="/politique-de-confidentialite">Datenschutzerklärung</a> beschrieben.</p>
<p>Cookies, die für den Betrieb des Dienstes unbedingt erforderlich sind (Sitzung, Authentifizierung, Sicherheit), bedürfen nach Artikel 82 des französischen Datenschutzgesetzes (loi Informatique et Libertés) keiner vorherigen Einwilligung.</p>
<p>Die Website verwendet außerdem <strong>Tracker zur Reichweitenmessung und für Werbung</strong> (Meta, Google), die erst nach Ihrer <strong>ausdrücklichen Einwilligung</strong> gesetzt werden, die über das bei Ihrem ersten Besuch angezeigte Banner eingeholt wird. Sie können Ihre Wahl jederzeit über den Link „Cookies“ in der Fußzeile ändern. Einzelheiten finden Sie in der <a href="/politique-de-confidentialite">Datenschutzerklärung</a>.</p>

<h2>8. Meldung rechtswidriger Inhalte</h2>
<p>Gemäß der Verordnung (EU) 2022/2065 über digitale Dienste und dem französischen Gesetz Nr. 2004-575 vom 21. Juni 2004 können rechtswidrige Inhalte, die auf dem Dienst gehostet werden, an <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a> gemeldet werden, unter Angabe der URL oder Kennung des betreffenden Events, der Art des beanstandeten Inhalts und der Gründe für die Meldung.</p>

<h2>9. Anwendbares Recht</h2>
<p>Dieses Impressum unterliegt französischem Recht.</p>
`,
}

const cgvDe = {
  slug: 'cgv',
  title: 'Allgemeine Verkaufs- und Nutzungsbedingungen',
  shortTitle: 'AGB',
  description: 'Pakete, Preise, Zahlung, Widerrufsrecht, Aufbewahrung der Fotos und Haftung des Dienstes Time to Flash.',
  html: `
<h2>Artikel 1: Gegenstand</h2>
<p>Diese Allgemeinen Verkaufs- und Nutzungsbedingungen (die „<strong>AGB</strong>“) regeln den Verkauf und die Nutzung des Dienstes <strong>Time to Flash</strong>, erreichbar unter timetoflash.fr.</p>
<p>Sie gelten für jede kostenlose oder kostenpflichtige Erstellung eines Events sowie für jede Bestellung von Fotoabzügen auf Papier (Artikel 20), unter Ausschluss aller anderen Bedingungen. Mit der Erstellung eines Events oder der Aufgabe einer Bestellung werden diese AGB vollständig und vorbehaltlos angenommen.</p>

<h2>Artikel 2: Angaben zum Verkäufer</h2>
<p><strong>BLACK BY C</strong>, SASU mit einem Stammkapital von 300 €, mit Sitz in 2 impasse des Ligures, 44840 Les Sorinières, Frankreich, eingetragen im RCS Nantes unter der Nummer 898 409 446, USt-IdNr. FR27898409446.</p>
<p>Kontakt: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>

<h2>Artikel 3: Begriffsbestimmungen</h2>
<ul>
  <li><strong>Dienst</strong>: die Lösung Time to Flash, mit der die von den Gästen eines Events aufgenommenen Fotos gesammelt und nach dem Event enthüllt werden.</li>
  <li><strong>Gastgeber</strong>: die natürliche oder juristische Person, die ein Event erstellt und gegebenenfalls den entsprechenden Preis bezahlt.</li>
  <li><strong>Gast</strong>: jede Person, die über den vom Gastgeber mitgeteilten Link oder QR-Code auf ein Event zugreift und Inhalte hochlädt.</li>
  <li><strong>Event</strong>: der vom Gastgeber erstellte Bereich, der einem Paket und einer Höchstzahl von Gästen zugeordnet ist.</li>
  <li><strong>Inhalte</strong>: die von den Gästen hochgeladenen Fotos.</li>
  <li><strong>Enthüllung</strong>: der vom Gastgeber bei der Erstellung des Events festgelegte Zeitpunkt, ab dem die Inhalte für den Gastgeber und die Gäste zugänglich werden.</li>
</ul>

<h2>Artikel 4: Beschreibung des Dienstes</h2>
<p>Der Dienst ermöglicht es dem Gastgeber, ein Event zu erstellen, Gäste über einen Link oder QR-Code einzuladen und die von ihnen hochgeladenen Inhalte zu sammeln.</p>
<p>Die wesentlichen Merkmale des Dienstes sind:</p>
<ul>
  <li><strong>Anzahl der Aufnahmen pro Gast</strong>: vom Gastgeber zwischen <strong>3 und 15 Aufnahmen</strong> festgelegt, für alle Gäste desselben Events gleich. Sie kann bis zum Beginn des Events geändert werden und ist danach festgeschrieben. Der Gastgeber kann zudem eine <strong>einmalige Nachladung</strong> von 1 bis 5 zusätzlichen Aufnahmen erlauben, die jeder Gast, der seine Aufnahmen aufgebraucht hat, ein einziges Mal anfordern kann; der Gastgeber kann diese Nachladung ablehnen.</li>
  <li><strong>Zulässige Formate</strong>: <strong>ausschließlich Fotos</strong>, keine Videos und keine Tonaufnahmen. Hochgeladene Bilder werden automatisch verkleinert und komprimiert.</li>
  <li><strong>Höchstzahl der Gäste</strong>: richtet sich nach dem gewählten Paket gemäß der Tabelle in Artikel 5.</li>
  <li><strong>Zugang</strong>: über einen Webbrowser, ohne Installation einer App, sowohl für den Gastgeber als auch für die Gäste.</li>
</ul>
<p>Die Inhalte sind während des Events nicht einsehbar: Sie werden zum vom Gastgeber gewählten Zeitpunkt der Enthüllung freigegeben.</p>
<p>Die Nutzung des Dienstes setzt ein kompatibles Gerät mit Kamera und Internetverbindung voraus, für das der Gastgeber und die Gäste selbst zu sorgen haben.</p>

<h2>Artikel 5: Pakete und Preise</h2>
<table>
  <thead>
    <tr><th>Paket</th><th>Höchstzahl der Gäste</th><th>Preis</th></tr>
  </thead>
  <tbody>
    <tr><td>Entdecken</td><td>5</td><td>Kostenlos, ohne Kreditkarte</td></tr>
    <tr><td>10 Gäste</td><td>10</td><td>1,99 €</td></tr>
    <tr><td>30 Gäste</td><td>30</td><td>4,99 €</td></tr>
    <tr><td>50 Gäste</td><td>50</td><td>14,99 €</td></tr>
    <tr><td>100 Gäste</td><td>100</td><td>29,99 €</td></tr>
    <tr><td>150 Gäste</td><td>150</td><td>34,99 €</td></tr>
    <tr><td>200 Gäste</td><td>200</td><td>39,99 €</td></tr>
    <tr><td>300 Gäste</td><td>300 und mehr</td><td>59,99 €</td></tr>
  </tbody>
</table>
<p>Die Preise verstehen sich <strong>in Euro einschließlich aller Steuern</strong>. Es wird kein Abonnement abgeschlossen: Jedes Paket wird durch eine <strong>einmalige Zahlung</strong> beglichen, die bei der Erstellung des Events fällig wird.</p>
<p>BLACK BY C behält sich das Recht vor, die Preise jederzeit zu ändern. Maßgeblich ist der am Tag der Erstellung des Events angezeigte Preis.</p>
<p><strong>Überschreitung der Gästezahl.</strong> Die Höchstzahl der Gäste des Pakets hindert niemals einen Gast daran, dem Event beizutreten oder Fotos aufzunehmen: Während des Events wird nichts gesperrt, und alle Fotos bleiben erhalten. Übersteigt die Zahl der tatsächlich angemeldeten Gäste jedoch die des gebuchten Pakets, <strong>wird die Freigabe des Albums für die Gäste (die „Enthüllung“) ausgesetzt</strong>, bis der Gastgeber das Paket bucht, das der tatsächlichen Gästezahl entspricht. Für dieses Upgrade ist nur die <strong>Preisdifferenz</strong> zwischen dem gebuchten und dem erforderlichen Paket zu zahlen; der bereits gezahlte Betrag bleibt angerechnet. Der Gastgeber wird darüber in seinem Dashboard und per E-Mail informiert. Keine Aussetzung erfolgt, wenn der Gastgeber das höchste Paket gebucht hat, das keine Begrenzung der Gästezahl vorsieht.</p>

<h2>Artikel 6: Bestellung und Vertragsschluss</h2>
<p>Die Erstellung eines Events setzt die Eingabe der abgefragten Informationen, die Bestätigung des gewählten Pakets und bei kostenpflichtigen Paketen die Zahlung des Preises voraus.</p>
<p>Vor der Bestätigung kann der Gastgeber die Einzelheiten seiner Bestellung überprüfen und etwaige Fehler korrigieren. Die Bestätigung der Bestellung nach ausdrücklicher Annahme dieser AGB führt zum Vertragsschluss.</p>
<p>Der Gastgeber erhält eine Bestätigungs-E-Mail mit einer Zusammenfassung der Bestellung.</p>

<h2>Artikel 7: Zahlung</h2>
<p>Die Zahlung erfolgt online per Kreditkarte über den Zahlungsdienstleister <strong>Stripe Payments Europe, Ltd.</strong></p>
<p>BLACK BY C hat keinerlei Zugriff auf Kartendaten; diese werden direkt von Stripe nach dessen eigenen Bedingungen erhoben und verarbeitet.</p>
<p>Das Event wird aktiviert, sobald die Zahlung tatsächlich eingegangen ist.</p>

<h2>Artikel 8: Dauer und Verfügbarkeit des Events</h2>
<p>Der Gastgeber hat ab der Zahlung <strong>zwölf (12) Monate</strong> Zeit, sein Event zu veranstalten und zu nutzen. Nach Ablauf dieser Frist gilt das Paket als verbraucht; eine Erstattung oder Verschiebung ist ausgeschlossen.</p>
<p>Die Inhalte werden gespeichert und <strong>sechs (6) Monate nach dem Datum des Events automatisch gelöscht</strong>. Im Sinne dieser AGB gilt als Datum des Events das <strong>Datum der Enthüllung</strong>, das der Gastgeber bei der Erstellung des Events gewählt hat: Mit diesem Datum beginnt die Frist von sechs Monaten.</p>
<p>Es obliegt dem Gastgeber, die Inhalte, die er behalten möchte, vor Ablauf dieser Frist herunterzuladen. Die Löschung ist endgültig und unwiderruflich.</p>

<h2>Artikel 9: Widerrufsrecht</h2>
<h3>9.1 Grundsatz</h3>
<p>Gemäß Artikel L.221-18 des französischen Verbrauchergesetzbuchs (Code de la consommation) steht einem Gastgeber, der Verbraucher ist, grundsätzlich eine Frist von vierzehn (14) Tagen ab Vertragsschluss zu, um sein Widerrufsrecht ohne Angabe von Gründen auszuüben.</p>
<h3>9.2 Ausdrücklicher Verzicht</h3>
<p>Da der Dienst unmittelbar nach der Zahlung erbracht wird, wird der Gastgeber bei der Bestellung aufgefordert, <strong>ausdrücklich die sofortige Ausführung des Dienstes zu verlangen und auf sein Widerrufsrecht zu verzichten</strong>, und zwar über ein gesondertes, nicht vorab angekreuztes Kästchen mit folgendem Wortlaut:</p>
<blockquote><p>„Ich verlange die sofortige Erstellung meines Events und verzichte auf mein 14-tägiges Widerrufsrecht.“</p></blockquote>
<p>Das Ankreuzen dieses Kästchens gilt im Sinne von Artikel L.221-28 des französischen Verbrauchergesetzbuchs als ausdrückliches Verlangen nach sofortiger Ausführung des Dienstes vor Ablauf der Widerrufsfrist und als ausdrücklicher Verzicht auf dieses Recht, wobei der Gastgeber anerkennt, dass er es verliert, sobald der Dienst vollständig erbracht ist.</p>
<p>Ohne diesen Verzicht bleibt das Widerrufsrecht bestehen und kann durch jede eindeutige Erklärung an support@timetoflash.fr oder mit dem Muster-Widerrufsformular in <strong>Anhang 1</strong> ausgeübt werden.</p>
<h3>9.3 Folgen</h3>
<p>Übt der Gastgeber sein Widerrufsrecht aus, nachdem mit der Ausführung des Dienstes auf sein ausdrückliches Verlangen hin begonnen wurde, schuldet er einen Betrag, der dem bis zur Mitteilung seiner Entscheidung erbrachten Dienst entspricht, gemäß Artikel L.221-25 des französischen Verbrauchergesetzbuchs.</p>
<p>Die Erstattung erfolgt innerhalb von höchstens vierzehn (14) Tagen nach Eingang des Widerrufs über dasselbe Zahlungsmittel, das bei der Bestellung verwendet wurde.</p>

<h2>Artikel 10: Erstattung</h2>
<p>Außer in den in Artikel 9 vorgesehenen Fällen und im Rahmen der in Artikel 13 genannten gesetzlichen Gewährleistung <strong>wird keine Erstattung gewährt</strong>.</p>
<p>Insbesondere kann keine Erstattung verlangt werden, sobald mindestens ein Gast Inhalte in das Event hochgeladen hat, da der Dienst dann als erbracht gilt.</p>
<p>Diese Bestimmungen stehen der Geltendmachung der gesetzlichen Gewährleistung nicht entgegen, die in jedem Fall anwendbar bleibt.</p>

<h2>Artikel 11: Pflichten des Gastgebers</h2>
<p>Der Gastgeber sichert zu:</p>
<ol>
  <li><strong>die Gäste</strong> vor ihrer Teilnahme über den Zweck der Erhebung, die Aufbewahrungsdauer der Inhalte und ihre Rechte an ihren personenbezogenen Daten <strong>zu informieren</strong>;</li>
  <li><strong>die erforderlichen Einwilligungen nach dem Recht am eigenen Bild</strong> (Artikel 9 des französischen Code civil) bei den auf den Inhalten abgebildeten Personen einzuholen, insbesondere bei den gesetzlichen Vertretern Minderjähriger;</li>
  <li>den Dienst nicht zweckzuentfremden und nicht für rechtswidrige Zwecke zu nutzen;</li>
  <li>die Inhalte nicht über den Kreis der Personen hinaus zu verbreiten, die ihrer Verbreitung zugestimmt haben.</li>
</ol>
<p>Der Gastgeber ist allein verantwortlich für die Verwendung der Inhalte nach dem Herunterladen. Er stellt BLACK BY C von allen Ansprüchen Dritter frei, die auf in sein Event hochgeladenen Inhalten beruhen.</p>

<h2>Artikel 12: Inhalte und Moderation</h2>
<p>Streng verboten sind rechtswidrige Inhalte, insbesondere kinderpornografische, gewaltverherrlichende, hasserfüllte oder verleumderische Inhalte, Inhalte, die die Privatsphäre oder das Recht am eigenen Bild Dritter verletzen, sowie rechtsverletzende Inhalte.</p>
<p>BLACK BY C handelt als Hosting-Anbieter im Sinne von Artikel 6 des französischen Gesetzes Nr. 2004-575 vom 21. Juni 2004. Sie nimmt keine allgemeine Überwachung der Inhalte vor, verpflichtet sich jedoch, offensichtlich rechtswidrige Inhalte, die ihr unter support@timetoflash.fr zur Kenntnis gebracht werden, unverzüglich zu entfernen.</p>
<p>Jeder Gast kann seine eigenen Inhalte vor der Enthüllung löschen. Auch der Gastgeber kann in sein Event hochgeladene Inhalte entfernen.</p>
<p>BLACK BY C behält sich das Recht vor, ein Event, das offensichtlich gegen diese AGB oder gegen das Gesetz verstößt, ohne Vorankündigung und ohne Erstattung zu sperren oder zu löschen.</p>

<h2>Artikel 13: Gesetzliche Gewährleistung</h2>
<p>BLACK BY C haftet für Vertragswidrigkeiten digitaler Inhalte und digitaler Dienstleistungen nach Maßgabe der <strong>Artikel L.224-25-12 ff. des französischen Verbrauchergesetzbuchs</strong>.</p>
<p>Bei fortlaufend bereitgestellten digitalen Dienstleistungen gilt die gesetzliche Gewährleistung für die gesamte Dauer der Bereitstellung.</p>
<p>Ein Gastgeber, der Verbraucher ist, kann innerhalb von zwei Jahren ab der Bereitstellung die Herstellung des vertragsgemäßen Zustands verlangen. Unter den gesetzlichen Voraussetzungen kann er eine Minderung des Preises oder die Auflösung des Vertrags verlangen.</p>
<p>BLACK BY C haftet außerdem für verborgene Mängel nach Maßgabe der Artikel 1641 ff. des französischen Code civil.</p>
<p>Keine Bestimmung dieser AGB kann diese Gewährleistungsrechte einschränken oder ausschließen.</p>

<h2>Artikel 14: Verfügbarkeit und Haftung</h2>
<p>BLACK BY C setzt angemessene Mittel ein, um die Verfügbarkeit und Kontinuität des Dienstes sicherzustellen, ohne jedoch einen bestimmten Erfolg zu schulden.</p>
<p>Der Dienst kann für Wartungsarbeiten, bei Ausfall eines technischen Dienstleisters oder bei höherer Gewalt unterbrochen werden. BLACK BY C bemüht sich, die Gastgeber über jede erhebliche geplante Unterbrechung zu informieren.</p>
<p>BLACK BY C haftet nicht für den Verlust von Inhalten infolge einer automatischen Löschung nach Ablauf der in Artikel 8 vorgesehenen Fristen, einer Handlung des Gastgebers oder eines Gastes oder eines nicht rechtzeitigen Herunterladens.</p>
<p>Sollte BLACK BY C haftbar gemacht werden, ist die Haftung in jedem Fall auf den Betrag begrenzt, den der Gastgeber für das betreffende Event tatsächlich gezahlt hat, außer bei grober Fahrlässigkeit, Vorsatz oder Personenschäden.</p>

<h2>Artikel 15: Geistiges Eigentum und Lizenz an den Inhalten</h2>
<p>Die Inhalte bleiben Eigentum ihrer Urheber.</p>
<p>Der Gastgeber und die Gäste räumen BLACK BY C eine nicht ausschließliche, unentgeltliche und auf die Dauer des Hostings der Inhalte beschränkte Lizenz ein, ausschließlich zum Zweck der Speicherung, der technischen Verarbeitung und der Bereitstellung innerhalb des Events. Diese Lizenz schließt jede kommerzielle, werbliche oder Werbezwecken dienende Verwertung aus.</p>
<p>Jede Verwendung eines Inhalts durch BLACK BY C zu Kommunikationszwecken bedarf der vorherigen, ausdrücklichen und schriftlichen Zustimmung des Gastgebers und der betroffenen Personen.</p>

<h2>Artikel 16: Personenbezogene Daten</h2>
<p>Die Verarbeitung personenbezogener Daten ist in der <a href="/politique-de-confidentialite">Datenschutzerklärung</a> beschrieben.</p>
<p>Für die in ein Event hochgeladenen Inhalte handelt BLACK BY C als <strong>Auftragsverarbeiter</strong> des Gastgebers, nach Maßgabe von <strong>Anhang 2</strong> dieser AGB.</p>

<h2>Artikel 17: Änderung der AGB</h2>
<p>BLACK BY C kann diese AGB jederzeit ändern. Maßgeblich ist die am Tag der Erstellung des Events geltende Fassung, von der der Gastgeber eine Kopie erhält oder die auf der Website abrufbar bleibt.</p>

<h2>Artikel 18: Beschwerden und Verbraucherschlichtung</h2>
<p>Beschwerden sind zunächst an BLACK BY C unter <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a> zu richten. BLACK BY C verpflichtet sich, innerhalb einer angemessenen Frist zu antworten.</p>
<p>Gemäß Artikel L.612-1 des französischen Verbrauchergesetzbuchs kann ein Gastgeber, der Verbraucher ist, zur gütlichen Beilegung einer Streitigkeit kostenlos einen Verbraucherschlichter anrufen, nachdem er zuvor eine schriftliche Beschwerde an BLACK BY C gerichtet hat.</p>
<p>Die Kontaktdaten des zuständigen Verbraucherschlichters werden in diesem Artikel veröffentlicht, sobald BLACK BY C dem Schlichtungsverfahren beigetreten ist, was derzeit vorbereitet wird.</p>
<p>Ein Gastgeber, der Verbraucher ist, kann außerdem die Europäische Plattform zur Online-Streitbeilegung nutzen, erreichbar unter <a href="https://ec.europa.eu/consumers/odr" rel="nofollow noreferrer" target="_blank">ec.europa.eu/consumers/odr</a>.</p>

<h2>Artikel 19: Anwendbares Recht und Gerichtsstand</h2>
<p>Diese AGB unterliegen französischem Recht.</p>
<p>Kommt keine gütliche Einigung zustande, sind für alle Streitigkeiten die französischen Gerichte zuständig. Der Verbraucher kann nach seiner Wahl das Gericht seines Wohnsitzes oder das Gericht am Sitz von BLACK BY C anrufen.</p>

<hr />

<h2>Artikel 20: Verkauf von Fotoabzügen auf Papier</h2>
<h3>20.1 Gegenstand</h3>
<p>Aus dem Album eines enthüllten Events heraus kann jeder Gastgeber oder Gast (der „<strong>Käufer</strong>“) Fotoabzüge auf Papier von den Fotos dieses Events bestellen. Die Abzüge sind ausschließlich für den privaten Gebrauch bestimmt.</p>
<h3>20.2 Preise</h3>
<p>Die Preise verstehen sich in Euro einschließlich aller Steuern: ein Preis pro Abzug je nach Format sowie Versandkosten je nach Bestimmungsland und Anzahl der Abzüge. Geliefert wird in das französische Mutterland und in die bei der Bestellung aufgeführten Länder der Europäischen Union. Die Einzelheiten (Anzahl der Abzüge, Format, Oberfläche, Filmlook, Versand, Gesamtbetrag) werden vor der Zahlung angezeigt und in der Bestätigungs-E-Mail wiederholt.</p>
<h3>20.3 Bestellung und Zahlung</h3>
<p>Die Bestellung ist online mit den von unserem Zahlungsdienstleister Stripe angebotenen Zahlungsarten zu bezahlen. Der Vertrag kommt zustande, sobald die Zahlung angenommen wurde; der Käufer erhält eine Bestätigung per E-Mail.</p>
<h3>20.4 Herstellung und Lieferung</h3>
<p>Die Abzüge werden in Frankreich von einem Partnerlabor gedruckt und anschließend von La Poste im Umschlag an die vom Käufer angegebene Adresse versandt. Der Versand erfolgt als Brief ohne Sendungsverfolgung. Sobald die Bestellung an das Labor übermittelt wurde, werden die Abzüge noch am selben Tag aufgegeben (am Montag bei einer Bestellung am Freitag nach 17 Uhr oder am Wochenende); die voraussichtliche Lieferzeit beträgt drei (3) bis vier (4) Werktage im französischen Mutterland. In jedem Fall werden die Abzüge spätestens dreißig (30) Tage nach der Bestellung geliefert, gemäß Artikel L.216-1 des französischen Verbrauchergesetzbuchs. Der Käufer wird per E-Mail über den Versand informiert.</p>
<h3>20.5 Erscheinungsbild der Abzüge</h3>
<p>Jeder Abzug gibt das vollständige Foto mit einem weißen Rand wieder. Die bei der Bestellung angezeigte Vorschau ist unverbindlich: Zwischen Bildschirm und Papierdruck können leichte Farbabweichungen auftreten. Die Qualität eines Abzugs hängt von der Qualität des während des Events aufgenommenen Fotos ab.</p>
<h3>20.6 Kein Widerrufsrecht</h3>
<p>Da die Abzüge nach den Vorgaben des Käufers angefertigt und eindeutig auf seine persönlichen Bedürfnisse zugeschnitten sind (Auswahl der Fotos, des Formats, der Oberfläche und des Filmlooks), <strong>besteht kein Widerrufsrecht</strong>, gemäß Artikel L.221-28 Nr. 3 des französischen Verbrauchergesetzbuchs. Der Käufer wird darüber vor der Bestellung informiert.</p>
<h3>20.7 Gewährleistung und Beschwerden</h3>
<p>Für die Abzüge gelten die gesetzliche Gewährleistung für Vertragsmäßigkeit (Artikel L.217-3 ff. des französischen Verbrauchergesetzbuchs) und die Gewährleistung für verborgene Mängel (Artikel 1641 ff. des französischen Code civil). Beschädigte, fehlerhaft gedruckte oder nicht erhaltene Abzüge können an support@timetoflash.fr gemeldet werden, gegebenenfalls mit einem Foto des Mangels: BLACK BY C nimmt dann nach Wahl des Käufers einen Neudruck oder eine Erstattung der betreffenden Abzüge vor.</p>

<h2>Anhang 1: Muster-Widerrufsformular</h2>
<blockquote>
  <p>An BLACK BY C, 2 impasse des Ligures, 44840 Les Sorinières, Frankreich (support@timetoflash.fr)</p>
  <p>Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:</p>
  <p>
    Bestellt am: ……………………<br />
    Referenz des Events: ……………………<br />
    Name des Gastgebers: ……………………<br />
    Anschrift: ……………………<br />
    Datum: ……………………<br />
    Unterschrift (nur bei Mitteilung auf Papier): ……………………
  </p>
</blockquote>

<h2>Anhang 2: Vereinbarung zur Auftragsverarbeitung (Artikel 28 DSGVO)</h2>
<h3>1. Rollen</h3>
<p>Für die von den Gästen hochgeladenen Inhalte und die damit verbundenen Daten <strong>handelt der Gastgeber als Verantwortlicher</strong> und <strong>BLACK BY C als Auftragsverarbeiter</strong>.</p>
<p>Für die Daten zur Verwaltung ihres eigenen Kundenkontos (Identifizierung des Gastgebers, Rechnungsstellung, Support) bleibt BLACK BY C Verantwortlicher.</p>

<h3>2. Gegenstand, Dauer und Art der Verarbeitung</h3>
<ul>
  <li><strong>Gegenstand</strong>: Erhebung, Hosting, zeitversetzte Bereitstellung und Löschung der in ein Event hochgeladenen Inhalte.</li>
  <li><strong>Dauer</strong>: Dauer des Events zuzüglich der in Artikel 8 vorgesehenen Aufbewahrungsfrist.</li>
  <li><strong>Art der Vorgänge</strong>: Erhebung, Erfassung, Speicherung, Organisation, Abfrage, Übermittlung, Löschung.</li>
  <li><strong>Kategorien betroffener Personen</strong>: Gastgeber, Gäste und alle auf den Inhalten abgebildeten Personen.</li>
  <li><strong>Datenkategorien</strong>: Bilder natürlicher Personen, Vorname oder Pseudonym, Zeitstempel, E-Mail-Adresse des Gastgebers, freiwillige E-Mail-Adresse der Gäste (Zugang zu den eigenen Fotos und Zusendung des Album-Links), vor Einstellung dieser Erhebung erfasste Telefonnummern, technische Verbindungsdaten.</li>
</ul>
<p><strong>Nicht Gegenstand dieser Vereinbarung</strong>: die Antworten des Gastgebers oder der Gäste auf die Zufriedenheitsumfrage zum Dienst selbst. Diese Antworten werden nicht im Auftrag des Gastgebers, sondern für BLACK BY C verarbeitet, die dafür Verantwortlicher ist; sie werden dem Gastgeber niemals mitgeteilt. Die Einzelheiten sind in Artikel 3.3 der Datenschutzerklärung beschrieben.</p>

<h3>3. Pflichten von BLACK BY C</h3>
<p>BLACK BY C verpflichtet sich:</p>
<ol>
  <li>die Daten nur auf dokumentierte Weisung des Gastgebers und ausschließlich für die oben beschriebenen Zwecke zu verarbeiten;</li>
  <li>die Vertraulichkeit der Daten zu gewährleisten und nur befugten Personen Zugang zu gewähren;</li>
  <li>geeignete technische und organisatorische Maßnahmen umzusetzen (Verschlüsselung bei der Übertragung, Zugriffskontrolle, Trennung der Events, Protokollierung);</li>
  <li>den Gastgeber bei der Beantwortung von Anträgen betroffener Personen auf Wahrnehmung ihrer Rechte zu unterstützen;</li>
  <li>den Gastgeber unverzüglich über jede Verletzung des Schutzes personenbezogener Daten zu informieren;</li>
  <li>die Daten nach Ende der Leistung nach Maßgabe von Artikel 8 zu löschen;</li>
  <li>alle Informationen zur Verfügung zu stellen, die zum Nachweis der Einhaltung ihrer Pflichten erforderlich sind.</li>
</ol>

<h3>4. Unterauftragsverarbeiter</h3>
<p>Der Gastgeber erlaubt BLACK BY C, folgende Unterauftragsverarbeiter einzusetzen:</p>
<table>
  <thead>
    <tr><th>Unterauftragsverarbeiter</th><th>Aufgabe</th><th>Speicherort der Daten</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>Hosting der Anwendung</td><td>Europa</td></tr>
    <tr><td>Supabase, Inc.</td><td>Datenbank, Authentifizierung</td><td>Westeuropa</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>Speicherung der Inhalte (R2)</td><td>Westeuropa</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>Zahlungsabwicklung</td><td>Europäische Union</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>Versand transaktionaler E-Mails</td><td>Europäische Union (Frankreich)</td></tr>
    <tr><td>Familink</td><td>Druck und Versand der bestellten Fotoabzüge (Name, Postanschrift, bestellte Fotos)</td><td>Frankreich</td></tr>
  </tbody>
</table>
<p>BLACK BY C informiert den Gastgeber über jede beabsichtigte Änderung; der Gastgeber hat eine angemessene Frist, um Einwände zu erheben.</p>

<h3>5. Übermittlungen außerhalb der Europäischen Union</h3>
<p>Einige der genannten Dienstleister sind Gesellschaften US-amerikanischen Rechts, die zum Zweck der technischen Verwaltung aus den Vereinigten Staaten auf die Daten zugreifen können. Diese Übermittlungen sind durch die Standardvertragsklauseln der Europäischen Kommission und gegebenenfalls durch eine Zertifizierung nach dem <em>Data Privacy Framework</em> abgesichert.</p>

<h3>6. Information der Gäste</h3>
<p>Der Gastgeber erkennt an, dass es ihm obliegt, die Gäste zu informieren und über eine Rechtsgrundlage für die Verarbeitung zu verfügen.</p>
<p>BLACK BY C stellt in der Upload-Oberfläche im Namen und im Auftrag des Gastgebers einen Informationshinweis für die Gäste bereit.</p>
`,
}

const confidentialiteDe = {
  slug: 'politique-de-confidentialite',
  title: 'Datenschutzerklärung',
  description: 'Welche Daten Time to Flash verarbeitet, warum, wie lange, und wie Sie Ihre Rechte ausüben.',
  html: `
<p class="legal-lead">Time to Flash ist ein Dienst, der die von den Gästen eines Events aufgenommenen Fotos sammelt und nach dem Event enthüllt. Dieses Dokument erklärt, welche Daten verarbeitet werden, warum, wie lange, und welche Rechte Sie haben.</p>

<h2>1. Wer Ihre Daten verarbeitet</h2>
<p><strong>BLACK BY C</strong>, SASU mit einem Stammkapital von 300 €, 2 impasse des Ligures, 44840 Les Sorinières, Frankreich, RCS Nantes 898 409 446.</p>
<p>Kontakt: <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a></p>
<p>BLACK BY C hat keinen Datenschutzbeauftragten benannt, da dies für ihre Tätigkeit nicht vorgeschrieben ist. Fragen zu personenbezogenen Daten können an die oben genannte Adresse gerichtet werden.</p>

<h2>2. Zwei Situationen sind zu unterscheiden</h2>
<p><strong>Wenn Sie ein Event erstellen</strong> (Sie sind „Gastgeber“), verarbeitet BLACK BY C Ihre Daten für eigene Zwecke: Sie ist <strong>Verantwortlicher</strong>.</p>
<p><strong>Wenn Gäste Fotos in ein Event hochladen</strong>, entscheidet der Gastgeber über die Erhebung, lädt die Gäste ein und bestimmt, wer auf die Inhalte zugreift. BLACK BY C handelt dann nur als <strong>Auftragsverarbeiter</strong> auf Weisung des Gastgebers. Anfragen zu diesen Inhalten sind vorrangig an den Gastgeber des betreffenden Events zu richten; BLACK BY C unterstützt ihn bei der Beantwortung.</p>
<p><strong>Eine Ausnahme: die Antworten auf die Zufriedenheitsumfrage.</strong> Wenn ein Gastgeber oder ein Gast seine Meinung zum Dienst selbst abgibt, wendet er sich an BLACK BY C und nicht an den Gastgeber des Events. BLACK BY C ist dann <strong>Verantwortlicher</strong>, und der Gastgeber des Events hat niemals Zugang zu diesen Antworten. Einzelheiten finden Sie in Artikel 3.3.</p>

<h2>3. Verarbeitete Daten und Zwecke</h2>
<h3>3.1 Gastgeber</h3>
<table>
  <thead>
    <tr><th>Daten</th><th>Zweck</th><th>Rechtsgrundlage</th><th>Speicherdauer</th></tr>
  </thead>
  <tbody>
    <tr><td>E-Mail-Adresse, Name oder Vorname</td><td>Erstellung und Verwaltung des Kontos, Zusendung der Zugänge zum Event</td><td>Vertragserfüllung</td><td>3 Jahre ab dem letzten Kontakt</td></tr>
    <tr><td>Bestell- und Rechnungsdaten</td><td>Abwicklung der Bestellung, buchhalterische Pflichten</td><td>Vertragserfüllung und rechtliche Verpflichtung</td><td>10 Jahre (Artikel L.123-22 des französischen Code de commerce)</td></tr>
    <tr><td>E-Mail-Adresse, Inhalt des Austauschs</td><td>Bearbeitung von Supportanfragen</td><td>berechtigtes Interesse</td><td>3 Jahre ab dem letzten Kontakt</td></tr>
    <tr><td>Annahme der AGB und gegebenenfalls Verzicht auf das Widerrufsrecht (Zeitstempel, Fassung der AGB)</td><td>Nachweis der vertraglichen Einwilligung</td><td>Vertragserfüllung und berechtigtes Interesse</td><td>10 Jahre (handelsrechtliche Verjährungsfrist)</td></tr>
    <tr><td>Technische Verbindungsprotokolle</td><td>Sicherheit des Dienstes, Verhinderung von Missbrauch</td><td>berechtigtes Interesse</td><td>12 Monate</td></tr>
  </tbody>
</table>
<p>Kreditkartendaten werden von BLACK BY C <strong>niemals</strong> erhoben oder gespeichert. Sie werden direkt von Stripe verarbeitet.</p>

<h3>3.2 Gäste</h3>
<table>
  <thead>
    <tr><th>Daten</th><th>Zweck</th><th>Speicherdauer</th></tr>
  </thead>
  <tbody>
    <tr><td>Fotos</td><td>Erstellung der Galerie des Events</td><td>6 Monate nach dem Datum der Enthüllung, danach automatische Löschung</td></tr>
    <tr><td>Eingegebener Vorname oder Pseudonym</td><td>Zuordnung der Beiträge innerhalb des Events</td><td>wie oben</td></tr>
    <tr><td><strong>E-Mail-Adresse</strong> (freiwillig)</td><td>einmalige Zusendung eines persönlichen Zugangslinks, mit dem der Gast seine eigenen Fotos und verbleibenden Aufnahmen auf einem anderen Gerät wiederfindet; Zusendung des Album-Links zum Zeitpunkt der Enthüllung; einmalige Zusendung eines Zufriedenheitsfragebogens ohne Erinnerung (Artikel 3.3)</td><td>wie oben</td></tr>
    <tr><td>Telefonnummer (freiwillig, wird nicht mehr erhoben)</td><td>Weitergabe des Album-Links durch den Gastgeber</td><td>wie oben</td></tr>
    <tr><td>Zeitstempel, technische Verbindungsdaten</td><td>Betrieb und Sicherheit des Dienstes</td><td>12 Monate</td></tr>
  </tbody>
</table>
<p>Um als Gast Inhalte hochzuladen, ist kein Konto erforderlich.</p>
<p>Die Angabe einer E-Mail-Adresse ist <strong>freiwillig</strong>: Der Gast kann auch ohne sie teilnehmen. Sie dient dazu, ihm den Album-Link zu senden, wenn die Fotos enthüllt werden, sowie gegebenenfalls den in Artikel 3.3 beschriebenen Zufriedenheitsfragebogen. Sie wird <strong>nicht zu Werbezwecken</strong> verwendet, niemals an Dritte weitergegeben und mit dem Event gelöscht.</p>
<p>Die Erhebung von Telefonnummern wurde eingestellt. Vor dieser Änderung erfasste Nummern unterliegen denselben Regeln und werden mit dem Event gelöscht, zu dem sie gehören. Diese Erhebung betraf nur Gäste: Ein Gastgeber kann, wenn er möchte, seine eigene Nummer im Zufriedenheitsfragebogen angeben, nach Maßgabe von Artikel 3.3.</p>
<p>Fotos können sensible Informationen offenbaren: religiöse Praxis bei einer Zeremonie, erkennbarer Gesundheitszustand, vermutete Zugehörigkeit zu einer Gruppe. BLACK BY C nutzt diese Informationen niemals und nimmt keine Analyse der Bildinhalte, keine Gesichtserkennung und kein Profiling vor.</p>

<h3>3.3 Zufriedenheitsumfrage</h3>
<p>BLACK BY C befragt Gastgeber und Gäste zu ihren Erfahrungen mit dem Dienst, um zu beheben, was nicht funktioniert, und die Weiterentwicklung auszurichten. Für diese Verarbeitung handelt BLACK BY C als <strong>Verantwortlicher</strong>: Die Antworten richten sich an sie und werden <strong>niemals an den Gastgeber des Events</strong> oder an andere Gäste weitergegeben.</p>
<table>
  <thead>
    <tr><th>Daten</th><th>Zweck</th><th>Rechtsgrundlage</th><th>Speicherdauer</th></tr>
  </thead>
  <tbody>
    <tr><td>Antworten auf den Fragebogen (Bewertung, aufgetretene Schwierigkeiten, freie Kommentare)</td><td>Verbesserung des Dienstes und Behebung von Fehlfunktionen</td><td>berechtigtes Interesse</td><td>3 Jahre ab der Antwort</td></tr>
    <tr><td>Art des verwendeten Geräts und Browsers</td><td>Nachvollziehen und Beheben gemeldeter technischer Schwierigkeiten</td><td>berechtigtes Interesse</td><td>3 Jahre ab der Antwort</td></tr>
    <tr><td>Telefonnummer des Gastgebers (freiwillig)</td><td>telefonisches Gespräch von wenigen Minuten, nur wenn ausdrücklich zugestimmt</td><td>Einwilligung</td><td>Löschung nach dem Gespräch, spätestens 6 Monate nach der Antwort</td></tr>
  </tbody>
</table>
<p>Die Teilnahme an der Umfrage ist <strong>völlig freiwillig</strong> und keine Voraussetzung für den Zugang zu irgendeiner Funktion: Eine Ablehnung oder ausbleibende Antwort hat keinerlei Auswirkung auf den erbrachten Dienst.</p>
<p>Ein Fragebogen wird <strong>nur ein einziges Mal</strong> per E-Mail versandt, ohne anschließende Erinnerung. Jede Nachricht enthält einen Link, über den Sie mit sofortiger Wirkung keine solchen Anfragen mehr erhalten; diese Ablehnung verhindert nicht die Zusendung des Album-Links, die dem Gast, der seine Adresse hinterlassen hat, weiterhin zusteht. Diese Nachrichten enthalten keine kommerziellen Angebote.</p>
<p>Die Antworten werden nach der Löschung des zugehörigen Events aufbewahrt, jedoch <strong>von diesem getrennt</strong>: Sie lassen dann weder das Event noch seinen Gastgeber erkennen und dienen nur dazu, die Entwicklung der Qualität des Dienstes im Zeitverlauf zu messen.</p>

<h3>3.4 Ausprobieren des Dienstes und Neuigkeiten von Time to Flash</h3>
<p>Der QR-Code und die Schaltfläche „Ausprobieren“ auf der Startseite erstellen ein persönliches Test-Event, das am Folgetag mitsamt seinen Fotos gelöscht wird. Um zu verstehen, was Besucher zum Ausprobieren bringt, speichert BLACK BY C <strong>ohne identifizierende Daten</strong> die Herkunft des Tests (Ursprungsseite oder Kampagne, Einstiegsseite) und die erreichten Schritte (Öffnen, Vorname angegeben, Foto aufgenommen, Album angesehen). Diese Herkunft wird im Browser des Besuchers gespeichert, ohne Werbe-Cookie, und erst beim Start eines Tests übermittelt. Rechtsgrundlage: berechtigtes Interesse von BLACK BY C, die Nutzung seiner Website zu verstehen.</p>
<p>Die während eines Tests angegebene E-Mail-Adresse dient dem Test selbst. Sie wird nur dann für <strong>Neuigkeiten von Time to Flash</strong> (Ideen, Neuheiten, Angebote) verwendet, wenn die Person das dafür vorgesehene Kästchen angekreuzt hat, das nie vorausgewählt ist. Rechtsgrundlage: Einwilligung. Jede Nachricht enthält einen Abmeldelink mit sofortiger Wirkung. Gibt es drei Jahre lang keine weitere Aktivität der Person, erhält sie keine Nachrichten mehr.</p>

<h2>4. Empfänger und Auftragsverarbeiter</h2>
<p>Die Daten werden weder verkauft noch vermietet noch zu Werbe- oder Geschäftszwecken an Dritte weitergegeben.</p>
<p>Sie sind für folgende technische Dienstleister zugänglich, die auf Weisung von BLACK BY C handeln:</p>
<table>
  <thead>
    <tr><th>Dienstleister</th><th>Aufgabe</th><th>Standort</th></tr>
  </thead>
  <tbody>
    <tr><td>Vercel, Inc.</td><td>Hosting der Website und der Anwendung</td><td>Europa</td></tr>
    <tr><td>Supabase, Inc.</td><td>Datenbank und Authentifizierung</td><td>Westeuropa</td></tr>
    <tr><td>Cloudflare, Inc.</td><td>Dateispeicherung (R2)</td><td>Westeuropa</td></tr>
    <tr><td>Stripe Payments Europe, Ltd.</td><td>Zahlungsabwicklung</td><td>Europäische Union</td></tr>
    <tr><td>Brevo (Sendinblue SAS)</td><td>Versand transaktionaler E-Mails</td><td>Europäische Union (Frankreich)</td></tr>
    <tr><td>Familink</td><td>Druck und Versand der bestellten Fotoabzüge (Name, Postanschrift, bestellte Fotos)</td><td>Frankreich</td></tr>
    <tr><td>Meta Platforms Ireland Ltd.</td><td>Reichweitenmessung für Werbung, <em>nur nach Einwilligung</em></td><td>Irland, Vereinigte Staaten</td></tr>
    <tr><td>Google Ireland Ltd.</td><td>Reichweitenmessung und Werbung, <em>nur nach Einwilligung</em></td><td>Irland, Vereinigte Staaten</td></tr>
  </tbody>
</table>
<p>Meta und Google kommen nur auf den öffentlichen Seiten der Website zum Einsatz, niemals innerhalb eines Events: <strong>Die von den Gästen hochgeladenen Fotos werden ihnen zu keinem Zeitpunkt übermittelt</strong>. Einzelheiten zu diesen Trackern und wie Sie sie ablehnen können, finden Sie in Artikel 10.</p>
<p>Die in ein Event hochgeladenen Inhalte sind für den Gastgeber dieses Events und nach der Enthüllung für die anderen Gäste desselben Events zugänglich.</p>

<h2>5. Übermittlungen außerhalb der Europäischen Union</h2>
<p>Die Daten und Inhalte werden in <strong>Westeuropa</strong> gespeichert.</p>
<p>Da einige Dienstleister Gesellschaften US-amerikanischen Rechts sind, kann ein Zugriff aus den Vereinigten Staaten zum Zweck der technischen Verwaltung nicht ausgeschlossen werden. Diese Übermittlungen sind durch die von der Europäischen Kommission erlassenen Standardvertragsklauseln und gegebenenfalls durch die Zertifizierung der Dienstleister nach dem <em>Data Privacy Framework</em> abgesichert.</p>

<h2>6. Speicherdauer</h2>
<p>Die in ein Event hochgeladenen Inhalte werden <strong>sechs Monate nach dem vom Gastgeber gewählten Datum der Enthüllung automatisch gelöscht</strong>. Diese Löschung ist endgültig und unwiderruflich: Es obliegt dem Gastgeber, die Inhalte, die er behalten möchte, vor diesem Zeitpunkt herunterzuladen.</p>
<p>Die übrigen Fristen sind in den Tabellen in Artikel 3 aufgeführt.</p>

<h2>7. Ihre Rechte</h2>
<p>Gemäß der Verordnung (EU) 2016/679 und dem französischen Gesetz Nr. 78-17 vom 6. Januar 1978 haben Sie folgende Rechte:</p>
<ul>
  <li><strong>Auskunft</strong> über Ihre Daten;</li>
  <li><strong>Berichtigung</strong> unrichtiger Daten;</li>
  <li><strong>Löschung</strong> Ihrer Daten;</li>
  <li><strong>Einschränkung</strong> der Verarbeitung;</li>
  <li><strong>Widerspruch</strong> gegen eine auf berechtigtem Interesse beruhende Verarbeitung;</li>
  <li><strong>Übertragbarkeit</strong> der von Ihnen bereitgestellten Daten;</li>
  <li><strong>Festlegung von Verfügungen</strong> über den Umgang mit Ihren Daten nach Ihrem Tod.</li>
</ul>
<p>Diese Rechte können Sie unter <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a> ausüben. Sie erhalten innerhalb eines Monats eine Antwort; bei komplexen Anfragen kann diese Frist um zwei Monate verlängert werden.</p>
<p><strong>Wenn Sie auf einem von einer anderen Person hochgeladenen Foto zu sehen sind</strong> und möchten, dass es entfernt wird, schreiben Sie an support@timetoflash.fr unter Angabe der Kennung des Events. Ihre Anfrage wird an den Gastgeber weitergeleitet, und der beanstandete Inhalt kann umgehend entfernt werden.</p>
<p>Schließlich haben Sie das Recht, Beschwerde bei der französischen Datenschutzbehörde einzulegen, der <strong>Commission Nationale de l'Informatique et des Libertés</strong> (CNIL): 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, Frankreich, <a href="https://www.cnil.fr" rel="nofollow noreferrer" target="_blank">www.cnil.fr</a>.</p>

<h2>8. Recht am eigenen Bild</h2>
<p>Das Recht am eigenen Bild, das auf Artikel 9 des französischen Code civil beruht, ist vom Recht auf Datenschutz zu unterscheiden. Jede Person hat das Recht, der Aufnahme und Verbreitung ihres Bildes zu widersprechen.</p>
<p>Es obliegt dem Gastgeber, die erforderlichen Einwilligungen der fotografierten Personen und bei Minderjährigen ihrer gesetzlichen Vertreter einzuholen.</p>

<h2>9. Sicherheit</h2>
<p>BLACK BY C setzt geeignete technische und organisatorische Maßnahmen um: Verschlüsselung der Kommunikation (HTTPS/TLS), Trennung der Daten zwischen Events, Zugriffskontrolle, Protokollierung, Datensicherungen, automatische Löschung nach Fristablauf.</p>
<p>Da kein System unfehlbar ist, würden Sie im Fall einer Verletzung des Schutzes personenbezogener Daten, die voraussichtlich ein hohes Risiko für Ihre Rechte und Freiheiten zur Folge hat, gemäß Artikel 34 DSGVO unverzüglich benachrichtigt.</p>

<h2>10. Cookies und Tracker</h2>
<p><strong>Unbedingt erforderliche Cookies.</strong> Sitzung, Authentifizierung, Sicherheit. Gemäß Artikel 82 des französischen Datenschutzgesetzes erfordern sie keine vorherige Einwilligung und können nicht deaktiviert werden, ohne den Dienst funktionsunfähig zu machen.</p>
<p><strong>Tracker zur Reichweitenmessung und für Werbung.</strong> Die Website verwendet das Meta-Pixel (Meta Platforms Ireland Limited) sowie die Dienste Google Analytics und Google Ads (Google Ireland Limited), um die Besucherzahlen der Website zu messen, die Wirksamkeit unserer Werbekampagnen zu bewerten und deren Ausrichtung zu verbessern.</p>
<p>Diese Tracker <strong>werden erst nach Ihrer ausdrücklichen Einwilligung gesetzt</strong>, die über das bei Ihrem ersten Besuch angezeigte Banner eingeholt wird. Solange Sie nicht zugestimmt haben, wird kein Skript dieser Unternehmen geladen. Ablehnen ist genauso einfach wie Zustimmen und beeinträchtigt die Funktion des Dienstes in keiner Weise.</p>
<p><strong>Widerruf Ihrer Einwilligung.</strong> Ihre Wahl wird höchstens sechs Monate gespeichert. Sie können sie jederzeit über den Link „Cookies“ in der Fußzeile ändern, der das Banner erneut öffnet.</p>
<p><strong>Rechtsgrundlage:</strong> Ihre Einwilligung (Artikel 6 Abs. 1 lit. a DSGVO). <strong>Übermittlungen außerhalb der Europäischen Union:</strong> Da diese Dienstleister Daten in die Vereinigten Staaten übermitteln können, sind diese Übermittlungen durch das Data Privacy Framework, dem Meta und Google beigetreten sind, sowie ergänzend durch die Standardvertragsklauseln der Europäischen Kommission abgesichert.</p>
<p>Sie können diesen Verarbeitungen auch direkt bei den betreffenden Unternehmen widersprechen: <a href="https://www.facebook.com/settings?tab=ads" rel="nofollow noreferrer" target="_blank">Werbeeinstellungen von Meta</a> und <a href="https://adssettings.google.com" rel="nofollow noreferrer" target="_blank">Werbeeinstellungen von Google</a>.</p>

<h2>11. Minderjährige</h2>
<p>Der Dienst ist nicht für die eigenständige Nutzung durch Personen unter fünfzehn Jahren bestimmt.</p>
<p>Da auf den bei einer Familienfeier aufgenommenen Fotos Minderjährige zu sehen sein können, obliegt es dem Gastgeber, sich der Zustimmung der Sorgeberechtigten zu vergewissern.</p>

<h2>12. Änderungen</h2>
<p>Diese Erklärung kann geändert werden, um rechtlichen oder technischen Entwicklungen Rechnung zu tragen. Maßgeblich ist die auf der Website zum Zeitpunkt Ihrer Nutzung des Dienstes veröffentlichte Fassung.</p>
`,
}

// Chaque traduction commence par l'avertissement « seule la version
// française fait foi ».
const avecAvertissement = (langue, doc) => ({ ...doc, html: AVERTISSEMENT[langue] + doc.html })

const DOCS_PAR_LANGUE = {
  fr: LEGAL_DOCS,
  en: [mentionsLegalesEn, cgvEn, confidentialiteEn].map((d) => avecAvertissement('en', d)),
  de: [mentionsLegalesDe, cgvDe, confidentialiteDe].map((d) => avecAvertissement('de', d)),
}

// Les trois documents dans la langue voulue (mêmes `slug` dans toutes les
// langues : les adresses restent /cgv, /en/cgv, /de/cgv). Français par défaut.
export function legalDocs(langue) {
  return DOCS_PAR_LANGUE[langue] || LEGAL_DOCS
}

export function legalBySlug(slug, langue) {
  return legalDocs(langue).find((d) => d.slug === slug) || null
}
