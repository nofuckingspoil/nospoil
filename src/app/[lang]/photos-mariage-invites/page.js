// ============================================================
//  Page d'atterrissage publicitaire : angle « le photographe part à minuit ».
//
//  L'accueil parle à tous les événements et travaille pour Google ; celle-ci
//  ne parle qu'aux mariés, sans menu ni second geste, et n'existe que pour un
//  clic. Les briques communes vivent dans components/lp/Blocs.js : ici, seul
//  ce qui distingue cet angle.
//
//  Celle-ci reste indexable : son angle n'entre en concurrence avec aucun
//  article du journal. Ses deux sœurs, si.
//
//  Les textes vivent dans TEXTES, une version par langue. En anglais et en
//  allemand, le titre lu par Google reprend les mots que l'on tape dans ces
//  pays (« wedding guest photos », « Hochzeitsfotos Gäste »).
// ============================================================

import { BRAND } from '../../../lib/brand'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../../components/lp/Blocs'

const CHEMIN = '/photos-mariage-invites'

const TEXTES = {
  fr: {
    titre: "Les photos de mariage que votre photographe n'aura jamais",
    description:
      "Un QR code sur les tables, un nombre de clichés limité par invité, et toutes les photos de vos invités réunies le lendemain. Sans application. Gratuit jusqu'à 5 invités.",
    // Ce qui se perd aujourd'hui. Trois constats que tous les mariés reconnaissent.
    manque: [
      {
        ic: '🌙',
        t: 'Votre photographe part à minuit',
        s: "Et la fête, elle, continue jusqu'à cinq heures. Les meilleures photos de la soirée sont prises après son départ, par vos invités.",
      },
      {
        ic: '📱',
        t: 'Vos invités gardent tout',
        s: "Chacun repart avec quarante photos dans son téléphone. Vous n'en verrez qu'une poignée, celles que trois personnes auront pensé à vous envoyer.",
      },
      {
        ic: '💬',
        t: 'Les groupes WhatsApp se perdent',
        s: "Trois conversations différentes, des photos compressées, et plus rien de retrouvable six mois plus tard. Le lien Drive, personne ne l'a ouvert.",
      },
    ],
    faq: [
      {
        q: 'Ça remplace mon photographe ?',
        a: "Non, et ce n'est pas le but. Votre photographe fait les portraits, la cérémonie, les photos de groupe. Time to Flash capte ce qu'il ne voit pas : la table des cousins, le bar à deux heures du matin, les regards entre deux danses.",
      },
    ],
    eyebrow: 'Photos de mariage par vos invités',
    h1: <>Les photos que<br />votre photographe<br />n'aura jamais.</>,
    p1: "Celles de trois heures du matin. Celles de la table des cousins. Celles que vos invités ont vues, et pas lui.",
    p2: "Un QR code sur les tables, un nombre de clichés compté par personne, et tout qui se révèle le lendemain, dans un seul album.",
    ticks: ['Aucune application à installer', 'Prêt en deux minutes', 'Paiement unique, sans abonnement'],
    altAvant: "L'appareil photo jetable ouvert dans le navigateur d'un invité, pendant un mariage.",
    altArriere: "L'album du mariage révélé le lendemain : les photos de tous les invités réunies.",
    manqueTitre: 'Le lendemain, il vous manquera 700 photos',
    manqueSous: 'Vos invités en prendront des centaines. Vous en verrez une trentaine.',
    etapesTitre: "Trois gestes, et vous n'y pensez plus",
    etapesSous: "Vous préparez l'album avant le jour J. Le reste se fait tout seul.",
    ctaTitre: 'Votre mariage mérite plus que trente photos',
    ctaSous: "Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.",
  },
  en: {
    titre: 'Wedding guest photo app: the shots your photographer will never get',
    description:
      'A QR code on the tables, a limited number of shots per guest, and all your guests\' wedding photos in one album the next day. No app to install. Free for up to 5 guests.',
    manque: [
      {
        ic: '🌙',
        t: 'Your photographer leaves at midnight',
        s: 'But the party goes on until five. The best photos of the night are taken after they leave, by your guests.',
      },
      {
        ic: '📱',
        t: 'Your guests keep everything',
        s: "Everyone goes home with forty photos on their phone. You'll only ever see a handful: the ones three people remembered to send you.",
      },
      {
        ic: '💬',
        t: 'WhatsApp groups get lost',
        s: 'Three different chats, compressed photos, and nothing you can find six months later. As for the Drive link, nobody opened it.',
      },
    ],
    faq: [
      {
        q: 'Does it replace my photographer?',
        a: "No, and that's not the idea. Your photographer handles the portraits, the ceremony and the group shots. Time to Flash captures what they don't see: the cousins' table, the bar at two in the morning, the glances between two dances.",
      },
    ],
    eyebrow: 'Wedding photos taken by your guests',
    h1: <>The photos<br />your photographer<br />will never get.</>,
    p1: "The ones from three in the morning. The ones from the cousins' table. The ones your guests saw, and the photographer didn't.",
    p2: 'A QR code on the tables, a set number of shots per person, and everything revealed the next day, in a single album.',
    ticks: ['No app to install', 'Ready in two minutes', 'One-off payment, no subscription'],
    altAvant: "The disposable camera open in a guest's browser during a wedding.",
    altArriere: "The wedding album revealed the next day: every guest's photos in one place.",
    manqueTitre: "The next day, you'll be missing 700 photos",
    manqueSous: "Your guests will take hundreds. You'll see about thirty.",
    etapesTitre: 'Three steps, then you can forget about it',
    etapesSous: 'You set up the album before the big day. The rest takes care of itself.',
    ctaTitre: 'Your wedding deserves more than thirty photos',
    ctaSous: 'Create your album in two minutes. Free for up to 5 guests, no card needed.',
  },
  de: {
    titre: 'Hochzeitsfotos der Gäste: die Bilder, die Ihr Fotograf nie haben wird',
    description:
      'Ein QR-Code auf den Tischen, eine begrenzte Anzahl an Fotos pro Gast, und alle Hochzeitsfotos Ihrer Gäste am nächsten Tag in einem Album. Ohne App. Kostenlos bis 5 Gäste.',
    manque: [
      {
        ic: '🌙',
        t: 'Ihr Fotograf geht um Mitternacht',
        s: 'Die Feier aber geht bis fünf Uhr morgens weiter. Die besten Fotos des Abends entstehen, nachdem er gegangen ist, und zwar durch Ihre Gäste.',
      },
      {
        ic: '📱',
        t: 'Ihre Gäste behalten alles',
        s: 'Jeder geht mit vierzig Fotos auf dem Handy nach Hause. Sie sehen davon nur eine Handvoll: die, an die drei Leute gedacht haben.',
      },
      {
        ic: '💬',
        t: 'WhatsApp-Gruppen gehen unter',
        s: 'Drei verschiedene Chats, komprimierte Fotos, und sechs Monate später ist nichts mehr auffindbar. Den Drive-Link hat niemand geöffnet.',
      },
    ],
    faq: [
      {
        q: 'Ersetzt das meinen Fotografen?',
        a: 'Nein, und das ist auch nicht das Ziel. Ihr Fotograf macht die Porträts, die Trauung, die Gruppenfotos. Time to Flash hält fest, was er nicht sieht: den Tisch der Cousins, die Bar um zwei Uhr nachts, die Blicke zwischen zwei Tänzen.',
      },
    ],
    eyebrow: 'Hochzeitsfotos von Ihren Gästen',
    h1: <>Die Fotos, die<br />Ihr Fotograf<br />nie haben wird.</>,
    p1: 'Die von drei Uhr nachts. Die vom Tisch der Cousins. Die, die Ihre Gäste gesehen haben, und er nicht.',
    p2: 'Ein QR-Code auf den Tischen, eine feste Anzahl an Fotos pro Person, und alles wird am nächsten Tag enthüllt, in einem einzigen Album.',
    ticks: ['Keine App nötig', 'In zwei Minuten startklar', 'Einmalige Zahlung, kein Abo'],
    altAvant: 'Die Einwegkamera im Browser eines Gastes, während einer Hochzeit.',
    altArriere: 'Das Hochzeitsalbum, am nächsten Tag enthüllt: die Fotos aller Gäste an einem Ort.',
    manqueTitre: 'Am nächsten Tag fehlen Ihnen 700 Fotos',
    manqueSous: 'Ihre Gäste machen Hunderte. Sie sehen davon etwa dreißig.',
    etapesTitre: 'Drei Schritte, und Sie müssen nicht mehr daran denken',
    etapesSous: 'Sie bereiten das Album vor dem großen Tag vor. Der Rest läuft von allein.',
    ctaTitre: 'Ihre Hochzeit verdient mehr als dreißig Fotos',
    ctaSous: 'Erstellen Sie Ihr Album in zwei Minuten. Kostenlos bis 5 Gäste, ohne Kreditkarte.',
  },
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = TEXTES[lang]
  return {
    title: T.titre,
    description: T.description,
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
          <h2 className="section-title">{T.manqueTitre}</h2>
          <div className="section-sub">{T.manqueSous}</div>
          <div className="steps-grid">
            {T.manque.map((m, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{m.ic}</div>
                <h3>{m.t}</h3>
                <p>{m.s}</p>
              </div>
            ))}
          </div>
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
