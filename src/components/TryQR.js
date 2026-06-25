'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Événement « démo » permanent — le QR du site ouvre cet appareil photo.
const DEMO_EVENT_ID = '7f507e30-2d08-4ce1-afff-46195f43aae2'

export default function TryQR() {
  const [qr, setQr] = useState('')
  const [href, setHref] = useState(`/j/${DEMO_EVENT_ID}`)

  useEffect(() => {
    const url = `${window.location.origin}/j/${DEMO_EVENT_ID}`
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
    <a className="tryqr" href={href} aria-label="Essayer Déclic — ouvrir l'appareil photo de démonstration">
      <div className="tryqr-head">
        <span className="tryqr-star">✱</span> ESSAYER DÉCLIC
      </div>
      <div className="tryqr-frame">
        {qr ? <img src={qr} alt="QR code de démonstration Déclic" /> : <div className="tryqr-skeleton" />}
      </div>
      <div className="tryqr-sub">
        Votre appareil vous attend déjà.<br />Aucune appli à installer.
      </div>
    </a>
  )
}
