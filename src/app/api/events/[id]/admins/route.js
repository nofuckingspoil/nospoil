import { selectRows, insertRow, deleteRows } from '../../../../../lib/supabase'
import { roleFor, canDelete } from '../../../../../lib/authz'
import { makeToken, normalizeEmail, isValidEmail } from '../../../../../lib/account'
import { sendMail, adminInviteEmail, siteUrl } from '../../../../../lib/mail'

// Gérer la liste des co-admins reste au propriétaire seul : sinon un co-admin
// pourrait s'en ajouter d'autres, ou évincer celui qui l'a invité.
async function requireOwner(id, request) {
  const role = await roleFor(id, request.headers.get('x-owner-token'))
  return canDelete(role)
}

// Invite un co-admin (nom + mail). Il n'y a plus de code à convenir : il se
// connectera par mail, comme l'organisateur.
export async function POST(request, { params }) {
  const { id } = await params
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  const name = (body.name || '').toString().trim().slice(0, 60) || null

  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  // Un même mail ne peut être admin qu'une fois par événement
  const existing = await selectRows('event_admins', `event_id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=id`)
  if (Array.isArray(existing.data) && existing.data[0]) {
    return Response.json({ error: 'Ce mail est déjà admin de cet événement.' }, { status: 409 })
  }

  const { ok, data } = await insertRow('event_admins', {
    event_id: id,
    email,
    name,
    token: makeToken(),
    // Colonne héritée de l'ancien système de code convenu : elle ne sert plus
    // à s'authentifier, mais reste obligatoire en base.
    code: makeToken().slice(0, 12),
  })
  if (!ok || !data?.id) {
    return Response.json({ error: "Impossible d'ajouter cet admin." }, { status: 500 })
  }

  // Invitation : elle explique quoi faire, sans transporter le moindre secret.
  // C'est la connexion par mail qui prouvera son identité.
  const evRow = await selectRows('events', `id=eq.${id}&select=name`)
  const eventName = (Array.isArray(evRow.data) ? evRow.data[0]?.name : '') || 'votre événement'
  let invited = false
  try {
    const mail = adminInviteEmail({ eventName, loginUrl: `${siteUrl()}/connexion` })
    const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html })
    invited = !!sent?.ok
  } catch (err) {
    console.error('mail invitation admin:', err)
  }

  return Response.json({ id: data.id, name: data.name, email: data.email, invited })
}

// Retire un admin (via ?adminId=…)
export async function DELETE(request, { params }) {
  const { id } = await params
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: 'Action non autorisée.' }, { status: 403 })
  }

  const adminId = new URL(request.url).searchParams.get('adminId')
  if (!adminId) return Response.json({ error: 'Admin non précisé.' }, { status: 400 })

  const del = await deleteRows('event_admins', `id=eq.${adminId}&event_id=eq.${id}`)
  if (!del.ok) return Response.json({ error: 'Suppression impossible.' }, { status: 500 })

  return Response.json({ ok: true })
}
