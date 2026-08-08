'use client'

import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { META_PIXEL_ID, pageMesurable, mesureExclue } from '../lib/tracking'
import { lireConsentement, surConsentement } from '../lib/consent'

// ============================================================
//  Pixel Meta : le compteur qui permet aux publicités d'apprendre.
//
//  Sans lui, Meta encaisse le budget sans jamais savoir qui a créé un
//  événement : impossible d'optimiser les diffusions, impossible de relancer
//  les visiteurs partis sans acheter.
//
//  Rien n'est chargé tant que le visiteur n'a pas accepté (article 82 de la
//  loi Informatique et Libertés) : le script n'est même pas téléchargé, ce qui
//  est plus sûr qu'un pixel chargé puis bridé.
// ============================================================

function VuesDePage() {
  const chemin = usePathname()
  const params = useSearchParams()

  // Le site étant une application (les pages changent sans recharger le
  // navigateur), la visite est signalée à chaque changement d'adresse, sinon
  // Meta n'en verrait qu'une seule, la première.
  useEffect(() => {
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView')
  }, [chemin, params])

  return null
}

export default function MetaPixel() {
  const chemin = usePathname()
  const [autorise, setAutorise] = useState(false)

  useEffect(() => {
    if (mesureExclue()) return // nos propres visites ne se comptent pas
    setAutorise(lireConsentement() === 'accepte')
    return surConsentement((choix) => setAutorise(choix === 'accepte'))
  }, [])

  if (!META_PIXEL_ID || !autorise || !pageMesurable(chemin)) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');`}
      </Script>
      {/* La première visite n'est PAS signalée dans le script ci-dessus : elle
          l'est par le composant qui suit, comme toutes les autres. Sinon elle
          serait comptée deux fois. */}
      <Suspense fallback={null}>
        <VuesDePage />
      </Suspense>
    </>
  )
}
