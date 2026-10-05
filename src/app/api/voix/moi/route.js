import { selectRows, signPhotos } from '../../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'
import { participantVerifie } from '../../../../lib/livre-or'

// Le message de CE participant, et de lui seul : pour le réécouter ou décider
// de le refaire. Prouvé par son identifiant et le jeton de son appareil ;
// personne d'autre ne peut l'obtenir par ici.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  const { eventId, guestId, deviceToken } = body
  if (!eventId || !guestId || !deviceToken) {
    return Response.json({ error: t({ fr: 'Paramètres manquants.', en: 'Missing parameters.', de: 'Fehlende Parameter.' }, langue) }, { status: 400 })
  }
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide(langue)

  const invite = await participantVerifie(eventId, guestId, deviceToken)
  if (!invite) return Response.json({ message: null })

  const { data } = await selectRows(
    'voice_messages',
    `event_id=eq.${eventId}&guest_id=eq.${guestId}&select=audio_path,selfie_path,duration_ms,mime_type,waveform,created_at`
  )
  const m = Array.isArray(data) ? data[0] : null
  if (!m) return Response.json({ message: null })

  const signes = await signPhotos([m.audio_path, m.selfie_path].filter(Boolean), 3600)
  return Response.json({
    message: {
      url: signes[m.audio_path] || null,
      selfieUrl: m.selfie_path ? signes[m.selfie_path] || null : null,
      durationMs: m.duration_ms,
      mimeType: m.mime_type,
      onde: Array.isArray(m.waveform) ? m.waveform : null,
      createdAt: m.created_at,
    },
  })
}
