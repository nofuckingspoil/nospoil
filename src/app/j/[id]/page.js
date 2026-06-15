'use client'

import { use, useEffect, useRef, useState } from 'react'
import { BRAND } from '../../../lib/brand'
import { getDeviceToken, saveGuest, getGuest } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, compressToBlob, fileToImage } from '../../../lib/camera'

function formatReveal(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function GuestCamera({ params }) {
  const { id } = use(params)

  const [phase, setPhase] = useState('loading') // loading | name | camera | full | error
  const [meta, setMeta] = useState(null)         // infos événement
  const [name, setName] = useState('')
  const [guest, setGuest] = useState(null)       // { guestId, shotsTaken, shotsPerGuest }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [facingMode, setFacingMode] = useState('environment') // environment = arrière, user = selfie
  const [myPhotos, setMyPhotos] = useState([])               // aperçu de mes propres photos

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // 1) Chargement initial : infos événement + reprise éventuelle de l'invité
  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setPhase('error'); return }
        setMeta(d)
        const saved = getGuest(id)
        if (saved?.name) { setName(saved.name); join(saved.name) }
        else setPhase('name')
      })
      .catch(() => { setError('Connexion impossible.'); setPhase('error') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 2) Démarre / arrête la caméra live selon la phase + le sens choisi
  useEffect(() => {
    if (phase === 'camera' && liveCam) startCamera()
    return stopCamera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liveCam, facingMode])

  // Charge mes propres photos déjà prises (depuis le serveur)
  async function loadMyPhotos() {
    try {
      const res = await fetch('/api/my-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken(), displayName }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      saveGuest(id, d.guestId, d.displayName)
      setGuest({ guestId: d.guestId, shotsTaken: d.shotsTaken, shotsPerGuest: d.shotsPerGuest })
      setLiveCam(supportsLiveCamera())
      loadMyPhotos()
      setPhase(d.shotsTaken >= d.shotsPerGuest ? 'full' : 'camera')
    } catch (err) {
      setError(err.message); setPhase('name')
    } finally { setBusy(false) }
  }

  async function startCamera() {
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
    } catch {
      // Permission refusée ou indisponible → on bascule sur l'appareil photo système
      setLiveCam(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }

  // Retourne la caméra (avant <-> arrière)
  function flipCamera() {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
  }

  async function uploadBlob(blob) {
    const fd = new FormData()
    fd.append('file', blob, 'photo.jpg')
    fd.append('eventId', id)
    fd.append('guestId', guest.guestId)
    fd.append('deviceToken', getDeviceToken())
    const res = await fetch('/api/photo', { method: 'POST', body: fd })
    const d = await res.json()
    if (res.status === 409) { setGuest((g) => ({ ...g, shotsTaken: g.shotsPerGuest })); setPhase('full'); return }
    if (!res.ok) throw new Error(d.error || "Échec de l'envoi.")
    const newCount = d.shotsTaken
    setGuest((g) => ({ ...g, shotsTaken: newCount }))
    loadMyPhotos() // rafraîchit l'aperçu de mes photos
    if (newCount >= guest.shotsPerGuest) { stopCamera(); setPhase('full') }
  }

  // Capture depuis la caméra live
  async function snap() {
    if (busy || !videoRef.current) return
    setBusy(true); setError('')
    setFlash(true); setTimeout(() => setFlash(false), 350)
    try {
      const blob = await compressToBlob(videoRef.current)
      await uploadBlob(blob)
    } catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  // Capture depuis l'appareil photo système (fallback)
  async function onFilePicked(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    try {
      const img = await fileToImage(file)
      const blob = await compressToBlob(img)
      await uploadBlob(blob)
    } catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  const remaining = guest ? guest.shotsPerGuest - guest.shotsTaken : 0

  // ---------- Écrans ----------

  if (phase === 'loading') return <main className="center-screen"><p className="muted">Chargement…</p></main>

  if (phase === 'error') return (
    <main className="wrap center"><div className="card">{error || 'Événement introuvable.'}</div></main>
  )

  if (phase === 'name') return (
    <main className="wrap center">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>
      <div className="spacer" />
      <div className="film-strip">{Array.from({ length: 7 }).map((_, i) => <span key={i} />)}</div>
      <div className="eyebrow" style={{ marginTop: 16 }}>{meta?.hostNames || meta?.name}</div>
      <h1 style={{ fontSize: 28, marginTop: 10 }}>{meta?.name}</h1>
      <p className="lead" style={{ marginTop: 14 }}>
        Tu as <strong>{meta?.shotsPerGuest} photos</strong> pour immortaliser ce moment.
        Elles seront révélées à tout le monde le jour J.
      </p>
      <form className="card" style={{ marginTop: 24, width: '100%' }}
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) join(name.trim()) }}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Ton prénom</label>
          <input type="text" placeholder="Ex : Camille" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
          <div className="hint">Pour qu'on sache qui a pris quelle photo.</div>
        </div>
        {error && <div className="err">{error}</div>}
        <button className="btn btn-amber" type="submit" disabled={busy || !name.trim()}>
          {busy ? 'Un instant…' : "C'est parti 📸"}
        </button>
      </form>
      <div className="spacer" />
    </main>
  )

  if (phase === 'full') return (
    <main className="wrap center">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>
      <div className="spacer" />
      <div style={{ fontSize: 54 }}>🎞️</div>
      <h1 style={{ fontSize: 28, marginTop: 12 }}>Pellicule terminée !</h1>
      <p className="lead" style={{ marginTop: 14 }}>
        Tu as utilisé tes {guest?.shotsPerGuest} clichés. Merci {guest && getGuest(id)?.name ? getGuest(id).name : ''} !
      </p>
      {myPhotos.length > 0 && (
        <div className="myphotos" style={{ width: '100%' }}>
          <div className="myphotos-title">Tes photos ({myPhotos.length})</div>
          <div className="myphotos-row">
            {myPhotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="myphoto">
                <img src={url} alt={`Ta photo ${i + 1}`} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="notice" style={{ marginTop: 22 }}>
        📅 Les photos de tout le monde seront révélées le<br />
        <strong style={{ color: 'var(--ink)' }}>{meta && formatReveal(meta.revealAt)}</strong>
      </div>
      <a className="btn btn-ghost" style={{ marginTop: 18 }} href={`/g/${id}`}>Voir la galerie</a>
      <div className="spacer" />
      <p className="footer-note">Reviens ce jour-là, le lien sera le même.</p>
    </main>
  )

  // phase === 'camera'
  return (
    <main className="wrap">
      <div className="cam-stage">
        <div className="cam-counter">
          {remaining} {remaining > 1 ? 'photos restantes' : 'photo restante'}
        </div>
        {liveCam
          ? <video ref={videoRef} playsInline muted autoPlay
              style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', textAlign: 'center', padding: 24 }}>
              <span className="small">Appuie sur le bouton pour ouvrir l'appareil photo.</span>
            </div>}
        {liveCam && (
          <button className="cam-flip" onClick={flipCamera} disabled={busy} aria-label="Retourner la caméra">
            🔄
          </button>
        )}
        <div className={`cam-flash ${flash ? 'fire' : ''}`} />
      </div>

      {isInAppBrowser() && (
        <div className="notice" style={{ marginTop: 14 }}>
          ⚠️ Pour une meilleure expérience, ouvre ce lien dans <strong>Safari</strong> ou <strong>Chrome</strong>.
        </div>
      )}

      {error && <div className="err">{error}</div>}

      {liveCam ? (
        <button className="shutter" onClick={snap} disabled={busy} aria-label="Prendre la photo" />
      ) : (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
            onChange={onFilePicked} style={{ display: 'none' }} />
          <button className="btn btn-amber" style={{ marginTop: 18 }} disabled={busy}
            onClick={() => fileInputRef.current?.click()}>
            {busy ? 'Envoi…' : '📸 Prendre une photo'}
          </button>
        </>
      )}

      {myPhotos.length > 0 && (
        <div className="myphotos">
          <div className="myphotos-title">Tes photos ({myPhotos.length})</div>
          <div className="myphotos-row">
            {myPhotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="myphoto">
                <img src={url} alt={`Ta photo ${i + 1}`} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="footer-note">
        {busy ? 'Envoi en cours…' : `Tes photos seront révélées à tous le ${meta && formatReveal(meta.revealAt)}.`}
      </p>
    </main>
  )
}
