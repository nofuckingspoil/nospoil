// ============================================================
//  Retirer un participant d'un événement.
//
//  Exigé par Apple, règle 1.2 : « the ability to block abusive users from the
//  service ». Transposé à ce produit, l'utilisateur abusif est le participant
//  qui publie des photos déplacées dans la soirée de quelqu'un d'autre.
//
//  Retirer quelqu'un fait trois choses, et les trois comptent :
//   1. ses photos disparaissent de l'album, fichiers compris ;
//   2. sa fiche est marquée « retiré », ce qui lui ferme la porte : sans cela
//      il rescannerait le QR code et reviendrait dans la minute (voir le
//      garde-fou de /api/join) ;
//   3. sa place est rendue, le quota de l'événement se libère d'autant.
//
//  Réservé à l'organisateur et à ses co-organisateurs : c'est leur soirée.
// ============================================================
import { selectRows, updateRow, deleteRows } from '../../../../../lib/supabase'
import { deletePhotos } from '../../../../../lib/r2'
import { roleFor, canManage } from '../../../../../lib/authz'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'
import { t } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'

export async function DELETE(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)

  if (!canManage(await roleFor(id, request.headers.get('x-owner-token')))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const guestId = (body.guestId || '').toString()
  if (!estUuid(guestId)) return identifiantInvalide(langue)

  const g = await selectRows('guests', `id=eq.${guestId}&event_id=eq.${id}&select=id,display_name`)
  const invite = Array.isArray(g.data) ? g.data[0] : null
  if (!invite) return Response.json({ error: t({ fr: 'Participant introuvable.', en: 'Guest not found.', de: 'Gast nicht gefunden.' }, langue) }, { status: 404 })

  // Les fichiers d'abord : une ligne supprimée sans son fichier laisserait une
  // photo orpheline dans le stockage, facturée et jamais nettoyée.
  const ph = await selectRows('photos', `guest_id=eq.${guestId}&select=id,storage_path,thumb_path,view_path`)
  const lignes = Array.isArray(ph.data) ? ph.data : []
  const fichiers = []
  for (const p of lignes) {
    if (p.storage_path) fichiers.push(p.storage_path)
    if (p.thumb_path) fichiers.push(p.thumb_path)
    if (p.view_path) fichiers.push(p.view_path)
  }
  if (fichiers.length) await deletePhotos(fichiers)

  // Les coeurs posés SUR SES PHOTOS seulement. Effacer tous les favoris de
  // l'événement priverait les autres invités des leurs, qui n'y sont pour rien.
  const ids = lignes.map((p) => p.id).filter(Boolean)
  if (ids.length) await deleteRows('favorites', `photo_id=in.(${ids.join(',')})`)
  await deleteRows('photos', `guest_id=eq.${guestId}`)

  // La fiche RESTE, marquée : c'est elle qui porte le jeton d'appareil, et donc
  // la mémoire du blocage. La supprimer rouvrirait la porte.
  const maj = await updateRow('guests', `id=eq.${guestId}`, {
    blocked: true,
    display_name: 'Participant retiré',
    email: null,
    phone: null,
    shots_taken: 0,
  })
  if (!maj.ok) return Response.json({ error: t({ fr: 'Retrait impossible.', en: 'Removal not possible.', de: 'Entfernen nicht möglich.' }, langue) }, { status: 500 })

  return Response.json({ ok: true, photosSupprimees: fichiers.length })
}
