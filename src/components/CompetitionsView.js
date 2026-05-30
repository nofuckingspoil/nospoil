'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NS_DATA } from '@/lib/nsData'

export default function CompetitionsView({ sportId, onSubscribe, videoMap }) {
  const router = useRouter()
  const sport = NS_DATA.sports.find(s => s.id === sportId);
  const rawComps = NS_DATA.competitions[sportId] || [];
  // Inject live stagesDone from Supabase videoMap
  const comps = rawComps.map(c => ({
    ...c,
    stagesDone: videoMap ? Object.keys(videoMap[c.id] || {}).length : 0,
  }));
  const live = comps.filter(c => c.status === 'live');
  const upcoming = comps.filter(c => c.status === 'upcoming');
  const past = comps.filter(c => c.status === 'past');

  return (
    <section className="section view-section">
      <div className="container">
        <Breadcrumb items={[
          { label: 'Sports', href: '/#sports' },
          { label: sport.name },
        ]} />
        <h1 className="view-title">{sport.emoji} {sport.name}</h1>
        <p className="view-lede">{sportId === 'tennis' ? 'Choisis ton tableau. Les résumés se chargent au clic — sans rien révéler avant.' : 'Choisis ta course. Les résumés se chargent au clic — sans rien révéler avant.'}</p>

        {live.length > 0 && (
          <div className="comp-group">
            <div className="group-head"><span className="dot-live" /> En cours</div>
            <div className="comp-grid">
              {live.map(c => (
                <CompetitionCard
                  key={c.id}
                  c={c}
                  onClick={() => router.push(`/${sportId}/${c.id}`)}
                  onSubscribe={onSubscribe}
                />
              ))}
            </div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="comp-group">
            <div className="group-head">À venir</div>
            <div className="comp-grid">
              {upcoming.map(c => (
                <CompetitionCard key={c.id} c={c} disabled onSubscribe={onSubscribe} />
              ))}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div className="comp-group">
            <div className="group-head">Archives 2026</div>
            <div className="comp-grid">
              {past.map(c => (
                <CompetitionCard
                  key={c.id}
                  c={c}
                  onClick={() => router.push(`/${sportId}/${c.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CompetitionCard({ c, onClick, disabled, onSubscribe }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submitAlert = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    onSubscribe(email, c.id);
    setDone(true);
    setEmail('');
  };

  const alertLabel = disabled ? `M'alerter au départ` : `Résumés ${c.name} — dès qu'un nouveau sort`;
  const alertOk    = disabled ? `✓ On t'écrit au départ` : `✓ Inscrit pour le ${c.name}`;

  const mainContent = (
    <>
      <div className="comp-top">
        <div className="comp-country">{c.country}</div>
        {c.status === 'live'     && <span className="pill-live small"><span className="dot-live" /> Live</span>}
        {c.status === 'upcoming' && <span className="pill-soon small">Bientôt</span>}
        {c.status === 'past'     && <span className="pill-past small">Archives</span>}
      </div>
      <div className="comp-name">{c.name}</div>
      <div className="comp-edition">{c.edition}</div>
      <div className="comp-dates">{c.dates}</div>
      <div className="comp-progress">
        <div className="comp-progress-bar">
          <div className="comp-progress-fill" style={{ width: `${(c.stagesDone / c.stagesTotal) * 100}%`, background: c.accent }} />
        </div>
        <div className="comp-progress-label">{c.stagesDone} / {c.stagesTotal} {c.sport === 'tennis' ? 'matchs' : 'étapes'}</div>
      </div>
      {!disabled && <div className="comp-arrow">→</div>}
    </>
  );

  return (
    <div
      className={`comp-card ${disabled ? 'is-disabled' : ''} ${c.status === 'live' ? 'is-live' : ''}`}
      style={{ '--comp-accent': c.accent }}
    >
      <div className="comp-stripe" />
      {disabled || !onClick
        ? <div className="comp-card-main">{mainContent}</div>
        : <button className="comp-card-main" onClick={onClick}>{mainContent}</button>
      }
      {onSubscribe && (
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
      )}
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <div className="breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="bc-item">
          {it.href ? <Link className="bc-link" href={it.href}>{it.label}</Link> : <span className="bc-current">{it.label}</span>}
          {i < items.length - 1 && <span className="bc-sep">/</span>}
        </span>
      ))}
    </div>
  );
}
