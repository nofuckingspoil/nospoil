'use client'

// ============================================================
//  Formulaire de demande partenaire (page /pro).
//
//  Préremplissage depuis l'adresse, pour les liens des mails de prospection :
//    /pro?prenom=…&nom=…&entreprise=…&email=…&ville=…&metier=…
//  Provenance : ?ref=… ou utm_source (avec utm_campaign s'il y en a), sinon
//  « site ». Elle est gardée pour la session : un pro arrivé par un mail, qui
//  lit un article puis revient, reste compté pour ce mail.
//
//  Le champ « site_web_2 » est un piège à robots : invisible, jamais rempli
//  par un humain (voir l'API, src/app/api/pro/route.js).
// ============================================================

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { t } from '../../../lib/i18n'
import { lien } from '../../../lib/langue-lien'
import { checkEmailShape } from '../../../lib/email-check'
import { METIERS, VOLUMES, LIMITES, estMetier } from '../../../lib/pro'

const CLE_REF = 'ttf_pro_ref'
const PREREMPLIS = ['prenom', 'nom', 'entreprise', 'email', 'ville']

const VIDE = {
  prenom: '', nom: '', metier: '', entreprise: '', ville: '', email: '',
  telephone: '', site: '', volume: '', message: '', accord: false, site_web_2: '',
}

// Libellés, par langue.
const L = {
  prenom: { fr: 'Prénom', en: 'First name', de: 'Vorname' },
  nom: { fr: 'Nom', en: 'Last name', de: 'Nachname' },
  metier: { fr: 'Métier', en: 'Profession', de: 'Beruf' },
  choisir: { fr: 'Choisissez', en: 'Choose', de: 'Bitte wählen' },
  entreprise: { fr: "Nom de l'entreprise", en: 'Company name', de: 'Firmenname' },
  ville: { fr: 'Ville ou département', en: 'City or region', de: 'Stadt oder Region' },
  email: { fr: 'E-mail', en: 'Email', de: 'E-Mail' },
  telephone: { fr: 'Téléphone', en: 'Phone', de: 'Telefon' },
  site: { fr: 'Site web ou Instagram', en: 'Website or Instagram', de: 'Website oder Instagram' },
  volume: { fr: 'Mariages par an', en: 'Weddings per year', de: 'Hochzeiten pro Jahr' },
  message: { fr: 'Message', en: 'Message', de: 'Nachricht' },
  messagePh: {
    fr: 'Vos questions, le type de mariages que vous accompagnez…',
    en: 'Your questions, the kind of weddings you work on…',
    de: 'Ihre Fragen, die Art von Hochzeiten, die Sie betreuen…',
  },
  facultatif: { fr: 'facultatif', en: 'optional', de: 'optional' },
  obligatoire: { fr: 'Ce champ est obligatoire.', en: 'This field is required.', de: 'Dieses Feld ist ein Pflichtfeld.' },
  choixObligatoire: { fr: 'Choisissez une réponse.', en: 'Please choose an answer.', de: 'Bitte wählen Sie eine Antwort.' },
  accordObligatoire: {
    fr: 'Cochez cette case pour que nous puissions vous répondre.',
    en: 'Please tick this box so we can reply to you.',
    de: 'Bitte setzen Sie dieses Häkchen, damit wir Ihnen antworten können.',
  },
  telInvalide: { fr: 'Ce numéro ne semble pas valide.', en: 'This number does not look valid.', de: 'Diese Nummer scheint ungültig zu sein.' },
  vouliez: { fr: 'Vouliez-vous dire', en: 'Did you mean', de: 'Meinten Sie' },
  envoyer: { fr: 'Envoyer ma demande', en: 'Send my request', de: 'Anfrage senden' },
  envoi: { fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' },
  verifier: { fr: 'Vérifiez les champs en rouge.', en: 'Please check the fields in red.', de: 'Bitte prüfen Sie die rot markierten Felder.' },
  reseau: {
    fr: 'Connexion impossible. Vérifiez votre réseau et réessayez.',
    en: 'Could not connect. Check your connection and try again.',
    de: 'Keine Verbindung. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
  },
  merciH: { fr: 'Merci !', en: 'Thank you!', de: 'Vielen Dank!' },
  merciP: {
    fr: 'Clément vous répond personnellement sous 48 h avec votre code.',
    en: 'Clément will reply to you personally within 48 hours with your code.',
    de: 'Clément antwortet Ihnen persönlich innerhalb von 48 Stunden mit Ihrem Code.',
  },
}

function Accord({ lang }) {
  const lienConf = <Link href={lien('/politique-de-confidentialite', lang)} target="_blank">{t({ fr: 'politique de confidentialité', en: 'privacy policy', de: 'Datenschutzerklärung' }, lang)}</Link>
  if (lang === 'en') return <>I agree that Time to Flash may contact me about this request. My data is handled in line with the {lienConf}.</>
  if (lang === 'de') return <>Ich bin einverstanden, dass Time to Flash mich zu dieser Anfrage kontaktiert. Meine Daten werden gemäß der {lienConf} verarbeitet.</>
  return <>J’accepte que Time to Flash me recontacte au sujet de cette demande. Mes données sont traitées selon la {lienConf}.</>
}

export default function FormulairePro({ lang = 'fr' }) {
  const [v, setV] = useState(VIDE)
  const [erreurs, setErreurs] = useState({})
  const [suggestion, setSuggestion] = useState('')
  const [erreurGlobale, setErreurGlobale] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [fini, setFini] = useState(false)
  const [origine, setOrigine] = useState({ provenance: 'site', page_origine: '' })

  // Préremplissage et provenance, une fois la page ouverte.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const pre = {}
      for (const k of PREREMPLIS) {
        const x = (q.get(k) || '').trim()
        if (x) pre[k] = x.slice(0, LIMITES[k])
      }
      const metier = (q.get('metier') || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
      if (estMetier(metier)) pre.metier = metier
      if (Object.keys(pre).length) setV((old) => ({ ...old, ...pre }))

      const source = (q.get('ref') || q.get('utm_source') || '').trim()
      const campagne = (q.get('utm_campaign') || '').trim()
      let provenance = source ? (campagne && !q.get('ref') ? `${source} / ${campagne}` : source) : ''
      if (provenance) sessionStorage.setItem(CLE_REF, provenance)
      else provenance = sessionStorage.getItem(CLE_REF) || 'site'

      setOrigine({
        provenance: provenance.slice(0, LIMITES.provenance),
        page_origine: (document.referrer || '').slice(0, LIMITES.page_origine),
      })
    } catch {}
  }, [])

  function changer(k, val) {
    setV((old) => ({ ...old, [k]: val }))
    if (erreurs[k]) setErreurs((old) => { const n = { ...old }; delete n[k]; return n })
    if (k === 'email') setSuggestion('')
  }

  function valider() {
    const e = {}
    for (const k of ['prenom', 'nom', 'entreprise', 'ville', 'email']) {
      if (!v[k].trim()) e[k] = t(L.obligatoire, lang)
    }
    if (!v.metier) e.metier = t(L.choixObligatoire, lang)
    if (!v.volume) e.volume = t(L.choixObligatoire, lang)
    if (!v.accord) e.accord = t(L.accordObligatoire, lang)
    if (v.email.trim()) {
      const f = checkEmailShape(v.email, lang)
      if (!f.ok) e.email = f.reason
      else if (f.suggestion) setSuggestion(f.suggestion)
    }
    if (v.telephone.trim() && !/^[0-9+().\s-]{6,30}$/.test(v.telephone.trim())) e.telephone = t(L.telInvalide, lang)
    return e
  }

  async function envoyer(ev) {
    ev.preventDefault()
    if (envoi) return
    setErreurGlobale('')
    const e = valider()
    setErreurs(e)
    if (Object.keys(e).length) {
      setErreurGlobale(t(L.verifier, lang))
      const premier = document.querySelector(`[name="${Object.keys(e)[0]}"]`)
      premier?.focus?.()
      return
    }
    setEnvoi(true)
    try {
      const res = await fetch('/api/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Langue': lang },
        body: JSON.stringify({ ...v, ...origine }),
      })
      const r = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (Array.isArray(r.champs) && r.champs.length) {
          setErreurs(Object.fromEntries(r.champs.map((c) => [c, r.error])))
        }
        setErreurGlobale(r.error || t(L.reseau, lang))
        return
      }
      setFini(true)
    } catch {
      setErreurGlobale(t(L.reseau, lang))
    } finally {
      setEnvoi(false)
    }
  }

  if (fini) {
    return (
      <div className="pro-form pro-merci" role="status">
        <div className="pro-merci-ic" aria-hidden="true">✓</div>
        <h3>{t(L.merciH, lang)}</h3>
        <p>{t(L.merciP, lang)}</p>
      </div>
    )
  }

  const champ = (k, { type = 'text', facultatif = false, autoComplete, max = LIMITES[k], large = false } = {}) => (
    <label className={`pro-champ${large ? ' pro-champ--large' : ''}${erreurs[k] ? ' pro-champ--ko' : ''}`}>
      <span>{t(L[k], lang)}{facultatif && <em> ({t(L.facultatif, lang)})</em>}</span>
      <input
        type={type}
        name={k}
        value={v[k]}
        maxLength={max}
        autoComplete={autoComplete}
        aria-invalid={!!erreurs[k]}
        onChange={(e) => changer(k, e.target.value)}
      />
      {erreurs[k] && <small className="pro-erreur">{erreurs[k]}</small>}
      {k === 'email' && suggestion && !erreurs.email && (
        <small className="pro-suggestion">
          {t(L.vouliez, lang)}{' '}
          <button type="button" onClick={() => { changer('email', suggestion); setSuggestion('') }}>{suggestion}</button> ?
        </small>
      )}
    </label>
  )

  return (
    <form className="pro-form" onSubmit={envoyer} noValidate>
      <div className="pro-grille">
        {champ('prenom', { autoComplete: 'given-name' })}
        {champ('nom', { autoComplete: 'family-name' })}

        <label className={`pro-champ${erreurs.metier ? ' pro-champ--ko' : ''}`}>
          <span>{t(L.metier, lang)}</span>
          <select name="metier" value={v.metier} aria-invalid={!!erreurs.metier} onChange={(e) => changer('metier', e.target.value)}>
            <option value="">{t(L.choisir, lang)}</option>
            {METIERS.map((m) => <option key={m.id} value={m.id}>{t(m, lang)}</option>)}
          </select>
          {erreurs.metier && <small className="pro-erreur">{erreurs.metier}</small>}
        </label>
        {champ('entreprise', { autoComplete: 'organization' })}

        {champ('ville', { autoComplete: 'address-level2' })}
        {champ('email', { type: 'email', autoComplete: 'email' })}

        {champ('telephone', { type: 'tel', facultatif: true, autoComplete: 'tel' })}
        {champ('site', { facultatif: true, autoComplete: 'url' })}

        <fieldset className={`pro-champ pro-champ--large pro-volumes${erreurs.volume ? ' pro-champ--ko' : ''}`}>
          <legend>{t(L.volume, lang)}</legend>
          <div className="pro-choix">
            {VOLUMES.map((o) => (
              <label key={o.id} className={`pro-pastille${v.volume === o.id ? ' on' : ''}`}>
                <input type="radio" name="volume" value={o.id} checked={v.volume === o.id} onChange={() => changer('volume', o.id)} />
                {t(o, lang)}
              </label>
            ))}
          </div>
          {erreurs.volume && <small className="pro-erreur">{erreurs.volume}</small>}
        </fieldset>

        <label className={`pro-champ pro-champ--large${erreurs.message ? ' pro-champ--ko' : ''}`}>
          <span>{t(L.message, lang)}<em> ({t(L.facultatif, lang)})</em></span>
          <textarea name="message" rows={4} value={v.message} maxLength={LIMITES.message}
            placeholder={t(L.messagePh, lang)} onChange={(e) => changer('message', e.target.value)} />
          {erreurs.message && <small className="pro-erreur">{erreurs.message}</small>}
        </label>

        {/* Piège à robots : hors de l'écran, hors du clavier, ignoré des lecteurs d'écran. */}
        <div className="pro-piege" aria-hidden="true">
          <label>Ne pas remplir
            <input type="text" name="site_web_2" tabIndex={-1} autoComplete="off" value={v.site_web_2}
              onChange={(e) => setV((old) => ({ ...old, site_web_2: e.target.value }))} />
          </label>
        </div>

        <div className={`pro-champ--large pro-accord${erreurs.accord ? ' pro-champ--ko' : ''}`}>
          <label>
            <input type="checkbox" name="accord" checked={v.accord} onChange={(e) => changer('accord', e.target.checked)} />
            <span><Accord lang={lang} /></span>
          </label>
          {erreurs.accord && <small className="pro-erreur">{erreurs.accord}</small>}
        </div>
      </div>

      {erreurGlobale && <div className="err pro-err-globale" role="alert">{erreurGlobale}</div>}

      <button className="dj-btn pro-envoyer" type="submit" disabled={envoi}>
        {envoi ? t(L.envoi, lang) : t(L.envoyer, lang)}
      </button>
    </form>
  )
}
