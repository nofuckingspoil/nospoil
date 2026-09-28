'use client'

// ============================================================
//  Les tirages papier, côté album.
//
//  Trois pièces :
//  - Tirage : l'aperçu d'une photo sur son papier, à la forme exacte du
//    format choisi. La photo est posée entière, jamais rognée : ce qui dépasse
//    de la forme du papier devient une bande blanche, comme sur le vrai tirage.
//  - InvitationTirages : la fenêtre qui propose, une fois, de recevoir ses
//    photos sur papier. Elle arrive quand on a vu assez de tirages pour en
//    vouloir, jamais à l'ouverture.
//  - CommandeTirages : l'écran qui suit la sélection. Exemplaires, format,
//    finition, effet, adresse, prix, puis la commande. L'effet est appliqué
//    par le serveur au moment de la commande (lib/cuisson-serveur).
//
//  Les prix viennent de lib/tirages, les mêmes que ceux du serveur.
// ============================================================

import { useState } from 'react'
import {
  FORMATS_TIRAGE, FINITIONS, PAYS, PROPORTIONS, PRIX_APPEL, EXEMPLAIRES_MAX, devisTirages, euros,
} from '../lib/tirages'
import { PELLICULES, cssTeinte, tamponDate } from '../lib/film'
import IconeCorbeille from './IconeCorbeille'

// Une photo de téléphone est en 3:4 : c'est la forme qu'on suppose tant que
// l'image n'est pas arrivée, pour que rien ne saute à l'affichage.
const RATIO_PAR_DEFAUT = 3 / 4

// `aLEchelle` : dans une planche, un tirage en largeur et un tirage en hauteur
// ont le même papier. On les dessine donc à la même échelle : le paysage prend
// toute la case, le portrait seulement la part qui correspond à sa largeur.
// `finition` : satinee | brillante. L'aperçu suggère le papier (un reflet
// franc sur le brillant, un voile nacré sur le satiné) ; ce n'est qu'une
// évocation, la vraie différence se voit en tenant le tirage.
export function Tirage({ photo, format = '10x15', pelli = null, date = false, aLEchelle = false, finition = '', className = '', style }) {
  const [ratio, setRatio] = useState(RATIO_PAR_DEFAUT) // largeur / hauteur de la photo
  const papier = PROPORTIONS[format] || PROPORTIONS['10x15']
  // Le papier tourne avec la photo : un paysage s'imprime à l'horizontale.
  const pr = ratio > 1 ? 1 / papier : papier
  const image = ratio > pr
    ? { width: '100%', height: `${(pr / ratio) * 100}%` }
    : { width: `${(ratio / pr) * 100}%`, height: '100%' }
  return (
    <span className={`tir-tirage ${finition ? `fini-${finition}` : ''} ${className}`}
      style={{ aspectRatio: String(pr), ...(aLEchelle ? { width: ratio > 1 ? '100%' : `${papier * 100}%` } : {}), ...style }}>
      <span className="tir-image" style={image}>
        <img src={photo.url} alt="" loading="lazy" crossOrigin="anonymous"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w && h) setRatio(w / h)
          }}
          style={pelli?.css ? { filter: pelli.css } : undefined} />
        {pelli?.teinte && <span className="film-teinte" style={{ background: cssTeinte(pelli) }} />}
        {date && <span className="film-date">{tamponDate(photo.takenAt)}</span>}
      </span>
    </span>
  )
}

// Trois tirages posés en éventail : ce sont ses propres photos qu'on voit
// déjà sur papier, et c'est ce qui donne envie.
function Eventail({ photos, pelli, date }) {
  const angles = [-9, 3, 12]
  return (
    <div className="tir-eventail" aria-hidden="true">
      {photos.slice(0, 3).map((p, i) => (
        <span key={p.id || i} className="tir-pose" style={{ '--r': `${angles[i]}deg`, '--x': `${(i - 1) * 64}px` }}>
          <Tirage photo={p} pelli={pelli} date={date} />
        </span>
      ))}
    </div>
  )
}

export function InvitationTirages({ photos, nbFavoris, pelli, avecDate, onChoisir, onFermer }) {
  return (
    <div className="avis-pop" onClick={(e) => { if (e.target === e.currentTarget) onFermer() }}>
      <div className="avis-pop-carte tir-invit" role="dialog" aria-labelledby="tir-invit-titre">
        <button className="tir-x" aria-label="Fermer" onClick={onFermer}>✕</button>
        <Eventail photos={photos} pelli={pelli} date={avecDate} />
        <h2 id="tir-invit-titre" className="tir-titre">Et en vrai, sur papier ?</h2>
        <p className="tir-texte">
          Recevez vos photos préférées en tirages 10&nbsp;×&nbsp;15, imprimés sur vrai papier photo
          et livrés dans votre boîte aux lettres.
        </p>
        <p className="tir-prix">Dès {PRIX_APPEL} la photo</p>
        <button className="tir-cta" onClick={onChoisir}>
          {nbFavoris > 0
            ? `Commander mes ${nbFavoris} favori${nbFavoris > 1 ? 's' : ''} en tirages`
            : 'Choisir mes tirages photo'}
        </button>
        <button className="tir-plus-tard" onClick={onFermer}>Plus tard</button>
      </div>
    </div>
  )
}

export function CommandeTirages({ eventId, photos, deviceToken, pelli, avecDate, onRetour, onTermine }) {
  const [format, setFormat] = useState(FORMATS_TIRAGE[0].id)
  const [finition, setFinition] = useState(FINITIONS[0].id)
  // Le rendu se choisit ici, photo par photo d'aperçu : il part de celui de
  // l'album (ce qu'on voyait en cochant), et on peut en changer sans y revenir.
  const [pelliId, setPelliId] = useState(pelli?.id || 'aucune')
  const [dateOn, setDateOn] = useState(!!avecDate)
  const rendu = PELLICULES.find((f) => f.id === pelliId) || PELLICULES[0]
  const effet = !!rendu.canaux || dateOn
  const [exemplaires, setExemplaires] = useState(() => Object.fromEntries(photos.map((p) => [p.id, 1])))
  const [etat, setEtat] = useState('choix') // choix | envoi | fait
  const [erreur, setErreur] = useState('')
  const [simule, setSimule] = useState(false)
  // Ce que Prodigi nous facture : montré en local seulement, pour juger la marge.
  const [coutImprimeur, setCoutImprimeur] = useState(null)
  const [dest, setDest] = useState({ nom: '', adresse: '', complement: '', codePostal: '', ville: '', email: '', pays: 'FR' })
  const champ = (cle) => ({
    id: `tir-${cle}`,
    value: dest[cle],
    onChange: (e) => setDest((d) => ({ ...d, [cle]: e.target.value })),
  })
  const nombre = photos.reduce((n, p) => n + (exemplaires[p.id] || 0), 0)
  const devis = devisTirages(nombre, format, dest.pays)

  function changerExemplaires(id, delta) {
    setExemplaires((ex) => ({ ...ex, [id]: Math.max(0, Math.min(EXEMPLAIRES_MAX, (ex[id] || 0) + delta)) }))
  }

  async function commander() {
    setErreur('')
    setEtat('envoi')
    try {
      const retenues = photos.filter((p) => exemplaires[p.id] > 0)
      // L'effet est appliqué par le serveur, comme pour l'app iPhone : les deux
      // impriment ainsi exactement le même fichier.
      const r = await fetch('/api/tirages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, format, finition, deviceToken, destinataire: dest,
          rendu: { pellicule: rendu.id, date: dateOn },
          lignes: retenues.map((p) => ({ photoId: p.id, exemplaires: exemplaires[p.id] })),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'La commande n\'a pas pu partir. Réessayez dans un instant.')
      // Le paiement se fait chez Stripe, qui ramène ensuite sur l'album.
      if (d.url) { setEtat('paiement'); window.location.href = d.url; return }
      setSimule(!!d.simule)
      setCoutImprimeur(d.prodigi?.cout || null)
      setEtat('fait')
    } catch (e) {
      setErreur(e.message)
      setEtat('choix')
    }
  }

  if (etat === 'fait') {
    return (
      <MerciTirages photos={photos.filter((p) => exemplaires[p.id] > 0)} pelli={rendu} date={dateOn}
        nombre={devis.nombre} formatNom={devis.format.nom} total={devis.total}
        simule={simule} cout={coutImprimeur?.total} onFermer={onTermine} />
    )
  }

  return (
    <div className="tir-ecran" role="dialog" aria-labelledby="tir-cmd-titre">
      <div className="tir-haut">
        <button className="tir-retour" onClick={onRetour} aria-label="Revenir à la sélection">←</button>
        <div>
          <h2 id="tir-cmd-titre" className="tir-h">Mes tirages</h2>
          <span className="tir-compte">{devis.nombre} tirage{devis.nombre > 1 ? 's' : ''} · {devis.format.nom}</span>
        </div>
        <button className="tir-modifier" onClick={onRetour}>Modifier</button>
      </div>

      <div className="tir-corps">
        {/* L'aperçu a la forme du papier choisi : on voit ce qu'on recevra,
            bandes blanches comprises. Le compteur dessous sert aux doubles
            pour les grands-parents ; à zéro, la photo n'est pas imprimée. */}
        <div className="tir-grille">
          {photos.filter((p) => exemplaires[p.id] > 0).map((p) => {
            const n = exemplaires[p.id] || 0
            return (
              <div key={p.id} className="tir-case">
                <Tirage photo={p} format={format} pelli={rendu} date={dateOn} finition={finition} aLEchelle />
                <div className="tir-compteur" role="group" aria-label={`Exemplaires de la photo de ${p.who || 'la soirée'}`}>
                  {/* À un exemplaire, le « moins » devient une corbeille : on
                      retire la photo de la commande, au lieu d'un zéro qui
                      laissait une vignette fantôme dans la planche. */}
                  {n === 1 ? (
                    <button type="button" className="tir-retirer" onClick={() => changerExemplaires(p.id, -1)} aria-label="Retirer cette photo de la commande">
                      <IconeCorbeille size={15} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => changerExemplaires(p.id, -1)} aria-label="Un exemplaire de moins">−</button>
                  )}
                  <span aria-live="polite">{n}</span>
                  <button type="button" onClick={() => changerExemplaires(p.id, 1)} disabled={n >= EXEMPLAIRES_MAX} aria-label="Un exemplaire de plus">+</button>
                </div>
              </div>
            )
          })}
        </div>

        {devis.nombre === 0 && (
          <p className="tir-note">
            Toutes les photos ont été retirées. <button type="button" className="tir-lien" onClick={onRetour}>Choisir d&apos;autres photos</button>
          </p>
        )}

        <fieldset className="tir-groupe">
          <legend>Format</legend>
          {FORMATS_TIRAGE.map((f) => (
            <button key={f.id} type="button" className={`tir-opt ${format === f.id ? 'on' : ''}`}
              aria-pressed={format === f.id} onClick={() => setFormat(f.id)}>
              <span>{f.nom}<small>{f.sous}</small></span>
              <span className="tir-opt-prix">{euros(Math.round(f.prix * 100))} / photo</span>
            </button>
          ))}
        </fieldset>

        <fieldset className="tir-groupe">
          <legend>Finition</legend>
          <div className="tir-deux">
            {FINITIONS.map((f) => (
              <button key={f.id} type="button" className={`tir-opt ${finition === f.id ? 'on' : ''}`}
                aria-pressed={finition === f.id} onClick={() => setFinition(f.id)}>
                <span>{f.nom}<small>{f.sous}</small></span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Le rendu du tirage : les cinq pellicules de l'album et la date. La
            vignette montre la première photo de la commande, pour juger sur
            ses propres souvenirs plutôt que sur un exemple. */}
        <fieldset className="tir-groupe">
          <legend>Rendu</legend>
          <div className="tir-rendus">
            {PELLICULES.map((f) => (
              <button key={f.id} type="button" className={`tir-rendu ${pelliId === f.id ? 'on' : ''}`}
                aria-pressed={pelliId === f.id} onClick={() => setPelliId(f.id)}>
                {photos[0] && <Tirage photo={photos[0]} format="10x15" pelli={f} />}
                <em>{f.nom}</em>
              </button>
            ))}
          </div>
          <button type="button" className={`tir-opt tir-case-date ${dateOn ? 'on' : ''}`} role="checkbox" aria-checked={dateOn}
            onClick={() => setDateOn((v) => !v)}>
            <span className={`tir-coche ${dateOn ? 'on' : ''}`} aria-hidden="true">{dateOn ? '✓' : ''}</span>
            <span>Date incrustée<small>Les chiffres orange dans le coin, comme sur un jetable</small></span>
          </button>
        </fieldset>

        <fieldset className="tir-groupe">
          <legend>Livraison</legend>
          <div className="tir-champs">
            <label htmlFor="tir-pays">Pays
              <select {...champ('pays')} autoComplete="country">
                {PAYS.map((p) => <option key={p.code} value={p.code}>{p.nom}</option>)}
              </select>
            </label>
            <label htmlFor="tir-nom">Nom et prénom<input {...champ('nom')} autoComplete="name" /></label>
            <label htmlFor="tir-adresse">Adresse<input {...champ('adresse')} autoComplete="address-line1" /></label>
            <label htmlFor="tir-complement"><span>Complément <em>(facultatif)</em></span><input {...champ('complement')} autoComplete="address-line2" placeholder="Bâtiment, étage…" /></label>
            <div className="tir-cp-ville">
              <label htmlFor="tir-codePostal">Code postal<input {...champ('codePostal')} autoComplete="postal-code" maxLength={10} /></label>
              <label htmlFor="tir-ville">Ville<input {...champ('ville')} autoComplete="address-level2" /></label>
            </div>
            <label htmlFor="tir-email"><span>Mail <em>(confirmation et suivi du colis)</em></span><input {...champ('email')} type="email" autoComplete="email" required /></label>
          </div>
        </fieldset>

        <div className="tir-recap">
          <div><span>{devis.nombre} tirage{devis.nombre > 1 ? 's' : ''} {devis.format.nom}</span><span>{euros(devis.photos)}</span></div>
          <div><span>Livraison ({devis.pays.nom})</span><span>{euros(devis.port)}</span></div>
          <div className="tir-total"><span>Total</span><span>{euros(devis.total)}</span></div>
        </div>
      </div>

      <div className="tir-pied">
        {erreur && <p className="tir-erreur" role="alert">{erreur}</p>}
        <button className="tir-cta" disabled={etat !== 'choix' || devis.nombre === 0} onClick={commander}>
          {etat === 'paiement' ? 'Ouverture du paiement…' : etat === 'envoi' ? 'Un instant…' : devis.nombre === 0 ? 'Aucun tirage choisi' : `Commander (${euros(devis.total)})`}
        </button>
      </div>
    </div>
  )
}

// « Vos tirages sont en route » : après le paiement (retour de Stripe sur
// l'album) ou, en local sans Stripe, juste après la commande.
// `statut` : envoyee (tout va bien) · payee / en_preparation (paiement reçu,
// transmission en cours) · erreur (paiement reçu, transmission à reprendre).
export function MerciTirages({ photos = [], pelli = null, date = false, nombre, formatNom, total, statut = 'envoyee', simule = false, cout = null, onFermer }) {
  const enCours = statut === 'payee' || statut === 'en_preparation'
  const stripe = total != null ? Math.round(total * 0.015) + 25 : 0
  return (
    <div className="tir-ecran" role="dialog" aria-label="Commande envoyée">
      <div className="tir-fait">
        {photos.length > 0 && <Eventail photos={photos} pelli={pelli} date={date} />}
        <h2 className="tir-titre">{statut === 'erreur' ? 'Paiement reçu, merci' : 'Vos tirages sont en route'}</h2>
        <p className="tir-texte">
          {statut === 'erreur'
            ? 'Votre commande est bien payée. Un souci technique l\'a retenue avant l\'impression : nous la relançons nous-mêmes, vous n\'avez rien à faire.'
            : <>
              {nombre} tirage{nombre > 1 ? 's' : ''} {formatNom}, imprimé{nombre > 1 ? 's' : ''} sur vrai papier photo.
              {enCours ? ' Le paiement est reçu, votre commande part à l\'impression.' : ''} Comptez une semaine environ
              avant de les trouver dans votre boîte aux lettres.
            </>}
        </p>
        {simule && cout == null && (
          <p className="tir-simule">
            Commande d&apos;essai : l&apos;imprimeur n&apos;est pas encore branché, rien n&apos;a été payé ni envoyé.
          </p>
        )}
        {cout != null && (
          <div className="tir-simule">
            <strong>Commande d&apos;essai envoyée à Prodigi</strong> (bac à sable : rien n&apos;est imprimé ni facturé).
            <div className="tir-marge">
              <span>Le client paie</span><span>{euros(total)}</span>
              <span>Prodigi facture</span><span>− {euros(cout)}</span>
              <span>Stripe (1,5 % + 0,25 €)</span><span>− {euros(stripe)}</span>
              <b>Il vous reste</b><b>{euros(total - cout - stripe)}</b>
            </div>
          </div>
        )}
        <button className="tir-cta" onClick={onFermer}>Revenir à l&apos;album</button>
      </div>
    </div>
  )
}
