import { selectRows, updateRow } from '../../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'
import { erreur } from '../../../../lib/messages-serveur'

// Accorde la recharge prévue par l'organisateur, UNE SEULE FOIS par participant
// (vérifié par son device_token). À zéro, la recharge est refusée.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, guestId, deviceToken } = body
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!eventId || !guestId || !deviceToken) {
    return Response.json({ error: erreur('parametres', langue) }, { status: 400 })
  }
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide(langue)

  const { ok, data } = await selectRows(
    'guests',
    `id=eq.${guestId}&event_id=eq.${eventId}&device_token=eq.${encodeURIComponent(deviceToken)}&select=id,bonus_shots`
  )
  const g = Array.isArray(data) ? data[0] : null
  if (!ok || !g) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const ev = await selectRows('events', `id=eq.${eventId}&select=shots_per_guest,bonus_shots`)
  const row = Array.isArray(ev.data) ? ev.data[0] : null
  const base = row ? row.shots_per_guest : 0
  const BONUS = row ? (row.bonus_shots ?? 0) : 0
  if (BONUS <= 0) {
    return Response.json({ error: t({ fr: "La recharge n'est pas proposée sur cet événement.", en: 'Top-ups are not offered for this event.', de: 'Nachladen ist bei diesem Event nicht vorgesehen.' }, langue) }, { status: 403 })
  }

  // Déjà utilisé : on ne ré-ajoute rien, on renvoie l'état actuel
  if ((g.bonus_shots || 0) > 0) {
    return Response.json({ shotsPerGuest: base + g.bonus_shots, bonusUsed: true, alreadyUsed: true })
  }

  const upd = await updateRow('guests', `id=eq.${guestId}`, { bonus_shots: BONUS, langue })
  if (!upd.ok) return Response.json({ error: erreur('serveur', langue) }, { status: 500 })

  return Response.json({ shotsPerGuest: base + BONUS, bonusUsed: true, added: BONUS })
}
