import { selectRows, updateRow, signPhotos, deleteRows, deletePhotos } from '../../../../lib/supabase'
import { normalizeEmail, isValidEmail } from '../../../../lib/account'
import { purgeDateISO } from '../../../../lib/retention'
import { roleFor, canManage, canDelete, ADMIN } from '../../../../lib/authz'
import { eventPhase, isRevealed, quotaLocked, quotaExceeded, JOUR_J } from '../../../../lib/phase'
import { tierForCount, upgradeCents } from '../../../../lib/pricing'
import { notifyGuestsOfAlbum } from '../../../../lib/notify-guests'

// Un invité est considéré « en train de jouer » si son appareil a donné signe
// de vie récemment (scan ou photo).
const ACTIF_MS = 10 * 60 * 1000

export async function GET(request, { params }) {
  const { id } = await params

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,cover_url,cover_pos,shots_per_guest,bonus_shots,starts_at,reveal_at,published_at,reveal_paused,status,owner_token,owner_email,owner_name,gallery_code,download_count,max_guests`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Organisateur ou co-admin : les deux voient le tableau de bord complet.
  // Seule la suppression leur est distinguée (voir DELETE plus bas).
  const ownerToken = request.headers.get('x-owner-token')
  const role = await roleFor(id, ownerToken)
  const isOwner = canManage(role)

  // URL signée temporaire pour la photo de couverture (si présente)
  let coverUrl = null
  if (ev.cover_url) {
    const map = await signPhotos([ev.cover_url], 6 * 3600)
    coverUrl = map[ev.cover_url] || null
  }

  // Compteurs publics (participants + photos) — affichés sur l'écran d'album des
  // invités. Comptés avant tout le reste : le nombre d'invités décide aussi si
  // l'album peut s'ouvrir (formule dépassée = révélation en attente).
  const [guests, photos] = await Promise.all([
    selectRows('guests', `event_id=eq.${id}&select=id`),
    selectRows('photos', `event_id=eq.${id}&select=id`),
  ])
  const guestCount = Array.isArray(guests.data) ? guests.data.length : 0
  const photoCount = Array.isArray(photos.data) ? photos.data.length : 0

  // Infos publiques : nécessaires aux invités (nom, date, nb de clichés)
  const dates = {
    startsAt: ev.starts_at,
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount,
  }
  const payload = {
    guestCount,
    photoCount,
    id: ev.id,
    name: ev.name,
    hostNames: ev.host_names,
    coverUrl,
    coverPos: ev.cover_pos || null,
    shotsPerGuest: ev.shots_per_guest,
    bonusShots: ev.bonus_shots ?? 0,
    startsAt: ev.starts_at,
    revealAt: ev.reveal_at,
    status: ev.status,
    revealed: isRevealed(dates),
    phase: eventPhase(dates),
    isOwner,
  }

  // Numéros collectés + liste des admins : réservés à l'organisateur
  if (isOwner) {
    // Contacts laissés par les invités : les adresses mail (envoi automatique de
    // l'album) et les numéros recueillis avant le passage au mail.
    const list = await selectRows(
      'guests',
      `event_id=eq.${id}&or=(email.not.is.null,phone.not.is.null)` +
        `&select=display_name,email,phone,notified_at,notify_failed&order=created_at.asc`
    )
    payload.contacts = (Array.isArray(list.data) ? list.data : []).map((g) => ({
      name: g.display_name,
      email: g.email || null,
      phone: g.phone || null,
      notified: !!g.notified_at,
      failed: !!g.notify_failed,
    }))

    const admins = await selectRows('event_admins', `event_id=eq.${id}&select=id,name,email,invited_at,joined_at&order=created_at.asc`)
    payload.admins = (Array.isArray(admins.data) ? admins.data : []).map((a) => ({ id: a.id, name: a.name, email: a.email, invitedAt: a.invited_at, joinedAt: a.joined_at }))

    payload.role = role // 'owner' | 'admin' — pilote l'accès à la suppression
    payload.ownerName = ev.owner_name || null
    payload.ownerEmail = ev.owner_email || null // mail de connexion de l'organisateur
    payload.galleryCode = ev.gallery_code || null // code d'accès à la galerie (si activé)
    payload.downloadCount = ev.download_count || 0 // nb de "Tout télécharger"
    payload.publishedAt = ev.published_at || null // album validé par l'organisateur
    payload.revealPaused = !!ev.reveal_paused // frein d'urgence
    payload.quotaLocked = quotaLocked(dates) // le nb de photos/invité est-il figé ?

    // Formule souscrite et dépassement éventuel. Si la formule est trop petite,
    // on indique déjà celle qu'il faut viser et ce qu'il reste à régler : le
    // message doit être actionnable, pas seulement alarmant.
    payload.maxGuests = ev.max_guests || null
    payload.quotaExceeded = quotaExceeded(dates)
    if (payload.quotaExceeded) {
      const cible = tierForCount(guestCount)
      payload.upgrade = {
        maxGuests: cible.maxGuests,
        priceCents: upgradeCents(ev.max_guests, cible.maxGuests),
      }
    }

    // Pendant la soirée, l'organisateur veut voir que ça tourne : qui joue,
    // et les dernières photos arrivées (lui seul — les invités ne voient rien).
    if (payload.phase === JOUR_J) {
      const seuil = Date.now() - ACTIF_MS
      const roster = await selectRows(
        'guests',
        `event_id=eq.${id}&select=id,display_name,shots_taken,bonus_shots,last_active_at&order=last_active_at.desc.nullslast&limit=40`
      )
      payload.guests = (Array.isArray(roster.data) ? roster.data : []).map((g) => ({
        id: g.id,
        name: g.display_name,
        shots: g.shots_taken || 0,
        total: ev.shots_per_guest + (g.bonus_shots || 0),
        active: !!g.last_active_at && new Date(g.last_active_at).getTime() >= seuil,
      }))
      payload.activeNow = payload.guests.filter((g) => g.active).length

      const recent = await selectRows(
        'photos',
        `event_id=eq.${id}&select=id,storage_path,thumb_path,taken_at&order=taken_at.desc&limit=8`
      )
      const rows = Array.isArray(recent.data) ? recent.data : []
      const signed = await signPhotos(rows.map((r) => r.thumb_path || r.storage_path), 3600)
      payload.recentPhotos = rows
        .map((r) => ({ id: r.id, url: signed[r.thumb_path || r.storage_path], takenAt: r.taken_at }))
        .filter((p) => p.url)
    }
  }

  return Response.json(payload)
}

// Modification de réglages (réservée à l'organisateur/admin) : date de révélation, code galerie
export async function PATCH(request, { params }) {
  const { id } = await params
  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { data } = await selectRows('events', `id=eq.${id}&select=id,name,owner_token,starts_at,reveal_at,reveal_paused,max_guests,bonus_shots`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  // Les réglages du quotidien sont ouverts aux co-admins : c'est le sens même
  // de les inviter. Seule la suppression reste au propriétaire.
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const patch = {}

  // Cadrage de la couverture, au format « X% Y% ». Validé strictement : cette
  // valeur part telle quelle dans une propriété CSS.
  if (body.coverPos !== undefined) {
    const v = (body.coverPos || '').toString().trim()
    if (v === '') patch.cover_pos = null
    else if (/^\d{1,3}% \d{1,3}%$/.test(v)) patch.cover_pos = v
    else return Response.json({ error: 'Cadrage invalide.' }, { status: 400 })
  }

  // Nom de l'événement : s'affiche chez les invités, donc modifiable à tout moment
  // (une faute de frappe ne doit pas rester figée jusqu'à la révélation).
  if (body.name !== undefined) {
    const clean = String(body.name).trim().slice(0, 80)
    if (!clean) return Response.json({ error: "Donnez un nom à votre événement." }, { status: 400 })
    patch.name = clean
  }

  // Date et heure de la soirée : pilote l'affichage du tableau de bord.
  if (body.startsAt !== undefined) {
    const start = new Date(body.startsAt)
    if (isNaN(start.getTime())) return Response.json({ error: 'Date de l’événement invalide.' }, { status: 400 })
    patch.starts_at = start.toISOString()
  }

  // Photos par invité : modifiable tant que la soirée n'a pas commencé.
  // Après, tout le monde n'aurait pas joué au même jeu.
  if (body.shotsPerGuest !== undefined) {
    if (quotaLocked({ startsAt: patch.starts_at || ev.starts_at })) {
      return Response.json({ error: 'La soirée a commencé : le nombre de photos est figé.' }, { status: 409 })
    }
    const n = parseInt(body.shotsPerGuest, 10)
    if (!Number.isFinite(n) || n < 3 || n > 30) {
      return Response.json({ error: 'Nombre de photos invalide (entre 3 et 30).' }, { status: 400 })
    }
    patch.shots_per_guest = n
  }

  // Recharge unique : 0 pour la refuser, jusqu'à 5 photos sinon. Modifiable
  // tant que la soirée n'a pas commencé, comme le nombre de prises.
  if (body.bonusShots !== undefined) {
    if (quotaLocked({ startsAt: patch.starts_at || ev.starts_at })) {
      return Response.json({ error: 'La soirée a commencé : la recharge est figée.' }, { status: 409 })
    }
    const n = parseInt(body.bonusShots, 10)
    if (!Number.isFinite(n) || n < 0 || n > 5) {
      return Response.json({ error: 'Recharge invalide (entre 0 et 5).' }, { status: 400 })
    }
    patch.bonus_shots = n
  }

  // Validation de l'album par l'organisateur. Facultative : sans elle, la
  // révélation part quand même à l'heure prévue.
  if (body.published !== undefined) {
    patch.published_at = body.published ? new Date().toISOString() : null
  }

  // Frein d'urgence : gèle la révélation tant qu'il n'a pas réactivé.
  if (body.revealPaused !== undefined) {
    patch.reveal_paused = body.revealPaused === true
  }

  if (body.revealAt !== undefined) {
    const reveal = new Date(body.revealAt)
    if (isNaN(reveal.getTime())) return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
    patch.reveal_at = reveal.toISOString()
    patch.expires_at = purgeDateISO(reveal) // rétention : 6 mois après la révélation (CGV art. 8)
    // La date de suppression change : les alertes déjà envoyées ne valent plus.
    patch.warned_1m_at = null
    patch.warned_1w_at = null
  }

  // Mail de l'organisateur : permet de se reconnecter depuis n'importe quel appareil
  if (body.ownerEmail !== undefined) {
    const email = normalizeEmail(body.ownerEmail)
    if (!isValidEmail(email)) return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
    patch.owner_email = email
  }

  // Code d'accès à la galerie : chaîne pour l'activer, "" ou null pour le retirer
  if (body.galleryCode !== undefined) {
    const code = (body.galleryCode || '').toString().trim()
    patch.gallery_code = code ? code.slice(0, 40) : null
  }

  // Rien n'empêchait de révéler les photos avant la fête : on vérifie le couple
  // résultant, et non chaque date isolément.
  if (patch.starts_at || patch.reveal_at) {
    const debut = new Date(patch.starts_at || ev.starts_at).getTime()
    const rev = new Date(patch.reveal_at || ev.reveal_at).getTime()
    if (Number.isFinite(debut) && Number.isFinite(rev) && rev <= debut) {
      return Response.json(
        { error: 'La révélation doit venir après le début de l’événement.' },
        { status: 400 }
      )
    }
  }

  if (!Object.keys(patch).length) return Response.json({ error: 'Rien à modifier.' }, { status: 400 })

  const upd = await updateRow('events', `id=eq.${id}`, patch)
  if (!upd.ok) return Response.json({ error: 'Modification impossible.' }, { status: 500 })

  // Si ce réglage vient d'ouvrir l'album (« révéler maintenant », reprise après
  // suspension), les invités qui ont laissé leur adresse reçoivent le lien tout
  // de suite — sans attendre le passage de la tâche planifiée. Sans effet si
  // l'album n'est pas ouvert, et jamais deux fois pour le même invité.
  let notified = null
  try {
    notified = await notifyGuestsOfAlbum(upd.data || { ...ev, ...patch, id })
  } catch (err) {
    console.error('envoi du lien de l’album:', err)
  }

  return Response.json({ ok: true, notified })
}

// Suppression d'un événement (réservée à l'organisateur) : photos, invités, fichiers et ligne
export async function DELETE(request, { params }) {
  const { id } = await params

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=owner_token,cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Le seul geste réservé au propriétaire : il efface les photos de tous les
  // invités, sans retour possible. Un co-admin ne doit pas pouvoir le faire.
  const role = await roleFor(id, ownerToken)
  if (!canDelete(role)) {
    return Response.json({
      error: role === ADMIN
        ? "Seul l'organisateur peut supprimer l'événement."
        : 'Action non autorisée.',
    }, { status: 403 })
  }

  // Fichiers à effacer du Storage : toutes les photos + la couverture éventuelle
  const ph = await selectRows('photos', `event_id=eq.${id}&select=storage_path`)
  const paths = (Array.isArray(ph.data) ? ph.data : []).map((p) => p.storage_path).filter(Boolean)
  if (ev.cover_url) paths.push(ev.cover_url)
  if (paths.length) await deletePhotos(paths)

  // Lignes liées d'abord (contraintes de clés), puis l'événement
  await deleteRows('photos', `event_id=eq.${id}`)
  await deleteRows('guests', `event_id=eq.${id}`)
  const del = await deleteRows('events', `id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  return Response.json({ ok: true })
}
