// ============================================================
//  « Comment avez-vous découvert Time to Flash ? »
//
//  Posée à l'organisateur juste après la création, une fois la vente faite :
//  elle ne peut plus en coûter une. On garde à côté la provenance mesurée par
//  son navigateur (lib/provenance.js) : ce que la personne déclare et ce qui
//  l'a réellement amenée ne coïncident pas toujours, et l'écart est instructif.
//
//  Réservé à l'organisateur ou à ses co-organisateurs. Choix multiple ; la
//  première réponse envoyée fait foi : on ne la réécrit pas.
// ============================================================
import { roleFor, canManage } from '../../../../../lib/authz'
import { updateRow } from '../../../../../lib/supabase'
import { t } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'

export const runtime = 'nodejs'

const CHOIX = ['instagram', 'tiktok', 'facebook', 'bouche', 'invite', 'google', 'ia', 'autre']

const court = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null

export async function POST(request, { params }) {
  const { id } = await params
  const langue = langueRequete(request)
  const role = await roleFor(id, request.headers.get('x-owner-token'))
  if (!canManage(role)) return Response.json({ error: t({ fr: 'Accès refusé.', en: 'Access denied.', de: 'Zugriff verweigert.' }, langue) }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  // Choix multiple. L'ancien format (une seule réponse) reste accepté.
  const liste = Array.isArray(body.choix) ? body.choix : [body.decouverte]
  const choix = [...new Set(liste.filter((c) => CHOIX.includes(c)))]
  if (!choix.length) return Response.json({ error: t({ fr: 'Réponse inconnue.', en: 'Unknown answer.', de: 'Unbekannte Antwort.' }, langue) }, { status: 400 })

  // La précision : les assistants IA cités, et le texte libre de « autre ».
  const ia = Array.isArray(body.ia) ? body.ia.map((x) => court(x, 30)).filter(Boolean) : []
  const precisions = [
    choix.includes('ia') && ia.length ? `IA : ${ia.join(', ')}` : null,
    choix.includes('autre') ? court(body.autre ?? body.detail, 200) : null,
  ].filter(Boolean)

  const prov = body.provenance || {}
  const { ok } = await updateRow('events', `id=eq.${id}&decouverte=is.null`, {
    decouverte: choix[0],
    decouvertes: choix,
    decouverte_detail: precisions.length ? precisions.join(' · ').slice(0, 300) : null,
    decouverte_at: new Date().toISOString(),
    prov_source: court(prov.s, 80),
    prov_medium: court(prov.m, 80),
    prov_campagne: court(prov.c, 120),
  })
  if (!ok) return Response.json({ error: t({ fr: 'Erreur serveur.', en: 'Server error.', de: 'Serverfehler.' }, langue) }, { status: 500 })
  return Response.json({ ok: true })
}
