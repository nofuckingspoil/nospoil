import { selectRows, insertRow, deleteRows, updateRow } from '../../../../../lib/supabase'
import { roleFor, canDelete } from '../../../../../lib/authz'
import { makeToken, normalizeEmail, isValidEmail, ensureAccount } from '../../../../../lib/account'
import { sendMail, adminInviteEmail, siteUrl } from '../../../../../lib/mail'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'
import { t, langueValide } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'

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
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  // L'invitation part dans la langue de celui qui invite.
  const langueInvite = langueValide(body.langue) || langue
  // Prénom et nom arrivent séparés ; on les range en un seul libellé d'affichage.
  const prenom = (body.firstName || '').toString().trim().slice(0, 40)
  const nom = (body.lastName || '').toString().trim().slice(0, 40)
  const name = [prenom, nom].filter(Boolean).join(' ').slice(0, 80)
    || (body.name || '').toString().trim().slice(0, 80) || null

  if (!isValidEmail(email)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }

  // Un même mail ne peut être admin qu'une fois par événement
  const existing = await selectRows('event_admins', `event_id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=id`)
  if (Array.isArray(existing.data) && existing.data[0]) {
    return Response.json({ error: t({ fr: 'Ce mail est déjà admin de cet événement.', en: 'This email is already an admin of this event.', de: 'Diese E-Mail-Adresse ist bereits Admin dieses Events.' }, langue) }, { status: 409 })
  }

  const compte = await ensureAccount(email, name)

  const { ok, data } = await insertRow('event_admins', {
    event_id: id,
    email,
    name,
    account_id: compte,
    token: makeToken(),
    langue: langueInvite,
    // Colonne héritée de l'ancien système de code convenu : elle ne sert plus
    // à s'authentifier, mais reste obligatoire en base.
    code: makeToken().slice(0, 12),
  })
  if (!ok || !data?.id) {
    return Response.json({ error: t({ fr: 'Impossible d\'ajouter cet admin.', en: 'This admin could not be added.', de: 'Dieser Admin konnte nicht hinzugefügt werden.' }, langue) }, { status: 500 })
  }

  // Invitation : elle explique quoi faire, sans transporter le moindre secret.
  // C'est la connexion par mail qui prouvera son identité.
  const evRow = await selectRows('events', `id=eq.${id}&select=name`)
  const eventName = (Array.isArray(evRow.data) ? evRow.data[0]?.name : '') || t({ fr: 'votre événement', en: 'your event', de: 'Ihr Event' }, langueInvite)
  // L'envoi peut échouer sans que rien ne le laisse voir : on l'horodate pour
  // pouvoir dire à l'organisateur que la personne n'a jamais été prévenue.
  let invited = false
  try {
    const mail = adminInviteEmail({ eventName, loginUrl: `${siteUrl()}/connexion`, langue: langueInvite })
    const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html })
    invited = !!sent?.ok
    if (invited) await updateRow('event_admins', `id=eq.${data.id}`, { invited_at: new Date().toISOString() })
  } catch (err) {
    console.error('mail invitation admin:', err)
  }

  return Response.json({ id: data.id, name: data.name, email: data.email, invited })
}

// Retire un admin (via ?adminId=…)
export async function DELETE(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)
  if (!(await requireOwner(id, request))) {
    return Response.json({ error: t({ fr: 'Action non autorisée.', en: 'Action not allowed.', de: 'Aktion nicht erlaubt.' }, langue) }, { status: 403 })
  }

  const adminId = new URL(request.url).searchParams.get('adminId')
  if (!adminId) return Response.json({ error: t({ fr: 'Admin non précisé.', en: 'No admin specified.', de: 'Kein Admin angegeben.' }, langue) }, { status: 400 })

  const del = await deleteRows('event_admins', `id=eq.${adminId}&event_id=eq.${id}`)
  if (!del.ok) return Response.json({ error: t({ fr: 'Suppression impossible.', en: 'Deletion not possible.', de: 'Löschen nicht möglich.' }, langue) }, { status: 500 })

  return Response.json({ ok: true })
}
