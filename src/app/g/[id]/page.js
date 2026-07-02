'use client'

import { use, useEffect, useState } from 'react'
import JSZip from 'jszip'
import { BRAND } from '../../../lib/brand'
import { getOwnerToken } from '../../../lib/device'

const TEASER_GRADS = [
  'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)',
  'linear-gradient(160deg,#2B2540,#6E466C,#D08193)',
  'linear-gradient(150deg,#86C0C9,#D58FA6,#F4C152)',
  'linear-gradient(140deg,#3D5A6C,#86C0C9,#F7C26B)',
  'linear-gradient(160deg,#9B5A6E,#C25540,#E89A4B)',
  'linear-gradient(150deg,#6E466C,#A23D5C,#EE7A45)',
]

function formatReveal(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatTime(iso) {
  try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
// Date courte + heure, ex : « 12 juin · 14:32 »
function formatStamp(iso) {
  try {
    const d = new Date(iso)
    const jour = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    return `${jour} · ${formatTime(iso)}`
  } catch { return formatTime(iso) }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  }
}

function PreReveal({ data, onDone }) {
  const cd = useCountdown(data.revealAt)
  useEffect(() => { if (cd.done) onDone?.() }, [cd.done, onDone])
  return (
    <main className="screen screen-dark">
      <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>Événement · {data.hostNames || data.name}</div>
      <h3 className="h3" style={{ marginBottom: 22 }}>Développement en cours…</h3>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,.12)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)', animation: 'dc-spin 1.4s linear infinite' }} />
          <div style={{ width: 74, height: 74, borderRadius: 18, background: '#0d0f16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent)', background: 'radial-gradient(circle at 35% 30%,#3a3f52,#14161F)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 22, opacity: .55 }}>
        {TEASER_GRADS.map((g, i) => (
          <div key={i} style={{ aspectRatio: '1/1', borderRadius: 8, background: g, filter: 'blur(6px) brightness(.7)' }} />
        ))}
      </div>

      <div className="spacer" />
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16 }}>
          {cd.d}j {cd.h}h {cd.m}m {cd.s}s · le {formatReveal(data.revealAt)}
        </div>
        <div className="notice" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
          🎞️ Les souvenirs s'ouvriront pour tout le monde d'un coup, à l'heure dite.
        </div>
      </div>
    </main>
  )
}

export default function Gallery({ params }) {
  const { id } = use(params)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [retro, setRetro] = useState(true)
  const [zip, setZip] = useState(null) // null | {done, total}

  async function downloadAll(photos) {
    if (zip) return
    setZip({ done: 0, total: photos.length })
    try {
      const z = new JSZip()
      let i = 0
      for (const p of photos) {
        try {
          const blob = await fetch(p.url).then((r) => r.blob())
          const safe = (p.who || 'invite').normalize('NFD').replace(/[^a-zA-Z0-9]/g, '')
          z.file(`declic-${String(++i).padStart(3, '0')}-${safe}.jpg`, blob)
        } catch { i++ }
        setZip({ done: i, total: photos.length })
      }
      const out = await z.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(out)
      const a = document.createElement('a')
      a.href = url; a.download = 'declic-photos.zip'; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError('Téléchargement impossible.')
    } finally { setZip(null) }
  }

  function load() {
    fetch(`/api/gallery/${id}`, { headers: { 'x-owner-token': getOwnerToken(id) } })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError('Connexion impossible.'))
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Masquer / réafficher une photo (organisateur + admins)
  async function toggleHide(photoId, hidden) {
    setData((d) => ({ ...d, photos: d.photos.map((p) => (p.id === photoId ? { ...p, hidden } : p)) }))
    await fetch(`/api/events/${id}/photo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
      body: JSON.stringify({ photoId, hidden }),
    }).catch(() => {})
  }

  // Supprimer définitivement une photo (organisateur + admins)
  async function removePhoto(photoId) {
    if (!window.confirm('Supprimer définitivement cette photo ? Cette action est irréversible.')) return
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== photoId) }))
    await fetch(`/api/events/${id}/photo?photoId=${photoId}`, {
      method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
    }).catch(() => {})
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!data) return <main className="center-screen"><p className="muted">Chargement…</p></main>
  // Galerie cachée tant que non révélée — sauf aperçu organisateur
  if (!data.revealed && !data.ownerPreview) return <PreReveal data={data} onDone={load} />

  const photos = filter === 'all' ? data.photos : data.photos.filter((p) => p.guestId === filter)
  const hiddenCount = data.isOwner ? data.photos.filter((p) => p.hidden).length : 0
  const ovBtn = {
    width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: 'rgba(20,22,31,.82)', color: '#fff', fontSize: 15, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
  }

  return (
    <main className="screen screen-cream wide">
      {data.ownerPreview && (
        <div className="notice" style={{ marginBottom: 14, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
          👁️ <strong>Aperçu organisateur</strong> — vous voyez les photos en avant-première. Vos invités ne pourront les découvrir qu'à la révélation, le {formatReveal(data.revealAt)}.
        </div>
      )}
      {data.isOwner && (
        <div className="notice small" style={{ marginBottom: 14, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
          🛠️ <strong>Vous gérez cet album.</strong> Sur chaque photo : 🙈 pour la masquer aux invités (elle reste visible pour vous), 🗑️ pour la supprimer.
          {hiddenCount > 0 && <> {hiddenCount} photo{hiddenCount > 1 ? 's' : ''} actuellement masquée{hiddenCount > 1 ? 's' : ''}.</>}
        </div>
      )}
      <div className="gal-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div className="eyebrow" style={{ fontSize: 10.5 }}>Révélé · {data.photos.length} souvenirs</div>
          <button className={`retro-btn ${retro ? 'on' : ''}`} onClick={() => setRetro((v) => !v)}>
            RÉTRO {retro ? 'ON' : 'OFF'}
          </button>
        </div>
        <h3 className="h3" style={{ margin: '2px 0 12px' }}>Les souvenirs de {data.hostNames || data.name}</h3>
        {data.guests.length > 1 && (
          <div className="chips">
            <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tous · {data.photos.length}</button>
            {data.guests.map((g) => {
              const n = data.photos.filter((p) => p.guestId === g.id).length
              return <button key={g.id} className={`chip ${filter === g.id ? 'active' : ''}`} onClick={() => setFilter(g.id)}>{g.name} · {n}</button>
            })}
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="notice" style={{ marginTop: 16 }}>Aucune photo pour ce filtre.</div>
      ) : (
        <div className="masonry" style={{ marginTop: 8 }}>
          {photos.map((p, i) => {
            const rot = ((i * 37) % 7) - 3 // rotation déterministe -3°..+3°
            return (
              <a key={p.id || i} className={`polaroid ${retro ? 'retro' : ''}`} href={p.url} target="_blank" rel="noreferrer"
                style={{ transform: `rotate(${rot}deg)`, animationDelay: `${Math.min(i * 55, 600)}ms`, opacity: p.hidden ? 0.5 : 1 }}>
                <div className="media">
                  <img src={p.url} alt={`Photo de ${p.who}`} loading="lazy" />
                  {retro && <div className="tint" />}
                  {p.hidden && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(20,22,31,.85)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
                      🙈 MASQUÉE
                    </div>
                  )}
                  {data.isOwner && (
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button title={p.hidden ? 'Réafficher aux invités' : 'Masquer aux invités'}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHide(p.id, !p.hidden) }}
                        style={ovBtn}>{p.hidden ? '👁️' : '🙈'}</button>
                      <button title="Supprimer définitivement"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePhoto(p.id) }}
                        style={ovBtn}>🗑️</button>
                    </div>
                  )}
                </div>
                <div className="cap">
                  <span className="who">{p.who}</span>
                  <span className="time">{formatStamp(p.takenAt)}</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {data.photos.length > 0 && (
        <button className="btn btn-dark" style={{ marginTop: 20 }} disabled={!!zip}
          onClick={() => downloadAll(data.photos)}>
          {zip
            ? `Préparation… ${zip.done}/${zip.total}`
            : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Tout télécharger ({data.photos.length})
              </>
            )}
        </button>
      )}

      <div className="footer-note">Appuyez longuement sur une photo pour l'enregistrer une à une.</div>
    </main>
  )
}
