// ============================================================
//  Envoi du lien de l'album, à l'heure de la révélation.
//
//  La révélation elle-même ne dépend de personne : l'album s'ouvre dès que
//  l'heure est passée, parce que le code compare simplement les deux dates.
//  Le mail, lui, doit bien partir de quelque part.
//
//  Il partait jusqu'ici de deux endroits : le tableau de bord, quand
//  l'organisateur l'ouvrait après la révélation, et le rappel quotidien en
//  filet de sécurité. Un organisateur qui ne se connecte pas le jour même
//  laissait donc ses invités attendre jusqu'au lendemain matin — pour un
//  album révélé à midi, vingt-deux heures de silence.
//
//  Cette tâche-ci ne fait que cet envoi, et repasse toutes les dix minutes.
//  Elle est volontairement pauvre : pas d'enquête, pas de récapitulatif, rien
//  qui puisse la ralentir ou la faire échouer pour autre chose.
//
//  Repasser sans cesse ne risque aucun doublon : seuls sont contactés les
//  invités dont `notified_at` est encore vide, et l'envoi le renseigne.
//
//  Protégée par CRON_SECRET, comme les autres.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { notifyGuestsOfAlbum } from '../../../../lib/notify-guests'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Au-delà, c'est le rappel quotidien qui reprend la main. Sans cette fenêtre,
// chaque passage relirait tous les événements déjà révélés du site — un
// travail qui grossirait indéfiniment pour ne rien envoyer.
const FENETRE_H = 48
const BATCH = 50

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const now = new Date()
  const depuis = new Date(now.getTime() - FENETRE_H * 3600 * 1000)

  const { ok, data } = await selectRows(
    'events',
    'select=id,name,reveal_at,reveal_paused,max_guests' +
      `&reveal_at=lte.${now.toISOString()}` +
      `&reveal_at=gte.${depuis.toISOString()}` +
      '&reveal_paused=is.false' +
      '&purged_at=is.null' +
      `&order=reveal_at.desc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/revelation: lecture impossible', data)
    return Response.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 })
  }

  let envoyes = 0
  let echecs = 0
  for (const ev of data) {
    try {
      const res = await notifyGuestsOfAlbum(ev)
      envoyes += res.envoyes || 0
      echecs += res.echecs || 0
    } catch (err) {
      // Un événement qui échoue ne doit pas priver les suivants de leur mail.
      console.error('cron/revelation: envoi impossible pour', ev.id, err)
      echecs++
    }
  }

  return Response.json({ ok: true, evenements: data.length, envoyes, echecs })
}
