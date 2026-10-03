'use client'

import { Suspense } from 'react'
import { CreateForm } from '../Assistant'
import { useLangue } from '../../../../components/Langue'

// Le paramétrage juste après le paiement de la création courte : révélation,
// clichés, ce que les participants revoient, couverture. Chaque écran se passe.
export default function ParametrerPage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <CreateForm parcours="apres" />
    </Suspense>
  )
}
