// ============================================================
//  Le mail des photos préférées, deux jours après la révélation.
//
//  Une tâche par jour suffit : ce mail n'a rien d'urgent, et le classement
//  qu'il annonce a besoin de temps pour se former.
//
//  Elle repasse pendant une semaine sur les mêmes événements, ce qui rattrape
//  une journée manquée et laisse leur chance aux albums qui n'avaient pas
//  encore assez de cœurs le premier jour. Aucun doublon possible : seuls sont
//  contactés les participants dont `faves_notified_at` est encore vide.
//
//  Protégée par CRON_SECRET, comme les autres.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { envoyerPhotosPreferees, APRES_JOURS, FENETRE_JOURS } from '../../../../lib/photos-preferees'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH = 40

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const now = Date.now()
  const jusqua = new Date(now - APRES_JOURS * 86400000)
  const depuis = new Date(now - FENETRE_JOURS * 86400000)

  const { ok, data } = await selectRows(
    'events',
    'select=id,name,reveal_at' +
      `&reveal_at=lte.${jusqua.toISOString()}` +
      `&reveal_at=gte.${depuis.toISOString()}` +
      '&reveal_paused=is.false' +
      '&purged_at=is.null' +
      // Les albums d'essai n'ont pas de participants inscrits : ils
      // n'occuperaient la file que pour n'envoyer aucun mail.
      '&is_test=is.false' +
      `&order=reveal_at.desc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/preferees: lecture impossible', data)
    return Response.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 })
  }

  let envoyes = 0
  let echecs = 0
  for (const ev of data) {
    try {
      const res = await envoyerPhotosPreferees(ev)
      envoyes += res.envoyes || 0
      echecs += res.echecs || 0
    } catch (err) {
      // Un événement qui échoue ne doit pas priver les suivants de leur mail.
      console.error('cron/preferees: envoi impossible pour', ev.id, err)
      echecs++
    }
  }

  return Response.json({ ok: true, evenements: data.length, envoyes, echecs })
}
