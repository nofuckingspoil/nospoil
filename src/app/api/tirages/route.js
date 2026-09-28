// ============================================================
//  Commande de tirages papier.
//
//  Reçoit la sélection faite dans l'album, vérifie que chaque photo appartient
//  bien à cet album et reste visible, recalcule le prix (celui qu'affiche le
//  navigateur n'engage à rien), puis enregistre la commande « en attente » et
//  renvoie l'adresse du paiement Stripe. C'est seulement une fois le paiement
//  confirmé que les photos sont préparées et transmises à Prodigi (voir
//  lib/commande-tirages : /api/tirages/confirmer et l'avis de Stripe).
//
//  Sans Stripe configuré, en local seulement, la commande est considérée comme
//  payée et part directement dans le bac à sable de Prodigi.
// ============================================================
import { insertRow, selectRows, updateRow } from '../../../lib/supabase'
import { isRevealed } from '../../../lib/phase'
import { estUuid } from '../../../lib/params'
import { ipDe, tropDeDemandes, messageTrop } from '../../../lib/rate-limit'
import {
  devisTirages, formatTirage, paysLivraison, finitions, TIRAGES_MAX, EXEMPLAIRES_MAX, tiragesActifs,
} from '../../../lib/tirages'
import { prodigiConfigure, prodigiEnv } from '../../../lib/prodigi'
import { familinkConfigure, familinkEnv, maxFamilink } from '../../../lib/familink'
import { pelliculeParId } from '../../../lib/pellicules'
import { getStripe } from '../../../lib/stripe'
import { siteUrl } from '../../../lib/mail'
import { honorerCommande, imprimeurChoisi } from '../../../lib/commande-tirages'
import { t, langueValide } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'

// L'imprimeur est-il branché, et en réel (live) ou en bac à sable ?
function imprimeurPret() {
  return imprimeurChoisi() === 'familink'
    ? { configure: familinkConfigure(), env: familinkEnv() }
    : { configure: prodigiConfigure(), env: prodigiEnv() }
}

// Préparer une trentaine de photos prend une quinzaine de secondes (cas du
// local sans Stripe, où tout se fait dans la même requête).
export const maxDuration = 60

const EN_LIGNE = process.env.NODE_ENV === 'production'

// Où Stripe renvoie l'invité après paiement. En local, le site du Mac (qu'on
// l'ouvre depuis le Mac ou depuis un téléphone du Wi-Fi) ; en ligne, le vrai.
function adresseDuSite(request) {
  if (EN_LIGNE) return siteUrl()
  try { return new URL(request.url).origin } catch { return siteUrl() }
}

// Adresse de livraison, dans l'un des pays d'Europe que l'on dessert. La
// France s'entend métropolitaine : le port à 4,90 € ne couvre pas l'outre-mer.
function lireDestinataire(d, langue) {
  const coupe = (v, max) => String(v || '').trim().slice(0, max)
  const dest = {
    nom: coupe(d?.nom, 80),
    adresse: coupe(d?.adresse, 120),
    complement: coupe(d?.complement, 120),
    codePostal: coupe(d?.codePostal, 10),
    ville: coupe(d?.ville, 80),
    email: coupe(d?.email, 160),
    pays: coupe(d?.pays, 2).toUpperCase(),
  }
  if (!paysLivraison(dest.pays, langue)) return { erreur: t({ fr: 'Choisissez un pays de livraison.', en: 'Choose a delivery country.', de: 'Wählen Sie ein Lieferland.' }, langue) }
  if (!dest.nom || !dest.adresse || !dest.ville) return { erreur: t({ fr: 'Renseignez votre nom et votre adresse complète.', en: 'Enter your name and full address.', de: 'Geben Sie Ihren Namen und Ihre vollständige Adresse an.' }, langue) }
  if (dest.pays === 'FR' && !/^(0[1-9]|[1-8]\d|9[0-5])\d{3}$/.test(dest.codePostal)) {
    return { erreur: t({ fr: 'Code postal invalide (livraison en France métropolitaine uniquement).', en: 'Invalid postcode (delivery to mainland France only).', de: 'Ungültige Postleitzahl (Lieferung nur ins französische Mutterland).' }, langue) }
  }
  if (!dest.codePostal) return { erreur: t({ fr: 'Renseignez le code postal.', en: 'Enter the postcode.', de: 'Geben Sie die Postleitzahl an.' }, langue) }
  // Le mail est obligatoire : c'est par lui qu'arrivent la confirmation et le
  // lien de suivi du colis.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dest.email)) {
    return { erreur: t({ fr: 'Indiquez votre adresse mail : la confirmation et le suivi du colis y seront envoyés.', en: 'Enter your email address: the confirmation and parcel tracking will be sent there.', de: 'Geben Sie Ihre E-Mail-Adresse an: Die Bestätigung und die Sendungsverfolgung werden dorthin geschickt.' }, langue) }
  }
  return { dest }
}

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  // La langue de celui qui commande : mails de confirmation et d'expédition.
  const langue = langueValide(body.langue) || langueRequete(request)
  if (!tiragesActifs()) {
    return Response.json({ error: t({ fr: 'Les tirages papier ne sont pas encore disponibles.', en: 'Paper prints are not available yet.', de: 'Papierabzüge sind noch nicht verfügbar.' }, langue) }, { status: 404 })
  }

  const eventId = String(body.eventId || '')
  if (!estUuid(eventId)) return Response.json({ error: t({ fr: 'Album inconnu.', en: 'Unknown album.', de: 'Unbekanntes Album.' }, langue) }, { status: 400 })

  // Une ligne par photo, avec son nombre d'exemplaires. Une photo envoyée deux
  // fois ne compte qu'une fois : on commande des photos, pas des clics.
  const parPhoto = new Map()
  for (const l of Array.isArray(body.lignes) ? body.lignes : []) {
    const id = String(l?.photoId || '')
    const exemplaires = Math.floor(Number(l?.exemplaires) || 0)
    if (!estUuid(id)) return Response.json({ error: t({ fr: 'Photo inconnue.', en: 'Unknown photo.', de: 'Unbekanntes Foto.' }, langue) }, { status: 400 })
    if (exemplaires < 1) continue
    if (exemplaires > EXEMPLAIRES_MAX) {
      return Response.json({ error: t({ fr: `${EXEMPLAIRES_MAX} exemplaires au plus par photo.`, en: `${EXEMPLAIRES_MAX} copies at most per photo.`, de: `Höchstens ${EXEMPLAIRES_MAX} Exemplare pro Foto.` }, langue) }, { status: 400 })
    }
    parPhoto.set(id, { exemplaires })
  }
  const ids = [...parPhoto.keys()]
  if (!ids.length) return Response.json({ error: t({ fr: 'Choisissez au moins une photo.', en: 'Choose at least one photo.', de: 'Wählen Sie mindestens ein Foto aus.' }, langue) }, { status: 400 })
  const nombre = [...parPhoto.values()].reduce((n, l) => n + l.exemplaires, 0)
  if (nombre > TIRAGES_MAX) {
    return Response.json({ error: t({ fr: `${TIRAGES_MAX} tirages au plus par commande.`, en: `${TIRAGES_MAX} prints at most per order.`, de: `Höchstens ${TIRAGES_MAX} Abzüge pro Bestellung.` }, langue) }, { status: 400 })
  }

  const { dest, erreur } = lireDestinataire(body.destinataire, langue)
  if (erreur) return Response.json({ error: erreur }, { status: 400 })

  // Le rendu voulu : l'effet de l'album (pellicule, date) ou la photo d'origine.
  const rendu = {
    pellicule: pelliculeParId(body.rendu?.pellicule).id,
    date: body.rendu?.date === true,
  }

  const format = formatTirage(body.format, langue)
  const listeFinitions = finitions(langue)
  const finition = listeFinitions.find((f) => f.id === body.finition) || listeFinitions[0]

  if (await tropDeDemandes(ipDe(request), 'tirages', { max: 20, minutes: 60 })) {
    return Response.json({ error: messageTrop(langue) }, { status: 429 })
  }

  const evRes = await selectRows(
    'events',
    `id=eq.${eventId}&select=id,name,status,reveal_at,reveal_paused,max_guests,purged_at`
  )
  const ev = Array.isArray(evRes.data) ? evRes.data[0] : null
  if (!ev || ev.status === 'suspended' || ev.purged_at) {
    return Response.json({ error: t({ fr: 'Cet album n\'est plus disponible.', en: 'This album is no longer available.', de: 'Dieses Album ist nicht mehr verfügbar.' }, langue) }, { status: 404 })
  }
  const invites = await selectRows('guests', `event_id=eq.${eventId}&blocked=is.false&select=id`)
  const ouvert = isRevealed({
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount: Array.isArray(invites.data) ? invites.data.length : 0,
  })
  if (!ouvert) return Response.json({ error: t({ fr: 'L\'album n\'est pas encore ouvert.', en: 'The album is not open yet.', de: 'Das Album ist noch nicht geöffnet.' }, langue) }, { status: 403 })

  const phRes = await selectRows(
    'photos',
    `event_id=eq.${eventId}&hidden=is.false&id=in.(${ids.join(',')})&select=id,storage_path,taken_at&order=taken_at.asc`
  )
  const trouvees = Array.isArray(phRes.data) ? phRes.data : []
  if (trouvees.length !== ids.length) {
    return Response.json({ error: t({ fr: 'Certaines photos ne sont plus dans l\'album. Rechargez la page.', en: 'Some photos are no longer in the album. Reload the page.', de: 'Einige Fotos sind nicht mehr im Album. Laden Sie die Seite neu.' }, langue) }, { status: 409 })
  }

  // Familink met au plus 129 tirages 10 × 15 (ou 64 en 15 × 20) par enveloppe.
  if (imprimeurChoisi() === 'familink' && nombre > maxFamilink(format.id)) {
    return Response.json({ error: t({ fr: `${maxFamilink(format.id)} tirages ${format.nom} au plus par commande.`, en: `${maxFamilink(format.id)} ${format.nom} prints at most per order.`, de: `Höchstens ${maxFamilink(format.id)} Abzüge im Format ${format.nom} pro Bestellung.` }, langue) }, { status: 400 })
  }

  const devis = devisTirages(nombre, format.id, dest.pays, langue)

  // En ligne, rien ne part sans paiement ni imprimeur réel.
  const stripe = getStripe()
  const imprimeur = imprimeurPret()
  // (Un imprimeur pas encore réel ne bloque pas : la commande payée attend,
  // voir commandesRetenues dans lib/commande-tirages.)
  if (EN_LIGNE && !stripe) {
    return Response.json({ error: t({ fr: 'Les tirages papier arrivent bientôt.', en: 'Paper prints are coming soon.', de: 'Papierabzüge kommen bald.' }, langue) }, { status: 503 })
  }

  const cree = await insertRow('tirages_commandes', {
    event_id: eventId,
    device_token: String(body.deviceToken || '').slice(0, 100) || null,
    format: format.id,
    finition: finition.id,
    rendu,
    lignes: trouvees.map((p) => ({ photoId: p.id, exemplaires: parPhoto.get(p.id).exemplaires })),
    destinataire: dest,
    nombre: devis.nombre,
    photos_cents: devis.photos,
    port_cents: devis.port,
    total_cents: devis.total,
    langue,
  })
  const commande = cree.data
  if (!cree.ok || !commande?.id) {
    console.error('tirages: commande non enregistrée', cree.status, cree.data)
    return Response.json({ error: t({ fr: 'La commande n\'a pas pu être enregistrée. Réessayez dans un instant.', en: 'The order could not be saved. Please try again in a moment.', de: 'Die Bestellung konnte nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal.' }, langue) }, { status: 500 })
  }

  // Le paiement. Stripe montre le détail (tirages, livraison) et renvoie
  // l'invité sur l'album, qui confirme la commande.
  if (stripe) {
    const base = adresseDuSite(request)
    const effet = pelliculeParId(rendu.pellicule, langue)
    const detail = [finition.nom, effet.canaux ? effet.nom : '', rendu.date ? t({ fr: 'date', en: 'date', de: 'Datum' }, langue) : ''].filter(Boolean).join(' · ')
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        locale: langue,
        line_items: [
          {
            quantity: devis.nombre,
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(format.prix * 100),
              product_data: { name: t({ fr: `Tirage photo ${format.nom.replace(/\u00a0/g, ' ')}`, en: `Photo print ${format.nom.replace(/\u00a0/g, ' ')}`, de: `Fotoabzug ${format.nom.replace(/\u00a0/g, ' ')}` }, langue), description: detail },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: devis.port,
              product_data: { name: t({ fr: `Livraison (${devis.pays.nom})`, en: `Delivery (${devis.pays.nom})`, de: `Versand (${devis.pays.nom})` }, langue) },
            },
          },
        ],
        ...(dest.email ? { customer_email: dest.email } : {}),
        success_url: `${base}/g/${eventId}?tirages=merci&commande={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/g/${eventId}?tirages=annule`,
        metadata: { type: 'tirages', commande_id: commande.id },
        payment_intent_data: { metadata: { type: 'tirages', commande_id: commande.id } },
      })
      await updateRow('tirages_commandes', `id=eq.${commande.id}`, { stripe_session_id: session.id })
      return Response.json({ ok: true, url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('tirages: session Stripe impossible', err)
      return Response.json({ error: t({ fr: 'Le paiement n\'a pas pu s\'ouvrir. Réessayez dans un instant.', en: 'The payment could not be opened. Please try again in a moment.', de: 'Die Zahlung konnte nicht geöffnet werden. Bitte versuchen Sie es gleich noch einmal.' }, langue) }, { status: 502 })
    }
  }

  // Local sans Stripe : la commande est tenue pour payée et part dans le bac à
  // sable de l'imprimeur (ou nulle part, s'il n'est pas configuré).
  if (!imprimeur.configure || imprimeur.env !== 'sandbox') {
    console.log('tirages: commande simulée (ni Stripe ni imprimeur)', { photos: devis.nombre, total: devis.total })
    return Response.json({ ok: true, simule: true, total: devis.total })
  }
  await updateRow('tirages_commandes', `id=eq.${commande.id}`, { statut: 'payee', paye_le: new Date().toISOString() })
  const fin = await honorerCommande(commande.id)
  if (fin?.statut !== 'envoyee') {
    return Response.json({ error: t({ fr: 'La commande n\'a pas pu partir. Détail dans le terminal du serveur.', en: 'The order could not be sent. Details in the server terminal.', de: 'Die Bestellung konnte nicht verschickt werden. Details im Server-Terminal.' }, langue) }, { status: 502 })
  }
  return Response.json({
    ok: true, simule: true, bacASable: true, total: devis.total,
    imprimeur: { nom: fin.imprimeur, id: fin.imprimeur_commande_id, cout: { total: fin.cout_imprimeur_cents } },
  })
}
