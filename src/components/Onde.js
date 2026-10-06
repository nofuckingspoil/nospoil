'use client'

import { useRef } from 'react'

// ============================================================
//  L'onde sonore d'un message du livre d'or.
//
//  Des barres verticales, une par tranche du message. `progression` (0 à 1)
//  colore celles déjà écoutées : on voit où l'on en est sans compteur.
//  Sans onde mesurée (message d'une ancienne version, mesure impossible), on
//  dessine une onde calme et régulière plutôt qu'un vide.
// ============================================================

const PAR_DEFAUT = Array.from({ length: 48 }, (_, i) => 30 + Math.round(22 * Math.abs(Math.sin(i * 0.7)) + 10 * Math.abs(Math.sin(i * 2.3))))

// `onChercher(fraction)` : toucher ou faire glisser le doigt sur l'onde
// déplace la lecture à cet endroit (pour réentendre un passage).
export default function Onde({ valeurs, progression = 0, couleur = 'currentColor', fond = 'rgba(127,127,127,.35)', hauteur = 34, vivante = false, onChercher }) {
  const barres = Array.isArray(valeurs) && valeurs.length ? valeurs : PAR_DEFAUT
  const n = barres.length

  function viser(ev) {
    const r = ev.currentTarget.getBoundingClientRect()
    if (!r.width) return
    onChercher(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)))
  }
  const appuye = useRef(false)
  const lacher = () => { appuye.current = false }
  const glisser = onChercher ? {
    onPointerDown: (ev) => {
      appuye.current = true
      try { ev.currentTarget.setPointerCapture(ev.pointerId) } catch {}
      viser(ev)
    },
    onPointerMove: (ev) => { if (appuye.current) viser(ev) },
    onPointerUp: lacher,
    onPointerCancel: lacher,
    onLostPointerCapture: lacher,
  } : {}

  return (
    <div
      className={`lo-onde ${vivante ? 'lo-onde-vivante' : ''} ${onChercher ? 'lo-onde-cherche' : ''}`}
      style={{ height: hauteur }}
      aria-hidden="true"
      {...glisser}
    >
      {barres.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(8, Math.min(100, v))}%`,
            background: (i + 0.5) / n <= progression ? couleur : fond,
          }}
        />
      ))}
    </div>
  )
}
