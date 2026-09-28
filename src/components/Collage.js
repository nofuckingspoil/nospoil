'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decodeImage } from '../lib/camera'
import { pelliculeParId } from '../lib/film'
import {
  FONDS, FORMATS, NB_TIRAGES,
  collageEnBlob, dessinerCollage, reduire, selectionAuto,
} from '../lib/collage'
import { useLangue } from './Langue'

// ============================================================
//  « Partager la soirée » : une image, un enregistrement, une publication.
//
//  L'écran tient en trois décisions et un bouton. Tout le reste est déjà
//  décidé pour la personne : quelles photos, dans quel ordre, avec quel
//  rendu. Un panneau d'options aurait fait fuir ceux-là même qu'on veut
//  voir publier.
// ============================================================

const SOURCES = [
  { key: 'miennes', label: { fr: 'Mes clichés', en: 'My shots', de: 'Meine Fotos' } },
  { key: 'favorites', label: { fr: 'Mes favoris', en: 'My favourites', de: 'Meine Favoriten' } },
  { key: 'soiree', label: { fr: 'La soirée', en: 'The event', de: 'Die Feier' } },
]

// Les libellés des formats et des fonds de lib/collage.js, dans chaque langue.
const LIBELLES_FORMATS = {
  story: { label: { fr: 'Story', en: 'Story', de: 'Story' }, sub: { fr: 'Plein écran', en: 'Full screen', de: 'Vollbild' } },
  post: { label: { fr: 'Publication', en: 'Post', de: 'Beitrag' }, sub: { fr: 'Pour le fil', en: 'For your feed', de: 'Für den Feed' } },
}
const LIBELLES_FONDS = {
  papier: { fr: 'Papier', en: 'Paper', de: 'Papier' },
  nuit: { fr: 'Nuit', en: 'Night', de: 'Nacht' },
}

export default function Collage({
  photos, nom, favs, pelliculeId, avecDate, onFermer, onEnregistrer,
}) {
  const { t } = useLangue()
  const [format, setFormat] = useState('story')
  const [fond, setFond] = useState('papier')
  const [graine, setGraine] = useState(1)
  const [occupe, setOccupe] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const apercu = useRef(null)
  const cache = useRef(new Map())

  const visibles = useMemo(() => photos.filter((p) => !p.hidden), [photos])
  const miennes = useMemo(() => visibles.filter((p) => p.mine), [visibles])
  const favorites = useMemo(() => visibles.filter((p) => favs.has(p.id)), [visibles, favs])

  // On ouvre sur ce que la personne a de plus personnel à montrer. Proposer
  // « mes clichés » à quelqu'un qui n'a pas pris de photo serait un écran vide
  // en guise d'accueil.
  const [source, setSource] = useState(() => (
    miennes.length > 0 ? 'miennes' : favorites.length > 0 ? 'favorites' : 'soiree'
  ))

  const dispo = { miennes: miennes.length, favorites: favorites.length, soiree: visibles.length }

  const choisies = useMemo(() => {
    if (source === 'miennes') return reduire(miennes, NB_TIRAGES)
    if (source === 'favorites') return reduire(favorites, NB_TIRAGES)
    return selectionAuto(visibles, NB_TIRAGES)
  }, [source, miennes, favorites, visibles])

  const pellicule = pelliculeParId(pelliculeId)

  // Décoder une photo une seule fois : on change de format et de fond sans
  // arrêt, il serait absurde de la retélécharger à chaque aperçu.
  const charger = useCallback(async (url) => {
    if (cache.current.has(url)) return cache.current.get(url)
    const p = fetch(url)
      .then((r) => r.blob())
      .then((b) => decodeImage(b))
      .catch(() => null)
    cache.current.set(url, p)
    return p
  }, [])

  const composer = useCallback(async (canvas, liste, echelle, pleine) => {
    const images = await Promise.all(liste.map((p) => charger(pleine ? (p.fullUrl || p.url) : (p.url || p.fullUrl))))
    const tirages = liste
      .map((p, i) => ({ img: images[i], takenAt: p.takenAt }))
      .filter((t) => t.img)
    if (tirages.length === 0) throw new Error('vide')
    dessinerCollage(canvas, {
      tirages,
      format,
      fond,
      titre: nom || '',
      surtitre: t({ fr: 'Les souvenirs de', en: 'Memories of', de: 'Erinnerungen an' }),
      pied: t({ fr: 'L’appareil photo jetable de vos événements', en: 'The disposable camera for your events', de: 'Die Einwegkamera für Ihre Events' }),
      pellicule,
      avecDate,
      graine,
      echelle,
    })
    return tirages.length
  }, [charger, format, fond, nom, pellicule, avecDate, graine, t])

  // L'aperçu travaille sur les mini-versions, à mi-résolution : instantané sur
  // un téléphone, et fidèle au fichier final, qui suit exactement la même
  // mise en page.
  useEffect(() => {
    let vivant = true
    const canvas = apercu.current
    if (!canvas || choisies.length === 0) return
    setErr('')
    ;(async () => {
      try { await document.fonts?.ready } catch {}
      if (!vivant) return
      try { await composer(canvas, choisies, 0.5, false) } catch {
        if (vivant) setErr(t({ fr: 'Les photos n’ont pas pu être relues. Réessayez dans un instant.', en: 'The photos could not be loaded. Please try again in a moment.', de: 'Die Fotos konnten nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.' }))
      }
    })()
    return () => { vivant = false }
  }, [composer, choisies])

  async function enregistrer() {
    if (occupe) return
    setOccupe(true)
    setErr('')
    setOk('')
    try {
      const canvas = document.createElement('canvas')
      await composer(canvas, choisies, 1, true)
      const blob = await collageEnBlob(canvas)
      const bien = await onEnregistrer(blob, t({ fr: 'timetoflash-souvenir.jpg', en: 'timetoflash-memories.jpg', de: 'timetoflash-erinnerung.jpg' }))
      if (bien) setOk(t({ fr: 'Image enregistrée. Ouvrez Instagram pour la publier.', en: 'Image saved. Open Instagram to post it.', de: 'Bild gespeichert. Öffnen Sie Instagram, um es zu posten.' }))
      else setErr(t({ fr: 'Sur iPhone, appuyez longuement sur l’aperçu puis choisissez « Ajouter aux photos ».', en: 'On iPhone, press and hold the preview, then choose “Save to Photos”.', de: 'Auf dem iPhone halten Sie die Vorschau gedrückt und wählen dann „Zu Fotos hinzufügen“.' }))
    } catch {
      setErr(t({ fr: 'L’image n’a pas pu être fabriquée. Réessayez dans un instant.', en: 'The image could not be created. Please try again in a moment.', de: 'Das Bild konnte nicht erstellt werden. Bitte versuchen Sie es gleich noch einmal.' }))
    } finally { setOccupe(false) }
  }

  const F = FORMATS.find((f) => f.key === format) || FORMATS[0]

  return (
    <div className="col-ecran" role="dialog" aria-label={t({ fr: 'Partager la soirée', en: 'Share the event', de: 'Die Feier teilen' })}>
      <div className="col-barre">
        <button className="col-fermer" onClick={onFermer} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>✕</button>
        <div className="col-titre">{t({ fr: 'Partager la soirée', en: 'Share the event', de: 'Die Feier teilen' })}</div>
      </div>

      <div className="col-corps">
        <div className="col-scene">
          {/* Le canvas garde ses proportions quel que soit le format : sans
              hauteur bornée, la story sortait de l'écran sur un téléphone. */}
          <canvas ref={apercu} className="col-apercu"
            style={{ aspectRatio: `${F.w} / ${F.h}` }} />
        </div>

        {choisies.length === 0 ? (
          <p className="col-vide">
            {t({
              fr: <>Il n&apos;y a encore rien à mettre dans cette image. Mettez quelques photos en favori,
                ou choisissez « La soirée ».</>,
              en: 'There is nothing to put in this image yet. Add a few photos to your favourites, or choose “The event”.',
              de: 'Für dieses Bild gibt es noch nichts. Markieren Sie ein paar Fotos als Favoriten oder wählen Sie „Die Feier“.',
            })}
          </p>
        ) : (
          <p className="col-compte">
            {t({
              fr: <>{choisies.length} photo{choisies.length > 1 ? 's' : ''} sur l&apos;image
                {source === 'soiree' && ', choisies parmi les plus aimées'}</>,
              en: `${choisies.length} photo${choisies.length > 1 ? 's' : ''} in the image${source === 'soiree' ? ', picked from the most liked' : ''}`,
              de: `${choisies.length} ${choisies.length > 1 ? 'Fotos' : 'Foto'} im Bild${source === 'soiree' ? ', ausgewählt aus den beliebtesten' : ''}`,
            })}
          </p>
        )}

        <div className="col-reglages">
          <div className="col-bloc">
            <div className="col-l">{t({ fr: 'Quelles photos', en: 'Which photos', de: 'Welche Fotos' })}</div>
            <div className="col-seg">
              {SOURCES.map((s) => (
                <button key={s.key} className={`col-o ${source === s.key ? 'on' : ''}`}
                  disabled={dispo[s.key] === 0}
                  onClick={() => setSource(s.key)}>
                  {t(s.label)}
                  <em>{dispo[s.key] === 0 ? t({ fr: 'aucune', en: 'none', de: 'keine' }) : `${dispo[s.key]}`}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="col-bloc">
            <div className="col-l">{t({ fr: 'Format', en: 'Format', de: 'Format' })}</div>
            <div className="col-seg">
              {FORMATS.map((f) => (
                <button key={f.key} className={`col-o ${format === f.key ? 'on' : ''}`}
                  onClick={() => setFormat(f.key)}>
                  {LIBELLES_FORMATS[f.key] ? t(LIBELLES_FORMATS[f.key].label) : f.label}
                  <em>{LIBELLES_FORMATS[f.key] ? t(LIBELLES_FORMATS[f.key].sub) : f.sub}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="col-bloc">
            <div className="col-l">{t({ fr: 'Fond', en: 'Background', de: 'Hintergrund' })}</div>
            <div className="col-seg">
              {FONDS.map((f) => (
                <button key={f.key} className={`col-o ${fond === f.key ? 'on' : ''}`}
                  onClick={() => setFond(f.key)}>
                  {LIBELLES_FONDS[f.key] ? t(LIBELLES_FONDS[f.key]) : f.label}
                  <span className="col-pastille" style={{ background: f.fond }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rejeter les dés est la moitié du plaisir : c'est aussi ce qui donne
            l'impression que l'image est la sienne, et non celle du site. */}
        <button className="col-melange" onClick={() => setGraine((g) => g + 1)}>
          ↻ {t({ fr: 'Mélanger les photos', en: 'Shuffle the photos', de: 'Fotos mischen' })}
        </button>

        {err && <div className="err" style={{ marginTop: 10 }}>{err}</div>}
        {ok && <div className="col-ok">{ok}</div>}

        <button className="btn btn-accent col-go" onClick={enregistrer}
          disabled={occupe || choisies.length === 0}>
          {occupe
            ? t({ fr: 'Fabrication…', en: 'Creating…', de: 'Wird erstellt…' })
            : t({ fr: 'Enregistrer l’image', en: 'Save the image', de: 'Bild speichern' })}
        </button>
        <p className="col-aide">
          {t({
            fr: <>Enregistrez l&apos;image, puis publiez-la sur Instagram. Identifiez <strong>@timetoflash.fr</strong>,
              on la partagera à notre tour.</>,
            en: <>Save the image, then post it on Instagram. Tag <strong>@timetoflash.fr</strong> and
              we&apos;ll share it too.</>,
            de: <>Speichern Sie das Bild und posten Sie es auf Instagram. Markieren Sie <strong>@timetoflash.fr</strong>,
              dann teilen wir es ebenfalls.</>,
          })}
        </p>
      </div>
    </div>
  )
}
