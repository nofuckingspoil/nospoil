// ============================================================
//  Page partenaires : /pro (et /en/pro, /de/pro).
//
//  Pour les prestataires de mariage (wedding planners, photographes, lieux,
//  DJ, traiteurs…). Elle reçoit les clics du bandeau des articles pros du
//  blog et ceux des mails de prospection.
//
//  Elle ne donne PAS de code : c'est un formulaire de demande. Clément lit la
//  demande (/admin/pros), crée le code (/admin/codes) et l'envoie lui-même.
//  Les conditions commerciales ne sont pas fixées : aucun montant, aucune
//  commission n'est promis ici.
//
//  Mise en page reprise du générateur de QR code (classes .dj-* et .qg-*),
//  le complément de style est sous « Page partenaires » dans globals.css.
// ============================================================

import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'
import SitePied from '../../../components/SitePied'
import { BRAND } from '../../../lib/brand'
import { LOCALES } from '../../../lib/i18n'
import { TIERS, formatPrice } from '../../../lib/pricing'
import { getPostEnLangue } from '../../../lib/journal'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'
import FormulairePro from './FormulairePro'

const CHEMIN = '/pro'

// Les articles du blog écrits pour les prestataires.
const ARTICLES = ['services-wedding-planner', 'photographe-mariage-photos-invites', 'attirer-maries-lieu-reception']

// Les deux bornes de prix citées dans la FAQ, lues dans la grille tarifaire.
function prix(lang) {
  const t50 = TIERS.find((x) => x.maxGuests === 50)
  const tMax = TIERS[TIERS.length - 1]
  return { bas: formatPrice(t50.priceCents, lang), haut: formatPrice(tMax.priceCents, lang), max: tMax.maxGuests }
}

function textes(lang) {
  const P = prix(lang)
  return {
    fr: {
      TITRE_META: 'Partenaires mariage : proposez Time to Flash à vos mariés',
      DESCRIPTION: "Wedding planner, photographe, lieu de réception : proposez à vos mariés l'appareil photo jetable partagé, sans appli ni matériel. Demandez un code gratuit pour l'essayer sur un vrai mariage.",
      EYEBROW: 'Programme partenaires',
      H1: 'Proposez Time to Flash à vos mariés',
      PROMESSE: "L'appareil photo jetable partagé des mariages : un QR code sur les tables, quelques poses par invité, et toutes les photos révélées d'un coup, par défaut le lendemain. Demandez un code gratuit pour l'essayer sur un vrai mariage.",
      BOUTON: 'Demander mon code gratuit',
      BREF: 'Time to Flash, en bref',
      BREF_LISTE: [
        { t: 'Un QR code, pas d’appli', d: "Les invités scannent le QR code posé sur les tables : l'appareil photo s'ouvre dans leur navigateur, sans rien installer." },
        { t: 'Des poses comptées', d: "Comme avec un vrai appareil jetable, chaque invité a un nombre limité de photos. On choisit ses moments, on ne mitraille pas." },
        { t: 'Tout se révèle d’un coup', d: "Les photos restent cachées pendant la fête, puis l'album s'ouvre en une fois, par défaut le lendemain, avec cinq pellicules au choix." },
      ],
      POUR_QUI: 'Pensé pour les prestataires de mariage',
      CIBLES: [
        { ic: '📋', t: 'Wedding planners', d: "Un service en plus dans vos prestations, qui ne demande aucune logistique : pas de matériel à livrer, pas de borne à installer, rien à récupérer le lendemain." },
        { ic: '📷', t: 'Photographes', d: "Les photos des invités complètent les vôtres sans vous concurrencer : elles montrent ce que vous ne pouviez pas voir. Et l'album du lendemain fait patienter les mariés pendant la retouche." },
        { ic: '🏛️', t: 'Lieux de réception', d: "Une animation sans matériel, à inclure dans vos forfaits mariage. Un QR code sur les tables suffit." },
        { ic: '🎶', t: 'DJ, traiteurs, vidéastes…', d: "Une idée simple à suggérer à vos mariés, qui ne change rien à votre prestation le jour J." },
      ],
      COMMENT: 'Comment ça marche',
      ETAPES: [
        { n: '01', t: 'Vous remplissez le formulaire', d: 'Deux minutes : qui vous êtes, ce que vous faites, combien de mariages vous accompagnez par an.' },
        { n: '02', t: 'Clément vous envoie un code gratuit', d: 'Le fondateur de Time to Flash lit chaque demande et vous répond personnellement, sous 48 h.' },
        { n: '03', t: 'Vous le testez sur un vrai mariage', d: "Vous créez l'album, le QR code va sur les tables, et vous découvrez l'album révélé le lendemain. Ensuite, on en parle." },
      ],
      FORM_H: 'Demandez votre code gratuit',
      FORM_P: "Pas de code automatique : Clément lit chaque demande et vous répond lui-même. Nous construisons le programme partenaires avec les premiers inscrits, et vos retours comptent.",
      QUESTIONS: 'Questions fréquentes',
      FAQ: [
        { q: 'C’est gratuit ?', r: `Oui. Le code de test est gratuit et sans engagement : il vous permet de créer un album pour un vrai mariage, sans carte bancaire. Pour les mariés, Time to Flash est ensuite un paiement unique par événement (de ${P.bas} pour 50 invités à ${P.haut} pour ${P.max}), sans abonnement.` },
        { q: 'Qu’est-ce que je dois gérer le jour J ?', r: "Rien. L'album se prépare avant le mariage, en quelques minutes. Le jour J, il suffit que le QR code soit sur les tables (affiches et chevalets sont prêts à imprimer). Les invités prennent leurs photos, et l'album se révèle tout seul à l'heure choisie." },
        { q: 'Les mariés ou les invités doivent-ils installer une appli ?', r: "Non. Les invités scannent le QR code avec l'appareil photo de leur téléphone, et l'appareil jetable s'ouvre dans leur navigateur. Les mariés gèrent leur album depuis un simple lien." },
        { q: 'Et après le test ?', r: "On fait le point ensemble. Le programme partenaires se construit avec les premiers inscrits : la façon de proposer Time to Flash à vos mariés et les conditions du partenariat se décideront avec vous. Rien ne vous engage." },
      ],
      LIRE: 'Pour aller plus loin',
      LIRE_BTN: "Lire l'article",
    },
    en: {
      TITRE_META: 'Wedding professionals: offer Time to Flash to your couples',
      DESCRIPTION: 'Wedding planner, photographer or venue? Offer your couples a shared disposable camera, with no app and no equipment. Request a free code to try it at a real wedding.',
      EYEBROW: 'Partner programme',
      H1: 'Offer Time to Flash to your couples',
      PROMESSE: 'The shared disposable camera for weddings: a QR code on the tables, a few shots per guest, and every photo revealed at once, the next day by default. Request a free code to try it at a real wedding.',
      BOUTON: 'Request my free code',
      BREF: 'Time to Flash in a nutshell',
      BREF_LISTE: [
        { t: 'A QR code, no app', d: 'Guests scan the QR code on the tables and the camera opens in their browser. Nothing to install.' },
        { t: 'A set number of shots', d: 'Just like a real disposable camera, each guest has a limited number of photos. People pick their moments instead of snapping away.' },
        { t: 'Revealed all at once', d: 'Photos stay hidden during the party, then the album opens in one go, the next day by default, with five film looks to choose from.' },
      ],
      POUR_QUI: 'Built for wedding professionals',
      CIBLES: [
        { ic: '📋', t: 'Wedding planners', d: 'An extra service for your packages that needs no logistics: no equipment to deliver, no booth to set up, nothing to collect the next day.' },
        { ic: '📷', t: 'Photographers', d: 'Guest photos complement yours without competing with them: they show what you could not see. And the next-day album keeps the couple happy while you edit.' },
        { ic: '🏛️', t: 'Wedding venues', d: 'An activity with no equipment that you can include in your wedding packages. A QR code on the tables is all it takes.' },
        { ic: '🎶', t: 'DJs, caterers, videographers…', d: 'A simple idea to suggest to your couples, which changes nothing about your work on the day.' },
      ],
      COMMENT: 'How it works',
      ETAPES: [
        { n: '01', t: 'You fill in the form', d: 'Two minutes: who you are, what you do, how many weddings you work on each year.' },
        { n: '02', t: 'Clément sends you a free code', d: 'The founder of Time to Flash reads every request and replies to you personally within 48 hours.' },
        { n: '03', t: 'You try it at a real wedding', d: 'You create the album, the QR code goes on the tables, and you see the album revealed the next day. Then we talk.' },
      ],
      FORM_H: 'Request your free code',
      FORM_P: 'No automatic code: Clément reads every request and replies himself. We are building the partner programme with our first partners, and your feedback matters.',
      QUESTIONS: 'Frequently asked questions',
      FAQ: [
        { q: 'Is it free?', r: `Yes. The trial code is free with no commitment: it lets you create an album for a real wedding, with no card needed. For couples, Time to Flash is then a one-off payment per event (from ${P.bas} for 50 guests to ${P.haut} for ${P.max}), with no subscription.` },
        { q: 'What do I need to handle on the day?', r: 'Nothing. The album is set up before the wedding in a few minutes. On the day, the QR code just needs to be on the tables (posters and table cards are ready to print). Guests take their photos, and the album reveals itself at the chosen time.' },
        { q: 'Do the couple or the guests need to install an app?', r: 'No. Guests scan the QR code with their phone camera and the disposable camera opens in their browser. The couple manage their album from a simple link.' },
        { q: 'What happens after the trial?', r: 'We take stock together. The partner programme is being built with our first partners: how you offer Time to Flash to your couples and the terms of the partnership will be decided with you. There is no commitment.' },
      ],
      LIRE: 'Further reading',
      LIRE_BTN: 'Read the article',
    },
    de: {
      TITRE_META: 'Hochzeitsdienstleister: Bieten Sie Ihren Brautpaaren Time to Flash an',
      DESCRIPTION: 'Hochzeitsplaner, Fotograf oder Hochzeitslocation? Bieten Sie Ihren Brautpaaren eine gemeinsame digitale Einwegkamera an, ohne App und ohne Technik. Fordern Sie einen kostenlosen Code an, um sie bei einer echten Hochzeit zu testen.',
      EYEBROW: 'Partnerprogramm',
      H1: 'Bieten Sie Ihren Brautpaaren Time to Flash an',
      PROMESSE: 'Die digitale Einwegkamera für Hochzeiten: ein QR-Code auf den Tischen, wenige Fotos pro Gast, und alle Bilder werden auf einmal präsentiert, standardmäßig am nächsten Tag. Fordern Sie einen kostenlosen Code an, um sie bei einer echten Hochzeit zu testen.',
      BOUTON: 'Kostenlosen Code anfordern',
      BREF: 'Time to Flash in Kürze',
      BREF_LISTE: [
        { t: 'QR-Code statt App', d: 'Die Gäste scannen den QR-Code auf den Tischen, und die Kamera öffnet sich direkt im Browser. Nichts zu installieren.' },
        { t: 'Begrenzte Anzahl an Fotos', d: 'Wie bei einer echten Einwegkamera hat jeder Gast nur eine bestimmte Anzahl an Fotos. So wählt man seine Momente bewusst aus.' },
        { t: 'Alles auf einmal sichtbar', d: 'Während der Feier bleiben die Fotos verborgen. Danach werden alle Bilder gemeinsam präsentiert, standardmäßig am nächsten Tag, mit fünf Filmlooks zur Auswahl.' },
      ],
      POUR_QUI: 'Gemacht für Hochzeitsdienstleister',
      CIBLES: [
        { ic: '📋', t: 'Hochzeitsplaner', d: 'Eine zusätzliche Leistung für Ihr Angebot, ganz ohne Logistik: kein Material zu liefern, keine Fotobox aufzubauen, am nächsten Tag nichts abzuholen.' },
        { ic: '📷', t: 'Fotografen', d: 'Die Fotos der Gäste ergänzen Ihre Bilder, ohne Ihnen Konkurrenz zu machen: Sie zeigen, was Sie nicht sehen konnten. Und das Album am nächsten Tag verkürzt dem Brautpaar die Wartezeit, während Sie bearbeiten.' },
        { ic: '🏛️', t: 'Hochzeitslocations', d: 'Ein Programmpunkt ohne Technik, den Sie in Ihre Hochzeitspakete aufnehmen können. Ein QR-Code auf den Tischen genügt.' },
        { ic: '🎶', t: 'DJs, Caterer, Videografen…', d: 'Eine einfache Idee, die Sie Ihren Brautpaaren empfehlen können und die an Ihrer Leistung am Hochzeitstag nichts ändert.' },
      ],
      COMMENT: 'So funktioniert es',
      ETAPES: [
        { n: '01', t: 'Sie füllen das Formular aus', d: 'Zwei Minuten: wer Sie sind, was Sie machen und wie viele Hochzeiten Sie pro Jahr betreuen.' },
        { n: '02', t: 'Clément schickt Ihnen einen kostenlosen Code', d: 'Der Gründer von Time to Flash liest jede Anfrage selbst und antwortet Ihnen persönlich innerhalb von 48 Stunden.' },
        { n: '03', t: 'Sie testen es bei einer echten Hochzeit', d: 'Sie legen das Album an, der QR-Code kommt auf die Tische, und am nächsten Tag erleben Sie die Präsentation. Danach sprechen wir darüber.' },
      ],
      FORM_H: 'Fordern Sie Ihren kostenlosen Code an',
      FORM_P: 'Kein automatischer Code: Clément liest jede Anfrage und antwortet Ihnen selbst. Wir bauen das Partnerprogramm gemeinsam mit den ersten Partnern auf, und Ihr Feedback zählt.',
      QUESTIONS: 'Häufige Fragen',
      FAQ: [
        { q: 'Ist das kostenlos?', r: `Ja. Der Testcode ist kostenlos und unverbindlich: Damit legen Sie ein Album für eine echte Hochzeit an, ohne Kreditkarte. Für Brautpaare kostet Time to Flash danach eine einmalige Zahlung pro Event (von ${P.bas} für 50 Gäste bis ${P.haut} für ${P.max}), ohne Abo.` },
        { q: 'Was muss ich am Hochzeitstag erledigen?', r: 'Nichts. Das Album wird vor der Hochzeit in wenigen Minuten eingerichtet. Am Hochzeitstag muss nur der QR-Code auf den Tischen stehen (Plakate und Tischaufsteller sind druckfertig). Die Gäste fotografieren, und die Präsentation erfolgt automatisch zum gewählten Zeitpunkt.' },
        { q: 'Müssen Brautpaar oder Gäste eine App installieren?', r: 'Nein. Die Gäste scannen den QR-Code mit der Kamera ihres Handys, und die Einwegkamera öffnet sich im Browser. Das Brautpaar verwaltet sein Album über einen einfachen Link.' },
        { q: 'Und nach dem Test?', r: 'Wir ziehen gemeinsam Bilanz. Das Partnerprogramm entsteht zusammen mit den ersten Partnern: Wie Sie Time to Flash Ihren Brautpaaren anbieten und zu welchen Konditionen, legen wir mit Ihnen fest. Sie gehen keine Verpflichtung ein.' },
      ],
      LIRE: 'Weiterlesen',
      LIRE_BTN: 'Artikel lesen',
    },
  }[lang]
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
  return {
    title: T.TITRE_META,
    description: T.DESCRIPTION,
    alternates: alternates(CHEMIN, lang),
    openGraph: {
      title: `${T.TITRE_META} | ${BRAND.name}`,
      description: T.DESCRIPTION,
      url: SITE_URL + lien(CHEMIN, lang),
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function ProPage({ params }) {
  const lang = await langueDeParams(params)
  const T = textes(lang)
  const articles = ARTICLES.map((slug) => getPostEnLangue(slug, lang)).filter(Boolean)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: LOCALES[lang] || 'fr-FR',
    mainEntity: T.FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  }

  return (
    <div className="dj pro">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav large />

      <main aria-label={T.H1}>
        <div className="dj-wrap dj-head pro-head">
          <span className="dj-eyebrow">{T.EYEBROW}</span>
          <h1>{T.H1}</h1>
          <p>{T.PROMESSE}</p>
          <a className="dj-btn pro-head-btn" href="#formulaire">{T.BOUTON}</a>
        </div>

        <div className="dj-wrap qg-content pro-content">
          <section>
            <h2>{T.BREF}</h2>
            <div className="qg-uses">
              {T.BREF_LISTE.map((b) => (
                <div key={b.t} className="qg-use">
                  <h3>{b.t}</h3>
                  <p>{b.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>{T.POUR_QUI}</h2>
            <div className="pro-cibles">
              {T.CIBLES.map((c) => (
                <div key={c.t} className="qg-use pro-cible">
                  <span className="pro-cible-ic" aria-hidden="true">{c.ic}</span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>{T.COMMENT}</h2>
            <div className="qg-etapes pro-etapes">
              {T.ETAPES.map((e) => (
                <div key={e.n} className="qg-etape">
                  <span>{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="formulaire" className="pro-form-section">
            <div className="pro-form-intro">
              <h2>{T.FORM_H}</h2>
              <p>{T.FORM_P}</p>
            </div>
            <FormulairePro lang={lang} />
          </section>

          <section>
            <h2>{T.QUESTIONS}</h2>
            <div className="qg-faq">
              {T.FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </section>

          {articles.length > 0 && (
            <section>
              <h2>{T.LIRE}</h2>
              <div className="pro-articles">
                {articles.map((a) => (
                  <Link key={a.slug} className="qg-use pro-article" href={lien(`/journal/${a.slug}`, lang)}>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="pro-article-lien">{T.LIRE_BTN} →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SitePied lang={lang} />
    </div>
  )
}
