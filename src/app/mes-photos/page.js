'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { getDeviceToken, saveGuest } from '../../lib/device'

// ============================================================
//  « Retrouver mes photos » — reconnexion d'un invité.
//
//  Ouvre le lien reçu par mail, rattache ses participations à ce
//  navigateur, et les liste : la même adresse peut avoir photographié
//  plusieurs événements.
// ============================================================

function frDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

function MesPhotosInner() {
  const sp = useSearchParams()
  const [etat, setEtat] = useState('chargement') // 'chargement' | 'ok' | 'erreur' | 'sans-lien'
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sp.get('t')
    if (!token) { setEtat('sans-lien'); return }
    let annule = false
    ;(async () => {
      try {
        const r = await fetch('/api/guest/restore', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, deviceToken: getDeviceToken() }),
        })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Lien invalide.')
        if (annule) return

        // Identité rétablie côté navigateur : l'appareil photo et l'album le
        // reconnaîtront comme avant.
        for (const e of d.events) saveGuest(e.eventId, e.guestId, e.displayName, d.email)
        setEvents(d.events)
        setEtat('ok')
      } catch (err) {
        if (!annule) { setError(err.message); setEtat('erreur') }
      }
    })()
    return () => { annule = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (etat === 'chargement') {
    return <main className="center-screen"><p className="muted">Nous retrouvons vos photos…</p></main>
  }

  if (etat === 'sans-lien' || etat === 'erreur') {
    return (
      <main className="screen screen-cream">
        <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <div className="card" style={{ marginTop: 26 }}>
          <h1 className="h3" style={{ marginBottom: 8 }}>Retrouver mes photos</h1>
          <p className="muted small">
            {etat === 'erreur'
              ? error
              : "Ouvrez le lien que vous avez reçu par mail en rejoignant l'événement : il rattache vos photos à ce téléphone."}
          </p>
          <div className="notice" style={{ marginTop: 16 }}>
            ✉️ Vous n'avez pas laissé votre adresse ? Demandez le lien de l'événement
            à son organisateur : vos photos y sont toujours.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-cream">
      <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      <header className="db-head">
        <h1 className="h2">Vos photos</h1>
        <p className="muted small">
          {events.length > 1
            ? `Vous avez participé à ${events.length} événements. Tout est rattaché à ce téléphone.`
            : 'Vos photos sont rattachées à ce téléphone.'}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        {events.map((e) => {
          const revele = e.revealAt && new Date(e.revealAt).getTime() <= Date.now()
          return (
            <div key={e.eventId} className="card">
              <div className="eyebrow-mute" style={{ marginBottom: 4 }}>
                {e.startsAt ? frDate(e.startsAt) : ''}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                {e.hostNames || e.eventName}
              </div>
              <p className="muted small" style={{ marginBottom: 14 }}>
                {e.myPhotos > 0
                  ? `${e.myPhotos} photo${e.myPhotos > 1 ? 's' : ''} prise${e.myPhotos > 1 ? 's' : ''} par vous.`
                  : "Vous n'avez pas encore pris de photo."}
                {' '}
                {revele ? "L'album est ouvert." : `Révélation le ${frDate(e.revealAt)}.`}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/j/${e.eventId}`} className="btn btn-accent" style={{ flex: 1 }}>
                  📷 Mon appareil
                </Link>
                <Link href={`/g/${e.eventId}`} className="btn btn-ghost" style={{ flex: 1 }}>
                  {revele ? "Voir l'album" : "L'album"}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="notice" style={{ marginTop: 18 }}>
        💡 Gardez le mail : c'est lui qui vous permettra de revenir depuis un autre téléphone.
      </div>
    </main>
  )
}

export default function MesPhotosPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <MesPhotosInner />
    </Suspense>
  )
}
