'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '../lib/brand'
import Logo from '../components/Logo'
import { getDeviceToken, rememberMyEvent } from '../lib/device'

function defaultReveal() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(20, 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STEPS = [
  { n: '01', title: 'Scannez le QR', sub: "Vos invités ouvrent l'appareil dans leur navigateur. Aucune appli." },
  { n: '02', title: 'Prenez vos clichés', sub: 'Un nombre limité de photos par invité. Chaque cliché compte.' },
  { n: '03', title: 'La révélation', sub: 'Tout se développe et se révèle après la fête, pour tout le monde.' },
]

export default function Home() {
  const router = useRouter()
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
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerToken: getDeviceToken(), name, hostNames,
          revealAt: new Date(revealAt).toISOString(), shotsPerGuest: shots,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      rememberMyEvent(data.id)
      router.push(`/event/${data.id}`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  return (
    <main className="screen screen-cream">
      <Logo />

      <div style={{ marginTop: 38 }}>
        <div className="eyebrow">Appareil photo jetable · événements</div>
        <h1 className="display" style={{ marginTop: 14 }}>
          L'appareil photo<br />jetable de vos<br />événements.
        </h1>
        <p className="lead" style={{ marginTop: 18 }}>{BRAND.pitch}</p>
      </div>

      <form className="card" style={{ marginTop: 28 }} onSubmit={handleSubmit}>
        <h2 className="h3" style={{ marginBottom: 18 }}>Créer un événement</h2>

        <div className="field">
          <label>Nom de l'événement</label>
          <input type="text" placeholder="Ex : Mariage de Marie & Paul" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={80} />
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
          {loading ? 'Création…' : 'Créer mon appareil →'}
        </button>
      </form>

      <div style={{ marginTop: 40 }}>
        <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 20 }}>Comment ça marche</div>
        <div className="stack">
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16 }}>
              <span className="mono" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>{s.n}</span>
              <div>
                <h4 style={{ fontSize: 16, marginBottom: 4 }}>{s.title}</h4>
                <p className="muted small" style={{ lineHeight: 1.5 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-note" style={{ marginTop: 28 }}>
        GRATUIT POUR TESTER · PAIEMENT UNIQUE · SANS ABONNEMENT
      </div>
    </main>
  )
}
