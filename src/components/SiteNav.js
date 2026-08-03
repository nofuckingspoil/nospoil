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
      <div className="vnav-links">
        <Link href="/journal" className="mono small">Blog</Link>
        <Link href="/mes-evenements" className="mono small">Mes événements</Link>
        <Link href="/connexion" className="mono small">Connexion</Link>
        <Link href="/create?tier=5" className="btn btn-dark">Créer un événement</Link>
      </div>
    </nav>
  )
}
