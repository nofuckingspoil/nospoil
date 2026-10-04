'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { initialesDe } from '../../../../lib/initiales'
import JSZip from 'jszip'
import { BRAND } from '../../../../lib/brand'
import { getOwnerToken, getGuest, getDeviceToken } from '../../../../lib/device'
import { brancherLesReveils, demarrerFileEnvoi } from '../../../../lib/file-envoi-web'
import { noterEtape, marquerOrganisateur } from '../../../../lib/etapes'
import { PELLICULE_DEFAUT, pelliculeParId, pellicules, cssTeinte, tamponDate, cuirePhoto } from '../../../../lib/film'
import Collage from '../../../../components/Collage'
import WrapInvite, { wrapDejaVu, oublierWrap } from '../../../../components/WrapInvite'
import Avis from '../../../../components/Avis'
import { accroche } from '../../../../lib/avis'
import { useLangue } from '../../../../components/Langue'
import OuvrirDansApp from '../../../../components/OuvrirDansApp'
import { InvitationTirages, CommandeTirages, MerciTirages } from '../../../../components/Tirages'

// Une imprimante au trait, dans le style des autres icônes de l'album.
function IconeImprimante({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <path d="M6 14h12v7H6z" />
    </svg>
  )
}
import { devisTirages, euros, formatTirage } from '../../../../lib/tirages'

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

function formatReveal(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
// Jour en toutes lettres, ex : « 3 février 2027 »
function formatJour(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return '' }
}
function formatTime(iso, locale = 'fr-FR') {
  try { return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}
// Date courte + heure, ex : « 12 juin · 14:32 »
// Le sur-titre de l'album : la date, jamais le type d'événement. La base ne
// sait pas si c'est un mariage ou un anniversaire, mais elle sait quel jour.
function formatLong(iso, locale = 'fr-FR') {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

function formatCourt(iso, locale = 'fr-FR') {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/[/.]/g, ' · ')
  } catch { return '' }
}

function formatStamp(iso, locale = 'fr-FR') {
  try {
    const d = new Date(iso)
    const jour = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    return `${jour} · ${formatTime(iso, locale)}`
  } catch { return formatTime(iso, locale) }
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
  const { t, locale } = useLangue()
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
        <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{t({ fr: 'Événement', en: 'Event', de: 'Event' })} · {data.hostNames || data.name}</div>
        <h3 className="h3" style={{ marginBottom: 22 }}>{t({ fr: "L'album arrive", en: 'The album is on its way', de: 'Das Album kommt gleich' })}</h3>
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
          🎞️ {t({
            fr: "Vos photos sont bien enregistrées. L'organisateur met la dernière main à l'album ; cette page s'ouvrira toute seule.",
            en: 'Your photos are safely saved. The host is putting the finishing touches to the album; this page will open by itself.',
            de: 'Ihre Fotos sind sicher gespeichert. Der Gastgeber legt letzte Hand an das Album; diese Seite öffnet sich von selbst.',
          })}
        </div>
      </main>
    )
  }

  return (
    <main className="screen screen-dark">
      <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{t({ fr: 'Événement', en: 'Event', de: 'Event' })} · {data.hostNames || data.name}</div>
      <h3 className="h3" style={{ marginBottom: 22 }}>{t({ fr: 'Développement en cours…', en: 'Developing…', de: 'Wird entwickelt…' })}</h3>

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
          {t({
            fr: `${cd.d}j ${cd.h}h ${cd.m}m ${cd.s}s · le ${formatReveal(data.revealAt, locale)}`,
            en: `${cd.d}d ${cd.h}h ${cd.m}m ${cd.s}s · ${formatReveal(data.revealAt, locale)}`,
            de: `${cd.d} T ${cd.h} Std ${cd.m} Min ${cd.s} Sek · ${formatReveal(data.revealAt, locale)}`,
          })}
        </div>
        <div className="notice" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
          🎞️ {t({
            fr: "Les souvenirs s'ouvriront pour tout le monde d'un coup, à l'heure dite.",
            en: 'The memories will open for everyone at once, right on time.',
            de: 'Die Erinnerungen öffnen sich für alle gleichzeitig, pünktlich zur angekündigten Zeit.',
          })}
        </div>
      </div>
    </main>
  )
}

// Formule dépassée, vu par l'organisateur. Lui seul arrive ici : les participants
// gardent l'écran neutre. On dit la raison et on donne la sortie dans le même
// écran : un album verrouillé sans bouton pour le déverrouiller serait cruel.
function QuotaGate({ data, id }) {
  const { t, lang } = useLangue()
  const q = data.quota || {}
  const prix = q.upgrade?.priceCents
    ? euros(q.upgrade.priceCents, lang)
    : null
  // Au plus grand palier, il n'y a plus de formule à acheter : le tarif se fait
  // à la main. Le bouton doit mener à nous, jamais vers un paiement qui n'existe
  // pas, sinon l'organisateur tourne en rond avec son album fermé.
  const surMesure = !q.upgrade?.maxGuests

  return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h3 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'L\'album attend votre formule', en: 'Your album is waiting for your plan', de: 'Ihr Album wartet auf Ihr Paket' })}</h3>
        <p className="muted small" style={{ marginBottom: 16 }}>
          {t({
            fr: <>Vous avez accueilli <strong>{q.guestCount}</strong> participants alors que votre formule
              en couvre <strong>{q.maxGuests}</strong>. Tout le monde a pu photographier normalement,
              rien n&apos;a été perdu : les photos vous attendent.</>,
            en: <>You welcomed <strong>{q.guestCount}</strong> guests but your plan
              covers <strong>{q.maxGuests}</strong>. Everyone could take photos as normal,
              nothing has been lost: the photos are waiting for you.</>,
            de: <>Sie hatten <strong>{q.guestCount}</strong> Gäste, Ihr Paket umfasst aber
              nur <strong>{q.maxGuests}</strong>. Alle konnten ganz normal fotografieren,
              nichts ist verloren: Die Fotos warten auf Sie.</>,
          })}
        </p>
        {surMesure ? (
          <a
            className="btn btn-accent"
            href={`mailto:${q.contactEmail || 'support@timetoflash.fr'}?subject=${encodeURIComponent(t({
              fr: `Plus de ${q.maxGuests} participants : ${data.name || 'mon événement'}`,
              en: `More than ${q.maxGuests} guests: ${data.name || 'my event'}`,
              de: `Mehr als ${q.maxGuests} Gäste: ${data.name || 'mein Event'}`,
            }))}`}
            style={{ display: 'block', marginBottom: 10 }}
          >
            {t({ fr: 'Nous écrire pour ouvrir l\'album', en: 'Write to us to open the album', de: 'Schreiben Sie uns, um das Album zu öffnen' })}
          </a>
        ) : (
          <Link
            className="btn btn-accent"
            href={`/event/${id}`}
            style={{ display: 'block', marginBottom: 10 }}
          >
            {t({
              fr: `Passer à ${q.upgrade.maxGuests} participants${prix ? ` (${prix})` : ''}`,
              en: `Upgrade to ${q.upgrade.maxGuests} guests${prix ? ` (${prix})` : ''}`,
              de: `Auf ${q.upgrade.maxGuests} Gäste erweitern${prix ? ` (${prix})` : ''}`,
            })}
          </Link>
        )}
        <p className="muted" style={{ fontSize: 12 }}>
          {surMesure
            ? t({
                fr: `Au-delà de ${q.maxGuests} participants, nous établissons un tarif sur mesure. Écrivez-nous, on ouvre l'accès dans la foulée.`,
                en: `Beyond ${q.maxGuests} guests, we set a custom price. Write to us and we'll open access straight away.`,
                de: `Ab ${q.maxGuests} Gästen erstellen wir ein individuelles Angebot. Schreiben Sie uns, wir schalten den Zugang sofort frei.`,
              })
            : t({
                fr: 'Vous ne réglez que la différence : ce que vous avez déjà payé reste acquis.',
                en: 'You only pay the difference: what you have already paid still counts.',
                de: 'Sie zahlen nur die Differenz: Was Sie bereits bezahlt haben, wird angerechnet.',
              })}
        </p>
      </div>
    </main>
  )
}

function CodeGate({ data, value, onChange, onSubmit, err }) {
  const { t } = useLangue()
  return (
    <main className="screen screen-cream center">
      <div className="card" style={{ maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h3 className="h3" style={{ marginBottom: 6 }}>{t({ fr: 'Album privé', en: 'Private album', de: 'Privates Album' })}</h3>
        <p className="muted small" style={{ marginBottom: 16 }}>
          {t({
            fr: `Les souvenirs de ${data.hostNames || data.name} sont protégés. Entrez le code communiqué par l'organisateur.`,
            en: `The memories of ${data.hostNames || data.name} are protected. Enter the code the host gave you.`,
            de: `Die Erinnerungen von ${data.hostNames || data.name} sind geschützt. Geben Sie den Code ein, den Sie vom Gastgeber erhalten haben.`,
          })}
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="text" placeholder={t({ fr: "Code d'accès", en: 'Access code', de: 'Zugangscode' })} value={value} onChange={(e) => onChange(e.target.value)} autoFocus
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: '.1em' }} />
          {err && <div className="err">{err}</div>}
          <button className="btn btn-accent" type="submit">{t({ fr: "Voir l'album", en: 'View the album', de: 'Album ansehen' })}</button>
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
// ============================================================
//  Une photo dans la visionneuse : la vignette d'abord, la nette ensuite.
//
//  La photo entière pèse environ 1 Mo. Jusqu'ici la visionneuse la demandait
//  directement, et l'écran restait noir le temps du téléchargement : une
//  seconde sur une bonne connexion, plusieurs dans une salle de mariage.
//
//  La vignette, elle, est déjà dans la mémoire du téléphone : il vient de
//  l'afficher dans la grille. On la montre donc tout de suite, agrandie et
//  floutée, et la photo nette la recouvre en fondu dès qu'elle arrive.
//  L'attente ne disparaît pas, elle cesse de se voir.
// ============================================================
function ImageDiapo({ ph, prioritaire, pelli, onCassee }) {
  const { t } = useLangue()
  const [nette, setNette] = useState(false)
  const alt = t({ fr: `Photo de ${ph.who}`, en: `Photo by ${ph.who}`, de: `Foto von ${ph.who}` })
  const vignette = ph.url
  // On affiche le rendu intermédiaire (1400 px), pas l'original : à l'oeil
  // c'est la même photo, et elle arrive quatre fois plus vite. Le fichier
  // d'origine reste réservé au téléchargement.
  const pleine = ph.viewUrl || ph.fullUrl || ph.url
  // Photo sans vignette (les envois d'avant la mini-version) : rien à
  // superposer, on affiche la pleine et c'est tout.
  const enDeux = !!vignette && vignette !== pleine
  const filtre = pelli.css || undefined

  if (!enDeux) {
    return (
      <img src={pleine} alt={alt} crossOrigin="anonymous" draggable={false}
        onError={onCassee} fetchPriority={prioritaire ? 'high' : 'low'}
        style={filtre ? { filter: filtre } : undefined} />
    )
  }

  return (
    <>
      {/* C'est la vignette qui donne ses dimensions au cadre : même photo,
          même proportion, donc la nette se pose exactement dessus. */}
      <img className="diapo-flou" src={vignette} alt="" aria-hidden="true"
        crossOrigin="anonymous" draggable={false}
        style={{ filter: `${filtre ? filtre + ' ' : ''}blur(14px)` }} />
      <img className={`diapo-nette${nette ? ' prete' : ''}`} src={pleine}
        alt={alt} crossOrigin="anonymous" draggable={false}
        onLoad={() => setNette(true)} onError={onCassee}
        fetchPriority={prioritaire ? 'high' : 'low'}
        style={filtre ? { filter: filtre } : undefined} />
    </>
  )
}

/**
 * Le rappel du vote, qu'on écarte du doigt comme une notification.
 *
 * La croix reste, mais elle demande de viser. Le geste qui vient tout seul,
 * quand un bandeau se pose en bas de l'écran, c'est de le pousser sur le côté :
 * c'est celui des notifications, tout le monde l'a déjà fait cent fois.
 */
function BandeauVote({ classe, onFermer }) {
  const { t } = useLangue()
  const [dx, setDx] = useState(0)
  const [glisse, setGlisse] = useState(false)
  const depart = useRef(null)

  function debut(e) {
    depart.current = e.touches[0].clientX
    setGlisse(true)
  }
  function bouge(e) {
    if (depart.current === null) return
    setDx(e.touches[0].clientX - depart.current)
  }
  function fin() {
    depart.current = null
    setGlisse(false)
    // Assez loin pour que ce soit un geste, pas un frôlement.
    if (Math.abs(dx) > 90) onFermer()
    else setDx(0)
  }

  return (
    <div
      className={classe}
      role="status"
      onTouchStart={debut}
      onTouchMove={bouge}
      onTouchEnd={fin}
      onTouchCancel={fin}
      style={
        dx
          ? {
              transform: `translateX(${dx}px)`,
              opacity: Math.max(0, 1 - Math.abs(dx) / 220),
              transition: glisse ? 'none' : 'transform .2s ease, opacity .2s ease',
            }
          : undefined
      }
    >
      <span className="vote-c" aria-hidden="true">♥</span>
      <span className="vote-t">{t({ fr: 'Votez pour vos photos préférées en touchant le cœur.', en: 'Vote for your favourite photos by tapping the heart.', de: 'Stimmen Sie für Ihre Lieblingsfotos ab, indem Sie auf das Herz tippen.' })}</span>
      <button className="vote-x" onClick={onFermer} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>✕</button>
    </div>
  )
}

// Au bout de combien de photos regardées la visionneuse rappelle le vote.
// Trois : le temps de comprendre qu'on feuillette, pas assez pour avoir déjà
// laissé passer sa préférée.
const COEUR_APRES = 3

function Diapo({ photos, index, setIndex, pelli, avecDate, favs, onFav, onClose, onDownload, occupe, onSignaler, onRetirer, onImageCassee, voteDit, onFermerVote }) {
  const { t, locale } = useLangue()
  const [dx, setDx] = useState(0)
  const [glisse, setGlisse] = useState(false)
  const [dy, setDy] = useState(0)   // le doigt qui chasse la photo vers le haut ou le bas
  const geste = useRef(null)
  const n = photos.length
  const p = photos[index]

  // Le même rappel qu'en bas de la galerie, et le même drapeau : celui qui
  // ferme l'un ferme l'autre. Les deux endroits valent d'être couverts (on
  // arrive au vote soit en parcourant, soit en regardant), mais le dire deux
  // fois à la même personne, c'est du harcèlement.
  const vues = useRef(new Set())
  const [assezVues, setAssezVues] = useState(false)
  useEffect(() => {
    if (assezVues) return
    vues.current.add(index)
    if (vues.current.size >= COEUR_APRES) setAssezVues(true)
  }, [index, assezVues])

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
    <div className="diapo" role="dialog" aria-modal="true" aria-label={t({ fr: `Photo ${index + 1} sur ${n}`, en: `Photo ${index + 1} of ${n}`, de: `Foto ${index + 1} von ${n}` })}
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
                <ImageDiapo ph={ph} prioritaire={j === index} pelli={pelli} onCassee={onImageCassee} />
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
        <button className="diapo-x" onClick={onClose} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>✕</button>
      </div>

      {/* Au doigt on fait glisser ; à la souris, on cherche une flèche. */}
      <button className="diapo-fleche g" onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0} aria-label={t({ fr: 'Photo précédente', en: 'Previous photo', de: 'Vorheriges Foto' })}>‹</button>
      <button className="diapo-fleche d" onClick={() => setIndex((i) => Math.min(n - 1, i + 1))}
        disabled={index === n - 1} aria-label={t({ fr: 'Photo suivante', en: 'Next photo', de: 'Nächstes Foto' })}>›</button>

      {voteDit && assezVues && <BandeauVote classe="diapo-vote" onFermer={onFermerVote} />}

      <div className="diapo-bas">
        <div className="diapo-qui">
          <b>{p.who}</b>
          <span>{formatStamp(p.takenAt, locale)}</span>
        </div>
        <div className="diapo-act">
          <button className={`diapo-b ${favs.has(p.id) ? 'on' : ''}`} onClick={() => onFav(p.id)}
            aria-pressed={favs.has(p.id)} aria-label={favs.has(p.id)
              ? t({ fr: 'Retirer des favoris', en: 'Remove from favourites', de: 'Aus Favoriten entfernen' })
              : t({ fr: 'Mettre en favori', en: 'Add to favourites', de: 'Zu Favoriten hinzufügen' })}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
              fill={favs.has(p.id) ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
            </svg>
            {p.favs > 0 && <span>{p.favs}</span>}
          </button>
          <button className="diapo-b" onClick={() => onDownload(p)} disabled={occupe}>
            {occupe ? '…' : `⤓ ${t({ fr: 'Télécharger', en: 'Download', de: 'Herunterladen' })}`}
          </button>
          {/* Sa propre photo se retire ; celle des autres se signale. Jamais les
              deux à la fois : on ne supprime pas le cliché d'autrui, et signaler
              le sien serait un détour absurde pour arriver au même endroit. */}
          {p.mine ? (
            onRetirer && (
              <button className="diapo-b" onClick={() => onRetirer(p)} aria-label={t({ fr: "Retirer ma photo de l'album", en: 'Remove my photo from the album', de: 'Mein Foto aus dem Album entfernen' })}>
                🗑 {t({ fr: 'Retirer ma photo', en: 'Remove my photo', de: 'Mein Foto entfernen' })}
              </button>
            )
          ) : (
            onSignaler && (
              <button className="diapo-b" onClick={() => onSignaler(p)} aria-label={t({ fr: 'Signaler cette photo', en: 'Report this photo', de: 'Dieses Foto melden' })}>
                ⚑ {t({ fr: 'Signaler', en: 'Report', de: 'Melden' })}
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
  const { t, lang, locale } = useLangue()
  const PELLICULES = pellicules(lang)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  // Plusieurs photographes à la fois : on veut souvent « les photos de la table
  // des copains », pas celles d'une seule personne. Vide = tout le monde.
  const [auteursChoisis, setAuteursChoisis] = useState(() => new Set())
  // La pellicule vaut pour l'écran comme pour le fichier emporté : ce que l'on
  // voit est ce que l'on enregistre.
  const [pelliculeId, setPelliculeId] = useState(PELLICULE_DEFAUT)
  const [avecDate, setAvecDate] = useState(false)
  // Les tirages posés de travers, comme sortis d'une boîte à chaussures. Droits
  // par défaut : l'inclinaison est un parti pris, elle se choisit.
  const [penche, setPenche] = useState(false)
  const pelli = pelliculeParId(pelliculeId, lang)
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
  // La pastille de sélection n'apparaît qu'une fois la façade dépassée : posée
  // dès l'arrivée, elle recouvrait « Revoir la révélation », le premier écran
  // étant celui que tout le monde voit.
  const [defile, setDefile] = useState(false)
  // Le rappel du vote, montré une seule fois par soirée et par appareil.
  const [voteDit, setVoteDit] = useState(false)
  const [lienCopie, setLienCopie] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  // Ce que la sélection prépare : un téléchargement, ou des tirages papier.
  // Le même geste (cocher des photos), deux sorties différentes.
  const [but, setBut] = useState('telecharger') // telecharger | tirages
  const [commande, setCommande] = useState(false)
  // La fenêtre qui propose les tirages : une seule fois par album et par
  // appareil, qu'on l'ait acceptée ou fermée.
  const [invitTirages, setInvitTirages] = useState(false)
  const [invitDejaVue, setInvitDejaVue] = useState(true)
  // Fermée, la fenêtre montre où la retrouver : une bulle sous « Imprimez »,
  // quelques secondes. Sans elle, « Plus tard » voulait dire « jamais ».
  const [rappelTirages, setRappelTirages] = useState(false)
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
      if (typeof garde?.penche === 'boolean') setPenche(garde.penche)
    } catch {}
  }, [])
  function choisirPellicule(id, date, incline = penche) {
    setPelliculeId(id); setAvecDate(date); setPenche(incline)
    try { localStorage.setItem('ttf-pellicule', JSON.stringify({ id, date, penche: incline })) } catch {}
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
        const qui = (p.who || t({ fr: 'invite', en: 'guest', de: 'gast' })).normalize('NFD').replace(/[^a-zA-Z0-9]/g, '')
        const ok = await enregistrer(blob, `timetoflash-${qui}.jpg`)
        if (ok) annoncer(t({ fr: 'Photo enregistrée', en: 'Photo saved', de: 'Foto gespeichert' }))
        else setZipErr(t({
          fr: 'Sur iPhone, appuyez longuement sur la photo puis choisissez « Ajouter aux photos ».',
          en: 'On iPhone, press and hold the photo, then choose “Save to Photos”.',
          de: 'Auf dem iPhone halten Sie das Foto gedrückt und wählen dann „Zu Fotos hinzufügen“.',
        }))
      } catch {
        setZipErr(t({
          fr: 'Téléchargement impossible : les photos n\'ont pas pu être relues. Réessayez dans un instant.',
          en: 'Download failed: the photos could not be loaded. Please try again in a moment.',
          de: 'Download nicht möglich: Die Fotos konnten nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.',
        }))
      }
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
          const safe = (p.who || t({ fr: 'invite', en: 'guest', de: 'gast' })).normalize('NFD').replace(/[^a-zA-Z0-9]/g, '')
          z.file(`timetoflash-${String(++i).padStart(3, '0')}-${safe}.jpg`, blob)
          reussies++
        } catch { i++ }
        setZip({ done: i, total: photos.length })
      }
      // Une archive vide s'enregistre sans rien dire et ne s'ouvre nulle part :
      // mieux vaut l'aveu d'échec que le fichier de 22 octets.
      if (reussies === 0) {
        setZipErr(t({
          fr: 'Téléchargement impossible : aucune photo n\'a pu être relue. Réessayez dans un instant.',
          en: 'Download failed: none of the photos could be loaded. Please try again in a moment.',
          de: 'Download nicht möglich: Keines der Fotos konnte geladen werden. Bitte versuchen Sie es gleich noch einmal.',
        }))
        return
      }
      const out = await z.generateAsync({ type: 'blob' })
      const ok = await enregistrer(out, 'timetoflash-photos.zip')
      if (ok) annoncer(reussies > 1
        ? t({ fr: `${reussies} photos enregistrées`, en: `${reussies} photos saved`, de: `${reussies} Fotos gespeichert` })
        : t({ fr: 'Photo enregistrée', en: 'Photo saved', de: 'Foto gespeichert' }))
      else setZipErr(t({
        fr: 'Sur iPhone, l\'archive s\'ouvre dans l\'application Fichiers.',
        en: 'On iPhone, the archive opens in the Files app.',
        de: 'Auf dem iPhone öffnet sich das Archiv in der App „Dateien“.',
      }))
    } catch (e) {
      setZipErr(t({ fr: 'Téléchargement impossible.', en: 'Download failed.', de: 'Download nicht möglich.' }))
    } finally { setZip(null) }
  }

  const [codeInput, setCodeInput] = useState('')
  const [codeErr, setCodeErr] = useState('')

  useEffect(() => {
    const g = getGuest(id)
    setMoi(g || null)
    setMoiId(g?.guestId || null)
  }, [id])

  // La pastille arrive quand la galerie commence, c'est-à-dire à l'instant où la
  // barre se colle en haut : on suit le bas de la façade plutôt qu'un nombre de
  // pixels, qui varierait avec la hauteur de la couverture.
  const grilleRef = useRef(null)
  const finRef = useRef(null)
  useEffect(() => {
    const verifier = () => {
      // Elle arrive dès que les photos commencent, pas quand la barre finit de
      // se coller : c'est en voyant les tirages qu'on a envie d'en choisir. On
      // laisse passer un tiers d'écran de photos, pour que choisir ait un sens.
      const g = grilleRef.current
      const colle = g ? g.getBoundingClientRect().top < window.innerHeight * 0.65 : false
      // ... et elle s'efface dès que le bouton de fin de page entre en scène :
      // deux actions empilées dans le même coin, c'est du bruit, et sur un
      // album court elles se recouvraient franchement.
      const f = finRef.current
      const finEnVue = f ? f.getBoundingClientRect().top < window.innerHeight - 8 : false
      setDefile(colle && !finEnVue)
    }
    verifier()
    window.addEventListener('scroll', verifier, { passive: true })
    window.addEventListener('resize', verifier)
    return () => {
      window.removeEventListener('scroll', verifier)
      window.removeEventListener('resize', verifier)
    }
  }, [])

  // Les photos restées en route repartent d'ici aussi.
  //
  // C'est le mail de révélation qui ramène tout le monde sur le site, et il
  // mène à l'album, pas au viseur. Une photo coincée le samedi soir dans une
  // salle sans réseau arrive donc au moment où l'on clique dans son mail le
  // mercredi, sans que personne ait rien à faire.
  useEffect(() => {
    brancherLesReveils()
    void demarrerFileEnvoi()
  }, [])

  // --- Le rappel du vote ---
  //
  // Le cœur existe depuis toujours, mais rien ne disait à quoi il sert : il
  // passait pour un « mettre de côté ». On le dit une fois, dans la galerie et
  // pas dans la visionneuse : c'est là que les gens sont, et c'est en voyant
  // défiler les tirages qu'on se met à en préférer.
  //
  // Il attend qu'on le ferme : un bandeau qui s'évapore tout seul se rate, et
  // celui-ci n'a qu'une occasion d'être lu.
  useEffect(() => {
    if (!id) return
    try { setVoteDit(!localStorage.getItem(`ttf_coeur_${id}`)) } catch {}
  }, [id])

  const fermerVote = useCallback(() => {
    setVoteDit(false)
    try { localStorage.setItem(`ttf_coeur_${id}`, '1') } catch {}
  }, [id])

  // Partager l'album : le lien public de la galerie, pas le lien personnel du
  // viseur, qui rouvrirait l'appareil de celui qui l'a envoyé.
  async function partagerAlbum() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/g/${id}` : ''
    if (!url) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      // Le nom de la soirée dans le TEXTE, pas seulement dans le titre : les
      // messageries ignorent le titre et ne collent que le texte et le lien.
      // Sans lui, on reçoit « les photos de la soirée » sans savoir laquelle.
      const nom = data?.hostNames || data?.name || ''
      // La marque est nommée : le lien voyage de messagerie en messagerie, et
      // c'est souvent la première fois qu'on entend parler de Time to Flash.
      const texte = nom
        ? t({
            fr: `L'album de ${nom} est disponible sur Time to Flash ! 📸`,
            en: `The album of ${nom} is now on Time to Flash! 📸`,
            de: `Das Album von ${nom} ist jetzt auf Time to Flash! 📸`,
          })
        : t({
            fr: 'Les photos de la soirée sont disponibles sur Time to Flash ! 📸',
            en: 'The photos from the event are now on Time to Flash! 📸',
            de: 'Die Fotos der Feier sind jetzt auf Time to Flash! 📸',
          })
      try { await navigator.share({ title: nom || 'Time to Flash', text: texte, url }); return } catch {}
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

  // Changer de filtre vide la sélection.
  //
  // Elle se gardait d'une personne à l'autre, et une note le disait. Mais le
  // téléchargement, lui, n'emporte que les photos cochées ET visibles : la
  // promesse était devenue fausse, et le compteur affichait un nombre qu'on ne
  // retrouvait nulle part à l'écran. Ce qu'on voit est ce qu'on emporte.
  const filtresPoses = `${vueFav}|${vue}|${[...auteursChoisis].sort().join(',')}`
  const filtresAvant = useRef(filtresPoses)
  useEffect(() => {
    if (filtresAvant.current === filtresPoses) return
    filtresAvant.current = filtresPoses
    setSelected(new Set())
  }, [filtresPoses])

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
  // La question ne surgit qu'une fois dix tirages passés sous les yeux. Avant,
  // on demande son avis à quelqu'un qui n'a encore rien vu.
  const [assezVu, setAssezVu] = useState(false)
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

  // Dix photos dépassées, c'est l'affaire de deux ou trois glissements de
  // pouce : assez pour avoir un avis, assez peu pour ne pas manquer ceux qui
  // referment l'onglet en chemin. On regarde le repère posé sous la dixième
  // vignette, plutôt que de compter des pixels : la hauteur d'une photo change
  // d'un téléphone à l'autre, le rang de la dixième non.
  const repereDixieme = useRef(null)
  useEffect(() => {
    if (!montrerAvis || assezVu || avisFerme) return
    // Un petit album n'a pas de dixième photo : la question ne venait jamais.
    // Là, on la pose après quelques secondes passées à regarder.
    if ((data?.photos?.length || 0) < 10) {
      const minuteur = setTimeout(() => setAssezVu(true), 8000)
      return () => clearTimeout(minuteur)
    }
    // On regarde à chaque défilement plutôt qu'avec un guetteur d'intersection :
    // celui-ci ne prévient qu'au moment où l'élément traverse l'écran, et
    // quelqu'un qui descend d'un grand coup de pouce le manque complètement.
    // Ici, la question se pose aussi bien en passant lentement qu'en arrivant
    // déjà plus bas.
    const verifier = () => {
      const cible = repereDixieme.current
      if (!cible) return
      if (cible.getBoundingClientRect().top < window.innerHeight * 0.55) {
        setAssezVu(true)
        window.removeEventListener('scroll', verifier)
      }
    }
    verifier()
    window.addEventListener('scroll', verifier, { passive: true })
    return () => window.removeEventListener('scroll', verifier)
    // On dépend de la liste brute et non de la liste filtrée : celle-ci n'est
    // calculée que plus bas, après les écrans d'attente, et un crochet ne peut
    // pas vivre après eux.
  }, [montrerAvis, assezVu, avisFerme, data?.photos?.length])

  // --- L'invitation aux tirages ---
  //
  // Elle attend la vingtième photo : c'est en ayant vu défiler la soirée qu'on
  // a envie de la tenir en main, pas en arrivant. Et elle attend que l'enquête
  // de satisfaction soit refermée : jamais deux fenêtres l'une sur l'autre.
  // Attendre seulement qu'elle soit refermée, pas qu'on y ait répondu : jusqu'au
  // 04/10/2026, tout participant qui n'avait pas répondu ne la voyait jamais.
  const repereTirages = useRef(null)
  useEffect(() => {
    if (!id || !data?.tirages) return
    try { setInvitDejaVue(!!localStorage.getItem(`ttf_tirages_${id}`)) } catch { setInvitDejaVue(false) }
  }, [id, data?.tirages])
  useEffect(() => {
    if (invitDejaVue || invitTirages || (montrerAvis && !avisFerme) || !peutRepondre) return
    const verifier = () => {
      const cible = repereTirages.current
      if (cible && cible.getBoundingClientRect().top < window.innerHeight * 0.5) {
        setInvitTirages(true)
        noterEtape('tirages_invitation', { eventId: id })
      }
    }
    window.addEventListener('scroll', verifier, { passive: true })
    return () => window.removeEventListener('scroll', verifier)
  }, [invitDejaVue, invitTirages, montrerAvis, avisFerme, peutRepondre])

  function fermerInvitTirages() {
    setInvitTirages(false)
    setInvitDejaVue(true)
    try { localStorage.setItem(`ttf_tirages_${id}`, '1') } catch {}
    setRappelTirages(true)
  }
  useEffect(() => {
    if (!rappelTirages) return
    const minuteur = setTimeout(() => setRappelTirages(false), 7000)
    return () => clearTimeout(minuteur)
  }, [rappelTirages])

  // Entrer dans la sélection pour imprimer. Ses favoris sont déjà cochés :
  // ce sont les photos qu'on a mises de côté, donc celles qu'on veut sur papier.
  // `source` : le bouton par lequel on arrive (suivi du parcours).
  function lancerTirages(source) {
    noterEtape('tirages_selection', { eventId: id, detail: source })
    if (invitTirages) fermerInvitTirages()
    const visibles = new Set((data?.photos || []).filter((p) => !p.hidden).map((p) => p.id))
    setBut('tirages')
    setSelected(new Set([...favs].filter((f) => visibles.has(f))))
    setSelecting(true)
  }

  // Retour du paiement Stripe : on fait confirmer la commande (c'est ce qui la
  // fait partir chez l'imprimeur), puis on dit merci. L'adresse est nettoyée
  // tout de suite, pour qu'un rechargement ne rejoue pas la scène.
  const [merci, setMerci] = useState(null) // null | { chargement } | réponse du serveur
  const retourPaiement = useRef(false)
  useEffect(() => {
    if (retourPaiement.current || !data) return
    const sp = new URLSearchParams(window.location.search)
    const quoi = sp.get('tirages')
    if (quoi !== 'merci' && quoi !== 'annule') return
    retourPaiement.current = true
    window.history.replaceState(null, '', window.location.pathname)
    setMontrerWrap(false)
    if (quoi === 'annule') { annoncer(t({ fr: 'Paiement annulé : rien n\'a été débité.', en: 'Payment cancelled: nothing has been charged.', de: 'Zahlung abgebrochen: Es wurde nichts abgebucht.' })); return }
    setMerci({ chargement: true })
    fetch('/api/tirages/confirmer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sp.get('commande') }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) noterEtape('tirages_paye', { eventId: id, detail: `${d.nombre} × ${d.format}` })
        setMerci(d.error ? { erreurLecture: d.error } : d)
      })
      .catch(() => setMerci({ erreurLecture: t({ fr: 'Connexion impossible.', en: 'Unable to connect.', de: 'Keine Verbindung möglich.' }) }))
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Arrivé par le mail « imprimez vos photos » : on ouvre directement la
  // sélection des tirages, une fois l'album chargé.
  const lienTirages = useRef(false)
  useEffect(() => {
    if (lienTirages.current || !data?.tirages) return
    if (new URLSearchParams(window.location.search).get('tirages') !== '1') return
    lienTirages.current = true
    setMontrerWrap(false)
    lancerTirages('mail')
  }, [data?.tirages]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFav(photoId) {
    const aime = favs.has(photoId)
    // La phrase a été comprise : on ne la répète pas.
    if (!aime && voteDit) fermerVote()
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
      .catch(() => setError(t({ fr: 'Connexion impossible.', en: 'Unable to connect.', de: 'Keine Verbindung möglich.' })))
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Une photo touchée dans le mail de révélation arrive ici (`?coeur=<photo>`) :
  // le cœur est posé, la photo s'ouvre en grand. Voter devient le geste qui
  // fait entrer dans l'album, au lieu d'une consigne qu'on oublie en route.
  const coeurMail = useRef(false)
  useEffect(() => {
    if (coeurMail.current || !(data?.revealed || data?.ownerPreview) || !Array.isArray(data.photos)) return
    const u = new URL(window.location.href)
    const pid = u.searchParams.get('coeur')
    if (!pid) return
    coeurMail.current = true
    u.searchParams.delete('coeur')
    window.history.replaceState(null, '', u)
    const i = data.photos.findIndex((p) => p.id === pid)
    if (i < 0) return
    // L'introduction animée passerait devant la photo : on vient pour elle.
    setMontrerWrap(false)
    if (!favs.has(pid)) toggleFav(pid)
    setDiapo(i)
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compteur de parcours : l'album révélé est à l'écran, pour un invité (pas
  // pour l'organisateur, pas derrière la porte du code). Le détail dit si
  // cette personne avait participé depuis ce téléphone ou vient seulement voir.
  useEffect(() => {
    if (!data) return
    if (data.isOwner) { marquerOrganisateur(id); return }
    if (!data.revealed || data.quotaBlocked || data.needCode) return
    noterEtape('album', { eventId: id, detail: getGuest(id)?.guestId ? 'participant' : 'visiteur' })
  }, [data, id])

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
        if (d.needCode) { setCodeErr(t({ fr: 'Code incorrect.', en: 'Incorrect code.', de: 'Falscher Code.' })); return }
        if (d.error) { setError(d.error); return }
        try { localStorage.setItem(`pellicule_gallery_${id}`, c) } catch {}
        setData(d)
      })
      .catch(() => setError(t({ fr: 'Connexion impossible.', en: 'Unable to connect.', de: 'Keine Verbindung möglich.' })))
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
    if (!window.confirm(t({
      fr: 'Supprimer définitivement cette photo ? Cette action est irréversible.',
      en: 'Delete this photo permanently? This cannot be undone.',
      de: 'Dieses Foto endgültig löschen? Dies kann nicht rückgängig gemacht werden.',
    }))) return
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== photoId) }))
    await fetch(`/api/events/${id}/photo?photoId=${photoId}`, {
      method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
    }).catch(() => {})
  }

  // Signaler la photo d'un autre. Elle est masquée sur-le-champ, jamais
  // supprimée : l'organisateur la voit toujours et peut la rétablir si le
  // signalement n'était pas fondé.
  async function signalerPhoto(p) {
    const ok = window.confirm(t({
      fr: "Signaler cette photo ?\n\n"
        + "Elle sera masquée immédiatement pour tout le monde, et l'organisateur en sera informé. "
        + "Elle n'est pas supprimée : il pourra la rétablir si le signalement n'était pas fondé.",
      en: 'Report this photo?\n\n'
        + 'It will be hidden for everyone straight away, and the host will be notified. '
        + 'It is not deleted: the host can restore it if the report was unfounded.',
      de: 'Dieses Foto melden?\n\n'
        + 'Es wird sofort für alle ausgeblendet, und der Gastgeber wird informiert. '
        + 'Es wird nicht gelöscht: Der Gastgeber kann es wiederherstellen, falls die Meldung unbegründet war.',
    }))
    if (!ok) return
    setDiapo(null)
    setData((d) => ({ ...d, photos: d.photos.filter((x) => x.id !== p.id) }))
    const r = await fetch(`/api/gallery/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-token': getDeviceToken() },
      body: JSON.stringify({ photoId: p.id }),
    }).catch(() => null)
    if (!r || !r.ok) {
      window.alert(t({
        fr: "Le signalement n'a pas pu être envoyé. Réessaie dans un instant.",
        en: 'The report could not be sent. Please try again in a moment.',
        de: 'Die Meldung konnte nicht gesendet werden. Bitte versuchen Sie es gleich noch einmal.',
      }))
      load()
      return
    }
    window.alert(t({
      fr: "C'est fait. La photo est masquée, et l'organisateur vient d'être prévenu.",
      en: 'Done. The photo is hidden, and the host has just been notified.',
      de: 'Erledigt. Das Foto ist ausgeblendet, und der Gastgeber wurde soeben informiert.',
    }))
  }

  // Retirer sa propre photo, longtemps après la soirée.
  //
  // La suppression n'existait que dans la seconde qui suit la prise de vue :
  // qui regrettait son cliché le lendemain n'avait plus aucun recours. La photo
  // appartient à qui l'a prise, elle part donc pour de bon, y compris pour
  // l'organisateur, et c'est dit avant de valider.
  async function retirerMaPhoto(p) {
    const ok = window.confirm(t({
      fr: "Retirer définitivement cette photo ?\n\n"
        + "Elle disparaîtra de l'album pour tout le monde, et les organisateurs n'y auront plus accès. "
        + "Cette action est irréversible.",
      en: 'Remove this photo permanently?\n\n'
        + 'It will disappear from the album for everyone, and the hosts will no longer have access to it. '
        + 'This cannot be undone.',
      de: 'Dieses Foto endgültig entfernen?\n\n'
        + 'Es verschwindet für alle aus dem Album, und auch die Gastgeber haben keinen Zugriff mehr darauf. '
        + 'Dies kann nicht rückgängig gemacht werden.',
    }))
    if (!ok) return
    setDiapo(null)
    setData((d) => ({ ...d, photos: d.photos.filter((x) => x.id !== p.id) }))
    const r = await fetch('/api/photo/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: p.id, deviceToken: getDeviceToken() }),
    }).catch(() => null)
    if (!r || !r.ok) {
      window.alert(t({
        fr: "La photo n'a pas pu être retirée. Réessaie dans un instant.",
        en: 'The photo could not be removed. Please try again in a moment.',
        de: 'Das Foto konnte nicht entfernt werden. Bitte versuchen Sie es gleich noch einmal.',
      }))
      load()
    }
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!data) return <main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>
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
  const pourTirages = but === 'tirages'
  // L'éventail de l'invitation : les photos les plus aimées du groupe, sinon
  // les premières de la soirée.
  const vedettes = [...data.photos.filter((p) => !p.hidden)]
    .sort((a, b) => (b.favs || 0) - (a.favs || 0))
    .slice(0, 3)
  // L'aperçu des pellicules : la première photo visible de la soirée. Sur ses
  // propres souvenirs, un rendu se juge en une seconde.
  const apercuUrl = (data?.photos || []).find((x) => !x.hidden)?.url || ''

  // Comment nommer le filtre en cours, du bouton au libellé de téléchargement :
  // un prénom si c'est une seule personne, un compte au-delà.
  const nomsChoisis = data.guests.filter((g) => auteursChoisis.has(g.id)).map((g) => g.name)
  const nomFiltre = auteursChoisis.size === 0 ? t({ fr: 'tout le monde', en: 'everyone', de: 'alle' })
    : nomsChoisis.length === 1 ? nomsChoisis[0]
      : t({ fr: `${auteursChoisis.size} photographes`, en: `${auteursChoisis.size} photographers`, de: `${auteursChoisis.size} Fotografen` })

  // « Tout cocher » s'ajoute à la sélection au lieu de la remplacer : sans quoi
  // passer de Pierre à Paul effaçait Pierre, et l'on ne pouvait pas emporter
  // les photos de plusieurs personnes en une fois.
  const tousCoches = photos.length > 0 && photos.every((p) => selected.has(p.id))
  function basculerTout() {
    setSelected((prev) => {
      // Le sens de la bascule se relit DANS la mise à jour, jamais depuis le
      // rendu : deux appuis rapprochés sont regroupés par React, et le second
      // travaillait alors sur un état déjà périmé, ce qui le rendait sans effet.
      const n = new Set(prev)
      const tous = photos.length > 0 && photos.every((p) => n.has(p.id))
      for (const p of photos) tous ? n.delete(p.id) : n.add(p.id)
      return n
    })
  }

  // Par ordre alphabétique : on cherche un prénom, pas un palmarès. Soi-même
  // reste en tête, c'est la seule ligne qu'on ouvre les yeux fermés.
  const auteurs = data.guests
    .map((g) => ({ ...g, n: data.photos.filter((p) => p.guestId === g.id).length }))
    .sort((a, b) => (b.id === moiId) - (a.id === moiId)
      || (a.name || '').localeCompare(b.name || '', lang, { sensitivity: 'base' }))
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
      {/* Arrivé depuis Messenger : l'album se regarde bien mieux ailleurs, et
          les photos s'y enregistrent vraiment dans la photothèque. */}
      <OuvrirDansApp />
      {data.ownerPreview && (
        <div className="notice notice-orga" style={{ marginBottom: 14 }}>
          👁️ {t({
            fr: <><strong>Aperçu organisateur</strong> : vous voyez les photos en avant-première. Vos participants ne pourront les découvrir qu'à la révélation, le {formatReveal(data.revealAt, locale)}.</>,
            en: <><strong>Host preview</strong>: you are seeing the photos early. Your guests will only discover them at the reveal, on {formatReveal(data.revealAt, locale)}.</>,
            de: <><strong>Gastgeber-Vorschau</strong>: Sie sehen die Fotos vorab. Ihre Gäste entdecken sie erst bei der Enthüllung am {formatReveal(data.revealAt, locale)}.</>,
          })}
        </div>
      )}
      {data.isOwner && (
        <div className="notice notice-orga small" style={{ marginBottom: 14 }}>
          🛠️ {t({
            fr: <><strong>Vous gérez cet album.</strong> Sur chaque photo : 🙈 pour la masquer aux participants (elle reste visible pour vous), 🗑️ pour la supprimer.</>,
            en: <><strong>You manage this album.</strong> On each photo: 🙈 to hide it from guests (you can still see it), 🗑️ to delete it.</>,
            de: <><strong>Sie verwalten dieses Album.</strong> Auf jedem Foto: 🙈, um es vor den Gästen auszublenden (für Sie bleibt es sichtbar), 🗑️, um es zu löschen.</>,
          })}
          {hiddenCount > 0 && <> {t({
            fr: `${hiddenCount} photo${hiddenCount > 1 ? 's' : ''} actuellement masquée${hiddenCount > 1 ? 's' : ''}.`,
            en: `${hiddenCount} photo${hiddenCount > 1 ? 's' : ''} currently hidden.`,
            de: `${hiddenCount} ${hiddenCount > 1 ? 'Fotos' : 'Foto'} derzeit ausgeblendet.`,
          })}</>}
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
              <span>{t({ fr: 'Vous organisez cette soirée', en: 'You are hosting this event', de: 'Sie sind Gastgeber dieser Feier' })}</span>
              <b>{t({ fr: 'Tableau de bord →', en: 'Dashboard →', de: 'Dashboard →' })}</b>
            </Link>
          )}
          <div className="album-nav">
            <button className="album-navbtn" onClick={() => setShowProfil(true)}>
              <span className="ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              </span>
              <em>{t({ fr: 'Profil', en: 'Profile', de: 'Profil' })}</em>
            </button>
            <span className="album-navspace" />
            <button className="album-navbtn" onClick={partagerAlbum}>
              <span className="ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" /></svg>
              </span>
              <em>{lienCopie ? t({ fr: 'Copié', en: 'Copied', de: 'Kopiert' }) : t({ fr: 'Partager', en: 'Share', de: 'Teilen' })}</em>
            </button>
          </div>

          {data.coverUrl ? (
            <div className="gal-cadre"><img src={data.coverUrl} alt="" /></div>
          ) : (
            <div className="gal-cadre gal-carte">
              <span className="perf" /><span className="perf bas" />
              <span className="obturateur" />
              <span className="ini">{initialesDe(data.hostNames || data.name)}</span>
              <span className="jour">{formatCourt(data.startsAt, locale)}</span>
            </div>
          )}
          <div className="gal-etat">
            🎉 {t({ fr: 'Album révélé', en: 'Album revealed', de: 'Album enthüllt' })}
            {data.expiresAt && <> · {t({
              fr: `en ligne jusqu'au ${formatJour(data.expiresAt, locale)}`,
              en: `online until ${formatJour(data.expiresAt, locale)}`,
              de: `online bis ${formatJour(data.expiresAt, locale)}`,
            })}</>}
          </div>
          <div className="gal-hero-date">{formatLong(data.startsAt, locale)}</div>
          <h1 className="gal-hero-nom">{data.hostNames || data.name}</h1>
          <div className="gal-hero-stats">
            {t({
              fr: `${data.photos.length} photo${data.photos.length > 1 ? 's' : ''} · ${data.guests.length} participant${data.guests.length > 1 ? 's' : ''}`,
              en: `${data.photos.length} photo${data.photos.length !== 1 ? 's' : ''} · ${data.guests.length} guest${data.guests.length !== 1 ? 's' : ''}`,
              de: `${data.photos.length} ${data.photos.length !== 1 ? 'Fotos' : 'Foto'} · ${data.guests.length} ${data.guests.length !== 1 ? 'Gäste' : 'Gast'}`,
            })}
          </div>
          <div className="gal-hero-actions">
            {/* En haut, c'est l'album entier : ce bouton vit au-dessus des
                filtres, avant qu'on ait trié quoi que ce soit. Celui du bas,
                lui, suit le filtre en cours. */}
            <button className="gal-hero-dl" disabled={!!zip} onClick={() => downloadAll(data.photos)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              {zip
                ? t({ fr: `Préparation… ${zip.done}/${zip.total}`, en: `Preparing… ${zip.done}/${zip.total}`, de: `Wird vorbereitet… ${zip.done}/${zip.total}` })
                : t({ fr: `Tout télécharger (${data.photos.length})`, en: `Download all (${data.photos.length})`, de: `Alle herunterladen (${data.photos.length})` })}
            </button>
            {data.tirages && data.photos.length > 0 && (
              <button className="gal-hero-revoir gal-hero-imprimer" onClick={() => lancerTirages('facade')}>
                <IconeImprimante size={15} /> {t({ fr: 'Commander mon tirage photo', en: 'Order my photo prints', de: 'Meine Fotoabzüge bestellen' })}
              </button>
            )}
            {data.photos.length > 1 && (
              <button className="gal-hero-revoir" onClick={() => { oublierWrap(id); setMontrerWrap(true) }}>
                ↺ {t({ fr: 'Revoir la révélation', en: 'Watch the reveal again', de: 'Enthüllung noch einmal ansehen' })}
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
            {t({
              fr: `${data.photos.length} photo${data.photos.length > 1 ? 's' : ''} · ${data.guests.length} participant${data.guests.length > 1 ? 's' : ''}`,
              en: `${data.photos.length} photo${data.photos.length !== 1 ? 's' : ''} · ${data.guests.length} guest${data.guests.length !== 1 ? 's' : ''}`,
              de: `${data.photos.length} ${data.photos.length !== 1 ? 'Fotos' : 'Foto'} · ${data.guests.length} ${data.guests.length !== 1 ? 'Gäste' : 'Gast'}`,
            })}
          </span>
        </span>
        {/* Les tirages, à portée de pouce pendant qu'on défile : le bouton
            de la façade disparaît dès la première photo passée. */}
        {data.tirages && data.photos.length > 0 && (
          <span className="gal-tir-ancre">
            <button className={`gal-creer ${rappelTirages ? 'gal-creer-signal' : ''}`} onClick={() => { setRappelTirages(false); lancerTirages('barre') }}>
              <IconeImprimante size={15} /><i>{t({ fr: 'Imprimez', en: 'Print', de: 'Drucken' })}</i>
            </button>
            {rappelTirages && (
              <>
                <span className="gal-tir-fleche" aria-hidden="true" />
                <span className="gal-tir-bulle" role="status" onClick={() => setRappelTirages(false)}>
                  {t({
                    fr: 'Vos tirages vous attendent ici, à tout moment.',
                    en: 'Your prints are waiting right here, any time.',
                    de: 'Ihre Abzüge warten hier auf Sie, jederzeit.',
                  })}
                </span>
              </>
            )}
          </span>
        )}
        {data.photos.length > 0 && (
          <button className="gal-creer" onClick={() => setMontrerCollage(true)}>
            <span aria-hidden="true">✦</span><i>{t({ fr: 'Créer', en: 'Create', de: 'Gestalten' })}</i>
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
            <span className="gal-fbtn-l">🎞️ {t({ fr: 'Effet photo', en: 'Photo effect', de: 'Fotoeffekt' })}</span>
            <span className="gal-fbtn-v">{pelli.nom}{avecDate && t({ fr: ' + date', en: ' + date', de: ' + Datum' })}</span>
          </button>
          <button className={`gal-fbtn ${panneau === 'vue' ? 'ouvert' : ''} ${vueFav !== 'tous' ? 'actif' : ''}`}
            aria-expanded={panneau === 'vue'}
            onClick={() => ouvrirPanneau('vue')}>
            <span className="gal-fbtn-l">♥ {t({ fr: 'Afficher', en: 'Show', de: 'Anzeigen' })}</span>
            <span className="gal-fbtn-v">
              {vueFav === 'miens'
                ? t({ fr: 'Mes favoris', en: 'My favourites', de: 'Meine Favoriten' })
                : vueFav === 'aimees'
                  ? t({ fr: 'Les plus aimées', en: 'Most liked', de: 'Am beliebtesten' })
                  : t({ fr: 'Toutes', en: 'All', de: 'Alle' })}
            </span>
          </button>
          {data.guests.length > 1 && (
            <button className={`gal-fbtn ${panneau === 'qui' ? 'ouvert' : ''} ${auteursChoisis.size > 0 ? 'actif' : ''}`}
              aria-expanded={panneau === 'qui'}
              onClick={() => ouvrirPanneau('qui')}>
              <span className="gal-fbtn-l">📷 {t({ fr: 'Photographe', en: 'Photographer', de: 'Fotograf' })}</span>
              <span className="gal-fbtn-v">{auteursChoisis.size === 0 ? t({ fr: 'Tout le monde', en: 'Everyone', de: 'Alle' }) : nomFiltre}</span>
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
                <span className="gal-opt-t">
                  {t({ fr: 'Toutes les photos', en: 'All photos', de: 'Alle Fotos' })}
                  <em>{t({ fr: `${data.photos.length} souvenirs`, en: `${data.photos.length} memories`, de: `${data.photos.length} Erinnerungen` })}</em>
                </span>
                <span className="gal-opt-c" aria-hidden="true">{vueFav === 'tous' ? '✓' : ''}</span>
              </button>
              <button className={`gal-opt ${vueFav === 'miens' ? 'on' : ''}`} disabled={favs.size === 0}
                onClick={() => { setVueFav('miens'); setPanneau(null) }}>
                <span className="gal-opt-t">
                  {t({ fr: 'Mes favoris', en: 'My favourites', de: 'Meine Favoriten' })}
                  <em>{favs.size === 0
                    ? t({ fr: 'Touchez le ♥ d\'une photo pour la garder de côté', en: 'Tap the ♥ on a photo to keep it aside', de: 'Tippen Sie auf das ♥ eines Fotos, um es zu merken' })
                    : t({
                        fr: `${favs.size} photo${favs.size > 1 ? 's' : ''} mise${favs.size > 1 ? 's' : ''} de côté`,
                        en: `${favs.size} photo${favs.size > 1 ? 's' : ''} kept aside`,
                        de: `${favs.size} ${favs.size > 1 ? 'Fotos' : 'Foto'} gemerkt`,
                      })}</em>
                </span>
                <span className="gal-opt-c" aria-hidden="true">{vueFav === 'miens' ? '✓' : ''}</span>
              </button>
              {/* Le palmarès de tout le monde, distinct de ses propres coups de
                  cœur : on veut savoir ce qui a plu aux autres. */}
              <button className={`gal-opt ${vueFav === 'aimees' ? 'on' : ''}`} disabled={lesAimees.length === 0}
                onClick={() => { setVueFav('aimees'); setPanneau(null) }}>
                <span className="gal-opt-t">
                  {t({ fr: 'Les plus aimées', en: 'Most liked', de: 'Am beliebtesten' })}
                  <em>{lesAimees.length === 0
                    ? t({ fr: 'Personne n\'a encore mis de ♥', en: 'Nobody has given a ♥ yet', de: 'Noch niemand hat ein ♥ vergeben' })
                    : t({
                        fr: `Le palmarès des ${lesAimees.length} photos aimées`,
                        en: `The ranking of the ${lesAimees.length} liked photo${lesAimees.length !== 1 ? 's' : ''}`,
                        de: `Die Rangliste der ${lesAimees.length} beliebten Fotos`,
                      })}</em>
                </span>
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
              <span className="gal-opt-t">
                {t({ fr: 'Date incrustée', en: 'Date stamp', de: 'Datumsstempel' })}
                <em>{t({ fr: 'Les chiffres orange dans le coin, comme sur un jetable', en: 'The orange digits in the corner, just like a disposable camera', de: 'Die orangefarbenen Ziffern in der Ecke, wie bei einer Einwegkamera' })}</em>
              </span>
            </button>
            <button className={`gal-opt ${penche ? 'on' : ''}`}
              role="checkbox" aria-checked={penche}
              onClick={() => choisirPellicule(pelliculeId, avecDate, !penche)}>
              <span className={`gal-case ${penche ? 'on' : ''}`} aria-hidden="true">{penche ? '✓' : ''}</span>
              <span className="gal-opt-t">
                {t({ fr: 'Tirages penchés', en: 'Tilted prints', de: 'Schräge Abzüge' })}
                <em>{t({ fr: 'Posés de travers, comme sortis d\'une boîte à chaussures', en: 'Scattered at an angle, as if tipped out of a shoebox', de: 'Schief hingelegt, wie aus einem Schuhkarton' })}</em>
              </span>
            </button>
            <button className="gal-panneau-ok" onClick={() => setPanneau(null)}>{t({ fr: 'Voir les photos', en: 'See the photos', de: 'Fotos ansehen' })}</button>
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
                placeholder={t({
                  fr: `Chercher parmi les ${auteurs.length} participants`,
                  en: `Search the ${auteurs.length} guests`,
                  de: `Unter den ${auteurs.length} Gästen suchen`,
                })} />
            )}
            <div className="gal-liste gal-liste-haute">
              <button className={`gal-opt ${auteursChoisis.size === 0 ? 'on' : ''}`}
                onClick={() => setAuteursChoisis(new Set())}>
                <span className="gal-opt-t">
                  {t({ fr: 'Tout le monde', en: 'Everyone', de: 'Alle' })}
                  <em>{t({ fr: `${data.photos.length} photos`, en: `${data.photos.length} photos`, de: `${data.photos.length} Fotos` })}</em>
                </span>
                <span className="gal-opt-c" aria-hidden="true">{auteursChoisis.size === 0 ? '✓' : ''}</span>
              </button>
              {auteursMontres.map((g) => (
                <button key={g.id} className={`gal-opt ${auteursChoisis.has(g.id) ? 'on' : ''}`}
                  onClick={() => basculerAuteur(g.id)}>
                  <span className="gal-opt-t">
                    {g.name}{g.id === moiId ? t({ fr: ' (moi)', en: ' (me)', de: ' (ich)' }) : ''}
                    <em>{t({
                      fr: `${g.n} photo${g.n > 1 ? 's' : ''}`,
                      en: `${g.n} photo${g.n !== 1 ? 's' : ''}`,
                      de: `${g.n} ${g.n !== 1 ? 'Fotos' : 'Foto'}`,
                    })}</em>
                  </span>
                  <span className="gal-opt-c" aria-hidden="true">{auteursChoisis.has(g.id) ? '✓' : ''}</span>
                </button>
              ))}
              {auteursMontres.length === 0 && <p className="gal-vide">{t({ fr: 'Aucun participant à ce nom.', en: 'No guest by that name.', de: 'Kein Gast mit diesem Namen.' })}</p>}
            </div>
            <button className="gal-panneau-ok" onClick={() => { setChercheQui(''); setPanneau(null) }}>
              {t({
                fr: `Voir les ${photos.length} photo${photos.length > 1 ? 's' : ''}`,
                en: photos.length === 1 ? 'See the photo' : `See the ${photos.length} photos`,
                de: photos.length === 1 ? 'Das Foto ansehen' : `Die ${photos.length} Fotos ansehen`,
              })}
            </button>
          </div>
        )}

        {/* La sortie des filtres vit DANS la barre collante, avec eux : posée
            en dessous, elle partait au premier défilement, et c'est justement
            filtré et défilé qu'on la cherche. */}
        {filtreActif() && !panneau && (
          <button className="gal-reinit" onClick={toutMontrer}>
            ✕ {t({ fr: 'Voir toutes les photos', en: 'See all photos', de: 'Alle Fotos ansehen' })}
          </button>
        )}
        </div>

        {/* Ce que voient les participants, par opposition à ce que vous seul voyez.
            Inutile tant que rien n'est masqué : il n'y aurait rien à trier. */}
        {data.isOwner && hiddenCount > 0 && (
          <>
            <div className="gal-lbl" style={{ marginTop: 12 }}>{t({ fr: 'Visibilité', en: 'Visibility', de: 'Sichtbarkeit' })}</div>
            <div className="chips">
              <button className={`chip ${vue === 'toutes' ? 'active' : ''}`} onClick={() => setVue('toutes')}>
                {t({ fr: 'Toutes', en: 'All', de: 'Alle' })} · {parAuteur.length}
              </button>
              <button className={`chip ${vue === 'visibles' ? 'active' : ''}`} onClick={() => setVue('visibles')}>
                {t({ fr: 'Vues par les participants', en: 'Seen by guests', de: 'Für Gäste sichtbar' })} · {parAuteur.filter((p) => !p.hidden).length}
              </button>
              <button className={`chip ${vue === 'masquees' ? 'active' : ''}`} onClick={() => setVue('masquees')}>
                {t({ fr: 'Masquées', en: 'Hidden', de: 'Ausgeblendet' })} · {parAuteur.filter((p) => p.hidden).length}
              </button>
            </div>
          </>
        )}

        {/* Emporter tout l'album se fait depuis l'en-tête, en un appui. Ici ne
            reste que ce qui dépend des filtres : choisir quelques photos, ou
            emporter le tri en cours (« les 12 de Rose »). Le bouton disparaît
            quand aucun filtre n'est posé : il dirait la même chose que celui
            du haut, deux fois. */}
        {/* Plus de rangée de téléchargement ici. Deux boutons suffisent, et
            chacun a son sens : celui de l'en-tête emporte l'album entier, celui
            de la fin de page emporte ce qu'on vient de parcourir, filtre
            compris. Un troisième au milieu, qui disait la même chose que celui
            du bas, ne faisait que semer le doute sur ce qui partirait. */}

      {photos.length === 0 ? (
        <div className="notice" style={{ marginTop: 16 }}>{t({ fr: 'Aucune photo pour ce filtre.', en: 'No photos for this filter.', de: 'Keine Fotos für diesen Filter.' })}</div>
      ) : (
        <div className="masonry" key={rejoue} ref={grilleRef} style={{ marginTop: 8 }}>
          {photos.map((p, i) => {
            const rot = ((i * 37) % 7) - 3 // rotation déterministe -3°..+3°
            return (
              <a key={p.id || i} className={`polaroid ${selecting && selected.has(p.id) ? 'pris' : ''}`}
                ref={i === 9 ? repereDixieme : i === Math.min(19, photos.length - 1) ? repereTirages : null}
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
                style={{ '--rot': penche ? `${rot}deg` : '0deg', animationDelay: `${Math.min(i * 55, 600)}ms`, opacity: p.hidden ? 0.5 : 1 }}>
                <div className="media">
                  {/* crossOrigin est indispensable au téléchargement : sans lui
                      le navigateur range la photo dans un coin de son cache où
                      le JavaScript n'a pas le droit d'aller la relire, et le zip
                      repartait vide. Avec, le zip réutilise ce qui est déjà là. */}
                  <img src={p.url} alt={t({ fr: `Photo de ${p.who}`, en: `Photo by ${p.who}`, de: `Foto von ${p.who}` })} loading="lazy" crossOrigin="anonymous" onError={adresseCassee}
                    style={pelli.css ? { filter: pelli.css } : undefined} />
                  {pelli.teinte && <div className="film-teinte" style={{ background: cssTeinte(pelli) }} />}
                  {pelli.halo > 0 && <div className="film-halo" style={{ opacity: pelli.halo }} />}
                  {pelli.vignette > 0 && <div className="film-vignette" style={{ opacity: pelli.vignette }} />}
                  {pelli.grain > 0 && <div className="film-grain" style={{ opacity: pelli.grain }} />}
                  {avecDate && <span className="film-date">{tamponDate(p.takenAt)}</span>}
                  {/* La coche est toujours posée, montrée par une classe sur la
                      page. La faire apparaître photo par photo obligeait React à
                      repasser sur les trois cents vignettes à chaque entrée en
                      sélection, et l'appui semblait mettre une seconde à agir. */}
                  <span className={`gal-coche ${selected.has(p.id) ? 'on' : ''}`} aria-hidden="true">
                    {selected.has(p.id) ? '✓' : ''}
                  </span>
                  {p.hidden && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(20,22,31,.85)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', padding: '4px 8px', borderRadius: 8, fontFamily: 'var(--font-mono)' }}>
                      🙈 {t({ fr: 'MASQUÉE', en: 'HIDDEN', de: 'AUSGEBLENDET' })}
                    </div>
                  )}
                  {data.isOwner && (
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button title={p.hidden
                        ? t({ fr: 'Réafficher aux participants', en: 'Show to guests again', de: 'Für Gäste wieder einblenden' })
                        : t({ fr: 'Masquer aux participants', en: 'Hide from guests', de: 'Vor Gästen ausblenden' })}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHide(p.id, !p.hidden) }}
                        style={ovBtn}>{p.hidden ? '👁️' : '🙈'}</button>
                      <button title={t({ fr: 'Supprimer définitivement', en: 'Delete permanently', de: 'Endgültig löschen' })}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePhoto(p.id) }}
                        style={ovBtn}>🗑️</button>
                    </div>
                  )}
                  {/* Le cœur reste anonyme : on montre le total, jamais qui a
                      aimé. Un vote qui se voit ne s'ose plus. */}
                  {!selecting && !p.hidden && (
                    <button
                      className={`gal-coeur ${favs.has(p.id) ? 'on' : ''}`}
                      aria-label={favs.has(p.id)
                        ? t({ fr: 'Retirer des favoris', en: 'Remove from favourites', de: 'Aus Favoriten entfernen' })
                        : t({ fr: 'Mettre en favori', en: 'Add to favourites', de: 'Zu Favoriten hinzufügen' })}
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
                  <span className="time">{formatStamp(p.takenAt, locale)}</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Au bout de deux cent quatre-vingt-dix-sept tirages, remonter chercher
          le bouton du haut n'est pas raisonnable. Celui-ci emporte ce qu'on
          vient de parcourir, filtre compris, et il est le seul objet lumineux
          de la fin de page : on ne peut pas le manquer. */}
      {photos.length > 0 && !selecting && (
        <button className="gal-fin-dl" ref={finRef} disabled={!!zip} onClick={() => downloadAll(photos)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
          </svg>
          {zip ? t({ fr: `Préparation… ${zip.done}/${zip.total}`, en: `Preparing… ${zip.done}/${zip.total}`, de: `Wird vorbereitet… ${zip.done}/${zip.total}` })
            : filtreActif()
              ? t({
                  fr: `Télécharger ces ${photos.length} photo${photos.length > 1 ? 's' : ''}`,
                  en: photos.length === 1 ? 'Download this photo' : `Download these ${photos.length} photos`,
                  de: photos.length === 1 ? 'Dieses Foto herunterladen' : `Diese ${photos.length} Fotos herunterladen`,
                })
              : t({ fr: `Tout télécharger (${photos.length})`, en: `Download all (${photos.length})`, de: `Alle herunterladen (${photos.length})` })}
        </button>
      )}

      {/* La question monte du bas une fois dix photos dépassées. Elle était
          posée en fin de page : au bout de cent dix-sept tirages, personne n'y
          arrivait jamais. Pas pendant la sélection ni la visionneuse, en
          revanche : on ne coupe pas quelqu'un en train de choisir ou de
          regarder. */}
      {montrerAvis && assezVu && !avisFerme && !selecting && diapo === null && !montrerCollage && photos.length > 0 && (
        <div className="avis-pop" onClick={(e) => { if (e.target === e.currentTarget) setAvisFerme(true) }}>
          <div className="avis-pop-carte">
            <Avis
              role="invite"
              compact
              accroche={accroche(lang)}
              payload={{ eventId: id, deviceToken: getDeviceToken() }}
              onClose={() => setAvisFerme(true)}
            />
          </div>
        </div>
      )}

      {/* Le profil : son prénom, et le chemin vers ses propres photos. Les mêmes
          deux lignes que sur le viseur, sans le lien personnel : la soirée est
          passée, il n'y a plus d'appareil à rouvrir. */}
      {showProfil && (
        <div className="modal-fond" onClick={() => setShowProfil(false)}>
          <div className="modal-carte" onClick={(e) => e.stopPropagation()}>
            <div className="modal-titre">{t({ fr: 'Mon profil', en: 'My profile', de: 'Mein Profil' })}</div>
            <p className="modal-nom">{moi?.name || t({ fr: 'Cet appareil', en: 'This device', de: 'Dieses Gerät' })}</p>
            <p className="modal-sous">
              {moi?.name
                ? t({
                    fr: 'Vos photos de la soirée sont signées de ce prénom.',
                    en: 'Your photos from the event are signed with this name.',
                    de: 'Ihre Fotos der Feier tragen diesen Namen.',
                  })
                : t({
                    fr: "Cet appareil n'a pas participé à cette soirée. Retrouvez vos propres photos ci-dessous.",
                    en: 'This device did not take part in this event. Find your own photos below.',
                    de: 'Dieses Gerät hat nicht an dieser Feier teilgenommen. Ihre eigenen Fotos finden Sie unten.',
                  })}
            </p>
            <a className="modal-btn" href="/mes-photos">📷 {t({ fr: 'Retrouver mes photos', en: 'Find my photos', de: 'Meine Fotos finden' })}</a>
            <button className="modal-btn modal-btn-clair" onClick={() => setShowProfil(false)}>{t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}</button>
          </div>
        </div>
      )}

      {/* Le rappel du vote, posé au-dessus de la pastille : il parle du cœur
          qui est sur chaque tirage, il doit donc vivre là où on les voit. */}
      {voteDit && defile && !selecting && photos.length > 0 && !panneau && diapo === null && !montrerCollage && (
        <BandeauVote classe="gal-vote" onFermer={fermerVote} />
      )}

      {/* La sélection s'ouvre et se ferme au même endroit : en bas, dans le
          pouce. Elle vivait en haut, dans un coin que la main n'atteint pas sur
          un grand téléphone, alors que la barre de sélection, elle, a toujours
          été en bas. On entrait par le haut et on sortait par le bas.
          La pastille s'efface dès qu'autre chose demande l'attention. */}
      {!selecting && defile && photos.length > 0 && !panneau && diapo === null && !montrerCollage && (
        <button className="gal-pastille" onClick={() => { setBut('telecharger'); setSelecting(true); setSelected(new Set()) }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          {t({ fr: 'Sélectionner', en: 'Select', de: 'Auswählen' })}
        </button>
      )}

      {selecting && (
        <div className="gal-bar">
          {/* Deux étages, et non quatre objets sur une ligne : le nombre choisi
              se retrouvait avec quarante pixels et coupait le mot « photo » en
              trois morceaux. C'est pourtant l'information la plus utile de la
              barre. Le bouton, lui, gagne toute la largeur et dit ce qu'il
              emporte : choisir des photos est le moment où l'on compte, pas
              celui où l'on déchiffre des abréviations. */}
          <div className="gal-bar-in">
            {/* La croix EST la sortie, à l'endroit exact où l'on est entré. */}
            <button className="gal-bar-fin" aria-label={t({ fr: 'Quitter la sélection', en: 'Exit selection', de: 'Auswahl beenden' })}
              onClick={() => { setSelecting(false); setSelected(new Set()); setBut('telecharger') }}>
              ✕
            </button>
            <span className="gal-bar-n">
              {aTelecharger.length === 0
                ? t({ fr: 'Aucune photo choisie', en: 'No photos selected', de: 'Keine Fotos ausgewählt' })
                : t({
                    fr: `${aTelecharger.length} photo${aTelecharger.length > 1 ? 's' : ''} choisie${aTelecharger.length > 1 ? 's' : ''}`,
                    en: `${aTelecharger.length} photo${aTelecharger.length > 1 ? 's' : ''} selected`,
                    de: `${aTelecharger.length} ${aTelecharger.length > 1 ? 'Fotos' : 'Foto'} ausgewählt`,
                  })}
              <em>
                {aTelecharger.length === 0
                  ? (pourTirages
                    ? t({ fr: 'Touchez les photos à recevoir en tirage', en: 'Tap the photos you want as prints', de: 'Tippen Sie auf die Fotos, die Sie als Abzug möchten' })
                    : t({ fr: 'Touchez les tirages à télécharger', en: 'Tap the photos to download', de: 'Tippen Sie auf die Fotos zum Herunterladen' }))
                  : tousCoches
                    ? t({ fr: 'l’album entier', en: 'the whole album', de: 'das ganze Album' })
                    : t({ fr: `sur ${photos.length}`, en: `of ${photos.length}`, de: `von ${photos.length}` })}
              </em>
            </span>
            <button className="gal-bar-tout" onClick={basculerTout}>
              {tousCoches
                ? t({ fr: 'Tout décocher', en: 'Deselect all', de: 'Alle abwählen' })
                : t({ fr: 'Tout cocher', en: 'Select all', de: 'Alle auswählen' })}
            </button>
          </div>
          {pourTirages ? (
            <button className="gal-bar-dl" disabled={aTelecharger.length === 0}
              onClick={() => setCommande(true)}>
              {aTelecharger.length === 0
                ? t({ fr: 'Sélectionnez des photos', en: 'Select some photos', de: 'Wählen Sie Fotos aus' })
                : t({
                    fr: `Commander ${aTelecharger.length > 1 ? `les ${aTelecharger.length} tirages` : 'le tirage'} (${euros(devisTirages(aTelecharger.length, '10x15', 'FR', lang).photos, lang)} hors livraison)`,
                    en: `Order ${aTelecharger.length > 1 ? `the ${aTelecharger.length} prints` : 'the print'} (${euros(devisTirages(aTelecharger.length, '10x15', 'FR', lang).photos, lang)} plus delivery)`,
                    de: `${aTelecharger.length > 1 ? `Die ${aTelecharger.length} Abzüge` : 'Den Abzug'} bestellen (${euros(devisTirages(aTelecharger.length, '10x15', 'FR', lang).photos, lang)} zzgl. Versand)`,
                  })}
            </button>
          ) : (
            <div className="gal-bar-actions">
              <button className="gal-bar-dl" disabled={!!zip || aTelecharger.length === 0}
                onClick={() => downloadAll(aTelecharger)}>
                {zip
                  ? t({ fr: `Préparation… ${zip.done}/${zip.total}`, en: `Preparing… ${zip.done}/${zip.total}`, de: `Wird vorbereitet… ${zip.done}/${zip.total}` })
                  : aTelecharger.length === 0
                    ? t({ fr: 'Sélectionnez des photos', en: 'Select some photos', de: 'Wählen Sie Fotos aus' })
                    : t({
                        fr: `⤓ Télécharger ${aTelecharger.length > 1 ? `les ${aTelecharger.length} photos` : 'la photo'}`,
                        en: `⤓ Download ${aTelecharger.length > 1 ? `the ${aTelecharger.length} photos` : 'the photo'}`,
                        de: `⤓ ${aTelecharger.length > 1 ? `Die ${aTelecharger.length} Fotos` : 'Das Foto'} herunterladen`,
                      })}
              </button>
              {/* Ce qu'on vient de choisir peut aussi partir sur papier : la
                  sélection est déjà faite, il ne reste qu'un appui. */}
              {data.tirages && (
                <button className="gal-bar-imp" disabled={!!zip || aTelecharger.length === 0}
                  onClick={() => {
                    noterEtape('tirages_selection', { eventId: id, detail: 'telechargement' })
                    setBut('tirages'); setCommande(true)
                  }}>
                  {t({ fr: 'Commander', en: 'Order', de: 'Bestellen' })}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {invitTirages && !selecting && diapo === null && !montrerCollage && (
        <InvitationTirages
          photos={vedettes}
          nbFavoris={[...favs].filter((f) => data.photos.some((p) => p.id === f && !p.hidden)).length}
          pelli={pelli}
          avecDate={avecDate}
          onChoisir={() => lancerTirages('invitation')}
          onFermer={fermerInvitTirages}
        />
      )}

      {merci && !merci.chargement && !merci.erreurLecture && (
        <MerciTirages
          photos={data.photos.filter((p) => (merci.photoIds || []).includes(p.id))}
          pelli={PELLICULES.find((f) => f.id === merci.rendu?.pellicule) || null}
          date={!!merci.rendu?.date}
          nombre={merci.nombre}
          formatNom={formatTirage(merci.format, lang).nom}
          total={merci.total}
          statut={merci.statut}
          cout={merci.imprimeur?.cout?.total ?? null}
          onFermer={() => setMerci(null)}
        />
      )}
      {merci?.chargement && (
        <div className="tir-ecran" role="status"><div className="tir-fait"><p className="tir-texte">{t({ fr: 'Confirmation du paiement…', en: 'Confirming payment…', de: 'Zahlung wird bestätigt…' })}</p></div></div>
      )}
      {merci?.erreurLecture && (
        <div className="tir-ecran" role="alert"><div className="tir-fait">
          <h2 className="tir-titre">{t({ fr: 'Paiement non confirmé', en: 'Payment not confirmed', de: 'Zahlung nicht bestätigt' })}</h2>
          <p className="tir-texte">{merci.erreurLecture} {t({
            fr: 'Si vous avez été débité, votre commande partira quand même : rien n\'est perdu.',
            en: 'If you have been charged, your order will still go out: nothing is lost.',
            de: 'Falls Ihnen etwas abgebucht wurde, wird Ihre Bestellung trotzdem versendet: Nichts geht verloren.',
          })}</p>
          <button className="tir-cta" onClick={() => setMerci(null)}>{t({ fr: 'Revenir à l\'album', en: 'Back to the album', de: 'Zurück zum Album' })}</button>
        </div></div>
      )}

      {commande && aTelecharger.length > 0 && (
        <CommandeTirages
          eventId={id}
          photos={aTelecharger}
          deviceToken={getDeviceToken()}
          pelli={pelli}
          avecDate={avecDate}
          onRetour={() => setCommande(false)}
          onTermine={() => { setCommande(false); setSelecting(false); setSelected(new Set()); setBut('telecharger') }}
        />
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
          voteDit={voteDit}
          onFermerVote={fermerVote}
        />
      )}

    </main>
  )
}
