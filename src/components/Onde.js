'use client'

// ============================================================
//  L'onde sonore d'un message du livre d'or.
//
//  Des barres verticales, une par tranche du message. `progression` (0 à 1)
//  colore celles déjà écoutées : on voit où l'on en est sans compteur.
//  Sans onde mesurée (message d'une ancienne version, mesure impossible), on
//  dessine une onde calme et régulière plutôt qu'un vide.
// ============================================================

const PAR_DEFAUT = Array.from({ length: 48 }, (_, i) => 30 + Math.round(22 * Math.abs(Math.sin(i * 0.7)) + 10 * Math.abs(Math.sin(i * 2.3))))

export default function Onde({ valeurs, progression = 0, couleur = 'currentColor', fond = 'rgba(127,127,127,.35)', hauteur = 34, vivante = false }) {
  const barres = Array.isArray(valeurs) && valeurs.length ? valeurs : PAR_DEFAUT
  const n = barres.length
  return (
    <div className={`lo-onde ${vivante ? 'lo-onde-vivante' : ''}`} style={{ height: hauteur }} aria-hidden="true">
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
