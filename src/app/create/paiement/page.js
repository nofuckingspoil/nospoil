'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '../../../components/Logo'
import { rememberMyEvent, saveAccount } from '../../../lib/device'
import { track } from '../../../lib/tracking'

// Le tunnel long (/create) demande la couverture AVANT le paiement : il la met
// de côté, compressée, le temps de l'aller-retour Stripe. Les tunnels courts ne
// s'en servent pas — les clés sont alors simplement absentes.
const COVER_KEY = 'declic_pending_cover'
const EMAIL_KEY = 'declic_pending_email'

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(',')
  const mime = head.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

function PaiementInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = sp.get('session_id')
    if (!sessionId) { setError('Paiement introuvable.'); return }
    let done = false
    ;(async () => {
      try {
        const res = await fetch('/api/checkout/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur.')
        if (done) return

        rememberMyEvent(data.id)

        // Publicité : la vente. C'est CE signal que les campagnes apprennent à
        // reproduire, d'où le vrai montant encaissé (remise déduite).
        //
        // La route est rappelable sans risque : rechargée, elle renvoie le même
        // événement. L'identifiant transmis à Meta permet alors de reconnaître
        // la vente déjà connue au lieu de la compter deux fois. Les événements
        // de test (codes fondateur) ne sont pas déclarés — ils pollueraient
        // l'apprentissage avec des ventes à 0 €.
        if (!data.isTest && (data.paidCents || 0) > 0) {
          track('Purchase', {
            value: data.paidCents / 100,
            currency: 'EUR',
          }, { eventID: `purchase_${data.id}` })
        }

        // L'adresse vient soit du tunnel (mise de côté avant le paiement), soit
        // de Stripe. On la retient pour permettre de se reconnecter depuis
        // n'importe quel appareil.
        const email = sessionStorage.getItem(EMAIL_KEY) || data.ownerEmail
        if (email) saveAccount(String(email).toLowerCase())

        // Couverture choisie avant le paiement : c'est maintenant qu'on l'envoie.
        const cover = sessionStorage.getItem(COVER_KEY)
        if (cover) {
          try {
            const fd = new FormData()
            fd.append('file', dataUrlToBlob(cover), 'cover.jpg')
            fd.append('ownerToken', data.ownerToken)
            await fetch(`/api/events/${data.id}/cover`, { method: 'POST', body: fd })
          } catch {}
        }
        sessionStorage.removeItem(COVER_KEY)
        sessionStorage.removeItem(EMAIL_KEY)

        router.replace(`/event/${data.id}`)
      } catch (err) { if (!done) setError(err.message) }
    })()
    return () => { done = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%', textAlign: 'center' }}>
        {error ? (
          <>
            <h2 className="h3" style={{ marginBottom: 8 }}>Un souci est survenu</h2>
            <p className="muted small" style={{ marginBottom: 16 }}>{error}</p>
            <a className="btn btn-dark" href="/mes-evenements">Voir mes événements</a>
          </>
        ) : (
          <>
            <h2 className="h3" style={{ marginBottom: 8 }}>Paiement confirmé ✅</h2>
            <p className="muted small">On prépare votre événement…</p>
          </>
        )}
      </div>
      <div className="spacer" />
    </main>
  )
}

export default function PaiementPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <PaiementInner />
    </Suspense>
  )
}
