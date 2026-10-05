'use client'

// ============================================================
//  Tableau de bord organisateur.
//
//  Principe : un seul écran, toujours le même, dans le même ordre.
//  Seule la GRANDE CARTE du haut change selon le moment (avant la
//  fête / pendant / le lendemain). Tout le reste est toujours là,
//  simplement replié, pour qu'on retrouve toujours ce qu'on cherche.
// ============================================================

import Avis from '../../../../components/Avis'
import ApresCreation from '../../../../components/ApresCreation'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { BRAND, avatarColor } from '../../../../lib/brand'
import { modeOptions, modeValide } from '../../../../lib/photo-mode'
import Logo from '../../../../components/Logo'
import InstallPrompt from '../../../../components/InstallPrompt'
import ProposerAppIPhone from '../../../../components/ProposerAppIPhone'
import { eventPhase, isRevealed, quotaLocked, AVANT, JOUR_J, APRES } from '../../../../lib/phase'
import { formatPrice, SHOTS_MIN, SHOTS_MAX } from '../../../../lib/pricing'
import { purgeDate } from '../../../../lib/retention'
import { rappelsAutomatiques, heureDuRappel, jourDuRappel, autreJourQueLeDebut, minutesDepuisHeure, dureeMin } from '../../../../lib/rappels'
import { fileToImage, compressToBlob } from '../../../../lib/camera'
import { DEFAULT_EVENT_NAME, nomAffiche } from '../../../../lib/event-defaults'
import { getOwnerToken, saveOwnerToken, rememberMyEvent, forgetMyEvent, getGuest, notePrenomOrganisateur } from '../../../../lib/device'
import { track } from '../../../../lib/tracking'
import Bilan from '../../../../components/Bilan'
import { useLangue } from '../../../../components/Langue'
import { t as choisir, LOCALES } from '../../../../lib/i18n'

function formatDate(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatShort(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function formatHour(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
function daysUntil(iso, lang = 'fr') {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return choisir({ fr: 'Jour J', en: 'Today', de: 'Heute' }, lang)
  const d = Math.ceil(diff / 86400000)
  return d <= 1
    ? choisir({ fr: 'Demain', en: 'Tomorrow', de: 'Morgen' }, lang)
    : choisir({ fr: 'J-' + d, en: `${d} days to go`, de: `Noch ${d} Tage` }, lang)
}
// Jour seul, sans heure : « 6 mars 2027 ».
function formatJour(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }
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


// Repris du tunnel de création : la même explication doit accompagner le même choix.
const SHOT_PRESETS = [
  { n: 3, em: '💎', title: { fr: '3 clichés', en: '3 shots', de: '3 Aufnahmen' }, sub: { fr: 'Très rare : chaque photo est un événement', en: 'Very rare: every photo is an event', de: 'Sehr selten: Jedes Foto ist ein Ereignis' } },
  { n: 5, em: '🎞️', title: { fr: '5 clichés', en: '5 shots', de: '5 Aufnahmen' }, sub: { fr: 'Le bon équilibre, recommandé', en: 'The right balance, recommended', de: 'Die richtige Balance, empfohlen' } },
  { n: 8, em: '📸', title: { fr: '8 clichés', en: '8 shots', de: '8 Aufnahmen' }, sub: { fr: 'Plus généreux, pour les longues soirées', en: 'More generous, for long parties', de: 'Großzügiger, für lange Feiern' } },
]

// Les trois moments d'un événement, dans l'ordre. Sert à la barre d'aperçu locale.
const MOMENTS = [
  { key: AVANT, title: { fr: 'Avant', en: 'Before', de: 'Vorher' }, sub: (ev, lang) => choisir({ fr: 'Préparatifs', en: 'Getting ready', de: 'Vorbereitung' }, lang) },
  { key: JOUR_J, title: { fr: 'Le jour J', en: 'The big day', de: 'Der große Tag' }, sub: (ev, lang) => (ev.startsAt ? formatShort(ev.startsAt, LOCALES[lang]) : choisir({ fr: 'La fête', en: 'The party', de: 'Die Feier' }, lang)) },
  { key: APRES, title: { fr: 'Après', en: 'After', de: 'Danach' }, sub: (ev, lang) => choisir({ fr: 'Révélation', en: 'Reveal', de: 'Enthüllung' }, lang) + ` ${formatShort(ev.revealAt, LOCALES[lang])}` },
]

export default function EventManage({ params }) {
  const { id } = use(params)
  const { t, lang, locale, lien } = useLangue()
  const router = useRouter()
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [joinUrl, setJoinUrl] = useState('')
  const [galleryUrl, setGalleryUrl] = useState('')
  const [ownerUrl, setOwnerUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [sheet, setSheet] = useState(null) // 'qr' | 'message' | 'prenom' | null
  const [prenomOrga, setPrenomOrga] = useState('')
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
  // Arrivée juste après la création (?cree=1) : le mail d'accès vient de
  // partir, et il tombe trop souvent dans les indésirables. On le dit tout de
  // suite, tant que la personne est là pour aller le chercher.
  const [vientDeCreer, setVientDeCreer] = useState(false)
  const [creationCourte, setCreationCourte] = useState(false)
  // L'avis organisateur fermé sur cet appareil : on ne le repropose pas.
  const [avisFerme, setAvisFerme] = useState(true)
  useEffect(() => { try { setAvisFerme(!!localStorage.getItem(`ttf_avis_orga_${id}`)) } catch { setAvisFerme(false) } }, [id])
  useEffect(() => {
    const u = new URL(window.location.href)
    if (u.searchParams.get('cree') !== '1') return
    setVientDeCreer(true)
    // La création courte (/create/express) laisse une marque : c'est elle qui
    // dit s'il faut inviter à régler ce qu'on n'a pas demandé.
    try {
      if (sessionStorage.getItem('ttf_creation_courte') === '1') setCreationCourte(true)
      sessionStorage.removeItem('ttf_creation_courte')
    } catch {}
    u.searchParams.delete('cree')
    window.history.replaceState(null, '', u.pathname + u.search + u.hash)
  }, [])
  const [adminMsg, setAdminMsg] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [editing, setEditing] = useState('') // 'name' | 'start' | 'fin' | 'reveal' | 'shots' | 'rappels' | ''
  const [draftName, setDraftName] = useState('')
  const [draftDate, setDraftDate] = useState('')
  const [draftShots, setDraftShots] = useState(5)
  // Moments de rappel en cours d'édition, en minutes après le début.
  const [draftRappels, setDraftRappels] = useState([])
  const [shotsLibre, setShotsLibre] = useState(false) // palier « Plus » sélectionné
  const [draftBonus, setDraftBonus] = useState(5)
  const [draftMode, setDraftMode] = useState('libre')
  const [settingMsg, setSettingMsg] = useState('')
  const [forceMoment, setForceMoment] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  // Recadrage : `pos` est la position en cours d'ajustement, `null` tant qu'on
  // n'y a pas touché : on affiche alors celle enregistrée.
  const [recadrage, setRecadrage] = useState(false)
  const [confirmCover, setConfirmCover] = useState(false)
  const [pos, setPos] = useState(null)
  const glisseRef = useRef(null)
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
      // Parcours court : tant que les réglages d'après paiement ne sont pas
      // terminés, le tableau de bord (et donc le lien du mail) y ramène, au
      // réglage où l'on s'était arrêté.
      else if (d.reglagesEtape && d.isOwner) router.replace(lien(`/create/parametrer?event=${id}`))
      else setEv(d)
    } catch { setError(choisir({ fr: "Impossible de charger l'événement.", en: 'Could not load the event.', de: 'Das Event konnte nicht geladen werden.' })) }
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
        .then((d) => {
          if (d.error) { setUpgradeMsg(d.error); return }
          setUpgradeMsg('ok')
          // Publicité : une montée en gamme est une vente comme une autre.
          // `alreadyApplied` signale une page rechargée : rien de neuf à déclarer.
          if (!d.alreadyApplied && (d.paidCents || 0) > 0) {
            track('Purchase', {
              value: d.paidCents / 100,
              currency: 'EUR',
              content_name: `Passage à ${d.maxGuests} invités`,
            }, { eventID: `upgrade_${d.sessionId}` })
          }
        })
        .catch(() => setUpgradeMsg(choisir({ fr: 'La mise à niveau n’a pas pu être appliquée. Réessayez.', en: 'The upgrade could not be applied. Please try again.', de: 'Das Upgrade konnte nicht angewendet werden. Bitte versuchen Sie es erneut.' })))
        .finally(reload)
    }
    const m = sp.get('moment')
    if (DEV && MOMENTS.some((x) => x.key === m)) setForceMoment(m)
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
      // Déjà réglé par quelqu'un d'autre, ou par soi-même, dans un onglet
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
  // navigateur : une photo de téléphone brute est bien trop lourde.
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
      // Le cadrage s'ouvre dans la foulée de l'envoi : c'est le moment où l'on
      // regarde sa photo. Il reste ensuite accessible par « Recadrer » (ajouté
      // le 03/10/2026 : une couverture posée à la création ne se recadrait plus).
      setPos('50% 50%')
      setRecadrage(true)
    } catch (err) {
      setSettingMsg(err.message || t({ fr: "Échec de l'envoi de l'image.", en: 'The image could not be uploaded.', de: 'Das Bild konnte nicht hochgeladen werden.' }))
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
      setSettingMsg(err.message || t({ fr: 'Suppression impossible.', en: 'Could not remove it.', de: 'Entfernen nicht möglich.' }))
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
      const defaut = t({ fr: 'evenement', en: 'event', de: 'event' })
      const base = (nomAffiche(ev?.name, lang) || defaut).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${base || defaut}.png`
      a.click()
      ping('qr')
    } catch {}
  }

  // Déplacer la soirée déplace la révélation du même écart : « le lendemain »
  // doit rester le lendemain. Sans ça, on pouvait révéler avant la fête.
  async function decalerSoiree() {
    const nouveau = new Date(draftDate)
    if (isNaN(nouveau.getTime())) { setSettingMsg(t({ fr: 'Date invalide.', en: 'Invalid date.', de: 'Ungültiges Datum.' })); return }
    const ancien = new Date(ev.startsAt || ev.revealAt)
    const ecart = new Date(ev.revealAt).getTime() - ancien.getTime()
    const patch = { startsAt: nouveau.toISOString() }
    if (Number.isFinite(ecart) && ecart > 0) {
      patch.revealAt = new Date(nouveau.getTime() + ecart).toISOString()
    }
    // La fin suit toute seule : le serveur lui garde sa durée (voir PATCH).
    if (await patchEvent(patch)) setEditing('')
  }

  // « Mon appareil » : l'organisateur n'est pas un inconnu. Il passait par la
  // pochette puis l'écran du prénom, comme un invité qui vient de scanner. Déjà
  // inscrit sur ce téléphone : l'appareil s'ouvre. Sinon, son prénom une seule
  // fois ici, et la page de l'appareil l'inscrit sans rien redemander.
  function ouvrirMonAppareil(e) {
    if (getGuest(id)?.name) return // le lien suit son cours
    e.preventDefault()
    setPrenomOrga(prenomOrga || String(ev?.ownerName || '').trim().split(/\s+/)[0] || '')
    setSheet('prenom')
  }
  function validerPrenomOrga(e) {
    e.preventDefault()
    const prenom = prenomOrga.trim()
    if (!prenom) return
    notePrenomOrganisateur(id, prenom)
    setSheet(null)
    router.push(`/j/${id}`)
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

  // Protéger l'album depuis la feuille de partage. Le code n'a de valeur que
  // s'il voyage avec le lien : on l'ajoute au message dans le même geste,
  // sinon l'organisateur protège un album que personne ne peut plus ouvrir.
  const LIGNE_CODE = (c) => t({ fr: `Code d'accès à l'album : ${c}`, en: `Album access code: ${c}`, de: `Zugangscode zum Album: ${c}` })

  function sansLigneCode(t) {
    return (t || '')
      .split('\n')
      .filter((l) => !/^(Code d'accès à l'album|Album access code|Zugangscode zum Album)\s*:/.test(l.trim()))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Le code se glisse avant la phrase de disponibilité : on lit d'abord ce
  // qu'il faut pour entrer, la date de fin vient après.
  function avecLigneCode(t, code) {
    const paragraphes = sansLigneCode(t).split('\n\n')
    const i = paragraphes.findIndex((p) => /L'album reste disponible|The album stays available|Das Album bleibt/.test(p))
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
    if (okDone) { setGalleryCodeInput(''); setGalleryMsg('') } else setGalleryMsg(settingMsg || t({ fr: 'Enregistrement impossible.', en: 'Could not save.', de: 'Speichern nicht möglich.' }))
    setSavingGallery(false)
  }

  async function addAdmin(e) {
    e.preventDefault(); setAdminMsg(''); setAddingAdmin(true)
    try {
      const r = await fetch(`/api/events/${id}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ firstName: adminFirst, lastName: adminLast, email: adminEmail, langue: lang }),
      })
      const d = await r.json()
      if (d.error) setAdminMsg(d.error)
      else { setAdminFirst(''); setAdminLast(''); setAdminEmail(''); await reload() }
    } catch { setAdminMsg(t({ fr: 'Ajout impossible.', en: 'Could not add them.', de: 'Hinzufügen nicht möglich.' })) }
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
  if (!ev) return <main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>

  // ---- État dérivé ----
  const revealed = isRevealed(ev, now)
  // L'heure de révélation est-elle passée ? Distinct de `revealed`, qui tient
  // aussi compte de la formule dépassée : c'est ce qui permet de dire à
  // l'organisateur « l'album attend » plutôt que « c'est prévu pour plus tard ».
  const revealedTime = !!ev.revealAt && new Date(ev.revealAt).getTime() <= now
  // Les moments de rappel effectifs, calculés par le serveur : ceux de
  // l'organisateur s'il en a choisi, sinon la répartition automatique.
  const rappels = Array.isArray(ev.rappels) ? ev.rappels : []
  // « 22:55 » suffit tant qu'on reste le même soir. Passé minuit, l'heure seule
  // ment : on précise le jour.
  const libelleRappel = (m) => (autreJourQueLeDebut(ev.startsAt, m)
    ? `${heureDuRappel(ev.startsAt, m, lang)} (${jourDuRappel(ev.startsAt, m, true, lang)})`
    : heureDuRappel(ev.startsAt, m, lang))
  // Figé une fois la soirée commencée ET une première photo prise (même règle que le serveur).
  const locked = quotaLocked(ev, now) && (ev.photoCount || 0) > 0
  const published = !!ev.publishedAt
  const paused = !!ev.revealPaused
  const shotsLeft = Math.max(0, (ev.guestCount || 0) * (ev.shotsPerGuest || 0) - (ev.photoCount || 0))
  const finAlbum = purgeDate(ev.revealAt)
  // Un album protégé dont le message tait le code laisse cent participants devant
  // une porte fermée : le code fait partie du message par défaut.
  // Le nom provisoire (« Mon événement ») s'affiche dans la langue de la page ;
  // la valeur enregistrée, elle, ne change pas.
  const nomEv = nomAffiche(ev.name, lang)
  // Les adresses qui ne recevront jamais rien (voir lib/adresses-brevo).
  const koListe = (Array.isArray(ev.contacts) ? ev.contacts : []).filter((c) => c.ko)
  const nbVisibles = ev.visibleCount ?? ev.photoCount
  const messageDeBase = revealed
    ? t({
      fr: `Les photos de ${nomEv} sont en ligne ! ${nbVisibles} clichés pris par vous tous. C'est ici : ${galleryUrl}\n\nL'album reste disponible jusqu'au ${finAlbum ? formatJour(finAlbum, locale) : 'dans six mois'}.`,
      en: `The photos from ${nomEv} are online! ${nbVisibles} shots taken by all of you. Here they are: ${galleryUrl}\n\n${finAlbum ? `The album stays available until ${formatJour(finAlbum, locale)}.` : 'The album stays available for six months.'}`,
      de: `Die Fotos von ${nomEv} sind online! ${nbVisibles} Aufnahmen, gemacht von Ihnen allen. Hier sind sie: ${galleryUrl}\n\n${finAlbum ? `Das Album bleibt bis zum ${formatJour(finAlbum, locale)} verfügbar.` : 'Das Album bleibt sechs Monate lang verfügbar.'}`,
    })
    : t({
      fr: `Les photos de ${nomEv} sortent le ${formatDate(ev.revealAt, locale)}. Gardez ce lien, elles s'ouvriront toutes seules : ${galleryUrl}`,
      en: `The photos from ${nomEv} will be revealed on ${formatDate(ev.revealAt, locale)}. Keep this link, they'll open on their own: ${galleryUrl}`,
      de: `Die Fotos von ${nomEv} werden am ${formatDate(ev.revealAt, locale)} enthüllt. Bewahren Sie diesen Link auf, sie öffnen sich von selbst: ${galleryUrl}`,
    })
  const defaultMessage = ev.galleryCode ? avecLigneCode(messageDeBase, ev.galleryCode) : messageDeBase
  const shareText = message || defaultMessage

  const toggleSec = (k) => setOpenSec((s) => (s === k ? null : k))

  // Renvoi d'une section à une autre : l'ouvrir ne suffit pas si elle est
  // ailleurs dans la page : on l'amène aussi sous les yeux.
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
      const defaut = t({ fr: 'evenement', en: 'event', de: 'event' })
      const base = (nomAffiche(ev?.name, lang) || defaut).normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
      const a = document.createElement('a')
      a.href = png
      a.download = `qr-${base || defaut}.png`
      a.click()
    } catch {}
  }

  const invitant = ev.hostNames || nomEv || ''
  const aplat = (v) => (v || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const nomRecopie = aplat(confirmNom) === aplat(ev.name) || aplat(confirmNom) === aplat(nomEv)
  const posAffichee = pos || ev.coverPos || '50% 50%'

  // ---- La grande carte : le seul élément qui change selon le moment ----
  function Hero() {
    if (phase === AVANT) {
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-eyebrow">{t({ fr: 'à préparer', en: 'getting ready', de: 'Vorbereitung' })}</span>
            <span className="db-pill">{daysUntil(ev.startsAt || ev.revealAt, lang)}</span>
          </div>
          <h2 className="db-hero-title">{t({ fr: 'Imprimez votre QR code', en: 'Print your QR code', de: 'Drucken Sie Ihren QR-Code aus' })}</h2>
          <p className="db-hero-sub">
            {t({
              fr: 'Vos participants scannent sur place le jour J. Rien à leur envoyer avant, rien à installer.',
              en: 'Your guests scan it on the day, on the spot. Nothing to send them beforehand, nothing to install.',
              de: 'Ihre Gäste scannen ihn am großen Tag vor Ort. Vorher nichts zu verschicken, nichts zu installieren.',
            })}
          </p>
          <Link href={`/event/${id}/imprimer`} className="btn btn-accent db-hero-cta">
            {t({ fr: 'Choisir un format et imprimer →', en: 'Choose a format and print →', de: 'Format wählen und drucken →' })}
          </Link>
          {/* Raccourci pour ceux qui ont déjà leurs faire-part ou leur
              décoration : ils ne veulent que l'image, pas une mise en page. */}
          <button type="button" className="db-hero-alt" onClick={telechargerQRSeul}>
            {t({ fr: 'ou télécharger le QR code seul (PNG)', en: 'or download just the QR code (PNG)', de: 'oder nur den QR-Code herunterladen (PNG)' })}
          </button>
        </div>
      )
    }

    if (phase === JOUR_J) {
      const guests = ev.guests || []
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-live"><span className="db-dot" /> {t({ fr: 'en direct', en: 'live', de: 'live' })}</span>
            <span className="db-eyebrow">{t({ fr: 'depuis', en: 'since', de: 'seit' })} {formatHour(ev.startsAt, locale)}</span>
          </div>
          {/* Seul « photos prises » mène quelque part, et directement à l'album :
              taper ce nombre, c'est vouloir les voir. « Participants connectés »
              compte tout le monde, là où la section n'en liste qu'une partie : 
              le lien aurait déçu. La flèche signale ce qui se touche : sur un
              fond sombre, un survol ne se voit pas, et sur téléphone il n'existe pas. */}
          <div className="db-stats">
            <button type="button" className="db-stats-go"
              onClick={() => allerA('contacts', 'sec-invites')} disabled={!ev.contacts?.length}>
              <b>{ev.guestCount}</b><span>{t({ fr: 'participants connectés', en: 'guests joined', de: 'Gäste dabei' })} <span aria-hidden="true">→</span></span>
            </button>
            <Link href={`/g/${id}`} className="db-stats-go">
              <b>{ev.photoCount}</b><span>{t({ fr: 'photos prises', en: 'photos taken', de: 'Fotos gemacht' })} <span aria-hidden="true">→</span></span>
            </Link>
            <div><b>{shotsLeft}</b><span>{t({ fr: 'déclics restants', en: 'shots left', de: 'Aufnahmen übrig' })}</span></div>
          </div>

          {ev.recentPhotos?.length > 0 && (
            <>
              <div className="db-strip-head">
                <span className="db-eyebrow">{t({ fr: 'les dernières arrivées', en: 'latest arrivals', de: 'die neuesten Fotos' })}</span>
                <span className="db-only">{t({ fr: 'vous seul', en: 'only you', de: 'nur Sie' })}</span>
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
                <div className="db-roster-more">{t({
                  fr: `+ ${guests.length - 5} autres participants`,
                  en: guests.length - 5 > 1 ? `+ ${guests.length - 5} more guests` : '+ 1 more guest',
                  de: guests.length - 5 > 1 ? `+ ${guests.length - 5} weitere Gäste` : '+ 1 weiterer Gast',
                })}</div>
              )}
            </div>
          )}

          <Link href={`/j/${id}`} className="btn btn-accent db-hero-cta">📷 {t({ fr: 'Prendre mes photos', en: 'Take my photos', de: 'Meine Fotos machen' })}</Link>
          <button className="btn db-hero-2nd" onClick={() => setSheet('qr')}>
            {t({ fr: 'Un retardataire ? Montrer le QR', en: 'Someone arriving late? Show the QR code', de: 'Jemand kommt später? QR-Code zeigen' })}
          </button>
        </div>
      )
    }

    // --- Le lendemain ---
    if (paused) {
      return (
        <div className="db-hero db-hero-paused">
          <div className="db-hero-top"><span className="db-eyebrow">{t({ fr: 'révélation suspendue', en: 'reveal on hold', de: 'Enthüllung pausiert' })}</span></div>
          <h2 className="db-hero-title">{t({ fr: "L'album est en pause", en: 'The album is on hold', de: 'Das Album ist pausiert' })}</h2>
          <p className="db-hero-sub">
            {t({
              fr: "Vos participants ne voient rien, même si l'heure de révélation est passée. Prenez le temps de vérifier les photos, puis reprenez quand vous voulez.",
              en: "Your guests can't see anything, even though the reveal time has passed. Take your time checking the photos, then resume whenever you like.",
              de: 'Ihre Gäste sehen nichts, auch wenn der Zeitpunkt der Enthüllung vorbei ist. Nehmen Sie sich Zeit, die Fotos zu prüfen, und setzen Sie dann fort, wann Sie möchten.',
            })}
          </p>
          <Link href={`/g/${id}`} className="btn btn-dark db-hero-cta">{t({ fr: 'Vérifier les photos →', en: 'Check the photos →', de: 'Fotos prüfen →' })}</Link>
          <button className="btn db-hero-2nd" onClick={() => patchEvent({ revealPaused: false })}>
            {t({ fr: 'Reprendre la révélation', en: 'Resume the reveal', de: 'Enthüllung fortsetzen' })}
          </button>
        </div>
      )
    }

    if (revealed) {
      return (
        <>
          <div className="db-hero db-hero-ink">
            <div className="db-hero-top"><span className="db-eyebrow">{t({ fr: "c'est ouvert", en: "it's open", de: 'es ist offen' })}</span></div>
            <h2 className="db-hero-title">{t({ fr: 'Album révélé', en: 'Album revealed', de: 'Album enthüllt' })}</h2>
            {/* Le nombre annoncé est celui que les participants voient : les photos
                masquées ne sont visibles de personne. */}
            <p className="db-hero-sub">
              {t({
                fr: `${ev.visibleCount ?? ev.photoCount} photos, visibles par tous vos participants. À eux de découvrir.`,
                en: `${ev.visibleCount ?? ev.photoCount} photos, visible to all your guests. Over to them.`,
                de: `${ev.visibleCount ?? ev.photoCount} Fotos, für alle Ihre Gäste sichtbar. Jetzt sind sie dran.`,
              })}
            </p>
            <button className="btn btn-accent db-hero-cta" onClick={() => setSheet('message')}>
              ✉️ {t({ fr: "Partager l'album", en: 'Share the album', de: 'Album teilen' })}
            </button>
            <Link href={`/g/${id}`} className="btn db-hero-2nd">{t({ fr: 'Voir les photos', en: 'See the photos', de: 'Fotos ansehen' })}</Link>
          </div>
          <Bilan bilan={bilan} />
        </>
      )
    }

    if (published) {
      return (
        <div className="db-hero db-hero-ink">
          <div className="db-hero-top">
            <span className="db-eyebrow">{t({ fr: 'album validé', en: 'album approved', de: 'Album freigegeben' })}</span>
            <span className="db-pill">{daysUntil(ev.revealAt, lang)}</span>
          </div>
          <h2 className="db-hero-title">{t({ fr: 'Révélation programmée', en: 'Reveal scheduled', de: 'Enthüllung geplant' })}</h2>
          <p className="db-hero-sub">
            {t({
              fr: `Vos ${ev.photoCount} photos s'ouvriront à tous le ${formatShort(ev.revealAt, locale)}. Vous n'avez plus rien à faire.`,
              en: `Your ${ev.photoCount} photos will open to everyone on ${formatShort(ev.revealAt, locale)}. There's nothing left for you to do.`,
              de: `Ihre ${ev.photoCount} Fotos werden am ${formatShort(ev.revealAt, locale)} für alle geöffnet. Sie müssen nichts mehr tun.`,
            })}
          </p>
          {/* Ouvrir l'album ne se défait pas vraiment : on peut le refermer,
              mais pas faire oublier ce qui a été vu. */}
          {confirmReveal ? (
            <div className="db-hero-confirm">
              <p className="db-hero-confirm-t">{t({ fr: "Ouvrir l'album maintenant ?", en: 'Open the album now?', de: 'Album jetzt öffnen?' })}</p>
              <p className="db-hero-confirm-s">
                {t({
                  fr: (
                    <>
                      {ev.guestCount > 1
                        ? `Vos ${ev.guestCount} participants pourront voir`
                        : 'Votre participant pourra voir'}
                      {ev.photoCount > 1 ? ` les ${ev.photoCount} photos` : ' la photo'} dans la seconde.
                      Vous pourrez refermer l'album, mais pas faire oublier ce qui aura été vu.
                    </>
                  ),
                  en: `${ev.guestCount > 1 ? `Your ${ev.guestCount} guests` : 'Your guest'} will be able to see ${ev.photoCount > 1 ? `the ${ev.photoCount} photos` : 'the photo'} instantly. You can close the album again, but you can't make anyone forget what they've seen.`,
                  de: `${ev.guestCount > 1 ? `Ihre ${ev.guestCount} Gäste können` : 'Ihr Gast kann'} ${ev.photoCount > 1 ? `die ${ev.photoCount} Fotos` : 'das Foto'} sofort sehen. Sie können das Album wieder schließen, aber niemand vergisst, was er schon gesehen hat.`,
                })}
              </p>
              <div className="db-hero-duo">
                <button className="btn db-hero-2nd" onClick={() => setConfirmReveal(false)}>
                  {t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' })}
                </button>
                <button className="btn btn-accent" onClick={async () => {
                  if (await patchEvent({ revealAt: new Date().toISOString() })) setConfirmReveal(false)
                }}>
                  {t({ fr: 'Oui, révéler', en: 'Yes, reveal', de: 'Ja, enthüllen' })}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="btn btn-accent db-hero-cta" onClick={() => setConfirmReveal(true)}>
                {t({ fr: 'Révéler maintenant', en: 'Reveal now', de: 'Jetzt enthüllen' })}
              </button>
              <button className="btn db-hero-2nd" onClick={() => {
                setEditing('reveal'); setDraftDate(toLocalInput(ev.revealAt))
                allerA('reglages', 'sec-reglages')
              }}>
                {t({ fr: 'Changer la date', en: 'Change the date', de: 'Datum ändern' })}
              </button>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="db-hero db-hero-accent">
        <div className="db-hero-top">
          <span className="db-eyebrow">{t({ fr: 'la fête est finie', en: "the party's over", de: 'die Feier ist vorbei' })}</span>
          <span className="db-pill db-pill-light">{daysUntil(ev.revealAt, lang)}</span>
        </div>
        <h2 className="db-hero-title">{t({ fr: `${ev.photoCount} photos vous attendent`, en: `${ev.photoCount} photos are waiting for you`, de: `${ev.photoCount} Fotos warten auf Sie` })}</h2>
        <p className="db-hero-sub">
          {t({
            fr: 'Vous seul pouvez les voir. Jetez-y un œil : vous pouvez masquer celles qui gênent avant que vos participants ne les découvrent.',
            en: 'Only you can see them. Take a look: you can hide any awkward ones before your guests discover them.',
            de: 'Nur Sie können sie sehen. Werfen Sie einen Blick darauf: Sie können unpassende Fotos ausblenden, bevor Ihre Gäste sie entdecken.',
          })}
        </p>
        {/* Valider ne fige rien : le tri reste possible, avant comme après. On
            le rappelle ici, faute de quoi on croit sceller l'album. */}
        {confirmPublish ? (
          <div className="db-hero-confirm">
            <p className="db-hero-confirm-t">
              {t({
                fr: `Vous avez bien regardé ${ev.photoCount > 1 ? `les ${ev.photoCount} photos` : 'la photo'} ?`,
                en: `Have you looked through ${ev.photoCount > 1 ? `all ${ev.photoCount} photos` : 'the photo'}?`,
                de: `Haben Sie sich ${ev.photoCount > 1 ? `alle ${ev.photoCount} Fotos` : 'das Foto'} angesehen?`,
              })}
            </p>
            <p className="db-hero-confirm-s">
              {t({
                fr: (
                  <>
                    Valider n'ouvre rien : l'album s'ouvrira le {formatShort(ev.revealAt, locale)}, comme prévu.
                    Vous pourrez encore <strong>masquer ou supprimer</strong> une photo jusque-là,
                    et même après : filtrez par personne dans l'album pour aller plus vite.
                  </>
                ),
                en: (
                  <>
                    Approving doesn't open anything: the album will open on {formatShort(ev.revealAt, locale)}, as planned.
                    You can still <strong>hide or delete</strong> a photo until then,
                    and even afterwards: filter by person in the album to go faster.
                  </>
                ),
                de: (
                  <>
                    Die Freigabe öffnet noch nichts: Das Album öffnet sich wie geplant am {formatShort(ev.revealAt, locale)}.
                    Sie können bis dahin weiterhin ein Foto <strong>ausblenden oder löschen</strong>,
                    und sogar danach: Filtern Sie im Album nach Person, um schneller voranzukommen.
                  </>
                ),
              })}
            </p>
            <div className="db-hero-duo">
              <Link href={`/g/${id}`} className="btn db-hero-2nd">{t({ fr: "Vérifier d'abord", en: 'Check first', de: 'Erst prüfen' })}</Link>
              <button className="btn btn-dark" onClick={async () => {
                if (await patchEvent({ published: true })) setConfirmPublish(false)
              }}>{t({ fr: 'Oui, je valide', en: 'Yes, approve', de: 'Ja, freigeben' })}</button>
            </div>
            <button className="db-hero-annuler" onClick={() => setConfirmPublish(false)}>{t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' })}</button>
          </div>
        ) : (
          <>
            <Link href={`/g/${id}`} className="btn btn-dark db-hero-cta">{t({ fr: 'Vérifier les photos →', en: 'Check the photos →', de: 'Fotos prüfen →' })}</Link>
            <button className="btn db-hero-2nd db-hero-2nd-light" onClick={() => setConfirmPublish(true)}>
              {t({ fr: "C'est bon, je valide l'album", en: 'All good, approve the album', de: 'Alles gut, Album freigeben' })}
            </button>
            <p className="db-hero-foot">
              {t({
                fr: `Valider ne révèle rien tout de suite : l'ouverture reste prévue le ${formatShort(ev.revealAt, locale)}. Et si vous ne faites rien, elle se fera quand même.`,
                en: `Approving doesn't reveal anything straight away: the album still opens on ${formatShort(ev.revealAt, locale)}. And if you do nothing, it will open anyway.`,
                de: `Die Freigabe enthüllt nicht sofort etwas: Das Album öffnet sich weiterhin am ${formatShort(ev.revealAt, locale)}. Und wenn Sie nichts tun, passiert es trotzdem.`,
              })}
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
          <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🔑 {t({ fr: 'Vous co-organisez cet événement ?', en: 'Are you co-hosting this event?', de: 'Sie organisieren dieses Event mit?' })}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
            {t({ fr: 'Connectez-vous avec votre adresse mail', en: 'Sign in with your email address', de: 'Melden Sie sich mit Ihrer E-Mail-Adresse an' })}
          </div>
          <p className="muted small" style={{ marginBottom: 14 }}>
            {t({
              fr: "Aucun code à retenir : indiquez l'adresse à laquelle vous avez reçu l'invitation, et vous recevrez un lien de connexion.",
              en: "No code to remember: enter the address where you received the invitation, and you'll get a sign-in link.",
              de: 'Kein Code nötig: Geben Sie die Adresse an, an die Ihre Einladung ging, und Sie erhalten einen Anmeldelink.',
            })}
          </p>
          <a className="btn btn-accent" href="/connexion">{t({ fr: 'Recevoir mon lien de connexion →', en: 'Get my sign-in link →', de: 'Meinen Anmeldelink erhalten →' })}</a>
        </div>
        <div className="notice" style={{ marginTop: 16 }}>
          📷 {t({ fr: 'Vous voulez juste prendre des photos ?', en: 'Just want to take photos?', de: 'Sie möchten nur Fotos machen?' })}{' '}
          <a href={`/j/${id}`} style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>{t({ fr: "Rejoignez l'événement ici", en: 'Join the event here', de: 'Hier dem Event beitreten' })}</a>.
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-cream db">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/mes-evenements" className="mono small" style={{ color: 'var(--text2)', textDecoration: 'none' }}>{t({ fr: 'Mes événements', en: 'My events', de: 'Meine Events' })}</Link>
      </div>

      {/* Aperçu local uniquement : permet de voir les trois écrans sans attendre
          la vraie date. Absent de la version en ligne. */}
      {DEV && (
        <div className="db-dev">
          <span className="db-dev-lbl">{t({ fr: 'Aperçu', en: 'Preview', de: 'Vorschau' })}</span>
          {MOMENTS.map((m) => (
            <a key={m.key} href={`?moment=${m.key}`}
              className={forceMoment === m.key ? 'on' : ''}>{t(m.title)}</a>
          ))}
          <a href="?" className={forceMoment ? '' : 'on'}>{t({ fr: 'Réel', en: 'Live', de: 'Echt' })}</a>
        </div>
      )}

      <header className="db-head">
        <h1 className="h2">{nomEv}</h1>
        <p className="mono db-head-date">
          {ev.startsAt ? formatShort(ev.startsAt, locale) : formatShort(ev.revealAt, locale)}
          {/* La formule se perdait de vue : elle décide pourtant du prix et,
              une fois dépassée, de l'ouverture de l'album. */}
          {ev.maxGuests > 0 && (
            <>
              {' · '}
              <span className={`db-head-plan ${ev.quotaExceeded ? 'over' : ''}`}>
                {t({ fr: `Jusqu'à ${ev.maxGuests} participants`, en: `Up to ${ev.maxGuests} guests`, de: `Bis zu ${ev.maxGuests} Gäste` })}
              </span>
            </>
          )}
        </p>
      </header>

      {/* Bascule permanente : l'organisateur joue aussi */}
      <nav className="db-modes" aria-label={t({ fr: 'Mode', en: 'Mode', de: 'Modus' })}>
        <span className="on">{t({ fr: 'Organisation', en: 'Hosting', de: 'Organisation' })}</span>
        <a href={`/j/${id}`} onClick={ouvrirMonAppareil}>{t({ fr: 'Mon appareil', en: 'My camera', de: 'Meine Kamera' })} 📷</a>
      </nav>

      {/* Avant et pendant la fête seulement : une fois finie, il n'y a plus de
          photos à prendre, l'organisateur vérifie et valide l'album. */}
      {vientDeCreer && ev.ownerEmail && (
        <div className="db-mail-parti" role="status">
          <span className="db-mail-parti-ic" aria-hidden="true">📬</span>
          <div>
            <strong>{t({ fr: 'Votre accès organisateur est parti par mail', en: 'Your host access has been emailed to you', de: 'Ihr Veranstalterzugang wurde per E-Mail verschickt' })}</strong>
            <p>
              {t({
                fr: <>Il vient de partir à <b>{ev.ownerEmail}</b>. Pas reçu d’ici quelques minutes ? Regardez dans vos <b>spams</b> (ou l’onglet « Promotions ») et marquez-le comme « Non spam » : les prochains mails arriveront au bon endroit.</>,
                en: <>It has just been sent to <b>{ev.ownerEmail}</b>. Nothing within a few minutes? Check your <b>spam</b> folder (or the “Promotions” tab) and mark it as “Not spam”: the next emails will land in the right place.</>,
                de: <>Sie wurde gerade an <b>{ev.ownerEmail}</b> geschickt. Nach ein paar Minuten nichts erhalten? Schauen Sie im <b>Spam</b>-Ordner (oder im Tab „Werbung“) nach und markieren Sie sie als „Kein Spam“: Dann landen die nächsten E-Mails am richtigen Ort.</>,
              })}
            </p>
          </div>
          <button type="button" className="db-mail-parti-x" onClick={() => setVientDeCreer(false)} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>×</button>
        </div>
      )}

      {/* Juste après la création : la question « comment nous avez-vous
          connus », et, après la création courte, l'invitation à régler le
          reste. Pas pour un co-organisateur, qui n'a rien créé. */}
      {/* Après la révélation, à la première visite : l'avis de l'organisateur,
          avec les mêmes questions que le mail. Une fois donné, ou fermé, on
          ne le redemande plus. */}
      {revealedTime && ev.role === 'owner' && !ev.avisOrgaDonne && !avisFerme && (ev.photoCount || 0) > 0 && (
        <div style={{ marginBottom: 18 }}>
          <Avis role="organisateur" compact
            payload={{ o: getOwnerToken(id), support: 'tableau' }}
            onClose={() => { setAvisFerme(true); try { localStorage.setItem(`ttf_avis_orga_${id}`, '1') } catch {} }} />
        </div>
      )}

      {vientDeCreer && ev.isOwner !== false && (
        <ApresCreation eventId={id} court={creationCourte}
          onPersonnaliser={() => allerA('reglages', 'sec-reglages')} />
      )}

      {phase !== APRES && <ProposerAppIPhone email={ev.ownerEmail} />}

      {/* Deux situations, un seul bloc. « Pleine » prévient avant que quiconque
          soit refusé : c'est le message qu'on veut voir le plus souvent.
          « Dépassée » ne concerne plus que les événements d'avant la porte. */}
      {(ev.quotaExceeded || ev.quotaFull) && (ev.upgrade || ev.surMesure) && (
        <div className="db-quota">
          <div className="db-quota-top">
            <span className="db-eyebrow">{ev.quotaExceeded ? t({ fr: 'formule dépassée', en: 'plan exceeded', de: 'Paket überschritten' }) : t({ fr: 'formule complète', en: 'plan full', de: 'Paket voll' })}</span>
            <span className="db-quota-count">{ev.guestCount} / {ev.maxGuests} {t({ fr: 'participants', en: 'guests', de: 'Gäste' })}</span>
          </div>
          <h2 className="db-quota-title">
            {ev.quotaExceeded
              ? (revealedTime
                ? t({ fr: "L'album attend votre formule", en: 'The album is waiting for your plan upgrade', de: 'Das Album wartet auf Ihr Paket-Upgrade' })
                : t({ fr: 'Agrandissez votre formule avant la révélation', en: 'Upgrade your plan before the reveal', de: 'Erweitern Sie Ihr Paket vor der Enthüllung' }))
              : t({ fr: 'Le prochain participant devra attendre', en: 'The next guest will have to wait', de: 'Der nächste Gast muss warten' })}
          </h2>
          <p className="db-quota-sub">
            {ev.quotaExceeded ? t({
              fr: (
                <>
                  Vous êtes <strong>{ev.guestCount}</strong> alors que votre formule en couvre{' '}
                  <strong>{ev.maxGuests}</strong>. Tout le monde a pu photographier normalement :
                  rien n'a été bloqué pendant la fête.{' '}
                  {revealedTime
                    ? "Il ne reste qu'à passer à la formule supérieure pour ouvrir l'album."
                    : `Mais l'album ne s'ouvrira pas le ${formatShort(ev.revealAt, locale)} tant que la formule ne correspond pas.`}
                </>
              ),
              en: (
                <>
                  There are <strong>{ev.guestCount}</strong> of you, but your plan covers{' '}
                  <strong>{ev.maxGuests}</strong>. Everyone was able to take photos as normal:
                  nothing was blocked during the party.{' '}
                  {revealedTime
                    ? 'All that’s left is to move up to the next plan to open the album.'
                    : `But the album won’t open on ${formatShort(ev.revealAt, locale)} until your plan matches.`}
                </>
              ),
              de: (
                <>
                  Sie sind <strong>{ev.guestCount}</strong>, Ihr Paket deckt aber nur{' '}
                  <strong>{ev.maxGuests}</strong> ab. Alle konnten ganz normal fotografieren:
                  Während der Feier wurde nichts blockiert.{' '}
                  {revealedTime
                    ? 'Sie müssen nur noch zum nächstgrößeren Paket wechseln, um das Album zu öffnen.'
                    : `Das Album öffnet sich am ${formatShort(ev.revealAt, locale)} aber erst, wenn das Paket passt.`}
                </>
              ),
            }) : t({
              fr: (
                <>
                  Vos <strong>{ev.maxGuests}</strong> places sont prises. Ceux qui sont là continuent
                  de photographier sans rien voir changer, mais la prochaine personne qui scannera le
                  QR code restera sur un écran d'attente jusqu'à ce que vous agrandissiez. Vous serez
                  prévenu par mail si ça arrive.
                </>
              ),
              en: (
                <>
                  Your <strong>{ev.maxGuests}</strong> places are taken. Those already there keep
                  taking photos with nothing changing for them, but the next person to scan the
                  QR code will stay on a waiting screen until you upgrade. You’ll be notified by
                  email if that happens.
                </>
              ),
              de: (
                <>
                  Ihre <strong>{ev.maxGuests}</strong> Plätze sind belegt. Wer schon dabei ist, fotografiert
                  ganz normal weiter, aber die nächste Person, die den QR-Code scannt, bleibt auf einem
                  Warteschirm, bis Sie Ihr Paket erweitern. Sie werden per E-Mail benachrichtigt,
                  falls das passiert.
                </>
              ),
            })}
          </p>
          {/* Au plus grand palier, il n'y a plus de formule au catalogue : on
              ouvre une conversation au lieu d'un paiement. */}
          {ev.surMesure ? (
            <a
              className="btn btn-accent db-quota-cta"
              href={`mailto:${ev.contactEmail || 'support@timetoflash.fr'}?subject=${encodeURIComponent(t({ fr: `Plus de ${ev.maxGuests} participants : ${nomEv || 'mon événement'}`, en: `More than ${ev.maxGuests} guests: ${nomEv || 'my event'}`, de: `Mehr als ${ev.maxGuests} Gäste: ${nomEv || 'mein Event'}` }))}`}
            >
              {t({ fr: 'Nous écrire pour agrandir →', en: 'Write to us to upgrade →', de: 'Schreiben Sie uns für mehr Plätze →' })}
            </a>
          ) : (
            <button className="btn btn-accent db-quota-cta" onClick={startUpgrade} disabled={upgrading}>
              {upgrading
                ? t({ fr: 'Redirection vers le paiement…', en: 'Redirecting to payment…', de: 'Weiterleitung zur Zahlung…' })
                : t({
                  fr: `Passer à ${ev.upgrade.maxGuests} participants (${formatPrice(ev.upgrade.priceCents, lang)}) →`,
                  en: `Upgrade to ${ev.upgrade.maxGuests} guests (${formatPrice(ev.upgrade.priceCents, lang)}) →`,
                  de: `Auf ${ev.upgrade.maxGuests} Gäste erweitern (${formatPrice(ev.upgrade.priceCents, lang)}) →`,
                })}
            </button>
          )}
          <p className="db-quota-foot">
            {ev.surMesure
              ? t({
                fr: `Au-delà de ${ev.maxGuests} participants, nous établissons un tarif sur mesure. Écrivez-nous, on ouvre l'accès dans la foulée.`,
                en: `Beyond ${ev.maxGuests} guests, we set a custom price. Write to us and we’ll open access straight away.`,
                de: `Für mehr als ${ev.maxGuests} Gäste erstellen wir ein individuelles Angebot. Schreiben Sie uns, wir schalten den Zugang umgehend frei.`,
              })
              : t({
                fr: 'Vous ne réglez que la différence : ce que vous avez déjà payé reste acquis.',
                en: 'You only pay the difference: what you’ve already paid still counts.',
                de: 'Sie zahlen nur die Differenz: Was Sie bereits bezahlt haben, wird angerechnet.',
              })}
          </p>
          {upgradeMsg && upgradeMsg !== 'ok' && <div className="err" style={{ marginTop: 10 }}>{upgradeMsg}</div>}
        </div>
      )}

      {upgradeMsg === 'ok' && !ev.quotaExceeded && !ev.quotaFull && (
        <div className="notice" style={{ marginTop: 16 }}>
          ✅ {t({
            fr: <><strong>Formule agrandie</strong> : vous couvrez maintenant {ev.maxGuests} participants.</>,
            en: <><strong>Plan upgraded</strong>: you now cover {ev.maxGuests} guests.</>,
            de: <><strong>Paket erweitert</strong>: Sie haben jetzt Platz für {ev.maxGuests} Gäste.</>,
          })}
        </div>
      )}

      <Hero />

      {/* ---------- Tout le reste, toujours au même endroit ---------- */}

      <Section title={t({ fr: 'Inviter vos convives', en: 'Invite your guests', de: 'Ihre Gäste einladen' })} hint={t({ fr: 'QR code, lien, impression', en: 'QR code, link, printing', de: 'QR-Code, Link, Druck' })}
        open={openSec === 'inviter'} onToggle={() => toggleSec('inviter')}>
        <div className="qr-tile">
          {qrUrl ? <img src={qrUrl} alt={t({ fr: "QR code de l'événement", en: "The event's QR code", de: 'QR-Code des Events' })} /> : <div style={{ width: 220, height: 220 }} />}
          {/* Dans la boîte du QR, sous lui : c'est une commodité attachée à ce
              code, pas une des trois façons d'inviter ses convives. */}
          <button className="qr-dl" onClick={telechargerQR}>
            {flash === 'qr' ? t({ fr: '✓ Téléchargé', en: '✓ Downloaded', de: '✓ Heruntergeladen' }) : t({ fr: 'Télécharger le QR code (.png)', en: 'Download the QR code (.png)', de: 'QR-Code herunterladen (.png)' })}
          </button>
        </div>

        <div className="urlbox" style={{ margin: '14px 0 12px' }}>{joinUrl}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => copy(joinUrl, 'join')}>
            {flash === 'join' ? t({ fr: '✓ Copié', en: '✓ Copied', de: '✓ Kopiert' }) : t({ fr: 'Copier le lien', en: 'Copy the link', de: 'Link kopieren' })}
          </button>
          <button className="btn btn-ghost" style={{ flex: '0 0 auto', width: 54, padding: 0 }} aria-label={t({ fr: 'Partager', en: 'Share', de: 'Teilen' })}
            onClick={() => shareOrCopy({ title: nomEv, text: t({ fr: 'Prenez des photos pour notre appareil jetable 📸', en: 'Take photos for our disposable camera 📸', de: 'Machen Sie Fotos für unsere Einwegkamera 📸' }), url: joinUrl }, 'join')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <Link href={`/event/${id}/imprimer`} className="btn btn-ghost" style={{ marginTop: 10 }}>
          🖨️ {t({ fr: 'Imprimer affiches et cartons de table', en: 'Print posters and table cards', de: 'Poster und Tischkarten drucken' })}
        </Link>
      </Section>

      <Section id="sec-reglages" title={t({ fr: "Réglages de l'événement", en: 'Event settings', de: 'Event-Einstellungen' })} hint={t({ fr: 'Nom, couverture, dates, nombre de photos', en: 'Name, cover, dates, number of photos', de: 'Name, Titelbild, Daten, Anzahl der Fotos' })}
        open={openSec === 'reglages'} onToggle={() => toggleSec('reglages')}>

        {/* Deux zones distinctes, et c'est volontaire : au-dessus un APERÇU,
            qu'on regarde ; en dessous des ACTIONS, qu'on touche. Rendre le titre
            lui-même cliquable le faisait lire comme un intitulé de rubrique du
            tableau de bord, et non comme le titre vu par les participants. */}
        <div className="db-ident">
          <span className="db-ident-eyebrow">{t({ fr: 'Aperçu · ce que voient les participants', en: 'Preview · what your guests see', de: 'Vorschau · was Ihre Gäste sehen' })}</span>

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
                : <span className="db-ident-tag">{t({ fr: 'ÉVÉNEMENT PRIVÉ', en: 'PRIVATE EVENT', de: 'PRIVATES EVENT' })}</span>}
              {recadrage && <span className="db-ident-guide">{t({ fr: 'Faites glisser pour recadrer', en: 'Drag to reframe', de: 'Zum Zuschneiden ziehen' })}</span>}
              {/* La question se pose sur la photo qu'elle concerne, plutôt que
                  dans une fenêtre qui la masquerait au moment de décider. */}
              {confirmCover && (
                <div className="db-ident-confirm">
                  <p>{t({ fr: 'Retirer cette photo ?', en: 'Remove this photo?', de: 'Dieses Foto entfernen?' })}</p>
                  <span>{t({ fr: "Vos participants retrouveront le dégradé d'origine.", en: 'Your guests will see the original gradient again.', de: 'Ihre Gäste sehen dann wieder den ursprünglichen Farbverlauf.' })}</span>
                  <div className="db-ident-confirm-duo">
                    <button className="btn btn-ghost" onClick={() => setConfirmCover(false)}
                      disabled={coverBusy}>{t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' })}</button>
                    <button className="btn btn-danger" onClick={supprimerCover}
                      disabled={coverBusy}>{coverBusy ? t({ fr: 'Retrait…', en: 'Removing…', de: 'Wird entfernt…' }) : t({ fr: 'Retirer', en: 'Remove', de: 'Entfernen' })}</button>
                  </div>
                </div>
              )}
              {/* Retrait au même endroit que ce qu'il retire. Masqué pendant le
                  recadrage : le doigt y traîne, la corbeille serait un piège. */}
              {ev.coverUrl && !recadrage && !confirmCover && (
                <button className="db-ident-poubelle" onClick={() => setConfirmCover(true)}
                  disabled={coverBusy} aria-label={t({ fr: 'Retirer la photo', en: 'Remove the photo', de: 'Foto entfernen' })} title={t({ fr: 'Retirer la photo', en: 'Remove the photo', de: 'Foto entfernen' })}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16M10 4h4M9 7v12m6-12v12M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <p className="db-ident-titre">{t({ fr: `Participez à l'événement ${invitant}`, en: `Join the event: ${invitant}`, de: `Machen Sie mit beim Event: ${invitant}` })}</p>
            <p className="db-ident-sous">
              {t({
                fr: `Prenez ${ev.shotsPerGuest} photos pendant la soirée. Elles resteront cachées jusqu'à la révélation, le ${formatDate(ev.revealAt, locale)}.`,
                en: `Take ${ev.shotsPerGuest} photos during the party. They’ll stay hidden until the reveal on ${formatDate(ev.revealAt, locale)}.`,
                de: `Machen Sie während der Feier ${ev.shotsPerGuest} Fotos. Sie bleiben bis zur Enthüllung am ${formatDate(ev.revealAt, locale)} verborgen.`,
              })}
            </p>
          </div>

          {recadrage ? (
            <div className="db-ident-actions">
              <button className="btn btn-accent" onClick={async () => {
                if (await patchEvent({ coverPos: posAffichee })) setRecadrage(false)
              }}>{t({ fr: 'Enregistrer le cadrage', en: 'Save the framing', de: 'Ausschnitt speichern' })}</button>
              <button className="btn btn-ghost" onClick={() => {
                setPos(null); setRecadrage(false)
              }}>{t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' })}</button>
            </div>
          ) : editing === 'name' ? (
            <div className="db-set-edit" style={{ marginTop: 12 }}>
              <input type="text" maxLength={80} value={draftName} autoFocus
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={t({ fr: 'Ex : Mariage de Marie & Paul', en: 'E.g. Marie & Paul’s wedding', de: 'z. B. Hochzeit von Marie & Paul' })} />
              <button className="btn btn-accent" onClick={async () => {
                if (await patchEvent({ name: draftName })) setEditing('')
              }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
            </div>
          ) : (
            <div className="db-ident-actions">
              <label className="btn btn-ghost">
                {coverBusy
                  ? t({ fr: 'Envoi…', en: 'Uploading…', de: 'Wird hochgeladen…' })
                  : ev.coverUrl
                    ? t({ fr: '🖼️ Changer la photo', en: '🖼️ Change the photo', de: '🖼️ Foto ändern' })
                    : t({ fr: '🖼️ Ajouter une photo', en: '🖼️ Add a photo', de: '🖼️ Foto hinzufügen' })}
                <input type="file" accept="image/*" hidden
                  onChange={(e) => uploadCover(e.target.files?.[0])} />
              </label>
              {/* Recadrer à tout moment : une photo posée pendant la création, ou
                  il y a trois jours, doit pouvoir se recentrer sans la renvoyer. */}
              {ev.coverUrl && (
                <button className="btn btn-ghost" onClick={() => { setPos(ev.coverPos || '50% 50%'); setRecadrage(true) }}>
                  ✥ {t({ fr: 'Recadrer', en: 'Reframe', de: 'Zuschneiden' })}
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => {
                setEditing('name'); setDraftName(lang !== 'fr' && ev.name === DEFAULT_EVENT_NAME ? '' : (ev.name || ''))
              }}>✎ {t({ fr: 'Modifier le nom', en: 'Edit the name', de: 'Namen ändern' })}</button>
            </div>
          )}
        </div>

        {/* Date de l'événement */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              {t({ fr: "Date de l'événement", en: 'Event date', de: 'Datum des Events' })} {revealedTime && <span className="db-frozen">{t({ fr: 'figée', en: 'locked', de: 'fixiert' })}</span>}
            </span>
            <span className="db-set-val">{ev.startsAt ? formatDate(ev.startsAt, locale) : t({ fr: 'Non renseignée', en: 'Not set', de: 'Nicht angegeben' })}</span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => { setEditing(editing === 'start' ? '' : 'start'); setDraftDate(toLocalInput(ev.startsAt || ev.revealAt)) }}>
              {editing === 'start' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
            </button>
          )}
        </div>
        {editing === 'start' && (
          <>
            <div className="db-set-edit">
              <input type="datetime-local" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
              <button className="btn btn-accent" onClick={decalerSoiree}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
            </div>
            <p className="hint" style={{ marginTop: -4, marginBottom: 12 }}>
              {t({
                fr: "La révélation se décalera d'autant, pour rester au même moment après la fête.",
                en: 'The reveal will move by the same amount, so it stays at the same point after the party.',
                de: 'Die Enthüllung verschiebt sich entsprechend, damit sie im gleichen Abstand zur Feier bleibt.',
              })}
            </p>
          </>
        )}

        {/* Fin de l'événement : nouvelle venue, et pas seulement décorative.
            C'est elle qui donne sa durée à la fête, et donc sa cadence aux
            rappels envoyés aux participants. */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              {t({ fr: "Fin de l'événement", en: 'Event end', de: 'Ende des Events' })} {revealedTime && <span className="db-frozen">{t({ fr: 'figée', en: 'locked', de: 'fixiert' })}</span>}
            </span>
            <span className="db-set-val">
              {formatDate(ev.endsAt, locale)}
              {ev.endsAtSet ? '' : t({ fr: ' (estimée, faute de mieux)', en: ' (estimated for now)', de: ' (vorläufig geschätzt)' })}
            </span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => { setEditing(editing === 'fin' ? '' : 'fin'); setDraftDate(toLocalInput(ev.endsAt)) }}>
              {editing === 'fin' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
            </button>
          )}
        </div>
        {editing === 'fin' && (
          <>
            <div className="db-set-edit">
              <input type="datetime-local" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
              <button className="btn btn-accent" onClick={async () => {
                const fin = new Date(draftDate)
                if (isNaN(fin.getTime())) { setSettingMsg(t({ fr: 'Heure de fin invalide.', en: 'Invalid end time.', de: 'Ungültige Endzeit.' })); return }
                if (await patchEvent({ endsAt: fin.toISOString() })) setEditing('')
              }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
            </div>
            <p className="hint" style={{ marginTop: -4, marginBottom: 12 }}>
              {t({
                fr: 'Les rappels automatiques se répartissent entre le début et cette heure.',
                en: 'Automatic reminders are spread between the start and this time.',
                de: 'Die automatischen Erinnerungen verteilen sich zwischen Beginn und dieser Uhrzeit.',
              })}
            </p>
          </>
        )}

        {/* Rappels aux participants */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              {t({ fr: 'Rappels aux participants', en: 'Guest reminders', de: 'Erinnerungen an die Gäste' })} {revealedTime && <span className="db-frozen">{t({ fr: 'figés', en: 'locked', de: 'fixiert' })}</span>}
            </span>
            <span className="db-set-val">
              {rappels.length === 0
                ? t({ fr: 'Aucun rappel pendant la fête', en: 'No reminders during the party', de: 'Keine Erinnerungen während der Feier' })
                : t({
                  fr: `${rappels.length} rappel${rappels.length > 1 ? 's' : ''} : ${rappels.map(libelleRappel).join(', ')}`,
                  en: `${rappels.length} reminder${rappels.length > 1 ? 's' : ''}: ${rappels.map(libelleRappel).join(', ')}`,
                  de: `${rappels.length} Erinnerung${rappels.length > 1 ? 'en' : ''}: ${rappels.map(libelleRappel).join(', ')}`,
                })}
              {ev.rappelsAuto && rappels.length > 0 ? t({ fr: ' (calculés d\'après la durée)', en: ' (based on the duration)', de: ' (nach der Dauer berechnet)' }) : ''}
            </span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => {
              setEditing(editing === 'rappels' ? '' : 'rappels')
              setDraftRappels(rappels)
            }}>
              {editing === 'rappels' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
            </button>
          )}
        </div>
        {/* Le décalage n'est pas un détail à cacher : c'est ce qui évite que
            cinquante téléphones sonnent à la même seconde. On le dit. */}
        {editing !== 'rappels' && rappels.length > 0 && (
          <p className="hint" style={{ marginTop: 2, marginBottom: 12 }}>
            {t({
              fr: 'Chaque participant le reçoit à quelques minutes près : les téléphones ne sonnent pas tous en même temps.',
              en: 'Each guest receives it give or take a few minutes, so the phones don’t all go off at once.',
              de: 'Jeder Gast erhält sie mit ein paar Minuten Abstand: So klingeln nicht alle Handys gleichzeitig.',
            })}
          </p>
        )}
        {editing === 'rappels' && (
          <div className="db-shots">
            <p className="hint" style={{ marginTop: 0 }}>
              {t({
                fr: "Le téléphone de chaque participant l'invite à sortir son appareil, s'il lui reste des photos. Choisissez vos moments, ou laissez-nous les répartir.",
                en: 'Each guest’s phone prompts them to get their camera out, if they have photos left. Choose your moments, or let us spread them out.',
                de: 'Das Handy jedes Gastes erinnert ihn daran, die Kamera zu zücken, sofern er noch Fotos übrig hat. Wählen Sie Ihre Zeitpunkte oder lassen Sie uns sie verteilen.',
              })}
            </p>
            {draftRappels.map((m, i) => (
              <div className="db-rappel" key={i}>
                {/* Le jour, écrit au-dessus : une soirée qui passe minuit
                    relance ses participants le lendemain, et l'heure seule
                    ne le disait pas. */}
                <span className="jour">{t({ fr: 'Rappel', en: 'Reminder', de: 'Erinnerung' })} {i + 1} · {jourDuRappel(ev.startsAt, m, false, lang)}</span>
                <div className="ligne">
                  <input type="time" value={heureDuRappel(ev.startsAt, m, 'fr')}
                    onChange={(e) => {
                      const min = minutesDepuisHeure(ev.startsAt, e.target.value)
                      if (min === null) return
                      setDraftRappels((l) => l.map((v, j) => (j === i ? min : v)))
                    }} />
                  <button className="btn btn-ghost" onClick={() => setDraftRappels((l) => l.filter((_, j) => j !== i))}>
                    {t({ fr: 'Retirer', en: 'Remove', de: 'Entfernen' })}
                  </button>
                </div>
              </div>
            ))}
            {draftRappels.length === 0 && (
              <p className="hint">{t({ fr: 'Aucun rappel : les participants ne seront pas relancés.', en: 'No reminders: guests won’t be nudged.', de: 'Keine Erinnerungen: Die Gäste werden nicht erinnert.' })}</p>
            )}
            {draftRappels.length < 6 && (
              <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={() => {
                // Le rappel suivant se pose une heure après le dernier, sans
                // jamais déborder de la fête : on propose quelque chose de
                // sensé plutôt qu'un champ vide.
                const duree = dureeMin(ev)
                const dernier = draftRappels.length ? Math.max(...draftRappels) : 0
                const propose = Math.min(dernier + 60, Math.max(15, duree - 15))
                if (draftRappels.includes(propose)) return
                setDraftRappels((l) => [...l, propose].sort((a, b) => a - b))
              }}>+ {t({ fr: 'Ajouter un rappel', en: 'Add a reminder', de: 'Erinnerung hinzufügen' })}</button>
            )}
            <div className="db-rappels-actions">
              <button className="btn btn-accent" onClick={async () => {
                if (await patchEvent({ rappels: draftRappels })) setEditing('')
              }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
              {!ev.rappelsAuto && (
                <button className="btn btn-ghost" onClick={async () => {
                  if (await patchEvent({ rappels: null })) setEditing('')
                }}>{t({ fr: "Revenir à l'automatique", en: 'Back to automatic', de: 'Zurück zur Automatik' })}</button>
              )}
            </div>
            {!ev.rappelsAuto && (
              <p className="hint" style={{ marginTop: 8 }}>
                {t({ fr: 'Pour information, la répartition automatique donnerait :', en: 'For reference, the automatic schedule would give:', de: 'Zur Info: Die automatische Verteilung ergäbe:' })}{' '}
                {rappelsAutomatiques(ev).map(libelleRappel).join(', ') || t({ fr: 'aucun rappel', en: 'no reminders', de: 'keine Erinnerungen' })}.
              </p>
            )}
          </div>
        )}

        {/* Photos par participant : se fige au début de la soirée */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              {t({ fr: 'Photos par participant', en: 'Photos per guest', de: 'Fotos pro Gast' })} {locked && <span className="db-frozen">{t({ fr: 'figé', en: 'locked', de: 'fixiert' })}</span>}
            </span>
            <span className="db-set-val" style={locked ? { color: 'var(--text4)' } : undefined}>
              {ev.shotsPerGuest} {t({ fr: 'photos', en: 'photos', de: 'Fotos' })}
              {ev.bonusShots > 0
                ? t({ fr: `, recharge gratuite de +${ev.bonusShots}`, en: `, free top-up of +${ev.bonusShots}`, de: `, kostenlose Aufstockung um +${ev.bonusShots}` })
                : t({ fr: ', sans recharge', en: ', no top-up', de: ', ohne Aufstockung' })}
              {locked
                ? t({ fr: ' ; la soirée a commencé, tout le monde joue au même jeu', en: '; the party has started, everyone plays by the same rules', de: '; die Feier hat begonnen, für alle gelten dieselben Regeln' })
                : t({ fr: `, modifiable jusqu'au ${formatShort(ev.startsAt, locale)}`, en: `, can be changed until ${formatShort(ev.startsAt, locale)}`, de: `, änderbar bis ${formatShort(ev.startsAt, locale)}` })}
            </span>
          </div>
          {!locked && (
            <button className="db-set-act" onClick={() => {
              setEditing(editing === 'shots' ? '' : 'shots')
              setDraftShots(ev.shotsPerGuest)
              setShotsLibre(!SHOT_PRESETS.some((p) => p.n === ev.shotsPerGuest))
              setDraftBonus(ev.bonusShots ?? 0)
            }}>
              {editing === 'shots' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
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
                  <span><span className="tt">{t(p.title)}</span><span className="ss">{t(p.sub)}</span></span>
                </button>
              ))}
              <button type="button" className={`wiz-opt ${shotsLibre ? 'on' : ''}`}
                onClick={() => { setShotsLibre(true); setDraftShots((n) => (Number(n) <= 8 ? 10 : n)) }}>
                <span className="em">🎚️</span>
                <span><span className="tt">{t({ fr: 'Nombre personnalisé', en: 'Custom number', de: 'Eigene Anzahl' })}</span><span className="ss">{t({ fr: `Jusqu'à ${SHOTS_MAX} clichés`, en: `Up to ${SHOTS_MAX} shots`, de: `Bis zu ${SHOTS_MAX} Aufnahmen` })}</span></span>
              </button>
            </div>
            {shotsLibre && (
              <div className="stepper" style={{ marginTop: 14 }}>
                <button type="button" aria-label={t({ fr: 'Moins', en: 'Fewer', de: 'Weniger' })}
                  onClick={() => setDraftShots((n) => Math.max(SHOTS_MIN, Number(n) - 1))}>−</button>
                <span className="val">{draftShots}</span>
                <button type="button" aria-label={t({ fr: 'Plus', en: 'More', de: 'Mehr' })}
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
                  <strong>{t({ fr: 'Surprise (gratuit)', en: 'Surprise (free)', de: 'Überraschung (kostenlos)' })}</strong><br />
                  {draftBonus > 0
                    ? t({
                      fr: "Choisissez le nombre de photos supplémentaires (5 au maximum). Un participant qui n'en a plus pourra les demander, une seule fois.",
                      en: 'Choose how many extra photos (5 at most). A guest who has run out can ask for them, just once.',
                      de: 'Wählen Sie die Anzahl zusätzlicher Fotos (höchstens 5). Ein Gast, der keine mehr hat, kann sie einmalig anfordern.',
                    })
                    : t({
                      fr: 'Cochez pour offrir gratuitement des photos supplémentaires aux participants.',
                      en: 'Tick to give guests extra photos for free.',
                      de: 'Anhaken, um den Gästen kostenlos zusätzliche Fotos zu schenken.',
                    })}
                </span>
              </label>
              {draftBonus > 0 && (
                <div className="stepper" style={{ marginTop: 12 }}>
                  <button type="button" aria-label={t({ fr: 'Moins', en: 'Fewer', de: 'Weniger' })}
                    onClick={() => setDraftBonus((n) => Math.max(1, n - 1))}>−</button>
                  <span className="val">+{draftBonus}</span>
                  <button type="button" aria-label={t({ fr: 'Plus', en: 'More', de: 'Mehr' })}
                    onClick={() => setDraftBonus((n) => Math.min(5, n + 1))} disabled={draftBonus >= 5}>+</button>
                </div>
              )}
              {draftBonus >= 5 && (
                <p className="hint" style={{ marginTop: 8 }}>{t({ fr: "+5, c'est le maximum.", en: '+5 is the maximum.', de: '+5 ist das Maximum.' })}</p>
              )}
            </div>

            <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={async () => {
              const ok = await patchEvent({
                shotsPerGuest: parseInt(draftShots, 10),
                bonusShots: draftBonus,
              })
              if (ok) setEditing('')
            }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
          </div>
        )}

        {/* Ce que les participants revoient de leurs propres photos. Ne se fige
            pas au début de la soirée, contrairement au nombre de clichés : ce
            réglage ne reprend rien à personne, il change ce qui s'affiche. Un
            organisateur dont les invités s'agacent doit pouvoir rouvrir. */}
        {(() => {
          const options = modeOptions(lang)
          const actuel = options.find((o) => o.key === modeValide(ev.photoMode)) || options[0]
          return (
            <>
              <div className="db-set">
                <div className="db-set-l">
                  <span className="db-set-lbl">{t({ fr: 'Ce que vos participants revoient', en: 'What your guests can look back at', de: 'Was Ihre Gäste wiedersehen' })}</span>
                  <span className="db-set-val">
                    {t({ fr: `${actuel.em} ${actuel.title} : ${actuel.court}`, en: `${actuel.em} ${actuel.title}: ${actuel.court}`, de: `${actuel.em} ${actuel.title}: ${actuel.court}` })}
                    {revealedTime ? t({ fr: " ; l'album est ouvert, chacun retrouve ses photos", en: '; the album is open, everyone has their photos back', de: '; das Album ist offen, alle sehen ihre Fotos wieder' }) : ''}
                  </span>
                </div>
                {!revealedTime && (
                  <button className="db-set-act" onClick={() => {
                    setEditing(editing === 'mode' ? '' : 'mode')
                    setDraftMode(modeValide(ev.photoMode))
                  }}>
                    {editing === 'mode' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
                  </button>
                )}
              </div>
              {editing === 'mode' && !revealedTime && (
                <div className="db-shots">
                  <div className="wiz-opts">
                    {options.map((o) => (
                      <button key={o.key} type="button"
                        className={`wiz-opt ${draftMode === o.key ? 'on' : ''}`}
                        onClick={() => setDraftMode(o.key)}>
                        <span className="em">{o.em}</span>
                        <span><span className="tt">{o.title}</span><span className="ss">{o.sub}</span></span>
                      </button>
                    ))}
                  </div>
                  <p className="db-quota-foot" style={{ textAlign: 'left' }}>
                    {t({
                      fr: "Le mur du groupe, où l'on devine les photos des autres en flou, reste affiché dans les trois cas. Modifiable jusqu'à la révélation : le changement s'applique aussitôt sur les téléphones.",
                      en: 'The group wall, where you glimpse everyone else’s photos blurred, stays visible in all three cases. Can be changed until the reveal: the change applies to phones straight away.',
                      de: 'Die Fotowand der Gruppe, auf der man die Fotos der anderen verschwommen erahnt, bleibt in allen drei Fällen sichtbar. Bis zur Enthüllung änderbar: Die Änderung gilt sofort auf allen Handys.',
                    })}
                  </p>
                  <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={async () => {
                    if (await patchEvent({ photoMode: draftMode })) setEditing('')
                  }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
                </div>
              )}
            </>
          )
        })()}

        {/* Livre d'or audio : chaque invité peut laisser un message vocal aux
            mariés, signé d'un selfie. Un interrupteur, rien de plus : le
            couper ferme le micro des invités sans effacer les messages reçus. */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">🎙️ {t({ fr: 'Livre d’or audio', en: 'Audio guestbook', de: 'Audio-Gästebuch' })}</span>
            <span className="db-set-val">
              {ev.livreOrActif
                ? t({ fr: 'Activé : vos invités peuvent vous laisser un message vocal, que vous seuls écoutez.', en: 'On: your guests can leave you a voice message that only you will hear.', de: 'Aktiv: Ihre Gäste können Ihnen eine Sprachnachricht hinterlassen, die nur Sie hören.' })
                : t({ fr: 'Désactivé : un bouton micro permettrait à chaque invité de vous laisser un message vocal.', en: 'Off: a microphone button would let each guest leave you a voice message.', de: 'Aus: Ein Mikrofon-Knopf würde jedem Gast erlauben, Ihnen eine Sprachnachricht zu hinterlassen.' })}
            </span>
            {ev.livreOrActif && (
              <Link href={`/g/${id}?onglet=livre-or`} className="linklike" style={{ fontSize: 13.5, marginTop: 4 }}>
                {t({ fr: 'Écouter le livre d’or →', en: 'Listen to the guestbook →', de: 'Gästebuch anhören →' })}
              </Link>
            )}
          </div>
          <button className="db-set-act" onClick={() => patchEvent({ livreOr: !ev.livreOrActif })}>
            {ev.livreOrActif ? t({ fr: 'Désactiver', en: 'Turn off', de: 'Ausschalten' }) : t({ fr: 'Activer', en: 'Turn on', de: 'Einschalten' })}
          </button>
        </div>

        {/* Date de révélation */}
        <div className="db-set">
          <div className="db-set-l">
            <span className="db-set-lbl">
              {t({ fr: 'Révélation des photos', en: 'Photo reveal', de: 'Enthüllung der Fotos' })} {revealedTime && <span className="db-frozen">{t({ fr: 'figée', en: 'locked', de: 'fixiert' })}</span>}
            </span>
            <span className="db-set-val">{formatDate(ev.revealAt, locale)}</span>
          </div>
          {!revealedTime && (
            <button className="db-set-act" onClick={() => { setEditing(editing === 'reveal' ? '' : 'reveal'); setDraftDate(toLocalInput(ev.revealAt)) }}>
              {editing === 'reveal' ? t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' }) : t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}
            </button>
          )}
        </div>
        {/* Dire pourquoi, plutôt que de laisser deviner devant un bouton absent. */}
        {revealedTime && (
          <p className="hint" style={{ marginTop: 2 }}>
            {t({ fr: 'La révélation a eu lieu : les dates ne se modifient plus.', en: 'The reveal has happened: the dates can no longer be changed.', de: 'Die Enthüllung hat stattgefunden: Die Daten lassen sich nicht mehr ändern.' })}
          </p>
        )}
        {editing === 'reveal' && (
          <div className="db-set-edit">
            <input type="datetime-local" value={draftDate} onChange={(e) => setDraftDate(e.target.value)} />
            <button className="btn btn-accent" onClick={async () => {
              if (await patchEvent({ revealAt: new Date(draftDate).toISOString() })) setEditing('')
            }}>{t({ fr: 'Enregistrer', en: 'Save', de: 'Speichern' })}</button>
          </div>
        )}

        {settingMsg && <div className="err" style={{ marginTop: 10 }}>{settingMsg}</div>}
      </Section>

      {/* La date de suppression vit dans le sous-titre : visible sans déplier la
          section (personne n'ouvre une section pour y chercher une date dont il
          ignore l'existence), mais sans alourdir le titre. */}
      <Section id="sec-album" title={t({ fr: "L'album", en: 'The album', de: 'Das Album' })}
        hint={[
          revealed
            ? t({ fr: 'Ouvert à vos participants', en: 'Open to your guests', de: 'Für Ihre Gäste geöffnet' })
            : t({ fr: 'Caché jusqu’à la révélation', en: 'Hidden until the reveal', de: 'Bis zur Enthüllung verborgen' }),
          finAlbum ? t({ fr: `disponible jusqu'au ${formatJour(finAlbum, locale)}`, en: `available until ${formatJour(finAlbum, locale)}`, de: `verfügbar bis zum ${formatJour(finAlbum, locale)}` }) : null,
        ].filter(Boolean).join(' · ')}
        badge={t({
          fr: `${ev.photoCount} photo${ev.photoCount > 1 ? 's' : ''}`,
          en: `${ev.photoCount} photo${ev.photoCount > 1 ? 's' : ''}`,
          de: `${ev.photoCount} Foto${ev.photoCount > 1 ? 's' : ''}`,
        })}
        open={openSec === 'album'} onToggle={() => toggleSec('album')}>

        {/* Trois blocs titrés : trier ses photos, diffuser l'album, en
            restreindre l'accès. Trois gestes distincts, à des moments
            différents, dans une même section. */}
        <div className="db-alb-t">{t({ fr: 'Vérifier et trier les photos', en: 'Check and sort the photos', de: 'Fotos prüfen und sortieren' })}</div>
        <p className="muted small" style={{ marginBottom: 10 }}>
          {revealed
            ? t({
              fr: "Vos participants voient les photos. Vous pouvez encore en masquer une d'un geste.",
              en: 'Your guests can see the photos. You can still hide one with a single tap.',
              de: 'Ihre Gäste sehen die Fotos. Sie können immer noch mit einem Tipp eines ausblenden.',
            })
            : t({
              fr: `Vous seul y avez accès. Masquez d'un geste celles qui gênent, avant que tout le monde ne les découvre le ${formatDate(ev.revealAt, locale)}.`,
              en: `Only you have access. Hide any awkward ones with a single tap, before everyone discovers them on ${formatDate(ev.revealAt, locale)}.`,
              de: `Nur Sie haben Zugriff. Blenden Sie unpassende Fotos mit einem Tipp aus, bevor alle sie am ${formatDate(ev.revealAt, locale)} entdecken.`,
            })}
        </p>
        <Link href={`/g/${id}`} className="btn btn-dark">
          {revealed
            ? t({ fr: "Voir l'album →", en: 'See the album →', de: 'Album ansehen →' })
            : t({ fr: 'Vérifier et trier les photos →', en: 'Check and sort the photos →', de: 'Fotos prüfen und sortieren →' })}
        </Link>

        {/* La date de suppression n'apparaissait que dans le message de partage
            pré-rédigé : l'organisateur qui n'y touchait pas ne l'a jamais lue. */}
        {finAlbum && (
          <p className="db-alb-fin">
            🗓️ {t({
              fr: <>Album en ligne jusqu'au <strong>{formatJour(finAlbum, locale)}</strong>. Passé cette date, les photos sont supprimées : invitez vos convives à les enregistrer avant.</>,
              en: <>Album online until <strong>{formatJour(finAlbum, locale)}</strong>. After that date, the photos are deleted: ask your guests to save them before then.</>,
              de: <>Album online bis zum <strong>{formatJour(finAlbum, locale)}</strong>. Danach werden die Fotos gelöscht: Bitten Sie Ihre Gäste, sie vorher zu speichern.</>,
            })}
          </p>
        )}

        {/* Le frein reste ici : on le cherche à la seconde où l'on vient de
            tomber sur une photo qui pose problème. */}
        <div className="db-alb-frein">
          {paused ? (
            <>
              <p className="muted small">
                🔒 {t({
                  fr: <>L'album est <strong>fermé</strong> : vos participants ne voient rien, même si l'heure de révélation est passée.</>,
                  en: <>The album is <strong>closed</strong>: your guests can’t see anything, even though the reveal time has passed.</>,
                  de: <>Das Album ist <strong>geschlossen</strong>: Ihre Gäste sehen nichts, auch wenn der Zeitpunkt der Enthüllung vorbei ist.</>,
                })}
              </p>
              <button className="btn btn-ghost" onClick={() => patchEvent({ revealPaused: false })}>
                {t({ fr: "Rouvrir l'album", en: 'Reopen the album', de: 'Album wieder öffnen' })}
              </button>
            </>
          ) : (
            <button className="db-danger-link" style={{ marginTop: 0 }}
              onClick={() => patchEvent({ revealPaused: true })}>
              {revealedTime
                ? t({ fr: "Refermer l'album immédiatement", en: 'Close the album right now', de: 'Album sofort schließen' })
                : t({ fr: "Empêcher l'ouverture automatique", en: 'Stop it opening automatically', de: 'Automatische Öffnung verhindern' })}
            </button>
          )}
        </div>

        <div className="db-alb-bloc">
          <div className="db-alb-t">{t({ fr: "Partager l'album", en: 'Share the album', de: 'Album teilen' })}</div>
          <p className="muted small" style={{ marginBottom: 10 }}>
            {revealed
              ? t({
                fr: "Ceux qui ont laissé leur adresse l'ont déjà reçu. Pour les autres :",
                en: 'Those who left their email address have already received it. For everyone else:',
                de: 'Wer seine E-Mail-Adresse hinterlassen hat, hat es schon erhalten. Für alle anderen:',
              })
              : t({
                fr: `Vos participants verront un compte à rebours jusqu'au ${formatDate(ev.revealAt, locale)}, puis les photos s'ouvriront toutes seules.`,
                en: `Your guests will see a countdown until ${formatDate(ev.revealAt, locale)}, then the photos will open on their own.`,
                de: `Ihre Gäste sehen einen Countdown bis ${formatDate(ev.revealAt, locale)}, danach öffnen sich die Fotos von selbst.`,
              })}
          </p>
          {/* Une seule action : le lien seul obligeait à écrire soi-même de quoi
              il s'agit, et le message tout prêt le contenait déjà. */}
          <div className="db-alb-actions">
            <button className="btn btn-ghost" onClick={() => setSheet('message')}>
              {t({ fr: 'Copier et partager le lien', en: 'Copy and share the link', de: 'Link kopieren und teilen' })}
            </button>
          </div>
        </div>

        <div className="db-alb-bloc">
          <div className="db-alb-t">{t({ fr: 'Protéger par un code', en: 'Protect with a code', de: 'Mit einem Code schützen' })}</div>
          {/* Même silhouette dans les deux états : titre, une ligne, une action. */}
          <p className="muted small" style={{ marginBottom: 10 }}>
            {ev.galleryCode
              ? t({
                fr: <>Actif : vos participants doivent entrer <strong style={{ color: 'var(--ink)' }}>{ev.galleryCode}</strong>. Pensez à le leur donner.</>,
                en: <>Active: your guests need to enter <strong style={{ color: 'var(--ink)' }}>{ev.galleryCode}</strong>. Remember to give it to them.</>,
                de: <>Aktiv: Ihre Gäste müssen <strong style={{ color: 'var(--ink)' }}>{ev.galleryCode}</strong> eingeben. Denken Sie daran, ihn weiterzugeben.</>,
              })
              : t({
                fr: "Le lien de l'album est déjà secret. Un code n'est utile que si vous craignez qu'il circule au-delà de vos participants : transféré, ou posté dans un groupe.",
                en: 'The album link is already secret. A code is only useful if you’re worried it might spread beyond your guests: forwarded, or posted in a group chat.',
                de: 'Der Album-Link ist bereits geheim. Ein Code lohnt sich nur, wenn Sie befürchten, dass er über Ihre Gäste hinaus kursiert: weitergeleitet oder in einer Gruppe gepostet.',
              })}
          </p>
          {ev.galleryCode ? (
            <div className="db-alb-actions">
              <button className="btn btn-ghost" onClick={() => saveGalleryCode('')} disabled={savingGallery}>
                {savingGallery ? '…' : t({ fr: 'Retirer le code', en: 'Remove the code', de: 'Code entfernen' })}
              </button>
            </div>
          ) : (
            <div className="db-set-edit" style={{ paddingBottom: 0 }}>
              <input type="text" placeholder={t({ fr: 'Ex : 1234', en: 'E.g. 1234', de: 'z. B. 1234' })} value={galleryCodeInput}
                onChange={(e) => setGalleryCodeInput(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '.08em' }} />
              <button className="btn btn-dark" onClick={() => saveGalleryCode(galleryCodeInput)}
                disabled={savingGallery || !galleryCodeInput.trim()}>
                {savingGallery ? '…' : t({ fr: 'Activer', en: 'Turn on', de: 'Aktivieren' })}
              </button>
            </div>
          )}
          {galleryMsg && <div className="err" style={{ marginTop: 8 }}>{galleryMsg}</div>}
        </div>
      </Section>

      <Section title={t({ fr: 'Co-organisateurs', en: 'Co-hosts', de: 'Mitveranstalter' })} hint={t({ fr: "Partager la gestion de l'événement", en: 'Share the running of the event', de: 'Die Verwaltung des Events teilen' })}
        open={openSec === 'acces'} onToggle={() => toggleSec('acces')}>
        <p className="muted small" style={{ marginBottom: 8 }}>
          {t({
            fr: 'Invitez qui vous voulez à gérer cet événement avec vous. La personne recevra une invitation et se connectera avec son adresse mail, sans code à retenir.',
            en: 'Invite whoever you like to run this event with you. They’ll receive an invitation and sign in with their email address, no code to remember.',
            de: 'Laden Sie ein, wen Sie möchten, um dieses Event mit Ihnen zu verwalten. Die Person erhält eine Einladung und meldet sich mit ihrer E-Mail-Adresse an, ganz ohne Code.',
          })}
        </p>
        <p className="muted small" style={{ marginBottom: 14 }}>
          {t({
            fr: (
              <>
                Un co-organisateur voit les <strong>photos avant la révélation</strong> et peut en
                faire le tri : masquer ou supprimer celles qui gênent. Il règle aussi les dates et
                invite les convives. Il ne peut pas <strong>supprimer l'événement</strong>.
              </>
            ),
            en: (
              <>
                A co-host sees the <strong>photos before the reveal</strong> and can sort them:
                hide or delete any that are awkward. They can also set the dates and invite
                guests. They cannot <strong>delete the event</strong>.
              </>
            ),
            de: (
              <>
                Ein Mitveranstalter sieht die <strong>Fotos vor der Enthüllung</strong> und kann sie
                sortieren: unpassende ausblenden oder löschen. Er legt auch die Daten fest und lädt
                die Gäste ein. Er kann <strong>das Event nicht löschen</strong>.
              </>
            ),
          })}
        </p>

        {/* Qui a la main sur cet événement, organisateur compris : la liste ne
            montrait que les personnes invitées, jamais celle qui invite. */}
        <div className="db-coorg">
          <div className="db-coorg-row">
            <span className="db-coorg-id">
              <span className="nn">
                {ev.ownerName || (ev.role === 'owner'
                  ? t({ fr: 'Vous', en: 'You', de: 'Sie' })
                  : t({ fr: 'Organisateur', en: 'Host', de: 'Gastgeber' }))}
                <span className="rr">{t({ fr: 'organisateur', en: 'host', de: 'Gastgeber' })}</span>
              </span>
              <span className="ee">{ev.ownerEmail || t({ fr: 'adresse non renseignée', en: 'no email address', de: 'keine Adresse angegeben' })}</span>
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
                    ? <span className="rr ok">{t({ fr: 'a rejoint', en: 'joined', de: 'beigetreten' })}</span>
                    : a.invitedAt
                      ? <span className="rr">{t({ fr: 'invitation envoyée', en: 'invitation sent', de: 'Einladung gesendet' })}</span>
                      : <span className="rr ko">{t({ fr: 'invitation non partie', en: 'invitation not sent', de: 'Einladung nicht versendet' })}</span>}
                </span>
                <span className="ee">{a.email}</span>
              </span>
              <button onClick={() => removeAdmin(a.id)} className="db-coorg-out">{t({ fr: 'Retirer', en: 'Remove', de: 'Entfernen' })}</button>
            </div>
          ))}
        </div>

        <form onSubmit={addAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" placeholder={t({ fr: 'Prénom', en: 'First name', de: 'Vorname' })} style={{ flex: 1, minWidth: 0 }}
              value={adminFirst} onChange={(e) => setAdminFirst(e.target.value)} />
            <input type="text" placeholder={t({ fr: 'Nom', en: 'Last name', de: 'Nachname' })} style={{ flex: 1, minWidth: 0 }}
              value={adminLast} onChange={(e) => setAdminLast(e.target.value)} />
          </div>
          <input type="email" placeholder={t({ fr: 'Adresse mail', en: 'Email address', de: 'E-Mail-Adresse' })} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
          {adminMsg && <div className="err">{adminMsg}</div>}
          <button className="btn btn-dark" type="submit" disabled={addingAdmin}>
            {addingAdmin
              ? t({ fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' })
              : t({ fr: '+ Inviter ce co-organisateur', en: '+ Invite this co-host', de: '+ Diesen Mitveranstalter einladen' })}
          </button>
        </form>
      </Section>

      {Array.isArray(ev.contacts) && ev.contacts.length > 0 && (
        <Section id="sec-invites" title={t({ fr: 'Participants inscrits', en: 'Registered guests', de: 'Angemeldete Gäste' })} badge={koListe.length ? `${ev.contacts.length} · ⚠️ ${koListe.length}` : String(ev.contacts.length)}
          hint={t({ fr: 'Tous les participants, avec ou sans adresse', en: 'All guests, with or without an email address', de: 'Alle Gäste, mit oder ohne Adresse' })}
          open={openSec === 'contacts'} onToggle={() => toggleSec('contacts')}>
          {koListe.length > 0 && (
            <div className="db-mail-parti db-ko-alerte" role="status">
              <span className="db-mail-parti-ic" aria-hidden="true">⚠️</span>
              <div>
                <strong>
                  {koListe.length > 1
                    ? t({ fr: `${koListe.length} adresses incorrectes`, en: `${koListe.length} incorrect email addresses`, de: `${koListe.length} fehlerhafte E-Mail-Adressen` })
                    : t({ fr: 'Une adresse incorrecte', en: 'An incorrect email address', de: 'Eine fehlerhafte E-Mail-Adresse' })}
                </strong>
                <p>
                  {t({
                    fr: <><b>{koListe.map((c) => c.name).join(', ')}</b> ne {koListe.length > 1 ? 'recevront' : 'recevra'} pas le lien de l’album : l’adresse laissée n’existe pas. Prévenez {koListe.length > 1 ? 'ces participants' : 'ce participant'} autrement, le message et le lien sont dans{' '}</>,
                    en: <><b>{koListe.map((c) => c.name).join(', ')}</b> won’t get the album link: the address they left doesn’t exist. Let {koListe.length > 1 ? 'them' : 'this guest'} know another way: the message and link are in{' '}</>,
                    de: <><b>{koListe.map((c) => c.name).join(', ')}</b> {koListe.length > 1 ? 'erhalten' : 'erhält'} den Album-Link nicht: Die hinterlassene Adresse existiert nicht. Benachrichtigen Sie {koListe.length > 1 ? 'diese Gäste' : 'diesen Gast'} auf anderem Weg, Nachricht und Link finden Sie im{' '}</>,
                  })}
                  <button type="button" className="linklike" onClick={() => allerA('album', 'sec-album')}>
                    {t({ fr: "la section L'album", en: 'the Album section', de: 'Bereich „Album“' })}
                  </button>.
                </p>
              </div>
            </div>
          )}
          <div className="notice small" style={{ marginBottom: 12 }}>
            ✉️ {t({
              fr: <>Ceux qui ont laissé leur adresse reçoivent le lien de l'album <strong>tout seuls</strong>, dès la révélation. Pour les autres, partagez le lien depuis{' '}</>,
              en: <>Those who left their email address receive the album link <strong>automatically</strong>, as soon as it’s revealed. For everyone else, share the link from{' '}</>,
              de: <>Wer seine Adresse hinterlassen hat, erhält den Album-Link <strong>automatisch</strong>, sobald es enthüllt ist. Für alle anderen teilen Sie den Link über{' '}</>,
            })}
            <button type="button" className="linklike" onClick={() => allerA('album', 'sec-album')}>
              {t({ fr: "la section L'album", en: 'the Album section', de: 'den Bereich „Album“' })}
            </button>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ev.contacts.map((c, i) => (
              <div key={i} className="db-contact">
                <span className="db-contact-name">
                  {c.name}
                  <span className={`db-contact-photos${c.photos ? '' : ' zero'}`}>
                    {c.photos} / {c.total} {c.total > 1
                      ? t({ fr: 'photos', en: 'photos', de: 'Fotos' })
                      : t({ fr: 'photo', en: 'photo', de: 'Foto' })}
                  </span>
                </span>
                <span className="db-contact-val">
                  {/* Sans adresse, le participant ne recevra rien : c'est justement ce
                      qu'il faut voir pour penser à le prévenir autrement. */}
                  {c.email || c.phone || <em className="db-contact-sans">{t({ fr: 'à prévenir vous-même', en: 'let them know yourself', de: 'selbst benachrichtigen' })}</em>}
                  {c.ko && <em className="db-contact-badge ko">{t({ fr: 'adresse incorrecte', en: 'incorrect address', de: 'fehlerhafte Adresse' })}</em>}
                  {!c.ko && c.desinscrit && <em className="db-contact-badge">{t({ fr: 'désinscrit des mails', en: 'unsubscribed from emails', de: 'von E-Mails abgemeldet' })}</em>}
                  {c.email && c.failed && !c.ko && <em className="db-contact-ko">{t({ fr: ' · non distribué', en: ' · not delivered', de: ' · nicht zugestellt' })}</em>}
                  {c.email && c.notified && !c.failed && !c.ko && !c.desinscrit && <em className="db-contact-ok">{t({ fr: ' · envoyé ✓', en: ' · sent ✓', de: ' · gesendet ✓' })}</em>}
                </span>
              </div>
            ))}
          </div>
          {ev.contacts.some((c) => c.failed && !c.ko) && (
            <div className="notice small" style={{ marginTop: 12, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
              ⚠️ {t({
                fr: "Une ou plusieurs adresses n'ont pas pu être livrées. Prévenez ces participants autrement : le message et le lien sont dans",
                en: 'One or more addresses couldn’t be delivered to. Let these guests know another way: the message and link are in',
                de: 'Eine oder mehrere Adressen konnten nicht zugestellt werden. Benachrichtigen Sie diese Gäste auf anderem Weg: Nachricht und Link finden Sie im',
              })}{' '}
              <button type="button" className="linklike" onClick={() => allerA('album', 'sec-album')}>
                {t({ fr: "la section L'album", en: 'the Album section', de: 'Bereich „Album“' })}
              </button>.
            </div>
          )}
        </Section>
      )}

      {/* Les deux pages qu'on cherche quand on ne sait plus quoi faire. Le guide
          s'ouvre en entier depuis ici (`orga=1`) : on ne redemande pas son
          adresse à quelqu'un qui organise déjà un événement. */}
      <div className="db-res">
        <span className="db-eyebrow">{t({ fr: 'vos ressources', en: 'your resources', de: 'Ihre Hilfen' })}</span>
        <Link className="db-res-row" href={lien('/guide?orga=1')}>
          <span aria-hidden="true">📕</span>
          <span>
            <strong>{t({ fr: "Le guide de l'organisateur", en: 'The host’s guide', de: 'Der Leitfaden für Gastgeber' })}</strong>
            <em>{t({
              fr: 'Combien de clichés donner, quand révéler, comment faire scanner tout le monde.',
              en: 'How many shots to give, when to reveal, how to get everyone scanning.',
              de: 'Wie viele Aufnahmen, wann enthüllen, wie alle zum Scannen bringen.',
            })}</em>
          </span>
        </Link>
        <Link className="db-res-row" href={lien('/aide')}>
          <span aria-hidden="true">🛟</span>
          <span>
            <strong>{t({ fr: "La page d'aide", en: 'The help page', de: 'Die Hilfeseite' })}</strong>
            <em>{t({
              fr: 'Les pannes du jour J, expliquées simplement. À transférer à un participant qui coince.',
              en: 'Problems on the day, explained simply. Forward it to a guest who’s stuck.',
              de: 'Pannen am großen Tag, einfach erklärt. Zum Weiterleiten an einen Gast, der nicht weiterkommt.',
            })}</em>
          </span>
        </Link>
      </div>

      <InstallPrompt label={t({ fr: 'Épinglez votre tableau de bord', en: 'Pin your dashboard', de: 'Heften Sie Ihr Dashboard an' })} iphone={false} />

      <div style={{ marginTop: 30, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
        {/* Effacer les photos de tous les participants reste au seul organisateur.
            Le serveur le refuse de toute façon : on évite juste de proposer un
            geste qui échouerait. */}
        {ev.role === 'admin' ? (
          <p className="muted small">
            {t({
              fr: "Vous co-organisez cet événement. Sa suppression est réservée à la personne qui l'a créé.",
              en: 'You’re co-hosting this event. Only the person who created it can delete it.',
              de: 'Sie sind Mitveranstalter dieses Events. Löschen kann es nur die Person, die es erstellt hat.',
            })}
          </p>
        ) : !confirmDel ? (
          <button onClick={() => { setError(''); setConfirmDel(true) }} className="db-danger-link" style={{ marginTop: 0 }}>
            {t({ fr: 'Supprimer cet événement', en: 'Delete this event', de: 'Dieses Event löschen' })}
          </button>
        ) : (
          <div className="card" style={{ borderColor: 'rgba(178,59,46,.35)' }}>
            <h3 className="h3" style={{ marginBottom: 8 }}>{t({ fr: `Supprimer « ${nomEv} » ?`, en: `Delete “${nomEv}”?`, de: `„${nomEv}“ löschen?` })}</h3>
            <p className="muted small" style={{ marginBottom: 6 }}>
              {ev.photoCount > 0
                ? t({
                  fr: <><strong>{ev.photoCount} photo{ev.photoCount > 1 ? 's' : ''}</strong> prise{ev.photoCount > 1 ? 's' : ''} par
                    {' '}<strong>{ev.guestCount} participant{ev.guestCount > 1 ? 's' : ''}</strong> seront effacées, chez eux comme chez vous.</>,
                  en: <><strong>{ev.photoCount} photo{ev.photoCount > 1 ? 's' : ''}</strong> taken by
                    {' '}<strong>{ev.guestCount} guest{ev.guestCount > 1 ? 's' : ''}</strong> will be deleted, from their phones and yours.</>,
                  de: <><strong>{ev.photoCount} Foto{ev.photoCount > 1 ? 's' : ''}</strong> von
                    {' '}<strong>{ev.guestCount} {ev.guestCount > 1 ? 'Gästen' : 'Gast'}</strong> {ev.photoCount > 1 ? 'werden' : 'wird'} gelöscht, bei ihnen wie bei Ihnen.</>,
                })
                : t({ fr: "L'événement et son lien d'invitation seront effacés.", en: 'The event and its invitation link will be deleted.', de: 'Das Event und sein Einladungslink werden gelöscht.' })}
            </p>
            <p className="muted small" style={{ marginBottom: 16 }}>
              {t({ fr: 'Rien ne pourra être récupéré, ni par vous, ni par nous.', en: 'Nothing can be recovered, not by you and not by us.', de: 'Nichts kann wiederhergestellt werden, weder von Ihnen noch von uns.' })}
            </p>

            {/* Recopier le nom : deux clics ne pèsent pas assez lourd face à des
                photos qui ne sont pas les nôtres et qu'on ne peut pas refaire. */}
            <div className="field">
              <label>{t({ fr: "Pour confirmer, recopiez le nom de l'événement", en: 'To confirm, type the name of the event', de: 'Geben Sie zur Bestätigung den Namen des Events ein' })}</label>
              <input type="text" value={confirmNom} autoFocus autoComplete="off"
                placeholder={nomEv}
                onChange={(e) => setConfirmNom(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => { setConfirmDel(false); setConfirmNom('') }} disabled={deleting}>{t({ fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' })}</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={deleteEvent}
                disabled={deleting || !nomRecopie}>
                {deleting
                  ? t({ fr: 'Suppression…', en: 'Deleting…', de: 'Wird gelöscht…' })
                  : t({ fr: 'Supprimer définitivement', en: 'Delete permanently', de: 'Endgültig löschen' })}
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
            {sheet === 'prenom' && (
              <form onSubmit={validerPrenomOrga}>
                <h3 className="h3">{t({ fr: 'Votre prénom', en: 'Your first name', de: 'Ihr Vorname' })}</h3>
                <p className="muted small">
                  {t({
                    fr: "Il signe vos photos dans l'album, comme pour chaque participant. On ne vous le demandera plus.",
                    en: 'It signs your photos in the album, just like for every guest. We won’t ask you again.',
                    de: 'Er steht unter Ihren Fotos im Album, wie bei jedem Gast. Wir fragen Sie nicht noch einmal.',
                  })}
                </p>
                <input type="text" name="prenom" autoComplete="given-name" autoFocus maxLength={30}
                  style={{ marginTop: 14 }} placeholder={t({ fr: 'Votre prénom', en: 'Your first name', de: 'Ihr Vorname' })}
                  value={prenomOrga} onChange={(e) => setPrenomOrga(e.target.value)} />
                <button className="btn btn-accent" type="submit" style={{ marginTop: 12, width: '100%' }}
                  disabled={!prenomOrga.trim()}>
                  {t({ fr: 'Ouvrir mon appareil', en: 'Open my camera', de: 'Meine Kamera öffnen' })}
                </button>
              </form>
            )}
            {sheet === 'qr' && (
              <>
                <h3 className="h3">{t({ fr: 'Faites-le scanner', en: 'Have them scan it', de: 'Lassen Sie ihn scannen' })}</h3>
                <p className="muted small">
                  {t({
                    fr: `Il reçoit ses ${ev.shotsPerGuest} photos tout de suite. Aucune installation.`,
                    en: `They get their ${ev.shotsPerGuest} photos straight away. Nothing to install.`,
                    de: `Der Gast erhält sofort seine ${ev.shotsPerGuest} Fotos. Keine Installation.`,
                  })}
                </p>
                <div className="qr-tile" style={{ marginTop: 16 }}>
                  {qrUrl && <img src={qrUrl} alt={t({ fr: "QR code de l'événement", en: "The event's QR code", de: 'QR-Code des Events' })} />}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => copy(joinUrl, 'join')}>
                  {flash === 'join' ? t({ fr: '✓ Copié', en: '✓ Copied', de: '✓ Kopiert' }) : t({ fr: 'Copier le lien', en: 'Copy the link', de: 'Link kopieren' })}
                </button>
              </>
            )}
            {sheet === 'message' && (
              <>
                <h3 className="h3">{revealed
                  ? t({ fr: 'Prévenir vos participants', en: 'Let your guests know', de: 'Ihre Gäste benachrichtigen' })
                  : t({ fr: "Annoncer l'album", en: 'Announce the album', de: 'Album ankündigen' })}</h3>
                <p className="muted small">
                  {t({
                    fr: 'Modifiez-le si vous voulez, puis envoyez-le par le canal de votre choix.',
                    en: 'Edit it if you like, then send it however you prefer.',
                    de: 'Passen Sie die Nachricht bei Bedarf an und senden Sie sie dann über den Kanal Ihrer Wahl.',
                  })}
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
                    <strong>{t({ fr: "Protéger l'album par un code.", en: 'Protect the album with a code.', de: 'Album mit einem Code schützen.' })}</strong>{' '}
                    {ev.galleryCode
                      ? t({ fr: 'Vos participants devront l’entrer. Il est ajouté au message ci-dessus.', en: 'Your guests will need to enter it. It’s been added to the message above.', de: 'Ihre Gäste müssen ihn eingeben. Er wurde der Nachricht oben hinzugefügt.' })
                      : t({ fr: 'Seuls ceux à qui vous envoyez ce message pourront ouvrir l’album.', en: 'Only the people you send this message to will be able to open the album.', de: 'Nur die Empfänger dieser Nachricht können das Album öffnen.' })}
                  </span>
                </label>

                {souhaiteCode && (
                  <>
                    <input type="text" style={{ marginTop: 8 }} value={codeDraft} maxLength={12}
                      placeholder={t({ fr: 'Choisissez votre code', en: 'Choose your code', de: 'Wählen Sie Ihren Code' })} autoFocus autoComplete="off"
                      onChange={(e) => saisirCode(e.target.value)}
                      onBlur={() => enregistrerCode(codeDraft)} />
                    <p className="hint" style={{ marginTop: 6 }}>
                      {protecting ? t({ fr: 'Enregistrement…', en: 'Saving…', de: 'Wird gespeichert…' })
                        : codeSauve ? t({ fr: '✓ Code enregistré', en: '✓ Code saved', de: '✓ Code gespeichert' })
                          : ev.galleryCode ? t({ fr: `Code actif : ${ev.galleryCode}`, en: `Active code: ${ev.galleryCode}`, de: `Aktiver Code: ${ev.galleryCode}` })
                            : t({ fr: 'Choisissez un code : il s’enregistre tout seul et s’ajoute au message.', en: 'Choose a code: it saves automatically and is added to the message.', de: 'Wählen Sie einen Code: Er wird automatisch gespeichert und der Nachricht hinzugefügt.' })}
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
                  onClick={() => shareOrCopy({ title: nomEv, text: shareText }, 'msg')}>
                  {flash === 'msg'
                    ? t({ fr: '✓ Message copié', en: '✓ Message copied', de: '✓ Nachricht kopiert' })
                    : t({ fr: 'Partager / copier le message', en: 'Share / copy the message', de: 'Nachricht teilen / kopieren' })}
                </button>
                {souhaiteCode && !ev.galleryCode && (
                  <p className="hint" style={{ marginTop: 6 }}>
                    {t({ fr: "Entrez d'abord le code, sinon vos participants trouveront porte close.", en: 'Enter the code first, otherwise your guests will find the door locked.', de: 'Geben Sie zuerst den Code ein, sonst stehen Ihre Gäste vor verschlossener Tür.' })}
                  </p>
                )}
              </>
            )}
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setSheet(null)}>{t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}</button>
          </div>
        </div>
      )}
    </main>
  )
}
