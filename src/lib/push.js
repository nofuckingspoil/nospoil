'use client'
// ============================================================
//  Les notifications de soirée, côté téléphone.
//
//  CE QUE ÇA COUVRE, ET CE QUE ÇA NE COUVRE PAS.
//
//  Android, dans un vrai navigateur : tout marche, sans rien installer. Chrome
//  sait recevoir une notification pour un simple onglet.
//
//  iPhone dans Safari : rien, et ce n'est pas un oubli. Apple n'autorise les
//  notifications web que si la page a été ajoutée à l'écran d'accueil. On ne
//  peut pas le forcer, et on ne le demande pas au milieu d'une fête. Ces
//  invités-là passent par l'extrait d'app (au scan du QR code), qui pose ses
//  propres rappels, ou par le mail de la révélation. Le seul cas où ce fichier
//  sert sur iPhone est celui de quelqu'un qui a épinglé le site de lui-même :
//  alors tout fonctionne, sans une ligne de plus.
//
//  Les mini-navigateurs (Instagram, WhatsApp, applis de scan de QR code) ne
//  savent pas non plus recevoir de notifications. C'est le même problème que
//  le déclencheur muet, et la même parade : rouvrir dans Chrome.
// ============================================================
import { getDeviceToken } from './device'

// La clé publique arrive en base64 « URL » ; le navigateur la veut en octets.
function clefEnOctets(base64) {
  const comble = '='.repeat((4 - (base64.length % 4)) % 4)
  const propre = (base64 + comble).replace(/-/g, '+').replace(/_/g, '/')
  const brut = atob(propre)
  const out = new Uint8Array(brut.length)
  for (let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i)
  return out
}

// Ce navigateur sait-il recevoir des notifications ?
export function pushPossible() {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
    // Sans page sécurisée, rien n'est permis. Vrai en développement sur
    // localhost, que les navigateurs considèrent comme sûr.
    && window.isSecureContext !== false
}

// « default » (jamais demandé), « granted », « denied », ou « impossible ».
export function pushEtat() {
  if (!pushPossible()) return 'impossible'
  try { return Notification.permission } catch { return 'impossible' }
}

// A-t-on déjà posé la question pour cet événement ? On ne la pose qu'une fois :
// une deuxième fenêtre au milieu d'une soirée est une fenêtre de trop.
const cle = (eventId) => `ttf_push_propose_${eventId}`

export function dejaPropose(eventId) {
  if (typeof window === 'undefined') return true
  try { return localStorage.getItem(cle(eventId)) === '1' } catch { return true }
}

export function marquerPropose(eventId) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(cle(eventId), '1') } catch {}
}

// --- L'abonnement proprement dit ---
//
// `demander` : faut-il ouvrir la fenêtre d'autorisation du navigateur ? À faux,
// on ne fait le travail que si la permission est DÉJÀ accordée. C'est ce qui
// permet de rebrancher silencieusement quelqu'un qui a dit oui à une soirée
// précédente, sans rien lui montrer.
//
// Renvoie { ok, raison }.
export async function activerPush({ eventId, guestId, demander = true }) {
  if (!pushPossible()) return { ok: false, raison: 'impossible' }
  if (!eventId || !guestId) return { ok: false, raison: 'incomplet' }

  try {
    if (Notification.permission === 'denied') return { ok: false, raison: 'refus' }
    if (Notification.permission !== 'granted') {
      if (!demander) return { ok: false, raison: 'jamais-demande' }
      const reponse = await Notification.requestPermission()
      if (reponse !== 'granted') return { ok: false, raison: 'refus' }
    }

    // La clé de signature du serveur. Si elle manque, les notifications ne sont
    // pas configurées : on s'arrête sans bruit plutôt que d'abonner dans le vide.
    const rep = await fetch('/api/push')
    const { cle: clePublique } = await rep.json().catch(() => ({}))
    if (!clePublique) return { ok: false, raison: 'non-configure' }

    const veilleur = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    await navigator.serviceWorker.ready

    // Un abonnement existe peut-être déjà (autre événement, même téléphone) :
    // on le réutilise, il reste valable. Le serveur, lui, le rattachera à cette
    // soirée-ci.
    let abo = await veilleur.pushManager.getSubscription()
    if (!abo) {
      abo = await veilleur.pushManager.subscribe({
        userVisibleOnly: true, // promesse faite au navigateur : rien en douce
        applicationServerKey: clefEnOctets(clePublique),
      })
    }

    const res = await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, guestId, deviceToken: getDeviceToken(), abonnement: abo.toJSON() }),
    })
    if (!res.ok) return { ok: false, raison: 'serveur' }
    return { ok: true }
  } catch (err) {
    return { ok: false, raison: 'erreur' }
  }
}
