import { selectRows, insertRow, deleteRows } from '../../../../../lib/supabase'

// Vérifie que la requête vient bien de l'organisateur (ou d'un admin déjà connecté,
// qui partage le même owner_token). Renvoie l'événement si autorisé, sinon null.
async function requireOwner(id, request) {
  const ownerToken = request.headers.get('x-owner-token')
  if (!ownerToken) return null
  const { data } = await selectRows('events', `id=eq.${id}&select=id,owner_token`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev || ev.owner_token !== ownerToken) return null
  return ev
}

// Ajoute un admin (nom + mail + code choisi par l'organisateur)
export async function POST(request, { params }) {
  const { id } = await params
  const ev = await requireOwner(id, request)
  if (!ev) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const email = (body.email || '').toString().trim().toLowerCase()
  const code = (body.code || '').toString().trim()
  const name = (body.name || '').toString().trim().slice(0, 60) || null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }
  if (code.length < 3) {
    return Response.json({ error: 'Le code doit faire au moins 3 caractères.' }, { status: 400 })
  }

  // Un même mail ne peut être admin qu'une fois par événement
  const existing = await selectRows('event_admins', `event_id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=id`)
  if (Array.isArray(existing.data) && existing.data[0]) {
    return Response.json({ error: 'Ce mail est déjà admin de cet événement.' }, { status: 409 })
  }

  const { ok, data } = await insertRow('event_admins', {
    event_id: id,
    email,
    code: code.slice(0, 40),
    name,
  })
  if (!ok || !data?.id) {
    return Response.json({ error: "Impossible d'ajouter cet admin." }, { status: 500 })
  }

  return Response.json({ id: data.id, name: data.name, email: data.email, code: data.code })
}

// Retire un admin (via ?adminId=…)
export async function DELETE(request, { params }) {
  const { id } = await params
  const ev = await requireOwner(id, request)
  if (!ev) return Response.json({ error: 'Action non autorisée.' }, { status: 403 })

  const adminId = new URL(request.url).searchParams.get('adminId')
  if (!adminId) return Response.json({ error: 'Admin non précisé.' }, { status: 400 })

  const del = await deleteRows('event_admins', `id=eq.${adminId}&event_id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  return Response.json({ ok: true })
}
