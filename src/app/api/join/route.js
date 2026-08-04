import { rpc, updateRow, selectRows } from '../../../lib/supabase'
import { checkEmailShape } from '../../../lib/email-check'
import { sendMail, guestAccessEmail, quotaEmail, siteUrl } from '../../../lib/mail'
import { makeToken, ensureAccount } from '../../../lib/account'
import { estSuspendu, MESSAGE_SUSPENDU } from '../../../lib/authz'
import { upgradeFor, formatPrice } from '../../../lib/pricing'

// Un invité attend à la porte : on prévient l'organisateur tout de suite.
//
// Relancé au plus toutes les quinze minutes tant que la situation dure. Une
// seule alerte suffirait si l'organisateur avait le nez sur son téléphone —
// il est en train de faire la fête. Mais un mail par invité refusé serait du
// harcèlement, et le ferait décrocher au pire moment.
const RELANCE_MS = 15 * 60 * 1000

async function alerteQuota(ev, guestCount, prenom) {
  if (!ev?.owner_email) return
  const dernier = ev.quota_mailed_at ? new Date(ev.quota_mailed_at).getTime() : 0
  if (Number.isFinite(dernier) && Date.now() - dernier < RELANCE_MS) return

  // Le palier visé se calcule sur les invités attendus, pas sur les présents :
  // celui qui attend en fait partie, et il en arrivera d'autres. `null` au
  // dernier palier : le mail bascule alors sur le tarif sur mesure.
  const cible = upgradeFor(ev.max_guests, guestCount + 1)
  const mail = quotaEmail({
    eventName: ev.name || 'votre événement',
    ownerUrl: `${siteUrl()}/event/${ev.id}?k=${ev.owner_token}`,
    guestCount,
    maxGuests: ev.max_guests,
    prenom,
    upgradeMaxGuests: cible?.maxGuests,
    upgradePrice: cible ? formatPrice(cible.priceCents) : null,
  })
  const sent = await sendMail({ to: ev.owner_email, subject: mail.subject, html: mail.html })
  // Horodaté seulement si l'envoi a réussi : tant que l'alerte n'est pas
  // partie, le prochain invité doit pouvoir la déclencher à nouveau.
  if (sent?.ok) await updateRow('events', `id=eq.${ev.id}`, { quota_mailed_at: new Date().toISOString() })
}

// Une même personne qui revient d'un autre téléphone (ou après avoir vidé son
// navigateur) créait jusqu'ici une deuxième fiche : elle comptait double dans
// la formule, et repartait avec un quota de poses tout neuf.
//
// L'adresse mail sert de fil : si elle est déjà connue sur cet événement, on
// rebranche son ancienne fiche sur le nouvel appareil. Elle retrouve sa place
// et ses poses restantes, sans avoir rien à faire.
//
// `fiches` : toutes les lignes `guests` de l'événement, déjà chargées.
// Renvoie true si la personne est désormais rattachée à une fiche existante.
async function rattacherParMail(fiches, email, deviceToken) {
  if (!email) return false
  const siennes = fiches.filter((g) => (g.email || '').toLowerCase() === email)
  if (!siennes.length) return false
  // Déjà sur le bon appareil : rien à faire.
  if (siennes.some((g) => g.device_token === deviceToken)) return true

  // On déplace la plus ancienne fiche (celle qui porte l'historique) sur
  // l'appareil du moment. `join_event` la retrouvera alors naturellement.
  const res = await updateRow('guests', `id=eq.${siennes[0].id}`, { device_token: deviceToken })
  return !!res?.ok
}

// Envoie à l'invité son lien d'accès permanent, une seule fois.
//
// Rien ne part sur un événement déjà révélé : le lien sert à protéger des poses
// et des photos en cours de soirée. Passé la révélation, l'album est ouvert et
// c'est le mail d'album qui prend le relais.
async function sendGuestAccess(guestId, eventName, shotsPerGuest, email, revealAt) {
  const reveal = revealAt ? new Date(revealAt).getTime() : NaN
  if (Number.isFinite(reveal) && reveal <= Date.now()) return

  const { data } = await selectRows('guests', `id=eq.${guestId}&select=token,access_mailed_at`)
  const g = Array.isArray(data) ? data[0] : null
  if (!g || g.access_mailed_at) return // déjà envoyé : on ne le harcèle pas

  const token = g.token || makeToken()
  if (!g.token) await updateRow('guests', `id=eq.${guestId}`, { token })

  const mail = guestAccessEmail({
    eventName: eventName || 'votre événement',
    link: `${siteUrl()}/mes-photos?t=${token}`,
    shotsPerGuest,
  })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html })
  // Horodaté même en cas d'échec : mieux vaut un lien manquant qu'un mail
  // renvoyé à chaque photo prise.
  if (sent?.ok) await updateRow('guests', `id=eq.${guestId}`, { access_mailed_at: new Date().toISOString() })
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { eventId, deviceToken, displayName } = body

  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  // Suspendu par l'administration : personne ne rejoint.
  if (await estSuspendu(eventId)) {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

  // Dernier filet : le navigateur peut être contourné, pas le serveur.
  // Une adresse mal formée n'est jamais enregistrée — mieux vaut aucun
  // contact qu'un contact qui ne recevra rien.
  const forme = checkEmailShape(body.email)
  const email = forme.ok && !forme.empty ? forme.email : ''

  // ---- La porte ----
  // Refuser quelqu'un en pleine soirée n'est acceptable qu'à trois conditions,
  // toutes vérifiées ici : que la personne ne soit pas déjà entrée, que
  // l'organisateur puisse débloquer en quelques secondes, et qu'on le prévienne
  // à l'instant même. Personne d'autre n'est gêné pendant ce temps.
  const evRes = await selectRows(
    'events',
    `id=eq.${eventId}&select=id,name,owner_email,owner_token,owner_name,max_guests,quota_mailed_at`
  )
  const ev = Array.isArray(evRes.data) ? evRes.data[0] : null

  const fichesRes = await selectRows('guests', `event_id=eq.${eventId}&select=id,device_token,email&order=created_at.asc`)
  const fiches = Array.isArray(fichesRes.data) ? fichesRes.data : []

  // Déjà dedans ? Cet appareil, ou la même adresse sur un appareil précédent.
  let dedans = fiches.some((g) => g.device_token === deviceToken)
  if (!dedans) dedans = await rattacherParMail(fiches, email, deviceToken)

  if (ev && !dedans) {
    const max = Number(ev.max_guests)
    // Le plus grand palier bloque comme les autres : au-delà de 300, le tarif
    // se négocie, et l'écran d'attente invite alors à nous écrire.
    const plafonne = Number.isFinite(max) && max > 0
    // L'organisateur entre toujours : lui fermer la porte de son propre
    // événement, alors qu'il est le seul à pouvoir la rouvrir, serait absurde.
    const estOrga = deviceToken === ev.owner_token
    if (plafonne && !estOrga && fiches.length >= max) {
      try { await alerteQuota(ev, fiches.length, (displayName || '').toString().trim()) }
      catch (err) { console.error('alerte quota:', err) }
      return Response.json({
        waiting: true,
        eventName: ev.name,
        maxGuests: max,
      })
    }
  }

  const { ok, data } = await rpc('join_event', {
    p_event_id: eventId,
    p_device_token: deviceToken,
    p_display_name: displayName ?? '',
    p_phone: '',
  })

  if (!ok) {
    console.error('join_event error:', data)
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
  if (data?.status === 'error') {
    return Response.json({ error: data.message }, { status: 404 })
  }

  // Signe de vie (indicateur « joue en ce moment ») + adresse mail éventuelle.
  // Une adresse vide n'écrase pas celle déjà enregistrée : un invité qui
  // revient sans la resaisir ne doit pas perdre son inscription à l'album.
  try {
    const patch = { last_active_at: new Date().toISOString() }
    if (email) {
      patch.email = email
      // Un invité qui laisse son adresse est une personne comme une autre :
      // c'est peut-être l'organisateur d'un autre événement. Et s'il vient de
      // l'essai du site, on le note : c'est quelqu'un qui a tenu l'appareil.
      const { data: evData } = await selectRows('events', `id=eq.${eventId}&select=is_demo`)
      const estEssai = Array.isArray(evData) && !!evData[0]?.is_demo
      patch.account_id = await ensureAccount(email, displayName, { demo: estEssai })
    }
    await updateRow('guests', `id=eq.${data.guest_id}`, patch)
  } catch {}

  // L'organisateur qui prend ses propres photos se nomme : sur une formule
  // gratuite, c'est la seule occasion de connaître son nom, Stripe ne l'ayant
  // jamais recueilli. On ne touche à rien s'il est déjà connu.
  try {
    const nom = (displayName || '').toString().trim()
    if (nom && ev && ev.owner_token === deviceToken && !ev.owner_name) {
      await updateRow('events', `id=eq.${eventId}`, { owner_name: nom.slice(0, 80) })
    }
  } catch {}

  // Lien d'accès personnel : envoyé une seule fois, dès qu'une adresse est
  // connue. Sans lui, l'identité de l'invité disparaît avec son navigateur.
  // Un échec d'envoi ne doit jamais empêcher quelqu'un de photographier.
  if (email) {
    try { await sendGuestAccess(data.guest_id, data.event_name, data.shots_per_guest, email, data.reveal_at) }
    catch (err) { console.error('mail accès invité:', err) }
  }

  return Response.json({
    email,
    guestId: data.guest_id,
    displayName: data.display_name,
    shotsTaken: data.shots_taken,
    shotsPerGuest: data.shots_per_guest,
    eventName: data.event_name,
    hostNames: data.host_names,
    revealAt: data.reveal_at,
  })
}
