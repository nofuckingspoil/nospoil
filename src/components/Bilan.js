'use client'

import Link from 'next/link'

// ============================================================
//  « La soirée en chiffres » — le bilan de l'organisateur,
//  affiché une fois l'album ouvert.
//
//  Jusqu'ici, la page se vidait au moment précis où l'organisateur
//  avait le plus envie de savoir ce que sa fête avait donné. C'est
//  aussi le bon moment pour lui proposer de recommencer.
// ============================================================

function heure(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
  } catch { return '' }
}

export default function Bilan({ bilan }) {
  // Pas encore chargé, ou soirée sans la moindre photo : on ne montre rien
  // plutôt qu'une rangée de zéros à quelqu'un qui vient de faire la fête.
  if (!bilan || !bilan.photoCount) return null

  const { photoCount, photographes, champion, heurePointe, derniere, telechargements } = bilan

  return (
    <section className="bilan">
      <span className="db-eyebrow">la soirée en chiffres</span>

      <div className="bilan-nombres">
        <div>
          <b>{photoCount}</b>
          <span>photo{photoCount > 1 ? 's' : ''} prise{photoCount > 1 ? 's' : ''}</span>
        </div>
        <div>
          <b>{photographes}</b>
          <span>photographe{photographes > 1 ? 's' : ''}</span>
        </div>
        {telechargements && (
          <div>
            <b>{telechargements.personnes}</b>
            <span>
              {telechargements.personnes > 1 ? 'personnes ont' : 'personne a'} emporté l'album
            </span>
          </div>
        )}
      </div>

      <ul className="bilan-faits">
        {champion && (
          <li>
            <span className="bilan-ic" aria-hidden="true">🏆</span>
            <span>
              <strong>{champion.nom}</strong> est le photographe de la soirée, avec{' '}
              {champion.photos} cliché{champion.photos > 1 ? 's' : ''}.
            </span>
          </li>
        )}
        {heurePointe && (
          <li>
            <span className="bilan-ic" aria-hidden="true">🌙</span>
            <span>
              Ça a le plus flashé vers <strong>{heurePointe.libelle}</strong> —{' '}
              {heurePointe.photos} photo{heurePointe.photos > 1 ? 's' : ''} sur ce seul créneau.
            </span>
          </li>
        )}
        {derniere && (
          <li>
            <span className="bilan-ic" aria-hidden="true">📸</span>
            <span>
              La dernière photo de la nuit est de <strong>{derniere.nom}</strong>,
              à {heure(derniere.at)}.
            </span>
          </li>
        )}
        {telechargements && telechargements.photos > 0 && (
          <li>
            <span className="bilan-ic" aria-hidden="true">📥</span>
            <span>
              <strong>{telechargements.photos} photos</strong> ont déjà été enregistrées
              par vos invités.
            </span>
          </li>
        )}
      </ul>

      <div className="bilan-encore">
        <p>Prêt à remettre ça ?</p>
        <Link href="/create" className="btn btn-dark">Créer un nouvel événement</Link>
      </div>
    </section>
  )
}
