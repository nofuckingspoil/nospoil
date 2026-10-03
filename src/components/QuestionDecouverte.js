'use client'

import { useState } from 'react'
import { useLangue } from './Langue'

// ============================================================
//  « Comment avez-vous découvert Time to Flash ? »
//
//  Choix multiple : on découvre souvent par deux chemins à la fois (une pub
//  Instagram, puis un ami qui en parle). L'assistant IA demande lequel, « Autre »
//  ouvre un champ libre. Le bouton Valider reste grisé tant que rien n'est
//  coché ; la question, elle, peut toujours se passer.
//
//  Utilisé à la fin des réglages (création courte) et sur le tableau de bord
//  (création classique). `onEnvoyer({ choix, ia, autre })`, `onPasser()`.
// ============================================================

export const IA_NOMS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Copilot', 'Mistral']

export default function QuestionDecouverte({ onEnvoyer, onPasser, envoi = false }) {
  const { t } = useLangue()
  const [choix, setChoix] = useState(() => new Set())
  const [ia, setIa] = useState(() => new Set())
  const [autre, setAutre] = useState('')

  const OPTIONS = [
    ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'],
    ['bouche', t({ fr: 'Bouche-à-oreille', en: 'Word of mouth', de: 'Mundpropaganda' })],
    ['invite', t({ fr: "J'étais invité à une soirée Time to Flash", en: 'I was a guest at a Time to Flash event', de: 'Ich war Gast bei einem Time-to-Flash-Event' })],
    ['google', t({ fr: 'Recherche Google', en: 'Google search', de: 'Google-Suche' })],
    ['ia', t({ fr: 'Assistant IA (ChatGPT…)', en: 'AI assistant (ChatGPT…)', de: 'KI-Assistent (ChatGPT…)' })],
    ['autre', t({ fr: 'Autre', en: 'Other', de: 'Sonstiges' })],
  ]

  const basculer = (setter) => (cle) => setter((prev) => {
    const n = new Set(prev)
    if (n.has(cle)) n.delete(cle)
    else n.add(cle)
    return n
  })
  const basculerChoix = basculer(setChoix)
  const basculerIa = basculer(setIa)

  function valider(e) {
    e.preventDefault()
    if (!choix.size || envoi) return
    onEnvoyer({
      choix: [...choix],
      ia: choix.has('ia') ? [...ia] : [],
      autre: choix.has('autre') ? autre.trim() : '',
    })
  }

  return (
    <form onSubmit={valider}>
      <div className="hint" style={{ marginBottom: 8 }}>{t({ fr: 'Plusieurs réponses possibles.', en: 'You can choose more than one.', de: 'Mehrere Antworten möglich.' })}</div>
      <div className="avis-choix">
        {OPTIONS.map(([cle, label]) => (
          <button key={cle} type="button" className={`avis-opt ${choix.has(cle) ? 'on' : ''}`}
            aria-pressed={choix.has(cle)} onClick={() => basculerChoix(cle)}>{label}</button>
        ))}
      </div>

      {choix.has('ia') && (
        <div style={{ marginTop: 14 }}>
          <div className="hint" style={{ marginBottom: 8 }}>{t({ fr: 'Lequel ou lesquels ?', en: 'Which one(s)?', de: 'Welcher oder welche?' })}</div>
          <div className="avis-choix">
            {IA_NOMS.map((nom) => (
              <button key={nom} type="button" className={`avis-opt ${ia.has(nom) ? 'on' : ''}`}
                aria-pressed={ia.has(nom)} onClick={() => basculerIa(nom)}>{nom}</button>
            ))}
          </div>
        </div>
      )}

      {choix.has('autre') && (
        <div className="field" style={{ marginTop: 14 }}>
          <label>{t({ fr: 'Précisez', en: 'Please specify', de: 'Bitte angeben' })}</label>
          <input type="text" value={autre} onChange={(e) => setAutre(e.target.value)} maxLength={200}
            placeholder={t({ fr: 'Un salon, un article, un prestataire…', en: 'A fair, an article, a supplier…', de: 'Eine Messe, ein Artikel, ein Dienstleister…' })} />
        </div>
      )}

      <button className="btn btn-accent" type="submit" disabled={!choix.size || envoi} style={{ marginTop: 18, width: '100%' }}>
        {envoi ? t({ fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' }) : t({ fr: 'Valider', en: 'Submit', de: 'Bestätigen' })}
      </button>
      {onPasser && (
        <button type="button" className="linklike wiz-skip" onClick={onPasser} style={{ display: 'block', margin: '12px auto 0' }}>
          {t({ fr: 'Passer cette question', en: 'Skip this question', de: 'Diese Frage überspringen' })}
        </button>
      )}
    </form>
  )
}
