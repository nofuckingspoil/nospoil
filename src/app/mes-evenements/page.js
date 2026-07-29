'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { getMyEvents, getOwnerToken, getAccountEmail, signOut } from '../../lib/device'

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

export default function MyEvents() {
  const [events, setEvents] = useState(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setEmail(getAccountEmail() || '')
    const ids = getMyEvents()
    if (!ids.length) { setEvents([]); return }
    Promise.all(ids.map((id) =>
      fetch(`/api/events/${id}`, { headers: { 'x-owner-token': getOwnerToken(id) } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d && !d.error ? d : null))
        .catch(() => null)
    )).then((list) => setEvents(list.filter(Boolean)))
  }, [])

  function disconnect() {
    signOut()
    setEmail(''); setEvents([])
  }

  return (
    <div className="site">
      <nav className="vnav">
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/create?tier=5" className="btn btn-dark">Nouvel événement</Link>
      </nav>

      <div className="site-inner" style={{ maxWidth: 560, paddingBottom: 60 }}>
        <h1 className="h2" style={{ margin: '20px 0 6px' }}>Mes événements</h1>
        {email ? (
          <p className="muted small" style={{ marginBottom: 22 }}>
            Connecté avec <strong>{email}</strong> ·{' '}
            <button onClick={disconnect}
              style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'var(--accent-deep)', cursor: 'pointer' }}>
              se déconnecter
            </button>
          </p>
        ) : (
          <p className="muted small" style={{ marginBottom: 22 }}>Les événements accessibles depuis cet appareil.</p>
        )}

        {events === null && <p className="muted">Chargement…</p>}

        {events && events.length === 0 && (
          <div className="card center" style={{ padding: 30 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎞️</div>
            <h3 className="h3" style={{ marginBottom: 8 }}>Aucun événement ici</h3>
            <p className="muted small" style={{ marginBottom: 18 }}>
              Cet appareil n'a accès à aucun événement. Connectez-vous avec votre mail pour retrouver les vôtres.
            </p>
            <Link href="/connexion" className="btn btn-accent">Me connecter par mail →</Link>
            <Link href="/create?tier=5" className="btn btn-ghost" style={{ marginTop: 10 }}>Créer un événement</Link>
          </div>
        )}

        {events && events.map((e) => (
          <Link key={e.id} href={`/event/${e.id}`} className="ev-card">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{e.name}</div>
              <div className="ev-meta">Révélation {fmtDate(e.revealAt)} · {e.revealed ? 'révélé' : 'en cours'}</div>
            </div>
            <div className="ev-counts">
              <div className="n">{e.photoCount ?? 0}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text3)' }}>PHOTOS</div>
            </div>
          </Link>
        ))}

        {events && events.length > 0 && (
          <p className="muted small center" style={{ marginTop: 24 }}>
            Il manque un événement ?{' '}
            <Link href="/connexion" style={{ color: 'var(--accent-deep)' }}>Se connecter par mail</Link>
          </p>
        )}
      </div>
    </div>
  )
}
