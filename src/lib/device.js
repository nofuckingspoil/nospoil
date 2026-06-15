'use client'
// ============================================================
//  Identité d'appareil sans compte (localStorage).
//  Permet de reconnaître un invité / organisateur sur son tél.
// ============================================================

function randomToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'tok-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getOrCreate(key) {
  if (typeof window === 'undefined') return null
  try {
    let v = localStorage.getItem(key)
    if (!v) { v = randomToken(); localStorage.setItem(key, v) }
    return v
  } catch {
    return randomToken()
  }
}

// Jeton unique de l'appareil (commun organisateur + invité)
export function getDeviceToken() {
  return getOrCreate('pellicule_device')
}

// Mémorise les événements créés par cet appareil (pour les retrouver)
export function rememberMyEvent(id) {
  if (typeof window === 'undefined') return
  try {
    const list = JSON.parse(localStorage.getItem('pellicule_my_events') || '[]')
    if (!list.includes(id)) { list.unshift(id); localStorage.setItem('pellicule_my_events', JSON.stringify(list)) }
  } catch {}
}

export function getMyEvents() {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('pellicule_my_events') || '[]') } catch { return [] }
}

// Mémorise l'identité d'invité par événement (id + prénom)
export function saveGuest(eventId, guestId, name) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(`pellicule_guest_${eventId}`, JSON.stringify({ guestId, name })) } catch {}
}

export function getGuest(eventId) {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(`pellicule_guest_${eventId}`) || 'null') } catch { return null }
}
