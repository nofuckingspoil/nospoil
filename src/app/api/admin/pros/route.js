// ============================================================
//  Les demandes des prestataires de mariage, pour l'admin (/admin/pros).
//
//  GET   : toutes les demandes, les plus récentes en haut.
//  PATCH : le suivi d'une demande (statut, code envoyé, note).
//
//  Protégé par la clé ADMIN_KEY (en-tête x-admin-key), comme le reste.
// ============================================================
import { selectRows, updateRow } from '../../../../lib/supabase'
import { estUuid } from '../../../../lib/params'
import { LIMITES, estStatut } from '../../../../lib/pro'

export const runtime = 'nodejs'

const refuse = () => Response.json({ error: 'Accès refusé.' }, { status: 401 })
const autorise = (request) => !!process.env.ADMIN_KEY && request.headers.get('x-admin-key') === process.env.ADMIN_KEY

export async function GET(request) {
  if (!autorise(request)) return refuse()
  const { ok, status, data } = await selectRows('demandes_pro', 'select=*&order=created_at.desc&limit=1000')
  if (!ok) {
    // Table pas encore créée : on le dit clairement plutôt qu'« erreur serveur ».
    const absente = status === 404 || /demandes_pro/.test(JSON.stringify(data || ''))
    return Response.json({
      error: absente ? 'La table demandes_pro n’existe pas encore dans Supabase (SQL à appliquer).' : 'Erreur serveur.',
    }, { status: 500 })
  }
  return Response.json({ demandes: Array.isArray(data) ? data : [] })
}

export async function PATCH(request) {
  if (!autorise(request)) return refuse()
  const body = await request.json().catch(() => ({}))
  if (!estUuid(body.id)) return Response.json({ error: 'Demande inconnue.' }, { status: 400 })

  const patch = {}
  if (body.statut !== undefined) {
    if (!estStatut(body.statut)) return Response.json({ error: 'Statut inconnu.' }, { status: 400 })
    patch.statut = body.statut
    // La date de traitement : le premier passage hors de « nouvelle ».
    patch.traite_at = body.statut === 'nouvelle' ? null : new Date().toISOString()
  }
  for (const k of ['code_envoye', 'note']) {
    if (body[k] === undefined) continue
    const v = typeof body[k] === 'string' ? body[k].trim() : ''
    if (v.length > LIMITES[k]) return Response.json({ error: 'Texte trop long.' }, { status: 400 })
    patch[k] = v || null
  }
  if (!Object.keys(patch).length) return Response.json({ error: 'Rien à enregistrer.' }, { status: 400 })

  // Ne pas écraser la date de premier traitement si elle existe déjà.
  if (patch.traite_at) {
    const { data } = await selectRows('demandes_pro', `id=eq.${body.id}&select=traite_at`)
    const avant = Array.isArray(data) ? data[0] : null
    if (avant?.traite_at) delete patch.traite_at
  }

  const res = await updateRow('demandes_pro', `id=eq.${body.id}`, patch)
  if (!res.ok) return Response.json({ error: 'Enregistrement impossible.' }, { status: 500 })
  const ligne = Array.isArray(res.data) ? res.data[0] : res.data
  return Response.json({ ok: true, demande: ligne || null })
}
