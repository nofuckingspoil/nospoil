'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, EMAIL_VERIFICATION_ENABLED } from '../../../lib/pricing'
import { track } from '../../../lib/tracking'
import TierPicker from '../../../components/TierPicker'
import PromoField from '../../../components/PromoField'

// ---------- Petits utilitaires de date ----------

function atDay(daysAhead, hour, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

// Proposition par défaut pour la soirée : le prochain samedi à 19h.
function nextSaturday() {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  d.setHours(19, 0, 0, 0)
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

// Les délais sont comptés à partir de la soirée, pas d'aujourd'hui :
// « le lendemain » = le lendemain de la fête.
const REVEAL_PRESETS = [
  { key: 'd1-12', em: '☕️', title: 'Le lendemain, à midi', sub: 'Le brunch d\'après fête', days: 1, hour: 12 },
  { key: 'd1-20', em: '🌙', title: 'Le lendemain, en soirée', sub: 'Le grand classique', days: 1, hour: 20 },
  { key: 'd7-20', em: '🗓️', title: 'Une semaine après', sub: 'Le temps que chacun fasse le tri', days: 7, hour: 20 },
  { key: 'custom', em: '✏️', title: 'Choisir une date précise', sub: 'Vous fixez le jour et l\'heure' },
]

// Nombre de clichés par invité à la création. Ce n'est pas demandé ici : le
// réglage se fait après paiement, depuis le tableau de bord, jusqu'au jour J.
const DEFAULT_SHOTS = 5


// ---------- Assistant ----------

function CreateForm() {
  const router = useRouter()
  const sp = useSearchParams()

  // La formule choisie sur la page d'accueil n'est qu'un point de départ : elle
  // reste modifiable sans quitter l'assistant (sinon toute la saisie serait perdue).
  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  const [tierOpen, setTierOpen] = useState('') // '' | 'head' | 'recap'
  const tier = tierByGuests(maxGuests)

  // Un code promo change le montant réellement dû : tout ce qui suit
  // (paiement ou non, adresse à demander, libellé du bouton) s'y rapporte.
  const [promo, setPromo] = useState(null)
  const priceCents = promo ? promo.priceCents : tier.priceCents
  const isPaid = priceCents > 0

  // Sur une formule payante, Stripe collecte déjà l'adresse pendant le paiement :
  // la demander en plus ferait saisir deux fois la même chose. On ne la demande
  // donc que quand personne d'autre ne le fera.
  const needEmail = !PAYMENTS_ENABLED || !isPaid || EMAIL_VERIFICATION_ENABLED

  // Étapes : 1 nom · 2 dates + révélation · 3 récap · 'code'
  //
  // Volontairement court. Tout ce qui n'est pas indispensable pour créer
  // l'événement (couverture, nombre de clichés) se règle après, depuis le
  // tableau de bord : c'est là qu'on a envie de fignoler, pas avant de payer.
  const [step, setStep] = useState(1)
  const TOTAL = 3

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [startsAt, setStartsAt] = useState(toInputValue(nextSaturday()))
  const [revealKey, setRevealKey] = useState('d1-20')
  const [revealAt, setRevealAt] = useState(toInputValue(atDay(1, 20, nextSaturday())))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  // Cases à cocher légales (jamais pré-cochées) — cf. CGV art. 6 et 9.2.
  const [cgvOk, setCgvOk] = useState(false)
  const [waiverOk, setWaiverOk] = useState(false)

  function goTo(n) { setError(''); setStep(n) }

  // Changement de formule : on garde l'adresse à jour pour que le retour depuis
  // Stripe (ou un rafraîchissement) retombe sur la bonne formule.
  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `/create/express?tier=${n}`) } catch {}
  }

  function pickReveal(p, base = startsAt) {
    setRevealKey(p.key)
    if (p.key !== 'custom') setRevealAt(toInputValue(atDay(p.days, p.hour, new Date(base))))
  }

  // Changer la date de la soirée recale la révélation choisie (« le lendemain »
  // doit rester le lendemain de la fête).
  function pickStart(value) {
    setStartsAt(value)
    const preset = REVEAL_PRESETS.find((p) => p.key === revealKey)
    if (preset && preset.key !== 'custom' && !isNaN(new Date(value))) {
      setRevealAt(toInputValue(atDay(preset.days, preset.hour, new Date(value))))
    }
  }

  // Validation + passage à l'étape suivante.
  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (!name.trim()) { setError('Donnez un nom à votre événement.'); return }
      return goTo(2)
    }
    if (step === 2) {
      if (!startsAt || isNaN(new Date(startsAt))) { setError('Indiquez la date de votre événement.'); return }
      if (!revealAt || isNaN(new Date(revealAt))) { setError('Choisissez une date de révélation.'); return }
      if (new Date(revealAt) <= new Date(startsAt)) {
        setError('La révélation doit venir après le début de votre événement.'); return
      }
      return goTo(3)
    }
    if (step === 3) return submitEmail()
  }

  // Dernière étape : contrôles, puis code de vérification (si activé) ou création.
  async function submitEmail() {
    // L'adresse n'est demandée ici que si Stripe ne va pas la collecter
    // lui-même : sur une formule payante, la saisir deux fois n'apporte rien.
    if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.')
      return
    }
    if (!cgvOk) { setError('Merci d\'accepter les conditions générales pour continuer.'); return }
    // Renonciation au droit de rétractation : obligatoire uniquement pour les formules payantes.
    if (isPaid && PAYMENTS_ENABLED && !waiverOk) {
      setError('Merci de cocher la demande d\'exécution immédiate pour finaliser votre commande.')
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
      startsAt: new Date(startsAt).toISOString(),
      revealAt: new Date(revealAt).toISOString(), shotsPerGuest: DEFAULT_SHOTS,
      maxGuests: tier.maxGuests,
      flow: 'court', // variante d'où l'on vient (retour d'annulation Stripe)
      // Preuve du consentement : le serveur pose lui-même l'horodatage.
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
    }

    // Formule payante : direction le paiement Stripe. L'événement sera créé au retour.
    if (isPaid && PAYMENTS_ENABLED) {
      try {
        // Publicité : départ vers le paiement.
        track('InitiateCheckout', {
          value: priceCents / 100,
          currency: 'EUR',
          content_name: `Formule ${tier.maxGuests} invités`,
        })

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
      // Publicité : événement gratuit créé.
      track('Lead', { content_name: `Formule ${tier.maxGuests} invités` }, { eventID: `lead_${data.id}` })
      router.push(`/event/${data.id}`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const finalLabel = isPaid && PAYMENTS_ENABLED
    ? (loading ? 'Redirection vers le paiement…' : `Payer ${formatPrice(priceCents)} →`)
    : (loading ? 'Création…' : 'Créer mon événement →')

  const lastStepLabel = EMAIL_VERIFICATION_ENABLED
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
          {/* Le prix ne s'affiche qu'une fois par écran : ici seulement à
              l'étape 2, où ni le sélecteur ni le récapitulatif ne le portent. */}
          {step === 2 && (
            <span className="wiz-tier">
              {tier.maxGuests} invités · <strong>{formatPrice(tier.priceCents)}</strong>{' '}
              <button type="button" className="linklike"
                onClick={() => setTierOpen(tierOpen === 'head' ? '' : 'head')}>
                {tierOpen === 'head' ? 'fermer' : 'changer'}
              </button>
            </span>
          )}
        </div>
        {step === 2 && tierOpen === 'head' && (
          <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen('')} />
        )}
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
          {/* La réassurance est fondue dans l'explication : une ligne à part se
              lirait comme un avertissement. */}
          <p className="wiz-sub">
            Ce nom s'affichera en grand sur l'écran d'accueil de vos invités.
            Vous pourrez le changer plus tard.
          </p>
          <div className="field">
            <label>Nom de l'événement</label>
            <input type="text" placeholder="Ex : Mariage de Marie & Paul" value={name}
              onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>

          {/* Le nombre d'invités décide du prix — et, une fois l'événement passé,
              de l'ouverture de l'album. Il se demande, il ne se devine pas. */}
          <TierPicker value={maxGuests} onChange={pickTier} inline />

          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 2 — Dates + révélation */}
      {step === 2 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quand a lieu votre événement ?</h2>
          {/* Pas de sous-titre : l'étiquette du champ dit déjà tout. */}
          <div className="field" style={{ marginTop: 18, marginBottom: 24 }}>
            <label>
              Date et heure de l'événement{' '}
              <span className="lbl-soft">(modifiable plus tard)</span>
            </label>
            <input type="datetime-local" value={startsAt} onChange={(e) => pickStart(e.target.value)} />
          </div>

          <h2 className="wiz-q" style={{ marginTop: 0 }}>Et quand révéler les photos ?</h2>
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
          {/* Le résultat du choix, et le moment que l'organisateur se figure :
              il mérite mieux qu'une ligne grise. Affiché aussi en date libre,
              où il traduit la saisie brute en quelque chose de lisible. */}
          <div className="wiz-reveal-echo">
            <span className="lbl">Révélation</span>
            <strong className="val">{frDate(revealAt)}</strong>
          </div>
          <div className="notice" style={{ marginTop: 16 }}>
            💡 Laissez-leur le temps. Avant la révélation, chacun peut revoir ses clichés et supprimer
            ceux qu'il ne veut pas montrer — après, c'est visible par tout le monde.
          </div>
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(1)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 3 — Récapitulatif (+ mail si Stripe ne le collecte pas) */}
      {step === 3 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">On y est presque</h2>
          <p className="wiz-sub">
            {needEmail
              ? 'Vérifiez votre événement, puis indiquez l’adresse qui vous permettra de retrouver votre tableau de bord.'
              : 'Vérifiez votre événement. Le reste — photo de couverture, nombre de clichés — se règle juste après, tranquillement.'}
          </p>

          {needEmail && (
            <div className="field">
              <label>Votre adresse mail</label>
              <input type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr"
                value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoFocus />
            </div>
          )}

          <div className="wiz-recap">
            <div className="wiz-recap-title">Récapitulatif</div>
            <div className="wiz-recap-row">
              <span>Événement</span>
              <span>{name} <button type="button" className="linklike" onClick={() => goTo(1)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Événement le</span>
              <span>{frDate(startsAt)} <button type="button" className="linklike" onClick={() => goTo(2)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Révélation</span>
              <span>{frDate(revealAt)} <button type="button" className="linklike" onClick={() => goTo(2)}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Formule</span>
              <span>
                {tier.maxGuests} invités · {formatPrice(tier.priceCents)}{' '}
                <button type="button" className="linklike"
                  onClick={() => setTierOpen(tierOpen === 'recap' ? '' : 'recap')}>
                  {tierOpen === 'recap' ? 'fermer' : 'modifier'}
                </button>
              </span>
            </div>
            {tierOpen === 'recap' && (
              <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen('')} />
            )}
            {tier.priceCents > 0 && (
              <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
            )}
          </div>

          {/* Le doute juste avant de payer, c'est « et si je me suis trompé ? ».
              On y répond ici, au moment précis où la question se pose. */}
          {/* La formule est volontairement absente de cette liste : elle se
              choisit maintenant, pour de bon. */}
          <div className="notice wiz-reassure">
            ✎ <strong>Rien n'est figé.</strong> Nom, dates, moment de la révélation, photo de
            couverture : tout se modifie ensuite depuis votre tableau de bord. Le nombre de clichés
            se règle jusqu'au jour de l'événement.
          </div>

          <div className="wiz-legal">
            <label className="wiz-check">
              <input type="checkbox" checked={cgvOk} onChange={(e) => setCgvOk(e.target.checked)} />
              <span>
                J'accepte les <Link href="/cgv" target="_blank">conditions générales de vente</Link> et
                la <Link href="/politique-de-confidentialite" target="_blank">politique de confidentialité</Link>.
              </span>
            </label>
            {isPaid && PAYMENTS_ENABLED && (
              <label className="wiz-check">
                <input type="checkbox" checked={waiverOk} onChange={(e) => setWaiverOk(e.target.checked)} />
                <span>
                  Je demande la création immédiate de mon événement et je renonce à mon
                  droit de rétractation de 14 jours.
                </span>
              </label>
            )}
          </div>

          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(2)} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{lastStepLabel}</button>
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
            <button type="button" onClick={() => goTo(3)} className="linklike">Changer d'adresse</button>
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
