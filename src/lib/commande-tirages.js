// ============================================================
//  La vie d'une commande de tirages, du paiement à l'imprimeur.
//
//    en_attente      créée au clic sur « Commander », avant Stripe
//    payee           Stripe a confirmé le paiement
//    en_preparation  les photos sont en cours de préparation (verrou)
//    envoyee         transmise à l'imprimeur, qui imprime et expédie
//    erreur          un échec après paiement : à reprendre à la main
//
//  L'imprimeur : Familink (Rouen) si IMPRIMEUR vaut « familink », sinon Prodigi.
//
//  Le passage à « payee » puis la transmission à l'imprimeur sont faits UNE seule
//  fois, même si la confirmation arrive par deux chemins à la fois (le retour
//  de l'invité sur l'album, et l'avis envoyé par Stripe) : chaque étape ne
//  s'applique qu'à une commande encore dans l'état précédent.
// ============================================================
import 'server-only'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { selectRows, updateRow, signPhotos, uploadPhoto } from './supabase'
import { getStripe } from './stripe'
import { prodigiEnv, devisProdigi, commanderProdigi } from './prodigi'
import { familinkEnv, coutFamilink, commanderFamilink } from './familink'
import { cuireTirage, mettreEnPage } from './cuisson-serveur'
import { pelliculeParId, tamponDate } from './pellicules'
import { formatTirage, paysLivraison, FINITIONS, euros } from './tirages'
import { sendMail, siteUrl, tiragesConfirmationEmail, tiragesExpeditionEmail, tiragesBloqueeEmail } from './mail'
import { CONTACT_EMAIL } from './pricing'

const TABLE = 'tirages_commandes'

export function imprimeurChoisi() {
  return process.env.IMPRIMEUR === 'familink' ? 'familink' : 'prodigi'
}

// En ligne, une commande payée ne part que chez un imprimeur réel. Tant que
// son accès de production n'est pas branché, elle reste « payee » et attend :
// libererCommandesEnAttente() les fera partir d'un coup.
function imprimeurReel() {
  return imprimeurChoisi() === 'familink'
    ? !!process.env.FAMILINK_API_TOKEN && familinkEnv() === 'live'
    : !!process.env.PRODIGI_API_KEY && prodigiEnv() === 'live'
}
export function commandesRetenues() {
  return process.env.NODE_ENV === 'production' && !imprimeurReel()
}

export async function lireCommande(id) {
  const { data } = await selectRows(TABLE, `id=eq.${id}&select=*`)
  return Array.isArray(data) ? data[0] || null : null
}

// Chaque photo est préparée ici, puis déposée dans le dossier des tirages,
// d'où l'imprimeur ira la chercher : cuite avec son effet s'il y en a un, et,
// avec `format`, mise en page à la forme exacte du papier (Familink ne recadre
// rien). Quatre à la fois : assez pour aller vite, pas assez pour saturer la
// mémoire du serveur.
async function preparerFichiers(eventId, photos, rendu, format = null) {
  const pellicule = pelliculeParId(rendu.pellicule)
  const sources = await signPhotos(photos.map((p) => p.storage_path), 600)
  const cles = {}
  let suivante = 0
  async function ouvrier() {
    while (suivante < photos.length) {
      const p = photos[suivante++]
      const res = await fetch(sources[p.storage_path])
      if (!res.ok) throw new Error('photo illisible')
      let fichier = await cuireTirage(Buffer.from(await res.arrayBuffer()), {
        pellicule: pellicule.id,
        date: rendu.date ? tamponDate(p.taken_at, 'Europe/Paris') : '',
      })
      if (format) fichier = await mettreEnPage(fichier, format)
      const cle = `tirages/${eventId}/${randomUUID()}.jpg`
      const envoi = await uploadPhoto(cle, fichier, 'image/jpeg')
      if (!envoi.ok) throw new Error('dépôt impossible')
      cles[p.id] = cle
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, photos.length) }, ouvrier))
  return cles
}

/**
 * Transmet une commande payée à l'imprimeur. Ne fait rien si elle n'est pas (ou
 * plus) à l'état « payee » : un second appel simultané ressort bredouille.
 */
export async function honorerCommande(id) {
  if (commandesRetenues()) return lireCommande(id)
  const verrou = await updateRow(TABLE, `id=eq.${id}&statut=eq.payee`, { statut: 'en_preparation' })
  const c = verrou.data
  if (!c?.id) return lireCommande(id)

  try {
    const ids = c.lignes.map((l) => l.photoId)
    const { data } = await selectRows(
      'photos',
      `event_id=eq.${c.event_id}&id=in.(${ids.join(',')})&select=id,storage_path,thumb_path,taken_at`
    )
    const photos = Array.isArray(data) ? data : []
    if (photos.length !== ids.length) throw new Error('photos disparues de l\'album')

    const imprimeur = imprimeurChoisi()
    const rendu = { pellicule: pelliculeParId(c.rendu?.pellicule).id, date: !!c.rendu?.date }
    const avecEffet = !!pelliculeParId(rendu.pellicule).canaux || rendu.date
    // Familink veut chaque fichier à la forme exacte du papier : on les
    // prépare tous. Prodigi, lui, sait poser une photo sur son papier.
    const aPreparer = imprimeur === 'familink' || avecEffet
    const prepares = aPreparer
      ? await preparerFichiers(c.event_id, photos, rendu, imprimeur === 'familink' ? c.format : null)
      : {}
    const parId = new Map(photos.map((p) => [p.id, p]))
    const lignes = c.lignes.map((l) => ({
      exemplaires: l.exemplaires,
      chemin: prepares[l.photoId] || parId.get(l.photoId).storage_path,
    }))

    const pays = c.destinataire?.pays || 'FR'
    // Six jours : l'imprimeur télécharge les fichiers après coup.
    const signees = await signPhotos(lignes.map((l) => l.chemin), 6 * 24 * 3600)
    const aImprimer = lignes.map((l) => ({ url: signees[l.chemin], exemplaires: l.exemplaires }))
    const commun = { reference: `ttf-${c.id.slice(0, 8)}`, format: c.format, finition: c.finition, lignes: aImprimer, destinataire: c.destinataire }

    let envoi, cout, env
    if (imprimeur === 'familink') {
      cout = coutFamilink({ format: c.format, nombre: c.nombre, pays })
      envoi = await commanderFamilink(commun)
      env = familinkEnv()
    } else {
      cout = await devisProdigi({ format: c.format, finition: c.finition, lignes, pays }).catch(() => null)
      envoi = await commanderProdigi({
        ...commun,
        // En ligne seulement : Prodigi ne peut pas joindre un ordinateur.
        ...(process.env.NODE_ENV === 'production' ? { callbackUrl: `${siteUrl()}/api/tirages/prodigi` } : {}),
      })
      env = prodigiEnv()
    }
    const fin = await updateRow(TABLE, `id=eq.${c.id}`, {
      statut: 'envoyee',
      imprimeur,
      imprimeur_commande_id: envoi.id,
      imprimeur_env: env,
      cout_imprimeur_cents: cout?.total ?? null,
      envoye_le: new Date().toISOString(),
    })
    return fin.data || c
  } catch (err) {
    // Le client a payé : on ne perd rien, la commande attend qu'on la reprenne,
    // et nous sommes prévenus.
    console.error('tirages: transmission impossible', c.id, err)
    const raison = String(err?.message || err).slice(0, 500)
    const fin = await updateRow(TABLE, `id=eq.${c.id}`, { statut: 'erreur', erreur: raison })
    const mail = tiragesBloqueeEmail({ reference: reference(c), erreur: raison })
    await sendMail({ to: CONTACT_EMAIL, subject: mail.subject, html: mail.html }).catch(() => {})
    return fin.data || c
  }
}

/**
 * Le paiement d'une session Stripe est-il fait ? Si oui, la commande passe à
 * « payee » (une seule fois) puis part chez l'imprimeur.
 */
export async function confirmerSession(sessionId) {
  const stripe = getStripe()
  if (!stripe || !sessionId) return null
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return null
  }
  const id = session?.metadata?.commande_id
  if (!id || session.metadata?.type !== 'tirages') return null
  if (session.payment_status !== 'paid') return lireCommande(id)

  const payee = await updateRow(TABLE, `id=eq.${id}&statut=eq.en_attente`, { statut: 'payee', paye_le: new Date().toISOString() })
  // Le mail de confirmation part au paiement, une seule fois (le verrou
  // ci-dessus ne réussit qu'au premier passage).
  if (payee.data?.id) {
    await envoyerConfirmation(payee.data).catch((e) => console.error('tirages: mail de confirmation', e))
    // Tant que l'imprimeur réel n'est pas branché, on est prévenu de chaque
    // vente : elle attend qu'on la fasse partir.
    if (commandesRetenues()) {
      const c = payee.data
      await sendMail({
        to: CONTACT_EMAIL,
        subject: `🎞️ Tirages : commande ${reference(c)} payée, en attente d'imprimeur`,
        html: `<p>${c.nombre} tirage(s) ${c.format}, ${euros(c.total_cents)}. Elle partira avec les autres une fois l'accès de production de l'imprimeur branché.</p>`,
      }).catch(() => {})
    }
  }
  return honorerCommande(id)
}

/**
 * Fait partir les commandes restées en chemin : les payées qui attendaient
 * l'imprimeur réel, et les « en attente » dont le paiement a abouti sans que
 * l'invité revienne sur l'album (onglet fermé). À lancer une fois l'accès de
 * production de l'imprimeur branché.
 */
export async function libererCommandesEnAttente() {
  const bilan = { verifiees: 0, envoyees: 0, erreurs: 0, retenues: commandesRetenues() }
  const attente = await selectRows(TABLE, 'statut=eq.en_attente&stripe_session_id=not.is.null&select=stripe_session_id&order=created_at.asc&limit=200')
  for (const c of Array.isArray(attente.data) ? attente.data : []) {
    bilan.verifiees++
    await confirmerSession(c.stripe_session_id).catch(() => null)
  }
  const payees = await selectRows(TABLE, 'statut=eq.payee&select=id&order=paye_le.asc&limit=200')
  for (const c of Array.isArray(payees.data) ? payees.data : []) {
    const fin = await honorerCommande(c.id)
    if (fin?.statut === 'envoyee') bilan.envoyees++
    else if (fin?.statut === 'erreur') bilan.erreurs++
  }
  return bilan
}

// ---------------------------------------------------------------- les mails

const reference = (c) => c.id.slice(0, 8).toUpperCase()
const prenomDe = (nom) => String(nom || '').trim().split(/\s+/)[0] || ''

// Ce que dit le mail de confirmation : le récapitulatif, et les photos
// commandées posées sur leur papier.
export async function contenuConfirmation(c, photos) {
  const ev = await selectRows('events', `id=eq.${c.event_id}&select=name,host_names`)
  const e = Array.isArray(ev.data) ? ev.data[0] : null
  const retenues = photos.slice(0, 4)
  const signees = await signPhotos(retenues.map((p) => p.thumb_path || p.storage_path), 7 * 24 * 3600)
  const vignettes = await Promise.all(retenues.map(async (p) => {
    const url = signees[p.thumb_path || p.storage_path]
    try {
      const m = await sharp(Buffer.from(await (await fetch(url)).arrayBuffer())).metadata()
      const couchee = (m.orientation || 1) >= 5
      return { url, largeur: couchee ? m.height : m.width, hauteur: couchee ? m.width : m.height }
    } catch {
      return { url }
    }
  }))
  const d = c.destinataire || {}
  const effet = pelliculeParId(c.rendu?.pellicule)
  return {
    prenom: prenomDe(d.nom),
    eventName: e?.host_names || e?.name || '',
    nombre: c.nombre,
    formatNom: formatTirage(c.format).nom,
    finition: (FINITIONS.find((f) => f.id === c.finition) || FINITIONS[0]).nom,
    rendu: [effet.canaux ? effet.nom : 'Photo d\'origine', c.rendu?.date ? 'date incrustée' : ''].filter(Boolean).join(' + '),
    adresse: [d.nom, d.adresse, d.complement, `${d.codePostal} ${d.ville}`, paysLivraison(d.pays)?.nom].filter(Boolean).join('<br>'),
    total: euros(c.total_cents),
    reference: reference(c),
    photos: vignettes,
    lienAlbum: `${siteUrl()}/g/${c.event_id}`,
  }
}

async function envoyerConfirmation(c) {
  const to = c.destinataire?.email
  if (!to || c.confirmation_envoyee_le) return
  const ids = (c.lignes || []).map((l) => l.photoId)
  const ph = ids.length
    ? await selectRows('photos', `id=in.(${ids.join(',')})&select=id,storage_path,thumb_path,taken_at`)
    : { data: [] }
  const mail = tiragesConfirmationEmail(await contenuConfirmation(c, Array.isArray(ph.data) ? ph.data : []))
  const res = await sendMail({ to, subject: mail.subject, html: mail.html })
  if (res?.ok) await updateRow(TABLE, `id=eq.${c.id}`, { confirmation_envoyee_le: new Date().toISOString() })
}

/**
 * Prodigi a changé l'étape d'une commande. On relit la commande chez lui (on
 * ne croit jamais le contenu de l'avis) et, dès qu'un colis a un suivi, on
 * l'envoie au client, une seule fois.
 */
//
// `lire` relit la commande chez l'imprimeur et répond { expediee, colis? } :
// Prodigi donne un suivi ; Familink envoie en lettre, sans numéro de suivi.
export async function suivreExpedition(imprimeurCommandeId, lire) {
  const { data } = await selectRows(TABLE, `imprimeur_commande_id=eq.${encodeURIComponent(imprimeurCommandeId)}&select=*`)
  const c = Array.isArray(data) ? data[0] : null
  if (!c || c.expedition_envoyee_le) return { ignore: true }

  const o = await lire(imprimeurCommandeId)
  if (!o?.expediee) return { attente: true }
  const colis = o.colis || {}

  // Le verrou : un seul avis envoie le mail, même si Prodigi en envoie deux.
  const verrou = await updateRow(TABLE, `id=eq.${c.id}&expedition_envoyee_le=is.null`, {
    expedition_envoyee_le: new Date().toISOString(),
    suivi_url: colis.url || null,
    suivi_numero: colis.numero || null,
    transporteur: colis.transporteur || null,
  })
  if (!verrou.data?.id || !c.destinataire?.email) return { ignore: true }
  const mail = tiragesExpeditionEmail({
    prenom: prenomDe(c.destinataire?.nom),
    nombre: c.nombre,
    transporteur: colis.transporteur,
    suiviUrl: colis.url,
    suiviNumero: colis.numero,
    reference: reference(c),
  })
  await sendMail({ to: c.destinataire.email, subject: mail.subject, html: mail.html })
  return { envoye: true }
}

/**
 * Filet de l'avis de l'imprimeur : on lui redemande l'étape de chaque commande
 * envoyée dont le client n'a pas encore reçu son mail d'expédition. Si l'avis
 * s'est perdu (ou n'a pas la forme attendue), le mail part quand même, au plus
 * tard à la tournée suivante. On s'arrête à 30 jours : au-delà, une commande
 * encore « non postée » demande qu'on regarde à la main.
 */
export async function verifierExpeditions(lire) {
  const depuis = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data } = await selectRows(
    TABLE,
    `statut=eq.envoyee&expedition_envoyee_le=is.null&imprimeur=eq.${imprimeurChoisi()}` +
      `&imprimeur_env=eq.live&envoye_le=gte.${depuis}&select=imprimeur_commande_id&limit=100`
  )
  const bilan = { verifiees: 0, mails: 0 }
  for (const c of Array.isArray(data) ? data : []) {
    if (!c.imprimeur_commande_id) continue
    bilan.verifiees++
    const r = await suivreExpedition(c.imprimeur_commande_id, lire).catch(() => null)
    if (r?.envoye) bilan.mails++
  }
  return bilan
}
