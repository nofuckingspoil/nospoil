// ============================================================
//  Générateur public d'affiche « scannez pour partager vos photos ».
//
//  Page ouverte à tous, sans compte : elle rend service seule, et fait
//  découvrir l'album photo à ceux qui n'en ont pas encore. L'outil est
//  entièrement dans le navigateur (Generateur.js), le texte autour est là
//  pour Google et pour rassurer avant impression.
// ============================================================

import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'
import SitePied from '../../../components/SitePied'
import { BRAND } from '../../../lib/brand'
import { LOCALES } from '../../../lib/i18n'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'
import Generateur from './Generateur'

// Tous les textes de la page, par langue. Le français est inchangé.
const TEXTES = {
  fr: {
    TITRE: "Générateur d'affiche QR code mariage",
    TITRE_META: "Générateur d'affiche QR code mariage gratuit et personnalisé",
    PROMESSE: "Créez gratuitement l'affiche « scannez pour partager vos photos » aux couleurs de votre mariage : vos prénoms, votre date, vos teintes, six mises en page. Affiche A4, chevalets de table, petits cartons, à imprimer chez vous ou chez un imprimeur, sans compte ni filigrane.",
    KEYWORDS: [
      'affiche qr code mariage',
      'générateur qr code mariage',
      'panneau photos mariage',
      'qr code mariage personnalisé',
      'affiche scannez pour partager vos photos',
      'créer un qr code mariage gratuit',
      'qr code faire-part mariage',
      'qr code photos mariage',
    ],
    ETAPES: [
      { n: '1', t: 'Collez votre lien', d: "L'adresse de votre album photo, de votre site de mariage, de votre playlist." },
      { n: '2', t: 'Choisissez le support', d: 'Affiche A4 pour l’entrée, chevalets pour les tables, petits cartons à disperser.' },
      { n: '3', t: 'Habillez-la', d: 'Vos prénoms, votre date, vos couleurs, six mises en page et sept polices.' },
      { n: '4', t: 'Imprimez', d: 'Chez vous en un clic, ou en PDF haute définition à envoyer à un imprimeur.' },
    ],
    USAGES: [
      {
        t: 'Le panneau « vos photos ici »',
        d: "Le plus demandé : une affiche A4 à l'entrée et des chevalets sur les tables, que les invités scannent pour envoyer leurs clichés dans un album commun.",
      },
      {
        t: 'Le faire-part et le save-the-date',
        d: "Un QR discret dans un coin du carton, qui mène au site du mariage, au plan d'accès ou au formulaire de réponse.",
      },
      {
        t: 'La liste ou la cagnotte',
        d: 'Sur le carton d’invitation ou le panneau d’entrée, plutôt qu’une longue adresse que personne ne recopie.',
      },
      {
        t: 'La playlist de la soirée',
        d: 'Un QR au bar : chacun ajoute son morceau, le DJ n’est plus interrompu toutes les dix minutes.',
      },
      {
        t: 'Le plan de table et le menu',
        d: 'Un QR sur le marque-place qui ouvre le menu détaillé, les allergènes, ou le déroulé de la journée.',
      },
      {
        t: 'Le livre d’or numérique',
        d: 'Un QR sur un chevalet, et les mots des invités arrivent dans un même endroit, avec leurs voix et leurs vidéos.',
      },
    ],
    FAQ: [
      {
        q: 'L’affiche est-elle vraiment gratuite, sans compte ni filigrane ?',
        r: "Oui. Tout est fabriqué dans votre navigateur, vous imprimez ou téléchargez, cela vous appartient. Pas de compte, pas de filigrane, pas d'abonnement, et pas de date d'expiration : le QR est statique, il fonctionnera toujours tant que l'adresse vers laquelle il pointe existe. Méfiez-vous des générateurs qui demandent un abonnement : leurs QR cessent souvent de fonctionner à la fin de l'essai.",
      },
      {
        q: 'Quels formats puis-je imprimer ?',
        r: "Cinq supports : l'affiche A4 pour l'entrée ou le bar, l'affiche A5 (2 par page), le chevalet de table à plier en deux (2 par page), les petits cartons à disperser sur les tables (9 par page) et un carré pour un écran ou les réseaux. Pour les formats multiples, la page A4 est composée automatiquement avec les repères de découpe et le trait de pliage.",
      },
      {
        q: 'Puis-je changer les textes de l’affiche ?',
        r: "Tous : la ligne du haut, vos prénoms, la date, la petite phrase, la consigne sous le code et la ligne du bas. Videz un champ pour le faire disparaître. Les prénoms trop longs voient leur taille s'ajuster automatiquement pour ne jamais déborder.",
      },
      {
        q: 'Mon QR code va-t-il vraiment se scanner avec des couleurs claires ?',
        r: "C'est le piège classique. Un QR pastel sur fond crème est ravissant à l'écran et illisible sur un carton imprimé. L'outil surveille le contraste entre le code et le fond de l'affiche en direct, et vous prévient dès que ça devient risqué. Sur un fond foncé, une case ajoute une pastille claire derrière le code. Utilisez aussi le bouton « Tester le scan » : visez votre écran avec votre propre téléphone avant de commander l'impression.",
      },
      {
        q: 'Quelle taille faut-il pour l’impression ?',
        r: "Les formats proposés sont déjà calibrés : le code fait environ 9 cm sur l'affiche A4, 6 cm sur le chevalet et 3 cm sur les petits cartons, assez pour être lu à bonne distance. Si vous repartez du fichier pour le retravailler, gardez au minimum 3 cm de côté pour un carton en main et 10 cm pour une affiche qu'on scanne à un mètre. Le SVG reste net à n'importe quelle taille, c'est celui que réclament les imprimeurs ; le PNG convient pour Canva ou un écran.",
      },
      {
        q: 'Puis-je mettre notre logo ou nos initiales au centre ?',
        r: "Vous pouvez placer vos initiales, un cœur, deux alliances ou un appareil photo au centre du code. Quand un motif occupe le centre, l'outil augmente automatiquement la redondance du code pour qu'il reste lisible malgré la partie masquée.",
      },
      {
        q: 'Puis-je changer la destination du QR code après l’avoir imprimé ?',
        r: "Non : un QR statique contient l'adresse elle-même, il n'y a pas d'intermédiaire qui pourrait la modifier plus tard. C'est justement ce qui le rend gratuit et éternel. Si vous pensez changer d'avis, faites pointer le QR vers une page que vous maîtrisez (votre site de mariage) et modifiez cette page plutôt que le code.",
      },
      {
        q: 'Mes informations sont-elles enregistrées quelque part ?',
        r: "Non. L'adresse que vous saisissez et les couleurs que vous choisissez ne quittent jamais votre navigateur : aucun envoi vers un serveur, aucun compte, aucune trace.",
      },
    ],
    EYEBROW: 'outil gratuit',
    H1: 'Votre affiche « scannez pour partager vos photos »',
    COMMENT: 'Comment ça marche',
    SIX: 'Six façons de s’en servir le jour J',
    ERREURS: 'Trois erreurs qui ruinent un QR code le jour du mariage',
    TIPS: (
      <>
        <li>
          <strong>Trop pâle.</strong> Un QR beige sur fond ivoire ne se scanne pas dans une
          salle en lumière tamisée. Gardez un vrai écart entre la couleur des pixels et
          celle du fond : l’outil vous alerte quand l’écart devient trop faible.
        </li>
        <li>
          <strong>Trop petit.</strong> En dessous de 3 cm, un téléphone met dix secondes à
          accrocher, et vos invités abandonnent avant. Sur une affiche à scanner de loin,
          voyez large : 10 cm minimum.
        </li>
        <li>
          <strong>Sans marge.</strong> Un QR collé au bord d’un carton ou posé sur une photo
          chargée devient invisible pour l’appareil. Il lui faut une zone calme tout autour ;
          elle est comprise dans les fichiers téléchargés ici, ne la rognez pas.
        </li>
      </>
    ),
    NOTE: (
      <>
        Dernier conseil, le plus utile : imprimez <em>une</em> affiche test et faites-la
        scanner par trois téléphones différents, dont un vieil Android. C’est cinq minutes
        qui évitent 150 cartons inutilisables.
      </>
    ),
    QUESTIONS: 'Questions fréquentes',
    CTA_H: 'Et derrière l’affiche, vos photos ?',
    CTA_P: 'Chaque invité devient photographe, avec un nombre de clichés compté. Gratuit jusqu’à 5 invités, sans carte bancaire.',
    CTA_BTN: 'Créer mon album',
  },

  en: {
    TITRE: 'Wedding QR code poster generator',
    TITRE_META: 'Free, personalised wedding QR code poster generator',
    PROMESSE: 'Create your own free “scan to share your photos” poster in your wedding colours: your names, your date, your colours, six layouts. A4 posters, table tents, small cards, to print at home or at a print shop, with no account and no watermark.',
    KEYWORDS: [
      'wedding qr code sign',
      'wedding qr code generator',
      'wedding photo sharing sign',
      'personalised wedding qr code',
      'scan to share your photos sign',
      'free wedding qr code',
      'qr code wedding invitation',
      'wedding photos qr code',
    ],
    ETAPES: [
      { n: '1', t: 'Paste your link', d: 'The address of your photo album, your wedding website, your playlist.' },
      { n: '2', t: 'Choose the format', d: 'An A4 poster for the entrance, table tents for the tables, small cards to scatter around.' },
      { n: '3', t: 'Style it', d: 'Your names, your date, your colours, six layouts and seven fonts.' },
      { n: '4', t: 'Print it', d: 'At home in one click, or as a high-resolution PDF to send to a print shop.' },
    ],
    USAGES: [
      {
        t: 'The “your photos here” sign',
        d: 'The most popular: an A4 poster at the entrance and table tents on the tables, which guests scan to send their shots to a shared album.',
      },
      {
        t: 'The invitation and the save-the-date',
        d: 'A discreet QR code in a corner of the card, leading to the wedding website, the directions or the RSVP form.',
      },
      {
        t: 'The gift list or fund',
        d: 'On the invitation or the entrance sign, rather than a long address nobody types in.',
      },
      {
        t: 'The party playlist',
        d: 'A QR code at the bar: everyone adds their song, and the DJ is no longer interrupted every ten minutes.',
      },
      {
        t: 'The seating plan and the menu',
        d: 'A QR code on the place card that opens the full menu, the allergens, or the schedule for the day.',
      },
      {
        t: 'The digital guest book',
        d: 'A QR code on a table tent, and your guests’ messages all arrive in one place, with their voices and videos.',
      },
    ],
    FAQ: [
      {
        q: 'Is the poster really free, with no account and no watermark?',
        r: 'Yes. Everything is made in your browser, you print or download it, and it’s yours. No account, no watermark, no subscription and no expiry date: the QR code is static, so it will keep working as long as the address it points to exists. Beware of generators that ask for a subscription: their QR codes often stop working at the end of the trial.',
      },
      {
        q: 'Which formats can I print?',
        r: 'Five formats: the A4 poster for the entrance or the bar, the A5 poster (2 per page), the table tent to fold in half (2 per page), small cards to scatter on the tables (9 per page) and a square for a screen or social media. For multiple formats, the A4 page is laid out automatically with crop marks and the fold line.',
      },
      {
        q: 'Can I change the text on the poster?',
        r: 'All of it: the top line, your names, the date, the tagline, the instruction under the code and the bottom line. Empty a field to remove it. Names that are too long are automatically resized so they never overflow.',
      },
      {
        q: 'Will my QR code really scan with light colours?',
        r: 'That’s the classic trap. A pastel QR code on a cream background looks lovely on screen and is unreadable on a printed card. The tool checks the contrast between the code and the poster background live, and warns you as soon as it becomes risky. On a dark background, a checkbox adds a light patch behind the code. Also use the “Test the scan” button: point your own phone at your screen before you order the printing.',
      },
      {
        q: 'What size is needed for printing?',
        r: 'The formats offered are already calibrated: the code is about 9 cm on the A4 poster, 6 cm on the table tent and 3 cm on the small cards, enough to be read from a good distance. If you rework the file yourself, keep at least 3 cm per side for a card held in the hand and 10 cm for a poster scanned from a metre away. The SVG stays sharp at any size, and it’s the one print shops ask for; the PNG is fine for Canva or a screen.',
      },
      {
        q: 'Can we put our logo or initials in the centre?',
        r: 'You can place your initials, a heart, two wedding rings or a camera in the centre of the code. When a motif takes up the centre, the tool automatically increases the code’s redundancy so it stays readable despite the hidden part.',
      },
      {
        q: 'Can I change where the QR code leads after printing it?',
        r: 'No: a static QR code contains the address itself, with no intermediary that could change it later. That’s exactly what makes it free and permanent. If you think you might change your mind, point the QR code to a page you control (your wedding website) and edit that page rather than the code.',
      },
      {
        q: 'Is my information saved anywhere?',
        r: 'No. The address you enter and the colours you choose never leave your browser: nothing is sent to a server, no account, no trace.',
      },
    ],
    EYEBROW: 'free tool',
    H1: 'Your “scan to share your photos” poster',
    COMMENT: 'How it works',
    SIX: 'Six ways to use it on the big day',
    ERREURS: 'Three mistakes that ruin a QR code on the wedding day',
    TIPS: (
      <>
        <li>
          <strong>Too pale.</strong> A beige QR code on an ivory background won’t scan in a
          dimly lit room. Keep a real difference between the colour of the pixels and the
          background: the tool warns you when the difference gets too small.
        </li>
        <li>
          <strong>Too small.</strong> Below 3 cm, a phone takes ten seconds to lock on, and
          your guests give up before then. On a poster scanned from a distance, go big: 10 cm
          minimum.
        </li>
        <li>
          <strong>No margin.</strong> A QR code pushed against the edge of a card or placed on
          a busy photo becomes invisible to the camera. It needs a quiet zone all around it;
          it’s included in the files downloaded here, so don’t crop it.
        </li>
      </>
    ),
    NOTE: (
      <>
        One last tip, the most useful one: print <em>one</em> test poster and have it scanned
        by three different phones, including an old Android. Five minutes that save you
        150 unusable cards.
      </>
    ),
    QUESTIONS: 'Frequently asked questions',
    CTA_H: 'And behind the poster, your photos?',
    CTA_P: 'Every guest becomes a photographer, with a limited number of shots. Free for up to 5 guests, no bank card required.',
    CTA_BTN: 'Create my album',
  },

  de: {
    TITRE: 'Generator für Hochzeits-QR-Code-Poster',
    TITRE_META: 'Kostenloser, individueller Generator für Hochzeits-QR-Code-Poster',
    PROMESSE: 'Gestalten Sie kostenlos Ihr Poster „Scannen und Fotos teilen“ in den Farben Ihrer Hochzeit: Ihre Vornamen, Ihr Datum, Ihre Farbtöne, sechs Layouts. A4-Poster, Tischaufsteller, Kärtchen, zum Drucken zu Hause oder in der Druckerei, ohne Konto und ohne Wasserzeichen.',
    KEYWORDS: [
      'qr code hochzeit schild',
      'qr code generator hochzeit',
      'hochzeit fotos teilen schild',
      'qr code hochzeit personalisiert',
      'scannen und fotos teilen poster',
      'qr code hochzeit kostenlos erstellen',
      'qr code hochzeitseinladung',
      'qr code hochzeitsfotos',
    ],
    ETAPES: [
      { n: '1', t: 'Link einfügen', d: 'Die Adresse Ihres Fotoalbums, Ihrer Hochzeitswebsite, Ihrer Playlist.' },
      { n: '2', t: 'Format wählen', d: 'A4-Poster für den Eingang, Tischaufsteller für die Tische, Kärtchen zum Verteilen.' },
      { n: '3', t: 'Gestalten', d: 'Ihre Vornamen, Ihr Datum, Ihre Farben, sechs Layouts und sieben Schriften.' },
      { n: '4', t: 'Drucken', d: 'Zu Hause mit einem Klick oder als hochauflösende PDF für die Druckerei.' },
    ],
    USAGES: [
      {
        t: 'Das Schild „Ihre Fotos hier“',
        d: 'Am beliebtesten: ein A4-Poster am Eingang und Tischaufsteller auf den Tischen, die die Gäste scannen, um ihre Aufnahmen in ein gemeinsames Album zu schicken.',
      },
      {
        t: 'Einladung und Save-the-Date',
        d: 'Ein dezenter QR-Code in einer Ecke der Karte, der zur Hochzeitswebsite, zur Anfahrt oder zum Antwortformular führt.',
      },
      {
        t: 'Wunschliste oder Geldgeschenk',
        d: 'Auf der Einladung oder dem Schild am Eingang, statt einer langen Adresse, die niemand abtippt.',
      },
      {
        t: 'Die Playlist des Abends',
        d: 'Ein QR-Code an der Bar: Jeder fügt sein Lied hinzu, und der DJ wird nicht mehr alle zehn Minuten unterbrochen.',
      },
      {
        t: 'Sitzplan und Menü',
        d: 'Ein QR-Code auf der Platzkarte, der das ausführliche Menü, die Allergene oder den Tagesablauf öffnet.',
      },
      {
        t: 'Das digitale Gästebuch',
        d: 'Ein QR-Code auf einem Tischaufsteller, und die Worte der Gäste landen an einem Ort, mit ihren Stimmen und Videos.',
      },
    ],
    FAQ: [
      {
        q: 'Ist das Poster wirklich kostenlos, ohne Konto und ohne Wasserzeichen?',
        r: 'Ja. Alles entsteht in Ihrem Browser, Sie drucken oder laden herunter, und es gehört Ihnen. Kein Konto, kein Wasserzeichen, kein Abo und kein Ablaufdatum: Der QR-Code ist statisch und funktioniert, solange die Adresse existiert, auf die er verweist. Vorsicht bei Generatoren, die ein Abo verlangen: Deren QR-Codes funktionieren oft nach Ende der Testphase nicht mehr.',
      },
      {
        q: 'Welche Formate kann ich drucken?',
        r: 'Fünf Formate: das A4-Poster für Eingang oder Bar, das A5-Poster (2 pro Seite), den Tischaufsteller zum Falten (2 pro Seite), Kärtchen zum Verteilen auf den Tischen (9 pro Seite) und ein Quadrat für Bildschirme oder Social Media. Bei Mehrfachformaten wird die A4-Seite automatisch mit Schnittmarken und Falzlinie gestaltet.',
      },
      {
        q: 'Kann ich die Texte auf dem Poster ändern?',
        r: 'Alle: die obere Zeile, Ihre Vornamen, das Datum, den kleinen Satz, den Hinweis unter dem Code und die untere Zeile. Leeren Sie ein Feld, um es zu entfernen. Zu lange Vornamen werden automatisch verkleinert, damit sie nie überstehen.',
      },
      {
        q: 'Lässt sich mein QR-Code mit hellen Farben wirklich scannen?',
        r: 'Das ist die klassische Falle. Ein pastellfarbener QR-Code auf cremefarbenem Grund sieht am Bildschirm hübsch aus und ist auf einer gedruckten Karte unlesbar. Das Tool prüft den Kontrast zwischen Code und Posterhintergrund live und warnt Sie, sobald es riskant wird. Auf dunklem Hintergrund fügt ein Kästchen ein helles Feld hinter dem Code hinzu. Nutzen Sie auch die Schaltfläche „Scan testen“: Richten Sie Ihr eigenes Handy auf den Bildschirm, bevor Sie den Druck bestellen.',
      },
      {
        q: 'Welche Größe braucht es für den Druck?',
        r: 'Die angebotenen Formate sind bereits abgestimmt: Der Code misst etwa 9 cm auf dem A4-Poster, 6 cm auf dem Tischaufsteller und 3 cm auf den Kärtchen, genug, um aus guter Entfernung gelesen zu werden. Wenn Sie die Datei selbst weiterbearbeiten, halten Sie mindestens 3 cm Seitenlänge für eine Karte in der Hand und 10 cm für ein Poster ein, das aus einem Meter gescannt wird. Die SVG-Datei bleibt in jeder Größe scharf, sie ist die, die Druckereien verlangen; die PNG-Datei eignet sich für Canva oder einen Bildschirm.',
      },
      {
        q: 'Können wir unser Logo oder unsere Initialen in die Mitte setzen?',
        r: 'Sie können Ihre Initialen, ein Herz, zwei Eheringe oder eine Kamera in die Mitte des Codes setzen. Wenn ein Motiv die Mitte belegt, erhöht das Tool automatisch die Fehlerkorrektur des Codes, damit er trotz des verdeckten Teils lesbar bleibt.',
      },
      {
        q: 'Kann ich das Ziel des QR-Codes nach dem Drucken noch ändern?',
        r: 'Nein: Ein statischer QR-Code enthält die Adresse selbst, es gibt keine Zwischenstelle, die sie später ändern könnte. Genau das macht ihn kostenlos und dauerhaft. Wenn Sie es sich anders überlegen könnten, lassen Sie den QR-Code auf eine Seite verweisen, die Sie selbst verwalten (Ihre Hochzeitswebsite), und ändern Sie diese Seite statt des Codes.',
      },
      {
        q: 'Werden meine Angaben irgendwo gespeichert?',
        r: 'Nein. Die eingegebene Adresse und die gewählten Farben verlassen niemals Ihren Browser: keine Übertragung an einen Server, kein Konto, keine Spuren.',
      },
    ],
    EYEBROW: 'kostenloses Tool',
    H1: 'Ihr Poster „Scannen und Fotos teilen“',
    COMMENT: 'So funktioniert es',
    SIX: 'Sechs Einsatzmöglichkeiten am großen Tag',
    ERREURS: 'Drei Fehler, die einen QR-Code am Hochzeitstag ruinieren',
    TIPS: (
      <>
        <li>
          <strong>Zu blass.</strong> Ein beiger QR-Code auf elfenbeinfarbenem Grund lässt sich
          in einem gedämpft beleuchteten Saal nicht scannen. Halten Sie einen deutlichen
          Unterschied zwischen der Farbe der Pixel und der des Hintergrunds ein: Das Tool
          warnt Sie, wenn der Unterschied zu gering wird.
        </li>
        <li>
          <strong>Zu klein.</strong> Unter 3 cm braucht ein Handy zehn Sekunden, um den Code
          zu erfassen, und Ihre Gäste geben vorher auf. Auf einem Poster, das aus der Ferne
          gescannt wird, planen Sie großzügig: mindestens 10 cm.
        </li>
        <li>
          <strong>Ohne Rand.</strong> Ein QR-Code direkt am Rand einer Karte oder auf einem
          unruhigen Foto wird für die Kamera unsichtbar. Er braucht rundherum eine ruhige
          Zone; sie ist in den hier heruntergeladenen Dateien enthalten, schneiden Sie sie
          nicht ab.
        </li>
      </>
    ),
    NOTE: (
      <>
        Ein letzter, besonders nützlicher Tipp: Drucken Sie <em>ein</em> Testposter und lassen
        Sie es von drei verschiedenen Handys scannen, darunter ein altes Android. Fünf
        Minuten, die Ihnen 150 unbrauchbare Karten ersparen.
      </>
    ),
    QUESTIONS: 'Häufige Fragen',
    CTA_H: 'Und hinter dem Poster: Ihre Fotos?',
    CTA_P: 'Jeder Gast wird zum Fotografen, mit einer begrenzten Anzahl an Aufnahmen. Kostenlos bis 5 Gäste, ohne Kreditkarte.',
    CTA_BTN: 'Mein Album erstellen',
  },
}

const textes = (lang) => TEXTES[lang] || TEXTES.fr

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
  return {
    title: T.TITRE_META,
    description: T.PROMESSE,
    keywords: T.KEYWORDS,
    alternates: alternates('/generateur-qr-code-mariage', lang),
    openGraph: {
      title: `${T.TITRE} | ${BRAND.name}`,
      description: T.PROMESSE,
      url: SITE_URL + lien('/generateur-qr-code-mariage', lang),
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function GenerateurPage({ params }) {
  const lang = await langueDeParams(params)
  const { TITRE, PROMESSE, ETAPES, USAGES, FAQ, ...T } = textes(lang)
  const URL = SITE_URL + lien('/generateur-qr-code-mariage', lang)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: TITRE,
        url: URL,
        description: PROMESSE,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        inLanguage: LOCALES[lang],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: { '@type': 'Organization', name: BRAND.name, url: 'https://timetoflash.fr' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
    ],
  }

  return (
    <div className="dj">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav large />

      <main aria-label={TITRE}>
        <div className="dj-wrap dj-head">
          <span className="dj-eyebrow">{T.EYEBROW}</span>
          <h1>{T.H1}</h1>
          <p>{PROMESSE}</p>
        </div>

        <div className="dj-wrap">
          <Generateur />
        </div>

        {/* ---------- Contenu ---------- */}
        <div className="dj-wrap qg-content">
          <section>
            <h2>{T.COMMENT}</h2>
            <div className="qg-etapes">
              {ETAPES.map((e) => (
                <div key={e.n} className="qg-etape">
                  <span>{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>{T.SIX}</h2>
            <div className="qg-uses">
              {USAGES.map((u) => (
                <div key={u.t} className="qg-use">
                  <h3>{u.t}</h3>
                  <p>{u.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>{T.ERREURS}</h2>
            <ol className="qg-tips">{T.TIPS}</ol>
            <p className="qg-note">{T.NOTE}</p>
          </section>

          <section>
            <h2>{T.QUESTIONS}</h2>
            <div className="qg-faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="dj-cta">
            <div>
              <h3>{T.CTA_H}</h3>
              <span>{T.CTA_P}</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href={lien('/create?tier=5', lang)}>{T.CTA_BTN}</Link>
          </div>
        </div>
      </main>

      <SitePied lang={lang} />
    </div>
  )
}
