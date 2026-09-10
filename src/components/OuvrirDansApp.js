'use client'

import { useEffect, useState } from 'react'
import { isInAppBrowser, estIOS, lienApp } from '../lib/camera'

// ============================================================
//  « Ouvrir dans l'application », depuis un mini-navigateur.
//
//  LE PROBLÈME
//  Messenger, Instagram et WhatsApp ouvrent les liens à l'intérieur d'eux-
//  mêmes, dans un navigateur au rabais. C'est leur choix, pas le nôtre : ils
//  ignorent délibérément le mécanisme d'iOS qui ouvrirait l'application. Aucun
//  site ne peut le leur imposer, et personne n'y arrive, pas même les grands.
//
//  CE QU'ON PEUT FAIRE
//  Depuis ce navigateur-là, une adresse « timetoflash:// » fonctionne encore :
//  si l'application est installée, iOS bascule dessus. Sinon il ne se passe
//  rien, et c'est tout le problème : un site ne peut PAS savoir si une
//  application est installée, aucune interface ne le permet, et c'est
//  volontaire (ce serait un mouchard).
//
//  On propose donc, on n'affirme pas. On tente, et si rien ne bouge au bout
//  d'une seconde et demie, on offre la vraie sortie : ouvrir la page dans
//  Safari, où l'appareil photo fonctionne et où iOS propose lui-même
//  l'application et l'extrait d'app.
// ============================================================

/** Le temps qu'on laisse à iOS pour basculer avant de proposer autre chose. */
const PATIENCE = 1500

export default function OuvrirDansApp() {
  const [visible, setVisible] = useState(false)
  const [rate, setRate] = useState(false)
  /** Même Safari n'a pas voulu s'ouvrir : reste le menu du mini-navigateur. */
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    // Uniquement l'iPhone : c'est là qu'existe l'application. Sur Android, le
    // mini-navigateur se règle avec « Ouvrir dans Chrome », déjà en place.
    setVisible(isInAppBrowser() && estIOS())
  }, [])

  if (!visible) return null

  const ici = typeof window !== 'undefined' ? window.location.href : ''

  function ouvrirLApp() {
    const cible = lienApp(ici)
    if (!cible) { setRate(true); return }
    // Si la bascule a lieu, la page passe en arrière-plan et ce minuteur ne
    // trouve rien à dire. Sinon, on propose la sortie par Safari.
    setTimeout(() => { if (!document.hidden) setRate(true) }, PATIENCE)
    try { window.location.href = cible } catch { setRate(true) }
  }

  function ouvrirSafari() {
    // « x-safari-https:// » ouvre Safari depuis certains mini-navigateurs. Ce
    // n'est pas une interface officielle d'Apple, personne ne la garantit, et
    // Messenger la bloque selon les versions. On tente, et si rien ne bouge on
    // donne le chemin qui marche à coup sûr : le menu du mini-navigateur.
    setTimeout(() => { if (!document.hidden) setMenu(true) }, PATIENCE)
    try { window.location.href = ici.replace(/^https:/, 'x-safari-https:') } catch { setMenu(true) }
  }

  if (menu) {
    return (
      <div className="ouvrir-app">
        <span className="ouvrir-app-t">
          Touchez <b>•••</b> en haut de cet écran, puis « Ouvrir dans le navigateur ».
          L&apos;appareil photo y fonctionne.
        </span>
      </div>
    )
  }

  return (
    <div className="ouvrir-app">
      <span className="ouvrir-app-t">
        {rate
          ? "L'application ne s'est pas ouverte. Safari, lui, sait tout faire."
          : 'Vous êtes dans le navigateur de Messenger.'}
      </span>
      {rate ? (
        <button className="ouvrir-app-b" onClick={ouvrirSafari}>Ouvrir dans Safari</button>
      ) : (
        <button className="ouvrir-app-b" onClick={ouvrirLApp}>Ouvrir dans l&apos;application</button>
      )}
    </div>
  )
}
