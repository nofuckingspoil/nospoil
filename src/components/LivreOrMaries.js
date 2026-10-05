'use client'

// ============================================================
//  Le livre d'or audio, côté mariés : l'onglet « Livre d'or » de l'album.
//
//  Une carte par invité (selfie, prénom, heure, durée, lecture, onde), un
//  bouton « Tout écouter » qui enchaîne les messages dans l'ordre où ils sont
//  arrivés, selfie en grand, et les téléchargements : un message à l'unité,
//  ou tout en .zip (audio et selfies).
//
//  Pas de révélation ici : un message s'écoute dès qu'il est arrivé.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { useLangue } from './Langue'
import Onde from './Onde'
import { getOwnerToken } from '../lib/device'
import { avatarColor } from '../lib/brand'
import { minutesSecondes } from './LivreOrInvite'

function nomDeFichier(prenom, i) {
  const propre = String(prenom || 'invite')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
    .toLowerCase() || 'invite'
  return `${String(i + 1).padStart(2, '0')}-${propre}`
}

function extensionDe(mime) {
  if (/mp4|aac|m4a/.test(mime || '')) return 'm4a'
  if (/ogg/.test(mime || '')) return 'ogg'
  return 'webm'
}

function enregistrer(blob, nom) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 60000)
}

function Visage({ m, grand = false }) {
  const initiale = (String(m.prenom || '?').trim()[0] || '?').toUpperCase()
  if (m.visage) {
    return grand
      ? <div className="lo-selfie"><img src={m.visage} alt="" /></div>
      : <span className="lo-visage"><img src={m.visage} alt="" /></span>
  }
  return grand
    ? <div className="lo-visage-grand" style={{ background: avatarColor(m.prenom || '') }}>{initiale}</div>
    : <span className="lo-visage" style={{ background: avatarColor(m.prenom || '') }}>{initiale}</span>
}

export default function LivreOrMaries({ eventId, onCompte }) {
  const { t, locale } = useLangue()
  const [etat, setEtat] = useState({ charge: false, actif: false, messages: [] })
  const [enCours, setEnCours] = useState(null) // id du message qui joue
  const [progression, setProgression] = useState(0)
  const [joue, setJoue] = useState(false)
  const [enchaine, setEnchaine] = useState(false) // « Tout écouter »
  const [zip, setZip] = useState(false)
  const [erreur, setErreur] = useState('')
  const audioRef = useRef(null)

  async function charger() {
    try {
      const d = await fetch(`/api/events/${eventId}/livre-or`, { headers: { 'x-owner-token': getOwnerToken(eventId) } }).then((r) => r.json())
      if (d?.error) { setErreur(d.error); return }
      setEtat({ charge: true, actif: !!d.actif, messages: Array.isArray(d.messages) ? d.messages : [] })
      onCompte?.(Array.isArray(d.messages) ? d.messages.length : 0)
    } catch {
      setErreur(t({ fr: 'Le livre d’or n’a pas pu être chargé.', en: 'The guestbook couldn’t be loaded.', de: 'Das Gästebuch konnte nicht geladen werden.' }))
    }
  }

  // Les messages arrivent pendant la soirée : on relit toutes les 30 s, sauf
  // pendant une écoute (les adresses changeraient sous le lecteur).
  useEffect(() => {
    charger()
    const id = setInterval(() => { if (!audioRef.current || audioRef.current.paused) charger() }, 30000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const messages = etat.messages
  const courant = messages.find((m) => m.id === enCours) || null

  function jouer(m, depuisEnchainement = false) {
    const a = audioRef.current
    if (!a || !m?.url) return
    if (!depuisEnchainement) setEnchaine(false)
    if (enCours === m.id && !depuisEnchainement) {
      if (a.paused) a.play().catch(() => {})
      else a.pause()
      return
    }
    setEnCours(m.id)
    setProgression(0)
    a.src = m.url
    a.play().catch(() => {})
  }

  function basculer() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  function toutEcouter() {
    if (!messages.length) return
    setEnchaine(true)
    jouer(messages[0], true)
  }

  function suivant() {
    const i = messages.findIndex((m) => m.id === enCours)
    const prochain = messages[i + 1]
    if (prochain) jouer(prochain, true)
    else arreter()
  }

  function arreter() {
    audioRef.current?.pause()
    setEnchaine(false)
    setEnCours(null)
    setProgression(0)
  }

  function suivre() {
    const a = audioRef.current
    if (!a) return
    const total = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : (courant?.durationMs || 1) / 1000
    setProgression(Math.min(1, a.currentTime / total))
    setJoue(!a.paused && !a.ended)
  }

  function fini() {
    setJoue(false)
    if (enchaine) suivant()
    else { setProgression(1) }
  }

  async function telechargerUn(m, i) {
    try {
      const blob = await fetch(m.url).then((r) => r.blob())
      enregistrer(blob, `${nomDeFichier(m.prenom, i)}.${extensionDe(m.mimeType)}`)
    } catch {
      setErreur(t({ fr: 'Téléchargement impossible. Réessayez.', en: 'Download failed. Try again.', de: 'Download nicht möglich. Bitte erneut versuchen.' }))
    }
  }

  async function toutTelecharger() {
    if (zip || !messages.length) return
    setZip(true)
    setErreur('')
    try {
      const JSZip = (await import('jszip')).default
      const z = new JSZip()
      let reussis = 0
      for (let i = 0; i < messages.length; i++) {
        const m = messages[i]
        const base = nomDeFichier(m.prenom, i)
        try {
          z.file(`${base}.${extensionDe(m.mimeType)}`, await fetch(m.url).then((r) => r.blob()))
          reussis++
        } catch {}
        if (m.visage && m.visageType === 'selfie') {
          try { z.file(`${base}-selfie.jpg`, await fetch(m.visage).then((r) => r.blob())) } catch {}
        }
      }
      if (!reussis) throw new Error('vide')
      enregistrer(await z.generateAsync({ type: 'blob' }), t({ fr: 'livre-d-or-timetoflash.zip', en: 'guestbook-timetoflash.zip', de: 'gaestebuch-timetoflash.zip' }))
    } catch {
      setErreur(t({ fr: 'Téléchargement impossible. Réessayez dans un instant.', en: 'Download failed. Try again in a moment.', de: 'Download nicht möglich. Versuchen Sie es gleich noch einmal.' }))
    } finally {
      setZip(false)
    }
  }

  const heure = (iso) => {
    try { return new Date(iso).toLocaleString(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }
  const dureeTotale = messages.reduce((s, m) => s + (m.durationMs || 0), 0)

  return (
    <section className="lo-livre">
      <audio ref={audioRef} preload="none" onTimeUpdate={suivre} onPlay={suivre} onPause={suivre} onEnded={fini} />

      <div className="lo-livre-tete">
        <p>
          {messages.length
            ? t({
                fr: `${messages.length} message${messages.length > 1 ? 's' : ''} · ${minutesSecondes(dureeTotale)} d’écoute · seuls vous les entendez`,
                en: `${messages.length} message${messages.length > 1 ? 's' : ''} · ${minutesSecondes(dureeTotale)} of listening · only you can hear them`,
                de: `${messages.length} ${messages.length > 1 ? 'Nachrichten' : 'Nachricht'} · ${minutesSecondes(dureeTotale)} zum Anhören · nur Sie hören sie`,
              })
            : ''}
        </p>
        {messages.length > 0 && (
          <div className="lo-livre-btns">
            <button type="button" className="plein" onClick={toutEcouter}>▶ {t({ fr: 'Tout écouter', en: 'Play all', de: 'Alle anhören' })}</button>
            <button type="button" onClick={toutTelecharger} disabled={zip}>
              {zip ? t({ fr: 'Préparation…', en: 'Preparing…', de: 'Wird vorbereitet…' }) : `⬇ ${t({ fr: 'Tout télécharger (.zip)', en: 'Download all (.zip)', de: 'Alle herunterladen (.zip)' })}`}
            </button>
          </div>
        )}
      </div>

      {erreur && <div className="err" style={{ marginBottom: 12 }}>{erreur}</div>}

      {etat.charge && !messages.length && (
        <div className="lo-vide">
          <b>{t({ fr: 'Pas encore de message', en: 'No messages yet', de: 'Noch keine Nachrichten' })}</b>
          {etat.actif
            ? t({
                fr: 'Vos invités trouvent un bouton micro sur leur appareil photo. Leurs messages arrivent ici, au fil de la soirée.',
                en: 'Your guests find a microphone button on their camera. Their messages arrive here as the evening goes on.',
                de: 'Ihre Gäste finden einen Mikrofon-Knopf an ihrer Kamera. Ihre Nachrichten kommen hier im Laufe des Abends an.',
              })
            : t({
                fr: 'Le livre d’or n’est pas inclus dans cette soirée. Ajoutez-le depuis votre tableau de bord, section « Livre d’or audio », pour que vos invités puissent vous laisser un message vocal.',
                en: 'The guestbook isn’t included in this event. Add it from your dashboard, in the “Audio guestbook” section, so your guests can leave you a voice message.',
                de: 'Das Gästebuch ist in diesem Event nicht enthalten. Fügen Sie es in Ihrem Dashboard im Bereich „Audio-Gästebuch“ hinzu, damit Ihre Gäste Ihnen eine Sprachnachricht hinterlassen können.',
              })}
        </div>
      )}

      <div className="lo-cartes">
        {messages.map((m, i) => (
          <article key={m.id} className={`lo-carte ${enCours === m.id ? 'joue' : ''}`}>
            <div className="lo-carte-tete">
              <Visage m={m} />
              <div>
                <div className="lo-carte-nom">{m.prenom || t({ fr: 'Un invité', en: 'A guest', de: 'Ein Gast' })}</div>
                <div className="lo-carte-meta">{heure(m.createdAt)} · {minutesSecondes(m.durationMs)}</div>
              </div>
            </div>
            <div className="lo-carte-lecteur">
              <button type="button" className="lo-play" onClick={() => jouer(m)} aria-label={enCours === m.id && joue ? 'Pause' : t({ fr: 'Écouter', en: 'Play', de: 'Abspielen' })}>
                {enCours === m.id && joue ? '❚❚' : '▶'}
              </button>
              <Onde valeurs={m.onde} progression={enCours === m.id ? progression : 0} couleur="var(--accent)" fond="rgba(255,255,255,.2)" hauteur={36} />
            </div>
            <button type="button" className="lo-carte-dl" onClick={() => telechargerUn(m, i)}>
              {t({ fr: 'Télécharger ce message', en: 'Download this message', de: 'Diese Nachricht herunterladen' })}
            </button>
          </article>
        ))}
      </div>

      {/* « Tout écouter » : chaque message à son tour, le visage de l'invité en grand. */}
      {enchaine && courant && (
        <div className="lo-scene" role="dialog" aria-modal="true">
          <Visage m={courant} grand />
          <div className="lo-scene-nom">{courant.prenom}</div>
          <div className="lo-scene-meta">
            {messages.findIndex((m) => m.id === courant.id) + 1} / {messages.length} · {heure(courant.createdAt)} · {minutesSecondes(courant.durationMs)}
          </div>
          <div className="lo-scene-onde">
            <Onde valeurs={courant.onde} progression={progression} couleur="var(--accent)" fond="rgba(255,255,255,.22)" hauteur={54} />
          </div>
          <div className="lo-scene-btns">
            <button type="button" onClick={basculer}>{joue ? '❚❚ Pause' : `▶ ${t({ fr: 'Reprendre', en: 'Resume', de: 'Fortsetzen' })}`}</button>
            <button type="button" onClick={suivant}>{t({ fr: 'Suivant', en: 'Next', de: 'Weiter' })} ⏭</button>
            <button type="button" onClick={arreter}>✕ {t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}</button>
          </div>
        </div>
      )}
    </section>
  )
}
