// ============================================================
//  Le livre d'or offert après un essai réussi.
//
//  Le mail « Et pour le vrai événement ? » (offreEssaiEmail) porte un lien
//  /create?cadeau=<clé d'avis de l'essai>. La création le renvoie au serveur,
//  qui revérifie tout ici : l'essai existe, l'offre court encore, et elle n'a
//  pas déjà servi. Une fois l'événement créé, l'essai garde la trace de
//  l'événement qu'il a fait naître (`essai_offre_event_id`) : c'est ce qui
//  mesure le parcours, et ce qui empêche de s'en servir deux fois.
// ============================================================
import 'server-only'
import { selectRows, updateRow } from './supabase'

const JETON = /^[A-Za-z0-9_-]{8,128}$/

// Renvoie l'essai si le cadeau tient toujours, sinon null.
export async function cadeauValide(jeton, now = new Date()) {
  if (typeof jeton !== 'string' || !JETON.test(jeton)) return null
  const { data } = await selectRows(
    'events',
    `avis_token=eq.${encodeURIComponent(jeton)}` +
      `&essai_offre_fin=gt.${now.toISOString()}` +
      '&essai_offre_event_id=is.null' +
      '&select=id,essai_offre_fin&limit=1'
  )
  return Array.isArray(data) && data[0] ? data[0] : null
}

// L'événement est créé : le cadeau a servi.
export async function consommerCadeau(essaiId, eventId) {
  if (!essaiId || !eventId) return
  try {
    await updateRow('events', `id=eq.${essaiId}`, { essai_offre_event_id: eventId })
  } catch (err) {
    console.error('cadeau essai : marquage impossible', err)
  }
}
