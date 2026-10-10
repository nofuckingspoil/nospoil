'use client'

// Filtres de /partenaires : métier (pastilles) et département (liste),
// sur les fiches publiées reçues du serveur.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import CartePartenaire from './CartePartenaire'
import { METIERS_FICHE } from '../../lib/partenaires'

export default function ListePartenaires({ fiches, deptInitial = 'all' }) {
  const [cat, setCat] = useState('all')
  const [dept, setDept] = useState(deptInitial)
  const base = useMemo(() => fiches.filter((p) => dept === 'all' || p.departement === dept), [fiches, dept])
  const liste = base.filter((p) => cat === 'all' || p.cle === cat)
  const depts = useMemo(() => {
    const vus = {}
    fiches.forEach((p) => { vus[p.departement] = p.dept_nom })
    return Object.keys(vus).sort().map((n) => ({ v: n, label: `${n} · ${vus[n]}` }))
  }, [fiches])
  const cats = [['all', 'Tous'], ...Object.entries(METIERS_FICHE).map(([k, m]) => [k, m.label])]

  return (
    <>
      <div className="pp-filtres">
        <div className="pp-chips">
          {cats.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setCat(id)} className={`pp-chip ${cat === id ? 'on' : ''}`} aria-pressed={cat === id}>
              <span>{label}</span><span className="pp-chip-n">{id === 'all' ? base.length : base.filter((p) => p.cle === id).length}</span>
            </button>
          ))}
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="pp-select" aria-label="Département">
          <option value="all">Tous les départements</option>
          {depts.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}
        </select>
      </div>
      {liste.length > 0 ? (
        <div className="pp-grille-fiches">
          {liste.map((p) => <CartePartenaire key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="pp-vide-etat">
          <div className="eyebrow-mute">Sélection en cours</div>
          <h3>Pas encore de partenaire ici.</h3>
          <p>Nous sélectionnons de nouveaux professionnels chaque mois. Vous exercez dans ce département ?</p>
          <Link href="/pro">Découvrir le programme partenaires →</Link>
        </div>
      )}
    </>
  )
}
