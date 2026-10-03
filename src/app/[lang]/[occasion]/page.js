// ============================================================
//  Une page par occasion : /anniversaire, /anniversaire-30-ans, /evjf-evg,
//  /week-end-entre-amis, /vacances-entre-amis, /depart-retraite…
//
//  Une seule mise en page pour toutes ; la liste vit dans lib/occasions.js,
//  les textes dans lib/occasions/. Toute autre adresse à ce niveau reste
//  une page introuvable (dynamicParams = false).
// ============================================================

import { notFound } from 'next/navigation'
import SiteNav from '../../../components/SiteNav'
import SitePied from '../../../components/SitePied'
import { Pellicules, Confiance } from '../../../components/lp/Blocs'
import {
  Hero, Album, Cartes, Etapes, Idees, Texte, Tarifs, Faq, faqLd, Articles, AutresOccasions, CtaFinal,
} from '../../../components/occasions/Blocs'
import { EcranAppareil, EcranAffiche, EcranAlbum } from '../../../components/occasions/Ecrans'
import { BRAND } from '../../../lib/brand'
import { LOCALES, LANGUES } from '../../../lib/i18n'
import { langueDeParams, alternates, localeOG, lien, SITE_URL } from '../../../lib/langue-lien'
import { OCCASIONS, occasion, nomFete, JOUR_DEMO } from '../../../lib/occasions'
import { textesOccasion } from '../../../lib/occasions-textes'

export const dynamicParams = false

export function generateStaticParams() {
  return LANGUES.flatMap((lang) => OCCASIONS.map((o) => ({ lang, occasion: o.slug })))
}

export async function generateMetadata({ params }) {
  const { occasion: slug } = await params
  const lang = await langueDeParams(params)
  const T = textesOccasion(slug, lang)
  if (!T) return {}
  const chemin = `/${slug}`
  return {
    title: T.titre,
    description: T.description,
    alternates: alternates(chemin, lang),
    openGraph: {
      title: `${T.titre} | ${BRAND.name}`,
      description: T.description,
      url: `${SITE_URL}${lien(chemin, lang)}`,
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

export default async function PageOccasion({ params }) {
  const { occasion: slug } = await params
  const lang = await langueDeParams(params)
  const o = occasion(slug)
  const T = textesOccasion(slug, lang)
  if (!o || !T) notFound()

  // Les écrans de l'appli, avec le nom et les photos de cette fête.
  const dossier = `/occasions/${slug}`
  const titreFete = nomFete(slug, lang)
  const viseur = `${dossier}/album-${o.ecran.viseur}.webp`
  const visuels = [
    <EcranAffiche key="a" titre={titreFete} lang={lang} />,
    <EcranAppareil key="b" titre={titreFete} photo={`${dossier}/album-${o.ecran.album[1]}.webp`} lang={lang} />,
    <EcranAlbum key="c" photos={o.ecran.album.map((n) => `${dossier}/album-${n}.webp`)} prenoms={o.ecran.prenoms} jour={JOUR_DEMO} lang={lang} />,
  ]

  return (
    <div className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(T.faq, LOCALES[lang] || 'fr-FR')) }} />
      <SiteNav />

      <main className="site-inner">
        <Hero T={T} slug={slug} tier={o.tier} lang={lang} photo={`${dossier}/hero.webp`} viseur={viseur} titreFete={titreFete} />
        <Cartes titre={T.pourquoiTitre} sous={T.pourquoiSous} cartes={T.pourquoi} />
        <Etapes etapes={T.etapes} lang={lang} visuels={visuels} />
        <Album slug={slug} lang={lang} />
        <Idees T={T} />
        <Pellicules lang={lang} dossier={`${dossier}/pellicules`} />
        <Texte titre={T.conseilsTitre} paragraphes={T.conseils} />
        <Tarifs slug={slug} tiers={o.tiers} lang={lang} />
        <Faq faq={T.faq} lang={lang} />
        <Articles slugs={o.articles} lang={lang} />
        <AutresOccasions sauf={slug} lang={lang} />
        <Confiance lang={lang} />
        <CtaFinal titre={T.ctaTitre} sous={T.ctaSous} slug={slug} tier={o.tier} lang={lang} />
      </main>

      <SitePied lang={lang} />
    </div>
  )
}
