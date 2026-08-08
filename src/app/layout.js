import './globals.css'
import { Bricolage_Grotesque, Manrope, Space_Mono } from 'next/font/google'
import { BRAND } from '../lib/brand'
import PromoCapture from '../components/PromoCapture'
import GuideBanner from '../components/GuideBanner'
import MetaPixel from '../components/MetaPixel'
import GoogleTag from '../components/GoogleTag'
import ConsentBanner from '../components/ConsentBanner'

// Polices auto-hébergées par Next (plus d'appel à fonts.googleapis.com, qui
// bloquait l'affichage du texte pendant ~750 ms au premier chargement).
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-display',
})
const fontBody = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--f-body',
})
const fontMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--f-mono',
})

const SITE_URL = 'https://timetoflash.fr'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.pitch,
  applicationName: BRAND.name,
  keywords: [
    'appareil photo jetable',
    'appareil photo jetable mariage',
    'animation photo mariage',
    'photos invités mariage',
    'QR code photo mariage',
    'alternative photobooth',
    'photobooth mariage',
    'application photo événement',
    BRAND.name,
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: BRAND.name,
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.pitch,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.pitch,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: BRAND.name,
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  themeColor: '#14161F',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Données structurées : aident Google à comprendre la marque et le service.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BRAND.name,
      url: SITE_URL,
      description: BRAND.pitch,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BRAND.name,
      description: BRAND.tagline,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fr-FR',
    },
    {
      '@type': 'WebApplication',
      name: BRAND.name,
      url: SITE_URL,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      description: BRAND.pitch,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      inLanguage: 'fr-FR',
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Mesure des publicités. Ces deux-là ne chargent rien tant que le
            visiteur n'a pas accepté, et rien non plus si les identifiants de
            src/lib/tracking.js sont vides. */}
        <MetaPixel />
        <GoogleTag />
        {/* Mémorise un éventuel ?promo=… dès la première page visitée. */}
        <PromoCapture />
        {/* Bandeau du guide : au-dessus de la barre du site, donc avant le
            contenu. Pages vitrines uniquement, écartable d'un clic. */}
        <GuideBanner />
        {children}
        {/* Demande de consentement. Passe au-dessus du reste tant qu'on n'a
            pas répondu, d'où sa position en toute fin de page. */}
        <ConsentBanner />
      </body>
    </html>
  )
}
