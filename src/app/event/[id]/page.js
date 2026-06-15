'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { BRAND } from '../../../lib/brand'
import { getDeviceToken } from '../../../lib/device'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
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
      .catch(() => setError('Impossible de charger l\'événement.'))
  }, [id])

  useEffect(() => {
    if (!joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1,
      color: { dark: '#1a1714', light: '#ffffff' } })
      .then(setQrUrl)
      .catch(() => {})
  }, [joinUrl])

  function copyLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: ev?.name || BRAND.name, text: 'Prends des photos pour notre pellicule 📸', url: joinUrl }) } catch {}
    } else { copyLink() }
  }

  if (error) return <main className="wrap center"><div className="card">{error}</div></main>
  if (!ev) return <main className="wrap center"><p className="muted">Chargement…</p></main>

  return (
    <main className="wrap">
      <div className="brand"><span className="brand-dot" />{BRAND.name}</div>

      <div style={{ marginTop: 28 }}>
        <div className="eyebrow">Votre événement est prêt</div>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>{ev.name}</h1>
        <p className="muted small" style={{ marginTop: 8 }}>
          Révélation : <strong>{formatDate(ev.revealAt)}</strong> · {ev.shotsPerGuest} clichés / invité
        </p>
      </div>

      <div className="card center" style={{ marginTop: 24 }}>
        <p className="small muted" style={{ marginBottom: 14 }}>
          Vos invités scannent ce QR code pour prendre des photos.
        </p>
        <div className="qr-box">
          {qrUrl
            ? <img src={qrUrl} alt="QR code de l'événement" width={220} height={220} />
            : <div style={{ width: 220, height: 220 }} />}
        </div>

        <div className="linkrow">
          <input readOnly value={joinUrl} onFocus={(e) => e.target.select()} />
          <button className="btn btn-ghost" onClick={copyLink}>{copied ? '✓ Copié' : 'Copier'}</button>
        </div>

        <button className="btn btn-amber" style={{ marginTop: 14 }} onClick={share}>
          Partager le lien
        </button>
      </div>

      {ev.isOwner ? (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="cd-num" style={{ fontSize: 26 }}>{ev.guestCount}</div>
                <div className="cd-lbl">invités</div>
              </div>
              <div>
                <div className="cd-num" style={{ fontSize: 26 }}>{ev.photoCount}</div>
                <div className="cd-lbl">photos prises</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cd-lbl" style={{ marginBottom: 6 }}>{ev.revealed ? 'Révélé' : 'En attente'}</div>
                <span className="brand-dot" style={{ background: ev.revealed ? 'var(--ok)' : 'var(--amber)' }} />
              </div>
            </div>
          </div>

          <Link href={`/g/${id}`} className="btn btn-ghost" style={{ marginTop: 16 }}>
            {ev.revealed ? 'Voir la galerie →' : 'Aperçu de la galerie (verrouillée)'}
          </Link>

          <div className="notice" style={{ marginTop: 16 }}>
            💡 Gardez ce lien : c'est votre tableau de bord privé. Vous y reviendrez après la fête pour voir et télécharger toutes les photos.
          </div>
        </>
      ) : (
        <div className="notice" style={{ marginTop: 16 }}>
          📷 Vous voulez prendre des photos ? <a href={`/j/${id}`} style={{ color: 'var(--amber-dk)', fontWeight: 700 }}>Rejoignez l'événement ici</a>.
          <br /><br />
          Le tableau de bord (statistiques, galerie) est réservé à l'organisateur, sur l'appareil qui a créé l'événement.
        </div>
      )}
    </main>
  )
}
