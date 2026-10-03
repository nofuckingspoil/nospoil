// ============================================================
//  Ce domaine reçoit-il du courrier ? (côté serveur uniquement)
//
//  On demande au DNS les serveurs de messagerie du domaine. « hotmail.fom »
//  ou un domaine inventé n'en ont aucun : un mail qui y part revient en
//  erreur, et Brevo réessaie à chaque nouvel envoi (rejet « temporaire »,
//  jamais mis sur liste noire). Ces retours abîment la réputation du domaine
//  expéditeur : on les arrête avant qu'ils partent.
// ============================================================
import 'server-only'
import { resolveMx } from 'node:dns/promises'

// Un domaine ne change pas d'avis toutes les cinq minutes : on garde les
// réponses en mémoire pour ne pas interroger le DNS à chaque fois.
const cache = new Map()
const CACHE_MS = 60 * 60 * 1000

// true : le domaine reçoit du courrier. false : il n'existe pas, c'est
// certain. null : on ne sait pas (panne DNS, délai) et dans le doute on
// laisse passer.
export async function domaineAccepteDuCourrier(domaine) {
  domaine = String(domaine || '').trim().toLowerCase()
  if (!domaine) return null
  const vu = cache.get(domaine)
  if (vu && Date.now() - vu.at < CACHE_MS) return vu.ok
  let ok
  try {
    const mx = await Promise.race([
      resolveMx(domaine),
      new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('délai'), { code: 'ETIMEOUT' })), 3000)),
    ])
    ok = Array.isArray(mx) && mx.length > 0
  } catch (err) {
    ok = err?.code === 'ENOTFOUND' || err?.code === 'NXDOMAIN' ? false : null
  }
  if (ok !== null) cache.set(domaine, { ok, at: Date.now() })
  return ok
}

// L'adresse est-elle certainement morte ? (domaine sans aucune messagerie)
export async function adresseSansMessagerie(email) {
  const e = String(email || '').trim()
  const at = e.lastIndexOf('@')
  if (at < 1) return false
  return (await domaineAccepteDuCourrier(e.slice(at + 1))) === false
}
