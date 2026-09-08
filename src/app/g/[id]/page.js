'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import JSZip from 'jszip'
import { BRAND } from '../../../lib/brand'
import { getOwnerToken, getGuest, getDeviceToken } from '../../../lib/device'
import { PELLICULES, PELLICULE_DEFAUT, pelliculeParId, cssTeinte, tamponDate, cuirePhoto } from '../../../lib/film'
import Collage from '../../../components/Collage'
import WrapInvite, { wrapDejaVu, oublierWrap } from '../../../components/WrapInvite'
import Avis from '../../../components/Avis'
import { ACCROCHE } from '../../../lib/avis'

// Au-delà, la rangée de pastilles devient illisible et l'on passe à la recherche.
const SEUIL_AUTEURS = 8

// Diapo : combien de photos on tient prêtes de chaque côté de celle qu'on
// regarde. Une seule suffisait à qui feuillette calmement, mais deux coups de
// pouce rapides rattrapaient le chargement et laissaient un cadre vide.
const PRECHARGE = 2

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
// Le sur-titre de l'album : la date, jamais le type d'événement. La base ne
// sait pas si c'est un mariage ou un anniversaire, mais elle sait quel jour.
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

// Les initiales de la carte de repli, quand la soirée n'a pas de couverture.
//
// « Claire & Martin » donne « C&M », mais « Banc d'essai » ne doit pas donner
// « B&D » : l'esperluette annoncerait un couple là où il n'y a qu'un nom. On
// ne la met donc que si le nom en porte vraiment une, ou un « et » entre deux
// mots. Sinon, une seule lettre suffit.
function initialesDe(nom) {
  const brut = String(nom || '').trim()
  if (!brut) return '✳'
  const couple = brut.split(/\s*(?:&|\+|\bet\b)\s*/i).filter(Boolean)
  if (couple.length >= 2) {
    return couple.slice(0, 2).map((m) => m.trim()[0].toUpperCase()).join('&')
  }
  return brut[0].toUpperCase()
}

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
  // Surtout ne pas recharger sur la fin du compte à rebours : il est déjà à zéro,
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
          🎞️ Vos photos sont bien enregistrées. L'organisateur met la dernière main à l'album ;
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

// Formule dépassée, vu par l'organisateur. Lui seul arrive ici : les participants
// gardent l'écran neutre. On dit la raison et on donne la sortie dans le même
// écran : un album verrouillé sans bouton pour le déverrouiller serait cruel.
function QuotaGate({ data, id }) {
  const q = data.quota || {}
  const prix = q.upgrade?.priceCents
    ? (q.upgrade.priceCents / 100).toFixed(2).replace('.', ',') + ' €'
    : null
  // Au plus grand palier, il n'y a plus de formule à acheter : le tarif se fait
  // à la main. Le bouton doit mener à nous, jamais vers un paiement qui n'existe
  // pas, sinon l'organisateur tourne en rond avec son album fermé.
  const surMesure = !q.upgrade?.maxGuests

  return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h3 className="h3" style={{ marginBottom: 6 }}>L&apos;album attend votre formule</h3>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Vous avez accueilli <strong>{q.guestCount}</strong> participants alors que votre formule
          en couvre <strong>{q.maxGuests}</strong>. Tout le monde a pu photographier normalement,
          rien n&apos;a été perdu : les photos vous attendent.
        </p>
        {surMesure ? (
          <a
            className="btn btn-accent"
            href={`mailto:${q.contactEmail || 'support@timetoflash.fr'}?subject=${encodeURIComponent(`Plus de ${q.maxGuests} participants : ${data.name || 'mon événement'}`)}`}
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
            Passer à {q.upgrade.maxGuests} participants{prix ? ` (${prix})` : ''}
          </Link>
        )}
        <p className="muted" style={{ fontSize: 12 }}>
          {surMesure
            ? `Au-delà de ${q.maxGuests} participants, nous établissons un tarif sur mesure. Écrivez-nous, on ouvre l'accès dans la foulée.`
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
/**
 * Remettre le fichier à la personne.
 *
 * Sur ordinateur, un lien invisible avec l'attribut `download` suffit. Sur
 * iPhone, non : Safari ignore cet attribut quand l'adresse est un blob. Le
 * bouton semblait alors ne rien faire, sans le moindre message.
 *
 * On tente donc d'abord la feuille de partage du système, celle qui propose
 * « Enregistrer dans Photos ». Elle exige un geste récent : après plusieurs
 * secondes de préparation, iOS peut la refuser. Le lien classique reste alors
 * en secours, et l'on rend `false` si rien n'a pu aboutir, pour que l'appelant
 * puisse le dire au lieu de laisser croire à une réussite.
 */
/** iPad compris, qui se présente comme un Mac mais répond au doigt. */
function estIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

async function enregistrer(blob, nom) {
  const fichier = new File([blob], nom, { type: blob.type || 'image/jpeg' })
  // Réservé à iOS : ailleurs le téléchargement classique marche très bien, et
  // ouvrir une feuille de partage sur un ordinateur serait une régression.
  if (estIOS() && navigator.canShare?.({ files: [fichier] })) {
    try {
      await navigator.share({ files: [fichier] })
      return true
    } catch (err) {
      // La personne a fermé la feuille : c'est un choix, pas une panne.
      if (err?.name === 'AbortError') return true
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 60000)
  // Safari sur iPhone n'honore pas `download` : on ne peut pas le vérifier,
  // seulement le signaler.
  return !estIOS()
}

// Regarder une photo, et passer à la suivante d'un doigt. Ouvrir le fichier
// dans un onglet, c'était sortir de l'album : on perdait le nom, l'heure, le
// cœur, et il fallait revenir en arrière pour voir la photo d'après.
// `onImageCassee` vient de la galerie et doit être passé en propriété : la
// visionneuse est un composant à part, elle n'a pas accès aux fonctions
// définies dans `Gallery`. L'oublier faisait planter la page à l'ouverture
// d'une photo, avec un « adresseCassee is not defined » que rien ne rattrapait.
function Diapo({ photos, index, setIndex, pelli, avecDate, favs, onFav, onClose, onDownload, occupe, onSignaler, onRetirer, onImageCassee }) {
  const [dx, setDx] = useState(0)
  const [glisse, setGlisse] = useState(false)
  const [dy, setDy] = useState(0)   // le doigt qui chasse la photo vers le haut ou le bas
  const geste = useRef(null)
  const n = photos.length
  const p = photos[index]

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(n - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    // Pas de manipulation de l'historique ici. J'avais posé une entrée pour que
    // le retour d'Android referme la photo, et retiré cette entrée au
    // démontage : en développement, React monte chaque composant deux fois, et
    // ce retour automatique refermait la visionneuse à l'instant où elle
    // s'ouvrait. Le bouton retour du téléphone sort donc de l'album, comme
    // avant ; ça mérite d'être repris, mais pas au prix d'une visionneuse qui
    // ne s'ouvre plus.
    // La page derrière ne doit pas défiler sous la photo qu'on regarde.
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = avant
    }
  }, [n, onClose, setIndex])

  function debut(e) {
    const t = e.touches[0]
    geste.current = { x: t.clientX, y: t.clientY, axe: null }
  }
  function bouge(e) {
    const g = geste.current
    if (!g) return
    const t = e.touches[0]
    const ex = t.clientX - g.x
    const ey = t.clientY - g.y
    // L'axe se décide au premier centimètre : un doigt parti vers le bas ne
    // doit pas faire sauter la photo suivante au passage.
    if (!g.axe) {
      if (Math.abs(ex) < 8 && Math.abs(ey) < 8) return
      g.axe = Math.abs(ex) > Math.abs(ey) ? 'x' : 'y'
      if (g.axe === 'x') setGlisse(true)
    }
    // Le doigt parti à la verticale chasse la photo : c'est devenu le geste de
    // tout le monde pour refermer une image, et chercher une croix en haut d'un
    // grand écran, une main occupée, ne va pas de soi.
    if (g.axe === 'y') { setDy(ey); return }
    // Aux deux bouts, la photo résiste au lieu de partir dans le vide.
    const bord = (ex > 0 && index === 0) || (ex < 0 && index === n - 1)
    setDx(bord ? ex * 0.3 : ex)
  }
  function fin() {
    const g = geste.current
    geste.current = null
    setGlisse(false)
    if (g && g.axe === 'y') {
      // Au-delà du seuil on ferme, en dessous la photo revient en place.
      if (Math.abs(dy) > Math.min(120, window.innerHeight * 0.16)) onClose()
      setDy(0)
      return
    }
    if (!g || g.axe !== 'x') { setDx(0); setDy(0); return }
    const seuil = Math.min(90, window.innerWidth * 0.18)
    if (dx <= -seuil && index < n - 1) setIndex(index + 1)
    else if (dx >= seuil && index > 0) setIndex(index - 1)
    setDx(0)
  }

  return (
    <div className="diapo" role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} sur ${n}`}
      style={dy ? { background: `rgba(6,7,11,${Math.max(0.35, 1 - Math.abs(dy) / 420)})` } : undefined}>
      <div className="diapo-piste"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${dx}px), ${dy}px, 0)`,
          transition: glisse || dy ? 'none' : 'transform .3s cubic-bezier(.22,.61,.36,1)',
        }}
        onTouchStart={debut} onTouchMove={bouge} onTouchEnd={fin} onTouchCancel={fin}>
        {photos.map((ph, j) => (
          <div className="diapo-slide" key={ph.id || j}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            {/* On garde deux photos d'avance de chaque côté : un album de 300
                photos ne doit pas tout télécharger d'un coup, mais qui feuillette
                vite ne doit jamais tomber sur un cadre vide. */}
            {Math.abs(j - index) <= PRECHARGE && (
              <div className="diapo-media">
                {/* La photo regardée passe devant les autres dans la file du
                    navigateur : les voisines se chargent, mais jamais au prix
                    de celle qu'on a sous les yeux. */}
                <img src={ph.fullUrl || ph.url} alt={`Photo de ${ph.who}`} crossOrigin="anonymous" draggable={false}
                  onError={onImageCassee}
                  fetchPriority={j === index ? 'high' : 'low'}
                  style={pelli.css ? { filter: pelli.css } : undefined} />
                {pelli.teinte && <div className="film-teinte" style={{ background: cssTeinte(pelli) }} />}
                {pelli.halo > 0 && <div className="film-halo" style={{ opacity: pelli.halo }} />}
                {pelli.vignette > 0 && <div className="film-vignette" style={{ opacity: pelli.vignette }} />}
                {pelli.grain > 0 && <div className="film-grain" style={{ opacity: pelli.grain }} />}
                {avecDate && <span className="film-date">{tamponDate(ph.takenAt)}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="diapo-haut">
        <span className="diapo-num">{index + 1} / {n}</span>
        <button className="diapo-x" onClick={onClose} aria-label="Fermer">✕</button>
      </div>

      {/* Au doigt on fait glisser ; à la souris, on cherche une flèche. */}
      <button className="diapo-fleche g" onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0} aria-label="Photo précédente">‹</button>
      <button className="diapo-fleche d" onClick={() => setIndex((i) => Math.min(n - 1, i + 1))}
        disabled={index === n - 1} aria-label="Photo suivante">›</button>

      <div className="diapo-bas">
        <div className="diapo-qui">
          <b>{p.who}</b>
          <span>{formatStamp(p.takenAt)}</span>
        </div>
        <div className="diapo-act">
          <button className={`diapo-b ${favs.has(p.id) ? 'on' : ''}`} onClick={() => onFav(p.id)}
            aria-pressed={favs.has(p.id)} aria-label={favs.has(p.id) ? 'Retirer des favoris' : 'Mettre en favori'}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
              fill={favs.has(p.id) ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
            </svg>
            {p.favs > 0 && <span>{p.favs}</span>}
          </button>
          <button className="diapo-b" onClick={() => onDownload(p)} disabled={occupe}>
            {occupe ? '…' : '⬇ Enregistrer'}
          </button>
          {/* Sa propre photo se retire ; celle des autres se signale. Jamais les
              deux à la fois : on ne supprime pas le cliché d'autrui, et signaler
              le sien serait un détour absurde pour arriver au même endroit. */}
          {p.mine ? (
            onRetirer && (
              <button className="diapo-b" onClick={() => onRetirer(p)} aria-label="Retirer ma photo de l'album">
                🗑 Retirer ma photo
              </button>
            )
          ) : (
            onSignaler && (
              <button className="diapo-b" onClick={() => onSignaler(p)} aria-label="Signaler cette photo">
                ⚑ Signaler
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
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
  // Un enregistrement réussi ne disait rien. Sur un téléphone, le fichier part
  // sans bruit ni fenêtre : on croyait le bouton mort. Le message se pose
  // par-dessus tout, y compris la photo en plein écran, sinon il resterait
  // caché derrière elle, ce qui était déjà le cas des messages d'erreur.
  const [zipOk, setZipOk] = useState('')
  const minuteur = useRef(null)
  function annoncer(texte) {
    setZipErr('')
    setZipOk(texte)
    clearTimeout(minuteur.current)
    minuteur.current = setTimeout(() => setZipOk(''), 4000)
  }
  useEffect(() => () => clearTimeout(minuteur.current), [])
  // Choix des photos à emporter : sans lui, c'était tout l'album ou une par une.
  const [vue, setVue] = useState('toutes') // organisateur : toutes | visibles | masquees
  const [chercheQui, setChercheQui] = useState('')
  const filtresRef = useRef(null)

  // Un panneau qui s'ouvre amène sa rangée de boutons sous la barre compacte :
  // ouvert depuis le haut de la page, il descendait au-delà de l'écran et son
  // bouton de validation devenait introuvable.
  const filtreActif = () => vueFav !== 'tous' || auteursChoisis.size > 0 || vue !== 'toutes'
  const toutMontrer = () => {
    setVueFav('tous')
    setAuteursChoisis(new Set())
    setVue('toutes')
    setChercheQui('')
    setPanneau(null)
  }

  const ouvrirPanneau = (cle) => {
    setPanneau((p) => {
      const suivant = p === cle ? null : cle
      // On quitte la recherche de participants : on la vide. Sinon elle
      // attendait, invisible, et la liste rouverte paraissait amputée.
      if (p === 'qui' && suivant !== 'qui') setChercheQui('')
      if (suivant && filtresRef.current) {
        const y = window.scrollY + filtresRef.current.getBoundingClientRect().top - 58
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
      }
      return suivant
    })
  }
  // Qui regarde : beaucoup s'inscrivent sous un surnom et ne le retrouvent pas.
  const [moiId, setMoiId] = useState(null)
  // Le participant reconnu sur cet appareil : son prénom nourrit la fenêtre
  // « Profil », et son absence retire le bouton (un organisateur venu du
  // tableau de bord n'a pas de profil de participant).
  const [moi, setMoi] = useState(null)
  const [showProfil, setShowProfil] = useState(false)
  const [lienCopie, setLienCopie] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  // Les réglages mangeaient l'écran entier d'un téléphone : les photos
  // n'apparaissaient qu'après un long défilement. Ils tiennent maintenant dans
  // deux boutons, qui ouvrent chacun leur panneau. null | 'film' | 'qui'
  const [panneau, setPanneau] = useState(null)
  // Photo ouverte en plein écran (son rang dans la liste affichée), ou null.
  const [diapo, setDiapo] = useState(null)

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
        const ok = await enregistrer(blob, `timetoflash-${qui}.jpg`)
        if (ok) annoncer('Photo enregistrée')
        else setZipErr('Sur iPhone, appuyez longuement sur la photo puis choisissez « Ajouter aux photos ».')
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
      const ok = await enregistrer(out, 'timetoflash-photos.zip')
      if (ok) annoncer(reussies > 1 ? `${reussies} photos enregistrées` : 'Photo enregistrée')
      else setZipErr('Sur iPhone, l\'archive s\'ouvre dans l\'application Fichiers.')
    } catch (e) {
      setZipErr('Téléchargement impossible.')
    } finally { setZip(null) }
  }

  const [codeInput, setCodeInput] = useState('')
  const [codeErr, setCodeErr] = useState('')

  useEffect(() => {
    const g = getGuest(id)
    setMoi(g || null)
    setMoiId(g?.guestId || null)
  }, [id])

  // Partager l'album : le lien public de la galerie, pas le lien personnel du
  // viseur, qui rouvrirait l'appareil de celui qui l'a envoyé.
  async function partagerAlbum() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/g/${id}` : ''
    if (!url) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: data?.hostNames || data?.name || 'Time to Flash', text: 'Les photos de la soirée 📸', url }); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      setLienCopie(true); setTimeout(() => setLienCopie(false), 2000)
    } catch {}
  }

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
  // L'image à emporter sur Instagram : un écran plein, ouvert depuis l'album.
  const [montrerCollage, setMontrerCollage] = useState(false)
  const [rejoue, setRejoue] = useState(0) // remonter la grille relance le développement
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
        // Le serveur tranche : d'autres participants ont pu voter entre-temps.
        setData((prev) => ({
          ...prev,
          photos: prev.photos.map((p) => (p.id === photoId ? { ...p, favs: d.count } : p)),
        }))
      })
      .catch(() => {})
  }

  function fetchGallery(extraCode) {
    // Le jeton d'appareil sert à rallumer les cœurs déjà posés par ce participant.
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

  // ------------------------------------------------------------------
  //  Quand une image casse, on redemande des adresses fraîches.
  //
  //  Les photos sont servies par des adresses SIGNÉES, valables un temps
  //  limité. Un album laissé ouvert plus longtemps que ça voyait donc toutes
  //  ses images se transformer en petits cadres cassés, d'un coup, sans que
  //  rien ne l'explique : les adresses étaient périmées, et la page n'avait
  //  aucun moyen de s'en apercevoir ni de s'en remettre.
  //
  //  Une seule reprise suffit : elle rapporte des adresses neuves pour TOUTES
  //  les photos. On la déclenche au premier échec, et on la verrouille pendant
  //  quelques secondes, sinon deux cents images cassées lanceraient deux cents
  //  requêtes en même temps.
  const reprise = useRef(0)
  function adresseCassee() {
    const maintenant = Date.now()
    if (maintenant - reprise.current < 10000) return
    reprise.current = maintenant
    fetchGallery()
      .then((d) => { if (!d.error && Array.isArray(d.photos)) setData(d) })
      .catch(() => {})
  }

  // Le participant saisit le code d'accès à l'album privé
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

  // Signaler la photo d'un autre. Elle est masquée sur-le-champ, jamais
  // supprimée : l'organisateur la voit toujours et peut la rétablir si le
  // signalement n'était pas fondé.
  async function signalerPhoto(p) {
    const ok = window.confirm(
      "Signaler cette photo ?\n\n"
        + "Elle sera masquée immédiatement pour tout le monde, et l'organisateur en sera informé. "
        + "Elle n'est pas supprimée : il pourra la rétablir si le signalement n'était pas fondé."
    )
    if (!ok) return
    setDiapo(null)
    setData((d) => ({ ...d, photos: d.photos.filter((x) => x.id !== p.id) }))
    const r = await fetch(`/api/gallery/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-token': getDeviceToken() },
      body: JSON.stringify({ photoId: p.id }),
    }).catch(() => null)
    if (!r || !r.ok) {
      window.alert("Le signalement n'a pas pu être envoyé. Réessaie dans un instant.")
      load()
      return
    }
    window.alert("C'est fait. La photo est masquée, et l'organisateur vient d'être prévenu.")
  }

  // Retirer sa propre photo, longtemps après la soirée.
  //
  // La suppression n'existait que dans la seconde qui suit la prise de vue :
  // qui regrettait son cliché le lendemain n'avait plus aucun recours. La photo
  // appartient à qui l'a prise, elle part donc pour de bon, y compris pour
  // l'organisateur, et c'est dit avant de valider.
  async function retirerMaPhoto(p) {
    const ok = window.confirm(
      "Retirer définitivement cette photo ?\n\n"
        + "Elle disparaîtra de l'album pour tout le monde, et les organisateurs n'y auront plus accès. "
        + "Cette action est irréversible."
    )
    if (!ok) return
    setDiapo(null)
    setData((d) => ({ ...d, photos: d.photos.filter((x) => x.id !== p.id) }))
    const r = await fetch('/api/photo/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: p.id, deviceToken: getDeviceToken() }),
    }).catch(() => null)
    if (!r || !r.ok) {
      window.alert("La photo n'a pas pu être retirée. Réessaie dans un instant.")
      load()
    }
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!data) return <main className="center-screen"><p className="muted">Chargement…</p></main>
  // Formule dépassée : l'organisateur est retenu comme tout le monde, mais on
  // lui dit pourquoi. À vérifier avant PreReveal, qui resterait vague.
  if (data.quotaBlocked) return <QuotaGate data={data} id={id} />
  // Galerie cachée tant que non révélée, sauf aperçu organisateur
  if (!data.revealed && !data.ownerPreview) return <PreReveal data={data} onDone={load} />
  // Album protégé par un code : porte d'entrée pour les participants
  if (data.needCode) return <CodeGate data={data} value={codeInput} onChange={setCodeInput} onSubmit={submitCode} err={codeErr} />

  // Les deux vues de cœur se cumulent au filtre par personne : on peut vouloir
  // ses coups de cœur, ou le palmarès, parmi les photos d'un seul participant.
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
  // plus ancienne, celle qui a plu la première.
  const photos = vueFav === 'aimees'
    ? [...parVisibilite].sort((a, b) => (b.favs || 0) - (a.favs || 0) || new Date(a.takenAt) - new Date(b.takenAt))
    : parVisibilite
  // Ce qu'on emporte : la sélection si elle est ouverte, sinon ce qui est affiché.
  const aTelecharger = selecting ? photos.filter((p) => selected.has(p.id)) : photos
  // L'aperçu des pellicules : la première photo visible de la soirée. Sur ses
  // propres souvenirs, un rendu se juge en une seconde.
  const apercuUrl = (data?.photos || []).find((x) => !x.hidden)?.url || ''

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

  // Par ordre alphabétique : on cherche un prénom, pas un palmarès. Soi-même
  // reste en tête, c'est la seule ligne qu'on ouvre les yeux fermés.
  const auteurs = data.guests
    .map((g) => ({ ...g, n: data.photos.filter((p) => p.guestId === g.id).length }))
    .sort((a, b) => (b.id === moiId) - (a.id === moiId)
      || (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }))
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

  if (montrerCollage) {
    return (
      <Collage
        photos={data.photos}
        nom={data.hostNames || data.name}
        favs={favs}
        pelliculeId={pelliculeId}
        avecDate={avecDate}
        onFermer={() => setMontrerCollage(false)}
        onEnregistrer={enregistrer}
      />
    )
  }

  return (
    <main className={`screen wide gal-page ${panneau ? 'panneau-ouvert' : ''} ${selecting ? 'en-selection' : ''}`}>
      {data.ownerPreview && (
        <div className="notice notice-orga" style={{ marginBottom: 14 }}>
          👁️ <strong>Aperçu organisateur</strong> : vous voyez les photos en avant-première. Vos participants ne pourront les découvrir qu'à la révélation, le {formatReveal(data.revealAt)}.
        </div>
      )}
      {data.isOwner && (
        <div className="notice notice-orga small" style={{ marginBottom: 14 }}>
          🛠️ <strong>Vous gérez cet album.</strong> Sur chaque photo : 🙈 pour la masquer aux participants (elle reste visible pour vous), 🗑️ pour la supprimer.
          {hiddenCount > 0 && <> {hiddenCount} photo{hiddenCount > 1 ? 's' : ''} actuellement masquée{hiddenCount > 1 ? 's' : ''}.</>}
        </div>
      )}
      {/* ============================================================
          L'en-tête de l'album révélé, jumeau de celui de la soirée : la
          couverture posée dans son cadre, le fond tiré d'elle-même, la date en
          sur-titre. Trois choses seulement changent une fois la révélation
          passée : le décompte laisse la place au verdict, le bouton n'invite
          plus à photographier mais à tout emporter, et le mur devient l'album.
          ============================================================ */}
      <div className="gal-hero">
        {data.coverUrl
          ? <div className="gal-hero-fond" style={{ backgroundImage: `url(${data.coverUrl})` }} />
          : <div className="gal-hero-fond gal-hero-motif" />}
        <div className="gal-hero-voile" />
        <div className="gal-hero-corps">
          {/* Le bandeau de l'organisateur et les deux boutons ronds : les mêmes
              qu'au-dessus du viseur et de l'album d'attente. Passer de l'un à
              l'autre ne doit pas donner l'impression de changer d'application. */}
          {data.isOwner && (
            <Link href={`/event/${id}`} className="album-orga">
              <span>Vous organisez cette soirée</span><b>Tableau de bord →</b>
            </Link>
          )}
          <div className="album-nav">
            <button className="album-navbtn" onClick={() => setShowProfil(true)}>
              <span className="ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              </span>
              <em>Profil</em>
            </button>
            <span className="album-navspace" />
            <button className="album-navbtn" onClick={partagerAlbum}>
              <span className="ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" /></svg>
              </span>
              <em>{lienCopie ? 'Copié' : 'Partager'}</em>
            </button>
          </div>

          {data.coverUrl ? (
            <div className="gal-cadre"><img src={data.coverUrl} alt="" /></div>
          ) : (
            <div className="gal-cadre gal-carte">
              <span className="perf" /><span className="perf bas" />
              <span className="obturateur" />
              <span className="ini">{initialesDe(data.hostNames || data.name)}</span>
              <span className="jour">{formatCourt(data.startsAt)}</span>
            </div>
          )}
          <div className="gal-etat">
            🎉 Album révélé
            {data.expiresAt && <> · en ligne jusqu&apos;au {formatJour(data.expiresAt)}</>}
          </div>
          <div className="gal-hero-date">{formatLong(data.startsAt)}</div>
          <h1 className="gal-hero-nom">{data.hostNames || data.name}</h1>
          <div className="gal-hero-stats">
            {data.photos.length} photo{data.photos.length > 1 ? 's' : ''} · {data.guests.length} participant{data.guests.length > 1 ? 's' : ''}
          </div>
          <div className="gal-hero-actions">
            {/* En haut, c'est l'album entier : ce bouton vit au-dessus des
                filtres, avant qu'on ait trié quoi que ce soit. Celui du bas,
                lui, suit le filtre en cours. */}
            <button className="gal-hero-dl" disabled={!!zip} onClick={() => downloadAll(data.photos)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              {zip ? `Préparation… ${zip.done}/${zip.total}` : `Tout télécharger (${data.photos.length})`}
            </button>
            {data.photos.length > 1 && (
              <button className="gal-hero-revoir" onClick={() => { oublierWrap(id); setMontrerWrap(true) }}>
                ↺ Revoir la révélation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* La barre compacte : la couverture se replie en vignette, le nom et les
          compteurs restent, et « Créer » se tient à droite. Elle colle en haut
          pendant qu'on descend dans les photos, on sait donc toujours où l'on
          est sans que la façade prenne la moitié de l'écran.
          Elle est fille de la page, et non de l'en-tête : un élément collant ne
          dépasse jamais les bornes de son conteneur, et elle serait partie avec
          lui au premier défilement. */}
      <div className="gal-compact">
        {data.coverUrl && <span className="gal-compact-vig"><img src={data.coverUrl} alt="" /></span>}
        <span className="gal-compact-txt">
          <span className="gal-compact-nom">{data.hostNames || data.name}</span>
          <span className="gal-compact-sous">
            {data.photos.length} photo{data.photos.length > 1 ? 's' : ''} · {data.guests.length} participant{data.guests.length > 1 ? 's' : ''}
          </span>
        </span>
        {data.photos.length > 0 && (
          <button className="gal-creer" onClick={() => setMontrerCollage(true)}>
            <span aria-hidden="true">✦</span><i>Créer</i>
          </button>
        )}
      </div>


        {/* Trois boutons plutôt que trois rangées de pastilles : les réglages
            occupaient le premier écran d'un téléphone, et les photos
            commençaient hors champ. Chacun dit son état, et ouvre son panneau. */}
      {panneau && <div className="gal-fond" onClick={() => { if (panneau === 'qui') setChercheQui(''); setPanneau(null) }} />}

        <div className="gal-filtres" ref={filtresRef}>
          {/* Souligné seulement quand une pellicule change vraiment les photos :
              « Original » est l'absence d'effet, pas un filtre appliqué. */}
          <button className={`gal-fbtn ${panneau === 'film' ? 'ouvert' : ''} ${pelliculeId !== 'aucune' || avecDate ? 'actif' : ''}`}
            aria-expanded={panneau === 'film'}
            onClick={() => ouvrirPanneau('film')}>
            {/* « Pellicule » seul ne dit pas ce que le bouton fait à un participant
                qui n'a jamais tenu de jetable : on nomme l'effet. */}
            <span className="gal-fbtn-l">🎞️ Effet photo</span>
            <span className="gal-fbtn-v">{pelli.nom}{avecDate && ' + date'}</span>
          </button>
          <button className={`gal-fbtn ${panneau === 'vue' ? 'ouvert' : ''} ${vueFav !== 'tous' ? 'actif' : ''}`}
            aria-expanded={panneau === 'vue'}
            onClick={() => ouvrirPanneau('vue')}>
            <span className="gal-fbtn-l">♥ Afficher</span>
            <span className="gal-fbtn-v">
              {vueFav === 'miens' ? 'Mes favoris' : vueFav === 'aimees' ? 'Les plus aimées' : 'Toutes'}
            </span>
          </button>
          {data.guests.length > 1 && (
            <button className={`gal-fbtn ${panneau === 'qui' ? 'ouvert' : ''} ${auteursChoisis.size > 0 ? 'actif' : ''}`}
              aria-expanded={panneau === 'qui'}
              onClick={() => ouvrirPanneau('qui')}>
              <span className="gal-fbtn-l">📷 Photographe</span>
              <span className="gal-fbtn-v">{auteursChoisis.size === 0 ? 'Tout le monde' : nomFiltre}</span>
            </button>
          )}

        {/* Le panneau se pose par-dessus l'album au lieu de le repousser : ouvrir
            un filtre ne doit pas coûter un écran de photos. On ferme en touchant
            à côté, comme n'importe quel menu. */}

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
            {/* Une rangée d'aperçus plutôt qu'une liste : la pellicule se
                choisit à l'oeil, et une liste s'étalait sur toute la largeur
                d'un écran d'ordinateur, chaque nom perdu au milieu du vide. */}
            <div className="gal-films">
              {PELLICULES.map((f) => (
                <button key={f.id} className={`gal-film ${pelliculeId === f.id ? 'on' : ''}`}
                  onClick={() => choisirPellicule(f.id, avecDate)}>
                  <span className="gal-film-vig">
                    {apercuUrl && (
                      <>
                        <img src={apercuUrl} alt="" crossOrigin="anonymous"
                          style={f.css ? { filter: f.css } : undefined} />
                        {f.teinte && <span className="film-teinte" style={{ background: cssTeinte(f) }} />}
                        {f.vignette > 0 && <span className="film-vignette" style={{ opacity: f.vignette }} />}
                      </>
                    )}
                  </span>
                  <em>{f.nom}</em>
                </button>
              ))}
            </div>
            <button className={`gal-opt gal-opt-sep ${avecDate ? 'on' : ''}`}
              role="checkbox" aria-checked={avecDate}
              onClick={() => choisirPellicule(pelliculeId, !avecDate)}>
              <span className={`gal-case ${avecDate ? 'on' : ''}`} aria-hidden="true">{avecDate ? '✓' : ''}</span>
              <span className="gal-opt-t">Date incrustée<em>Les chiffres orange dans le coin, comme sur un jetable</em></span>
            </button>
            <button className="gal-panneau-ok" onClick={() => setPanneau(null)}>Voir les photos</button>
          </div>
        )}

        {/* Qui a pris quoi. Plusieurs cases à cocher, et non un choix unique :
            on cherche souvent les photos d'un petit groupe. À 170 participants,
            la liste ne se parcourt plus : on cherche par le prénom. */}
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
            <button className="gal-panneau-ok" onClick={() => { setChercheQui(''); setPanneau(null) }}>
              Voir les {photos.length} photo{photos.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
        </div>

        {filtreActif() && !panneau && (
          <button className="gal-reinit" onClick={toutMontrer}>
            ✕ Tout montrer
          </button>
        )}

        {/* Ce que voient les participants, par opposition à ce que vous seul voyez.
            Inutile tant que rien n'est masqué : il n'y aurait rien à trier. */}
        {data.isOwner && hiddenCount > 0 && (
          <>
            <div className="gal-lbl" style={{ marginTop: 12 }}>Visibilité</div>
            <div className="chips">
              <button className={`chip ${vue === 'toutes' ? 'active' : ''}`} onClick={() => setVue('toutes')}>
                Toutes · {parAuteur.length}
              </button>
              <button className={`chip ${vue === 'visibles' ? 'active' : ''}`} onClick={() => setVue('visibles')}>
                Vues par les participants · {parAuteur.filter((p) => !p.hidden).length}
              </button>
              <button className={`chip ${vue === 'masquees' ? 'active' : ''}`} onClick={() => setVue('masquees')}>
                Masquées · {parAuteur.filter((p) => p.hidden).length}
              </button>
            </div>
          </>
        )}

        {/* Emporter tout l'album se fait depuis l'en-tête, en un appui. Ici ne
            reste que ce qui dépend des filtres : choisir quelques photos, ou
            emporter le tri en cours (« les 12 de Rose »). Le bouton disparaît
            quand aucun filtre n'est posé : il dirait la même chose que celui
            du haut, deux fois. */}
        {photos.length > 0 && (
          <div className="gal-actions gal-actions-bas">
            <button className="btn btn-ghost" onClick={() => { setSelecting((v) => !v); setSelected(new Set()) }}>
              {selecting ? 'Annuler' : 'Sélectionner'}
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

      {photos.length === 0 ? (
        <div className="notice" style={{ marginTop: 16 }}>Aucune photo pour ce filtre.</div>
      ) : (
        <div className="masonry" key={rejoue} style={{ marginTop: 8 }}>
          {photos.map((p, i) => {
            const rot = ((i * 37) % 7) - 3 // rotation déterministe -3°..+3°
            return (
              <a key={p.id || i} className={`polaroid ${selecting && selected.has(p.id) ? 'pris' : ''}`}
                href={p.fullUrl || p.url} target="_blank" rel="noreferrer"
                onClick={(e) => {
                  // Ctrl/⌘ + clic garde son sens sur un ordinateur : ouvrir le
                  // fichier dans un onglet à côté.
                  if (!selecting && (e.metaKey || e.ctrlKey || e.shiftKey)) return
                  e.preventDefault()
                  if (!selecting) { setDiapo(i); return }
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
                  <img src={p.url} alt={`Photo de ${p.who}`} loading="lazy" crossOrigin="anonymous" onError={adresseCassee}
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
                  {data.isOwner && (
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button title={p.hidden ? 'Réafficher aux participants' : 'Masquer aux participants'}
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
          découvrir l'album. Et pas pendant la sélection : on ne coupe pas
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

      {/* Le profil : son prénom, et le chemin vers ses propres photos. Les mêmes
          deux lignes que sur le viseur, sans le lien personnel : la soirée est
          passée, il n'y a plus d'appareil à rouvrir. */}
      {showProfil && (
        <div className="modal-fond" onClick={() => setShowProfil(false)}>
          <div className="modal-carte" onClick={(e) => e.stopPropagation()}>
            <div className="modal-titre">Mon profil</div>
            <p className="modal-nom">{moi?.name || 'Cet appareil'}</p>
            <p className="modal-sous">
              {moi?.name
                ? 'Vos photos de la soirée sont signées de ce prénom.'
                : "Cet appareil n'a pas participé à cette soirée. Retrouvez vos propres photos ci-dessous."}
            </p>
            <a className="modal-btn" href="/mes-photos">📷 Retrouver mes photos</a>
            <button className="modal-btn modal-btn-clair" onClick={() => setShowProfil(false)}>Fermer</button>
          </div>
        </div>
      )}

      {selecting && (
        <div className="gal-bar">
          <div className="gal-bar-in">
            {/* La sortie de la sélection : sans elle, on reste coincé, la barre
                du bas ayant pris la place du bouton « Sélectionner ». */}
            <button className="gal-bar-fin" aria-label="Quitter la sélection"
              onClick={() => { setSelecting(false); setSelected(new Set()) }}>
              ✕
            </button>
            <button className="gal-bar-tout" onClick={basculerTout}>
              {/* Le nombre dit combien le filtre en cours en montre : on sait ce
                  qu'on coche avant de cliquer. */}
              {tousCoches ? `Décocher ces ${photos.length} photos` : `Cocher ces ${photos.length} photos`}
            </button>
            <span className="gal-bar-n">
              {aTelecharger.length} photo{aTelecharger.length > 1 ? 's' : ''}
              {auteursChoisis.size > 0 && <em className="gal-bar-note">La sélection se garde d'une personne à l'autre</em>}
            </span>
            <button className="btn btn-accent gal-bar-dl" disabled={!!zip || aTelecharger.length === 0}
              onClick={() => downloadAll(aTelecharger)}>
              {zip ? `${zip.done}/${zip.total}` : 'Télécharger'}
            </button>
          </div>
        </div>
      )}

      {/* Le message flotte au-dessus de tout, y compris de la photo en plein
          écran, qui occupe l'écran entier. Posé dans le corps de la page, il
          serait resté invisible au moment précis où l'on en a besoin. */}
      {(zipOk || zipErr) && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 'calc(96px + env(safe-area-inset-bottom))',
            zIndex: 200,
            maxWidth: 'min(92vw, 420px)',
            padding: '12px 18px',
            borderRadius: 999,
            background: zipErr ? '#fdeceb' : 'rgba(20,22,31,.94)',
            color: zipErr ? '#7a2018' : '#F6F1E7',
            border: zipErr ? '1px solid #e5a29b' : '1px solid rgba(255,255,255,.14)',
            boxShadow: '0 12px 32px rgba(0,0,0,.28)',
            fontSize: 15,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {zipErr ? `⚠️ ${zipErr}` : `✓ ${zipOk}`}
        </div>
      )}

      {diapo !== null && photos[diapo] && (
        <Diapo
          photos={photos}
          index={diapo}
          setIndex={setDiapo}
          pelli={pelli}
          avecDate={avecDate}
          favs={favs}
          onFav={toggleFav}
          onClose={() => setDiapo(null)}
          onDownload={(p) => downloadAll([p])}
          occupe={!!zip}
          onSignaler={data.isOwner ? undefined : signalerPhoto}
          onRetirer={data.isOwner ? undefined : retirerMaPhoto}
          onImageCassee={adresseCassee}
        />
      )}

    </main>
  )
}
