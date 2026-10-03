'use client'

import { Suspense } from 'react'
import { CreateForm } from './Assistant'
import { useLangue } from '../../../components/Langue'

// Depuis le 03/10/2026, la création courte est la norme : nom, dates, formule,
// paiement, puis les réglages (voir Assistant.js). Le parcours long reste
// dans Assistant.js (parcours="long") s'il fallait y revenir.
export default function CreatePage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <CreateForm parcours="court" />
    </Suspense>
  )
}
