import { selectRows, updateRow, uploadPhoto, deletePhotos } from '../../../../lib/supabase'
import { estSuspendu, messageSuspendu } from '../../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { estImage } from '../../../../lib/image'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'
import { livreOrActif, livreOrFerme, participantVerifie, SELFIE_MAX_OCTETS } from '../../../../lib/livre-or'

export const runtime = 'nodejs'

// ============================================================
//  Reprendre seulement le selfie d'un message déjà déposé.
//
//  Un selfie raté (noir, flou, les yeux fermés) ne doit jamais rester : le
//  participant le refait sans réenregistrer sa voix. Même preuve que pour le
//  message (identifiant + jeton de l'appareil), mêmes heures d'ouverture.
//  L'ancien selfie est effacé du stockage une fois le nouveau rangé.
// ============================================================
export async function POST(request) {
  let langue = langueRequete(request)
  let form
  try { form = await request.formData() } catch {
    return Response.json({ error: t({ fr: 'Requête invalide.', en: 'Invalid request.', de: 'Ungültige Anfrage.' }, langue) }, { status: 400 })
  }
  langue = langueValide(form.get('langue')) || langue
  const selfie = form.get('selfie')
  const eventId = form.get('eventId')
  const guestId = form.get('guestId')
  const deviceToken = form.get('deviceToken')

  if (!selfie || typeof selfie === 'string' || !eventId || !guestId || !deviceToken) {
    return Response.json({ error: t({ fr: 'Paramètres manquants.', en: 'Missing parameters.', de: 'Fehlende Parameter.' }, langue) }, { status: 400 })
  }
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide(langue)
  if (await estSuspendu(eventId)) return Response.json({ error: messageSuspendu(langue) }, { status: 403 })

  const { data: evs } = await selectRows('events', `id=eq.${eventId}&select=id,starts_at,ends_at,reveal_at,livre_or_actif`)
  const ev = Array.isArray(evs) ? evs[0] : null
  if (!ev || !livreOrActif(ev) || livreOrFerme(ev)) {
    return Response.json({ error: t({ fr: 'Le livre d’or est fermé.', en: 'The guestbook is closed.', de: 'Das Gästebuch ist geschlossen.' }, langue) }, { status: 410 })
  }
  const invite = await participantVerifie(eventId, guestId, deviceToken)
  if (!invite) return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })

  const { data: lignes } = await selectRows('voice_messages', `event_id=eq.${eventId}&guest_id=eq.${guestId}&select=id,audio_path,selfie_path`)
  const message = Array.isArray(lignes) ? lignes[0] : null
  // Pas encore de message (il attend peut-être encore sur le téléphone) : le
  // selfie partira avec lui. 409 : on réessaiera plus tard.
  if (!message) return Response.json({ error: t({ fr: 'Ton message n’est pas encore arrivé.', en: 'Your message hasn’t arrived yet.', de: 'Ihre Nachricht ist noch nicht angekommen.' }, langue) }, { status: 409 })

  const octets = Buffer.from(await selfie.arrayBuffer())
  if (!octets.length || octets.length > SELFIE_MAX_OCTETS || !estImage(octets)) {
    return Response.json({ error: t({ fr: 'Ce selfie n’a pas pu être lu.', en: 'This selfie couldn’t be read.', de: 'Dieses Selfie konnte nicht gelesen werden.' }, langue) }, { status: 415 })
  }
  const base = String(message.audio_path).replace(/\.[a-z0-9]+$/i, '')
  const chemin = `${base}_selfie_${Date.now().toString(36)}.jpg`
  const up = await uploadPhoto(chemin, octets, 'image/jpeg')
  if (!up.ok) return Response.json({ error: t({ fr: 'Échec de l’envoi du selfie.', en: 'The selfie could not be uploaded.', de: 'Das Selfie konnte nicht hochgeladen werden.' }, langue) }, { status: 500 })

  const maj = await updateRow('voice_messages', `id=eq.${message.id}`, { selfie_path: chemin, selfie_mime_type: 'image/jpeg', updated_at: new Date().toISOString() })
  if (!maj.ok) {
    await deletePhotos([chemin])
    return Response.json({ error: t({ fr: 'Erreur serveur.', en: 'Server error.', de: 'Serverfehler.' }, langue) }, { status: 500 })
  }
  if (message.selfie_path && message.selfie_path !== chemin) await deletePhotos([message.selfie_path])
  return Response.json({ ok: true })
}
