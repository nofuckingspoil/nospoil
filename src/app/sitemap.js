// Plan du site pour Google.
//
// Chaque page vitrine existe en trois langues : le français à la racine,
// l'anglais sous /en, l'allemand sous /de. Chaque version est déclarée à
// part, et chacune annonce ses sœurs (hreflang), pour que Google montre à
// chaque visiteur la version de sa langue.
import { POSTS } from '../lib/journal'
import { LEGAL_DOCS } from '../lib/legal'
import { LANGUES } from '../lib/i18n'
import { SLUGS_OCCASIONS } from '../lib/occasions'
import { lien } from '../lib/langue-lien'

const BASE = 'https://timetoflash.fr'

// L'adresse complète d'une page dans une langue ('/' en anglais → /en).
function url(chemin, langue) {
  const l = lien(chemin, langue)
  return `${BASE}${l === '/' ? '/' : l}`
}

// Les trois versions d'une page, chacune avec la liste de toutes les autres.
function enTroisLangues(chemin, reste) {
  const languages = {}
  for (const l of LANGUES) languages[l] = url(chemin, l)
  languages['x-default'] = url(chemin, 'fr')
  return LANGUES.map((l) => ({ url: url(chemin, l), ...reste, alternates: { languages } }))
}

export default function sitemap() {
  const now = new Date()
  const vitrines = [
    ['/', { lastModified: now, changeFrequency: 'weekly', priority: 1.0 }],
    ['/journal', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }],
    ['/guide', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }],
    ['/generateur-qr-code-mariage', { lastModified: now, changeFrequency: 'monthly', priority: 0.8 }],
    // Les 9 pannes des participants : « QR code ne scanne pas », « caméra
    // bloquée dans Instagram »… de vraies recherches. Absente jusqu'au 03/10/2026.
    ['/aide', { lastModified: now, changeFrequency: 'monthly', priority: 0.5 }],
    // Les pages par occasion (anniversaire, EVJF, week-end, retraite…).
    ['/occasions', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }],
    ...SLUGS_OCCASIONS.map((slug) => [`/${slug}`, { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }]),
    ['/photos-mariage-invites', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }],
    ['/cadeau-mariage-temoins', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }],
    ['/appareil-jetable-mariage', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }],
    ['/photobooth-mariage', { lastModified: now, changeFrequency: 'monthly', priority: 0.9 }],
    // /revivez-votre-mariage reste en « noindex » : pure page de pub, personne
    // ne tape cette phrase dans un moteur de recherche.
  ].flatMap(([chemin, reste]) => enTroisLangues(chemin, reste))

  // La création est une page de l'application : une seule adresse, qui
  // s'affiche dans la langue du visiteur.
  const appli = [
    { url: `${BASE}/create`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const articles = POSTS.flatMap((p) =>
    enTroisLangues(`/journal/${p.slug}`, {
      lastModified: new Date(p.updated || p.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  )
  const legal = LEGAL_DOCS.flatMap((d) =>
    enTroisLangues(`/${d.slug}`, {
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    })
  )
  return [...vitrines, ...appli, ...articles, ...legal]
}
