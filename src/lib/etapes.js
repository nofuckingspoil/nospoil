'use client'
// ============================================================
//  Le compteur d'étapes, côté navigateur.
//
//  Une ligne envoyée au serveur quand quelqu'un franchit une étape du
//  parcours (voir lib/etapes-liste.js). Anonyme : on n'envoie que le jeton
//  d'appareil, jamais un prénom ni un mail. Pas de cookie, pas d'outil tiers.
//
//  Trois promesses :
//   · ne jamais gêner la page : aucune erreur ne remonte, rien n'est attendu ;
//   · ne pas insister : une étape part une fois par chargement de page (le
//     serveur, lui, ne la compte qu'une fois par personne et par soirée) ;
//   · ne pas se compter soi-même : un navigateur marqué « ?nomesure=1 »
//     n'envoie rien (voir lib/tracking.js).
// ============================================================
import { getDeviceToken } from './device'
import { mesureExclue } from './tracking'

const dejaEnvoyees = new Set()

// Les soirées que l'on organise soi-même. L'organisateur qui prend ses propres
// photos n'est pas un invité : le compter fausserait l'entonnoir des invités.
const soireesOrganisees = new Set()

export function marquerOrganisateur(eventId) {
  if (eventId) soireesOrganisees.add(eventId)
}

export function noterEtape(etape, { eventId, detail } = {}) {
  try {
    if (typeof window === 'undefined') return
    if (eventId && soireesOrganisees.has(eventId) && !etape.startsWith('crea_')) return
    const cle = `${eventId || '-'}|${etape}`
    if (dejaEnvoyees.has(cle)) return
    dejaEnvoyees.add(cle)
    if (mesureExclue()) return

    const visiteur = getDeviceToken()
    if (!visiteur) return
    const corps = JSON.stringify({
      eventId: eventId || undefined,
      visiteur,
      etape,
      support: 'site',
      detail: detail ? String(detail).slice(0, 200) : undefined,
    })

    // sendBeacon survit à un changement de page (départ vers Stripe, renvoi
    // vers l'album) ; fetch keepalive prend le relais là où il manque.
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon('/api/etape', new Blob([corps], { type: 'application/json' }))
      if (ok) return
    }
    fetch('/api/etape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: corps,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Une mesure ratée ne doit jamais rien casser.
  }
}
