// ============================================================
//  Signaler une photo de l'album.
//
//  Exigé par Apple, règle 1.2 : une app qui affiche du contenu publié par ses
//  utilisateurs doit offrir « a mechanism to report offensive content and
//  timely responses to concerns ». Il n'existe aucune exception pour les
//  albums privés : un mariage entre 76 invités est soumis à la même règle
//  qu'un réseau social ouvert.
//
//  LA RÉPONSE EST IMMÉDIATE, ET C'EST VOULU.
//
//  La photo signalée est masquée sur-le-champ, sans attendre l'organisateur.
//  Attendre, c'est laisser une photo gênante sous les yeux de tout le monde
//  pendant des heures. L'organisateur est prévenu par mail et peut la rétablir
//  d'un geste si le signalement n'était pas fondé : rien n'est détruit, la
//  photo lui reste visible.
//
//  Le risque d'abus (quelqu'un qui masquerait tout l'album) est tenu par le
//  plafond de demandes par appareil, et par le fait que l'organisateur voit
//  tout et rétablit en un appui.
// ============================================================
import { selectRows, updateRow } from '../../../../../lib/supabase'
import { sendMail, photoSignaleeEmail } from '../../../../../lib/mail'
import { ipDe, tropDeDemandes, MESSAGE_TROP } from '../../../../../lib/rate-limit'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://timetoflash.fr'

export async function POST(request, { params }) {
  const { id } = await params
  if (!estUuid(id)) return identifiantInvalide()

  const body = await request.json().catch(() => ({}))
  const photoId = (body.photoId || '').toString()
  const motif = (body.motif || '').toString().trim().slice(0, 300)

  if (!estUuid(photoId)) return identifiantInvalide()

  // Un signalement est un geste rare. Dix par heure et par appareil suffisent
  // largement, et ferment la porte à qui voudrait vider un album.
  if (await tropDeDemandes(ipDe(request), 'photo-report', { max: 10, minutes: 60 })) {
    return Response.json({ error: MESSAGE_TROP }, { status: 429 })
  }

  const ph = await selectRows('photos', `id=eq.${photoId}&event_id=eq.${id}&select=id,hidden`)
  const photo = Array.isArray(ph.data) ? ph.data[0] : null
  if (!photo) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  // Déjà masquée : le signalement est reçu, il n'y a rien de plus à faire.
  if (!photo.hidden) {
    const maj = await updateRow('photos', `id=eq.${photoId}`, { hidden: true })
    if (!maj.ok) return Response.json({ error: 'Signalement impossible.' }, { status: 500 })
  }

  // Prévenir l'organisateur, sans jamais faire échouer le signalement pour un
  // problème d'envoi de mail : la photo est déjà retirée, c'est l'essentiel.
  try {
    const ev = await selectRows('events', `id=eq.${id}&select=name,owner_email`)
    const evenement = Array.isArray(ev.data) ? ev.data[0] : null
    if (evenement?.owner_email) {
      const mail = photoSignaleeEmail({
        eventName: evenement.name || 'votre événement',
        galleryUrl: `${SITE}/g/${id}`,
        motif,
      })
      await sendMail({ to: evenement.owner_email, subject: mail.subject, html: mail.html })
    }
  } catch (err) {
    console.error('mail signalement:', err)
  }

  return Response.json({ ok: true })
}
