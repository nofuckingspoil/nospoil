'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { lireConsentement, ecrireConsentement, surConsentement } from '../lib/consent'
import { META_PIXEL_ID, GA4_ID, GOOGLE_ADS_ID, pageMesurable } from '../lib/tracking'

// ============================================================
//  Bandeau de consentement aux traceurs publicitaires.
//
//  Exigences de la CNIL respectées ici :
//    · rien n'est déposé avant la réponse (voir MetaPixel / GoogleTag) ;
//    · « Refuser » est aussi visible et aussi rapide qu'« Accepter » —
//      un refus caché dans un sous-menu est justement ce que la CNIL
//      sanctionne le plus ;
//    · fermer sans choisir ne vaut pas acceptation : il n'y a pas de croix ;
//    · l'avis peut être changé plus tard (lien « Cookies » du pied de page).
//
//  Le bandeau ne s'affiche pas là où il gênerait un geste en cours — pendant
//  une prise de photo ou un paiement. Ces pages ne sont de toute façon pas
//  celles où l'on arrive depuis une publicité.
// ============================================================

// Pages où un traceur peut vivre, mais où la question tomberait au pire
// moment : on ne coupe pas quelqu'un en plein règlement. Il aura eu le
// bandeau plus tôt, sur la page par laquelle il est arrivé.
const CHEMINS_INOPPORTUNS = ['/create/paiement']

function estExclu(chemin) {
  if (!chemin) return true
  // Là où aucun traceur ne se charge, il n'y a rien à demander.
  if (!pageMesurable(chemin)) return true
  return CHEMINS_INOPPORTUNS.some((p) => chemin === p || chemin.startsWith(p))
}

export default function ConsentBanner() {
  const chemin = usePathname()
  const [etat, setEtat] = useState('inconnu') // 'inconnu' le temps de lire le stockage

  useEffect(() => {
    setEtat(lireConsentement())
    return surConsentement((choix) => setEtat(choix))
  }, [])

  // Aucun traceur configuré : pas de raison de demander quoi que ce soit.
  const aDesTraceurs = !!(META_PIXEL_ID || GA4_ID || GOOGLE_ADS_ID)

  if (!aDesTraceurs) return null
  if (etat === 'inconnu' || etat !== null) return null
  if (estExclu(chemin)) return null

  // Le centre n'était justifié que sur l'accueil, où le QR d'essai occupe le
  // coin gauche. Partout ailleurs celui-ci est libre, et une carte posée au
  // milieu de l'écran barre la lecture au lieu de l'accompagner.
  const auCentre = chemin === '/'

  return (
    <div className={`ck ${auCentre ? '' : 'ck--gauche'}`} role="dialog" aria-modal="false" aria-labelledby="ck-t">
      <p className="ck-tag" aria-hidden="true"><span className="ck-dot" />Cookies</p>
      <div className="ck-txt">
        <h2 id="ck-t">Un mot sur les cookies</h2>
        <p>
          Nous aimerions savoir d'où viennent nos visiteurs, pour ne payer que les
          publicités qui en valent la peine. Cela suppose de déposer des traceurs de
          Meta et de Google sur votre appareil. Le site fonctionne exactement pareil
          dans les deux cas.{' '}
          <Link href="/politique-de-confidentialite">En savoir plus</Link>
        </p>
      </div>
      <div className="ck-btns">
        <button className="btn btn-ghost ck-b" onClick={() => ecrireConsentement('refuse')}>
          Refuser
        </button>
        <button className="btn btn-accent ck-b" onClick={() => ecrireConsentement('accepte')}>
          Accepter
        </button>
      </div>
    </div>
  )
}
