import { selectRows, updateRow, uploadPhoto, deletePhoto } from '../../../../../lib/supabase'
import { roleFor, canManage } from '../../../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'
import { estImage } from '../../../../../lib/image'
import { t } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'

export const runtime = 'nodejs'
export const maxDuration = 30

// Upload de la photo de couverture (réservé à l'organisateur de l'événement)
export async function POST(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)

  let form
  try { form = await request.formData() } catch { return Response.json({ error: t({ fr: 'Requête invalide.', en: 'Invalid request.', de: 'Ungültige Anfrage.' }, langue) }, { status: 400 }) }

  const file = form.get('file')
  const ownerToken = form.get('ownerToken')
  if (!file || typeof file === 'string' || !ownerToken) {
    return Response.json({ error: t({ fr: 'Paramètres manquants.', en: 'Missing parameters.', de: 'Fehlende Parameter.' }, langue) }, { status: 400 })
  }

  const { ok: found, data } = await selectRows('events', `id=eq.${id}&select=owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!found || !ev) return Response.json({ error: t({ fr: 'Événement introuvable.', en: 'Event not found.', de: 'Event nicht gefunden.' }, langue) }, { status: 404 })
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) return Response.json({ error: t({ fr: 'Image trop lourde.', en: 'Image too large.', de: 'Bild zu groß.' }, langue) }, { status: 413 })
  if (!estImage(bytes)) return Response.json({ error: t({ fr: 'Ce fichier n\'est pas une image.', en: 'This file is not an image.', de: 'Diese Datei ist kein Bild.' }, langue) }, { status: 415 })

  const path = `${id}/cover.jpg`
  const up = await uploadPhoto(path, bytes, 'image/jpeg')
  if (!up.ok) {
    console.error('cover upload error', up.status)
    return Response.json({ error: t({ fr: 'Échec de l\'envoi de l\'image.', en: 'The image could not be uploaded.', de: 'Das Bild konnte nicht hochgeladen werden.' }, langue) }, { status: 500 })
  }

  // Nouvelle photo : le cadrage précédent ne veut plus rien dire.
  const upd = await updateRow('events', `id=eq.${id}`, { cover_url: path, cover_pos: null })
  if (!upd.ok) return Response.json({ error: t({ fr: 'Erreur serveur.', en: 'Server error.', de: 'Serverfehler.' }, langue) }, { status: 500 })

  return Response.json({ ok: true })
}

// Retire la photo de couverture : l'écran d'accueil retrouve son dégradé.
export async function DELETE(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)
  const ownerToken = request.headers.get('x-owner-token')
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const { data } = await selectRows('events', `id=eq.${id}&select=cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: t({ fr: 'Événement introuvable.', en: 'Event not found.', de: 'Event nicht gefunden.' }, langue) }, { status: 404 })

  const upd = await updateRow('events', `id=eq.${id}`, { cover_url: null, cover_pos: null })
  if (!upd.ok) return Response.json({ error: t({ fr: 'Suppression impossible.', en: 'Deletion not possible.', de: 'Löschen nicht möglich.' }, langue) }, { status: 500 })

  // Le fichier part ensuite : si l'effacement échoue, mieux vaut un fichier
  // orphelin qu'une couverture qui réapparaît.
  if (ev.cover_url) { try { await deletePhoto(ev.cover_url) } catch {} }

  return Response.json({ ok: true })
}
