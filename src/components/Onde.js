'use client'

import { useRef, useState } from 'react'

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
//
// Pendant le glissé, seule l'onde suit le doigt (avec un curseur) ; la lecture
// ne saute qu'une fois, au moment où l'on lâche. Sauter à chaque mouvement du
// doigt faisait bégayer le son, des dizaines de fois par seconde.
export default function Onde({ valeurs, progression = 0, couleur = 'currentColor', fond = 'rgba(127,127,127,.35)', hauteur = 34, vivante = false, onChercher }) {
  const barres = Array.isArray(valeurs) && valeurs.length ? valeurs : PAR_DEFAUT
  const n = barres.length
  const [vise, setVise] = useState(null) // la fraction sous le doigt, pendant le glissé
  const viseRef = useRef(null)

  function viser(ev) {
    const r = ev.currentTarget.getBoundingClientRect()
    if (!r.width) return
    const f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width))
    viseRef.current = f
    setVise(f)
  }
  function lacher(valider) {
    const f = viseRef.current
    viseRef.current = null
    setVise(null)
    if (valider && f != null) onChercher(f)
  }
  const glisser = onChercher ? {
    onPointerDown: (ev) => {
      try { ev.currentTarget.setPointerCapture(ev.pointerId) } catch {}
      viser(ev)
    },
    onPointerMove: (ev) => { if (viseRef.current != null) viser(ev) },
    onPointerUp: () => lacher(true),
    onPointerCancel: () => lacher(false),
  } : {}

  const montre = vise ?? progression
  return (
    <div
      className={`lo-onde ${vivante ? 'lo-onde-vivante' : ''} ${onChercher ? 'lo-onde-cherche' : ''} ${vise != null ? 'lo-onde-vise' : ''}`}
      style={{ height: hauteur }}
      aria-hidden="true"
      {...glisser}
    >
      {barres.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(8, Math.min(100, v))}%`,
            background: (i + 0.5) / n <= montre ? couleur : fond,
          }}
        />
      ))}
      {vise != null && <i className="lo-onde-curseur" style={{ left: `${vise * 100}%` }} />}
    </div>
  )
}
