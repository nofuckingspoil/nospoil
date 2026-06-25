import { selectRows, updateRow } from '../../../../lib/supabase'

const BONUS = 5 // photos offertes (une seule fois par invité)

// Accorde +5 photos à un invité, UNE SEULE FOIS (vérifié par son device_token)
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, guestId, deviceToken } = body
  if (!eventId || !guestId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  const { ok, data } = await selectRows(
    'guests',
    `id=eq.${guestId}&event_id=eq.${eventId}&device_token=eq.${deviceToken}&select=id,bonus_shots`
  )
  const g = Array.isArray(data) ? data[0] : null
  if (!ok || !g) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const ev = await selectRows('events', `id=eq.${eventId}&select=shots_per_guest`)
  const base = Array.isArray(ev.data) && ev.data[0] ? ev.data[0].shots_per_guest : 0

  // Déjà utilisé : on ne ré-ajoute rien, on renvoie l'état actuel
  if ((g.bonus_shots || 0) > 0) {
    return Response.json({ shotsPerGuest: base + g.bonus_shots, bonusUsed: true, alreadyUsed: true })
  }

  const upd = await updateRow('guests', `id=eq.${guestId}`, { bonus_shots: BONUS })
  if (!upd.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  return Response.json({ shotsPerGuest: base + BONUS, bonusUsed: true, added: BONUS })
}
