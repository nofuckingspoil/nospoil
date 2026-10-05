'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Logo from '../../../components/Logo'
import { useLangue } from '../../../components/Langue'

// ============================================================
//  « Vous avez pu essayer Time to Flash ? » : la page du clic.
//
//  Le mail porte quatre réponses, chacune un lien (?o=<jeton>&r=<réponse>).
//  La réponse est enregistrée à l'arrivée, puis la page propose la suite
//  utile : mettre la vraie date, ouvrir l'appareil, raconter le souci, ou
//  dire en un mot ce qui n'a pas convaincu. On peut changer d'avis sur place.
// ============================================================

function Cadre({ children }) {
  return (
    <main className="screen screen-cream center">
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><Logo /></div>
        {children}
      </div>
    </main>
  )
}

function RetourInner() {
  const { t, lien } = useLangue()
  const sp = useSearchParams()
  const jeton = sp.get('o') || ''
  const [reponse, setReponse] = useState(sp.get('r') || '')
  const [ev, setEv] = useState(null)
  const [erreur, setErreur] = useState('')
  const [detail, setDetail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const premier = useRef(false)

  const CHOIX = [
    ['test', t({ fr: 'Je teste avant ma vraie soirée', en: "I'm testing before my real event", de: 'Ich teste vor meinem echten Event' })],
    ['temps', t({ fr: "Je n'ai pas encore eu le temps", en: "I haven't had the time yet", de: 'Ich hatte noch keine Zeit' })],
    ['souci', t({ fr: "J'ai eu un souci", en: 'I ran into a problem', de: 'Ich hatte ein Problem' })],
    ['pas_pour_moi', t({ fr: "Ce n'est pas pour moi", en: "It's not for me", de: 'Das ist nichts für mich' })],
  ]

  async function enregistrer(corps) {
    const r = await fetch('/api/essai-retour', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ o: jeton, ...corps }),
    })
    const d = await r.json().catch(() => ({}))
    if (d.error) throw new Error(d.error)
    return d
  }

  // La réponse du mail est enregistrée dès l'arrivée : le clic suffit.
  useEffect(() => {
    if (premier.current) return
    premier.current = true
    if (!jeton) { setErreur(t({ fr: 'Lien incomplet.', en: 'Incomplete link.', de: 'Unvollständiger Link.' })); return }
    enregistrer({ r: sp.get('r') || undefined })
      .then((d) => { setEv(d); if (d.reponse) setReponse(d.reponse) })
      .catch((err) => setErreur(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function choisir(r) {
    setReponse(r); setEnvoye(false); setDetail('')
    enregistrer({ r }).catch(() => {})
  }

  async function envoyerDetail(e) {
    e.preventDefault()
    if (!detail.trim() || envoi) return
    setEnvoi(true)
    try { await enregistrer({ detail }); setEnvoye(true) } catch (err) { setErreur(err.message) }
    setEnvoi(false)
  }

  if (erreur) return <Cadre><div className="card"><p className="err" style={{ margin: 0 }}>{erreur}</p></div></Cadre>
  if (!ev) return <Cadre><p className="muted" style={{ textAlign: 'center' }}>{t({ fr: 'Un instant…', en: 'One moment…', de: 'Einen Moment…' })}</p></Cadre>

  const tableau = lien(`/event/${ev.id}`)
  const appareil = lien(`/j/${ev.id}`)

  return (
    <Cadre>
      <div className="card wiz-card">
        <h1 className="wiz-q" style={{ marginTop: 0 }}>{t({ fr: 'Merci pour votre réponse !', en: 'Thank you for your answer!', de: 'Danke für Ihre Antwort!' })}</h1>
        <p className="wiz-sub">« {ev.name} »</p>

        <div className="cases" style={{ marginBottom: 18 }}>
          {CHOIX.map(([cle, label]) => (
            <label key={cle} className={`case ${reponse === cle ? 'on' : ''}`}>
              <input type="radio" name="reponse" checked={reponse === cle} onChange={() => choisir(cle)} />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {reponse === 'test' && (
          <>
            <p>{t({
              fr: "Excellente idée de tester avant ! Pour votre vraie soirée, inutile de tout refaire : changez simplement la date dans votre tableau de bord. Votre lien et votre QR code restent les mêmes.",
              en: "Great idea to test first! For your real event, no need to start over: just change the date in your dashboard. Your link and QR code stay the same.",
              de: 'Gute Idee, vorher zu testen! Für Ihr echtes Event müssen Sie nicht neu anfangen: Ändern Sie einfach das Datum im Dashboard. Link und QR-Code bleiben gleich.',
            })}</p>
            <a className="btn btn-accent" href={tableau}>{t({ fr: 'Mettre la vraie date →', en: 'Set the real date →', de: 'Das echte Datum eintragen →' })}</a>
          </>
        )}

        {reponse === 'temps' && (
          <>
            <p>{t({
              fr: "Aucun souci ! Votre appareil photo est prêt : prenez une première photo vous-même pour voir comment ça marche, puis partagez le lien ou le QR code à vos invités.",
              en: 'No problem! Your camera is ready: take a first photo yourself to see how it works, then share the link or QR code with your guests.',
              de: 'Kein Problem! Ihre Kamera ist bereit: Machen Sie selbst ein erstes Foto, um zu sehen, wie es funktioniert, und teilen Sie dann den Link oder QR-Code mit Ihren Gästen.',
            })}</p>
            <a className="btn btn-accent" href={appareil}>{t({ fr: 'Prendre ma première photo →', en: 'Take my first photo →', de: 'Mein erstes Foto machen →' })}</a>
            <a className="linklike" href={tableau} style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>{t({ fr: 'Ouvrir mon tableau de bord', en: 'Open my dashboard', de: 'Mein Dashboard öffnen' })}</a>
          </>
        )}

        {(reponse === 'souci' || reponse === 'pas_pour_moi') && (
          envoye ? (
            <p style={{ fontWeight: 600 }}>{t({ fr: 'Bien reçu, merci. Je le lis personnellement.', en: 'Received, thank you. I read it myself.', de: 'Erhalten, danke. Ich lese es persönlich.' })}</p>
          ) : (
            <form onSubmit={envoyerDetail}>
              <div className="field">
                <label>{reponse === 'souci'
                  ? t({ fr: "Racontez-moi ce qui s'est passé", en: 'Tell me what happened', de: 'Erzählen Sie mir, was passiert ist' })
                  : t({ fr: "Qu'est-ce qui ne vous a pas convaincu ? (facultatif)", en: "What didn't convince you? (optional)", de: 'Was hat Sie nicht überzeugt? (freiwillig)' })}</label>
                <textarea rows={4} value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={1000}
                  placeholder={reponse === 'souci'
                    ? t({ fr: "Ce que vous avez essayé, ce qui n'a pas marché, sur quel téléphone…", en: "What you tried, what didn't work, on which phone…", de: 'Was Sie versucht haben, was nicht funktioniert hat, auf welchem Handy…' })
                    : t({ fr: 'Le prix, le principe, autre chose…', en: 'The price, the concept, something else…', de: 'Der Preis, das Prinzip, etwas anderes…' })} />
              </div>
              <button className="btn btn-accent" type="submit" disabled={!detail.trim() || envoi}>
                {envoi ? t({ fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' }) : t({ fr: 'Envoyer', en: 'Send', de: 'Senden' })}
              </button>
            </form>
          )
        )}
      </div>
    </Cadre>
  )
}

export default function RetourEssaiPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">…</p></main>}>
      <RetourInner />
    </Suspense>
  )
}
