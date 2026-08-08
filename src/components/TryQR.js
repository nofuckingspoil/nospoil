'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Le QR mène à une adresse fixe qui fabrique un album d'essai neuf à chaque
// visiteur. Il pointait auparavant sur un événement unique, supprimé depuis :
// le QR de la page d'accueil ne menait donc plus nulle part.
export default function TryQR() {
  const [qr, setQr] = useState('')
  const [href, setHref] = useState('/essai')

  useEffect(() => {
    const url = `${window.location.origin}/essai`
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
    <a className="tryqr" href={href} aria-label="Essayer Time to Flash, ouvrir l'appareil photo de démonstration">
      <div className="tryqr-head">
        <span className="tryqr-star">✱</span> ESSAYER TIME TO FLASH
      </div>
      <div className="tryqr-frame">
        {qr ? <img src={qr} alt="QR code de démonstration Time to Flash" /> : <div className="tryqr-skeleton" />}
      </div>
      <div className="tryqr-sub">
        Votre appareil vous attend déjà.<br />Aucune appli à installer.
      </div>
    </a>
  )
}
