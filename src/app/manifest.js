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
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
