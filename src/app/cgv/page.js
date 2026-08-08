import LegalPage from '../../components/LegalPage'
import { legalBySlug } from '../../lib/legal'
import { BRAND } from '../../lib/brand'

const doc = legalBySlug('cgv')

export const metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: '/cgv' },
  openGraph: {
    title: `${doc.title} | ${BRAND.name}`,
    description: doc.description,
    url: 'https://timetoflash.fr/cgv',
    type: 'website',
  },
}

export default function Page() {
  return <LegalPage doc={doc} />
}
