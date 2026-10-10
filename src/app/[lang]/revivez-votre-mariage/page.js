// ============================================================
//  Page d'atterrissage publicitaire : angle « revivez votre mariage ».
//
//  Reprise du one-pager d'origine, et volontairement l'exact opposé de
//  /photos-mariage-invites : celle-ci promet quelque chose, l'autre constate
//  un manque. Même cible, même produit, même prix : seul le cadrage change.
//
//  C'est le test le plus classique en publicité, et le plus instructif :
//  selon l'audience, la promesse et le regret ne coûtent pas le même clic.
//  Comparer deux angles proches ne sert à rien s'ils ne diffèrent que par la
//  formulation ; ici ils diffèrent par ce qu'ils font ressentir.
//
//  Désindexée : elle vise les mêmes recherches que sa jumelle, déjà indexée.
//  Dans toutes les langues.
// ============================================================

import { BRAND } from '../../../lib/brand'
import { langueDeParams, localeOG } from '../../../lib/langue-lien'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../../components/lp/Blocs'

const TEXTES = {
  fr: {
    titre: 'Revivez votre mariage, sous un autre angle',
    description:
      "Les fous rires à table, la piste de danse, les moments volés. Vos invités scannent un QR code, photographient, et tout se développe à la date que vous choisissez, comme une vraie pellicule.",
    // Ce qu'on gagne, et non ce qu'on perd. La nuance porte toute la page :
    // les quatre points promettent, là où les autres angles alertent.
    adorer: [
      {
        ic: '💞',
        t: "Les moments que personne d'autre ne capte",
        s: "Votre journée vue de l'intérieur : les fous rires à table, la piste de danse à deux heures, les regards que le photographe n'était pas là pour voir.",
      },
      {
        ic: '👵',
        t: 'Même mamie y arrive',
        s: "On scanne, on photographie, c'est fini en cinq secondes. Aucune application, aucun compte, aucune explication à donner pendant le vin d'honneur.",
      },
      {
        ic: '🎞️',
        t: "L'effet pellicule à développer",
        s: "Rien n'apparaît avant l'heure que vous fixez. Le plaisir de tout découvrir d'un coup, ensemble, comme une pellicule qu'on va chercher au labo.",
      },
      {
        ic: '🎛️',
        t: 'Votre tableau de bord privé',
        s: "Le suivi des invités, la photo de couverture, le choix de la pellicule, et tout l'album en un fichier, d'un seul clic, quand vous voulez.",
      },
    ],
    faq: [
      {
        q: 'À quel moment faut-il le mettre en place ?',
        a: "Quand vous voulez, même la veille. L'album se crée en deux minutes et l'affiche à imprimer se génère dans la foulée. Beaucoup s'y prennent la semaine d'avant, le temps de faire imprimer les affiches tranquillement.",
      },
      {
        q: 'Ça marche aussi pour le brunch du lendemain ?',
        a: "Oui : vous choisissez la date de début et celle de la révélation. Une soirée, un week-end entier, ou du vin d'honneur au brunch : c'est le même album, et tout s'y ajoute.",
      },
    ],
    eyebrow: "L'appareil photo jetable · version mariage",
    h1: <>Revivez votre<br />mariage, sous un<br />autre angle.</>,
    p1: 'Les fous rires à table, la piste de danse, les moments volés. Vos invités scannent, photographient, et tout se développe à la date de révélation, comme une vraie pellicule.',
    p2: 'Un QR code sur chaque table, un nombre de clichés compté par invité, et un seul album à la fin.',
    ticks: ['Aucune application à installer', 'Prêt en deux minutes', 'Paiement unique, sans abonnement'],
    altAvant: "Le téléphone d'un invité transformé en appareil photo jetable pendant le mariage.",
    altArriere: "L'album du mariage révélé : les photos de tous les invités réunies.",
    adorerTitre: "Pourquoi vous allez l'adorer",
    adorerSous: "Votre mariage, raconté par les cent personnes qui l'ont vécu avec vous.",
    etapesTitre: 'Comment ça marche',
    etapesSous: "Vous préparez l'album avant le jour J. Le reste se fait tout seul.",
    ctaTitre: "Votre mariage vous attend, vu d'ailleurs",
    ctaSous: "Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.",
  },
  en: {
    titre: 'Relive your wedding from a new angle',
    description:
      'The laughter at the tables, the dance floor, the stolen moments. Your guests scan a QR code, take photos, and everything develops on the date you choose, just like a real roll of film.',
    adorer: [
      {
        ic: '💞',
        t: 'The moments nobody else captures',
        s: "Your day seen from the inside: the laughter at the tables, the dance floor at two in the morning, the glances the photographer wasn't there to see.",
      },
      {
        ic: '👵',
        t: 'Even grandma can do it',
        s: 'Scan, snap, done in five seconds. No app, no account, nothing to explain during the drinks reception.',
      },
      {
        ic: '🎞️',
        t: 'The thrill of developing film',
        s: 'Nothing appears before the time you set. The joy of discovering everything at once, together, like picking up a roll of film from the lab.',
      },
      {
        ic: '🎛️',
        t: 'Your private dashboard',
        s: 'Guest tracking, the cover photo, your choice of film style, and the whole album in one file, in one click, whenever you like.',
      },
    ],
    faq: [
      {
        q: 'When should I set it up?',
        a: 'Whenever you like, even the day before. The album takes two minutes to create and the printable poster is generated straight away. Many couples do it the week before, so they have time to get the posters printed without any rush.',
      },
      {
        q: 'Does it work for the brunch the day after too?',
        a: "Yes: you choose the start date and the reveal date. One evening, a whole weekend, or from the drinks reception to the brunch: it's the same album, and everything gets added to it.",
      },
    ],
    eyebrow: 'The disposable camera · wedding edition',
    h1: <>Relive your<br />wedding from a<br />new angle.</>,
    p1: 'The laughter at the tables, the dance floor, the stolen moments. Your guests scan, take photos, and everything develops on the reveal date, just like a real roll of film.',
    p2: 'A QR code on every table, a set number of shots per guest, and a single album at the end.',
    ticks: ['No app to install', 'Ready in two minutes', 'One-off payment, no subscription'],
    altAvant: "A guest's phone turned into a disposable camera during the wedding.",
    altArriere: "The revealed wedding album: every guest's photos in one place.",
    adorerTitre: "Why you'll love it",
    adorerSous: 'Your wedding, told by the hundred people who lived it with you.',
    etapesTitre: 'How it works',
    etapesSous: 'You set up the album before the big day. The rest takes care of itself.',
    ctaTitre: 'Your wedding is waiting for you, seen from a new angle',
    ctaSous: 'Create your album in two minutes. Free for up to 5 guests, no card needed.',
  },
  de: {
    titre: 'Erleben Sie Ihre Hochzeit noch einmal, aus einem neuen Blickwinkel',
    description:
      'Das Lachen an den Tischen, die Tanzfläche, die heimlichen Momente. Ihre Gäste scannen einen QR-Code, fotografieren, und alles wird an dem Datum entwickelt, das Sie wählen, wie ein echter Film.',
    adorer: [
      {
        ic: '💞',
        t: 'Die Momente, die sonst niemand festhält',
        s: 'Ihr Tag, von innen gesehen: das Lachen an den Tischen, die Tanzfläche um zwei Uhr nachts, die Blicke, für die der Fotograf nicht da war.',
      },
      {
        ic: '👵',
        t: 'Sogar Oma schafft das',
        s: 'Scannen, fotografieren, in fünf Sekunden erledigt. Keine App, kein Konto, nichts zu erklären während des Sektempfangs.',
      },
      {
        ic: '🎞️',
        t: 'Der Reiz des Filmentwickelns',
        s: 'Nichts erscheint vor der Uhrzeit, die Sie festlegen. Die Freude, alles auf einmal zu entdecken, gemeinsam, wie ein Film, den man im Labor abholt.',
      },
      {
        ic: '🎛️',
        t: 'Ihr privates Dashboard',
        s: 'Die Übersicht über die Gäste, das Titelbild, die Wahl des Filmlooks, und das ganze Album in einer Datei, mit einem Klick, wann Sie wollen.',
      },
    ],
    faq: [
      {
        q: 'Wann sollte ich es einrichten?',
        a: 'Wann Sie möchten, sogar am Vorabend. Das Album ist in zwei Minuten erstellt, und der Aufsteller zum Ausdrucken entsteht gleich mit. Viele richten es eine Woche vorher ein, um die Aufsteller in Ruhe drucken zu lassen.',
      },
      {
        q: 'Funktioniert das auch für den Brunch am nächsten Tag?',
        a: 'Ja: Sie wählen das Startdatum und den Präsentationstermin. Ein Abend, ein ganzes Wochenende oder vom Sektempfang bis zum Brunch: Es ist dasselbe Album, und alles kommt dazu.',
      },
    ],
    eyebrow: 'Die digitale Einwegkamera · Hochzeitsedition',
    h1: <>Erleben Sie Ihre<br />Hochzeit aus einem<br />neuen Blickwinkel.</>,
    p1: 'Das Lachen an den Tischen, die Tanzfläche, die heimlichen Momente. Ihre Gäste scannen, fotografieren, und alles wird am Tag der Präsentation entwickelt, wie ein echter Film.',
    p2: 'Ein QR-Code auf jedem Tisch, eine feste Anzahl an Fotos pro Gast, und am Ende ein einziges Album.',
    ticks: ['Keine App nötig', 'In zwei Minuten startklar', 'Einmalige Zahlung, kein Abo'],
    altAvant: 'Das Handy eines Gastes, verwandelt in eine Einwegkamera während der Hochzeit.',
    altArriere: 'Das Hochzeitsalbum nach der Präsentation: die Fotos aller Gäste an einem Ort.',
    adorerTitre: 'Warum Sie es lieben werden',
    adorerSous: 'Ihre Hochzeit, erzählt von den hundert Menschen, die sie mit Ihnen erlebt haben.',
    etapesTitre: "So funktioniert's",
    etapesSous: 'Sie bereiten das Album vor dem großen Tag vor. Der Rest läuft von allein.',
    ctaTitre: 'Ihre Hochzeit wartet auf Sie, aus einem neuen Blickwinkel',
    ctaSous: 'Erstellen Sie Ihr Album in zwei Minuten. Kostenlos bis 5 Gäste, ohne Kreditkarte.',
  },
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = TEXTES[lang]
  return {
    title: T.titre,
    description: T.description,
    // Variante publicitaire d'une page déjà indexée : on ne se dédouble pas.
    robots: { index: false, follow: true },
    openGraph: {
      title: `${T.titre} | ${BRAND.name}`,
      description: T.description,
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function Page({ params }) {
  const lang = await langueDeParams(params)
  const T = TEXTES[lang]
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
          <h2 className="section-title">{T.adorerTitre}</h2>
          <div className="section-sub">{T.adorerSous}</div>
          <div className="steps-grid">
            {T.adorer.map((a, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{a.ic}</div>
                <h3>{a.t}</h3>
                <p>{a.s}</p>
              </div>
            ))}
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
