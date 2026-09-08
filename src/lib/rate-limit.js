// ============================================================
//  Garde-fou par machine appelante.
//
//  Les routes d'envoi de mail se protégeaient déjà par adresse : pas plus d'un
//  code toutes les 45 secondes pour une même boîte. Ce garde-fou est aveugle à
//  celui qui essaie mille adresses différentes, une par une. Ici on compte les
//  demandes venues d'une même machine, quelle que soit l'adresse visée.
//
//  Le comptage est volontairement grossier : il ne cherche pas à arrêter une
//  attaque déterminée (qui changera d'adresse IP), mais à rendre l'arrosage
//  automatique inintéressant.
// ============================================================
import 'server-only'
import { selectRows, insertRow, deleteRows } from './supabase'

// Adresse de l'appelant, telle que Vercel la place devant la requête.
// En développement local il n'y en a pas : on ne bloque alors personne.
export function ipDe(request) {
  const chaine = request.headers.get('x-forwarded-for') || ''
  return chaine.split(',')[0].trim() || request.headers.get('x-real-ip') || null
}

// Enregistre la tentative et dit si le plafond est atteint.
// En cas de pépin de base, on laisse passer : un compteur en panne ne doit
// jamais fermer le site.
export async function tropDeDemandes(ip, action, { max, minutes }) {
  if (!ip) return false
  try {
    const depuis = new Date(Date.now() - minutes * 60 * 1000).toISOString()
    const { data } = await selectRows(
      'rate_limits',
      `ip=eq.${encodeURIComponent(ip)}&action=eq.${encodeURIComponent(action)}` +
        `&created_at=gte.${depuis}&select=id&limit=${max}`
    )
    if (Array.isArray(data) && data.length >= max) return true
    await insertRow('rate_limits', { ip, action })
    return false
  } catch {
    return false
  }
}

export const MESSAGE_TROP = 'Trop de demandes depuis cet appareil. Réessayez dans un moment.'

// Ménage : les lignes de comptage ne servent plus à rien passé une journée.
export async function purgerCompteurs(now = new Date()) {
  const limite = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  await deleteRows('rate_limits', `created_at=lt.${limite}`)
}
