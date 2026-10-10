// ============================================================
//  Landings métier du programme partenaires (français seulement) :
//  /pro/wedding-planners, /pro/lieux-de-reception, /pro/photographes.
//  En anglais ou en allemand, on renvoie vers la version française.
// ============================================================
import { notFound, redirect } from 'next/navigation'
import { langueDeParams } from '../../../../lib/langue-lien'
import { CLE_PAR_SLUG } from '../../../../lib/partenaires'
import Landing, { metadataLanding } from '../../../../components/pro/Landing'

export const dynamicParams = false
export function generateStaticParams() {
  return Object.keys(CLE_PAR_SLUG).flatMap((metier) => ['fr', 'en', 'de'].map((lang) => ({ lang, metier })))
}

export async function generateMetadata({ params }) {
  const { metier } = await params
  const cle = CLE_PAR_SLUG[metier]
  return cle ? metadataLanding(cle) : {}
}

export default async function LandingMetier({ params }) {
  const { metier } = await params
  const cle = CLE_PAR_SLUG[metier]
  if (!cle) notFound()
  const lang = await langueDeParams(params)
  if (lang !== 'fr') redirect(`/pro/${metier}`)
  return <Landing cle={cle} />
}
