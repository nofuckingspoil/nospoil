'use client'

import { useState } from 'react'
import { useLangue } from './Langue'

// ============================================================
//  « Comment avez-vous découvert Time to Flash ? »
//
//  Choix multiple : on découvre souvent par deux chemins à la fois (une pub
//  Instagram, puis un ami qui en parle). L'assistant IA demande lequel, le
//  bouche-à-oreille demande qui en a parlé (un prestataire peut devenir un
//  partenaire : on demande alors lequel), « Autre » ouvre un champ libre. Le bouton Valider reste grisé tant que rien n'est
//  coché. `onPasser` facultatif : sans lui, la question est obligatoire.
//
//  Utilisé à la fin des réglages (création courte) et sur le tableau de bord
//  (création classique). `onEnvoyer({ choix, ia, autre })`, `onPasser()`.
// ============================================================

export const IA_NOMS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Copilot', 'Mistral']

// Qui en a parlé : les clés partent au serveur, qui les remet en clair.
export const BOUCHE_QUI = ['proche', 'prestataire', 'collegue']

export default function QuestionDecouverte({ onEnvoyer, onPasser, envoi = false }) {
  const { t } = useLangue()
  const [choix, setChoix] = useState(() => new Set())
  const [ia, setIa] = useState(() => new Set())
  const [qui, setQui] = useState(() => new Set())
  const [prestataire, setPrestataire] = useState('')
  const [autre, setAutre] = useState('')

  const QUI = {
    proche: t({ fr: 'Un ami ou un proche', en: 'A friend or relative', de: 'Freunde oder Familie' }),
    prestataire: t({ fr: 'Un prestataire (photographe, DJ, lieu de réception…)', en: 'A supplier (photographer, DJ, venue…)', de: 'Ein Dienstleister (Fotograf, DJ, Location…)' }),
    collegue: t({ fr: 'Un collègue', en: 'A colleague', de: 'Kollegen' }),
  }

  const OPTIONS = [
    ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['youtube', 'YouTube'],
    ['bouche', t({ fr: 'Bouche-à-oreille', en: 'Word of mouth', de: 'Mundpropaganda' })],
    ['invite', t({ fr: "J'étais invité à une soirée Time to Flash", en: 'I was a guest at a Time to Flash event', de: 'Ich war Gast bei einem Time-to-Flash-Event' })],
    ['google', t({ fr: 'Recherche Google', en: 'Google search', de: 'Google-Suche' })],
    ['ia', t({ fr: 'Assistant IA (ChatGPT, Claude, Gemini, etc.)', en: 'AI assistant (ChatGPT, Claude, Gemini, etc.)', de: 'KI-Assistent (ChatGPT, Claude, Gemini usw.)' })],
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
  const basculerQui = basculer(setQui)

  function valider(e) {
    e.preventDefault()
    if (!choix.size || envoi) return
    onEnvoyer({
      choix: [...choix],
      ia: choix.has('ia') ? [...ia] : [],
      qui: choix.has('bouche') ? [...qui] : [],
      prestataire: choix.has('bouche') && qui.has('prestataire') ? prestataire.trim() : '',
      autre: choix.has('autre') ? autre.trim() : '',
    })
  }

  return (
    <form onSubmit={valider}>
      <div className="hint" style={{ marginBottom: 8 }}>{t({ fr: 'Plusieurs réponses possibles.', en: 'You can choose more than one.', de: 'Mehrere Antworten möglich.' })}</div>
      <div className="cases">
        {OPTIONS.map(([cle, label]) => (
          <div key={cle}>
            <label className={`case ${choix.has(cle) ? 'on' : ''}`}>
              <input type="checkbox" checked={choix.has(cle)} onChange={() => basculerChoix(cle)} />
              <span>{label}</span>
            </label>

            {/* La précision s'ouvre juste sous la case qui la demande. */}
            {cle === 'ia' && choix.has('ia') && (
              <div className="cases-suite">
                <div className="hint" style={{ marginBottom: 8 }}>{t({ fr: 'Lequel ou lesquels ?', en: 'Which one(s)?', de: 'Welcher oder welche?' })}</div>
                <div className="cases cases-2">
                  {IA_NOMS.map((nom) => (
                    <label key={nom} className={`case ${ia.has(nom) ? 'on' : ''}`}>
                      <input type="checkbox" checked={ia.has(nom)} onChange={() => basculerIa(nom)} />
                      <span>{nom}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {cle === 'bouche' && choix.has('bouche') && (
              <div className="cases-suite">
                <div className="hint" style={{ marginBottom: 8 }}>{t({ fr: 'Qui vous en a parlé ?', en: 'Who told you about it?', de: 'Wer hat Ihnen davon erzählt?' })}</div>
                <div className="cases">
                  {BOUCHE_QUI.map((q) => (
                    <div key={q}>
                      <label className={`case ${qui.has(q) ? 'on' : ''}`}>
                        <input type="checkbox" checked={qui.has(q)} onChange={() => basculerQui(q)} />
                        <span>{QUI[q]}</span>
                      </label>
                      {q === 'prestataire' && qui.has('prestataire') && (
                        <div className="field cases-suite">
                          <label>{t({ fr: 'Lequel ? (facultatif)', en: 'Which one? (optional)', de: 'Welcher? (optional)' })}</label>
                          <input type="text" value={prestataire} onChange={(e) => setPrestataire(e.target.value)} maxLength={120}
                            placeholder={t({ fr: 'Nom du photographe, du lieu…', en: 'Name of the photographer, venue…', de: 'Name des Fotografen, der Location…' })} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cle === 'autre' && choix.has('autre') && (
              <div className="field cases-suite">
                <label>{t({ fr: 'Précisez', en: 'Please specify', de: 'Bitte angeben' })}</label>
                <input type="text" value={autre} onChange={(e) => setAutre(e.target.value)} maxLength={200} autoFocus
                  placeholder={t({ fr: 'Un salon, un article, un prestataire…', en: 'A fair, an article, a supplier…', de: 'Eine Messe, ein Artikel, ein Dienstleister…' })} />
              </div>
            )}
          </div>
        ))}
      </div>

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
