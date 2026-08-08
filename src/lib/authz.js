// ============================================================
//  Qui a le droit de faire quoi sur un événement.
//
//  Deux rôles, volontairement distincts :
//   - `owner` : celui qui a créé et payé l'événement.
//   - `admin` : un co-organisateur invité. Il gère tout au quotidien,
//               mais ne peut pas supprimer l'événement.
//
//  Chacun possède son propre jeton. Auparavant la connexion d'un admin
//  lui renvoyait celui de l'organisateur : il devenait indiscernable du
//  propriétaire, et pouvait donc effacer l'album de tout le monde.
// ============================================================
import 'server-only'
import { selectRows } from './supabase'

export const OWNER = 'owner'
export const ADMIN = 'admin'

// Un événement suspendu par l'administration n'est plus accessible à personne :
// ni album, ni participation, ni nouvelle photo. Le statut existait en base
// mais n'était appliqué nulle part : le suspendre ne suspendait rien.
export const MESSAGE_SUSPENDU = 'Cet événement est momentanément suspendu.'

export async function estSuspendu(eventId) {
  if (!eventId) return false
  const { data } = await selectRows('events', `id=eq.${eventId}&select=status`)
  const ev = Array.isArray(data) ? data[0] : null
  return !!ev && ev.status === 'suspended'
}

// Rôle du porteur de ce jeton sur cet événement, ou null s'il n'en a aucun.
export async function roleFor(eventId, token) {
  if (!eventId || !token) return null

  const { data } = await selectRows('events', `id=eq.${eventId}&select=owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return null
  if (ev.owner_token === token) return OWNER

  const adm = await selectRows(
    'event_admins',
    `event_id=eq.${eventId}&token=eq.${encodeURIComponent(token)}&select=id`
  )
  return Array.isArray(adm.data) && adm.data[0] ? ADMIN : null
}

// Peut gérer l'événement au quotidien : réglages, participants, album, impression.
export function canManage(role) {
  return role === OWNER || role === ADMIN
}

// Seul l'organisateur peut détruire l'événement et les photos de tous.
export function canDelete(role) {
  return role === OWNER
}
