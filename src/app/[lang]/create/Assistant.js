'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { getDeviceToken, getOwnerToken, rememberMyEvent, saveAccount } from '../../../lib/device'
import { modeOptions, MODE_PROPOSE } from '../../../lib/photo-mode'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, verificationRequise, SHOTS_MIN, SHOTS_MAX } from '../../../lib/pricing'
import { fileToImage, compressToBlob } from '../../../lib/camera'
import { DUREE_PROPOSEE_MIN } from '../../../lib/rappels'
import { maintenant, finProposee, REVELATION_PROPOSEE } from '../../../lib/event-defaults'
import { track } from '../../../lib/tracking'
import { noterEtape } from '../../../lib/etapes'
import TierPicker from '../../../components/TierPicker'
import SelecteurDate from '../../../components/SelecteurDate'
import PromoField from '../../../components/PromoField'
import { useLangue, SelecteurLangue } from '../../../components/Langue'
import { lireProvenance } from '../../../lib/provenance'
import QuestionDecouverte from '../../../components/QuestionDecouverte'
import { exempleNom } from '../../../lib/occasions'

// ---------- Petits utilitaires de date ----------

function atDay(daysAhead, hour, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, 0, 0, 0)
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
function frCourt(iso, lang = 'fr', locale = 'fr-FR') {
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const jour = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const heure = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  if (lang === 'en') return `on ${jour} at ${heure}`
  if (lang === 'de') return `am ${jour} um ${heure}`
  return `le ${jour} à ${heure}`
}

function frDate(iso, locale = 'fr-FR') {
  const d = new Date(iso)
  if (isNaN(d)) return '-'
  return d.toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// Photo montrée tant que l'organisateur n'a pas choisi la sienne. Une vraie
// photo de soirée : une capture d'écran de l'application ne dit pas ce qu'est
// une couverture.
const COUVERTURE_EXEMPLE = '/journal/photos-invites-mariage-moments-spontanes.webp'

// ---------- Choix proposés ----------

// Les délais sont comptés à partir de la soirée, pas d'aujourd'hui :
// « le lendemain » = le lendemain de la fête.
// Libellés en trois langues : à afficher avec t(p.title), t(p.sub).
const REVEAL_PRESETS = [
  { key: 'd1-12', em: '☕️', days: 1, hour: 12,
    title: { fr: 'Le lendemain, à midi', en: 'The next day, at noon', de: 'Am nächsten Tag, mittags' },
    sub: { fr: 'Le brunch d\'après fête', en: 'The morning-after brunch', de: 'Der Brunch nach der Feier' } },
  { key: 'd1-20', em: '🌙', days: 1, hour: 20,
    title: { fr: 'Le lendemain, en soirée', en: 'The next day, in the evening', de: 'Am nächsten Tag, abends' },
    sub: { fr: 'Le grand classique', en: 'The great classic', de: 'Der Klassiker' } },
  { key: 'd7-20', em: '🗓️', days: 7, hour: 20,
    title: { fr: 'Une semaine après', en: 'A week later', de: 'Eine Woche später' },
    sub: { fr: 'Le temps que chacun fasse le tri', en: 'Time for everyone to sort through their shots', de: 'Zeit, damit jeder aussortieren kann' } },
  { key: 'custom', em: '✏️',
    title: { fr: 'Choisir une date précise', en: 'Choose an exact date', de: 'Genaues Datum wählen' },
    sub: { fr: 'Vous fixez le jour et l\'heure', en: 'You set the day and time', de: 'Sie legen Tag und Uhrzeit fest' } },
]

const SHOT_PRESETS = [
  { n: 3, em: '💎',
    title: { fr: '3 clichés', en: '3 shots', de: '3 Aufnahmen' },
    sub: { fr: 'Très rare : chaque photo est un événement', en: 'Very rare: every photo is an event', de: 'Sehr selten: Jedes Foto ist ein Ereignis' } },
  { n: 5, em: '🎞️',
    title: { fr: '5 clichés', en: '5 shots', de: '5 Aufnahmen' },
    sub: { fr: 'Le bon équilibre, recommandé', en: 'The right balance, recommended', de: 'Die richtige Balance, empfohlen' } },
  { n: 8, em: '📸',
    title: { fr: '8 clichés', en: '8 shots', de: '8 Aufnahmen' },
    sub: { fr: 'Plus généreux, pour les longues soirées', en: 'More generous, for long parties', de: 'Großzügiger, für lange Feiern' } },
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

// VERSION TEST (03/10/2026) : le parcours court. Avant de payer, seulement ce
// qu'il faut pour créer la soirée ; le reste se règle après, sur les mêmes
// écrans, chacun pouvant être passé. Les réglages non demandés prennent les
// valeurs proposées (révélation le lendemain à midi, 5 clichés, album ouvert).
const PARCOURS = {
  long: ETAPES,
  court: ['nom', 'debut', 'fin', 'formule', 'final'],
  apres: ['bravo', 'revelation', 'cliches', 'bonus', 'revoir', 'couverture', 'decouverte', 'termine'],
}

// ---------- Assistant ----------

export function CreateForm({ parcours = 'long' }) {
  const { t, lang, locale, lien } = useLangue()
  const MODE_OPTIONS = modeOptions(lang)
  const router = useRouter()
  const sp = useSearchParams()

  // La formule venue de la page d'accueil n'est qu'un point de départ : elle se
  // choisit sur le premier écran, et se change sans quitter l'assistant.
  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  // Venu d'une page d'occasion (/anniversaire-30-ans…) : l'exemple de nom
  // parle de sa fête, pas d'un mariage.
  const occasion = sp.get('occasion')
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
  const apres = parcours === 'apres'
  // Une soirée déjà commencée a son nombre de clichés figé (règle des CGV) :
  // l'écran disparaît plutôt que de refuser à chaque essai.
  const [dejaCommence, setDejaCommence] = useState(false)
  const etapes = (PARCOURS[parcours] || ETAPES).filter((e) => !(apres && dejaCommence && (e === 'cliches' || e === 'bonus')))
  // La recharge : des photos en plus, offertes une fois la pellicule finie.
  const [bonus, setBonus] = useState(0)
  const [mailOrga, setMailOrga] = useState('')
  const TOTAL = etapes.length

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [shots, setShots] = useState(5)
  const [shotsCustom, setShotsCustom] = useState(false)
  const [photoMode, setPhotoMode] = useState(MODE_PROPOSE)
  // Dates proposées (voir lib/event-defaults.js) : début maintenant, fin le
  // lendemain à 8 h, révélation le lendemain à midi.
  const [depart] = useState(maintenant)
  const [startsAt, setStartsAt] = useState(() => toInputValue(depart))
  // Fin de la fête, modifiable. C'est elle qui règle la cadence des rappels
  // envoyés aux participants. Tant qu'on n'y a pas touché, elle suit le début
  // (« le lendemain à 8 h » du nouveau jour) ; ensuite, la fête garde sa durée.
  const [endsAt, setEndsAt] = useState(() => toInputValue(finProposee(depart)))
  const [finChoisie, setFinChoisie] = useState(false)
  const [revealKey, setRevealKey] = useState(REVELATION_PROPOSEE.key)
  const [revealAt, setRevealAt] = useState(() => toInputValue(apresLaFete(REVELATION_PROPOSEE.days, REVELATION_PROPOSEE.hour, depart, finProposee(depart))))
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  // Cadrage de la couverture, au format CSS « 50% 50% », et l'aperçu en grand.
  const [coverPos, setCoverPos] = useState('50% 50%')
  const [recadrage, setRecadrage] = useState(false)
  const [apercu, setApercu] = useState(false)
  const glisseRef = useRef(null)

  const [loading, setLoading] = useState(false)

  // Retour arrière depuis la page de paiement Stripe : le navigateur ressort
  // la page de sa mémoire, telle qu'on l'avait quittée, bouton « en cours »
  // compris. On rend la main, sinon on restait bloqué (pour ajouter un code
  // promo, par exemple).
  useEffect(() => {
    const auRetour = (e) => { if (e.persisted) setLoading(false) }
    window.addEventListener('pageshow', auRetour)
    return () => window.removeEventListener('pageshow', auRetour)
  }, [])
  const [error, setError] = useState('')
  const [code, setCode] = useState('')

  // Cases à cocher légales (jamais pré-cochées), cf. CGV art. 6 et 9.2.
  const [cgvOk, setCgvOk] = useState(false)
  const [waiverOk, setWaiverOk] = useState(false)

  function goTo(n) { setError(''); setStep(n) }

  // L'écran affiché, et le moyen d'en désigner un par son nom : « allerA(
  // 'cliches') » survit à un changement d'ordre, « goTo(4) » non.
  //
  // Le code reçu par mail a son propre écran. Il retombait sur 'final' ('code'
  // - 1 ne donne aucun rang) : le mail et le récapitulatif restaient affichés,
  // et le champ du code s'ajoutait en dessous, hors de la vue sur un téléphone.
  const ecran = step === 'code' ? 'code' : (etapes[step - 1] || 'final')
  const estEcran = (cle) => ecran === cle

  // Chaque écran s'ouvre par son haut : sans ça, on arrivait sur le nouvel
  // écran à la hauteur où l'on avait touché le bouton du précédent.
  useEffect(() => {
    try { window.scrollTo({ top: 0 }) } catch {}
  }, [step])
  // Compteur de parcours : chaque écran atteint, une fois par visite. Le
  // premier (le nom) s'affiche à l'arrivée, il porte donc le nom d'ouverture.
  useEffect(() => {
    if (apres) return
    noterEtape(ecran === 'nom' ? 'crea_ouverture' : `crea_${ecran}`, parcours === 'court' ? { detail: 'court' } : undefined)
  }, [ecran])

  const allerA = (cle) => goTo(etapes.indexOf(cle) + 1)
  // Après le paiement, le dernier écran mène au tableau de bord.
  const suivant = () => (apres && step >= TOTAL ? terminerReglages() : goTo(step + 1))

  // ---------- Le paramétrage après paiement (parcours « apres ») ----------
  //
  // La soirée existe déjà : on relit ses réglages, chaque écran enregistre le
  // sien en passant, et chacun peut être passé sans rien changer.
  const eventId = apres ? sp.get('event') : null
  const [reglagesLus, setReglagesLus] = useState(!apres)
  const reglagesFinis = useRef(false)
  useEffect(() => {
    if (!apres || !eventId) return
    fetch(`/api/events/${eventId}`, { headers: { 'x-owner-token': getOwnerToken(eventId) || getDeviceToken(), 'X-Langue': lang } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return }
        setName(d.name || '')
        if (d.startsAt) setStartsAt(toInputValue(new Date(d.startsAt)))
        // Figé seulement si la soirée a commencé ET qu'une photo a été prise.
        setDejaCommence(d.quotaLocked === true)
        setBonus(d.bonusShots ?? 0)
        setMailOrga(d.ownerEmail || '')
        // Où en était-il ? Le lien du mail et le changement de langue ramènent
        // au même réglage. Rien d'enregistré : arrivée juste après la création
        // (?debut=1), ou réglages déjà terminés, et alors place au tableau de bord.
        const ou = d.reglagesEtape
        const liste = PARCOURS.apres.filter((e) => !(d.quotaLocked === true && (e === 'cliches' || e === 'bonus')))
        if (ou && liste.includes(ou)) setStep(liste.indexOf(ou) + 1)
        else if (!ou && sp.get('debut') !== '1') { reglagesFinis.current = true; router.replace(lien(`/event/${eventId}`)); return }
        if (d.endsAt) setEndsAt(toInputValue(new Date(d.endsAt)))
        if (d.revealAt) {
          const lue = toInputValue(new Date(d.revealAt))
          setRevealAt(lue)
          // La proposition qui correspond à la date enregistrée, sinon « autre date ».
          const debut = d.startsAt ? toInputValue(new Date(d.startsAt)) : startsAt
          const fin = d.endsAt ? toInputValue(new Date(d.endsAt)) : endsAt
          const egale = REVEAL_PRESETS.find((p) => p.key !== 'custom' && toInputValue(apresLaFete(p.days, p.hour, debut, fin)) === lue)
          setRevealKey(egale ? egale.key : 'custom')
        }
        if (d.shotsPerGuest) { setShots(d.shotsPerGuest); setShotsCustom(!SHOT_PRESETS.some((p) => p.n === d.shotsPerGuest)) }
        if (d.photoMode) setPhotoMode(d.photoMode)
        if (d.maxGuests) setMaxGuests(d.maxGuests)
        if (d.coverUrl) setCoverPreview(d.coverUrl)
        if (d.coverPos) setCoverPos(d.coverPos)
      })
      .catch(() => {})
      .finally(() => setReglagesLus(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apres, eventId])

  // ---------- Le brouillon de la création ----------
  //
  // Changer de langue recharge la page : la saisie est gardée dans l'onglet
  // (sessionStorage), et l'on revient au même écran. Ni les cases légales ni
  // le code reçu par mail ne sont gardés : ils se redonnent en connaissance
  // de cause.
  const CLE_BROUILLON = `ttf_crea_${parcours}`
  // Prêt seulement au rendu qui suit la relecture : enregistrer avant
  // écraserait le brouillon par les valeurs de départ.
  const [brouillonPret, setBrouillonPret] = useState(false)
  useEffect(() => {
    if (apres) return
    try {
      const b = JSON.parse(sessionStorage.getItem(CLE_BROUILLON) || 'null')
      if (b) {
        if (b.name) setName(b.name)
        if (b.email) setEmail(b.email)
        if (b.startsAt) setStartsAt(b.startsAt)
        if (b.endsAt) setEndsAt(b.endsAt)
        setFinChoisie(!!b.finChoisie)
        if (b.revealKey) setRevealKey(b.revealKey)
        if (b.revealAt) setRevealAt(b.revealAt)
        if (b.shots) setShots(b.shots)
        setShotsCustom(!!b.shotsCustom)
        if (b.photoMode) setPhotoMode(b.photoMode)
        if (b.maxGuests) setMaxGuests(b.maxGuests)
        if (Number.isInteger(b.step) && b.step >= 1 && b.step <= TOTAL) setStep(b.step)
      }
    } catch {}
    setBrouillonPret(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (apres || !brouillonPret) return
    try {
      sessionStorage.setItem(CLE_BROUILLON, JSON.stringify({
        step: step === 'code' ? etapes.indexOf('final') + 1 : step,
        name, email, startsAt, endsAt, finChoisie, revealKey, revealAt, shots, shotsCustom, photoMode, maxGuests,
      }))
    } catch {}
  }, [apres, brouillonPret, step, name, email, startsAt, endsAt, finChoisie, revealKey, revealAt, shots, shotsCustom, photoMode, maxGuests])

  // Chaque réglage atteint est noté, une fois la soirée relue (sinon on
  // écraserait l'étape enregistrée par le premier écran).
  useEffect(() => {
    if (!apres || !reglagesLus || !eventId || step === 'code' || reglagesFinis.current) return
    noterReglage(ecran).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apres, reglagesLus, ecran])

  async function terminerReglages() {
    reglagesFinis.current = true
    setLoading(true)
    noterEtape('crea_reglages', { eventId })
    try { await noterReglage(null) } catch {}
    router.push(lien(`/event/${eventId}`))
  }

  // L'écran affiché est noté sur la soirée : c'est ce qui permet d'y revenir.
  function noterReglage(ecranCourant) {
    return fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(eventId) || getDeviceToken() },
      body: JSON.stringify({ reglagesEtape: ecranCourant }),
    })
  }

  async function envoyerDecouverte(reponse) {
    setLoading(true)
    try {
      await fetch(`/api/events/${eventId}/decouverte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(eventId) || getDeviceToken() },
        body: JSON.stringify({ ...reponse, provenance: lireProvenance() || {} }),
      })
    } catch {}
    setLoading(false)
    suivant()
  }

  async function enregistrerReglage() {
    const jeton = getOwnerToken(eventId) || getDeviceToken()
    const patch = (corps) => fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-owner-token': jeton, 'X-Langue': lang },
      body: JSON.stringify(corps),
    }).then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' })) })
    if (estEcran('revelation')) return patch({ revealAt: new Date(revealAt).toISOString() })
    if (estEcran('cliches')) return patch({ shotsPerGuest: shots })
    if (estEcran('bonus')) return patch({ bonusShots: bonus })
    if (estEcran('revoir')) return patch({ photoMode })
    if (estEcran('couverture') && coverFile) {
      const img = await fileToImage(coverFile)
      const blob = await compressToBlob(img, { maxSize: 1400, quality: 0.85 })
      const fd = new FormData()
      fd.append('file', blob, 'cover.jpg')
      fd.append('ownerToken', jeton)
      await fetch(`/api/events/${eventId}/cover`, { method: 'POST', body: fd })
      if (coverPos !== '50% 50%') await patch({ coverPos })
    }
  }
  const precedent = () => goTo(Math.max(1, step - 1))

  // Changement de formule : on garde l'adresse à jour pour que le retour depuis
  // Stripe (ou un rafraîchissement) retombe sur la bonne formule.
  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `${window.location.pathname}?tier=${n}${occasion ? `&occasion=${encodeURIComponent(occasion)}` : ''}`) } catch {}
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
    setFinChoisie(true)
    recalerRevelation(startsAt, value)
  }

  function recalerRevelation(debut, fin) {
    const preset = REVEAL_PRESETS.find((p) => p.key === revealKey)
    if (preset && preset.key !== 'custom' && !isNaN(new Date(debut))) {
      setRevealAt(toInputValue(apresLaFete(preset.days, preset.hour, debut, fin)))
    }
  }

  // Changer la date de la soirée emmène la fin avec elle, et recale la
  // révélation choisie (« le lendemain » doit rester le lendemain de la fête).
  // Fin jamais touchée : elle redevient « le lendemain à 8 h » du nouveau début.
  // Fin choisie : la fête garde la durée qu'on lui a donnée.
  function pickStart(value) {
    setStartsAt(value)
    if (isNaN(new Date(value))) return
    let fin
    if (!finChoisie) fin = toInputValue(finProposee(new Date(value)))
    else {
      const ecart = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)
      const minutes = Number.isFinite(ecart) && ecart > 0 ? ecart : DUREE_PROPOSEE_MIN
      fin = toInputValue(new Date(new Date(value).getTime() + minutes * 60000))
    }
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
  async function nextStep(e) {
    e.preventDefault()
    setError('')
    if (apres) {
      if (estEcran('revelation') && (isNaN(new Date(revealAt)) || new Date(revealAt) <= new Date(endsAt))) {
        setError(t({ fr: 'La révélation doit venir après la fin de votre événement.', en: 'The reveal must come after your event ends.', de: 'Die Enthüllung muss nach dem Ende Ihres Events liegen.' })); return
      }
      setLoading(true)
      try { await enregistrerReglage(); suivant() }
      catch (err) { setError(err.message) }
      finally { setLoading(false) }
      return
    }
    if (estEcran('nom')) {
      if (!name.trim()) { setError(t({ fr: 'Donnez un nom à votre événement.', en: 'Give your event a name.', de: 'Geben Sie Ihrem Event einen Namen.' })); return }
      return suivant()
    }
    if (estEcran('debut')) {
      if (!startsAt || isNaN(new Date(startsAt))) { setError(t({ fr: 'Indiquez la date de début de votre événement.', en: 'Enter the start date of your event.', de: 'Geben Sie das Startdatum Ihres Events an.' })); return }
      return suivant()
    }
    if (estEcran('fin')) {
      if (!endsAt || isNaN(new Date(endsAt))) { setError(t({ fr: 'Indiquez la date de fin de votre événement.', en: 'Enter the end date of your event.', de: 'Geben Sie das Enddatum Ihres Events an.' })); return }
      if (new Date(endsAt) <= new Date(startsAt)) {
        setError(t({ fr: 'La fin doit venir après le début de votre événement.', en: 'The end must come after your event starts.', de: 'Das Ende muss nach dem Beginn Ihres Events liegen.' })); return
      }
      return suivant()
    }
    if (estEcran('revelation')) {
      if (!revealAt || isNaN(new Date(revealAt))) { setError(t({ fr: 'Choisissez une date de révélation.', en: 'Choose a reveal date.', de: 'Wählen Sie ein Datum für die Enthüllung.' })); return }
      if (new Date(revealAt) <= new Date(endsAt)) {
        setError(t({ fr: 'La révélation doit venir après la fin de votre événement.', en: 'The reveal must come after your event ends.', de: 'Die Enthüllung muss nach dem Ende Ihres Events liegen.' })); return
      }
      return suivant()
    }
    if (estEcran('final')) return submitEmail()
    return suivant()
  }

  // Étape 5 : on valide le mail, puis code de vérification (si activé) ou création directe.
  async function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t({ fr: 'Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.', en: 'Enter a valid email address: it is how you will get back to your event.', de: 'Geben Sie eine gültige E-Mail-Adresse ein: Damit finden Sie Ihr Event wieder.' }))
      return
    }
    if (!cgvOk) { setError(t({ fr: 'Merci d\'accepter les conditions générales pour continuer.', en: 'Please accept the terms and conditions to continue.', de: 'Bitte akzeptieren Sie die AGB, um fortzufahren.' })); return }
    // Renonciation au droit de rétractation : obligatoire uniquement pour les formules payantes.
    if (isPaid && PAYMENTS_ENABLED && !waiverOk) {
      setError(t({ fr: 'Merci de cocher la demande d\'exécution immédiate pour finaliser votre commande.', en: 'Please tick the request for immediate performance to complete your order.', de: 'Bitte bestätigen Sie die sofortige Ausführung, um Ihre Bestellung abzuschließen.' }))
      return
    }
    if (!verificationRequise(priceCents)) return handleCreate()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), langue: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
      setCode(''); setStep('code')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  // Renvoyer un nouveau code.
  async function resendCode() {
    setError('')
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), langue: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
    } catch (err) { setError(err.message) }
  }

  // Création de l'événement (ou passage au paiement si formule payante).
  async function handleCreate(e) {
    if (e) e.preventDefault()
    setError('')
    if (verificationRequise(priceCents) && code.replace(/\D/g, '').length !== 6) { setError(t({ fr: 'Entrez le code à 6 chiffres reçu par mail.', en: 'Enter the 6-digit code you received by email.', de: 'Geben Sie den 6-stelligen Code aus der E-Mail ein.' })); return }
    setLoading(true)

    const payload = {
      ownerToken: getDeviceToken(), name, ownerEmail: email.trim(),
      code: code.replace(/\D/g, ''),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      revealAt: new Date(revealAt).toISOString(), shotsPerGuest: shots, photoMode,
      maxGuests: tier.maxGuests,
      flow: parcours === 'court' ? 'nouveau' : 'long',
      // D'où vient l'organisateur (site, campagne, page d'arrivée).
      provenance: lireProvenance() || {},
      // Preuve du consentement : le serveur pose lui-même l'horodatage.
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
      // Langue de l'organisateur : ses mails partiront dans cette langue.
      langue: lang,
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
        if (parcours === 'court') sessionStorage.setItem('ttf_parametrer', '1')
        else sessionStorage.removeItem('ttf_parametrer')

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
        if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
        noterEtape('crea_paiement', { detail: `formule_${tier.maxGuests}` })
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
      if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
      rememberMyEvent(data.id)
      saveAccount(email.trim().toLowerCase())
      try { sessionStorage.removeItem(CLE_BROUILLON) } catch {}
      noterEtape('crea_termine', { eventId: data.id, detail: 'gratuit' })

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

      router.push(parcours === 'court' ? lien(`/create/parametrer?event=${data.id}&debut=1`) : `/event/${data.id}?cree=1`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const finalLabel = isPaid && PAYMENTS_ENABLED
    ? (loading
        ? t({ fr: 'Redirection vers le paiement…', en: 'Taking you to payment…', de: 'Weiterleitung zur Zahlung…' })
        : t({ fr: `Payer ${formatPrice(priceCents, lang)} →`, en: `Pay ${formatPrice(priceCents, lang)} →`, de: `${formatPrice(priceCents, lang)} bezahlen →` }))
    : (loading
        ? t({ fr: 'Création…', en: 'Creating…', de: 'Wird erstellt…' })
        : t({ fr: 'Créer mon événement →', en: 'Create my event →', de: 'Mein Event erstellen →' }))

  const finalStepLabel = verificationRequise(priceCents)
    ? (loading ? t({ fr: 'Envoi du code…', en: 'Sending the code…', de: 'Code wird gesendet…' }) : t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' }))
    : finalLabel

  const stepNum = step === 'code' ? TOTAL : step

  return (
    <main className="screen screen-cream">
      <div className="wiz-haut">
        <Link href={lien('/')} style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        {/* Changer de langue recharge la page : la création garde son
            brouillon, les réglages d'après paiement leur étape enregistrée. */}
        {step !== 'code' && <SelecteurLangue />}
      </div>

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
          {apres && (
            !['bravo', 'decouverte', 'termine'].includes(ecran) && <span className="wiz-tier">{t({ fr: `Réglage ${step - 1} sur ${TOTAL - 3}`, en: `Setting ${step - 1} of ${TOTAL - 3}`, de: `Einstellung ${step - 1} von ${TOTAL - 3}` })}</span>
          )}
          {!apres && !estEcran('formule') && (
            <span className="wiz-tier">
              {t({ fr: `${tier.maxGuests} participants`, en: `${tier.maxGuests} guests`, de: `${tier.maxGuests} Gäste` })} · <strong>{formatPrice(tier.priceCents, lang)}</strong>{' '}
              <button type="button" className="linklike" onClick={() => setTierOpen(!tierOpen)}>
                {tierOpen ? t({ fr: 'fermer', en: 'close', de: 'schließen' }) : t({ fr: 'changer', en: 'change', de: 'ändern' })}
              </button>
            </span>
          )}
        </div>
        {!apres && !estEcran('formule') && tierOpen && (
          <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen(false)} />
        )}
      </div>

      {/* Après le paiement : d'abord le dire, ensuite seulement régler. */}
      {estEcran('bravo') && (
        <form className="card wiz-card wiz-bravo" onSubmit={nextStep}>
          <div className="wiz-bravo-ic" aria-hidden="true">🎉</div>
          <h2 className="wiz-q">{t({ fr: 'Félicitations, votre soirée est créée !', en: 'Congratulations, your event is created!', de: 'Glückwunsch, Ihr Event ist erstellt!' })}</h2>
          {name && <p className="wiz-bravo-nom">« {name} »</p>}
          <p className="wiz-sub">{t({
            fr: 'Votre accès organisateur vient de partir par mail. Il reste quelques réglages, pour finir de préparer votre événement.',
            en: 'Your host access has just been emailed to you. A few settings are left to finish preparing your event.',
            de: 'Ihr Veranstalterzugang wurde gerade per E-Mail verschickt. Es bleiben ein paar Einstellungen, um Ihr Event fertig vorzubereiten.',
          })}</p>
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit" disabled={!reglagesLus}>{t({ fr: 'Faire les réglages →', en: 'Go to the settings →', de: 'Zu den Einstellungen →' })}</button>
          </div>
        </form>
      )}
      {apres && !reglagesLus && <p className="muted" style={{ marginTop: 20 }}>{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p>}

      {!apres && isPaid && !PAYMENTS_ENABLED && (
        <div className="notice" style={{ marginTop: 12 }}>
          🎁 {t({
            fr: <><strong>Offert pendant le lancement</strong> : le paiement en ligne arrive bientôt. Votre événement est créé sans frais pour l'instant.</>,
            en: <><strong>Free during the launch</strong>: online payment is coming soon. Your event is created free of charge for now.</>,
            de: <><strong>Zum Start kostenlos</strong>: Die Online-Zahlung kommt bald. Ihr Event wird vorerst kostenlos erstellt.</>,
          })}
        </div>
      )}

      {/* Le nom */}
      {estEcran('nom') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: "Quelle est l'occasion ?", en: "What's the occasion?", de: 'Was ist der Anlass?' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: "Ce nom s'affichera en grand sur l'écran d'accueil de vos participants. Vous pourrez le changer plus tard.",
              en: "This name will be shown in large letters on your guests' welcome screen. You can change it later.",
              de: 'Dieser Name erscheint groß auf dem Startbildschirm Ihrer Gäste. Sie können ihn später ändern.',
            })}
          </p>
          <div className="field">
            <label>{t({ fr: "Nom de l'événement", en: 'Event name', de: 'Name des Events' })}</label>
            <input type="text" placeholder={exempleNom(occasion, lang) || t({ fr: 'Ex : Mariage de Marie & Paul', en: "E.g. Mary & Paul's wedding", de: 'Z. B. Hochzeit von Marie & Paul' })} value={name}
              onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>

          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* Le début de la fête */}
      {estEcran('debut') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Quand commence votre événement ?', en: 'When does your event start?', de: 'Wann beginnt Ihr Event?' })}</h2>
          <p className="wiz-sub">{t({ fr: "L'appareil photo s'ouvre à cette heure-là. Modifiable plus tard.", en: 'The camera opens at that time. You can change this later.', de: 'Die Kamera öffnet sich zu dieser Uhrzeit. Später änderbar.' })}</p>
          {/* Le mois entier plutôt que la roulette du téléphone, et les jours
              passés éteints : on ne crée pas un événement pour samedi dernier. */}
          <SelecteurDate value={startsAt} onChange={pickStart} min={toInputValue(new Date())} />
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* La fin de la fête : même calendrier que le début, borné à celui-ci.
          Elle sert aussi, en coulisses, à répartir les rappels envoyés aux
          participants (voir lib/rappels.js), mais ce n'est pas une question
          qu'on pose ici : c'est notre affaire, pas la sienne. */}
      {estEcran('fin') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Quand se termine votre événement ?', en: 'When does your event end?', de: 'Wann endet Ihr Event?' })}</h2>
          <p className="wiz-sub">{t({ fr: "L'appareil photo se referme, plus personne ne photographie.", en: 'The camera closes and nobody can take photos any more.', de: 'Die Kamera schließt sich, niemand kann mehr fotografieren.' })}</p>
          <SelecteurDate value={endsAt} onChange={pickFin} min={startsAt} />
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* Quand l'album s'ouvre pour tout le monde */}
      {estEcran('revelation') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Quand souhaitez-vous révéler les photos ?', en: 'When would you like to reveal the photos?', de: 'Wann möchten Sie die Fotos enthüllen?' })}</h2>
          {/* Montrer plutôt que décrire : l'album tel qu'il restera jusqu'à la
              date choisie. Posé avant les propositions, il donne son sens à
              tout ce qui suit. */}
          <div className="wiz-revele" aria-hidden="true">
            <div className="wiz-revele-grille">
              <span className="wiz-revele-cache"><img src="/accueil/galerie-photos.webp" alt="" /></span>
              <span className="wiz-revele-cache"><img src="/accueil/album-partage.webp" alt="" /></span>
            </div>
            <span className="wiz-revele-badge">{t({ fr: '🕒 Révélation', en: '🕒 Reveal', de: '🕒 Enthüllung' })} {frCourt(revealAt, lang, locale)}</span>
          </div>
          <div className="wiz-opts">
            {REVEAL_PRESETS.filter((p) => p.key !== 'custom').map((p) => (
              <button key={p.key} type="button"
                className={`wiz-opt ${revealKey === p.key ? 'on' : ''}`}
                onClick={() => pickReveal(p)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{t(p.title)}</span><span className="ss">{t(p.sub)}</span></span>
              </button>
            ))}
          </div>
          {revealKey === 'custom' ? (
            <SelecteurDate value={revealAt} onChange={setRevealAt} min={endsAt} />
          ) : (
            <button type="button" className="linklike wiz-skip"
              onClick={() => pickReveal(REVEAL_PRESETS.find((p) => p.key === 'custom'))}>
              {t({ fr: 'Choisir une autre date', en: 'Choose another date', de: 'Anderes Datum wählen' })}
            </button>
          )}
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* Combien de clichés par participant */}
      {estEcran('cliches') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Combien de clichés par participant ?', en: 'How many shots per guest?', de: 'Wie viele Aufnahmen pro Gast?' })}</h2>
          <p className="wiz-sub">{t({ fr: 'La contrainte argentique : moins de poses, et chaque photo compte davantage.', en: 'The film camera constraint: fewer exposures, so every photo counts for more.', de: 'Die Grenze des analogen Films: weniger Aufnahmen, und jedes Foto zählt mehr.' })}</p>
          <div className="wiz-opts">
            {SHOT_PRESETS.map((p) => (
              <button key={p.n} type="button"
                className={`wiz-opt ${!shotsCustom && shots === p.n ? 'on' : ''}`}
                onClick={() => pickShots(p.n)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{t(p.title)}</span><span className="ss">{t(p.sub)}</span></span>
              </button>
            ))}
            <button type="button" className={`wiz-opt ${shotsCustom ? 'on' : ''}`}
              onClick={() => { setShotsCustom(true); setShots((s) => (s <= 8 ? 10 : s)) }}>
              <span className="em">🎚️</span>
              <span><span className="tt">{t({ fr: 'Nombre personnalisé', en: 'Custom number', de: 'Eigene Anzahl' })}</span><span className="ss">{t({ fr: `Jusqu'à ${SHOTS_MAX} clichés`, en: `Up to ${SHOTS_MAX} shots`, de: `Bis zu ${SHOTS_MAX} Aufnahmen` })}</span></span>
            </button>
          </div>
          {shotsCustom && (
            <div className="field" style={{ marginTop: 16, marginBottom: 0 }}>
              <div className="stepper">
                <button type="button" onClick={() => setShots((s) => Math.max(SHOTS_MIN, s - 1))} aria-label={t({ fr: 'Moins', en: 'Fewer', de: 'Weniger' })}>−</button>
                <span className="val">{shots}</span>
                <button type="button" onClick={() => setShots((s) => Math.min(SHOTS_MAX, s + 1))} aria-label={t({ fr: 'Plus', en: 'More', de: 'Mehr' })}>+</button>
              </div>
            </div>
          )}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* Ce que chacun revoit de ses propres photos */}
      {estEcran('bonus') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Des photos bonus quand la pellicule est finie ?', en: 'Bonus photos once the film runs out?', de: 'Bonusfotos, wenn der Film voll ist?' })}</h2>
          <p className="wiz-sub">{t({
            fr: "Un participant qui a pris toutes ses photos pourra en demander quelques-unes de plus, une seule fois. C'est offert et permet aux personnes qui adorent les photos d'avoir une surprise 🙂",
            en: 'A guest who has used all their photos can ask for a few more, just once. It is free, and gives the people who love taking photos a nice surprise 🙂',
            de: 'Ein Gast, der alle Fotos aufgenommen hat, kann einmalig ein paar weitere anfordern. Das ist kostenlos und schenkt allen, die gern fotografieren, eine kleine Überraschung 🙂',
          })}</p>
          <div className="wiz-opts">
            <button type="button" className={`wiz-opt ${bonus === 0 ? 'on' : ''}`} onClick={() => setBonus(0)}>
              <span className="em">🎞️</span>
              <span><span className="tt">{t({ fr: 'Pas de bonus', en: 'No bonus', de: 'Kein Bonus' })}</span><span className="ss">{t({ fr: 'La pellicule finie, c’est fini', en: 'When the film is done, it is done', de: 'Film voll, Schluss' })}</span></span>
            </button>
            <button type="button" className={`wiz-opt ${bonus > 0 ? 'on' : ''}`} onClick={() => setBonus((n) => (n > 0 ? n : 2))}>
              <span className="em">🎁</span>
              <span><span className="tt">{t({ fr: 'Offrir des photos bonus', en: 'Give bonus photos', de: 'Bonusfotos schenken' })}</span><span className="ss">{t({ fr: 'Une recharge par participant, gratuite', en: 'One free top-up per guest', de: 'Eine kostenlose Aufstockung pro Gast' })}</span></span>
            </button>
          </div>
          {bonus > 0 && (
            <div className="stepper" style={{ marginTop: 14 }}>
              <button type="button" aria-label={t({ fr: 'Moins', en: 'Fewer', de: 'Weniger' })} onClick={() => setBonus((n) => Math.max(1, n - 1))}>−</button>
              <span className="val">+{bonus}</span>
              <button type="button" aria-label={t({ fr: 'Plus', en: 'More', de: 'Mehr' })} onClick={() => setBonus((n) => Math.min(5, n + 1))} disabled={bonus >= 5}>+</button>
            </div>
          )}
          {bonus >= 5 && (
            <p className="hint" style={{ marginTop: 8 }}>{t({ fr: "+5, c'est le maximum.", en: '+5 is the maximum.', de: '+5 ist das Maximum.' })}</p>
          )}
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {estEcran('revoir') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Peuvent-ils revoir leurs propres photos pendant la fête ?', en: 'Can guests look back at their own photos during the party?', de: 'Dürfen die Gäste ihre eigenen Fotos während der Feier ansehen?' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: "Ce que chacun pourra faire de ses propres clichés pendant la fête. Ceux des autres restent cachés jusqu'à la révélation dans les trois cas.",
              en: "What each guest can do with their own shots during the party. Everyone else's stay hidden until the reveal in all three cases.",
              de: 'Was jeder während der Feier mit seinen eigenen Aufnahmen machen kann. Die der anderen bleiben in allen drei Fällen bis zur Enthüllung verborgen.',
            })}
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
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
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
          <h2 className="wiz-q">{t({ fr: 'Une photo de couverture ?', en: 'A cover photo?', de: 'Ein Titelbild?' })}</h2>


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
                  {recadrage && <span className="wiz-tel-guide">{t({ fr: 'Faites glisser pour recadrer', en: 'Drag to reframe', de: 'Zum Zuschneiden ziehen' })}</span>}
                  {!coverPreview && !recadrage && <span className="wiz-exemple">{t({ fr: 'Exemple', en: 'Example', de: 'Beispiel' })}</span>}
                </div>
                <h3 className="h3" style={{ margin: '22px 0 8px' }}>
                  {t({ fr: `Participez à l'événement ${name.trim() || 'Votre événement'}`, en: `Join the event ${name.trim() || 'Your event'}`, de: `Machen Sie mit beim Event ${name.trim() || 'Ihr Event'}` })}
                </h3>
                <p className="lead small" style={{ marginBottom: 16 }}>
                  {t({
                    fr: <>Prenez <strong>{shots} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{frDate(revealAt, locale)}</strong>.</>,
                    en: <>Take <strong>{shots} photos</strong> during the party. They will stay hidden until the reveal on <strong>{frDate(revealAt, locale)}</strong>.</>,
                    de: <>Machen Sie <strong>{shots} Fotos</strong> während der Feier. Sie bleiben bis zur Enthüllung am <strong>{frDate(revealAt, locale)}</strong> verborgen.</>,
                  })}
                </p>
                <span className="btn btn-accent">{t({ fr: "Participer à l'album collectif →", en: 'Join the shared album →', de: 'Beim gemeinsamen Album mitmachen →' })}</span>
                <div className="footer-note">{t({ fr: 'AUCUNE APPLI · DEPUIS LE NAVIGATEUR', en: 'NO APP · STRAIGHT FROM YOUR BROWSER', de: 'KEINE APP · DIREKT IM BROWSER' })}</div>
              </div>
            </div>

            <div className="wiz-carte-actions">
              <label className="btn btn-ghost">
                {coverPreview ? t({ fr: 'Changer', en: 'Change', de: 'Ändern' }) : t({ fr: 'Choisir une photo', en: 'Choose a photo', de: 'Foto auswählen' })}
                <input type="file" accept="image/*" onChange={onCoverPick} hidden />
              </label>
              {coverPreview && (
                <button type="button" className={`btn btn-ghost ${recadrage ? 'on' : ''}`}
                  onClick={() => setRecadrage(!recadrage)}>
                  {recadrage ? t({ fr: 'Terminer', en: 'Done', de: 'Fertig' }) : t({ fr: 'Recadrer', en: 'Reframe', de: 'Zuschneiden' })}
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setApercu(true)}>
                {t({ fr: 'Agrandir', en: 'Enlarge', de: 'Vergrößern' })}
              </button>
            </div>
          </div>

          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{apres && !coverPreview
              ? t({ fr: 'Continuer sans photo →', en: 'Continue without a photo →', de: 'Ohne Foto weiter →' })
              : t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
          {!apres && !coverPreview && (
            <button type="button" className="linklike wiz-skip" onClick={suivant}>{t({ fr: 'Passer cette étape', en: 'Skip this step', de: 'Diesen Schritt überspringen' })}</button>
          )}
        </form>
      )}

      {/* L'aperçu en grand : la même réplique, à sa taille réelle. */}
      {apercu && (
        <div className="wiz-apercu-plein" role="dialog" aria-label={t({ fr: 'Aperçu participant', en: 'Guest preview', de: 'Vorschau für Gäste' })}
          onClick={() => setApercu(false)}>
          <div className="wiz-vraie wiz-vraie-plein" onClick={(e) => e.stopPropagation()}>
            <div className="wiz-vraie-ecran">
              <div className="cover">
                <img src={coverPreview || COUVERTURE_EXEMPLE} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: coverPos }} />
              </div>
              <h3 className="h3" style={{ margin: '22px 0 8px' }}>
                {t({ fr: `Participez à l'événement ${name.trim() || 'Votre événement'}`, en: `Join the event ${name.trim() || 'Your event'}`, de: `Machen Sie mit beim Event ${name.trim() || 'Ihr Event'}` })}
              </h3>
              <p className="lead small" style={{ marginBottom: 16 }}>
                {t({
                  fr: <>Prenez <strong>{shots} photos</strong> pendant la soirée. Elles resteront cachées jusqu'à la révélation, le <strong>{frDate(revealAt, locale)}</strong>.</>,
                  en: <>Take <strong>{shots} photos</strong> during the party. They will stay hidden until the reveal on <strong>{frDate(revealAt, locale)}</strong>.</>,
                  de: <>Machen Sie <strong>{shots} Fotos</strong> während der Feier. Sie bleiben bis zur Enthüllung am <strong>{frDate(revealAt, locale)}</strong> verborgen.</>,
                })}
              </p>
              <span className="btn btn-accent">{t({ fr: "Participer à l'album collectif →", en: 'Join the shared album →', de: 'Beim gemeinsamen Album mitmachen →' })}</span>
              <div className="footer-note">{t({ fr: 'AUCUNE APPLI · DEPUIS LE NAVIGATEUR', en: 'NO APP · STRAIGHT FROM YOUR BROWSER', de: 'KEINE APP · DIREKT IM BROWSER' })}</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost wiz-apercu-fermer" onClick={() => setApercu(false)}>
            {t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}
          </button>
        </div>
      )}

      {/* La formule : combien de participants */}
      {/* Une dernière question, qu'on peut passer : un geste et c'est fini. */}
      {estEcran('decouverte') && (
        <div className="card wiz-card">
          <h2 className="wiz-q">{t({ fr: 'Une dernière question : comment avez-vous découvert Time to Flash ?', en: 'One last question: how did you hear about Time to Flash?', de: 'Eine letzte Frage: Wie haben Sie Time to Flash entdeckt?' })}</h2>
          <p className="wiz-sub">{t({ fr: 'Ça nous aide énormément à faire connaître le service.', en: 'It helps us a lot to spread the word.', de: 'Das hilft uns sehr, den Dienst bekannter zu machen.' })}</p>
          <QuestionDecouverte envoi={loading} onEnvoyer={envoyerDecouverte} />
        </div>
      )}

      {/* La fin : le mail d'organisation, et seulement ensuite le tableau de bord. */}
      {estEcran('termine') && (
        <div className="card wiz-card wiz-bravo">
          <div className="wiz-bravo-ic" aria-hidden="true">📬</div>
          <h2 className="wiz-q">{t({ fr: "C'est prêt ! Vous avez reçu votre mail d'organisation", en: "All set! You've received your organiser email", de: 'Fertig! Sie haben Ihre Veranstalter-E-Mail erhalten' })}</h2>
          <p className="wiz-sub">{mailOrga
            ? t({
                fr: <>Il est parti à <b>{mailOrga}</b> : il contient votre lien d'accès pour retrouver votre soirée depuis n'importe quel téléphone. Pas reçu d'ici quelques minutes ? Regardez dans vos <b>spams</b> (ou l'onglet « Promotions ») et marquez-le comme « Non spam ».</>,
                en: <>It was sent to <b>{mailOrga}</b>: it contains your access link to get back to your event from any phone. Nothing within a few minutes? Check your <b>spam</b> folder (or the “Promotions” tab) and mark it as “Not spam”.</>,
                de: <>Sie wurde an <b>{mailOrga}</b> geschickt: Sie enthält Ihren Zugangslink, um Ihr Event von jedem Handy aus wiederzufinden. Nach ein paar Minuten nichts erhalten? Schauen Sie im <b>Spam</b>-Ordner (oder im Tab „Werbung“) nach und markieren Sie sie als „Kein Spam“.</>,
              })
            : t({ fr: "Il contient votre lien d'accès pour retrouver votre soirée depuis n'importe quel téléphone. Pensez à regarder dans vos spams.", en: 'It contains your access link to get back to your event from any phone. Remember to check your spam folder.', de: 'Sie enthält Ihren Zugangslink, um Ihr Event von jedem Handy aus wiederzufinden. Schauen Sie auch im Spam-Ordner nach.' })}</p>
          <div className="wiz-nav">
            <button type="button" className="btn btn-accent" onClick={terminerReglages} disabled={loading}>{t({ fr: 'Aller à mon tableau de bord →', en: 'Go to my dashboard →', de: 'Zu meinem Dashboard →' })}</button>
          </div>
        </div>
      )}

      {estEcran('formule') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Combien serez-vous ?', en: 'How many of you will there be?', de: 'Wie viele werden Sie sein?' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: "C'est ce nombre qui fixe la formule. Une place de plus s'ajoute à tout moment, sans refaire l'événement.",
              en: 'This number sets your plan. You can add more places at any time without recreating the event.',
              de: 'Diese Zahl bestimmt Ihr Paket. Weitere Plätze lassen sich jederzeit hinzufügen, ohne das Event neu anzulegen.',
            })}
          </p>
          {/* Le nombre de participants se demande, il ne se devine pas : la plupart
              des points d'entrée n'en portent aucun et retombaient sur la formule
              gratuite sans que personne ne l'ait choisie. */}
          <TierPicker value={maxGuests} onChange={pickTier} inline />
          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* Le mail et le récapitulatif */}
      {estEcran('final') && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Où vous envoyer votre accès ?', en: 'Where should we send your access?', de: 'Wohin sollen wir Ihren Zugang schicken?' })}</h2>
          <p className="wiz-sub">{t({ fr: 'Votre adresse mail vous permet de retrouver votre tableau de bord, même en changeant de téléphone.', en: 'Your email address lets you get back to your dashboard, even if you change phones.', de: 'Mit Ihrer E-Mail-Adresse finden Sie Ihr Dashboard wieder, auch wenn Sie das Handy wechseln.' })}</p>
          <div className="field">
            <label htmlFor="mail-orga">{t({ fr: 'Votre adresse mail', en: 'Your email address', de: 'Ihre E-Mail-Adresse' })}</label>
            <input type="email" id="mail-orga" name="email" inputMode="email" autoComplete="email" placeholder={t({ fr: 'vous@exemple.fr', en: 'you@example.com', de: 'sie@beispiel.de' })}
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoFocus />
          </div>

          <div className="wiz-recap">
            <div className="wiz-recap-title">{t({ fr: 'Récapitulatif', en: 'Summary', de: 'Zusammenfassung' })}</div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Événement', en: 'Event', de: 'Event' })}</span>
              <span>{name} {etapes.includes('nom') && <button type="button" className="linklike" onClick={() => allerA('nom')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Formule', en: 'Plan', de: 'Paket' })}</span>
              <span>
                {t({ fr: `${tier.maxGuests} participants`, en: `${tier.maxGuests} guests`, de: `${tier.maxGuests} Gäste` })} · {formatPrice(tier.priceCents, lang)}{' '}
                {etapes.includes('formule') && <button type="button" className="linklike" onClick={() => allerA('formule')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}
              </span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Début', en: 'Start', de: 'Beginn' })}</span>
              <span>{frDate(startsAt, locale)} {etapes.includes('debut') && <button type="button" className="linklike" onClick={() => allerA('debut')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Fin', en: 'End', de: 'Ende' })}</span>
              <span>{frDate(endsAt, locale)} {etapes.includes('fin') && <button type="button" className="linklike" onClick={() => allerA('fin')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            {/* Parcours court : ces réglages viennent après le paiement. */}
            {parcours === 'court' ? (
              <p className="hint" style={{ margin: '10px 0 2px' }}>{isPaid && PAYMENTS_ENABLED
                ? t({
                    fr: 'Les réglages de votre événement se font juste après le paiement.',
                    en: 'You will set up your event right after payment.',
                    de: 'Die Einstellungen Ihres Events nehmen Sie direkt nach der Zahlung vor.',
                  })
                : t({
                    fr: 'Les réglages de votre événement se font juste après la création.',
                    en: 'You will set up your event right after creating it.',
                    de: 'Die Einstellungen Ihres Events nehmen Sie direkt nach der Erstellung vor.',
                  })}</p>
            ) : (<>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Révélation', en: 'Reveal', de: 'Enthüllung' })}</span>
              <span>{frDate(revealAt, locale)} {etapes.includes('revelation') && <button type="button" className="linklike" onClick={() => allerA('revelation')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Clichés / participant', en: 'Shots per guest', de: 'Aufnahmen pro Gast' })}</span>
              <span>{shots} {etapes.includes('cliches') && <button type="button" className="linklike" onClick={() => allerA('cliches')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Revoir ses photos', en: 'Reviewing own photos', de: 'Eigene Fotos ansehen' })}</span>
              <span>
                {(MODE_OPTIONS.find((o) => o.key === photoMode) || MODE_OPTIONS[0]).title}{' '}
                {etapes.includes('revoir') && <button type="button" className="linklike" onClick={() => allerA('revoir')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}
              </span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Couverture', en: 'Cover', de: 'Titelbild' })}</span>
              <span>{coverPreview ? t({ fr: 'Ajoutée', en: 'Added', de: 'Hinzugefügt' }) : t({ fr: 'Aucune', en: 'None', de: 'Keines' })} {etapes.includes('couverture') && <button type="button" className="linklike" onClick={() => allerA('couverture')}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button>}</span>
            </div>
            </>)}
            {tier.priceCents > 0 && (
              <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
            )}
          </div>

          <div className="wiz-legal">
            <label className="wiz-check">
              <input type="checkbox" name="cgv" checked={cgvOk} onChange={(e) => setCgvOk(e.target.checked)} />
              <span>
                {t({
                  fr: <>J'accepte les <Link href={lien('/cgv')} target="_blank">conditions générales de vente</Link> et la <Link href={lien('/politique-de-confidentialite')} target="_blank">politique de confidentialité</Link>.</>,
                  en: <>I accept the <Link href={lien('/cgv')} target="_blank">terms and conditions of sale</Link> and the <Link href={lien('/politique-de-confidentialite')} target="_blank">privacy policy</Link>.</>,
                  de: <>Ich akzeptiere die <Link href={lien('/cgv')} target="_blank">Allgemeinen Geschäftsbedingungen</Link> und die <Link href={lien('/politique-de-confidentialite')} target="_blank">Datenschutzerklärung</Link>.</>,
                })}
              </span>
            </label>
            {isPaid && PAYMENTS_ENABLED && (
              <label className="wiz-check">
                <input type="checkbox" name="renonciation" checked={waiverOk} onChange={(e) => setWaiverOk(e.target.checked)} />
                <span>
                  {t({
                    fr: 'Je demande la création immédiate de mon événement et je renonce à mon droit de rétractation de 14 jours.',
                    en: 'I request the immediate creation of my event and I waive my 14-day right of withdrawal.',
                    de: 'Ich verlange die sofortige Erstellung meines Events und verzichte auf mein 14-tägiges Widerrufsrecht.',
                  })}
                </span>
              </label>
            )}
          </div>

          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={precedent} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{finalStepLabel}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE bonus : Code reçu par mail */}
      {step === 'code' && (
        <form className="card wiz-card" onSubmit={handleCreate}>
          <h2 className="wiz-q">{t({ fr: 'Vérifiez votre adresse', en: 'Verify your address', de: 'Bestätigen Sie Ihre Adresse' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: <>On vient d'envoyer un code à 6 chiffres à <strong>{email.trim()}</strong>. Saisissez-le pour créer votre événement. Rien reçu ? Regardez dans les indésirables.</>,
              en: <>We have just sent a 6-digit code to <strong>{email.trim()}</strong>. Enter it to create your event. Nothing arrived? Check your spam folder.</>,
              de: <>Wir haben gerade einen 6-stelligen Code an <strong>{email.trim()}</strong> gesendet. Geben Sie ihn ein, um Ihr Event zu erstellen. Nichts angekommen? Schauen Sie im Spam-Ordner nach.</>,
            })}
          </p>
          <div className="field">
            <label>{t({ fr: 'Code reçu par mail', en: 'Code from the email', de: 'Code aus der E-Mail' })}</label>
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
            {t({ fr: 'Pas reçu ?', en: 'Not received?', de: 'Nicht erhalten?' })}{' '}
            <button type="button" onClick={resendCode} className="linklike">{t({ fr: 'Renvoyer le code', en: 'Resend the code', de: 'Code erneut senden' })}</button>
            {' · '}
            <button type="button" onClick={() => allerA('final')} className="linklike">{t({ fr: "Changer d'adresse", en: 'Use a different address', de: 'Andere Adresse verwenden' })}</button>
          </div>
        </form>
      )}

      {!apres && (estEcran('nom') || estEcran('formule') || estEcran('final')) && (
        <div className="footer-note" style={{ marginTop: 24 }}>{t({ fr: 'PAIEMENT UNIQUE · SANS ABONNEMENT', en: 'ONE-OFF PAYMENT · NO SUBSCRIPTION', de: 'EINMALZAHLUNG · KEIN ABO' })}</div>
      )}
    </main>
  )
}
