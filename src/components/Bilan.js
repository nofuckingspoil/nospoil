'use client'

import Link from 'next/link'

// ============================================================
//  « La soirée en chiffres » — le bilan de l'organisateur,
//  affiché une fois l'album ouvert.
//
//  Jusqu'ici, la page se vidait au moment précis où l'organisateur
//  avait le plus envie de savoir ce que sa fête avait donné. C'est
//  aussi le bon moment pour lui proposer de recommencer.
//
//  Mise en page reprise du reste du site : une étiquette en petites
//  capitales, la valeur en gros dessous. Des puces et des émojis
//  auraient fait liste de courses là où il s'agit de souvenirs.
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

  const { photoCount, photographes, moyenne, champion, heurePointe,
    premier, dernier, dureeFete, telechargements } = bilan

  const faits = []
  if (champion) {
    faits.push({
      cle: 'champion',
      label: 'Photographe de la soirée',
      valeur: champion.nom,
      // Départagé à la rapidité quand plusieurs invités sont à égalité : sans
      // ça, le titre revenait au hasard de l'ordre de lecture.
      detail: champion.rapidite
        ? `${champion.photos} clichés, dégainés en ${champion.rapidite} — le plus rapide`
        : `${champion.photos} cliché${champion.photos > 1 ? 's' : ''}`,
    })
  }
  if (heurePointe) {
    faits.push({
      cle: 'pointe',
      label: 'Ça a le plus flashé',
      valeur: heurePointe.libelle,
      detail: `${heurePointe.photos} photo${heurePointe.photos > 1 ? 's' : ''} sur ce seul créneau`,
    })
  }
  if (premier) {
    faits.push({
      cle: 'premier',
      label: 'A ouvert le bal',
      valeur: premier.nom,
      detail: `premier cliché à ${premier.heure}`,
    })
  }
  // Même personne, même minute : c'est la seule photo de la soirée. Répéter la
  // ligne ferait bavard là où il n'y a qu'un fait.
  const dernierUtile = dernier && (!premier || dernier.nom !== premier.nom || dernier.heure !== premier.heure)
  if (dernierUtile) {
    faits.push({
      cle: 'dernier',
      label: 'Le dernier debout',
      valeur: dernier.nom,
      detail: `dernier cliché à ${dernier.heure}`,
    })
  }
  if (dureeFete) {
    faits.push({
      cle: 'duree',
      label: 'La fête a duré',
      valeur: dureeFete,
      detail: 'du premier au dernier cliché',
    })
  }

  return (
    <section className="bilan">
      {/* Coins de visée : le même repère que dans le viseur de l'appareil. */}
      <span className="bilan-coin tl" aria-hidden="true" />
      <span className="bilan-coin tr" aria-hidden="true" />
      <span className="bilan-coin bl" aria-hidden="true" />
      <span className="bilan-coin br" aria-hidden="true" />

      <span className="bilan-eyebrow">la soirée en chiffres</span>

      <div className="bilan-nombres">
        <div>
          <b>{photoCount}</b>
          <span>photo{photoCount > 1 ? 's' : ''} prise{photoCount > 1 ? 's' : ''}</span>
        </div>
        <div>
          <b>{photographes}</b>
          <span>photographe{photographes > 1 ? 's' : ''}</span>
        </div>
        {photographes > 1 && (
          <div>
            <b>{String(moyenne).replace('.', ',')}</b>
            <span>en moyenne chacun</span>
          </div>
        )}
        {telechargements && (
          <div>
            <b>{telechargements.personnes}</b>
            <span>{telechargements.personnes > 1 ? 'ont' : 'a'} emporté l'album</span>
          </div>
        )}
      </div>

      <dl className="bilan-faits">
        {faits.map((f) => (
          <div key={f.cle}>
            <dt>{f.label}</dt>
            <dd>
              {f.valeur}
              <em>{f.detail}</em>
            </dd>
          </div>
        ))}
      </dl>

      {telechargements && telechargements.photos > 0 && (
        <p className="bilan-note">
          {telechargements.photos} photo{telechargements.photos > 1 ? 's' : ''} déjà
          enregistrée{telechargements.photos > 1 ? 's' : ''} par vos invités.
        </p>
      )}

      <div className="bilan-encore">
        <p>Prêt à remettre ça ?</p>
        <Link href="/create" className="btn btn-dark">Créer un nouvel événement</Link>
      </div>
    </section>
  )
}
