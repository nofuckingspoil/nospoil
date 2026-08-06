// ============================================================
//  Qui prévenir pour un événement : l'organisateur et ceux qu'il a invités
//  à gérer avec lui.
//
//  Jusqu'ici tous les rappels partaient à la seule adresse du créateur. C'est
//  précisément l'inverse du besoin : on ajoute un co-organisateur parce qu'on
//  ne sera pas disponible le jour J, et c'était pourtant l'absent qui recevait
//  le rappel du matin.
//
//  Chacun reçoit un lien portant SON propre jeton, jamais celui de
//  l'organisateur : un co-organisateur qui hériterait du jeton du propriétaire
//  deviendrait indiscernable de lui, et pourrait effacer l'album de tout le
//  monde (voir ./authz).
// ============================================================
import 'server-only'
import { selectRows } from './supabase'
import { OWNER, ADMIN } from './authz'

// `ev` : ligne `events` brute, avec au moins id, owner_email et owner_token.
// Renvoie [{ email, token, role }], l'organisateur d'abord.
export async function equipeDe(ev) {
  const liste = []
  if (ev?.owner_email && ev?.owner_token) {
    liste.push({ email: ev.owner_email, token: ev.owner_token, role: OWNER })
  }
  if (!ev?.id) return liste

  try {
    const { data } = await selectRows('event_admins', `event_id=eq.${ev.id}&select=email,token`)
    for (const a of Array.isArray(data) ? data : []) {
      if (!a.email || !a.token) continue
      // Un co-organisateur inscrit avec l'adresse du propriétaire ne doit pas
      // recevoir deux fois le même message.
      if (liste.some((p) => p.email.toLowerCase() === a.email.toLowerCase())) continue
      liste.push({ email: a.email, token: a.token, role: ADMIN })
    }
  } catch (err) {
    // L'organisateur reste prévenu quoi qu'il arrive : mieux vaut un rappel
    // incomplet qu'un rappel perdu.
    console.error('équipe : lecture des co-organisateurs', err)
  }
  return liste
}
