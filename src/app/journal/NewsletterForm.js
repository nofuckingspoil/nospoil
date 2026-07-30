'use client'

import { useState } from 'react'

// Formulaire d'inscription newsletter → /api/newsletter (Brevo).
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | ok | error
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error'); setError('Entre une adresse mail valide.'); return
    }
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Erreur.') }
      setState('ok')
    } catch (err) { setState('error'); setError(err.message) }
  }

  if (state === 'ok') {
    return <div className="dj-btn" style={{ cursor: 'default' }}>Inscrit·e ✓</div>
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email" inputMode="email" autoComplete="email"
        placeholder="prenom@email.fr" required value={email}
        onChange={(e) => setEmail(e.target.value)} aria-label="Email"
      />
      <button className="dj-btn" type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? '…' : 'S’inscrire'}
      </button>
      {state === 'error' && (
        <span style={{ color: '#ffb4a1', fontSize: 12, alignSelf: 'center' }}>{error}</span>
      )}
    </form>
  )
}
