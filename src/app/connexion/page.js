'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { applyLogin, getAccountEmail } from '../../lib/device'

function Connexion() {
  const router = useRouter()
  const sp = useSearchParams()
  const magicToken = sp.get('t')

  // 'email' : on demande l'adresse · 'code' : on attend les 6 chiffres · 'magic' : lien cliqué
  const [step, setStep] = useState(magicToken ? 'magic' : 'email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const magicDone = useRef(false)

  useEffect(() => {
    const known = getAccountEmail()
    if (known) setEmail(known)
  }, [])

  // Connexion réussie : on garde les accès puis on file au tableau de bord —
  // sauf si la personne venait d'ailleurs (le guide, par exemple) : `next` la
  // ramène là où elle était. On n'accepte qu'un chemin interne, jamais une
  // adresse complète : un lien de connexion ne doit pas pouvoir renvoyer
  // ailleurs que sur le site.
  function onSuccess(data) {
    applyLogin(data.email, data.events)
    const next = sp.get('next')
    if (next && next.startsWith('/') && !next.startsWith('//')) { router.replace(next); return }
    if (data.events?.length === 1) router.replace(`/event/${data.events[0].id}`)
    else router.replace('/mes-evenements')
  }

  // --- Lien magique : on vérifie le jeton dès l'ouverture de la page ---
  useEffect(() => {
    if (!magicToken || magicDone.current) return
    magicDone.current = true
    fetch('/api/auth/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: magicToken }),
    })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Connexion impossible.')
        onSuccess(d)
      })
      .catch((err) => { setError(err.message); setStep('email') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magicToken])

  // --- Étape 1 : envoi du mail ---
  async function requestCode(e) {
    e?.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Envoi impossible.')
      setStep('code'); setCode('')
      setInfo('Mail envoyé ! Pensez à vérifier vos spams.')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // --- Étape 2 : vérification du code à 6 chiffres ---
  async function submitCode(e) {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Code incorrect.')
      onSuccess(d)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  if (step === 'magic') return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <p className="muted" style={{ marginTop: 22 }}>Connexion en cours…</p>
      <div className="spacer" />
    </main>
  )

  return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>

      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        {step === 'email' ? (
          <>
            <h2 className="h3" style={{ marginBottom: 6 }}>Retrouver mes événements</h2>
            <p className="muted small" style={{ marginBottom: 18 }}>
              Entrez le mail utilisé à la création. Vous recevrez un lien de connexion — aucun mot de passe à retenir.
            </p>
            <form onSubmit={requestCode}>
              <div className="field">
                <label>Votre adresse mail</label>
                <input type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              {error && <div className="err" style={{ marginTop: 4 }}>{error}</div>}
              <button className="btn btn-accent" type="submit" disabled={loading || !email.trim()}>
                {loading ? 'Envoi…' : 'Recevoir mon lien de connexion →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="h3" style={{ marginBottom: 6 }}>Vérifiez vos mails</h2>
            <p className="muted small" style={{ marginBottom: 18 }}>
              Un mail vient de partir à <strong>{email}</strong>. Cliquez sur le bouton qu'il contient,
              ou saisissez ici le code à 6 chiffres.
            </p>
            <form onSubmit={submitCode}>
              <div className="field">
                <label>Code à 6 chiffres</label>
                <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  placeholder="000000" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 26, letterSpacing: '.24em', textAlign: 'center' }} />
              </div>
              {info && !error && <div className="notice" style={{ marginBottom: 12 }}>{info}</div>}
              {error && <div className="err" style={{ marginTop: 4 }}>{error}</div>}
              <button className="btn btn-accent" type="submit" disabled={loading || code.length !== 6}>
                {loading ? 'Vérification…' : 'Me connecter →'}
              </button>
            </form>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} disabled={loading} onClick={requestCode}>
              Renvoyer un mail
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 4 }}
              onClick={() => { setStep('email'); setError(''); setInfo('') }}>
              Changer d'adresse
            </button>
          </>
        )}
      </div>

      <p className="muted small center" style={{ marginTop: 18 }}>
        Pas encore d'événement ? <Link href="/#tarifs" style={{ color: 'var(--accent-deep)' }}>En créer un</Link>
      </p>
      <div className="spacer" />
    </main>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <Connexion />
    </Suspense>
  )
}
