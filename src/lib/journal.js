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

// Articles, du plus récent au plus ancien (le 1er = "à la une").
export const POSTS = [
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

<p>Le carton a l’avantage de la nostalgie ; le numérique a l’avantage de te garantir de <em>récupérer</em> les souvenirs. Avec <a href="/">Time to Flash</a>, tu gardes le meilleur des deux : la contrainte argentique, sans la crainte de tout perdre au développement.</p>
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
<p><strong>Le budget :</strong> 400 à 700 € pour la soirée.<br>
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
<p>La clé, c’est de centraliser <em>pendant</em> la fête, pas après. Si toutes les photos tombent automatiquement dans un même album partagé, tu n’as plus rien à réclamer : tout est déjà là, en pleine qualité. C’est le principe d’un appareil photo collaboratif à QR code.</p>

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
<p>« Prenez des photos ! » ne produit rien. Dix clichés par personne, en revanche, changent tout : chaque déclenchement compte, on observe avant d'appuyer, et on obtient des cadrages choisis plutôt que trois cents rafales floues. C'est le principe de l'<a href="/">appareil photo jetable</a>, appliqué au téléphone.</p>

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

<p>Le secret, ce n'est pas UN emplacement parfait, mais la <strong>répétition</strong> : plus le code est présent, plus il devient un réflexe. Avec Time to Flash, tu génères ce QR code en 2 minutes et tu l'imprimes autant de fois que tu veux.</p>
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
<p>Parmi tes coups de cœur, sélectionne une petite poignée d'images vraiment fortes. Un tirage grand format, un mini-album, ou six cartes à envoyer aux proches : l'objet physique, c'est ce qui reste vraiment. Le reste vit très bien en numérique.</p>

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
<p>Dis-le <strong>avant</strong> (faire-part), <strong>pendant</strong> (panneaux + discours) et laisse le QR code visible partout. La participation ne dépend pas de la technologie — elle dépend du nombre de fois où tu y penses pour tes invités.</p>
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
<p>Ce n'est ni le « oui », ni le dîner : c'est le cœur de la piste de danse, une fois la timidité tombée. Concrètement : garde de la « réserve » de photos pour la fin de soirée, et place un rappel du QR code près du DJ. C'est là que tombent les images les plus vivantes.</p>

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
]

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null
}
