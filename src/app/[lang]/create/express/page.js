'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../../components/Logo'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, verificationRequise, LIVRE_OR_CENTS } from '../../../../lib/pricing'
import { MODE_PROPOSE } from '../../../../lib/photo-mode'
import { track } from '../../../../lib/tracking'
import TierPicker from '../../../../components/TierPicker'
import SelecteurDate from '../../../../components/SelecteurDate'
import PromoField from '../../../../components/PromoField'
import OptionLivreOr from '../../../../components/OptionLivreOr'
import { atDay, maintenant, finProposee, REVELATION_PROPOSEE } from '../../../../lib/event-defaults'
import { useLangue } from '../../../../components/Langue'

// ---------- Petits utilitaires de date ----------

function toInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function frDate(iso, locale = 'fr-FR') {
  const d = new Date(iso)
  if (isNaN(d)) return '-'
  return d.toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

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

// Nombre de clichés par participant à la création. Ce n'est pas demandé ici : le
// réglage se fait après paiement, depuis le tableau de bord, jusqu'au jour J.
const DEFAULT_SHOTS = 5


// ---------- Assistant ----------

function CreateForm() {
  const { t, lang, locale, lien } = useLangue()
  const router = useRouter()
  const sp = useSearchParams()

  // La formule choisie sur la page d'accueil n'est qu'un point de départ : elle
  // reste modifiable sans quitter l'assistant (sinon toute la saisie serait perdue).
  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  const [tierOpen, setTierOpen] = useState('') // '' | 'head' | 'recap'
  const tier = tierByGuests(maxGuests)

  // Un code promo change le montant réellement dû : tout ce qui suit
  // (paiement ou non, adresse à demander, libellé du bouton) s'y rapporte.
  const [promo, setPromo] = useState(null)
  const priceCents = promo ? promo.priceCents : tier.priceCents
  const isPaid = priceCents > 0
  // L'option livre d'or s'ajoute au prix de la formule (payante seulement).
  const [livreOr, setLivreOr] = useState(false)
  const totalCents = priceCents + (isPaid && livreOr ? LIVRE_OR_CENTS : 0)

  // Sur une formule payante, Stripe collecte déjà l'adresse pendant le paiement :
  // la demander en plus ferait saisir deux fois la même chose. On ne la demande
  // donc que quand personne d'autre ne le fera.
  const needEmail = !PAYMENTS_ENABLED || !isPaid || verificationRequise(priceCents)

  // Étapes : 1 nom · 2 dates + révélation · 3 récap · 'code'
  //
  // Volontairement court. Tout ce qui n'est pas indispensable pour créer
  // l'événement (couverture, nombre de clichés) se règle après, depuis le
  // tableau de bord : c'est là qu'on a envie de fignoler, pas avant de payer.
  const [step, setStep] = useState(1)
  const TOTAL = 3

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  // Dates proposées (voir lib/event-defaults.js) : début maintenant,
  // révélation le lendemain à midi.
  const [depart] = useState(maintenant)
  const [startsAt, setStartsAt] = useState(() => toInputValue(depart))
  const [revealKey, setRevealKey] = useState(REVELATION_PROPOSEE.key)
  const [revealAt, setRevealAt] = useState(() => toInputValue(atDay(REVELATION_PROPOSEE.days, REVELATION_PROPOSEE.hour, depart)))

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

  // Changement de formule : on garde l'adresse à jour pour que le retour depuis
  // Stripe (ou un rafraîchissement) retombe sur la bonne formule.
  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `/create/express?tier=${n}`) } catch {}
  }

  function pickReveal(p, base = startsAt) {
    setRevealKey(p.key)
    if (p.key !== 'custom') setRevealAt(toInputValue(atDay(p.days, p.hour, new Date(base))))
  }

  // Changer la date de la soirée recale la révélation choisie (« le lendemain »
  // doit rester le lendemain de la fête).
  function pickStart(value) {
    setStartsAt(value)
    const preset = REVEAL_PRESETS.find((p) => p.key === revealKey)
    if (preset && preset.key !== 'custom' && !isNaN(new Date(value))) {
      setRevealAt(toInputValue(atDay(preset.days, preset.hour, new Date(value))))
    }
  }

  // Validation + passage à l'étape suivante.
  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (!name.trim()) { setError(t({ fr: 'Donnez un nom à votre événement.', en: 'Give your event a name.', de: 'Geben Sie Ihrem Event einen Namen.' })); return }
      return goTo(2)
    }
    if (step === 2) {
      if (!startsAt || isNaN(new Date(startsAt))) { setError(t({ fr: 'Indiquez la date de votre événement.', en: 'Enter the date of your event.', de: 'Geben Sie das Datum Ihres Events an.' })); return }
      if (!revealAt || isNaN(new Date(revealAt))) { setError(t({ fr: 'Choisissez une date de révélation.', en: 'Choose a reveal date.', de: 'Wählen Sie ein Datum für die Enthüllung.' })); return }
      if (new Date(revealAt) <= new Date(startsAt)) {
        setError(t({ fr: 'La révélation doit venir après le début de votre événement.', en: 'The reveal must come after your event starts.', de: 'Die Enthüllung muss nach dem Beginn Ihres Events liegen.' })); return
      }
      return goTo(3)
    }
    if (step === 3) return submitEmail()
  }

  // Dernière étape : contrôles, puis code de vérification (si activé) ou création.
  async function submitEmail() {
    // L'adresse n'est demandée ici que si Stripe ne va pas la collecter
    // lui-même : sur une formule payante, la saisir deux fois n'apporte rien.
    if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
      // Pas de question sur la fin dans ce tunnel : on propose le lendemain à
      // 8 h. Le serveur l'ignore si elle tombe après la révélation choisie.
      endsAt: finProposee(new Date(startsAt)).toISOString(),
      revealAt: new Date(revealAt).toISOString(), shotsPerGuest: DEFAULT_SHOTS,
      // Même promesse que le tunnel long, dite explicitement : sans ce champ,
      // le serveur retomberait sur « album ouvert », qui n'est que le repli des
      // événements d'avant le réglage.
      photoMode: MODE_PROPOSE,
      maxGuests: tier.maxGuests,
      flow: 'court', // variante d'où l'on vient (retour d'annulation Stripe)
      // Preuve du consentement : le serveur pose lui-même l'horodatage.
      livreOr: isPaid && livreOr,
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
      // Langue de l'organisateur : ses mails partiront dans cette langue.
      langue: lang,
    }

    // Formule payante : direction le paiement Stripe. L'événement sera créé au retour.
    if (isPaid && PAYMENTS_ENABLED) {
      try {
        // Publicité : départ vers le paiement.
        track('InitiateCheckout', {
          value: totalCents / 100,
          currency: 'EUR',
          content_name: `Formule ${tier.maxGuests} invités`,
        })

        const res = await fetch('/api/checkout', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
        try { sessionStorage.setItem('ttf_creation_courte', '1') } catch {}
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
      // Publicité : événement gratuit créé.
      track('Lead', { content_name: `Formule ${tier.maxGuests} invités` }, { eventID: `lead_${data.id}` })
      try { sessionStorage.setItem('ttf_creation_courte', '1') } catch {}
      router.push(`/event/${data.id}?cree=1`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const finalLabel = isPaid && PAYMENTS_ENABLED
    ? (loading
        ? t({ fr: 'Redirection vers le paiement…', en: 'Taking you to payment…', de: 'Weiterleitung zur Zahlung…' })
        : t({ fr: `Payer ${formatPrice(totalCents, lang)} →`, en: `Pay ${formatPrice(totalCents, lang)} →`, de: `${formatPrice(totalCents, lang)} bezahlen →` }))
    : (loading
        ? t({ fr: 'Création…', en: 'Creating…', de: 'Wird erstellt…' })
        : t({ fr: 'Créer mon événement →', en: 'Create my event →', de: 'Mein Event erstellen →' }))

  const lastStepLabel = verificationRequise(priceCents)
    ? (loading ? t({ fr: 'Envoi du code…', en: 'Sending the code…', de: 'Code wird gesendet…' }) : t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' }))
    : finalLabel

  const stepNum = step === 'code' ? TOTAL : step

  return (
    <main className="screen screen-cream">
      <Link href={lien('/')} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      {/* Barre de progression */}
      <div className="wiz-head">
        <div className="wiz-progress">
          {Array.from({ length: TOTAL }, (_, i) => (
            <i key={i} className={i < stepNum ? 'done' : ''} />
          ))}
        </div>
        <div className="wiz-headline">
          <span className="wiz-count">{t({ fr: `Étape ${stepNum} sur ${TOTAL}`, en: `Step ${stepNum} of ${TOTAL}`, de: `Schritt ${stepNum} von ${TOTAL}` })}</span>
          {/* Le prix ne s'affiche qu'une fois par écran : ici seulement à
              l'étape 2, où ni le sélecteur ni le récapitulatif ne le portent. */}
          {step === 2 && (
            <span className="wiz-tier">
              {t({ fr: `${tier.maxGuests} participants`, en: `${tier.maxGuests} guests`, de: `${tier.maxGuests} Gäste` })} · <strong>{formatPrice(tier.priceCents, lang)}</strong>{' '}
              <button type="button" className="linklike"
                onClick={() => setTierOpen(tierOpen === 'head' ? '' : 'head')}>
                {tierOpen === 'head' ? t({ fr: 'fermer', en: 'close', de: 'schließen' }) : t({ fr: 'changer', en: 'change', de: 'ändern' })}
              </button>
            </span>
          )}
        </div>
        {step === 2 && tierOpen === 'head' && (
          <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen('')} />
        )}
      </div>

      {isPaid && !PAYMENTS_ENABLED && (
        <div className="notice" style={{ marginTop: 12 }}>
          🎁 {t({
            fr: <><strong>Offert pendant le lancement</strong> : le paiement en ligne arrive bientôt. Votre événement est créé sans frais pour l'instant.</>,
            en: <><strong>Free during the launch</strong>: online payment is coming soon. Your event is created free of charge for now.</>,
            de: <><strong>Zum Start kostenlos</strong>: Die Online-Zahlung kommt bald. Ihr Event wird vorerst kostenlos erstellt.</>,
          })}
        </div>
      )}

      {/* ÉTAPE 1 : Nom */}
      {step === 1 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: "C'est quoi l'occasion ?", en: "What's the occasion?", de: 'Was ist der Anlass?' })}</h2>
          {/* La réassurance est fondue dans l'explication : une ligne à part se
              lirait comme un avertissement. */}
          <p className="wiz-sub">
            {t({
              fr: "Ce nom s'affichera en grand sur l'écran d'accueil de vos participants. Vous pourrez le changer plus tard.",
              en: "This name will be shown in large letters on your guests' welcome screen. You can change it later.",
              de: 'Dieser Name erscheint groß auf dem Startbildschirm Ihrer Gäste. Sie können ihn später ändern.',
            })}
          </p>
          <div className="field">
            <label>{t({ fr: "Nom de l'événement", en: 'Event name', de: 'Name des Events' })}</label>
            <input type="text" placeholder={t({ fr: 'Ex : Mariage de Marie & Paul', en: "E.g. Mary & Paul's wedding", de: 'Z. B. Hochzeit von Marie & Paul' })} value={name}
              onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </div>

          {/* Le nombre de participants décide du prix et, une fois l'événement passé,
              de l'ouverture de l'album. Il se demande, il ne se devine pas. */}
          <TierPicker value={maxGuests} onChange={pickTier} inline />

          {error && <div className="err">{error}</div>}
          <div className="wiz-nav">
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 2 : Dates + révélation */}
      {step === 2 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'Quand a lieu votre événement ?', en: 'When is your event?', de: 'Wann findet Ihr Event statt?' })}</h2>
          <p className="wiz-sub">{t({ fr: 'Modifiable plus tard, à tout moment.', en: 'You can change this later, at any time.', de: 'Jederzeit später änderbar.' })}</p>
          {/* Le mois entier plutôt que la roulette du téléphone, et les jours
              passés éteints : c'est l'écran où l'on abandonne le plus. */}
          <SelecteurDate value={startsAt} onChange={pickStart} min={toInputValue(new Date())} />
          <div style={{ height: 20 }} />

          <h2 className="wiz-q" style={{ marginTop: 0 }}>{t({ fr: 'Et quand révéler les photos ?', en: 'And when should the photos be revealed?', de: 'Und wann sollen die Fotos enthüllt werden?' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: <>Jusqu'à cette date, tout reste caché, comme une pellicule qu'on développe. Ensuite, les photos deviennent visibles par <strong>tous les participants</strong>.</>,
              en: <>Until then, everything stays hidden, like a film being developed. After that, the photos become visible to <strong>all the guests</strong>.</>,
              de: <>Bis dahin bleibt alles verborgen, wie ein Film, der entwickelt wird. Danach sind die Fotos für <strong>alle Gäste</strong> sichtbar.</>,
            })}
          </p>
          <div className="wiz-opts">
            {REVEAL_PRESETS.map((p) => (
              <button key={p.key} type="button"
                className={`wiz-opt ${revealKey === p.key ? 'on' : ''}`}
                onClick={() => pickReveal(p)}>
                <span className="em">{p.em}</span>
                <span><span className="tt">{t(p.title)}</span><span className="ss">{t(p.sub)}</span></span>
              </button>
            ))}
          </div>
          {revealKey === 'custom' && (
            <SelecteurDate value={revealAt} onChange={setRevealAt} min={startsAt} />
          )}
          {/* Le résultat du choix, et le moment que l'organisateur se figure :
              il mérite mieux qu'une ligne grise. Affiché aussi en date libre,
              où il traduit la saisie brute en quelque chose de lisible. */}
          <div className="wiz-reveal-echo">
            <span className="lbl">{t({ fr: 'Révélation', en: 'Reveal', de: 'Enthüllung' })}</span>
            <strong className="val">{frDate(revealAt, locale)}</strong>
          </div>
          <div className="notice" style={{ marginTop: 16 }}>
            {t({
              fr: "💡 Laissez-leur le temps. Avant la révélation, chacun peut revoir ses clichés et supprimer ceux qu'il ne veut pas montrer ; après, c'est visible par tout le monde.",
              en: "💡 Give them time. Before the reveal, everyone can look back at their shots and delete any they don't want to show; afterwards, everyone can see them.",
              de: '💡 Lassen Sie ihnen Zeit. Vor der Enthüllung kann jeder seine Aufnahmen ansehen und löschen, was er nicht zeigen möchte; danach ist alles für alle sichtbar.',
            })}
          </div>
          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(1)} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit">{t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' })}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE 3 : Récapitulatif (+ mail si Stripe ne le collecte pas) */}
      {step === 3 && (
        <form className="card wiz-card" onSubmit={nextStep}>
          <h2 className="wiz-q">{t({ fr: 'On y est presque', en: 'Almost there', de: 'Fast geschafft' })}</h2>
          <p className="wiz-sub">
            {needEmail
              ? t({ fr: 'Vérifiez votre événement, puis indiquez l’adresse qui vous permettra de retrouver votre tableau de bord.', en: 'Check your event, then enter the address that will let you get back to your dashboard.', de: 'Prüfen Sie Ihr Event und geben Sie dann die Adresse an, mit der Sie Ihr Dashboard wiederfinden.' })
              : t({ fr: 'Vérifiez votre événement. Le reste (photo de couverture, nombre de clichés) se règle juste après, tranquillement.', en: 'Check your event. Everything else (cover photo, number of shots) can be set right afterwards, at your own pace.', de: 'Prüfen Sie Ihr Event. Der Rest (Titelbild, Anzahl der Aufnahmen) lässt sich direkt danach in Ruhe einstellen.' })}
          </p>

          {needEmail && (
            <div className="field">
              <label>{t({ fr: 'Votre adresse mail', en: 'Your email address', de: 'Ihre E-Mail-Adresse' })}</label>
              <input type="email" inputMode="email" autoComplete="email" placeholder={t({ fr: 'vous@exemple.fr', en: 'you@example.com', de: 'sie@beispiel.de' })}
                value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoFocus />
            </div>
          )}

          <div className="wiz-recap">
            <div className="wiz-recap-title">{t({ fr: 'Récapitulatif', en: 'Summary', de: 'Zusammenfassung' })}</div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Événement', en: 'Event', de: 'Event' })}</span>
              <span>{name} <button type="button" className="linklike" onClick={() => goTo(1)}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Événement le', en: 'Event date', de: 'Datum des Events' })}</span>
              <span>{frDate(startsAt, locale)} <button type="button" className="linklike" onClick={() => goTo(2)}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Révélation', en: 'Reveal', de: 'Enthüllung' })}</span>
              <span>{frDate(revealAt, locale)} <button type="button" className="linklike" onClick={() => goTo(2)}>{t({ fr: 'modifier', en: 'edit', de: 'ändern' })}</button></span>
            </div>
            <div className="wiz-recap-row">
              <span>{t({ fr: 'Formule', en: 'Plan', de: 'Paket' })}</span>
              <span>
                {t({ fr: `${tier.maxGuests} participants`, en: `${tier.maxGuests} guests`, de: `${tier.maxGuests} Gäste` })} · {formatPrice(tier.priceCents, lang)}{' '}
                <button type="button" className="linklike"
                  onClick={() => setTierOpen(tierOpen === 'recap' ? '' : 'recap')}>
                  {tierOpen === 'recap' ? t({ fr: 'fermer', en: 'close', de: 'schließen' }) : t({ fr: 'modifier', en: 'edit', de: 'ändern' })}
                </button>
              </span>
            </div>
            {tierOpen === 'recap' && (
              <TierPicker value={maxGuests} onChange={pickTier} onClose={() => setTierOpen('')} />
            )}
            {tier.priceCents > 0 && (
              <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
            )}
            {isPaid && PAYMENTS_ENABLED && <OptionLivreOr checked={livreOr} onChange={setLivreOr} />}
          </div>

          {/* Le doute juste avant de payer, c'est « et si je me suis trompé ? ».
              On y répond ici, au moment précis où la question se pose. */}
          {/* La formule est volontairement absente de cette liste : elle se
              choisit maintenant, pour de bon. */}
          <div className="notice wiz-reassure">
            {t({
              fr: <>✎ <strong>Rien n'est figé.</strong> Nom, dates, moment de la révélation, photo de couverture : tout se modifie ensuite depuis votre tableau de bord. Le nombre de clichés se règle jusqu'au jour de l'événement.</>,
              en: <>✎ <strong>Nothing is set in stone.</strong> Name, dates, time of the reveal, cover photo: you can change it all later from your dashboard. The number of shots can be adjusted until the day of the event.</>,
              de: <>✎ <strong>Nichts ist endgültig.</strong> Name, Termine, Zeitpunkt der Enthüllung, Titelbild: Alles lässt sich danach in Ihrem Dashboard ändern. Die Anzahl der Aufnahmen können Sie bis zum Tag des Events anpassen.</>,
            })}
          </div>

          <div className="wiz-legal">
            <label className="wiz-check">
              <input type="checkbox" checked={cgvOk} onChange={(e) => setCgvOk(e.target.checked)} />
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
                <input type="checkbox" checked={waiverOk} onChange={(e) => setWaiverOk(e.target.checked)} />
                <span>
                  {t({
                    fr: 'Je demande la création immédiate de mon événement et je renonce à mon droit de rétractation de 14 jours.',
                    en: 'I request that my event be created immediately and I waive my 14-day right of withdrawal.',
                    de: 'Ich verlange die sofortige Erstellung meines Events und verzichte auf mein 14-tägiges Widerrufsrecht.',
                  })}
                </span>
              </label>
            )}
          </div>

          {error && <div className="err" style={{ marginTop: 14 }}>{error}</div>}
          <div className="wiz-nav">
            <button type="button" className="btn btn-ghost wiz-back" onClick={() => goTo(2)} aria-label={t({ fr: 'Retour', en: 'Back', de: 'Zurück' })}>←</button>
            <button className="btn btn-accent" type="submit" disabled={loading}>{lastStepLabel}</button>
          </div>
        </form>
      )}

      {/* ÉTAPE bonus : Code reçu par mail */}
      {step === 'code' && (
        <form className="card wiz-card" onSubmit={handleCreate}>
          <h2 className="wiz-q">{t({ fr: 'Vérifiez votre adresse', en: 'Verify your address', de: 'Bestätigen Sie Ihre Adresse' })}</h2>
          <p className="wiz-sub">
            {t({
              fr: <>On vient d'envoyer un code à 6 chiffres à <strong>{email.trim()}</strong>. Saisissez-le pour créer votre événement.</>,
              en: <>We have just sent a 6-digit code to <strong>{email.trim()}</strong>. Enter it to create your event.</>,
              de: <>Wir haben gerade einen 6-stelligen Code an <strong>{email.trim()}</strong> gesendet. Geben Sie ihn ein, um Ihr Event zu erstellen.</>,
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
            <button type="button" onClick={() => goTo(3)} className="linklike">{t({ fr: "Changer d'adresse", en: 'Use a different address', de: 'Andere Adresse verwenden' })}</button>
          </div>
        </form>
      )}

      <div className="footer-note" style={{ marginTop: 24 }}>{t({ fr: 'PAIEMENT UNIQUE · SANS ABONNEMENT', en: 'ONE-OFF PAYMENT · NO SUBSCRIPTION', de: 'EINMALZAHLUNG · KEIN ABO' })}</div>
    </main>
  )
}

export default function CreatePage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <CreateForm />
    </Suspense>
  )
}
