import Link from 'next/link'
import Logo from './Logo'

// ============================================================
//  Barre du site public.
//
//  Elle n'existait que sur l'accueil : depuis un article du blog, on ne
//  pouvait ni se connecter, ni retrouver ses événements, ni en créer un.
//  Le lecteur convaincu par un article se retrouvait sans porte.
//
//  Sur téléphone, les quatre entrées ne tiennent pas sur une ligne : le
//  logo garde la première, les liens passent dessous — plutôt que de
//  pousser la page entière vers la droite.
// ============================================================
export default function SiteNav() {
  return (
    <nav className="vnav">
      <Link href="/" style={{ textDecoration: 'none' }} aria-label="Accueil Time to Flash">
        <Logo nameSize={22} size={36} />
      </Link>
      {/* Ce qu'on vient chercher — lire, ou créer — reste en haut à droite.
          Le compte et la connexion prennent la ligne du dessous : on ne s'y
          rend qu'en sachant déjà où l'on va. */}
      <div className="vnav-links">
        <Link href="/journal" className="mono small">Blog</Link>
        {/* Sur téléphone, « Créer un événement » à lui seul chassait la barre
            sur une deuxième ligne : le verbe suffit à cette largeur. */}
        <Link href="/create?tier=5" className="btn btn-dark">
          <span className="vnav-long">Créer un événement</span>
          <span className="vnav-court">Créer</span>
        </Link>
      </div>
      <div className="vnav-second">
        <Link href="/mes-evenements" className="mono small">Mes événements</Link>
        <Link href="/connexion" className="mono small">Connexion</Link>
      </div>
    </nav>
  )
}
