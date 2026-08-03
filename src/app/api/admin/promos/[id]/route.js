import { updateRow, deleteRows, selectRows } from '../../../../../lib/supabase'

export const runtime = 'nodejs'

function refuse(request) {
  const key = request.headers.get('x-admin-key')
  return !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY
}

// Activer / désactiver un code. Un code qui fuite se coupe, il ne s'efface
// pas : les événements déjà créés grâce à lui gardent leur explication.
export async function PATCH(request, { params }) {
  if (refuse(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const { id } = await params
  const b = await request.json().catch(() => ({}))
  const patch = {}
  if (typeof b.active === 'boolean') patch.active = b.active
  if (b.note !== undefined) patch.note = (b.note || '').toString().trim().slice(0, 200) || null
  if (!Object.keys(patch).length) return Response.json({ error: 'Rien à modifier.' }, { status: 400 })

  const { ok } = await updateRow('promo_codes', `id=eq.${id}`, patch)
  if (!ok) return Response.json({ error: 'Modification impossible.' }, { status: 500 })
  return Response.json({ ok: true })
}

// Suppression définitive : réservée aux codes n'ayant jamais servi, pour ne
// pas effacer l'origine d'un événement déjà vendu.
export async function DELETE(request, { params }) {
  if (refuse(request)) return Response.json({ error: 'Accès refusé.' }, { status: 401 })

  const { id } = await params
  const { data } = await selectRows('promo_codes', `id=eq.${id}&select=uses`)
  const p = Array.isArray(data) ? data[0] : null
  if (!p) return Response.json({ error: 'Code introuvable.' }, { status: 404 })
  if ((p.uses || 0) > 0) {
    return Response.json({ error: 'Ce code a déjà servi : désactive-le plutôt que de l’effacer.' }, { status: 409 })
  }

  const { ok } = await deleteRows('promo_codes', `id=eq.${id}`)
  if (!ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })
  return Response.json({ ok: true })
}
