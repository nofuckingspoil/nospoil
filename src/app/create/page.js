'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { getDeviceToken, rememberMyEvent } from '../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED } from '../../lib/pricing'

function defaultReveal() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(20, 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function CreateForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const tier = tierByGuests(sp.get('tier'))
  const isPaid = tier.priceCents > 0

  const [name, setName] = useState('')
  const [hostNames, setHostNames] = useState('')
  const [revealAt, setRevealAt] = useState(defaultReveal())
  const [shots, setShots] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Donnez un nom à votre événement.'); return }
    setLoading(true)
    try {
      // Quand Stripe sera branché : ici, rediriger vers le paiement pour les formules payantes.
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerToken: getDeviceToken(), name, hostNames,
          revealAt: new Date(revealAt).toISOString(), shotsPerGuest: shots,
          maxGuests: tier.maxGuests,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      rememberMyEvent(data.id)
      router.push(`/event/${data.id}`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const ctaLabel = loading
    ? 'Création…'
    : (isPaid && PAYMENTS_ENABLED ? `Payer ${formatPrice(tier.priceCents)} et créer →` : 'Créer mon événement →')

  return (
    <main className="screen screen-cream">
      <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      {/* Formule choisie */}
      <div className="card" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow-mute">Votre formule</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginTop: 4 }}>
            Jusqu'à {tier.maxGuests} invités
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: isPaid ? 'var(--accent)' : 'var(--ok)' }}>
            {formatPrice(tier.priceCents)}
          </div>
          <Link href="/#tarifs" className="mono small" style={{ color: 'var(--text3)' }}>changer</Link>
        </div>
      </div>

      {isPaid && !PAYMENTS_ENABLED && (
        <div className="notice" style={{ marginTop: 12 }}>
          🎁 <strong>Offert pendant le lancement</strong> — le paiement en ligne arrive bientôt. Votre événement est créé sans frais pour l'instant.
        </div>
      )}

      <form className="card" style={{ marginTop: 16 }} onSubmit={handleSubmit}>
        <h2 className="h3" style={{ marginBottom: 18 }}>Votre événement</h2>
        <div className="field">
          <label>Nom de l'événement</label>
          <input type="text" placeholder="Ex : Mariage de Marie & Paul" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
        </div>
        <div className="field">
          <label>Vos prénoms <span className="muted">(facultatif)</span></label>
          <input type="text" placeholder="Ex : Marie & Paul" value={hostNames}
            onChange={(e) => setHostNames(e.target.value)} maxLength={80} />
        </div>
        <div className="field">
          <label>Révélation des photos le</label>
          <input type="datetime-local" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} />
          <div className="hint">Les photos restent cachées jusqu'à cette date — comme une pellicule qu'on développe.</div>
        </div>
        <div className="field">
          <label>Clichés par invité</label>
          <div className="stepper">
            <button type="button" onClick={() => setShots((s) => Math.max(1, s - 1))} aria-label="Moins">−</button>
            <span className="val">{shots}</span>
            <button type="button" onClick={() => setShots((s) => Math.min(50, s + 1))} aria-label="Plus">+</button>
          </div>
          <div className="hint">La contrainte argentique : moins de poses = chaque cliché compte davantage.</div>
        </div>
        {error && <div className="err">{error}</div>}
        <button className="btn btn-accent" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {ctaLabel}
        </button>
      </form>

      <div className="footer-note" style={{ marginTop: 24 }}>PAIEMENT UNIQUE · SANS ABONNEMENT</div>
    </main>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <CreateForm />
    </Suspense>
  )
}
