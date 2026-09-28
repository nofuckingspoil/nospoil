'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { getDeviceToken, saveGuest } from '../../../lib/device'
import { useLangue } from '../../../components/Langue'

// ============================================================
//  « Retrouver mes photos » : reconnexion d'un participant.
//
//  Ouvre le lien reçu par mail, rattache ses participations à ce
//  navigateur, et les liste : la même adresse peut avoir photographié
//  plusieurs événements.
// ============================================================

function frDate(iso, locale = 'fr-FR') {
  try {
    return new Date(iso).toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

function MesPhotosInner() {
  const { t, locale, lien } = useLangue()
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
        if (!r.ok) throw new Error(d.error || t({ fr: 'Lien invalide.', en: 'Invalid link.', de: 'Ungültiger Link.' }))
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
    return <main className="center-screen"><p className="muted">{t({ fr: 'Nous retrouvons vos photos…', en: 'Finding your photos…', de: 'Wir suchen Ihre Fotos…' })}</p></main>
  }

  if (etat === 'sans-lien' || etat === 'erreur') {
    return (
      <main className="screen screen-cream">
        <Link href={lien('/')} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <div className="card" style={{ marginTop: 26 }}>
          <h1 className="h3" style={{ marginBottom: 8 }}>{t({ fr: 'Retrouver mes photos', en: 'Find my photos', de: 'Meine Fotos wiederfinden' })}</h1>
          <p className="muted small">
            {etat === 'erreur'
              ? error
              : t({ fr: "Ouvrez le lien que vous avez reçu par mail en rejoignant l'événement : il rattache vos photos à ce téléphone.", en: 'Open the link you received by email when you joined the event: it links your photos to this phone.', de: 'Öffnen Sie den Link, den Sie beim Beitritt zum Event per E-Mail erhalten haben: Er verknüpft Ihre Fotos mit diesem Handy.' })}
          </p>
          <Link href="/connexion" className="btn btn-accent" style={{ marginTop: 16 }}>
            {t({ fr: 'Me renvoyer mon lien par mail →', en: 'Email me my link again →', de: 'Link erneut per E-Mail senden →' })}
          </Link>
          <div className="notice" style={{ marginTop: 16 }}>
            {t({
              fr: "✉️ Vous n'avez pas laissé votre adresse ? Demandez le lien de l'événement à son organisateur : vos photos y sont toujours.",
              en: "✉️ Didn't leave your address? Ask the host for the event link: your photos are still there.",
              de: '✉️ Sie haben keine Adresse hinterlassen? Fragen Sie den Gastgeber nach dem Link zum Event: Ihre Fotos sind noch da.',
            })}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-cream">
      <Link href={lien('/')} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      <header className="db-head">
        <h1 className="h2">{t({ fr: 'Vos photos', en: 'Your photos', de: 'Ihre Fotos' })}</h1>
        <p className="muted small">
          {events.length > 1
            ? t({ fr: `Vous avez participé à ${events.length} événements. Tout est rattaché à ce téléphone.`, en: `You have taken part in ${events.length} events. Everything is linked to this phone.`, de: `Sie waren bei ${events.length} Events dabei. Alles ist mit diesem Handy verknüpft.` })
            : t({ fr: 'Vos photos sont rattachées à ce téléphone.', en: 'Your photos are linked to this phone.', de: 'Ihre Fotos sind mit diesem Handy verknüpft.' })}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        {events.map((e) => {
          const revele = e.revealAt && new Date(e.revealAt).getTime() <= Date.now()
          return (
            <div key={e.eventId} className="card">
              <div className="eyebrow-mute" style={{ marginBottom: 4 }}>
                {e.startsAt ? frDate(e.startsAt, locale) : ''}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                {e.hostNames || e.eventName}
              </div>
              <p className="muted small" style={{ marginBottom: 14 }}>
                {e.myPhotos > 0
                  ? t({
                      fr: `${e.myPhotos} photo${e.myPhotos > 1 ? 's' : ''} prise${e.myPhotos > 1 ? 's' : ''} par vous.`,
                      en: `${e.myPhotos} photo${e.myPhotos > 1 ? 's' : ''} taken by you.`,
                      de: `${e.myPhotos} ${e.myPhotos > 1 ? 'Fotos' : 'Foto'} von Ihnen aufgenommen.`,
                    })
                  : t({ fr: "Vous n'avez pas encore pris de photo.", en: "You haven't taken any photos yet.", de: 'Sie haben noch kein Foto aufgenommen.' })}
                {' '}
                {revele
                  ? t({ fr: "L'album est ouvert.", en: 'The album is open.', de: 'Das Album ist geöffnet.' })
                  : t({ fr: `Révélation le ${frDate(e.revealAt)}.`, en: `Reveal on ${frDate(e.revealAt, locale)}.`, de: `Enthüllung am ${frDate(e.revealAt, locale)}.` })}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/j/${e.eventId}`} className="btn btn-accent" style={{ flex: 1 }}>
                  {t({ fr: '📷 Mon appareil', en: '📷 My camera', de: '📷 Meine Kamera' })}
                </Link>
                <Link href={`/g/${e.eventId}`} className="btn btn-ghost" style={{ flex: 1 }}>
                  {revele ? t({ fr: "Voir l'album", en: 'View the album', de: 'Album ansehen' }) : t({ fr: "L'album", en: 'The album', de: 'Das Album' })}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="notice" style={{ marginTop: 18 }}>
        {t({ fr: "💡 Gardez le mail : c'est lui qui vous permettra de revenir depuis un autre téléphone.", en: '💡 Keep the email: it is what lets you come back from another phone.', de: '💡 Behalten Sie die E-Mail: Damit kommen Sie auch von einem anderen Handy zurück.' })}
      </div>
    </main>
  )
}

export default function MesPhotosPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <MesPhotosInner />
    </Suspense>
  )
}
