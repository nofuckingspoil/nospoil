'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '../../../components/Logo'
import { rememberMyEvent, saveAccount } from '../../../lib/device'

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
        const email = sessionStorage.getItem(EMAIL_KEY)
        if (email) saveAccount(email)

        // Photo de couverture mise de côté avant le paiement : on l'envoie maintenant.
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
