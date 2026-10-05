'use client'

// ============================================================
//  Kit d'impression : affiche A4, chevalets de table, petits cartons.
//  Tout est imprimé par le navigateur (« Imprimer » ou « Enregistrer en PDF »),
//  sans dépendance ni service externe. Les styles d'impression vivent dans
//  globals.css, section « Kit d'impression ».
// ============================================================

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import Logo from '../../../../../components/Logo'
import { nomAffiche } from '../../../../../lib/event-defaults'
import { getOwnerToken } from '../../../../../lib/device'
import { useLangue } from '../../../../../components/Langue'
import { t as choisir } from '../../../../../lib/i18n'

// Le QR nu vient en premier : c'est ce que demandent le plus les organisateurs
// qui ont déjà leurs faire-part ou leur décoration et veulent juste l'intégrer.
const FORMATS = [
  {
    key: 'qr',
    label: { fr: 'QR code seul', en: 'QR code only', de: 'Nur QR-Code' },
    sub: { fr: 'Sans habillage, à intégrer à vos supports', en: 'No design, to add to your own materials', de: 'Ohne Gestaltung, zum Einbauen in Ihre eigenen Unterlagen' },
    per: { fr: 'plein cadre', en: 'full frame', de: 'Vollformat' },
  },
  {
    key: 'affiche',
    label: { fr: 'Affiche A4', en: 'A4 poster', de: 'A4-Poster' },
    sub: { fr: "Entrée, bar, vestiaire", en: 'Entrance, bar, cloakroom', de: 'Eingang, Bar, Garderobe' },
    per: { fr: '1 par page', en: '1 per page', de: '1 pro Seite' },
  },
  {
    key: 'chevalet',
    label: { fr: 'Chevalet de table', en: 'Table tent card', de: 'Tischaufsteller' },
    sub: { fr: 'À plier en deux', en: 'Fold in half', de: 'In der Mitte falten' },
    per: { fr: '2 par page', en: '2 per page', de: '2 pro Seite' },
  },
  {
    key: 'cartons',
    label: { fr: 'Petits cartons', en: 'Small cards', de: 'Kleine Kärtchen' },
    sub: { fr: 'À découper et disperser', en: 'Cut out and scatter around', de: 'Ausschneiden und verteilen' },
    per: { fr: '9 par page', en: '9 per page', de: '9 pro Seite' },
  },
]

// Nom de fichier lisible tiré du nom de l'événement.
function nomFichier(nom) {
  const defaut = choisir({ fr: 'evenement', en: 'event', de: 'event' })
  const base = (nom || defaut).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `qr-${base || defaut}.png`
}

// Date et heure : sur un carton, savoir « le 9 août » sans l'heure ne suffit pas
// à se tenir prêt au bon moment.
function dateHeure(iso, locale = 'fr-FR') {
  try {
    return new Date(iso).toLocaleString(locale, {
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

export default function PrintKit({ params }) {
  const { id } = use(params)
  const { t, lang, locale, lien } = useLangue()
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [qr, setQr] = useState('')
  // Le format vit dans l'adresse : la page reste partageable et rechargeable.
  // Le premier format de la liste est celui qu'on propose d'emblée : les deux
  // doivent rester d'accord, sinon la sélection ne correspond pas à l'ordre.
  const [format, setFormat] = useState(FORMATS[0].key)

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('f')
    if (FORMATS.some((x) => x.key === f)) setFormat(f)
  }, [])

  // L'aperçu est une A4 réelle (210 × 297 mm) réduite à la taille de l'écran.
  // Les tailles de texte du ticket sont en points, donc absolues : une feuille
  // qu'on rétrécirait en CSS garderait un texte à sa taille d'impression, et
  // le titre débordait alors de la page. On réduit donc la feuille entière.
  const boxRef = useRef(null)
  const [zoom, setZoom] = useState(0)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    // 210 mm en pixels CSS, mesuré plutôt que codé en dur.
    const regle = document.createElement('div')
    regle.style.cssText = 'position:absolute;visibility:hidden;width:210mm'
    document.body.appendChild(regle)
    const largeurA4 = regle.offsetWidth
    regle.remove()

    const ajuster = () => setZoom(box.clientWidth / largeurA4)
    ajuster()
    const ro = new ResizeObserver(ajuster)
    ro.observe(box)
    return () => ro.disconnect()
    // L'aperçu n'est monté qu'une fois l'événement chargé : sans cette
    // dépendance, la mesure tomberait sur un aperçu encore absent.
  }, [ev])

  function pickFormat(key) {
    setFormat(key)
    const u = new URL(window.location.href)
    u.searchParams.set('f', key)
    u.searchParams.delete('k')
    window.history.replaceState(null, '', u.pathname + u.search)
  }

  useEffect(() => {
    // Une clé dans l'adresse (?k=…) n'ouvre plus rien : voir le tableau de bord.
    if (new URLSearchParams(window.location.search).get('k')) {
      const u = new URL(window.location.href); u.searchParams.delete('k')
      window.history.replaceState(null, '', u.pathname + u.search)
    }
    const token = getOwnerToken(id)
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': token } })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setEv(d)))
      .catch(() => setError(choisir({ fr: "Impossible de charger l'événement.", en: 'Could not load the event.', de: 'Das Event konnte nicht geladen werden.' })))
  }, [id])

  useEffect(() => {
    // Résolution volontairement élevée : à l'impression, un QR de 440 px
    // ressort pixelisé dès qu'on dépasse quelques centimètres.
    const joinUrl = `${window.location.origin}/j/${id}`
    QRCode.toDataURL(joinUrl, { width: 1200, margin: 1, color: { dark: '#14161F', light: '#ffffff' } })
      .then(setQr).catch(() => {})
  }, [id])

  // Le QR affiché est calibré pour l'écran : pour un fichier destiné à être
  // repris ailleurs, on le régénère plus grand, sur fond blanc franc.
  async function telechargerQR() {
    try {
      const url = await QRCode.toDataURL(`${window.location.origin}/j/${id}`, {
        width: 2000, margin: 2, color: { dark: '#14161F', light: '#ffffff' },
      })
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier(nomAffiche(ev?.name, lang))
      a.click()
    } catch {}
  }

  if (error) {
    return (
      <main className="center-screen">
        <div style={{ textAlign: 'center' }}>
          <p className="muted" style={{ marginBottom: 16 }}>{error}</p>
          <Link href={`/event/${id}`} className="btn btn-ghost">← {t({ fr: 'Retour au tableau de bord', en: 'Back to the dashboard', de: 'Zurück zum Dashboard' })}</Link>
        </div>
      </main>
    )
  }
  if (!ev) return <main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>

  const title = nomAffiche(ev.name, lang)
  const who = ev.hostNames || ''
  const shots = ev.shotsPerGuest
  const reveal = dateHeure(ev.revealAt, locale)

  // Le générateur arrive avec le nom et la date de l'événement à la place de
  // l'exemple « Léa & Tom ». Le surtitre « Le mariage de » est vidé : rien ne
  // dit que c'est un mariage, et le nom le précise souvent déjà.
  let jour = ''
  try {
    jour = new Date(ev.startsAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {}
  const lienGenerateur = lien('/generateur-qr-code-mariage') + '?' + new URLSearchParams({
    url: `${window.location.origin}/j/${id}`,
    verrou: '1',
    titre: (ev.name || '').slice(0, 40),
    surtitre: '',
    date: jour,
  })

  // Bande de pellicule. En SVG et non en fond CSS : les navigateurs suppriment
  // les fonds à l'impression quand « graphiques d'arrière-plan » est décoché,
  // alors qu'un dessin SVG sort toujours.
  const Film = () => (
    <svg className="pk-film" viewBox="0 0 120 7" preserveAspectRatio="none" aria-hidden="true">
      <rect width="120" height="7" fill="#14161F" />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={1.6 + i * 5} y="1.9" width="2.9" height="3.2" rx=".7" fill="#F4EBDA" />
      ))}
    </svg>
  )

  // Bloc réutilisé par les trois formats.
  const Ticket = ({ size }) => (
    <div className={`pk-ticket pk-${size}`}>
      <Film />

      <div className="pk-body">
        <div className="pk-eyebrow">◉ {t({ fr: 'Appareil photo jetable', en: 'Disposable camera', de: 'Einwegkamera' })}</div>
        <div className="pk-title">{title}</div>
        {who && size !== 'sm' && <div className="pk-who">{who}</div>}

        {size !== 'sm' && <div className="pk-punch">{t({ fr: "Ce soir, le photographe c'est vous.", en: 'Tonight, you’re the photographer.', de: 'Heute Abend sind Sie der Fotograf.' })}</div>}

        {/* QR cadré comme un viseur */}
        <div className="pk-viewfinder">
          <span className="pk-c tl" /><span className="pk-c tr" />
          <span className="pk-c bl" /><span className="pk-c br" />
          <div className="pk-qr">{qr && <img src={qr} alt="" />}</div>
        </div>

        {/* Sur un carton de 7 cm, la formule longue frôle le trait de découpe. */}
        <div className="pk-cta">{size === 'sm'
          ? t({ fr: 'Scannez-moi', en: 'Scan me', de: 'Scannen Sie mich' })
          : t({ fr: 'Scannez · photographiez · disparaissez', en: 'Scan · shoot · vanish', de: 'Scannen · knipsen · verschwinden' })}</div>

        <div className="pk-badge">
          {t({
            fr: `${shots} clichés chacun${size === 'sm' ? '' : ', pas un de plus'}`,
            en: `${shots} shots each${size === 'sm' ? '' : ', not one more'}`,
            de: `${shots} Aufnahmen pro Person${size === 'sm' ? '' : ', keine einzige mehr'}`,
          })}
        </div>

        {/* Sur un carton de 7 cm, la formule complète déborderait : on garde
            l'essentiel, la date et l'heure. */}
        <div className="pk-reveal">
          {size === 'sm'
            ? t({ fr: 'Révélation le', en: 'Revealed on', de: 'Enthüllung am' })
            : t({ fr: 'Révélation commune des clichés le', en: 'All the shots revealed together on', de: 'Gemeinsame Enthüllung aller Aufnahmen am' })}
          <br />
          <strong>{reveal}</strong>
        </div>

        {size !== 'sm' && <div className="pk-foot">{t({ fr: 'Aucune appli à installer', en: 'No app to install', de: 'Keine App nötig' })} · timetoflash.fr</div>}
      </div>

      <Film />
    </div>
  )

  return (
    <>
      {/* ---------- Écran : réglages ---------- */}
      <main className="screen screen-cream pk-screen">
        {/* Le retour suit le défilement : l'aperçu est long, et il était
            auparavant seul tout en bas de la page. */}
        <div className="pk-top">
          <Link href={`/event/${id}`} className="pk-back">
            <span aria-hidden="true">←</span> {t({ fr: 'Tableau de bord', en: 'Dashboard', de: 'Dashboard' })}
          </Link>
          <Link href={`/event/${id}`} style={{ textDecoration: 'none' }}>
            <Logo nameSize={18} size={28} />
          </Link>
        </div>

        <h1 className="h2" style={{ marginTop: 22 }}>{t({ fr: "Kit d'impression", en: 'Print kit', de: 'Druck-Kit' })}</h1>
        <p className="lead" style={{ marginTop: 6 }}>
          {t({
            fr: "Choisissez un format, imprimez, posez. Vos participants n'ont plus qu'à scanner.",
            en: 'Choose a format, print, put it out. Your guests just have to scan.',
            de: 'Format wählen, drucken, aufstellen. Ihre Gäste müssen nur noch scannen.',
          })}
        </p>

        <div className="pk-formats">
          {FORMATS.map((f) => (
            <button key={f.key} type="button"
              className={`pk-format ${format === f.key ? 'on' : ''}`}
              onClick={() => pickFormat(f.key)}>
              <span className="tt">{t(f.label)}</span>
              <span className="ss">{t(f.sub)}</span>
              <span className="nn">{t(f.per)}</span>
            </button>
          ))}
          {/* Cinquième choix, qui mène ailleurs : le générateur public sait
              habiller l'affiche (couleurs, polices, mises en page). Il reçoit
              le lien de l'album verrouillé, seule chose qui ne doit pas bouger.
              Nouvel onglet : le générateur n'a pas de retour vers ce kit, on
              revient ici simplement en refermant l'onglet. */}
          <a className="pk-format" href={lienGenerateur} target="_blank" rel="noopener"
            style={{ textDecoration: 'none', paddingRight: 110 }}>
            <span className="tt">{t({ fr: 'Affiche personnalisée', en: 'Custom poster', de: 'Eigenes Poster' })}</span>
            <span className="ss">{t({ fr: 'Vos couleurs, vos polices, six mises en page', en: 'Your colours, your fonts, six layouts', de: 'Ihre Farben, Ihre Schriften, sechs Layouts' })}</span>
            <span style={{
              position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)',
              background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '8px 16px',
              fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
            }}>{t({ fr: 'Créer →', en: 'Create →', de: 'Erstellen →' })}</span>
          </a>
        </div>

        <button className="btn btn-accent" style={{ marginTop: 18 }} onClick={() => window.print()}>
          {t({ fr: 'Imprimer →', en: 'Print →', de: 'Drucken →' })}
        </button>
        {/* Le téléchargement ne vaut que pour le format sans habillage : sous
            « Petits cartons », il proposait un fichier sans rapport avec la
            page choisie juste au-dessus. */}
        {format === 'qr' && (
          <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={telechargerQR}>
            {t({ fr: 'Télécharger le QR code (.png)', en: 'Download the QR code (.png)', de: 'QR-Code herunterladen (.png)' })}
          </button>
        )}
        <p className="hint" style={{ textAlign: 'center', marginTop: 10 }}>
          {t({
            fr: "Astuce : dans la fenêtre d'impression, choisissez « Enregistrer en PDF » pour l'envoyer à un imprimeur.",
            en: 'Tip: in the print window, choose “Save as PDF” to send it to a print shop.',
            de: 'Tipp: Wählen Sie im Druckfenster „Als PDF speichern“, um es an eine Druckerei zu schicken.',
          })}
        </p>

        {/* Aperçu à l'écran */}
        <div className="pk-preview">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>{t({ fr: 'Aperçu', en: 'Preview', de: 'Vorschau' })}</div>
          <div className="pk-sheetbox" ref={boxRef}
            style={{ height: zoom ? `calc(297mm * ${zoom})` : undefined }}>
            <div className="pk-sheet" style={{ transform: `scale(${zoom || 0})` }}>
              <div className={`pk-page pk-page-${format}`}>
                {format === 'affiche' && <Ticket size="lg" />}
                {format === 'chevalet' && (<><Ticket size="md" /><div className="pk-fold" /><Ticket size="md" /></>)}
                {format === 'cartons' && Array.from({ length: 9 }, (_, i) => <Ticket key={i} size="sm" />)}
                {format === 'qr' && <div className="pk-qronly">{qr && <img src={qr} alt="" />}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Doublon assumé du retour collé en haut : arrivé au bout de l'aperçu,
            on est déjà là et on n'a pas à viser la barre. */}
        <Link href={`/event/${id}`} className="btn btn-ghost" style={{ marginTop: 20 }}>
          ← {t({ fr: 'Retour au tableau de bord', en: 'Back to the dashboard', de: 'Zurück zum Dashboard' })}
        </Link>
      </main>

      {/* ---------- Impression : la page réelle ---------- */}
      <div className={`pk-print pk-page-${format}`} aria-hidden="true">
        {format === 'affiche' && <Ticket size="lg" />}
        {format === 'chevalet' && (<><Ticket size="md" /><div className="pk-fold" /><Ticket size="md" /></>)}
        {format === 'cartons' && Array.from({ length: 9 }, (_, i) => <Ticket key={i} size="sm" />)}
        {format === 'qr' && <div className="pk-qronly">{qr && <img src={qr} alt="" />}</div>}
      </div>
    </>
  )
}
