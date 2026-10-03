'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import Avis from '../../../components/Avis'
import { accroche } from '../../../lib/avis'
import { useLangue } from '../../../components/Langue'

// ============================================================
//  La page d'enquête, ouverte depuis un mail.
//
//  Deux publics, un seul écran : l'organisateur arrive avec ?o=…, le participant
//  qui n'est jamais allé jusqu'à l'album avec ?i=…. Le jeton du lien suffit à
//  savoir qui parle : rien à créer, rien à retenir, aucune connexion.
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
  const { t, lang, lien } = useLangue()
  const sp = useSearchParams()
  const jetonOrga = sp.get('o')
  const jetonInvite = sp.get('i')
  const veutArreter = sp.get('stop') === '1'
  const noteMail = sp.get('note')

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
    return <Cadre><p className="muted" style={{ textAlign: 'center' }}>{t({ fr: 'Un instant…', en: 'One moment…', de: 'Einen Moment…' })}</p></Cadre>
  }

  if (etat === 'desinscrit') {
    return (
      <Cadre>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>✓</div>
          <h3 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'C’est noté', en: 'Noted', de: 'Alles klar' })}</h3>
          <p className="muted small" style={{ marginBottom: 0 }}>
            {t({
              fr: 'Vous ne recevrez plus de questionnaire de notre part. Le lien de l’album, lui, vous reste dû : c’est pour cela que vous aviez laissé votre adresse.',
              en: 'You will not receive any more surveys from us. You will still get the album link, though: that is why you left your address.',
              de: 'Sie erhalten keine Umfragen mehr von uns. Den Link zum Album bekommen Sie aber trotzdem: Genau dafür haben Sie Ihre Adresse hinterlassen.',
            })}
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
          <h3 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Ce lien ne mène nulle part', en: 'This link leads nowhere', de: 'Dieser Link führt nirgendwohin' })}</h3>
          <p className="muted small">
            {t({
              fr: 'Il a peut-être été coupé en deux par votre messagerie. Réessayez en cliquant depuis le mail plutôt qu’en recopiant l’adresse.',
              en: 'Your email app may have split it in two. Try again by clicking it in the email rather than copying the address.',
              de: 'Vielleicht hat Ihr E-Mail-Programm ihn zerteilt. Versuchen Sie es noch einmal, indem Sie direkt in der E-Mail klicken, statt die Adresse abzuschreiben.',
            })}
          </p>
          <Link className="btn btn-ghost" href={lien('/')} style={{ marginTop: 8 }}>{t({ fr: 'Retour à l’accueil', en: 'Back to the home page', de: 'Zurück zur Startseite' })}</Link>
        </div>
      </Cadre>
    )
  }

  if (etat === 'deja') {
    return (
      <Cadre>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🎞️</div>
          <h3 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Vous avez déjà répondu', en: 'You have already answered', de: 'Sie haben bereits geantwortet' })}</h3>
          <p className="muted small" style={{ marginBottom: 0 }}>
            {t({ fr: 'Et c’était précieux, merci. On ne vous redemandera rien.', en: 'And it was really valuable, thank you. We will not ask you again.', de: 'Und das war sehr wertvoll, danke. Wir fragen Sie nicht noch einmal.' })}
          </p>
        </div>
      </Cadre>
    )
  }

  const orga = info?.role === 'organisateur'
  return (
    <Cadre>
      <div className="card">
        <p className="eyebrow" style={{ fontSize: 10.5, marginBottom: 8 }}>{accroche(lang)}</p>
        <h2 className="h3" style={{ marginBottom: 8 }}>
          {orga ? t({ fr: 'Votre avis, vraiment', en: 'Your honest opinion', de: 'Ihre ehrliche Meinung' }) : t({ fr: 'Dites-nous ce que vous en avez pensé', en: 'Tell us what you thought', de: 'Sagen Sie uns, wie es Ihnen gefallen hat' })}
        </h2>
        <p className="muted small" style={{ marginBottom: 20 }}>
          {info?.eventName
            ? t({ fr: <>À propos de « <strong>{info.eventName}</strong> ». </>, en: <>About “<strong>{info.eventName}</strong>”. </>, de: <>Zu „<strong>{info.eventName}</strong>“. </> })
            : null}
          {orga
            ? t({ fr: 'On construit encore beaucoup de choses, et ce que vous direz pèse lourd à ce stade. Deux minutes.', en: 'We are still building a lot, and what you tell us carries real weight at this stage. Two minutes.', de: 'Wir bauen noch vieles auf, und was Sie uns sagen, hat jetzt großes Gewicht. Zwei Minuten.' })
            : t({ fr: 'Trente secondes, et ça nous aide à corriger ce qui ne va pas encore.', en: 'Thirty seconds, and it helps us fix what is not quite right yet.', de: 'Dreißig Sekunden, und es hilft uns, zu verbessern, was noch nicht rund läuft.' })}
        </p>
        <Avis
          role={orga ? 'organisateur' : 'invite'}
          payload={orga ? { o: jetonOrga } : { i: jetonInvite }}
          noteInitiale={orga ? null : noteMail}
        />
      </div>
      {!orga && jetonInvite && (
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 14 }}>
          <Link href={`/avis?i=${encodeURIComponent(jetonInvite)}&stop=1`} style={{ color: 'var(--text4)' }}>
            {t({ fr: 'Ne plus recevoir de message de ce type', en: 'Stop receiving messages like this', de: 'Keine solchen Nachrichten mehr erhalten' })}
          </Link>
        </p>
      )}
    </Cadre>
  )
}

export default function AvisPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<Cadre><p className="muted" style={{ textAlign: 'center' }}>{t({ fr: 'Un instant…', en: 'One moment…', de: 'Einen Moment…' })}</p></Cadre>}>
      <AvisInner />
    </Suspense>
  )
}
