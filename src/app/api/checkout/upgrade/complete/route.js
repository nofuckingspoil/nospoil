import { getStripe } from '../../../../../lib/stripe'
import { selectRows, updateRow } from '../../../../../lib/supabase'
import { notifyGuestsOfAlbum } from '../../../../../lib/notify-guests'
import { membrePar } from '../../../../../lib/equipe'
import { alerterDoublePaiement } from '../../../../../lib/paiement-double'

export const runtime = 'nodejs'

// Applique une mise à niveau de formule après paiement.
//
// Volontairement idempotent sans colonne dédiée : la formule ne fait que monter.
// Rappelé deux fois (page rechargée), le second appel ne trouve rien à relever
// et se contente de confirmer.
export async function POST(request) {
  const stripe = getStripe()
  if (!stripe) return Response.json({ error: 'Paiement indisponible.' }, { status: 400 })

  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const { sessionId } = await request.json().catch(() => ({}))
  if (!sessionId) return Response.json({ error: 'Session manquante.' }, { status: 400 })

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return Response.json({ error: 'Session de paiement introuvable.' }, { status: 404 })
  }
  if (!session || session.payment_status !== 'paid') {
    return Response.json({ error: "Le paiement n'a pas été confirmé." }, { status: 402 })
  }

  const m = session.metadata || {}
  if (m.kind !== 'upgrade' || !m.event_id) {
    return Response.json({ error: 'Ce paiement ne concerne pas une mise à niveau.' }, { status: 400 })
  }

  const { data } = await selectRows(
    'events',
    `id=eq.${m.event_id}&select=id,name,owner_token,owner_email,reveal_at,reveal_paused,max_guests,upgrade_session_id`
  )
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: 'Événement introuvable.' }, { status: 404 })

  // Même porte que pour l'ouverture du paiement : un co-organisateur qui a
  // réglé doit pouvoir finaliser. Lui refuser ici serait le pire des cas —
  // l'argent prélevé, et la formule inchangée.
  const membre = await membrePar(ev.id, ownerToken)
  if (!membre) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const cible = parseInt(m.max_guests, 10) || 0

  // Déjà appliqué : le plus souvent une page rechargée, avec la même session.
  // Une session différente veut dire que deux personnes ont payé la même mise
  // à niveau — l'organisateur et un co-organisateur alertés en même temps. La
  // formule ne monte qu'une fois : le second règlement est à rembourser, et
  // personne ne le verrait si on n'en disait rien ici.
  if (cible <= (ev.max_guests || 0)) {
    if (ev.upgrade_session_id && ev.upgrade_session_id !== session.id) {
      try {
        await alerterDoublePaiement({
          eventName: ev.name,
          eventId: ev.id,
          email: membre.email || session.customer_email,
          montantCents: session.amount_total,
          sessionId: session.id,
        })
      } catch (err) { console.error('alerte double paiement:', err) }
    }
    return Response.json({ ok: true, maxGuests: ev.max_guests, alreadyApplied: true })
  }

  const upd = await updateRow('events', `id=eq.${ev.id}`, {
    max_guests: cible,
    upgrade_session_id: session.id,
  })
  if (!upd.ok) return Response.json({ error: 'Mise à niveau impossible.' }, { status: 500 })

  // La formule était le seul frein : si l'heure de révélation est passée,
  // l'album vient de s'ouvrir. Les invités inscrits reçoivent le lien tout de
  // suite, sans attendre le passage de la tâche planifiée.
  let notified = null
  try {
    notified = await notifyGuestsOfAlbum({ ...ev, max_guests: cible })
  } catch (err) {
    console.error('envoi du lien après mise à niveau:', err)
  }

  return Response.json({ ok: true, maxGuests: cible, notified })
}
