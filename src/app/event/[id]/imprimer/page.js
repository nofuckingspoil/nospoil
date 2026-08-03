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

// Date et heure : sur un carton, savoir « le 9 août » sans l'heure ne suffit pas
// à se tenir prêt au bon moment.
function dateHeure(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
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
  const reveal = dateHeure(ev.revealAt)

  // Bande de pellicule. En SVG et non en fond CSS : les navigateurs suppriment
  // les fonds à l'impression quand « graphiques d'arrière-plan » est décoché,
  // alors qu'un dessin SVG sort toujours.
  const Film = () => (
    <svg className="pk-film" viewBox="0 0 120 7" preserveAspectRatio="none" aria-hidden="true">
      <rect width="120" height="7" fill="#14161F" />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={1.6 + i * 5} y="1.9" width="2.9" height="3.2" rx=".7" fill="#F4EBDA" />
      ))}
    </svg>
  )

  // Bloc réutilisé par les trois formats.
  const Ticket = ({ size }) => (
    <div className={`pk-ticket pk-${size}`}>
      <Film />

      <div className="pk-body">
        <div className="pk-eyebrow">◉ Appareil photo jetable</div>
        <div className="pk-title">{title}</div>
        {who && size !== 'sm' && <div className="pk-who">{who}</div>}

        {size !== 'sm' && <div className="pk-punch">Ce soir, le photographe c'est vous.</div>}

        {/* QR cadré comme un viseur */}
        <div className="pk-viewfinder">
          <span className="pk-c tl" /><span className="pk-c tr" />
          <span className="pk-c bl" /><span className="pk-c br" />
          <div className="pk-qr">{qr && <img src={qr} alt="" />}</div>
        </div>

        {/* Sur un carton de 7 cm, la formule longue frôle le trait de découpe. */}
        <div className="pk-cta">{size === 'sm' ? 'Scannez-moi' : 'Scannez · photographiez · disparaissez'}</div>

        <div className="pk-badge">
          {shots} clichés chacun{size === 'sm' ? '' : ', pas un de plus'}
        </div>

        {/* Sur un carton de 7 cm, la formule complète déborderait : on garde
            l'essentiel, la date et l'heure. */}
        <div className="pk-reveal">
          {size === 'sm' ? 'Révélation le ' : 'Révélation commune des clichés le '}
          <strong>{reveal}</strong>
        </div>

        {size !== 'sm' && <div className="pk-foot">Aucune appli à installer · timetoflash.fr</div>}
      </div>

      <Film />
    </div>
  )

  return (
    <>
      {/* ---------- Écran : réglages ---------- */}
      <main className="screen screen-cream pk-screen">
        {/* Le retour suit le défilement : l'aperçu est long, et il était
            auparavant seul tout en bas de la page. */}
        <div className="pk-top">
          <Link href={`/event/${id}`} className="pk-back">
            <span aria-hidden="true">←</span> Tableau de bord
          </Link>
          <Link href={`/event/${id}`} style={{ textDecoration: 'none' }}>
            <Logo nameSize={18} size={28} />
          </Link>
        </div>

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

        {/* Doublon assumé du retour collé en haut : arrivé au bout de l'aperçu,
            on est déjà là et on n'a pas à viser la barre. */}
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
