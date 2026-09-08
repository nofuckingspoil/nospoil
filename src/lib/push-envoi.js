// ============================================================
//  L'envoi des notifications web, côté serveur.
//
//  POURQUOI CETTE BRIQUE EXISTE.
//
//  L'iPhone n'en a pas besoin : quand un invité scanne le QR code d'une table,
//  c'est l'extrait d'app qui s'ouvre, et il pose ses rappels tout seul, dans le
//  téléphone, sans rien demander à personne (voir RappelsDuClip.swift dans le
//  dépôt de l'application). Android n'a pas d'équivalent : rien ne s'installe,
//  et le navigateur ne sait pas programmer une notification pour dans deux
//  heures. Il faut donc que le serveur la lui envoie au bon moment.
//
//  D'où ce fichier, et la tâche planifiée qui s'en sert.
//
//  LES CLÉS. Une notification web est signée, sinon n'importe qui pourrait
//  écrire à un téléphone abonné. Le couple VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
//  est cette signature. Sans elles, tout est simplement inerte : aucune erreur,
//  aucun envoi. C'est délibéré, un site sans notifications reste un site qui
//  marche.
// ============================================================
import 'server-only'
import webpush from 'web-push'
import { deleteRows } from './supabase'

const PUBLIC = process.env.VAPID_PUBLIC_KEY
const PRIVATE = process.env.VAPID_PRIVATE_KEY
// L'adresse à laquelle les services de notification (Google, Mozilla) peuvent
// écrire si nos envois posent problème. Exigée par la norme.
const SUJET = process.env.VAPID_SUBJECT || 'mailto:support@timetoflash.fr'

let pret = false

// Les notifications sont-elles configurées sur ce serveur ?
export function pushConfigure() {
  return Boolean(PUBLIC && PRIVATE)
}

// La clé publique, la seule des deux qui a le droit de sortir : le navigateur
// en a besoin pour créer l'abonnement.
export function clePublique() {
  return PUBLIC || null
}

function preparer() {
  if (pret || !pushConfigure()) return pushConfigure()
  webpush.setVapidDetails(SUJET, PUBLIC, PRIVATE)
  pret = true
  return true
}

// --- Un envoi ---
//
// `abo` : la ligne `push_subscriptions`.
// `message` : { titre, corps, url, tag }.
// `ttlSecondes` : combien de temps le service de notification garde le message
//   si le téléphone est éteint. Un rappel de soirée périmé ne doit surtout pas
//   ressortir le lendemain matin.
//
// Renvoie { ok, disparu } : `disparu` signale un abonnement mort (application
// désinstallée, notifications coupées, navigateur nettoyé). On efface alors la
// ligne, sinon la table se remplirait d'adresses qui ne répondent plus.
export async function envoyerPush(abo, message, ttlSecondes = 3600) {
  if (!preparer()) return { ok: false, disparu: false }
  if (!abo?.endpoint || !abo?.p256dh || !abo?.auth) return { ok: false, disparu: false }

  try {
    await webpush.sendNotification(
      { endpoint: abo.endpoint, keys: { p256dh: abo.p256dh, auth: abo.auth } },
      JSON.stringify(message),
      { TTL: ttlSecondes, urgency: 'normal' }
    )
    return { ok: true, disparu: false }
  } catch (err) {
    const code = err?.statusCode
    // 404 et 410 : le téléphone ne veut plus rien recevoir, définitivement.
    if (code === 404 || code === 410) {
      try { await deleteRows('push_subscriptions', `id=eq.${abo.id}`) } catch {}
      return { ok: false, disparu: true }
    }
    console.error('push: envoi refusé', code, err?.body || err?.message)
    return { ok: false, disparu: false }
  }
}
