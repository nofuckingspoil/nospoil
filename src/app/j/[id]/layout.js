import { BRAND } from '../../../lib/brand'

// Titre affiché par l'appareil photo / les aperçus de lien quand on scanne le QR.
const INVITE_TITLE = 'Participez à l’album collectif !'
const INVITE_DESC = `Scannez, prenez vos photos, et découvrez l’album après la fête. ${BRAND.pitch}`

export const metadata = {
  title: INVITE_TITLE,
  description: INVITE_DESC,
  openGraph: {
    title: INVITE_TITLE,
    description: INVITE_DESC,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: INVITE_TITLE,
    description: INVITE_DESC,
  },
}

export default function JoinLayout({ children }) {
  return children
}
