'use client'

import { Suspense } from 'react'
import { CreateForm } from '../Assistant'
import { useLangue } from '../../../../components/Langue'

// VERSION TEST : la création courte (nom, dates, formule, paiement), puis le
// paramétrage sur /create/parametrer. Liée nulle part tant qu'elle est à l'essai.
export default function CreationCourtePage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <CreateForm parcours="court" />
    </Suspense>
  )
}
