// ============================================================
//  Contenu de la page d'aide (/aide).
//
//  Volontairement HORS du blog : le journal est une vitrine, et un prospect
//  qui hésite n'a rien à gagner à tomber sur la liste de ce qui peut mal
//  tourner. Cette page ne s'atteint qu'au moment où l'on a un problème : 
//  depuis l'écran d'erreur du participant, le tableau de bord, le mail de
//  création ou le pied de page.
// ============================================================

export const AIDE = {
  title: 'Un participant bloqué ?',
  subtitle: 'Les 9 pannes les plus fréquentes, et leur solution en une minute.',
  intro:
    "Cette page est faite pour être transférée telle quelle à quelqu'un qui coince le jour J. " +
    "Chaque titre est le symptôme tel qu'on le décrit, pas la cause technique.",
  image: '/journal/ca-ne-marche-pas-solutions.webp',
  caption: "Un participant scanne un QR code posé sur une table, en soirée",
  body: `<p>Neuf fois sur dix, un participant bloqué l’est pour une des raisons ci-dessous, et la solution prend moins d’une minute. Garde cette page sous la main le jour J : elle est faite pour être transférée telle quelle à quelqu’un qui coince.</p>

<h2>1. « La caméra ne s’ouvre pas » : page ouverte dans Instagram ou Messenger</h2>
<p>C’est de loin la panne numéro un. Quand on touche un lien depuis Instagram, Messenger, WhatsApp, TikTok ou Snapchat, la page s’ouvre dans un <strong>mini-navigateur intégré à l’application</strong>, pas dans le vrai navigateur. Ces mini-navigateurs bloquent souvent l’accès à la caméra.</p>
<p><strong>La solution :</strong> touche les trois points « … » (ou la petite flèche) en haut ou en bas de l’écran, puis <strong>« Ouvrir dans le navigateur »</strong> : Safari sur iPhone, Chrome sur Android. Tout fonctionne normalement ensuite.</p>
<p>Bonne nouvelle : Time to Flash détecte ce cas et le signale. Et même si la caméra reste bloquée, le gros bouton ouvre l’appareil photo natif du téléphone : les photos partent quand même.</p>

<h2>2. « Autorisation refusée » : la caméra a été bloquée par erreur</h2>
<p>Un « Refuser » cliqué trop vite sur la demande d’autorisation, et le navigateur s’en souvient. Il faut le lui faire oublier.</p>
<p><strong>Sur iPhone (Safari) :</strong> touche <strong>« aA »</strong> à gauche de l’adresse → <em>Réglages du site</em> → <em>Caméra</em> → <strong>Autoriser</strong>.</p>
<p><strong>Sur Android (Chrome) :</strong> touche le <strong>cadenas 🔒</strong> à gauche de l’adresse → <em>Autorisations</em> → <em>Caméra</em> → <strong>Autoriser</strong>.</p>
<p>Puis recharge la page. Si la manipulation te semble compliquée à expliquer par-dessus la musique : le bouton central ouvre l’appareil photo du téléphone, ça marche aussi.</p>

<h2>3. « Le QR code ne scanne pas »</h2>
<p>Téléphone ancien, appareil photo capricieux, lumière tamisée en fin de soirée. Plutôt que d’insister : <strong>fais scanner le code depuis un autre téléphone</strong>, puis envoie le lien obtenu à la personne par message. Le lien fonctionne exactement comme le QR code.</p>
<p>Astuce préventive : sur les cartons posés en fin de repas, la lumière baisse. Prévois-en quelques-uns près des points lumineux.</p>

<h2>4. « Mes photos ne partent pas » : le réseau de la salle</h2>
<p>Le grand classique : salle des fêtes isolée, ou deux cents personnes sur la même antenne. Ce n’est pas l’application, c’est le réseau.</p>
<p><strong>Ce qu’il faut savoir :</strong> la photo est prise immédiatement, l’envoi se fait ensuite. Si ça bloque, il suffit de rester sur la page quelques secondes, ou de réessayer un peu plus loin : près d’une fenêtre, ou dehors.</p>
<p><strong>Côté organisateur :</strong> si tu connais le lieu, donne le mot de passe du wifi en même temps que le QR code. C’est le geste qui évite le plus de frustration.</p>

<h2>5. « Je ne retrouve pas mes photos »</h2>
<p>Elles sont dans <strong>« Mon album »</strong>, la pile de vignettes en bas à gauche de l’appareil. Un appui dessus ouvre l’album, avec le compteur de clichés restants et la possibilité de supprimer un raté.</p>
<p>Rappel utile à faire passer : <strong>un participant ne voit que ses propres photos.</strong> Il ne verra celles des autres qu’à la révélation. Ce n’est pas un bug, c’est le principe.</p>

<h2>6. « J’ai perdu le lien »</h2>
<p>Il suffit de <strong>rescanner le QR code</strong> : le téléphone est reconnu, les photos déjà prises sont toujours là, et le compteur reprend où il en était.</p>
<p>Si le participant est rentré chez lui, dis-lui de chercher dans l’historique de son navigateur, ou renvoie-lui simplement le lien d’invitation.</p>

<h2>7. « Pellicule pleine »</h2>
<p>Le quota est atteint. Deux possibilités : <strong>supprimer une photo ratée</strong> depuis « Mon album » (la place se libère aussitôt) ou, si tu as activé la recharge, réclamer les clichés bonus proposés à l’écran.</p>
<p>En revanche, le total ne dépassera jamais la limite que tu as fixée. C’est voulu : c’est ce qui fait qu’on vise au lieu de mitrailler.</p>

<h2>8. « On est deux sur le même téléphone »</h2>
<p>Un cas auquel personne ne pense avant qu’il n’arrive : un couple qui n’a qu’un téléphone, ou quelqu’un qui prête le sien.</p>
<p>Time to Flash reconnaît un <strong>téléphone</strong>, pas une personne. Deux participants qui photographient depuis le même appareil <strong>partagent la même pellicule</strong> et le même compteur. Il n’y a pas de contournement : c’est ce qui permet de ne demander aucun compte ni mot de passe.</p>
<p>Si c’est gênant, l’un des deux peut ouvrir le lien dans un autre navigateur du téléphone (Chrome au lieu de Safari, par exemple) : il sera compté comme un nouveau participant.</p>

<h2>9. « J’ai tout perdu » : la navigation privée</h2>
<p>En navigation privée, le téléphone oublie tout dès que l’onglet se ferme. Le participant repart alors de zéro, avec un compteur remis à neuf, et ses photos précédentes ne lui sont plus rattachées.</p>
<p>Rassure-le : <strong>les photos déjà envoyées ne sont pas perdues</strong>, elles sont dans l’album et apparaîtront à la révélation. Seul l’accès à « Mon album » est cassé. Pour la suite, dis-lui d’ouvrir le lien en navigation normale.</p>

<h2>Et pour toi, organisateur</h2>
<h3>« L’album ne s’est pas ouvert à l’heure prévue »</h3>
<p>Si plus de participants que prévu ont scanné, la révélation attend que tu passes à la formule correspondante. Ton tableau de bord te le dit, avec le montant exact de la différence : tu ne repaies jamais ce qui l’a déjà été. Aucune photo n’est perdue entre-temps.</p>
<h3>« Je ne reçois pas les mails »</h3>
<p>Regarde dans les indésirables, et ajoute notre adresse à tes contacts. Ton tableau de bord reste accessible depuis le lien du mail de création : garde-le.</p>

<p>Un cas qui n’est pas dans cette liste ? Écris-nous à <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, et pour tout le reste, il y a <a href="/guide">le guide de l’organisateur</a>.</p>`,
}
