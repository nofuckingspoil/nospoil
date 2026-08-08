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

// Les libellés sont recopiés de lib/film.js plutôt qu'importés : ce module est
// marqué 'use client', et le tirer ici ferait basculer toute la page côté
// navigateur pour cinq bouts de texte.
//
// « Original » vient en premier : sans point de comparaison, un rendu ne se
// voit pas : on croit juste que la photo était comme ça.
const PELLICULES_APERCU = [
  { id: 'original', nom: 'Original', dit: "La photo telle qu'elle a été prise" },
  { id: 'jetable', nom: 'Jetable', dit: 'Le Kodak des soirées : chaud, contrasté, granuleux' },
  { id: 'retro', nom: 'Rétro', dit: 'Le sépia doré, sans grain ni coins sombres' },
  { id: 'nb', nom: 'Noir & blanc', dit: 'Argentique dur, gros grain' },
  { id: 'instantane', nom: 'Instantané', dit: 'Le tirage qui se développe : délavé, doux' },
]

export default function Pellicules() {
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>La pellicule</div>
      <h2 className="section-title">Choisissez votre pellicule</h2>
      <div className="section-sub">
        Cinq rendus argentiques, du Kodak des soirées au noir et blanc bien dur.
        Vous en essayez un, vous changez d'avis quand vous voulez.
      </div>
      <div className="lp-films">
        {PELLICULES_APERCU.map((p) => (
          <figure key={p.id} className="lp-film">
            <img src={`/pellicules/${p.id}.webp`} width="540" height="720" loading="lazy"
              alt={`La même photo rendue avec la pellicule ${p.nom}`} />
            <figcaption>
              <b>{p.nom}</b>
              <span>{p.dit}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
