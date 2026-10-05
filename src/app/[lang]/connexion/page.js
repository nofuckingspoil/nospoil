'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { applyLogin, getAccountEmail } from '../../../lib/device'
import { useLangue } from '../../../components/Langue'

function Connexion() {
  const { t, lang, lien } = useLangue()
  const router = useRouter()
  const sp = useSearchParams()
  const magicToken = sp.get('t')
  // Arrivé depuis un tableau de bord verrouillé : on parle à l'organisateur.
  const versTableau = (sp.get('next') || '').startsWith('/event/')

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

  // Connexion réussie : on garde les accès puis on file au tableau de bord, 
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
      body: JSON.stringify({ token: magicToken, langue: lang }),
    })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || t({ fr: 'Connexion impossible.', en: 'Could not sign in.', de: 'Anmeldung nicht möglich.' }))
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
        body: JSON.stringify({ email: email.trim(), langue: lang, next: sp.get('next') || undefined }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || t({ fr: 'Envoi impossible.', en: 'Could not send.', de: 'Senden nicht möglich.' }))
      setStep('code'); setCode('')
      setInfo(t({ fr: 'Mail envoyé ! Pensez à vérifier vos spams.', en: 'Email sent! Remember to check your spam folder.', de: 'E-Mail gesendet! Schauen Sie auch im Spam-Ordner nach.' }))
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // --- Étape 2 : vérification du code à 6 chiffres ---
  async function submitCode(e) {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code, langue: lang }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || t({ fr: 'Code incorrect.', en: 'Incorrect code.', de: 'Falscher Code.' }))
      onSuccess(d)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  if (step === 'magic') return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <p className="muted" style={{ marginTop: 22 }}>{t({ fr: 'Connexion en cours…', en: 'Signing you in…', de: 'Anmeldung läuft…' })}</p>
      <div className="spacer" />
    </main>
  )

  return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Link href={lien('/')} style={{ textDecoration: 'none' }}><Logo /></Link>

      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        {step === 'email' ? (
          <>
            {versTableau ? (
              <>
                <h2 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Ouvrir mon tableau de bord', en: 'Open my dashboard', de: 'Mein Dashboard öffnen' })}</h2>
                <p className="muted small" style={{ marginBottom: 18 }}>
                  {t({
                    fr: "Entrez l'adresse mail de l'organisateur ou d'un co-organisateur. Vous recevrez un code à 6 chiffres, et un bouton qui vous ramène directement ici.",
                    en: 'Enter the email address of the host or a co-host. You will get a 6-digit code, and a button that brings you straight back here.',
                    de: 'Geben Sie die E-Mail-Adresse des Gastgebers oder eines Mitorganisators ein. Sie erhalten einen 6-stelligen Code und einen Button, der Sie direkt hierher zurückbringt.',
                  })}
                </p>
              </>
            ) : (
              <>
            <h2 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Retrouver mes photos', en: 'Find my photos', de: 'Meine Fotos wiederfinden' })}</h2>
            {/* Deux publics sur la même page, et c'est voulu : l'organisateur
                qui revient sur son tableau de bord, et le participant qui a
                perdu le lien de l'album. Le texte doit parler aux deux, sinon
                le second croit s'être trompé d'endroit et repart. */}
            <p className="muted small" style={{ marginBottom: 18 }}>
              {t({
                fr: "Entrez votre adresse mail. Que vous ayez créé l'événement ou simplement photographié la soirée, vous recevrez le lien qui vous y ramène. Aucun mot de passe à retenir.",
                en: 'Enter your email address. Whether you created the event or just took photos at it, you will get a link that takes you back there. No password to remember.',
                de: 'Geben Sie Ihre E-Mail-Adresse ein. Ob Sie das Event erstellt oder einfach mitfotografiert haben: Sie erhalten einen Link, der Sie zurückbringt. Kein Passwort nötig.',
              })}
            </p>
              </>
            )}
            <form onSubmit={requestCode}>
              <div className="field">
                <label>{t({ fr: 'Votre adresse mail', en: 'Your email address', de: 'Ihre E-Mail-Adresse' })}</label>
                <input type="email" inputMode="email" autoComplete="email" placeholder={t({ fr: 'vous@exemple.fr', en: 'you@example.com', de: 'sie@beispiel.de' })}
                  value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              {error && <div className="err" style={{ marginTop: 4 }}>{error}</div>}
              <button className="btn btn-accent" type="submit" disabled={loading || !email.trim()}>
                {loading ? t({ fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' }) : (versTableau
                  ? t({ fr: 'Recevoir mon code →', en: 'Get my code →', de: 'Meinen Code erhalten →' })
                  : t({ fr: 'Recevoir mon lien de connexion →', en: 'Send me my sign-in link →', de: 'Anmeldelink erhalten →' }))}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Vérifiez vos mails', en: 'Check your email', de: 'Schauen Sie in Ihre E-Mails' })}</h2>
            {/* Formulation prudente : le site ne dit jamais si l'adresse saisie
                correspond à un organisateur. Sinon, en essayant des adresses
                une par une, on reconstituerait la liste des clients. */}
            <p className="muted small" style={{ marginBottom: 18 }}>
              {t({
                fr: <>Si un événement est associé à <strong>{email}</strong>, un mail vient de partir. Cliquez sur le bouton qu'il contient, ou saisissez ici le code à 6 chiffres.</>,
                en: <>If an event is linked to <strong>{email}</strong>, an email is on its way. Click the button inside it, or enter the 6-digit code here.</>,
                de: <>Wenn ein Event mit <strong>{email}</strong> verknüpft ist, wurde soeben eine E-Mail verschickt. Klicken Sie auf den Button darin oder geben Sie hier den 6-stelligen Code ein.</>,
              })}
            </p>
            <p className="muted small" style={{ marginBottom: 18 }}>
              {t({
                fr: "Vous étiez simplement invité à la soirée ? Votre mail contient un lien direct vers vos photos : il n'y a pas de code à saisir ici.",
                en: 'Were you just a guest at the event? Your email contains a direct link to your photos: there is no code to enter here.',
                de: 'Sie waren nur Gast bei der Feier? Ihre E-Mail enthält einen direkten Link zu Ihren Fotos: Hier müssen Sie keinen Code eingeben.',
              })}
            </p>
            <form onSubmit={submitCode}>
              <div className="field">
                <label>{t({ fr: 'Code à 6 chiffres', en: '6-digit code', de: '6-stelliger Code' })}</label>
                <input type="text" inputMode="numeric" autoComplete="one-time-code"
                  placeholder="000000" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 26, letterSpacing: '.24em', textAlign: 'center' }} />
              </div>
              {info && !error && <div className="notice" style={{ marginBottom: 12 }}>{info}</div>}
              {error && <div className="err" style={{ marginTop: 4 }}>{error}</div>}
              <button className="btn btn-accent" type="submit" disabled={loading || code.length !== 6}>
                {loading ? t({ fr: 'Vérification…', en: 'Checking…', de: 'Wird geprüft…' }) : t({ fr: 'Me connecter →', en: 'Sign in →', de: 'Anmelden →' })}
              </button>
            </form>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} disabled={loading} onClick={requestCode}>
              {t({ fr: 'Renvoyer un mail', en: 'Resend the email', de: 'E-Mail erneut senden' })}
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 4 }}
              onClick={() => { setStep('email'); setError(''); setInfo('') }}>
              {t({ fr: "Changer d'adresse", en: 'Use a different address', de: 'Andere Adresse verwenden' })}
            </button>
          </>
        )}
      </div>

      <p className="muted small center" style={{ marginTop: 18 }}>
        {t({ fr: "Pas encore d'événement ?", en: 'No event yet?', de: 'Noch kein Event?' })}{' '}
        <Link href={`${lien('/')}#tarifs`} style={{ color: 'var(--accent-deep)' }}>{t({ fr: 'En créer un', en: 'Create one', de: 'Jetzt erstellen' })}</Link>
      </p>
      <div className="spacer" />
    </main>
  )
}

export default function ConnexionPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <Connexion />
    </Suspense>
  )
}
