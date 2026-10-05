import { selectRows, signPhotos } from '../../../../../lib/supabase'
import { roleFor, canManage } from '../../../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'
import { t } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'

// ============================================================
//  Le livre d'or des mariés : tous les messages vocaux d'un événement.
//
//  Réservé aux hôtes (organisateur et co-organisateurs). Un participant, même
//  inscrit à la soirée, reçoit un refus : les messages sont écrits pour les
//  mariés, personne d'autre ne les écoute.
//
//  Pas de révélation ici : un message s'écoute dès qu'il est arrivé.
// ============================================================
export async function GET(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)

  const role = await roleFor(id, request.headers.get('x-owner-token'))
  if (!canManage(role)) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const { data: evs } = await selectRows('events', `id=eq.${id}&select=livre_or_actif`)
  const actif = !!(Array.isArray(evs) && evs[0]?.livre_or_actif)

  // Ordre chronologique : c'est celui de « Tout écouter ».
  const { data } = await selectRows(
    'voice_messages',
    `event_id=eq.${id}&select=id,guest_id,audio_path,selfie_path,duration_ms,mime_type,waveform,created_at,guests(display_name)&order=created_at.asc`
  )
  const lignes = Array.isArray(data) ? data : []

  // Sans selfie (« Passer »), on signe le message d'une photo que l'invité a
  // prise pendant la soirée. Sa première, parmi celles que les mariés n'ont
  // pas masquées.
  const sansSelfie = lignes.filter((l) => !l.selfie_path).map((l) => l.guest_id)
  const repli = {}
  if (sansSelfie.length) {
    const { data: ph } = await selectRows(
      'photos',
      `event_id=eq.${id}&guest_id=in.(${sansSelfie.join(',')})&hidden=is.false&select=guest_id,thumb_path,storage_path&order=taken_at.asc`
    )
    for (const p of Array.isArray(ph) ? ph : []) {
      if (!repli[p.guest_id]) repli[p.guest_id] = p.thumb_path || p.storage_path
    }
  }

  const chemins = []
  for (const l of lignes) {
    chemins.push(l.audio_path)
    if (l.selfie_path) chemins.push(l.selfie_path)
    else if (repli[l.guest_id]) chemins.push(repli[l.guest_id])
  }
  const signes = await signPhotos(chemins, 6 * 3600)

  const messages = lignes.map((l) => {
    const visage = l.selfie_path || repli[l.guest_id] || null
    return {
      id: l.id,
      prenom: l.guests?.display_name || '',
      createdAt: l.created_at,
      durationMs: l.duration_ms,
      mimeType: l.mime_type,
      onde: Array.isArray(l.waveform) ? l.waveform : null,
      url: signes[l.audio_path] || null,
      visage: visage ? signes[visage] || null : null,
      // Le selfie est la signature voulue ; la photo de soirée n'est qu'un repli.
      visageType: l.selfie_path ? 'selfie' : visage ? 'photo' : null,
    }
  })

  return Response.json({ actif, messages })
}
