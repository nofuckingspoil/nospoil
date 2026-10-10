// ============================================================
//  Les demandes des prestataires de mariage, pour l'admin (/admin/pros).
//
//  GET   : toutes les demandes, les plus récentes en haut.
//  PATCH : le suivi d'une demande (statut, code envoyé, note) et, pour une
//          fiche partenaire, sa publication sur /partenaires (publiee, slug,
//          description).
//
//  Protégé par la clé ADMIN_KEY (en-tête x-admin-key), comme le reste.
// ============================================================
import { selectRows, updateRow } from '../../../../lib/supabase'
import { signPhotos } from '../../../../lib/r2'
import { slugifier, LIMITES_FICHE } from '../../../../lib/partenaires'
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
  const demandes = Array.isArray(data) ? data : []
  // Les photos des fiches, en adresses signées (R2 est privé).
  const cles = demandes.map((d) => d.photo_cle).filter(Boolean)
  const urls = cles.length ? await signPhotos(cles, 3600).catch(() => ({})) : {}
  return Response.json({ demandes: demandes.map((d) => (d.photo_cle ? { ...d, photo_url: urls[d.photo_cle] || null } : d)) })
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
  // Fiche partenaire : publication sur /partenaires, adresse et présentation.
  if (body.publiee !== undefined) {
    patch.publiee = body.publiee === true
    patch.publiee_at = patch.publiee ? new Date().toISOString() : null
  }
  if (body.slug !== undefined) {
    const slug = slugifier(body.slug)
    const { data: pris } = await selectRows('demandes_pro', `select=id&slug=eq.${slug}&id=neq.${body.id}&limit=1`)
    if (Array.isArray(pris) && pris.length) return Response.json({ error: 'Cette adresse est déjà prise par une autre fiche.' }, { status: 400 })
    patch.slug = slug
  }
  if (body.description !== undefined) {
    const v = typeof body.description === 'string' ? body.description.trim() : ''
    if (!v || v.length > LIMITES_FICHE.description) return Response.json({ error: `Présentation vide ou trop longue (${LIMITES_FICHE.description} caractères maximum).` }, { status: 400 })
    patch.description = v
  }
  if (patch.publiee) {
    // On ne publie qu'une fiche complète et dont le pro a accepté la publication.
    const { data } = await selectRows('demandes_pro', `id=eq.${body.id}&select=type,accord_publication,slug,description`)
    const f = Array.isArray(data) ? data[0] : null
    if (!f || f.type !== 'fiche' || !f.accord_publication || !(patch.slug || f.slug) || !(patch.description || f.description)) {
      return Response.json({ error: 'Seule une fiche complète, dont le pro a accepté la publication, peut être publiée.' }, { status: 400 })
    }
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
