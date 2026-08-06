'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import JSZip from 'jszip'
import { BRAND } from '../../../lib/brand'
import { getOwnerToken, getGuest, getDeviceToken } from '../../../lib/device'
import { PELLICULES, PELLICULE_DEFAUT, pelliculeParId, cssTeinte, tamponDate, cuirePhoto } from '../../../lib/film'
import WrapInvite, { wrapDejaVu, oublierWrap } from '../../../components/WrapInvite'
import Avis from '../../../components/Avis'
import { ACCROCHE } from '../../../lib/avis'

// Au-delà, la rangée de pastilles devient illisible et l'on passe à la recherche.
const SEUIL_AUTEURS = 8

const TEASER_GRADS = [
  'linear-gradient(150deg,#F7C26B,#EE7A45,#A23D5C)',
  'linear-gradient(160deg,#2B2540,#6E466C,#D08193)',
  'linear-gradient(150deg,#86C0C9,#D58FA6,#F4C152)',
  'linear-gradient(140deg,#3D5A6C,#86C0C9,#F7C26B)',
  'linear-gradient(160deg,#9B5A6E,#C25540,#E89A4B)',
  'linear-gradient(150deg,#6E466C,#A23D5C,#EE7A45)',
]

function formatReveal(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
// Jour en toutes lettres, ex : « 3 février 2027 »
function formatJour(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return '' }
}
function formatTime(iso) {
  try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
// Date courte + heure, ex : « 12 juin · 14:32 »
function formatStamp(iso) {
  try {
    const d = new Date(iso)
    const jour = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    return `${jour} · ${formatTime(iso)}`
  } catch { return formatTime(iso) }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    done: diff === 0,
  }
}

function PreReveal({ data, onDone }) {
  const cd = useCountdown(data.revealAt)

  // `pending` : l'heure est passée mais l'album attend encore l'organisateur.
  // Surtout ne pas recharger sur la fin du compte à rebours — il est déjà à zéro,
  // on bouclerait sans fin. On revient voir tranquillement toutes les 30 s.
  const pending = !!data.pending
  useEffect(() => {
    if (pending || !cd.done) return
    onDone?.()
  }, [pending, cd.done, onDone])
  useEffect(() => {
    if (!pending) return
    const t = setInterval(() => onDone?.(), 30000)
    return () => clearInterval(t)
  }, [pending, onDone])

  if (pending) {
    return (
      <main className="screen screen-dark">
        <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>Événement · {data.hostNames || data.name}</div>
        <h3 className="h3" style={{ marginBottom: 22 }}>L'album arrive</h3>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
          <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,.12)' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)', animation: 'dc-spin 1.4s linear infinite' }} />
            <div style={{ width: 74, height: 74, borderRadius: 18, background: '#0d0f16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent)', background: 'radial-gradient(circle at 35% 30%,#3a3f52,#14161F)' }} />
            </div>
          </div>
        </div>
        <div className="spacer" />
        <div className="notice" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
          🎞️ Vos photos sont bien enregistrées. L'organisateur met la dernière main à l'album —
          cette page s'ouvrira toute seule.
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-dark">
      <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>Événement · {data.hostNames || data.name}</div>
      <h3 className="h3" style={{ marginBottom: 22 }}>Développement en cours…</h3>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,.12)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--accent)', animation: 'dc-spin 1.4s linear infinite' }} />
          <div style={{ width: 74, height: 74, borderRadius: 18, background: '#0d0f16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent)', background: 'radial-gradient(circle at 35% 30%,#3a3f52,#14161F)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 22, opacity: .55 }}>
        {TEASER_GRADS.map((g, i) => (
          <div key={i} style={{ aspectRatio: '1/1', borderRadius: 8, background: g, filter: 'blur(6px) brightness(.7)' }} />
        ))}
      </div>

      <div className="spacer" />
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 16 }}>
          {cd.d}j {cd.h}h {cd.m}m {cd.s}s · le {formatReveal(data.revealAt)}
        </div>
        <div className="notice" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
          🎞️ Les souvenirs s'ouvriront pour tout le monde d'un coup, à l'heure dite.
        </div>
      </div>
    </main>
  )
}

// Formule dépassée, vu par l'organisateur. Lui seul arrive ici : les invités
// gardent l'écran neutre. On dit la raison et on donne la sortie dans le même
// écran — un album verrouillé sans bouton pour le déverrouiller serait cruel.
function QuotaGate({ data, id }) {
  const q = data.quota || {}
  const prix = q.upgrade?.priceCents
    ? (q.upgrade.priceCents / 100).toFixed(2).replace('.', ',') + ' €'
    : null
  // Au plus grand palier, il n'y a plus de formule à acheter : le tarif se fait
  // à la main. Le bouton doit mener à nous, jamais vers un paiement qui n'existe
  // pas — sinon l'organisateur tourne en rond avec son album fermé.
  const surMesure = !q.upgrade?.maxGuests

  return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h3 className="h3" style={{ marginBottom: 6 }}>L&apos;album attend votre formule</h3>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Vous avez accueilli <strong>{q.guestCount}</strong> invités alors que votre formule
          en couvre <strong>{q.maxGuests}</strong>. Tout le monde a pu photographier normalement,
          rien n&apos;a été perdu — les photos vous attendent.
        </p>
        {surMesure ? (
          <a
            className="btn btn-accent"
            href={`mailto:${q.contactEmail || 'support@timetoflash.fr'}?subject=${encodeURIComponent(`Plus de ${q.maxGuests} invités — ${data.name || 'mon événement'}`)}`}
            style={{ display: 'block', marginBottom: 10 }}
          >
            Nous écrire pour ouvrir l&apos;album
          </a>
        ) : (
          <Link
            className="btn btn-accent"
            href={`/event/${id}`}
            style={{ display: 'block', marginBottom: 10 }}
          >
            Passer à {q.upgrade.maxGuests} invités{prix ? ` — ${prix}` : ''}
          </Link>
        )}
        <p className="muted" style={{ fontSize: 12 }}>
          {surMesure
            ? `Au-delà de ${q.maxGuests} invités, nous établissons un tarif sur mesure. Écrivez-nous, on ouvre l'accès dans la foulée.`
            : 'Vous ne réglez que la différence : ce que vous avez déjà payé reste acquis.'}
        </p>
      </div>
    </main>
  )
}

function CodeGate({ data, value, onChange, onSubmit, err }) {
  return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h3 className="h3" style={{ marginBottom: 6 }}>Album privé</h3>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Les souvenirs de {data.hostNames || data.name} sont protégés. Entrez le code communiqué par l'organisateur.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="text" placeholder="Code d'accès" value={value} onChange={(e) => onChange(e.target.value)} autoFocus
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: '.1em' }} />
          {err && <div className="err">{err}</div>}
          <button className="btn btn-accent" type="submit">Voir l'album</button>
        </form>
      </div>
    </main>
  )
}

// Enregistrer un fichier fabriqué dans le navigateur. Le lien doit être posé
// dans la page (Firefox ignore un clic sur un lien hors document), et l'adresse
// temporaire ne se libère qu'après coup : la libérer tout de suite interrompt
// l'enregistrement d'un gros fichier sur Safari.
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

export default function Gallery({ params }) {
  const { id } = use(params)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  // Plusieurs photographes à la fois : on veut souvent « les photos de la table
  // des copains », pas celles d'une seule personne. Vide = tout le monde.
  const [auteursChoisis, setAuteursChoisis] = useState(() => new Set())
  // La pellicule vaut pour l'écran comme pour le fichier emporté : ce que l'on
  // voit est ce que l'on enregistre.
  const [pelliculeId, setPelliculeId] = useState(PELLICULE_DEFAUT)
  const [avecDate, setAvecDate] = useState(false)
  const pelli = pelliculeParId(pelliculeId)
  const [zip, setZip] = useState(null) // null | {done, total}
  // Un téléchargement raté se dit à côté du bouton : le signaler comme une
  // erreur de page effaçait l'album entier, pour un zip manqué.
  const [zipErr, setZipErr] = useState('')
  // Choix des photos à emporter : sans lui, c'était tout l'album ou une par une.
  const [vue, setVue] = useState('toutes') // organisateur : toutes | visibles | masquees
  const [chercheQui, setChercheQui] = useState('')
  // Qui regarde : beaucoup s'inscrivent sous un surnom et ne le retrouvent pas.
  const [moiId, setMoiId] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  // Les réglages mangeaient l'écran entier d'un téléphone : les photos
  // n'apparaissaient qu'après un long défilement. Ils tiennent maintenant dans
  // deux boutons, qui ouvrent chacun leur panneau. null | 'film' | 'qui'
  const [panneau, setPanneau] = useState(null)

  // Le goût de chacun tient d'un album à l'autre : on relit le choix précédent
  // après le premier rendu, pour ne pas fâcher le serveur avec le localStorage.
  useEffect(() => {
    try {
      const garde = JSON.parse(localStorage.getItem('ttf-pellicule') || 'null')
      if (garde?.id) setPelliculeId(garde.id)
      if (typeof garde?.date === 'boolean') setAvecDate(garde.date)
    } catch {}
  }, [])
  function choisirPellicule(id, date) {
    setPelliculeId(id); setAvecDate(date)
    try { localStorage.setItem('ttf-pellicule', JSON.stringify({ id, date })) } catch {}
  }

  async function downloadAll(photos) {
    if (zip) return
    setZipErr('')
    // Qui emporte l'album, et combien de photos : c'est ce qui nourrit le bilan
    // montré à l'organisateur une fois la fête passée.
    fetch(`/api/gallery/${id}/track-download`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceToken: getDeviceToken(), photoCount: photos.length }),
    }).catch(() => {})

    // La pellicule choisie part avec la photo : sur le téléphone comme sur les
    // réseaux, c'est le rendu vu dans l'album que l'on retrouve.
    const cuire = (blob, p) => cuirePhoto(blob, {
      pellicule: pelli,
      date: avecDate ? tamponDate(p.takenAt) : '',
    })

    // Une seule photo : on l'enregistre telle quelle. L'enfermer dans une
    // archive obligerait à la décompresser pour voir une image.
    if (photos.length === 1) {
      const p = photos[0]
      try {
        const brut = await fetch(p.fullUrl || p.url).then((r) => r.blob())
        const blob = await cuire(brut, p)
        const qui = (p.who || 'invite').normalize('NFD').replace(/[^a-zA-Z0-9]/g, '')
        enregistrer(blob, `timetoflash-${qui}.jpg`)
      } catch { setZipErr('Téléchargement impossible : les photos n\'ont pas pu être relues. Réessayez dans un instant.') }
      return
    }

    setZip({ done: 0, total: photos.length })
    try {
      const z = new JSZip()
      let i = 0
      let reussies = 0
      for (const p of photos) {
        try {
          const brut = await fetch(p.fullUrl || p.url).then((r) => r.blob())
          const blob = await cuire(brut, p)
          const safe = (p.who || 'invite').normalize('NFD').replace(/[^a-zA-Z0-9]/g, '')
          z.file(`timetoflash-${String(++i).padStart(3, '0')}-${safe}.jpg`, blob)
          reussies++
        } catch { i++ }
        setZip({ done: i, total: photos.length })
      }
      // Une archive vide s'enregistre sans rien dire et ne s'ouvre nulle part :
      // mieux vaut l'aveu d'échec que le fichier de 22 octets.
      if (reussies === 0) {
        setZipErr('Téléchargement impossible : aucune photo n\'a pu être relue. Réessayez dans un instant.')
        return
      }
      const out = await z.generateAsync({ type: 'blob' })
      enregistrer(out, 'timetoflash-photos.zip')
    } catch (e) {
      setZipErr('Téléchargement impossible.')
    } finally { setZip(null) }
  }

  const [codeInput, setCodeInput] = useState('')
  const [codeErr, setCodeErr] = useState('')

  useEffect(() => { setMoiId(getGuest(id)?.guestId || null) }, [id])

  // Favoris posés par cet appareil. Le compte, lui, vit sur la photo elle-même.
  const [favs, setFavs] = useState(() => new Set())
  // 'tous' · 'miens' (mes coups de cœur) · 'aimees' (le classement de tous)
  const [vueFav, setVueFav] = useState('tous')

  // Résumé de soirée : décidé une fois pour toutes au montage, pour qu'il ne
  // resurgisse pas à chaque rechargement des données.
  const [montrerWrap, setMontrerWrap] = useState(false)
  useEffect(() => { setMontrerWrap(!wrapDejaVu(id)) }, [id])
  // Référence stable : sinon le minuteur du résumé repartirait à zéro à chaque
  // rendu de l'album.
  const fermerWrap = useCallback(() => setMontrerWrap(false), [])

  // ---- Enquête de satisfaction ----
  // Ouvrir l'album, c'est aussi ce qui nous dit qui est venu jusqu'ici : ceux
  // qui ne viennent jamais sont relancés par mail, et ce sont eux qui ont le
  // plus de chances d'avoir buté sur quelque chose.
  //
  // C'est le serveur qui décide d'afficher la question, pas le navigateur :
  // quelqu'un qui a déjà répondu par mail ne doit pas la revoir ici, fût-ce
  // depuis un autre téléphone.
  const [montrerAvis, setMontrerAvis] = useState(false)
  const [avisFerme, setAvisFerme] = useState(false)
  const pingFait = useRef(false)
  const peutRepondre = !!data?.revealed && !data?.ownerPreview && !data?.isOwner
  useEffect(() => {
    if (!peutRepondre || pingFait.current) return
    pingFait.current = true
    fetch('/api/feedback/ping', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: id, deviceToken: getDeviceToken() }),
    })
      .then((r) => r.json())
      .then((d) => setMontrerAvis(!!d.montrer))
      .catch(() => {})
  }, [id, peutRepondre])

  function toggleFav(photoId) {
    const aime = favs.has(photoId)
    // Affichage immédiat : un cœur qui attend le serveur ne donne pas envie.
    setFavs((prev) => {
      const n = new Set(prev)
      aime ? n.delete(photoId) : n.add(photoId)
      return n
    })
    setData((d) => ({
      ...d,
      photos: d.photos.map((p) => (p.id === photoId ? { ...p, favs: Math.max(0, (p.favs || 0) + (aime ? -1 : 1)) } : p)),
    }))

    fetch(`/api/gallery/${id}/favorite`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, deviceToken: getDeviceToken(), on: !aime }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count !== 'number') return
        // Le serveur tranche : d'autres invités ont pu voter entre-temps.
        setData((prev) => ({
          ...prev,
          photos: prev.photos.map((p) => (p.id === photoId ? { ...p, favs: d.count } : p)),
        }))
      })
      .catch(() => {})
  }

  function fetchGallery(extraCode) {
    // Le jeton d'appareil sert à rallumer les cœurs déjà posés par cet invité.
    const headers = { 'x-owner-token': getOwnerToken(id), 'x-device-token': getDeviceToken() }
    let gc = extraCode
    if (gc === undefined) { try { gc = localStorage.getItem(`pellicule_gallery_${id}`) } catch {} }
    if (gc) headers['x-gallery-code'] = gc
    return fetch(`/api/gallery/${id}`, { headers }).then((r) => r.json())
  }

  function load() {
    fetchGallery()
      .then((d) => {
        if (d.error) { setError(d.error); return }
        setData(d)
        if (Array.isArray(d.mesFavoris)) setFavs(new Set(d.mesFavoris))
      })
      .catch(() => setError('Connexion impossible.'))
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // L'invité saisit le code d'accès à l'album privé
  function submitCode(e) {
    e.preventDefault()
    const c = codeInput.trim()
    if (!c) return
    setCodeErr('')
    fetchGallery(c)
      .then((d) => {
        if (d.needCode) { setCodeErr('Code incorrect.'); return }
        if (d.error) { setError(d.error); return }
        try { localStorage.setItem(`pellicule_gallery_${id}`, c) } catch {}
        setData(d)
      })
      .catch(() => setError('Connexion impossible.'))
  }

  // Masquer / réafficher une photo (organisateur + admins)
  async function toggleHide(photoId, hidden) {
    setData((d) => ({ ...d, photos: d.photos.map((p) => (p.id === photoId ? { ...p, hidden } : p)) }))
    await fetch(`/api/events/${id}/photo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
      body: JSON.stringify({ photoId, hidden }),
    }).catch(() => {})
  }

  // Supprimer définitivement une photo (organisateur + admins)
  async function removePhoto(photoId) {
    if (!window.confirm('Supprimer définitivement cette photo ? Cette action est irréversible.')) return
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== photoId) }))
    await fetch(`/api/events/${id}/photo?photoId=${photoId}`, {
      method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
    }).catch(() => {})
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!data) return <main className="center-screen"><p className="muted">Chargement…</p></main>
  // Formule dépassée : l'organisateur est retenu comme tout le monde, mais on
  // lui dit pourquoi. À vérifier avant PreReveal, qui resterait vague.
  if (data.quotaBlocked) return <QuotaGate data={data} id={id} />
  // Galerie cachée tant que non révélée — sauf aperçu organisateur
  if (!data.revealed && !data.ownerPreview) return <PreReveal data={data} onDone={load} />
  // Album protégé par un code : porte d'entrée pour les invités
  if (data.needCode) return <CodeGate data={data} value={codeInput} onChange={setCodeInput} onSubmit={submitCode} err={codeErr} />

  // Les deux vues de cœur se cumulent au filtre par personne : on peut vouloir
  // ses coups de cœur, ou le palmarès, parmi les photos d'un seul invité.
  const lesAimees = data.photos.filter((p) => (p.favs || 0) > 0)
  const parCoeur = vueFav === 'miens' ? data.photos.filter((p) => favs.has(p.id))
    : vueFav === 'aimees' ? lesAimees
      : data.photos
  const parAuteur = auteursChoisis.size === 0 ? parCoeur : parCoeur.filter((p) => auteursChoisis.has(p.guestId))
  // Le tri par visibilité n'a de sens que pour l'organisateur : lui seul voit
  // les photos masquées, et lui seul a besoin de les retrouver.
  const parVisibilite = !data.isOwner || vue === 'toutes' ? parAuteur
    : vue === 'masquees' ? parAuteur.filter((p) => p.hidden)
      : parAuteur.filter((p) => !p.hidden)
  // Le palmarès se lit de haut en bas : la plus aimée d'abord, et à égalité la
  // plus ancienne — celle qui a plu la première.
  const photos = vueFav === 'aimees'
    ? [...parVisibilite].sort((a, b) => (b.favs || 0) - (a.favs || 0) || new Date(a.takenAt) - new Date(b.takenAt))
    : parVisibilite
  // Ce qu'on emporte : la sélection si elle est ouverte, sinon ce qui est affiché.
  const aTelecharger = selecting ? photos.filter((p) => selected.has(p.id)) : photos
  // Comment nommer le filtre en cours, du bouton au libellé de téléchargement :
  // un prénom si c'est une seule personne, un compte au-delà.
  const nomsChoisis = data.guests.filter((g) => auteursChoisis.has(g.id)).map((g) => g.name)
  const nomFiltre = auteursChoisis.size === 0 ? 'tout le monde'
    : nomsChoisis.length === 1 ? nomsChoisis[0]
      : `${auteursChoisis.size} photographes`

  // « Tout cocher » s'ajoute à la sélection au lieu de la remplacer : sans quoi
  // passer de Pierre à Paul effaçait Pierre, et l'on ne pouvait pas emporter
  // les photos de plusieurs personnes en une fois.
  const tousCoches = photos.length > 0 && photos.every((p) => selected.has(p.id))
  function basculerTout() {
    setSelected((prev) => {
      const n = new Set(prev)
      for (const p of photos) tousCoches ? n.delete(p.id) : n.add(p.id)
      return n
    })
  }

  // Les plus prolifiques d'abord : c'est presque toujours eux qu'on cherche.
  const auteurs = data.guests
    .map((g) => ({ ...g, n: data.photos.filter((p) => p.guestId === g.id).length }))
    .sort((a, b) => (b.id === moiId) - (a.id === moiId) || b.n - a.n)
  const sansAccent = (v) => (v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  // Dans le panneau, on cherche par le pr\u00e9nom ; les personnes d\u00e9j\u00e0 coch\u00e9es
  // restent visibles, sinon on d\u00e9coche \u00e0 l'aveugle en tapant.
  const auteursMontres = auteurs.filter((g) => auteursChoisis.has(g.id) || sansAccent(g.name).includes(sansAccent(chercheQui)))
  function basculerAuteur(gid) {
    setAuteursChoisis((prev) => {
      const n = new Set(prev)
      n.has(gid) ? n.delete(gid) : n.add(gid)
      return n
    })
  }
  const hiddenCount = data.isOwner ? data.photos.filter((p) => p.hidden).length : 0
  const ovBtn = {
    width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
    background: 'rgba(20,22,31,.82)', color: '#fff', fontSize: 15, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
  }

  // Le résumé de soirée passe devant l'album, une seule fois, et seulement
  // quand il y a de quoi le nourrir.
  if (montrerWrap && data.photos.length > 1) {
    return (
      <WrapInvite
        eventId={id}
        nom={data.hostNames || data.name}
        photos={data.photos.filter((p) => !p.hidden)}
        guests={data.guests}
        moiId={moiId}
        onClose={fermerWrap}
      />
    )
  }

  return (
    <main className="screen screen-cream wide gal-page">
      {/* Retour au tableau de bord, réservé à l'organisateur : l'album est aussi
          la page des invités, qui n'ont rien à y faire. Collé en haut, la page
          étant longue par nature. */}
      {data.isOwner && (
        <div className="gal-top">
          <Link href={`/event/${id}`} className="gal-back">
            <span aria-hidden="true">←</span> Tableau de bord
          </Link>
        </div>
      )}
      {data.ownerPreview && (
        <div className="notice" style={{ marginBottom: 14, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
          👁️ <strong>Aperçu organisateur</strong> — vous voyez les photos en avant-première. Vos invités ne pourront les découvrir qu'à la révélation, le {formatReveal(data.revealAt)}.
        </div>
      )}
      {data.isOwner && (
        <div className="notice small" style={{ marginBottom: 14, background: '#fdf3e6', borderColor: 'var(--accent)' }}>
          🛠️ <strong>Vous gérez cet album.</strong> Sur chaque photo : 🙈 pour la masquer aux invités (elle reste visible pour vous), 🗑️ pour la supprimer.
          {hiddenCount > 0 && <> {hiddenCount} photo{hiddenCount > 1 ? 's' : ''} actuellement masquée{hiddenCount > 1 ? 's' : ''}.</>}
        </div>
      )}
      <div className="gal-head">
        <div className="eyebrow" style={{ fontSize: 10.5, marginBottom: 4 }}>Révélé · {data.photos.length} souvenirs</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', margin: '2px 0 12px' }}>
          <h3 className="h3" style={{ margin: 0 }}>Les souvenirs de {data.hostNames || data.name}</h3>
          {data.photos.length > 1 && (
            <button className="linklike" style={{ fontSize: 13 }}
              onClick={() => { oublierWrap(id); setMontrerWrap(true) }}>
              ↺ Revoir le résumé
            </button>
          )}
        </div>

        {/* Trois boutons plutôt que trois rangées de pastilles : les réglages
            occupaient le premier écran d'un téléphone, et les photos
            commençaient hors champ. Chacun dit son état, et ouvre son panneau. */}
        <div className="gal-filtres">
          <button className={`gal-fbtn ${panneau === 'vue' ? 'ouvert' : ''} ${vueFav !== 'tous' ? 'actif' : ''}`}
            aria-expanded={panneau === 'vue'}
            onClick={() => setPanneau((p) => (p === 'vue' ? null : 'vue'))}>
            <span className="gal-fbtn-l">♥ Afficher</span>
            <span className="gal-fbtn-v">
              {vueFav === 'miens' ? 'Mes favoris' : vueFav === 'aimees' ? 'Les plus aimées' : 'Toutes'}
            </span>
          </button>
          {/* Souligné seulement quand une pellicule change vraiment les photos :
              « Original » est l'absence d'effet, pas un filtre appliqué. */}
          <button className={`gal-fbtn ${panneau === 'film' ? 'ouvert' : ''} ${pelliculeId !== 'aucune' || avecDate ? 'actif' : ''}`}
            aria-expanded={panneau === 'film'}
            onClick={() => setPanneau((p) => (p === 'film' ? null : 'film'))}>
            {/* « Pellicule » seul ne dit pas ce que le bouton fait à un invité
                qui n'a jamais tenu de jetable : on nomme l'effet. */}
            <span className="gal-fbtn-l">🎞️ Effet photo</span>
            <span className="gal-fbtn-v">{pelli.nom}{avecDate && ' + date'}</span>
          </button>
          {data.guests.length > 1 && (
            <button className={`gal-fbtn ${panneau === 'qui' ? 'ouvert' : ''} ${auteursChoisis.size > 0 ? 'actif' : ''}`}
              aria-expanded={panneau === 'qui'}
              onClick={() => setPanneau((p) => (p === 'qui' ? null : 'qui'))}>
              <span className="gal-fbtn-l">📷 Photographe</span>
              <span className="gal-fbtn-v">{auteursChoisis.size === 0 ? 'Tout le monde' : nomFiltre}</span>
            </button>
          )}

        {/* Le panneau se pose par-dessus l'album au lieu de le repousser : ouvrir
            un filtre ne doit pas coûter un écran de photos. On ferme en touchant
            à côté, comme n'importe quel menu. */}
        {panneau && <div className="gal-fond" onClick={() => setPanneau(null)} />}

        {/* Le cœur passe pour une décoration tant qu'on n'a pas dit à quoi il
            sert : ces trois vues sont l'endroit où l'expliquer. */}
        {panneau === 'vue' && (
          <div className="gal-panneau">
            <div className="gal-liste">
              <button className={`gal-opt ${vueFav === 'tous' ? 'on' : ''}`}
                onClick={() => { setVueFav('tous'); setPanneau(null) }}>
                <span className="gal-opt-t">Toutes les photos<em>{data.photos.length} souvenirs</em></span>
                <span className="gal-opt-c" aria-hidden="true">{vueFav === 'tous' ? '✓' : ''}</span>
              </button>
              <button className={`gal-opt ${vueFav === 'miens' ? 'on' : ''}`} disabled={favs.size === 0}
                onClick={() => { setVueFav('miens'); setPanneau(null) }}>
                <span className="gal-opt-t">Mes favoris<em>{favs.size === 0 ? 'Touchez le ♥ d\'une photo pour la garder de côté' : `${favs.size} photo${favs.size > 1 ? 's' : ''} mise${favs.size > 1 ? 's' : ''} de côté`}</em></span>
                <span className="gal-opt-c" aria-hidden="true">{vueFav === 'miens' ? '✓' : ''}</span>
              </button>
              {/* Le palmarès de tout le monde, distinct de ses propres coups de
                  cœur : on veut savoir ce qui a plu aux autres. */}
              <button className={`gal-opt ${vueFav === 'aimees' ? 'on' : ''}`} disabled={lesAimees.length === 0}
                onClick={() => { setVueFav('aimees'); setPanneau(null) }}>
                <span className="gal-opt-t">Les plus aimées<em>{lesAimees.length === 0 ? 'Personne n\'a encore mis de ♥' : `Le palmarès des ${lesAimees.length} photos aimées`}</em></span>
                <span className="gal-opt-c" aria-hidden="true">{vueFav === 'aimees' ? '✓' : ''}</span>
              </button>
            </div>
          </div>
        )}

        {/* La pellicule : une seule à la fois, puisqu'elle décide aussi du
            fichier emporté. On donne à lire ce que chacune fait, sinon le nom
            ne veut rien dire avant d'avoir essayé. */}
        {panneau === 'film' && (
          <div className="gal-panneau">
            <div className="gal-liste">
              {PELLICULES.map((f) => (
                <button key={f.id} className={`gal-opt ${pelliculeId === f.id ? 'on' : ''}`}
                  onClick={() => choisirPellicule(f.id, avecDate)}>
                  <span className="gal-opt-t">{f.nom}<em>{f.resume}</em></span>
                  <span className="gal-opt-c" aria-hidden="true">{pelliculeId === f.id ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            <button className={`gal-opt gal-opt-sep ${avecDate ? 'on' : ''}`}
              onClick={() => choisirPellicule(pelliculeId, !avecDate)}>
              <span className="gal-opt-t">Date incrustée<em>Les chiffres orange dans le coin, comme sur un jetable</em></span>
              <span className="gal-opt-c" aria-hidden="true">{avecDate ? '✓' : ''}</span>
            </button>
            <button className="gal-panneau-ok" onClick={() => setPanneau(null)}>Voir les photos</button>
          </div>
        )}

        {/* Qui a pris quoi. Plusieurs cases à cocher, et non un choix unique :
            on cherche souvent les photos d'un petit groupe. À 170 participants,
            la liste ne se parcourt plus — on cherche par le prénom. */}
        {panneau === 'qui' && (
          <div className="gal-panneau">
            {auteurs.length > SEUIL_AUTEURS && (
              <input className="gal-cherche" type="search" value={chercheQui}
                onChange={(e) => setChercheQui(e.target.value)}
                placeholder={`Chercher parmi les ${auteurs.length} participants`} />
            )}
            <div className="gal-liste gal-liste-haute">
              <button className={`gal-opt ${auteursChoisis.size === 0 ? 'on' : ''}`}
                onClick={() => setAuteursChoisis(new Set())}>
                <span className="gal-opt-t">Tout le monde<em>{data.photos.length} photos</em></span>
                <span className="gal-opt-c" aria-hidden="true">{auteursChoisis.size === 0 ? '✓' : ''}</span>
              </button>
              {auteursMontres.map((g) => (
                <button key={g.id} className={`gal-opt ${auteursChoisis.has(g.id) ? 'on' : ''}`}
                  onClick={() => basculerAuteur(g.id)}>
                  <span className="gal-opt-t">{g.name}{g.id === moiId ? ' (vous)' : ''}<em>{g.n} photo{g.n > 1 ? 's' : ''}</em></span>
                  <span className="gal-opt-c" aria-hidden="true">{auteursChoisis.has(g.id) ? '✓' : ''}</span>
                </button>
              ))}
              {auteursMontres.length === 0 && <p className="gal-vide">Aucun participant à ce nom.</p>}
            </div>
            <button className="gal-panneau-ok" onClick={() => setPanneau(null)}>
              Voir les {photos.length} photo{photos.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
        </div>

        {/* Ce que voient les invités, par opposition à ce que vous seul voyez.
            Inutile tant que rien n'est masqué : il n'y aurait rien à trier. */}
        {data.isOwner && hiddenCount > 0 && (
          <>
            <div className="gal-lbl" style={{ marginTop: 12 }}>Visibilité</div>
            <div className="chips">
              <button className={`chip ${vue === 'toutes' ? 'active' : ''}`} onClick={() => setVue('toutes')}>
                Toutes · {parAuteur.length}
              </button>
              <button className={`chip ${vue === 'visibles' ? 'active' : ''}`} onClick={() => setVue('visibles')}>
                Vues par les invités · {parAuteur.filter((p) => !p.hidden).length}
              </button>
              <button className={`chip ${vue === 'masquees' ? 'active' : ''}`} onClick={() => setVue('masquees')}>
                Masquées · {parAuteur.filter((p) => p.hidden).length}
              </button>
            </div>
          </>
        )}

        {/* Emporter : à côté des filtres, dont il dépend, et non à l'autre bout
            de la page. Le libellé nomme ce qu'il va réellement télécharger. */}
        {photos.length > 0 && (
          <div className="gal-actions">
            <button className="btn btn-ghost" onClick={() => { setSelecting((v) => !v); setSelected(new Set()) }}>
              {selecting ? 'Annuler' : 'Choisir des photos'}
            </button>
            {!selecting && (
              <button className="btn btn-dark" disabled={!!zip} onClick={() => downloadAll(photos)}>
                {zip ? `Préparation… ${zip.done}/${zip.total}`
                  : auteursChoisis.size === 0
                    ? `Tout télécharger (${photos.length})`
                    : auteursChoisis.size === 1
                      ? `Télécharger les ${photos.length} de ${nomFiltre}`
                      : `Télécharger ces ${photos.length} photos`}
              </button>
            )}
          </div>
        )}
        {zipErr && (
          <p className="notice small" style={{ marginTop: 10, background: '#fdeceb', borderColor: '#e5a29b' }}>
            ⚠️ {zipErr}
          </p>
        )}
        {photos.length > 0 && (pelli.canaux || avecDate) && (
          <p className="film-note">
            🎞️ Vos photos seront enregistrées avec la pellicule <strong>{pelli.nom}</strong>
            {avecDate && ' et la date'}.
            {/* La précision est utile, mais pas au point de coûter deux lignes
                sur le premier écran d'un téléphone. */}
            <span className="sur-grand"> Choisissez <em>Original</em> sans la date pour les fichiers d'origine.</span>
          </p>
        )}

        {/* Combien de temps « plus tard » peut durer : sans cette date, on
            remet à demain un album qui finira par disparaître. */}
        {data.expiresAt && (
          <p className="gal-fin">
            🗓️ Album en ligne jusqu'au <strong>{formatJour(data.expiresAt)}</strong>.
            <span className="sur-grand"> Enregistrez ce que vous voulez garder avant cette date.</span>
          </p>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="notice" style={{ marginTop: 16 }}>Aucune photo pour ce filtre.</div>
      ) : (
        <div className="masonry" style={{ marginTop: 8 }}>
          {photos.map((p, i) => {
            const rot = ((i * 37) % 7) - 3 // rotation déterministe -3°..+3°
            return (
              <a key={p.id || i} className={`polaroid ${selecting && selected.has(p.id) ? 'pris' : ''}`}
                href={p.fullUrl || p.url} target="_blank" rel="noreferrer"
                onClick={(e) => {
                  if (!selecting) return
                  e.preventDefault()
                  setSelected((prev) => {
                    const n = new Set(prev)
                    n.has(p.id) ? n.delete(p.id) : n.add(p.id)
                    return n
                  })
                }}
                style={{ transform: `rotate(${rot}deg)`, animationDelay: `${Math.min(i * 55, 600)}ms`, opacity: p.hidden ? 0.5 : 1 }}>
                <div className="media">
                  {/* crossOrigin est indispensable au téléchargement : sans lui
                      le navigateur range la photo dans un coin de son cache où
                      le JavaScript n'a pas le droit d'aller la relire, et le zip
                      repartait vide. Avec, le zip réutilise ce qui est déjà là. */}
                  <img src={p.url} alt={`Photo de ${p.who}`} loading="lazy" crossOrigin="anonymous"
                    style={pelli.css ? { filter: pelli.css } : undefined} />
                  {pelli.teinte && <div className="film-teinte" style={{ background: cssTeinte(pelli) }} />}
                  {pelli.halo > 0 && <div className="film-halo" style={{ opacity: pelli.halo }} />}
                  {pelli.vignette > 0 && <div className="film-vignette" style={{ opacity: pelli.vignette }} />}
                  {pelli.grain > 0 && <div className="film-grain" style={{ opacity: pelli.grain }} />}
                  {avecDate && <span className="film-date">{tamponDate(p.takenAt)}</span>}
                  {selecting && (
                    <span className={`gal-coche ${selected.has(p.id) ? 'on' : ''}`} aria-hidden="true">
                      {selected.has(p.id) ? '✓' : ''}
                    </span>
                  )}
                  {p.hidden && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(20,22,31,.85)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
                      🙈 MASQUÉE
                    </div>
                  )}
                  {/* Podium : seulement dans le classement, et seulement si la
                      photo a vraiment recueilli des cœurs. */}
                  {vueFav === 'aimees' && i < 3 && p.favs > 0 && (
                    <span className="gal-rang" aria-hidden="true">{['🥇', '🥈', '🥉'][i]}</span>
                  )}
                  {data.isOwner && (
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button title={p.hidden ? 'Réafficher aux invités' : 'Masquer aux invités'}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHide(p.id, !p.hidden) }}
                        style={ovBtn}>{p.hidden ? '👁️' : '🙈'}</button>
                      <button title="Supprimer définitivement"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePhoto(p.id) }}
                        style={ovBtn}>🗑️</button>
                    </div>
                  )}
                  {/* Le cœur reste anonyme : on montre le total, jamais qui a
                      aimé. Un vote qui se voit ne s'ose plus. */}
                  {!selecting && !p.hidden && (
                    <button
                      className={`gal-coeur ${favs.has(p.id) ? 'on' : ''}`}
                      aria-label={favs.has(p.id) ? 'Retirer des favoris' : 'Mettre en favori'}
                      aria-pressed={favs.has(p.id)}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(p.id) }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"
                        fill={favs.has(p.id) ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
                      </svg>
                      {p.favs > 0 && <span>{p.favs}</span>}
                    </button>
                  )}
                </div>
                <div className="cap">
                  <span className="who">{p.who}</span>
                  <span className="time">{formatStamp(p.takenAt)}</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* La question arrive après les photos, jamais avant : on laisse d'abord
          découvrir l'album. Et pas pendant la sélection — on ne coupe pas
          quelqu'un en train de choisir ce qu'il emporte. */}
      {montrerAvis && !avisFerme && !selecting && photos.length > 0 && (
        <div style={{ maxWidth: 520, margin: '10px auto 0' }}>
          <p className="eyebrow" style={{ fontSize: 10.5, marginBottom: 6 }}>{ACCROCHE}</p>
          <Avis
            role="invite"
            compact
            payload={{ eventId: id, deviceToken: getDeviceToken() }}
            onClose={() => setAvisFerme(true)}
          />
        </div>
      )}

      {selecting && (
        <div className="gal-bar">
          <div className="gal-bar-in">
            <button className="gal-bar-tout" onClick={basculerTout}>
              {tousCoches ? 'Décocher ces photos' : 'Cocher ces photos'}
            </button>
            <span className="gal-bar-n">
              {selected.size} photo{selected.size > 1 ? 's' : ''}
              {auteursChoisis.size > 0 && <em className="gal-bar-note">La sélection se garde d'une personne à l'autre</em>}
            </span>
            <button className="btn btn-accent gal-bar-dl" disabled={!!zip || selected.size === 0}
              onClick={() => downloadAll(aTelecharger)}>
              {zip ? `${zip.done}/${zip.total}` : 'Télécharger'}
            </button>
          </div>
        </div>
      )}

    </main>
  )
}
