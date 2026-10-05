// ============================================================
//  Le livre d'or audio, côté serveur.
//
//  Chaque participant peut laisser UN message vocal aux mariés, signé d'un
//  selfie. Un second enregistrement écrase le premier (audio et selfie).
//
//  POURQUOI UNE TABLE À PART (`voice_messages`), ET PAS DES LIGNES DANS
//  `photos`
//  La table des photos est lue partout : compteur de pellicule, album, mur du
//  groupe, tirages, mails, purge. Y glisser des voix, c'était prendre le risque
//  qu'une voix soit comptée comme une pose, affichée dans un album ou envoyée
//  à l'imprimeur. Ici rien ne peut fuir : seules les routes du livre d'or
//  lisent cette table.
//
//  QUI VOIT QUOI
//  Comme toutes les tables du site, `voice_messages` est fermée à tout accès
//  direct (sécurité au niveau des lignes, aucune règle) : seul le serveur y
//  lit, après avoir vérifié qui demande.
//   - Les hôtes (organisateur, co-organisateurs) écoutent tout, dès réception.
//   - Le participant n'accède qu'à SON message, pour le réécouter ou le refaire.
//   - Les autres participants n'accèdent à rien, même en appelant l'API.
// ============================================================
import 'server-only'
import { spawn } from 'node:child_process'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { selectRows, updateRow, deletePhotos } from './supabase'
import { GRACE_ENVOI_MS } from './authz'
import { finDe } from './rappels'

/** Durée maximale d'un message, et la marge laissée aux arrondis du navigateur. */
export const DUREE_MAX_MS = 60000
export const DUREE_TOLEREE_MS = 65000

/** Un message de plus de 6 Mo n'est pas un message d'une minute. */
export const AUDIO_MAX_OCTETS = 6 * 1024 * 1024
export const SELFIE_MAX_OCTETS = 4 * 1024 * 1024

/**
 * Le livre d'or est-il ouvert pour cet événement ?
 *
 * Il faut que l'option soit acquise (`livre_or_actif` : achetée à la création
 * ou après coup, ou offerte), et que la fête ne soit pas finie depuis plus
 * longtemps que la grâce des photos : un message enregistré hors réseau
 * pendant la soirée doit pouvoir arriver le lendemain matin.
 * `livre_or_option` dit seulement d'où elle vient (creation, achat, offert, test).
 */
export function livreOrActif(ev) {
  return !!ev?.livre_or_actif
}

export function finDuLivreOr(ev) {
  return finDe({ startsAt: ev.starts_at, endsAt: ev.ends_at, revealAt: ev.reveal_at })
}

export function livreOrFerme(ev, maintenant = Date.now()) {
  const fin = finDuLivreOr(ev)
  if (!Number.isFinite(fin)) return false
  return maintenant > fin + GRACE_ENVOI_MS
}

/**
 * Le participant qui parle est-il bien celui qu'il prétend être ?
 * Même preuve que pour les photos : son identifiant ET le jeton de son appareil.
 */
export async function participantVerifie(eventId, guestId, deviceToken) {
  if (!eventId || !guestId || !deviceToken) return null
  const { data } = await selectRows(
    'guests',
    `id=eq.${guestId}&event_id=eq.${eventId}&device_token=eq.${encodeURIComponent(deviceToken)}&select=id,display_name,blocked`
  )
  const g = Array.isArray(data) ? data[0] : null
  if (!g || g.blocked) return null
  return g
}

/** Tous les fichiers du livre d'or d'un événement (pour la purge et les suppressions). */
export async function fichiersLivreOr(eventId) {
  const { data } = await selectRows('voice_messages', `event_id=eq.${eventId}&select=audio_path,selfie_path`)
  const lignes = Array.isArray(data) ? data : []
  const fichiers = []
  for (const l of lignes) {
    if (l.audio_path) fichiers.push(l.audio_path)
    if (l.selfie_path) fichiers.push(l.selfie_path)
  }
  return fichiers
}

/**
 * Efface les fichiers du livre d'or d'un événement. Les lignes, elles,
 * partent toutes seules avec l'événement ou ses participants (la base les
 * supprime en cascade).
 */
export async function effacerFichiersLivreOr(eventId) {
  const fichiers = await fichiersLivreOr(eventId)
  if (fichiers.length) await deletePhotos(fichiers)
  return fichiers.length
}

// ------------------------------------------------------------ la conversion

/**
 * Convertit un enregistrement en m4a (AAC), lisible partout.
 *
 * Safari enregistre en AAC (audio/mp4). Chrome et
 * Android enregistrent en Opus dans un conteneur WebM, que les vieux iPhone et
 * beaucoup de lecteurs ne savent pas lire : on le convertit ici, une fois pour
 * toutes, pour que l'écoute et le téléchargement marchent partout.
 *
 * En cas d'échec, on garde l'original plutôt que de perdre le message : un
 * mot des invités vaut mieux dans un format imparfait que pas du tout.
 */
export async function versM4a(octets, mime) {
  // On réencode même ce qui se dit « audio/mp4 » : Chrome sait désormais
  // produire du mp4, mais avec de l'Opus dedans, que Safari ne lit pas. Une
  // minute de voix se convertit en une seconde, la prudence ne coûte rien.
  const dejaAac = /^audio\/(mp4|aac|x-m4a)/.test(mime || '')
  const binaire = await cheminFfmpeg()
  if (!binaire) return dejaAac ? { octets, mime: 'audio/mp4', ext: 'm4a' } : { octets, mime: mime || 'audio/webm', ext: 'webm' }

  const base = join(tmpdir(), `livre-or-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const entree = `${base}.src`
  const sortie = `${base}.m4a`
  try {
    await writeFile(entree, octets)
    await new Promise((resoudre, rejeter) => {
      // Le chemin du programme est connu au lancement seulement : on dit à
      // l'outil de construction de ne pas embarquer tout le projet pour autant
      // (ffmpeg est ajouté à part, voir next.config.js).
      const p = spawn(/*turbopackIgnore: true*/ binaire, ['-y', '-loglevel', 'error', '-i', entree, '-vn', '-ac', '1', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', sortie])
      const minuteur = setTimeout(() => { p.kill('SIGKILL'); rejeter(new Error('ffmpeg trop long')) }, 20000)
      p.on('error', (e) => { clearTimeout(minuteur); rejeter(e) })
      p.on('close', (code) => { clearTimeout(minuteur); code === 0 ? resoudre() : rejeter(new Error(`ffmpeg ${code}`)) })
    })
    const converti = await readFile(sortie)
    if (!converti.length) throw new Error('vide')
    return { octets: converti, mime: 'audio/mp4', ext: 'm4a' }
  } catch (e) {
    console.error('livre d’or : conversion impossible, original conservé', e?.message)
    return dejaAac ? { octets, mime: 'audio/mp4', ext: 'm4a' } : { octets, mime: mime || 'audio/webm', ext: 'webm' }
  } finally {
    unlink(entree).catch(() => {})
    unlink(sortie).catch(() => {})
  }
}

async function cheminFfmpeg() {
  try {
    const mod = await import('ffmpeg-static')
    return mod.default || mod
  } catch {
    return null
  }
}

/** Un fichier audio, vraiment ? (WebM, MP4/M4A, Ogg) : on lit ses premiers octets. */
export function estAudio(o) {
  if (!o || o.length < 12) return false
  if (o[0] === 0x1a && o[1] === 0x45 && o[2] === 0xdf && o[3] === 0xa3) return true // WebM / Matroska
  if (o[4] === 0x66 && o[5] === 0x74 && o[6] === 0x79 && o[7] === 0x70) return true // MP4 / M4A (« ftyp »)
  if (o[0] === 0x4f && o[1] === 0x67 && o[2] === 0x67 && o[3] === 0x53) return true // Ogg
  return false
}

/** L'onde envoyée par le navigateur : 48 hauteurs entre 0 et 100, rien d'autre. */
export function ondeValide(brut) {
  let v
  try { v = JSON.parse(String(brut || '')) } catch { return null }
  if (!Array.isArray(v) || !v.length) return null
  return v.slice(0, 48).map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0))))
}

/**
 * Activer le livre d'or après un achat réglé.
 *
 * Réclamé de deux endroits, comme l'agrandissement de formule (voir
 * lib/upgrade) : au retour de Stripe, et à l'ouverture d'un nouveau paiement
 * quand on découvre qu'un précédent a été réglé sans être appliqué (il n'y a
 * pas de webhook Stripe : qui paie puis ferme l'onglet n'avait rien).
 * Idempotent : déjà actif, il ne change rien.
 */
export async function activerLivreOrPaye(ev, session) {
  if (ev.livre_or_actif) return { ok: true, deja: true }
  const upd = await updateRow('events', `id=eq.${ev.id}`, {
    livre_or_actif: true,
    livre_or_option: 'achat',
    livre_or_session: session.id,
    livre_or_session_at: null,
  })
  return { ok: upd.ok }
}
