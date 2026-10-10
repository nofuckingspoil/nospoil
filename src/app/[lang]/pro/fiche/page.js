// ============================================================
//  /pro/fiche : le formulaire de fiche partenaire (français seulement).
//  Le métier arrive par ?metier=planner|lieu|photo (rien = page générale,
//  avec le choix du métier). ?source= note la provenance (mail, etc.).
// ============================================================
import { redirect } from 'next/navigation'
import { langueDeParams } from '../../../../lib/langue-lien'
import { FORMULAIRES, METIERS_FICHE, OFFRE, estCleMetier, cheminLanding } from '../../../../lib/partenaires'
import { ProNav, ProPied } from '../../../../components/pro/ProCadre'
import FormulaireFiche from '../../../../components/pro/FormulaireFiche'

export const metadata = {
  title: 'Votre fiche partenaire',
  description: 'Présentez votre activité et recevez un événement Time to Flash à offrir à l’un de vos mariés.',
  robots: { index: false, follow: true },
}

export default async function FichePage({ params, searchParams }) {
  const lang = await langueDeParams(params)
  const q = await searchParams
  const cle = estCleMetier(q?.metier) ? q.metier : 'general'
  if (lang !== 'fr') redirect(cle === 'general' ? '/pro/fiche' : `/pro/fiche?metier=${cle}`)
  const source = typeof q?.source === 'string' ? q.source.slice(0, 120) : ''
  return (
    <div className="pp">
      <ProNav retour={cheminLanding(cle)} />
      <main className="site-inner pp-form-page">
        <div className="eyebrow">Programme partenaires{cle === 'general' ? '' : ` · ${METIERS_FICHE[cle].pluriel}`}</div>
        <h1 className="pp-form-h1">{FORMULAIRES[cle].titre}</h1>
        <p className="pp-form-sous">Votre code vous est envoyé par email une fois la fiche validée ({OFFRE.codesParDepartement} codes par département).</p>
        <FormulaireFiche cle={cle} provenance={source || 'fiche'} />
      </main>
      <ProPied />
    </div>
  )
}
