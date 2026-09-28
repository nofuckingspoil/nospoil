'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { chiffresSoiree } from '../lib/synthese'
import { useLangue } from './Langue'

// ============================================================
//  Le résumé de soirée, montré au participant juste avant l'album.
//
//  Il ouvre l'album en pleine attente : le faire patienter quelques
//  secondes avec quelque chose qui le concerne ne l'agace pas, ça
//  fait monter l'envie. Trois règles, tenues ici :
//   · on peut passer dès la première seconde ;
//   · on ne le voit qu'une fois ;
//   · sans identité connue, on ne montre que le collectif.
// ============================================================

const DUREE = 3600 // ms par carte

export function wrapDejaVu(eventId) {
  try { return !!localStorage.getItem(`ttf_wrap_${eventId}`) } catch { return true }
}
// Le résumé ne se montre qu'une fois, mais on doit pouvoir le redemander :
// c'est le genre de chose qu'on veut remontrer à quelqu'un à côté de soi.
export function oublierWrap(eventId) {
  try { localStorage.removeItem(`ttf_wrap_${eventId}`) } catch {}
}
function marquerVu(eventId) {
  try { localStorage.setItem(`ttf_wrap_${eventId}`, '1') } catch {}
}

function dateCourte(iso, locale = 'fr-FR') {
  try {
    return new Date(iso).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

// « 21h30 » en français, « 21:30 » ailleurs.
function heure(iso, locale = 'fr-FR') {
  try {
    const h = new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    return locale === 'fr-FR' ? h.replace(':', 'h') : h
  } catch { return '' }
}

export default function WrapInvite({ eventId, nom, photos, guests, moiId, onClose }) {
  const { t, lang, locale } = useLangue()
  const chiffres = useMemo(() => chiffresSoiree({ photos, guests, langue: lang }), [photos, guests, lang])

  const cartes = useMemo(() => {
    const mesPhotos = moiId ? photos.filter((p) => p.guestId === moiId) : []

    const nbPhotos = photos.length
    const nbGuests = (guests || []).length
    const liste = [
      {
        cle: 'ouverture',
        oeil: nom
          ? t({ fr: `l’album de ${nom}`, en: `${nom}’s album`, de: `das Album: ${nom}` })
          : t({ fr: 'votre album', en: 'your album', de: 'Ihr Album' }),
        chiffre: nbPhotos,
        titre: t({
          fr: `photo${nbPhotos > 1 ? 's' : ''} développée${nbPhotos > 1 ? 's' : ''}`,
          en: nbPhotos === 1 ? 'photo developed' : 'photos developed',
          de: nbPhotos === 1 ? 'Foto entwickelt' : 'Fotos entwickelt',
        }),
        sous: t({ fr: 'La pellicule est prête.', en: 'The film is ready.', de: 'Der Film ist fertig.' }),
      },
      {
        cle: 'photographes',
        oeil: t({ fr: 'derrière l’objectif', en: 'behind the lens', de: 'hinter der Linse' }),
        chiffre: nbGuests,
        titre: t({
          fr: `photographe${nbGuests > 1 ? 's' : ''}`,
          en: nbGuests === 1 ? 'photographer' : 'photographers',
          de: nbGuests === 1 ? 'Fotograf' : 'Fotografen',
        }),
        sous: t({
          fr: 'Chacun a vu la fête autrement.',
          en: 'Everyone saw the party differently.',
          de: 'Jeder hat die Feier anders gesehen.',
        }),
      },
    ]

    if (mesPhotos.length > 0) {
      liste.push({
        cle: 'moi',
        oeil: t({ fr: 'et toi dans tout ça', en: 'and what about you', de: 'und Sie?' }),
        chiffre: mesPhotos.length,
        titre: t({
          fr: `cliché${mesPhotos.length > 1 ? 's' : ''} de toi`,
          en: mesPhotos.length === 1 ? 'shot by you' : 'shots by you',
          de: mesPhotos.length === 1 ? 'Aufnahme von Ihnen' : 'Aufnahmen von Ihnen',
        }),
        sous: mesPhotos.length >= 5
          ? t({ fr: 'Tu n’as pas chômé.', en: 'You’ve been busy.', de: 'Sie waren fleißig.' })
          : t({
              fr: 'Chacun compte : ils sont dans l’album.',
              en: 'Every one counts: they’re in the album.',
              de: 'Jede zählt: Sie sind alle im Album.',
            }),
        vignettes: mesPhotos.slice(0, 4).map((p) => p.url),
      })

      if (mesPhotos.length > 1) {
        const premiere = mesPhotos[0]
        const derniere = mesPhotos[mesPhotos.length - 1]
        const h1 = heure(premiere.takenAt, locale)
        const h2 = heure(derniere.takenAt, locale)
        if (h1 !== h2) {
          liste.push({
            cle: 'evenement',
            // « Ta nuit » supposait une fête nocturne : un baptême à 15 h s'y
            // serait senti moqué.
            oeil: t({ fr: 'ton événement', en: 'your event', de: 'Ihr Event' }),
            texte: t({ fr: `de ${h1} à ${h2}`, en: `from ${h1} to ${h2}`, de: `von ${h1} bis ${h2}` }),
            sous: t({
              fr: 'Entre les deux, il s’est passé des choses.',
              en: 'A lot happened in between.',
              de: 'Dazwischen ist einiges passiert.',
            }),
          })
        }
      }
    }

    // Le photographe de la soirée vient des mêmes chiffres que la carte de
    // fin : deux calculs auraient fini par se contredire, et ils l'avaient
    // déjà fait (une soirée avec deux ex æquo en sacrait un des deux).
    if (chiffres.champion) {
      liste.push({
        cle: 'champion',
        oeil: t({ fr: 'photographe en chef', en: 'chief photographer', de: 'Chef-Fotograf' }),
        texte: chiffres.champion.nom,
        sous: chiffres.champion.rapidite
          ? t({
              fr: `${chiffres.champion.photos} clichés, et les plus rapides. Respect.`,
              en: `${chiffres.champion.photos} shots, and the fastest. Respect.`,
              de: `${chiffres.champion.photos} Aufnahmen, und das am schnellsten. Respekt.`,
            })
          : t({
              fr: `${chiffres.champion.photos} clichés à lui seul. Respect.`,
              en: `${chiffres.champion.photos} shots all on their own. Respect.`,
              de: `${chiffres.champion.photos} Aufnahmen ganz allein. Respekt.`,
            }),
      })
    }

    // La carte de fin : tout ce qui précède défile, celle-ci s'arrête. C'est
    // la seule qui n'est pas une story : on la regarde, on l'enregistre, on la
    // partage, puis on entre dans l'album.
    if (photos.length > 0) liste.push({ cle: 'synthese', synthese: true })

    return liste
  }, [photos, guests, moiId, chiffres, nom, t, locale])

  const [i, setI] = useState(0)

  const fermer = useCallback(() => {
    marquerVu(eventId)
    onClose()
  }, [eventId, onClose])

  // Fermer depuis une fonction de mise à jour d'état reviendrait à modifier un
  // autre composant pendant un rendu : on décide ici, en clair.
  const suivant = useCallback(() => {
    if (i + 1 >= cartes.length) fermer()
    else setI(i + 1)
  }, [i, cartes.length, fermer])

  const surSynthese = !!cartes[i]?.synthese

  // Défilement automatique, comme une story. Le minuteur repart à chaque carte,
  // sauf sur la carte de fin : elle ne se regarde pas en trois secondes, et on
  // y a deux gestes à faire.
  useEffect(() => {
    if (surSynthese) return
    const t = setTimeout(suivant, DUREE)
    return () => clearTimeout(t)
  }, [suivant, surSynthese])

  // Échap pour sortir : personne ne doit se sentir retenu.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') fermer()
      if (e.key === 'ArrowRight') suivant()
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fermer, suivant])

  if (!cartes.length) return null
  const c = cartes[i]
  const derniere = i === cartes.length - 1

  return (
    <div className="wrap" role="dialog" aria-label={t({ fr: "Résumé de l'événement", en: 'Event summary', de: 'Zusammenfassung des Events' })}>
      <div className="wrap-barres" aria-hidden="true">
        {cartes.map((x, n) => (
          <span key={x.cle} className="wrap-barre">
            <i className={n < i ? 'pleine' : n === i ? 'court' : ''}
              style={n === i ? { animationDuration: `${DUREE}ms` } : undefined} />
          </span>
        ))}
      </div>

      <button className="wrap-passer" onClick={fermer}>{t({ fr: 'Passer', en: 'Skip', de: 'Überspringen' })}</button>

      {/* Toucher à droite avance, à gauche revient : le geste des stories. */}
      <button className="wrap-zone gauche" aria-label={t({ fr: 'Précédent', en: 'Previous', de: 'Zurück' })}
        onClick={() => setI((n) => Math.max(0, n - 1))} />
      <button className="wrap-zone droite" aria-label={t({ fr: 'Suivant', en: 'Next', de: 'Weiter' })} onClick={suivant} />

      {c.synthese ? (
        <div className="wrap-carte synthese" key={c.cle}>
          <span className="syn-oeil">🎉 {t({ fr: 'Votre album collaboratif', en: 'Your shared album', de: 'Ihr gemeinsames Album' })}</span>
          {nom && <h2 className="syn-nom">{nom}</h2>}
          {(chiffres.date || chiffres.duree) && (
            <p className="syn-date">
              {[
                chiffres.date ? dateCourte(chiffres.date, locale) : '',
                chiffres.duree
                  ? t({ fr: `${chiffres.duree} de fête`, en: `${chiffres.duree} of partying`, de: `${chiffres.duree} Feier` })
                  : '',
              ]
                .filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="syn-chiffres">
            <div><b>{chiffres.photos}</b><span>{t({
              fr: `photo${chiffres.photos > 1 ? 's' : ''} prise${chiffres.photos > 1 ? 's' : ''}`,
              en: chiffres.photos === 1 ? 'photo taken' : 'photos taken',
              de: chiffres.photos === 1 ? 'Foto gemacht' : 'Fotos gemacht',
            })}</span></div>
            <div><b>{chiffres.photographes}</b><span>{t({
              fr: `photographe${chiffres.photographes > 1 ? 's' : ''}`,
              en: chiffres.photographes === 1 ? 'photographer' : 'photographers',
              de: chiffres.photographes === 1 ? 'Fotograf' : 'Fotografen',
            })}</span></div>
            <div><b>{lang === 'en' ? String(chiffres.moyenne) : String(chiffres.moyenne).replace('.', ',')}</b><span>{t({ fr: 'chacun', en: 'each', de: 'pro Person' })}</span></div>
          </div>

          {(chiffres.premier?.url || chiffres.dernier?.url) && (
            <div className="syn-duo">
              {chiffres.premier?.url && (
                <span>
                  <img src={chiffres.premier.url} alt="" />
                  <i>{t({ fr: 'La première', en: 'The first', de: 'Das erste' })} · {chiffres.premier.heure}</i>
                </span>
              )}
              {chiffres.dernier?.url && (
                <span>
                  <img src={chiffres.dernier.url} alt="" />
                  <i>{t({ fr: 'La dernière', en: 'The last', de: 'Das letzte' })} · {chiffres.dernier.heure}</i>
                </span>
              )}
            </div>
          )}

          {(chiffres.champion || chiffres.pointe) && (
            <div className="syn-faits">
              {chiffres.champion && (
                <div>
                  <span>{t({ fr: 'Photographe en chef', en: 'Chief photographer', de: 'Chef-Fotograf' })}</span>
                  <b>
                    {chiffres.champion.nom}
                    <em>
                      {t({ fr: `${chiffres.champion.photos} clichés`, en: `${chiffres.champion.photos} shots`, de: `${chiffres.champion.photos} Aufnahmen` })}
                      {chiffres.champion.rapidite
                        ? t({ fr: ` en ${chiffres.champion.rapidite}`, en: ` in ${chiffres.champion.rapidite}`, de: ` in ${chiffres.champion.rapidite}` })
                        : ''}
                    </em>
                  </b>
                </div>
              )}
              {chiffres.pointe && (
                <div><span>{t({ fr: 'Ça a le plus flashé', en: 'Peak flashing', de: 'Am meisten geblitzt' })}</span><b>{chiffres.pointe.libelle} <em>{t({ fr: `${chiffres.pointe.photos} photos`, en: `${chiffres.pointe.photos} photos`, de: `${chiffres.pointe.photos} Fotos` })}</em></b></div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="wrap-carte" key={c.cle}>
          <span className="wrap-oeil">{c.oeil}</span>

          {c.chiffre !== undefined ? (
            <>
              <span className="wrap-chiffre">{c.chiffre}</span>
              <h2 className="wrap-titre">{c.titre}</h2>
            </>
          ) : (
            <h2 className="wrap-texte">{c.texte}</h2>
          )}

          <p className="wrap-sous">{c.sous}</p>

          {c.vignettes?.length > 0 && (
            <div className="wrap-vignettes">
              {c.vignettes.map((u, n) => (
                <span key={u} style={{ transform: `rotate(${[-7, 5, -3, 8][n] || 0}deg)` }}>
                  <img src={u} alt="" />
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="wrap-fin" onClick={fermer}>
        {derniere
          ? t({ fr: `Voir les ${photos.length} photos →`, en: `See all ${photos.length} photos →`, de: `Alle ${photos.length} Fotos ansehen →` })
          : t({ fr: 'Aller à l’album →', en: 'Go to the album →', de: 'Zum Album →' })}
      </button>
    </div>
  )
}
