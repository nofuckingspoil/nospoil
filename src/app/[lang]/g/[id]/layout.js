import { nomEvenement } from '../../../../lib/og'
import { BANNIERE_APP } from '../../../../lib/banniere-app'
import { langueDeParams, localeOG } from '../../../../lib/langue-lien'
import { t } from '../../../../lib/i18n'

// Titre et description propres à l'événement : sans eux, un lien collé dans une
// messagerie affichait le titre générique du site, sans rapport avec l'album.
export async function generateMetadata({ params }) {
  const { id } = await params
  const lang = await langueDeParams(params)
  const nom = await nomEvenement(id)
  const titre = nom
    ? t({ fr: `L'album de ${nom}`, en: `${nom}: the album`, de: `Das Album: ${nom}` }, lang)
    : t({ fr: "L'album de la soirée", en: 'The event album', de: 'Das Album der Feier' }, lang)
  const desc = t({
    fr: 'Les photos prises par tous les participants, développées après la fête.',
    en: 'The photos taken by every guest, developed after the party.',
    de: 'Die Fotos aller Gäste, entwickelt nach der Feier.',
  }, lang)
  return {
    title: titre,
    description: desc,
    // L'album ne doit pas se retrouver dans un moteur de recherche.
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: desc, type: 'website', locale: localeOG(lang) },
    twitter: { card: 'summary_large_image', title: titre, description: desc },
    other: BANNIERE_APP,
  }
}

export default function GalleryLayout({ children }) {
  return children
}
