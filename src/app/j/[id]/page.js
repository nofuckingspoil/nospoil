'use client'

import { use, useEffect, useRef, useState } from 'react'
import InstallPrompt from '../../../components/InstallPrompt'
import { getDeviceToken, saveGuest, getGuest } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, compressToBlob, fileToImage, playShutter } from '../../../lib/camera'

const COVER_GRAD = 'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)'

function formatReveal(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
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
          <span className="n">{String(Math.max(0, remaining)).padStart(2, '0')}</span>
          <span className="t">/ {guest?.shotsPerGuest} restants</span>
        </div>
        {shutterFx && <div className="cam-shutter-fx" />}
        {flashFx && <div className="cam-flash" />}
      </div>

      {isInAppBrowser() && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)' }}>
          ⚠️ Pour la caméra en direct, ouvrez ce lien dans <strong>Safari</strong> ou <strong>Chrome</strong>.
        </div>
      )}

      {camBlocked && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.14)', textAlign: 'left' }}>
          <strong>📷 Caméra en direct bloquée</strong>
          <p style={{ margin: '6px 0 0', lineHeight: 1.5 }}>
            Pas de panique : tu peux quand même prendre tes photos avec le gros bouton — il ouvre l'appareil photo de ton téléphone. 🙂
          </p>
          <p style={{ margin: '10px 0 0', lineHeight: 1.5, fontSize: '.92em', opacity: .85 }}>
            Pour réactiver l'aperçu en direct :<br />
            • <strong>iPhone (Safari)</strong> : touche « <strong>aA</strong> » à gauche de l'adresse → <strong>Réglages du site</strong> → <strong>Caméra</strong> → <strong>Autoriser</strong>.<br />
            • <strong>Android (Chrome)</strong> : touche le <strong>cadenas 🔒</strong> près de l'adresse → <strong>Autorisations</strong> → <strong>Caméra</strong>.
          </p>
          <button
            onClick={retryCamera}
            style={{ marginTop: 12, background: '#fff', color: '#1a1410', border: 'none', borderRadius: 999, padding: '9px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Réessayer la caméra →
          </button>
        </div>
      )}
      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}

      <div className="cam-bottom">
        <div className="cam-roll">
          {roll.length === 0
            ? <span className="roll-empty">pellicule vide…</span>
            : roll.map((p, i) => (
                <button key={p.tempId || p.id || i} className={`roll-frame ${p.pending ? 'pending' : ''}`}
                  onClick={() => !p.pending && p.id && setViewer({ id: p.id, url: p.url })} aria-label="Voir la photo">
                  <img src={p.url} alt="" loading="lazy" />
                </button>
              ))}
        </div>
        {liveCam ? (
          <button className="shutter" onClick={snap} disabled={busy || full} aria-label="Déclencher"><span /></button>
        ) : (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} style={{ display: 'none' }} />
            <button className="shutter" disabled={busy || full} onClick={() => fileInputRef.current?.click()} aria-label="Prendre une photo"><span /></button>
          </>
        )}
        <div style={{ flex: '0 0 auto', width: 54, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', lineHeight: 1.3 }}>
            {guest?.shotsTaken || 0}<br />prises
          </div>
        </div>
      </div>

      <input ref={galleryInputRef} type="file" accept="image/*" onChange={onGalleryPicked} style={{ display: 'none' }} />
      <button className="cam-import" onClick={() => galleryInputRef.current?.click()} disabled={busy || full}>
        🖼️ Importer une photo de ma galerie
      </button>

      {full && <div className="cam-full-hint">Pellicule pleine — touche une photo pour la supprimer et en reprendre une.</div>}

      <a className="cam-reveal-link" href={`/g/${id}`}>
        🎞️ Révélation le {meta && formatReveal(meta.revealAt)} · voir
      </a>

      <InstallPrompt label="Garde l'appareil à portée de main" />

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
