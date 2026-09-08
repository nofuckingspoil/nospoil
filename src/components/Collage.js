'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decodeImage } from '../lib/camera'
import { pelliculeParId } from '../lib/film'
import {
  FONDS, FORMATS, NB_TIRAGES,
  collageEnBlob, dessinerCollage, reduire, selectionAuto,
} from '../lib/collage'

// ============================================================
//  « Partager la soirée » : une image, un enregistrement, une publication.
//
//  L'écran tient en trois décisions et un bouton. Tout le reste est déjà
//  décidé pour la personne : quelles photos, dans quel ordre, avec quel
//  rendu. Un panneau d'options aurait fait fuir ceux-là même qu'on veut
//  voir publier.
// ============================================================

const SOURCES = [
  { key: 'miennes', label: 'Mes clichés', sub: 'Les photos que j\'ai prises' },
  { key: 'favorites', label: 'Mes favoris', sub: 'Les photos que j\'ai aimées' },
  { key: 'soiree', label: 'La soirée', sub: 'Une sélection de la fête' },
]

export default function Collage({
  photos, nom, favs, pelliculeId, avecDate, onFermer, onEnregistrer,
}) {
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
      surtitre: 'Les souvenirs de',
      pied: 'L’appareil photo jetable de vos événements',
      pellicule,
      avecDate,
      graine,
      echelle,
    })
    return tirages.length
  }, [charger, format, fond, nom, pellicule, avecDate, graine])

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
        if (vivant) setErr('Les photos n’ont pas pu être relues. Réessayez dans un instant.')
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
      const bien = await onEnregistrer(blob, 'timetoflash-souvenir.jpg')
      if (bien) setOk('Image enregistrée. Ouvrez Instagram pour la publier.')
      else setErr('Sur iPhone, appuyez longuement sur l’aperçu puis choisissez « Ajouter aux photos ».')
    } catch {
      setErr('L’image n’a pas pu être fabriquée. Réessayez dans un instant.')
    } finally { setOccupe(false) }
  }

  const F = FORMATS.find((f) => f.key === format) || FORMATS[0]

  return (
    <div className="col-ecran" role="dialog" aria-label="Partager la soirée">
      <div className="col-barre">
        <button className="col-fermer" onClick={onFermer} aria-label="Fermer">✕</button>
        <div className="col-titre">Partager la soirée</div>
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
            Il n&apos;y a encore rien à mettre dans cette image. Mettez quelques photos en favori,
            ou choisissez « La soirée ».
          </p>
        ) : (
          <p className="col-compte">
            {choisies.length} photo{choisies.length > 1 ? 's' : ''} sur l&apos;image
            {source === 'soiree' && ', choisies parmi les plus aimées'}
          </p>
        )}

        <div className="col-reglages">
          <div className="col-bloc">
            <div className="col-l">Quelles photos</div>
            <div className="col-seg">
              {SOURCES.map((s) => (
                <button key={s.key} className={`col-o ${source === s.key ? 'on' : ''}`}
                  disabled={dispo[s.key] === 0}
                  onClick={() => setSource(s.key)}>
                  {s.label}
                  <em>{dispo[s.key] === 0 ? 'aucune' : `${dispo[s.key]}`}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="col-bloc">
            <div className="col-l">Format</div>
            <div className="col-seg">
              {FORMATS.map((f) => (
                <button key={f.key} className={`col-o ${format === f.key ? 'on' : ''}`}
                  onClick={() => setFormat(f.key)}>
                  {f.label}<em>{f.sub}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="col-bloc">
            <div className="col-l">Fond</div>
            <div className="col-seg">
              {FONDS.map((f) => (
                <button key={f.key} className={`col-o ${fond === f.key ? 'on' : ''}`}
                  onClick={() => setFond(f.key)}>
                  {f.label}
                  <span className="col-pastille" style={{ background: f.fond }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rejeter les dés est la moitié du plaisir : c'est aussi ce qui donne
            l'impression que l'image est la sienne, et non celle du site. */}
        <button className="col-melange" onClick={() => setGraine((g) => g + 1)}>
          ↻ Mélanger les photos
        </button>

        {err && <div className="err" style={{ marginTop: 10 }}>{err}</div>}
        {ok && <div className="col-ok">{ok}</div>}

        <button className="btn btn-accent col-go" onClick={enregistrer}
          disabled={occupe || choisies.length === 0}>
          {occupe ? 'Fabrication…' : 'Enregistrer l’image'}
        </button>
        <p className="col-aide">
          Enregistrez l&apos;image, puis publiez-la sur Instagram. Identifiez <strong>@timetoflash.fr</strong>,
          on la partagera à notre tour.
        </p>
      </div>
    </div>
  )
}
