// ============================================================
//  /pro : en français, la landing générale du programme partenaires
//  (maquette d'octobre 2026) ; en anglais et en allemand, l'ancienne page de
//  demande de code, qui n'est pas encore traduite dans la nouvelle version.
// ============================================================
import { langueDeParams } from '../../../lib/langue-lien'
import Landing, { metadataLanding } from '../../../components/pro/Landing'
import AnciennePro, { metadataAncienne } from './AnciennePro'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return lang === 'fr' ? metadataLanding('general') : metadataAncienne({ params })
}

export default async function ProPage({ params }) {
  const lang = await langueDeParams(params)
  if (lang !== 'fr') return <AnciennePro params={params} />
  return <Landing cle="general" />
}
