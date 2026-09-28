// ============================================================
//  La vie d'une commande de tirages, du paiement à l'imprimeur.
//
//    en_attente      créée au clic sur « Commander », avant Stripe
//    payee           Stripe a confirmé le paiement
//    en_preparation  les photos sont en cours de préparation (verrou)
//    envoyee         transmise à Prodigi, qui imprime et expédie
//    erreur          un échec après paiement : à reprendre à la main
//
//  Le passage à « payee » puis la transmission à Prodigi sont faits UNE seule
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
import { cuireTirage } from './cuisson-serveur'
import { pelliculeParId, tamponDate } from './pellicules'
import { formatTirage, paysLivraison, FINITIONS, euros } from './tirages'
import { sendMail, siteUrl, tiragesConfirmationEmail, tiragesExpeditionEmail, tiragesBloqueeEmail } from './mail'
import { CONTACT_EMAIL } from './pricing'

const TABLE = 'tirages_commandes'

export async function lireCommande(id) {
  const { data } = await selectRows(TABLE, `id=eq.${id}&select=*`)
  return Array.isArray(data) ? data[0] || null : null
}

// Chaque photo « avec l'effet » est cuite ici, puis déposée dans le dossier des
// tirages, d'où l'imprimeur ira la chercher. Quatre à la fois : assez pour
// aller vite, pas assez pour saturer la mémoire du serveur.
async function preparerFichiers(eventId, photos, rendu) {
  const pellicule = pelliculeParId(rendu.pellicule)
  const sources = await signPhotos(photos.map((p) => p.storage_path), 600)
  const cles = {}
  let suivante = 0
  async function ouvrier() {
    while (suivante < photos.length) {
      const p = photos[suivante++]
      const res = await fetch(sources[p.storage_path])
      if (!res.ok) throw new Error('photo illisible')
      const cuite = await cuireTirage(Buffer.from(await res.arrayBuffer()), {
        pellicule: pellicule.id,
        date: rendu.date ? tamponDate(p.taken_at, 'Europe/Paris') : '',
      })
      const cle = `tirages/${eventId}/${randomUUID()}.jpg`
      const envoi = await uploadPhoto(cle, cuite, 'image/jpeg')
      if (!envoi.ok) throw new Error('dépôt impossible')
      cles[p.id] = cle
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, photos.length) }, ouvrier))
  return cles
}

/**
 * Transmet une commande payée à Prodigi. Ne fait rien si elle n'est pas (ou
 * plus) à l'état « payee » : un second appel simultané ressort bredouille.
 */
export async function honorerCommande(id) {
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

    const rendu = { pellicule: pelliculeParId(c.rendu?.pellicule).id, date: !!c.rendu?.date }
    const avecEffet = !!pelliculeParId(rendu.pellicule).canaux || rendu.date
    const cuites = avecEffet ? await preparerFichiers(c.event_id, photos, rendu) : {}
    const parId = new Map(photos.map((p) => [p.id, p]))
    const lignes = c.lignes.map((l) => ({
      exemplaires: l.exemplaires,
      chemin: cuites[l.photoId] || parId.get(l.photoId).storage_path,
    }))

    const pays = c.destinataire?.pays || 'FR'
    const cout = await devisProdigi({ format: c.format, finition: c.finition, lignes, pays }).catch(() => null)
    // Six jours : Prodigi télécharge les fichiers après coup.
    const signees = await signPhotos(lignes.map((l) => l.chemin), 6 * 24 * 3600)
    const envoi = await commanderProdigi({
      reference: `ttf-${c.id.slice(0, 8)}`,
      format: c.format,
      finition: c.finition,
      lignes: lignes.map((l) => ({ url: signees[l.chemin], exemplaires: l.exemplaires })),
      destinataire: c.destinataire,
      // En ligne seulement : Prodigi ne peut pas joindre un ordinateur.
      ...(process.env.NODE_ENV === 'production' ? { callbackUrl: `${siteUrl()}/api/tirages/prodigi` } : {}),
    })
    const fin = await updateRow(TABLE, `id=eq.${c.id}`, {
      statut: 'envoyee',
      prodigi_order_id: envoi.id,
      prodigi_env: prodigiEnv(),
      cout_prodigi_cents: cout?.total ?? null,
      envoye_le: new Date().toISOString(),
    })
    await envoyerConfirmation(fin.data || c, photos).catch((e) => console.error('tirages: mail de confirmation', e))
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

  await updateRow(TABLE, `id=eq.${id}&statut=eq.en_attente`, { statut: 'payee', paye_le: new Date().toISOString() })
  return honorerCommande(id)
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

async function envoyerConfirmation(c, photos) {
  const to = c.destinataire?.email
  if (!to || c.confirmation_envoyee_le) return
  const mail = tiragesConfirmationEmail(await contenuConfirmation(c, photos))
  const res = await sendMail({ to, subject: mail.subject, html: mail.html })
  if (res?.ok) await updateRow(TABLE, `id=eq.${c.id}`, { confirmation_envoyee_le: new Date().toISOString() })
}

/**
 * Prodigi a changé l'étape d'une commande. On relit la commande chez lui (on
 * ne croit jamais le contenu de l'avis) et, dès qu'un colis a un suivi, on
 * l'envoie au client, une seule fois.
 */
export async function suivreExpedition(prodigiOrderId, lireCommandeProdigi) {
  const { data } = await selectRows(TABLE, `prodigi_order_id=eq.${encodeURIComponent(prodigiOrderId)}&select=*`)
  const c = Array.isArray(data) ? data[0] : null
  if (!c || c.expedition_envoyee_le) return { ignore: true }

  const o = await lireCommandeProdigi(prodigiOrderId)
  const colis = o?.expeditions?.find((e) => e.url || e.numero)
  if (!colis) return { attente: true }

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
