// ============================================================
//  Page d'atterrissage publicitaire : angle « le téléphone devient jetable ».
//
//  L'angle ne vend pas un service photo, il vend une transformation : les
//  cent téléphones déjà dans les poches de vos invités deviennent cent
//  appareils jetables. Rien à louer, rien à distribuer, rien à ramasser.
//
//  Indexable depuis le 07/08/2026, et reliée au reste du site depuis le
//  03/10/2026 (pied de page, articles du journal, accueil) : sans publicité
//  en cours, c'est Google qui doit lui amener ses visiteurs.
//
//  En anglais et en allemand, le titre vise « wedding disposable camera app »
//  et « Einwegkamera Hochzeit App ».
// ============================================================

import { BRAND } from '../../../lib/brand'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import { prix } from '../../../lib/lp'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../../components/lp/Blocs'

const CHEMIN = '/appareil-jetable-mariage'

function textes(lang) {
  const p = prix(1499, lang)
  return {
    fr: {
      titre: 'Transformez les téléphones de vos invités en appareils jetables',
      description:
        "Un QR code, et chaque téléphone devient un jetable : un nombre de photos compté, aucun aperçu, tout se développe le lendemain. Sans application. Gratuit jusqu'à 5 invités.",
      // Ce que le jetable faisait, et que le téléphone a fait disparaître. C'est
      // exactement ce que la contrainte réinstalle.
      jetable: [
        {
          ic: '🎞️',
          t: 'Un nombre de poses compté',
          s: "Dix photos, pas trois cents. On regarde avant de déclencher, on attend le bon moment. C'est la rareté qui faisait la valeur d'une photo de jetable.",
        },
        {
          ic: '🙈',
          t: 'Aucun aperçu, aucun tri',
          s: "Personne ne revoit son cliché pour le refaire en mieux. Ce qui est pris est pris, avec les yeux fermés, le flou et le fou rire.",
        },
        {
          ic: '🌅',
          t: 'On développe le lendemain',
          s: "L'album reste scellé jusqu'à l'heure que vous fixez. L'attente fait partie du plaisir, exactement comme quand on rapportait la pellicule au labo.",
        },
      ],
      // Le vrai jetable posé sur les tables est la solution que beaucoup
      // envisagent avant nous. Elle a un charme réel, et une addition qu'on
      // découvre tard : l'appareil, puis le développement, puis la
      // numérisation, à multiplier par le nombre de tables, et à ramasser un
      // par un le lendemain.
      eux: [
        "12 à 18 € l'appareil, autant pour le développement",
        'À acheter, à poser, puis à récupérer un par un',
        '27 poses pour une table entière',
        'Deux semaines avant de voir quoi que ce soit',
        'Les ratés se paient au même prix',
        'Un appareil oublié, ce sont ses photos perdues',
      ],
      nous: [
        `${p} pour tout le mariage, développement compris`,
        'Rien à acheter, rien à ramasser',
        'Le nombre de poses que vous fixez, pour chacun',
        "L'album s'ouvre le lendemain",
        'Une photo ratée se reprend sans en perdre une',
        'Chaque cliché est à l\'abri dès le déclenchement',
      ],
      faq: [
        {
          q: 'Les photos ressemblent vraiment à du jetable ?',
          a: "Oui, si vous le voulez. L'album propose cinq ambiances, dont une « Jetable » bien chaude et grainée, avec la petite date orange dans le coin. Et ce n'est pas qu'à l'écran : l'effet reste sur vos photos une fois enregistrées sur votre téléphone.",
        },
        {
          q: 'Pourquoi pas de vrais appareils jetables ?',
          a: "Comptez 12 à 15 € l'appareil, plus le développement. Pour cinquante invités, on dépasse vite les 800 €, il faut les distribuer, les récupérer, et espérer qu'aucun ne finisse dans une poche de veste. Ici, l'appareil est déjà dans leur main.",
        },
      ],
      eyebrow: 'Appareil photo jetable · mariage',
      h1: <>Transformez les<br />téléphones de vos<br />invités en jetables.</>,
      p1: 'Un nombre de photos compté. Aucun aperçu, aucun tri. Et tout qui se développe le lendemain, dans un seul album.',
      p2: "Cent appareils photo sont déjà dans les poches de vos invités. Il ne leur manquait qu'une pellicule.",
      ticks: ['Rien à louer, rien à ramasser', 'Aucune application à installer', "Vraie pellicule Jetable à l'export"],
      altAvant: "Le téléphone d'un invité transformé en appareil jetable : viseur, compteur de poses et déclencheur.",
      altArriere: "L'album développé le lendemain : les photos de tous les invités réunies.",
      jetableTitre: 'Ce qui rendait un jetable irremplaçable',
      jetableSous: "Ce n'est pas la qualité d'image. C'est la contrainte, et elle se remet.",
      vraiTitre: 'Et de vrais jetables sur les tables ?',
      vraiSous: "L'idée est belle. C'est l'addition, et le lendemain, qui déçoivent.",
      colEux: 'Dix jetables achetés',
      calcul: 'Dix appareils pour cinquante invités : entre 240 et 360 €, et 270 poses en tout.',
      etapesTitre: 'Une affiche, un scan, une pellicule',
      etapesSous: "Vos invités n'ont rien à installer ni à comprendre. Ils scannent, ils déclenchent.",
      ctaTitre: 'Donnez une pellicule à chacun de vos invités',
      ctaSous: "Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.",
    },
    en: {
      titre: "Wedding disposable camera app: turn your guests' phones into disposables",
      description:
        'One QR code and every phone becomes a disposable camera: a limited number of shots, no preview, everything develops the next day. No app to install. Free for up to 5 guests.',
      jetable: [
        {
          ic: '🎞️',
          t: 'A limited number of shots',
          s: "Ten photos, not three hundred. You look before you press the button, you wait for the right moment. Scarcity is what made a disposable camera photo precious.",
        },
        {
          ic: '🙈',
          t: 'No preview, no deleting the bad ones',
          s: "Nobody checks their shot to take a better one. What's taken is taken: closed eyes, blur, fits of laughter and all.",
        },
        {
          ic: '🌅',
          t: 'Developed the next day',
          s: 'The album stays sealed until the time you set. The wait is part of the fun, just like dropping a roll of film off at the lab.',
        },
      ],
      eux: [
        '€12 to €18 per camera, and the same again for developing',
        'To buy, hand out, then collect one by one',
        '27 shots for a whole table',
        'Two weeks before you see anything',
        'Bad shots cost just as much',
        'A forgotten camera means all its photos are lost',
      ],
      nous: [
        `${p} for the whole wedding, developing included`,
        'Nothing to buy, nothing to collect',
        'The number of shots you choose, for every guest',
        'The album opens the next day',
        'A bad shot can be retaken without losing one',
        'Every shot is safe the moment it is taken',
      ],
      faq: [
        {
          q: 'Do the photos really look like a disposable camera?',
          a: "Yes, if you want them to. The album offers five film styles, including a warm, grainy “Disposable” look with the little orange date in the corner. And it's not just on screen: the effect stays on your photos once they're saved to your phone.",
        },
        {
          q: 'Why not real disposable cameras?',
          a: "Expect €12 to €15 per camera, plus developing. For fifty guests you quickly go over €800, and you have to hand them out, collect them and hope none end up in a jacket pocket. Here, the camera is already in their hand.",
        },
      ],
      eyebrow: 'Disposable camera · wedding',
      h1: <>Turn your<br />guests' phones into<br />disposable cameras.</>,
      p1: 'A limited number of shots. No preview, no deleting. And everything develops the next day, in a single album.',
      p2: "A hundred cameras are already in your guests' pockets. All they were missing was a roll of film.",
      ticks: ['Nothing to rent, nothing to collect', 'No app to install', 'A real Disposable film look on download'],
      altAvant: "A guest's phone turned into a disposable camera: viewfinder, shot counter and shutter button.",
      altArriere: "The album developed the next day: every guest's photos in one place.",
      jetableTitre: 'What made a disposable camera irreplaceable',
      jetableSous: "It's not the image quality. It's the limit, and it's back.",
      vraiTitre: 'What about real disposables on the tables?',
      vraiSous: "It's a lovely idea. It's the bill, and the day after, that disappoint.",
      colEux: 'Ten disposables bought',
      calcul: 'Ten cameras for fifty guests: between €240 and €360, and 270 shots in total.',
      etapesTitre: 'A poster, a scan, a roll of film',
      etapesSous: 'Your guests have nothing to install or figure out. They scan, they shoot.',
      ctaTitre: 'Give each of your guests a roll of film',
      ctaSous: 'Create your album in two minutes. Free for up to 5 guests, no card needed.',
    },
    de: {
      titre: 'Einwegkamera Hochzeit als App: die Handys Ihrer Gäste werden zu Einwegkameras',
      description:
        'Ein QR-Code, und jedes Handy wird zur Einwegkamera: eine begrenzte Anzahl an Fotos, keine Vorschau, alles wird am nächsten Tag entwickelt. Ohne App. Kostenlos bis 5 Gäste.',
      jetable: [
        {
          ic: '🎞️',
          t: 'Eine begrenzte Anzahl an Bildern',
          s: 'Zehn Fotos, nicht dreihundert. Man schaut hin, bevor man auslöst, man wartet auf den richtigen Moment. Gerade die Knappheit machte ein Foto aus der Einwegkamera wertvoll.',
        },
        {
          ic: '🙈',
          t: 'Keine Vorschau, kein Aussortieren',
          s: 'Niemand schaut sich sein Foto an, um es besser zu wiederholen. Was aufgenommen ist, bleibt: mit geschlossenen Augen, Unschärfe und Lachanfall.',
        },
        {
          ic: '🌅',
          t: 'Entwickelt wird am nächsten Tag',
          s: 'Das Album bleibt bis zu der Uhrzeit versiegelt, die Sie festlegen. Das Warten gehört zum Vergnügen, genau wie damals, als man den Film ins Labor brachte.',
        },
      ],
      eux: [
        '12 bis 18 € pro Kamera, dasselbe noch einmal fürs Entwickeln',
        'Kaufen, verteilen und einzeln wieder einsammeln',
        '27 Bilder für einen ganzen Tisch',
        'Zwei Wochen, bevor man irgendetwas sieht',
        'Missglückte Fotos kosten genauso viel',
        'Eine vergessene Kamera, und ihre Fotos sind verloren',
      ],
      nous: [
        `${p} für die ganze Hochzeit, Entwicklung inklusive`,
        'Nichts kaufen, nichts einsammeln',
        'Die Anzahl an Bildern, die Sie festlegen, für jeden Gast',
        'Das Album öffnet sich am nächsten Tag',
        'Ein missglücktes Foto lässt sich wiederholen, ohne eines zu verlieren',
        'Jede Aufnahme ist ab dem Auslösen sicher gespeichert',
      ],
      faq: [
        {
          q: 'Sehen die Fotos wirklich aus wie von einer Einwegkamera?',
          a: 'Ja, wenn Sie das möchten. Das Album bietet fünf Filmlooks, darunter einen warmen, körnigen Look „Einweg“ mit dem kleinen orangefarbenen Datum in der Ecke. Und das nicht nur auf dem Bildschirm: Der Effekt bleibt auf Ihren Fotos, wenn Sie sie auf Ihrem Handy speichern.',
        },
        {
          q: 'Warum keine echten Einwegkameras?',
          a: 'Rechnen Sie mit 12 bis 15 € pro Kamera, plus Entwicklung. Bei fünfzig Gästen sind schnell über 800 € erreicht, und man muss sie verteilen, wieder einsammeln und hoffen, dass keine in einer Jackentasche verschwindet. Hier ist die Kamera schon in ihrer Hand.',
        },
      ],
      eyebrow: 'Digitale Einwegkamera · Hochzeit',
      h1: <>Machen Sie die<br />Handys Ihrer Gäste<br />zu Einwegkameras.</>,
      p1: 'Eine begrenzte Anzahl an Fotos. Keine Vorschau, kein Aussortieren. Und alles wird am nächsten Tag entwickelt, in einem einzigen Album.',
      p2: 'Hundert Kameras stecken schon in den Taschen Ihrer Gäste. Es fehlte ihnen nur noch ein Film.',
      ticks: ['Nichts mieten, nichts einsammeln', 'Keine App nötig', 'Echter Einweg-Filmlook beim Download'],
      altAvant: 'Das Handy eines Gastes als Einwegkamera: Sucher, Bildzähler und Auslöser.',
      altArriere: 'Das am nächsten Tag entwickelte Album: die Fotos aller Gäste an einem Ort.',
      jetableTitre: 'Was eine Einwegkamera unersetzlich machte',
      jetableSous: 'Es ist nicht die Bildqualität. Es ist die Begrenzung, und die kommt zurück.',
      vraiTitre: 'Und echte Einwegkameras auf den Tischen?',
      vraiSous: 'Die Idee ist schön. Enttäuschend sind die Rechnung und der Tag danach.',
      colEux: 'Zehn gekaufte Einwegkameras',
      calcul: 'Zehn Kameras für fünfzig Gäste: zwischen 240 und 360 €, und insgesamt 270 Bilder.',
      etapesTitre: 'Ein Aufsteller, ein Scan, ein Film',
      etapesSous: 'Ihre Gäste müssen nichts installieren und nichts verstehen. Sie scannen und drücken ab.',
      ctaTitre: 'Geben Sie jedem Gast einen Film',
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
    // Indexable depuis le 07/08/2026 : « appareil jetable mariage » se cherche
    // assez pour valoir la concurrence avec l'article du journal. Sa propre
    // adresse canonique : sans elle, la page héritait de celle de l'accueil.
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
          <h2 className="section-title">{T.jetableTitre}</h2>
          <div className="section-sub">{T.jetableSous}</div>
          <div className="steps-grid">
            {T.jetable.map((j, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{j.ic}</div>
                <h3>{j.t}</h3>
                <p>{j.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{T.vraiTitre}</h2>
          <div className="section-sub">{T.vraiSous}</div>
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
          <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>{T.calcul}</p>
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
