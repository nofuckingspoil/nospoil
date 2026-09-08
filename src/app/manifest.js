import { BRAND } from '../lib/brand'

export default function manifest() {
  return {
    name: `${BRAND.name} | ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.pitch,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4EBDA',
    theme_color: '#14161F',
    lang: 'fr',
    icons: [
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      // Le 192 est le format qu'Android attend, pour l'écran d'accueil comme
      // pour l'icône des notifications de soirée (voir public/sw.js).
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
