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
import { ipDe, tropDeDemandes, MESSAGE_TROP } from '../../../lib/rate-limit'
import {
  devisTirages, formatTirage, paysLivraison, FINITIONS, TIRAGES_MAX, EXEMPLAIRES_MAX, tiragesActifs,
} from '../../../lib/tirages'
import { prodigiConfigure, prodigiEnv } from '../../../lib/prodigi'
import { familinkConfigure, familinkEnv, maxFamilink } from '../../../lib/familink'
import { pelliculeParId } from '../../../lib/pellicules'
import { getStripe } from '../../../lib/stripe'
import { siteUrl } from '../../../lib/mail'
import { honorerCommande, imprimeurChoisi } from '../../../lib/commande-tirages'

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
function lireDestinataire(d) {
  const t = (v, max) => String(v || '').trim().slice(0, max)
  const dest = {
    nom: t(d?.nom, 80),
    adresse: t(d?.adresse, 120),
    complement: t(d?.complement, 120),
    codePostal: t(d?.codePostal, 10),
    ville: t(d?.ville, 80),
    email: t(d?.email, 160),
    pays: t(d?.pays, 2).toUpperCase(),
  }
  if (!paysLivraison(dest.pays)) return { erreur: 'Choisissez un pays de livraison.' }
  if (!dest.nom || !dest.adresse || !dest.ville) return { erreur: 'Renseignez votre nom et votre adresse complète.' }
  if (dest.pays === 'FR' && !/^(0[1-9]|[1-8]\d|9[0-5])\d{3}$/.test(dest.codePostal)) {
    return { erreur: 'Code postal invalide (livraison en France métropolitaine uniquement).' }
  }
  if (!dest.codePostal) return { erreur: 'Renseignez le code postal.' }
  // Le mail est obligatoire : c'est par lui qu'arrivent la confirmation et le
  // lien de suivi du colis.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dest.email)) {
    return { erreur: 'Indiquez votre adresse mail : la confirmation et le suivi du colis y seront envoyés.' }
  }
  return { dest }
}

export const runtime = 'nodejs'

export async function POST(request) {
  if (!tiragesActifs()) {
    return Response.json({ error: 'Les tirages papier ne sont pas encore disponibles.' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const eventId = String(body.eventId || '')
  if (!estUuid(eventId)) return Response.json({ error: 'Album inconnu.' }, { status: 400 })

  // Une ligne par photo, avec son nombre d'exemplaires. Une photo envoyée deux
  // fois ne compte qu'une fois : on commande des photos, pas des clics.
  const parPhoto = new Map()
  for (const l of Array.isArray(body.lignes) ? body.lignes : []) {
    const id = String(l?.photoId || '')
    const exemplaires = Math.floor(Number(l?.exemplaires) || 0)
    if (!estUuid(id)) return Response.json({ error: 'Photo inconnue.' }, { status: 400 })
    if (exemplaires < 1) continue
    if (exemplaires > EXEMPLAIRES_MAX) {
      return Response.json({ error: `${EXEMPLAIRES_MAX} exemplaires au plus par photo.` }, { status: 400 })
    }
    parPhoto.set(id, { exemplaires })
  }
  const ids = [...parPhoto.keys()]
  if (!ids.length) return Response.json({ error: 'Choisissez au moins une photo.' }, { status: 400 })
  const nombre = [...parPhoto.values()].reduce((n, l) => n + l.exemplaires, 0)
  if (nombre > TIRAGES_MAX) {
    return Response.json({ error: `${TIRAGES_MAX} tirages au plus par commande.` }, { status: 400 })
  }

  const { dest, erreur } = lireDestinataire(body.destinataire)
  if (erreur) return Response.json({ error: erreur }, { status: 400 })

  // Le rendu voulu : l'effet de l'album (pellicule, date) ou la photo d'origine.
  const rendu = {
    pellicule: pelliculeParId(body.rendu?.pellicule).id,
    date: body.rendu?.date === true,
  }

  const format = formatTirage(body.format)
  const finition = FINITIONS.find((f) => f.id === body.finition) || FINITIONS[0]

  if (await tropDeDemandes(ipDe(request), 'tirages', { max: 20, minutes: 60 })) {
    return Response.json({ error: MESSAGE_TROP }, { status: 429 })
  }

  const evRes = await selectRows(
    'events',
    `id=eq.${eventId}&select=id,name,status,reveal_at,reveal_paused,max_guests,purged_at`
  )
  const ev = Array.isArray(evRes.data) ? evRes.data[0] : null
  if (!ev || ev.status === 'suspended' || ev.purged_at) {
    return Response.json({ error: 'Cet album n\'est plus disponible.' }, { status: 404 })
  }
  const invites = await selectRows('guests', `event_id=eq.${eventId}&blocked=is.false&select=id`)
  const ouvert = isRevealed({
    revealAt: ev.reveal_at,
    revealPaused: ev.reveal_paused,
    maxGuests: ev.max_guests,
    guestCount: Array.isArray(invites.data) ? invites.data.length : 0,
  })
  if (!ouvert) return Response.json({ error: 'L\'album n\'est pas encore ouvert.' }, { status: 403 })

  const phRes = await selectRows(
    'photos',
    `event_id=eq.${eventId}&hidden=is.false&id=in.(${ids.join(',')})&select=id,storage_path,taken_at&order=taken_at.asc`
  )
  const trouvees = Array.isArray(phRes.data) ? phRes.data : []
  if (trouvees.length !== ids.length) {
    return Response.json({ error: 'Certaines photos ne sont plus dans l\'album. Rechargez la page.' }, { status: 409 })
  }

  // Familink met au plus 129 tirages 10 × 15 (ou 64 en 15 × 20) par enveloppe.
  if (imprimeurChoisi() === 'familink' && nombre > maxFamilink(format.id)) {
    return Response.json({ error: `${maxFamilink(format.id)} tirages ${format.nom} au plus par commande.` }, { status: 400 })
  }

  const devis = devisTirages(nombre, format.id, dest.pays)

  // En ligne, rien ne part sans paiement ni imprimeur réel.
  const stripe = getStripe()
  const imprimeur = imprimeurPret()
  if (EN_LIGNE && (!stripe || !imprimeur.configure || imprimeur.env !== 'live')) {
    return Response.json({ error: 'Les tirages papier arrivent bientôt.' }, { status: 503 })
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
  })
  const commande = cree.data
  if (!cree.ok || !commande?.id) {
    console.error('tirages: commande non enregistrée', cree.status, cree.data)
    return Response.json({ error: 'La commande n\'a pas pu être enregistrée. Réessayez dans un instant.' }, { status: 500 })
  }

  // Le paiement. Stripe montre le détail (tirages, livraison) et renvoie
  // l'invité sur l'album, qui confirme la commande.
  if (stripe) {
    const base = adresseDuSite(request)
    const effet = pelliculeParId(rendu.pellicule)
    const detail = [finition.nom, effet.canaux ? effet.nom : '', rendu.date ? 'date' : ''].filter(Boolean).join(' · ')
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        locale: 'fr',
        line_items: [
          {
            quantity: devis.nombre,
            price_data: {
              currency: 'eur',
              unit_amount: Math.round(format.prix * 100),
              product_data: { name: `Tirage photo ${format.nom.replace(/\u00a0/g, ' ')}`, description: detail },
            },
          },
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: devis.port,
              product_data: { name: `Livraison (${devis.pays.nom})` },
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
      return Response.json({ error: 'Le paiement n\'a pas pu s\'ouvrir. Réessayez dans un instant.' }, { status: 502 })
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
    return Response.json({ error: 'La commande n\'a pas pu partir. Détail dans le terminal du serveur.' }, { status: 502 })
  }
  return Response.json({
    ok: true, simule: true, bacASable: true, total: devis.total,
    imprimeur: { nom: fin.imprimeur, id: fin.imprimeur_commande_id, cout: { total: fin.cout_imprimeur_cents } },
  })
}
