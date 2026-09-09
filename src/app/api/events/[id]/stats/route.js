import { selectRows, signPhotos } from '../../../../../lib/supabase'
import { isRevealed, quotaExceeded } from '../../../../../lib/phase'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'

// Le mur du groupe : les photos de la soirée, floutées à l'écran, pendant que
// la pellicule se remplit. Douze suffisent à remplir le premier écran ; la
// suite se demande en faisant défiler, plutôt que de faire descendre cent
// images sur le réseau d'une salle des fêtes.
const MUR_PAGE = 12
const MUR_MAX = 60

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
    // celui qui demande le mur. `display_name` en sort, lui : le mur porte les
    // prénoms, c'est ce qui donne envie de jouer le jeu.
    selectRows('guests', `event_id=eq.${id}&blocked=is.false&select=id,display_name,device_token`),
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

  // Combien de vignettes envoyer. Le téléphone demande la suite en faisant
  // défiler : `?n=24`, borné, pour qu'une adresse bricolée ne fasse pas signer
  // trois cents images d'un coup.
  const demande = parseInt(new URL(request.url).searchParams.get('n') || '', 10)
  // `n=0` : le viseur ne veut que les compteurs, pas les images. C'est le cas
  // le plus fréquent, puisque le bouton « Album » affiche le nombre de photos
  // du groupe en permanence.
  const combien = demande === 0 ? 0
    : Math.min(MUR_MAX, Math.max(MUR_PAGE, isNaN(demande) ? MUR_PAGE : demande))

  // Avant la révélation, on montre les photos de la soirée, floutées à l'écran.
  // Trois cas les retiennent malgré tout, et ce sont ceux qui ferment déjà
  // l'album : l'événement suspendu, la formule dépassée, la révélation passée
  // (l'album s'ouvre alors pour de bon, le mur n'a plus lieu d'être).
  let mur = []
  let murTotal = 0
  // Le total se calcule même quand on ne renvoie aucune image : c'est lui qui
  // dit s'il reste des vignettes à charger plus bas.
  const murOuvert =
    dansLaSoiree && !!ev && ev.status !== 'suspended' && !quotaExceeded(etat) && !isRevealed(etat)

  if (murOuvert) {
    // Ses propres photos y sont désormais mêlées aux autres, floutées comme
    // elles : voir sa photo rejoindre le mur du groupe vaut mieux qu'un
    // compteur, et c'est la preuve qu'elle est bien partie.
    const nom = new Map(invites.map((g) => [g.id, g.display_name || '']))
    // `?qui=moi` : ne garder que ses propres clichés. Le tri se fait ICI et non
    // sur le téléphone, sinon on filtrerait les douze dernières photos de la
    // soirée et il n'en resterait souvent aucune des siennes.
    const queLesMiennes = new URL(request.url).searchParams.get('qui') === 'moi'
    const visibles = cliches.filter(
      (p) => !p.hidden && (!queLesMiennes || mesFiches.includes(p.guest_id))
    )
    murTotal = visibles.length
    const recentes = visibles.slice(0, combien)
    const chemin = (p) => p.thumb_path || p.storage_path
    // Mini-versions de préférence : c'est le téléphone du participant qui les
    // télécharge, sur le réseau de la salle, et elles seront floutées de toute
    // façon. Six heures de validité, arrondies comme partout ailleurs, pour que
    // le rafraîchissement toutes les 4 s retombe sur la même adresse et donc
    // sur le cache du téléphone.
    const signees = recentes.length ? await signPhotos(recentes.map(chemin), 6 * 3600) : {}
    mur = recentes
      .map((p) => ({
        id: p.id,
        url: signees[chemin(p)],
        qui: nom.get(p.guest_id) || '',
        moi: mesFiches.includes(p.guest_id),
        takenAt: p.taken_at,
      }))
      .filter((p) => p.url)
  }

  return Response.json({
    guestCount,
    photoCount: cliches.length,
    mur,
    murTotal,
  })
}
