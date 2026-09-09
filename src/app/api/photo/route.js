import { rpc, uploadPhoto, deletePhoto, updateRow } from '../../../lib/supabase'
import { estSuspendu, envoiFerme, MESSAGE_SUSPENDU } from '../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../lib/params'
import { estImage, miniature } from '../../../lib/image'

export const runtime = 'nodejs'
// Autorise des images compressées jusqu'à ~8 Mo
export const maxDuration = 30

export async function POST(request) {
  let form
  try { form = await request.formData() } catch { return Response.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const file = form.get('file')
  const thumb = form.get('thumb') // mini-version facultative (pour alléger l'album)
  const eventId = form.get('eventId')
  const guestId = form.get('guestId')
  const deviceToken = form.get('deviceToken')

  if (!file || typeof file === 'string' || !eventId || !guestId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }
  // Les deux identifiants composent le chemin du fichier dans le stockage :
  // mal formés, ils ne désignent plus seulement une ligne de la base, ils
  // choisissent un emplacement sur le disque. On les contrôle avant tout.
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide()

  // Suspendu par l'administration : plus aucune photo n'entre. Vérifié avant
  // de lire le fichier, pour ne pas transférer des octets qu'on jettera.
  if (await estSuspendu(eventId)) {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

  // La fête est finie : on n'ajoute plus rien à un album déjà ouvert. Vérifié
  // avant de lire le fichier, pour ne pas transférer des octets qu'on jettera.
  if (await envoiFerme(eventId)) {
    return Response.json(
      { error: 'Cette soirée est terminée : son album est déjà révélé.' },
      { status: 403 }
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) {
    return Response.json({ error: 'Photo trop lourde.' }, { status: 413 })
  }
  if (!estImage(bytes)) {
    return Response.json({ error: "Ce fichier n'est pas une image." }, { status: 415 })
  }

  // Chemin : eventId/guestId/horodatage-aléatoire.jpg
  const rand = Math.random().toString(36).slice(2, 8)
  const path = `${eventId}/${guestId}/${Date.now()}-${rand}.jpg`

  const up = await uploadPhoto(path, bytes, 'image/jpeg')
  if (!up.ok) {
    console.error('upload error', up.status)
    return Response.json({ error: "Échec de l'envoi de la photo." }, { status: 500 })
  }

  // Mini-version : celle du navigateur si elle est là, sinon fabriquée ici.
  //
  // L'app native ne peut poster qu'un fichier à la fois : ses photos arrivaient
  // seules, et c'est l'originale qui redescendait ensuite sur les téléphones.
  // On la taille donc côté serveur, une fois pour toutes.
  //
  // Échec silencieux dans les deux cas : on retombera sur la pleine qualité.
  let thumbPath = null
  let tbytes = null
  if (thumb && typeof thumb !== 'string') {
    try {
      const recu = Buffer.from(await thumb.arrayBuffer())
      if (recu.length > 0 && recu.length < 2 * 1024 * 1024) tbytes = recu
    } catch {}
  }
  if (!tbytes) tbytes = await miniature(bytes)
  if (tbytes) {
    const tp = path.replace(/\.jpg$/, '_thumb.jpg')
    const tup = await uploadPhoto(tp, tbytes, 'image/jpeg')
    if (tup.ok) thumbPath = tp
  }

  // Réserve le cliché (atomique) + enregistre la ligne photo
  const { ok, data } = await rpc('take_photo', {
    p_event_id: eventId,
    p_guest_id: guestId,
    p_device_token: deviceToken,
    p_storage_path: path,
  })

  if (!ok || data?.status === 'error') {
    await deletePhoto(path)
    return Response.json({ error: data?.message || 'Erreur serveur.' }, { status: 500 })
  }
  if (data?.status === 'full') {
    await deletePhoto(path) // on annule l'upload : plus de clichés disponibles
    if (thumbPath) await deletePhoto(thumbPath)
    return Response.json({ full: true, error: data.message }, { status: 409 })
  }

  // Associe la mini-version à la ligne photo créée (repérée par son chemin unique)
  if (thumbPath) {
    await updateRow('photos', `storage_path=eq.${encodeURIComponent(path)}`, { thumb_path: thumbPath })
  }

  // Signe de vie du participant : alimente l'indicateur « joue en ce moment »
  // du tableau de bord. Un échec ici ne doit pas faire rater la photo.
  try {
    await updateRow('guests', `id=eq.${guestId}`, { last_active_at: new Date().toISOString() })
  } catch {}

  return Response.json({ shotsTaken: data.shots_taken, shotsPerGuest: data.shots_per_guest })
}
