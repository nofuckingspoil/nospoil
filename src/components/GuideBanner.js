'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isOrganizer } from '../lib/device'

// ============================================================
//  Bandeau du guide, posé tout en haut de la page.
//
//  Il remplace la carte flottante et le panneau glissant : venir couvrir
//  l'écran pour proposer un guide « contre une adresse mail » ressemblait
//  à une réclame, quel que soit le soin apporté à la carte.
//
//  Ici, rien n'est recouvert, rien n'est interrompu, et le bandeau part
//  avec le défilement comme le reste de la page. On ne parle ni d'adresse
//  mail ni d'inscription : on annonce une lecture, c'est tout (le premier
//  chapitre est de toute façon ouvert à tous).
// ============================================================

// Fermé d'un clic : on ne repropose plus, quel que soit l'appareil. La clé est
// propre au bandeau : ceux qui avaient écarté l'ancienne carte flottante voient
// celui-ci, qui ne demande rien et ne recouvre rien.
const ECARTE = 'ttf_guide_bandeau_off'
// Posé par la page du guide une fois l'adresse laissée : inutile d'insister.
const OUVERT = 'ttf_guide_unlocked'

// Pages vitrines uniquement. Jamais pendant qu'on crée un événement, qu'on
// prend des photos ou qu'on regarde un album, ni sur le guide lui-même.
function estEligible(chemin) {
  if (!chemin) return false
  return chemin === '/' || chemin === '/journal' || chemin.startsWith('/journal/')
}

export default function GuideBanner() {
  const chemin = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    if (!estEligible(chemin)) return
    // Un organisateur retrouve déjà le guide dans son tableau de bord.
    if (isOrganizer()) return
    try {
      if (localStorage.getItem(ECARTE) === '1') return
      if (localStorage.getItem(OUVERT) === '1') return
    } catch { return }
    setVisible(true)
  }, [chemin])

  function ecarter(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    setVisible(false)
    try { localStorage.setItem(ECARTE, '1') } catch {}
  }

  if (!visible) return null

  return (
    <div className="gbn">
      {/* Le journal est plus large que l'accueil : sans cet alignement, le
          bandeau déborderait de soixante-dix pixels sur la barre du site. */}
      <div className={`gbn-in ${chemin === '/' ? '' : 'large'}`}>
        <Link className="gbn-link" href="/guide">
          <span className="gbn-ic" aria-hidden="true">📕</span>
          <span className="gbn-txt">
            <strong>Le guide de l'organisateur</strong>
            {/* Masqué sur téléphone : le bandeau doit tenir sur une ligne. */}
            <span className="gbn-long">
              {' '}: sept chapitres courts, et la checklist à suivre jusqu'au jour J.
            </span>
          </span>
          <span className="gbn-go">Le lire →</span>
        </Link>
        <button className="gbn-x" onClick={ecarter} aria-label="Masquer ce bandeau">×</button>
      </div>
    </div>
  )
}
