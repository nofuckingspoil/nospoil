'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import TierPicker from '../../../components/TierPicker'
import PromoField from '../../../components/PromoField'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, EMAIL_VERIFICATION_ENABLED } from '../../../lib/pricing'
import { track } from '../../../lib/tracking'
import { DEFAULT_EVENT_NAME, DEFAULT_SHOTS, atDay, nextSaturday } from '../../../lib/event-defaults'

// ============================================================
//  Variante « express » du tunnel de création.
//
//  On choisit sa formule, on paie, et TOUT le paramétrage (nom, dates,
//  révélation, couverture, clichés) se fait ensuite depuis le tableau de bord.
//  L'événement est donc créé avec des valeurs de départ, que la checklist du
//  tableau de bord invite à reprendre une par une.
//
//  Existe en parallèle de /create pour pouvoir comparer les deux parcours.
// ============================================================

function ExpressForm() {
  const router = useRouter()
  const sp = useSearchParams()

  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  const tier = tierByGuests(maxGuests)

  // Un code promo peut rendre payante une formule gratuite… ou l'inverse.
  // Tout ce qui suit raisonne donc sur le prix réellement dû.
  const [promo, setPromo] = useState(null)
  const priceCents = promo ? promo.priceCents : tier.priceCents
  const isPaid = priceCents > 0

  // Sur une formule payante, Stripe collecte l'adresse pendant le paiement.
  const needEmail = !PAYMENTS_ENABLED || !isPaid || EMAIL_VERIFICATION_ENABLED

  const [email, setEmail] = useState('')
  const [cgvOk, setCgvOk] = useState(false)
  const [waiverOk, setWaiverOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `/create/paiement-direct?tier=${n}`) } catch {}
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.')
      return
    }
    if (!cgvOk) { setError('Merci d\'accepter les conditions générales pour continuer.'); return }
    if (isPaid && PAYMENTS_ENABLED && !waiverOk) {
      setError('Merci de cocher la demande d\'exécution immédiate pour finaliser votre commande.')
      return
    }

    setLoading(true)

    // Valeurs de départ : l'organisateur les reprendra depuis son tableau de bord.
    const start = nextSaturday()
    const reveal = atDay(1, 20, start)
    const payload = {
      ownerToken: getDeviceToken(),
      name: DEFAULT_EVENT_NAME,
      ownerEmail: email.trim(),
      startsAt: start.toISOString(),
      revealAt: reveal.toISOString(),
      shotsPerGuest: DEFAULT_SHOTS,
      maxGuests: tier.maxGuests,
      flow: 'express', // variante d'où l'on vient (retour d'annulation Stripe)
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
    }

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
        window.location.href = data.url
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

  const label = isPaid && PAYMENTS_ENABLED
    ? (loading ? 'Redirection vers le paiement…' : `Payer ${formatPrice(priceCents)} →`)
    : (loading ? 'Création…' : 'Créer mon événement →')

  return (
    <main className="screen screen-cream">
      <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      <form className="card wiz-card" style={{ marginTop: 26 }} onSubmit={submit}>
        <h2 className="wiz-q">Créez votre événement</h2>
        <p className="wiz-sub">
          Une seule chose à décider maintenant : le nombre d'invités.
          Le nom, les dates et le moment de la révélation se règlent juste après.
        </p>

        <TierPicker value={maxGuests} onChange={pickTier} inline />

        {tier.priceCents > 0 && (
          <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
        )}

        {needEmail && (
          <div className="field" style={{ marginTop: 22 }}>
            <label>Votre adresse mail</label>
            <input type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr"
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} />
          </div>
        )}

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
          <button className="btn btn-accent" type="submit" disabled={loading}>{label}</button>
        </div>
      </form>

      <div className="footer-note" style={{ marginTop: 24 }}>PAIEMENT UNIQUE · SANS ABONNEMENT</div>
    </main>
  )
}

export default function ExpressPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <ExpressForm />
    </Suspense>
  )
}
