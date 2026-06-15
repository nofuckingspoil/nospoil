'use client'

import { use, useEffect, useRef, useState } from 'react'
import { BRAND } from '../../../lib/brand'
import { getDeviceToken, saveGuest, getGuest } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, compressToBlob, fileToImage } from '../../../lib/camera'

const COVER_GRAD = 'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)'

function formatReveal(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    d: Math.floor(diff / 86400000),
    h: pad(Math.floor((diff % 86400000) / 3600000)),
    m: pad(Math.floor((diff % 3600000) / 60000)),
    s: pad(Math.floor((diff % 60000) / 1000)),
  }
}

export default function GuestCamera({ params }) {
  const { id } = use(params)

  const [phase, setPhase] = useState('loading') // loading | cover | name | camera | waiting | error
  const [meta, setMeta] = useState(null)
  const [name, setName] = useState('')
  const [guest, setGuest] = useState(null)       // { guestId, shotsTaken, shotsPerGuest }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [myPhotos, setMyPhotos] = useState([])

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // 1) Chargement : infos événement + reprise éventuelle de l'invité
  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setPhase('error'); return }
        setMeta(d)
        const saved = getGuest(id)
        if (saved?.name) { setName(saved.name); join(saved.name) }
        else setPhase('cover')
      })
      .catch(() => { setError('Connexion impossible.'); setPhase('error') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 2) Caméra live selon la phase + le sens choisi
  useEffect(() => {
    if (phase === 'camera' && liveCam) startCamera()
    return stopCamera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liveCam, facingMode])

  async function loadMyPhotos() {
    try {
      const res = await fetch('/api/my-photos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (Array.isArray(d.photos)) setMyPhotos(d.photos)
    } catch {}
  }

  async function join(displayName) {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken(), displayName }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      saveGuest(id, d.guestId, d.displayName)
      setGuest({ guestId: d.guestId, shotsTaken: d.shotsTaken, shotsPerGuest: d.shotsPerGuest })
      setLiveCam(supportsLiveCamera())
      loadMyPhotos()
      setPhase(d.shotsTaken >= d.shotsPerGuest ? 'waiting' : 'camera')
    } catch (err) {
      setError(err.message); setPhase('name')
    } finally { setBusy(false) }
  }

  async function startCamera() {
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
    } catch { setLiveCam(false) }
  }
  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }
  function flipCamera() { setFacingMode((m) => (m === 'environment' ? 'user' : 'environment')) }

  async function uploadBlob(blob) {
    const fd = new FormData()
    fd.append('file', blob, 'photo.jpg')
    fd.append('eventId', id); fd.append('guestId', guest.guestId); fd.append('deviceToken', getDeviceToken())
    const res = await fetch('/api/photo', { method: 'POST', body: fd })
    const d = await res.json()
    if (res.status === 409) { setGuest((g) => ({ ...g, shotsTaken: g.shotsPerGuest })); stopCamera(); setPhase('waiting'); return }
    if (!res.ok) throw new Error(d.error || "Échec de l'envoi.")
    setGuest((g) => ({ ...g, shotsTaken: d.shotsTaken }))
    loadMyPhotos()
    if (d.shotsTaken >= guest.shotsPerGuest) { stopCamera(); setTimeout(() => setPhase('waiting'), 700) }
  }

  async function snap() {
    if (busy || !videoRef.current) return
    setBusy(true); setError('')
    if (flashOn) { setFlash(true); setTimeout(() => setFlash(false), 420) }
    try { await uploadBlob(await compressToBlob(videoRef.current)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  async function onFilePicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    try { const img = await fileToImage(file); await uploadBlob(await compressToBlob(img)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  const remaining = guest ? guest.shotsPerGuest - guest.shotsTaken : 0
  const coupleLabel = meta?.hostNames || meta?.name || ''
  const cd = useCountdown(meta?.revealAt || Date.now())

  // ---------- Écrans ----------
  if (phase === 'loading') return <main className="center-screen"><p className="muted">Chargement…</p></main>
  if (phase === 'error') return <main className="screen screen-cream center"><div className="card">{error || 'Événement introuvable.'}</div></main>

  // COVER
  if (phase === 'cover') return (
    <main className="screen screen-cream">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span className="eyebrow-mute" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />{BRAND.name} · jetable
        </span>
        <span className="eyebrow-mute">{meta?.shotsPerGuest} poses</span>
      </div>

      <div className="cover" style={{ background: COVER_GRAD }}>
        <div className="gloss" />
        <div className="top">ÉVÉNEMENT PRIVÉ</div>
        <div className="name">{coupleLabel}</div>
      </div>

      <h3 className="h3" style={{ margin: '22px 0 8px' }}>{coupleLabel} vous invite{coupleLabel.includes('&') ? 'nt' : ''} dans l'objectif.</h3>
      <p className="lead small" style={{ marginBottom: 16 }}>
        Prenez <strong>{meta?.shotsPerGuest} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{meta && formatReveal(meta.revealAt)}</strong>.
      </p>

      <div className="spacer" />
      <button className="btn btn-accent" onClick={() => setPhase('name')}>
        Rejoindre l'appareil →
      </button>
      <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
    </main>
  )

  // NAME
  if (phase === 'name') return (
    <main className="screen screen-cream">
      <button onClick={() => setPhase('cover')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 30, padding: 0 }}>
        ‹ retour
      </button>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Étape 1 / 1</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Comment vous<br />appelez-vous ?</h3>
      <p className="lead small" style={{ marginBottom: 26 }}>Pour qu'on sache qui a pris quelle photo dans la galerie finale.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) join(name.trim()) }}>
        <input type="text" placeholder="Votre prénom" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
        <button className="btn btn-dark" type="submit" disabled={busy || !name.trim()} style={{ marginTop: 16 }}>
          {busy ? 'Un instant…' : "Ouvrir l'appareil →"}
        </button>
      </form>
    </main>
  )

  // WAITING
  if (phase === 'waiting') return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <div style={{ position: 'relative', width: 96, height: 96, margin: '18px 0 6px' }}>
        <div className="develop-icon"><div /></div>
        <div style={{ position: 'absolute', top: -6, right: -6, width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(236,91,51,.4)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <h3 className="h3" style={{ margin: '14px 0 8px' }}>C'est dans la boîte.</h3>
      <p className="lead small" style={{ marginBottom: 24, maxWidth: 290 }}>
        Vos <strong>{guest?.shotsTaken} clichés</strong> partent au développement avec ceux de tous les invités.
      </p>

      <div className="card-dark" style={{ width: '100%' }}>
        <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 14 }}>Révélation dans</div>
        <div className="countdown">
          <div className="cd-cell"><span className="num" style={{ color: 'var(--amber)' }}>{cd.d}</span><span className="lbl">JOURS</span></div>
          <span className="cd-sep">:</span>
          <div className="cd-cell"><span className="num">{cd.h}</span><span className="lbl">HEURES</span></div>
          <span className="cd-sep">:</span>
          <div className="cd-cell"><span className="num">{cd.m}</span><span className="lbl">MIN</span></div>
          <span className="cd-sep">:</span>
          <div className="cd-cell"><span className="num" style={{ color: 'var(--accent)' }}>{cd.s}</span><span className="lbl">SEC</span></div>
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,.6)', textAlign: 'center' }}>le {meta && formatReveal(meta.revealAt)}</div>
      </div>

      {myPhotos.length > 0 && (
        <div style={{ width: '100%', marginTop: 18 }}>
          <div className="eyebrow-mute" style={{ marginBottom: 10, textAlign: 'left' }}>Tes photos ({myPhotos.length})</div>
          <div className="cam-roll" style={{ minHeight: 60 }}>
            {myPhotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="roll-frame" style={{ width: 48, height: 60 }}>
                <img src={url} alt={`Ta photo ${i + 1}`} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <a className="btn btn-ghost" style={{ marginTop: 18 }} href={`/g/${id}`}>Voir la galerie</a>
      <div className="spacer" />
      <div className="footer-note">ON VOUS PRÉVIENDRA DÈS L'OUVERTURE</div>
    </main>
  )

  // CAMERA
  const frameNo = String(Math.min((guest?.shotsTaken || 0) + 1, guest?.shotsPerGuest || 0)).padStart(2, '0')
  return (
    <main className="screen screen-dark">
      <div className="cam-top">
        <div className="cam-chip"><span className="live" />{coupleLabel}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {liveCam && (
            <button className="cam-flipchip" onClick={flipCamera} disabled={busy} aria-label="Retourner la caméra">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
          <button className={`cam-flashchip ${flashOn ? 'on' : ''}`} onClick={() => setFlashOn((v) => !v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" /></svg>
            {flashOn ? 'FLASH' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="viewfinder">
        {liveCam
          ? <video ref={videoRef} playsInline muted autoPlay style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined} />
          : <div className="vf-anim" />}
        <div className="vignette" />
        <div className="vf-label">DÉCLIC&nbsp;400</div>
        <div className="vf-frame">№ {frameNo}</div>
        <div className="vf-corner tl" /><div className="vf-corner tr" /><div className="vf-corner bl" /><div className="vf-corner br" />
        <div className="vf-reticle"><div /></div>
        <div className="vf-counter">
          <span className="n">{String(remaining).padStart(2, '0')}</span>
          <span className="t">/ {guest?.shotsPerGuest} restants</span>
        </div>
        {flash && <div className="cam-flash" />}
      </div>

      {isInAppBrowser() && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)' }}>
          ⚠️ Pour la caméra en direct, ouvrez ce lien dans <strong>Safari</strong> ou <strong>Chrome</strong>.
        </div>
      )}
      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}

      <div className="cam-bottom">
        <div className="cam-roll">
          {myPhotos.length === 0
            ? <span className="roll-empty">pellicule vide…</span>
            : myPhotos.map((url, i) => (
                <div key={i} className="roll-frame"><img src={url} alt="" loading="lazy" /></div>
              ))}
        </div>
        {liveCam ? (
          <button className="shutter" onClick={snap} disabled={busy} aria-label="Déclencher"><span /></button>
        ) : (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} style={{ display: 'none' }} />
            <button className="shutter" disabled={busy} onClick={() => fileInputRef.current?.click()} aria-label="Prendre une photo"><span /></button>
          </>
        )}
        <button className="cam-finish" onClick={() => { stopCamera(); setPhase('waiting') }}>TER&shy;MINER</button>
      </div>
    </main>
  )
}
