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
    premier, dernier, dureeFete, photoDeLaSoiree, telechargements } = bilan

  const faits = []
  if (champion) {
    faits.push({
      cle: 'champion',
      // « De la soirée » supposait une fête nocturne : un baptême ou un
      // séminaire n'en sont pas.
      label: 'Photographe en chef',
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
  // Même cliché aux deux bouts : la soirée n'a qu'une photo, on ne l'encadre
  // pas deux fois.
  const dernierUtile = dernier && (!premier || dernier.heure !== premier.heure)
  const bornes = premier?.url && dernierUtile && dernier?.url

  if (dureeFete) {
    faits.push({
      cle: 'duree',
      label: 'Ça a duré',
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

      <span className="bilan-eyebrow">votre événement en chiffres</span>

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

      {/* La photo la plus aimée : probablement la ligne la plus émouvante du
          bilan. Absente tant que personne n'a mis de cœur. */}
      {photoDeLaSoiree?.url && (
        <div className="bilan-star">
          <img src={photoDeLaSoiree.url} alt="" loading="lazy" />
          <div>
            <span>La photo préférée</span>
            <b>{photoDeLaSoiree.coeurs} ❤</b>
            <em>
              par {photoDeLaSoiree.nom}, à {photoDeLaSoiree.heure}
              {photoDeLaSoiree.rapidite ? ` — l'unanimité en ${photoDeLaSoiree.rapidite}` : ''}
            </em>
          </div>
        </div>
      )}

      {/* Les deux bornes de la soirée. Une vignette raconte ce qu'une heure
          seule ne dit pas : dans quel état on était au début, et à la fin. */}
      {bornes && (
        <div className="bilan-bornes">
          <figure>
            <img src={premier.url} alt="" loading="lazy" />
            <figcaption>
              <span>La première</span>
              <b>{premier.heure}</b>
              <em>par {premier.nom}</em>
            </figcaption>
          </figure>
          <figure>
            <img src={dernier.url} alt="" loading="lazy" />
            <figcaption>
              <span>La dernière</span>
              <b>{dernier.heure}</b>
              <em>par {dernier.nom}</em>
            </figcaption>
          </figure>
        </div>
      )}

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
