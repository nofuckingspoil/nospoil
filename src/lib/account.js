// ============================================================
//  Compte organisateur : retrouver ses événements à partir d'un mail.
//  Pas de mot de passe — l'identité est prouvée par le mail (lien + code).
// ============================================================
import 'server-only'
import { selectRows } from './supabase'

export function normalizeEmail(v) {
  return (v || '').toString().trim().toLowerCase()
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
}

const FIELDS = 'id,name,host_names,reveal_at,created_at,owner_token'

// Tous les événements liés à ce mail : ceux qu'il a créés + ceux où il est co-organisateur.
export async function eventsForEmail(email) {
  const enc = encodeURIComponent(email)
  const owned = await selectRows('events', `owner_email=eq.${enc}&status=eq.active&select=${FIELDS}`)
  const list = Array.isArray(owned.data) ? [...owned.data] : []

  const admin = await selectRows('event_admins', `email=eq.${enc}&select=event_id`)
  const ids = (Array.isArray(admin.data) ? admin.data : [])
    .map((a) => a.event_id)
    .filter((id) => id && !list.some((e) => e.id === id))

  if (ids.length) {
    const co = await selectRows('events', `id=in.(${ids.join(',')})&status=eq.active&select=${FIELDS}`)
    if (Array.isArray(co.data)) list.push(...co.data)
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return list.map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    revealAt: e.reveal_at,
    ownerToken: e.owner_token,
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
