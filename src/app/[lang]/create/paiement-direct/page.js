'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../../../components/Logo'
import TierPicker from '../../../../components/TierPicker'
import PromoField from '../../../../components/PromoField'
import OptionLivreOr from '../../../../components/OptionLivreOr'
import { getDeviceToken, rememberMyEvent, saveAccount } from '../../../../lib/device'
import { tierByGuests, formatPrice, PAYMENTS_ENABLED, verificationRequise, LIVRE_OR_CENTS } from '../../../../lib/pricing'
import { track } from '../../../../lib/tracking'
import { DEFAULT_EVENT_NAME, DEFAULT_SHOTS, maintenant, finProposee, revelationProposee } from '../../../../lib/event-defaults'
import { MODE_PROPOSE } from '../../../../lib/photo-mode'
import { useLangue } from '../../../../components/Langue'

// ============================================================
//  Variante « express » du tunnel de création.
//
//  On choisit sa formule, on paie, et TOUT le paramétrage (nom, dates,
//  révélation, couverture, clichés) se fait ensuite depuis le tableau de bord.
//  L'événement est donc créé avec des valeurs de départ, que la checklist du
//  tableau de bord invite à reprendre une par une.
//
//  Existe en parallèle de /create pour pouvoir comparer les deux parcours.
// ============================================================

function ExpressForm() {
  const { t, lang, lien } = useLangue()
  const router = useRouter()
  const sp = useSearchParams()

  const [maxGuests, setMaxGuests] = useState(() => tierByGuests(sp.get('tier')).maxGuests)
  const tier = tierByGuests(maxGuests)

  // Un code promo peut rendre payante une formule gratuite… ou l'inverse.
  // Tout ce qui suit raisonne donc sur le prix réellement dû.
  const [promo, setPromo] = useState(null)
  const priceCents = promo ? promo.priceCents : tier.priceCents
  const isPaid = priceCents > 0
  // L'option livre d'or s'ajoute au prix de la formule (payante seulement).
  const [livreOr, setLivreOr] = useState(false)
  const totalCents = priceCents + (isPaid && livreOr ? LIVRE_OR_CENTS : 0)

  // Sur une formule payante, Stripe collecte l'adresse pendant le paiement.
  const needEmail = !PAYMENTS_ENABLED || !isPaid || verificationRequise(priceCents)

  const [email, setEmail] = useState('')
  const [cgvOk, setCgvOk] = useState(false)
  const [waiverOk, setWaiverOk] = useState(false)
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

  // Formule gratuite : personne ne passe par la caisse, donc rien ne prouve
  // l'adresse. On la fait vérifier par un code à 6 chiffres, comme les autres
  // tunnels. L'écran du code ne s'affiche que dans ce cas précis.
  const [code, setCode] = useState('')
  const [ecran, setEcran] = useState('formulaire') // 'formulaire' | 'code'

  function pickTier(n) {
    setMaxGuests(n)
    setError('')
    try { window.history.replaceState(null, '', `/create/paiement-direct?tier=${n}`) } catch {}
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t({ fr: 'Entrez une adresse mail valide : c\'est elle qui vous permettra de retrouver votre événement.', en: 'Enter a valid email address: it is how you will get back to your event.', de: 'Geben Sie eine gültige E-Mail-Adresse ein: Damit finden Sie Ihr Event wieder.' }))
      return
    }
    if (!cgvOk) { setError(t({ fr: 'Merci d\'accepter les conditions générales pour continuer.', en: 'Please accept the terms and conditions to continue.', de: 'Bitte akzeptieren Sie die AGB, um fortzufahren.' })); return }
    if (isPaid && PAYMENTS_ENABLED && !waiverOk) {
      setError(t({ fr: 'Merci de cocher la demande d\'exécution immédiate pour finaliser votre commande.', en: 'Please tick the request for immediate performance to complete your order.', de: 'Bitte bestätigen Sie die sofortige Ausführung, um Ihre Bestellung abzuschließen.' }))
      return
    }

    // Détour par la vérification de l'adresse avant de créer quoi que ce soit.
    if (verificationRequise(priceCents)) return envoyerCode()

    return creer()
  }

  // Envoie le code à 6 chiffres, puis bascule sur l'écran de saisie.
  async function envoyerCode() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), langue: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t({ fr: 'Erreur.', en: 'Error.', de: 'Fehler.' }))
      setCode(''); setEcran('code')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function creer(e) {
    if (e) e.preventDefault()
    setError('')
    if (verificationRequise(priceCents) && code.replace(/\D/g, '').length !== 6) {
      setError(t({ fr: 'Entrez le code à 6 chiffres reçu par mail.', en: 'Enter the 6-digit code you received by email.', de: 'Geben Sie den 6-stelligen Code aus der E-Mail ein.' }))
      return
    }

    setLoading(true)

    // Valeurs de départ : l'organisateur les reprendra depuis son tableau de bord.
    const start = maintenant()
    const fin = finProposee(start)
    const reveal = revelationProposee(start)
    const payload = {
      ownerToken: getDeviceToken(),
      name: DEFAULT_EVENT_NAME,
      ownerEmail: email.trim(),
      code: code.replace(/\D/g, ''),
      startsAt: start.toISOString(),
      endsAt: fin.toISOString(),
      revealAt: reveal.toISOString(),
      shotsPerGuest: DEFAULT_SHOTS,
      // Même promesse que le tunnel long (voir /create) : le vrai jetable.
      photoMode: MODE_PROPOSE,
      maxGuests: tier.maxGuests,
      flow: 'express', // variante d'où l'on vient (retour d'annulation Stripe)
      livreOr: isPaid && livreOr,
      cgvAccepted: cgvOk,
      withdrawalWaived: waiverOk,
      promo: promo?.code || undefined,
      langue: lang,
    }

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
        window.location.href = data.url
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
      router.push(`/event/${data.id}?cree=1`)
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const label = isPaid && PAYMENTS_ENABLED
    ? (loading
        ? t({ fr: 'Redirection vers le paiement…', en: 'Taking you to payment…', de: 'Weiterleitung zur Zahlung…' })
        : t({ fr: `Payer ${formatPrice(totalCents, lang)} →`, en: `Pay ${formatPrice(totalCents, lang)} →`, de: `${formatPrice(totalCents, lang)} bezahlen →` }))
    : (loading
        ? t({ fr: 'Création…', en: 'Creating…', de: 'Wird erstellt…' })
        : t({ fr: 'Créer mon événement →', en: 'Create my event →', de: 'Mein Event erstellen →' }))

  // Sur la formule gratuite, le bouton du formulaire n'achève plus rien : il
  // envoie le code. Le libellé doit le dire, sinon on promet une création qui
  // n'arrive pas tout de suite.
  const labelFormulaire = verificationRequise(priceCents)
    ? (loading ? t({ fr: 'Envoi du code…', en: 'Sending the code…', de: 'Code wird gesendet…' }) : t({ fr: 'Continuer →', en: 'Continue →', de: 'Weiter →' }))
    : label

  return (
    <main className="screen screen-cream">
      <Link href={lien('/')} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>

      {ecran === 'code' ? (
        <form className="card wiz-card" style={{ marginTop: 26 }} onSubmit={creer}>
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
            <button className="btn btn-accent" type="submit" disabled={loading}>{label}</button>
          </div>
          <div className="hint" style={{ marginTop: 14, textAlign: 'center' }}>
            {t({ fr: 'Pas reçu ?', en: 'Not received?', de: 'Nicht erhalten?' })}{' '}
            <button type="button" onClick={envoyerCode} className="linklike">{t({ fr: 'Renvoyer le code', en: 'Resend the code', de: 'Code erneut senden' })}</button>
            {' · '}
            <button type="button" onClick={() => { setEcran('formulaire'); setError('') }} className="linklike">
              {t({ fr: "Changer d'adresse", en: 'Use a different address', de: 'Andere Adresse verwenden' })}
            </button>
          </div>
        </form>
      ) : (
      <form className="card wiz-card" style={{ marginTop: 26 }} onSubmit={submit}>
        <h2 className="wiz-q">{t({ fr: 'Créez votre événement', en: 'Create your event', de: 'Erstellen Sie Ihr Event' })}</h2>
        <p className="wiz-sub">
          {t({
            fr: 'Une seule chose à décider maintenant : le nombre de participants. Le nom, les dates et le moment de la révélation se règlent juste après.',
            en: 'Just one thing to decide now: the number of guests. The name, dates and time of the reveal can be set right afterwards.',
            de: 'Jetzt ist nur eines zu entscheiden: die Anzahl der Gäste. Name, Termine und Präsentationstermin legen Sie direkt danach fest.',
          })}
        </p>

        <TierPicker value={maxGuests} onChange={pickTier} inline />

        {tier.priceCents > 0 && (
          <PromoField maxGuests={tier.maxGuests} applied={promo} onApplied={setPromo} />
        )}

        {isPaid && PAYMENTS_ENABLED && <OptionLivreOr checked={livreOr} onChange={setLivreOr} />}

        {needEmail && (
          <div className="field" style={{ marginTop: 22 }}>
            <label>{t({ fr: 'Votre adresse mail', en: 'Your email address', de: 'Ihre E-Mail-Adresse' })}</label>
            <input type="email" inputMode="email" autoComplete="email" placeholder={t({ fr: 'vous@exemple.fr', en: 'you@example.com', de: 'sie@beispiel.de' })}
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} />
          </div>
        )}

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
          <button className="btn btn-accent" type="submit" disabled={loading}>{labelFormulaire}</button>
        </div>
      </form>
      )}

      <div className="footer-note" style={{ marginTop: 24 }}>{t({ fr: 'PAIEMENT UNIQUE · SANS ABONNEMENT', en: 'ONE-OFF PAYMENT · NO SUBSCRIPTION', de: 'EINMALZAHLUNG · KEIN ABO' })}</div>
    </main>
  )
}

export default function ExpressPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <ExpressForm />
    </Suspense>
  )
}
