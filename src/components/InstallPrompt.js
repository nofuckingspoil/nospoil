'use client'

import { useEffect, useState } from 'react'

// Icône "Partager" d'iOS (carré avec flèche vers le haut)
function ShareIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 15V3M12 3L8.5 6.5M12 3l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10H6a1 1 0 00-1 1v9a1 1 0 001 1h12a1 1 0 001-1v-9a1 1 0 00-1-1h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Invite à épingler la page sur l'écran d'accueil.
// Android : vrai bouton d'installation (beforeinstallprompt).
// iOS : instructions visuelles "Partager → Sur l'écran d'accueil".
export default function InstallPrompt({ label = "Ajoute Déclic à ton écran d'accueil" }) {
  const [deferred, setDeferred] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try { if (localStorage.getItem('declic_a2hs_dismissed')) return } catch {}
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

  // ---- iOS : instructions visuelles ----
  if (isIOS) return (
    <div className="a2hs a2hs-ios">
      <button className="a2hs-close" onClick={dismiss} aria-label="Fermer">×</button>
      <div className="a2hs-title" style={{ paddingRight: 20 }}>📲 {label}</div>
      <div className="a2hs-steps">
        <div className="a2hs-step">
          <span className="a2hs-num">1</span>
          <span>Touche <span className="a2hs-share"><ShareIcon size={15} /> Partager</span> en bas de Safari</span>
        </div>
        <div className="a2hs-step">
          <span className="a2hs-num">2</span>
          <span>Choisis <strong>« Sur l'écran d'accueil »</strong> <span className="a2hs-plus">⊕</span></span>
        </div>
      </div>
    </div>
  )

  // ---- Android : bouton d'installation ----
  return (
    <div className="a2hs">
      <button className="a2hs-close" onClick={dismiss} aria-label="Fermer">×</button>
      <div className="a2hs-ic">📲</div>
      <div className="a2hs-body">
        <div className="a2hs-title">{label}</div>
        <button className="a2hs-btn" onClick={install}>Ajouter à l'écran d'accueil</button>
      </div>
    </div>
  )
}
