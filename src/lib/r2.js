// ============================================================
//  Stockage des photos sur Cloudflare R2 (API compatible S3).
//  Egress gratuit : remplace Supabase Storage.
//  À n'utiliser QUE dans les routes API (clés secrètes).
// ============================================================
import 'server-only'
import { AwsClient } from 'aws4fetch'

const ENDPOINT = process.env.R2_ENDPOINT
const BUCKET = process.env.R2_BUCKET
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY

function assertConfig() {
  if (!ENDPOINT || !BUCKET || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('Configuration R2 manquante (R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).')
  }
}

let _client = null
function client() {
  if (!_client) {
    _client = new AwsClient({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    })
  }
  return _client
}

// URL d'un objet : encode chaque segment mais conserve les "/"
function keyToUrl(path) {
  const key = String(path).split('/').map(encodeURIComponent).join('/')
  return `${ENDPOINT}/${BUCKET}/${key}`
}

// --- Upload d'un fichier ---
//
// `Content-Length` est déclaré explicitement : au-delà d'une certaine taille, le
// corps part sinon en flux, sans longueur connue, et R2 refuse le dépôt par un
// « 411 Length Required ». Les petits fichiers passaient, les vraies photos non.
export async function uploadPhoto(path, bytes, contentType = 'image/jpeg') {
  assertConfig()
  const taille = bytes?.byteLength ?? bytes?.length
  const res = await client().fetch(keyToUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      ...(Number.isFinite(taille) ? { 'Content-Length': String(taille) } : {}),
    },
    body: bytes,
  })
  return { ok: res.status < 300, status: res.status }
}

// --- Suppression d'un fichier (échec silencieux, comme le nettoyage d'origine) ---
export async function deletePhoto(path) {
  assertConfig()
  await client().fetch(keyToUrl(path), { method: 'DELETE' }).catch(() => {})
}

// --- Suppression groupée (liste de chemins exacts) ---
export async function deletePhotos(paths) {
  assertConfig()
  if (!paths.length) return { ok: true }
  await Promise.all(paths.map((p) => deletePhoto(p)))
  return { ok: true }
}

// --- Génère des URLs signées temporaires pour afficher les photos ---
// Renvoie une map { chemin: url }. Signature locale (pas d'appel réseau).
export async function signPhotos(paths, expiresIn = 3600) {
  assertConfig()
  if (!paths.length) return {}
  const map = {}
  await Promise.all(
    paths.map(async (path) => {
      const url = `${keyToUrl(path)}?X-Amz-Expires=${expiresIn}`
      const signed = await client().sign(url, { method: 'GET', aws: { signQuery: true } })
      map[path] = signed.url
    })
  )
  return map
}
