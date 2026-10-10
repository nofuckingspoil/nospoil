// ============================================================
//  Lecture des fiches partenaires publiées (pages /partenaires).
//
//  On ne demande à la base QUE les colonnes publiques : le prénom, le nom,
//  l'e-mail et le téléphone du professionnel ne quittent jamais le serveur,
//  même par erreur de rendu.
// ============================================================
import { selectRows } from './supabase'
import { signPhotos } from './r2'
import { CLE_PAR_ID, METIERS_FICHE } from './partenaires'

const COLONNES_PUBLIQUES = 'id,slug,metier,entreprise,description,departement,dept_nom,ville,site,instagram,tiktok,facebook,photo_cle,publiee_at'

function decorer(f, urls) {
  const cle = CLE_PAR_ID[f.metier]
  return {
    ...f,
    cle,
    metierLabel: METIERS_FICHE[cle]?.label || 'Partenaire',
    photoUrl: f.photo_cle ? urls[f.photo_cle] || null : null,
  }
}

// Toutes les fiches publiées, les plus récentes en premier.
export async function fichesPubliees() {
  const { ok, data } = await selectRows('demandes_pro',
    `select=${COLONNES_PUBLIQUES}&publiee=eq.true&slug=not.is.null&order=publiee_at.desc&limit=500`)
  if (!ok || !Array.isArray(data)) return []
  const cles = data.map((f) => f.photo_cle).filter(Boolean)
  const urls = cles.length ? await signPhotos(cles, 24 * 3600).catch(() => ({})) : {}
  return data.filter((f) => CLE_PAR_ID[f.metier]).map((f) => decorer(f, urls))
}

export async function ficheParSlug(slug) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug || '')) return null
  const { ok, data } = await selectRows('demandes_pro',
    `select=${COLONNES_PUBLIQUES}&publiee=eq.true&slug=eq.${slug}&limit=1`)
  const f = ok && Array.isArray(data) ? data[0] : null
  if (!f || !CLE_PAR_ID[f.metier]) return null
  const urls = f.photo_cle ? await signPhotos([f.photo_cle], 24 * 3600).catch(() => ({})) : {}
  return decorer(f, urls)
}
