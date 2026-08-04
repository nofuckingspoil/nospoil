'use client'

import { useEffect, useState } from 'react'

// Mémorise l'accès : un lecteur qui revient ne redonne pas son adresse.
const KEY = 'ttf_guide_unlocked'

export function isGuideUnlocked() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}

// Porte d'accès au guide : le contenu est déjà rendu par le serveur (Google le
// lit, ce qui fait tout l'intérêt SEO de la page), mais il reste replié tant que
// le lecteur n'a pas laissé son adresse.
export default function GuideGate({ exchange, children }) {
  const [unlocked, setUnlocked] = useState(false)
  // Tant que le composant n'est pas monté côté navigateur, on ne sait pas si le
  // lecteur est déjà inscrit. On rend donc la même chose que le serveur, sinon
  // React signale une différence entre les deux rendus.
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | error
  const [error, setError] = useState('')

  useEffect(() => {
    setUnlocked(isGuideUnlocked())
    setReady(true)
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    const clean = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setState('error'); setError('Entrez une adresse mail valide.'); return
    }
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean, source: 'guide' }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Erreur.') }
      try { localStorage.setItem(KEY, '1') } catch {}
      setUnlocked(true)
    } catch (err) {
      setState('error')
      setError(err.message)
    }
  }

  const open = ready && unlocked

  return (
    <>
      {!open && (
        <div className="gd-gate" aria-live="polite">
          <span className="dj-eyebrow">La suite du guide</span>
          <h2>Les chapitres 2 à 7, tout de suite</h2>
          <p>{exchange}</p>
          <form onSubmit={onSubmit}>
            <input
              type="email" inputMode="email" autoComplete="email"
              placeholder="prenom@email.fr" required value={email}
              onChange={(ev) => setEmail(ev.target.value)} aria-label="Votre adresse mail"
            />
            <button className="dj-btn" type="submit" disabled={state === 'loading'}>
              {state === 'loading' ? '…' : 'Lire le guide'}
            </button>
          </form>
          {state === 'error' && <p className="gd-gate-err">{error}</p>}
          <p className="gd-gate-fine">
            Gratuit. Aucune carte bancaire. Votre adresse ne sera jamais transmise à un tiers.
          </p>
        </div>
      )}

      {/* `hidden` retire le contenu de l'affichage ET de la lecture d'écran,
          sans l'enlever de la page : le guide s'ouvre sans recharger. */}
      <div hidden={!open}>{children}</div>
    </>
  )
}
