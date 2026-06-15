'use client'

import { useEffect, useState } from 'react'

// Invite à épingler la page sur l'écran d'accueil.
// Android : vrai bouton d'installation (beforeinstallprompt).
// iOS : instructions "Partager → Sur l'écran d'accueil".
// Discret, fermable, et ne réapparaît pas après fermeture (localStorage).
export default function InstallPrompt({ label = "Ajoute Déclic à ton écran d'accueil" }) {
  const [deferred, setDeferred] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem('declic_a2hs_dismissed')) return } catch {}

    // Déjà installée (mode standalone) → ne rien afficher
    const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone
    if (standalone) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
    if (ios) { setIsIOS(true); setShow(true); return }

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    setShow(false)
    try { localStorage.setItem('declic_a2hs_dismissed', '1') } catch {}
  }

  async function install() {
    if (!deferred) return
    deferred.prompt()
    try { await deferred.userChoice } catch {}
    dismiss()
  }

  if (!show) return null

  return (
    <div className="a2hs">
      <button className="a2hs-close" onClick={dismiss} aria-label="Fermer">×</button>
      <div className="a2hs-ic">📲</div>
      <div className="a2hs-body">
        <div className="a2hs-title">{label}</div>
        {isIOS
          ? <div className="a2hs-sub">Touche <strong>Partager</strong> puis <strong>« Sur l'écran d'accueil »</strong> pour la retrouver en un geste.</div>
          : <button className="a2hs-btn" onClick={install}>Ajouter à l'écran d'accueil</button>}
      </div>
    </div>
  )
}
