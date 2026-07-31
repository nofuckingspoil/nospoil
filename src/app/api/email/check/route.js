// ============================================================
//  Vérification d'une adresse mail saisie par un invité.
//
//  Appelée pendant la saisie (quand l'invité quitte le champ), pas au
//  moment de valider : la correction arrive avant qu'il ait à y revenir.
//
//  Le contrôle le plus utile est le dernier : on demande au DNS si le
//  domaine accepte du courrier. « gmail.co » ou un domaine inventé
//  n'ont aucun serveur de messagerie — c'est imparable, et gratuit.
// ============================================================
import { resolveMx } from 'node:dns/promises'
import { checkEmailShape, normalizeGuestEmail } from '../../../../lib/email-check'

export const runtime = 'nodejs'

// Un domaine ne change pas d'avis toutes les cinq minutes : on garde les
// réponses en mémoire pour ne pas interroger le DNS à chaque frappe.
const cache = new Map()
const CACHE_MS = 60 * 60 * 1000

async function domaineAccepteDuCourrier(domaine) {
  const vu = cache.get(domaine)
  if (vu && Date.now() - vu.at < CACHE_MS) return vu.ok
  let ok
  try {
    const mx = await resolveMx(domaine)
    ok = Array.isArray(mx) && mx.length > 0
  } catch (err) {
    // Domaine inexistant → on peut l'affirmer. Panne DNS ou délai dépassé →
    // on ne sait pas, et dans le doute on laisse passer.
    ok = err?.code === 'ENOTFOUND' || err?.code === 'NXDOMAIN' ? false : null
  }
  if (ok !== null) cache.set(domaine, { ok, at: Date.now() })
  return ok
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeGuestEmail(body.email)

  const forme = checkEmailShape(email)
  if (forme.empty) return Response.json({ status: 'vide' })
  if (!forme.ok) return Response.json({ status: 'invalide', reason: forme.reason })

  // Faute de frappe repérée : on propose la correction sans rien imposer.
  if (forme.suggestion) {
    return Response.json({ status: 'suggestion', suggestion: forme.suggestion })
  }

  const domaine = email.slice(email.lastIndexOf('@') + 1)
  const accepte = await domaineAccepteDuCourrier(domaine)
  if (accepte === false) {
    return Response.json({
      status: 'domaine-inconnu',
      reason: `« ${domaine} » ne reçoit pas de courrier. Vérifiez l'orthographe.`,
    })
  }

  return Response.json({ status: 'ok' })
}
