'use client'

// ============================================================
//  Tableau de bord organisateur.
//
//  Principe : un seul écran, toujours le même, dans le même ordre.
//  Seule la GRANDE CARTE du haut change selon le moment (avant la
//  fête / pendant / le lendemain). Tout le reste est toujours là,
//  simplement replié — pour qu'on retrouve toujours ce qu'on cherche.
// ============================================================

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { BRAND, avatarColor } from '../../../lib/brand'
import Logo from '../../../components/Logo'
import InstallPrompt from '../../../components/InstallPrompt'
import { eventPhase, isRevealed, quotaLocked, AVANT, JOUR_J, APRES } from '../../../lib/phase'
import { formatPrice, SHOTS_MIN, SHOTS_MAX } from '../../../lib/pricing'
import { purgeDate } from '../../../lib/retention'
import { fileToImage, compressToBlob } from '../../../lib/camera'
import { DEFAULT_EVENT_NAME } from '../../../lib/event-defaults'
import { getOwnerToken, saveOwnerToken, rememberMyEvent, forgetMyEvent } from '../../../lib/device'
import Bilan from '../../../components/Bilan'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatShort(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatHour(iso) {
  try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Jour J'
  const d = Math.ceil(diff / 86400000)
  return d <= 1 ? 'Demain' : 'J-' + d
}
// Jour seul, sans heure : « 6 mars 2027 ».
function formatJour(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return '' }
}
// Convertit une date ISO en valeur pour un champ <input type="datetime-local"> (heure locale)
function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// --- Bloc repliable : rien ne disparaît jamais, tout se range ---
function Section({ id, title, hint, badge, children, open, onToggle }) {
  return (
    <section id={id} className={`db-sec ${open ? 'on' : ''}`}>
      <h2>
        <button type="button" className="db-sec-head" onClick={onToggle} aria-expanded={open}>
          <span className="db-sec-titles">
            <span className="db-sec-title">{title}</span>
            {hint && <span className="db-sec-hint">{hint}</span>}
          </span>
          {badge && <span className="db-sec-badge">{badge}</span>}
          <span className="db-sec-chev" aria-hidden="true">⌄</span>
        </button>
      </h2>
      {open && <div className="db-sec-body">{children}</div>}
    </section>
  )
}

// Outils d'aperçu réservés au poste de développement : la condition est figée à
// la compilation, donc rien de tout cela n'existe dans la version en ligne.
const DEV = process.env.NODE_ENV !== 'production'

// Gestes qu'on ne pose qu'une fois (mettre au calendrier). Simple aide-mémoire
// d'affichage, propre à l'appareil : rien de critique, donc pas de colonne en base.
const FAIT_KEY = (id) => `ttf_fait_${id}`

// Repris du tunnel de création : la même explication doit accompagner le même choix.
const SHOT_PRESETS = [
  { n: 3, em: '💎', title: '3 clichés', sub: 'Très rare — chaque photo est un événement' },
  { n: 5, em: '🎞️', title: '5 clichés', sub: 'Le bon équilibre, recommandé' },
  { n: 8, em: '📸', title: '8 clichés', sub: 'Plus généreux, pour les longues soirées' },
]

// Les trois moments d'un événement, dans l'ordre. Sert à la barre d'aperçu locale.
const MOMENTS = [
  { key: AVANT, title: 'Avant', sub: () => 'Préparatifs' },
  { key: JOUR_J, title: 'Le jour J', sub: (ev) => (ev.startsAt ? formatShort(ev.startsAt) : 'La fête') },
  { key: APRES, title: 'Après', sub: (ev) => `Révélation ${formatShort(ev.revealAt)}` },
]

export default function EventManage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [joinUrl, setJoinUrl] = useState('')
  const [galleryUrl, setGalleryUrl] = useState('')
  const [ownerUrl, setOwnerUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [sheet, setSheet] = useState(null) // 'qr' | 'message' | null
  // Une seule section ouverte à la fois. « Réglages » l'est d'emblée : c'est là
  // qu'on se rend en préparant son événement. Une fois la révélation passée,
  // il n'y a plus grand-chose à régler : c'est l'album qui prend la place.
  const [openSec, setOpenSec] = useState('reglages')
  const sectionChoisie = useRef(false)

  // Petits retours "copié ✓"
  const [flash, setFlash] = useState('')
  const ping = (k) => { setFlash(k); setTimeout(() => setFlash(''), 1800) }

  const [confirmDel, setConfirmDel] = useState(false)
  const [confirmReveal, setConfirmReveal] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmNom, setConfirmNom] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [adminFirst, setAdminFirst] = useState('')
  const [adminLast, setAdminLast] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [editing, setEditing] = useState('') // 'name' | 'start' | 'reveal' | 'shots' | ''
  const [draftName, setDraftName] = useState('')
  const [draftDate, setDraftDate] = useState('')
  const [draftShots, setDraftShots] = useState(5)
  const [shotsLibre, setShotsLibre] = useState(false) // palier « Plus » sélectionné
  const [draftBonus, setDraftBonus] = useState(5)
  const [settingMsg, setSettingMsg] = useState('')
  const [forceMoment, setForceMoment] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  // Recadrage : `pos` est la position en cours d'ajustement, `null` tant qu'on
  // n'y a pas touché — on affiche alors celle enregistrée.
  const [recadrage, setRecadrage] = useState(false)
  const [confirmCover, setConfirmCover] = useState(false)
  const [pos, setPos] = useState(null)
  const glisseRef = useRef(null)
  const [fait, setFait] = useState({})
  // Rappel « mettez-le à votre agenda » : passe une fois, puis plus jamais.
  const [notifCal, setNotifCal] = useState(false)
  const [upgradeMsg, setUpgradeMsg] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const [galleryCodeInput, setGalleryCodeInput] = useState('')
  const [protecting, setProtecting] = useState(false)
  const [codeDraft, setCodeDraft] = useState('')
  const [souhaiteCode, setSouhaiteCode] = useState(false) // case cochée, code pas encore saisi
  const [codeSauve, setCodeSauve] = useState(false)
  const [savingGallery, setSavingGallery] = useState(false)
  const [galleryMsg, setGalleryMsg] = useState('')
  const [message, setMessage] = useState('')

  // Bilan de la soirée : chargé seulement une fois l'album ouvert. Avant, ces
  // chiffres sont à zéro et n'annoncent qu'un échec.
  const [bilan, setBilan] = useState(null)

  const reload = useCallback(async () => {
    const token = getOwnerToken(id)
    try {
      const r = await fetch(`/api/events/${id}`, { headers: { 'x-owner-token': token } })
      const d = await r.json()
      if (d.error) setError(d.error)
      else setEv(d)
    } catch { setError("Impossible de charger l'événement.") }
  }, [id])

  useEffect(() => {
    // Lien privé organisateur ouvert depuis un autre appareil : ?k=<jeton> → on l'enregistre
    // pour reconnaître cet appareil comme organisateur, puis on nettoie l'adresse.
    const sp = new URLSearchParams(window.location.search)
    const k = sp.get('k')
    if (k) {
      saveOwnerToken(id, k)
      rememberMyEvent(id)
      window.history.replaceState(null, '', `/event/${id}`)
    }
    // Retour du paiement d'une mise à niveau de formule : on l'applique, puis on
    // nettoie l'adresse pour qu'un rechargement ne rejoue pas l'opération.
    const up = sp.get('upgrade_session')
    if (up) {
      window.history.replaceState(null, '', `/event/${id}`)
      fetch('/api/checkout/upgrade/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ sessionId: up }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.error) setUpgradeMsg(d.error); else setUpgradeMsg('ok') })
        .catch(() => setUpgradeMsg('La mise à niveau n’a pas pu être appliquée. Réessayez.'))
        .finally(reload)
    }
    const m = sp.get('moment')
    if (DEV && MOMENTS.some((x) => x.key === m)) setForceMoment(m)
    try { setFait(JSON.parse(localStorage.getItem(FAIT_KEY(id)) || '{}')) } catch {}
    const origin = window.location.origin
    setJoinUrl(`${origin}/j/${id}`)
    setGalleryUrl(`${origin}/g/${id}`)
    setOwnerUrl(`${origin}/event/${id}?k=${getOwnerToken(id)}`)
    reload()
  }, [id, reload])

  useEffect(() => {
    if (!joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 520, margin: 1, color: { dark: '#14161F', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [joinUrl])

  // Pendant la soirée, l'écran doit vivre : on rafraîchit les compteurs.
  // En local, `?moment=` force le moment affiché pour pouvoir regarder les trois
  // écrans sans attendre la vraie date. Neutralisé dans la version en ligne.
  const phase = ev ? (DEV && forceMoment ? forceMoment : eventPhase(ev, now)) : null
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(tick)
  }, [])
  useEffect(() => {
    if (phase !== JOUR_J) return
    const t = setInterval(reload, 10000)
    return () => clearInterval(t)
  }, [phase, reload])

  // Le champ suit le code enregistré : rouvrir la feuille ne doit pas montrer
  // un code périmé. Un code actif implique évidemment la case cochée.
  useEffect(() => {
    if (!ev?.galleryCode) return
    setCodeDraft(ev.galleryCode)
    setSouhaiteCode(true)
  }, [ev?.galleryCode])

  // Section ouverte au premier chargement : décidée une seule fois, dès que
  // l'événement est connu, pour ne pas défaire un repli fait à la main.
  useEffect(() => {
    if (!ev || sectionChoisie.current) return
    sectionChoisie.current = true
    const revelationPassee = !!ev.revealAt && new Date(ev.revealAt).getTime() <= Date.now()
    if (revelationPassee) setOpenSec('album')
  }, [ev])

  // Le bilan n'a de sens qu'une fois l'album ouvert : c'est là que
  // l'organisateur revient, et là que les chiffres deviennent flatteurs.
  useEffect(() => {
    if (!ev || !isRevealed(ev, now) || bilan) return
    fetch(`/api/events/${id}/bilan`, { headers: { 'x-owner-token': getOwnerToken(id) } })
      .then((r) => r.json())
      .then((d) => { if (!d.error && !d.quotaBlocked) setBilan(d) })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev, id])

  useEffect(() => {
    if (!ev || phase !== AVANT || fait.calVue) return
    setNotifCal(true)      // visible pour toute cette visite
    marquerFait('calVue')  // et plus jamais aux suivantes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev, phase])

  // --- Actions ---
  async function patchEvent(patch) {
    setSettingMsg('')
    const token = getOwnerToken(id)
    const r = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-owner-token': token },
      body: JSON.stringify(patch),
    })
    const d = await r.json().catch(() => ({}))
    if (d.error) { setSettingMsg(d.error); return false }
    await reload()
    return true
  }

  // Agrandir la formule : direction Stripe pour régler la seule différence.
  async function startUpgrade() {
    if (!ev?.upgrade) return
    setUpgradeMsg('')
    setUpgrading(true)
    try {
      const r = await fetch('/api/checkout/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ eventId: id, maxGuests: ev.upgrade.maxGuests }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      // Déjà réglé par quelqu'un d'autre — ou par soi-même, dans un onglet
      // fermé avant le retour : le serveur vient de l'appliquer. On ne
      // renvoie personne vers un second paiement.
      if (d.alreadyPaid) {
        setUpgradeMsg('ok')
        setUpgrading(false)
        await reload()
        return
      }
      window.location.href = d.url
    } catch (err) {
      setUpgradeMsg(err.message)
      setUpgrading(false)
    }
  }

  // Photo de couverture : réglée après paiement, pas avant. Compressée dans le
  // navigateur — une photo de téléphone brute est bien trop lourde.
  async function uploadCover(file) {
    if (!file) return
    setSettingMsg('')
    setCoverBusy(true)
    try {
      const img = await fileToImage(file)
      const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
      const fd = new FormData()
      fd.append('file', blob, 'cover.jpg')
      fd.append('ownerToken', getOwnerToken(id))
      const r = await fetch(`/api/events/${id}/cover`, { method: 'POST', body: fd })
      const d = await r.json().catch(() => ({}))
      if (d.error) throw new Error(d.error)
      await reload()
      // Le cadrage n'existe qu'ici, dans la foulée de l'envoi : c'est le moment
      // où l'on regarde sa photo et où l'on voit si elle tombe juste. En faire
      // une option permanente ajoutait un bouton pour un geste rarement repris.
      setPos('50% 50%')
      setRecadrage(true)
    } catch (err) {
      setSettingMsg(err.message || "Échec de l'envoi de l'image.")
    } finally {
      setCoverBusy(false)
    }
  }

  // Retirer la photo : l'écran d'accueil retrouve son dégradé.
  async function supprimerCover() {
    setSettingMsg('')
    setCoverBusy(true)
    try {
      const r = await fetch(`/api/events/${id}/cover`, {
        method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
      })
      const d = await r.json().catch(() => ({}))
      if (d.error) throw new Error(d.error)
      setPos(null)
      setRecadrage(false)
      setConfirmCover(false)
      await reload()
    } catch (err) {
      setSettingMsg(err.message || 'Suppression impossible.')
    } finally { setCoverBusy(false) }
  }

  // --- Recadrage : on déplace la photo dans son cadre, en pourcentages ---
  function debutGlisse(e) {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const [x, y] = (pos || ev.coverPos || '50% 50%').split(' ').map((v) => parseInt(v, 10))
    glisseRef.current = { x0: e.clientX, y0: e.clientY, x, y, w: e.currentTarget.offsetWidth, h: e.currentTarget.offsetHeight }
  }
  function glisse(e) {
    const g = glisseRef.current
    if (!g) return
    // Glisser vers la droite doit faire apparaître ce qui est à gauche : le
    // déplacement du point de cadrage est donc inverse de celui du doigt.
    const borne = (v) => Math.max(0, Math.min(100, Math.round(v)))
    const x = borne(g.x - ((e.clientX - g.x0) / g.w) * 100)
    const y = borne(g.y - ((e.clientY - g.y0) / g.h) * 100)
    setPos(`${x}% ${y}%`)
  }
  function finGlisse() { glisseRef.current = null }

  // Le QR affiché est calibré pour l'écran : pour un fichier qu'on va reprendre
  // ailleurs (faire-part, écran, imprimeur), on le régénère bien plus grand.
  async function telechargerQR() {
    try {
      const url = await QRCode.toDataURL(joinUrl, {
        width: 2000, margin: 2, color: { dark: '#14161F', light: '#ffffff' },
      })
      const base = (ev?.name || 'evenement').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${base || 'evenement'}.png`
      a.click()
      ping('qr')
    } catch {}
  }

  // Déplacer la soirée déplace la révélation du même écart : « le lendemain »
  // doit rester le lendemain. Sans ça, on pouvait révéler avant la fête.
  async function decalerSoiree() {
    const nouveau = new Date(draftDate)
    if (isNaN(nouveau.getTime())) { setSettingMsg('Date invalide.'); return }
    const ancien = new Date(ev.startsAt || ev.revealAt)
    const ecart = new Date(ev.revealAt).getTime() - ancien.getTime()
    const patch = { startsAt: nouveau.toISOString() }
    if (Number.isFinite(ecart) && ecart > 0) {
      patch.revealAt = new Date(nouveau.getTime() + ecart).toISOString()
    }
    if (await patchEvent(patch)) setEditing('')
  }

  function copy(text, key) {
    navigator.clipboard?.writeText(text).then(() => ping(key)).catch(() => {})
  }
  async function shareOrCopy({ title, text, url }, key) {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return } catch {}
    }
    copy(url || text, key)
  }

  function pad(n) { return String(n).padStart(2, '0') }
  function icsStamp(d) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  }
  function marquerFait(k) {
    setFait((f) => {
      const suite = { ...f, [k]: true }
      try { localStorage.setItem(FAIT_KEY(id), JSON.stringify(suite)) } catch {}
      return suite
    })
  }

  function addToCalendar() {
    // Deux rendez-vous : la fête elle-même (avec le QR à montrer) et la révélation.
    const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
    const block = (uid, start, end, summary, description) => [
      'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`,
      `SUMMARY:${esc(summary)}`, `DESCRIPTION:${esc(description)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(ev.name)}`, 'END:VALARM',
      'END:VEVENT',
    ]
    const start = new Date(ev.startsAt || ev.revealAt)
    const reveal = new Date(ev.revealAt)
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TimeToFlash//FR', 'CALSCALE:GREGORIAN',
      ...block(`${id}-start@timetoflash`, start, new Date(start.getTime() + 5 * 3600000),
        `📸 ${ev.name} — appareil photo partagé`,
        `Pensez à poser les cartons QR.\nVotre tableau de bord organisateur (à garder privé) : ${ownerUrl}`),
      ...block(`${id}-reveal@timetoflash`, reveal, new Date(reveal.getTime() + 3600000),
        `📸 Révélation des photos — ${ev.name}`,
        `Les photos s'ouvrent aujourd'hui !\nTableau de bord : ${ownerUrl}`),
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${ev.name.replace(/[^\w\s-]/g, '')}.ics`
    a.click()
    URL.revokeObjectURL(a.href)
    ping('cal')
  }

  // Protéger l'album depuis la feuille de partage. Le code n'a de valeur que
  // s'il voyage avec le lien : on l'ajoute au message dans le même geste,
  // sinon l'organisateur protège un album que personne ne peut plus ouvrir.
  const LIGNE_CODE = (c) => `Code d'accès à l'album : ${c}`

  function sansLigneCode(t) {
    return (t || '')
      .split('\n')
      .filter((l) => !/^Code d'accès à l'album\s*:/.test(l.trim()))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Le code se glisse avant la phrase de disponibilité : on lit d'abord ce
  // qu'il faut pour entrer, la date de fin vient après.
  function avecLigneCode(t, code) {
    const paragraphes = sansLigneCode(t).split('\n\n')
    const i = paragraphes.findIndex((p) => /L'album reste disponible/.test(p))
    if (i === -1) paragraphes.push(LIGNE_CODE(code))
    else paragraphes.splice(i, 0, LIGNE_CODE(code))
    return paragraphes.join('\n\n')
  }

  // Le dernier code choisi, gardé même après avoir retiré la protection :
  // celui qui la remet veut presque toujours reprendre le même.
  const CLE_CODE = `ttf_code_${id}`
  const lireCodeMemo = () => { try { return localStorage.getItem(CLE_CODE) || '' } catch { return '' } }
  const garderCodeMemo = (c) => { try { localStorage.setItem(CLE_CODE, c) } catch {} }

  async function basculerProtection(active) {
    setSouhaiteCode(active)
    if (!active) {
      setProtecting(true)
      try {
        if (await patchEvent({ galleryCode: '' })) setMessage(sansLigneCode(shareText))
      } finally { setProtecting(false) }
      return
    }
    // On n'invente rien à la place de l'organisateur : soit on reprend le code
    // qu'il avait déjà choisi, soit on lui laisse le champ libre.
    const memo = ev.galleryCode || lireCodeMemo()
    setCodeDraft(memo)
    if (memo) enregistrerCode(memo)
  }

  // Enregistrement automatique : un code qu'il faut penser à valider est un
  // code qu'on croit posé alors qu'il ne l'est pas.
  const minuteurCode = useRef(null)
  async function enregistrerCode(valeur) {
    const code = (valeur || '').trim()
    if (!code || code === ev.galleryCode) return
    setProtecting(true)
    try {
      if (!(await patchEvent({ galleryCode: code }))) return
      garderCodeMemo(code)
      setMessage(avecLigneCode(shareText, code))
      setCodeSauve(true)
      clearTimeout(minuteurSauve.current)
      minuteurSauve.current = setTimeout(() => setCodeSauve(false), 1800)
    } finally { setProtecting(false) }
  }
  const minuteurSauve = useRef(null)
  function saisirCode(valeur) {
    setCodeDraft(valeur)
    clearTimeout(minuteurCode.current)
    minuteurCode.current = setTimeout(() => enregistrerCode(valeur), 700)
  }

  async function saveGalleryCode(code) {
    setSavingGallery(true); setGalleryMsg('')
    const okDone = await patchEvent({ galleryCode: code })
    if (okDone) { setGalleryCodeInput(''); setGalleryMsg('') } else setGalleryMsg(settingMsg || 'Enregistrement impossible.')
    setSavingGallery(false)
  }

  async function addAdmin(e) {
    e.preventDefault(); setAdminMsg(''); setAddingAdmin(true)
    try {
      const r = await fetch(`/api/events/${id}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ firstName: adminFirst, lastName: adminLast, email: adminEmail }),
      })
      const d = await r.json()
      if (d.error) setAdminMsg(d.error)
      else { setAdminFirst(''); setAdminLast(''); setAdminEmail(''); await reload() }
    } catch { setAdminMsg('Ajout impossible.') }
    setAddingAdmin(false)
  }
  async function removeAdmin(adminId) {
    await fetch(`/api/events/${id}/admins?adminId=${adminId}`, {
      method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
    })
    await reload()
  }
  async function deleteEvent() {
    setDeleting(true)
    const r = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) } })
    const d = await r.json().catch(() => ({}))
    if (d.error) { setError(d.error); setDeleting(false); return }
    forgetMyEvent(id)
    router.push('/mes-evenements')
  }

  if (error && !ev) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!ev) return <main className="center-screen"><p className="muted">Chargement…</p></main>

  // ---- État dérivé ----
  const revealed = isRevealed(ev, now)
  // L'heure de révélation est-elle passée ? Distinct de `revealed`, qui tient
  // aussi compte de la formule dépassée : c'est ce qui permet de dire à
  // l'organisateur « l'album attend » plutôt que « c'est prévu pour plus tard ».
  const revealedTime = !!ev.revealAt && new Date(ev.revealAt).getTime() <= now
  const locked = quotaLocked(ev, now)
  const published = !!ev.publishedAt
  const paused = !!ev.revealPaused
  const shotsLeft = Math.max(0, (ev.guestCount || 0) * (ev.shotsPerGuest || 0) - (ev.photoCount || 0))
  const finAlbum = purgeDate(ev.revealAt)
  // Un album protégé dont le message tait le code laisse cent invités devant
  // une porte fermée : le code fait partie du message par défaut.
  const messageDeBase = revealed
    ? `Les photos de ${ev.name} sont en ligne ! ${ev.visibleCount ?? ev.photoCount} clichés pris par vous tous. C'est ici : ${galleryUrl}\n\nL'album reste disponible jusqu'au ${finAlbum ? formatJour(finAlbum) : 'dans six mois'}.`
    : `Les photos de ${ev.name} sortent le ${formatDate(ev.revealAt)}. Gardez ce lien, elles s'ouvriront toutes seules : ${galleryUrl}`
  const defaultMessage = ev.galleryCode ? avecLigneCode(messageDeBase, ev.galleryCode) : messageDeBase
  const shareText = message || defaultMessage

  const toggleSec = (k) => setOpenSec((s) => (s === k ? null : k))

  // Renvoi d'une section à une autre : l'ouvrir ne suffit pas si elle est
  // ailleurs dans la page — on l'amène aussi sous les yeux.
  function allerA(cle, ancre) {
    setOpenSec(cle)
    requestAnimationFrame(() => {
      document.getElementById(ancre)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  // QR nu, en grand format : destiné à être repris dans un faire-part ou une
  // décoration, pas à être imprimé tel quel.
  async function telechargerQRSeul() {
    try {
      const png = await QRCode.toDataURL(`${window.location.origin}/j/${id}`, {
        width: 2000, margin: 2, color: { dark: '#14161F', light: '#ffffff' },
      })
      const base = (ev?.name || 'evenement').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
      const a = document.createElement('a')
      a.href = png
      a.download = `qr-${base || 'evenement'}.png`
      a.click()
    } catch {}
  }

  const invitant = ev.hostNames || ev.name || ''
  const aplat = (v) => (v || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const nomRecopie = aplat(confirmNom) === aplat(ev.name)
  const posAffichee = pos || ev.coverPos || '50% 50%'

  // ---- La grande carte : le seul élément qui change selon le moment ----
  function Hero() {
    if (phase === AVANT) {
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-eyebrow">à préparer</span>
            <span className="db-pill">{daysUntil(ev.startsAt || ev.revealAt)}</span>
          </div>
          <h2 className="db-hero-title">Imprimez votre QR code</h2>
          <p className="db-hero-sub">
            Vos invités scannent sur place le jour J. Rien à leur envoyer avant, rien à installer.
          </p>
          <Link href={`/event/${id}/imprimer`} className="btn btn-accent db-hero-cta">
            Choisir un format et imprimer →
          </Link>
          {/* Raccourci pour ceux qui ont déjà leurs faire-part ou leur
              décoration : ils ne veulent que l'image, pas une mise en page. */}
          <button type="button" className="db-hero-alt" onClick={telechargerQRSeul}>
            ou télécharger le QR code seul (PNG)
          </button>
          {/* L'agenda a quitté cette carte : il fait l'objet d'un rappel qui
              passe une fois (voir plus haut), puis reste dans « Votre accès ».
              On ne peut pas savoir si le fichier a été ouvert, donc on ne
              prétend rien : on cesse simplement d'insister. */}
        </div>
      )
    }

    if (phase === JOUR_J) {
      const guests = ev.guests || []
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-live"><span className="db-dot" /> en direct</span>
            <span className="db-eyebrow">depuis {formatHour(ev.startsAt)}</span>
          </div>
          {/* Seul « photos prises » mène quelque part, et directement à l'album :
              taper ce nombre, c'est vouloir les voir. « Invités connectés »
              compte tout le monde, là où la section n'en liste qu'une partie —
              le lien aurait déçu. La flèche signale ce qui se touche : sur un
              fond sombre, un survol ne se voit pas, et sur téléphone il n'existe pas. */}
          <div className="db-stats">
            <button type="button" className="db-stats-go"
              onClick={() => allerA('contacts', 'sec-invites')} disabled={!ev.contacts?.length}>
              <b>{ev.guestCount}</b><span>invités connectés <span aria-hidden="true">→</span></span>
            </button>
            <Link href={`/g/${id}`} className="db-stats-go">
              <b>{ev.photoCount}</b><span>photos prises <span aria-hidden="true">→</span></span>
            </Link>
            <div><b>{shotsLeft}</b><span>déclics restants</span></div>
          </div>

          {ev.recentPhotos?.length > 0 && (
            <>
              <div className="db-strip-head">
                <span className="db-eyebrow">les dernières arrivées</span>
                <span className="db-only">vous seul</span>
              </div>
              <div className="db-strip">
                {ev.recentPhotos.map((p) => (
                  // Une vignette illisible (fichier purgé, réseau coupé) se retire
                  // toute seule plutôt que d'afficher une image cassée.
                  <img key={p.id} src={p.url} alt="" loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }} />
                ))}
              </div>
            </>
          )}

          {guests.length > 0 && (
            <div className="db-roster">
              {guests.slice(0, 5).map((g) => (
                <div className="db-roster-row" key={g.id}>
                  <span className="db-av" style={{ background: avatarColor(g.name || '') }}>
                    {(g.name || '?').trim().charAt(0).toUpperCase()}
                    {g.active && <i className="db-av-dot" />}
                  </span>
                  <span className="db-roster-name">{g.name}</span>
                  <span className="db-roster-count">{g.shots}/{g.total}</span>
                </div>
              ))}
              {guests.length > 5 && (
                <div className="db-roster-more">+ {guests.length - 5} autres invités</div>
              )}
            </div>
          )}

          <Link href={`/j/${id}`} className="btn btn-accent db-hero-cta">📷 Prendre mes photos</Link>
          <button className="btn db-hero-2nd" onClick={() => setSheet('qr')}>
            Un retardataire ? Montrer le QR
          </button>
        </div>
      )
    }

    // --- Le lendemain ---
    if (paused) {
      return (
        <div className="db-hero db-hero-paused">
          <div className="db-hero-top"><span className="db-eyebrow">révélation suspendue</span></div>
          <h2 className="db-hero-title">L'album est en pause</h2>
          <p className="db-hero-sub">
            Vos invités ne voient rien, même si l'heure de révélation est passée.
            Prenez le temps de vérifier les photos, puis reprenez quand vous voulez.
          </p>
          <Link href={`/g/${id}`} className="btn btn-dark db-hero-cta">Vérifier les photos →</Link>
          <button className="btn db-hero-2nd" onClick={() => patchEvent({ revealPaused: false })}>
            Reprendre la révélation
          </button>
        </div>
      )
    }

    if (revealed) {
      return (
        <>
          <div className="db-hero db-hero-ink">
            <div className="db-hero-top"><span className="db-eyebrow">c'est ouvert</span></div>
            <h2 className="db-hero-title">Album révélé</h2>
            {/* Le nombre annoncé est celui que les invités voient : les photos
                masquées ne sont visibles de personne. */}
            <p className="db-hero-sub">
              {ev.visibleCount ?? ev.photoCount} photos, visibles par tous vos invités.
              À eux de découvrir.
            </p>
            <button className="btn btn-accent db-hero-cta" onClick={() => setSheet('message')}>
              ✉️ Partager l'album
            </button>
            <Link href={`/g/${id}`} className="btn db-hero-2nd">Voir les photos</Link>
          </div>
          <Bilan bilan={bilan} />
        </>
      )
    }

    if (published) {
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-eyebrow">album validé</span>
            <span className="db-pill">{daysUntil(ev.revealAt)}</span>
          </div>
          <h2 className="db-hero-title">Révélation programmée</h2>
          <p className="db-hero-sub">
            Vos {ev.photoCount} photos s'ouvriront à tous le {formatShort(ev.revealAt)}. Vous n'avez plus rien à faire.
          </p>
          {/* Ouvrir l'album ne se défait pas vraiment : on peut le refermer,
              mais pas faire oublier ce qui a été vu. */}
          {confirmReveal ? (
            <div className="db-hero-confirm">
              <p className="db-hero-confirm-t">Ouvrir l'album maintenant ?</p>
              <p className="db-hero-confirm-s">
                {ev.guestCount > 1
                  ? `Vos ${ev.guestCount} invités pourront voir`
                  : 'Votre invité pourra voir'}
                {ev.photoCount > 1 ? ` les ${ev.photoCount} photos` : ' la photo'} dans la seconde.
                Vous pourrez refermer l'album, mais pas faire oublier ce qui aura été vu.
              </p>
              <div className="db-hero-duo">
                <button className="btn db-hero-2nd" onClick={() => setConfirmReveal(false)}>
                  Annuler
                </button>
                <button className="btn btn-accent" onClick={async () => {
                  if (await patchEvent({ revealAt: new Date().toISOString() })) setConfirmReveal(false)
                }}>
                  Oui, révéler
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-accent db-hero-cta" onClick={() => setConfirmReveal(true)}>
                Révéler maintenant
              </button>
              <button className="btn db-hero-2nd" onClick={() => {
                setEditing('reveal'); setDraftDate(toLocalInput(ev.revealAt))
                allerA('reglages', 'sec-reglages')
              }}>
                Changer la date
              </button>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="db-hero db-hero-accent">
        <div className="db-hero-top">
          <span className="db-eyebrow">la fête est finie</span>
          <span className="db-pill db-pill-light">{daysUntil(ev.revealAt)}</span>
        </div>
        <h2 className="db-hero-title">{ev.photoCount} photos vous attendent</h2>
        <p className="db-hero-sub">
          Vous seul pouvez les voir. Jetez-y un œil : vous pouvez masquer celles qui gênent
          avant que vos invités ne les découvrent.
        </p>
        {/* Valider ne fige rien : le tri reste possible, avant comme après. On
            le rappelle ici, faute de quoi on croit sceller l'album. */}
        {confirmPublish ? (
          <div className="db-hero-confirm">
            <p className="db-hero-confirm-t">
              Vous avez bien regardé {ev.photoCount > 1 ? `les ${ev.photoCount} photos` : 'la photo'} ?
            </p>
            <p className="db-hero-confirm-s">
              Valider n'ouvre rien : l'album s'ouvrira le {formatShort(ev.revealAt)}, comme prévu.
              Vous pourrez encore <strong>masquer ou supprimer</strong> une photo jusque-là,
              et même après — filtrez par personne dans l'album pour aller plus vite.
            </p>
            <div className="db-hero-duo">
              <Link href={`/g/${id}`} className="btn db-hero-2nd">Vérifier d'abord</Link>
              <button className="btn btn-dark" onClick={async () => {
                if (await patchEvent({ published: true })) setConfirmPublish(false)
              }}>Oui, je valide</button>
            </div>
            <button className="db-hero-annuler" onClick={() => setConfirmPublish(false)}>Annuler</button>
          </div>
        ) : (
          <>
            <Link href={`/g/${id}`} className="btn btn-dark db-hero-cta">Vérifier les photos →</Link>
            <button className="btn db-hero-2nd db-hero-2nd-light" onClick={() => setConfirmPublish(true)}>
              C'est bon, je valide l'album
            </button>
            <p className="db-hero-foot">
              Valider ne révèle rien tout de suite : l'ouverture reste prévue le {formatShort(ev.revealAt)}.
              Et si vous ne faites rien, elle se fera quand même.
            </p>
          </>
        )}
      </div>
    )
  }

  // ---- Écran d'un admin non connecté ----
  if (!ev.isOwner) {
    return (
      <main className="screen screen-cream">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        </div>
        <div className="card" style={{ marginTop: 26 }}>
          <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🔑 Vous co-organisez cet événement ?</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
            Connectez-vous avec votre adresse mail
          </div>
          <p className="muted small" style={{ marginBottom: 14 }}>
            Aucun code à retenir : indiquez l'adresse à laquelle vous avez reçu l'invitation,
            et vous recevrez un lien de connexion.
          </p>
          <a className="btn btn-accent" href="/connexion">Recevoir mon lien de connexion →</a>
        </div>
        <div className="notice" style={{ marginTop: 16 }}>
          📷 Vous voulez juste prendre des photos ? <a href={`/j/${id}`} style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>Rejoignez l'événement ici</a>.
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-cream db">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/mes-evenements" className="mono small" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Mes événements</Link>
      </div>

      {/* Aperçu local uniquement : permet de voir les trois écrans sans attendre
          la vraie date. Absent de la version en ligne. */}
      {DEV && (
        <div className="db-dev">
          <span className="db-dev-lbl">Aperçu</span>
          {MOMENTS.map((m) => (
            <a key={m.key} href={`?moment=${m.key}`}
              className={forceMoment === m.key ? 'on' : ''}>{m.title}</a>
          ))}
          <a href="?" className={forceMoment ? '' : 'on'}>Réel</a>
        </div>
      )}

      <header className="db-head">
        <h1 className="h2">{ev.name}</h1>
        <p className="mono db-head-date">
          {ev.startsAt ? formatShort(ev.startsAt) : formatShort(ev.revealAt)}
          {/* La formule se perdait de vue : elle décide pourtant du prix et,
              une fois dépassée, de l'ouverture de l'album. */}
          {ev.maxGuests > 0 && (
            <>
              {' · '}
              <span className={`db-head-plan ${ev.quotaExceeded ? 'over' : ''}`}>
                Jusqu'à {ev.maxGuests} invités
              </span>
            </>
          )}
        </p>
      </header>

      {/* Bascule permanente : l'organisateur joue aussi */}
      <nav className="db-modes" aria-label="Mode">
        <span className="on">Organisation</span>
        <Link href={`/j/${id}`}>Mon appareil 📷</Link>
      </nav>

      {/* Deux situations, un seul bloc. « Pleine » prévient avant que quiconque
          soit refusé — c'est le message qu'on veut voir le plus souvent.
          « Dépassée » ne concerne plus que les événements d'avant la porte. */}
      {(ev.quotaExceeded || ev.quotaFull) && (ev.upgrade || ev.surMesure) && (
        <div className="db-quota">
          <div className="db-quota-top">
            <span className="db-eyebrow">{ev.quotaExceeded ? 'formule dépassée' : 'formule complète'}</span>
            <span className="db-quota-count">{ev.guestCount} / {ev.maxGuests} invités</span>
          </div>
          <h2 className="db-quota-title">
            {ev.quotaExceeded
              ? (revealedTime ? "L'album attend votre formule" : 'Agrandissez votre formule avant la révélation')
              : 'Le prochain invité devra attendre'}
          </h2>
          <p className="db-quota-sub">
            {ev.quotaExceeded ? (
              <>
                Vous êtes <strong>{ev.guestCount}</strong> alors que votre formule en couvre{' '}
                <strong>{ev.maxGuests}</strong>. Tout le monde a pu photographier normalement —
                rien n'a été bloqué pendant la fête.{' '}
                {revealedTime
                  ? "Il ne reste qu'à passer à la formule supérieure pour ouvrir l'album."
                  : `Mais l'album ne s'ouvrira pas le ${formatShort(ev.revealAt)} tant que la formule ne correspond pas.`}
              </>
            ) : (
              <>
                Vos <strong>{ev.maxGuests}</strong> places sont prises. Ceux qui sont là continuent
                de photographier sans rien voir changer, mais la prochaine personne qui scannera le
                QR code restera sur un écran d'attente jusqu'à ce que vous agrandissiez. Vous serez
                prévenu par mail si ça arrive.
              </>
            )}
          </p>
          {/* Au plus grand palier, il n'y a plus de formule au catalogue : on
              ouvre une conversation au lieu d'un paiement. */}
          {ev.surMesure ? (
            <a
              className="btn btn-accent db-quota-cta"
              href={`mailto:${ev.contactEmail || 'support@timetoflash.fr'}?subject=${encodeURIComponent(`Plus de ${ev.maxGuests} invités — ${ev.name || 'mon événement'}`)}`}
            >
              Nous écrire pour agrandir →
            </a>
          ) : (
            <button className="btn btn-accent db-quota-cta" onClick={startUpgrade} disabled={upgrading}>
              {upgrading
                ? 'Redirection vers le paiement…'
                : `Passer à ${ev.upgrade.maxGuests} invités — ${formatPrice(ev.upgrade.priceCents)} →`}
            </button>
          )}
          <p className="db-quota-foot">
            {ev.surMesure
              ? `Au-delà de ${ev.maxGuests} invités, nous établissons un tarif sur mesure. Écrivez-nous, on ouvre l'accès dans la foulée.`
              : 'Vous ne réglez que la différence : ce que vous avez déjà payé reste acquis.'}
          </p>
          {upgradeMsg && upgradeMsg !== 'ok' && <div className="err" style={{ marginTop: 10 }}>{upgradeMsg}</div>}
        </div>
      )}

      {upgradeMsg === 'ok' && !ev.quotaExceeded && !ev.quotaFull && (
        <div className="notice" style={{ marginTop: 16 }}>
          ✅ <strong>Formule agrandie</strong> — vous couvrez maintenant {ev.maxGuests} invités.
        </div>
      )}

      {notifCal && (
        <div className="db-notif">
          <div className="db-notif-txt">
            <strong>🗓️ Mettez l'événement à votre agenda</strong>
            <span>Le rendez-vous contient votre lien organisateur : vous le retrouverez sans rien noter.</span>
          </div>
          <button className="btn btn-ghost db-notif-act" onClick={addToCalendar}>
            {flash === 'cal' ? '✓ Ajouté' : 'Ajouter'}
          </button>
        </div>
      )}

      <Hero />

      {/* ---------- Tout le reste, toujours au même endroit ---------- */}

      <Section title="Inviter vos convives" hint="QR code, lien, impression"
        open={openSec === 'inviter'} onToggle={() => toggleSec('inviter')}>
        <div className="qr-tile">
          {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" /> : <div style={{ width: 220, height: 220 }} />}
          {/* Dans la boîte du QR, sous lui : c'est une commodité attachée à ce
              code, pas une des trois façons d'inviter ses convives. */}
          <button className="qr-dl" onClick={telechargerQR}>
            {flash === 'qr' ? '✓ Téléchargé' : 'Télécharger le QR code (.png)'}
          </button>
        </div>

        <div className="urlbox" style={{ margin: '14px 0 12px' }}>{joinUrl}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => copy(joinUrl, 'join')}>
            {flash === 'join' ? '✓ Copié' : 'Copier le lien'}
          </button>
          <button className="btn btn-ghost" style={{ flex: '0 0 auto', width: 54, padding: 0 }} aria-label="Partager"
            onClick={() => shareOrCopy({ title: ev.name, text: 'Prenez des photos pour notre appareil jetable 📸', url: joinUrl }, 'join')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <Link href={`/event/${id}/imprimer`} className="btn btn-ghost" style={{ marginTop: 10 }}>
          🖨️ Imprimer affiches et cartons de table
        </Link>
      </Section>

      <Section id="sec-reglages" title="Réglages de l'événement" hint="Nom, couverture, dates, nombre de photos"
        open={openSec === 'reglages'} onToggle={() => toggleSec('reglages')}>

        {/* Deux zones distinctes, et c'est volontaire : au-dessus un APERÇU,
            qu'on regarde ; en dessous des ACTIONS, qu'on touche. Rendre le titre
            lui-même cliquable le faisait lire comme un intitulé de rubrique du
            tableau de bord, et non comme le titre vu par les invités. */}
        <div className="db-ident">
          <span className="db-ident-eyebrow">Aperçu · ce que voient les invités</span>

          <div className="db-ident-ecran">
            <div
              className={`db-ident-cover ${recadrage ? 'on' : ''}`}
              onPointerDown={recadrage ? debutGlisse : undefined}
              onPointerMove={recadrage ? glisse : undefined}
              onPointerUp={recadrage ? finGlisse : undefined}
              onPointerCancel={recadrage ? finGlisse : undefined}
            >
              {ev.coverUrl
                ? <img src={ev.coverUrl} alt="" draggable={false}
                    style={{ objectPosition: posAffichee }} />
                : <span className="db-ident-tag">ÉVÉNEMENT PRIVÉ</span>}
              {recadrage && <span className="db-ident-guide">Faites glisser pour recadrer</span>}
              {/* La question se pose sur la photo qu'elle concerne, plutôt que
                  dans une fenêtre qui la masquerait au moment de décider. */}
              {confirmCover && (
                <div className="db-ident-confirm">
                  <p>Retirer cette photo ?</p>
                  <span>Vos invités retrouveront le dégradé d'origine.</span>
                  <div className="db-ident-confirm-duo">
                    <button className="btn btn-ghost" onClick={() => setConfirmCover(false)}
                      disabled={coverBusy}>Annuler</button>
                    <button className="btn btn-danger" onClick={supprimerCover}
                      disabled={coverBusy}>{coverBusy ? 'Retrait…' : 'Retirer'}</button>
                  </div>
                </div>
              )}
              {/* Retrait au même endroit que ce qu'il retire. Masqué pendant le
                  recadrage : le doigt y traîne, la corbeille serait un piège. */}
              {ev.coverUrl && !recadrage && !confirmCover && (
                <button className="db-ident-poubelle" onClick={() => setConfirmCover(true)}
                  disabled={coverBusy} aria-label="Retirer la photo" title="Retirer la photo">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16M10 4h4M9 7v12m6-12v12M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <p className="db-ident-titre">Participez à l'événement {invitant}</p>
            <p className="db-ident-sous">
              Prenez {ev.shotsPerGuest} photos pendant la soirée. Elles resteront cachées
              jusqu'à la révélation, le {formatDate(ev.revealAt)}.
            </p>
          </div>

          {recadrage ? (
            <div className="db-ident-actions">
              <button className="btn btn-accent" onClick={async () => {
                if (await patchEvent({ coverPos: posAffichee })) setRecadrage(false)
              }}>Enregistrer le cadrage</button>
              <button className="btn btn-ghost" onClick={() => {
                setPos(null); setRecadrage(false)
              }}>Annuler</button>
            </div>
          ) : editing === 'name' ? (
            <div className="db-set-edit" style={{ marginTop: 12 }}>
              <input type="text" maxLength={80} value={draftName} autoFocus
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Ex : Mariage de Marie & Paul" />
              <button className="btn btn-accent" onClick={async () => {
                if (await patchEvent({ name: draftName })) setEditing('')
              }}>Enregistrer</button>
            </div>
          ) : (
            <div className="db-ident-actions">
              <label className="btn btn-ghost">
                {coverBusy ? 'Envoi…' : ev.coverUrl ? '🖼️ Changer la photo' : '🖼️ Ajouter une photo'}
                <input type="file" accept="image/*" hidden
                  onChange={(e) => uploadCover(e.target.files?.[0])} />
              </label>
              <button className="btn btn-ghost" onClick={() => {
                setEditing('name'); setDraftName(ev.name || '')
              }}>✎ Modifier le nom</button>
            </div>
          )}
        </div>

        {/* Date de l'événement */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              Date de l'événement {revealedTime && <span className="db-frozen">figée</span>}
            </span>
            <span className="db-set-val">{ev.startsAt ? formatDate(ev.startsAt) : 'Non renseignée'}</span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => { setEditing(editing === 'start' ? '' : 'start'); setDraftDate(toLocalInput(ev.startsAt || ev.revealAt)) }}>
              {editing === 'start' ? 'Annuler' : 'Modifier'}
            </button>
          )}
        </div>
        {editing === 'start' && (
          <>
            <div className="db-set-edit">
              <input type="datetime-local" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
              <button className="btn btn-accent" onClick={decalerSoiree}>Enregistrer</button>
            </div>
            <p className="hint" style={{ marginTop: -4, marginBottom: 12 }}>
              La révélation se décalera d'autant, pour rester au même moment après la fête.
            </p>
          </>
        )}

        {/* Photos par invité — se fige au début de la soirée */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              Photos par invité {locked && <span className="db-frozen">figé</span>}
            </span>
            <span className="db-set-val" style={locked ? { color: 'var(--text4)' } : undefined}>
              {ev.shotsPerGuest} photos
              {ev.bonusShots > 0 ? `, recharge gratuite de +${ev.bonusShots}` : ', sans recharge'}
              {locked
                ? ' — la soirée a commencé, tout le monde joue au même jeu'
                : ` — modifiable jusqu'au ${formatShort(ev.startsAt)}`}
            </span>
          </div>
          {!locked && (
            <button className="db-set-act" onClick={() => {
              setEditing(editing === 'shots' ? '' : 'shots')
              setDraftShots(ev.shotsPerGuest)
              setShotsLibre(!SHOT_PRESETS.some((p) => p.n === ev.shotsPerGuest))
              setDraftBonus(ev.bonusShots ?? 0)
            }}>
              {editing === 'shots' ? 'Annuler' : 'Modifier'}
            </button>
          )}
        </div>
        {editing === 'shots' && !locked && (
          <div className="db-shots">
            {/* Les mêmes propositions qu'à la création : le chiffre seul ne dit
                pas pourquoi on en choisirait cinq plutôt que quinze. */}
            <div className="wiz-opts">
              {SHOT_PRESETS.map((p) => (
                <button key={p.n} type="button"
                  className={`wiz-opt ${!shotsLibre && Number(draftShots) === p.n ? 'on' : ''}`}
                  onClick={() => { setShotsLibre(false); setDraftShots(p.n) }}>
                  <span className="em">{p.em}</span>
                  <span><span className="tt">{p.title}</span><span className="ss">{p.sub}</span></span>
                </button>
              ))}
              <button type="button" className={`wiz-opt ${shotsLibre ? 'on' : ''}`}
                onClick={() => { setShotsLibre(true); setDraftShots((n) => (Number(n) <= 8 ? 10 : n)) }}>
                <span className="em">🎚️</span>
                <span><span className="tt">Nombre personnalisé</span><span className="ss">Jusqu'à {SHOTS_MAX} clichés</span></span>
              </button>
            </div>
            {shotsLibre && (
              <div className="stepper" style={{ marginTop: 14 }}>
                <button type="button" aria-label="Moins"
                  onClick={() => setDraftShots((n) => Math.max(SHOTS_MIN, Number(n) - 1))}>−</button>
                <span className="val">{draftShots}</span>
                <button type="button" aria-label="Plus"
                  onClick={() => setDraftShots((n) => Math.min(SHOTS_MAX, Number(n) + 1))}>+</button>
              </div>
            )}

            {/* La recharge défait la rareté qui fait tout le jeu : c'est donc un
                choix, pas un cadeau imposé. */}
            <div className="db-shots-bonus">
              <label className="wiz-check">
                <input type="checkbox" checked={draftBonus > 0}
                  onChange={(e) => setDraftBonus(e.target.checked ? 2 : 0)} />
                <span>
                  <strong>Surprise (gratuit)</strong><br />
                  {draftBonus > 0
                    ? "Choisissez le nombre de photos supplémentaires (5 au maximum). Un invité qui n'en a plus pourra les demander, une seule fois."
                    : 'Cochez pour offrir gratuitement des photos supplémentaires aux invités.'}
                </span>
              </label>
              {draftBonus > 0 && (
                <div className="stepper" style={{ marginTop: 12 }}>
                  <button type="button" aria-label="Moins"
                    onClick={() => setDraftBonus((n) => Math.max(1, n - 1))}>−</button>
                  <span className="val">+{draftBonus}</span>
                  <button type="button" aria-label="Plus"
                    onClick={() => setDraftBonus((n) => Math.min(5, n + 1))}>+</button>
                </div>
              )}
            </div>

            <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={async () => {
              const ok = await patchEvent({
                shotsPerGuest: parseInt(draftShots, 10),
                bonusShots: draftBonus,
              })
              if (ok) setEditing('')
            }}>Enregistrer</button>
          </div>
        )}

        {/* Date de révélation */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              Révélation des photos {revealedTime && <span className="db-frozen">figée</span>}
            </span>
            <span className="db-set-val">{formatDate(ev.revealAt)}</span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => { setEditing(editing === 'reveal' ? '' : 'reveal'); setDraftDate(toLocalInput(ev.revealAt)) }}>
              {editing === 'reveal' ? 'Annuler' : 'Modifier'}
            </button>
          )}
        </div>
        {/* Dire pourquoi, plutôt que de laisser deviner devant un bouton absent. */}
        {revealedTime && (
          <p className="hint" style={{ marginTop: 2 }}>
            La révélation a eu lieu : les dates ne se modifient plus.
          </p>
        )}
        {editing === 'reveal' && (
          <div className="db-set-edit">
            <input type="datetime-local" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            <button className="btn btn-accent" onClick={async () => {
              if (await patchEvent({ revealAt: new Date(draftDate).toISOString() })) setEditing('')
            }}>Enregistrer</button>
          </div>
        )}

        {settingMsg && <div className="err" style={{ marginTop: 10 }}>{settingMsg}</div>}
      </Section>

      {/* La date de suppression vit dans le sous-titre : visible sans déplier la
          section — personne n'ouvre une section pour y chercher une date dont il
          ignore l'existence — mais sans alourdir le titre. */}
      <Section id="sec-album" title="L'album"
        hint={[
          revealed ? 'Ouvert à vos invités' : 'Caché jusqu’à la révélation',
          finAlbum ? `disponible jusqu'au ${formatJour(finAlbum)}` : null,
        ].filter(Boolean).join(' · ')}
        badge={`${ev.photoCount} photo${ev.photoCount > 1 ? 's' : ''}`}
        open={openSec === 'album'} onToggle={() => toggleSec('album')}>

        {/* Trois blocs titrés : trier ses photos, diffuser l'album, en
            restreindre l'accès. Trois gestes distincts, à des moments
            différents, dans une même section. */}
        <div className="db-alb-t">Vérifier et trier les photos</div>
        <p className="muted small" style={{ marginBottom: 10 }}>
          {revealed
            ? "Vos invités voient les photos. Vous pouvez encore en masquer une d'un geste."
            : `Vous seul y avez accès. Masquez d'un geste celles qui gênent, avant que tout le monde ne les découvre le ${formatDate(ev.revealAt)}.`}
        </p>
        <Link href={`/g/${id}`} className="btn btn-dark">
          {revealed ? "Voir l'album →" : 'Vérifier et trier les photos →'}
        </Link>

        {/* La date de suppression n'apparaissait que dans le message de partage
            pré-rédigé : l'organisateur qui n'y touchait pas ne l'a jamais lue. */}
        {finAlbum && (
          <p className="db-alb-fin">
            🗓️ Album en ligne jusqu'au <strong>{formatJour(finAlbum)}</strong>. Passé cette
            date, les photos sont supprimées — invitez vos convives à les enregistrer avant.
          </p>
        )}

        {/* Le frein reste ici : on le cherche à la seconde où l'on vient de
            tomber sur une photo qui pose problème. */}
        <div className="db-alb-frein">
          {paused ? (
            <>
              <p className="muted small">
                🔒 L'album est <strong>fermé</strong> : vos invités ne voient rien, même si
                l'heure de révélation est passée.
              </p>
              <button className="btn btn-ghost" onClick={() => patchEvent({ revealPaused: false })}>
                Rouvrir l'album
              </button>
            </>
          ) : (
            <button className="db-danger-link" style={{ marginTop: 0 }}
              onClick={() => patchEvent({ revealPaused: true })}>
              {revealedTime ? "Refermer l'album immédiatement" : "Empêcher l'ouverture automatique"}
            </button>
          )}
        </div>

        <div className="db-alb-bloc">
          <div className="db-alb-t">Partager l'album</div>
          <p className="muted small" style={{ marginBottom: 10 }}>
            {revealed
              ? "Ceux qui ont laissé leur adresse l'ont déjà reçu. Pour les autres :"
              : `Vos invités verront un compte à rebours jusqu'au ${formatDate(ev.revealAt)}, puis les photos s'ouvriront toutes seules.`}
          </p>
          {/* Une seule action : le lien seul obligeait à écrire soi-même de quoi
              il s'agit, et le message tout prêt le contenait déjà. */}
          <div className="db-alb-actions">
            <button className="btn btn-ghost" onClick={() => setSheet('message')}>
              Copier et partager le lien
            </button>
          </div>
        </div>

        <div className="db-alb-bloc">
          <div className="db-alb-t">Protéger par un code</div>
          {/* Même silhouette dans les deux états — titre, une ligne, une action. */}
          <p className="muted small" style={{ marginBottom: 10 }}>
            {ev.galleryCode
              ? <>Actif — vos invités doivent entrer <strong style={{ color: 'var(--ink)' }}>{ev.galleryCode}</strong>. Pensez à le leur donner.</>
              : <>Le lien de l'album est déjà secret. Un code n'est utile que si vous craignez
                  qu'il circule au-delà de vos invités — transféré, ou posté dans un groupe.</>}
          </p>
          {ev.galleryCode ? (
            <div className="db-alb-actions">
              <button className="btn btn-ghost" onClick={() => saveGalleryCode('')} disabled={savingGallery}>
                {savingGallery ? '…' : 'Retirer le code'}
              </button>
            </div>
          ) : (
            <div className="db-set-edit" style={{ paddingBottom: 0 }}>
              <input type="text" placeholder="Ex : 1234" value={galleryCodeInput}
                onChange={(e) => setGalleryCodeInput(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '.08em' }} />
              <button className="btn btn-dark" onClick={() => saveGalleryCode(galleryCodeInput)}
                disabled={savingGallery || !galleryCodeInput.trim()}>
                {savingGallery ? '…' : 'Activer'}
              </button>
            </div>
          )}
          {galleryMsg && <div className="err" style={{ marginTop: 8 }}>{galleryMsg}</div>}
        </div>
      </Section>

      <Section title="Co-organisateurs" hint="Partager la gestion de l'événement"
        open={openSec === 'acces'} onToggle={() => toggleSec('acces')}>
        <p className="muted small" style={{ marginBottom: 8 }}>
          Invitez qui vous voulez à gérer cet événement avec vous. La personne recevra une
          invitation et se connectera avec son adresse mail, sans code à retenir.
        </p>
        <p className="muted small" style={{ marginBottom: 14 }}>
          Un co-organisateur voit les <strong>photos avant la révélation</strong> et peut en
          faire le tri — masquer ou supprimer celles qui gênent. Il règle aussi les dates et
          invite les convives. Il ne peut pas <strong>supprimer l'événement</strong>.
        </p>

        {/* Qui a la main sur cet événement, organisateur compris : la liste ne
            montrait que les personnes invitées, jamais celle qui invite. */}
        <div className="db-coorg">
          <div className="db-coorg-row">
            <span className="db-coorg-id">
              <span className="nn">
                {ev.ownerName || (ev.role === 'owner' ? 'Vous' : 'Organisateur')}
                <span className="rr">organisateur</span>
              </span>
              <span className="ee">{ev.ownerEmail || 'adresse non renseignée'}</span>
            </span>
          </div>
          {(ev.admins || []).map((a) => (
            <div key={a.id} className="db-coorg-row">
              <span className="db-coorg-id">
                <span className="nn">
                  {a.name || a.email}
                  {/* Trois états, et le troisième compte autant que les autres :
                      une invitation refusée par le service d'envoi laisserait
                      croire que la personne a été prévenue. */}
                  {a.joinedAt
                    ? <span className="rr ok">a rejoint</span>
                    : a.invitedAt
                      ? <span className="rr">invitation envoyée</span>
                      : <span className="rr ko">invitation non partie</span>}
                </span>
                <span className="ee">{a.email}</span>
              </span>
              <button onClick={() => removeAdmin(a.id)} className="db-coorg-out">Retirer</button>
            </div>
          ))}
        </div>

        <form onSubmit={addAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder="Prénom" style={{ flex: 1, minWidth: 0 }}
              value={adminFirst} onChange={(e) => setAdminFirst(e.target.value)} />
            <input type="text" placeholder="Nom" style={{ flex: 1, minWidth: 0 }}
              value={adminLast} onChange={(e) => setAdminLast(e.target.value)} />
          </div>
          <input type="email" placeholder="Adresse mail" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
          {adminMsg && <div className="err">{adminMsg}</div>}
          <button className="btn btn-dark" type="submit" disabled={addingAdmin}>
            {addingAdmin ? 'Envoi…' : '+ Inviter ce co-organisateur'}
          </button>
        </form>
      </Section>

      {Array.isArray(ev.contacts) && ev.contacts.length > 0 && (
        <Section id="sec-invites" title="Invités inscrits" badge={String(ev.contacts.length)}
          hint="Tous les participants, avec ou sans adresse"
          open={openSec === 'contacts'} onToggle={() => toggleSec('contacts')}>
          <div className="notice small" style={{ marginBottom: 12 }}>
            ✉️ Ceux qui ont laissé leur adresse reçoivent le lien de l'album <strong>tout seuls</strong>,
            dès la révélation. Pour les autres, partagez le lien depuis{' '}
            <button type="button" className="linklike" onClick={() => allerA('album', 'sec-album')}>
              la section L'album
            </button>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ev.contacts.map((c, i) => (
              <div key={i} className="db-contact">
                <span className="db-contact-name">{c.name}</span>
                <span className="db-contact-val">
                  {/* Sans adresse, l'invité ne recevra rien : c'est justement ce
                      qu'il faut voir pour penser à le prévenir autrement. */}
                  {c.email || c.phone || <em className="db-contact-sans">à prévenir vous-même</em>}
                  {c.email && c.failed && <em className="db-contact-ko"> · non distribué</em>}
                  {c.email && c.notified && !c.failed && <em className="db-contact-ok"> · envoyé ✓</em>}
                </span>
              </div>
            ))}
          </div>
          {ev.contacts.some((c) => c.failed) && (
            <div className="notice small" style={{ marginTop: 12, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
              ⚠️ Une ou plusieurs adresses n'ont pas pu être livrées. Prévenez ces invités
              autrement : le message et le lien sont dans{' '}
              <button type="button" className="linklike" onClick={() => allerA('album', 'sec-album')}>
                la section L'album
              </button>.
            </div>
          )}
        </Section>
      )}

      <InstallPrompt label="Épinglez votre tableau de bord" />

      <div style={{ marginTop: 30, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
        {/* Effacer les photos de tous les invités reste au seul organisateur.
            Le serveur le refuse de toute façon : on évite juste de proposer un
            geste qui échouerait. */}
        {ev.role === 'admin' ? (
          <p className="muted small">
            Vous co-organisez cet événement. Sa suppression est réservée à la personne
            qui l'a créé.
          </p>
        ) : !confirmDel ? (
          <button onClick={() => { setError(''); setConfirmDel(true) }} className="db-danger-link" style={{ marginTop: 0 }}>
            Supprimer cet événement
          </button>
        ) : (
          <div className="card" style={{ borderColor: 'rgba(178,59,46,.35)' }}>
            <h3 className="h3" style={{ marginBottom: 8 }}>Supprimer « {ev.name} » ?</h3>
            <p className="muted small" style={{ marginBottom: 6 }}>
              {ev.photoCount > 0
                ? <><strong>{ev.photoCount} photo{ev.photoCount > 1 ? 's' : ''}</strong> prise{ev.photoCount > 1 ? 's' : ''} par
                    {' '}<strong>{ev.guestCount} invité{ev.guestCount > 1 ? 's' : ''}</strong> seront effacées, chez eux comme chez vous.</>
                : <>L'événement et son lien d'invitation seront effacés.</>}
            </p>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Rien ne pourra être récupéré, ni par vous, ni par nous.
            </p>

            {/* Recopier le nom : deux clics ne pèsent pas assez lourd face à des
                photos qui ne sont pas les nôtres et qu'on ne peut pas refaire. */}
            <div className="field">
              <label>Pour confirmer, recopiez le nom de l'événement</label>
              <input type="text" value={confirmNom} autoFocus autoComplete="off"
                placeholder={ev.name}
                onChange={(e) => setConfirmNom(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => { setConfirmDel(false); setConfirmNom('') }} disabled={deleting}>Annuler</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={deleteEvent}
                disabled={deleting || !nomRecopie}>
                {deleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Feuilles modales ---------- */}
      {sheet && (
        <div className="db-overlay" onClick={() => setSheet(null)}>
          <div className="db-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="db-sheet-grip" />
            {sheet === 'qr' && (
              <>
                <h3 className="h3">Faites-le scanner</h3>
                <p className="muted small">
                  Il reçoit ses {ev.shotsPerGuest} photos tout de suite. Aucune installation.
                </p>
                <div className="qr-tile" style={{ marginTop: 16 }}>
                  {qrUrl && <img src={qrUrl} alt="QR code de l'événement" />}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => copy(joinUrl, 'join')}>
                  {flash === 'join' ? '✓ Copié' : 'Copier le lien'}
                </button>
              </>
            )}
            {sheet === 'message' && (
              <>
                <h3 className="h3">{revealed ? 'Prévenir vos invités' : "Annoncer l'album"}</h3>
                <p className="muted small">
                  Modifiez-le si vous voulez, puis envoyez-le par le canal de votre choix.
                </p>
                {/* Le message se lit d'un coup d'œil : la zone s'ajuste à son
                    contenu plutôt que de forcer à faire défiler. */}
                <textarea className="db-msg" rows={3} value={shareText}
                  ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` } }}
                  onChange={(e) => setMessage(e.target.value)} />

                {/* Le moment de partager est le seul où l'on pense vraiment à
                    qui verra les photos. La protection se décide donc ici, et
                    le code part dans le même message que le lien. */}
                <label className="wiz-check" style={{ marginTop: 12 }}>
                  <input type="checkbox" checked={souhaiteCode} disabled={protecting}
                    onChange={(e) => basculerProtection(e.target.checked)} />
                  <span>
                    <strong>Protéger l'album par un code.</strong>{' '}
                    {ev.galleryCode
                      ? 'Vos invités devront l’entrer. Il est ajouté au message ci-dessus.'
                      : 'Seuls ceux à qui vous envoyez ce message pourront ouvrir l’album.'}
                  </span>
                </label>

                {souhaiteCode && (
                  <>
                    <input type="text" style={{ marginTop: 8 }} value={codeDraft} maxLength={12}
                      placeholder="Choisissez votre code" autoFocus autoComplete="off"
                      onChange={(e) => saisirCode(e.target.value)}
                      onBlur={() => enregistrerCode(codeDraft)} />
                    <p className="hint" style={{ marginTop: 6 }}>
                      {protecting ? 'Enregistrement…'
                        : codeSauve ? '✓ Code enregistré'
                          : ev.galleryCode ? `Code actif : ${ev.galleryCode}`
                            : 'Choisissez un code : il s’enregistre tout seul et s’ajoute au message.'}
                    </p>
                  </>
                )}

                {/* Les trois canaux faisaient doublon : le partage du téléphone
                    les propose déjà tous, et bien d'autres. */}
                {/* Partager un message qui promet un code inexistant enverrait
                    tout le monde devant une porte close : on attend qu'il soit
                    posé. */}
                <button className="btn btn-dark" style={{ marginTop: 10 }}
                  disabled={protecting || (souhaiteCode && !ev.galleryCode)}
                  onClick={() => shareOrCopy({ title: ev.name, text: shareText }, 'msg')}>
                  {flash === 'msg' ? '✓ Message copié' : 'Partager / copier le message'}
                </button>
                {souhaiteCode && !ev.galleryCode && (
                  <p className="hint" style={{ marginTop: 6 }}>
                    Entrez d'abord le code, sinon vos invités trouveront porte close.
                  </p>
                )}
              </>
            )}
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setSheet(null)}>Fermer</button>
          </div>
        </div>
      )}
    </main>
  )
}
