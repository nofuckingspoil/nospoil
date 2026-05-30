'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NS_DATA } from '@/lib/nsData'
import { NoEye } from './Brand'
import AlertFlow from './AlertFlow'

export default function StagesView({ sportId, compId, onPlay, onSubscribe, videoMap }) {
  const router = useRouter()
  const sport    = NS_DATA.sports.find(s => s.id === sportId);
  const compBase = NS_DATA.competitions[sportId].find(c => c.id === compId);

  // Inject live video data from Supabase videoMap
  const vids   = videoMap ? (videoMap[compId] || {}) : null;
  const latestNum = vids
    ? Math.max(0, ...Object.entries(vids).filter(([, v]) => v).map(([n]) => Number(n)))
    : 0;
  const stagesDone = vids ? Object.keys(vids).length : 0;
  const comp = { ...compBase, stagesDone };

  const stages = (NS_DATA.stages[compId] || []).map(s => ({
    ...s,
    available: vids ? !!vids[s.num] : false,
    videoId:   vids ? (vids[s.num] || null) : null,
    latest:    vids ? s.num === latestNum : false,
  }));

  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all'
    ? stages
    : stages.filter(s => s.type === filter || (filter === 'mountain' && (s.type === 'montagne' || s.type === 'haute-montagne')));

  return (
    <section className="section view-section">
      <div className="container">
        <Breadcrumb items={[
          { label: 'Sports', href: '/#sports' },
          { label: sport.name, href: `/${sportId}` },
          { label: comp.name },
        ]} />

        <div className="comp-hero" style={{ '--comp-accent': comp.accent }}>
          <div className="comp-hero-left">
            <div className="comp-hero-flag">{comp.country}</div>
            <h1 className="view-title comp-hero-title">{comp.name}</h1>
            <div className="comp-hero-sub">{comp.edition} · {comp.dates}</div>
            <AlertFlow onSubscribe={onSubscribe} topic={comp.id} variant="hero" />
          </div>
          <div className="comp-hero-right">
            <div className="comp-hero-stat">
              <div className="stat-n" style={{ color: comp.accent }}>{comp.stagesDone}<span className="stat-slash">/{comp.stagesTotal}</span></div>
              <div className="stat-l">étapes disponibles</div>
            </div>
          </div>
        </div>

        <div className="stage-filters">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>Toutes</FilterPill>
          <FilterPill active={filter === 'sprint'} onClick={() => setFilter('sprint')}>🏁 Sprint</FilterPill>
          <FilterPill active={filter === 'mountain'} onClick={() => setFilter('mountain')}>⛰️ Montagne</FilterPill>
          <FilterPill active={filter === 'contre-la-montre'} onClick={() => setFilter('contre-la-montre')}>⏱️ Chrono</FilterPill>
          <FilterPill active={filter === 'vallonnée'} onClick={() => setFilter('vallonnée')}>🌄 Vallonnée</FilterPill>
        </div>

        <div className="stages-list">
          {filtered.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--mute)', fontSize: '0.9rem' }}>
              Aucune étape disponible pour ce filtre.
            </div>
          )}
          {filtered.map(s => (
            <StageRow key={s.num} stage={s} comp={comp} onClick={() => onPlay(s, comp)} />
          ))}
        </div>

        <div className="stages-end">
          <div className="stages-end-text">
            <NoEye size={16} /> &nbsp; Tu es à jour. Prochaine étape dès qu&apos;elle sort.
          </div>
          <AlertFlow onSubscribe={onSubscribe} topic={comp.id} variant="bottom" inputId="stages-bottom-email" />
        </div>
      </div>
    </section>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button className={`filter-pill ${active ? 'on' : ''}`} onClick={onClick}>{children}</button>
  );
}

function StageRow({ stage, comp, onClick }) {
  const meta = (
    <>
      <div className="stage-num">
        <div className="stage-num-label">Étape</div>
        <div className="stage-num-n">{stage.num}</div>
      </div>
      <div className="stage-route">
        <div className="stage-route-top">
          <span className="stage-from">{stage.from}</span>
          <span className="stage-arrow">→</span>
          <span className="stage-to">{stage.to}</span>
        </div>
        <div className="stage-route-meta">
          <span className="stage-type">{stage.icon} {stage.type}</span>
          {stage.km > 0 && <><span className="dot-sep">·</span><span className="stage-km">{stage.km} km</span></>}
          {stage.dateLabel && <><span className="dot-sep">·</span><span className="stage-date">{stage.dateLabel}</span></>}
        </div>
      </div>
    </>
  );

  if (!stage.available) {
    const goToAlert = () => {
      const input = document.getElementById('stages-bottom-email');
      if (input) { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); input.focus(); }
    };
    return (
      <button className="stage-row stage-row--soon" onClick={goToAlert}>
        {meta}
        <div className="stage-right">
          <div className="stage-soon-badge">🔔 M&apos;alerter</div>
        </div>
      </button>
    );
  }

  return (
    <button className="stage-row" onClick={onClick}>
      {meta}
      <div className="stage-right">
        {stage.latest && <div className="latest-badge"><span className="dot-live" /> Dernier résumé</div>}
        <div className="stage-play">
          <div className="stage-play-btn" style={{ borderColor: comp.accent }}>
            <span className="play-tri" style={{ borderLeftColor: comp.accent }} />
          </div>
          <span className="stage-play-label">Regarder</span>
        </div>
      </div>
    </button>
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
