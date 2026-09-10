// ============================================================
//  Fabrique les rendus manquants des photos déjà en ligne.
//
//  Deux tailles se sont ajoutées après coup, et les albums existants ne les
//  ont pas :
//   - la vignette de la grille (640 px) manque aux premiers envois de l'app,
//     qui ne pouvaient poster qu'un fichier ;
//   - le rendu de la visionneuse (1400 px) n'existait pas du tout.
//
//  Sans lui, ouvrir une photo d'un ancien album télécharge encore le fichier
//  d'origine, près d'un mégaoctet.
//
//  À lancer depuis le dossier du site, avec le .env à côté :
//    node outils/rendus-manquants.mjs            (tout, par paquets de 40)
//    node outils/rendus-manquants.mjs 200        (au plus 200 photos)
//
//  Le script est interruptible et reprenable : il ne traite que les lignes
//  auxquelles il manque quelque chose, et écrit au fur et à mesure.
// ============================================================
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { AwsClient } from 'aws4fetch'

for (const ligne of readFileSync('.env', 'utf8').split('\n')) {
  const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
}

// Les mêmes accès que les routes du site, en plus court : ce fichier ne passe
// pas par Next, il ne peut donc pas importer src/lib (réservé au serveur).
const R2 = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto',
})
const objet = (chemin) =>
  `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${String(chemin).split('/').map(encodeURIComponent).join('/')}`

const SUPA = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const CLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const enTetes = { apikey: CLE, Authorization: `Bearer ${CLE}`, 'Content-Type': 'application/json' }

if (!process.env.R2_ENDPOINT || !CLE) {
  console.error('Configuration manquante : il faut le .env du site (R2_* et la clé de service Supabase).')
  process.exit(1)
}

async function lire(requete) {
  const r = await fetch(`${SUPA}/rest/v1/photos?${requete}`, { headers: enTetes })
  const data = await r.json().catch(() => null)
  return Array.isArray(data) ? data : []
}

async function ecrire(id, champs) {
  const r = await fetch(`${SUPA}/rest/v1/photos?id=eq.${id}`, {
    method: 'PATCH',
    headers: enTetes,
    body: JSON.stringify(champs),
  })
  return r.status < 300
}

async function telecharger(chemin) {
  const r = await R2.fetch(objet(chemin))
  if (!r.ok) throw new Error(`lecture ${r.status}`)
  return Buffer.from(await r.arrayBuffer())
}

async function deposer(chemin, bytes) {
  const r = await R2.fetch(objet(chemin), {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(bytes.length) },
    body: bytes,
  })
  return r.status < 300
}

const PLAFOND = Number(process.argv[2]) || Infinity
const PAQUET = 40

// Les mêmes valeurs que la route d'envoi : une photo doit ressortir pareille,
// qu'elle passe par ici ou par l'envoi normal.
const VIGNETTE = { taille: 640, qualite: 60 }
const VUE = { taille: 1400, qualite: 72 }

function ko(n) { return Math.round(n / 1024) }

async function rendre(bytes, { taille, qualite }) {
  return sharp(bytes)
    .rotate()
    .resize({ width: taille, height: taille, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: qualite, mozjpeg: true })
    .toBuffer()
}

let traitees = 0
let vues = 0
let vignettes = 0
let sautees = 0
let echecs = 0
let gagne = 0

while (traitees < PLAFOND) {
  const reste = Math.min(PAQUET, PLAFOND - traitees)
  const rows = await lire(
    `or=(view_path.is.null,thumb_path.is.null)&select=id,storage_path,thumb_path,view_path&limit=${reste}`
  )
  if (!rows.length) break

  for (const r of rows) {
    traitees++

    let source
    try {
      source = await telecharger(r.storage_path)
    } catch (e) {
      console.log(`  ✗ ${r.id} : ${e.message}`)
      echecs++
      continue
    }

    const rendus = {}

    if (!r.thumb_path) {
      try {
        const bytes = await rendre(source, VIGNETTE)
        const chemin = r.storage_path.replace(/\.jpg$/, '_thumb.jpg')
        if (await deposer(chemin, bytes)) { rendus.thumb_path = chemin; vignettes++ }
      } catch {}
    }

    if (!r.view_path) {
      try {
        const bytes = await rendre(source, VUE)
        // Une photo déjà légère n'a rien à gagner : un fichier de moins vaut
        // mieux qu'une copie de la même taille.
        if (bytes.length < source.length * 0.8) {
          const chemin = r.storage_path.replace(/\.jpg$/, '_vue.jpg')
          if (await deposer(chemin, bytes)) {
            rendus.view_path = chemin
            vues++
            gagne += source.length - bytes.length
          }
        } else {
          sautees++
        }
      } catch {}
    }

    if (Object.keys(rendus).length) {
      if (!(await ecrire(r.id, rendus))) {
        console.log(`  ✗ ${r.id} : la base a refusé la mise à jour`)
        echecs++
      }
    }

    if (traitees % 20 === 0) console.log(`  ${traitees} photos passées...`)
  }

  // Si le paquet n'a rien changé, insister ferait une boucle sans fin : les
  // lignes restantes sont celles qui échouent.
  if (rows.length < reste) break
}

console.log('')
console.log(`${traitees} photos examinées`)
console.log(`  ${vues} rendus de visionneuse fabriqués (${ko(gagne)} Ko économisés à chaque ouverture, au total)`)
console.log(`  ${vignettes} vignettes rattrapées`)
if (sautees) console.log(`  ${sautees} photos déjà assez légères, laissées telles quelles`)
if (echecs) console.log(`  ${echecs} échecs (relancer le script les reprendra)`)
