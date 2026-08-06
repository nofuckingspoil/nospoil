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

// Jeton "propriétaire" pour UN événement précis.
// - Sur l'appareil créateur : c'est le jeton d'appareil (par défaut).
// - Sur un autre appareil : récupéré via le lien organisateur privé (?k=…) et mémorisé ici,
//   ce qui permet de retrouver son tableau de bord depuis n'importe où.
export function saveOwnerToken(eventId, token) {
  if (typeof window === 'undefined' || !token) return
  try { localStorage.setItem(`pellicule_owner_${eventId}`, token) } catch {}
}

export function getOwnerToken(eventId) {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(`pellicule_owner_${eventId}`)
    if (stored) return stored
  } catch {}
  return getDeviceToken()
}

// ---- Compte organisateur (connexion par mail) ----
// On mémorise le mail connecté, puis on enregistre l'accès à chaque événement
// retrouvé : cet appareil est ensuite reconnu comme organisateur, comme avant.
export function saveAccount(email) {
  if (typeof window === 'undefined' || !email) return
  try { localStorage.setItem('declic_email', email) } catch {}
}

export function getAccountEmail() {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem('declic_email') } catch { return null }
}

// Cette personne organise (ou a organisé) un événement depuis cet appareil ?
// Sert à ne rien lui redemander : elle a déjà donné son adresse en créant son
// événement — le guide et les autres ressources lui sont dus.
export function isOrganizer() {
  if (typeof window === 'undefined') return false
  return getMyEvents().length > 0 || !!getAccountEmail()
}

export function signOut() {
  if (typeof window === 'undefined') return
  try {
    for (const id of getMyEvents()) localStorage.removeItem(`pellicule_owner_${id}`)
    localStorage.removeItem('pellicule_my_events')
    localStorage.removeItem('declic_email')
  } catch {}
}

// Après une connexion réussie : on garde les accès aux événements retrouvés.
export function applyLogin(email, events) {
  saveAccount(email)
  for (const ev of events || []) {
    if (!ev?.id) continue
    saveOwnerToken(ev.id, ev.ownerToken)
    rememberMyEvent(ev.id)
  }
}

// Retire un événement de la liste locale (après suppression)
export function forgetMyEvent(id) {
  if (typeof window === 'undefined') return
  try {
    const list = JSON.parse(localStorage.getItem('pellicule_my_events') || '[]').filter((x) => x !== id)
    localStorage.setItem('pellicule_my_events', JSON.stringify(list))
    localStorage.removeItem(`pellicule_guest_${id}`)
    localStorage.removeItem(`pellicule_owner_${id}`)
  } catch {}
}

// Mémorise l'identité d'invité par événement (id + prénom + téléphone éventuel)
export function saveGuest(eventId, guestId, name, email) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(`pellicule_guest_${eventId}`, JSON.stringify({ guestId, name, email: email || '' })) } catch {}
}

export function getGuest(eventId) {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(`pellicule_guest_${eventId}`) || 'null') } catch { return null }
}
