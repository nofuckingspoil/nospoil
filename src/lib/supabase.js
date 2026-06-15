// ============================================================
//  Accès Supabase côté serveur (REST + RPC + Storage).
//  Utilise la clé "service" : à n'utiliser QUE dans les routes API.
// ============================================================
import 'server-only'

const URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_KEY
const BUCKET = 'event-photos'

function assertConfig() {
  if (!URL || !KEY) throw new Error('Configuration Supabase manquante (SUPABASE_URL / SUPABASE_SERVICE_KEY).')
}

const authHeaders = () => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
})

// --- Appel d'une fonction Postgres (RPC) ---
export async function rpc(fnName, params) {
  assertConfig()
  const res = await fetch(`${URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  return { ok: res.status < 300, status: res.status, data }
}

// --- Insertion dans une table, renvoie la ligne créée ---
export async function insertRow(table, row) {
  assertConfig()
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  return { ok: res.status < 300, status: res.status, data: Array.isArray(data) ? data[0] : data }
}

// --- Lecture filtrée d'une table (PostgREST) ---
export async function selectRows(table, query = '') {
  assertConfig()
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, {
    headers: { ...authHeaders() },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  return { ok: res.status < 300, status: res.status, data }
}

// --- Upload d'un fichier dans le Storage privé ---
export async function uploadPhoto(path, bytes, contentType = 'image/jpeg') {
  assertConfig()
  const res = await fetch(`${URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': contentType, 'x-upsert': 'true' },
    body: bytes,
  })
  return { ok: res.status < 300, status: res.status }
}

// --- Suppression d'un fichier (nettoyage en cas d'échec) ---
export async function deletePhoto(path) {
  assertConfig()
  await fetch(`${URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  }).catch(() => {})
}

// --- Génère des URLs signées temporaires pour afficher les photos ---
export async function signPhotos(paths, expiresIn = 3600) {
  assertConfig()
  if (!paths.length) return {}
  const res = await fetch(`${URL}/storage/v1/object/sign/${BUCKET}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn, paths }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => [])
  const map = {}
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item?.path && item?.signedURL) {
        map[item.path] = `${URL}/storage/v1${item.signedURL}`
      }
    }
  }
  return map
}
