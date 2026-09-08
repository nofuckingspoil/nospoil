// ============================================================
//  Les abonnements aux notifications de soirée.
//
//  GET  : la clé publique, dont le navigateur a besoin pour s'abonner.
//  POST : enregistre (ou met à jour) l'abonnement d'un téléphone.
//
//  Le participant est reconnu comme partout ailleurs : par le jeton de son
//  appareil. Sans cette vérification, n'importe qui pourrait abonner le
//  téléphone d'un autre, ou inscrire un invité qui n'existe pas.
// ============================================================
import { selectRows, insertRow, updateRow } from '../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../lib/params'
import { clePublique, pushConfigure } from '../../../lib/push-envoi'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Pas de clé configurée : on le dit sans détour, le navigateur renoncera
  // proprement au lieu de créer un abonnement que personne ne pourra servir.
  return Response.json({ cle: pushConfigure() ? clePublique() : null })
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, guestId, deviceToken, abonnement } = body

  if (!eventId || !guestId || !deviceToken || !abonnement) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }
  if (!estUuid(eventId) || !estUuid(guestId)) return identifiantInvalide()

  const endpoint = String(abonnement.endpoint || '')
  const p256dh = String(abonnement.keys?.p256dh || '')
  const auth = String(abonnement.keys?.auth || '')
  // Une adresse d'abonnement est toujours une URL https d'un service de
  // notification (Google, Mozilla, Microsoft). Tout le reste est écarté.
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 2000 || !p256dh || !auth) {
    return Response.json({ error: 'Abonnement invalide.' }, { status: 400 })
  }

  // Le participant est-il bien celui qu'il dit être, sur cet événement ?
  const { ok, data } = await selectRows(
    'guests',
    `id=eq.${guestId}&event_id=eq.${eventId}&device_token=eq.${encodeURIComponent(deviceToken)}&select=id,blocked`
  )
  const g = Array.isArray(data) ? data[0] : null
  if (!ok || !g || g.blocked) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  // Ce téléphone est peut-être déjà abonné : d'une soirée précédente, ou de
  // celle-ci s'il a rouvert la page. On réutilise la ligne plutôt que d'en
  // empiler une deuxième, ce qui doublerait chaque rappel.
  const existant = await selectRows(
    'push_subscriptions',
    `endpoint=eq.${encodeURIComponent(endpoint)}&select=id,event_id`
  )
  const ligne = Array.isArray(existant.data) ? existant.data[0] : null

  if (ligne) {
    const patch = { event_id: eventId, guest_id: guestId, p256dh, auth }
    // Nouvelle soirée sur le même téléphone : on repart à zéro. Garder les
    // marques de la précédente ferait sauter les premiers rappels de celle-ci.
    if (ligne.event_id !== eventId) {
      patch.last_sent_at = null
      patch.revealed_at = null
    }
    const maj = await updateRow('push_subscriptions', `id=eq.${ligne.id}`, patch)
    if (!maj.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
    return Response.json({ ok: true })
  }

  const cree = await insertRow('push_subscriptions', {
    event_id: eventId,
    guest_id: guestId,
    endpoint,
    p256dh,
    auth,
  })
  if (!cree.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  return Response.json({ ok: true })
}
