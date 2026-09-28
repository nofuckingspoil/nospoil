'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { lireConsentement, ecrireConsentement, surConsentement } from '../lib/consent'
import { META_PIXEL_ID, GA4_ID, GOOGLE_ADS_ID, pageMesurable } from '../lib/tracking'
import { useLangue } from './Langue'

// ============================================================
//  Bandeau de consentement aux traceurs publicitaires.
//
//  Exigences de la CNIL respectées ici :
//    · rien n'est déposé avant la réponse (voir MetaPixel / GoogleTag) ;
//    · « Refuser » est aussi visible et aussi rapide qu'« Accepter » : 
//      un refus caché dans un sous-menu est justement ce que la CNIL
//      sanctionne le plus ;
//    · fermer sans choisir ne vaut pas acceptation : il n'y a pas de croix ;
//    · l'avis peut être changé plus tard (lien « Cookies » du pied de page).
//
//  Le bandeau ne s'affiche pas là où il gênerait un geste en cours : pendant
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
  const { t, lien } = useLangue()
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

  // Le coin bas-droit est libre depuis que le guide s'annonce en haut de page :
  // c'est là qu'on attend une question de cookies, et le coin gauche reste au
  // QR d'essai de l'accueil.
  return (
    <div className="ck" role="dialog" aria-modal="false" aria-labelledby="ck-t">
      <p className="ck-tag" aria-hidden="true"><span className="ck-dot" />Cookies</p>
      <div className="ck-txt">
        <h2 id="ck-t">{t({ fr: 'Un mot sur les cookies', en: 'A word about cookies', de: 'Ein Wort zu Cookies' })}</h2>
        <p>
          {t({
            fr: "Nous aimerions savoir d'où viennent nos visiteurs, pour ne payer que les publicités qui en valent la peine. Cela suppose de déposer des traceurs de Meta et de Google sur votre appareil. Le site fonctionne exactement pareil dans les deux cas.",
            en: "We'd like to know where our visitors come from, so we only pay for the ads that are worth it. That means placing Meta and Google trackers on your device. The site works exactly the same either way.",
            de: 'Wir würden gern wissen, woher unsere Besucher kommen, um nur für Werbung zu bezahlen, die sich lohnt. Dafür müssten wir Tracker von Meta und Google auf Ihrem Gerät speichern. Die Website funktioniert in beiden Fällen genau gleich.',
          })}{' '}
          <Link href={lien('/politique-de-confidentialite')}>{t({ fr: 'En savoir plus', en: 'Learn more', de: 'Mehr erfahren' })}</Link>
        </p>
      </div>
      <div className="ck-btns">
        <button className="btn btn-ghost ck-b" onClick={() => ecrireConsentement('refuse')}>
          {t({ fr: 'Refuser', en: 'Decline', de: 'Ablehnen' })}
        </button>
        <button className="btn btn-accent ck-b" onClick={() => ecrireConsentement('accepte')}>
          {t({ fr: 'Accepter', en: 'Accept', de: 'Akzeptieren' })}
        </button>
      </div>
    </div>
  )
}
