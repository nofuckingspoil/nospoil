'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { getMyEvents, getOwnerToken, getAccountEmail, signOut } from '../../../lib/device'
import { nomAffiche } from '../../../lib/event-defaults'
import { useLangue } from '../../../components/Langue'

function fmtDate(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

export default function MyEvents() {
  const { t, lang, locale, lien } = useLangue()
  const [events, setEvents] = useState(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    setEmail(getAccountEmail() || '')
    const ids = getMyEvents()
    if (!ids.length) { setEvents([]); return }
    // Un seul appel, quel que soit le nombre d'événements. Il y en avait un par
    // événement : deux pour un particulier, quarante-cinq pour l'équipe.
    fetch('/api/mes-evenements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acces: ids.map((id) => ({ id, token: getOwnerToken(id) })) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEvents(Array.isArray(d?.events) ? d.events : []))
      .catch(() => setEvents([]))
  }, [])

  function disconnect() {
    signOut()
    setEmail(''); setEvents([])
  }

  return (
    <div className="site">
      <nav className="vnav">
        <Link href={lien('/')} style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/create?tier=5" className="btn btn-dark">{t({ fr: 'Nouvel événement', en: 'New event', de: 'Neues Event' })}</Link>
      </nav>

      <div className="site-inner" style={{ maxWidth: 560, paddingBottom: 60 }}>
        <h1 className="h2" style={{ margin: '20px 0 6px' }}>{t({ fr: 'Mes événements', en: 'My events', de: 'Meine Events' })}</h1>
        {email ? (
          <p className="muted small" style={{ marginBottom: 22 }}>
            {t({ fr: <>Connecté avec <strong>{email}</strong></>, en: <>Signed in as <strong>{email}</strong></>, de: <>Angemeldet als <strong>{email}</strong></> })} ·{' '}
            <button onClick={disconnect}
              style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'var(--accent-deep)', cursor: 'pointer' }}>
              {t({ fr: 'se déconnecter', en: 'sign out', de: 'abmelden' })}
            </button>
          </p>
        ) : (
          <p className="muted small" style={{ marginBottom: 22 }}>{t({ fr: 'Les événements accessibles depuis cet appareil.', en: 'The events you can access from this device.', de: 'Die Events, auf die Sie von diesem Gerät aus zugreifen können.' })}</p>
        )}

        {events === null && <p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p>}

        {events && events.length === 0 && (
          <div className="card center" style={{ padding: 30 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎞️</div>
            <h3 className="h3" style={{ marginBottom: 8 }}>{t({ fr: 'Aucun événement ici', en: 'No events here', de: 'Hier gibt es keine Events' })}</h3>
            <p className="muted small" style={{ marginBottom: 18 }}>
              {t({ fr: "Cet appareil n'a accès à aucun événement. Connectez-vous avec votre mail pour retrouver les vôtres.", en: 'This device does not have access to any events. Sign in with your email to find yours.', de: 'Dieses Gerät hat keinen Zugriff auf Events. Melden Sie sich mit Ihrer E-Mail an, um Ihre wiederzufinden.' })}
            </p>
            <Link href="/connexion" className="btn btn-accent">{t({ fr: 'Me connecter par mail →', en: 'Sign in by email →', de: 'Per E-Mail anmelden →' })}</Link>
            <Link href="/create?tier=5" className="btn btn-ghost" style={{ marginTop: 10 }}>{t({ fr: 'Créer un événement', en: 'Create an event', de: 'Event erstellen' })}</Link>
          </div>
        )}

        {events && events.map((e) => (
          <Link key={e.id} href={`/event/${e.id}`} className="ev-card">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{nomAffiche(e.name, lang)}</div>
              <div className="ev-meta">
                {t({ fr: 'Révélation', en: 'Reveal', de: 'Enthüllung' })} {fmtDate(e.revealAt, locale)} ·{' '}
                {e.revealed ? t({ fr: 'révélé', en: 'revealed', de: 'enthüllt' }) : t({ fr: 'en cours', en: 'in progress', de: 'läuft' })}
              </div>
            </div>
            <div className="ev-counts">
              <div className="n">{e.photoCount ?? 0}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text3)' }}>PHOTOS</div>
            </div>
          </Link>
        ))}

        {events && events.length > 0 && (
          <p className="muted small center" style={{ marginTop: 24 }}>
            {t({ fr: 'Il manque un événement ?', en: 'Missing an event?', de: 'Fehlt ein Event?' })}{' '}
            <Link href="/connexion" style={{ color: 'var(--accent-deep)' }}>{t({ fr: 'Se connecter par mail', en: 'Sign in by email', de: 'Per E-Mail anmelden' })}</Link>
          </p>
        )}
      </div>
    </div>
  )
}
