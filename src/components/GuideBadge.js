'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// Écarté d'un clic : on ne repropose plus, quel que soit l'appareil.
const ECARTE = 'ttf_guide_badge_off'
// Posé par la page du guide une fois l'adresse laissée : inutile d'insister.
const OUVERT = 'ttf_guide_unlocked'

// En dessous de cette largeur, pas de place pour une carte permanente :
// le badge QR occupe déjà le bas de l'écran. On passe au panneau glissant.
const SEUIL_MOBILE = 640
// Sur mobile, on attend que le lecteur soit descendu assez loin pour être
// vraiment intéressé avant de lui proposer quoi que ce soit.
const LECTURE_MINI = 0.55

// Pages vitrines uniquement. Jamais pendant qu'on crée un événement, qu'on
// prend des photos ou qu'on regarde un album — ni sur le guide lui-même.
function estEligible(chemin) {
  if (!chemin) return false
  return chemin === '/' || chemin === '/journal' || chemin.startsWith('/journal/')
}

export default function GuideBadge() {
  const chemin = usePathname()
  const [mobile, setMobile] = useState(null) // null tant qu'on ne sait pas
  const [visible, setVisible] = useState(false)
  const autorise = useRef(false)

  // Quel format ? On suit les changements de taille : quelqu'un qui rétrécit
  // sa fenêtre doit basculer proprement de la carte au panneau.
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SEUIL_MOBILE - 1}px)`)
    const maj = () => setMobile(mq.matches)
    maj()
    mq.addEventListener('change', maj)
    return () => mq.removeEventListener('change', maj)
  }, [])

  useEffect(() => {
    setVisible(false)
    if (mobile === null) return
    if (!estEligible(chemin)) return
    try {
      if (localStorage.getItem(ECARTE) === '1') return
      if (localStorage.getItem(OUVERT) === '1') return
    } catch { return }
    autorise.current = true

    // Ordinateur : la carte se glisse une fois la page installée.
    if (!mobile) {
      const t = setTimeout(() => setVisible(true), 2000)
      return () => { autorise.current = false; clearTimeout(t) }
    }

    // Mobile : on attend la lecture, et jamais avant 8 secondes.
    let pret = false
    const t = setTimeout(() => { pret = true }, 8000)
    function auDefilement() {
      if (!pret || !autorise.current) return
      const h = document.documentElement
      const lu = (h.scrollTop + window.innerHeight) / h.scrollHeight
      if (lu >= LECTURE_MINI) {
        setVisible(true)
        window.removeEventListener('scroll', auDefilement)
      }
    }
    window.addEventListener('scroll', auDefilement, { passive: true })
    return () => {
      autorise.current = false
      clearTimeout(t)
      window.removeEventListener('scroll', auDefilement)
    }
  }, [chemin, mobile])

  function ecarter(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    setVisible(false)
    autorise.current = false
    try { localStorage.setItem(ECARTE, '1') } catch {}
  }

  if (!visible) return null

  // ---- Mobile : panneau qui glisse depuis le bas ----
  if (mobile) {
    return (
      <div className="gs-veil" role="dialog" aria-modal="true" aria-labelledby="gs-t"
        onClick={(e) => { if (e.target === e.currentTarget) ecarter() }}>
        <div className="gs">
          <div className="gs-grip" aria-hidden="true" />
          <span className="gs-ic" aria-hidden="true">📕</span>
          <h2 id="gs-t">Le guide de l'organisateur</h2>
          <p>
            Combien de clichés donner, quand révéler l'album, comment faire scanner
            le QR code par tout le monde. Sept chapitres, gratuits.
          </p>
          <Link className="btn btn-accent gs-go" href="/guide" onClick={() => setVisible(false)}>
            Lire le guide
          </Link>
          <button className="gs-no" onClick={ecarter}>Plus tard</button>
        </div>
      </div>
    )
  }

  // ---- Ordinateur : carte permanente en bas à droite ----
  return (
    <div className="gb">
      <button className="gb-x" onClick={ecarter} aria-label="Masquer la proposition de guide">×</button>
      <Link className="gb-link" href="/guide">
        <span className="gb-tag">
          <span aria-hidden="true">📕</span> Guide gratuit
        </span>
        <span className="gb-t1">Réussir vos photos participatives</span>
        <span className="gb-sub">
          Combien de clichés donner, quand révéler l'album, comment faire scanner
          tout le monde.
        </span>
        <span className="gb-go">Lire les 7 chapitres →</span>
      </Link>
    </div>
  )
}
