// ============================================================
//  Cadre commun des pages du programme partenaires : la barre du haut
//  (logo + pastille PRO) et le bas de page (bandeau d'appel, autres métiers,
//  puis le pied de page habituel du site).
// ============================================================
import Link from 'next/link'
import Logo from '../Logo'
import SitePied from '../SitePied'
import { METIERS_FICHE, cheminLanding } from '../../lib/partenaires'

export function ProNav({ ancres = [], bouton, retour, pro = true }) {
  return (
    <nav className="pp-nav">
      <Link href={pro ? '/pro' : '/'} className="pp-marque" aria-label="Time to Flash">
        <Logo size={36} nameSize={22} />
        {pro && <span className="pp-pastille">PRO</span>}
      </Link>
      <div className="pp-nav-liens">
        {ancres.map((a) => <a key={a.href} href={a.href} className="pp-ancre">{a.label}</a>)}
        {retour && <Link href={retour} className="pp-ancre">← Retour</Link>}
        {bouton && <Link href={bouton.href} className="btn btn-dark pp-btn-compact">{bouton.label}</Link>}
      </div>
    </nav>
  )
}

// Bandeau sombre d'appel final, avec en option la ligne « Un autre métier ? ».
export function ProBandeau({ titre, surtitre, texte, bouton, autres }) {
  return (
    <section className="pp-bandeau">
      <div className="pp-bandeau-in">
        <div className="pp-bandeau-texte">
          {surtitre && <span className="pp-sur-ambre">{surtitre}</span>}
          <h2>{titre}</h2>
          {texte && <p>{texte}</p>}
        </div>
        {bouton && <Link href={bouton.href} className="btn btn-accent pp-btn-sombre">{bouton.label}</Link>}
      </div>
      {autres && (
        <div className="pp-autres">
          <div className="pp-autres-in">
            <span className="pp-sur-ambre">Un autre métier ?</span>
            {autres.map((cle) => (
              <Link key={cle} href={cheminLanding(cle)}>{cle === 'general' ? 'Tous les métiers du mariage' : METIERS_FICHE[cle].pluriel}</Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function ProPied() {
  return <SitePied lang="fr" />
}
