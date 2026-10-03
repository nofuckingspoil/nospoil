'use client'

import { useState } from 'react'
import { useLangue } from './Langue'
import { getOwnerToken } from '../lib/device'
import { lireProvenance } from '../lib/provenance'

// ============================================================
//  Juste après la création, sur le tableau de bord.
//
//  1. « Comment avez-vous découvert Time to Flash ? » : posée maintenant, une
//     fois la vente faite, elle ne peut plus en coûter une. Un seul geste ;
//     l'assistant IA et « autre » demandent une précision.
//  2. Après la création courte (/create/express), l'invitation à régler le
//     reste : fin, clichés, révélation, couverture. Les valeurs par défaut
//     sont déjà en place, rien n'est obligatoire.
// ============================================================

const IA = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Copilot', 'Mistral']

export default function ApresCreation({ eventId, court, onPersonnaliser }) {
  const { t } = useLangue()
  const [choix, setChoix] = useState(null)
  const [detail, setDetail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [ferme, setFerme] = useState(false)

  const OPTIONS = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'bouche', label: t({ fr: 'Bouche-à-oreille', en: 'Word of mouth', de: 'Mundpropaganda' }) },
    { id: 'invite', label: t({ fr: "J'étais invité à une soirée Time to Flash", en: 'I was a guest at a Time to Flash event', de: 'Ich war Gast bei einem Time-to-Flash-Event' }) },
    { id: 'google', label: t({ fr: 'Recherche Google', en: 'Google search', de: 'Google-Suche' }) },
    { id: 'ia', label: t({ fr: 'Assistant IA (ChatGPT…)', en: 'AI assistant (ChatGPT…)', de: 'KI-Assistent (ChatGPT…)' }) },
    { id: 'autre', label: t({ fr: 'Autre', en: 'Other', de: 'Sonstiges' }) },
  ]

  async function envoyer(id, precision = '') {
    setEnvoye(true)
    try {
      await fetch(`/api/events/${eventId}/decouverte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(eventId) },
        body: JSON.stringify({ decouverte: id, detail: precision, provenance: lireProvenance() || {} }),
      })
    } catch {}
  }

  function choisir(id) {
    setChoix(id)
    // Les choix qui se suffisent partent tout de suite : un geste, c'est fini.
    if (id !== 'ia' && id !== 'autre') envoyer(id)
  }

  if (ferme) return null

  return (
    <div className="apres-crea">
      <button type="button" className="db-mail-parti-x" onClick={() => setFerme(true)} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>×</button>

      {court && (
        <div className="apres-crea-bloc">
          <strong>{t({ fr: '🎉 Votre soirée est prête', en: '🎉 Your event is ready', de: '🎉 Ihr Event ist bereit' })}</strong>
          <p>{t({
            fr: "On a choisi pour vous : 5 photos par personne et une couverture par défaut. Tout se change ici jusqu'au jour J : nombre de photos, fin de la soirée, couverture, photos visibles ou non avant la révélation.",
            en: 'We have chosen for you: 5 photos per person and a default cover. You can change everything here until the big day: number of photos, end of the event, cover, whether photos can be seen before the reveal.',
            de: 'Wir haben für Sie gewählt: 5 Fotos pro Person und ein Standard-Titelbild. Bis zum großen Tag können Sie hier alles ändern: Anzahl der Fotos, Ende des Events, Titelbild, ob Fotos vor der Enthüllung sichtbar sind.',
          })}</p>
          <button type="button" className="btn btn-dark apres-crea-btn" onClick={onPersonnaliser}>
            {t({ fr: 'Personnaliser ma soirée →', en: 'Customise my event →', de: 'Mein Event anpassen →' })}
          </button>
        </div>
      )}

      <div className="apres-crea-bloc">
        {envoye ? (
          <strong>{t({ fr: 'Merci, ça nous aide beaucoup 🙏', en: 'Thank you, that helps us a lot 🙏', de: 'Danke, das hilft uns sehr 🙏' })}</strong>
        ) : (
          <>
            <strong>{t({ fr: 'Une question : comment avez-vous découvert Time to Flash ?', en: 'One question: how did you hear about Time to Flash?', de: 'Eine Frage: Wie haben Sie Time to Flash entdeckt?' })}</strong>
            <div className="avis-choix" style={{ marginTop: 10 }}>
              {OPTIONS.map((o) => (
                <button key={o.id} type="button" className={`avis-opt ${choix === o.id ? 'on' : ''}`}
                  aria-pressed={choix === o.id} onClick={() => choisir(o.id)}>{o.label}</button>
              ))}
            </div>

            {choix === 'ia' && (
              <div style={{ marginTop: 12 }}>
                <div className="small muted" style={{ marginBottom: 8 }}>{t({ fr: 'Lequel ?', en: 'Which one?', de: 'Welcher?' })}</div>
                <div className="avis-choix">
                  {IA.map((nom) => (
                    <button key={nom} type="button" className="avis-opt" onClick={() => envoyer('ia', nom)}>{nom}</button>
                  ))}
                  <button type="button" className="avis-opt" onClick={() => envoyer('ia', '')}>{t({ fr: 'Un autre', en: 'Another one', de: 'Ein anderer' })}</button>
                </div>
              </div>
            )}

            {choix === 'autre' && (
              <form style={{ marginTop: 12, display: 'flex', gap: 8 }} onSubmit={(e) => { e.preventDefault(); envoyer('autre', detail) }}>
                <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={120} autoFocus
                  placeholder={t({ fr: 'Un salon, un article, un prestataire…', en: 'A fair, an article, a supplier…', de: 'Eine Messe, ein Artikel, ein Dienstleister…' })} />
                <button type="submit" className="btn btn-dark" style={{ width: 'auto', padding: '0 18px' }}>{t({ fr: 'OK', en: 'OK', de: 'OK' })}</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
