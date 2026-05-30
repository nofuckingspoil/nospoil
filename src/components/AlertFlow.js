'use client'
import { useState } from 'react'
import { getFingerprint } from '@/lib/referral'

export default function AlertFlow({ onSubscribe, topic, variant = 'bottom', inputId }) {
  const [step, setStep]   = useState('email')
  const [email, setEmail] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [want, setWant]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function submitEmail(e) {
    e.preventDefault()
    if (!email.includes('@')) return
    onSubscribe(email, topic)
    setStep('community')
  }

  async function submitCommunity(e) {
    e.preventDefault()
    if (!want) { setStep('done'); return }
    const trimmed = pseudo.trim()
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError('Le pseudo doit faire entre 3 et 20 caractères.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fp = await getFingerprint()
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pseudo: trimmed, communityOptIn: true, fingerprint: fp }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? 'Une erreur est survenue.'); return }
      setStep('done')
    } catch { setError('Erreur réseau. Réessaie.') }
    finally { setLoading(false) }
  }

  if (step === 'email') {
    if (variant === 'hero') {
      return (
        <form className="hero-alert-form" onSubmit={submitEmail}>
          <input type="email" placeholder="ton@email.fr" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" className="hero-alert-btn">🔔 M&apos;alerter des derniers résumés →</button>
        </form>
      )
    }
    return (
      <form className="stages-end-form" onSubmit={submitEmail}>
        <input id={inputId} type="email" placeholder="ton@email.fr" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
          🔔 M&apos;alerter des prochains résumés
        </button>
      </form>
    )
  }

  if (step === 'community') {
    return (
      <div className="alert-flow-community">
        <div className="sf-ok">✓ Inscrit — on te prévient dès que le prochain résumé sort.</div>
        <form onSubmit={submitCommunity}>
          <p className="sf-q">Rejoindre la communauté et grimper au classement ?</p>
          <label className="sf-opt-label">
            <input type="checkbox" checked={want} onChange={e => { setWant(e.target.checked); setError(null) }} />
            <span>Oui — afficher mon badge dans le classement</span>
          </label>
          {want && (
            <input
              type="text"
              placeholder="Ton pseudo (3–20 caractères)"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              className="sf-input sf-pseudo-input"
              autoFocus
            />
          )}
          {error && <p className="sf-error">{error}</p>}
          <div className="sf-row-btns">
            <button type="button" className="btn btn-ghost sf-pass" onClick={() => setStep('done')}>Passer</button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? '…' : want ? 'Rejoindre →' : 'Continuer →'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={variant === 'hero' ? 'hero-alert-ok' : 'card-alert-ok'}>
      ✓ C&apos;est bon, tu seras alerté !
    </div>
  )
}
