// ============================================================
//  Page d'atterrissage publicitaire : angle « plutôt qu'un photobooth ».
//
//  L'angle attaque une dépense déjà budgétée. Quelqu'un qui cherche un
//  photobooth a admis le principe (des photos par les invités) et le prix
//  (quelques centaines d'euros) : il ne reste qu'à montrer que la borne est
//  la mauvaise façon d'obtenir ce qu'il veut.
//
//  Désindexée volontairement : le journal a déjà deux articles sur ces mots
//  (/journal/alternative-photobooth-mariage, /journal/prix-photobooth-mariage)
//  et deux pages du même site sur la même recherche se nuisent.
//
//  En anglais et en allemand, le titre vise « wedding photo booth
//  alternative » et « Fotobox Hochzeit Alternative ».
// ============================================================

import { BRAND } from '../../../lib/brand'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import { prix } from '../../../lib/lp'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../../components/lp/Blocs'

const CHEMIN = '/photobooth-mariage'

function textes(lang) {
  const p = prix(1499, lang)
  return {
    fr: {
      titre: 'Le photobooth de votre mariage coûte 500 €. Le nôtre, 14,99 €',
      description:
        "Plutôt qu'une borne dans un coin de la salle, un QR code sur les tables : chaque invité devient le photobooth, partout et toute la nuit. Sans application, sans matériel.",
      // Ce qu'on reproche vraiment à une borne. Non pas son prix seul, mais le
      // fait qu'elle concentre en un point ce qui devrait être partout.
      borne: [
        {
          ic: '📍',
          t: "Elle ne voit qu'un mètre carré",
          s: "La borne est dans un coin. Le vin d'honneur est dehors, la table des cousins est à l'autre bout, et la piste de danse ne viendra pas à elle.",
        },
        {
          ic: '⏰',
          t: 'Elle vit deux heures',
          s: "La queue au début, puis plus personne. À une heure du matin, quand la fête commence vraiment, la borne clignote toute seule.",
        },
        {
          ic: '🚚',
          t: 'Il faut la faire venir',
          s: "Livraison, installation, place à prévoir, reprise le lendemain. Un prestataire de plus à coordonner le jour où vous avez le moins de temps.",
        },
      ],
      eux: [
        '400 à 800 € la soirée',
        'Un coin de la salle immobilisé',
        'La queue, puis plus personne après 1 h',
        'Les photos d\'un seul endroit',
        'À installer, à rendre',
        'Des tirages qui se perdent',
      ],
      nous: [
        `À partir de ${p}, une seule fois`,
        'Rien à poser, sinon une affiche',
        'Dans toutes les poches, toute la nuit',
        'Les photos de partout à la fois',
        'Prêt en deux minutes',
        'Tout téléchargeable en pleine définition',
      ],
      faq: [
        {
          q: 'Un photobooth, ce n\'est pas plus amusant sur le moment ?',
          a: "La borne fait rire ceux qui font la queue devant. Ici, l'amusement se déplace : chacun photographie sa table, ses amis, le marié qui n'a rien vu venir. Et la surprise du lendemain, quand tout se révèle d'un coup, aucune borne ne la produit.",
        },
        {
          q: 'Et les accessoires, les tirages papier ?',
          a: "Nous ne fournissons ni perruques ni imprimante. En revanche vous récupérez tous les fichiers en pleine définition : de quoi faire tirer un album, un livre photo ou les quelques clichés que vous voudrez encadrer, pour bien moins que la location d'une borne.",
        },
      ],
      eyebrow: 'Alternative au photobooth · mariage',
      h1: <>Un photobooth coûte<br />500 €. Le nôtre,<br />{p}.</>,
      p1: "Et il n'occupe aucun coin de la salle : chacun de vos invités devient le photobooth, partout et toute la nuit.",
      p2: 'Un QR code sur les tables, un nombre de clichés compté par personne, et tout qui se révèle le lendemain, dans un seul album.',
      ticks: ['Aucun matériel à louer', 'Aucune application à installer', 'Paiement unique, sans abonnement'],
      altAvant: "Le téléphone d'un invité servant d'appareil photo : viseur, compteur de poses et déclencheur.",
      altArriere: "L'album du mariage révélé le lendemain : les photos de tous les invités réunies.",
      borneTitre: "Le problème d'une borne, ce n'est pas son prix",
      borneSous: "C'est qu'elle concentre en un point ce qui devrait être partout.",
      compTitre: 'Point par point',
      compSous: 'Le même besoin (des photos prises par ceux qui étaient là) traité de deux façons.',
      colEux: 'Un photobooth loué',
      etapesTitre: 'Rien à installer, rien à rendre',
      etapesSous: 'Une affiche sur les tables remplace la borne, le technicien et le camion.',
      ctaTitre: 'Gardez les 500 € pour le champagne',
      ctaSous: "Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.",
    },
    en: {
      titre: `Wedding photo booth alternative: theirs costs €500, ours ${p}`,
      description:
        "Instead of a booth stuck in a corner of the venue, a QR code on the tables: every guest becomes the photo booth, everywhere and all night long. No app, no equipment.",
      borne: [
        {
          ic: '📍',
          t: 'It only sees one square metre',
          s: "The booth sits in a corner. The drinks reception is outside, the cousins' table is at the far end, and the dance floor won't come to it.",
        },
        {
          ic: '⏰',
          t: 'It lasts two hours',
          s: 'A queue at the start, then nobody. At one in the morning, when the party really gets going, the booth is flashing away on its own.',
        },
        {
          ic: '🚚',
          t: 'It has to be brought in',
          s: 'Delivery, set-up, space to find, collection the next day. One more supplier to coordinate on the day you have the least time.',
        },
      ],
      eux: [
        '€400 to €800 for the evening',
        'A corner of the venue taken up',
        'A queue, then nobody after 1 am',
        'Photos from one spot only',
        'To set up and send back',
        'Prints that get lost',
      ],
      nous: [
        `From ${p}, paid once`,
        'Nothing to set up except a poster',
        'In every pocket, all night long',
        'Photos from everywhere at once',
        'Ready in two minutes',
        'Everything downloadable in full resolution',
      ],
      faq: [
        {
          q: "Isn't a photo booth more fun in the moment?",
          a: "A booth makes the people queuing in front of it laugh. Here, the fun moves around: everyone photographs their table, their friends, the groom who never saw it coming. And the surprise the next day, when everything is revealed at once, is something no booth can give you.",
        },
        {
          q: 'What about props and printed photos?',
          a: "We don't supply wigs or a printer. But you get every file in full resolution: enough to print an album, a photo book or the few shots you want to frame, for far less than renting a booth.",
        },
      ],
      eyebrow: 'Photo booth alternative · wedding',
      h1: <>A photo booth costs<br />€500. Ours costs<br />{p}.</>,
      p1: "And it doesn't take up a corner of the venue: every one of your guests becomes the photo booth, everywhere and all night long.",
      p2: 'A QR code on the tables, a set number of shots per person, and everything revealed the next day, in a single album.',
      ticks: ['No equipment to rent', 'No app to install', 'One-off payment, no subscription'],
      altAvant: "A guest's phone used as a camera: viewfinder, shot counter and shutter button.",
      altArriere: "The wedding album revealed the next day: every guest's photos in one place.",
      borneTitre: "The problem with a photo booth isn't its price",
      borneSous: "It's that it squeezes into one spot what should be everywhere.",
      compTitre: 'Side by side',
      compSous: 'The same need (photos taken by the people who were there) met in two different ways.',
      colEux: 'A rented photo booth',
      etapesTitre: 'Nothing to set up, nothing to return',
      etapesSous: 'A poster on the tables replaces the booth, the technician and the van.',
      ctaTitre: 'Keep the €500 for the champagne',
      ctaSous: 'Create your album in two minutes. Free for up to 5 guests, no card needed.',
    },
    de: {
      titre: `Fotobox Hochzeit Alternative: Eine Fotobox kostet 500 €, unsere ${p}`,
      description:
        'Statt einer Fotobox in der Ecke des Saals ein QR-Code auf den Tischen: Jeder Gast wird zur Fotobox, überall und die ganze Nacht. Ohne App, ohne Technik.',
      borne: [
        {
          ic: '📍',
          t: 'Sie sieht nur einen Quadratmeter',
          s: 'Die Fotobox steht in einer Ecke. Der Sektempfang ist draußen, der Tisch der Cousins am anderen Ende, und die Tanzfläche kommt nicht zu ihr.',
        },
        {
          ic: '⏰',
          t: 'Sie lebt zwei Stunden',
          s: 'Am Anfang eine Schlange, dann niemand mehr. Um ein Uhr nachts, wenn die Feier richtig losgeht, blinkt die Fotobox ganz allein vor sich hin.',
        },
        {
          ic: '🚚',
          t: 'Sie muss geliefert werden',
          s: 'Lieferung, Aufbau, Platz einplanen, Abholung am nächsten Tag. Ein Dienstleister mehr, den Sie ausgerechnet an dem Tag koordinieren müssen, an dem Sie am wenigsten Zeit haben.',
        },
      ],
      eux: [
        '400 bis 800 € pro Abend',
        'Eine Ecke des Saals blockiert',
        'Erst eine Schlange, nach 1 Uhr niemand mehr',
        'Fotos von nur einem Ort',
        'Aufbauen, zurückgeben',
        'Ausdrucke, die verloren gehen',
      ],
      nous: [
        `Ab ${p}, einmalig`,
        'Nichts aufzustellen außer einem Aufsteller',
        'In jeder Tasche, die ganze Nacht',
        'Fotos von überall gleichzeitig',
        'In zwei Minuten startklar',
        'Alles in voller Auflösung herunterladbar',
      ],
      faq: [
        {
          q: 'Ist eine Fotobox im Moment nicht lustiger?',
          a: 'Die Fotobox bringt die zum Lachen, die davor Schlange stehen. Hier verlagert sich der Spaß: Jeder fotografiert seinen Tisch, seine Freunde, den Bräutigam, der nichts kommen sah. Und die Überraschung am nächsten Tag, wenn alles auf einmal enthüllt wird, schafft keine Fotobox.',
        },
        {
          q: 'Und die Requisiten, die Fotoabzüge?',
          a: 'Wir liefern weder Perücken noch Drucker. Dafür erhalten Sie alle Dateien in voller Auflösung: genug, um ein Album, ein Fotobuch oder die paar Aufnahmen drucken zu lassen, die Sie rahmen möchten, für deutlich weniger als die Miete einer Fotobox.',
        },
      ],
      eyebrow: 'Fotobox-Alternative · Hochzeit',
      h1: <>Eine Fotobox kostet<br />500 €. Unsere<br />{p}.</>,
      p1: 'Und sie besetzt keine Ecke im Saal: Jeder Ihrer Gäste wird zur Fotobox, überall und die ganze Nacht.',
      p2: 'Ein QR-Code auf den Tischen, eine feste Anzahl an Fotos pro Person, und alles wird am nächsten Tag enthüllt, in einem einzigen Album.',
      ticks: ['Keine Technik zu mieten', 'Keine App nötig', 'Einmalige Zahlung, kein Abo'],
      altAvant: 'Das Handy eines Gastes als Kamera: Sucher, Bildzähler und Auslöser.',
      altArriere: 'Das Hochzeitsalbum, am nächsten Tag enthüllt: die Fotos aller Gäste an einem Ort.',
      borneTitre: 'Das Problem einer Fotobox ist nicht ihr Preis',
      borneSous: 'Sondern dass sie an einem Punkt bündelt, was überall sein sollte.',
      compTitre: 'Punkt für Punkt',
      compSous: 'Dasselbe Bedürfnis (Fotos von denen, die dabei waren) auf zwei Arten gelöst.',
      colEux: 'Eine gemietete Fotobox',
      etapesTitre: 'Nichts aufbauen, nichts zurückgeben',
      etapesSous: 'Ein Aufsteller auf den Tischen ersetzt die Fotobox, den Techniker und den Lieferwagen.',
      ctaTitre: 'Behalten Sie die 500 € für den Champagner',
      ctaSous: 'Erstellen Sie Ihr Album in zwei Minuten. Kostenlos bis 5 Gäste, ohne Kreditkarte.',
    },
  }[lang]
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
  return {
    title: T.titre,
    description: T.description,
    // Indexable depuis le 07/08/2026 : « photobooth mariage » se cherche assez
    // pour valoir la concurrence avec l'article du journal sur le même sujet.
    // Sa propre adresse canonique : sans elle, la page héritait de l'accueil.
    alternates: alternates(CHEMIN, lang),
    openGraph: {
      title: `${T.titre} | ${BRAND.name}`,
      description: T.description,
      url: `${SITE_URL}${lien(CHEMIN, lang)}`,
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function Page({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
  return (
    <div className="site lp">
      <Entete lang={lang} />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">{T.eyebrow}</div>
            <h1>{T.h1}</h1>
            <p>{T.p1}</p>
            <p style={{ marginTop: 10 }}>{T.p2}</p>
            <div className="hero-cta"><Bouton lang={lang} /></div>
            <ul className="lp-ticks">
              {T.ticks.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385" alt={T.altAvant} />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385" alt={T.altArriere} />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{T.borneTitre}</h2>
          <div className="section-sub">{T.borneSous}</div>
          <div className="steps-grid">
            {T.borne.map((b, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{b.ic}</div>
                <h3>{b.t}</h3>
                <p>{b.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{T.compTitre}</h2>
          <div className="section-sub">{T.compSous}</div>
          <div className="lp-compare">
            <div className="lp-col">
              <div className="lp-col-h">{T.colEux}</div>
              <ul>
                {T.eux.map((l, i) => <li key={i}><span>✕</span> {l}</li>)}
              </ul>
            </div>
            <div className="lp-col lp-col-nous">
              <div className="lp-col-h">{BRAND.name}</div>
              <ul>
                {T.nous.map((l, i) => <li key={i}><span>✓</span> {l}</li>)}
              </ul>
            </div>
          </div>
          <div className="lp-mid-cta"><Bouton lang={lang} /></div>
        </section>

        <Etapes lang={lang} titre={T.etapesTitre} sousTitre={T.etapesSous} />
        <Retours lang={lang} />
        <Revelation lang={lang} />
        <Pellicules lang={lang} />
        <Controle lang={lang} />
        <Tarifs lang={lang} />
        <Faq lang={lang} enPlus={T.faq} />
        <Confiance lang={lang} />
        <CtaFinal lang={lang} titre={T.ctaTitre} sous={T.ctaSous} />
      </main>

      <PiedLp lang={lang} />
      <Sticky lang={lang} />
    </div>
  )
}
