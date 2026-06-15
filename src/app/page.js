'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '../lib/brand'
import { getDeviceToken, rememberMyEvent } from '../lib/device'

// Valeur par défaut pour le champ date : demain soir 20h
function defaultReveal() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(20, 0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
    if (!name.trim()) { setError('Donne un nom à ton événement.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerToken: getDeviceToken(),
          name,
          hostNames,
          revealAt: new Date(revealAt).toISOString(),
          shotsPerGuest: shots,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      rememberMyEvent(data.id)
      router.push(`/event/${data.id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="wrap">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>

      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">Caméra collaborative</div>
        <h1 className="display" style={{ marginTop: 12 }}>
          La pellicule<br />partagée de<br />votre fête.
        </h1>
        <p className="lead" style={{ marginTop: 18 }}>{BRAND.pitch}</p>
      </div>

      <form className="card" style={{ marginTop: 28 }} onSubmit={handleSubmit}>
        <h2 style={{ fontSize: 22, marginBottom: 18 }}>Créer un événement</h2>

        <div className="field">
          <label>Nom de l'événement</label>
          <input type="text" placeholder="Ex : Mariage de Marie & Paul"
            value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>

        <div className="field">
          <label>Vos prénoms <span className="muted">(facultatif)</span></label>
          <input type="text" placeholder="Ex : Marie & Paul"
            value={hostNames} onChange={(e) => setHostNames(e.target.value)} maxLength={80} />
        </div>

        <div className="field">
          <label>Révélation des photos le</label>
          <input type="datetime-local" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} />
          <div className="hint">Les photos restent cachées jusqu'à cette date — comme une pellicule qu'on développe.</div>
        </div>

        <div className="field">
          <label>Clichés par invité</label>
          <div className="stepper">
            <button type="button" onClick={() => setShots((s) => Math.max(1, s - 1))} aria-label="Moins">–</button>
            <span className="val">{shots}</span>
            <button type="button" onClick={() => setShots((s) => Math.min(50, s + 1))} aria-label="Plus">+</button>
          </div>
          <div className="hint">Une limite, ça force à viser juste. 10 à 15 est un bon repère.</div>
        </div>

        {error && <div className="err">{error}</div>}

        <button className="btn btn-amber" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Création…' : 'Créer ma pellicule'}
        </button>
      </form>

      <p className="footer-note">Gratuit pour tester · Aucune application à installer pour vos invités.</p>
    </main>
  )
}
