'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { BRAND } from '../../../lib/brand'
import Logo from '../../../components/Logo'
import InstallPrompt from '../../../components/InstallPrompt'
import { getDeviceToken } from '../../../lib/device'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'J'
  return 'J-' + Math.ceil(diff / 86400000)
}

export default function EventManage({ params }) {
  const { id } = use(params)
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [joinUrl, setJoinUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/j/${id}`)
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': getDeviceToken() } })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setEv(d)))
      .catch(() => setError("Impossible de charger l'événement."))
  }, [id])

  useEffect(() => {
    if (!joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1, color: { dark: '#14161F', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [joinUrl])

  function copyLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: ev?.name || BRAND.name, text: 'Prenez des photos pour notre appareil jetable 📸', url: joinUrl }) } catch {}
    } else copyLink()
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!ev) return <main className="center-screen"><p className="muted">Chargement…</p></main>

  return (
    <main className="screen screen-cream">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/mes-evenements" className="mono small" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Mes événements</Link>
      </div>

      <header style={{ marginTop: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>{ev.name}</h1>
          <span className={`badge ${ev.revealed ? 'badge-live' : 'badge-wait'}`}>
            <span className="dot" />{ev.revealed ? 'RÉVÉLÉ' : 'EN COURS'}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 6 }}>
          révélation {formatDate(ev.revealAt)}
        </div>
      </header>

      {ev.isOwner && (
        <div className="stats" style={{ marginTop: 20 }}>
          <div className="stat"><div className="lbl">Invités</div><div className="val">{ev.guestCount}</div><div className="note">ont rejoint</div></div>
          <div className="stat"><div className="lbl">Souvenirs</div><div className="val" style={{ color: 'var(--accent)' }}>{ev.photoCount}</div><div className="note">photos prises</div></div>
          <div className="stat"><div className="lbl">Clichés / invité</div><div className="val">{ev.shotsPerGuest}</div><div className="note">contrainte argentique</div></div>
          <div className="stat"><div className="lbl">Révélation</div><div className="val">{daysUntil(ev.revealAt)}</div><div className="note">avant ouverture</div></div>
        </div>
      )}

      {/* Carte QR sombre */}
      <div className="card-dark" style={{ marginTop: 16 }}>
        <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>Inviter · scannez pour entrer</div>
        <div className="qr-tile">
          {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" /> : <div style={{ width: 220, height: 220 }} />}
        </div>
        <div className="urlbox" style={{ margin: '14px 0 12px' }}>{joinUrl}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={copyLink}>{copied ? '✓ Copié' : 'Copier le lien'}</button>
          <button className="btn" style={{ flex: '0 0 auto', width: 54, background: 'rgba(255,255,255,.08)', color: '#fff', padding: 14 }} onClick={share} aria-label="Partager">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {ev.isOwner ? (
        <>
          <Link href={`/g/${id}`} className="btn btn-ghost" style={{ marginTop: 16 }}>
            {ev.revealed ? 'Voir la galerie →' : 'Aperçu des photos (avant révélation) →'}
          </Link>
          <div className="notice" style={{ marginTop: 16 }}>
            💡 Gardez ce lien : c'est votre tableau de bord privé. Vous y reviendrez après la fête pour voir et télécharger toutes les photos.
          </div>
          <InstallPrompt label="Épinglez votre tableau de bord" />
        </>
      ) : (
        <div className="notice" style={{ marginTop: 16 }}>
          📷 Vous voulez prendre des photos ? <a href={`/j/${id}`} style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>Rejoignez l'événement ici</a>.
          <br /><br />
          Le tableau de bord est réservé à l'organisateur, sur l'appareil qui a créé l'événement.
        </div>
      )}
    </main>
  )
}
