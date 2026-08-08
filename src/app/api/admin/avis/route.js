// ============================================================
//  Les avis, pour l'admin du site.
//
//  Réservé à vous : ni l'organisateur ni les participants n'y ont accès. C'est la
//  contrepartie de la promesse faite dans le questionnaire (« l'organisateur
//  ne verra jamais votre réponse »), et c'est ce qui fait qu'on y écrit des
//  choses vraies.
//
//  Protégé par la clé ADMIN_KEY (en-tête x-admin-key), comme les autres
//  routes du tableau de bord.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { resumeAppareil } from '../../../../lib/avis'

export const runtime = 'nodejs'

const LIMITE = 1000

export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  }

  const eventId = new URL(request.url).searchParams.get('event')
  const filtre = eventId ? `event_id=eq.${eventId}&` : ''

  const { ok, data } = await selectRows(
    'feedback',
    `${filtre}select=*,guests(display_name)&order=created_at.desc&limit=${LIMITE}`
  )
  if (!ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  const rows = Array.isArray(data) ? data : []

  // Le nom de l'événement filtré, même s'il n'a encore aucun avis : la page
  // doit pouvoir dire « aucun avis pour X » plutôt qu'un vide sans contexte.
  let eventName = null
  if (eventId) {
    const ev = await selectRows('events', `id=eq.${eventId}&select=name&limit=1`)
    eventName = Array.isArray(ev.data) && ev.data[0] ? ev.data[0].name : null
  }

  const avis = rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    eventId: r.event_id,
    // Le nom recopié prend le relais quand l'événement a été supprimé.
    eventName: r.event_name || null,
    guestName: r.guests?.display_name || null,
    role: r.role,
    canal: r.canal,
    rating: r.rating,
    nps: r.nps,
    npsReason: r.nps_reason,
    issues: r.issues || [],
    issueDetail: r.issue_detail,
    suggestion: r.suggestion,
    favorite: r.favorite,
    source: r.source,
    wouldHost: r.would_host,
    callOk: !!r.call_ok,
    phone: r.phone,
    contactEmail: r.contact_email,
    // L'identité technique brute ne sert à rien à l'écran : on n'envoie que
    // ce qui se lit : « iPhone · dans Instagram ».
    appareil: resumeAppareil(r.device),
  }))

  return Response.json({ avis, eventName })
}
