'use client'

// ============================================================
//  La vitesse de lecture d'un message du livre d'or.
//
//  Une pastille qu'on touche pour passer à la vitesse suivante :
//  ×1 → ×1,25 → ×1,5 → ×1,75 → ×2 → ×1. Le même geste que les messages
//  vocaux des messageries, que tout le monde connaît déjà.
// ============================================================

import { useLangue } from './Langue'

export const VITESSES = [1, 1.25, 1.5, 1.75, 2]

export function vitesseSuivante(v) {
  const i = VITESSES.indexOf(v)
  return VITESSES[(i + 1) % VITESSES.length]
}

export default function Vitesse({ valeur = 1, onChange }) {
  const { t, lang } = useLangue()
  // « ×1,25 » en français et en allemand, « ×1.25 » en anglais.
  const texte = `×${lang === 'en' ? String(valeur) : String(valeur).replace('.', ',')}`
  return (
    <button
      type="button"
      className={`lo-vitesse ${valeur !== 1 ? 'on' : ''}`}
      onClick={() => onChange(vitesseSuivante(valeur))}
      aria-label={t({ fr: `Vitesse de lecture ${texte}`, en: `Playback speed ${texte}`, de: `Wiedergabegeschwindigkeit ${texte}` })}
    >
      {texte}
    </button>
  )
}
