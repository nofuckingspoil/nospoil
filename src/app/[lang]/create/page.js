'use client'

import { Suspense } from 'react'
import { CreateForm } from './Assistant'
import { useLangue } from '../../../components/Langue'

export default function CreatePage() {
  const { t } = useLangue()
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">{t({ fr: 'Chargement…', en: 'Loading…', de: 'Wird geladen…' })}</p></main>}>
      <CreateForm />
    </Suspense>
  )
}
