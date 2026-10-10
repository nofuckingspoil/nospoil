// ============================================================
//  /partenaires : les professionnels du mariage partenaires (fiches publiées
//  depuis /admin/pros). Français seulement. ?dept=60 pré-filtre un département
//  (fil d'Ariane d'une fiche).
// ============================================================
import { redirect } from 'next/navigation'
import { langueDeParams } from '../../../lib/langue-lien'
import { fichesPubliees } from '../../../lib/partenaires-serveur'
import { OFFRE } from '../../../lib/partenaires'
import { ProNav, ProBandeau, ProPied } from '../../../components/pro/ProCadre'
import ListePartenaires from '../../../components/pro/ListePartenaires'

export const revalidate = 300

const TITRE = 'Les professionnels du mariage partenaires de Time to Flash.'
export const metadata = {
  title: 'Partenaires : wedding planners, lieux et photographes',
  description: 'Wedding planners, lieux de réception et photographes qui offrent Time to Flash à leurs mariés.',
  alternates: { canonical: 'https://timetoflash.fr/partenaires' },
}

export default async function PartenairesPage({ params, searchParams }) {
  const lang = await langueDeParams(params)
  if (lang !== 'fr') redirect('/partenaires')
  const q = await searchParams
  const fiches = await fichesPubliees()
  const deptInitial = typeof q?.dept === 'string' && fiches.some((f) => f.departement === q.dept) ? q.dept : 'all'
  return (
    <div className="pp">
      <ProNav pro={false} bouton={{ href: '/create', label: 'Créer un événement' }} />
      <main className="site-inner">
        <section className="pp-tete-liste">
          <div className="eyebrow">Partenaires</div>
          <h1>{TITRE}</h1>
          <p className="pp-intro">Wedding planners, lieux de réception et photographes qui offrent Time to Flash à leurs mariés.</p>
        </section>
        <section className="pp-section pp-liste">
          <ListePartenaires fiches={fiches} deptInitial={deptInitial} />
        </section>
      </main>
      <ProBandeau
        surtitre="Vous êtes professionnel du mariage ?"
        titre={`Votre fiche ici, et un événement offert pour l’un de vos mariés de ${OFFRE.annee}.`}
        bouton={{ href: '/pro', label: 'Devenir partenaire →' }}
      />
      <ProPied />
    </div>
  )
}
