import Link from 'next/link'
import Logo from './Logo'

// ============================================================
//  Barre du site public.
//
//  Elle n'existait que sur l'accueil : depuis un article du blog, on ne
//  pouvait ni se connecter, ni retrouver ses événements, ni en créer un.
//
//  Elle suit maintenant le défilement, et sur téléphone le bouton de
//  création reste posé en bas de l'écran : c'est le seul geste qu'on
//  vient faire, il n'a pas à remonter le chercher.
//
//  `large` aligne la barre sur les pages dont le contenu est plus large
//  que l'accueil — sinon elle paraît rentrée de soixante-dix pixels.
// ============================================================
export default function SiteNav({ large = false }) {
  return (
    <>
      <div className={`vnav-bar ${large ? 'large' : ''}`}>
        <nav className="vnav">
          <Link href="/" style={{ textDecoration: 'none' }} aria-label="Accueil Time to Flash">
            <Logo nameSize={22} size={36} />
          </Link>
          <div className="vnav-links">
            <Link href="/journal" className="mono small">Blog</Link>
            {/* « Mes événements » et « Connexion » servaient le même visiteur —
                celui qui revient. La page fusionnée propose déjà la connexion
                quand elle ne trouve aucun événement. */}
            <Link href="/mes-evenements" className="mono small">Mon compte</Link>
            <Link href="/create?tier=5" className="btn btn-dark vnav-cta">Créer un événement</Link>
          </div>
        </nav>
      </div>

      {/* Téléphone uniquement : le geste principal, toujours à portée de pouce. */}
      <Link href="/create?tier=5" className="vnav-bottom">Créer mon événement →</Link>
    </>
  )
}
