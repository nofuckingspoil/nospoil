'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getDeviceToken, saveGuest, getGuest, getOwnerToken } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, compressToBlob, decodeImage, prepareUpload, playShutter } from '../../../lib/camera'

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

// Décompose le temps restant en jours / heures / minutes / secondes
function breakdownToReveal(iso, now) {
  let diff = new Date(iso).getTime() - now
  if (isNaN(diff) || diff < 0) diff = 0
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  }
}

let _tmp = 0

export default function GuestCamera({ params }) {
  const { id } = use(params)

  const [phase, setPhase] = useState('loading') // loading | cover | name | camera | error
  const [meta, setMeta] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mailCheck, setMailCheck] = useState(null) // {status, suggestion?, reason?}
  const [checkingMail, setCheckingMail] = useState(false)
  const [guest, setGuest] = useState(null)       // { guestId, shotsTaken, shotsPerGuest }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flashFx, setFlashFx] = useState(false)
  const [shutterFx, setShutterFx] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [screenFlash, setScreenFlash] = useState(false) // flash écran (selfie) pendant la capture
  const [liveCam, setLiveCam] = useState(false)
  const [camBlocked, setCamBlocked] = useState(false)
  const [inApp, setInApp] = useState(false)      // page ouverte depuis une messagerie
  const [facingMode, setFacingMode] = useState('environment')
  const [myPhotos, setMyPhotos] = useState([])   // [{id, url}] confirmées (serveur)
  const [pending, setPending] = useState([])     // [{tempId, url}] en cours d'envoi
  const [viewer, setViewer] = useState(null)     // {id, url} photo affichée en grand
  const [deleting, setDeleting] = useState(false)
  const [showQR, setShowQR] = useState(false)    // pop-up "inviter un proche"
  const [showSaveTip, setShowSaveTip] = useState(false) // rappel "garde ton lien pour revenir" (une seule fois)
  const [showAlbum, setShowAlbum] = useState(false) // écran album (mes photos)
  const [downloading, setDownloading] = useState(false)
  const [bonusUsed, setBonusUsed] = useState(false) // +5 photos déjà réclamées ?
  const [qrUrl, setQrUrl] = useState('')
  const [qrCopied, setQrCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())  // pour le compte à rebours

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  useEffect(() => {
    setInApp(isInAppBrowser()) // au montage seulement : le serveur ne connaît pas le navigateur
    // Le jeton part avec la requête : l'organisateur qui prend ses propres photos
    // n'a pas à se présenter comme un inconnu. Sans jeton valable, le serveur ne
    // renvoie rien de plus qu'à n'importe quel invité.
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': getOwnerToken(id) } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setPhase('error'); return }
        setMeta(d)
        // Album ouvert : la pellicule est finie, et les photos sont là. On y va
        // directement — un écran intermédiaire n'aurait annoncé que ce que la
        // page suivante montre, animation d'ouverture comprise. `replace` pour
        // que le retour du navigateur ne ramène pas ici.
        if (d.revealed) { window.location.replace(`/g/${id}`); return }
        const saved = getGuest(id)
        if (saved?.name) { setName(saved.name); if (saved.email) setEmail(saved.email); join(saved.name, saved.email) }
        else {
          // Rien de saisi encore : on reprend ce que le serveur sait de cet
          // événement précis. Surtout pas l'adresse mémorisée par le navigateur :
          // elle vient d'une autre connexion, et ce champ est facultatif — le
          // pré-remplir changerait un consentement donné en consentement à retirer.
          if (d.ownerName) setName(String(d.ownerName).trim().split(/\s+/)[0])
          if (d.ownerEmail) setEmail(d.ownerEmail)
          setPhase('cover')
        }
      })
      .catch(() => { setError('Connexion impossible.'); setPhase('error') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (phase === 'camera' && liveCam) startCamera()
    return stopCamera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liveCam, facingMode])

  // À la 1re ouverture de la caméra (par appareil + événement), on rappelle à l'invité
  // de garder son lien pour revenir finir ses photos. Affiché une seule fois.
  useEffect(() => {
    if (phase !== 'camera') return
    try {
      const key = `pellicule_savetip_${id}`
      if (!localStorage.getItem(key)) {
        setShowSaveTip(true)
        localStorage.setItem(key, '1')
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, id])

  // Génère le QR code d'invitation à l'ouverture de la pop-up
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/j/${id}` : ''
  // Fichier agenda : un tap ouvre le Calendrier du téléphone, le lien y reste au chaud
  const agendaUrl = `/api/events/${id}/agenda.ics`
  useEffect(() => {
    if (!showQR || qrUrl || !joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1, color: { dark: '#221A12', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [showQR, qrUrl, joinUrl])

  function copyJoinLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setQrCopied(true); setTimeout(() => setQrCopied(false), 1800) })
  }

  // Ouvre l'appli Messages du téléphone, pré-remplie avec le lien : l'invité se l'envoie
  // à lui-même (gratuit) pour revenir prendre ses photos restantes plus tard.
  // Le destinataire est laissé vide : il choisit son propre numéro dans l'appli.
  function smsMyLink() {
    const body = `Mon lien pour reprendre mes photos 📸 : ${joinUrl}`
    window.location.href = `sms:?&body=${encodeURIComponent(body)}`
  }

  // Partage natif (Notes, WhatsApp, Mail…) ; repli sur copie si indisponible.
  async function shareMyLink() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: meta?.name || 'Time to Flash', text: 'Mon lien pour reprendre mes photos 📸', url: joinUrl }); return } catch {}
    }
    copyJoinLink()
  }

  // Télécharge mes propres photos en .zip
  async function downloadMine() {
    if (downloading || !myPhotos.length) return
    setDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const z = new JSZip()
      let i = 0
      for (const p of myPhotos) {
        try { const blob = await fetch(p.url).then((r) => r.blob()); z.file(`timetoflash-${String(++i).padStart(2, '0')}.jpg`, blob) } catch { i++ }
      }
      const out = await z.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(out)
      const a = document.createElement('a'); a.href = url; a.download = 'mes-photos-timetoflash.zip'; a.click()
      URL.revokeObjectURL(url)
    } catch { setError('Téléchargement impossible.') } finally { setDownloading(false) }
  }

  // Rafraîchit le compte à rebours chaque seconde (décompte actif)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Met à jour les compteurs (photos / participants) en temps réel
  // tant que l'écran album est ouvert : un appel immédiat, puis toutes les 4 s.
  useEffect(() => {
    if (!showAlbum) return
    let alive = true
    const refresh = async () => {
      try {
        const d = await fetch(`/api/events/${id}/stats`).then((r) => r.json())
        if (!alive || !d) return
        setMeta((m) => (m ? {
          ...m,
          guestCount: typeof d.guestCount === 'number' ? d.guestCount : m.guestCount,
          photoCount: typeof d.photoCount === 'number' ? d.photoCount : m.photoCount,
        } : m))
      } catch {}
    }
    refresh()
    const t = setInterval(refresh, 4000)
    return () => { alive = false; clearInterval(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAlbum, id])

  // Charge mes photos confirmées + synchronise le compteur depuis le serveur
  async function loadMyPhotos() {
    try {
      const res = await fetch('/api/my-photos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (Array.isArray(d.photos)) setMyPhotos(d.photos)
      setGuest((g) => (g ? {
        ...g,
        shotsTaken: typeof d.shotsTaken === 'number' ? d.shotsTaken : g.shotsTaken,
        shotsPerGuest: typeof d.shotsPerGuest === 'number' ? d.shotsPerGuest : g.shotsPerGuest,
      } : g))
      if (typeof d.bonusUsed === 'boolean') setBonusUsed(d.bonusUsed)
    } catch {}
  }

  // Vérifie l'adresse quand l'invité quitte le champ : la correction arrive
  // avant qu'il ait à revenir dessus. Ne bloque jamais : l'adresse est facultative.
  async function verifierMail(value) {
    const v = (value || '').trim()
    if (!v) { setMailCheck(null); return }
    setCheckingMail(true)
    try {
      const r = await fetch('/api/email/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
      })
      setMailCheck(await r.json())
    } catch { setMailCheck(null) } finally { setCheckingMail(false) }
  }

  function accepterSuggestion() {
    if (!mailCheck?.suggestion) return
    setEmail(mailCheck.suggestion)
    verifierMail(mailCheck.suggestion)
  }

  async function join(displayName, emailArg) {
    setBusy(true); setError('')
    // emailArg : utilisé à la reconnexion (adresse mémorisée) ; sinon, le champ du formulaire.
    const emailVal = ((emailArg !== undefined ? emailArg : email) || '').trim().toLowerCase()
    try {
      const res = await fetch('/api/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken(), displayName, email: emailVal }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      saveGuest(id, d.guestId, d.displayName, d.email ?? emailVal)
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

  // Active/désactive la torche (vrai flash) si le téléphone le permet (surtout Android).
  async function applyTorch(on) {
    try {
      const track = streamRef.current?.getVideoTracks?.()[0]
      if (!track || !track.getCapabilities) return false
      const caps = track.getCapabilities()
      if (!caps || !caps.torch) return false
      await track.applyConstraints({ advanced: [{ torch: on }] })
      return true
    } catch { return false }
  }
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
      // Mini-version légère (~640px) pour l'affichage de l'album — économise la data
      let thumbBlob = null
      try {
        const im = await decodeImage(blob)
        thumbBlob = await compressToBlob(im, { maxSize: 640, quality: 0.6 })
        try { im.close?.() } catch {}
      } catch {}

      const fd = new FormData()
      fd.append('file', blob, 'photo.jpg')
      if (thumbBlob) fd.append('thumb', thumbBlob, 'thumb.jpg')
      fd.append('eventId', id); fd.append('guestId', guest.guestId); fd.append('deviceToken', getDeviceToken())

      // Les navigateurs des messageries suspendent la page pendant que
      // l'appareil photo est ouvert : la première requête au retour se perd
      // parfois. On retente une fois avant de parler d'échec à l'invité.
      let res = null
      for (let tentative = 0; tentative < 2 && !res; tentative++) {
        try { res = await fetch('/api/photo', { method: 'POST', body: fd }) }
        catch (reseau) {
          if (tentative) throw new Error('Connexion perdue pendant l’envoi. Vérifie ta connexion et réessaie.')
          await new Promise((r) => setTimeout(r, 900))
        }
      }
      const d = await res.json().catch(() => ({}))
      if (res.status === 409) { setError('Pellicule pleine — supprime une photo pour en reprendre une.') }
      else if (!res.ok) { throw new Error(d.error || "Échec de l'envoi.") }
    } catch (err) {
      setError(err.message || "Échec de l'envoi. Réessaie.")
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

    // Flash : torche réelle si dispo (Android), sinon flash écran pour les selfies (caméra avant)
    let torchUsed = false
    if (flashOn) {
      torchUsed = await applyTorch(true)
      if (torchUsed) await new Promise((r) => setTimeout(r, 180)) // laisse la torche éclairer
    }
    const useScreenFlash = flashOn && !torchUsed && facingMode === 'user'
    if (useScreenFlash) { setScreenFlash(true); await new Promise((r) => setTimeout(r, 280)) } // éclaire le visage

    playShutter()
    setShutterFx(true); setTimeout(() => setShutterFx(false), 240)
    if (flashOn && !useScreenFlash) { setFlashFx(true); setTimeout(() => setFlashFx(false), 420) }

    try { await capture(await compressToBlob(videoRef.current)) }
    catch (err) { setError(err.message || 'Erreur.') }
    finally {
      setBusy(false)
      if (useScreenFlash) setScreenFlash(false)
      if (torchUsed) applyTorch(false)
    }
  }

  // Demande +5 photos gratuites (quand la pellicule est pleine)
  async function grantBonus() {
    if (!guest) return
    setError('')
    try {
      const res = await fetch('/api/guest/bonus', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, guestId: guest.guestId, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      if (typeof d.shotsPerGuest === 'number') setGuest((g) => (g ? { ...g, shotsPerGuest: d.shotsPerGuest } : g))
      setBonusUsed(true)
    } catch (err) { setError(err.message || 'Erreur.') }
  }

  async function onFilePicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    fireShutterFeedback()
    try { await capture(await prepareUpload(file)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  // Import depuis la galerie (compte dans le solde, comme une photo prise)
  async function onGalleryPicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (full) { setError('Pellicule pleine — supprime une photo pour en importer une.'); return }
    setBusy(true); setError('')
    try { await capture(await prepareUpload(file)) }
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

  // Bouton « agenda » — proposé tant que l'album n'est pas révélé.
  // Le lien de l'événement part avec le rendez-vous : impossible de le perdre.
  const agendaBlock = meta && !meta.revealed ? (
    <>
      <a className="btn btn-ghost" href={agendaUrl} style={{ width: '100%' }}>📅 Ajouter à mon agenda</a>
      <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 6px' }}>
        La soirée, un rappel photo dans 1 h et la révélation — avec votre lien dans chaque.
      </p>
    </>
  ) : null

  // ---------- Écrans ----------
  if (phase === 'loading') return <main className="center-screen"><p className="muted">Chargement…</p></main>
  if (phase === 'error') return <main className="screen screen-cream center"><div className="card">{error || 'Événement introuvable.'}</div></main>

  if (phase === 'cover') return (
    <main className="screen screen-cream">
      {/* Même bascule que sur le tableau de bord, inversée : l'organisateur qui
          vient prendre ses photos doit pouvoir repartir aussi simplement. */}
      {meta?.isOwner && (
        <nav className="db-modes" aria-label="Mode">
          <Link href={`/event/${id}`}>Organisation</Link>
          <span className="on">Mon appareil 📷</span>
        </nav>
      )}
      <div className="cover" style={meta?.coverUrl ? undefined : { background: COVER_GRAD }}>
        {meta?.coverUrl ? (
          <img src={meta.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: meta.coverPos || '50% 50%' }} />
        ) : (
          <>
            <div className="gloss" />
            <div className="top">ÉVÉNEMENT PRIVÉ</div>
          </>
        )}
      </div>
      {/* Formulation neutre : « Mariage de X & Y vous invitent » sonnait faux
          dès que le nom n'était pas celui d'une personne. */}
      <h3 className="h3" style={{ margin: '22px 0 8px' }}>Participez à l'événement {coupleLabel}</h3>
      <p className="lead small" style={{ marginBottom: 16 }}>
        Prenez <strong>{meta?.shotsPerGuest} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{meta && formatReveal(meta.revealAt)}</strong>.
      </p>
      <div className="spacer" />
      {/* Quand on sait déjà qui c'est — l'organisateur, ou quelqu'un dont le
          serveur connaît le nom — on ne redemande pas ce qu'on a sous la main.
          Le nom reste modifiable juste en dessous. */}
      {name.trim() ? (
        <>
          <button className="btn btn-accent" onClick={() => join(name.trim(), email)}>
            Continuer en tant que {name.trim()} →
          </button>
          <button type="button" className="linklike" onClick={() => setPhase('name')}
            style={{ marginTop: 12, fontSize: 13.5 }}>
            Ce n'est pas vous ?
          </button>
        </>
      ) : (
        <button className="btn btn-accent" onClick={() => setPhase('name')}>Participer à l'album collectif →</button>
      )}
      <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
    </main>
  )

  if (phase === 'name') return (
    <main className="screen screen-cream">
      {/* Même bascule que sur le tableau de bord, inversée : l'organisateur qui
          vient prendre ses photos doit pouvoir repartir aussi simplement. */}
      {meta?.isOwner && (
        <nav className="db-modes" aria-label="Mode">
          <Link href={`/event/${id}`}>Organisation</Link>
          <span className="on">Mon appareil 📷</span>
        </nav>
      )}
      <button onClick={() => setPhase('cover')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 30, padding: 0 }}>‹ retour</button>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Étape 1 / 1</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Comment vous<br />appelez-vous ?</h3>
      <p className="lead small" style={{ marginBottom: 26 }}>Pour qu'on sache qui a pris quelle photo dans la galerie finale.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) join(name.trim()) }}>
        <div className="input-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <input type="text" placeholder="Votre prénom" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 8px' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Votre adresse mail</span>
          <span className="field-tag">facultatif</span>
        </div>
        <div className="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="off"
            autoCorrect="off" spellCheck="false" placeholder="vous@exemple.fr" value={email}
            onChange={(e) => { setEmail(e.target.value); setMailCheck(null) }}
            onBlur={(e) => verifierMail(e.target.value)} maxLength={160} />
        </div>

        {/* Filets de sécurité : on corrige et on prévient, on ne bloque jamais. */}
        {mailCheck?.status === 'suggestion' && (
          <div className="mail-tip">
            Vous vouliez dire{' '}
            <button type="button" onClick={accepterSuggestion}>{mailCheck.suggestion}</button> ?
          </div>
        )}
        {(mailCheck?.status === 'invalide' || mailCheck?.status === 'domaine-inconnu') && (
          <div className="mail-tip mail-tip-warn">⚠️ {mailCheck.reason}</div>
        )}
        {mailCheck?.status === 'ok' && (
          <div className="mail-tip mail-tip-ok">✓ Adresse vérifiée</div>
        )}

        <p className="lead small" style={{ margin: '10px 2px 0', color: 'var(--text3)' }}>
          ✉️ Uniquement pour recevoir le lien de l'album quand les photos sortent.
          Rien d'autre, jamais.
        </p>
        {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
        <button className="btn btn-dark" type="submit" disabled={busy || !name.trim()} style={{ marginTop: 20 }}>
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
      {/* L'organisateur qui photographie doit pouvoir repartir d'ici même :
          la barre du haut est pleine, ce rappel se pose donc en dessous. */}
      {meta?.isOwner && (
        <Link href={`/event/${id}`} className="cam-retour">← Tableau de bord</Link>
      )}
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
        <div className="vf-label">FLASH&nbsp;400</div>
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

        {full && !camBlocked && (
          <div className="vf-full">
            <div className="vf-full-icon">🎞️</div>
            <p className="vf-full-title">Pellicule pleine !</p>
            <p className="vf-full-sub">
              {bonusUsed
                ? `Tes ${guest?.shotsPerGuest} photos sont en cours de développement. Rendez-vous à la révélation 🎉`
                : `Tes ${guest?.shotsPerGuest} photos sont en cours de développement.`}
            </p>
            {/* La recharge est réglée par l'organisateur : à zéro, on ne la
                propose pas — la pellicule est vraiment finie. */}
            {!bonusUsed && (meta?.bonusShots > 0) && (
              <button className="vf-full-btn" onClick={grantBonus}>
                Recharger ma pellicule (+{meta.bonusShots}) →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ouvert depuis une messagerie, sans caméra en direct : la plupart des
          invités arrivent ainsi. On ne les renvoie pas ailleurs, on leur dit
          simplement que le bouton marche quand même. */}
      {inApp && !liveCam && !camBlocked && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)' }}>
          📸 Touche le déclencheur : l’appareil photo de ton téléphone s’ouvre, et ta photo rejoint l’album.
        </div>
      )}

      {camBlocked && (
        <details style={{ marginTop: 10, color: 'rgba(255,255,255,.6)', fontSize: 12.5 }}>
          <summary style={{ cursor: 'pointer' }}>Toujours bloquée après avoir cliqué ?</summary>
          <div style={{ marginTop: 8, lineHeight: 1.6 }}>
            • <strong>iPhone (Safari)</strong> : touche « aA » à gauche de l'adresse → Réglages du site → Caméra → Autoriser.<br />
            • <strong>Android (Chrome)</strong> : touche le cadenas 🔒 → Autorisations → Caméra.<br />
            <span style={{ opacity: .8 }}>En attendant, le gros bouton ouvre l'appareil photo de ton téléphone.</span>
            {/* Dernier recours : la page d'aide couvre les autres causes
                (mini-navigateur, réseau, téléphone partagé…). */}
            <br />
            <a href="/aide" target="_blank" rel="noreferrer"
              style={{ color: '#fff', textDecoration: 'underline', display: 'inline-block', marginTop: 6 }}>
              Voir les autres solutions →
            </a>
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
        {/* Rien n'indiquait que cette pile s'ouvrait : les invités ne
            trouvaient pas leurs photos. Le libellé lève le doute. */}
        <div className="cam-pilewrap">
          {roll.length === 0 ? (
            <div className="cam-pile"><span className="pf-empty" /></div>
          ) : (
            <button className="cam-pile" onClick={() => setShowAlbum(true)} aria-label="Voir l'album et mes photos">
              {roll.slice(0, 3).map((p, i) => (
                <span key={p.tempId || p.id || i} className="pf" style={{ zIndex: 3 - i, transform: `rotate(${[-6, 7, 14][i] || 0}deg)` }}>
                  <img src={p.url} alt="" loading="lazy" />
                </span>
              ))}
              {roll.length >= 1 && <span className="pf-count">{Math.min(roll.length, guest?.shotsPerGuest || roll.length)}</span>}
            </button>
          )}
          {roll.length > 0 && (
            <button type="button" className="cam-pilelabel" onClick={() => setShowAlbum(true)}>
              Mon album
            </button>
          )}
        </div>
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
        <div className="cam-pilewrap" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      </div>

      <input ref={galleryInputRef} type="file" accept="image/*" onChange={onGalleryPicked} style={{ display: 'none' }} />
      <button className="cam-import" onClick={() => galleryInputRef.current?.click()} disabled={busy || full}>
        🖼️ Importer une photo de ma galerie
      </button>


      {screenFlash && <div className="screen-flash" />}

      {/* Écran "Album" (ouvert en touchant la pile de photos) */}
      {showAlbum && (
        <div className="album-screen">
          <div className="album-top">
            <button className="cam-iconbtn" onClick={() => setShowAlbum(false)} aria-label="Retour à la caméra">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <span className="album-eyebrow">Album partagé</span>
            <span style={{ width: 42 }} />
          </div>

          <div className="album-header">
            <div className="album-headtext"><h2 className="album-name">{coupleLabel}</h2></div>
            {meta?.coverUrl && <img className="album-cover" src={meta.coverUrl} alt="" />}
          </div>

          {(() => {
            const cd = breakdownToReveal(meta?.revealAt, now)
            return (
              <div className="album-countdown">
                {cd.done ? (
                  <span className="cd-open">🎉 L'album est révélé !</span>
                ) : (
                  <>
                    <span className="cd-label">Révélation dans</span>
                    <div className="cd-blocks">
                      <div className="cd-b"><b>{cd.d}</b><i>jours</i></div>
                      <div className="cd-b"><b>{String(cd.h).padStart(2, '0')}</b><i>h</i></div>
                      <div className="cd-b"><b>{String(cd.m).padStart(2, '0')}</b><i>min</i></div>
                      <div className="cd-b"><b>{String(cd.s).padStart(2, '0')}</b><i>sec</i></div>
                    </div>
                  </>
                )}
              </div>
            )
          })()}

          <div className="album-bigstats">
            <div className="album-bstat"><div className="v">{meta?.photoCount ?? roll.length}</div><div className="l">Photos du groupe</div></div>
            <div className="album-bstat"><div className="v">{meta?.guestCount ?? 1}</div><div className="l">Participant{(meta?.guestCount || 0) > 1 ? 's' : ''}</div></div>
          </div>

          <div className="album-actions">
            <button className="album-btn album-btn-accent" onClick={() => setShowAlbum(false)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              Caméra
            </button>
            <button className="album-btn" onClick={() => setShowQR(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM21 14v7M14 21h7" /></svg>
              Inviter
            </button>
            <button className="album-icon" onClick={downloadMine} disabled={downloading || !myPhotos.length} aria-label="Télécharger mes photos">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
            </button>
          </div>

          <div className="album-divider" />
          <div className="album-mine-label">Mes photos · {myPhotos.length}/{guest?.shotsPerGuest}</div>

          <div className="album-grid">
            {roll.length === 0 ? (
              <p className="album-empty">Tes photos apparaîtront ici.</p>
            ) : (
              roll.map((p, i) => (
                <button key={p.tempId || p.id || i} className={`album-thumb ${p.pending ? 'pending' : ''}`}
                  onClick={() => !p.pending && p.id && setViewer({ id: p.id, url: p.url })} aria-label="Voir la photo">
                  <img src={p.url} alt="" loading="lazy" />
                </button>
              ))
            )}
          </div>

          {meta?.revealed && (
            <a className="album-fulllink" href={`/g/${id}`}>🎞️ Voir l'album complet de tous les invités →</a>
          )}
        </div>
      )}

      {/* Pop-up "Inviter un proche" */}
      {showQR && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setShowQR(false) }} style={{ background: 'rgba(10,8,6,.7)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <button onClick={() => setShowQR(false)} aria-label="Fermer"
              style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,26,18,.08)', border: 'none', color: 'var(--ink)', fontSize: 19, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 4 }}>Inviter un proche · garder mon lien</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 18px', color: '#1a1410' }}>Scannez ou partagez</h3>
            <div style={{ background: '#FCF8F0', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'center' }}>
              {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" style={{ display: 'block', width: '100%', maxWidth: 210, height: 'auto' }} />
                     : <div style={{ width: 210, height: 210 }} />}
            </div>
            <div style={{ background: 'rgba(34,26,18,.05)', borderRadius: 12, padding: '11px 13px', margin: '14px 0 12px', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text2)', wordBreak: 'break-all', textAlign: 'center' }}>{joinUrl}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={smsMyLink}>📲 M'envoyer le lien par SMS</button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
                Au tarif d'un SMS classique vers un numéro non surtaxé, généralement inclus dans votre forfait.
              </p>
              {agendaBlock}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyJoinLink}>{qrCopied ? '✓ Copié' : 'Copier le lien'}</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={shareMyLink}>Partager</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rappel "garde ton lien pour revenir" — affiché une seule fois à la 1re ouverture caméra */}
      {showSaveTip && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setShowSaveTip(false) }} style={{ background: 'rgba(10,8,6,.72)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <div style={{ textAlign: 'center', fontSize: 34, marginBottom: 8 }}>📲</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 8px', color: '#1a1410' }}>Gardez votre lien pour revenir</h3>
            <p className="muted small" style={{ textAlign: 'center', margin: '0 0 18px' }}>
              Vous pourrez rouvrir votre appareil et finir vos {guest?.shotsPerGuest} photos quand vous voulez. Envoyez-vous le lien pour le retrouver facilement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={smsMyLink}>📲 M'envoyer le lien par SMS</button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
                Au tarif d'un SMS classique vers un numéro non surtaxé, généralement inclus dans votre forfait.
              </p>
              {agendaBlock}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyJoinLink}>{qrCopied ? '✓ Copié' : 'Copier le lien'}</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={shareMyLink}>Partager</button>
              </div>
              <button onClick={() => setShowSaveTip(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: '6px 0', marginTop: 2 }}>
                Plus tard — commencer à photographier
              </button>
            </div>
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
