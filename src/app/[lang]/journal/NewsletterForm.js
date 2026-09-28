'use client'

import { useState } from 'react'
import { useLangue } from '../../../components/Langue'

// Formulaire d'inscription newsletter → /api/newsletter (Brevo).
export default function NewsletterForm() {
  const { t } = useLangue()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | ok | error
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error'); setError(t({ fr: 'Entre une adresse mail valide.', en: 'Please enter a valid email address.', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' })); return
    }
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' })) }
      setState('ok')
    } catch (err) { setState('error'); setError(err.message) }
  }

  if (state === 'ok') {
    return <div className="dj-btn" style={{ cursor: 'default' }}>{t({ fr: 'Inscrit·e ✓', en: 'Subscribed ✓', de: 'Angemeldet ✓' })}</div>
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email" inputMode="email" autoComplete="email"
        placeholder={t({ fr: 'prenom@email.fr', en: 'name@email.com', de: 'vorname@email.de' })} required value={email}
        onChange={(e) => setEmail(e.target.value)} aria-label={t({ fr: 'Email', en: 'Email', de: 'E-Mail' })}
      />
      <button className="dj-btn" type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? '…' : t({ fr: 'S’inscrire', en: 'Subscribe', de: 'Anmelden' })}
      </button>
      {state === 'error' && (
        <span style={{ color: '#ffb4a1', fontSize: 12, alignSelf: 'center' }}>{error}</span>
      )}
    </form>
  )
}
