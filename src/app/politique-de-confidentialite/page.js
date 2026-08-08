import LegalPage from '../../components/LegalPage'
import { legalBySlug } from '../../lib/legal'
import { BRAND } from '../../lib/brand'

const doc = legalBySlug('politique-de-confidentialite')

export const metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: '/politique-de-confidentialite' },
  openGraph: {
    title: `${doc.title} | ${BRAND.name}`,
    description: doc.description,
    url: 'https://timetoflash.fr/politique-de-confidentialite',
    type: 'website',
  },
}

export default function Page() {
  return <LegalPage doc={doc} />
}
