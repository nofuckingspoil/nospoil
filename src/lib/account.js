// ============================================================
//  Compte organisateur : retrouver ses événements à partir d'un mail.
//  Pas de mot de passe — l'identité est prouvée par le mail (lien + code).
// ============================================================
import 'server-only'
import { selectRows, updateRow, insertRow } from './supabase'

const MAX_ATTEMPTS = 6

// Vérifie un code à 6 chiffres pour un mail, et le consomme s'il est correct.
// Renvoie { ok:true } ou { ok:false, status, error }.
export async function verifyAndConsumeCode(email, code) {
  const clean = (code || '').toString().replace(/\D/g, '')
  if (!isValidEmail(email) || clean.length !== 6) {
    return { ok: false, status: 400, error: 'Mail ou code manquant.' }
  }
  const enc = encodeURIComponent(email)
  const { data } = await selectRows(
    'login_codes',
    `email=eq.${enc}&used_at=is.null&order=created_at.desc&limit=1&select=*`
  )
  const row = Array.isArray(data) ? data[0] : null
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 401, error: 'Ce code a expiré. Demandez-en un nouveau.' }
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
    return { ok: false, status: 429, error: 'Trop de tentatives. Demandez un nouveau code.' }
  }
  if (row.code !== clean) {
    await updateRow('login_codes', `id=eq.${row.id}`, { attempts: row.attempts + 1 })
    return { ok: false, status: 401, error: 'Code incorrect.' }
  }
  await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
  return { ok: true }
}

export function normalizeEmail(v) {
  return (v || '').toString().trim().toLowerCase()
}

// ------------------------------------------------------------
//  Comptes : une personne, une adresse.
//
//  Appelé dès qu'une adresse est connue, quel que soit le rôle — organisateur,
//  co-organisateur ou invité. Une même personne peut être les trois, et c'est
//  précisément ce que l'adresse permet de recoller.
//
//  Ne fait jamais échouer l'appelant : un compte manquant n'empêche ni de créer
//  un événement, ni de prendre une photo.
// ------------------------------------------------------------
export async function ensureAccount(email, name) {
  const mail = normalizeEmail(email)
  if (!isValidEmail(mail)) return null
  const nom = (name || '').toString().trim().slice(0, 80) || null

  try {
    const { data } = await selectRows('accounts', `email=eq.${encodeURIComponent(mail)}&select=id,name&limit=1`)
    const existant = Array.isArray(data) ? data[0] : null

    if (existant) {
      // On complète un nom manquant, on n'écrase jamais celui qui est là :
      // un prénom saisi à la volée ne vaut pas un nom déjà enregistré.
      const patch = { last_seen_at: new Date().toISOString() }
      if (nom && !existant.name) patch.name = nom
      await updateRow('accounts', `id=eq.${existant.id}`, patch)
      return existant.id
    }

    const cree = await insertRow('accounts', { email: mail, name: nom, last_seen_at: new Date().toISOString() })
    if (cree.ok && cree.data?.id) return cree.data.id

    // Course entre deux requêtes simultanées : l'autre a gagné, on la relit.
    const relu = await selectRows('accounts', `email=eq.${encodeURIComponent(mail)}&select=id&limit=1`)
    return Array.isArray(relu.data) && relu.data[0] ? relu.data[0].id : null
  } catch (err) {
    console.error('compte:', err)
    return null
  }
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
}

const FIELDS = 'id,name,host_names,reveal_at,created_at,owner_token'

// Tous les événements liés à ce mail : ceux qu'il a créés + ceux où il est co-organisateur.
//
// Le jeton renvoyé dépend du lien : le propriétaire reçoit celui de l'événement,
// le co-admin le sien. Auparavant tout le monde recevait celui du propriétaire,
// ce qui donnait à n'importe quel co-admin le droit de tout supprimer.
export async function eventsForEmail(email) {
  const enc = encodeURIComponent(email)
  // Se connecter, c'est se manifester : le compte existe au plus tard ici.
  await ensureAccount(email)
  const owned = await selectRows('events', `owner_email=eq.${enc}&status=eq.active&select=${FIELDS}`)
  const list = (Array.isArray(owned.data) ? owned.data : []).map((e) => ({ ...e, _token: e.owner_token }))

  const admin = await selectRows('event_admins', `email=eq.${enc}&select=id,event_id,token,joined_at`)

  // Se connecter, c'est rejoindre : c'est le seul moment où l'on sait que la
  // personne a bien reçu son invitation et s'en est servie.
  for (const a of Array.isArray(admin.data) ? admin.data : []) {
    if (a.joined_at) continue
    try { await updateRow('event_admins', `id=eq.${a.id}`, { joined_at: new Date().toISOString() }) } catch {}
  }
  const parEvenement = new Map(
    (Array.isArray(admin.data) ? admin.data : [])
      .filter((a) => a.event_id && a.token && !list.some((e) => e.id === a.event_id))
      .map((a) => [a.event_id, a.token])
  )

  if (parEvenement.size) {
    const ids = [...parEvenement.keys()]
    const co = await selectRows('events', `id=in.(${ids.join(',')})&status=eq.active&select=${FIELDS}`)
    for (const e of Array.isArray(co.data) ? co.data : []) {
      list.push({ ...e, _token: parEvenement.get(e.id) })
    }
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return list.map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    revealAt: e.reveal_at,
    ownerToken: e._token,
  }))
}

// Code à 6 chiffres, tiré au sort de façon sûre.
export function makeCode() {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return String(buf[0] % 1000000).padStart(6, '0')
}

export function makeToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}
