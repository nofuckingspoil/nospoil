// Vérifie que des fichiers JS/JSX du site se lisent sans erreur de syntaxe.
//   node outils/verifier-syntaxe.mjs src/app/[lang]/page.js src/lib/mail.js …
// Sans argument : tout src/.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const swc = require('next/dist/build/swc/index.js')
await swc.loadBindings()
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) }
const fichiers = process.argv.length > 2 ? process.argv.slice(2) : walk('src').filter((f) => /\.jsx?$/.test(f))
let erreurs = 0
for (const f of fichiers) {
  try {
    await swc.transform(fs.readFileSync(f, 'utf8'), { filename: f, jsc: { parser: { syntax: 'ecmascript', jsx: true } } })
  } catch (e) { erreurs++; console.error('✗', f, '\n', String(e.message || e).slice(0, 800)) }
}
console.log(erreurs ? `${erreurs} fichier(s) en erreur` : `✓ ${fichiers.length} fichier(s) lisibles`)
process.exit(erreurs ? 1 : 0)
