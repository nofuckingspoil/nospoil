'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '../../../../components/Logo'
import { rememberMyEvent, saveAccount } from '../../../../lib/device'
import { track } from '../../../../lib/tracking'
import { noterEtape } from '../../../../lib/etapes'
import { useLangue } from '../../../../components/Langue'

// Le tunnel long (/create) demande la couverture AVANT le paiement : il la met
// de côté, compressée, le temps de l'aller-retour Stripe. Les tunnels courts ne
// s'en servent pas : les clés sont alors simplement absentes.
const COVER_KEY = 'declic_pending_cover'
const COVERPOS_KEY = 'declic_pending_coverpos'
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
  const { t } = useLangue()
  const router = useRouter()
  const sp = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = sp.get('session_id')
    if (!sessionId) { setError(t({ fr: 'Paiement introuvable.', en: 'Payment not found.', de: 'Zahlung nicht gefunden.' })); return }
    let done = false
    ;(async () => {
      try {
        const res = await fetch('/api/checkout/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
        if (done) return

        rememberMyEvent(data.id)
        noterEtape('crea_termine', { eventId: data.id, detail: 'payant' })

        // Publicité : la vente. C'est CE signal que les campagnes apprennent à
        // reproduire, d'où le vrai montant encaissé (remise déduite).
        //
        // La route est rappelable sans risque : rechargée, elle renvoie le même
        // événement. L'identifiant transmis à Meta permet alors de reconnaître
        // la vente déjà connue au lieu de la compter deux fois. Les événements
        // de test (codes fondateur) ne sont pas déclarés : ils pollueraient
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
            // Le cadrage réglé dans l'assistant, mis de côté avec la photo.
            const pos = sessionStorage.getItem(COVERPOS_KEY)
            if (pos && pos !== '50% 50%') {
              await fetch(`/api/events/${data.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-owner-token': data.ownerToken },
                body: JSON.stringify({ coverPos: pos }),
              })
            }
          } catch {}
        }
        sessionStorage.removeItem(COVER_KEY)
        sessionStorage.removeItem(COVERPOS_KEY)
        sessionStorage.removeItem(EMAIL_KEY)

        // Création courte : le paramétrage vient maintenant, la vente est faite.
        let parametrer = false
        try { parametrer = sessionStorage.getItem('ttf_parametrer') === '1'; sessionStorage.removeItem('ttf_parametrer') } catch {}
        router.replace(parametrer ? `/create/parametrer?event=${data.id}&debut=1` : `/event/${data.id}?cree=1`)
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
            <h2 className="h3" style={{ marginBottom: 8 }}>{t({ fr: 'Un souci est survenu', en: 'Something went wrong', de: 'Es ist ein Problem aufgetreten' })}</h2>
            <p className="muted small" style={{ marginBottom: 16 }}>{error}</p>
            <a className="btn btn-dark" href="/mes-evenements">{t({ fr: 'Voir mes événements', en: 'See my events', de: 'Meine Events ansehen' })}</a>
          </>
        ) : (
          <>
            <h2 className="h3" style={{ marginBottom: 8 }}>{t({ fr: 'Paiement confirmé ✅', en: 'Payment confirmed ✅', de: 'Zahlung bestätigt ✅' })}</h2>
            <p className="muted small">{t({ fr: 'On prépare votre événement…', en: 'Getting your event ready…', de: 'Wir bereiten Ihr Event vor…' })}</p>
          </>
        )}
      </div>
      <div className="spacer" />
    </main>
  )
}

export default function PaiementPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <PaiementInner />
    </Suspense>
  )
}
