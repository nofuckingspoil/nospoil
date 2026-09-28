'use client'

import { useEffect, useState } from 'react'
import { estIOS, isInAppBrowser } from '../lib/camera'
import { useLangue } from './Langue'

// L'app, proposée à l'organisateur sur iPhone, et seulement une fois son
// événement créé. Avant, elle l'était dès l'accueil, où elle ne servait à rien :
// l'app ne crée pas d'événement. Ici, elle réunit l'appareil photo et le
// tableau de bord, et se connecte avec la même adresse mail.
//
// Un lien interne au site ne peut pas ouvrir l'extrait d'app (App Clip) : Apple
// ne le lance que depuis un QR code ou un lien venu d'ailleurs. D'où l'app
// complète, ici.
// En français, la boutique française ; ailleurs, l'adresse sans pays : Apple
// ouvre alors la boutique du visiteur.
const APP_STORE = { fr: 'https://apps.apple.com/fr/app/id6801111367', en: 'https://apps.apple.com/app/id6801111367', de: 'https://apps.apple.com/de/app/id6801111367' }
const CLE = 'ttf_app_orga_ferme'

export default function ProposerAppIPhone({ email }) {
  const { t, lang } = useLangue()
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
      <button className="a2hs-close" onClick={fermer} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>×</button>
      <div className="a2hs-ic">📲</div>
      <div className="a2hs-body">
        <div className="a2hs-title">{t({ fr: "Prenez vos photos avec l'app", en: 'Take your photos with the app', de: 'Machen Sie Ihre Fotos mit der App' })}</div>
        <div className="a2hs-sub">
          {t({
            fr: "L'appareil photo et ce tableau de bord, réunis sur votre iPhone.",
            en: 'The camera and this dashboard, together on your iPhone.',
            de: 'Die Kamera und dieses Dashboard, vereint auf Ihrem iPhone.',
          })}
          {email ? t({
            fr: <> Connectez-vous avec <strong>{email}</strong>.</>,
            en: <> Sign in with <strong>{email}</strong>.</>,
            de: <> Melden Sie sich mit <strong>{email}</strong> an.</>,
          }) : null}
        </div>
        <a className="a2hs-btn" href={APP_STORE[lang] || APP_STORE.fr} style={{ display: 'inline-block', textDecoration: 'none' }}>
          {t({ fr: "Télécharger l'app", en: 'Download the app', de: 'App herunterladen' })}
        </a>
      </div>
    </div>
  )
}
