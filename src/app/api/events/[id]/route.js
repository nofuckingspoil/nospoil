import { selectRows, updateRow, signPhotos, deleteRows, deletePhotos } from '../../../../lib/supabase'
import { normalizeEmail, isValidEmail } from '../../../../lib/account'
import { purgeDateISO } from '../../../../lib/retention'
import { roleFor, canManage, canDelete, ADMIN, MESSAGE_SUSPENDU } from '../../../../lib/authz'
import { eventPhase, isRevealed, quotaLocked, quotaExceeded, JOUR_J } from '../../../../lib/phase'
import { finDe, planRappels, nettoyerRappels, dureeMin } from '../../../../lib/rappels'
// (isRevealed sert aussi à figer les dates une fois l'album ouvert, voir PATCH)
import { upgradeFor, SHOTS_MIN, SHOTS_MAX, BONUS_MAX, CONTACT_EMAIL } from '../../../../lib/pricing'
import { notifyGuestsOfAlbum } from '../../../../lib/notify-guests'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { PHOTO_MODES, modeValide } from '../../../../lib/photo-mode'

// Un participant est considéré « en train de jouer » si son appareil a donné signe
// de vie récemment (scan ou photo).
const ACTIF_MS = 10 * 60 * 1000

export async function GET(request, { params }) {
  const { id } = await params
  if (!estUuid(id)) return identifiantInvalide()

  const { ok, data } = await selectRows(
    'events',
    `id=eq.${id}&select=id,name,host_names,cover_url,cover_pos,shots_per_guest,bonus_shots,photo_mode,starts_at,ends_at,reminder_offsets,reveal_at,published_at,reveal_paused,status,owner_token,owner_email,owner_name,gallery_code,download_count,max_guests`
  )
  if (!ok || !Array.isArray(data) || !data[0]) {
    return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  }
  const ev = data[0]

  // Suspendu par l'administration : plus personne n'entre, organisateur compris.
  if (ev.status === 'suspended') {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

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

  // Compteurs publics (participants + photos), affichés sur l'écran d'album des
  // participants. Comptés avant tout le reste : le nombre de participants décide aussi si
  // l'album peut s'ouvrir (formule dépassée = révélation en attente).
  const [guests, photos] = await Promise.all([
    // Les participants retirés par l'organisateur ne comptent plus : leur place
    // est rendue, et l'afficher autrement laisserait croire à un quota atteint
    // alors que le siège est libre.
    selectRows('guests', `event_id=eq.${id}&blocked=is.false&select=id`),
    selectRows('photos', `event_id=eq.${id}&select=id,hidden`),
  ])
  const guestCount = Array.isArray(guests.data) ? guests.data.length : 0
  const photoCount = Array.isArray(photos.data) ? photos.data.length : 0
  // Ce que les participants voient réellement : annoncer « 12 photos, visibles par
  // tous vos participants » alors que trois sont masquées était faux.
  const visibleCount = Array.isArray(photos.data) ? photos.data.filter((p) => !p.hidden).length : 0

  // Infos publiques : nécessaires aux participants (nom, date, nb de clichés)
  const dates = {
    startsAt: ev.starts_at,
    endsAt: ev.ends_at,
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount,
  }
  const payload = {
    guestCount,
    photoCount,
    visibleCount,
    id: ev.id,
    name: ev.name,
    hostNames: ev.host_names,
    coverUrl,
    coverPos: ev.cover_pos || null,
    shotsPerGuest: ev.shots_per_guest,
    bonusShots: ev.bonus_shots ?? 0,
    // Ce que le participant a le droit de revoir de ses propres photos avant la
    // révélation. Public : c'est son appareil qui doit s'y conformer.
    photoMode: modeValide(ev.photo_mode),
    startsAt: ev.starts_at,
    // Fin de la fête : celle qu'a donnée l'organisateur, ou l'estimation.
    // `endsAtSet` distingue les deux, le tableau de bord ne dit pas « fin
    // prévue » pour une heure que personne n'a jamais choisie.
    endsAt: ev.ends_at || new Date(finDe(dates)).toISOString(),
    endsAtSet: !!ev.ends_at,
    revealAt: ev.reveal_at,
    // Les moments de rappel, en minutes après le début. Le participant y
    // ajoute son propre décalage (voir lib/rappels.js) : personne n'est
    // prévenu à la même seconde que son voisin.
    rappels: planRappels({ ...dates, rappels: ev.reminder_offsets }),
    rappelsAuto: !Array.isArray(ev.reminder_offsets),
    status: ev.status,
    revealed: isRevealed(dates),
    phase: eventPhase(dates),
    isOwner,
  }

  // Numéros collectés + liste des admins : réservés à l'organisateur
  if (isOwner) {
    // Contacts laissés par les participants : les adresses mail (envoi automatique de
    // l'album) et les numéros recueillis avant le passage au mail.
    // Tous les participants, adresse ou non : n'afficher que ceux qui en ont laissé
    // une passait sous silence ceux qui ne recevront jamais rien.
    // Les retirés sortent de la liste : l'organisateur les a écartés, les
    // revoir chaque fois n'apporterait rien. L'identifiant, lui, est nécessaire
    // pour pouvoir justement en retirer un (règle 1.2 d'Apple).
    const list = await selectRows(
      'guests',
      `event_id=eq.${id}&blocked=is.false&select=id,display_name,email,phone,notified_at,notify_failed&order=created_at.asc`
    )
    payload.contacts = (Array.isArray(list.data) ? list.data : []).map((g) => ({
      id: g.id,
      name: g.display_name,
      email: g.email || null,
      phone: g.phone || null,
      notified: !!g.notified_at,
      failed: !!g.notify_failed,
    }))

    const admins = await selectRows('event_admins', `event_id=eq.${id}&select=id,name,email,invited_at,joined_at&order=created_at.asc`)
    payload.admins = (Array.isArray(admins.data) ? admins.data : []).map((a) => ({ id: a.id, name: a.name, email: a.email, invitedAt: a.invited_at, joinedAt: a.joined_at }))

    payload.role = role // 'owner' | 'admin' : pilote l'accès à la suppression
    payload.ownerName = ev.owner_name || null
    payload.ownerEmail = ev.owner_email || null // mail de connexion de l'organisateur
    payload.galleryCode = ev.gallery_code || null // code d'accès à la galerie (si activé)
    payload.downloadCount = ev.download_count || 0 // nb de "Tout télécharger"
    payload.publishedAt = ev.published_at || null // album validé par l'organisateur
    payload.revealPaused = !!ev.reveal_paused // frein d'urgence
    payload.quotaLocked = quotaLocked(dates) // le nb de photos/participant est-il figé ?

    // Formule souscrite et dépassement éventuel. Si la formule est trop petite,
    // on indique déjà celle qu'il faut viser et ce qu'il reste à régler : le
    // message doit être actionnable, pas seulement alarmant.
    payload.maxGuests = ev.max_guests || null
    payload.quotaExceeded = quotaExceeded(dates)

    // Formule pleine, mais pas encore dépassée : le prochain participant restera à la
    // porte. Le lui dire maintenant vaut mieux que de le lui apprendre par un
    // participant coincé devant un QR code : c'est la même somme, sans le moment de
    // gêne.
    const max = Number(ev.max_guests)
    payload.quotaFull = Number.isFinite(max) && max > 0 && guestCount >= max

    if (payload.quotaExceeded || payload.quotaFull) {
      // Sur une formule pleine, la cible est le palier au-dessus : celui qui
      // attend n'est pas encore compté.
      payload.upgrade = upgradeFor(ev.max_guests, payload.quotaExceeded ? guestCount : guestCount + 1)
      // Plus rien à vendre en ligne : c'est un tarif sur mesure, et l'écran doit
      // proposer de nous écrire plutôt qu'un bouton de paiement introuvable.
      payload.surMesure = !payload.upgrade
      payload.contactEmail = payload.surMesure ? CONTACT_EMAIL : undefined
    }

    // Pendant la soirée, l'organisateur veut voir que ça tourne : qui joue,
    // et les dernières photos arrivées (lui seul : les participants ne voient rien).
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

      // Sauf formule dépassée : les dernières photos sont un aperçu de l'album,
      // et l'album entier attend la mise à niveau. Sur un petit événement, huit
      // vignettes, c'est déjà toute la soirée.
      if (!payload.quotaExceeded) {
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
  }

  return Response.json(payload)
}

// Modification de réglages (réservée à l'organisateur/admin) : date de révélation, code galerie
export async function PATCH(request, { params }) {
  const { id } = await params
  if (!estUuid(id)) return identifiantInvalide()
  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { data } = await selectRows('events', `id=eq.${id}&select=id,name,owner_token,starts_at,ends_at,reminder_offsets,reveal_at,reveal_paused,max_guests,bonus_shots`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })
  // Les réglages du quotidien sont ouverts aux co-admins : c'est le sens même
  // de les inviter. Seule la suppression reste au propriétaire.
  if (!canManage(await roleFor(id, ownerToken))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const patch = {}

  // L'heure de la révélation est passée : les deux dates se figent, sans
  // condition. Les déplacer réécrirait un événement qui a déjà eu lieu, et
  // repousserait au passage la date de suppression annoncée dans les CGV.
  const revelationPassee = new Date(ev.reveal_at || 0).getTime() <= Date.now()
  if (revelationPassee && (body.revealAt !== undefined || body.startsAt !== undefined || body.endsAt !== undefined)) {
    return Response.json(
      { error: 'La révélation a eu lieu : les dates ne peuvent plus être modifiées.' },
      { status: 409 }
    )
  }

  // Cadrage de la couverture, au format « X% Y% ». Validé strictement : cette
  // valeur part telle quelle dans une propriété CSS.
  if (body.coverPos !== undefined) {
    const v = (body.coverPos || '').toString().trim()
    if (v === '') patch.cover_pos = null
    else if (/^\d{1,3}% \d{1,3}%$/.test(v)) patch.cover_pos = v
    else return Response.json({ error: 'Cadrage invalide.' }, { status: 400 })
  }

  // Nom de l'événement : s'affiche chez les participants, donc modifiable à tout moment
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

  // Heure de fin de la fête. Elle ne sert pas qu'à l'affichage : c'est elle
  // qui règle la cadence des rappels envoyés aux participants. On la remet à
  // « estimée » en envoyant une valeur vide.
  if (body.endsAt !== undefined) {
    if (body.endsAt === null || body.endsAt === '') {
      patch.ends_at = null
    } else {
      const fin = new Date(body.endsAt)
      if (isNaN(fin.getTime())) return Response.json({ error: 'Heure de fin invalide.' }, { status: 400 })
      const debut = new Date(patch.starts_at || ev.starts_at).getTime()
      if (Number.isFinite(debut) && fin.getTime() <= debut) {
        return Response.json({ error: 'La fin doit venir après le début de l’événement.' }, { status: 400 })
      }
      const rev = new Date(patch.reveal_at || ev.reveal_at).getTime()
      if (Number.isFinite(rev) && fin.getTime() > rev) {
        return Response.json({ error: 'La fin ne peut pas dépasser la révélation des photos.' }, { status: 400 })
      }
      patch.ends_at = fin.toISOString()
    }
  }

  // La fête garde sa durée quand on la déplace. Sans cela, avancer le début
  // d'une semaine laissait la fin sur place : une soirée finie avant d'avoir
  // commencé, et des rappels calculés sur du vide. Ne s'applique que si
  // l'appelant n'a pas donné lui-même une nouvelle fin.
  if (patch.starts_at && ev.ends_at && body.endsAt === undefined) {
    const ancien = new Date(ev.starts_at || ev.ends_at).getTime()
    const duree = new Date(ev.ends_at).getTime() - ancien
    if (Number.isFinite(duree) && duree > 0) {
      patch.ends_at = new Date(new Date(patch.starts_at).getTime() + duree).toISOString()
    }
  }

  // Moments de rappel choisis par l'organisateur, en minutes après le début.
  // `null` rend la main au calcul automatique, un tableau vide impose le
  // silence : ce sont deux intentions différentes, et la base les distingue.
  if (body.rappels !== undefined) {
    if (body.rappels === null) {
      patch.reminder_offsets = null
    } else if (Array.isArray(body.rappels)) {
      const duree = dureeMin({
        startsAt: patch.starts_at || ev.starts_at,
        endsAt: patch.ends_at !== undefined ? patch.ends_at : ev.ends_at,
        revealAt: patch.reveal_at || ev.reveal_at,
      })
      patch.reminder_offsets = nettoyerRappels(body.rappels, duree)
    } else {
      return Response.json({ error: 'Rappels invalides.' }, { status: 400 })
    }
  }

  // Photos par participant : modifiable tant que la soirée n'a pas commencé.
  // Après, tout le monde n'aurait pas joué au même jeu.
  if (body.shotsPerGuest !== undefined) {
    if (quotaLocked({ startsAt: patch.starts_at || ev.starts_at })) {
      return Response.json({ error: 'La soirée a commencé : le nombre de photos est figé.' }, { status: 409 })
    }
    // Mêmes bornes que le formulaire de création (src/lib/pricing.js) et que
    // les CGV : l'API ne doit pas accepter ce que l'interface interdit.
    const n = parseInt(body.shotsPerGuest, 10)
    if (!Number.isFinite(n) || n < SHOTS_MIN || n > SHOTS_MAX) {
      return Response.json({ error: `Nombre de photos invalide (entre ${SHOTS_MIN} et ${SHOTS_MAX}).` }, { status: 400 })
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
    if (!Number.isFinite(n) || n < 0 || n > BONUS_MAX) {
      return Response.json({ error: `Recharge invalide (entre 0 et ${BONUS_MAX}).` }, { status: 400 })
    }
    patch.bonus_shots = n
  }

  // Ce que le participant revoit de ses propres photos. Contrairement au
  // nombre de clichés, ce réglage ne se fige pas au début de la soirée : il ne
  // reprend rien à personne, il change seulement ce qui s'affiche. Un
  // organisateur dont les invités s'agacent doit pouvoir rouvrir en cours de
  // route.
  if (body.photoMode !== undefined) {
    const m = String(body.photoMode)
    if (!PHOTO_MODES.includes(m)) {
      return Response.json({ error: 'Mode photo inconnu.' }, { status: 400 })
    }
    patch.photo_mode = m
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
    // « Révéler maintenant » est un geste délibéré, pas une programmation : on
    // ne contrôle l'ordre que sur des dates à venir.
    const immediate = Number.isFinite(rev) && rev <= Date.now() + 60 * 1000
    if (!immediate && Number.isFinite(debut) && Number.isFinite(rev) && rev <= debut) {
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
  // suspension), les participants qui ont laissé leur adresse reçoivent le lien tout
  // de suite, sans attendre le passage de la tâche planifiée. Sans effet si
  // l'album n'est pas ouvert, et jamais deux fois pour le même participant.
  let notified = null
  try {
    notified = await notifyGuestsOfAlbum(upd.data || { ...ev, ...patch, id })
  } catch (err) {
    console.error('envoi du lien de l’album:', err)
  }

  return Response.json({ ok: true, notified })
}

// Suppression d'un événement (réservée à l'organisateur) : photos, participants, fichiers et ligne
export async function DELETE(request, { params }) {
  const { id } = await params
  if (!estUuid(id)) return identifiantInvalide()

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=owner_token,cover_url`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Le seul geste réservé au propriétaire : il efface les photos de tous les
  // participants, sans retour possible. Un co-admin ne doit pas pouvoir le faire.
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
