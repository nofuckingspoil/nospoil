// ============================================================
//  Appliquer un agrandissement de formule déjà réglé.
//
//  Le même geste est réclamé de deux endroits, et c'est voulu :
//   - au retour de Stripe, quand le payeur revient sur son tableau de bord ;
//   - à l'ouverture d'un nouveau paiement, quand on découvre qu'un précédent
//     a été réglé sans jamais être appliqué.
//
//  Ce second cas n'est pas théorique : il n'y a aucun webhook Stripe. Qui
//  règle puis ferme l'onglet a payé pour rien, et rien ne le rattrapait.
// ============================================================
import 'server-only'
import { updateRow } from './supabase'
import { notifyGuestsOfAlbum } from './notify-guests'

// `ev` : ligne `events` (id, name, reveal_at, reveal_paused, max_guests…).
// `session` : la session Stripe payée, avec ses metadata.
// Renvoie { ok, maxGuests, deja } : `deja` si la formule couvrait déjà ce palier.
export async function appliquerAgrandissement(ev, session) {
  const cible = parseInt(session?.metadata?.max_guests, 10) || 0
  if (!cible) return { ok: false, error: 'palier-illisible' }

  if (cible <= (ev.max_guests || 0)) {
    return { ok: true, maxGuests: ev.max_guests, deja: true }
  }

  const upd = await updateRow('events', `id=eq.${ev.id}`, {
    max_guests: cible,
    // La session qui a réellement fait monter la formule. Elle distingue plus
    // tard un simple rechargement de page d'un second règlement bien réel.
    upgrade_session_id: session.id,
    // Le paiement en cours ne l'est plus.
    upgrade_pending_session: null,
    upgrade_pending_at: null,
  })
  if (!upd.ok) return { ok: false, error: 'maj-impossible' }

  // La formule était le seul frein : si l'heure de révélation est passée,
  // l'album vient de s'ouvrir. Les participants inscrits reçoivent le lien tout de
  // suite, sans attendre le passage de la tâche planifiée.
  let notified = null
  try {
    notified = await notifyGuestsOfAlbum({ ...ev, max_guests: cible })
  } catch (err) {
    console.error('envoi du lien après mise à niveau:', err)
  }

  return { ok: true, maxGuests: cible, notified }
}
