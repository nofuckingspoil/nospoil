'use client'

import { useEffect, useState } from 'react'
import { parametresProvenance } from '../lib/provenance'

// Le bouton « Essayer » de l'accueil. Un simple lien, et non un <Link> : il
// mène à une adresse qui fabrique une soirée d'essai, et un lien de Next
// pourrait la charger d'avance, sans clic. Il emporte la provenance du
// visiteur, pour qu'on sache ce qui amène les gens à essayer.
export default function LienEssai({ className, children }) {
  const [href, setHref] = useState('/essai?via=bouton')
  useEffect(() => {
    const prov = parametresProvenance()
    setHref(`/essai?via=bouton${prov ? `&${prov}` : ''}`)
  }, [])
  return <a href={href} className={className} rel="nofollow">{children}</a>
}
