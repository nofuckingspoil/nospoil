'use client'
import { useRouter } from 'next/navigation'
import { CertifiedBadge } from './Brand'
import SubscribeFlow from './SubscribeFlow'

export default function Hero() {
  const router = useRouter()

  return (
    <section className="hero">
      <div className="hero-grain" />
      <div className="container hero-inner">
        <div className="hero-left">
          <h1 className="hero-title">
            Ne sachez rien<br />
            avant d&apos;appuyer<br />
            sur <span className="hero-play">▶ Play.</span>
          </h1>
          <p className="hero-lede">
            On regarde les résumés des courses sans titre, sans miniature, sans recos YouTube qui balancent le résultat.<br />
            Juste le sport, comme si tu l&apos;avais vu en direct.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/#sports')}>
              Voir les résumés <span className="btn-arrow">→</span>
            </button>
          </div>
          <SubscribeFlow variant="hero" />
          <p className="hero-tiny">
            Email anti-spoil aussi — juste « Étape X dispo ». Pas de pub. Désinscription en 1 clic.
          </p>
        </div>
        <div className="hero-right">
          <div className="badge-wrap">
            <CertifiedBadge size={220} rotate={-9} />
            <div className="badge-caption">
              <span className="badge-caption-line">Le seul endroit du web</span>
              <span className="badge-caption-line">où le sport reste une <em>surprise</em>.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
