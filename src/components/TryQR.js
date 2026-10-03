'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { parametresProvenance } from '../lib/provenance'
import { useLangue } from './Langue'

// Le QR mène à une adresse fixe qui fabrique un album d'essai neuf à chaque
// visiteur. Il pointait auparavant sur un événement unique, supprimé depuis :
// le QR de la page d'accueil ne menait donc plus nulle part.
export default function TryQR() {
  const { t } = useLangue()
  const [qr, setQr] = useState('')
  const [href, setHref] = useState('/essai?via=qr')

  useEffect(() => {
    // Le QR se scanne avec un autre téléphone : il emporte la provenance de
    // celui qui regarde la page, sinon on ne saurait jamais d'où il venait.
    const prov = parametresProvenance()
    const url = `${window.location.origin}/essai?via=qr${prov ? `&${prov}` : ''}`
    setHref(url)
    QRCode.toDataURL(url, {
      margin: 1,
      width: 480,
      color: { dark: '#14161F', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(setQr)
      .catch(() => {})
  }, [])

  return (
    <a className="tryqr" href={href} aria-label={t({
      fr: "Essayer Time to Flash, ouvrir l'appareil photo de démonstration",
      en: 'Try Time to Flash: open the demo camera',
      de: 'Time to Flash ausprobieren: die Demo-Kamera öffnen',
    })}>
      <div className="tryqr-head">
        <span className="tryqr-star">✱</span> {t({ fr: 'ESSAYER TIME TO FLASH', en: 'TRY TIME TO FLASH', de: 'TIME TO FLASH TESTEN' })}
      </div>
      <div className="tryqr-frame">
        {qr ? <img src={qr} alt={t({ fr: 'QR code de démonstration Time to Flash', en: 'Time to Flash demo QR code', de: 'Demo-QR-Code von Time to Flash' })} /> : <div className="tryqr-skeleton" />}
      </div>
      <div className="tryqr-sub">
        {t({
          fr: <>Votre appareil vous attend déjà.<br />Aucune appli à installer.</>,
          en: <>Your camera is already waiting.<br />No app to install.</>,
          de: <>Ihre Kamera wartet schon.<br />Keine App nötig.</>,
        })}
      </div>
    </a>
  )
}
