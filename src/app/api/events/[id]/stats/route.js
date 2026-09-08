import { selectRows, signPhotos } from '../../../../../lib/supabase'
import { isRevealed, quotaExceeded } from '../../../../../lib/phase'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'

// Le mur du groupe : combien de photos des autres on montre, floutées, pendant
// la soirée. Vingt-quatre suffisent à remplir l'écran et à donner le sentiment
// que ça vit ; au-delà, on ferait descendre des images que personne ne regarde.
const MUR_MAX = 24

// Compteurs publics légers (participants + photos), rafraîchis en temps réel
// par l'écran album des participants, et le mur du groupe qui va avec.
// Volontairement minimal : pas de signature de couverture ni d'infos privées,
// pour rester rapide même appelé souvent.
export async function GET(request, { params }) {
  const { id } = await params
  if (!estUuid(id)) return identifiantInvalide()

  const [evs, guests, photos] = await Promise.all([
    selectRows('events', `id=eq.${id}&select=reveal_at,reveal_paused,max_guests,status,owner_token`),
    // `device_token` : il ne sort jamais d'ici, il sert seulement à reconnaître
    // celui qui demande le mur. Le compte de participants, lui, ne change pas.
    selectRows('guests', `event_id=eq.${id}&blocked=is.false&select=id,device_token`),
    selectRows('photos', `event_id=eq.${id}&select=id,guest_id,storage_path,thumb_path,hidden,taken_at&order=taken_at.desc`),
  ])

  const ev = Array.isArray(evs.data) ? evs.data[0] : null
  const invites = Array.isArray(guests.data) ? guests.data : []
  const cliches = Array.isArray(photos.data) ? photos.data : []
  const guestCount = invites.length

  // Le mur est réservé à ceux qui sont dans la soirée : un participant reconnu à
  // son appareil, ou l'organisateur. Le jeton se fabrique côté téléphone, mais
  // il ne vaut que s'il correspond à une fiche de CET événement : c'est la même
  // porte que pour ses propres photos.
  const monJeton = request.headers.get('x-device-token') || ''
  const jetonOrga = request.headers.get('x-owner-token') || ''
  // Un même appareil peut avoir plusieurs fiches sur le même événement (le
  // prénom saisi deux fois), d'où la liste plutôt qu'une seule.
  const mesFiches = monJeton ? invites.filter((g) => g.device_token === monJeton).map((g) => g.id) : []
  const dansLaSoiree =
    mesFiches.length > 0 || (!!jetonOrga && !!ev?.owner_token && jetonOrga === ev.owner_token)

  const etat = {
    revealAt: ev?.reveal_at,
    revealPaused: ev?.reveal_paused,
    maxGuests: ev?.max_guests,
    guestCount,
  }

  // Avant la révélation, on montre les photos des autres, floutées à l'écran.
  // Trois cas les retiennent malgré tout, et ce sont ceux qui ferment déjà
  // l'album : l'événement suspendu, la formule dépassée, la révélation passée
  // (l'album s'ouvre alors pour de bon, le mur n'a plus lieu d'être).
  let mur = []
  const murOuvert =
    dansLaSoiree && !!ev && ev.status !== 'suspended' && !quotaExceeded(etat) && !isRevealed(etat)

  if (murOuvert) {
    // Ses propres photos n'y sont pas : elles l'attendent juste en dessous,
    // nettes, dans « Mes photos ». Le mur, c'est celui des autres.
    const recentes = cliches
      .filter((p) => !p.hidden && !mesFiches.includes(p.guest_id))
      .slice(0, MUR_MAX)
    const chemin = (p) => p.thumb_path || p.storage_path
    // Mini-versions de préférence : c'est le téléphone du participant qui les
    // télécharge, sur le réseau de la salle, et elles seront floutées de toute
    // façon. Six heures de validité, arrondies comme partout ailleurs, pour que
    // le rafraîchissement toutes les 4 s retombe sur la même adresse et donc
    // sur le cache du téléphone.
    const signees = await signPhotos(recentes.map(chemin), 6 * 3600)
    mur = recentes
      .map((p) => ({ id: p.id, url: signees[chemin(p)] }))
      .filter((p) => p.url)
  }

  return Response.json({
    guestCount,
    photoCount: cliches.length,
    mur,
  })
}
