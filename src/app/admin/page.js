'use client'

import { useEffect, useState } from 'react'
import Logo from '../../components/Logo'
import { tierByGuests, formatPrice } from '../../lib/pricing'

const KEY_STORE = 'declic_admin_key'

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) }
  catch { return iso }
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(key) {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/events', { headers: { 'x-admin-key': key } })
      if (res.status === 401) { setError('Mot de passe incorrect.'); setAuthed(false); sessionStorage.removeItem(KEY_STORE); return }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setEvents(d.events); setAuthed(true)
      sessionStorage.setItem(KEY_STORE, key)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Connexion ----
  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Espace admin</h2>
        <p className="muted small" style={{ marginBottom: 18 }}>Réservé à l'équipe Déclic.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) load(keyInput.trim()) }}>
          <input type="password" placeholder="Mot de passe admin" value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)} autoFocus />
          {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
          <button className="btn btn-dark" type="submit" disabled={loading} style={{ marginTop: 14 }}>
            {loading ? 'Connexion…' : 'Entrer'}
          </button>
        </form>
      </div>
      <div className="spacer" />
    </main>
  )

  // ---- Tableau de bord ----
  const totals = (events || []).reduce((acc, e) => {
    acc.guests += e.guestCount
    acc.photos += e.photoCount
    acc.revenue += tierByGuests(e.maxGuests).priceCents
    return acc
  }, { guests: 0, photos: 0, revenue: 0 })

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <h1 className="h2" style={{ margin: '20px 0 18px' }}>Tableau de bord</h1>

        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <div className="stat"><div className="lbl">Événements</div><div className="val">{events.length}</div></div>
          <div className="stat"><div className="lbl">Invités</div><div className="val">{totals.guests}</div></div>
          <div className="stat"><div className="lbl">Photos</div><div className="val" style={{ color: 'var(--accent)' }}>{totals.photos}</div></div>
          <div className="stat"><div className="lbl">Revenu potentiel</div><div className="val" style={{ color: 'var(--ok)' }}>{formatPrice(totals.revenue)}</div><div className="note">selon paliers (paiement à venir)</div></div>
        </div>

        <h3 className="h3" style={{ margin: '28px 0 12px' }}>Tous les événements</h3>
        {events.length === 0 ? (
          <div className="notice">Aucun événement pour l'instant.</div>
        ) : (
          <div className="admin-table">
            <div className="admin-row admin-head">
              <span>Événement</span><span>Palier</span><span>Invités</span><span>Photos</span><span>Créé</span><span>Révélation</span><span>Statut</span>
            </div>
            {events.map((e) => (
              <a className="admin-row" key={e.id} href={`/event/${e.id}`} target="_blank" rel="noreferrer">
                <span><strong>{e.name}</strong>{e.hostNames ? <span className="muted"> · {e.hostNames}</span> : null}</span>
                <span className="mono">{e.maxGuests} · {formatPrice(tierByGuests(e.maxGuests).priceCents)}</span>
                <span>{e.guestCount}</span>
                <span style={{ color: 'var(--accent)' }}>{e.photoCount}</span>
                <span className="mono small">{fmtDate(e.createdAt)}</span>
                <span className="mono small">{fmtDate(e.revealAt)}</span>
                <span><span className={`badge ${e.revealed ? 'badge-live' : 'badge-wait'}`}><span className="dot" />{e.revealed ? 'Révélé' : 'En cours'}</span></span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
