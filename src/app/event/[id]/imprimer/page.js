'use client'

// ============================================================
//  Kit d'impression : affiche A4, chevalets de table, petits cartons.
//  Tout est imprimé par le navigateur (« Imprimer » ou « Enregistrer en PDF »),
//  sans dépendance ni service externe. Les styles d'impression vivent dans
//  globals.css, section « Kit d'impression ».
// ============================================================

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import Logo from '../../../../components/Logo'
import { getOwnerToken, saveOwnerToken } from '../../../../lib/device'

const FORMATS = [
  { key: 'affiche', label: 'Affiche A4', sub: "Entrée, bar, vestiaire", per: '1 par page' },
  { key: 'chevalet', label: 'Chevalet de table', sub: 'À plier en deux', per: '2 par page' },
  { key: 'cartons', label: 'Petits cartons', sub: 'À découper et disperser', per: '9 par page' },
]

function shortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  } catch { return '' }
}

export default function PrintKit({ params }) {
  const { id } = use(params)
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [qr, setQr] = useState('')
  // Le format vit dans l'adresse : la page reste partageable et rechargeable.
  const [format, setFormat] = useState('affiche')

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('f')
    if (FORMATS.some((x) => x.key === f)) setFormat(f)
  }, [])

  function pickFormat(key) {
    setFormat(key)
    const u = new URL(window.location.href)
    u.searchParams.set('f', key)
    u.searchParams.delete('k')
    window.history.replaceState(null, '', u.pathname + u.search)
  }

  useEffect(() => {
    // Lien organisateur ouvert depuis un autre appareil (on crée sur son téléphone,
    // on imprime depuis un ordinateur) : ?k=<jeton> → on le mémorise puis on nettoie l'adresse.
    const k = new URLSearchParams(window.location.search).get('k')
    if (k) {
      saveOwnerToken(id, k)
      const u = new URL(window.location.href); u.searchParams.delete('k')
      window.history.replaceState(null, '', u.pathname + u.search)
    }
    const token = getOwnerToken(id)
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': token } })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setEv(d)))
      .catch(() => setError("Impossible de charger l'événement."))
  }, [id])

  useEffect(() => {
    // Résolution volontairement élevée : à l'impression, un QR de 440 px
    // ressort pixelisé dès qu'on dépasse quelques centimètres.
    const joinUrl = `${window.location.origin}/j/${id}`
    QRCode.toDataURL(joinUrl, { width: 1200, margin: 1, color: { dark: '#14161F', light: '#ffffff' } })
      .then(setQr).catch(() => {})
  }, [id])

  if (error) {
    return (
      <main className="center-screen">
        <div style={{ textAlign: 'center' }}>
          <p className="muted" style={{ marginBottom: 16 }}>{error}</p>
          <Link href={`/event/${id}`} className="btn btn-ghost">← Retour au tableau de bord</Link>
        </div>
      </main>
    )
  }
  if (!ev) return <main className="center-screen"><p className="muted">Chargement…</p></main>

  const title = ev.name
  const who = ev.hostNames || ''
  const shots = ev.shotsPerGuest
  const reveal = shortDate(ev.revealAt)

  // Bloc réutilisé par les trois formats.
  const Ticket = ({ size }) => (
    <div className={`pk-ticket pk-${size}`}>
      <div className="pk-eyebrow">Appareil photo jetable</div>
      <div className="pk-title">{title}</div>
      {who && size !== 'sm' && <div className="pk-who">{who}</div>}
      <div className="pk-qr">{qr && <img src={qr} alt="" />}</div>
      <div className="pk-cta">Scannez avec votre téléphone</div>
      <div className="pk-rules">
        <span><strong>{shots}</strong> photo{shots > 1 ? 's' : ''} chacun</span>
        <span className="pk-dot">·</span>
        <span>Révélation le <strong>{reveal}</strong></span>
      </div>
      {size !== 'sm' && <div className="pk-foot">Aucune application à installer</div>}
    </div>
  )

  return (
    <>
      {/* ---------- Écran : réglages ---------- */}
      <main className="screen screen-cream pk-screen">
        <Link href={`/event/${id}`} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
          <Logo nameSize={22} size={36} />
        </Link>

        <h1 className="h2" style={{ marginTop: 22 }}>Kit d'impression</h1>
        <p className="lead" style={{ marginTop: 6 }}>
          Choisissez un format, imprimez, posez. Vos invités n'ont plus qu'à scanner.
        </p>

        <div className="pk-formats">
          {FORMATS.map((f) => (
            <button key={f.key} type="button"
              className={`pk-format ${format === f.key ? 'on' : ''}`}
              onClick={() => pickFormat(f.key)}>
              <span className="tt">{f.label}</span>
              <span className="ss">{f.sub}</span>
              <span className="nn">{f.per}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-accent" style={{ marginTop: 18 }} onClick={() => window.print()}>
          Imprimer →
        </button>
        <p className="hint" style={{ textAlign: 'center', marginTop: 10 }}>
          Astuce : dans la fenêtre d'impression, choisissez « Enregistrer en PDF »
          pour l'envoyer à un imprimeur.
        </p>

        {/* Aperçu à l'écran */}
        <div className="pk-preview">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>Aperçu</div>
          <div className={`pk-page pk-page-${format}`}>
            {format === 'affiche' && <Ticket size="lg" />}
            {format === 'chevalet' && (<><Ticket size="md" /><div className="pk-fold" /><Ticket size="md" /></>)}
            {format === 'cartons' && Array.from({ length: 9 }, (_, i) => <Ticket key={i} size="sm" />)}
          </div>
        </div>

        <Link href={`/event/${id}`} className="btn btn-ghost" style={{ marginTop: 20 }}>
          ← Retour au tableau de bord
        </Link>
      </main>

      {/* ---------- Impression : la page réelle ---------- */}
      <div className={`pk-print pk-page-${format}`} aria-hidden="true">
        {format === 'affiche' && <Ticket size="lg" />}
        {format === 'chevalet' && (<><Ticket size="md" /><div className="pk-fold" /><Ticket size="md" /></>)}
        {format === 'cartons' && Array.from({ length: 9 }, (_, i) => <Ticket key={i} size="sm" />)}
      </div>
    </>
  )
}
