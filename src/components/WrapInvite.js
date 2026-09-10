'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chiffresSoiree, dessinerSynthese, syntheseEnBlob } from '../lib/synthese'

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

function dateCourte(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  } catch { return '' }
}

function heure(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
  } catch { return '' }
}

export default function WrapInvite({ eventId, nom, photos, guests, moiId, onClose }) {
  const chiffres = useMemo(() => chiffresSoiree({ photos, guests }), [photos, guests])

  const cartes = useMemo(() => {
    const mesPhotos = moiId ? photos.filter((p) => p.guestId === moiId) : []

    const liste = [
      {
        cle: 'ouverture',
        oeil: nom ? `l’album de ${nom}` : 'votre album',
        chiffre: photos.length,
        titre: `photo${photos.length > 1 ? 's' : ''} développée${photos.length > 1 ? 's' : ''}`,
        sous: 'La pellicule est prête.',
      },
      {
        cle: 'photographes',
        oeil: 'derrière l’objectif',
        chiffre: (guests || []).length,
        titre: `photographe${(guests || []).length > 1 ? 's' : ''}`,
        sous: 'Chacun a vu la fête autrement.',
      },
    ]

    if (mesPhotos.length > 0) {
      liste.push({
        cle: 'moi',
        oeil: 'et toi dans tout ça',
        chiffre: mesPhotos.length,
        titre: `cliché${mesPhotos.length > 1 ? 's' : ''} de toi`,
        sous: mesPhotos.length >= 5
          ? 'Tu n’as pas chômé.'
          : 'Chacun compte : ils sont dans l’album.',
        vignettes: mesPhotos.slice(0, 4).map((p) => p.url),
      })

      if (mesPhotos.length > 1) {
        const premiere = mesPhotos[0]
        const derniere = mesPhotos[mesPhotos.length - 1]
        if (heure(premiere.takenAt) !== heure(derniere.takenAt)) {
          liste.push({
            cle: 'evenement',
            // « Ta nuit » supposait une fête nocturne : un baptême à 15 h s'y
            // serait senti moqué.
            oeil: 'ton événement',
            texte: `de ${heure(premiere.takenAt)} à ${heure(derniere.takenAt)}`,
            sous: 'Entre les deux, il s’est passé des choses.',
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
        oeil: 'photographe en chef',
        texte: chiffres.champion.nom,
        sous: `${chiffres.champion.photos} clichés à lui seul. Respect.`,
      })
    }

    // La carte de fin : tout ce qui précède défile, celle-ci s'arrête. C'est
    // la seule qui n'est pas une story : on la regarde, on l'enregistre, on la
    // partage, puis on entre dans l'album.
    if (photos.length > 0) liste.push({ cle: 'synthese', synthese: true })

    return liste
  }, [photos, guests, moiId, chiffres])

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

  // --- L'image à emporter ---
  const toile = useRef(null)
  const [occupe, setOccupe] = useState('')

  // Les deux bornes de la soirée sont déjà à l'écran dans la carte : on les
  // recharge ici pour le dessin, parce qu'un canvas n'accepte pas une image
  // dont il n'a pas la permission de lire les pixels.
  const chargerImage = useCallback((url) => new Promise((r) => {
    if (!url) return r(null)
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => r(im)
    im.onerror = () => r(null)
    im.src = url
  }), [])

  const fabriquer = useCallback(async (format) => {
    const [premiere, derniere] = await Promise.all([
      chargerImage(chiffres.premier?.url),
      chargerImage(chiffres.dernier?.url),
    ])
    const c = toile.current || document.createElement('canvas')
    toile.current = c
    dessinerSynthese(c, { chiffres, nom: nom || '', images: { premiere, derniere }, format })
    return syntheseEnBlob(c)
  }, [chargerImage, chiffres, nom])

  const nomFichier = `${(nom || 'album').replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}-en-chiffres.jpg`

  const enregistrer = useCallback(async () => {
    if (occupe) return
    setOccupe('enregistrer')
    try {
      const blob = await fabriquer('post')
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 60000)
    } catch {} finally { setOccupe('') }
  }, [occupe, fabriquer, nomFichier])

  const partager = useCallback(async () => {
    if (occupe) return
    setOccupe('partager')
    try {
      // Le format vertical pour le partage : c'est celui des stories, et c'est
      // par là que ça circule.
      const blob = await fabriquer('story')
      if (!blob) return
      const fichier = new File([blob], nomFichier, { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], title: nom || 'Time to Flash' })
        return
      }
      // Pas de partage de fichier (un ordinateur, le plus souvent) : on
      // enregistre, ce qui revient au même geste en deux temps.
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url) }, 60000)
    } catch {} finally { setOccupe('') }
  }, [occupe, fabriquer, nomFichier, nom])

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
    <div className="wrap" role="dialog" aria-label="Résumé de l'événement">
      <div className="wrap-barres" aria-hidden="true">
        {cartes.map((x, n) => (
          <span key={x.cle} className="wrap-barre">
            <i className={n < i ? 'pleine' : n === i ? 'court' : ''}
              style={n === i ? { animationDuration: `${DUREE}ms` } : undefined} />
          </span>
        ))}
      </div>

      <button className="wrap-passer" onClick={fermer}>Passer</button>

      {/* Toucher à droite avance, à gauche revient : le geste des stories. Sur
          la carte de fin, ces zones disparaissent : elles recouvraient les deux
          boutons, et un doigt posé au hasard aurait refermé le résumé. */}
      {!c.synthese && (
        <>
          <button className="wrap-zone gauche" aria-label="Précédent"
            onClick={() => setI((n) => Math.max(0, n - 1))} />
          <button className="wrap-zone droite" aria-label="Suivant" onClick={suivant} />
        </>
      )}

      {c.synthese ? (
        <div className="wrap-carte synthese" key={c.cle}>
          <span className="syn-oeil">🎉 Votre album collaboratif</span>
          {nom && <h2 className="syn-nom">{nom}</h2>}
          {(chiffres.date || chiffres.duree) && (
            <p className="syn-date">
              {[chiffres.date ? dateCourte(chiffres.date) : '', chiffres.duree ? `${chiffres.duree} de fête` : '']
                .filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="syn-chiffres">
            <div><b>{chiffres.photos}</b><span>photo{chiffres.photos > 1 ? 's' : ''} prise{chiffres.photos > 1 ? 's' : ''}</span></div>
            <div><b>{chiffres.photographes}</b><span>photographe{chiffres.photographes > 1 ? 's' : ''}</span></div>
            <div><b>{String(chiffres.moyenne).replace('.', ',')}</b><span>chacun</span></div>
          </div>

          {/* `crossOrigin` n'est pas décoratif : sans lui, le navigateur garde
              en cache une copie qu'il s'interdit ensuite de relire, et le
              dessin de l'image à emporter repartait sans les deux photos. */}
          {(chiffres.premier?.url || chiffres.dernier?.url) && (
            <div className="syn-duo">
              {chiffres.premier?.url && (
                <span>
                  <img src={chiffres.premier.url} alt="" crossOrigin="anonymous" />
                  <i>La première · {chiffres.premier.heure}</i>
                </span>
              )}
              {chiffres.dernier?.url && (
                <span>
                  <img src={chiffres.dernier.url} alt="" crossOrigin="anonymous" />
                  <i>La dernière · {chiffres.dernier.heure}</i>
                </span>
              )}
            </div>
          )}

          {(chiffres.champion || chiffres.pointe) && (
            <div className="syn-faits">
              {chiffres.champion && (
                <div><span>Photographe en chef</span><b>{chiffres.champion.nom} <em>{chiffres.champion.photos} clichés</em></b></div>
              )}
              {chiffres.pointe && (
                <div><span>Ça a le plus flashé</span><b>{chiffres.pointe.libelle} <em>{chiffres.pointe.photos} photos</em></b></div>
              )}
            </div>
          )}

          <div className="syn-gestes">
            <button onClick={enregistrer} disabled={!!occupe}>
              {occupe === 'enregistrer' ? '…' : '⤓ Enregistrer'}
            </button>
            <button onClick={partager} disabled={!!occupe}>
              {occupe === 'partager' ? '…' : '↗ Partager'}
            </button>
          </div>
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
        {derniere ? `Voir les ${photos.length} photos →` : 'Aller à l’album →'}
      </button>
    </div>
  )
}
