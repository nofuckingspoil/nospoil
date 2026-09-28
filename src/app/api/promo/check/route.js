import { quotePromo, countPromoVisit } from '../../../../lib/promo'
import { langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

export const runtime = 'nodejs'

// Vérifie un code promo pour une formule donnée, et renvoie le prix qui en
// résulte. On ne renvoie que ce que l'organisateur a besoin de voir : ni le
// nom du partenaire, ni sa commission.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { code, maxGuests } = body
  const langue = langueValide(body.langue) || langueRequete(request)
  const q = await quotePromo(code, maxGuests, langue)

  if (!q.ok) return Response.json({ valid: false, error: q.error }, { status: 200 })

  return Response.json({
    valid: true,
    code: q.code,
    label: q.label,
    priceCents: q.priceCents,
    basePriceCents: q.basePriceCents,
    free: q.free,
  })
}

// Arrivée par un lien partenaire : on compte la visite.
export async function PUT(request) {
  const { code } = await request.json().catch(() => ({}))
  await countPromoVisit(code)
  return Response.json({ ok: true })
}
