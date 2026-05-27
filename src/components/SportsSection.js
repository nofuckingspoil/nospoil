'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SportsSection({ sports, onSubscribe, videoMap }) {
  const router = useRouter()

  return (
    <section className="section" id="sports">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">01 — Choisis ton terrain</p>
            <h2 className="h2">Quel sport, ce soir ?</h2>
          </div>
          <p className="section-note">On commence par le cyclisme. Le reste arrive.</p>
        </div>
        <div className="sports-grid">
          {sports.map(s => (
            <SportCard
              key={s.id}
              sport={s}
              onSubscribe={onSubscribe}
              onClick={() => s.status === 'live' && router.push(`/${s.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SportCard({ sport, onClick, onSubscribe }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const live = sport.status === 'live';

  const submitAlert = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    onSubscribe(email, sport.id);
    setDone(true);
    setEmail('');
  };

  const alertLabel = live
    ? `Résumés ${sport.name} — dès qu'un nouveau sort`
    : `M'alerter quand ça arrive`;
  const alertOk = live
    ? `✓ Inscrit pour tout le ${sport.name}`
    : `✓ On t'écrit dès que c'est là`;

  const cardBody = (
    <>
      <div className="sport-emoji">{sport.emoji}</div>
      <div className="sport-meta">
        <div className="sport-name">{sport.name}</div>
        <div className="sport-tag">{sport.tagline}</div>
      </div>
      <div className="sport-cta">
        {live ? (
          <>
            <span className="pill-live small"><span className="dot-live" /> En cours</span>
            <span className="arrow">→</span>
          </>
        ) : (
          <span className="pill-soon">🚧 Prochainement</span>
        )}
      </div>
    </>
  );

  return (
    <div className={`sport-card ${live ? 'live' : 'soon'}`}>
      {live
        ? <button className="sport-card-main" onClick={onClick}>{cardBody}</button>
        : <div className="sport-card-main">{cardBody}</div>
      }
      <div className="card-alert">
        <div className="card-alert-label">🔔 {alertLabel}</div>
        {done ? (
          <div className="card-alert-ok">{alertOk}</div>
        ) : (
          <form className="card-alert-form" onSubmit={submitAlert}>
            <input type="email" placeholder="ton@email.fr" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" className="card-alert-submit">M&apos;alerter</button>
          </form>
        )}
      </div>
    </div>
  );
}
