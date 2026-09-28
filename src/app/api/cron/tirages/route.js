// ============================================================
//  La relance « vos photos sur papier », une fois par jour.
//
//  Ne regarde que les albums révélés il y a entre cinq et six jours : chaque
//  album passe dans une seule tournée (voir lib/relance-tirages). Muette tant
//  que les tirages ne sont pas ouverts (NEXT_PUBLIC_TIRAGES).
//
//  Protégée par CRON_SECRET, comme les autres.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { envoyerRelanceTirages, APRES_JOURS } from '../../../../lib/relance-tirages'
import { tiragesActifs } from '../../../../lib/tirages'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  if (!tiragesActifs()) return Response.json({ ok: true, inactif: true })

  const now = Date.now()
  const jusqua = new Date(now - APRES_JOURS * 86400000)
  const depuis = new Date(now - (APRES_JOURS + 1) * 86400000)

  const { ok, data } = await selectRows(
    'events',
    'select=id,name,reveal_at' +
      `&reveal_at=lte.${jusqua.toISOString()}` +
      `&reveal_at=gt.${depuis.toISOString()}` +
      '&reveal_paused=is.false' +
      '&purged_at=is.null' +
      '&is_test=is.false' +
      '&status=neq.suspended' +
      '&order=reveal_at.desc&limit=40'
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/tirages: lecture impossible', data)
    return Response.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 })
  }

  let envoyes = 0
  let echecs = 0
  for (const ev of data) {
    try {
      const res = await envoyerRelanceTirages(ev)
      envoyes += res.envoyes || 0
      echecs += res.echecs || 0
    } catch (err) {
      console.error('cron/tirages: envoi impossible pour', ev.id, err)
      echecs++
    }
  }
  return Response.json({ ok: true, evenements: data.length, envoyes, echecs })
}
