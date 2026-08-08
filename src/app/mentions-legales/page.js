import LegalPage from '../../components/LegalPage'
import { legalBySlug } from '../../lib/legal'
import { BRAND } from '../../lib/brand'

const doc = legalBySlug('mentions-legales')

export const metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: '/mentions-legales' },
  openGraph: {
    title: `${doc.title} | ${BRAND.name}`,
    description: doc.description,
    url: 'https://timetoflash.fr/mentions-legales',
    type: 'website',
  },
}

export default function Page() {
  return <LegalPage doc={doc} />
}
