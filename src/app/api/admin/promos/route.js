import { selectRows, insertRow } from '../../../../lib/supabase'
import { normalizePromo, promoLabel } from '../../../../lib/promo'

export const runtime = 'nodejs'

// Gestion des codes promo. Protégé par la clé secrète ADMIN_KEY, comme le
// reste du tableau de bord (en-tête x-admin-key).
function refuse(request) {
  const key = request.headers.get('x-admin-key')
  return !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY
}

export async function GET(request) {
  if (refuse(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const { ok, data } = await selectRows('promo_codes', 'select=*&order=created_at.desc')
  if (!ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  const codes = (Array.isArray(data) ? data : []).map((p) => ({
    id: p.id,
    code: p.code,
    kind: p.kind,
    value: p.value,
    label: promoLabel(p),
    partnerName: p.partner_name || '',
    commissionPct: p.commission_pct || 0,
    maxGuestsAllowed: p.max_guests_allowed,
    maxUses: p.max_uses,
    uses: p.uses || 0,
    visits: p.visits || 0,
    revenueCents: p.revenue_cents || 0,
    // Ce que tu dois au partenaire : calculé sur ce qui a réellement été encaissé.
    commissionCents: Math.round(((p.revenue_cents || 0) * (p.commission_pct || 0)) / 100),
    marksTest: !!p.marks_test,
    active: p.active,
    expiresAt: p.expires_at,
    note: p.note || '',
    createdAt: p.created_at,
  }))

  const totals = codes.reduce(
    (t, c) => ({
      uses: t.uses + c.uses,
      revenueCents: t.revenueCents + c.revenueCents,
      commissionCents: t.commissionCents + c.commissionCents,
    }),
    { uses: 0, revenueCents: 0, commissionCents: 0 }
  )

  return Response.json({ codes, totals })
}

export async function POST(request) {
  if (refuse(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const b = await request.json().catch(() => ({}))
  const code = normalizePromo(b.code)
  if (code.length < 3) return Response.json({ error: 'Le code doit faire au moins 3 caractères.' }, { status: 400 })

  const kind = ['free', 'percent', 'amount'].includes(b.kind) ? b.kind : 'free'

  // Un code qui offre le service se devine à l'essai. « TEST » ou « GRATUIT »
  // seraient trouvés en quelques minutes, et la plus grosse formule avec.
  if (kind === 'free' && code.length < 6) {
    return Response.json(
      { error: 'Un code « offert » doit faire au moins 6 caractères : un code court se devine.' },
      { status: 400 }
    )
  }

  let value = parseInt(b.value, 10) || 0
  if (kind === 'percent') value = Math.min(100, Math.max(1, value))
  if (kind === 'amount') value = Math.max(1, value) // en centimes
  if (kind === 'free') value = 0

  // Déjà pris ? On le dit franchement : deux codes identiques rendraient
  // les statistiques d'affiliation ininterprétables.
  const existe = await selectRows('promo_codes', `code=eq.${encodeURIComponent(code)}&select=id`)
  if (Array.isArray(existe.data) && existe.data[0]) {
    return Response.json({ error: 'Ce code existe déjà.' }, { status: 409 })
  }

  const expires = b.expiresAt ? new Date(b.expiresAt) : null

  const { ok, data } = await insertRow('promo_codes', {
    code,
    kind,
    value,
    partner_name: (b.partnerName || '').toString().trim().slice(0, 80) || null,
    commission_pct: Math.min(100, Math.max(0, parseInt(b.commissionPct, 10) || 0)),
    max_guests_allowed: b.maxGuestsAllowed ? parseInt(b.maxGuestsAllowed, 10) : null,
    max_uses: b.maxUses ? Math.max(1, parseInt(b.maxUses, 10)) : null,
    expires_at: expires && !isNaN(expires.getTime()) ? expires.toISOString() : null,
    note: (b.note || '').toString().trim().slice(0, 200) || null,
    marks_test: b.marksTest === true,
    active: true,
  })

  if (!ok || !data?.id) return Response.json({ error: 'Création impossible.' }, { status: 500 })
  return Response.json({ id: data.id, code })
}
