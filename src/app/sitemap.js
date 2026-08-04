// Plan du site pour Google.
import { POSTS } from '../lib/journal'
import { LEGAL_DOCS } from '../lib/legal'

const BASE = 'https://timetoflash.fr'

export default function sitemap() {
  const now = new Date()
  const pages = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/journal`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/create`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]
  const articles = POSTS.map((p) => ({
    url: `${BASE}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
  const legal = LEGAL_DOCS.map((d) => ({
    url: `${BASE}/${d.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }))
  return [...pages, ...articles, ...legal]
}
