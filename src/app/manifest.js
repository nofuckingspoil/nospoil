import { BRAND } from '../lib/brand'

// Le manifeste est unique, quelle que soit la langue du visiteur : son nom
// se limite donc à la marque, qui se lit pareil partout (c'est lui que la
// fenêtre d'installation d'Android affiche). La description, rarement vue,
// reste en français, langue principale du site.
export default function manifest() {
  return {
    name: BRAND.name,
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
