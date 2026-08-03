'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

// ============================================================
//  Le résumé de soirée, montré à l'invité juste avant l'album.
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
function marquerVu(eventId) {
  try { localStorage.setItem(`ttf_wrap_${eventId}`, '1') } catch {}
}

function heure(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
  } catch { return '' }
}

export default function WrapInvite({ eventId, nom, photos, guests, moiId, onClose }) {
  const cartes = useMemo(() => {
    const mesPhotos = moiId ? photos.filter((p) => p.guestId === moiId) : []

    // Le photographe de la soirée, calculé sur place : la galerie porte déjà
    // l'auteur de chaque cliché.
    let champion = null
    for (const g of guests || []) {
      const n = photos.filter((p) => p.guestId === g.id).length
      if (!champion || n > champion.n) champion = { nom: g.name, n }
    }

    const liste = [
      {
        cle: 'ouverture',
        oeil: nom ? `l’album de ${nom}` : 'votre album',
        chiffre: photos.length,
        titre: `photo${photos.length > 1 ? 's' : ''} développée${photos.length > 1 ? 's' : ''}`,
        sous: 'La pellicule de la soirée est prête.',
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
          : 'Chacun compte — ils sont dans l’album.',
        vignettes: mesPhotos.slice(0, 4).map((p) => p.url),
      })

      if (mesPhotos.length > 1) {
        const premiere = mesPhotos[0]
        const derniere = mesPhotos[mesPhotos.length - 1]
        if (heure(premiere.takenAt) !== heure(derniere.takenAt)) {
          liste.push({
            cle: 'nuit',
            oeil: 'ta nuit',
            texte: `de ${heure(premiere.takenAt)} à ${heure(derniere.takenAt)}`,
            sous: 'Entre les deux, il s’est passé des choses.',
          })
        }
      }
    }

    if (champion && champion.n > 1) {
      liste.push({
        cle: 'champion',
        oeil: 'photographe de la soirée',
        texte: champion.nom,
        sous: `${champion.n} clichés à lui seul. Respect.`,
      })
    }

    return liste
  }, [photos, guests, moiId, nom])

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

  // Défilement automatique, comme une story. Le minuteur repart à chaque carte.
  useEffect(() => {
    const t = setTimeout(suivant, DUREE)
    return () => clearTimeout(t)
  }, [suivant])

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
    <div className="wrap" role="dialog" aria-label="Résumé de la soirée">
      <div className="wrap-barres" aria-hidden="true">
        {cartes.map((x, n) => (
          <span key={x.cle} className="wrap-barre">
            <i className={n < i ? 'pleine' : n === i ? 'court' : ''}
              style={n === i ? { animationDuration: `${DUREE}ms` } : undefined} />
          </span>
        ))}
      </div>

      <button className="wrap-passer" onClick={fermer}>Passer</button>

      {/* Toucher à droite avance, à gauche revient : le geste des stories. */}
      <button className="wrap-zone gauche" aria-label="Précédent"
        onClick={() => setI((n) => Math.max(0, n - 1))} />
      <button className="wrap-zone droite" aria-label="Suivant" onClick={suivant} />

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

      <button className="wrap-fin" onClick={fermer}>
        {derniere ? `Voir les ${photos.length} photos →` : 'Aller à l’album →'}
      </button>
    </div>
  )
}
