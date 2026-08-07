'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import Avis from '../../components/Avis'
import { ACCROCHE } from '../../lib/avis'

// ============================================================
//  La page d'enquête, ouverte depuis un mail.
//
//  Deux publics, un seul écran : l'organisateur arrive avec ?o=…, l'invité
//  qui n'est jamais allé jusqu'à l'album avec ?i=…. Le jeton du lien suffit à
//  savoir qui parle — rien à créer, rien à retenir, aucune connexion.
//
//  ?i=…&stop=1 est le lien de désinscription du pied de mail. Il agit tout de
//  suite : quelqu'un qui n'a jamais demandé à recevoir un questionnaire ne
//  doit pas avoir à remplir un formulaire pour s'en défaire.
// ============================================================

function Cadre({ children }) {
  return (
    <main className="screen screen-cream center">
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Logo />
        </div>
        {children}
      </div>
    </main>
  )
}

function AvisInner() {
  const sp = useSearchParams()
  const jetonOrga = sp.get('o')
  const jetonInvite = sp.get('i')
  const veutArreter = sp.get('stop') === '1'

  const [etat, setEtat] = useState('chargement') // chargement | ok | deja | erreur | desinscrit
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!jetonOrga && !jetonInvite) { setEtat('erreur'); return }

    if (veutArreter && jetonInvite) {
      fetch('/api/feedback/stop', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: jetonInvite }),
      })
        .then(() => setEtat('desinscrit'))
        .catch(() => setEtat('desinscrit'))
      return
    }

    const q = jetonOrga ? `o=${encodeURIComponent(jetonOrga)}` : `i=${encodeURIComponent(jetonInvite)}`
    fetch(`/api/feedback?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setEtat('erreur'); return }
        setInfo(d)
        setEtat(d.deja ? 'deja' : 'ok')
      })
      .catch(() => setEtat('erreur'))
  }, [jetonOrga, jetonInvite, veutArreter])

  if (etat === 'chargement') {
    return <Cadre><p className="muted" style={{ textAlign: 'center' }}>Un instant…</p></Cadre>
  }

  if (etat === 'desinscrit') {
    return (
      <Cadre>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>✓</div>
          <h3 className="h3" style={{ marginBottom: 6 }}>C’est noté</h3>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Vous ne recevrez plus de questionnaire de notre part. Le lien de l’album,
            lui, vous reste dû : c’est pour cela que vous aviez laissé votre adresse.
          </p>
        </div>
      </Cadre>
    )
  }

  if (etat === 'erreur') {
    return (
      <Cadre>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🔍</div>
          <h3 className="h3" style={{ marginBottom: 6 }}>Ce lien ne mène nulle part</h3>
          <p className="muted small">
            Il a peut-être été coupé en deux par votre messagerie. Réessayez en
            cliquant depuis le mail plutôt qu’en recopiant l’adresse.
          </p>
          <Link className="btn btn-ghost" href="/" style={{ marginTop: 8 }}>Retour à l’accueil</Link>
        </div>
      </Cadre>
    )
  }

  if (etat === 'deja') {
    return (
      <Cadre>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🎞️</div>
          <h3 className="h3" style={{ marginBottom: 6 }}>Vous avez déjà répondu</h3>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Et c’était précieux — merci. On ne vous redemandera rien.
          </p>
        </div>
      </Cadre>
    )
  }

  const orga = info?.role === 'organisateur'
  return (
    <Cadre>
      <div className="card">
        <p className="eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>{ACCROCHE}</p>
        <h2 className="h3" style={{ marginBottom: 8 }}>
          {orga ? 'Votre avis, vraiment' : 'Dites-nous ce que vous en avez pensé'}
        </h2>
        <p className="muted small" style={{ marginBottom: 20 }}>
          {info?.eventName
            ? <>À propos de « <strong>{info.eventName}</strong> ». </>
            : null}
          {orga
            ? 'On construit encore beaucoup de choses, et ce que vous direz pèse lourd à ce stade. Deux minutes.'
            : 'Trente secondes, et ça nous aide à corriger ce qui ne va pas encore.'}
        </p>
        <Avis
          role={orga ? 'organisateur' : 'invite'}
          payload={orga ? { o: jetonOrga } : { i: jetonInvite }}
        />
      </div>
      {!orga && jetonInvite && (
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 14 }}>
          <Link href={`/avis?i=${encodeURIComponent(jetonInvite)}&stop=1`} style={{ color: 'var(--text4)' }}>
            Ne plus recevoir de message de ce type
          </Link>
        </p>
      )}
    </Cadre>
  )
}

export default function AvisPage() {
  return (
    <Suspense fallback={<Cadre><p className="muted" style={{ textAlign: 'center' }}>Un instant…</p></Cadre>}>
      <AvisInner />
    </Suspense>
  )
}
