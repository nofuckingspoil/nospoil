// ============================================================
//  Page d'atterrissage publicitaire : angle « le cadeau des témoins ».
//
//  Reprend l'angle du one-pager « spécial témoins & proches ». La cible n'est
//  pas la même que les autres pages : ce n'est pas quelqu'un qui organise son
//  mariage, c'est quelqu'un qui cherche quoi offrir. Il ne compare pas des
//  prestataires photo, il compare une enveloppe et une liste de mariage.
//
//  D'où deux différences de fond : le « vous » désigne celui qui offre et non
//  les mariés, et le prix devient un argument (on se cotise à trois) au lieu
//  d'une objection.
//
//  Indexable : aucun article du journal ne vise « cadeau de mariage ».
//  En anglais et en allemand, le titre vise « unique wedding gift » et
//  « Hochzeitsgeschenk Trauzeugen ».
// ============================================================

import { BRAND } from '../../../lib/brand'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import { prix } from '../../../lib/lp'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../../components/lp/Blocs'

const CHEMIN = '/cadeau-mariage-temoins'

function textes(lang) {
  const aPartirDe = prix(1499, lang)
  return {
    fr: {
      titre: 'Le cadeau de mariage auquel participent tous les invités',
      description:
        "Offrez aux mariés leur journée vue par ceux qui l'ont vécue avec eux. Un QR code le jour J, un album surprise qui se révèle après la fête. À partir de 14,99 €, à plusieurs si vous voulez.",
      // Pourquoi c'est le cadeau. Repris du one-pager, qui visait juste : on
      // n'attaque pas le prix des autres cadeaux, on attaque leur banalité.
      cadeau: [
        {
          ic: '🎁',
          t: 'Ça sort de la liste et de l\'enveloppe',
          s: "Le service à raclette, ils l'auront en double. Personne d'autre n'aura pensé à leur offrir leur propre mariage, raconté par leurs invités.",
        },
        {
          ic: '💞',
          t: 'Ils redécouvrent leur journée',
          s: "Un marié ne voit pas son mariage : il court. Là, il découvre enfin la table des cousins, le vin d'honneur d'en face, la piste de danse à deux heures.",
        },
        {
          ic: '🤫',
          t: 'Vous maîtrisez la surprise',
          s: "L'album reste scellé jusqu'à la date que vous fixez. Vous choisissez le moment où vous leur envoyez le lien, et vous voyez tout avant eux.",
        },
        {
          ic: '🤝',
          t: 'Facile à offrir à plusieurs',
          s: "Cotisez-vous entre témoins et proches. À deux ou trois, ça revient à cinq euros par personne pour un cadeau dont ils reparleront des années.",
        },
      ],
      faq: [
        {
          q: 'Les mariés ont-ils quelque chose à faire ?',
          a: "Rien du tout, et c'est le but. Vous créez l'album, vous partagez le QR code le jour J, et vous leur offrez le lien une fois tout révélé. Ils n'ont qu'à regarder.",
        },
        {
          q: 'Comment on se cotise à plusieurs ?',
          a: "Une seule personne règle et crée l'album, les autres remboursent leur part comme bon leur semble. Vous pouvez ensuite inviter les autres témoins comme co-organisateurs pour préparer et trier ensemble.",
        },
        {
          q: 'Et si je m\'y prends au dernier moment ?',
          a: "L'album se crée en deux minutes, et l'affiche à imprimer se génère dans la foulée. Vous pouvez très bien le mettre en place la veille, ou le matin même.",
        },
        {
          q: 'Qui garde les photos à la fin ?',
          a: "Les mariés, comme tout le monde : une fois l'album révélé, chacun peut le consulter et tout télécharger en pleine définition. Vous pouvez aussi leur transmettre l'accès organisateur pour qu'il devienne vraiment le leur.",
        },
      ],
      eyebrow: "L'idée cadeau · spécial témoins & proches",
      h1: <>Offrez-leur leur<br />mariage, vu par<br />ceux qui y étaient.</>,
      p1: 'Un QR code le jour J, quelques clichés par invité, et un album surprise qui se révèle après la fête.',
      p2: "Ils ont couru toute la journée. Offrez-leur ce qu'ils n'ont pas eu le temps de voir.",
      bouton: 'Préparer la surprise (gratuit)',
      ticks: ['Prêt en deux minutes', 'Aucune application, même pour mamie', 'À partir de 14,99 €, à plusieurs si vous voulez'],
      altAvant: "Le téléphone d'un invité transformé en appareil photo jetable pendant le mariage.",
      altArriere: "L'album offert aux mariés : les photos de tous leurs invités réunies.",
      cadeauTitre: "Pourquoi c'est LE cadeau",
      cadeauSous: 'Ils recevront des enveloppes et des articles de la liste. Un seul cadeau leur rendra leur journée.',
      etapesTitre: 'Vous préparez, ils découvrent',
      etapesSous: 'Tout se fait avant le jour J. Le jour même, vous n\'avez qu\'à partager le QR code.',
      ctaTitre: 'Préparez-leur la surprise',
      ctaSous: "Créez leur album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.",
      sticky: 'Préparer la surprise (gratuit) →',
    },
    en: {
      titre: 'A unique wedding gift every guest takes part in',
      description:
        `Give the couple their wedding day as seen by the people who lived it with them. A QR code on the day, a surprise album revealed after the party. From ${aPartirDe}, and easy to chip in together.`,
      cadeau: [
        {
          ic: '🎁',
          t: 'Better than the registry or an envelope',
          s: "They'll get two of the same toaster. Nobody else will think of giving them their own wedding, told by their guests.",
        },
        {
          ic: '💞',
          t: 'They get to relive their day',
          s: "Couples never really see their own wedding: they're rushing around all day. Now they finally get the cousins' table, the drinks reception from the other side, the dance floor at two in the morning.",
        },
        {
          ic: '🤫',
          t: 'You control the surprise',
          s: 'The album stays sealed until the date you set. You choose when to send them the link, and you see everything before they do.',
        },
        {
          ic: '🤝',
          t: 'Easy to give as a group',
          s: "Chip in with the rest of the wedding party and close friends. Split between two or three people, it comes to about five euros each for a gift they'll talk about for years.",
        },
      ],
      faq: [
        {
          q: 'Does the couple have to do anything?',
          a: "Nothing at all, and that's the point. You create the album, share the QR code on the day, and give them the link once everything is revealed. All they have to do is look.",
        },
        {
          q: 'How do we split the cost?',
          a: "One person pays and creates the album, and the others pay them back however suits them. You can then invite the rest of the wedding party as co-hosts to set things up and sort the photos together.",
        },
        {
          q: 'What if I leave it to the last minute?',
          a: 'The album takes two minutes to create, and the printable poster is generated straight away. You can easily set it up the day before, or even that morning.',
        },
        {
          q: 'Who keeps the photos at the end?',
          a: "The couple, like everyone else: once the album is revealed, anyone can view it and download everything in full resolution. You can also hand over the host access so it truly becomes theirs.",
        },
      ],
      eyebrow: 'Gift idea · for the best man, bridesmaids & close friends',
      h1: <>Give them their<br />wedding, seen by<br />everyone who was there.</>,
      p1: 'A QR code on the day, a few shots per guest, and a surprise album revealed after the party.',
      p2: "They've been rushing around all day. Give them what they didn't have time to see.",
      bouton: 'Plan the surprise (free)',
      ticks: ['Ready in two minutes', 'No app, even for grandma', `From ${aPartirDe}, easy to chip in together`],
      altAvant: "A guest's phone turned into a disposable camera during the wedding.",
      altArriere: "The album given to the couple: all their guests' photos in one place.",
      cadeauTitre: "Why it's THE gift",
      cadeauSous: "They'll get envelopes and things from the registry. Only one gift will give them back their day.",
      etapesTitre: 'You set it up, they discover it',
      etapesSous: 'Everything happens before the big day. On the day itself, all you do is share the QR code.',
      ctaTitre: 'Plan their surprise',
      ctaSous: 'Create their album in two minutes. Free for up to 5 guests, no card needed.',
      sticky: 'Plan the surprise (free) →',
    },
    de: {
      titre: 'Das Hochzeitsgeschenk der Trauzeugen, bei dem alle Gäste mitmachen',
      description:
        `Schenken Sie dem Brautpaar seinen Tag, gesehen von denen, die ihn mit ihm erlebt haben. Ein QR-Code am großen Tag, ein Überraschungsalbum, das nach der Feier enthüllt wird. Ab ${aPartirDe}, gern auch gemeinsam.`,
      cadeau: [
        {
          ic: '🎁',
          t: 'Mehr als Wunschliste und Umschlag',
          s: 'Das Raclette-Set bekommen sie doppelt. Niemand sonst kommt auf die Idee, ihnen ihre eigene Hochzeit zu schenken, erzählt von ihren Gästen.',
        },
        {
          ic: '💞',
          t: 'Sie erleben ihren Tag noch einmal',
          s: 'Ein Brautpaar sieht seine eigene Hochzeit nicht: Es ist den ganzen Tag unterwegs. Jetzt entdeckt es endlich den Tisch der Cousins, den Sektempfang aus der anderen Ecke, die Tanzfläche um zwei Uhr nachts.',
        },
        {
          ic: '🤫',
          t: 'Sie haben die Überraschung in der Hand',
          s: 'Das Album bleibt bis zu dem Datum versiegelt, das Sie festlegen. Sie bestimmen, wann Sie ihnen den Link schicken, und Sie sehen alles vor ihnen.',
        },
        {
          ic: '🤝',
          t: 'Leicht gemeinsam zu schenken',
          s: 'Legen Sie unter Trauzeugen und Freunden zusammen. Zu zweit oder zu dritt sind das rund fünf Euro pro Person für ein Geschenk, von dem sie noch jahrelang erzählen.',
        },
      ],
      faq: [
        {
          q: 'Muss das Brautpaar etwas tun?',
          a: 'Überhaupt nichts, und genau darum geht es. Sie erstellen das Album, teilen den QR-Code am großen Tag und schenken ihnen den Link, sobald alles enthüllt ist. Sie müssen nur noch schauen.',
        },
        {
          q: 'Wie legen wir zusammen?',
          a: 'Eine Person bezahlt und erstellt das Album, die anderen erstatten ihren Anteil, wie es ihnen passt. Danach können Sie die anderen Trauzeugen als Co-Gastgeber einladen, um gemeinsam vorzubereiten und auszuwählen.',
        },
        {
          q: 'Und wenn ich spät dran bin?',
          a: 'Das Album ist in zwei Minuten erstellt, und der Aufsteller zum Ausdrucken entsteht gleich mit. Sie können es problemlos am Vorabend einrichten, oder sogar am Morgen selbst.',
        },
        {
          q: 'Wer behält am Ende die Fotos?',
          a: 'Das Brautpaar, wie alle anderen auch: Sobald das Album enthüllt ist, kann jeder es ansehen und alles in voller Auflösung herunterladen. Sie können ihnen auch den Gastgeber-Zugang übergeben, damit es wirklich ihres wird.',
        },
      ],
      eyebrow: 'Geschenkidee · für Trauzeugen & Freunde',
      h1: <>Schenken Sie ihnen<br />ihre Hochzeit, gesehen<br />von allen Gästen.</>,
      p1: 'Ein QR-Code am großen Tag, ein paar Fotos pro Gast, und ein Überraschungsalbum, das nach der Feier enthüllt wird.',
      p2: 'Sie waren den ganzen Tag auf den Beinen. Schenken Sie ihnen, was sie nicht sehen konnten.',
      bouton: 'Überraschung vorbereiten (kostenlos)',
      ticks: ['In zwei Minuten startklar', 'Keine App, auch nicht für Oma', `Ab ${aPartirDe}, gern auch gemeinsam`],
      altAvant: 'Das Handy eines Gastes, verwandelt in eine Einwegkamera während der Hochzeit.',
      altArriere: 'Das Album für das Brautpaar: die Fotos aller Gäste an einem Ort.',
      cadeauTitre: 'Warum es DAS Geschenk ist',
      cadeauSous: 'Sie bekommen Umschläge und Dinge von der Wunschliste. Nur ein Geschenk gibt ihnen ihren Tag zurück.',
      etapesTitre: 'Sie bereiten vor, sie entdecken',
      etapesSous: 'Alles passiert vor dem großen Tag. Am Tag selbst teilen Sie nur noch den QR-Code.',
      ctaTitre: 'Bereiten Sie ihnen die Überraschung vor',
      ctaSous: 'Erstellen Sie ihr Album in zwei Minuten. Kostenlos bis 5 Gäste, ohne Kreditkarte.',
      sticky: 'Überraschung vorbereiten (kostenlos) →',
    },
  }[lang]
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
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
            <div className="hero-cta"><Bouton lang={lang}>{T.bouton}</Bouton></div>
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
          <h2 className="section-title">{T.cadeauTitre}</h2>
          <div className="section-sub">{T.cadeauSous}</div>
          <div className="steps-grid">
            {T.cadeau.map((c, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{c.ic}</div>
                <h3>{c.t}</h3>
                <p>{c.s}</p>
              </div>
            ))}
          </div>
          <div className="lp-mid-cta"><Bouton lang={lang}>{T.bouton}</Bouton></div>
        </section>

        <Etapes lang={lang} titre={T.etapesTitre} sousTitre={T.etapesSous} />
        <Retours lang={lang} />
        <Revelation lang={lang} cible="temoins" />
        <Pellicules lang={lang} />
        <Controle lang={lang} cible="temoins" />
        <Tarifs lang={lang} cible="temoins" />
        <Faq lang={lang} enPlus={T.faq} />
        <Confiance lang={lang} />
        <CtaFinal lang={lang} titre={T.ctaTitre} sous={T.ctaSous} />
      </main>

      <PiedLp lang={lang} />
      <Sticky lang={lang}>{T.sticky}</Sticky>
    </div>
  )
}
