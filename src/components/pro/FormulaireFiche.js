'use client'

// ============================================================
//  Formulaire de fiche partenaire, avec l'aperçu de la fiche à côté
//  (maquette « Formulaire pro »). Envoi vers /api/pro/fiche.
//
//  La photo est réduite ici, dans le navigateur (1600 px, JPEG), avant
//  l'envoi : Vercel refuse les requêtes de plus de 4,5 Mo et une photo de
//  téléphone dépasse souvent ce poids.
// ============================================================
import { useEffect, useMemo, useState } from 'react'
import {
  FORMULAIRES, METIERS_FICHE, OFFRE, LIMITES_FICHE, validerFiche, deptDuCodePostal,
  codePostalDansAdresse, versPseudo, siteAffiche,
} from '../../lib/partenaires'

const VIDE = { entreprise: '', metier: '', codePostal: '', adresse: '', description: '', site: '', instagram: '', tiktok: '', facebook: '', prenom: '', nom: '', email: '', telephone: '', accord: false, site_web_2: '' }
const RESEAUX = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']]

async function reduirePhoto(fichier) {
  try {
    const bitmap = await createImageBitmap(fichier)
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * ratio)
    canvas.height = Math.round(bitmap.height * ratio)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85))
    return blob || fichier
  } catch {
    return fichier // le serveur réessaiera avec sharp
  }
}

export default function FormulaireFiche({ cle, provenance }) {
  const m = FORMULAIRES[cle]
  const general = cle === 'general'
  const [f, setF] = useState(VIDE)
  const [photo, setPhoto] = useState(null) // { url, nom, blob }
  const [essaye, setEssaye] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [envoyee, setEnvoyee] = useState(false)
  const [erreurServeur, setErreurServeur] = useState('')
  const [erreursServeur, setErreursServeur] = useState({})

  useEffect(() => () => { if (photo?.url) URL.revokeObjectURL(photo.url) }, [photo])

  const metier = general ? f.metier : cle
  const estLieu = metier === 'lieu'
  const toutes = useMemo(() => validerFiche(f, cle), [f, cle])
  const err = essaye ? { ...toutes, ...erreursServeur } : erreursServeur
  const set = (k) => (e) => {
    let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (k === 'codePostal') v = v.replace(/\D/g, '').slice(0, 5)
    setErreursServeur((x) => ({ ...x, [k]: undefined }))
    setF((s) => ({ ...s, [k]: v }))
  }
  const setReseau = (k) => (e) => setF((s) => ({ ...s, [k]: versPseudo(k, e.target.value) }))

  async function choisirPhoto(e) {
    const fichier = e.target.files && e.target.files[0]
    if (!fichier) return
    const blob = await reduirePhoto(fichier)
    setPhoto({ url: URL.createObjectURL(blob), nom: fichier.name, blob })
    setErreursServeur((x) => ({ ...x, photo: undefined }))
  }

  async function envoyer(e) {
    e.preventDefault()
    setEssaye(true); setErreurServeur('')
    if (Object.keys(toutes).length) return
    setEnvoi(true)
    try {
      const corps = new FormData()
      corps.append('fiche', JSON.stringify({ ...f, page: cle, provenance, page_origine: typeof window !== 'undefined' ? window.location.href : '' }))
      if (photo?.blob) corps.append('photo', photo.blob, 'photo.jpg')
      const res = await fetch('/api/pro/fiche', { method: 'POST', body: corps })
      const r = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErreursServeur(r.champs && typeof r.champs === 'object' && !Array.isArray(r.champs) ? r.champs : {})
        throw new Error(r.error || 'L’envoi a échoué. Réessayez dans un instant.')
      }
      window.scrollTo(0, 0)
      setEnvoyee(true)
    } catch (ex) { setErreurServeur(ex.message) } finally { setEnvoi(false) }
  }

  // ---- Aperçu ----
  const cp = estLieu ? codePostalDansAdresse(f.adresse) : f.codePostal
  const d = deptDuCodePostal(cp)
  const metierLabel = metier ? METIERS_FICHE[metier]?.label : 'Votre métier'
  const web = siteAffiche(f.site)
  const reseaux = RESEAUX.filter(([k]) => f[k] && f[k] !== '@').map(([k, l]) => `${l} ${f[k]}`)

  const champ = (k, label, props = {}) => (
    <div className="pp-champ">
      <label htmlFor={`pp-${k}`}>{label}</label>
      <input id={`pp-${k}`} type="text" value={f[k]} onChange={set(k)} maxLength={LIMITES_FICHE[k]}
        className={err[k] ? 'pp-invalide' : ''} aria-invalid={!!err[k]} {...props} />
      {err[k] && <span className="pp-err">{err[k]}</span>}
    </div>
  )

  return (
    <div className="pp-form-grille">
      {!envoyee ? (
        <form className="pp-form" onSubmit={envoyer} noValidate>
          <div className="pp-bloc">
            <div className="pp-bloc-titre">Affiché sur votre fiche</div>
            <div className="pp-ligne-2">
              {champ('entreprise', m.nomLabel)}
              {general && (
                <div className="pp-champ">
                  <label htmlFor="pp-metier">Votre métier</label>
                  <select id="pp-metier" value={f.metier} onChange={set('metier')} className={err.metier ? 'pp-invalide' : ''}>
                    <option value="">Choisir</option>
                    {Object.entries(METIERS_FICHE).map(([k, x]) => <option key={k} value={k}>{x.label}</option>)}
                  </select>
                  {err.metier && <span className="pp-err">{err.metier}</span>}
                </div>
              )}
              {!estLieu && champ('codePostal', 'Code postal', { inputMode: 'numeric', maxLength: 5, placeholder: '44000', autoComplete: 'postal-code' })}
            </div>
            {estLieu && champ('adresse', 'Adresse du lieu', { placeholder: 'Numéro, rue, code postal, commune', autoComplete: 'street-address' })}
            <div className="pp-champ">
              <label htmlFor="pp-description">{m.descLabel}</label>
              <textarea id="pp-description" rows={3} maxLength={LIMITES_FICHE.description} value={f.description} onChange={set('description')}
                className={err.description ? 'pp-invalide' : ''} aria-invalid={!!err.description} />
              <div className="pp-compteur"><span className="pp-err">{err.description || ''}</span><span>{f.description.length} / {LIMITES_FICHE.description}</span></div>
            </div>
            <div className="pp-champ">
              <label htmlFor="pp-site">Site web <span className="pp-facultatif">· facultatif</span></label>
              <input id="pp-site" type="text" value={f.site} onChange={set('site')} placeholder={m.sitePh} maxLength={LIMITES_FICHE.site} autoComplete="url" />
            </div>
            <div className="pp-champ">
              <label>Réseaux sociaux <span className="pp-facultatif">· facultatif</span></label>
              <div className="pp-reseaux">
                {RESEAUX.map(([k, l]) => (
                  <div key={k} className="pp-reseau">
                    <span>{l}</span>
                    <input type="text" value={f[k]} onChange={setReseau(k)} placeholder="@votrecompte" maxLength={LIMITES_FICHE[k]} aria-label={l} />
                  </div>
                ))}
              </div>
              <span className="pp-aide">Collez le lien de votre profil : le @ est récupéré automatiquement.</span>
            </div>
            <div className="pp-champ">
              <label>{m.photoLabel} <span className="pp-facultatif">· facultatif</span></label>
              <label className="pp-fichier">
                <span className="pp-fichier-btn">Choisir un fichier</span>
                <span className="pp-fichier-nom">{photo?.nom || 'Aucun fichier choisi'}</span>
                <input type="file" accept="image/*" onChange={choisirPhoto} hidden />
              </label>
              {err.photo && <span className="pp-err">{err.photo}</span>}
            </div>
            <input type="text" name="site_web_2" value={f.site_web_2} onChange={set('site_web_2')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="pp-piege" />
          </div>

          <div className="pp-bloc">
            <div>
              <div className="pp-bloc-titre pp-gris">Vos coordonnées · jamais affichées</div>
              <p className="pp-bloc-p">Votre nom, votre email et votre téléphone servent uniquement à vous envoyer votre code. Ils n’apparaissent pas sur votre fiche.</p>
            </div>
            <div className="pp-ligne-2">
              {champ('prenom', 'Prénom', { autoComplete: 'given-name' })}
              {champ('nom', 'Nom', { autoComplete: 'family-name' })}
              {champ('email', 'Email professionnel', { type: 'email', autoComplete: 'email' })}
              {champ('telephone', 'Téléphone', { type: 'tel', autoComplete: 'tel' })}
            </div>
            <label className="pp-accord">
              <input type="checkbox" checked={f.accord} onChange={set('accord')} />
              <span>J’accepte que ma fiche soit publiée sur la page partenaires de Time to Flash.</span>
            </label>
            {err.accord && <span className="pp-err">{err.accord}</span>}
          </div>

          {essaye && Object.keys(toutes).length > 0 && <div className="pp-alerte">Quelques champs sont à compléter avant l’envoi.</div>}
          {erreurServeur && <div className="pp-alerte">{erreurServeur}</div>}
          <button type="submit" className="btn btn-accent pp-envoyer" disabled={envoi}>
            {envoi ? 'Envoi…' : 'Envoyer ma fiche et recevoir mon code →'}
          </button>
          <p className="pp-mention">Vos coordonnées servent uniquement à traiter votre demande. <a href="/politique-de-confidentialite">Confidentialité</a></p>
        </form>
      ) : (
        <div className="pp-bloc pp-recue">
          <span className="pp-coche">✓</span>
          <h3>Fiche bien reçue.</h3>
          <p>Merci {f.prenom}. Notre équipe relit votre fiche ; une fois validée, vous recevez votre code à {f.email}, dans la limite des {OFFRE.codesParDepartement} codes de votre département.</p>
          <div className="pp-suivi">
            <div><span className="pp-point" style={{ background: 'var(--ok)' }} /><b>Fiche reçue</b><span className="pp-suivi-etat" style={{ color: 'var(--ok)' }}>AUJOURD’HUI</span></div>
            <div><span className="pp-point" style={{ background: 'var(--accent)' }} /><b>Fiche validée · envoi de votre code</b><span className="pp-suivi-etat" style={{ color: 'var(--accent-deep)' }}>EN COURS</span></div>
            <div><span className="pp-point" style={{ background: 'rgba(34,26,18,.18)' }} /><b>Fiche publiée sur la page partenaires</b><span className="pp-suivi-etat">À VENIR</span></div>
          </div>
        </div>
      )}

      <div className="pp-apercu">
        <div className="eyebrow-mute">Aperçu de votre fiche</div>
        <div className="pp-fiche-carte pp-ombre">
          <div className="pp-photo" style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}>
            {!photo?.url && <span>{m.photoPh}</span>}
          </div>
          <div className="pp-fiche-corps">
            <span className="pp-meta">{metierLabel} · {d ? `${d.nom} (${d.num})` : 'Votre département'}</span>
            <h3 className={f.entreprise.trim() ? '' : 'pp-vide'}>{f.entreprise.trim() || m.nomPh}</h3>
            <p className={f.description.trim() ? '' : 'pp-vide'}>{f.description.trim() || 'Votre présentation en deux phrases apparaît ici.'}</p>
            <div className="pp-liens-mono">
              <span className={web ? '' : 'pp-vide'}>{web || m.sitePh}</span>
              {(reseaux.length ? reseaux : ['@votrecompte']).map((r) => <span key={r} className={reseaux.length ? '' : 'pp-vide'}>{r}</span>)}
            </div>
            <span className="pp-badge"><span className="pp-etoile">✱</span> Partenaire Time to Flash {OFFRE.annee}</span>
          </div>
        </div>
        <p className="pp-aide">Publiée sur notre page partenaires après validation, avec un lien vers votre site.</p>
      </div>
    </div>
  )
}
