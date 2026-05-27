'use client'
import { useRouter } from 'next/navigation'
import { Wordmark } from './Brand'

export default function Header() {
  const router = useRouter()

  return (
    <header className="site-header">
      <div className="container header-row">
        <button className="brand-btn" onClick={() => router.push('/')} aria-label="Accueil">
          <Wordmark size={28} />
        </button>
        <nav className="nav">
          <button className="nav-link" onClick={() => router.push('/#sports')}>Sports</button>
          <button className="nav-link" onClick={() => router.push('/#how')}>Comment ça marche</button>
          <button className="nav-link" onClick={() => router.push('/#faq')}>FAQ</button>
          <button className="nav-link nav-cta" onClick={() => router.push('/#feedback')}>
            <span className="dot-live" /> Une idée ? Un bug ?
          </button>
        </nav>
      </div>
    </header>
  )
}
