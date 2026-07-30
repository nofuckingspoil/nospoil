'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, EMAIL_VERIFICATION_ENABLED } from '../../lib/pricing'
import { fileToImage, compressToBlob } from '../../lib/camera'

// ---------- Petits utilitaires de date ----------

function atDay(daysAhead, hour) {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

function toInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function frDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  return d.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// ---------- Choix proposés ----------

const REVEAL_PRESETS = [
  { key: 'd1-12', em: '☕️', title: 'Le lendemain, à midi', sub: 'Le brunch d\'après fête', days: 1, hour: 12 },
  { key: 'd1-20', em: '🌙', title: 'Le lendemain, en soirée', sub: 'Le grand classique', days: 1, hour: 20 },
  { key: 'd7-20', em: '🗓️', title: 'Dans 1 semaine', sub: 'Le temps que chacun fasse le tri', days: 7, hour: 20 },
  { key: 'custom', em: '✏️', title: 'Choisir une date précise', sub: 'Vous fixez le jour et l\'heure' },
]

const SHOT_PRESETS = [
  { n: 3, em: '💎', title: '3 clichés', sub: 'Très rare — chaque photo est un événement' },
  { n: 5, em: '🎞️', title: '5 clichés', sub: 'Le bon équilibre, recommandé' },
  { n: 8, em: '📸', title: '8 clichés', sub: 'Plus généreux, pour les longues soirées' },
]

const SHOTS_MIN = 3
const SHOTS_MAX = 15

// ---------- Assistant ----------

function CreateForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const tier = tierByGuests(sp.get('tier'))
  const isPaid = tier.priceCents > 0

  // Étapes : 1 nom · 2 couverture · 3 clichés · 4 révélation · 5 mail + récap · 'code'
  const [step, setStep] = useState(1)
  const TOTAL = 5

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [shots, setShots] = useState(5)
  const [shotsCustom, setShotsCustom] = useState(false)
  const [revealKey, setRevealKey] = useState('d1-20')
  const [revealAt, setRevealAt] = useState(toInputValue(atDay(1, 20)))
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  function goTo(n) { setError(''); setStep(n) }

  function onCoverPick(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  function pickReveal(p) {
    setRevealKey(p.key)
    if (p.key !== 'custom') setRevealAt(toInputValue(atDay(p.days, p.hour)))
  }

  function pickShots(n) {
    setShots(n)
    setShotsCustom(false)
  }

  // Validation + passage à l'étape suivante.
  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (!name.trim()) { setError('Donnez un nom à votre événement.'); return }
      return goTo(2)
    }
    if (step === 2) return goTo(3)
    if (step === 3) return goTo(4)
    if (step === 4) {
      if (!revealAt || isNaN(new Date(revealAt))) { setError('Choisissez une date de révélation.'); return }
      return goTo(5)
    }
    if (step === 5) return submitEmail()
  }

  // Étape 5 : on valide le mail, puis code de vérification (si activé) ou création directe.
  async function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.')
      return
    }
    if (!EMAIL_VERIFICATION_ENABLED) return handleCreate()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      setCode(''); setStep('code')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // Renvoyer un nouveau code.
  async function resendCode() {
    setError('')
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
    } catch (err) { setError(err.message) }
  }

  // Création de l'événement (ou passage au paiement si formule payante).
  async function handleCreate(e) {
    if (e) e.preventDefault()
    setError('')
    if (EMAIL_VERIFICATION_ENABLED && code.replace(/\D/g, '').length !== 6) { setError('Entrez le code à 6 chiffres reçu par mail.'); return }
    setLoading(true)

    const payload = {
      ownerToken: getDeviceToken(), name, ownerEmail: email.trim(),
      code: code.replace(/\D/g, ''),
      revealAt: new Date(revealAt).toISOString(), shotsPerGuest: shots,
      maxGuests: tier.maxGuests,
    }

    // Formule payante : direction le paiement Stripe. L'événement sera créé au retour.
    if (isPaid && PAYMENTS_ENABLED) {
      try {
        // On met de côté la couverture (compressée) et le mail, le temps de l'aller-retour Stripe.
        if (coverFile) {
          try {
            const img = await fileToImage(coverFile)
            const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
            const dataUrl = await new Promise((resolve) => {
              const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob)
            })
            sessionStorage.setItem('declic_pending_cover', dataUrl)
          } catch {}
        }
        sessionStorage.setItem('declic_pending_email', email.trim().toLowerCase())

        const res = await fetch('/api/checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur.')
        window.location.href = data.url // redirection vers la page de paiement Stripe
        return
      } catch (err) { setError(err.message); setLoading(false); return }
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      rememberMyEvent(data.id)
      saveAccount(email.trim().toLowerCase())

      // Upload de la photo de couverture (facultative), compressée côté navigateur
      if (coverFile) {
        try {
          const img = await fileToImage(coverFile)
          const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
          const fd = new FormData()
          fd.append('file', blob, 'cover.jpg')
          fd.append('ownerToken', getDeviceToken())
          await fetch(`/api/events/${data.id}/cover`, { method: 'POST', body: fd })
        } catch {}
      }

      router.push(`/event/${data.id}`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const finalLabel = isPaid && PAYMENTS_ENABLED
    ? (loading ? 'Redirection vers le paiement…' : `Payer ${formatPrice(tier.priceCents)} →`)
    : (loading ? 'Création…' : 'Créer mon événement →')

  const step5Label = EMAIL_VERIFICATION_ENABLED
    ? (loading ? 'Envoi du code…' : 'Continuer →')
    : finalLabel

  const stepNum = step === 'code' ? TOTAL : step

  return (
    <main className="screen screen-cream">
      <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      {/* Barre de progression */}
      <div className="wiz-head">
        <div className="wiz-progress">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i < stepNum ? 'done' : ''} />
          ))}
        </div>
        <div className="wiz-headline">
          <span className="wiz-count">Étape {stepNum} sur {TOTAL}</span>
          <span className="wiz-tier">
            {tier.maxGuests} invités · <strong>{formatPrice(tier.priceCents)}</strong>{' '}
            <Link href="/#tarifs">changer</Link>
          </span>
        </div>
      </div>

      {isPaid && !PAYMENTS_ENABLED && (
        <div className="notice" style={{ marginTop: 12 }}>
          🎁 <strong>Offert pendant le lancement</strong> — le paiement en ligne arrive bientôt. Votre événement est créé sans frais pour l'instant.
        </div>
      )}

      {/* ÉTAPE 1 — Nom */}
      {step === 1 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">C'est quoi l'occasion ?</h2>
          <p className="wiz-sub">Ce nom s'affichera en grand sur l'écran d'accueil de vos invités.</p>
          <div className="field">
            <label>Nom de l'événement</label>
            <input type="text" placeholder="Ex : Mariage de Marie & Paul" value={name}
              onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>
          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 2 — Photo de couverture */}
      {step === 2 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Une photo de couverture ?</h2>
          <p className="wiz-sub">Elle habille l'écran d'accueil que voient vos invités. Vous pourrez l'ajouter ou la changer plus tard.</p>
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="Aperçu de la couverture" className="wiz-coverimg" />
              <label className="btn btn-ghost wiz-coverchange">
                Changer la photo
                <input type="file" accept="image/*" onChange={onCoverPick} hidden />
              </label>
            </>
          ) : (
            <label className="wiz-coverpick">
              <span className="em">🖼️</span>
              <span className="tt">Choisir une photo</span>
              <span className="ss">JPG ou PNG, depuis votre téléphone</span>
              <input type="file" accept="image/*" onChange={onCoverPick} hidden />
            </label>
          )}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(1)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
          {!coverPreview && (
            <button type="button" className="linklike wiz-skip" onClick={() => goTo(3)}>Passer cette étape</button>
          )}
        </form>
      )}

      {/* ÉTAPE 3 — Clichés par invité */}
      {step === 3 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Combien de clichés par invité ?</h2>
          <p className="wiz-sub">La contrainte argentique : moins de poses, et chaque photo compte davantage.</p>
          <div className="wiz-opts">
            {SHOT_PRESETS.map((p) => (
              <button key={p.n} type="button"
                className={`wiz-opt ${!shotsCustom && shots === p.n ? 'on' : ''}`}
                onClick={() => pickShots(p.n)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{p.title}</span><span className="ss">{p.sub}</span></span>
              </button>
            ))}
            <button type="button" className={`wiz-opt ${shotsCustom ? 'on' : ''}`}
              onClick={() => { setShotsCustom(true); setShots((s) => (s <= 8 ? 10 : s)) }}>
              <span className="em">🎚️</span>
              <span><span className="tt">Plus</span><span className="ss">Jusqu'à {SHOTS_MAX} clichés</span></span>
            </button>
          </div>
          {shotsCustom && (
            <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
              <div className="stepper">
                <button type="button" onClick={() => setShots((s) => Math.max(SHOTS_MIN, s - 1))} aria-label="Moins">−</button>
                <span className="val">{shots}</span>
                <button type="button" onClick={() => setShots((s) => Math.min(SHOTS_MAX, s + 1))} aria-label="Plus">+</button>
              </div>
            </div>
          )}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(2)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 4 — Révélation */}
      {step === 4 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quand révéler les photos ?</h2>
          <p className="wiz-sub">
            Jusqu'à cette date, tout reste caché — comme une pellicule qu'on développe.
            Ensuite, les photos deviennent visibles par <strong>tous les invités</strong>.
          </p>
          <div className="wiz-opts">
            {REVEAL_PRESETS.map((p) => (
              <button key={p.key} type="button"
                className={`wiz-opt ${revealKey === p.key ? 'on' : ''}`}
                onClick={() => pickReveal(p)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{p.title}</span><span className="ss">{p.sub}</span></span>
              </button>
            ))}
          </div>
          {revealKey === 'custom' && (
            <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
              <label>Date et heure</label>
              <input type="datetime-local" value={revealAt} onChange={(e) => setRevealAt(e.target.value)} />
            </div>
          )}
          {revealKey !== 'custom' && (
            <p className="wiz-echo">Révélation le {frDate(revealAt)}</p>
          )}
          <div className="notice" style={{ marginTop: 16 }}>
            💡 Laissez-leur le temps. Avant la révélation, chacun peut revoir ses clichés et supprimer
            ceux qu'il ne veut pas montrer — après, c'est visible par tout le monde.
          </div>
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(3)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 5 — Mail + récapitulatif */}
      {step === 5 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Où vous envoyer votre accès ?</h2>
          <p className="wiz-sub">Votre adresse mail vous permet de retrouver votre tableau de bord, même en changeant de téléphone.</p>
          <div className="field">
            <label>Votre adresse mail</label>
            <input type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr"
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoFocus />
          </div>

          <div className="wiz-recap">
            <div className="wiz-recap-title">Récapitulatif</div>
            <div className="wiz-recap-row">
              <span>Événement</span>
              <span>{name} <button type="button" className="linklike" onClick={() => goTo(1)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Couverture</span>
              <span>{coverPreview ? 'Ajoutée' : 'Aucune'} <button type="button" className="linklike" onClick={() => goTo(2)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Clichés / invité</span>
              <span>{shots} <button type="button" className="linklike" onClick={() => goTo(3)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Révélation</span>
              <span>{frDate(revealAt)} <button type="button" className="linklike" onClick={() => goTo(4)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Formule</span>
              <span>{tier.maxGuests} invités · {formatPrice(tier.priceCents)}</span>
            </div>
          </div>

          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(4)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{step5Label}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE bonus — Code reçu par mail */}
      {step === 'code' && (
        <form className="card wiz-card" onSubmit={handleCreate}>
          <h2 className="wiz-q">Vérifiez votre adresse</h2>
          <p className="wiz-sub">
            On vient d'envoyer un code à 6 chiffres à <strong>{email.trim()}</strong>. Saisissez-le pour créer votre événement.
          </p>
          <div className="field">
            <label>Code reçu par mail</label>
            <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} autoFocus
              style={{ fontFamily: 'var(--font-mono)', fontSize: 24, letterSpacing: '.3em', textAlign: 'center' }} />
          </div>
          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit" disabled={loading}>{finalLabel}</button>
          </div>
          <div className="hint" style={{ marginTop: 14, textAlign: 'center' }}>
            Pas reçu ?{' '}
            <button type="button" onClick={resendCode} className="linklike">Renvoyer le code</button>
            {' · '}
            <button type="button" onClick={() => goTo(5)} className="linklike">Changer d'adresse</button>
          </div>
        </form>
      )}

      <div className="footer-note" style={{ marginTop: 24 }}>PAIEMENT UNIQUE · SANS ABONNEMENT</div>
    </main>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <CreateForm />
    </Suspense>
  )
}
