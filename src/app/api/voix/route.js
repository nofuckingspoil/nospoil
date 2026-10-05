import { selectRows, upsertRow, uploadPhoto, deletePhotos } from '../../../lib/supabase'
import { estSuspendu, messageSuspendu } from '../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../lib/params'
import { estImage } from '../../../lib/image'
import { t, langueValide } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'
import {
  livreOrActif, livreOrFerme, participantVerifie, versM4a, estAudio, ondeValide,
  DUREE_TOLEREE_MS, AUDIO_MAX_OCTETS, SELFIE_MAX_OCTETS,
} from '../../../lib/livre-or'

export const runtime = 'nodejs'
export const maxDuration = 30

// ============================================================
//  Dépôt d'un message du livre d'or (audio + selfie facultatif).
//
//  Appelé par la file d'attente du navigateur, exactement comme les photos :
//  un message enregistré sans réseau part tout seul dès qu'il revient.
//
//  Un participant n'a qu'UN message par événement. En redéposer un écrase le
//  précédent, audio ET selfie : l'ancien fichier est effacé du stockage.
//  Aucune pose de la pellicule n'est consommée, ni par la voix ni par le selfie.
// ============================================================
export async function POST(request) {
  let langue = langueRequete(request)
  let form
  try { form = await request.formData() } catch {
    return Response.json({ error: t({ fr: 'Requête invalide.', en: 'Invalid request.', de: 'Ungültige Anfrage.' }, langue) }, { status: 400 })
  }
  langue = langueValide(form.get('langue')) || langue

  const audio = form.get('audio')
  const selfie = form.get('selfie')
  const eventId = form.get('eventId')
  const guestId = form.get('guestId')
  const deviceToken = form.get('deviceToken')
  const dureeMs = Math.round(Number(form.get('durationMs')))

  if (!audio || typeof audio === 'string' || !eventId || !guestId || !deviceToken) {
    return Response.json({ error: t({ fr: 'Paramètres manquants.', en: 'Missing parameters.', de: 'Fehlende Parameter.' }, langue) }, { status: 400 })
  }
  // Les identifiants composent le chemin du fichier : on les contrôle avant tout.
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide(langue)
  if (!Number.isFinite(dureeMs) || dureeMs <= 0 || dureeMs > DUREE_TOLEREE_MS) {
    return Response.json({ error: t({ fr: 'Durée du message invalide.', en: 'Invalid message length.', de: 'Ungültige Nachrichtenlänge.' }, langue) }, { status: 400 })
  }

  if (await estSuspendu(eventId)) return Response.json({ error: messageSuspendu(langue) }, { status: 403 })

  const { data: evs } = await selectRows('events', `id=eq.${eventId}&select=id,starts_at,ends_at,reveal_at,livre_or_actif`)
  const ev = Array.isArray(evs) ? evs[0] : null
  if (!ev) return Response.json({ error: t({ fr: 'Événement introuvable.', en: 'Event not found.', de: 'Event nicht gefunden.' }, langue) }, { status: 404 })

  // 410 : refus définitif. La file d'attente ne réessaiera pas un message
  // que personne n'acceptera jamais.
  if (!livreOrActif(ev)) {
    return Response.json({ error: t({ fr: 'Le livre d’or n’est pas ouvert pour cette soirée.', en: 'The guestbook isn’t open for this event.', de: 'Das Gästebuch ist für diese Feier nicht geöffnet.' }, langue) }, { status: 410 })
  }
  if (livreOrFerme(ev)) {
    return Response.json({ error: t({ fr: 'La soirée est terminée : le livre d’or est fermé.', en: 'The event is over: the guestbook is closed.', de: 'Die Feier ist vorbei: Das Gästebuch ist geschlossen.' }, langue) }, { status: 410 })
  }

  // Seul l'auteur écrit son message : son identifiant ET le jeton de son appareil.
  const invite = await participantVerifie(eventId, guestId, deviceToken)
  if (!invite) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const brut = Buffer.from(await audio.arrayBuffer())
  if (brut.length > AUDIO_MAX_OCTETS) {
    return Response.json({ error: t({ fr: 'Message trop lourd.', en: 'Message too large.', de: 'Nachricht zu groß.' }, langue) }, { status: 413 })
  }
  if (!estAudio(brut)) {
    return Response.json({ error: t({ fr: 'Ce fichier n’est pas un enregistrement audio.', en: 'This file is not an audio recording.', de: 'Diese Datei ist keine Audioaufnahme.' }, langue) }, { status: 415 })
  }

  const conv = await versM4a(brut, String(audio.type || ''))
  const rand = Math.random().toString(36).slice(2, 8)
  const base = `${eventId}/livre-or/${guestId}/${Date.now()}-${rand}`
  const audioPath = `${base}.${conv.ext}`
  const up = await uploadPhoto(audioPath, conv.octets, conv.mime)
  if (!up.ok) {
    console.error('livre d’or : envoi audio', up.status)
    return Response.json({ error: t({ fr: 'Échec de l’envoi du message.', en: 'The message could not be uploaded.', de: 'Die Nachricht konnte nicht hochgeladen werden.' }, langue) }, { status: 500 })
  }

  // Le selfie est facultatif (« Passer ») : sans lui, les mariés verront une
  // photo prise par l'invité pendant la soirée, ou son initiale.
  let selfiePath = null
  if (selfie && typeof selfie !== 'string') {
    const sb = Buffer.from(await selfie.arrayBuffer())
    if (sb.length > 0 && sb.length <= SELFIE_MAX_OCTETS && estImage(sb)) {
      const sp = `${base}_selfie.jpg`
      const sup = await uploadPhoto(sp, sb, 'image/jpeg')
      if (sup.ok) selfiePath = sp
    }
  }

  // L'ancien message, s'il existe : ses fichiers partent une fois le nouveau écrit.
  const { data: anciens } = await selectRows('voice_messages', `event_id=eq.${eventId}&guest_id=eq.${guestId}&select=audio_path,selfie_path`)
  const ancien = Array.isArray(anciens) ? anciens[0] : null

  const maintenant = new Date().toISOString()
  const ecrit = await upsertRow('voice_messages', {
    event_id: eventId,
    guest_id: guestId,
    kind: 'voice',
    audio_path: audioPath,
    mime_type: conv.mime,
    duration_ms: Math.min(dureeMs, DUREE_TOLEREE_MS),
    selfie_path: selfiePath,
    selfie_mime_type: selfiePath ? 'image/jpeg' : null,
    waveform: ondeValide(form.get('waveform')),
    created_at: maintenant,
    updated_at: maintenant,
  }, 'event_id,guest_id')

  if (!ecrit.ok) {
    await deletePhotos([audioPath, selfiePath].filter(Boolean))
    console.error('livre d’or : écriture', ecrit.status, ecrit.data)
    return Response.json({ error: t({ fr: 'Erreur serveur.', en: 'Server error.', de: 'Serverfehler.' }, langue) }, { status: 500 })
  }

  if (ancien) {
    const perimes = [ancien.audio_path, ancien.selfie_path].filter((p) => p && p !== audioPath && p !== selfiePath)
    if (perimes.length) await deletePhotos(perimes)
  }

  return Response.json({ ok: true, voix: { durationMs: ecrit.data?.duration_ms, createdAt: ecrit.data?.created_at, selfie: !!selfiePath } })
}
