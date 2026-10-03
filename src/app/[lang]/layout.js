import './globals.css'
import { Bricolage_Grotesque, Manrope, Space_Mono } from 'next/font/google'
import { BRAND, marque } from '../../lib/brand'
import { LANGUES } from '../../lib/i18n'
import { alternates, langueDeParams, localeOG } from '../../lib/langue-lien'
import { LangueProvider } from '../../components/Langue'
import PromoCapture from '../../components/PromoCapture'
import ProvenanceCapture from '../../components/ProvenanceCapture'
import GuideBanner from '../../components/GuideBanner'
import MetaPixel from '../../components/MetaPixel'
import GoogleTag from '../../components/GoogleTag'
import ConsentBanner from '../../components/ConsentBanner'

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
// Space Mono ne sert qu'aux petites étiquettes (surtitres, compteurs, pied de
// page). Préchargée, elle prenait 19 Ko de bande passante en priorité haute et
// passait devant la police du titre : le grand titre de l'accueil attendait
// donc son tour. Elle se charge maintenant en second rideau.
const fontMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  variable: '--f-mono',
})

const SITE_URL = 'https://timetoflash.fr'

// Les trois langues sont construites à l'avance.
export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }))
}
export const dynamicParams = false

const MOTS_CLES = {
  fr: [
    'appareil photo jetable',
    'appareil photo jetable mariage',
    'animation photo mariage',
    'photos invités mariage',
    'QR code photo mariage',
    'alternative photobooth',
    'photobooth mariage',
    'application photo événement',
  ],
  en: [
    'disposable camera app',
    'wedding disposable camera',
    'wedding photo app',
    'guest photos wedding',
    'QR code wedding photos',
    'photo booth alternative',
    'event photo sharing app',
  ],
  de: [
    'Einwegkamera App',
    'Einwegkamera Hochzeit',
    'Hochzeit Foto App',
    'Gästefotos Hochzeit',
    'QR-Code Hochzeitsfotos',
    'Fotobox Alternative',
    'Event Foto App',
  ],
}

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  const M = marque(lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${BRAND.name} | ${M.tagline}`,
      template: `%s | ${BRAND.name}`,
    },
    description: M.pitch,
    applicationName: BRAND.name,
    keywords: [...MOTS_CLES[lang], BRAND.name],
    authors: [{ name: BRAND.name }],
    creator: BRAND.name,
    alternates: alternates('/', lang),
    openGraph: {
      type: 'website',
      locale: localeOG(lang),
      url: SITE_URL,
      siteName: BRAND.name,
      title: `${BRAND.name} | ${M.tagline}`,
      description: M.pitch,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${BRAND.name} | ${M.tagline}`,
      description: M.pitch,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: BRAND.name,
    },
    robots: { index: true, follow: true },
    // La bannière d'iOS n'est plus déclarée ici : voir lib/banniere-app.js.
  }
}

export const viewport = {
  themeColor: '#14161F',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Données structurées : aident Google à comprendre la marque et le service.
function jsonLd(lang) {
  const M = marque(lang)
  const inLanguage = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE' }[lang]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND.name,
        url: SITE_URL,
        description: M.pitch,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND.name,
        description: M.tagline,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage,
      },
      {
        '@type': 'WebApplication',
        name: BRAND.name,
        url: SITE_URL,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        description: M.pitch,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage,
      },
    ],
  }
}

export default async function RootLayout({ children, params }) {
  const lang = await langueDeParams(params)
  return (
    <html lang={lang} className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }}
        />
      </head>
      <body>
        <LangueProvider lang={lang}>
        {/* Mesure des publicités. Ces deux-là ne chargent rien tant que le
            visiteur n'a pas accepté, et rien non plus si les identifiants de
            src/lib/tracking.js sont vides. */}
        <MetaPixel />
        <GoogleTag />
        {/* Mémorise un éventuel ?promo=… dès la première page visitée. */}
        <PromoCapture />
        <ProvenanceCapture />
        {/* Bandeau du guide : au-dessus de la barre du site, donc avant le
            contenu. Pages vitrines uniquement, écartable d'un clic. */}
        <GuideBanner />
        {children}
        {/* Demande de consentement. Passe au-dessus du reste tant qu'on n'a
            pas répondu, d'où sa position en toute fin de page. */}
        <ConsentBanner />
        </LangueProvider>
      </body>
    </html>
  )
}
