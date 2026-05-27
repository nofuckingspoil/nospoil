'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CertifiedBadge } from './Brand'

export default function Hero({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter()

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    onSubscribe(email);
    setDone(true);
    setTimeout(() => setDone(false), 4500);
    setEmail('');
  };

  return (
    <section className="hero">
      <div className="hero-grain" />
      <div className="container hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="pill-live"><span className="dot-live" /> Giro d&apos;Italia · Étape 17 en ligne</span>
          </div>
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
            <form className="hero-mail" onSubmit={submit}>
              <input
                type="email"
                placeholder="ton@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email pour être alerté"
              />
              <button type="submit" className="btn btn-ghost">
                {done ? '✓ Inscrit' : "M'alerter"}
              </button>
            </form>
          </div>
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
