// ============================================================
//  « J'ouvre l'album », et faut-il me poser la question ?
//
//  Deux choses en un aller-retour, appelé au chargement de la galerie :
//   1. on note que ce participant est bien venu jusqu'à l'album. C'est ce qui
//      permettra de ne relancer par mail que ceux qui ne sont jamais venus, 
//      précisément ceux que la question posée ici ne verra jamais ;
//   2. on répond s'il faut afficher l'encart d'avis.
//
//  Le « une seule fois » se décide ici, côté serveur, et non dans le
//  navigateur : quelqu'un qui a déjà répondu par mail ne doit pas revoir la
//  question en ouvrant l'album depuis un autre téléphone.
// ============================================================
import { selectRows, updateRow } from '../../../../lib/supabase'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const eventId = (body.eventId || '').toString().trim()
  const deviceToken = (body.deviceToken || '').toString().trim()
  if (!eventId || !deviceToken) return Response.json({ montrer: false })

  try {
    const { data } = await selectRows(
      'events',
      `id=eq.${eventId}&select=owner_token&limit=1`
    )
    const ev = Array.isArray(data) ? data[0] : null
    // L'organisateur reçoit son propre questionnaire par mail, plus complet.
    // Lui poser en plus la question du participant fausserait les deux.
    if (!ev || ev.owner_token === deviceToken) return Response.json({ montrer: false })

    const res = await selectRows(
      'guests',
      `event_id=eq.${eventId}&device_token=eq.${encodeURIComponent(deviceToken)}` +
        `&select=id,album_opened_at,feedback_at,survey_optout&limit=1`
    )
    const g = Array.isArray(res.data) ? res.data[0] : null
    // Sans fiche de participant, on ne sait ni qui c'est ni s'il a déjà répondu :
    // mieux vaut se taire que redemander à quelqu'un qui a déjà donné son avis.
    if (!g) return Response.json({ montrer: false })

    // La première visite fait foi : on ne réécrit pas la date à chaque retour.
    if (!g.album_opened_at) {
      await updateRow('guests', `id=eq.${g.id}`, { album_opened_at: new Date().toISOString() })
    }

    return Response.json({ montrer: !g.feedback_at && !g.survey_optout })
  } catch (err) {
    console.error('avis : ping album', err)
    // En cas de pépin on ne montre rien : une question qui surgit par erreur
    // au milieu des photos est pire que pas de question du tout.
    return Response.json({ montrer: false })
  }
}
