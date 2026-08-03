import { quotePromo, countPromoVisit } from '../../../../lib/promo'

export const runtime = 'nodejs'

// Vérifie un code promo pour une formule donnée, et renvoie le prix qui en
// résulte. On ne renvoie que ce que l'organisateur a besoin de voir : ni le
// nom du partenaire, ni sa commission.
export async function POST(request) {
  const { code, maxGuests } = await request.json().catch(() => ({}))
  const q = await quotePromo(code, maxGuests)

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
