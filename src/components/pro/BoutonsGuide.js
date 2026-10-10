'use client'

// « Télécharger en PDF » (la fenêtre d'impression du navigateur, qui propose
// l'enregistrement en PDF) et « Copier » pour les phrases toutes faites.
import { useState } from 'react'

export function BoutonPdf() {
  return (
    <button type="button" className="btn btn-dark pp-btn-compact pp-pas-imprime" onClick={() => window.print()}>
      Télécharger en PDF
    </button>
  )
}

export function Citation({ texte }) {
  const [copie, setCopie] = useState(false)
  async function copier() {
    try {
      await navigator.clipboard.writeText(texte.replace(/^«\s*|\s*»$/g, ''))
      setCopie(true); setTimeout(() => setCopie(false), 1800)
    } catch { /* presse-papiers indisponible : le texte reste sélectionnable */ }
  }
  return (
    <div className="pg-citation">
      <p>{texte}</p>
      <button type="button" onClick={copier} className="pg-copier pp-pas-imprime">{copie ? 'Copié ✓' : 'Copier'}</button>
    </div>
  )
}
