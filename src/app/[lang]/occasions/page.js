// ============================================================
//  /occasions : toutes les occasions réunies.
//
//  La porte d'entrée des pages par occasion, et la réponse à « comment
//  partager les photos d'un événement » (une recherche où le site
//  apparaissait déjà, en page 9).
// ============================================================

import SiteNav from '../../../components/SiteNav'
import SitePied from '../../../components/SitePied'
import { Pellicules, Confiance } from '../../../components/lp/Blocs'
import { Hero, Etapes, Texte, Faq, faqLd, AutresOccasions, CtaFinal } from '../../../components/occasions/Blocs'
import { EcranAppareil, EcranAffiche, EcranAlbum } from '../../../components/occasions/Ecrans'
import { JOUR_DEMO } from '../../../lib/occasions'
import { BRAND } from '../../../lib/brand'
import { LOCALES, t } from '../../../lib/i18n'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import { textesPageOccasions } from '../../../lib/occasions-textes'

const CHEMIN = '/occasions'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const T = textesPageOccasions(lang)
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

// Les trois étapes, communes à toutes les occasions.
const ETAPES = {
  fr: [
    { t: 'Une affiche ou un lien', s: "Vous créez l'événement en deux minutes. Les participants scannent le QR code de l'affiche, ou ouvrent le lien reçu dans le groupe : l'appareil photo s'ouvre dans leur navigateur." },
    { t: 'Des clichés comptés', s: "Chacun a quelques photos, pas une de plus, et ne les voit pas tout de suite. Comme avec un vrai jetable, on choisit son moment." },
    { t: 'La révélation', s: "À l'heure que vous avez choisie, toutes les photos apparaissent d'un coup dans un album privé, que chacun peut retrouver et télécharger." },
  ],
  en: [
    { t: 'A poster or a link', s: 'You create the event in two minutes. Guests scan the QR code on the poster, or open the link shared in the group chat: the camera opens in their browser.' },
    { t: 'A limited number of shots', s: "Everyone gets a few photos, not one more, and can't see them straight away. Just like a real disposable camera, you pick your moment." },
    { t: 'The reveal', s: 'At the time you chose, every photo appears at once in a private album that everyone can open and download.' },
  ],
  de: [
    { t: 'Ein Aufsteller oder ein Link', s: 'Sie erstellen das Event in zwei Minuten. Die Gäste scannen den QR-Code auf dem Aufsteller oder öffnen den Link aus der Gruppe: Die Kamera öffnet sich im Browser.' },
    { t: 'Eine feste Anzahl an Fotos', s: 'Jeder hat ein paar Aufnahmen, keine mehr, und sieht sie nicht sofort. Wie bei einer echten Einwegkamera wählt man seinen Moment.' },
    { t: 'Die Präsentation', s: 'Zur gewählten Zeit erscheinen alle Fotos auf einmal in einem privaten Album, das jeder öffnen und herunterladen kann.' },
  ],
}

export default async function PageOccasions({ params }) {
  const lang = await langueDeParams(params)
  const T = textesPageOccasions(lang)
  // Les écrans de l'appli, avec des photos de plusieurs fêtes : cette page
  // les réunit toutes.
  const titreFete = t({ fr: 'Votre événement', en: 'Your event', de: 'Ihr Event' }, lang)
  const visuels = [
    <EcranAffiche key="a" titre={titreFete} lang={lang} />,
    <EcranAppareil key="b" titre={titreFete} photo="/occasions/evjf-evg/album-1.webp" lang={lang} />,
    <EcranAlbum key="c" photos={['/occasions/anniversaire/album-2.webp', '/occasions/week-end-entre-amis/album-1.webp']} prenoms={['Camille', 'Léo']} jour={JOUR_DEMO} lang={lang} />,
  ]
  return (
    <div className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(T.faq, LOCALES[lang] || 'fr-FR')) }} />
      <SiteNav />

      <main className="site-inner">
        <Hero T={T} tier={5} lang={lang} photo="/occasions/occasions/hero.webp" viseur="/occasions/anniversaire-30-ans/album-1.webp" titreFete={titreFete} />
        <AutresOccasions lang={lang} titre={T.occasionsTitre} sous={T.occasionsSous} />
        <Etapes etapes={ETAPES[lang] || ETAPES.fr} lang={lang} visuels={visuels} />
        <Texte titre={T.commentTitre} paragraphes={T.comment} />
        <Pellicules lang={lang} dossier="/occasions/anniversaire/pellicules" />
        <Faq faq={T.faq} lang={lang} />
        <Confiance lang={lang} />
        <CtaFinal titre={T.ctaTitre} sous={T.ctaSous} tier={5} lang={lang} />
      </main>

      <SitePied lang={lang} />
    </div>
  )
}
