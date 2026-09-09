'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { getDeviceToken, saveGuest, getGuest, forgetGuest, getOwnerToken } from '../../../lib/device'
import { supportsLiveCamera, isInAppBrowser, isAndroidInApp, lienChrome, compressToBlob, decodeImage, prepareUpload, playShutter, etatPermissionCamera, surveillerPermissionCamera } from '../../../lib/camera'
import CameraBloquee from '../../../components/CameraBloquee'
import { revoitSesPhotos, peutSupprimer, demandeConfirmation } from '../../../lib/photo-mode'
import { pushPossible, pushEtat, dejaPropose, marquerPropose, activerPush } from '../../../lib/push'

const COVER_GRAD = 'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)'

function formatReveal(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

// Compte à rebours court avant la révélation : « dans 1 j 23 h », « dans 2 h 05 min »…
function countdownToReveal(iso, now) {
  const diff = new Date(iso).getTime() - now
  if (isNaN(diff)) return ''
  if (diff <= 0) return 'révélé ✨'
  const mins = Math.floor(diff / 60000)
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d > 0) return `révélation dans ${d} j ${h} h`
  if (h > 0) return `révélation dans ${h} h ${String(m).padStart(2, '0')} min`
  return `révélation dans ${m} min`
}

// Le sur-titre de l'album : la date, jamais le type d'événement. La base ne
// sait pas si c'est un mariage ou un anniversaire, mais elle sait quel jour
// c'était, et c'est vrai dans tous les cas.
function formatLong(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

function formatCourt(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, ' · ')
  } catch { return '' }
}

// « Claire & Martin » donne « C&M ». Un nom d'un seul tenant garde sa première
// lettre : mieux vaut une initiale seule qu'un carton vide.
function initialesDe(nom) {
  const mots = String(nom || '').split(/[\s&+]+/).filter(Boolean)
  if (!mots.length) return '✳'
  return mots.slice(0, 2).map((m) => m[0].toUpperCase()).join('&')
}

// La molette de vues : un cran de 22 px, une fenêtre de deux crans et demi.
// Le décalage place le chiffre en cours au centre de la fenêtre ; les deux
// mêmes valeurs vivent dans la feuille de style (.cam-roue), elles se suivent.
const CRAN = 22
const CRAN_OFFSET = 17

// Décompose le temps restant en jours / heures / minutes / secondes
function breakdownToReveal(iso, now) {
  let diff = new Date(iso).getTime() - now
  if (isNaN(diff) || diff < 0) diff = 0
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  }
}

let _tmp = 0

// Le navigateur d'une messagerie met la page en veille dès qu'on la quitte :
// la première requête au retour se perd parfois, et le navigateur répond alors
// un « Load failed » que personne ne comprend. On retente une fois en silence,
// et on ne parle d'échec qu'ensuite, avec des mots clairs.
async function envoyer(url, options, messageEchec = 'Connexion perdue. Vérifie ta connexion et réessaie.') {
  for (let tentative = 0; tentative < 2; tentative++) {
    try { return await fetch(url, options) }
    catch {
      if (tentative) throw new Error(messageEchec)
      await new Promise((r) => setTimeout(r, 900))
    }
  }
}

export default function GuestCamera({ params }) {
  const { id } = use(params)

  const [phase, setPhase] = useState('loading') // loading | cover | name | attente | camera | error
  const [attente, setAttente] = useState(null)  // { eventName, maxGuests } : formule complète
  const [mailRetour, setMailRetour] = useState('') // « j'ai déjà participé » : adresse d'alors
  const [meta, setMeta] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mailCheck, setMailCheck] = useState(null) // {status, suggestion?, reason?}
  const [monJeton, setMonJeton] = useState('')     // clé personnelle, pour le lien qu'on se garde
  const [confirmSansMail, setConfirmSansMail] = useState(false) // question posée une fois, champ vide
  const mailRef = useRef(null)
  const [checkingMail, setCheckingMail] = useState(false)
  const [guest, setGuest] = useState(null)       // { guestId, shotsTaken, shotsPerGuest }
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flashFx, setFlashFx] = useState(false)
  const [shutterFx, setShutterFx] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [screenFlash, setScreenFlash] = useState(false) // flash écran (selfie) pendant la capture
  const [liveCam, setLiveCam] = useState(false)
  const [camBlocked, setCamBlocked] = useState(false)
  const [camDenied, setCamDenied] = useState(false) // refus enregistré : le navigateur ne redemandera plus
  const [inApp, setInApp] = useState(false)      // page ouverte depuis une messagerie
  const [androidInApp, setAndroidInApp] = useState(false) // Android + mini-navigateur (appli de scan de QR code)
  const [declencheurMuet, setDeclencheurMuet] = useState(false) // le bouton n'ouvre rien : mini-navigateur trop limité
  const [chromeRate, setChromeRate] = useState(false)     // la bascule vers Chrome n'a pas pris
  const [facingMode, setFacingMode] = useState('environment')
  const [myPhotos, setMyPhotos] = useState([])   // [{id, url}] confirmées (serveur)
  const [mur, setMur] = useState([])             // [{id, url, qui, moi}] photos du groupe, floutées avant la révélation
  const [murTotal, setMurTotal] = useState(0)    // combien il y en a en tout, pour savoir s'il en reste
  const [murN, setMurN] = useState(12)           // combien on en demande : 12, puis la suite au défilement
  // Lequel des deux onglets est ouvert. L'onglet d'arrivée suit le mode, et
  // c'est le seul endroit où les trois modes divergent vraiment :
  //  · album ouvert  → « Mes photos », elles sont nettes, il y a quelque chose
  //    à en faire (les revoir, en supprimer une, les emporter) ;
  //  · les deux autres → « Toutes les photos », parce que les siennes n'y sont
  //    que des carrés flous, alors que la pellicule collective qui se remplit
  //    est justement ce qui fait vivre l'attente.
  const [ongletMoi, setOngletMoi] = useState(true)
  const ongletChoisi = useRef(false)
  useEffect(() => {
    // Une seule fois, à l'arrivée de la fiche : après, c'est le participant qui
    // décide, et son choix ne doit pas se faire écraser au rafraîchissement.
    if (!meta || ongletChoisi.current) return
    ongletChoisi.current = true
    setOngletMoi(revoitSesPhotos(meta.photoMode || 'libre'))
  }, [meta])
  const [murCharge, setMurCharge] = useState(false) // le serveur a répondu au moins une fois
  const [pending, setPending] = useState([])     // [{tempId, url}] en cours d'envoi
  const [viewer, setViewer] = useState(null)     // {id, url} photo affichée en grand
  const [aConfirmer, setAConfirmer] = useState(null) // {blob, url} cliché montré une fois, à garder ou à reprendre
  const [deleting, setDeleting] = useState(false)
  const [showQR, setShowQR] = useState(false)    // pop-up "inviter un proche"
  const [showSaveTip, setShowSaveTip] = useState(false) // rappel "garde ton lien pour revenir" (une seule fois)
  const [showPushTip, setShowPushTip] = useState(false) // proposition des notifications, après la 1re photo
  const [pushBusy, setPushBusy] = useState(false)
  const [showAlbum, setShowAlbum] = useState(false) // écran album (la soirée en cours)
  const [showProfil, setShowProfil] = useState(false) // panneau du participant
  const [downloading, setDownloading] = useState(false)
  const [bonusUsed, setBonusUsed] = useState(false) // +5 photos déjà réclamées ?
  const [qrUrl, setQrUrl] = useState('')
  const [qrCopied, setQrCopied] = useState(false)
  const [now, setNow] = useState(() => Date.now())  // pour le compte à rebours

  const refusRef = useRef(0)  // refus d'affilée : au deuxième, le blocage est durable
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  // Retour par son propre lien (?t=…) : ce navigateur n'est pas forcément celui
  // qui a photographié, un lien tapé dans Messages s'ouvrant chez Safari. Le
  // jeton rattache la participation ici avant que la page ne demande quoi que
  // ce soit, sinon on redemanderait son prénom à quelqu'un qu'on connaît.
  const [rattachement, setRattachement] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!new URLSearchParams(window.location.search).get('t')
  })

  useEffect(() => {
    if (!rattachement) return
    const t = new URLSearchParams(window.location.search).get('t')
    let annule = false
    fetch('/api/guest/restore', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t, deviceToken: getDeviceToken() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (annule || d.error) return
        // On ne garde que la participation à CET événement : le lien ramène ici.
        for (const e of d.events || []) saveGuest(e.eventId, e.guestId, e.displayName, d.email)
        setMonJeton(t)
      })
      .catch(() => {})
      // Un jeton périmé ne bloque personne : la page reprend son cours normal et
      // redemande un prénom, comme avant.
      .finally(() => {
        if (annule) return
        window.history.replaceState(null, '', `/j/${id}`)
        setRattachement(false)
      })
    return () => { annule = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rattachement, id])

  useEffect(() => {
    if (rattachement) return // on attend d'avoir rattaché : sinon on se présente en inconnu
    setInApp(isInAppBrowser()) // au montage seulement : le serveur ne connaît pas le navigateur
    setAndroidInApp(isAndroidInApp())
    // Le jeton part avec la requête : l'organisateur qui prend ses propres photos
    // n'a pas à se présenter comme un inconnu. Sans jeton valable, le serveur ne
    // renvoie rien de plus qu'à n'importe quel participant.
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': getOwnerToken(id) } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setPhase('error'); return }
        setMeta(d)
        // Album ouvert : la pellicule est finie, et les photos sont là. On y va
        // directement : un écran intermédiaire n'aurait annoncé que ce que la
        // page suivante montre, animation d'ouverture comprise. `replace` pour
        // que le retour du navigateur ne ramène pas ici.
        if (d.revealed) { window.location.replace(`/g/${id}`); return }
        const saved = getGuest(id)
        if (saved?.name) { setName(saved.name); if (saved.email) setEmail(saved.email); join(saved.name, saved.email) }
        else {
          // Rien de saisi encore : on reprend ce que le serveur sait de cet
          // événement précis. Surtout pas l'adresse mémorisée par le navigateur :
          // elle vient d'une autre connexion, et ce champ est facultatif : le
          // pré-remplir changerait un consentement donné en consentement à retirer.
          if (d.ownerName) setName(String(d.ownerName).trim().split(/\s+/)[0])
          if (d.ownerEmail) setEmail(d.ownerEmail)
          setPhase('cover')
        }
      })
      .catch(() => { setError('Connexion impossible.'); setPhase('error') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rattachement])

  // La révélation qui tombe pendant qu'on tient l'appareil.
  //
  // Le renvoi vers l'album ne se faisait qu'au chargement de la page : qui
  // restait sur le viseur continuait de photographier une pellicule déjà
  // développée, et ses clichés apparaissaient aussitôt dans un album censé
  // être une surprise. On arme donc une minuterie sur l'heure exacte, et on
  // revérifie au retour sur l'onglet : un navigateur endormi ne fait pas
  // tourner ses minuteries, et au delà de vingt-quatre jours elles débordent.
  useEffect(() => {
    if (!meta?.revealAt) return
    const cible = new Date(meta.revealAt).getTime()
    if (!Number.isFinite(cible)) return

    const filer = () => window.location.replace(`/g/${id}`)
    if (cible <= Date.now()) { filer(); return }

    const attente = cible - Date.now()
    const minuteur = attente < 2 ** 31 - 1 ? setTimeout(filer, attente) : null
    const reveil = () => { if (!document.hidden && Date.now() >= cible) filer() }
    document.addEventListener('visibilitychange', reveil)
    return () => {
      if (minuteur) clearTimeout(minuteur)
      document.removeEventListener('visibilitychange', reveil)
    }
  }, [meta?.revealAt, id])

  useEffect(() => {
    if (phase === 'camera' && liveCam) startCamera()
    return stopCamera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liveCam, facingMode])

  // À la 1re ouverture de la caméra (par appareil + événement), on rappelle au participant
  // de garder son lien pour revenir finir ses photos. Affiché une seule fois.
  useEffect(() => {
    if (phase !== 'camera') return
    try {
      const key = `pellicule_savetip_${id}`
      if (!localStorage.getItem(key)) {
        setShowSaveTip(true)
        localStorage.setItem(key, '1')
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, id])

  // LES NOTIFICATIONS DE SOIRÉE, PROPOSÉES APRÈS LA PREMIÈRE PHOTO.
  //
  // Jamais à l'arrivée : une fenêtre d'autorisation posée avant qu'on ait
  // compris à quoi sert la page se refuse par réflexe, et un refus est
  // définitif. Après le premier déclic, la question a un sens.
  //
  // Ne concerne en pratique qu'Android : sur iPhone, les notifications web
  // exigent d'avoir ajouté le site à l'écran d'accueil, et ceux qui scannent le
  // QR code ont déjà les rappels de l'extrait d'app. Les mini-navigateurs des
  // messageries en sont incapables, on ne leur demande donc rien.
  useEffect(() => {
    if (phase !== 'camera' || !guest || !guest.guestId) return
    if (!guest.shotsTaken || showSaveTip || aConfirmer) return
    if (!pushPossible() || inApp) return

    const etat = pushEtat()
    // Déjà accepté ailleurs (une soirée précédente, ce même téléphone) : on
    // rebranche sans rien montrer, pour que les rappels de CETTE soirée partent.
    if (etat === 'granted') {
      activerPush({ eventId: id, guestId: guest.guestId, demander: false })
      return
    }
    if (etat !== 'default' || dejaPropose(id)) return
    setShowPushTip(true)
    marquerPropose(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guest?.guestId, guest?.shotsTaken, showSaveTip, aConfirmer, inApp, id])

  async function accepterNotifications() {
    if (pushBusy || !guest?.guestId) return
    setPushBusy(true)
    // Le résultat n'est pas affiché : un refus n'est pas une erreur, et une
    // confirmation de plus au milieu d'une fête n'apporte rien. La fenêtre du
    // navigateur a déjà tout dit.
    await activerPush({ eventId: id, guestId: guest.guestId })
    setPushBusy(false)
    setShowPushTip(false)
  }

  // Génère le QR code d'invitation à l'ouverture de la pop-up
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/j/${id}` : ''
  useEffect(() => {
    if (!showQR || qrUrl || !joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1, color: { dark: '#221A12', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [showQR, qrUrl, joinUrl])

  function copyJoinLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setQrCopied(true); setTimeout(() => setQrCopied(false), 1800) })
  }

  // Ouvre l'appli Messages du téléphone, pré-remplie avec le lien : le participant se l'envoie
  // à lui-même (gratuit) pour revenir prendre ses photos restantes plus tard.
  // Le destinataire est laissé vide : il choisit son propre numéro dans l'appli.
  // Le lien qu'on se garde n'est pas celui qu'on partage. Celui-ci porte la clé
  // personnelle : il rouvre l'appareil sur le bon compte depuis n'importe quel
  // navigateur, et c'est justement pour ça qu'il ne se transmet pas.
  const monLien = monJeton ? `${joinUrl}?t=${monJeton}` : joinUrl

  function smsMyLink() {
    const body = monJeton
      ? `Mon lien personnel pour reprendre mes photos 📸 (à garder pour moi) : ${monLien}`
      : `Mon lien pour reprendre mes photos 📸 : ${joinUrl}`
    window.location.href = `sms:?&body=${encodeURIComponent(body)}`
  }

  // Partage natif (Notes, WhatsApp, Mail…) ; repli sur copie si indisponible.
  async function shareMyLink() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      // Le nom de la soirée dans le TEXTE, pas seulement dans le titre : les
      // messageries ignorent le titre et ne collent que le texte et le lien.
      // Sans lui, on reçoit une invitation sans savoir à quoi.
      const nom = meta?.hostNames || meta?.name || ''
      const texte = nom ? `Prends des photos avec nous à ${nom} 📸` : 'Prends des photos avec nous 📸'
      try { await navigator.share({ title: nom || 'Time to Flash', text: texte, url: joinUrl }); return } catch {}
    }
    copyJoinLink()
  }

  // Télécharge mes propres photos en .zip
  async function downloadMine() {
    if (downloading || !myPhotos.length) return
    setDownloading(true)
    try {
      const JSZip = (await import('jszip')).default
      const z = new JSZip()
      let i = 0
      let reussies = 0
      for (const p of myPhotos) {
        try {
          const blob = await fetch(p.url).then((r) => r.blob())
          z.file(`timetoflash-${String(++i).padStart(2, '0')}.jpg`, blob)
          reussies++
        } catch { i++ }
      }
      // Sans ce garde-fou, l'échec s'enregistrait sous la forme d'une archive
      // vide de 22 octets, que l'on ne découvrait qu'en essayant de l'ouvrir.
      if (reussies === 0) {
        setError('Téléchargement impossible : aucune photo n\'a pu être relue. Réessayez dans un instant.')
        return
      }
      const out = await z.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(out)
      const a = document.createElement('a')
      a.href = url; a.download = 'mes-photos-timetoflash.zip'; a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 60000)
    } catch { setError('Téléchargement impossible.') } finally { setDownloading(false) }
  }

  // Rafraîchit le compte à rebours chaque seconde (décompte actif)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Met à jour les compteurs (photos / participants) et le mur du groupe en
  // temps réel tant que l'écran album est ouvert : un appel immédiat, puis
  // toutes les 4 s. Les jetons partent avec : le serveur ne confie le mur qu'à
  // quelqu'un de la soirée.
  // Deux régimes : l'album ouvert veut les vignettes, toutes les 4 s ; le
  // viseur ne veut que les chiffres, toutes les 20 s, parce que son bouton
  // « Album » affiche le compte du groupe en permanence.
  useEffect(() => {
    if (phase !== 'camera') return
    let alive = true
    const refresh = async () => {
      try {
        const n = showAlbum ? murN : 0
        // Le tri par personne ne sert que dans l'onglet « Mes photos » des modes
        // où l'on ne revoit pas ses photos : en album ouvert, elles viennent du
        // téléphone, nettes, sans passer par le mur.
        // Recalculé ici : `flouterMesPhotos` est défini plus bas, après les
        // écrans d'attente, et un crochet ne peut pas vivre après eux.
        const queMoi = ongletMoi && !!meta && !meta.revealed && !revoitSesPhotos(meta.photoMode || 'libre')
        const d = await fetch(`/api/events/${id}/stats?n=${n}${queMoi ? '&qui=moi' : ''}`, {
          headers: { 'x-device-token': getDeviceToken(), 'x-owner-token': getOwnerToken(id) },
        }).then((r) => r.json())
        if (!alive || !d) return
        setMeta((m) => (m ? {
          ...m,
          guestCount: typeof d.guestCount === 'number' ? d.guestCount : m.guestCount,
          photoCount: typeof d.photoCount === 'number' ? d.photoCount : m.photoCount,
        } : m))
        if (typeof d.murTotal === 'number') setMurTotal(d.murTotal)
        if (showAlbum && Array.isArray(d.mur)) { setMur(d.mur); setMurCharge(true) }
      } catch {}
    }
    refresh()
    const t = setInterval(refresh, showAlbum ? 4000 : 20000)
    return () => { alive = false; clearInterval(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAlbum, murN, ongletMoi, meta?.photoMode, meta?.revealed, phase, id])

  // Où l'on atterrit. Le viseur tant qu'il reste des vues et que la soirée
  // court ; l'album dans tous les autres cas, parce qu'il n'y a alors plus rien
  // à déclencher : pellicule finie, événement pas encore commencé, ou album
  // déjà révélé. Une seule fois par arrivée, pour ne jamais reprendre la main
  // sur quelqu'un qui vient de fermer l'album.
  const atterrissageFait = useRef(false)
  useEffect(() => {
    if (phase !== 'camera' || !guest || !meta || atterrissageFait.current) return
    atterrissageFait.current = true
    const pasCommence = meta.startsAt && new Date(meta.startsAt).getTime() > Date.now()
    if (full || meta.revealed || pasCommence) setShowAlbum(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, guest, meta])

  // Charge mes photos confirmées + synchronise le compteur depuis le serveur
  async function loadMyPhotos() {
    try {
      const res = await fetch('/api/my-photos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken() }),
      })
      const d = await res.json()
      if (Array.isArray(d.photos)) setMyPhotos(d.photos)
      setGuest((g) => (g ? {
        ...g,
        shotsTaken: typeof d.shotsTaken === 'number' ? d.shotsTaken : g.shotsTaken,
        shotsPerGuest: typeof d.shotsPerGuest === 'number' ? d.shotsPerGuest : g.shotsPerGuest,
      } : g))
      if (typeof d.bonusUsed === 'boolean') setBonusUsed(d.bonusUsed)
    } catch {}
  }

  // Vérifie l'adresse quand le participant quitte le champ : la correction arrive
  // avant qu'il ait à revenir dessus. Ne bloque jamais : l'adresse est facultative.
  async function verifierMail(value) {
    const v = (value || '').trim()
    if (!v) { setMailCheck(null); return }
    setCheckingMail(true)
    try {
      const r = await fetch('/api/email/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
      })
      setMailCheck(await r.json())
    } catch { setMailCheck(null) } finally { setCheckingMail(false) }
  }

  function accepterSuggestion() {
    if (!mailCheck?.suggestion) return
    setEmail(mailCheck.suggestion)
    verifierMail(mailCheck.suggestion)
  }

  // Le champ mail vide n'est presque jamais un refus : c'est une ligne sautée
  // par vitesse, dans une soirée. On montre une fois ce qu'elle coûte, puis on
  // laisse passer : l'adresse reste facultative, et le dire est une obligation.
  function soumettreArrivee(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (!email.trim() && !confirmSansMail) { setConfirmSansMail(true); return }
    join(name.trim(), email)
  }

  async function join(displayName, emailArg) {
    setBusy(true); setError('')
    // emailArg : utilisé à la reconnexion (adresse mémorisée) ; sinon, le champ du formulaire.
    const emailVal = ((emailArg !== undefined ? emailArg : email) || '').trim().toLowerCase()
    try {
      const res = await envoyer('/api/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken(), displayName, email: emailVal }),
      }, 'Connexion perdue. Vérifie ta connexion et réessaie.')
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      // Formule complète : on reste à la porte. L'organisateur vient d'être
      // prévenu ; l'écran se rouvrira tout seul dès qu'il aura agrandi.
      if (d.waiting) { setAttente(d); setPhase('attente'); return }
      setAttente(null)
      saveGuest(id, d.guestId, d.displayName, d.email ?? emailVal)
      if (d.token) setMonJeton(d.token)
      setGuest({ guestId: d.guestId, shotsTaken: d.shotsTaken, shotsPerGuest: d.shotsPerGuest })
      setLiveCam(supportsLiveCamera())
      loadMyPhotos()
      setPhase('camera')
    } catch (err) {
      setError(err.message || 'Connexion impossible. Réessaie.'); setPhase('name')
    } finally { setBusy(false) }
  }

  // À la porte : on retente tout seul. Le participant n'a rien à surveiller, et
  // l'organisateur n'a personne à rappeler une fois qu'il a payé.
  useEffect(() => {
    if (phase !== 'attente') return
    const t = setInterval(() => { join(name, email) }, 10000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, name, email])

  // Le participant part réautoriser dans les réglages de son navigateur : dès
  // qu'il revient, la caméra repart toute seule. Rien à recharger, rien à toucher.
  useEffect(() => {
    if (!camBlocked) return
    const stop = surveillerPermissionCamera((etat) => {
      if (etat !== 'granted') return
      refusRef.current = 0
      setCamDenied(false); setCamBlocked(false); setLiveCam(true)
    })
    return () => { if (stop) stop() }
  }, [camBlocked])

  async function startCamera() {
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false,
      })
      streamRef.current = stream
      refusRef.current = 0
      setCamBlocked(false)
      setCamDenied(false)
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}) }
    } catch (err) {
      setLiveCam(false)
      // Accès refusé (par réflexe ?) : on le signale pour proposer de réautoriser
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        setCamBlocked(true)
        refusRef.current += 1
        // Reste à savoir si le navigateur reposera la question. S'il a enregistré
        // le refus, le bouton « Autoriser ma caméra » ne produirait plus rien :
        // il faut alors montrer la manipulation tout de suite. Safari ne sait pas
        // répondre : le deuxième refus d'affilée en tient lieu de preuve.
        const etat = await etatPermissionCamera()
        if (etat === 'denied' || refusRef.current >= 2) setCamDenied(true)
      }
    }
  }
  function stopCamera() {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }
  function flipCamera() { setFacingMode((m) => (m === 'environment' ? 'user' : 'environment')) }

  // Active/désactive la torche (vrai flash) si le téléphone le permet (surtout Android).
  async function applyTorch(on) {
    try {
      const track = streamRef.current?.getVideoTracks?.()[0]
      if (!track || !track.getCapabilities) return false
      const caps = track.getCapabilities()
      if (!caps || !caps.torch) return false
      await track.applyConstraints({ advanced: [{ torch: on }] })
      return true
    } catch { return false }
  }
  // Nouvelle tentative d'accès caméra (après que le participant a réautorisé dans son navigateur)
  function retryCamera() {
    setCamBlocked(false)
    setCamDenied(false)
    if (liveCam) startCamera()
    else setLiveCam(true)
  }

  // Capture optimiste : on affiche tout de suite, on envoie en arrière-plan.
  // Ce que l'organisateur a choisi pour sa soirée. Tant que la révélation n'a
  // pas eu lieu, ce réglage commande ce que le participant revoit de ses propres
  // photos. Après, tout le monde retrouve son album : le jeu est fini.
  const mode = meta?.photoMode || 'libre'
  const jeuEnCours = !!meta && !meta.revealed
  const flouterMesPhotos = jeuEnCours && !revoitSesPhotos(mode)
  const suppressionOuverte = !jeuEnCours || peutSupprimer(mode)
  // Le vrai jetable ne connaît que ce qu'il a déclenché : pas de photothèque.
  const importAutorise = !jeuEnCours || mode !== 'jetable'

  const PLEINE = () => (suppressionOuverte
    ? 'Pellicule pleine : supprime une photo pour en reprendre une.'
    : 'Pellicule pleine : tes photos t’attendent à la révélation.')

  // Un cliché de plus, à confirmer ou à envoyer selon le mode. Le compteur ne
  // bouge qu'à l'envoi : une photo reprise n'a jamais existé.
  async function proposer(blob) {
    if (jeuEnCours && demandeConfirmation(mode)) {
      setAConfirmer((v) => { if (v) URL.revokeObjectURL(v.url); return { blob, url: URL.createObjectURL(blob) } })
      return
    }
    await capture(blob)
  }

  function garderLeCliche() {
    const v = aConfirmer
    if (!v) return
    setAConfirmer(null)
    URL.revokeObjectURL(v.url)
    capture(v.blob)
  }

  function reprendreLeCliche() {
    const v = aConfirmer
    if (!v) return
    setAConfirmer(null)
    URL.revokeObjectURL(v.url)
  }

  async function capture(blob) {
    const tempId = `tmp-${++_tmp}`
    const url = URL.createObjectURL(blob)
    setPending((p) => [{ tempId, url }, ...p])
    setGuest((g) => (g ? { ...g, shotsTaken: Math.min(g.shotsPerGuest, g.shotsTaken + 1) } : g))
    try {
      // Mini-version légère (~640px) pour l'affichage de l'album, économise la data
      let thumbBlob = null
      try {
        const im = await decodeImage(blob)
        thumbBlob = await compressToBlob(im, { maxSize: 640, quality: 0.6 })
        try { im.close?.() } catch {}
      } catch {}

      const fd = new FormData()
      fd.append('file', blob, 'photo.jpg')
      if (thumbBlob) fd.append('thumb', thumbBlob, 'thumb.jpg')
      fd.append('eventId', id); fd.append('guestId', guest.guestId); fd.append('deviceToken', getDeviceToken())

      const res = await envoyer('/api/photo', { method: 'POST', body: fd },
        'Connexion perdue pendant l’envoi. Vérifie ta connexion et réessaie.')
      const d = await res.json().catch(() => ({}))
      if (res.status === 409) { setError(PLEINE()) }
      else if (!res.ok) { throw new Error(d.error || "Échec de l'envoi.") }
    } catch (err) {
      setError(err.message || "Échec de l'envoi. Réessaie.")
    } finally {
      setPending((p) => p.filter((x) => x.tempId !== tempId))
      URL.revokeObjectURL(url)
      loadMyPhotos() // synchronise compteur + photos depuis le serveur
    }
  }

  function fireShutterFeedback() {
    playShutter()
    setShutterFx(true); setTimeout(() => setShutterFx(false), 240)
    if (flashOn) { setFlashFx(true); setTimeout(() => setFlashFx(false), 420) }
  }

  async function snap() {
    if (busy || !videoRef.current) return
    const remaining = guest.shotsPerGuest - guest.shotsTaken
    if (remaining <= 0) { setError(PLEINE()); return }
    setBusy(true); setError('')

    // Flash : torche réelle si dispo (Android), sinon flash écran pour les selfies (caméra avant)
    let torchUsed = false
    if (flashOn) {
      torchUsed = await applyTorch(true)
      if (torchUsed) await new Promise((r) => setTimeout(r, 180)) // laisse la torche éclairer
    }
    const useScreenFlash = flashOn && !torchUsed && facingMode === 'user'
    if (useScreenFlash) { setScreenFlash(true); await new Promise((r) => setTimeout(r, 280)) } // éclaire le visage

    playShutter()
    setShutterFx(true); setTimeout(() => setShutterFx(false), 240)
    if (flashOn && !useScreenFlash) { setFlashFx(true); setTimeout(() => setFlashFx(false), 420) }

    try { await proposer(await compressToBlob(videoRef.current)) }
    catch (err) { setError(err.message || 'Erreur.') }
    finally {
      setBusy(false)
      if (useScreenFlash) setScreenFlash(false)
      if (torchUsed) applyTorch(false)
    }
  }

  // Demande +5 photos gratuites (quand la pellicule est pleine)
  async function grantBonus() {
    if (!guest) return
    setError('')
    try {
      const res = await envoyer('/api/guest/bonus', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, guestId: guest.guestId, deviceToken: getDeviceToken() }),
      }, 'Connexion perdue pendant la recharge. Vérifie ta connexion et réessaie.')
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      if (typeof d.shotsPerGuest === 'number') setGuest((g) => (g ? { ...g, shotsPerGuest: d.shotsPerGuest } : g))
      setBonusUsed(true)
      // Recharger sa pellicule, c'est vouloir photographier : on rend la main à
      // l'appareil au lieu de laisser un deuxième bouton à trouver.
      setShowAlbum(false)
    } catch (err) { setError(err.message || 'Erreur.') }
  }

  // Le déclencheur de secours ouvre l'appareil photo du téléphone. Dans le
  // mini-navigateur d'une appli de scan de QR code, il n'ouvre rien du tout :
  // ni refus, ni message, rien. On le repère à ce silence (l'écran n'a pas
  // bougé), et on propose alors de repasser par un vrai navigateur.
  function ouvrirAppareilPhoto() {
    const champ = fileInputRef.current
    if (!champ) return
    let parti = false
    const vuPartir = () => { parti = true }
    window.addEventListener('blur', vuPartir)
    document.addEventListener('visibilitychange', vuPartir)
    champ.click()
    setTimeout(() => {
      window.removeEventListener('blur', vuPartir)
      document.removeEventListener('visibilitychange', vuPartir)
      if (!parti && androidInApp) setDeclencheurMuet(true)
    }, 1600)
  }

  // Rouvre la page dans Chrome. Tous les mini-navigateurs ne savent pas
  // répondre à cette demande : on la lance dans un cadre invisible, pour ne
  // pas remplacer la page par une erreur en cas d'échec. Si rien ne bouge, on
  // bascule sur la copie du lien, qui marche partout.
  function basculerVersChrome() {
    const cible = lienChrome(monLien)
    if (!cible) { setChromeRate(true); return }
    try {
      const cadre = document.createElement('iframe')
      cadre.style.display = 'none'
      cadre.src = cible
      document.body.appendChild(cadre)
      setTimeout(() => { try { cadre.remove() } catch {} }, 1500)
    } catch { setChromeRate(true) }
    setTimeout(() => { if (!document.hidden) setChromeRate(true) }, 1700)
  }

  // Copie du lien : dernier recours, à coller dans Chrome à la main. Le lien
  // personnel, comme juste au-dessus : on arrive dans Chrome en étant reconnu.
  // Se déconnecter de cette soirée. On avertit avant, parce que la conséquence
  // n'est pas devinable : sans le lien personnel, revenir signifie repartir sous
  // une nouvelle fiche, avec une pellicule neuve, et les photos déjà prises ne
  // seront plus reconnues comme les siennes.
  function seDeconnecter() {
    // Deux avertissements très différents, selon qu'une adresse a été laissée ou
    // non. Avec elle, revenir est trivial : l'API rattache la fiche existante au
    // nouvel appareil (voir rattacherParMail). Sans elle, il ne reste que le
    // lien personnel, et sans lui c'est une pellicule neuve. Dire la même chose
    // aux deux, c'est effrayer ceux qui ne risquent rien.
    const monMail = (getGuest(id)?.email || '').trim()
    const ok = window.confirm(
      'Vous déconnecter de cette soirée ?\n\n'
        + 'Vos photos restent dans l’album, elles ne sont pas supprimées.\n\n'
        + (monMail
          ? `Pour revenir, indiquez la même adresse (${monMail}) : vous retrouverez vos photos `
            + 'et vos poses restantes.'
          : 'Vous n’avez pas laissé d’adresse mail : sans votre lien personnel, '
            + 'vous repartirez avec une pellicule neuve.')
    )
    if (!ok) return
    forgetGuest(id)
    setShowProfil(false)
    setShowAlbum(false)
    setGuest(null)
    setName('')
    setPhase('cover')
  }

  function copierMonLien() {
    const fait = () => { setQrCopied(true); setTimeout(() => setQrCopied(false), 2200) }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(monLien).then(fait).catch(() => copieAncienne(monLien, fait))
    } else copieAncienne(monLien, fait)
  }
  function copieAncienne(texte, fait) {
    try {
      const zone = document.createElement('textarea')
      zone.value = texte
      zone.style.position = 'fixed'; zone.style.opacity = '0'
      document.body.appendChild(zone); zone.select()
      document.execCommand('copy'); zone.remove(); fait()
    } catch { setError('Copie impossible. Note le lien : ' + texte) }
  }

  const boutonChrome = {
    display: 'block', width: '100%', marginTop: 10, background: '#fff', color: '#1a1410',
    border: 'none', borderRadius: 999, padding: '11px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  }

  async function onFilePicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    fireShutterFeedback()
    try { await proposer(await prepareUpload(file)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  // Import depuis la galerie (compte dans le solde, comme une photo prise)
  async function onGalleryPicked(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (full) { setError(suppressionOuverte ? 'Pellicule pleine : supprime une photo pour en importer une.' : PLEINE()); return }
    setBusy(true); setError('')
    try { await proposer(await prepareUpload(file)) }
    catch (err) { setError(err.message || 'Erreur.') } finally { setBusy(false) }
  }

  async function removePhoto() {
    if (!viewer || deleting) return
    setDeleting(true); setError('')
    try {
      const res = await envoyer('/api/photo/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: viewer.id, deviceToken: getDeviceToken() }),
      }, 'Connexion perdue pendant la suppression. Vérifie ta connexion et réessaie.')
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      setViewer(null)
      await loadMyPhotos()
    } catch (err) { setError(err.message || 'Suppression impossible.') } finally { setDeleting(false) }
  }

  const remaining = guest ? guest.shotsPerGuest - guest.shotsTaken : 0
  const full = remaining <= 0
  const coupleLabel = meta?.hostNames || meta?.name || ''

  // ---------- Écrans ----------
  if (phase === 'loading') return <main className="center-screen"><p className="muted">Chargement…</p></main>
  if (phase === 'error') return <main className="screen screen-cream center"><div className="card">{error || 'Événement introuvable.'}</div></main>

  if (phase === 'cover') return (
    <main className="screen screen-cream">
      {/* Même bascule que sur le tableau de bord, inversée : l'organisateur qui
          vient prendre ses photos doit pouvoir repartir aussi simplement. */}
      {meta?.isOwner && (
        <nav className="db-modes" aria-label="Mode">
          <Link href={`/event/${id}`}>Organisation</Link>
          <span className="on">Mon appareil 📷</span>
        </nav>
      )}
      <div className="cover" style={meta?.coverUrl ? undefined : { background: COVER_GRAD }}>
        {meta?.coverUrl ? (
          <img src={meta.coverUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: meta.coverPos || '50% 50%' }} />
        ) : (
          <>
            <div className="gloss" />
            <div className="top">ÉVÉNEMENT PRIVÉ</div>
          </>
        )}
      </div>
      {/* Formulation neutre : « Mariage de X & Y vous invitent » sonnait faux
          dès que le nom n'était pas celui d'une personne. */}
      <h3 className="h3" style={{ margin: '22px 0 8px' }}>Participez à l'événement {coupleLabel}</h3>
      <p className="lead small" style={{ marginBottom: 16 }}>
        Prenez <strong>{meta?.shotsPerGuest} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{meta && formatReveal(meta.revealAt)}</strong>.
      </p>
      <div className="spacer" />
      {/* Quand on sait déjà qui c'est (l'organisateur, ou quelqu'un dont le
          serveur connaît le nom), on ne redemande pas ce qu'on a sous la main.
          Le nom reste modifiable juste en dessous. */}
      {name.trim() ? (
        <>
          <button className="btn btn-accent" onClick={() => join(name.trim(), email)}>
            Continuer en tant que {name.trim()} →
          </button>
          <button type="button" className="linklike" onClick={() => setPhase('name')}
            style={{ marginTop: 12, fontSize: 13.5 }}>
            Ce n'est pas vous ?
          </button>
        </>
      ) : (
        <button className="btn btn-accent" onClick={() => setPhase('name')}>Participer à l'album collectif →</button>
      )}
      <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
    </main>
  )

  // Formule complète : la seule porte fermée du site. On ne dit jamais que
  // c'est une histoire d'argent : le participant n'y est pour rien et n'a rien à
  // régler. On lui promet que ça s'ouvrira tout seul, et on tient la promesse
  // (relance toutes les 10 s). Et on lui laisse la sortie de secours : celui
  // qui revient d'un autre téléphone n'a pas à attendre pour rien.
  if (phase === 'attente') return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <h3 className="h3" style={{ marginBottom: 8 }}>Presque !</h3>
        <p className="lead small" style={{ marginBottom: 18 }}>
          L&apos;organisateur de {attente?.eventName ? `« ${attente.eventName} »` : 'l’événement'} finalise
          votre accès. <strong>Cette page s&apos;ouvrira toute seule</strong> : gardez-la ouverte, il
          n&apos;y a rien à faire.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 54, height: 54 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(0,0,0,.08)' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--accent)', animation: 'dc-spin 1.2s linear infinite' }} />
          </div>
        </div>
        <details style={{ textAlign: 'left', borderTop: '1px solid rgba(34,26,18,.1)', paddingTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text3)' }}>
            J&apos;ai déjà participé depuis un autre téléphone
          </summary>
          <p className="lead small" style={{ margin: '10px 0', color: 'var(--text3)' }}>
            Indiquez l&apos;adresse mail que vous aviez laissée : vous retrouverez votre place et vos
            photos, sans attendre.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); const v = mailRetour.trim().toLowerCase(); if (v) join(name || 'Participant', v) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <input type="email" inputMode="email" autoComplete="email" autoCapitalize="off"
              autoCorrect="off" spellCheck="false" placeholder="vous@exemple.fr"
              value={mailRetour} onChange={(e) => setMailRetour(e.target.value)} maxLength={160} />
            <button className="btn btn-dark" type="submit" disabled={busy || !mailRetour.trim()}>
              {busy ? 'Un instant…' : 'Retrouver ma place'}
            </button>
          </form>
        </details>
      </div>
    </main>
  )

  if (phase === 'name') return (
    <main className="screen screen-cream">
      {/* Même bascule que sur le tableau de bord, inversée : l'organisateur qui
          vient prendre ses photos doit pouvoir repartir aussi simplement. */}
      {meta?.isOwner && (
        <nav className="db-modes" aria-label="Mode">
          <Link href={`/event/${id}`}>Organisation</Link>
          <span className="on">Mon appareil 📷</span>
        </nav>
      )}
      <button onClick={() => setPhase('cover')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 30, padding: 0 }}>‹ retour</button>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Étape 1 / 1</div>
      <h3 className="h3" style={{ marginBottom: 10 }}>Comment vous<br />appelez-vous ?</h3>
      <p className="lead small" style={{ marginBottom: 26 }}>Pour qu'on sache qui a pris quelle photo dans la galerie finale.</p>
      <form onSubmit={soumettreArrivee}>
        <div className="input-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <input type="text" placeholder="Votre prénom" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </div>

        {/* L'intitulé porte la raison, pas la catégorie. « Votre adresse mail »
            flanqué d'une étiquette « facultatif » se lisait comme une invitation
            à passer, et ceux qui passaient ne revenaient jamais voir l'album. */}
        <div style={{ margin: '20px 2px 8px' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Pour recevoir les photos quand l&apos;album s&apos;ouvre</span>
        </div>
        <div className="input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="off"
            autoCorrect="off" spellCheck="false" placeholder="vous@exemple.fr" value={email} ref={mailRef}
            onChange={(e) => { setEmail(e.target.value); setMailCheck(null); setConfirmSansMail(false) }}
            onBlur={(e) => verifierMail(e.target.value)} maxLength={160} />
        </div>

        {/* Filets de sécurité : on corrige et on prévient, on ne bloque jamais. */}
        {mailCheck?.status === 'suggestion' && (
          <div className="mail-tip">
            Vous vouliez dire{' '}
            <button type="button" onClick={accepterSuggestion}>{mailCheck.suggestion}</button> ?
          </div>
        )}
        {(mailCheck?.status === 'invalide' || mailCheck?.status === 'domaine-inconnu') && (
          <div className="mail-tip mail-tip-warn">⚠️ {mailCheck.reason}</div>
        )}
        {mailCheck?.status === 'ok' && (
          <div className="mail-tip mail-tip-ok">✓ Adresse vérifiée</div>
        )}

        <p className="lead small" style={{ margin: '10px 2px 0', color: 'var(--text3)' }}>
          ✉️ Rien d'autre, jamais : ni publicité, ni transmission à qui que ce soit.
          Elle disparaît avec l'événement.
        </p>
        {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
        {confirmSansMail ? (
          <div className="mail-stop">
            <strong>Continuer sans adresse ?</strong>
            <span>
              Vous ne serez pas prévenu quand les photos arrivent, et vous ne pourrez plus
              les retrouver depuis un autre téléphone.
            </span>
            <button type="button" className="btn btn-dark" style={{ marginTop: 12 }}
              onClick={() => { setConfirmSansMail(false); mailRef.current?.focus() }}>
              Ajouter mon adresse
            </button>
            <button type="button" className="linklike" style={{ marginTop: 10, fontSize: 13.5 }}
              onClick={() => join(name.trim(), '')} disabled={busy}>
              {busy ? 'Un instant…' : 'Continuer sans'}
            </button>
          </div>
        ) : (
          <button className="btn btn-dark" type="submit" disabled={busy || !name.trim()} style={{ marginTop: 20 }}>
            {busy ? 'Un instant…' : "Ouvrir l'appareil →"}
          </button>
        )}
      </form>
    </main>
  )

  // CAMERA
  const roll = [...pending.map((p) => ({ ...p, pending: true })), ...myPhotos]
  const frameNo = String(Math.min((guest?.shotsTaken || 0) + (full ? 0 : 1), guest?.shotsPerGuest || 0)).padStart(2, '0')

  return (
    <main className="screen screen-dark force-portrait">
      {/* L'organisateur qui photographie doit pouvoir repartir d'ici même :
          la barre du haut est pleine, ce rappel se pose donc en dessous. */}
      {meta?.isOwner && (
        <Link href={`/event/${id}`} className="album-orga">
          <span>Vous organisez cette soirée</span><b>Tableau de bord →</b>
        </Link>
      )}
      {/* La flèche de retour menait à l'écran « participer à l'événement », qui
          n'a plus rien à dire une fois qu'on a accepté. Elle devient la porte de
          l'album, et elle porte le seul chiffre du groupe : à l'opposé exact du
          compteur de vues, resté en bas à gauche, pour qu'on ne les confonde
          jamais. */}
      <div className="cam-top">
        <button className="album-navbtn" onClick={() => setShowAlbum(true)} aria-label="Voir l'album du groupe">
          <span className="ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
            {(meta?.photoCount || 0) > 0 && <b className="n">{meta.photoCount}</b>}
          </span>
          <em>Album</em>
        </button>
        <div className="cam-titlebar">
          <div className="nm">{coupleLabel}</div>
          <div className="sub">{countdownToReveal(meta?.revealAt, now)}</div>
        </div>
        <button className="album-navbtn" onClick={() => setShowQR(true)} aria-label="Inviter un proche (QR code)">
          <span className="ic">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM21 14v7M14 21h7" />
            </svg>
          </span>
          <em>Inviter</em>
        </button>
      </div>

      <div className="viewfinder">
        {liveCam
          ? <video ref={videoRef} playsInline muted autoPlay style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined} />
          : <div className="vf-anim" />}
        <div className="vignette" />
        <div className="vf-label">FLASH&nbsp;400</div>
        <div className="vf-frame">№ {frameNo}</div>
        <div className="vf-corner tl" /><div className="vf-corner tr" /><div className="vf-corner bl" /><div className="vf-corner br" />
        <div className="vf-reticle"><div /></div>
        {shutterFx && <div className="cam-shutter-fx" />}
        {flashFx && <div className="cam-flash" />}

        {/* Le message part dans la feuille de style : téléphone couché, il se
            redresse pour rester lisible sans avoir à tourner l'appareil. */}
        {camBlocked && (
          <div className="vf-bloque">
            <div className="vf-bloque-in">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l22 22" /><path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m4-3h4l2 3h4a2 2 0 012 2v9.34m-7.72-2.06a4 4 0 11-5.56-5.56" />
              </svg>
              <p>{camDenied ? 'Ta caméra est bloquée' : "Vous n'avez pas autorisé votre caméra"}</p>
              {camDenied
                ? <p className="vf-bloque-sub">La marche à suivre est juste en dessous 👇</p>
                : <button onClick={retryCamera}>Autoriser ma caméra</button>}
            </div>
          </div>
        )}

        {full && !camBlocked && (
          <div className="vf-full">
            <div className="vf-full-icon">🎞️</div>
            <p className="vf-full-title">Pellicule pleine !</p>
            <p className="vf-full-sub">
              {bonusUsed
                ? `Tes ${guest?.shotsPerGuest} photos sont en cours de développement. Rendez-vous à la révélation 🎉`
                : `Tes ${guest?.shotsPerGuest} photos sont en cours de développement.`}
            </p>
            {/* La recharge est réglée par l'organisateur : à zéro, on ne la
                propose pas : la pellicule est vraiment finie. */}
            {!bonusUsed && (meta?.bonusShots > 0) && (
              <button className="vf-full-btn" onClick={grantBonus}>
                Recharger ma pellicule (+{meta.bonusShots}) →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ouvert depuis une messagerie, sans caméra en direct : la plupart des
          participants arrivent ainsi. Sur iPhone, le bouton marche quand même :
          on se contente de le dire. */}
      {inApp && !androidInApp && !liveCam && !camBlocked && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)' }}>
          📸 Touche le déclencheur : l’appareil photo de ton téléphone s’ouvre, et ta photo rejoint l’album.
        </div>
      )}

      {/* Android + mini-navigateur (le cas des applis de scan de QR code) :
          ni la caméra, ni le déclencheur de secours ne répondent. Inutile de
          rassurer : il faut sortir de là. */}
      {androidInApp && !liveCam && !camBlocked && (
        <div className="notice" style={{ marginTop: 12, background: 'rgba(255,196,120,.14)', color: 'rgba(255,255,255,.92)', border: '1px solid rgba(255,196,120,.34)', textAlign: 'left' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
            {declencheurMuet ? 'Le déclencheur ne répond pas ici' : 'Ouvre la page dans ton navigateur'}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.5, opacity: .88 }}>
            Ton appli de scan affiche la page dans sa propre fenêtre, qui n’a pas le droit d’ouvrir l’appareil photo.
          </p>
          <button type="button" onClick={basculerVersChrome} style={boutonChrome}>
            Ouvrir dans Chrome →
          </button>
          {chromeRate && (
            <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.6, opacity: .85 }}>
              Ça n’a pas marché ? Copie le lien, ouvre Chrome, et colle-le dans la barre d’adresse.
              <button type="button" onClick={copierMonLien} style={{ ...boutonChrome, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.4)' }}>
                {qrCopied ? '✓ Lien copié' : 'Copier le lien'}
              </button>
              <span style={{ display: 'block', marginTop: 8, opacity: .8 }}>
                La prochaine fois, scanne le QR code avec l’appareil photo de ton téléphone : il ouvre le bon navigateur tout seul.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Refus enregistré par le navigateur : le mode d'emploi s'affiche en clair,
          sans rien à déplier. Refus passager : le bouton du viseur suffit, on
          garde la manipulation sous le coude pour ceux qu'il n'a pas dépannés. */}
      {camDenied && <CameraBloquee onReessayer={retryCamera} />}

      {camBlocked && !camDenied && (
        <details style={{ marginTop: 10, color: 'rgba(255,255,255,.6)', fontSize: 12.5 }}>
          <summary style={{ cursor: 'pointer' }}>Toujours bloquée après avoir cliqué ?</summary>
          <div style={{ marginTop: 8 }}>
            <CameraBloquee onReessayer={retryCamera} />
          </div>
        </details>
      )}
      {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}

      {/* Rangée de contrôles : flash (gauche) · retourner caméra (droite) */}
      <div className="cam-controls">
        <button className={`cam-flashchip ${flashOn ? 'on' : ''}`} onClick={() => setFlashOn((v) => !v)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" /></svg>
          {flashOn ? 'FLASH' : 'OFF'}
        </button>
        {liveCam && (
          <button className="cam-flipchip" onClick={flipCamera} disabled={busy} aria-label="Retourner la caméra">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>

      {/* Bas : la molette de vues (gauche) · déclencheur (centre) · le vide qui
          garde le déclencheur au centre optique (droite). Le compteur a quitté
          l'image : sur un vrai jetable, il est sur le boîtier, jamais dans le
          viseur, et il ne se dispute plus l'oeil avec le décor du cadre. */}
      <div className="cam-bottom">
        <div className="cam-vues">
          <div className="cam-fenetre" role="img"
            aria-label={`${Math.max(0, remaining)} photos restantes sur ${guest?.shotsPerGuest}`}>
            {/* La bande porte tous les chiffres et se décale d'un cran à chaque
                déclic : on voit celui qu'on vient de brûler partir vers le haut. */}
            <div className="cam-roue">
              <div className="cam-roue-bande" style={{ transform: `translateY(${CRAN_OFFSET - CRAN * (guest?.shotsTaken || 0)}px)` }}>
                {Array.from({ length: (guest?.shotsPerGuest || 0) + 1 }, (_, i) => (
                  <span key={i}>{String(Math.max(0, (guest?.shotsPerGuest || 0) - i)).padStart(2, '0')}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {liveCam ? (
            <button className="shutter" onClick={snap} disabled={busy || full} aria-label="Déclencher"><span /></button>
          ) : (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} style={{ display: 'none' }} />
              <button className="shutter" disabled={busy || full} onClick={ouvrirAppareilPhoto} aria-label="Prendre une photo"><span /></button>
            </>
          )}
        </div>
        <div className="cam-vues" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      </div>

      {/* L'import depuis la photothèque n'existe que dans l'album ouvert. En
          vrai jetable, verser une image prise ailleurs, retouchée, ou trouvée
          sur Internet, contredit toute la promesse : la pellicule ne contient
          que ce que cet appareil a déclenché ce soir-là. */}
      {importAutorise && (
        <>
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={onGalleryPicked} style={{ display: 'none' }} />
          <button className="cam-import" onClick={() => galleryInputRef.current?.click()} disabled={busy || full}>
            🖼️ Importer une photo de ma galerie
          </button>
        </>
      )}


      {screenFlash && <div className="screen-flash" />}

      {/* ============================================================
          L'album : l'écran d'attente de la soirée. La couverture est posée
          dans un cadre, jamais étirée, et le fond est tiré d'elle-même. Une
          seule règle pour toutes les images, y compris celles qui n'en sont
          pas (un logo, une photo couchée), et une carte dessinée quand il n'y
          a pas de couverture du tout.
          ============================================================ */}
      {showAlbum && (
        <div className="album-screen">
          {meta?.coverUrl
            ? <div className="album-fond" style={{ backgroundImage: `url(${meta.coverUrl})` }} />
            : <div className="album-fond album-fond-motif" />}
          <div className="album-voile" />

          <div className="album-corps">
            {meta?.isOwner && (
              <Link href={`/event/${id}`} className="album-orga">
                <span>Vous organisez cette soirée</span><b>Tableau de bord →</b>
              </Link>
            )}

            {/* À gauche l'appareil, à droite ce qui touche à soi et aux autres.
                Le retour au viseur est le geste le plus fréquent depuis cet
                écran : il mérite le coin que le pouce atteint sans réfléchir,
                et il prend la place où le bouton retour se trouve partout
                ailleurs. Après la révélation il n'y a plus d'appareil à
                rouvrir, la place reste vide. */}
            <div className="album-nav">
              {!meta?.revealed ? (
                <button className="album-navbtn" onClick={() => setShowAlbum(false)}>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  </span>
                  <em>Appareil</em>
                </button>
              ) : <span />}
              <span className="album-navspace" />
              <div className="album-navduo">
                <button className="album-navbtn" onClick={() => setShowProfil(true)}>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
                  </span>
                  <em>Profil</em>
                </button>
                <button className="album-navbtn" onClick={() => setShowQR(true)}>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM21 14v7M14 21h7" /></svg>
                  </span>
                  <em>Inviter</em>
                </button>
              </div>
            </div>

            {meta?.coverUrl ? (
              <div className="album-cadre"><img src={meta.coverUrl} alt="" /></div>
            ) : (
              // Pas de couverture : on ne bricole pas avec du flou, on dessine.
              // Les initiales de la soirée et sa date, sur un carton à nos
              // couleurs, valent mieux qu'un rectangle vide.
              <div className="album-cadre album-carte">
                <span className="perf" /><span className="perf bas" />
                <span className="obturateur" />
                <span className="ini">{initialesDe(coupleLabel)}</span>
                <span className="jour">{formatCourt(meta?.startsAt)}</span>
              </div>
            )}

            <div className="album-bloc">
              <div className="album-date">{formatLong(meta?.startsAt)}</div>
              <h2 className="album-name">{coupleLabel}</h2>

              {(() => {
                const cd = breakdownToReveal(meta?.revealAt, now)
                if (cd.done) return <div className="album-revele">🎉 L&apos;album est révélé</div>
                return (
                  <div className="album-cd">
                    <span className="cd-label">Révélation dans</span>
                    <span className="cd-row">
                      <span className="cd-b"><b>{String(cd.d).padStart(2, '0')}</b><i>j</i></span>
                      <span className="cd-b"><b>{String(cd.h).padStart(2, '0')}</b><i>h</i></span>
                      <span className="cd-b"><b>{String(cd.m).padStart(2, '0')}</b><i>min</i></span>
                      <span className="cd-b"><b>{String(cd.s).padStart(2, '0')}</b><i>sec</i></span>
                    </span>
                  </div>
                )
              })()}

              {meta?.revealed ? (
                <a className="album-cta" href={`/g/${id}`}>
                  <span className="ring" /> Voir l&apos;album complet
                </a>
              ) : full ? (
                // Le même bloc que sur le viseur, au mot près : c'est un seul
                // objet, il n'a pas à se raconter de deux façons.
                <div className="pellicule-pleine">
                  <div className="em">🎞️</div>
                  <h5>Pellicule pleine !</h5>
                  <p>Tes {guest?.shotsPerGuest} photos sont en cours de développement.</p>
                  {!bonusUsed && (meta?.bonusShots > 0) && (
                    <button onClick={grantBonus}>Recharger ma pellicule (+{meta.bonusShots}) →</button>
                  )}
                </div>
              ) : (
                <button className="album-cta" onClick={() => setShowAlbum(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Prendre une photo
                </button>
              )}
            </div>

            {/* ============================================================
                Un seul bloc, deux onglets. Avant, trois mécanismes parlaient
                des mêmes photos : le mur du groupe, une section « Mes photos »
                tout en bas, et un filtre qui basculait entre les deux. On
                devait descendre pour éditer ses photos alors que le haut de
                l'écran parlait déjà de photos, et un bouton qui bascule ne dit
                jamais s'il désigne l'état actuel ou celui qu'on va obtenir.

                Deux onglets côte à côte montrent les deux états en même temps,
                et l'on arrive sur les siennes : c'est ce qu'on vient chercher
                juste après avoir déclenché.
                ============================================================ */}
            {!meta?.revealed && (
              <div className="album-mur">
                <div className="album-onglets" role="tablist">
                  <button className={`album-onglet ${ongletMoi ? 'actif' : ''}`}
                    role="tab" aria-selected={ongletMoi}
                    onClick={() => { setOngletMoi(true); setMurN(12) }}>
                    <b>Mes photos</b>
                    <em>{guest?.shotsTaken ?? myPhotos.length} / {guest?.shotsPerGuest ?? 0}</em>
                  </button>
                  <button className={`album-onglet ${ongletMoi ? '' : 'actif'}`}
                    role="tab" aria-selected={!ongletMoi}
                    onClick={() => { setOngletMoi(false); setMurN(12) }}>
                    <b>Toutes les photos</b>
                    <em>{meta?.photoCount ?? 0} photo{(meta?.photoCount ?? 0) > 1 ? 's' : ''}</em>
                  </button>
                </div>

                {/* La légende était sous la grille : avec deux cents photos, il
                    fallait tout traverser pour la lire. Elle passe au-dessus, et
                    porte au passage le nombre de participants, qui avait disparu
                    en même temps que l'ancien bandeau du mur. */}
                {/* Le bandeau du mur, avec sa pastille qui bat : c'est lui qui
                    dit que la soirée est en train de se faire. Il avait disparu
                    avec l'ancien mur, et son compte de participants avec. */}
                {!ongletMoi && (
                  <div className="mur-lab">
                    <span className="pt" />
                    {meta?.photoCount ?? 0} photo{(meta?.photoCount ?? 0) > 1 ? 's' : ''}
                    {' · '}{meta?.guestCount ?? 1} participant{(meta?.guestCount || 0) > 1 ? 's' : ''}
                  </div>
                )}
                <p className="mur-note" style={{ margin: '0 0 12px' }}>
                  {ongletMoi
                    ? flouterMesPhotos
                      ? 'Scellées, comme un vrai jetable. Tu les découvriras à la révélation.'
                      : 'Tes photos, à toi seul, jusqu’à la révélation.'
                    : 'Floutées jusqu’à la révélation.'}
                </p>

                {/* Ses propres photos, en clair, quand l'organisateur l'a permis.
                    On les ouvre, on en supprime une ratée, on les télécharge,
                    sans descendre nulle part. */}
                {ongletMoi && !flouterMesPhotos ? (
                  roll.length === 0 ? (
                    <div className="album-vierge">
                      <div className="em">🎞️</div>
                      <h5>Tu n&apos;as pas encore déclenché</h5>
                      <p>Ta première photo t&apos;attend.</p>
                    </div>
                  ) : (<>
                    <div className="album-grid">
                      {roll.map((p, i) => (
                        <button key={p.tempId || p.id || i} className={`album-thumb ${p.pending ? 'pending' : ''}`}
                          onClick={() => { if (!p.pending && p.id) setViewer({ id: p.id, url: p.url }) }}
                          aria-label="Voir la photo">
                          {/* crossOrigin : sans lui, la photo mise en cache par cette
                              vignette ne peut plus être relue pour le zip. */}
                          <img src={p.url} alt="" loading="lazy" crossOrigin="anonymous" />
                        </button>
                      ))}
                    </div>
                    <button className="mur-plus" onClick={downloadMine} disabled={downloading || !myPhotos.length}>
                      {downloading ? 'Préparation…' : 'Télécharger mes photos'}
                    </button>
                  </>)
                ) : mur.length === 0 ? (
                  // Deux vides, et jamais un mot sur les autres dans l'onglet
                  // « Mes photos » : dire « les autres ont déjà déclenché »
                  // quand la soirée entière est vide serait faux.
                  <div className="album-vierge">
                    <div className="em">🎞️</div>
                    {ongletMoi ? (
                      <>
                        <h5>Tu n&apos;as pas encore déclenché</h5>
                        <p>Ta première photo t&apos;attend.</p>
                      </>
                    ) : (
                      <>
                        <h5>La pellicule est vierge</h5>
                        <p>Personne n&apos;a encore déclenché. La première photo de la soirée est à toi.</p>
                      </>
                    )}
                  </div>
                ) : (<>
                  <div className="mur-grid">
                    {mur.map((p) => (
                      <div className={`mur-thumb${p.moi ? ' moi' : ''}`} key={p.id}>
                        <img src={p.url} alt="" loading="lazy" draggable="false" />
                        {p.qui && !ongletMoi && <span className="mur-qui">{p.moi ? 'Toi' : p.qui}</span>}
                      </div>
                    ))}
                  </div>
                  {murTotal > mur.length && (
                    <button className="mur-plus" onClick={() => setMurN((n) => n + 12)}>
                      Voir plus de photos ({murTotal - mur.length})
                    </button>
                  )}
                </>)}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Le profil du participant : son prénom, son lien pour revenir, et les
          rappels. Trois choses rares, mais qui n'avaient nulle part où vivre. */}
      {showProfil && (
        <div className="modal-fond" onClick={() => setShowProfil(false)}>
          <div className="modal-carte" onClick={(e) => e.stopPropagation()}>
            <div className="modal-titre">Mon profil</div>
            <p className="modal-nom">{name || guest?.displayName || 'Participant'}</p>
            <p className="modal-sous">Vos photos partent sous ce prénom.</p>
            <button className="modal-btn" onClick={copierMonLien}>
              🔗 Copier mon lien pour revenir
            </button>
            <a className="modal-btn" href="/mes-photos">📷 Retrouver mes photos</a>
            {/* Se déconnecter : rendre le téléphone à quelqu'un d'autre, ou
                repartir sous un autre prénom. La confirmation dit ce qu'on perd
                vraiment, ni plus ni moins : les photos restent dans l'album,
                c'est l'accès depuis CE téléphone qui s'en va. */}
            <button className="modal-btn modal-btn-sortie" onClick={seDeconnecter}>
              🚪 Me déconnecter de cette soirée
            </button>
            <button className="modal-btn modal-btn-clair" onClick={() => setShowProfil(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* Pop-up "Inviter un proche" */}
      {showQR && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setShowQR(false) }} style={{ background: 'rgba(10,8,6,.7)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <button onClick={() => setShowQR(false)} aria-label="Fermer"
              style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,26,18,.08)', border: 'none', color: 'var(--ink)', fontSize: 19, cursor: 'pointer', lineHeight: 1 }}>×</button>
            <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 4 }}>Inviter un proche · garder mon lien</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 18px', color: '#1a1410' }}>Scannez ou partagez</h3>
            <div style={{ background: '#FCF8F0', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'center' }}>
              {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" style={{ display: 'block', width: '100%', maxWidth: 210, height: 'auto' }} />
                     : <div style={{ width: 210, height: 210 }} />}
            </div>
            <div style={{ background: 'rgba(34,26,18,.05)', borderRadius: 12, padding: '11px 13px', margin: '14px 0 12px', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text2)', wordBreak: 'break-all', textAlign: 'center' }}>{joinUrl}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={smsMyLink}>📲 M'envoyer le lien par SMS</button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
                <strong>Strictement personnel</strong> : ce lien rouvre votre appareil et vos photos.
                Pour inviter quelqu'un, montrez le QR code ou utilisez « Partager ».
              </p>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
                Au tarif d'un SMS classique vers un numéro non surtaxé, généralement inclus dans votre forfait.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyJoinLink}>{qrCopied ? '✓ Copié' : 'Copier le lien'}</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={shareMyLink}>Partager</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rappel "garde ton lien pour revenir", affiché une seule fois à la 1re ouverture caméra */}
      {showSaveTip && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setShowSaveTip(false) }} style={{ background: 'rgba(10,8,6,.72)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <div style={{ textAlign: 'center', fontSize: 34, marginBottom: 8 }}>📲</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 8px', color: '#1a1410' }}>Gardez votre lien pour revenir</h3>
            <p className="muted small" style={{ textAlign: 'center', margin: '0 0 18px' }}>
              Vous pourrez rouvrir votre appareil et finir vos {guest?.shotsPerGuest} photos quand vous voulez. Envoyez-vous le lien pour le retrouver facilement.
            </p>
            {/* Une seule proposition, et une seule sortie. Copier le lien et le
                partager vivent déjà derrière le bouton QR code, l'agenda faisait
                doublon avec les mails : les empiler ici noyait la sortie, qui
                n'était qu'un texte gris et ne se voyait pas comme un bouton. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={smsMyLink}>📲 M'envoyer le lien par SMS</button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 0' }}>
                <strong>Strictement personnel</strong> : ce lien rouvre votre appareil et vos photos. Ne le transmettez pas.
              </p>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text3)', margin: '2px 0 6px' }}>
                Au tarif d'un SMS classique vers un numéro non surtaxé, généralement inclus dans votre forfait.
              </p>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowSaveTip(false)}>
                Commencer à photographier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Les notifications de soirée. Posée une seule fois, après la première
          photo. Pas de fermeture au clic sur le fond : deux boutons, deux
          réponses, et la question ne revient plus. */}
      {showPushTip && (
        <div className="viewer" style={{ background: 'rgba(10,8,6,.72)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340, background: '#F4EDDD', borderRadius: 22, padding: '26px 22px', boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
            <div style={{ textAlign: 'center', fontSize: 34, marginBottom: 8 }}>🔔</div>
            <h3 className="h3" style={{ textAlign: 'center', margin: '0 0 8px', color: '#1a1410' }}>Vous prévenir s'il vous reste des photos ?</h3>
            <p className="muted small" style={{ textAlign: 'center', margin: '0 0 18px' }}>
              Un ou deux rappels pendant la soirée, puis le lien de l'album dès qu'il s'ouvre. Rien d'autre, et vous pouvez couper à tout moment depuis votre navigateur.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" style={{ width: '100%' }} onClick={accepterNotifications} disabled={pushBusy}>
                {pushBusy ? 'Un instant…' : 'Oui, me prévenir'}
              </button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setShowPushTip(false)} disabled={pushBusy}>
                Non merci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Le seul regard autorisé en mode « Une seule chance » : le cliché
          s'affiche une fois, à l'instant du déclic. On le garde, ou on le
          reprend, et alors il n'aura jamais existé (le compteur ne bouge qu'à
          l'envoi). Pas de fermeture au clic sur le fond : laisser sortir sans
          choisir perdrait la photo sans le dire. */}
      {aConfirmer && (
        <div className="viewer">
          <img src={aConfirmer.url} alt="Le cliché que vous venez de prendre" />
          {/* Une micro-légende sous chaque bouton, plutôt qu'une phrase qui les
              explique tous les deux : à l'instant du déclic on lit trois mots,
              et une correspondance à faire entre une phrase et deux boutons ne
              se fait pas dans une fête. Chacune dit ce que son bouton coûte ou
              promet, et la seule information qui manquait vraiment est celle de
              gauche : reprendre ne décompte rien. */}
          <div className="viewer-actions">
            <div className="confirm-choix">
              <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
                onClick={reprendreLeCliche} disabled={busy}>
                Reprendre
              </button>
              <span className="confirm-note">ne coûte aucune photo</span>
            </div>
            <div className="confirm-choix">
              <button className="btn btn-accent" onClick={garderLeCliche} disabled={busy}>
                Garder
              </button>
              <span className="confirm-note">visible à la révélation</span>
            </div>
          </div>
        </div>
      )}

      {/* Visionneuse photo */}
      {viewer && (
        <div className="viewer" onClick={(e) => { if (e.target === e.currentTarget) setViewer(null) }}>
          <button className="viewer-close" onClick={() => setViewer(null)} aria-label="Fermer">×</button>
          <img src={viewer.url} alt="Ta photo" crossOrigin="anonymous" />
          {error && <div className="err" style={{ marginTop: 14, maxWidth: 360, width: '100%' }}>{error}</div>}
          <div className="viewer-actions">
            <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => setViewer(null)}>Garder</button>
            <button className="btn btn-danger" onClick={removePhoto} disabled={deleting}>{deleting ? 'Suppression…' : 'Supprimer'}</button>
          </div>
        </div>
      )}
    </main>
  )
}
