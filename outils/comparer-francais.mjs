// Compare le texte visible des pages françaises entre deux serveurs.
//   node outils/comparer-francais.mjs http://localhost:3000 http://localhost:3005
const [A, B] = process.argv.slice(2)
const plan = await (await fetch(`${B}/sitemap.xml`)).text()
const chemins = [...new Set([...plan.matchAll(/<loc>https:\/\/timetoflash\.fr([^<]*)<\/loc>/g)].map((m) => m[1]).filter((c) => !/^\/(en|de)(\/|$)/.test(c)))]
const texte = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&[a-z#0-9]+;/g, ' ').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
let diffs = 0
for (const c of [...chemins, '/create', '/connexion', '/aide']) {
  const opt = { headers: { cookie: 'ttf_langue=fr', 'accept-language': 'fr' } }
  const [ha, hb] = await Promise.all([fetch(A + c, opt).then((r) => r.text()), fetch(B + c, opt).then((r) => r.text())])
  const IGN = new Set(['FR', 'EN', 'DE', 'Français', 'English', 'Deutsch', 'FR ▾', 'Langue'])
  const ta = texte(ha).filter((l) => !IGN.has(l)), tb = texte(hb).filter((l) => !IGN.has(l))
  const sa = new Set(ta), sb = new Set(tb)
  const manquants = ta.filter((l) => !sb.has(l)), ajoutes = tb.filter((l) => !sa.has(l))
  if (manquants.length || ajoutes.length) {
    diffs++
    console.log(`\n≠ ${c}`)
    manquants.slice(0, 8).forEach((l) => console.log('   − ' + l.slice(0, 160)))
    ajoutes.slice(0, 8).forEach((l) => console.log('   + ' + l.slice(0, 160)))
  }
}
console.log(diffs ? `\n${diffs} page(s) avec des différences` : '\n✓ français identique')
