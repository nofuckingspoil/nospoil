import { selectRows, updateRow } from '../../../../lib/supabase'

// Accorde la recharge prévue par l'organisateur, UNE SEULE FOIS par invité
// (vérifié par son device_token). À zéro, la recharge est refusée.
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

  const ev = await selectRows('events', `id=eq.${eventId}&select=shots_per_guest,bonus_shots`)
  const row = Array.isArray(ev.data) ? ev.data[0] : null
  const base = row ? row.shots_per_guest : 0
  const BONUS = row ? (row.bonus_shots ?? 0) : 0
  if (BONUS <= 0) {
    return Response.json({ error: "La recharge n'est pas proposée sur cet événement." }, { status: 403 })
  }

  // Déjà utilisé : on ne ré-ajoute rien, on renvoie l'état actuel
  if ((g.bonus_shots || 0) > 0) {
    return Response.json({ shotsPerGuest: base + g.bonus_shots, bonusUsed: true, alreadyUsed: true })
  }

  const upd = await updateRow('guests', `id=eq.${guestId}`, { bonus_shots: BONUS })
  if (!upd.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  return Response.json({ shotsPerGuest: base + BONUS, bonusUsed: true, added: BONUS })
}
