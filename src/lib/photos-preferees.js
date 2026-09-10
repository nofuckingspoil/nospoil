// ============================================================
//  « Les photos préférées », quelques jours après la révélation.
//
//  POURQUOI CE MAIL
//  L'album se regarde le jour où il s'ouvre, puis on l'oublie. Ce mail-là
//  rend un service (les images que le groupe a élues, qu'on n'aurait pas
//  retrouvées seul) et il ramène du monde dans l'album, ce qui fait remonter
//  les votes. C'est une relance qui ne ressemble pas à une relance.
//
//  À QUI IL PART, ET À QUI IL NE PART PAS
//  Uniquement aux fiches créées après le 10 septembre 2026. Avant cette date,
//  la phrase affichée sous le champ mail ne promettait qu'un seul envoi, et
//  elle engage : leur écrire serait exactement le manquement qu'on a voulu
//  éviter en réécrivant cette phrase.
//
//  QUAND
//  Deux jours après la révélation, et pas plus tôt : le temps que les gens
//  aient regardé l'album et posé leurs cœurs. La tâche quotidienne repasse
//  pendant une semaine, ce qui rattrape les journées manquées.
//
//  À PARTIR DE COMBIEN DE VOTES
//  Trois. Le seuil est volontairement bas : le but du mail est justement de
//  faire voter, attendre l'unanimité pour l'envoyer reviendrait à ne jamais
//  l'envoyer.
// ============================================================
import 'server-only'
import { selectRows, updateRow, signPhotos } from './supabase'
import { sendMail, photosPrefereesEmail, siteUrl } from './mail'

// Les adresses laissées avant cette date ont lu une promesse plus étroite.
export const PROMESSE_ELARGIE = '2026-09-10T00:00:00Z'

// Le délai après la révélation, et la fenêtre pendant laquelle on rattrape.
export const APRES_JOURS = 2
export const FENETRE_JOURS = 9

export const VOTES_MIN = 3
const BATCH = 120

/**
 * Envoie le mail pour UN événement.
 * `ev` : ligne `events` brute. Renvoie { envoyes, echecs, ignore? }.
 */
export async function envoyerPhotosPreferees(ev) {
  if (!ev?.id) return { envoyes: 0, echecs: 0, ignore: 'événement inconnu' }

  // Les cœurs, d'abord : sans eux le mail n'a rien à raconter, et on s'arrête
  // avant d'avoir lu quoi que ce soit d'autre.
  const favRes = await selectRows('favorites', `event_id=eq.${ev.id}&select=photo_id,device_token`)
  const votes = Array.isArray(favRes.data) ? favRes.data : []
  if (votes.length < VOTES_MIN) return { envoyes: 0, echecs: 0, ignore: 'trop peu de votes' }

  const parPhoto = new Map()
  for (const f of votes) parPhoto.set(f.photo_id, (parPhoto.get(f.photo_id) || 0) + 1)
  const classement = [...parPhoto.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const votants = new Set(votes.map((f) => f.device_token).filter(Boolean)).size

  // Les vignettes des trois premières. Une photo masquée depuis n'a plus à
  // sortir : elle a quitté l'album, elle ne revient pas par le mail.
  const phRes = await selectRows(
    'photos',
    `event_id=eq.${ev.id}&hidden=is.false&select=id,storage_path,thumb_path`
  )
  const photos = Array.isArray(phRes.data) ? phRes.data : []
  const parId = new Map(photos.map((p) => [p.id, p]))
  const retenues = classement.map(([id]) => parId.get(id)).filter(Boolean)
  if (!retenues.length) return { envoyes: 0, echecs: 0, ignore: 'plus aucune photo élue' }

  // Sept jours de validité : c'est le maximum d'une adresse signée, et un mail
  // se lit rarement plus tard. Passé ce délai, le bouton de l'album marche
  // toujours, seules les vignettes s'éteignent.
  const chemins = retenues.map((p) => p.thumb_path || p.storage_path)
  const signees = await signPhotos(chemins, 7 * 24 * 3600)

  const { ok, data } = await selectRows(
    'guests',
    `event_id=eq.${ev.id}&email=not.is.null&faves_notified_at=is.null` +
      `&created_at=gte.${PROMESSE_ELARGIE}` +
      `&select=id,email&order=created_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data) || !data.length) return { envoyes: 0, echecs: 0 }

  const mail = photosPrefereesEmail({
    eventName: ev.name,
    galleryUrl: `${siteUrl()}/g/${ev.id}`,
    top: retenues.map((p) => ({ url: signees[p.thumb_path || p.storage_path] || null })),
    votants,
  })

  let envoyes = 0
  let echecs = 0
  for (const g of data) {
    if (!g.email) continue
    const res = await sendMail({ to: g.email, subject: mail.subject, html: mail.html })
    // On horodate dans tous les cas : un échec ne doit pas déclencher une
    // boucle de renvoi quotidien.
    await updateRow('guests', `id=eq.${g.id}`, { faves_notified_at: new Date().toISOString() })
    if (res?.ok) envoyes++
    else echecs++
  }

  return { envoyes, echecs }
}
