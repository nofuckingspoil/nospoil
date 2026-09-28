'use client'

// ============================================================
//  Les cinq pellicules, sur une même photo.
//
//  Le seul argument du produit que personne ne recopie en une semaine : un QR
//  code et un album partagé, ça se refait ; une pellicule cuite dans le
//  fichier téléchargé, non. Il n'apparaissait pourtant nulle part.
//
//  Vit à part du kit des pages publicitaires : l'accueil s'en sert aussi, et
//  n'a pas à embarquer le reste au passage.
// ============================================================

import { useLangue } from './Langue'

// Les libellés sont recopiés de lib/film.js plutôt qu'importés : ce module
// reste léger (cinq bouts de texte), et la langue vient de useLangue().
//
// « Original » vient en premier : sans point de comparaison, un rendu ne se
// voit pas : on croit juste que la photo était comme ça.
const PELLICULES_APERCU = [
  {
    id: 'original',
    nom: { fr: 'Original', en: 'Original', de: 'Original' },
    dit: { fr: "La photo telle qu'elle a été prise", en: 'The photo just as it was taken', de: 'Das Foto so, wie es aufgenommen wurde' },
  },
  {
    id: 'jetable',
    nom: { fr: 'Jetable', en: 'Disposable', de: 'Einweg' },
    dit: { fr: 'Le Kodak des soirées : chaud, contrasté, granuleux', en: 'The party Kodak: warm, punchy, grainy', de: 'Die Party-Kodak: warm, kontrastreich, körnig' },
  },
  {
    id: 'retro',
    nom: { fr: 'Rétro', en: 'Retro', de: 'Retro' },
    dit: { fr: 'Le sépia doré, sans grain ni coins sombres', en: 'Golden sepia, no grain or dark corners', de: 'Goldenes Sepia, ohne Korn und dunkle Ecken' },
  },
  {
    id: 'nb',
    nom: { fr: 'Noir & blanc', en: 'Black & white', de: 'Schwarzweiß' },
    dit: { fr: 'Argentique dur, gros grain', en: 'Hard film look, heavy grain', de: 'Harter Analoglook, grobes Korn' },
  },
  {
    id: 'instantane',
    nom: { fr: 'Instantané', en: 'Instant', de: 'Sofortbild' },
    dit: { fr: 'Le tirage qui se développe : délavé, doux', en: 'The print that develops in your hand: faded, soft', de: 'Das Bild, das sich entwickelt: verblasst, weich' },
  },
]

export default function Pellicules() {
  const { t } = useLangue()
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>
        {t({ fr: 'La pellicule', en: 'The film', de: 'Der Film' })}
      </div>
      <h2 className="section-title">{t({ fr: 'Choisissez votre pellicule', en: 'Pick your film style', de: 'Wählen Sie Ihren Filmlook' })}</h2>
      <div className="section-sub">
        {t({
          fr: <>Cinq rendus argentiques, du Kodak des soirées au noir et blanc bien dur.
            Vous en essayez un, vous changez d'avis quand vous voulez.</>,
          en: <>Five film looks, from the party Kodak to a hard black and white.
            Try one, and change your mind whenever you like.</>,
          de: <>Fünf analoge Looks, von der Party-Kodak bis zum harten Schwarzweiß.
            Probieren Sie einen aus und wechseln Sie, wann immer Sie möchten.</>,
        })}
      </div>
      <div className="lp-films">
        {PELLICULES_APERCU.map((p) => (
          <figure key={p.id} className="lp-film">
            <img src={`/pellicules/${p.id}.webp`} width="540" height="720" loading="lazy"
              alt={t({
                fr: `La même photo rendue avec la pellicule ${p.nom.fr}`,
                en: `The same photo with the ${p.nom.en} film style`,
                de: `Dasselbe Foto mit dem Filmlook ${p.nom.de}`,
              })} />
            <figcaption>
              <b>{t(p.nom)}</b>
              <span>{t(p.dit)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
