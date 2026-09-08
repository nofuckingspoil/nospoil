'use client'

import { Suspense, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../lib/device'
import { MODE_OPTIONS, MODE_PROPOSE } from '../../lib/photo-mode'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, verificationRequise, SHOTS_MIN, SHOTS_MAX } from '../../lib/pricing'
import { fileToImage, compressToBlob } from '../../lib/camera'
import { DUREE_PROPOSEE_MIN } from '../../lib/rappels'
import { track } from '../../lib/tracking'
import TierPicker from '../../components/TierPicker'
import SelecteurDate from '../../components/SelecteurDate'
import PromoField from '../../components/PromoField'

// ---------- Petits utilitaires de date ----------

function atDay(daysAhead, hour, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
  return d
}

// Proposition par défaut pour la soirée : le prochain samedi à 19h.
function nextSaturday() {
  const d = new Date()
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7))
  d.setHours(19, 0, 0, 0)
  return d
}

// « Le lendemain à midi » n'a de sens que si la fête est finie : une soirée qui
// se termine à 14 h le lendemain repousse la proposition d'un jour de plus.
function apresLaFete(daysAhead, hour, debut, fin) {
  let d = atDay(daysAhead, hour, new Date(debut))
  const finMs = new Date(fin).getTime()
  let garde = 0
  while (Number.isFinite(finMs) && d.getTime() <= finMs && garde++ < 14) {
    d = new Date(d.getTime() + 24 * 3600 * 1000)
  }
  return d
}

// Minuit du jour d'une valeur de champ : pour comparer des jours, jamais des
// instants. « Le lendemain » se juge sur la date, pas sur les 24 heures.
function jourDe(v) {
  const d = new Date(v)
  if (isNaN(d.getTime())) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function toInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// « le dim. 13 sept. à 20:00 » : assez court pour tenir dans une pastille.
function frCourt(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return `le ${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

function frDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return '-'
  return d.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// Photo montrée tant que l'organisateur n'a pas choisi la sienne. Une vraie
// photo de soirée : une capture d'écran de l'application ne dit pas ce qu'est
// une couverture.
const COUVERTURE_EXEMPLE = '/journal/photos-invites-mariage-moments-spontanes.webp'

// ---------- Choix proposés ----------

// Les délais sont comptés à partir de la soirée, pas d'aujourd'hui :
// « le lendemain » = le lendemain de la fête.
const REVEAL_PRESETS = [
  { key: 'd1-12', em: '☕️', title: 'Le lendemain, à midi', sub: 'Le brunch d\'après fête', days: 1, hour: 12 },
  { key: 'd1-20', em: '🌙', title: 'Le lendemain, en soirée', sub: 'Le grand classique', days: 1, hour: 20 },
  { key: 'd7-20', em: '🗓️', title: 'Une semaine après', sub: 'Le temps que chacun fasse le tri', days: 7, hour: 20 },
  { key: 'custom', em: '✏️', title: 'Choisir une date précise', sub: 'Vous fixez le jour et l\'heure' },
]

const SHOT_PRESETS = [
  { n: 3, em: '💎', title: '3 clichés', sub: 'Très rare : chaque photo est un événement' },
  { n: 5, em: '🎞️', title: '5 clichés', sub: 'Le bon équilibre, recommandé' },
  { n: 8, em: '📸', title: '8 clichés', sub: 'Plus généreux, pour les longues soirées' },
]


// L'ORDRE DES ÉCRANS TIENT DANS CETTE LISTE.
//
// Une question par écran, et rien de plus. L'ordre n'est pas neutre : les trois
// premiers écrans ne demandent aucune réflexion (le nom, la date, la
// révélation sont ce que l'organisateur avait déjà en tête), la couverture
// arrive quand elle devient une récompense plutôt qu'une corvée, et le prix
// se pose en avant-dernier, une fois la personne investie. Il n'est pas caché
// pour autant : la ligne « X participants · tarif » reste affichée en haut de
// tous les écrans.
//
// Déplacer une question, c'est déplacer une ligne ici : plus aucun numéro
// d'étape n'est écrit ailleurs dans le fichier.
const ETAPES = [
  'nom',
  'debut',
  'fin',
  'revelation',
  'cliches',
  'revoir',
  'couverture',
  'formule',
  'final',
]

// ---------- Assistant ----------

function CreateForm() {
  const router = useRouter()
  const sp = useSearchParams()

  // La formule venue de la page d'accueil n'est qu'un point de départ : elle se
  // choisit sur le premier écran, et se change sans quitter l'assistant.
  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  const [tierOpen, setTierOpen] = useState(false)
  const tier = tierByGuests(maxGuests)

  // Un code promo change le montant réellement dû : c'est lui qui décide s'il
  // y a paiement, et ce qu'annonce le bouton final.
  const [promo, setPromo] = useState(null)
  const priceCents = promo ? promo.priceCents : tier.priceCents
  const isPaid = priceCents > 0

  // Neuf écrans plutôt que cinq, et pourtant l'assistant paraît plus court :
  // ce qui fatigue n'est pas le nombre d'écrans, c'est le nombre de décisions
  // par écran. Le numéro d'étape a disparu pour la même raison : la barre suffit
  // à situer, elle n'annonce pas la longueur du chemin.
  //
  // `step` est le rang dans ETAPES (1 = le premier écran), plus 'code' pour la
  // vérification par mail, qui vit en dehors du parcours.
  const [step, setStep] = useState(1)
  const TOTAL = ETAPES.length

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [shots, setShots] = useState(5)
  const [shotsCustom, setShotsCustom] = useState(false)
  const [photoMode, setPhotoMode] = useState(MODE_PROPOSE)
  const [startsAt, setStartsAt] = useState(toInputValue(nextSaturday()))
  // Fin de la fête : proposée six heures après le début, et modifiable. C'est
  // elle qui règle la cadence des rappels envoyés aux participants.
  const [endsAt, setEndsAt] = useState(toInputValue(new Date(nextSaturday().getTime() + DUREE_PROPOSEE_MIN * 60000)))
  const [revealKey, setRevealKey] = useState('d1-20')
  const [revealAt, setRevealAt] = useState(toInputValue(atDay(1, 20, nextSaturday())))
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  // Cadrage de la couverture, au format CSS « 50% 50% », et l'aperçu en grand.
  const [coverPos, setCoverPos] = useState('50% 50%')
  const [recadrage, setRecadrage] = useState(false)
  const [apercu, setApercu] = useState(false)
  const glisseRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  // Cases à cocher légales (jamais pré-cochées), cf. CGV art. 6 et 9.2.
  const [cgvOk, setCgvOk] = useState(false)
  const [waiverOk, setWaiverOk] = useState(false)

  function goTo(n) { setError(''); setStep(n) }

  // L'écran affiché, et le moyen d'en désigner un par son nom : « allerA(
  // 'cliches') » survit à un changement d'ordre, « goTo(4) » non.
  const ecran = ETAPES[step - 1] || 'final'
  const estEcran = (cle) => ecran === cle
  const allerA = (cle) => goTo(ETAPES.indexOf(cle) + 1)
  const suivant = () => goTo(step + 1)
  const precedent = () => goTo(Math.max(1, step - 1))

  // Changement de formule : on garde l'adresse à jour pour que le retour depuis
  // Stripe (ou un rafraîchissement) retombe sur la bonne formule.
  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `/create?tier=${n}`) } catch {}
  }

  // --- Recadrage : on déplace la photo dans son cadre, en pourcentages.
  // Même geste que dans le tableau de bord : glisser vers la droite fait
  // apparaître ce qui est à gauche, le point de cadrage suit l'inverse du doigt.
  function debutGlisse(e) {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const [x, y] = coverPos.split(' ').map((v) => parseInt(v, 10))
    glisseRef.current = { x0: e.clientX, y0: e.clientY, x, y, w: e.currentTarget.offsetWidth, h: e.currentTarget.offsetHeight }
  }
  function glisse(e) {
    const g = glisseRef.current
    if (!g) return
    const borne = (v) => Math.max(0, Math.min(100, Math.round(v)))
    setCoverPos(`${borne(g.x - ((e.clientX - g.x0) / g.w) * 100)}% ${borne(g.y - ((e.clientY - g.y0) / g.h) * 100)}%`)
  }
  function finGlisse() { glisseRef.current = null }

  function onCoverPick(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
    // Une nouvelle photo repart d'un cadrage centré : garder celui d'avant
    // reviendrait à recadrer une image qu'on n'a jamais vue.
    setCoverPos('50% 50%')
  }

  function pickReveal(p, debut = startsAt, fin = endsAt) {
    setRevealKey(p.key)
    if (p.key !== 'custom') setRevealAt(toInputValue(apresLaFete(p.days, p.hour, debut, fin)))
  }

  // Changer la fin peut déplacer la révélation : « le lendemain » doit rester
  // le lendemain de la fête.
  function pickFin(value) {
    setEndsAt(value)
    recalerRevelation(startsAt, value)
  }

  function recalerRevelation(debut, fin) {
    const preset = REVEAL_PRESETS.find((p) => p.key === revealKey)
    if (preset && preset.key !== 'custom' && !isNaN(new Date(debut))) {
      setRevealAt(toInputValue(apresLaFete(preset.days, preset.hour, debut, fin)))
    }
  }

  // Changer la date de la soirée emmène la fin avec elle (la fête garde sa
  // durée), et recale la révélation choisie (« le lendemain » doit rester le
  // lendemain de la fête).
  function pickStart(value) {
    setStartsAt(value)
    if (isNaN(new Date(value))) return
    const ecart = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)
    const minutes = Number.isFinite(ecart) && ecart > 0 ? ecart : DUREE_PROPOSEE_MIN
    const fin = toInputValue(new Date(new Date(value).getTime() + minutes * 60000))
    setEndsAt(fin)
    recalerRevelation(value, fin)
  }

  function pickShots(n) {
    setShots(n)
    setShotsCustom(false)
  }

  // Validation + passage à l'écran suivant. Chaque écran ne contrôle que sa
  // propre question : les jours impossibles étant déjà éteints dans les
  // calendriers, il ne reste ici que les cas qu'un calendrier ne peut pas
  // couvrir (une heure de fin plus tôt que le début, le même jour).
  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (estEcran('nom')) {
      if (!name.trim()) { setError('Donnez un nom à votre événement.'); return }
      return suivant()
    }
    if (estEcran('debut')) {
      if (!startsAt || isNaN(new Date(startsAt))) { setError('Indiquez la date de début de votre événement.'); return }
      return suivant()
    }
    if (estEcran('fin')) {
      if (!endsAt || isNaN(new Date(endsAt))) { setError('Indiquez la date de fin de votre événement.'); return }
      if (new Date(endsAt) <= new Date(startsAt)) {
        setError('La fin doit venir après le début de votre événement.'); return
      }
      return suivant()
    }
    if (estEcran('revelation')) {
      if (!revealAt || isNaN(new Date(revealAt))) { setError('Choisissez une date de révélation.'); return }
      if (new Date(revealAt) <= new Date(endsAt)) {
        setError('La révélation doit venir après la fin de votre événement.'); return
      }
      return suivant()
    }
    if (estEcran('final')) return submitEmail()
    return suivant()
  }

  // Étape 5 : on valide le mail, puis code de vérification (si activé) ou création directe.
  async function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.')
      return
    }
    if (!cgvOk) { setError('Merci d\'accepter les conditions générales pour continuer.'); return }
    // Renonciation au droit de rétractation : obligatoire uniquement pour les formules payantes.
    if (isPaid && PAYMENTS_ENABLED && !waiverOk) {
      setError('Merci de cocher la demande d\'exécution immédiate pour finaliser votre commande.')
      return
    }
    if (!verificationRequise(priceCents)) return handleCreate()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      setCode(''); setStep('code')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // Renvoyer un nouveau code.
  async function resendCode() {
    setError('')
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
    } catch (err) { setError(err.message) }
  }

  // Création de l'événement (ou passage au paiement si formule payante).
  async function handleCreate(e) {
    if (e) e.preventDefault()
    setError('')
    if (verificationRequise(priceCents) && code.replace(/\D/g, '').length !== 6) { setError('Entrez le code à 6 chiffres reçu par mail.'); return }
    setLoading(true)

    const payload = {
      ownerToken: getDeviceToken(), name, ownerEmail: email.trim(),
      code: code.replace(/\D/g, ''),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      revealAt: new Date(revealAt).toISOString(), shotsPerGuest: shots, photoMode,
      maxGuests: tier.maxGuests,
      // Preuve du consentement : le serveur pose lui-même l'horodatage.
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
    }

    // Formule payante : direction le paiement Stripe. L'événement sera créé au retour.
    if (isPaid && PAYMENTS_ENABLED) {
      try {
        // On met de côté la couverture (compressée) et le mail, le temps de l'aller-retour Stripe.
        if (coverFile) {
          try {
            const img = await fileToImage(coverFile)
            const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
            const dataUrl = await new Promise((resolve) => {
              const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob)
            })
            sessionStorage.setItem('declic_pending_cover', dataUrl)
            sessionStorage.setItem('declic_pending_coverpos', coverPos)
          } catch {}
        }
        sessionStorage.setItem('declic_pending_email', email.trim().toLowerCase())

        // Publicité : départ vers le paiement. C'est l'étape qui dit à Meta
        // « celui-là était à deux doigts d'acheter ».
        track('InitiateCheckout', {
          value: priceCents / 100,
          currency: 'EUR',
          content_name: `Formule ${tier.maxGuests} invités`,
        })

        const res = await fetch('/api/checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur.')
        window.location.href = data.url // redirection vers la page de paiement Stripe
        return
      } catch (err) { setError(err.message); setLoading(false); return }
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur.')
      rememberMyEvent(data.id)
      saveAccount(email.trim().toLowerCase())

      // Publicité : événement gratuit créé. C'est la conversion à optimiser sur
      // du trafic froid : l'inconnu vient de devenir utilisateur.
      track('Lead', {
        content_name: `Formule ${tier.maxGuests} invités`,
      }, { eventID: `lead_${data.id}` })

      // Upload de la photo de couverture (facultative), compressée côté navigateur
      if (coverFile) {
        try {
          const img = await fileToImage(coverFile)
          const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
          const fd = new FormData()
          fd.append('file', blob, 'cover.jpg')
          fd.append('ownerToken', getDeviceToken())
          await fetch(`/api/events/${data.id}/cover`, { method: 'POST', body: fd })
          // Le cadrage choisi dans l'assistant, posé juste après la photo :
          // sans lui, l'image reviendrait centrée et le recadrage n'aurait
          // servi à rien.
          if (coverPos !== '50% 50%') {
            await fetch(`/api/events/${data.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'x-owner-token': getDeviceToken() },
              body: JSON.stringify({ coverPos }),
            })
          }
        } catch {}
      }

      router.push(`/event/${data.id}`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const finalLabel = isPaid && PAYMENTS_ENABLED
    ? (loading ? 'Redirection vers le paiement…' : `Payer ${formatPrice(priceCents)} →`)
    : (loading ? 'Création…' : 'Créer mon événement →')

  const finalStepLabel = verificationRequise(priceCents)
    ? (loading ? 'Envoi du code…' : 'Continuer →')
    : finalLabel

  const stepNum = step === 'code' ? TOTAL : step

  return (
    <main className="screen screen-cream">
      <Link href="/" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      {/* Barre de progression */}
      <div className="wiz-head">
        <div className="wiz-progress">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i < stepNum ? 'done' : ''} />
          ))}
        </div>
        {/* Pas de « étape 4 sur 9 » : la barre situe déjà, et le compte
            décourage avant d'avoir commencé. */}
        <div className="wiz-headline">
          {/* Inutile sur l'écran de la formule, où le sélecteur est posé à
              demeure. Ailleurs, il s'ouvre sur place : l'ancien lien vers la
              grille de tarifs quittait la page et faisait perdre la saisie. */}
          {!estEcran('formule') && (
            <span className="wiz-tier">
              {tier.maxGuests} participants · <strong>{formatPrice(tier.priceCents)}</strong>{' '}
              <button type="button" className="linklike" onClick={() => setTierOpen(!tierOpen)}>
                {tierOpen ? 'fermer' : 'changer'}
              </button>
            </span>
          )}
        </div>
        {!estEcran('formule') && tierOpen && (
          <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen(false)} />
        )}
      </div>

      {isPaid && !PAYMENTS_ENABLED && (
        <div className="notice" style={{ marginTop: 12 }}>
          🎁 <strong>Offert pendant le lancement</strong> : le paiement en ligne arrive bientôt. Votre événement est créé sans frais pour l'instant.
        </div>
      )}

      {/* Le nom */}
      {estEcran('nom') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quelle est l'occasion ?</h2>
          <p className="wiz-sub">
            Ce nom s'affichera en grand sur l'écran d'accueil de vos participants.
            Vous pourrez le changer plus tard.
          </p>
          <div className="field">
            <label>Nom de l'événement</label>
            <input type="text" placeholder="Ex : Mariage de Marie & Paul" value={name}
              onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>

          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* Le début de la fête */}
      {estEcran('debut') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quand commence votre événement ?</h2>
          <p className="wiz-sub">L'appareil photo s'ouvre à cette heure-là. Modifiable plus tard.</p>
          {/* Le mois entier plutôt que la roulette du téléphone, et les jours
              passés éteints : on ne crée pas un événement pour samedi dernier. */}
          <SelecteurDate value={startsAt} onChange={pickStart} min={toInputValue(new Date())} />
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* La fin de la fête : même calendrier que le début, borné à celui-ci.
          Elle sert aussi, en coulisses, à répartir les rappels envoyés aux
          participants (voir lib/rappels.js), mais ce n'est pas une question
          qu'on pose ici : c'est notre affaire, pas la sienne. */}
      {estEcran('fin') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quand se termine votre événement ?</h2>
          <p className="wiz-sub">L'appareil photo se referme, plus personne ne photographie.</p>
          <SelecteurDate value={endsAt} onChange={pickFin} min={startsAt} />
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* Quand l'album s'ouvre pour tout le monde */}
      {estEcran('revelation') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Quand souhaitez-vous révéler les photos ?</h2>
          {/* Montrer plutôt que décrire : l'album tel qu'il restera jusqu'à la
              date choisie. Posé avant les propositions, il donne son sens à
              tout ce qui suit. */}
          <div className="wiz-revele" aria-hidden="true">
            <div className="wiz-revele-grille">
              <span className="wiz-revele-cache"><img src="/accueil/galerie-photos.webp" alt="" /></span>
              <span className="wiz-revele-cache"><img src="/accueil/album-partage.webp" alt="" /></span>
            </div>
            <span className="wiz-revele-badge">🕒 Révélation {frCourt(revealAt)}</span>
          </div>
          <div className="wiz-opts">
            {REVEAL_PRESETS.filter((p) => p.key !== 'custom').map((p) => (
              <button key={p.key} type="button"
                className={`wiz-opt ${revealKey === p.key ? 'on' : ''}`}
                onClick={() => pickReveal(p)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{p.title}</span><span className="ss">{p.sub}</span></span>
              </button>
            ))}
          </div>
          {revealKey === 'custom' ? (
            <SelecteurDate value={revealAt} onChange={setRevealAt} min={endsAt} />
          ) : (
            <button type="button" className="linklike wiz-skip"
              onClick={() => pickReveal(REVEAL_PRESETS.find((p) => p.key === 'custom'))}>
              Choisir une autre date
            </button>
          )}
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* Combien de clichés par participant */}
      {estEcran('cliches') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Combien de clichés par participant ?</h2>
          <p className="wiz-sub">La contrainte argentique : moins de poses, et chaque photo compte davantage.</p>
          <div className="wiz-opts">
            {SHOT_PRESETS.map((p) => (
              <button key={p.n} type="button"
                className={`wiz-opt ${!shotsCustom && shots === p.n ? 'on' : ''}`}
                onClick={() => pickShots(p.n)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{p.title}</span><span className="ss">{p.sub}</span></span>
              </button>
            ))}
            <button type="button" className={`wiz-opt ${shotsCustom ? 'on' : ''}`}
              onClick={() => { setShotsCustom(true); setShots((s) => (s <= 8 ? 10 : s)) }}>
              <span className="em">🎚️</span>
              <span><span className="tt">Nombre personnalisé</span><span className="ss">Jusqu'à {SHOTS_MAX} clichés</span></span>
            </button>
          </div>
          {shotsCustom && (
            <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
              <div className="stepper">
                <button type="button" onClick={() => setShots((s) => Math.max(SHOTS_MIN, s - 1))} aria-label="Moins">−</button>
                <span className="val">{shots}</span>
                <button type="button" onClick={() => setShots((s) => Math.min(SHOTS_MAX, s + 1))} aria-label="Plus">+</button>
              </div>
            </div>
          )}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* Ce que chacun revoit de ses propres photos */}
      {estEcran('revoir') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Peuvent-ils revoir leurs propres photos pendant la fête ?</h2>
          <p className="wiz-sub">
            Ce que chacun pourra faire de ses propres clichés pendant la fête. Ceux des
            autres restent cachés jusqu'à la révélation dans les trois cas.
          </p>
          <div className="wiz-opts">
            {MODE_OPTIONS.map((o) => (
              <button key={o.key} type="button"
                className={`wiz-opt ${photoMode === o.key ? 'on' : ''}`}
                onClick={() => setPhotoMode(o.key)}>
                <span className="em">{o.em}</span>
                <span><span className="tt">{o.title}</span><span className="ss">{o.court}</span></span>
              </button>
            ))}
          </div>
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* La photo de couverture (facultative).
          On ne montre plus un cadre de téléversement vide surmonté d'un aperçu
          minuscule : c'est la carte d'invitation qui occupe l'écran, en grand,
          avec ses actions posées dessous. On voit ce qu'on fabrique, pas le
          formulaire qui le fabrique. */}
      {estEcran('couverture') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Une photo de couverture ?</h2>


          <div className="wiz-carte">
            {/* L'écran du jour J, en entier et à l'identique : mêmes classes que
                /j/[id] (.cover, .h3, .lead, .btn-accent, la mention du bas),
                simplement mis à l'échelle. Rien n'est redessiné ici, donc rien
                ne peut diverger de ce que verront les participants. */}
            <div className={`wiz-vraie ${recadrage ? 'on' : ''}`}>
              <div className="wiz-vraie-ecran">
                <div className="cover"
                  onPointerDown={recadrage ? debutGlisse : undefined}
                  onPointerMove={recadrage ? glisse : undefined}
                  onPointerUp={recadrage ? finGlisse : undefined}
                  onPointerCancel={recadrage ? finGlisse : undefined}>
                  <img src={coverPreview || COUVERTURE_EXEMPLE} alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: coverPos }}
                    draggable={false} />
                  {recadrage && <span className="wiz-tel-guide">Faites glisser pour recadrer</span>}
                  {!coverPreview && !recadrage && <span className="wiz-exemple">Exemple</span>}
                </div>
                <h3 className="h3" style={{ margin: '22px 0 8px' }}>
                  Participez à l'événement {name.trim() || 'Votre événement'}
                </h3>
                <p className="lead small" style={{ marginBottom: 16 }}>
                  Prenez <strong>{shots} photos</strong> pendant la soirée. Elles resteront
                  cachées jusqu'à la révélation, le <strong>{frDate(revealAt)}</strong>.
                </p>
                <span className="btn btn-accent">Participer à l'album collectif →</span>
                <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
              </div>
            </div>

            <div className="wiz-carte-actions">
              <label className="btn btn-ghost">
                {coverPreview ? 'Changer' : 'Choisir une photo'}
                <input type="file" accept="image/*" onChange={onCoverPick} hidden />
              </label>
              {coverPreview && (
                <button type="button" className={`btn btn-ghost ${recadrage ? 'on' : ''}`}
                  onClick={() => setRecadrage(!recadrage)}>
                  {recadrage ? 'Terminer' : 'Recadrer'}
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setApercu(true)}>
                Agrandir
              </button>
            </div>
          </div>

          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
          {!coverPreview && (
            <button type="button" className="linklike wiz-skip" onClick={suivant}>Passer cette étape</button>
          )}
        </form>
      )}

      {/* L'aperçu en grand : la même réplique, à sa taille réelle. */}
      {apercu && (
        <div className="wiz-apercu-plein" role="dialog" aria-label="Aperçu participant"
          onClick={() => setApercu(false)}>
          <div className="wiz-vraie wiz-vraie-plein" onClick={(e) => e.stopPropagation()}>
            <div className="wiz-vraie-ecran">
              <div className="cover">
                <img src={coverPreview || COUVERTURE_EXEMPLE} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: coverPos }} />
              </div>
              <h3 className="h3" style={{ margin: '22px 0 8px' }}>
                Participez à l'événement {name.trim() || 'Votre événement'}
              </h3>
              <p className="lead small" style={{ marginBottom: 16 }}>
                Prenez <strong>{shots} photos</strong> pendant la soirée. Elles resteront
                cachées jusqu'à la révélation, le <strong>{frDate(revealAt)}</strong>.
              </p>
              <span className="btn btn-accent">Participer à l'album collectif →</span>
              <div className="footer-note">AUCUNE APPLI · DEPUIS LE NAVIGATEUR</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost wiz-apercu-fermer" onClick={() => setApercu(false)}>
            Fermer
          </button>
        </div>
      )}

      {/* La formule : combien de participants */}
      {estEcran('formule') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Combien serez-vous ?</h2>
          <p className="wiz-sub">
            C'est ce nombre qui fixe la formule. Une place de plus s'ajoute à tout
            moment, sans refaire l'événement.
          </p>
          {/* Le nombre de participants se demande, il ne se devine pas : la plupart
              des points d'entrée n'en portent aucun et retombaient sur la formule
              gratuite sans que personne ne l'ait choisie. */}
          <TierPicker value={maxGuests} onChange={pickTier} inline />
          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit">Continuer →</button>
          </div>
        </form>
      )}

      {/* Le mail et le récapitulatif */}
      {estEcran('final') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">Où vous envoyer votre accès ?</h2>
          <p className="wiz-sub">Votre adresse mail vous permet de retrouver votre tableau de bord, même en changeant de téléphone.</p>
          <div className="field">
            <label htmlFor="mail-orga">Votre adresse mail</label>
            <input type="email" id="mail-orga" name="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr"
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoFocus />
          </div>

          <div className="wiz-recap">
            <div className="wiz-recap-title">Récapitulatif</div>
            <div className="wiz-recap-row">
              <span>Événement</span>
              <span>{name} <button type="button" className="linklike" onClick={() => allerA('nom')}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Formule</span>
              <span>
                {tier.maxGuests} participants · {formatPrice(tier.priceCents)}{' '}
                <button type="button" className="linklike" onClick={() => allerA('formule')}>modifier</button>
              </span>
            </div>
            <div className="wiz-recap-row">
              <span>Début</span>
              <span>{frDate(startsAt)} <button type="button" className="linklike" onClick={() => allerA('debut')}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Fin</span>
              <span>{frDate(endsAt)} <button type="button" className="linklike" onClick={() => allerA('fin')}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Révélation</span>
              <span>{frDate(revealAt)} <button type="button" className="linklike" onClick={() => allerA('revelation')}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Clichés / participant</span>
              <span>{shots} <button type="button" className="linklike" onClick={() => allerA('cliches')}>modifier</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>Revoir ses photos</span>
              <span>
                {(MODE_OPTIONS.find((o) => o.key === photoMode) || MODE_OPTIONS[0]).title}{' '}
                <button type="button" className="linklike" onClick={() => allerA('revoir')}>modifier</button>
              </span>
            </div>
            <div className="wiz-recap-row">
              <span>Couverture</span>
              <span>{coverPreview ? 'Ajoutée' : 'Aucune'} <button type="button" className="linklike" onClick={() => allerA('couverture')}>modifier</button></span>
            </div>
            {tier.priceCents > 0 && (
              <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
            )}
          </div>

          <div className="wiz-legal">
            <label className="wiz-check">
              <input type="checkbox" name="cgv" checked={cgvOk} onChange={(e) => setCgvOk(e.target.checked)} />
              <span>
                J'accepte les <Link href="/cgv" target="_blank">conditions générales de vente</Link> et
                la <Link href="/politique-de-confidentialite" target="_blank">politique de confidentialité</Link>.
              </span>
            </label>
            {isPaid && PAYMENTS_ENABLED && (
              <label className="wiz-check">
                <input type="checkbox" name="renonciation" checked={waiverOk} onChange={(e) => setWaiverOk(e.target.checked)} />
                <span>
                  Je demande la création immédiate de mon événement et je renonce à mon
                  droit de rétractation de 14 jours.
                </span>
              </label>
            )}
          </div>

          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label="Retour">←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{finalStepLabel}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE bonus : Code reçu par mail */}
      {step === 'code' && (
        <form className="card wiz-card" onSubmit={handleCreate}>
          <h2 className="wiz-q">Vérifiez votre adresse</h2>
          <p className="wiz-sub">
            On vient d'envoyer un code à 6 chiffres à <strong>{email.trim()}</strong>. Saisissez-le pour créer votre événement.
          </p>
          <div className="field">
            <label>Code reçu par mail</label>
            <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
              style={{ fontFamily: 'var(--font-mono)', fontSize: 24, letterSpacing: '.3em', textAlign: 'center' }} />
          </div>
          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit" disabled={loading}>{finalLabel}</button>
          </div>
          <div className="hint" style={{ marginTop: 14, textAlign: 'center' }}>
            Pas reçu ?{' '}
            <button type="button" onClick={resendCode} className="linklike">Renvoyer le code</button>
            {' · '}
            <button type="button" onClick={() => allerA('final')} className="linklike">Changer d'adresse</button>
          </div>
        </form>
      )}

      {(estEcran('nom') || estEcran('formule') || estEcran('final')) && (
        <div className="footer-note" style={{ marginTop: 24 }}>PAIEMENT UNIQUE · SANS ABONNEMENT</div>
      )}
    </main>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <CreateForm />
    </Suspense>
  )
}
