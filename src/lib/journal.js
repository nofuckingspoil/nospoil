// ============================================================
//  Journal (blog SEO) — contenu des articles.
//  Chaque article est servi sur sa propre URL /journal/<slug> (rendu serveur).
//  Le "body" est du HTML rendu dans .dj-prose (voir globals.css).
// ============================================================

// Dégradés "argentiques" placeholder (repris du handoff design), choisis de
// façon déterministe par le slug → chaque article garde toujours sa couleur.
export const JOURNAL_GRADS = [
  'linear-gradient(150deg,#F7C26B 0%,#EE7A45 48%,#A23D5C 100%)',
  'linear-gradient(160deg,#2B2540 0%,#6E466C 55%,#D08193 100%)',
  'radial-gradient(120% 90% at 70% 20%,#FBE3A4 0%,#E89A4B 45%,#9C4A30 100%)',
  'linear-gradient(150deg,#86C0C9 0%,#D58FA6 60%,#F4C152 100%)',
  'linear-gradient(160deg,#1E2A3A 0%,#3D5A6C 50%,#E8A35A 100%)',
  'radial-gradient(100% 80% at 30% 30%,#FFF2CF 0%,#F0A95C 50%,#B55334 100%)',
]
const JOURNAL_AV = ['#EE7A45', '#6E466C', '#86C0C9', '#C25540', '#3D5A6C', '#9B5A6E']

function hash(s) {
  let h = 0
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 9973
  return h
}
export function gradientFor(slug) {
  return JOURNAL_GRADS[hash(slug) % JOURNAL_GRADS.length]
}
export function avatarColor(author) {
  return JOURNAL_AV[hash(author) % JOURNAL_AV.length]
}
// Date ISO → « 18 juin 2026 »
export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

// Les catégories, dans l'ordre d'affichage des filtres.
export const CATEGORIES = ['Tous', 'Photo', 'Organisation', 'Souvenirs', 'Coulisses']

// Articles. L'ordre d'affichage est calculé automatiquement à partir de la date
// (le plus récent en premier = "à la une"), donc tu peux ajouter un article
// n'importe où dans la liste ci-dessous sans te soucier de sa position.
const ALL_POSTS = [
  {
    slug: 'appareil-photo-jetable-mariage',
    cat: 'Photo',
    title: 'Appareil photo jetable de mariage : le carton ou l’appli ?',
    excerpt: 'Le petit jetable posé sur les tables a bercé des générations de mariages. Voici ce que sa version numérique change vraiment.',
    author: 'Camille Rouzaud',
    date: '2026-07-26',
    read: '6 min',
    caption: 'Appareils photo jetables posés sur une table de mariage',
    image: '/journal/appareil-photo-jetable-mariage-vs-appli.webp',
    body: `
<p>Tu connais le rituel : un appareil photo jetable en carton sur chaque table, et l’espoir que tes invités capturent la soirée. L’idée est excellente — mais dans les faits, la version carton coince souvent. La bonne nouvelle : son esprit se garde, ses défauts disparaissent.</p>

<h3>Ce qui est génial avec le jetable en carton</h3>
<p>La contrainte. Quelques poses par appareil, pas d’écran pour vérifier, un petit flash : on prend le temps, on vise, on obtient des photos vivantes et imparfaites. C’est exactement ce qui fait leur charme — et c’est un principe qu’on peut garder (on en parle dans <a href="/journal/dix-cliches">pourquoi 10 clichés valent mieux que 300</a>).</p>

<h3>Ce qui coince vraiment</h3>
<p>Trois problèmes reviennent à chaque mariage :</p>
<p><strong>1. Le développement.</strong> Il faut récupérer les appareils, les porter au labo, payer, attendre une semaine — et découvrir que la moitié des photos sont ratées ou perdues.<br>
<strong>2. Le coût.</strong> Un jetable, c’est 10 à 15 € pièce. Sur 15 tables, la facture grimpe vite, tirages compris.<br>
<strong>3. Les appareils oubliés.</strong> Certains repartent dans un sac, d’autres finissent dans une poubelle avec les serviettes.</p>

<blockquote class="dj-quote">« On avait mis des jetables sur les tables. On a récupéré 4 appareils sur 12, et une seule pellicule était exploitable. »
  <cite>Camille &amp; Tom · 2026</cite>
</blockquote>

<h3>La version numérique : le charme, sans la logistique</h3>
<p>Un jetable numérique, c’est le même esprit — nombre de photos limité, esthétique pellicule, révélation différée — mais sur le téléphone que tes invités ont déjà en main. Pas d’appareil à acheter ni à ramasser, pas de labo, aucune photo perdue : tout arrive au même endroit. Il te suffit d’un QR code sur les tables (voir <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a>).</p>

<p>Le carton a l’avantage de la nostalgie ; le numérique a l’avantage de te garantir de <em>récupérer</em> les souvenirs. Si tu hésites encore entre les différentes formules, on les compare toutes dans <a href="/journal/comparatif-animations-photo-mariage">photobooth, borne, miroir ou jetable</a>. Avec <a href="/">Time to Flash</a>, tu gardes le meilleur des deux : la contrainte argentique, sans la crainte de tout perdre au développement.</p>
`,
  },
  {
    slug: 'alternative-photobooth-mariage',
    cat: 'Organisation',
    title: 'Mariage sans photobooth : l’alternative que tes invités préfèrent',
    excerpt: 'Le photobooth, c’est cher, encombrant, et ça fait la queue. Voici comment obtenir les mêmes photos fun, partout dans la salle.',
    author: 'Léa Ferrand',
    date: '2026-07-19',
    read: '5 min',
    caption: 'Coin photo lors d’un mariage',
    image: '/journal/alternative-photobooth-mariage-invites.webp',
    body: `
<p>Le photobooth est une valeur sûre du mariage. Mais si tu hésites, c’est souvent pour de bonnes raisons : le prix, la place, et cette file d’attente qui vide la piste de danse au pire moment. Il existe une alternative qui coche les mêmes cases — sans les inconvénients.</p>

<h3>Ce qu’on aime dans le photobooth</h3>
<p>Il libère les gens. Un décor, des accessoires, et d’un coup tout le monde ose. Ce qu’on veut vraiment garder, ce n’est pas la borne : c’est cette autorisation de s’amuser devant l’objectif.</p>

<h3>Les vrais défauts de la borne</h3>
<p><strong>Le budget :</strong> 400 à 700 € pour la soirée (le détail poste par poste est dans <a href="/journal/prix-photobooth-mariage">combien coûte un photobooth de mariage</a>).<br>
<strong>La logistique :</strong> une table, une prise, un fond, parfois un technicien.<br>
<strong>Le goulot d’étranglement :</strong> une seule borne pour 100 invités = une file, et des photos concentrées à un seul endroit. Tu rates tout ce qui se passe ailleurs.</p>

<h3>L’alternative : transformer chaque invité en photobooth ambulant</h3>
<p>Au lieu d’une borne fixe, tu donnes à chacun un appareil photo — sur son téléphone, via un QR code. Résultat : des photos fun prises <em>partout</em>, au vin d’honneur, à table, sur la piste, dehors. Pas de file, pas de matériel, et un seul album commun à la fin.</p>

<blockquote class="dj-quote">« On a annulé le photobooth. Nos invités ont pris deux fois plus de photos, et bien plus variées. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>Comment le mettre en place</h3>
<p>Un QR code sur les tables et à l’entrée, une contrainte de quelques photos par personne pour que ça reste soigné, et une révélation le lendemain. Pour que tout le monde joue le jeu, glisse un mot sur le faire-part (on t’a préparé <a href="/journal/brief-invites">le brief invités à copier-coller</a>). C’est exactement ce que propose <a href="/">Time to Flash</a> : l’effet photobooth, dans toute la salle, pour une fraction du prix.</p>
`,
  },
  {
    slug: 'partager-photos-mariage-invites',
    cat: 'Souvenirs',
    title: 'Comment partager les photos de mariage avec tous les invités',
    excerpt: 'Fini les 6 groupes WhatsApp et les albums à moitié perdus. La méthode pour tout centraliser et tout redistribuer.',
    author: 'Tom Bréval',
    date: '2026-07-12',
    read: '5 min',
    caption: 'Album de mariage partagé sur un téléphone',
    image: '/journal/partager-photos-mariage-invites.webp',
    body: `
<p>Après le mariage, les photos existent — mais éparpillées dans dix téléphones, trois groupes WhatsApp, et l’AirDrop qu’on n’a jamais fini d’envoyer. Voici comment éviter que tes souvenirs se perdent dans la nature.</p>

<h3>Le problème : la dispersion</h3>
<p>Chaque invité repart avec ses photos. Certains les envoient, la plupart oublient. Toi, tu passes les semaines suivantes à réclamer « tu peux me renvoyer la photo de… ? » — et à recevoir des images compressées, sans les meilleures.</p>

<h3>La solution : un seul album, dès le départ</h3>
<p>La clé, c’est de centraliser <em>pendant</em> la fête, pas après (on compare les trois méthodes possibles dans <a href="/journal/whatsapp-google-photos-mariage">WhatsApp, Google Photos ou appli dédiée ?</a>). Si toutes les photos tombent automatiquement dans un même album partagé, tu n’as plus rien à réclamer : tout est déjà là, en pleine qualité. C’est le principe d’un appareil photo collaboratif à QR code.</p>

<blockquote class="dj-quote">« Personne n’a eu à m’envoyer quoi que ce soit. Le lendemain, les 300 photos étaient déjà réunies. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>Redistribuer à tout le monde, en un lien</h3>
<p>Une fois l’album constitué, tu partages un seul lien : chaque invité voit l’intégralité des photos et télécharge celles qu’il veut, en qualité complète. Pas d’inscription, pas d’appli. Tes proches qui n’étaient pas là peuvent aussi revivre la journée.</p>

<h3>Et pour toi ?</h3>
<p>Tu télécharges l’album entier d’un coup, et tu le ranges à deux endroits. Ensuite, tri tranquille (on t’explique <a href="/journal/300-photos-lendemain">comment trier les 300 photos du lendemain</a>). Avec <a href="/">Time to Flash</a>, la centralisation et le partage sont automatiques — tu n’as littéralement rien à gérer.</p>
`,
  },
  {
    slug: 'photos-mariage-effet-argentique',
    cat: 'Photo',
    title: 'Photos de mariage effet pellicule : pourquoi c’est si beau',
    excerpt: 'Grain, couleurs chaudes, petit flash : l’esthétique argentique donne à des photos de téléphone une âme de souvenir.',
    author: 'Camille Rouzaud',
    date: '2026-07-05',
    read: '4 min',
    caption: 'Photo de mariage avec un rendu pellicule argentique',
    image: '/journal/photos-mariage-effet-pellicule.webp',
    body: `
<p>Regarde les photos de mariage de tes parents : un peu de grain, des couleurs chaudes, un flash direct. Elles ont une texture que les photos ultra-nettes de nos téléphones n’ont pas. Ce n’est pas un défaut — c’est une émotion.</p>

<h3>Pourquoi l’argentique nous touche</h3>
<p>Le grain adoucit, les couleurs réchauffent la peau, le flash fige l’instant avec une franchise assumée. Notre cerveau associe ce rendu au souvenir, à la fête, à quelque chose de précieux et daté. Une photo trop parfaite, elle, ressemble à une capture d’écran.</p>

<h3>L’imperfection qui fait mouche</h3>
<p>Un mariage, ce n’est pas une séance studio : c’est des rires flous, un mouvement de danse, une larme. L’esthétique pellicule embrasse ces imperfections au lieu de les gommer. C’est précisément là que naissent les photos qu’on encadre.</p>

<blockquote class="dj-quote">« Nos photos d’invités avaient ce grain un peu vintage. Ce sont celles-là qu’on a mises dans le salon, pas les plus nettes. »
  <cite>Camille &amp; Tom · 2026</cite>
</blockquote>

<h3>L’obtenir sans matériel argentique</h3>
<p>Pas besoin de vrais appareils à pellicule (chers, aléatoires — voir <a href="/journal/appareil-photo-jetable-mariage">carton ou appli ?</a>). Un filtre argentique appliqué automatiquement à toutes les photos de tes invités donne à l’album entier une cohérence et un cachet immédiats. Avec <a href="/">Time to Flash</a>, chaque cliché pris par tes invités hérite de ce rendu — sans qu’ils aient rien à régler.</p>
`,
  },
  {
    slug: 'revelation-photos-lendemain-mariage',
    cat: 'Souvenirs',
    title: 'La révélation au lendemain : le vrai moment magique',
    excerpt: 'Cacher les photos jusqu’au lendemain recrée l’attente du développement — et t’offre un second grand moment.',
    author: 'Tom Bréval',
    date: '2026-07-01',
    read: '4 min',
    caption: 'Découverte des photos le lendemain du mariage',
    image: '/journal/decouverte-photos-mariage-lendemain.webp',
    body: `
<p>Avant, on déposait sa pellicule au labo et on attendait une semaine avant de découvrir ses photos. Cette attente faisait partie du plaisir. La « révélation différée » recrée exactement ça — et change la façon dont on vit la soirée.</p>

<h3>Pendant la fête : personne n’a le nez sur son écran</h3>
<p>Quand les photos apparaissent en direct, la soirée se transforme en fil d’actualité : on scrolle au lieu de danser. En cachant les images jusqu’au lendemain, tes invités prennent leurs photos… puis rangent leur téléphone et profitent. Tu récupères une soirée vécue, pas commentée en temps réel.</p>

<h3>Le lendemain : un second moment fort</h3>
<p>Au réveil, tout se dévoile d’un coup. C’est un rendez-vous : tu découvres la journée à travers les yeux de tes invités, ces instants que même ton photographe n’a pas pu voir (on en parle dans <a href="/journal/invites-photographe">tes invités voient ce que le photographe ne voit pas</a>). L’émotion du mariage se rejoue une seconde fois, à froid.</p>

<blockquote class="dj-quote">« Le plus beau moment, c’était le dimanche matin, café à la main, à faire défiler les photos tous les deux. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>Comment bien la régler</h3>
<p>Fixe la révélation au lendemain matin plutôt qu’en pleine nuit : tout le monde est reposé, et ça crée un vrai rituel. C’est ce que permet <a href="/">Time to Flash</a> : les photos restent cachées comme une pellicule qu’on développe, puis s’ouvrent au moment que tu choisis.</p>
`,
  },
  {
    slug: 'mariage-sans-telephone-unplugged',
    cat: 'Coulisses',
    title: 'Mariage sans téléphone (unplugged) : bonne ou mauvaise idée ?',
    excerpt: 'Interdire les téléphones pour que les gens soient présents, ou les mettre à profit ? Le vrai débat, et un juste milieu.',
    author: 'Léa Ferrand',
    date: '2026-06-25',
    read: '5 min',
    caption: 'Panneau demandant de ranger les téléphones pendant la cérémonie',
    image: '/journal/mariage-unplugged-sans-telephone.webp',
    body: `
<p>Le « mariage débranché » (unplugged) est à la mode : on demande aux invités de ranger leur téléphone pour être vraiment présents. L’intention est belle — mais la solution est parfois excessive. Faisons le tri.</p>

<h3>Pourquoi l’unplugged séduit</h3>
<p>Personne n’a envie de voir, sur les photos du premier baiser, dix bras tendus avec des téléphones. Pendant la <strong>cérémonie</strong>, l’unplugged a tout bon : les invités regardent avec leurs yeux, et ton photographe a le champ libre.</p>

<h3>Pourquoi tout interdire est dommage</h3>
<p>Le reste de la journée — vin d’honneur, dîner, soirée — c’est là que tes invités captent des moments que personne d’autre ne verra : le fou rire de la table du fond, ta grand-mère sur la piste. Tout interdire, c’est jeter ces souvenirs avec l’eau du bain.</p>

<blockquote class="dj-quote">« On a demandé zéro téléphone pendant la cérémonie, puis on les a lâchés pour la fête. Le meilleur des deux mondes. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>Le juste milieu : cadré, pas interdit</h3>
<p>La vraie solution n’est pas « téléphones interdits », mais « téléphones bien utilisés ». Cérémonie débranchée, puis un cadre simple pour la fête : un nombre de photos limité par invité (pour éviter le mitraillage, voir <a href="/journal/dix-cliches">10 clichés plutôt que 300</a>) et une révélation différée pour que personne ne scrolle pendant la soirée. Tu récoltes les souvenirs sans sacrifier la présence.</p>

<p>C’est exactement l’équilibre que permet <a href="/">Time to Flash</a> : tes invités prennent quelques photos choisies, puis rangent leur téléphone — et découvrent tout le lendemain.</p>
`,
  },
  {
    slug: 'invites-photographe',
    cat: 'Photo',
    title: 'Tes invités voient ce que le photographe ne voit pas',
    excerpt: 'Trois règles simples pour transformer 40 téléphones en un second reportage, sans gâcher la soirée.',
    author: 'Camille Rouzaud',
    date: '2026-06-18',
    read: '6 min',
    caption: 'Photo prise par un invité · Mariage de Camille & Tom',
    image: '/journal/photos-invites-mariage-moments-spontanes.webp',
    body: `
<p>Ton photographe est excellent. Mais il ne peut pas être partout : pendant qu'il cadre ton premier baiser, ton cousin fait rire toute la table du fond, ton témoin retouche son discours au dos d'un menu, et ta grand-mère danse pour la première fois depuis dix ans. Ces images-là n'existent que dans les téléphones de tes invités — et la plupart du temps, elles y restent.</p>

<h3>1. Donne une contrainte, pas une consigne</h3>
<p>« Prenez des photos ! » ne produit rien. Dix clichés par personne, en revanche, changent tout : chaque déclenchement compte, on observe avant d'appuyer, et on obtient des cadrages choisis plutôt que trois cents rafales floues. C'est le principe de l'<a href="/">appareil photo jetable</a>, appliqué au téléphone. Pour savoir quoi leur faire photographier, garde <a href="/journal/shot-list-mariage">la shot list des 50 photos</a> sous la main.</p>

<blockquote class="dj-quote">« Nos invités ont pris 312 photos. On en a encadré quatre — aucune ne venait du photographe. »
  <cite>Camille &amp; Tom · juin 2026</cite>
</blockquote>

<h3>2. Cache les photos jusqu'au lendemain</h3>
<p>Si les images apparaissent en direct, la soirée se transforme en fil d'actualité : on regarde son écran au lieu de regarder les gens. En différant la révélation au lendemain matin, tu obtiens deux moments distincts — la fête, puis le plaisir de la découverte, tous ensemble.</p>

<h3>3. Zéro friction, ou personne ne joue</h3>
<p>Une application à installer élimine la moitié de tes invités, et les trois quarts de ceux qui ont plus de soixante ans. Un QR code sur les menus, une page qui s'ouvre dans le navigateur, un prénom à saisir : c'est le seul niveau d'effort acceptable un soir de mariage.</p>
`,
  },
  {
    slug: 'ou-poser-le-qr-code',
    cat: 'Organisation',
    title: 'Où poser le QR code : 7 emplacements qui fonctionnent',
    excerpt: 'Menus, marque-places, miroir des toilettes. Ce qui fait vraiment scanner tes invités.',
    author: 'Léa Ferrand',
    date: '2026-06-11',
    read: '4 min',
    caption: 'Un QR code sur un menu de mariage',
    image: '/journal/qr-code-mariage-emplacements.webp',
    body: `
<p>Un QR code que personne ne remarque, c'est une animation qui n'existe pas. La bonne nouvelle : tes invités ont leur téléphone à la main toute la soirée. Il suffit de placer le code là où leur regard se pose déjà. Voici les 7 emplacements qui marchent le mieux.</p>

<h3>Sur la table, là où on s'ennuie un peu</h3>
<p>Les moments creux — l'attente entre deux plats, le début du repas — sont parfaits pour scanner. Trois emplacements imbattables :</p>
<p><strong>1. Le menu.</strong> Chacun le lit au moins une fois. Un QR code en bas, avec une phrase simple : « Scanne-moi, prends 10 photos de la soirée ».<br>
<strong>2. Le marque-place.</strong> Le tout premier objet que ton invité prend en main en s'asseyant.<br>
<strong>3. Un chevalet au centre de table.</strong> Visible par les 8 convives d'un coup.</p>

<h3>Dans les lieux de passage</h3>
<p><strong>4. À l'entrée / au vestiaire</strong>, sur un panneau : les gens patientent, c'est le moment.<br>
<strong>5. Au bar.</strong> On y attend son verre, téléphone déjà en main.<br>
<strong>6. Le miroir des toilettes.</strong> Oui, vraiment : un sticker avec le QR code au-dessus du lavabo est l'un des plus scannés de la soirée.</p>

<h3>Et pour la piste de danse</h3>
<p><strong>7. Un panneau lumineux près du DJ.</strong> C'est là que tombent les meilleures photos, tard dans la nuit. Un rappel visuel à cet endroit relance les prises de vue au bon moment.</p>

<blockquote class="dj-quote">« On avait mis le même QR code à cinq endroits. Résultat : 90 % des invités ont participé, même les grands-parents. »
  <cite>Léa &amp; Marius · mai 2026</cite>
</blockquote>

<p>Un dernier point : si ton lieu capte mal, place le code là où le réseau passe (voir <a href="/journal/pas-de-reseau-salle-mariage">pas de réseau dans la salle</a>). Le secret, ce n'est pas UN emplacement parfait, mais la <strong>répétition</strong> : plus le code est présent, plus il devient un réflexe. Avec Time to Flash, tu génères ce QR code en 2 minutes et tu l'imprimes autant de fois que tu veux.</p>
`,
  },
  {
    slug: '300-photos-lendemain',
    cat: 'Souvenirs',
    title: 'Que faire des 300 photos du lendemain ?',
    excerpt: 'Trier en une heure, imprimer l’essentiel, et archiver le reste sans y passer l’été.',
    author: 'Tom Bréval',
    date: '2026-06-04',
    read: '5 min',
    caption: 'Tri des photos le lendemain du mariage',
    image: '/journal/trier-photos-mariage-lendemain.webp',
    body: `
<p>Le lendemain, tu te réveilles avec des centaines de photos prises par tes invités. C'est génial — et un peu vertigineux. Voici une méthode simple pour en tirer le meilleur sans y perdre ton été.</p>

<h3>Étape 1 — Un premier tri « coup de cœur » (30 min)</h3>
<p>Ne cherche pas à tout regarder en détail. Parcours l'album une fois, vite, et marque uniquement les photos qui te font quelque chose. Ne réfléchis pas : si tu hésites, c'est non. Tu devrais retenir 30 à 50 images sur 300. C'est normal, et c'est parfait.</p>

<h3>Étape 2 — Choisis 4 à 6 photos à imprimer</h3>
<p>Parmi tes coups de cœur, sélectionne une petite poignée d'images vraiment fortes. Un tirage grand format, un mini-album (voir <a href="/journal/livre-photo-mariage-invites">faire un livre photo avec les photos des invités</a>), ou six cartes à envoyer aux proches : l'objet physique, c'est ce qui reste vraiment. Le reste vit très bien en numérique.</p>

<blockquote class="dj-quote">« On a encadré quatre photos. Trois avaient été prises par des invités, pas par le photographe. »
  <cite>Tom &amp; Inès · juin 2026</cite>
</blockquote>

<h3>Étape 3 — Archive tout, une bonne fois</h3>
<p>Télécharge l'album complet en un fichier et range-le à deux endroits (ton téléphone + un cloud, ou un disque). Tu n'y reviendras peut-être jamais — mais le jour où tu voudras cette photo précise de ton oncle sur la piste, elle sera là.</p>

<h3>Le piège à éviter</h3>
<p>Attendre « d'avoir le temps » de tout trier. Ce temps n'arrive jamais, et les photos se dispersent dans dix messageries différentes. L'intérêt d'un album partagé comme <a href="/">Time to Flash</a>, c'est justement que tout est déjà réuni au même endroit, prêt à trier et à télécharger. Une heure suffit.</p>
`,
  },
  {
    slug: 'dix-cliches',
    cat: 'Photo',
    title: 'Pourquoi 10 clichés valent mieux que 300',
    excerpt: 'La contrainte argentique appliquée au téléphone : moins de photos, beaucoup plus de bonnes.',
    author: 'Camille Rouzaud',
    date: '2026-05-28',
    read: '3 min',
    caption: 'Un appareil photo jetable argentique',
    image: '/journal/meilleures-photos-mariage-qualite.webp',
    body: `
<p>À l'époque de l'argentique, une pellicule, c'était 24 ou 36 poses. Pas une de plus. Résultat : on réfléchissait avant d'appuyer. Cette contrainte, qui semble être une limite, est en réalité le secret des belles photos.</p>

<h3>La quantité tue l'attention</h3>
<p>Quand on peut prendre 300 photos, on n'en réussit aucune vraiment : on mitraille, on ne regarde plus la scène, on se dit qu'on triera « plus tard ». Personne ne trie jamais. On se retrouve avec 300 images floues et zéro souvenir choisi.</p>

<h3>La rareté crée l'intention</h3>
<p>Donne 10 clichés à quelqu'un, et tout change. Il attend le bon moment. Il cadre. Il observe la table, le rire, la lumière — puis il déclenche. Chaque photo devient une décision, pas un réflexe. Et ce sont ces photos-là qu'on encadre.</p>

<blockquote class="dj-quote">« Avec seulement 10 photos chacun, nos invités ont pris le truc au sérieux. On n'a jamais eu d'aussi belles images. »
  <cite>Camille &amp; Tom · mai 2026</cite>
</blockquote>

<h3>Le bon chiffre</h3>
<p>D'expérience, entre 5 et 15 clichés par invité est l'idéal : assez pour couvrir la journée, assez peu pour que chaque déclenchement compte. C'est exactement ce que permet <a href="/">Time to Flash</a> : tu fixes le nombre de photos par personne, et la contrainte fait le reste.</p>
`,
  },
  {
    slug: 'brief-invites',
    cat: 'Organisation',
    title: 'Le brief invités que tu peux copier-coller',
    excerpt: 'Un paragraphe pour le faire-part, deux lignes pour le discours du témoin.',
    author: 'Léa Ferrand',
    date: '2026-05-21',
    read: '3 min',
    caption: 'Un faire-part de mariage',
    image: '/journal/brief-invites-photos-mariage.webp',
    body: `
<p>Pour que tes invités jouent le jeu, il faut le leur dire — clairement, et deux ou trois fois. Voici des textes prêts à l'emploi, à adapter à ta sauce.</p>

<h3>Sur le faire-part / le site de mariage</h3>
<p><em>« Cette année, pas d'appareil jetable en carton : on t'offre le nôtre, version numérique. Le jour J, scanne le QR code sur ta table, prends tes 10 photos de la soirée, et découvre l'album complet le lendemain. Aucune appli à installer. »</em></p>

<h3>Dans le discours du témoin (deux lignes)</h3>
<p><em>« Un dernier truc : sur chaque table, il y a un QR code. Scannez-le, vous avez 10 photos chacun. On veut voir la soirée par vos yeux — surtout les moments qu'on va rater ! »</em></p>

<h3>Sur le panneau à l'entrée</h3>
<p><em>« 📸 Deviens notre photographe d'un soir. Scanne, prends 10 photos, elles se révèlent demain. »</em></p>

<blockquote class="dj-quote">« On a mis le petit paragraphe sur le site de mariage, et le témoin l'a répété au micro. Tout le monde a participé. »
  <cite>Léa &amp; Marius · mai 2026</cite>
</blockquote>

<h3>La règle d'or</h3>
<p>Dis-le <strong>avant</strong> (faire-part), <strong>pendant</strong> (panneaux + discours) et laisse le QR code visible partout. La participation ne dépend pas de la technologie — elle dépend du nombre de fois où tu y penses pour tes invités. Et si tu n'as pas encore choisi ta solution, commence par <a href="/journal/application-photo-mariage">le guide pour bien choisir une application photo de mariage</a>.</p>
`,
  },
  {
    slug: '120-mariages',
    cat: 'Coulisses',
    title: 'Ce qu’on a appris sur 120 mariages',
    excerpt: 'Le pic de photos tombe à 23h40. Et d’autres chiffres qui changent la façon de préparer.',
    author: 'Tom Bréval',
    date: '2026-05-14',
    read: '7 min',
    caption: 'Statistiques de photos sur une soirée de mariage',
    image: '/journal/enseignements-120-mariages.webp',
    body: `
<p>En observant des dizaines de mariages, on a vu se répéter les mêmes courbes, les mêmes pics, les mêmes surprises. Voici ce que les chiffres nous ont appris — et comment t'en servir pour ta propre soirée.</p>

<h3>Le pic de photos tombe à 23h40</h3>
<p>Ce n'est ni le « oui », ni le dîner : c'est le cœur de la piste de danse, une fois la timidité tombée. Concrètement : garde de la « réserve » de photos pour la fin de soirée, et place un rappel du QR code près du DJ (nos conseils pour ces photos-là sont dans <a href="/journal/photos-soiree-dansante-telephone">réussir ses photos de soirée dansante</a>). C'est là que tombent les images les plus vivantes.</p>

<h3>Les grands-parents participent — si on retire l'appli</h3>
<p>Dès qu'il faut installer quelque chose, la participation des plus de 60 ans s'effondre. Sans appli, avec un simple QR code qui ouvre une page web, ils jouent autant que les autres. Et ce sont souvent leurs photos, maladroites et tendres, qu'on préfère.</p>

<blockquote class="dj-quote">« La plus belle photo de notre mariage a été prise par mon grand-père de 81 ans. Il n'avait jamais scanné un QR code de sa vie. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>La révélation différée double l'émotion</h3>
<p>Quand les photos apparaissent le lendemain plutôt qu'en direct, deux choses se produisent : les invités profitent vraiment de la fête (pas de leur écran), et la découverte de l'album devient un second moment fort, partagé à froid. C'est le principe de la pellicule qu'on développe.</p>

<h3>Moins de photos, plus de souvenirs</h3>
<p>Les mariages où chaque invité avait un nombre de clichés <em>limité</em> ont produit, en proportion, beaucoup plus de photos « gardées ». La contrainte pousse à choisir — et ce sont les choix qui font les souvenirs.</p>

<h3>Ce que ça change pour toi</h3>
<p>Trois décisions simples ressortent de tout ça : <strong>limite le nombre de photos</strong> par invité, <strong>retire toute appli à installer</strong>, et <strong>diffère la révélation</strong> au lendemain. C'est exactement la philosophie de <a href="/">Time to Flash</a> — parce que ces trois réglages font, à eux seuls, la différence entre 300 photos oubliées et 40 souvenirs qu'on encadre.</p>
`,
  },
  {
    slug: 'application-photo-mariage',
    cat: 'Organisation',
    title: 'Application photo mariage : le guide pour bien choisir',
    excerpt: 'Quatre familles de solutions, sept critères qui comptent, et les trois erreurs qui font qu’une appli ne sert finalement à rien.',
    author: 'Léa Ferrand',
    date: '2026-07-30',
    read: '8 min',
    caption: 'Des invités photographient un mariage avec leur téléphone',
    image: '/journal/application-photo-mariage-guide.webp',
    body: `
<p>Tu cherches un moyen de récupérer les photos prises par tes invités. En tapant « application photo mariage », tu tombes sur une dizaine de services qui promettent tous exactement la même chose. Voici comment les départager — et surtout comment éviter les trois erreurs qui font qu’une appli finit par ne servir à rien le jour J.</p>

<h3>À quoi ça sert, concrètement</h3>
<p>Ton photographe couvre la journée, mais il ne peut pas être partout : pendant qu’il cadre ton entrée, ton cousin fait rire toute la table du fond. Une application photo de mariage sert à récupérer <em>l’autre</em> reportage, celui de tes 80 invités qui vivent la fête de l’intérieur (on développe ça dans <a href="/journal/invites-photographe">tes invités voient ce que le photographe ne voit pas</a>). Sans elle, ces images restent dans les téléphones et se perdent en trois semaines.</p>

<h3>Les quatre familles de solutions</h3>
<p><strong>1. Le groupe de messagerie.</strong> Gratuit et déjà installé. Mais les photos arrivent compressées, le fil devient illisible en 48 heures, et personne ne retrouve rien six mois plus tard.<br>
<strong>2. L’album cloud partagé</strong> (Google Photos, iCloud, Drive). Gratuit et de bonne qualité. Mais il faut un compte, et un album iCloud exclut d’office tes invités sous Android.<br>
<strong>3. L’application à installer.</strong> Plus complète, souvent plus jolie. Mais chaque installation élimine une partie de tes invités — massivement chez les plus de 60 ans.<br>
<strong>4. L’appareil photo jetable numérique.</strong> Un QR code, une page web qui s’ouvre, aucune installation. C’est le modèle qui obtient de loin le plus de participation.</p>
<p>Le comparatif détaillé des trois premières options est ici : <a href="/journal/whatsapp-google-photos-mariage">WhatsApp, Google Photos ou appli dédiée ?</a></p>

<h3>Les 7 critères qui comptent vraiment</h3>
<p><strong>1. Zéro installation.</strong> C’est le critère numéro un, très loin devant tous les autres. Une appli à télécharger, c’est un magasin d’applications à ouvrir, un mot de passe à retrouver, 200 Mo à charger sur le wifi saturé de la salle. La moitié de tes invités abandonne à cette étape.<br>
<strong>2. Pas de compte à créer.</strong> Même logique : un prénom à saisir, et c’est tout.<br>
<strong>3. La qualité d’origine.</strong> Vérifie que tu récupères les fichiers en pleine résolution, pas des versions compressées. C’est ce qui fait la différence le jour où tu voudras imprimer.<br>
<strong>4. Un album unique et centralisé.</strong> Toutes les photos au même endroit, téléchargeables d’un bloc.<br>
<strong>5. Le nombre de photos par invité.</strong> Pouvoir le limiter change tout : la contrainte pousse à choisir (voir <a href="/journal/dix-cliches">pourquoi 10 clichés valent mieux que 300</a>).<br>
<strong>6. Le moment de la révélation.</strong> Photos visibles en direct, ou cachées jusqu’au lendemain ? Ce réglage change la façon dont tes invités vivent la soirée (voir <a href="/journal/revelation-photos-lendemain-mariage">la révélation au lendemain</a>).<br>
<strong>7. Le prix, et sa forme.</strong> Paiement unique ou abonnement ? Pour un événement qui n’arrive qu’une fois, l’abonnement n’a aucun sens.</p>

<blockquote class="dj-quote">« On a testé trois solutions avant. Celle qui a marché est celle où il n’y avait rien à installer. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>Les trois erreurs classiques</h3>
<p><strong>Choisir une solution que tes invités ne savent pas utiliser.</strong> Le critère n’est pas « est-ce que ça me plaît », mais « est-ce que ma tante de 72 ans y arrivera seule, un verre à la main, à 23 h ».</p>
<p><strong>Ne pas prévenir avant le jour J.</strong> Une solution excellente dont personne n’a entendu parler ne produit rien. Il faut l’annoncer sur le faire-part, la rappeler au micro, et laisser le QR code visible partout (on t’a préparé <a href="/journal/brief-invites">le brief invités à copier-coller</a>).</p>
<p><strong>Tout miser sur un seul emplacement.</strong> Un QR code sur une seule table, c’est une animation invisible. Il en faut cinq ou six (voir <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a>).</p>

<h3>Combien ça coûte</h3>
<p>Compte de 0 à 40 € pour un mariage classique, en paiement unique. C’est sans commune mesure avec les 400 à 900 € d’une borne photo (le détail est dans <a href="/journal/prix-photobooth-mariage">combien coûte un photobooth de mariage</a>). Attention aux offres « gratuites » : on t’explique ce qui l’est vraiment dans <a href="/journal/application-photo-mariage-gratuite">appli photo mariage gratuite</a>.</p>

<h3>Notre recommandation</h3>
<p>Choisis une solution sans installation, limite le nombre de clichés par invité, et diffère la révélation au lendemain matin. Ces trois réglages, à eux seuls, font la différence entre 300 photos oubliées et 40 souvenirs qu’on encadre.</p>
<p>C’est exactement le parti pris de <a href="/">Time to Flash</a> : un QR code, aucune application, quelques clichés par personne, un rendu argentique, et un album qui se dévoile le lendemain. Gratuit jusqu’à 5 invités si tu veux l’essayer avant de t’engager.</p>
`,
  },
  {
    slug: 'prix-photobooth-mariage',
    cat: 'Organisation',
    title: 'Combien coûte un photobooth de mariage en 2026 ?',
    excerpt: 'Prix de location, coûts cachés, et le vrai calcul : combien te revient chaque photo que tu gardes.',
    author: 'Léa Ferrand',
    date: '2026-07-23',
    read: '6 min',
    caption: 'Une borne photo installée dans une salle de mariage',
    image: '/journal/prix-photobooth-mariage.webp',
    body: `
<p>Le photobooth est sur toutes les listes de prestataires. Avant de signer, il faut savoir ce que tu paies vraiment — parce que le prix affiché sur le devis n’est presque jamais le prix final.</p>

<h3>Les ordres de grandeur</h3>
<p><strong>Borne photo classique, en libre-service :</strong> 350 à 700 € pour la soirée.<br>
<strong>Borne avec impression illimitée :</strong> 500 à 900 €.<br>
<strong>Miroir photo (le grand miroir tactile) :</strong> 600 à 1 000 €.<br>
<strong>Photobooth avec technicien sur place :</strong> 800 à 1 300 €.<br>
<strong>Location de matériel à monter soi-même :</strong> 150 à 300 €.</p>
<p>Ces fourchettes bougent beaucoup selon la région, la saison et le jour de la semaine — un samedi de juin en Île-de-France n’a rien à voir avec un vendredi d’octobre en province. Demande systématiquement deux ou trois devis.</p>

<h3>Les coûts qu’on oublie</h3>
<p><strong>Le déplacement.</strong> Souvent facturé au-delà de 30 ou 50 km. Compte 50 à 150 € si ton lieu est isolé.<br>
<strong>Les heures supplémentaires.</strong> Beaucoup de forfaits s’arrêtent à 2 h du matin. Chaque heure en plus se paie.<br>
<strong>Les accessoires et le fond.</strong> Parfois inclus, souvent en option à 50–100 €.<br>
<strong>Les consommables.</strong> Si l’impression n’est pas illimitée, les recharges de papier grimpent vite.<br>
<strong>La caution.</strong> Fréquemment 300 à 1 000 € bloqués, à récupérer après.</p>

<h3>Le vrai calcul : le coût par photo gardée</h3>
<p>C’est le chiffre qui compte. Une borne produit typiquement 40 à 80 planches sur une soirée. À 600 €, tu es donc autour de 8 à 15 € la planche. Sur ces planches, combien en garderas-tu vraiment ? Trois ? Cinq ?</p>
<p>Pour situer cette dépense dans l’ensemble, va voir <a href="/journal/budget-photo-mariage">combien consacrer à la photo de ton mariage</a>. Le problème n’est pas la qualité — les bornes font de bonnes photos. C’est le <strong>goulot d’étranglement</strong> : une seule borne pour 100 invités, ça fait la queue, et surtout ça concentre toutes les photos à un seul endroit. Tout ce qui se passe à table, au bar, dehors ou sur la piste n’est jamais capté.</p>

<blockquote class="dj-quote">« On a annulé le photobooth. Nos invités ont pris deux fois plus de photos, et bien plus variées. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>À quel moment ça vaut le coup</h3>
<p>Le photobooth garde un vrai avantage : <strong>l’impression immédiate</strong>. Si tu veux que tes invités repartent avec une bande de photos en main, ou que tu tiennes à un livre d’or avec les tirages collés, c’est imbattable.</p>
<p>Si en revanche ce que tu cherches, c’est récupérer un maximum de bons souvenirs de toute la soirée, il y a mieux pour beaucoup moins cher.</p>

<h3>L’alternative à 15 €</h3>
<p>Transformer chaque invité en photographe revient entre 0 et 30 € pour un mariage entier — soit 20 à 40 fois moins qu’une borne — et couvre toute la salle au lieu d’un seul coin. On compare les quatre formules possibles dans <a href="/journal/comparatif-animations-photo-mariage">photobooth, borne selfie, miroir ou jetable : lequel choisir ?</a>, et on détaille le principe dans <a href="/journal/alternative-photobooth-mariage">l’alternative que tes invités préfèrent</a>.</p>
<p>Avec <a href="/">Time to Flash</a>, tu paies une fois, selon ton nombre d’invités, et c’est tout. Pas de caution, pas de déplacement, pas d’heure supplémentaire.</p>
`,
  },
  {
    slug: 'application-photo-mariage-gratuite',
    cat: 'Organisation',
    title: 'Appli photo mariage gratuite : ce qui l’est vraiment',
    excerpt: 'Les trois modèles économiques derrière le mot « gratuit », et les cinq questions à poser avant de confier tes souvenirs.',
    author: 'Léa Ferrand',
    date: '2026-07-16',
    read: '5 min',
    caption: 'Un téléphone affichant un album photo de mariage',
    image: '/journal/application-photo-mariage-gratuite.webp',
    body: `
<p>« Gratuit » est le mot le plus recherché quand on cherche une solution photo pour son mariage. C’est légitime : le budget est déjà tendu. Mais derrière ce mot se cachent trois modèles très différents, et un seul d’entre eux est vraiment sans contrepartie.</p>

<h3>Les trois modèles derrière le mot « gratuit »</h3>
<p><strong>1. Le gratuit limité (freemium).</strong> Tu crées l’événement sans payer, tout se passe bien… puis tu découvres au moment de télécharger que l’album est bloqué au bout de 30 photos, ou que le téléchargement complet est payant. C’est le modèle le plus fréquent, et le plus désagréable : tu découvres la facture le lendemain du mariage, quand tu n’as plus le choix.</p>
<p><strong>2. Le gratuit financé autrement.</strong> Pas de paiement, mais tes photos servent à quelque chose : publicité, analyse, ou stockage sur des serveurs dont tu ne sais pas grand-chose. Les conditions d’utilisation méritent une lecture.</p>
<p><strong>3. Le gratuit honnête, mais borné.</strong> Une offre réellement complète, sans piège, mais limitée à un petit nombre d’invités. C’est un vrai essai, conçu pour que tu testes avant de payer.</p>

<h3>Les 5 questions à poser avant de te lancer</h3>
<p><strong>1. Le téléchargement de l’album complet est-il inclus ?</strong> C’est le piège numéro un. Si la réponse n’est pas claire, passe ton chemin.<br>
<strong>2. Les photos sont-elles en qualité d’origine ?</strong> Beaucoup de services gratuits compressent. Tu t’en fiches sur un écran, tu le regretteras à l’impression.<br>
<strong>3. Combien de temps les photos sont-elles conservées ?</strong> Certains albums expirent au bout de 30 jours.<br>
<strong>4. Y a-t-il une limite au nombre d’invités ou de photos ?</strong> Et que se passe-t-il quand elle est atteinte, en pleine soirée ?<br>
<strong>5. Où sont hébergées les photos ?</strong> Pour un mariage, avec des enfants et des proches dessus, ce n’est pas un détail (voir <a href="/journal/droit-image-photos-mariage">droit à l’image : ce que dit la loi</a>).</p>

<h3>Le test à faire, une semaine avant</h3>
<p>Crée ton événement, scanne le QR code avec ton propre téléphone, prends trois photos, et <strong>va jusqu’au bout du téléchargement</strong>. Si tu peux récupérer tes trois photos en pleine qualité sans qu’on te demande ta carte, l’offre est honnête. Sinon, tu viens d’éviter une très mauvaise surprise.</p>

<h3>Ce qu’on fait de notre côté</h3>
<p>Chez <a href="/">Time to Flash</a>, c’est gratuit jusqu’à 5 invités, sans carte bancaire : de quoi tester le déroulé complet, du QR code au téléchargement. Au-delà, c’est un paiement unique selon le nombre d’invités — pas d’abonnement, pas de frais au moment de récupérer tes photos, et les fichiers en qualité d’origine. Les serveurs sont en Europe.</p>
<p>La bonne nouvelle : même l’offre payante reste très en dessous du <a href="/journal/prix-photobooth-mariage">prix d’un photobooth</a>. Le vrai sujet n’est donc pas le prix, c’est de ne pas te retrouver bloqué le lendemain.</p>
`,
  },
  {
    slug: 'whatsapp-google-photos-mariage',
    cat: 'Souvenirs',
    title: 'WhatsApp, Google Photos ou appli dédiée : où centraliser les photos ?',
    excerpt: 'Le comparatif honnête des trois solutions, avec leurs vrais défauts — y compris celle qu’on vend.',
    author: 'Tom Bréval',
    date: '2026-07-09',
    read: '6 min',
    caption: 'Plusieurs téléphones affichant des photos de mariage',
    image: '/journal/partage-photos-mariage-whatsapp-google.webp',
    body: `
<p>Avant de payer pour quoi que ce soit, la question mérite d’être posée franchement : est-ce qu’un simple groupe WhatsApp ne suffirait pas ? Voici les trois options, avec leurs vrais défauts.</p>

<h3>Le groupe WhatsApp</h3>
<p><strong>Ce qui marche :</strong> gratuit, déjà installé, tout le monde sait s’en servir. Zéro friction, c’est son immense avantage.</p>
<p><strong>Ce qui coince :</strong> les photos sont compressées à l’envoi — tu perds une grande partie de la définition, et ça se voit dès que tu veux imprimer. Le fil mélange photos, messages, vocaux et blagues, ce qui le rend illisible en deux jours. Il faut avoir le numéro de chacun. Et surtout : les photos disparaissent de ton téléphone au bout de quelques mois si tu ne les sauvegardes pas une par une.</p>
<p><strong>Verdict :</strong> parfait pour partager trois photos entre amis. Inadapté pour archiver un mariage.</p>

<h3>L’album partagé (Google Photos, iCloud, Drive)</h3>
<p><strong>Ce qui marche :</strong> gratuit, la qualité est préservée, tout est rangé au même endroit et reste accessible des années.</p>
<p><strong>Ce qui coince :</strong> il faut un compte. Un album iCloud exclut tes invités sous Android, un album Google exclut une partie des utilisateurs d’iPhone. Il faut envoyer un lien par mail ou SMS à chacun, et surtout : <strong>il faut y penser</strong>. Un album partagé est passif — personne n’y dépose spontanément ses photos un soir de fête. Dans les faits, tu récupères les photos de six invités sur quatre-vingts.</p>
<p><strong>Verdict :</strong> excellent pour <em>archiver</em> une fois que tu as les photos. Mauvais pour les <em>collecter</em>.</p>

<h3>L’appareil jetable numérique</h3>
<p><strong>Ce qui marche :</strong> un QR code posé sur les tables, une page qui s’ouvre dans le navigateur, un prénom à taper. Rien à installer, aucun compte. Tout le monde participe, y compris les grands-parents. Les photos arrivent en qualité d’origine dans un seul album, et le jeu (nombre de clichés limité, révélation le lendemain) fait qu’on y pense pendant la fête.</p>
<p><strong>Ce qui coince :</strong> c’est payant au-delà d’une poignée d’invités. Et ça dépend d’un service extérieur : tu dois vérifier ce qui est inclus, notamment le téléchargement complet (voir <a href="/journal/application-photo-mariage-gratuite">appli photo mariage gratuite</a>).</p>
<p><strong>Verdict :</strong> c’est le seul des trois qui règle le problème de la <em>collecte</em>, qui est le vrai problème.</p>

<blockquote class="dj-quote">« Personne n’a eu à m’envoyer quoi que ce soit. Le lendemain, les 300 photos étaient déjà réunies. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>La combinaison qu’on recommande</h3>
<p>Elle est simple : <strong>collecte</strong> avec un appareil jetable numérique le jour J (la méthode est détaillée dans <a href="/journal/partager-photos-mariage-invites">comment partager les photos avec tous les invités</a>), <strong>archive</strong> ensuite dans ton cloud personnel. Tu télécharges l’album complet une fois, tu le ranges à deux endroits, et tu es tranquille pour vingt ans. La méthode de tri est ici : <a href="/journal/300-photos-lendemain">que faire des 300 photos du lendemain</a>.</p>
<p>C’est ce que <a href="/">Time to Flash</a> fait de la partie la plus difficile — faire en sorte que 80 personnes déposent réellement leurs photos au même endroit.</p>
`,
  },
  {
    slug: 'comparatif-animations-photo-mariage',
    cat: 'Organisation',
    title: 'Photobooth, borne selfie, miroir ou jetable : lequel choisir ?',
    excerpt: 'Les quatre animations photo du mariage, comparées sur le prix, la place, la participation et ce que tu récupères vraiment.',
    author: 'Léa Ferrand',
    date: '2026-07-03',
    read: '6 min',
    caption: 'Animation photo lors d’une soirée de mariage',
    image: '/journal/comparatif-animations-photo-mariage.webp',
    body: `
<p>Toutes ces animations promettent la même chose — des photos amusantes de tes invités — mais elles ne produisent pas du tout le même résultat. Voici comment les départager.</p>

<h3>1. La borne photo (photobooth)</h3>
<p><strong>Prix :</strong> 350 à 900 € la soirée.<br>
<strong>Place :</strong> une table, une prise, un fond, environ 4 m².<br>
<strong>Ce que tu récupères :</strong> 40 à 80 planches, souvent imprimées sur place.<br>
<strong>Le point fort :</strong> l’impression immédiate, et le rituel du livre d’or où l’on colle les bandes.<br>
<strong>Le point faible :</strong> une seule borne pour tout le monde, donc la file d’attente — et rien de ce qui se passe ailleurs dans la salle.</p>

<h3>2. Le miroir photo</h3>
<p><strong>Prix :</strong> 600 à 1 000 €.<br>
<strong>Place :</strong> plus encombrant qu’une borne, et il lui faut un vrai dégagement.<br>
<strong>Le point fort :</strong> l’effet « waouh ». C’est spectaculaire, et les enfants adorent.<br>
<strong>Le point faible :</strong> le plus cher de la liste, pour un résultat photo assez proche de la borne classique.</p>

<h3>3. Les appareils jetables en carton</h3>
<p><strong>Prix :</strong> 10 à 15 € pièce, plus le développement — soit 200 à 400 € pour une quinzaine de tables.<br>
<strong>Le point fort :</strong> le charme argentique, et la contrainte des 27 poses qui pousse à bien viser.<br>
<strong>Le point faible :</strong> tu ne récupères jamais tous les appareils, il faut aller au labo, attendre une semaine, et une partie des pellicules est inexploitable. Le détail est ici : <a href="/journal/appareil-photo-jetable-mariage">le carton ou l’appli ?</a></p>

<h3>4. L’appareil jetable numérique</h3>
<p><strong>Prix :</strong> 0 à 30 € pour tout le mariage.<br>
<strong>Place :</strong> aucune. C’est un QR code imprimé sur tes menus.<br>
<strong>Ce que tu récupères :</strong> plusieurs centaines de photos, prises partout, dans un seul album.<br>
<strong>Le point fort :</strong> la couverture. Chaque invité devient un point de vue, dans toute la salle et toute la soirée.<br>
<strong>Le point faible :</strong> pas d’impression sur place — il faut aimer l’idée de la découverte différée plutôt que celle de repartir avec sa bande de photos.</p>

<blockquote class="dj-quote">« On avait mis le même QR code à cinq endroits. Résultat : 90 % des invités ont participé, même les grands-parents. »
  <cite>Léa &amp; Marius · mai 2026</cite>
</blockquote>

<h3>Comment choisir en une question</h3>
<p>Demande-toi ce que tu veux vraiment : <strong>un objet à emporter le soir même</strong>, ou <strong>le maximum de souvenirs de toute la journée</strong> ?</p>
<p>Si c’est le premier, prends une borne — c’est ce qu’elle fait le mieux, et le prix se justifie. Si c’est le second, une borne est un mauvais investissement : elle coûte cher et ne voit qu’un mètre carré de ta soirée.</p>

<h3>Et si tu veux les deux ?</h3>
<p>C’est possible, et c’est même la combinaison la plus maligne : une borne d’occasion ou en formule minimale pour l’impression, et un appareil jetable numérique pour la couverture générale. Tu restes bien en dessous du prix d’une borne haut de gamme seule.</p>
<p><a href="/">Time to Flash</a> couvre la deuxième partie : un QR code, aucune application, des clichés limités par invité, et un album qui se dévoile le lendemain.</p>
`,
  },
  {
    slug: 'droit-image-photos-mariage',
    cat: 'Coulisses',
    title: 'Droit à l’image : ce que dit la loi pour les photos de mariage',
    excerpt: 'Cercle privé, réseaux sociaux, enfants, contrat du photographe : les règles simples pour ne pas te tromper.',
    author: 'Tom Bréval',
    date: '2026-06-28',
    read: '7 min',
    caption: 'Photos de mariage étalées sur une table',
    image: '/journal/droit-image-photos-mariage.webp',
    body: `
<p>On y pense rarement en préparant un mariage, et pourtant : dès qu’il y a des photos de dizaines de personnes, il y a des règles. Elles sont simples, et les respecter évite la seule situation vraiment désagréable — un invité qui découvre sa photo quelque part et le prend mal.</p>

<p><em>Cet article est une explication générale, pas un conseil juridique. Pour un cas particulier, demande à un professionnel.</em></p>

<h3>Le principe de base</h3>
<p>En France, chacun dispose d’un droit sur son image : on ne peut pas diffuser la photo d’une personne reconnaissable sans son accord. Ce principe découle du droit au respect de la vie privée (article 9 du Code civil). Le mot important est <strong>diffuser</strong> : prendre une photo et la diffuser publiquement sont deux choses différentes.</p>

<h3>Le mariage, c’est le cercle privé</h3>
<p>Un mariage est un événement privé, entre invités qui se connaissent. Partager les photos <strong>entre les personnes présentes</strong>, dans un album fermé, relève du cadre familial et privé — c’est ce que fait n’importe quel album de famille depuis toujours. Tu n’as pas à faire signer quoi que ce soit à tes 80 invités pour leur envoyer les photos de la soirée.</p>
<p>Ce cadre change dès que tu sors du cercle : publication sur un compte public, sur le site d’un prestataire, dans une publicité.</p>

<h3>Les réseaux sociaux, c’est autre chose</h3>
<p>Publier une photo de mariage sur un compte Instagram ou Facebook public, c’est de la diffusion publique. En pratique, la règle de bon sens : <strong>demande avant de publier une photo où quelqu’un est reconnaissable et au premier plan.</strong> Une photo de foule où personne n’est isolé pose beaucoup moins de problèmes qu’un portrait. C’est aussi l’un des arguments avancés par les partisans du <a href="/journal/mariage-sans-telephone-unplugged">mariage sans téléphone</a>.</p>
<p>C’est aussi pour ça qu’un mot sur le faire-part est utile : préciser que les photos serviront à un album privé partagé entre invités, et pas à autre chose (voir <a href="/journal/brief-invites">le brief invités à copier-coller</a>).</p>

<h3>Les enfants : plus strict</h3>
<p>Pour un mineur, l’accord des <strong>deux parents</strong> est nécessaire avant toute diffusion publique. À l’intérieur de l’album privé du mariage, pas de difficulté. Mais avant de poster la photo du fils de ta cousine sur ton compte, un message suffit — et évite une conversation pénible.</p>

<h3>Qui possède les photos du photographe ?</h3>
<p>C’est une confusion très fréquente. Ton photographe conserve ses <strong>droits d’auteur</strong> sur les images : tu achètes un droit d’usage, pas la propriété. Vérifie donc trois points dans ton contrat :</p>
<p><strong>1.</strong> Peux-tu publier les photos sur tes réseaux ? Avec ou sans mention du photographe ?<br>
<strong>2.</strong> Peux-tu les faire imprimer où tu veux ?<br>
<strong>3.</strong> Le photographe peut-il, lui, utiliser tes photos pour son site ou son portfolio ? Si tu ne le souhaites pas, il faut le dire <em>avant</em> de signer — c’est une clause qui se négocie très bien.</p>
<p>Les photos prises par tes invités, elles, n’ont pas ce problème : elles t’appartiennent de fait dans le cadre privé.</p>

<h3>Si quelqu’un demande le retrait</h3>
<p>Un invité peut à tout moment demander qu’une photo de lui soit retirée. La bonne réponse est simple : tu retires. C’est son droit, et discuter n’a aucun intérêt. Vérifie donc que la solution que tu utilises te permet de supprimer une photo en un clic.</p>

<h3>Les trois bons réflexes</h3>
<p><strong>1. Préviens à l’avance</strong> qu’il y aura un album photo partagé, et à quoi il servira.<br>
<strong>2. Garde l’album privé</strong> — accessible par lien, pas indexé sur Google.<br>
<strong>3. Demande avant de publier</strong> une photo hors du cercle des invités.</p>
<p>Chez <a href="/">Time to Flash</a>, l’album n’est accessible qu’avec ton lien, les photos sont hébergées en Europe, chaque invité peut supprimer ses propres clichés avant la révélation, et rien n’est utilisé à d’autres fins. Tes photos restent les tiennes.</p>
`,
  },
  {
    slug: 'shot-list-mariage',
    cat: 'Photo',
    title: 'La shot list : 50 photos de mariage à ne pas rater',
    excerpt: 'La liste complète, moment par moment — celles que ton photographe gère, et celles que seuls tes invités peuvent prendre.',
    author: 'Camille Rouzaud',
    date: '2026-06-21',
    read: '8 min',
    caption: 'Photographe et invités pendant une cérémonie de mariage',
    image: '/journal/shot-list-photos-mariage.webp',
    body: `
<p>Une shot list, c’est la liste des photos que tu ne veux pas découvrir manquantes dans six mois. Elle sert à deux choses : la donner à ton photographe, et repérer les images que lui seul ne pourra pas prendre.</p>

<h3>Les préparatifs (10)</h3>
<p>1. La robe suspendue, avant qu’on l’enfile.<br>
2. Les chaussures, les bijoux, les alliances posés ensemble.<br>
3. Le faire-part et le plan de table, à plat.<br>
4. Le coiffage et le maquillage, en cours.<br>
5. Le moment où l’on ferme la robe — les mains de la mère ou de la témoin.<br>
6. Le nœud de cravate.<br>
7. Le premier regard d’un parent.<br>
8. Le trajet vers le lieu, dans la voiture.<br>
9. Le bouquet, seul, avant qu’il ne serve.<br>
10. Un portrait calme, avant que tout commence.</p>

<h3>La cérémonie (10)</h3>
<p>11. L’arrivée, vue de dos, dans l’allée.<br>
12. Le visage de celui ou celle qui attend.<br>
13. Le premier regard entre vous.<br>
14. Les mains, pendant les vœux.<br>
15. L’échange des alliances, en gros plan.<br>
16. Le baiser — et la seconde d’après.<br>
17. La salle, vue de derrière l’autel.<br>
18. Les visages émus au premier rang.<br>
19. La sortie, sous les pétales ou les bulles.<br>
20. Une photo large du lieu, vide, avant l’arrivée de tout le monde.</p>

<h3>Les photos de groupe et de couple (8)</h3>
<p>21. Le grand groupe, tout le monde ensemble.<br>
22. Chaque famille séparément.<br>
23. Les témoins.<br>
24. Les grands-parents avec les mariés.<br>
25. Les enfants, entre eux.<br>
26. Les amis d’enfance.<br>
27. La séance de couple, à la meilleure lumière du jour.<br>
28. Une photo de vous deux, de loin, dans le paysage.</p>
<p>Ces huit-là méritent une organisation à part : la méthode est ici, <a href="/journal/photos-de-groupe-mariage">réussir les photos de groupe en 20 minutes</a>.</p>

<h3>Le vin d’honneur (8)</h3>
<p>29. Les tables dressées, avant que personne n’y touche.<br>
30. Les détails de décoration que tu as mis six mois à choisir.<br>
31. Le buffet et les cocktails.<br>
32. Les retrouvailles — deux invités qui ne s’étaient pas vus depuis dix ans.<br>
33. Les rires en petits groupes.<br>
34. Les enfants qui courent.<br>
35. Un plan large du lieu plein de monde.<br>
36. Le livre d’or en train d’être rempli.</p>

<h3>Le dîner et les discours (7)</h3>
<p>37. Votre entrée dans la salle.<br>
38. La table d’honneur.<br>
39. Le témoin pendant son discours.<br>
40. Vos réactions pendant ce discours — c’est souvent la meilleure photo de la soirée.<br>
41. La table qui rit le plus fort.<br>
42. Le gâteau ou la pièce montée, avant.<br>
43. La découpe, et la première bouchée.</p>

<h3>La soirée (7)</h3>
<p>44. La première danse, de loin puis de près.<br>
45. Les parents sur la piste.<br>
46. La piste vue d’en haut, si le lieu le permet.<br>
47. Le lancer de bouquet.<br>
48. Les grands-parents qui dansent.<br>
49. La fin de soirée, chaussures à la main.<br>
50. La toute dernière photo, quand il ne reste plus que dix personnes.</p>

<h3>Celles que ton photographe ne prendra pas</h3>
<p>Regarde la liste : les numéros 32, 33, 34, 41, 48 et 50 sont presque toujours manquantes. Pas par négligence — le photographe est simplement ailleurs, ou déjà parti. Ce sont exactement les photos que tes invités, eux, prennent naturellement.</p>

<blockquote class="dj-quote">« Nos invités ont pris 312 photos. On en a encadré quatre — aucune ne venait du photographe. »
  <cite>Camille &amp; Tom · juin 2026</cite>
</blockquote>

<h3>Comment t’en servir</h3>
<p>Envoie la liste complète à ton photographe deux semaines avant, en surlignant tes cinq priorités absolues. Pour le reste, ne compte pas sur une consigne générale du type « prenez des photos ! » : donne à tes invités une contrainte claire — quelques clichés chacun — et ils feront le travail avec attention (voir <a href="/journal/dix-cliches">pourquoi 10 clichés valent mieux que 300</a>).</p>
<p>C’est le principe de <a href="/">Time to Flash</a> : chaque invité reçoit un petit nombre de photos à prendre, et l’album complet se dévoile le lendemain.</p>
`,
  },
  {
    slug: 'photos-soiree-dansante-telephone',
    cat: 'Photo',
    title: 'Réussir ses photos de soirée dansante au téléphone',
    excerpt: 'Sept réglages et réflexes pour que les photos de fin de soirée ne soient pas toutes noires et floues.',
    author: 'Camille Rouzaud',
    date: '2026-06-14',
    read: '5 min',
    caption: 'Piste de danse photographiée de nuit lors d’un mariage',
    image: '/journal/photos-soiree-dansante-mariage.webp',
    body: `
<p>C’est le paradoxe de toutes les soirées : les meilleurs moments arrivent quand il fait le plus sombre. Résultat, la moitié des photos de fin de soirée sont noires, floues, ou les deux. Voici comment sauver l’autre moitié.</p>

<h3>1. Utilise le flash, vraiment</h3>
<p>On t’a appris que le flash « écrase » les photos. C’est vrai en plein jour. La nuit, sur une piste de danse, c’est exactement l’inverse : le flash fige le mouvement, détache les visages du noir, et donne ce rendu direct et un peu cru qu’on associe aux photos de fête. C’est précisément l’esthétique des <a href="/journal/photos-mariage-effet-argentique">photos effet pellicule</a>.</p>

<h3>2. Approche-toi</h3>
<p>Le flash d’un téléphone porte à deux ou trois mètres, pas plus. Au-delà, tu photographies du noir. La règle est simple : si tu peux parler à la personne sans crier, tu es à la bonne distance. Une photo de foule prise depuis le bord de la piste ne donnera jamais rien.</p>

<h3>3. Ne zoome jamais</h3>
<p>Le zoom numérique dégrade énormément l’image, et c’est catastrophique en basse lumière. Fais les trois pas.</p>

<h3>4. Tiens le téléphone à deux mains</h3>
<p>Dans le noir, l’appareil laisse l’obturateur ouvert plus longtemps : le moindre tremblement devient un flou. Deux mains, coudes contre le corps, et une petite expiration avant d’appuyer. Ça change tout.</p>

<h3>5. Cherche les sources de lumière</h3>
<p>Les guirlandes, les bougies, les projecteurs du DJ : place tes sujets <em>près</em> de ces lumières, ou juste devant. Une personne éclairée de côté par une guirlande, c’est une belle photo. La même personne à trois mètres de là, c’est une tache sombre.</p>

<h3>6. Vise les visages, pas la foule</h3>
<p>Une photo de piste bondée est presque toujours décevante — on n’y reconnaît personne. Deux ou trois visages qui rient, en revanche, racontent la soirée entière. Cherche les duos, les trios, les grands-parents qui dansent.</p>

<h3>7. Accepte un peu de flou</h3>
<p>Un léger flou de mouvement dans une photo de danse, ce n’est pas raté — c’est le mouvement lui-même. Les photos parfaitement nettes d’une piste de danse sont souvent les plus mortes. Ne supprime pas trop vite.</p>

<blockquote class="dj-quote">« La plus belle photo de notre mariage a été prise par mon grand-père de 81 ans. Il n’avait jamais scanné un QR code de sa vie. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>Le bon moment</h3>
<p>Le pic de la soirée tombe autour de 23 h 30, une fois la timidité tombée (on l’a mesuré, voir <a href="/journal/120-mariages">ce qu’on a appris sur 120 mariages</a>). Garde donc quelques clichés en réserve pour ce créneau, et place un rappel du QR code près du DJ — c’est là que se prennent les images les plus vivantes de la journée.</p>
<p>Avec <a href="/">Time to Flash</a>, le rendu argentique et le flash sont appliqués automatiquement : tes invités n’ont aucun réglage à faire, ils cadrent et ils appuient.</p>
`,
  },
  {
    slug: 'photos-de-groupe-mariage',
    cat: 'Photo',
    title: 'Réussir les photos de groupe en 20 minutes',
    excerpt: 'Le moment le plus redouté de la journée devient simple avec une liste, une personne dédiée et un ordre bien choisi.',
    author: 'Camille Rouzaud',
    date: '2026-06-07',
    read: '6 min',
    caption: 'Photo de groupe lors d’un mariage',
    image: '/journal/photos-de-groupe-mariage.webp',
    body: `
<p>Les photos de groupe ont mauvaise réputation, et c’est mérité : elles s’éternisent, on cherche les gens partout, le vin d’honneur se vide, et personne ne sourit vraiment sur la vingtième. Pourtant, ce sont les photos que ta famille regardera le plus longtemps. Voici comment les expédier en vingt minutes.</p>

<h3>1. Écris la liste, à l’avance</h3>
<p>C’est 90 % du travail. Une liste écrite, avec des noms — pas « la famille », mais « papa, maman, ma sœur, son mari, les deux enfants ». Vise 8 à 12 groupes maximum. Au-delà, tu y passeras une heure.</p>
<p>Une base qui marche : les mariés seuls · famille de l’un · famille de l’autre · les deux familles ensemble · les grands-parents · les témoins · les amis d’enfance · les collègues · les enfants · le grand groupe.</p>

<h3>2. Désigne quelqu’un pour rassembler</h3>
<p>L’erreur classique est de laisser le photographe appeler les gens : il ne connaît personne. Confie ce rôle à un témoin ou à un frère qui a une bonne voix et qui connaît tout le monde. Il appelle le groupe suivant <em>pendant</em> que le groupe en cours pose. Tu ne perds jamais une seconde.</p>

<h3>3. Choisis le bon ordre</h3>
<p>Commence par les grands-parents et les personnes âgées, puis les enfants, puis les grands groupes, et finis par tes amis. Les plus fragiles repartent s’asseoir tout de suite, les enfants ne sont pas encore fatigués, et tes amis, eux, attendront sans problème.</p>

<h3>4. Trouve l’endroit avant</h3>
<p>Un lieu à l’ombre, avec un fond simple (un mur, une haie, une façade), à moins de deux minutes de marche du vin d’honneur. Le plein soleil creuse les yeux et fait plisser tout le monde. Un ciel blanc en arrière-plan brûle la photo. Repère cet endroit lors de la visite du lieu, pas le jour J.</p>

<h3>5. Le bon créneau</h3>
<p>Juste après la cérémonie, quand tout le monde est encore réuni au même endroit et personne n’a encore commencé à circuler. Si tu attends le milieu du vin d’honneur, tu passeras vingt minutes à chercher trois personnes.</p>

<h3>6. La règle des 90 secondes</h3>
<p>Un groupe = 90 secondes. Le photographe prend trois ou quatre images, et on passe au suivant. C’est largement suffisant : au-delà, les sourires se figent et le groupe se disperse. Douze groupes à 90 secondes, ça fait dix-huit minutes.</p>

<blockquote class="dj-quote">« On a annoncé au micro : photos de groupe, vingt minutes, on commence par les grands-parents. Personne ne s’est plaint. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>7. Le petit supplément qui vaut le coup</h3>
<p>Juste après la photo « officielle » de chaque groupe, demande une deuxième prise complètement libre : tout le monde bouge, crie, saute, se serre. C’est presque toujours celle-là qu’on garde.</p>

<h3>Et pendant ce temps-là</h3>
<p>Tes invités qui attendent leur tour sont, eux, en train de photographier tout le reste : les fous rires en coulisses, les enfants qui s’échappent, l’organisation elle-même. Ce sont souvent les images les plus vivantes de la journée (voir <a href="/journal/invites-photographe">tes invités voient ce que le photographe ne voit pas</a>).</p>
<p>La liste complète des photos à ne pas rater est dans <a href="/journal/shot-list-mariage">la shot list des 50 photos</a>. Et avec <a href="/">Time to Flash</a>, tout ce que tes invités captent pendant ces vingt minutes atterrit dans le même album que le reste.</p>
`,
  },
  {
    slug: 'budget-photo-mariage',
    cat: 'Organisation',
    title: 'Budget photo de mariage : combien y consacrer vraiment ?',
    excerpt: 'Ce que coûtent le photographe, la vidéo et les animations — et les trois postes où l’on peut économiser sans jamais le regretter.',
    author: 'Léa Ferrand',
    date: '2026-05-31',
    read: '6 min',
    caption: 'Préparation du budget d’un mariage',
    image: '/journal/budget-photo-mariage.webp',
    body: `
<p>La photo est l’un des rares postes du mariage dont il reste quelque chose le lendemain. Les fleurs fanent, le repas se digère, la robe part au pressing — les images, elles, tu les regarderas pendant trente ans. Reste à savoir combien y mettre.</p>

<h3>La règle des 10 à 12 %</h3>
<p>La plupart des organisateurs recommandent de consacrer 10 à 12 % du budget total à l’image. Sur un mariage à 15 000 €, cela représente 1 500 à 1 800 €, vidéo comprise. C’est un repère, pas une loi : si les photos comptent beaucoup pour toi, monte à 15 % et coupe ailleurs.</p>

<h3>Les ordres de grandeur</h3>
<p><strong>Photographe, journée complète :</strong> 1 200 à 2 500 €. En dessous de 1 000 €, méfie-toi ou vérifie très sérieusement le portfolio complet d’un mariage entier (pas seulement les cinq plus belles photos du site).<br>
<strong>Photographe, demi-journée :</strong> 700 à 1 200 €.<br>
<strong>Vidéaste :</strong> 1 000 à 2 500 €, souvent autant que le photographe.<br>
<strong>Second photographe :</strong> 300 à 600 € en supplément.<br>
<strong>Borne photo :</strong> 350 à 900 € (le détail est dans <a href="/journal/prix-photobooth-mariage">combien coûte un photobooth</a>).<br>
<strong>Album imprimé :</strong> 300 à 800 € s’il passe par le photographe, 50 à 150 € si tu le fais toi-même.<br>
<strong>Photos des invités :</strong> 0 à 30 €.</p>
<p>Les tarifs varient fortement selon la région et la saison. Prends toujours deux ou trois devis.</p>

<h3>Où il ne faut pas économiser</h3>
<p><strong>Le photographe principal.</strong> C’est le seul poste vraiment irrattrapable. Un mauvais traiteur se raconte en riant ; des photos ratées ne se refont pas.</p>
<p><strong>Le nombre d’heures.</strong> L’erreur la plus fréquente est de prendre une formule qui s’arrête à 22 h, avant la vraie soirée. Or le pic d’émotion — et de photos — tombe bien plus tard (voir <a href="/journal/120-mariages">ce qu’on a appris sur 120 mariages</a>). Mieux vaut un photographe un peu moins réputé qui reste jusqu’à 1 h, qu’un excellent qui part au dessert.</p>

<h3>Où l’on peut économiser sans regret</h3>
<p><strong>1. L’album fourni par le photographe.</strong> Prends les fichiers, fais l’album toi-même : tu économises souvent 400 € pour un résultat très proche (voir <a href="/journal/livre-photo-mariage-invites">faire un livre photo avec les photos des invités</a>).</p>
<p><strong>2. La borne photo.</strong> C’est le poste au plus mauvais rapport prix/souvenirs de toute la liste. Les mêmes photos amusantes s’obtiennent pour vingt fois moins cher, et partout dans la salle plutôt qu’à un seul endroit.</p>
<p><strong>3. Le second photographe.</strong> Utile sur un très grand mariage. Sur 80 invités, tes invités eux-mêmes couvrent déjà tout ce qu’un second photographe irait chercher — à condition de leur donner un cadre.</p>

<blockquote class="dj-quote">« On a supprimé la borne et gardé le photographe une heure de plus. C’est la meilleure décision de tout le budget. »
  <cite>Léa &amp; Marius · 2026</cite>
</blockquote>

<h3>La répartition qu’on conseille</h3>
<p>Sur un budget photo de 1 800 € : <strong>1 500 €</strong> pour un photographe qui reste tard, <strong>200 €</strong> pour un album imprimé de qualité, <strong>15 €</strong> pour l’appareil jetable numérique des invités, et le reste en tirages pour offrir. Tu couvres la journée officielle, la soirée, les coulisses, et il te reste quelque chose à accrocher au mur.</p>
<p><a href="/">Time to Flash</a> est le petit poste à 15 € de cette liste : un QR code, aucune application, et l’album de tes invités qui se dévoile le lendemain.</p>
`,
  },
  {
    slug: 'pas-de-reseau-salle-mariage',
    cat: 'Coulisses',
    title: 'Pas de réseau dans la salle : comment faire ?',
    excerpt: 'Château en pierre, grange à la campagne, cave voûtée : la marche à suivre pour que ça marche quand même.',
    author: 'Tom Bréval',
    date: '2026-05-24',
    read: '5 min',
    caption: 'Une salle de mariage installée dans une grange',
    image: '/journal/reseau-wifi-salle-mariage.webp',
    body: `
<p>C’est la question numéro un qu’on nous pose : « et si mes invités n’ont pas de réseau dans la salle ? ». Elle est légitime — les plus beaux lieux de mariage sont souvent les plus mal couverts. Voici comment régler le problème avant qu’il n’en soit un.</p>

<h3>D’abord, mesure au lieu de deviner</h3>
<p>Lors de ta visite ou du repérage, fais un test très simple : sors ton téléphone, coupe le wifi, et regarde combien de barres tu as <strong>à l’intérieur</strong> de la salle, pas sur le parking. Charge une page web. Fais-le avec deux téléphones d’opérateurs différents si tu peux — la couverture varie énormément de l’un à l’autre.</p>
<p>Dans neuf cas sur dix, ça passe. Les lieux vraiment sans réseau sont plus rares qu’on ne le croit : ce sont surtout les caves voûtées, les granges à murs très épais, et quelques vallées.</p>

<h3>Demande le wifi — et le code</h3>
<p>C’est la solution la plus simple, et presque tous les lieux en ont un. Deux points à vérifier : est-ce que le wifi couvre <em>la salle</em> et pas seulement l’accueil, et est-ce qu’il supporte 80 connexions simultanées.</p>
<p>Si oui, imprime le nom du réseau et le mot de passe <strong>sur le même support que ton QR code</strong> : menus, panneaux, chevalets. Un invité qui doit chercher le code wifi auprès du serveur abandonne.</p>

<h3>Les solutions si vraiment ça ne passe pas</h3>
<p><strong>Le partage de connexion.</strong> Si une seule zone de la salle capte, désigne-la comme « coin photo » avec un panneau. Souvent, c’est près d’une fenêtre ou à l’entrée.<br>
<strong>Le répéteur wifi.</strong> Le lieu en a parfois un, et sinon un boîtier à 30 € posé au bon endroit règle beaucoup de cas.<br>
<strong>Le point d’accès mobile (box 4G).</strong> Se loue à la journée. À réserver aux lieux vraiment isolés.</p>

<h3>Le réflexe qui simplifie tout</h3>
<p>Place ton QR code à des endroits où le réseau passe, même si la salle est mal couverte : <strong>l’entrée, le vestiaire, le bar, l’extérieur</strong>. Tes invités scannent et ouvrent la page en arrivant, quand ils ont du signal, plutôt qu’au fond de la cave à minuit. Les sept meilleurs emplacements sont ici : <a href="/journal/ou-poser-le-qr-code">où poser le QR code</a>.</p>

<h3>Choisis quelque chose de léger</h3>
<p>C’est là que le choix de la solution compte vraiment. Une application à télécharger, c’est plus de 100 Mo à charger sur un réseau saturé — autant dire que ça ne se fera pas. Une simple page web qui s’ouvre dans le navigateur pèse quelques centaines de kilo-octets, et passe là où une application n’a aucune chance.</p>

<blockquote class="dj-quote">« Le château n’avait quasiment pas de réseau. On a mis le QR code à l’entrée et le code wifi sur les menus : tout le monde a participé. »
  <cite>Tom &amp; Inès · 2026</cite>
</blockquote>

<h3>La check-list, deux semaines avant</h3>
<p><strong>1.</strong> Tester le réseau dans la salle, pas dehors.<br>
<strong>2.</strong> Récupérer le nom et le mot de passe du wifi.<br>
<strong>3.</strong> Les imprimer à côté du QR code.<br>
<strong>4.</strong> Faire un essai complet sur place, avec ton propre téléphone.</p>
<p>C’est aussi pour ça que <a href="/">Time to Flash</a> n’est pas une application : c’est une page web, légère, qui s’ouvre en quelques secondes même sur un réseau poussif.</p>
`,
  },
  {
    slug: 'livre-photo-mariage-invites',
    cat: 'Souvenirs',
    title: 'Faire un livre photo avec les photos des invités',
    excerpt: 'La méthode pour transformer 300 photos de téléphone en un album qu’on ressort vraiment — sans y passer l’été.',
    author: 'Tom Bréval',
    date: '2026-05-17',
    read: '5 min',
    caption: 'Un livre photo de mariage posé sur une table',
    image: '/journal/livre-photo-mariage-invites.webp',
    body: `
<p>L’album du photographe raconte la journée officielle. Un livre fait avec les photos de tes invités raconte autre chose : la fête vue de l’intérieur. Les deux se complètent très bien, et le second coûte dix fois moins cher.</p>

<h3>Pourquoi ça marche si bien</h3>
<p>Les photos d’invités ont un désordre, une spontanéité et des points de vue que le reportage professionnel n’a pas : la table du fond, les coulisses, les regards entre amis. Mises bout à bout, elles forment un récit plus vivant. Et comme elles ont souvent le même rendu argentique, l’ensemble reste cohérent (voir <a href="/journal/photos-mariage-effet-argentique">pourquoi l’effet pellicule est si beau</a>).</p>

<h3>Étape 1 — La sélection (1 heure)</h3>
<p>Parcours l’album une seule fois, vite, et garde uniquement ce qui te fait quelque chose. Sur 300 photos, tu devrais en retenir 60 à 80. Ne repasse pas dessus trois fois : ton premier réflexe est le bon. La méthode complète est ici : <a href="/journal/300-photos-lendemain">que faire des 300 photos du lendemain</a>.</p>

<h3>Étape 2 — Le bon format</h3>
<p>Vise <strong>40 à 60 pages</strong>, pas plus. C’est la taille qu’on ressort vraiment. Un livre de 120 pages impressionne le premier jour puis reste dans le placard.</p>
<p>Deux règles simples : <strong>une seule photo par page</strong> pour les plus fortes, et pas plus de quatre pour les pages « ambiance ». Laisse du blanc. Une page chargée de neuf vignettes ne se regarde jamais.</p>

<h3>Étape 3 — L’ordre</h3>
<p>Le plus simple est le meilleur : l’ordre chronologique de la journée, des préparatifs à la fin de soirée. Tu peux ouvrir sur une page de titre avec vos prénoms et la date, et fermer sur la toute dernière photo de la nuit. Pas besoin de chapitres ni de textes longs — deux ou trois légendes manuscrites suffisent.</p>

<h3>Étape 4 — L’impression</h3>
<p>Compte 50 à 150 € pour un livre de qualité correcte, contre 300 à 800 € s’il passe par ton photographe. Trois points à vérifier avant de commander :</p>
<p><strong>1. La résolution.</strong> Les photos doivent être en qualité d’origine, pas récupérées depuis une messagerie qui les a compressées. C’est LA raison pour laquelle un album fait à partir de photos WhatsApp est souvent décevant (voir <a href="/journal/whatsapp-google-photos-mariage">le comparatif des solutions de partage</a>).<br>
<strong>2. La reliure.</strong> Une reliure à plat, qui s’ouvre complètement, change tout sur les photos en double page.<br>
<strong>3. Le papier.</strong> Un papier mat épais rend beaucoup mieux le grain argentique que le brillant.</p>

<blockquote class="dj-quote">« On a encadré quatre photos. Trois avaient été prises par des invités, pas par le photographe. »
  <cite>Tom &amp; Inès · juin 2026</cite>
</blockquote>

<h3>Les trois erreurs à éviter</h3>
<p><strong>Attendre d’avoir le temps.</strong> Fixe-toi une date, un mois après le mariage. Passé six mois, ça ne se fera jamais.<br>
<strong>Vouloir tout mettre.</strong> Un livre est une sélection, pas un archivage. Le reste vit très bien en numérique.<br>
<strong>Travailler à partir de fichiers compressés.</strong> Télécharge toujours l’album d’origine, en pleine qualité.</p>

<h3>Le cadeau le plus rentable du mariage</h3>
<p>Fais-en deux ou trois exemplaires : un pour vous, un par famille. Un livre à 80 € qui raconte la soirée par les yeux des invités fait beaucoup plus d’effet qu’un cadeau classique — et il se regarde encore dans vingt ans.</p>
<p>Avec <a href="/">Time to Flash</a>, tu télécharges l’album complet en un fichier, en qualité d’origine : il ne te reste plus qu’à choisir.</p>
`,
  },
]

// Ordre d'affichage : du plus récent au plus ancien.
export const POSTS = [...ALL_POSTS].sort((a, b) => b.date.localeCompare(a.date))

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null
}
