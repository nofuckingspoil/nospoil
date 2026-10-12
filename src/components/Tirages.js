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

import { useEffect, useState } from 'react'
import { noterEtape } from '../lib/etapes'
import {
  FORMATS_TIRAGE, FINITIONS, PROPORTIONS, BORDURE_MM, LARGEUR_MM, EXEMPLAIRES_MAX, devisTirages, euros,
  formatsTirage, finitions, listePays, prixAppel, PORT, regleLivraison, manquePourOffert, LIVRAISON_OFFERTE_DES, placeDansEnveloppe, estimationLivraison, texteArrivee, texteDepart, HEURE_LIMITE,
} from '../lib/tirages'
import { pellicules, cssTeinte, tamponDate } from '../lib/film'
import IconeCorbeille from './IconeCorbeille'
import { useLangue } from './Langue'

// Une photo de téléphone est en 3:4 : c'est la forme qu'on suppose tant que
// l'image n'est pas arrivée, pour que rien ne saute à l'affichage.
const RATIO_PAR_DEFAUT = 3 / 4

// `aLEchelle` : dans une planche, un tirage en largeur et un tirage en hauteur
// ont le même papier. On les dessine donc à la même échelle : le paysage prend
// toute la case, le portrait seulement la part qui correspond à sa largeur.
// `finition` : brillante | mate. L'aperçu suggère le papier (un reflet
// franc sur le brillant, un voile nacré sur le satiné) ; ce n'est qu'une
// évocation, la vraie différence se voit en tenant le tirage.
export function Tirage({ photo, format = '10x15', pelli = null, date = false, aLEchelle = false, finition = '', className = '', style }) {
  const [ratio, setRatio] = useState(RATIO_PAR_DEFAUT) // largeur / hauteur de la photo
  const papier = PROPORTIONS[format] || PROPORTIONS['10x15']
  // Le papier tourne avec la photo : un paysage s'imprime à l'horizontale.
  const pr = ratio > 1 ? 1 / papier : papier
  // La bordure blanche de sécurité, à l'échelle du papier : la photo se pose
  // entière dans ce qui reste.
  const court = LARGEUR_MM[format] || LARGEUR_MM['10x15']
  const long = court / papier
  const bl = BORDURE_MM / (ratio > 1 ? long : court) // part de la largeur
  const bh = BORDURE_MM / (ratio > 1 ? court : long) // part de la hauteur
  const L = pr * (1 - 2 * bl)
  const H = 1 - 2 * bh
  const [w, h] = ratio > L / H ? [L, L / ratio] : [H * ratio, H]
  const image = { width: `${(w / pr) * 100}%`, height: `${h * 100}%` }
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
  const { t, lang } = useLangue()
  return (
    // Le fond ne ferme rien : on ferme par la croix ou « Plus tard ».
    <div className="avis-pop">
      <div className="avis-pop-carte tir-invit" role="dialog" aria-labelledby="tir-invit-titre">
        <button className="tir-x" aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })} onClick={onFermer}>✕</button>
        <Eventail photos={photos} pelli={pelli} date={avecDate} />
        <h2 id="tir-invit-titre" className="tir-titre">{t({ fr: 'Et en vrai, sur papier ?', en: 'How about the real thing, on paper?', de: 'Und ganz echt, auf Papier?' })}</h2>
        <p className="tir-texte">
          {t({
            fr: <>Recevez vos photos préférées en tirages 10&nbsp;×&nbsp;15, imprimés sur vrai papier photo
              et livrés dans votre boîte aux lettres.</>,
            en: <>Get your favourite photos as 10&nbsp;×&nbsp;15 prints, printed on real photo paper
              and delivered to your letterbox.</>,
            de: <>Erhalten Sie Ihre Lieblingsfotos als Abzüge im Format 10&nbsp;×&nbsp;15, gedruckt auf echtem Fotopapier
              und direkt in Ihren Briefkasten geliefert.</>,
          })}
        </p>
        <p className="tir-prix">{t({
          fr: `${prixAppel(lang)} le tirage · livraison ${euros(Math.round(PORT * 100), lang)}, offerte dès ${LIVRAISON_OFFERTE_DES} tirages`,
          en: `${prixAppel(lang)} per print · delivery from ${euros(Math.round(PORT * 100), lang)}`,
          de: `${prixAppel(lang)} pro Abzug · Versand ab ${euros(Math.round(PORT * 100), lang)}`,
        })}</p>
        <button className="tir-cta" onClick={onChoisir}>
          {nbFavoris > 0
            ? t({
                fr: `Commander mes ${nbFavoris} favori${nbFavoris > 1 ? 's' : ''} en tirages`,
                en: `Order my ${nbFavoris} favourite${nbFavoris > 1 ? 's' : ''} as prints`,
                de: nbFavoris > 1 ? `Meine ${nbFavoris} Favoriten als Abzüge bestellen` : 'Meinen Favoriten als Abzug bestellen',
              })
            : t({ fr: 'Choisir mes tirages photo', en: 'Choose my photo prints', de: 'Meine Fotoabzüge auswählen' })}
        </button>
        <button className="tir-plus-tard" onClick={onFermer}>{t({ fr: 'Plus tard', en: 'Later', de: 'Später' })}</button>
      </div>
    </div>
  )
}

// `suggestions` : les photos les plus aimées de l'album (par cœurs), pas
// encore dans la commande. `onAjouter(ids)` les coche dans l'album.
export function CommandeTirages({ eventId, photos, suggestions = [], onAjouter, deviceToken, pelli, avecDate, onRetour, onTermine }) {
  const { t, lang, lien } = useLangue()
  const PELLICULES = pellicules(lang)
  const [format, setFormat] = useState(FORMATS_TIRAGE[0].id)
  const [finition, setFinition] = useState(FINITIONS[0].id)
  // Le rendu se choisit ici, photo par photo d'aperçu : il part de celui de
  // l'album (ce qu'on voyait en cochant), et on peut en changer sans y revenir.
  const [pelliId, setPelliId] = useState(pelli?.id || 'aucune')
  const [dateOn, setDateOn] = useState(!!avecDate)
  useEffect(() => {
    noterEtape('tirages_ecran', { eventId, detail: `${photos.length} photo${photos.length > 1 ? 's' : ''}` })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
  const devis = devisTirages(nombre, format, dest.pays, lang)

  // « Les préférées de la soirée » : tant qu'on est dans la même enveloppe
  // chez l'imprimeur, on propose de compléter avec les photos les plus aimées
  // (voir PLAGE_ENVELOPPE). Une remise ne servirait à rien : c'est l'effort de
  // retourner choisir qui freine, pas le prix d'une photo de plus.
  // Proposé une fois : après l'ajout, on n'insiste pas.
  const [dejaAjoute, setDejaAjoute] = useState(false)
  const proposees = onAjouter && !dejaAjoute ? suggestions.filter((p) => !(exemplaires[p.id] > 0)).slice(0, Math.min(5, placeDansEnveloppe(format, nombre))) : []
  const [suggestionVue, setSuggestionVue] = useState(false)
  useEffect(() => {
    if (proposees.length && !suggestionVue) {
      setSuggestionVue(true)
      noterEtape('tirages_suggestion_vue', { eventId, detail: `${nombre} + ${proposees.length}` })
    }
  }, [proposees.length]) // eslint-disable-line react-hooks/exhaustive-deps
  function ajouterSuggestions() {
    const ids = proposees.map((p) => p.id)
    setExemplaires((ex) => ({ ...ex, ...Object.fromEntries(ids.map((id) => [id, 1])) }))
    noterEtape('tirages_suggestion', { eventId, detail: `${nombre} + ${ids.length}` })
    setDejaAjoute(true)
    onAjouter(ids)
  }

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
          eventId, format, finition, deviceToken, destinataire: dest, langue: lang,
          rendu: { pellicule: rendu.id, date: dateOn },
          lignes: retenues.map((p) => ({ photoId: p.id, exemplaires: exemplaires[p.id] })),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || t({ fr: 'La commande n\'a pas pu partir. Réessayez dans un instant.', en: 'Your order could not be sent. Please try again in a moment.', de: 'Die Bestellung konnte nicht gesendet werden. Bitte versuchen Sie es gleich noch einmal.' }))
      // Le paiement se fait chez Stripe, qui ramène ensuite sur l'album.
      if (d.url) {
        noterEtape('tirages_paiement', { eventId, detail: `${nombre} × ${format}` })
        setEtat('paiement'); window.location.href = d.url; return
      }
      setSimule(!!d.simule)
      setCoutImprimeur(d.imprimeur?.cout || null)
      setEtat('fait')
    } catch (e) {
      setErreur(e.message)
      setEtat('choix')
    }
  }

  if (etat === 'fait') {
    return (
      <MerciTirages photos={photos.filter((p) => exemplaires[p.id] > 0)} pelli={rendu} date={dateOn}
        nombre={devis.nombre} formatNom={devis.format.nom} total={devis.total} pays={dest.pays} email={dest.email}
        simule={simule} cout={coutImprimeur?.total} onFermer={onTermine} />
    )
  }

  return (
    <div className="tir-ecran" role="dialog" aria-labelledby="tir-cmd-titre">
      <div className="tir-haut">
        <button className="tir-retour" onClick={onRetour} aria-label={t({ fr: 'Revenir à la sélection', en: 'Back to the selection', de: 'Zurück zur Auswahl' })}>←</button>
        <div>
          <h2 id="tir-cmd-titre" className="tir-h">{t({ fr: 'Mes tirages', en: 'My prints', de: 'Meine Abzüge' })}</h2>
          <span className="tir-compte">{t({
            fr: `${devis.nombre} tirage${devis.nombre > 1 ? 's' : ''}`,
            en: `${devis.nombre} print${devis.nombre !== 1 ? 's' : ''}`,
            de: `${devis.nombre} ${devis.nombre !== 1 ? 'Abzüge' : 'Abzug'}`,
          })} · {devis.format.nom}</span>
        </div>
        <button className="tir-modifier" onClick={onRetour}>{t({ fr: 'Modifier', en: 'Edit', de: 'Ändern' })}</button>
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
                <div className="tir-compteur" role="group" aria-label={p.who
                  ? t({ fr: `Exemplaires de la photo de ${p.who}`, en: `Copies of ${p.who}'s photo`, de: `Exemplare des Fotos von ${p.who}` })
                  : t({ fr: 'Exemplaires de la photo de la soirée', en: 'Copies of this photo', de: 'Exemplare dieses Fotos' })}>
                  {/* À un exemplaire, le « moins » devient une corbeille : on
                      retire la photo de la commande, au lieu d'un zéro qui
                      laissait une vignette fantôme dans la planche. */}
                  {n === 1 ? (
                    <button type="button" className="tir-retirer" onClick={() => changerExemplaires(p.id, -1)} aria-label={t({ fr: 'Retirer cette photo de la commande', en: 'Remove this photo from the order', de: 'Dieses Foto aus der Bestellung entfernen' })}>
                      <IconeCorbeille size={15} />
                    </button>
                  ) : (
                    <button type="button" onClick={() => changerExemplaires(p.id, -1)} aria-label={t({ fr: 'Un exemplaire de moins', en: 'One copy fewer', de: 'Ein Exemplar weniger' })}>−</button>
                  )}
                  <span aria-live="polite">{n}</span>
                  <button type="button" onClick={() => changerExemplaires(p.id, 1)} disabled={n >= EXEMPLAIRES_MAX} aria-label={t({ fr: 'Un exemplaire de plus', en: 'One more copy', de: 'Ein Exemplar mehr' })}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        {proposees.length > 0 && (
          <div className="tir-suggestion">
            <div className="tir-suggestion-tete">
              <strong>{t({ fr: 'Les préférées de la soirée', en: 'The party’s favourites', de: 'Die Lieblinge der Feier' })}</strong>
              <small>{t({
                fr: 'Les photos les plus aimées de l\'album, que vous n\'avez pas encore choisies.',
                en: 'The most-loved photos in the album that you haven’t picked yet.',
                de: 'Die beliebtesten Fotos des Albums, die Sie noch nicht ausgewählt haben.',
              })}</small>
            </div>
            <div className="tir-suggestion-vignettes">
              {proposees.map((p) => <img key={p.id} src={p.url} alt="" />)}
            </div>
            <button type="button" className="tir-suggestion-cta" onClick={ajouterSuggestions}>
              {(() => {
                const k = proposees.length
                const prix = euros(k * Math.round(devis.format.prix * 100), lang)
                return t({
                  fr: k > 1 ? `Ajouter ces ${k} photos (+${prix})` : `Ajouter cette photo (+${prix})`,
                  en: k > 1 ? `Add these ${k} photos (+${prix})` : `Add this photo (+${prix})`,
                  de: k > 1 ? `Diese ${k} Fotos hinzufügen (+${prix})` : `Dieses Foto hinzufügen (+${prix})`,
                })
              })()}
            </button>
          </div>
        )}

        {devis.nombre === 0 && (
          <p className="tir-note">
            {t({ fr: 'Toutes les photos ont été retirées.', en: 'All the photos have been removed.', de: 'Alle Fotos wurden entfernt.' })}{' '}
            <button type="button" className="tir-lien" onClick={onRetour}>{t({ fr: 'Choisir d\'autres photos', en: 'Choose other photos', de: 'Andere Fotos auswählen' })}</button>
          </p>
        )}

        <fieldset className="tir-groupe">
          <legend>{t({ fr: 'Format', en: 'Size', de: 'Format' })}</legend>
          {formatsTirage(lang).map((f) => (
            <button key={f.id} type="button" className={`tir-opt ${format === f.id ? 'on' : ''}`}
              aria-pressed={format === f.id} onClick={() => setFormat(f.id)}>
              <span>{f.nom}<small>{f.sous}</small></span>
              <span className="tir-opt-prix">{euros(Math.round(f.prix * 100), lang)} / {t({ fr: 'photo', en: 'photo', de: 'Foto' })}</span>
            </button>
          ))}
        </fieldset>

        <fieldset className="tir-groupe">
          <legend>{t({ fr: 'Finition', en: 'Finish', de: 'Oberfläche' })}</legend>
          <div className="tir-deux">
            {finitions(lang).map((f) => (
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
          <legend>{t({ fr: 'Rendu', en: 'Look', de: 'Look' })}</legend>
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
            <span>
              {t({ fr: 'Date incrustée', en: 'Date stamp', de: 'Datumsstempel' })}
              <small>{t({ fr: 'Les chiffres orange dans le coin, comme sur un jetable', en: 'The orange digits in the corner, just like a disposable camera', de: 'Die orangefarbenen Ziffern in der Ecke, wie bei einer Einwegkamera' })}</small>
            </span>
          </button>
        </fieldset>

        <fieldset className="tir-groupe">
          <legend>{t({ fr: 'Livraison', en: 'Delivery', de: 'Lieferung' })}</legend>
          <div className="tir-champs">
            <label htmlFor="tir-pays">{t({ fr: 'Pays', en: 'Country', de: 'Land' })}
              <select {...champ('pays')} autoComplete="country">
                {listePays(lang).map((p) => <option key={p.code} value={p.code}>{p.nom}</option>)}
              </select>
              <small className="tir-regle">{regleLivraison(format, dest.pays, lang)}</small>
            </label>
            <label htmlFor="tir-nom">{t({ fr: 'Nom et prénom', en: 'Full name', de: 'Vor- und Nachname' })}<input {...champ('nom')} autoComplete="name" /></label>
            <label htmlFor="tir-adresse">{t({ fr: 'Adresse', en: 'Address', de: 'Adresse' })}<input {...champ('adresse')} autoComplete="address-line1" /></label>
            <label htmlFor="tir-complement">
              <span>{t({ fr: 'Complément', en: 'Address line 2', de: 'Adresszusatz' })} <em>{t({ fr: '(facultatif)', en: '(optional)', de: '(optional)' })}</em></span>
              <input {...champ('complement')} autoComplete="address-line2" placeholder={t({ fr: 'Bâtiment, étage…', en: 'Building, floor…', de: 'Gebäude, Etage…' })} />
            </label>
            <div className="tir-cp-ville">
              <label htmlFor="tir-codePostal">{t({ fr: 'Code postal', en: 'Postcode', de: 'Postleitzahl' })}<input {...champ('codePostal')} autoComplete="postal-code" maxLength={10} /></label>
              <label htmlFor="tir-ville">{t({ fr: 'Ville', en: 'Town/City', de: 'Ort' })}<input {...champ('ville')} autoComplete="address-level2" /></label>
            </div>
            <label htmlFor="tir-email">
              <span>{t({ fr: 'Mail', en: 'Email', de: 'E-Mail' })} <em>{t({ fr: '(confirmation et avis d\'expédition)', en: '(confirmation and shipping notice)', de: '(Bestätigung und Versandbenachrichtigung)' })}</em></span>
              <input {...champ('email')} type="email" autoComplete="email" required />
            </label>
          </div>
        </fieldset>

        <ArriveePrevue pays={dest.pays} />

        <div className="tir-recap">
          <div>
            <span>{t({
              fr: `${devis.nombre} tirage${devis.nombre > 1 ? 's' : ''} ${devis.format.nom}`,
              en: `${devis.nombre} × ${devis.format.nom} print${devis.nombre !== 1 ? 's' : ''}`,
              de: `${devis.nombre} ${devis.nombre !== 1 ? 'Abzüge' : 'Abzug'} ${devis.format.nom}`,
            })}</span>
            <span>{euros(devis.photos, lang)}</span>
          </div>
          <div><span>{t({ fr: 'Livraison', en: 'Delivery', de: 'Lieferung' })} ({devis.pays.nom})</span><span>{devis.nombre > 0 && devis.port === 0 ? t({ fr: 'Offerte', en: 'Free', de: 'Kostenlos' }) : euros(devis.port, lang)}</span></div>
          {/* Le petit coup de pouce, seulement quand on est déjà tout près :
              à partir de 10 tirages, il en manque 10 au plus. */}
          {(() => {
            const manque = manquePourOffert(devis.nombre, dest.pays)
            // Une seule invitation à la fois : l'encart des préférées passe avant.
            if (manque == null || devis.nombre === 0 || proposees.length > 0) return null
            if (manque === 0) return <p className="tir-offert on">{t({ fr: '🎁 Livraison offerte', en: '🎁 Free delivery', de: '🎁 Kostenloser Versand' })}</p>
            if (manque > 10) return null
            return (
              <p className="tir-offert">{t({
                fr: `Plus que ${manque} tirage${manque > 1 ? 's' : ''} pour la livraison offerte`,
                en: `${manque} more print${manque > 1 ? 's' : ''} for free delivery`,
                de: `Noch ${manque} ${manque > 1 ? 'Abzüge' : 'Abzug'} bis zum kostenlosen Versand`,
              })}{' '}<button type="button" className="tir-lien" onClick={onRetour}>{t({ fr: 'Ajouter des photos', en: 'Add photos', de: 'Fotos hinzufügen' })}</button></p>
            )
          })()}
          <div className="tir-total"><span>{t({ fr: 'Total', en: 'Total', de: 'Gesamt' })}</span><span>{euros(devis.total, lang)}</span></div>
        </div>
      </div>

      <div className="tir-pied">
        {erreur && <p className="tir-erreur" role="alert">{erreur}</p>}
        <p className="tir-cgv">
          {t({
            fr: <>Tirages personnalisés : pas de droit de rétractation. En commandant, vous acceptez
              nos <a href={lien('/cgv')} target="_blank" rel="noreferrer">conditions de vente</a>.</>,
            en: <>Personalised prints: no right of withdrawal. By ordering, you accept
              our <a href={lien('/cgv')} target="_blank" rel="noreferrer">terms of sale</a>.</>,
            de: <>Personalisierte Abzüge: kein Widerrufsrecht. Mit Ihrer Bestellung akzeptieren Sie
              unsere <a href={lien('/cgv')} target="_blank" rel="noreferrer">Verkaufsbedingungen</a>.</>,
          })}
        </p>
        <button className="tir-cta" disabled={etat !== 'choix' || devis.nombre === 0} onClick={commander}>
          {etat === 'paiement'
            ? t({ fr: 'Ouverture du paiement…', en: 'Opening payment…', de: 'Zahlung wird geöffnet…' })
            : etat === 'envoi'
              ? t({ fr: 'Un instant…', en: 'One moment…', de: 'Einen Moment…' })
              : devis.nombre === 0
                ? t({ fr: 'Aucun tirage choisi', en: 'No prints selected', de: 'Keine Abzüge ausgewählt' })
                : t({ fr: `Commander (${euros(devis.total, lang)})`, en: `Order (${euros(devis.total, lang)})`, de: `Bestellen (${euros(devis.total, lang)})` })}
        </button>
      </div>
    </div>
  )
}

// Avant de payer : le jour où les tirages arrivent. La date bouge avec
// l'heure (avant ou après 17 h) et le pays choisi.
function ArriveePrevue({ pays }) {
  const { t, lang } = useLangue()
  const [maintenant, setMaintenant] = useState(() => new Date())
  // L'écran peut rester ouvert longtemps : on recalcule chaque minute, pour
  // que 17 h passé, la date suive.
  useEffect(() => {
    const m = setInterval(() => setMaintenant(new Date()), 60000)
    return () => clearInterval(m)
  }, [])
  const est = estimationLivraison(maintenant, pays)
  const arrivee = texteArrivee(est, lang)
  return (
    <div className="tir-arrivee">
      <span className="tir-arrivee-ico" aria-hidden="true">📬</span>
      <div>
        <strong>{t({ fr: `Chez vous ${arrivee}`, en: `With you ${arrivee}`, de: `Bei Ihnen ${arrivee}` })}</strong>
        <small>
          {t({
            fr: `Imprimés à Rouen, ${texteDepart(est, 'fr')} par La Poste${est.ceSoir ? ` (pour toute commande avant ${HEURE_LIMITE} h)` : ''}.`,
            en: `Printed in Rouen, France, ${texteDepart(est, 'en')} by La Poste${est.ceSoir ? ` (for orders placed before ${HEURE_LIMITE}:00)` : ''}.`,
            de: `In Rouen (Frankreich) gedruckt und ${texteDepart(est, 'de')}${est.ceSoir ? ` (bei Bestellung vor ${HEURE_LIMITE} Uhr)` : ''}.`,
          })}
          {pays !== 'FR' && t({ fr: ' Délai indicatif hors de France.', en: ' Estimated time outside France.', de: ' Unverbindliche Lieferzeit außerhalb Frankreichs.' })}
        </small>
      </div>
    </div>
  )
}

// « Vos tirages sont en route » : après le paiement (retour de Stripe sur
// l'album) ou, en local sans Stripe, juste après la commande.
// `statut` : envoyee (tout va bien) · payee / en_preparation (paiement reçu,
// transmission en cours) · erreur (paiement reçu, transmission à reprendre).
export function MerciTirages({ photos = [], pelli = null, date = false, nombre, formatNom, total, statut = 'envoyee', payeLe = null, pays = 'FR', email = '', simule = false, cout = null, onFermer }) {
  const { t, lang } = useLangue()
  const enCours = statut === 'payee' || statut === 'en_preparation'
  const est = estimationLivraison(payeLe ? new Date(payeLe) : new Date(), pays)
  const arrivee = texteArrivee(est, lang)
  const stripe = total != null ? Math.round(total * 0.015) + 25 : 0
  return (
    <div className="tir-ecran" role="dialog" aria-label={t({ fr: 'Commande envoyée', en: 'Order sent', de: 'Bestellung gesendet' })}>
      <div className="tir-fait">
        {photos.length > 0 && <Eventail photos={photos} pelli={pelli} date={date} />}
        <h2 className="tir-titre">{statut === 'erreur'
          ? t({ fr: 'Paiement reçu, merci', en: 'Payment received, thank you', de: 'Zahlung erhalten, vielen Dank' })
          : t({ fr: 'Vos tirages sont en route', en: 'Your prints are on their way', de: 'Ihre Abzüge sind unterwegs' })}</h2>
        <p className="tir-texte">
          {statut === 'erreur'
            ? t({
                fr: 'Votre commande est bien payée. Un souci technique l\'a retenue avant l\'impression : nous la relançons nous-mêmes, vous n\'avez rien à faire.',
                en: 'Your order has been paid. A technical issue held it up before printing: we are restarting it ourselves, so there is nothing you need to do.',
                de: 'Ihre Bestellung ist bezahlt. Ein technisches Problem hat sie vor dem Druck aufgehalten: Wir kümmern uns selbst darum, Sie müssen nichts tun.',
              })
            : t({
                fr: <>
                  {nombre} tirage{nombre > 1 ? 's' : ''} {formatNom}, imprimé{nombre > 1 ? 's' : ''} sur vrai papier photo à Rouen
                  et {texteDepart(est, 'fr', nombre > 1)} par La Poste.
                </>,
                en: `${nombre} × ${formatNom} print${nombre !== 1 ? 's' : ''}, printed on real photo paper in Rouen, France, and ${texteDepart(est, 'en')} by La Poste.`,
                de: `${nombre} ${nombre !== 1 ? 'Abzüge' : 'Abzug'} ${formatNom}, in Rouen (Frankreich) auf echtem Fotopapier gedruckt und ${texteDepart(est, 'de')}.`,
              })}
        </p>
        {statut !== 'erreur' && (
          <div className="tir-arrivee tir-arrivee-merci">
            <span className="tir-arrivee-ico" aria-hidden="true">📬</span>
            <div>
              <small>{t({ fr: 'Arrivée prévue', en: 'Expected delivery', de: 'Voraussichtliche Lieferung' })}</small>
              <strong>{arrivee.charAt(0).toUpperCase() + arrivee.slice(1)}</strong>
            </div>
          </div>
        )}
        <div className="tir-arrivee tir-arrivee-mail">
          <span className="tir-arrivee-ico" aria-hidden="true">📩</span>
          <p>
            {email
              ? t({
                  fr: <>Un mail de confirmation part à <strong>{email}</strong>, avec le récapitulatif de votre commande. Vous en recevrez un second le jour où vos tirages quittent Rouen.</>,
                  en: <>A confirmation email is on its way to <strong>{email}</strong> with your order summary. You will get a second one on the day your prints leave Rouen.</>,
                  de: <>Eine Bestätigungs-E-Mail mit der Zusammenfassung Ihrer Bestellung geht an <strong>{email}</strong>. Eine zweite folgt an dem Tag, an dem Ihre Abzüge Rouen verlassen.</>,
                })
              : t({
                  fr: 'Un mail de confirmation part avec le récapitulatif de votre commande. Vous en recevrez un second le jour où vos tirages quittent Rouen.',
                  en: 'A confirmation email is on its way with your order summary. You will get a second one on the day your prints leave Rouen.',
                  de: 'Eine Bestätigungs-E-Mail mit der Zusammenfassung Ihrer Bestellung ist unterwegs. Eine zweite folgt an dem Tag, an dem Ihre Abzüge Rouen verlassen.',
                })}
            {' '}{t({ fr: 'Pensez à regarder dans les indésirables.', en: 'Remember to check your spam folder.', de: 'Schauen Sie bitte auch im Spam-Ordner nach.' })}
          </p>
        </div>
        {simule && cout == null && (
          <p className="tir-simule">
            {t({
              fr: <>Commande d&apos;essai : l&apos;imprimeur n&apos;est pas encore branché, rien n&apos;a été payé ni envoyé.</>,
              en: 'Test order: the printer is not connected yet, nothing has been paid or sent.',
              de: 'Testbestellung: Die Druckerei ist noch nicht angebunden, nichts wurde bezahlt oder versendet.',
            })}
          </p>
        )}
        {cout != null && (
          <div className="tir-simule">
            {t({
              fr: <><strong>Commande d&apos;essai envoyée à l&apos;imprimeur</strong> (bac à sable : rien n&apos;est imprimé ni facturé).</>,
              en: <><strong>Test order sent to the printer</strong> (sandbox: nothing is printed or billed).</>,
              de: <><strong>Testbestellung an die Druckerei gesendet</strong> (Sandbox: Es wird nichts gedruckt oder berechnet).</>,
            })}
            <div className="tir-marge">
              <span>{t({ fr: 'Le client paie', en: 'Customer pays', de: 'Kunde zahlt' })}</span><span>{euros(total, lang)}</span>
              <span>{t({ fr: 'L\'imprimeur facture', en: 'Printer charges', de: 'Druckerei berechnet' })}</span><span>− {euros(cout, lang)}</span>
              <span>{t({ fr: 'Stripe (1,5 % + 0,25 €)', en: 'Stripe (1.5% + €0.25)', de: 'Stripe (1,5 % + 0,25 €)' })}</span><span>− {euros(stripe, lang)}</span>
              <b>{t({ fr: 'Il vous reste', en: 'You keep', de: 'Ihnen bleiben' })}</b><b>{euros(total - cout - stripe, lang)}</b>
            </div>
          </div>
        )}
        <button className="tir-cta" onClick={onFermer}>{t({ fr: 'Revenir à l\'album', en: 'Back to the album', de: 'Zurück zum Album' })}</button>
      </div>
    </div>
  )
}
