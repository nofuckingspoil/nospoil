'use client'

// ============================================================
//  Le livre d'or audio, côté participant.
//
//  Un bouton micro en bas à droite de l'appareil. Il ouvre un parcours en
//  quatre temps : enregistrer (une minute au plus), réécouter, signer d'un
//  selfie, envoyer. Une fois le message parti, le micro devient une coche :
//  un appui propose de le réécouter ou de le refaire.
//
//  LES RÈGLES
//  - Un seul message par participant : en refaire un écrase l'ancien.
//  - Seuls les mariés l'écoutent. Rien ici ne montre le message des autres.
//  - Le selfie ne consomme aucune pose de la pellicule.
//  - La permission du micro n'est demandée qu'au moment où l'on appuie sur
//    « Enregistrer », jamais au chargement : une fenêtre d'autorisation posée
//    avant qu'on sache à quoi elle sert se refuse par réflexe.
//  - L'envoi passe par la même file d'attente que les photos : un message
//    enregistré dans une cave part tout seul quand le réseau revient.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { useLangue } from './Langue'
import Onde from './Onde'
import { getDeviceToken } from '../lib/device'
import { ajouterVoixALaFile, sabonnerALaFile } from '../lib/file-envoi-web'
import { compressToBlob, prepareUpload, playShutter } from '../lib/camera'
import { cuirePhoto } from '../lib/film'

const DUREE_MAX_MS = 60000
const BARRES = 48

// Le format d'enregistrement : AAC (audio/mp4) quand le navigateur sait le
// produire (Safari, iPhone), Opus dans du WebM sinon (Chrome, Android). Le
// serveur convertit tout en m4a ensuite, pour une écoute universelle.
function choisirFormat() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return ''
  for (const f of ['audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']) {
    try { if (MediaRecorder.isTypeSupported(f)) return f } catch {}
  }
  return ''
}

function extensionDe(mime) {
  if (/mp4|aac|m4a/.test(mime)) return 'm4a'
  if (/ogg/.test(mime)) return 'ogg'
  return 'webm'
}

export function minutesSecondes(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// 48 hauteurs entre 0 et 100, à partir de toutes les mesures prises pendant
// l'enregistrement : la plus forte de chaque tranche, rapportée à la plus
// forte de tout le message.
function resumerOnde(mesures) {
  if (!mesures.length) return null
  const tranches = []
  const pas = mesures.length / BARRES
  for (let i = 0; i < BARRES; i++) {
    const debut = Math.floor(i * pas)
    const fin = Math.max(debut + 1, Math.floor((i + 1) * pas))
    let max = 0
    for (let j = debut; j < fin && j < mesures.length; j++) max = Math.max(max, mesures[j])
    tranches.push(max)
  }
  const plafond = Math.max(...tranches) || 1
  return tranches.map((v) => Math.round(Math.max(6, (v / plafond) * 100)))
}

export default function LivreOrInvite({ eventId, guestId, ouvert, demande = 0, masquerBulle = false, onOccupe, onStatut }) {
  const { t, lang } = useLangue()

  // null (fermé) | intro | enregistre | ecoute | selfie | mien
  const [etape, setEtape] = useState(null)
  const [statut, setStatut] = useState('aucun') // aucun | attente | envoye
  const [erreur, setErreur] = useState('')
  const [micRefuse, setMicRefuse] = useState(false)
  const [ecoule, setEcoule] = useState(0)
  const [niveaux, setNiveaux] = useState(() => Array(28).fill(6))
  const [prise, setPrise] = useState(null) // { blob, url, dureeMs, onde, ext }
  const [lecture, setLecture] = useState({ joue: false, progression: 0 })
  const [selfie, setSelfie] = useState(null) // { blob, url }
  const [selfieSansCamera, setSelfieSansCamera] = useState(false)
  const [flashEcran, setFlashEcran] = useState(false)
  const [mien, setMien] = useState(null) // ce que le serveur a reçu
  const [bulle, setBulle] = useState(false)
  const [parti, setParti] = useState(false)

  const fluxMicro = useRef(null)
  const enregistreur = useRef(null)
  const morceaux = useRef([])
  const mesures = useRef([])
  const debut = useRef(0)
  const boucle = useRef(0)
  const contexteAudio = useRef(null)
  const minuteur = useRef(null)
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const fluxCamera = useRef(null)
  const fichierSelfie = useRef(null)
  const dejaRange = useRef(false) // ce message est-il déjà dans la file ?

  // L'appareil photo doit lâcher la caméra tant que le livre d'or est ouvert :
  // un iPhone ne filme qu'avec une caméra à la fois, et le selfie en a besoin.
  useEffect(() => { onOccupe?.(etape !== null) }, [etape, onOccupe])
  useEffect(() => { onStatut?.(statut) }, [statut, onStatut])

  // Ce que le serveur a déjà reçu de ce participant.
  async function chargerMien() {
    if (!guestId) return
    try {
      const d = await fetch('/api/voix/moi', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Langue': lang },
        body: JSON.stringify({ eventId, guestId, deviceToken: getDeviceToken(), langue: lang }),
      }).then((r) => r.json())
      if (d?.message) { setMien(d.message); setStatut((s) => (s === 'attente' ? s : 'envoye')) }
    } catch {}
  }

  useEffect(() => {
    if (!eventId || !guestId) return
    chargerMien()
    return sabonnerALaFile((ev) => {
      if (ev.type === 'file') {
        const enRoute = (ev.voixEnAttente || []).some((v) => v.eventId === eventId)
        setStatut((s) => (enRoute ? 'attente' : s === 'attente' ? 'envoye' : s))
        return
      }
      if (ev.eventId !== eventId) return
      if (ev.type === 'voix-arrivee') { setStatut('envoye'); chargerMien() }
      if (ev.type === 'voix-refus') { setStatut('aucun'); setErreur(ev.message || '') }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, guestId])

  // La bulle « Laisse un mot aux mariés », une fois par soirée et par
  // téléphone, quand plus rien d'autre ne se dispute l'écran.
  useEffect(() => {
    if (!ouvert || masquerBulle || statut !== 'aucun') return
    const cle = `ttf_livreor_bulle_${eventId}`
    try { if (localStorage.getItem(cle)) return } catch {}
    const a = setTimeout(() => {
      setBulle(true)
      try { localStorage.setItem(cle, '1') } catch {}
    }, 1200)
    const b = setTimeout(() => setBulle(false), 1200 + 5500)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [ouvert, masquerBulle, statut, eventId])

  // L'invitation en grand (pellicule terminée) ouvre le même parcours.
  useEffect(() => { if (demande > 0) ouvrir() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [demande])

  // Tout relâcher en quittant la page.
  useEffect(() => () => { arreterMicro(); arreterCamera(); libererPrise() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [])

  function ouvrir() {
    setBulle(false)
    setErreur('')
    setEtape(statut === 'aucun' ? 'intro' : 'mien')
  }

  function fermer() {
    // Fermé sur l'écran du selfie : le message, lui, est déjà parti.
    if (etape === 'selfie' && dejaRange.current) montrerParti()
    arreterEnregistrement(true)
    arreterCamera()
    audioRef.current?.pause()
    setLecture({ joue: false, progression: 0 })
    setEtape(null)
  }

  function libererPrise() {
    setPrise((p) => { if (p?.url) URL.revokeObjectURL(p.url); return null })
    setSelfie((s) => { if (s?.url) URL.revokeObjectURL(s.url); return null })
  }

  // ------------------------------------------------------- l'enregistrement

  function arreterMicro() {
    cancelAnimationFrame(boucle.current)
    clearInterval(minuteur.current)
    try { fluxMicro.current?.getTracks().forEach((p) => p.stop()) } catch {}
    fluxMicro.current = null
    try { contexteAudio.current?.close() } catch {}
    contexteAudio.current = null
  }

  async function demarrer() {
    setErreur('')
    setMicRefuse(false)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setErreur(t({
        fr: 'Ce navigateur ne sait pas enregistrer de son. Ouvre la page dans Safari ou Chrome.',
        en: 'This browser can’t record sound. Open the page in Safari or Chrome.',
        de: 'Dieser Browser kann keinen Ton aufnehmen. Öffnen Sie die Seite in Safari oder Chrome.',
      }))
      return
    }
    let flux
    try {
      flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
    } catch (err) {
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) setMicRefuse(true)
      else setErreur(t({
        fr: 'Aucun micro trouvé sur cet appareil.',
        en: 'No microphone found on this device.',
        de: 'Auf diesem Gerät wurde kein Mikrofon gefunden.',
      }))
      return
    }
    fluxMicro.current = flux
    libererPrise()
    dejaRange.current = false

    const format = choisirFormat()
    let rec
    try { rec = new MediaRecorder(flux, format ? { mimeType: format, audioBitsPerSecond: 96000 } : undefined) }
    catch { rec = new MediaRecorder(flux) }
    enregistreur.current = rec
    morceaux.current = []
    mesures.current = []

    rec.ondataavailable = (e) => { if (e.data && e.data.size) morceaux.current.push(e.data) }
    rec.onstop = () => {
      const dureeMs = Math.min(DUREE_MAX_MS, Date.now() - debut.current)
      const mime = rec.mimeType || format || 'audio/webm'
      const blob = new Blob(morceaux.current, { type: mime })
      arreterMicro()
      if (rec._abandon) return
      if (!blob.size || dureeMs < 700) {
        setErreur(t({ fr: 'Message trop court. Réessaie !', en: 'Message too short. Try again!', de: 'Nachricht zu kurz. Versuchen Sie es noch einmal!' }))
        setEtape('intro')
        return
      }
      setPrise({ blob, url: URL.createObjectURL(blob), dureeMs, onde: resumerOnde(mesures.current), ext: extensionDe(mime) })
      setLecture({ joue: false, progression: 0 })
      setEtape('ecoute')
    }

    // L'onde animée : le niveau du micro, mesuré à chaque image.
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      contexteAudio.current = ctx
      const analyseur = ctx.createAnalyser()
      analyseur.fftSize = 1024
      ctx.createMediaStreamSource(flux).connect(analyseur)
      const tampon = new Uint8Array(analyseur.fftSize)
      let derniere = 0
      const mesurer = (instant) => {
        analyseur.getByteTimeDomainData(tampon)
        let somme = 0
        for (let i = 0; i < tampon.length; i++) { const v = (tampon[i] - 128) / 128; somme += v * v }
        const niveau = Math.sqrt(somme / tampon.length)
        mesures.current.push(niveau)
        if (instant - derniere > 70) {
          derniere = instant
          const h = Math.max(6, Math.min(100, Math.round(niveau * 380)))
          setNiveaux((n) => [...n.slice(1), h])
        }
        boucle.current = requestAnimationFrame(mesurer)
      }
      boucle.current = requestAnimationFrame(mesurer)
    } catch {}

    debut.current = Date.now()
    setEcoule(0)
    rec.start(250)
    setEtape('enregistre')
    minuteur.current = setInterval(() => {
      const e = Date.now() - debut.current
      setEcoule(e)
      if (e >= DUREE_MAX_MS) arreterEnregistrement()
    }, 200)
  }

  function arreterEnregistrement(abandon = false) {
    clearInterval(minuteur.current)
    const rec = enregistreur.current
    if (rec && rec.state !== 'inactive') {
      rec._abandon = abandon
      try { rec.stop() } catch { arreterMicro() }
    } else arreterMicro()
  }

  // ------------------------------------------------------------ la réécoute

  function basculerLecture() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }

  function suivreLecture() {
    const a = audioRef.current
    if (!a) return
    const total = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : (prise?.dureeMs || mien?.durationMs || 1) / 1000
    setLecture({ joue: !a.paused && !a.ended, progression: Math.min(1, a.currentTime / total) })
  }

  // --------------------------------------------------------------- le selfie

  function arreterCamera() {
    try { fluxCamera.current?.getTracks().forEach((p) => p.stop()) } catch {}
    fluxCamera.current = null
  }

  // Le message est rangé dès « Valider », AVANT le selfie. Un invité qui
  // fermait l'onglet sur l'écran du selfie perdait tout : le message n'avait
  // jamais quitté la page (retour d'une soirée, octobre 2026). Le selfie, s'il
  // vient, remplace ensuite ce dépôt par le même message signé.
  async function allerAuSelfie() {
    audioRef.current?.pause()
    if (!dejaRange.current) {
      if (!(await ranger(null))) return
      dejaRange.current = true
    }
    setSelfie(null)
    setSelfieSansCamera(false)
    setEtape('selfie')
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      fluxCamera.current = flux
      // La vidéo n'existe qu'une fois l'écran du selfie dessiné.
      requestAnimationFrame(() => {
        if (videoRef.current) { videoRef.current.srcObject = flux; videoRef.current.play().catch(() => {}) }
      })
    } catch {
      // Pas de caméra en direct (mini-navigateur d'une messagerie, refus) :
      // l'appareil photo du téléphone, ou « Passer ».
      setSelfieSansCamera(true)
    }
  }

  // Même rendu que l'appareil jetable : le flash d'écran qui éclaire le
  // visage, le bruit de l'obturateur, puis la pellicule « Jetable » (grain,
  // couleurs) cuite dans le fichier.
  async function declencherSelfie() {
    const v = videoRef.current
    if (!v) return
    setFlashEcran(true)
    await new Promise((r) => setTimeout(r, 280))
    playShutter()
    try {
      // En miroir, comme l'aperçu : un selfie qui sort inversé par rapport à
      // ce qu'on vient de voir surprend toujours.
      const w = v.videoWidth, h = v.videoHeight
      const toile = document.createElement('canvas')
      toile.width = w
      toile.height = h
      const ctx = toile.getContext('2d')
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(v, 0, 0, w, h)
      const brut = await compressToBlob(toile, { maxSize: 900, quality: 0.86 })
      await poserSelfie(brut)
    } catch {
      setErreur(t({ fr: 'Le selfie n’a pas pu être pris. Réessaie.', en: 'The selfie couldn’t be taken. Try again.', de: 'Das Selfie konnte nicht aufgenommen werden. Versuchen Sie es erneut.' }))
    } finally {
      setFlashEcran(false)
    }
  }

  async function poserSelfie(brut) {
    const cuit = await cuirePhoto(brut, { pellicule: 'jetable' })
    arreterCamera()
    setSelfie((s) => { if (s?.url) URL.revokeObjectURL(s.url); return { blob: cuit, url: URL.createObjectURL(cuit) } })
  }

  async function selfieDepuisFichier(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { await poserSelfie(await prepareUpload(f)) } catch (err) { setErreur(err.message || '') }
  }

  // ---------------------------------------------------------------- l'envoi

  // Range le message dans la file d'attente, avec ou sans selfie. Un second
  // dépôt pour la même soirée remplace le premier (dans la file comme sur le
  // serveur) : ajouter le selfie après coup ne crée pas de doublon.
  async function ranger(selfieBlob) {
    if (!prise) return false
    try {
      await ajouterVoixALaFile({
        eventId,
        guestId,
        deviceToken: getDeviceToken(),
        audio: prise.blob,
        selfie: selfieBlob || null,
        durationMs: prise.dureeMs,
        nomAudio: `message.${prise.ext}`,
        onde: prise.onde,
      })
    } catch {
      setErreur(t({ fr: 'Ton message n’a pas pu être gardé. Réessaie.', en: 'Your message couldn’t be kept. Try again.', de: 'Ihre Nachricht konnte nicht gespeichert werden. Versuchen Sie es erneut.' }))
      return false
    }
    // Le message gardé en mémoire sert à le réécouter tant qu'il n'est pas arrivé.
    setMien((m) => ({ ...(m || {}), local: prise.url, selfieLocal: selfieBlob && selfie ? selfie.url : null, durationMs: prise.dureeMs, onde: prise.onde }))
    setStatut('attente')
    return true
  }

  function montrerParti() {
    setParti(true)
    setTimeout(() => setParti(false), 2200)
  }

  // « Envoyer » avec le selfie, ou « Passer » : le message est déjà rangé
  // depuis « Valider », il ne reste qu'à y joindre la signature.
  async function envoyer(avecSelfie) {
    if (!prise) return
    if (avecSelfie && selfie) {
      if (!(await ranger(selfie.blob))) return
    }
    arreterCamera()
    setEtape(null)
    montrerParti()
  }

  function refaire() {
    dejaRange.current = false
    audioRef.current?.pause()
    setLecture({ joue: false, progression: 0 })
    setEtape('intro')
  }

  if (!ouvert && statut === 'aucun') return null

  const restant = Math.max(0, DUREE_MAX_MS - ecoule)
  const sourceMien = mien?.local || mien?.url || null
  const visageMien = mien?.selfieLocal || mien?.selfieUrl || null

  return (
    <>
      <div className="lo-ancre">
        {bulle && (
          <button type="button" className="lo-bulle" onClick={ouvrir}>
            {t({ fr: 'Laisse un mot aux mariés', en: 'Leave a word for the couple', de: 'Hinterlassen Sie dem Paar ein paar Worte' })} 🎙️
          </button>
        )}
        <button
          type="button"
          className={`lo-micro ${statut !== 'aucun' ? 'lo-micro-fait' : ''}`}
          onClick={ouvrir}
          aria-label={statut === 'aucun'
            ? t({ fr: 'Laisser un message vocal aux mariés', en: 'Leave a voice message for the couple', de: 'Dem Paar eine Sprachnachricht hinterlassen' })
            : t({ fr: 'Mon message pour les mariés', en: 'My message for the couple', de: 'Meine Nachricht an das Paar' })}
        >
          {statut === 'aucun' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0014 0M12 17v4M8 21h8" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
          )}
          {statut === 'attente' && <i className="lo-micro-point" aria-hidden="true" />}
        </button>
        <span className="lo-micro-legende">{t({ fr: 'Livre d’or', en: 'Guestbook', de: 'Gästebuch' })}</span>
      </div>

      {parti && (
        <div className="cam-dans-la-boite" role="status" aria-live="polite">
          <span>{t({ fr: 'Message envoyé aux mariés 💌', en: 'Message sent to the couple 💌', de: 'Nachricht an das Paar gesendet 💌' })}</span>
        </div>
      )}

      {etape && (
        <div className="lo-ecran" role="dialog" aria-modal="true">
          <div className="lo-haut">
            <button type="button" className="lo-fermer" onClick={fermer} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>✕</button>
            <span className="lo-prive">🔒 {t({ fr: 'Seuls les mariés l’écouteront', en: 'Only the couple will hear it', de: 'Nur das Paar wird sie hören' })}</span>
          </div>

          {(etape === 'intro' || etape === 'enregistre') && (
            <div className="lo-corps">
              <h2 className="lo-titre">
                {etape === 'enregistre'
                  ? t({ fr: 'Je t’écoute…', en: 'Listening…', de: 'Ich höre zu…' })
                  : t({ fr: 'Laisse un mot aux mariés', en: 'Leave a word for the couple', de: 'Hinterlassen Sie dem Paar ein paar Worte' })}
              </h2>
              <p className="lo-texte">
                {etape === 'enregistre'
                  ? t({ fr: 'Appuie sur le carré quand tu as fini.', en: 'Tap the square when you’re done.', de: 'Tippen Sie auf das Quadrat, wenn Sie fertig sind.' })
                  : t({ fr: 'Un souvenir, un vœu, un fou rire : une minute au plus.', en: 'A memory, a wish, a laugh: one minute max.', de: 'Eine Erinnerung, ein Wunsch, ein Lacher: höchstens eine Minute.' })}
              </p>

              <div className="lo-vu">
                <Onde valeurs={etape === 'enregistre' ? niveaux : null} couleur="#fff" fond="rgba(255,255,255,.22)" progression={etape === 'enregistre' ? 1 : 0} hauteur={64} vivante={etape === 'enregistre'} />
              </div>
              <div className={`lo-decompte ${etape === 'enregistre' && restant <= 10000 ? 'lo-decompte-fin' : ''}`}>
                {minutesSecondes(etape === 'enregistre' ? restant : DUREE_MAX_MS)}
              </div>

              {etape === 'enregistre' ? (
                <button type="button" className="lo-rec lo-rec-on" onClick={() => arreterEnregistrement()} aria-label={t({ fr: 'Arrêter', en: 'Stop', de: 'Stopp' })}><span /></button>
              ) : (
                <button type="button" className="lo-rec" onClick={demarrer} aria-label={t({ fr: 'Enregistrer', en: 'Record', de: 'Aufnehmen' })}><span /></button>
              )}
              {etape === 'intro' && <p className="lo-aide">{t({ fr: 'Appuie pour enregistrer', en: 'Tap to record', de: 'Zum Aufnehmen tippen' })}</p>}

              {micRefuse && (
                <div className="lo-alerte">
                  <strong>{t({ fr: 'Ton micro est bloqué', en: 'Your microphone is blocked', de: 'Ihr Mikrofon ist blockiert' })}</strong>
                  <span>{t({
                    fr: 'Pour laisser un message, autorise le micro pour ce site : sur iPhone, touche « aA » dans la barre d’adresse, puis « Réglages du site web » ; sur Android, touche le cadenas à gauche de l’adresse. Puis réessaie.',
                    en: 'To leave a message, allow the microphone for this site: on iPhone, tap “aA” in the address bar, then “Website Settings”; on Android, tap the padlock left of the address. Then try again.',
                    de: 'Um eine Nachricht zu hinterlassen, erlauben Sie das Mikrofon für diese Seite: auf dem iPhone in der Adressleiste auf „aA“ und dann „Website-Einstellungen“ tippen; auf Android auf das Schloss links neben der Adresse. Dann erneut versuchen.',
                  })}</span>
                  <button type="button" onClick={demarrer}>{t({ fr: 'Réessayer', en: 'Try again', de: 'Erneut versuchen' })}</button>
                </div>
              )}
            </div>
          )}

          {etape === 'ecoute' && prise && (
            <div className="lo-corps">
              <h2 className="lo-titre">{t({ fr: 'Réécoute ton message', en: 'Listen to your message', de: 'Hören Sie Ihre Nachricht an' })}</h2>
              <p className="lo-texte">{minutesSecondes(prise.dureeMs)}</p>
              <audio ref={audioRef} src={prise.url} preload="auto" onTimeUpdate={suivreLecture} onPlay={suivreLecture} onPause={suivreLecture} onEnded={suivreLecture} />
              <div className="lo-lecteur">
                <button type="button" className="lo-play" onClick={basculerLecture} aria-label={lecture.joue ? 'Pause' : t({ fr: 'Écouter', en: 'Play', de: 'Abspielen' })}>
                  {lecture.joue ? '❚❚' : '▶'}
                </button>
                <Onde valeurs={prise.onde} progression={lecture.progression} couleur="var(--accent)" fond="rgba(255,255,255,.25)" hauteur={48} />
              </div>
              <div className="lo-actions">
                <button type="button" className="lo-btn lo-btn-ghost" onClick={refaire}>↺ {t({ fr: 'Recommencer', en: 'Start over', de: 'Neu beginnen' })}</button>
                <button type="button" className="lo-btn" onClick={allerAuSelfie}>{t({ fr: 'Valider', en: 'Confirm', de: 'Bestätigen' })} →</button>
              </div>
            </div>
          )}

          {etape === 'selfie' && (
            <div className="lo-corps">
              <h2 className="lo-titre">{t({ fr: 'Signe ton message avec un selfie', en: 'Sign your message with a selfie', de: 'Unterschreiben Sie Ihre Nachricht mit einem Selfie' })}</h2>
              <p className="lo-texte">{t({ fr: 'Ton message est bien parti ✓ Le selfie ne compte pas dans ta pellicule.', en: 'Your message has been sent ✓ The selfie doesn’t count towards your film roll.', de: 'Ihre Nachricht ist unterwegs ✓ Das Selfie zählt nicht zu Ihrem Film.' })}</p>

              <div className="lo-selfie">
                {selfie ? (
                  <img src={selfie.url} alt="" />
                ) : selfieSansCamera ? (
                  <div className="lo-selfie-vide">🤳</div>
                ) : (
                  <>
                    <video ref={videoRef} playsInline muted autoPlay style={{ transform: 'scaleX(-1)' }} />
                    <div className="vignette" />
                    <div className="vf-label">FLASH&nbsp;400</div>
                  </>
                )}
              </div>

              {selfie ? (
                <div className="lo-actions">
                  <button type="button" className="lo-btn lo-btn-ghost" onClick={allerAuSelfie}>↺ {t({ fr: 'Reprendre', en: 'Retake', de: 'Neu aufnehmen' })}</button>
                  <button type="button" className="lo-btn" onClick={() => envoyer(true)}>{t({ fr: 'Envoyer', en: 'Send', de: 'Senden' })} 💌</button>
                </div>
              ) : selfieSansCamera ? (
                <>
                  <input ref={fichierSelfie} type="file" accept="image/*" capture="user" onChange={selfieDepuisFichier} style={{ display: 'none' }} />
                  <button type="button" className="lo-btn" onClick={() => fichierSelfie.current?.click()}>{t({ fr: 'Prendre mon selfie', en: 'Take my selfie', de: 'Mein Selfie aufnehmen' })}</button>
                </>
              ) : (
                <button type="button" className="shutter lo-shutter" onClick={declencherSelfie} aria-label={t({ fr: 'Prendre le selfie', en: 'Take the selfie', de: 'Selfie aufnehmen' })}><span /></button>
              )}
              {!selfie && (
                <button type="button" className="lo-passer" onClick={() => envoyer(false)}>{t({ fr: 'Passer', en: 'Skip', de: 'Überspringen' })}</button>
              )}
            </div>
          )}

          {etape === 'mien' && (
            <div className="lo-corps">
              <h2 className="lo-titre">{t({ fr: 'Ton message pour les mariés', en: 'Your message for the couple', de: 'Ihre Nachricht an das Paar' })}</h2>
              <p className="lo-texte">
                {statut === 'attente'
                  ? t({ fr: 'En route : il partira dès que le réseau le permettra.', en: 'On its way: it will be sent as soon as the network allows.', de: 'Unterwegs: Sie wird gesendet, sobald das Netz es zulässt.' })
                  : t({ fr: 'Bien reçu par les mariés ✓', en: 'Received by the couple ✓', de: 'Beim Paar angekommen ✓' })}
              </p>
              {visageMien && <div className="lo-selfie lo-selfie-petit"><img src={visageMien} alt="" /></div>}
              {sourceMien && (
                <>
                  <audio ref={audioRef} src={sourceMien} preload="auto" onTimeUpdate={suivreLecture} onPlay={suivreLecture} onPause={suivreLecture} onEnded={suivreLecture} />
                  <div className="lo-lecteur">
                    <button type="button" className="lo-play" onClick={basculerLecture} aria-label={lecture.joue ? 'Pause' : t({ fr: 'Écouter', en: 'Play', de: 'Abspielen' })}>
                      {lecture.joue ? '❚❚' : '▶'}
                    </button>
                    <Onde valeurs={mien?.onde} progression={lecture.progression} couleur="var(--accent)" fond="rgba(255,255,255,.25)" hauteur={48} />
                  </div>
                </>
              )}
              <div className="lo-actions">
                {/* Refaire n'a de sens que tant que la soirée court. */}
                {ouvert && <button type="button" className="lo-btn lo-btn-ghost" onClick={refaire}>↺ {t({ fr: 'Refaire mon message', en: 'Redo my message', de: 'Nachricht neu aufnehmen' })}</button>}
                <button type="button" className="lo-btn" onClick={fermer}>{t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}</button>
              </div>
              {ouvert && <p className="lo-aide">{t({ fr: 'Un nouveau message remplace l’ancien.', en: 'A new message replaces the old one.', de: 'Eine neue Nachricht ersetzt die alte.' })}</p>}
            </div>
          )}

          {erreur && <div className="err" style={{ margin: '12px auto 0', maxWidth: 360 }}>{erreur}</div>}
          {flashEcran && <div className="screen-flash" />}
        </div>
      )}
    </>
  )
}
