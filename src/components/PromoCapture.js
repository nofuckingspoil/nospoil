'use client'

import { useEffect } from 'react'
import { PROMO_STORAGE_KEY } from './PromoField'

// ============================================================
//  Lien partenaire : timetoflash.fr/?promo=LEA20
//
//  Le code est mémorisé dès l'arrivée, quelle que soit la page, et se
//  retrouvera pré-rempli au moment de payer — même si la personne visite
//  d'abord trois pages du site. La visite est comptée une seule fois, pour
//  savoir ce qu'un partenaire amène avant même la première vente.
// ============================================================
export default function PromoCapture() {
  useEffect(() => {
    let code = ''
    try { code = new URLSearchParams(window.location.search).get('promo') || '' } catch {}
    code = code.trim().toUpperCase().slice(0, 40)
    if (!code) return

    try { localStorage.setItem(PROMO_STORAGE_KEY, code) } catch {}

    // Une visite par code et par session : recharger la page ne doit pas
    // gonfler les statistiques du partenaire.
    try {
      const vu = `ttf_promo_vu_${code}`
      if (sessionStorage.getItem(vu)) return
      sessionStorage.setItem(vu, '1')
    } catch {}

    fetch('/api/promo/check', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {})
  }, [])

  return null
}
