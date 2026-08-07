'use client'

import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { GA4_ID, GOOGLE_ADS_ID, pageMesurable, mesureExclue } from '../lib/tracking'
import { lireConsentement, surConsentement } from '../lib/consent'

// ============================================================
//  Balise Google — Analytics (mesure d'audience) et Google Ads (conversions).
//
//  Les deux partagent une seule et même balise : on la charge une fois, puis
//  on lui déclare les comptes à alimenter. Comme pour Meta, rien n'est chargé
//  tant que le visiteur n'a pas accepté.
//
//  Contrairement à Meta, la balise Google compte elle-même la première visite.
//  On désactive donc son comptage automatique et on signale chaque page à la
//  main : sinon la page d'arrivée serait comptée deux fois, et les suivantes
//  (qui s'ouvrent sans recharger le navigateur) pas du tout.
// ============================================================

function VuesDePage() {
  const chemin = usePathname()
  const params = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return
    const query = params?.toString()
    window.gtag('event', 'page_view', {
      page_path: query ? `${chemin}?${query}` : chemin,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [chemin, params])

  return null
}

export default function GoogleTag() {
  const chemin = usePathname()
  const [autorise, setAutorise] = useState(false)

  useEffect(() => {
    if (mesureExclue()) return // nos propres visites ne se comptent pas
    setAutorise(lireConsentement() === 'accepte')
    return surConsentement((choix) => setAutorise(choix === 'accepte'))
  }, [])

  // La balise se charge à partir d'un des deux comptes, peu importe lequel.
  const compteChargeur = GA4_ID || GOOGLE_ADS_ID
  if (!compteChargeur || !autorise || !pageMesurable(chemin)) return null

  return (
    <>
      <Script
        id="google-tag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${compteChargeur}`}
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
${GA4_ID ? `gtag('config', '${GA4_ID}', { send_page_view: false });` : ''}
${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}`}
      </Script>
      <Suspense fallback={null}>
        <VuesDePage />
      </Suspense>
    </>
  )
}
