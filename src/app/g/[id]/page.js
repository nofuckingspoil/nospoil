'use client'

import { use, useEffect, useState } from 'react'
import { BRAND } from '../../../lib/brand'

function formatReveal(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s, done: diff === 0 }
}

function Countdown({ revealAt, name, hostNames, onDone }) {
  const { d, h, m, s, done } = useCountdown(revealAt)
  useEffect(() => { if (done) onDone?.() }, [done, onDone])
  const cell = (n, l) => (
    <div className="cd-cell"><div className="cd-num">{String(n).padStart(2, '0')}</div><div className="cd-lbl">{l}</div></div>
  )
  return (
    <main className="wrap center">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>
      <div className="spacer" />
      <div style={{ fontSize: 54 }}>🎞️</div>
      <div className="eyebrow" style={{ marginTop: 14 }}>{hostNames || name}</div>
      <h1 style={{ fontSize: 28, marginTop: 8 }}>La pellicule se développe…</h1>
      <p className="lead" style={{ marginTop: 12 }}>
        Les photos restent cachées jusqu'à la révélation. Patience, ça en vaut la peine.
      </p>
      <div className="countdown">{cell(d, 'jours')}{cell(h, 'h')}{cell(m, 'min')}{cell(s, 'sec')}</div>
      <p className="muted small">Révélation le {formatReveal(revealAt)}</p>
      <div className="spacer" />
    </main>
  )
}

export default function Gallery({ params }) {
  const { id } = use(params)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  function load() {
    fetch(`/api/gallery/${id}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Connexion impossible.'))
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <main className="wrap center"><div className="card">{error}</div></main>
  if (!data) return <main className="center-screen"><p className="muted">Chargement…</p></main>

  if (!data.revealed) {
    return <Countdown revealAt={data.revealAt} name={data.name} hostNames={data.hostNames} onDone={load} />
  }

  const photos = filter === 'all' ? data.photos : data.photos.filter((p) => p.guestId === filter)

  return (
    <main className="wrap wrap-wide">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>

      <div style={{ marginTop: 22 }}>
        <div className="eyebrow">{data.hostNames || 'Galerie'}</div>
        <h1 style={{ fontSize: 30, marginTop: 8 }}>{data.name}</h1>
        <p className="muted small" style={{ marginTop: 8 }}>{data.photos.length} photos · {data.guests.length} invités</p>
      </div>

      {data.guests.length > 1 && (
        <div className="chips" style={{ marginTop: 20 }}>
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tout le monde</button>
          {data.guests.map((g) => (
            <button key={g.id} className={`chip ${filter === g.id ? 'active' : ''}`} onClick={() => setFilter(g.id)}>{g.name}</button>
          ))}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="notice" style={{ marginTop: 20 }}>Aucune photo pour ce filtre.</div>
      ) : (
        <div className="grid" style={{ marginTop: 8 }}>
          {photos.map((p, i) => (
            <a key={i} className="photo" href={p.url} target="_blank" rel="noreferrer">
              <img src={p.url} alt={`Photo de ${p.who}`} loading="lazy" />
              <div className="who">{p.who}</div>
            </a>
          ))}
        </div>
      )}

      <p className="footer-note">Appuie longuement sur une photo pour l'enregistrer.</p>
    </main>
  )
}
