'use client'

import { useEffect, useState } from 'react'
import { estIOS, isInAppBrowser } from '../lib/camera'

// L'app, proposée à l'organisateur sur iPhone, et seulement une fois son
// événement créé. Avant, elle l'était dès l'accueil, où elle ne servait à rien :
// l'app ne crée pas d'événement. Ici, elle réunit l'appareil photo et le
// tableau de bord, et se connecte avec la même adresse mail.
//
// Un lien interne au site ne peut pas ouvrir l'extrait d'app (App Clip) : Apple
// ne le lance que depuis un QR code ou un lien venu d'ailleurs. D'où l'app
// complète, ici.
const APP_STORE = 'https://apps.apple.com/fr/app/id6801111367'
const CLE = 'ttf_app_orga_ferme'

export default function ProposerAppIPhone({ email }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem(CLE)) return } catch {}
    if (estIOS() && !isInAppBrowser()) setShow(true)
  }, [])

  function fermer() {
    setShow(false)
    try { localStorage.setItem(CLE, '1') } catch {}
  }

  if (!show) return null
  return (
    <div className="a2hs">
      <button className="a2hs-close" onClick={fermer} aria-label="Fermer">×</button>
      <div className="a2hs-ic">📲</div>
      <div className="a2hs-body">
        <div className="a2hs-title">Prenez vos photos avec l&apos;app</div>
        <div className="a2hs-sub">
          L&apos;appareil photo et ce tableau de bord, réunis sur votre iPhone.
          {email ? <> Connectez-vous avec <strong>{email}</strong>.</> : null}
        </div>
        <a className="a2hs-btn" href={APP_STORE} style={{ display: 'inline-block', textDecoration: 'none' }}>
          Télécharger l&apos;app
        </a>
      </div>
    </div>
  )
}
