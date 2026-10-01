import Link from 'next/link'
import { BRAND, marque } from '../../lib/brand'
import SiteNav from '../../components/SiteNav'
import TryQR from '../../components/TryQR'
import ConsentReset from '../../components/ConsentReset'
import Pellicules from '../../components/Pellicules'
import { SelecteurLangue } from '../../components/Langue'
import { TIERS, TOP_TIER } from '../../lib/pricing'
import { prix } from '../../lib/lp'
import { FORMATS_TIRAGE } from '../../lib/tirages'
import { t } from '../../lib/i18n'
import { langueDeParams, alternates, lien } from '../../lib/langue-lien'

// Le titre lu par Google vise « application photo mariage » : la marque seule
// ne se cherche pas. Le titre visible à l'écran, lui, reste évocateur. En
// anglais et en allemand, il vise « wedding photo app » et « Hochzeit Foto App ».
export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return {
    title: {
      absolute: t({
        fr: `Application photo de mariage sans installation | ${BRAND.name}`,
        en: `Wedding photo app for guests, nothing to install | ${BRAND.name}`,
        de: `Hochzeit Foto App für Gäste, ohne Installation | ${BRAND.name}`,
      }, lang),
    },
    description: t({
      fr: "L'application photo de mariage qui récupère les clichés de tous vos participants : un QR code, aucune appli à installer, un nombre de photos limité par personne, et un album qui se révèle le lendemain.",
      en: 'The wedding photo app that collects every guest\'s shots: one QR code, no app to install, a limited number of photos per person, and an album revealed the next day.',
      de: 'Die Hochzeit Foto App, die die Aufnahmen all Ihrer Gäste sammelt: ein QR-Code, keine App zu installieren, eine begrenzte Anzahl an Fotos pro Person und ein Album, das am nächsten Tag enthüllt wird.',
    }, lang),
    alternates: alternates('/', lang),
  }
}

// Chaque étape est illustrée par une vraie capture du produit : l'affiche qu'on
// pose sur les tables, le déclencheur, puis la galerie une fois révélée.
const STEPS = {
  fr: [
    { img: '/accueil/affiche.webp', pos: 'center 38%', alt: "Affiche à imprimer avec le QR code de l'événement", title: 'Scannez le QR', sub: "Vos participants ouvrent l'appareil dans leur navigateur. Aucune appli à installer." },
    { img: '/accueil/declencheur.webp', pos: 'center center', alt: "L'appareil photo ouvert dans le navigateur : le viseur, le compteur de poses et le déclencheur", title: 'Prenez vos clichés', sub: 'Un nombre limité de photos par participant. Chaque cliché compte vraiment.' },
    { img: '/accueil/revelation.webp', pos: 'center center', alt: "La galerie de l'événement une fois les photos révélées", title: 'La révélation', sub: 'Tout se développe et se révèle après la fête, pour tout le monde d\'un coup.' },
  ],
  en: [
    { img: '/accueil/affiche.webp', pos: 'center 38%', alt: 'Printable poster with the event QR code', title: 'Scan the QR', sub: 'Your guests open the camera in their browser. No app to install.' },
    { img: '/accueil/declencheur.webp', pos: 'center center', alt: 'The camera open in the browser: viewfinder, shot counter and shutter button', title: 'Take your shots', sub: 'A limited number of photos per guest. Every shot really counts.' },
    { img: '/accueil/revelation.webp', pos: 'center center', alt: 'The event gallery once the photos are revealed', title: 'The reveal', sub: 'Everything develops and is revealed after the party, for everyone at once.' },
  ],
  de: [
    { img: '/accueil/affiche.webp', pos: 'center 38%', alt: 'Aufsteller zum Ausdrucken mit dem QR-Code des Events', title: 'QR-Code scannen', sub: 'Ihre Gäste öffnen die Kamera in ihrem Browser. Keine App nötig.' },
    { img: '/accueil/declencheur.webp', pos: 'center center', alt: 'Die Kamera im Browser: Sucher, Bildzähler und Auslöser', title: 'Fotos machen', sub: 'Eine begrenzte Anzahl an Fotos pro Gast. Jede Aufnahme zählt wirklich.' },
    { img: '/accueil/revelation.webp', pos: 'center center', alt: 'Die Galerie des Events, nachdem die Fotos enthüllt wurden', title: 'Die Enthüllung', sub: 'Alles wird nach der Feier entwickelt und für alle gleichzeitig enthüllt.' },
  ],
}

// Ce que l'organisateur garde sous contrôle. Deux testeurs ont posé la question
// spontanément : la fonction existait déjà, elle n'était juste écrite nulle part.
const CONTROL = {
  fr: [
    { ic: '👀', title: 'Vous validez avant la révélation', sub: 'Vous découvrez les photos en avant-première et masquez celles que vous ne voulez pas voir apparaître. Personne ne le saura.' },
    { ic: '🤝', title: 'À plusieurs si besoin', sub: 'Invitez des co-organisateurs (les mariés, un témoin) pour gérer la galerie et faire le tri ensemble.' },
    { ic: '🎞️', title: 'Chacun maîtrise ses clichés', sub: 'Un participant peut supprimer une photo ratée et en reprendre une. Sans jamais dépasser la limite que vous avez fixée.' },
  ],
  en: [
    { ic: '👀', title: 'You approve before the reveal', sub: "You see the photos first and hide any you don't want to appear. Nobody will ever know." },
    { ic: '🤝', title: 'Share the job if you like', sub: 'Invite co-hosts (the couple, a best man or bridesmaid) to manage the gallery and sort through it together.' },
    { ic: '🎞️', title: 'Everyone controls their own shots', sub: 'A guest can delete a bad photo and take another. Without ever going over the limit you set.' },
  ],
  de: [
    { ic: '👀', title: 'Sie geben vor der Enthüllung frei', sub: 'Sie sehen die Fotos als Erste und blenden aus, was nicht erscheinen soll. Niemand wird es erfahren.' },
    { ic: '🤝', title: 'Gern auch zu mehreren', sub: 'Laden Sie Co-Gastgeber ein (das Brautpaar, einen Trauzeugen), um die Galerie gemeinsam zu verwalten und auszuwählen.' },
    { ic: '🎞️', title: 'Jeder hat seine Fotos im Griff', sub: 'Ein Gast kann ein missglücktes Foto löschen und ein neues machen. Ohne jemals das von Ihnen festgelegte Limit zu überschreiten.' },
  ],
}

const REASSURE = {
  fr: [
    { ic: '🇪🇺', title: 'Hébergé en Europe', sub: 'Vos photos restent sur des serveurs européens.' },
    { ic: '🔒', title: 'Personne d\'autre que vos participants', sub: 'Votre galerie n\'est accessible que par votre lien privé. Elle n\'est jamais publique.' },
    { ic: '📱', title: 'Aucune appli', sub: 'Tout se passe dans le navigateur, même pour vos participants.' },
    { ic: '🗓️', title: 'Suppression auto', sub: 'Photos effacées 6 mois après la révélation. On vous prévient avant.' },
  ],
  en: [
    { ic: '🇪🇺', title: 'Hosted in Europe', sub: 'Your photos stay on European servers.' },
    { ic: '🔒', title: 'Nobody but your guests', sub: 'Your gallery can only be reached through your private link. It is never public.' },
    { ic: '📱', title: 'No app', sub: 'Everything happens in the browser, for your guests too.' },
    { ic: '🗓️', title: 'Automatic deletion', sub: "Photos are deleted 6 months after the reveal. We'll let you know beforehand." },
  ],
  de: [
    { ic: '🇪🇺', title: 'In Europa gehostet', sub: 'Ihre Fotos bleiben auf europäischen Servern.' },
    { ic: '🔒', title: 'Nur für Ihre Gäste', sub: 'Ihre Galerie ist nur über Ihren privaten Link erreichbar. Sie ist niemals öffentlich.' },
    { ic: '📱', title: 'Keine App', sub: 'Alles läuft im Browser, auch für Ihre Gäste.' },
    { ic: '🗓️', title: 'Automatische Löschung', sub: 'Die Fotos werden 6 Monate nach der Enthüllung gelöscht. Wir sagen Ihnen vorher Bescheid.' },
  ],
}

const FAQ = {
  fr: [
    { q: 'Mes participants doivent-ils installer une application ?', a: 'Non. Ils scannent le QR code et la caméra s\'ouvre directement dans leur navigateur. Aucun compte, aucune installation.' },
    { q: 'Combien de temps dure un événement ?', a: 'Aussi longtemps que vous voulez. Vous choisissez la date de début et la date de révélation : une soirée, un week-end, ou une semaine entière de vacances.' },
    { q: 'C\'est réservé aux mariages ?', a: 'Non. Anniversaires, baptêmes, EVJF, vacances entre amis, séminaires : tout événement où les gens sortent leur téléphone pour prendre des photos.' },
    { q: 'Combien de photos chacun peut-il prendre ?', a: 'Vous fixez la limite entre 3 et 15 clichés par participant. Vous pouvez aussi prévoir une recharge de 1 à 5 photos, offerte à ceux qui ont épuisé leur quota, soit 20 photos maximum. C\'est la contrainte « argentique » qui rend chaque cliché précieux.' },
    { q: 'Un participant peut-il supprimer une photo ratée ?', a: 'Oui. La photo supprimée libère une place, il peut en reprendre une autre. En revanche, il ne dépassera jamais la limite que vous avez fixée.' },
    { q: 'Puis-je retirer une photo avant que tout le monde la voie ?', a: 'Oui. Avant la révélation, vous êtes seul à voir les photos et vous pouvez en masquer autant que vous le souhaitez. Vous pouvez aussi inviter des co-organisateurs pour faire ce tri à plusieurs.' },
    { q: 'Quand les photos sont-elles visibles ?', a: 'Elles restent cachées jusqu\'à la date de révélation que vous choisissez, comme une pellicule qu\'on développe. Ensuite, la galerie s\'ouvre pour tout le monde.' },
    { q: 'C\'est un abonnement ?', a: 'Non. Vous payez une seule fois pour votre événement, selon le nombre de participants. Sans renouvellement.' },
  ],
  en: [
    { q: 'Do my guests need to install an app?', a: 'No. They scan the QR code and the camera opens straight in their browser. No account, nothing to install.' },
    { q: 'How long does an event last?', a: 'As long as you like. You choose the start date and the reveal date: one evening, a weekend, or a whole week of holiday.' },
    { q: 'Is it just for weddings?', a: 'No. Birthdays, christenings, hen and stag dos, holidays with friends, company retreats: any event where people get their phones out to take photos.' },
    { q: 'How many photos can each guest take?', a: "You set the limit between 3 and 15 shots per guest. You can also add a top-up of 1 to 5 photos for those who have used up their allowance, so 20 photos at most. It's that “film camera” limit that makes every shot precious." },
    { q: 'Can a guest delete a bad photo?', a: "Yes. Deleting a photo frees up a spot, so they can take another. But they'll never go over the limit you set." },
    { q: 'Can I remove a photo before everyone sees it?', a: "Yes. Before the reveal, you're the only one who sees the photos and you can hide as many as you like. You can also invite co-hosts to sort through them together." },
    { q: 'When can people see the photos?', a: 'They stay hidden until the reveal date you choose, like a roll of film being developed. Then the gallery opens for everyone.' },
    { q: 'Is it a subscription?', a: 'No. You pay once for your event, based on the number of guests. Nothing renews.' },
  ],
  de: [
    { q: 'Müssen meine Gäste eine App installieren?', a: 'Nein. Sie scannen den QR-Code, und die Kamera öffnet sich direkt in ihrem Browser. Kein Konto, keine Installation.' },
    { q: 'Wie lange dauert ein Event?', a: 'So lange Sie möchten. Sie wählen das Startdatum und das Datum der Enthüllung: ein Abend, ein Wochenende oder eine ganze Urlaubswoche.' },
    { q: 'Ist das nur für Hochzeiten?', a: 'Nein. Geburtstage, Taufen, Junggesellinnenabschiede, Urlaub mit Freunden, Firmenevents: jede Feier, bei der die Leute ihr Handy zücken, um Fotos zu machen.' },
    { q: 'Wie viele Fotos darf jeder machen?', a: 'Sie legen das Limit zwischen 3 und 15 Aufnahmen pro Gast fest. Sie können auch 1 bis 5 Extrafotos für alle vorsehen, die ihr Kontingent aufgebraucht haben, also höchstens 20 Fotos. Genau diese „analoge“ Begrenzung macht jede Aufnahme wertvoll.' },
    { q: 'Kann ein Gast ein missglücktes Foto löschen?', a: 'Ja. Das gelöschte Foto gibt einen Platz frei, er kann ein neues machen. Das von Ihnen festgelegte Limit überschreitet er aber nie.' },
    { q: 'Kann ich ein Foto entfernen, bevor alle es sehen?', a: 'Ja. Vor der Enthüllung sehen nur Sie die Fotos und können so viele ausblenden, wie Sie möchten. Sie können auch Co-Gastgeber einladen, um gemeinsam auszuwählen.' },
    { q: 'Wann sind die Fotos sichtbar?', a: 'Sie bleiben bis zum Datum der Enthüllung verborgen, das Sie wählen, wie ein Film, der entwickelt wird. Danach öffnet sich die Galerie für alle.' },
    { q: 'Ist das ein Abo?', a: 'Nein. Sie zahlen einmal für Ihr Event, je nach Anzahl der Gäste. Nichts verlängert sich.' },
  ],
}

// Cinq affiches tirées du générateur, mêmes prénoms partout : on compare les
// modèles, pas les textes. Chaque langue a ses affiches (fr-1.webp, en-1.webp…).
// Le bandeau tourne en boucle : la liste est posée deux fois à la suite, la
// seconde cachée aux lecteurs d'écran.
const AFFICHES = {
  fr: [
    'Affiche QR code au feuillage vert, prénoms en lettres calligraphiées',
    'Affiche QR code rose poudré dans un double cadre',
    'Affiche QR code bleu nuit et or, un cœur au centre du code',
    'Affiche QR code en arche beige, typographie classique',
    'Affiche QR code bordeaux, le code posé sur une carte inclinée',
  ],
  en: [
    'QR code poster with green foliage and calligraphy names',
    'Powder pink QR code poster in a double frame',
    'Navy and gold QR code poster with a heart in the middle of the code',
    'QR code poster with a beige arch and classic lettering',
    'Burgundy QR code poster, the code set on a tilted card',
  ],
  de: [
    'QR-Code-Poster mit grünen Zweigen und kalligrafischen Vornamen',
    'Puderrosa QR-Code-Poster in einem doppelten Rahmen',
    'QR-Code-Poster in Nachtblau und Gold mit einem Herz in der Mitte des Codes',
    'QR-Code-Poster mit beigem Bogen und klassischer Schrift',
    'Bordeauxrotes QR-Code-Poster, der Code auf einer schräg gelegten Karte',
  ],
}

// Trois vraies photos d'un même mariage, prises au téléphone par les invités
// (la cour au crépuscule, l'ouverture du bal, et le selfie posé devant).
// Le prix d'appel des tirages suit la grille : le plus petit format.
const TIRAGE_DES = Math.round(Math.min(...FORMATS_TIRAGE.map((f) => f.prix)) * 100)

const TIRAGES = [
  { img: '/accueil/tirages/tirage-1.webp', rot: -8 },
  { img: '/accueil/tirages/tirage-2.webp', rot: 7 },
  { img: '/accueil/tirages/tirage-3.webp', rot: -1.5 },
]

function PriceCard({ tier, lang }) {
  const isFree = tier.priceCents === 0
  return (
    <div className={`price-card ${tier.popular ? 'popular' : ''}`}>
      {tier.popular && <span className="price-pop">{t({ fr: 'LE PLUS CHOISI', en: 'MOST POPULAR', de: 'AM BELIEBTESTEN' }, lang)}</span>}
      <div className="price-guests">
        {isFree
          ? t({ fr: 'Pour tester', en: 'To try it out', de: 'Zum Testen' }, lang)
          : t({ fr: 'Jusqu\'à', en: 'Up to', de: 'Bis zu' }, lang)}
      </div>
      <div className="price-amount">{tier.maxGuests}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}>{t({ fr: ' participants', en: ' guests', de: ' Gäste' }, lang)}</span></div>
      <div className="price-unit">
        {isFree
          ? t({ fr: 'Gratuit · sans carte', en: 'Free · no card', de: 'Kostenlos · ohne Karte' }, lang)
          : `${prix(tier.priceCents, lang)}${t({ fr: ' · paiement unique', en: ' · one-off payment', de: ' · einmalige Zahlung' }, lang)}`}
      </div>
      <Link href={`/create?tier=${tier.maxGuests}`} className={`btn ${tier.popular ? 'btn-accent' : 'btn-ghost'}`}>
        {isFree
          ? t({ fr: 'Essayer gratuitement', en: 'Try it for free', de: 'Kostenlos testen' }, lang)
          : t({ fr: 'Choisir cette formule', en: 'Choose this plan', de: 'Dieses Paket wählen' }, lang)}
      </Link>
    </div>
  )
}

export default async function Home({ params }) {
  const lang = await langueDeParams(params)
  const M = marque(lang)
  return (
    <div className="site">
      <TryQR />
      <SiteNav />

      {/* <main> : repère qui permet aux lecteurs d'écran de sauter directement
          au contenu principal, en passant la navigation. */}
      <main className="site-inner">
        {/* HERO */}
        <section className="hero hero-split">
          <div>
            <div className="eyebrow">{t({ fr: 'Appareil photo jetable · événements', en: 'Disposable camera · events', de: 'Einwegkamera · Events' }, lang)}</div>
            <h1>
              {t({
                fr: <>L'appareil photo<br />jetable de votre<br />mariage.</>,
                en: <>The disposable<br />camera for your<br />wedding.</>,
                de: <>Die Einwegkamera<br />für Ihre<br />Hochzeit.</>,
              }, lang)}
            </h1>
            <p>{M.pitch}</p>
            {/* Deux testeurs ont cru à une contrainte de 24 h : la durée se dit ici. */}
            <p style={{ marginTop: 10 }}>
              {t({
                fr: 'Une soirée, un week-end ou une semaine entière : vous choisissez la durée et le nombre de clichés.',
                en: 'One evening, a weekend or a whole week: you choose how long it lasts and how many shots everyone gets.',
                de: 'Ein Abend, ein Wochenende oder eine ganze Woche: Sie wählen die Dauer und die Anzahl der Fotos.',
              }, lang)}
            </p>
            <div className="hero-cta">
              <Link href="#tarifs" className="btn btn-accent">{t({ fr: 'Voir les formules →', en: 'See the plans →', de: 'Pakete ansehen →' }, lang)}</Link>
              <span className="mono small muted">{t({ fr: "Gratuit jusqu'à 5 participants", en: 'Free for up to 5 guests', de: 'Kostenlos bis 5 Gäste' }, lang)}</span>
            </div>
            {/* Sur téléphone, la pastille flottante « Essayer » tombait pile sous
                le bouton « Créer mon événement ». L'essai se propose donc ici,
                dans la lecture, plutôt qu'en bas de l'écran. */}
            <Link href="/essai" className="hero-try">
              {t({ fr: "✱ Essayer l'appareil photo tout de suite", en: '✱ Try the camera right now', de: '✱ Die Kamera sofort ausprobieren' }, lang)}
            </Link>
            {/* « Que pour les mariages ? » : la réponse tient sur une ligne. */}
            <div className="mono small muted" style={{ marginTop: 20 }}>
              {t({
                fr: 'Mariages · Anniversaires · Baptêmes · EVJF · Vacances · Séminaires',
                en: 'Weddings · Birthdays · Christenings · Hen & stag dos · Holidays · Company retreats',
                de: 'Hochzeiten · Geburtstage · Taufen · JGA · Urlaub · Firmenevents',
              }, lang)}
            </div>
          </div>
          {/* Voir l'appareil vaut mieux que le décrire, et un viseur vide ne
              vend rien : ces deux écrans montrent une vraie soirée, de la photo
              prise jusqu'à l'album révélé. Seules images chargées tout de suite,
              les autres attendent le défilement. */}
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt={t({
                  fr: "L'appareil photo jetable ouvert dans le navigateur : un groupe de participants dans le viseur, le compteur de poses et le déclencheur.",
                  en: 'The disposable camera open in the browser: a group of guests in the viewfinder, the shot counter and the shutter button.',
                  de: 'Die Einwegkamera im Browser: eine Gruppe von Gästen im Sucher, der Bildzähler und der Auslöser.',
                }, lang)} />
            </div>
            {/* Priorité basse : c'est le plus gros fichier de la page (107 Ko)
                pour l'écran du fond, à moitié caché derrière l'autre. Chargé en
                priorité haute, il retardait la police du titre et la feuille de
                style. Il arrive maintenant juste après, sans se faire attendre
                puisqu'il reste dans le premier écran. */}
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385" fetchPriority="low"
                alt={t({
                  fr: "L'album révélé après la fête : les photos de tous les participants réunies dans une galerie.",
                  en: "The album revealed after the party: every guest's photos together in one gallery.",
                  de: 'Das nach der Feier enthüllte Album: die Fotos aller Gäste in einer Galerie.',
                }, lang)} />
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>{t({ fr: 'Comment ça marche', en: 'How it works', de: "So funktioniert's" }, lang)}</div>
          <h2 className="section-title">{t({ fr: 'Trois étapes, zéro friction', en: 'Three steps, zero hassle', de: 'Drei Schritte, null Aufwand' }, lang)}</h2>
          <div className="section-sub">
            {t({
              fr: "Vous créez l'événement, vos participants scannent, et la magie opère après la fête.",
              en: 'You create the event, your guests scan, and the magic happens after the party.',
              de: 'Sie erstellen das Event, Ihre Gäste scannen, und der Zauber passiert nach der Feier.',
            }, lang)}
          </div>
          <div className="steps-grid">
            {STEPS[lang].map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-shot">
                  <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                  <img src={s.img} alt={s.alt} loading="lazy" style={{ objectPosition: s.pos }} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* L'AFFICHE : l'étape 1 dit « scannez le QR », encore faut-il que le
            QR soit sur les tables. On montre ici à quoi il peut ressembler.
            Pas de lien vers le générateur : il fait sortir du parcours
            d'achat, l'affiche se personnalise une fois l'événement créé. */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>{t({ fr: 'Avant la fête', en: 'Before the party', de: 'Vor der Feier' }, lang)}</div>
          <h2 className="section-title">{t({ fr: 'Un QR code à votre image', en: 'A QR code that looks like you', de: 'Ein QR-Code ganz in Ihrem Stil' }, lang)}</h2>
          <div className="section-sub">
            {t({
              fr: 'Vos prénoms, votre date, vos couleurs : dès votre événement créé, choisissez un modèle et votre affiche est prête à imprimer, à poser sur les tables ou à glisser dans un cadre.',
              en: 'Your names, your date, your colours: as soon as your event is created, pick a design and your poster is ready to print, to set on the tables or slip into a frame.',
              de: 'Ihre Vornamen, Ihr Datum, Ihre Farben: Sobald Ihr Event erstellt ist, wählen Sie ein Design, und Ihr Poster ist bereit zum Drucken, für die Tische oder für einen Bilderrahmen.',
            }, lang)}
          </div>
          <div className="affiches-defile">
            <div className="affiches-piste">
              {[...AFFICHES[lang], ...AFFICHES[lang]].map((alt, i) => {
                const n = AFFICHES[lang].length
                return (
                  <img key={i} src={`/accueil/affiches/${lang}-${(i % n) + 1}.webp`} width="480" height="679" loading="lazy"
                    alt={i < n ? alt : ''} aria-hidden={i >= n || undefined} />
                )
              })}
            </div>
          </div>
        </section>

        {/* PENDANT LA FÊTE : entre le déclencheur et la révélation, il y a
            l'attente : l'album se remplit à plusieurs sans que personne ne
            voie rien. C'est ce qui distingue le produit d'un dossier partagé,
            et rien ne le montrait. */}
        <section className="section">
          <div className="split split-inverse">
            <div className="split-text">
              <div className="eyebrow-mute" style={{ marginBottom: 10 }}>{t({ fr: 'Pendant la fête', en: 'During the party', de: 'Während der Feier' }, lang)}</div>
              <h2>{t({ fr: 'Un seul album, rempli par tout le monde', en: 'One album, filled by everyone', de: 'Ein Album, gefüllt von allen' }, lang)}</h2>
              <p>
                {t({
                  fr: 'Chacun scanne, prend ses clichés et voit le compteur grimper. Mais personne ne découvre les photos des autres : le compte à rebours retient tout le monde jusqu\'à la révélation.',
                  en: "Everyone scans, takes their shots and watches the counter go up. But nobody sees anyone else's photos: the countdown keeps everyone waiting until the reveal.",
                  de: 'Jeder scannt, macht seine Fotos und sieht den Zähler steigen. Aber niemand sieht die Fotos der anderen: Der Countdown lässt alle bis zur Enthüllung warten.',
                }, lang)}
              </p>
              <ul className="split-list">
                <li><span className="ic">⏳</span><div>
                  {t({
                    fr: <><b>Le compte à rebours</b> : le même pour tous, à la seconde près.</>,
                    en: <><b>The countdown</b>: the same for everyone, down to the second.</>,
                    de: <><b>Der Countdown</b>: für alle gleich, auf die Sekunde genau.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">👥</span><div>
                  {t({
                    fr: <><b>Le nombre de participants</b> : la fête se voit se rassembler en direct.</>,
                    en: <><b>The number of guests</b>: watch the party come together live.</>,
                    de: <><b>Die Anzahl der Gäste</b>: Man sieht live, wie die Feier zusammenkommt.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">🎞️</span><div>
                  {t({
                    fr: <><b>Chacun sa pellicule</b> : ses propres photos, visibles de lui seul avant l'heure.</>,
                    en: <><b>A roll of film each</b>: your own photos, visible only to you until the reveal.</>,
                    de: <><b>Jedem sein Film</b>: die eigenen Fotos, vor der Zeit nur für einen selbst sichtbar.</>,
                  }, lang)}
                </div></li>
              </ul>
            </div>
            <div className="phone phone-tilt">
              <img src="/accueil/album-partage.webp" width="640" height="1385" loading="lazy"
                alt={t({
                  fr: "L'album partagé pendant la soirée : compte à rebours avant la révélation, nombre de photos du groupe et de participants.",
                  en: 'The shared album during the party: countdown to the reveal, number of group photos and guests.',
                  de: 'Das gemeinsame Album während der Feier: Countdown bis zur Enthüllung, Anzahl der Fotos und der Gäste.',
                }, lang)} />
            </div>
          </div>
        </section>

        {/* LA PELLICULE : on vient de raconter l'attente et l'ouverture de
            l'album ; reste à montrer ce qui en sort. */}
        <Pellicules lang={lang} />

        {/* VOUS GARDEZ LA MAIN */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>{t({ fr: 'Vous gardez la main', en: "You're in control", de: 'Sie behalten die Kontrolle' }, lang)}</div>
          <h2 className="section-title">{t({ fr: 'Rien ne se révèle sans votre accord', en: 'Nothing is revealed without your approval', de: 'Nichts wird ohne Ihre Zustimmung enthüllt' }, lang)}</h2>
          <div className="section-sub">
            {t({
              fr: 'Une photo gênante ? Vous la retirez avant que qui que ce soit ne la voie.',
              en: 'An embarrassing photo? You remove it before anyone sees it.',
              de: 'Ein peinliches Foto? Sie entfernen es, bevor irgendjemand es sieht.',
            }, lang)}
          </div>
          <div className="steps-grid">
            {CONTROL[lang].map((c, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{c.ic}</div>
                <h3>{c.title}</h3>
                <p>{c.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TARIFS */}
        <section className="section" id="tarifs">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>{t({ fr: 'Tarifs', en: 'Pricing', de: 'Preise' }, lang)}</div>
          <h2 className="section-title">{t({ fr: 'Un prix unique par événement', en: 'One price per event', de: 'Ein Preis pro Event' }, lang)}</h2>
          <div className="section-sub">
            {t({
              fr: "Pas d'abonnement. Vous choisissez selon le nombre de participants, vous payez une fois.",
              en: 'No subscription. You choose based on the number of guests, and you pay once.',
              de: 'Kein Abo. Sie wählen nach Anzahl der Gäste und zahlen einmal.',
            }, lang)}
          </div>
          <div className="price-grid">
            {TIERS.map((tier) => <PriceCard key={tier.maxGuests} tier={tier} lang={lang} />)}
          </div>
          <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
            {t({
              fr: `Plus de ${TOP_TIER.maxGuests} participants ? Écrivez-nous.`,
              en: `More than ${TOP_TIER.maxGuests} guests? Get in touch.`,
              de: `Mehr als ${TOP_TIER.maxGuests} Gäste? Schreiben Sie uns.`,
            }, lang)}
          </p>
        </section>

        {/* APRÈS LA FÊTE : le bilan de l'événement existait déjà mais n'était
            raconté nulle part. C'est pourtant ce qui fait sourire à la fin. */}
        <section className="section">
          <div className="split">
            <div className="phone phone-tilt">
              <img src="/accueil/bilan.webp" width="640" height="1393" loading="lazy"
                alt={t({
                  fr: "Le bilan de l'événement : nombre de photos prises, photo préférée, premier et dernier cliché, photographe le plus rapide.",
                  en: 'The event recap: number of photos taken, favourite photo, first and last shot, fastest photographer.',
                  de: 'Die Event-Bilanz: Anzahl der Fotos, Lieblingsfoto, erste und letzte Aufnahme, schnellster Fotograf.',
                }, lang)} />
            </div>
            <div className="split-text">
              <div className="eyebrow-mute" style={{ marginBottom: 10 }}>{t({ fr: 'Et après la fête', en: 'And after the party', de: 'Und nach der Feier' }, lang)}</div>
              <h2>{t({ fr: 'Votre événement en chiffres', en: 'Your event in numbers', de: 'Ihr Event in Zahlen' }, lang)}</h2>
              <p>
                {t({
                  fr: "Quand la galerie s'ouvre, on vous raconte votre soirée. Qui a dégainé en premier, à quelle heure ça a le plus flashé, qui a été le photographe le plus prolifique.",
                  en: 'When the gallery opens, we tell you the story of your night. Who was quickest on the draw, when the flashes went off the most, who was the most prolific photographer.',
                  de: 'Wenn sich die Galerie öffnet, erzählen wir Ihnen Ihren Abend. Wer als Erster abgedrückt hat, wann es am meisten geblitzt hat, wer der fleißigste Fotograf war.',
                }, lang)}
              </p>
              <ul className="split-list">
                <li><span className="ic">🌅</span><div>
                  {t({
                    fr: <><b>Le premier et le dernier cliché</b> : souvent celui de 6 h du matin que personne n'assume.</>,
                    en: <><b>The first and last shot</b>: often the 6 am one nobody will own up to.</>,
                    de: <><b>Die erste und die letzte Aufnahme</b>: oft die von 6 Uhr morgens, zu der sich niemand bekennt.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">🏆</span><div>
                  {t({
                    fr: <><b>Le photographe en chef</b> : celui qui a vidé sa pellicule en une heure.</>,
                    en: <><b>The chief photographer</b>: the one who used up their roll in an hour.</>,
                    de: <><b>Der Chef-Fotograf</b>: der seinen Film in einer Stunde verschossen hat.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">📈</span><div>
                  {t({
                    fr: <><b>Le créneau le plus chargé</b> : le moment où la fête a vraiment démarré.</>,
                    en: <><b>The busiest hour</b>: the moment the party really got going.</>,
                    de: <><b>Die meistfotografierte Stunde</b>: der Moment, in dem die Feier richtig losging.</>,
                  }, lang)}
                </div></li>
              </ul>
            </div>
          </div>
        </section>

        {/* SUR PAPIER : la suite logique de l'album révélé. Le prix d'appel est
            dit franchement : c'est une option payante, en plus de la formule. */}
        <section className="section">
          <div className="split split-inverse">
            <div className="split-text">
              <div className="eyebrow-mute" style={{ marginBottom: 10 }}>{t({ fr: 'Sur papier', en: 'On paper', de: 'Auf Papier' }, lang)}</div>
              <h2>{t({ fr: 'Vos meilleurs clichés, en vrais tirages*', en: 'Your best shots, as real prints*', de: 'Ihre besten Aufnahmen als echte Abzüge*' }, lang)}</h2>
              <p>
                {t({
                  fr: "Une fois l'album révélé, chaque participant peut commander lui-même ses photos préférées (frais supplémentaires à prévoir), directement depuis l'album, sans passer par vous. Il les reçoit chez lui, imprimées comme au temps des pellicules.",
                  en: 'Once the album is revealed, every guest can order their own favourite photos (at an extra cost) straight from the album, without going through you. They get them delivered at home, printed just like in the days of film.',
                  de: 'Sobald das Album enthüllt ist, kann jeder Gast seine Lieblingsfotos selbst bestellen (gegen Aufpreis), direkt im Album, ohne über Sie zu gehen. Er bekommt sie nach Hause geschickt, gedruckt wie zu Zeiten des Films.',
                }, lang)}
              </p>
              <ul className="split-list">
                <li><span className="ic">🎞️</span><div>
                  {t({
                    fr: <><b>Avec votre pellicule</b> : le rendu choisi et la date incrustée se retrouvent sur le papier.</>,
                    en: <><b>With your film look</b>: the chosen style and the date stamp carry over onto the paper.</>,
                    de: <><b>Mit Ihrem Filmlook</b>: der gewählte Stil und der Datumsstempel landen mit auf dem Papier.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">🖼️</span><div>
                  {t({
                    fr: <><b>Deux formats</b> : 10×15 ou 15×20, en finition brillante ou mate.</>,
                    en: <><b>Two sizes</b>: 10×15 or 15×20 cm, with a glossy or matte finish.</>,
                    de: <><b>Zwei Formate</b>: 10×15 oder 15×20 cm, glänzend oder matt.</>,
                  }, lang)}
                </div></li>
                <li><span className="ic">📮</span><div>
                  {t({
                    fr: <><b>Livré dans la boîte aux lettres</b> : imprimé en France, envoyé partout dans l'Union européenne.</>,
                    en: <><b>Delivered to your letterbox</b>: printed in France, sent anywhere in the European Union.</>,
                    de: <><b>Direkt in den Briefkasten</b>: in Frankreich gedruckt, in die ganze Europäische Union verschickt.</>,
                  }, lang)}
                </div></li>
              </ul>
              {/* L'astérisque du titre renvoie ici : les tirages sont payés à
                  part, en plus de la formule. */}
              <p className="mono small muted" style={{ marginTop: 18 }}>
                {t({
                  fr: `* En option : à partir de ${prix(TIRAGE_DES, lang)} la photo, hors frais de livraison.`,
                  en: `* Optional extra: from ${prix(TIRAGE_DES, lang)} per photo, plus delivery.`,
                  de: `* Optional: ab ${prix(TIRAGE_DES, lang)} pro Foto, zuzüglich Versand.`,
                }, lang)}
              </p>
            </div>
            <div className="tirages-tas" aria-hidden="true">
              {TIRAGES.map((tir, i) => (
                <div key={i} className="tirage" style={{ '--rot': `${tir.rot}deg` }}>
                  <img src={tir.img} width="450" height="600" loading="lazy" alt="" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RÉASSURANCE */}
        <section className="section">
          <h2 className="section-title">{t({ fr: 'Pensé pour vos souvenirs', en: 'Built for your memories', de: 'Gemacht für Ihre Erinnerungen' }, lang)}</h2>
          <div className="section-sub">
            {t({
              fr: 'La confiance avant tout : vos photos vous appartiennent.',
              en: 'Trust comes first: your photos belong to you.',
              de: 'Vertrauen zuerst: Ihre Fotos gehören Ihnen.',
            }, lang)}
          </div>
          <div className="reassure">
            {REASSURE[lang].map((r, i) => (
              <div key={i} className="reassure-item">
                <span className="ic">{r.ic}</span>
                <div><h3>{r.title}</h3><p>{r.sub}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <h2 className="section-title">{t({ fr: 'Questions fréquentes', en: 'Frequently asked questions', de: 'Häufige Fragen' }, lang)}</h2>
          <div className="section-sub" />
          {FAQ[lang].map((f, i) => (
            <div key={i} className="faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA FINAL */}
        <section className="cta-band">
          <h3>{t({ fr: 'Un événement à immortaliser ?', en: 'An event worth remembering?', de: 'Ein Event, das in Erinnerung bleiben soll?' }, lang)}</h3>
          <p>{t({ fr: 'Créez votre appareil jetable en 2 minutes.', en: 'Create your disposable camera in 2 minutes.', de: 'Erstellen Sie Ihre Einwegkamera in 2 Minuten.' }, lang)}</p>
          <Link href="/create?tier=5" className="btn btn-accent">{t({ fr: 'Créer mon événement →', en: 'Create my event →', de: 'Mein Event erstellen →' }, lang)}</Link>
        </section>
      </main>

      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
          <nav className="vfooter-links">
            <Link href={lien('/generateur-qr-code-mariage', lang)}>{t({ fr: 'Générateur de QR code', en: 'QR code generator', de: 'QR-Code-Generator' }, lang)}</Link>
            <Link href={lien('/aide', lang)}>{t({ fr: 'Aide', en: 'Help', de: 'Hilfe' }, lang)}</Link>
            <Link href={lien('/mentions-legales', lang)}>{t({ fr: 'Mentions légales', en: 'Legal notice', de: 'Impressum' }, lang)}</Link>
            <Link href={lien('/cgv', lang)}>{t({ fr: 'CGV', en: 'Terms of sale', de: 'AGB' }, lang)}</Link>
            <Link href={lien('/politique-de-confidentialite', lang)}>{t({ fr: 'Confidentialité', en: 'Privacy', de: 'Datenschutz' }, lang)}</Link>
            <ConsentReset />
          </nav>
          {/* Le choix de la langue, en blanc sur le fond sombre du pied. */}
          <SelecteurLangue style={{ color: '#fff' }} />
          <span className="mono">{t({ fr: '© 2026 · Hébergé en UE · RGPD', en: '© 2026 · Hosted in the EU · GDPR', de: '© 2026 · In der EU gehostet · DSGVO' }, lang)}</span>
        </div>
      </footer>
    </div>
  )
}
