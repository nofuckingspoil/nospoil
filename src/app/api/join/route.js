import { rpc, updateRow, selectRows } from '../../../lib/supabase'
import { checkEmailShape } from '../../../lib/email-check'
import { sendMail, guestAccessEmail, quotaEmail, siteUrl } from '../../../lib/mail'
import { makeToken, ensureAccount } from '../../../lib/account'
import { estSuspendu, MESSAGE_SUSPENDU, ADMIN } from '../../../lib/authz'
import { equipeDe } from '../../../lib/equipe'
import { upgradeFor, formatPrice } from '../../../lib/pricing'
import { estUuid, identifiantInvalide } from '../../../lib/params'

// Un participant attend à la porte : on prévient l'organisateur tout de suite.
//
// Relancé au plus toutes les quinze minutes tant que la situation dure. Une
// seule alerte suffirait si l'organisateur avait le nez sur son téléphone ;
// il est en train de faire la fête. Mais un mail par participant refusé serait du
// harcèlement, et le ferait décrocher au pire moment.
const RELANCE_MS = 15 * 60 * 1000

async function alerteQuota(ev, guestCount, prenom) {
  if (!ev?.owner_email) return
  const dernier = ev.quota_mailed_at ? new Date(ev.quota_mailed_at).getTime() : 0
  if (Number.isFinite(dernier) && Date.now() - dernier < RELANCE_MS) return

  // Le palier visé se calcule sur les participants attendus, pas sur les présents :
  // celui qui attend en fait partie, et il en arrivera d'autres. `null` au
  // dernier palier : le mail bascule alors sur le tarif sur mesure.
  const cible = upgradeFor(ev.max_guests, guestCount + 1)

  // Les co-organisateurs aussi : c'est souvent l'un d'eux qui est près de la
  // porte, pendant que le propriétaire danse. Ils ont le même bouton et
  // peuvent régler eux-mêmes : on leur dit seulement qui d'autre a été
  // prévenu, pour que deux personnes ne paient pas la même chose.
  const equipe = await equipeDe(ev)
  let unEnvoiReussi = false
  for (const p of equipe) {
    const mail = quotaEmail({
      eventName: ev.name || 'votre événement',
      ownerUrl: `${siteUrl()}/event/${ev.id}?k=${p.token}`,
      guestCount,
      maxGuests: ev.max_guests,
      prenom,
      upgradeMaxGuests: cible?.maxGuests,
      upgradePrice: cible ? formatPrice(cible.priceCents) : null,
      coOrga: p.role === ADMIN ? { ownerName: ev.owner_name } : null,
    })
    const sent = await sendMail({ to: p.email, subject: mail.subject, html: mail.html })
    if (sent?.ok) unEnvoiReussi = true
  }

  // Horodaté seulement si quelque chose est parti : tant que personne n'a été
  // prévenu, le prochain participant doit pouvoir déclencher l'alerte à nouveau.
  if (unEnvoiReussi) await updateRow('events', `id=eq.${ev.id}`, { quota_mailed_at: new Date().toISOString() })
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

// Envoie au participant son lien d'accès permanent, une seule fois.
//
// Rien ne part sur un événement déjà révélé : le lien sert à protéger des poses
// et des photos en cours de soirée. Passé la révélation, l'album est ouvert et
// c'est le mail d'album qui prend le relais.
// Le jeton personnel du participant, fabriqué à la première demande.
//
// C'est la seule chose qui survive à un changement de navigateur : l'empreinte
// d'appareil, elle, ne sort pas de celui qui l'a écrite. Or le SMS que le
// participant s'envoie s'ouvre presque toujours ailleurs que là où il
// photographiait (un lien tapé dans Messages part chez Safari, pas dans le
// navigateur intégré d'Instagram ou d'une appli de QR code). Sans ce jeton, le
// lien qu'il se laisse pour revenir ne le reconnaît pas.
async function jetonPersonnel(guestId) {
  const { data } = await selectRows('guests', `id=eq.${guestId}&select=token`)
  const g = Array.isArray(data) ? data[0] : null
  if (!g) return null
  if (g.token) return g.token
  const token = makeToken()
  const maj = await updateRow('guests', `id=eq.${guestId}`, { token })
  return maj.ok ? token : null
}

async function sendGuestAccess(guestId, eventName, shotsPerGuest, email, revealAt, token) {
  const reveal = revealAt ? new Date(revealAt).getTime() : NaN
  if (Number.isFinite(reveal) && reveal <= Date.now()) return

  const { data } = await selectRows('guests', `id=eq.${guestId}&select=access_mailed_at`)
  const g = Array.isArray(data) ? data[0] : null
  if (!g || g.access_mailed_at || !token) return // déjà envoyé : on ne le harcèle pas

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

  if (eventId && !estUuid(eventId)) return identifiantInvalide()
  if (!eventId || !deviceToken) {
    return Response.json({ error: 'Paramètres manquants.' }, { status: 400 })
  }

  // Suspendu par l'administration : personne ne rejoint.
  if (await estSuspendu(eventId)) {
    return Response.json({ error: MESSAGE_SUSPENDU }, { status: 403 })
  }

  // Dernier filet : le navigateur peut être contourné, pas le serveur.
  // Une adresse mal formée n'est jamais enregistrée : mieux vaut aucun
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

  const fichesRes = await selectRows('guests', `event_id=eq.${eventId}&select=id,device_token,email,blocked&order=created_at.asc`)
  const fiches = Array.isArray(fichesRes.data) ? fichesRes.data : []

  // Un participant retiré par l'organisateur ne revient pas.
  //
  // Exigé par Apple, règle 1.2 : « the ability to block abusive users from the
  // service ». Sans cette porte fermée, « retirer » ne voudrait rien dire : la
  // personne rescannerait le QR code et recommencerait dans la minute.
  //
  // Le contrôle est ici, dans la route, et non dans la fonction `join_event` :
  // on ferme la porte sans toucher à la mécanique d'entrée, qui marche.
  if (fiches.some((g) => g.device_token === deviceToken && g.blocked)) {
    return Response.json(
      { error: "L'organisateur de cet événement vous en a retiré l'accès." },
      { status: 403 }
    )
  }

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
    // Les participants retirés ne comptent plus dans le quota : leur place est
    // rendue, sinon retirer quelqu'un laisserait un siège vide et payé.
    const presents = fiches.filter((g) => !g.blocked).length
    if (plafonne && !estOrga && presents >= max) {
      try { await alerteQuota(ev, presents, (displayName || '').toString().trim()) }
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
  // Une adresse vide n'écrase pas celle déjà enregistrée : un participant qui
  // revient sans la resaisir ne doit pas perdre son inscription à l'album.
  try {
    const patch = { last_active_at: new Date().toISOString() }
    if (email) {
      patch.email = email
      // Un participant qui laisse son adresse est une personne comme une autre :
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
  // connue. Sans lui, l'identité du participant disparaît avec son navigateur.
  // Un échec d'envoi ne doit jamais empêcher quelqu'un de photographier.
  // Fabriqué pour tout le monde, adresse ou pas : c'est ce jeton que le
  // participant emporte dans le SMS qu'il s'envoie.
  let token = null
  try { token = await jetonPersonnel(data.guest_id) }
  catch (err) { console.error('jeton participant:', err) }

  if (email) {
    try { await sendGuestAccess(data.guest_id, data.event_name, data.shots_per_guest, email, data.reveal_at, token) }
    catch (err) { console.error('mail accès participant:', err) }
  }

  return Response.json({
    email,
    token,
    guestId: data.guest_id,
    displayName: data.display_name,
    shotsTaken: data.shots_taken,
    shotsPerGuest: data.shots_per_guest,
    eventName: data.event_name,
    hostNames: data.host_names,
    revealAt: data.reveal_at,
  })
}
