// Une fiche partenaire en carte (grille de /partenaires).
import Link from 'next/link'

export default function CartePartenaire({ p }) {
  return (
    <Link href={`/partenaires/${p.slug}`} className="pp-fiche-carte pp-carte-lien">
      <div className="pp-photo" style={p.photoUrl ? { backgroundImage: `url(${p.photoUrl})` } : undefined}>
        {!p.photoUrl && <span>{p.metierLabel}</span>}
      </div>
      <div className="pp-fiche-corps">
        <span className="pp-meta">{p.metierLabel} · {p.dept_nom} ({p.departement})</span>
        <h3>{p.entreprise}</h3>
        <p>{p.description}</p>
        <span className="pp-voir">Voir la fiche →</span>
      </div>
    </Link>
  )
}
