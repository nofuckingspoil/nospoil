// ============================================================
//  La liste de l'organisateur, en un seul appel.
//
//  La page « Mes événements » interrogeait le serveur une fois PAR événement :
//  deux appels pour un particulier, quarante-cinq pour l'adresse de l'équipe,
//  qui les voit tous. Et chacun rendait un tableau de bord complet (contacts,
//  co-organisateurs, couverture signée, participants actifs) dont la liste
//  n'affiche que quatre choses. Sur un téléphone, l'attente se voyait.
//
//  Ici, un seul aller-retour, quel que soit le nombre d'événements, et rien de
//  plus que ce que la liste montre.
// ============================================================
import { rpc } from '../../../lib/supabase'
import { isRevealed } from '../../../lib/phase'
import { estUuid } from '../../../lib/params'

// Au-delà, ce n'est plus la liste de quelqu'un : c'est un balayage. On s'arrête
// là plutôt que d'assembler une requête sans fin.
const MAX = 300

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const demandes = Array.isArray(body?.acces) ? body.acces.slice(0, MAX) : []

  // Un identifiant bien formé et un jeton non vide : le reste ne mérite pas un
  // aller-retour jusqu'à la base. Les doublons non plus.
  const vus = new Set()
  const paires = []
  for (const a of demandes) {
    const id = typeof a?.id === 'string' ? a.id.trim() : ''
    const token = typeof a?.token === 'string' ? a.token.trim() : ''
    if (!estUuid(id) || !token || vus.has(id)) continue
    vus.add(id)
    paires.push({ id, token })
  }
  if (!paires.length) return Response.json({ events: [] })

  // C'est la base qui vérifie les jetons, un par événement : un identifiant
  // connu sans sa clé ne ressort pas. Auparavant, la liste affichait n'importe
  // quel événement dont l'appareil gardait l'identifiant, même sans y avoir
  // droit : son nom, sa date et son nombre de photos.
  const { ok, data } = await rpc('liste_evenements', {
    p_ids: paires.map((p) => p.id),
    p_tokens: paires.map((p) => p.token),
  })
  if (!ok) return Response.json({ error: 'Liste indisponible.' }, { status: 502 })

  const parId = new Map((Array.isArray(data) ? data : []).map((e) => [e.id, e]))

  // L'ordre de la demande est celui de l'appareil : le plus récent d'abord.
  const events = paires
    .map(({ id }) => parId.get(id))
    .filter(Boolean)
    .map((e) => ({
      id: e.id,
      name: e.name,
      revealAt: e.reveal_at,
      photoCount: Number(e.photo_count) || 0,
      revealed: isRevealed({
        startsAt: e.starts_at,
        revealAt: e.reveal_at,
        revealPaused: e.reveal_paused,
        maxGuests: e.max_guests,
        guestCount: Number(e.guest_count) || 0,
      }),
    }))

  return Response.json({ events })
}
