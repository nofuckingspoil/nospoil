// ============================================================
//  Accès Supabase côté serveur (REST + RPC + Storage).
//  Utilise la clé "service" : à n'utiliser QUE dans les routes API.
// ============================================================
import 'server-only'

// Le stockage des photos est géré par Cloudflare R2 (egress gratuit).
// On ré-exporte ces fonctions pour que les routes existantes ne changent pas.
export { uploadPhoto, deletePhoto, deletePhotos, signPhotos } from './r2'

const URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_KEY

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

// --- Mise à jour de ligne(s) filtrée(s) (PATCH) ---
export async function updateRow(table, query, patch) {
  assertConfig()
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(patch),
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

// --- Suppression de ligne(s) filtrée(s) (DELETE) ---
export async function deleteRows(table, query) {
  assertConfig()
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    cache: 'no-store',
  })
  return { ok: res.status < 300, status: res.status }
}

// (Le stockage des photos est désormais géré par Cloudflare R2, voir ./r2)
