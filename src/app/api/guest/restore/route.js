import { selectRows, updateRow } from '../../../../lib/supabase'
import { normalizeEmail } from '../../../../lib/account'

// ============================================================
//  Reconnexion d'un invité depuis son lien personnel.
//
//  Son identité tenait dans le stockage de son navigateur : changer de
//  téléphone ou le nettoyer lui faisait perdre ses poses restantes et
//  l'accès à ses propres photos. Le jeton reçu par mail rattache cette
//  identité au navigateur courant.
//
//  Une même adresse peut avoir participé à plusieurs événements : on les
//  rattache tous d'un coup, et on les renvoie pour affichage.
// ============================================================

export async function POST(request) {
  const { token, deviceToken } = await request.json().catch(() => ({}))
  if (!token || !deviceToken) {
    return Response.json({ error: 'Lien incomplet.' }, { status: 400 })
  }

  const { data } = await selectRows(
    'guests',
    `token=eq.${encodeURIComponent(token)}&select=id,event_id,display_name,email`
  )
  const source = Array.isArray(data) ? data[0] : null
  if (!source) {
    return Response.json({ error: 'Ce lien n’est plus valable.' }, { status: 404 })
  }

  // Toutes les participations de cette adresse. Le jeton prouve qu'on a reçu le
  // mail, donc qu'on contrôle l'adresse : on peut rattacher l'ensemble.
  const email = normalizeEmail(source.email)
  let rows = [source]
  if (email) {
    const all = await selectRows(
      'guests',
      `email=eq.${encodeURIComponent(email)}&select=id,event_id,display_name,email`
    )
    if (Array.isArray(all.data) && all.data.length) rows = all.data
  }

  const evIds = [...new Set(rows.map((r) => r.event_id).filter(Boolean))]
  const evRes = await selectRows(
    'events',
    `id=in.(${evIds.join(',')})&status=eq.active&purged_at=is.null` +
      `&select=id,name,host_names,starts_at,reveal_at,reveal_paused,shots_per_guest`
  )
  const events = new Map((Array.isArray(evRes.data) ? evRes.data : []).map((e) => [e.id, e]))

  const sorties = []
  for (const r of rows) {
    const ev = events.get(r.event_id)
    if (!ev) continue // événement supprimé ou purgé : rien à rattacher

    // Rattache la participation à ce navigateur. La contrainte d'unicité porte
    // sur (événement, appareil) : un même appareil peut donc porter plusieurs
    // participations, une par événement.
    await updateRow('guests', `id=eq.${r.id}`, {
      device_token: deviceToken,
      last_active_at: new Date().toISOString(),
    })

    const photos = await selectRows('photos', `event_id=eq.${ev.id}&guest_id=eq.${r.id}&select=id`)
    sorties.push({
      eventId: ev.id,
      guestId: r.id,
      displayName: r.display_name,
      eventName: ev.name,
      hostNames: ev.host_names,
      startsAt: ev.starts_at,
      revealAt: ev.reveal_at,
      shotsPerGuest: ev.shots_per_guest,
      myPhotos: Array.isArray(photos.data) ? photos.data.length : 0,
    })
  }

  if (!sorties.length) {
    return Response.json({ error: 'Ces événements ne sont plus disponibles.' }, { status: 404 })
  }

  sorties.sort((a, b) => new Date(b.startsAt || 0) - new Date(a.startsAt || 0))
  return Response.json({ email: email || null, events: sorties })
}
