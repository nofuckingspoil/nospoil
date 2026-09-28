'use client'

import Link from 'next/link'
import { useLangue } from './Langue'

// ============================================================
//  « La soirée en chiffres » : le bilan de l'organisateur,
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
  const { t, lang } = useLangue()
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
      label: t({ fr: 'Photographe en chef', en: 'Chief photographer', de: 'Chef-Fotograf' }),
      valeur: champion.nom,
      // Départagé à la rapidité quand plusieurs participants sont à égalité : sans
      // ça, le titre revenait au hasard de l'ordre de lecture.
      detail: champion.rapidite
        ? t({
            fr: `${champion.photos} clichés, dégainés en ${champion.rapidite}, le plus rapide`,
            en: `${champion.photos} shots, fired off in ${champion.rapidite}, the fastest`,
            de: `${champion.photos} Fotos in ${champion.rapidite}, am schnellsten`,
          })
        : t({
            fr: `${champion.photos} cliché${champion.photos > 1 ? 's' : ''}`,
            en: `${champion.photos} shot${champion.photos > 1 ? 's' : ''}`,
            de: `${champion.photos} ${champion.photos > 1 ? 'Fotos' : 'Foto'}`,
          }),
    })
  }
  if (heurePointe) {
    faits.push({
      cle: 'pointe',
      label: t({ fr: 'Ça a le plus flashé', en: 'Peak flash time', de: 'Hier blitzte es am meisten' }),
      valeur: heurePointe.libelle,
      detail: t({
        fr: `${heurePointe.photos} photo${heurePointe.photos > 1 ? 's' : ''} sur ce seul créneau`,
        en: `${heurePointe.photos} photo${heurePointe.photos > 1 ? 's' : ''} in that hour alone`,
        de: `${heurePointe.photos} ${heurePointe.photos > 1 ? 'Fotos' : 'Foto'} allein in dieser Stunde`,
      }),
    })
  }
  // Même cliché aux deux bouts : la soirée n'a qu'une photo, on ne l'encadre
  // pas deux fois.
  const dernierUtile = dernier && (!premier || dernier.heure !== premier.heure)
  const bornes = premier?.url && dernierUtile && dernier?.url

  if (dureeFete) {
    faits.push({
      cle: 'duree',
      label: t({ fr: 'Ça a duré', en: 'It lasted', de: 'Es dauerte' }),
      valeur: dureeFete,
      detail: t({ fr: 'du premier au dernier cliché', en: 'from the first shot to the last', de: 'vom ersten bis zum letzten Foto' }),
    })
  }

  return (
    <section className="bilan">
      {/* Coins de visée : le même repère que dans le viseur de l'appareil. */}
      <span className="bilan-coin tl" aria-hidden="true" />
      <span className="bilan-coin tr" aria-hidden="true" />
      <span className="bilan-coin bl" aria-hidden="true" />
      <span className="bilan-coin br" aria-hidden="true" />

      <span className="bilan-eyebrow">{t({ fr: 'votre événement en chiffres', en: 'your event in numbers', de: 'Ihr Event in Zahlen' })}</span>

      <div className="bilan-nombres">
        <div>
          <b>{photoCount}</b>
          <span>{t({
            fr: `photo${photoCount > 1 ? 's' : ''} prise${photoCount > 1 ? 's' : ''}`,
            en: `photo${photoCount > 1 ? 's' : ''} taken`,
            de: photoCount > 1 ? 'Fotos gemacht' : 'Foto gemacht',
          })}</span>
        </div>
        <div>
          <b>{photographes}</b>
          <span>{t({
            fr: `photographe${photographes > 1 ? 's' : ''}`,
            en: `photographer${photographes > 1 ? 's' : ''}`,
            de: photographes > 1 ? 'Fotografen' : 'Fotograf',
          })}</span>
        </div>
        {photographes > 1 && (
          <div>
            <b>{lang === 'en' ? String(moyenne) : String(moyenne).replace('.', ',')}</b>
            <span>{t({ fr: 'en moyenne chacun', en: 'each on average', de: 'im Schnitt pro Person' })}</span>
          </div>
        )}
        {telechargements && (
          <div>
            <b>{telechargements.personnes}</b>
            <span>{t({
              fr: `${telechargements.personnes > 1 ? 'ont' : 'a'} emporté l'album`,
              en: 'took the album home',
              de: telechargements.personnes > 1 ? 'haben das Album gespeichert' : 'hat das Album gespeichert',
            })}</span>
          </div>
        )}
      </div>

      {/* La photo la plus aimée : probablement la ligne la plus émouvante du
          bilan. Absente tant que personne n'a mis de cœur. */}
      {photoDeLaSoiree?.url && (
        <div className="bilan-star">
          <img src={photoDeLaSoiree.url} alt="" loading="lazy" />
          <div>
            <span>{t({ fr: 'La photo préférée', en: 'The favourite photo', de: 'Das Lieblingsfoto' })}</span>
            <b>{photoDeLaSoiree.coeurs} ❤</b>
            <em>
              {t({
                fr: `par ${photoDeLaSoiree.nom}, à ${photoDeLaSoiree.heure}${photoDeLaSoiree.rapidite ? `, l'unanimité en ${photoDeLaSoiree.rapidite}` : ''}`,
                en: `by ${photoDeLaSoiree.nom}, at ${photoDeLaSoiree.heure}${photoDeLaSoiree.rapidite ? `, a hit within ${photoDeLaSoiree.rapidite}` : ''}`,
                de: `von ${photoDeLaSoiree.nom}, um ${photoDeLaSoiree.heure}${photoDeLaSoiree.rapidite ? `, ein Volltreffer in ${photoDeLaSoiree.rapidite}` : ''}`,
              })}
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
              <span>{t({ fr: 'La première', en: 'The first', de: 'Das erste' })}</span>
              <b>{premier.heure}</b>
              <em>{t({ fr: `par ${premier.nom}`, en: `by ${premier.nom}`, de: `von ${premier.nom}` })}</em>
            </figcaption>
          </figure>
          <figure>
            <img src={dernier.url} alt="" loading="lazy" />
            <figcaption>
              <span>{t({ fr: 'La dernière', en: 'The last', de: 'Das letzte' })}</span>
              <b>{dernier.heure}</b>
              <em>{t({ fr: `par ${dernier.nom}`, en: `by ${dernier.nom}`, de: `von ${dernier.nom}` })}</em>
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
          {t({
            fr: <>{telechargements.photos} photo{telechargements.photos > 1 ? 's' : ''} déjà
              enregistrée{telechargements.photos > 1 ? 's' : ''} par vos participants.</>,
            en: `${telechargements.photos} photo${telechargements.photos > 1 ? 's' : ''} already saved by your guests.`,
            de: `${telechargements.photos} ${telechargements.photos > 1 ? 'Fotos' : 'Foto'} bereits von Ihren Gästen gespeichert.`,
          })}
        </p>
      )}

      <div className="bilan-encore">
        <p>{t({ fr: 'Prêt à remettre ça ?', en: 'Ready to do it again?', de: 'Bereit für die nächste Runde?' })}</p>
        <Link href="/create" className="btn btn-dark">{t({ fr: 'Créer un nouvel événement', en: 'Create a new event', de: 'Neues Event erstellen' })}</Link>
      </div>
    </section>
  )
}
