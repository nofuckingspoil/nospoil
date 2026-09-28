// Contrôle du français oublié sur toutes les pages du plan du site, en /en et /de.
//   node outils/controle-pages.mjs [http://localhost:3005]
import { phrasesFrancaises } from './detecter-francais.mjs'
const BASE = process.argv[2] || 'http://localhost:3005'
const plan = await (await fetch(`${BASE}/sitemap.xml`)).text()
const chemins = [...new Set([...plan.matchAll(/<loc>https:\/\/timetoflash\.fr([^<]*)<\/loc>/g)].map((m) => m[1].replace(/^\/(en|de)(?=\/|$)/, '') || '/'))]
const extras = ['/create', '/connexion', '/mes-evenements', '/mes-photos', '/aide', '/revivez-votre-mariage', '/avis']
let total = 0
for (const c of [...new Set([...chemins, ...extras])]) {
  for (const l of ['en', 'de']) {
    const url = `${BASE}/${l}${c === '/' ? '' : c}`
    const html = await (await fetch(url, { headers: { cookie: `ttf_langue=${l}` } })).text()
    const lang = (html.match(/<html[^>]*lang="([a-z]+)"/) || [])[1]
    const titre = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
    const alts = [...html.matchAll(/(?:alt|aria-label|placeholder|title)="([^"]{3,})"/g)].map((m) => m[1])
    const corps = html
      .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<br\s*\/?>/g, ' ').replace(/<\/(p|div|h\d|li|button|a|span|td|th|label)>/g, '\n')
      .replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ')
    const suspects = phrasesFrancaises([titre, desc, ...alts, corps].join('\n'))
    const souci = lang !== l ? [`<html lang="${lang}">`] : []
    if (suspects.length || souci.length) {
      total += suspects.length + souci.length
      console.log(`\n✗ ${url}`)
      ;[...souci, ...suspects].slice(0, 25).forEach((s) => console.log('   •', s))
    }
  }
}
console.log(total ? `\n${total} point(s) à regarder` : '\n✓ aucune trace de français')
