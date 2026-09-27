// ============================================================
//  L'événement lu côté serveur, avant d'envoyer la moindre page.
//
//  Une seule lecture par requête (`cache`) : le titre de la page et le tri
//  « appareil ou album ? » s'en servent tous les deux.
// ============================================================
import 'server-only'
import { cache } from 'react'
import { selectRows } from './supabase'
import { isRevealed } from './phase'
import { estUuid } from './params'

export const lireEvenement = cache(async (id) => {
  if (!estUuid(id)) return null
  try {
    const { data } = await selectRows(
      'events',
      `id=eq.${id}&select=name,host_names,reveal_at,reveal_paused,max_guests`
    )
    return Array.isArray(data) ? data[0] || null : null
  } catch { return null }
})

// L'album est-il ouvert ? Même règle que /api/events (isRevealed) : la
// suspension et la formule dépassée le retiennent. Les participants ne sont
// comptés qu'une fois l'heure passée : une soirée en cours ne paie qu'une
// seule petite lecture.
export async function albumOuvert(id) {
  const ev = await lireEvenement(id)
  if (!ev || ev.reveal_paused) return false
  if (new Date(ev.reveal_at || 0).getTime() > Date.now()) return false
  try {
    const { data } = await selectRows('guests', `event_id=eq.${id}&blocked=is.false&select=id`)
    const guestCount = Array.isArray(data) ? data.length : 0
    return isRevealed({ revealAt: ev.reveal_at, revealPaused: ev.reveal_paused, maxGuests: ev.max_guests, guestCount })
  } catch { return false }
}
