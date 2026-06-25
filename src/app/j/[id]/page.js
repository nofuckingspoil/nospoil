'use client'

import { use, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import InstallPrompt from '../../../components/InstallPrompt'
import { getDeviceToken, saveGuest, getGuest } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, compressToBlob, fileToImage, playShutter } from '../../../lib/camera'

const COVER_GRAD = 'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)'

function formatReveal(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

// Compte à rebours court avant la révélation : « dans 1 j 23 h », « dans 2 h 05 min »…
function countdownToReveal(iso, now) {
  const diff = new Date(iso).getTime() - now
  if (isNaN(diff)) return ''
  if (diff <= 0) return 'révélé ✨'
  const mins = Math.floor(diff / 60000)
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d > 0) return `révélation dans ${d} j ${h} h`
  if (h > 0) return `révélation dans ${h} h ${String(m).padStart(2, '0')} min`
  return `révélation dans ${m} min`
}

let _tmp = 0

export default function GuestCamera({ params }) {
  const { id } = use(params)

  const [phase, setPhase] = useState('loading') // loading | cover | name | camera | error
  const [meta, setMeta] = useState(null)
  const [name, setName] = useState('')
  const [guest, setGuest] = useState(null)       // { guestId, shotsTaken, shotsPerGuest }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flashFx, setFlashFx] = useState(false)
  const [shutterFx, setShutterFx] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [liveCam, setLiveCam] = useState(false)
  const [camBlocked, setCamBlocked] = useState(false)
  const [facingMode, setFacingMode] = useState('environment')
  const [myPhotos, setMyPhotos] = useState([])   // [{id, url}] confirmées (serveur)
  const [pending, setPending] = useState([])     // [{tempId, url}] en cours d'envoi
  const [viewer, setViewer] = useState(null)     // {id, url} photo affichée en grand
  const [deleting, setDeleting] = useState(false)
  const [showQR, setShowQR] = useState(false)    // pop-up "inviter un proche"
  const [qrUrl, setQrUrl] = useState('')
  const [qrCopied, setQrCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())  // pour le compte à rebours

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

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

  useEffect(() => {
    if (phase === 'camera' && liveCam) startCamera()
    return stopCamera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liveCam, facingMode])

  // Génère le QR code d'invitation à l'ouverture de la pop-up
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/j/${id}` : ''
  useEffect(() => {
    if (!showQR || qrUrl || !joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1, color: { dark: '#221A12', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [showQR, qrUrl, joinUrl])

  function copyJoinLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setQrCopied(true); setTimeout(() => setQrCopied(false), 1800) })
  }

  // Rafraîchit le compte à rebours toutes les 30 s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  // Charge mes photos confirmées + synchronise le compteur depuis le serveur
  async function loadMyPhotos() {
    try {
      const res = await fetch('/api/my-photos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (Array.isArray(d.photos)) setMyPhotos(d.photos)
      if (typeof d.shotsTaken === 'number') setGuest((g) => (g ? { ...g, shotsTaken: d.shotsTaken } : g))
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
      setPhase('camera')
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
      setCamBlocked(false)
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
    } catch (err) {
      setLiveCam(false)
      // Accès refusé (par réflexe ?) : on le signale pour proposer de réautoriser
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) setCamBlocked(true)
    }
  }
  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }
  function flipCamera() { setFacingMode((m) => (m === 'environment' ? 'user' : 'environment')) }
  // Nouvelle tentative d'accès caméra (après que l'invité a réautorisé dans son navigateur)
  function retryCamera() {
    setCamBlocked(false)
    if (liveCam) startCamera()
    else setLiveCam(true)
  }

  // Capture optimiste : on affiche tout de suite, on envoie en arrière-plan.
  async function capture(blob) {
    const tempId = `tmp-${++_tmp}`
    const url = URL.createObjectURL(blob)
    setPending((p) => [{ tempId, url }, ...p])
    setGuest((g) => (g ? { ...g, shotsTaken: Math.min(g.shotsPerGuest, g.shotsTaken + 1) } : g))
    try {
      const fd = new FormData()
      fd.append('file', blob, 'photo.jpg')
      fd.append('eventId', id); fd.append('guestId', guest.guestId); fd.append('deviceToken', getDeviceToken())
      const res = await fetch('/api/photo', { method: 'POST', body: fd })
      const d = await res.json()
      if (res.status === 409) { setError('Pellicule pleine — supprime une photo pour en reprendre une.') }
      else if (!res.ok) { throw new Error(d.error || "Échec de l'envoi.") }
    } catch (err) {
      setError(err.message || 'Erreur.')
    } finally {
      setPending((p) => p.filter((x) => x.tempId !== tempId))
      URL.revokeObjectURL(url)
      loadMyPhotos() // synchronise compteur + photos depuis le serveur
    }
  }

  function fireShutterFeedback() {
    playShutter()
    setShutterFx(true); setTimeout(() => setShutterFx(false), 240)
    if (flashOn) { setFlashFx(true); setTimeout(() => setFlashFx(false), 420) }
  }

  async function snap() {
    if (busy || !videoRef.current) return
    const remaining = guest.shotsPerGuest - guest.shotsTaken
    if (remaining <= 0) { setError('Pellicule pleine — supprime une photo pour en reprendre une.'); return }
    setBusy(true); setError('')
    fireShutterFeedback()
    try { await capture(await compressToBlob(videoRef.current)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  async function onFilePicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    fireShutterFeedback()
    try { const img = await fileToImage(file); await capture(await compressToBlob(img)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  // Import depuis la galerie (compte dans le solde, comme une photo prise)
  async function onGalleryPicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (full) { setError('Pellicule pleine — supprime une photo pour en importer une.'); return }
    setBusy(true); setError('')
    try { const img = await fileToImage(file); await capture(await compressToBlob(img)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  async function removePhoto() {
    if (!viewer || deleting) return
    setDeleting(true); setError('')
    try {
      const res = await fetch('/api/photo/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: viewer.id, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      setViewer(null)
      await loadMyPhotos()
    } catch (err) { setError(err.message) } finally { setDeleting(false) }
  }

  const remaining = guest ? guest.shotsPerGuest - guest.shotsTaken : 0
  const full = remaining <= 0
  const coupleLabel = meta?.hostNames || meta?.name || ''

  // ---------- Écrans ----------
  if (phase === 'loading') return <main className="center-screen"><p className="muted">Chargement…</p></main>
  if (phase === 'error') return <main className="screen screen-cream center"><div className="card">{error || 'Événement introuvable.'}</div></main>

  if (phase === 'cover') return (
    <main className="screen screen-cream">
      <div className="cover" style={meta?.coverUrl ? undefined : { background: COVER_GRAD }}>
        {meta?.coverUrl ? (
          <img src={meta.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div className="gloss" />
            <div className="top">ÉVÉNEMENT PRIVÉ</div>
          </>
        )}
      </div>
      <h3 className="h3" style={{ margin: '22px 0 8px' }}>{coupleLabel} vous invite{coupleLabel.includes('&') ? 'nt' : ''} dans l'objectif.</h3>
      <p className="lead small" style={{ marginBottom: 16 }}>
        Prenez <strong>{meta?.shotsPerGuest} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{meta && formatReveal(meta.revealAt)}</strong>.
      </p>
      <div className="spacer" />
      <button className="btn btn-accent" onClick={() => setPhase('name')}>Participer à l'album collectif →</button>
      <InstallPrompt label="Garde l'appareil à portée de main" />
      <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
    </main>
  )

  if (phase === 'name') return (
    <main className="screen screen-cream">
      <button onClick={() => setPhase('cover')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 30, padding: 0 }}>‹ retour</button>
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

  // CAMERA
  const roll = [...pending.map((p) => ({ ...p, pending: true })), ...myPhotos]
  const frameNo = String(Math.min((guest?.shotsTaken || 0) + (full ? 0 : 1), guest?.shotsPerGuest || 0)).padStart(2, '0')

  return (
    <main className="screen screen-dark force-portrait">
      <div className="cam-top">
        <button className="cam-iconbtn" onClick={() => setPhase('cover')} aria-label="Retour">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="cam-titlebar">
          <div className="nm">{coupleLabel}</div>
          <div className="sub">{countdownToReveal(meta?.revealAt, now)}</div>
        </div>
        <button className="cam-iconbtn" onClick={() => setShowQR(true)} aria-label="Inviter un proche (QR code)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM21 14v7M14 21h7" />
          </svg>
        </button>
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
          <span className="n">{String(Math.max(0, remaining)).padStart(2, '0')}</span>
          <span className="t">/ {guest?.shotsPerGuest} restants</span>
        </div>
        {shutterFx && <div className="cam-shutter-fx" />}
        {flashFx && <div className="cam-flash" />}

        {camBlocked && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: 24, background: 'rgba(10,8,6,.8)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l22 22" /><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m4-3h4l2 3h4a2 2 0 012 2v9.34m-7.72-2.06a4 4 0 11-5.56-5.56" />
            </svg>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, maxWidth: 250, lineHeight: 1.4 }}>Vous n'avez pas autorisé votre caméra</p>
            <button onClick={retryCamera} style={{ background: '#fff', color: '#1a1410', border: 'none', borderRadius: 999, padding: '11px 22px', fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
              Autoriser ma caméra
            </button>
          </div>
        )}
      </div>

      {isInAppBrowser() && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)' }}>
          ⚠️ Pour la caméra en direct, ouvrez ce lien dans <strong>Safari</strong> ou <strong>Chrome</strong>.
        </div>
      )}

      {camBlocked && (
        <details style={{ marginTop: 10, color: 'rgba(255,255,255,.6)', fontSize: 12.5 }}>
          <summary style={{ cursor: 'pointer' }}>Toujours bloquée après avoir cliqué ?</summary>
          <div style={{ marginTop: 8, lineHeight: 1.6 }}>
            • <strong>iPhone (Safari)</strong> : touche « aA » à gauche de l'adresse → Réglages du site → Caméra → Autoriser.<br />
            • <strong>Android (Chrome)</strong> : touche le cadenas 🔒 → Autorisations → Caméra.<br />
            <span style={{ opacity: .8 }}>En attendant, le gros bouton ouvre l'appareil photo de ton téléphone.</span>
          </div>
        </details>
      )}
      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}

      {/* Rangée de contrôles : flash (gauche) · retourner caméra (droite) */}
      <div className="cam-controls">
        <button className={`cam-flashchip ${flashOn ? 'on' : ''}`} onClick={() => setFlashOn((v) => !v)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" /></svg>
          {flashOn ? 'FLASH' : 'OFF'}
        </button>
        {liveCam && (
          <button className="cam-flipchip" onClick={flipCamera} disabled={busy} aria-label="Retourner la caméra">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>

      {/* Bas : pile de photos (gauche) · déclencheur (centre) · import galerie (droite) */}
      <div className="cam-bottom">
        {roll.length === 0 ? (
          <div className="cam-pile"><span className="pf-empty" /></div>
        ) : (
          <a className="cam-pile" href={`/g/${id}`} aria-label="Voir mes photos">
            {roll.slice(0, 3).map((p, i) => (
              <span key={p.tempId || p.id || i} className="pf" style={{ zIndex: 3 - i, transform: `rotate(${[-6, 7, 14][i] || 0}deg)` }}>
                <img src={p.url} alt="" loading="lazy" />
              </span>
            ))}
            {roll.length > 1 && <span className="pf-count">{Math.min(roll.length, guest?.shotsPerGuest || roll.length)}</span>}
          </a>
        )}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {liveCam ? (
            <button className="shutter" onClick={snap} disabled={busy || full} aria-label="Déclencher"><span /></button>
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} style={{ display: 'none' }} />
              <button className="shutter" disabled={busy || full} onClick={() => fileInputRef.current?.click()} aria-label="Prendre une photo"><span /></button>
            </>
          )}
        </div>
        <div className="cam-side">
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={onGalleryPicked} style={{ display: 'none' }} />
          <button className="cam-gallerybtn" onClick={() => galleryInputRef.current?.click()} disabled={busy || full} aria-label="Importer une photo de ma galerie">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.6" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </button>
          <span className="cam-side-label">Galerie</span>
        </div>
      </div>

      {full && <div className="cam-full-hint">Pellicule pleine — tu as utilisé toutes tes poses.</div>}

      {/* Pop-up "Inviter un proche" */}
      {showQR && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setShowQR(false) }} style={{ background: 'rgba(10,8,6,.7)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <button onClick={() => setShowQR(false)} aria-label="Fermer"
              style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,26,18,.08)', border: 'none', color: 'var(--ink)', fontSize: 19, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 4 }}>Inviter un proche</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 18px' }}>Scannez pour rejoindre</h3>
            <div style={{ background: '#FCF8F0', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'center' }}>
              {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" style={{ display: 'block', width: '100%', maxWidth: 210, height: 'auto' }} />
                     : <div style={{ width: 210, height: 210 }} />}
            </div>
            <div style={{ background: 'rgba(34,26,18,.05)', borderRadius: 12, padding: '11px 13px', margin: '14px 0 12px', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text2)', wordBreak: 'break-all', textAlign: 'center' }}>{joinUrl}</div>
            <button className="btn btn-accent" style={{ width: '100%' }} onClick={copyJoinLink}>
              {qrCopied ? '✓ Lien copié' : 'Copier le lien'}
            </button>
          </div>
        </div>
      )}

      {/* Visionneuse photo */}
      {viewer && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setViewer(null) }}>
          <button className="viewer-close" onClick={() => setViewer(null)} aria-label="Fermer">×</button>
          <img src={viewer.url} alt="Ta photo" />
          {error && <div className="err" style={{ marginTop: 14, maxWidth: 360, width: '100%' }}>{error}</div>}
          <div className="viewer-actions">
            <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => setViewer(null)}>Garder</button>
            <button className="btn btn-danger" onClick={removePhoto} disabled={deleting}>{deleting ? 'Suppression…' : 'Supprimer'}</button>
          </div>
        </div>
      )}
    </main>
  )
}
