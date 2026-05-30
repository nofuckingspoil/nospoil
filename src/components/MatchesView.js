'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NS_DATA } from '@/lib/nsData'
import { NoEye } from './Brand'
import AlertFlow from './AlertFlow'

const SUPABASE_URL  = 'https://qdxthnlummnbtzdfkyby.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHRobmx1bW1uYnR6ZGZreWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDI3MDEsImV4cCI6MjA5NTQxODcwMX0.PIYyqnBsiWIQWfxcX23C7aEpE04urfXNvzqAoS3ed08';

const ROUND_ORDER = ['1er tour', '2ème tour', '3ème tour', '4ème tour', 'Quart de finale', 'Demi-finale', 'Finale'];

const JOURS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MOIS  = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T12:00:00');
  const diffDays = Math.round((today - d) / 86400000);
  const short = `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
  if (diffDays === 0) return "Aujourd'hui · " + short;
  if (diffDays === 1) return 'Hier · ' + short;
  if (diffDays === 2) return 'Avant-hier · ' + short;
  return short;
}

export default function MatchesView({ sportId, compId, onPlay, onSubscribe }) {
  const sport   = NS_DATA.sports.find(s => s.id === sportId);
  const comp    = (NS_DATA.competitions[sportId] || []).find(c => c.id === compId);
  const [matches, setMatches]     = useState(null);
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    fetch(
      `${SUPABASE_URL}/rest/v1/etapes?competition_id=eq.${compId}&select=*,resumes(video_id)&order=numero`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
    )
      .then(r => r.json())
      .then(rows => {
        setMatches((rows || []).map(r => ({
          num:       r.numero,
          round:     r.type,
          player1:   r.depart,
          player2:   r.arrivee,
          date:      r.date || '',
          dateLabel: formatDateLabel(r.date),
          available: !!(r.resumes?.video_id),
          videoId:   r.resumes?.video_id || null,
        })));
      })
      .catch(() => setMatches([]));
  }, [compId]);

  const matchesDone = matches ? matches.filter(m => m.available).length : 0;
  const matchesTotal = comp?.stagesTotal || 127;

  const latestNum = matches
    ? Math.max(0, ...matches.filter(m => m.available).map(m => m.num))
    : 0;

  const grouped = ROUND_ORDER
    .map(round => ({ round, matches: (matches || []).filter(m => m.round === round) }))
    .filter(g => g.matches.length > 0);

  const displayed = filter === 'all' ? grouped : grouped.filter(g => g.round === filter);

  if (!comp || !sport) return null;

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
              <div className="stat-n" style={{ color: comp.accent }}>{matchesDone}<span className="stat-slash">/{matchesTotal}</span></div>
              <div className="stat-l">matchs disponibles</div>
            </div>
          </div>
        </div>

        <div className="stage-filters">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>Tous les tours</FilterPill>
          {ROUND_ORDER.map(round => {
            if (!matches || !matches.some(m => m.round === round)) return null;
            return (
              <FilterPill key={round} active={filter === round} onClick={() => setFilter(round)}>
                {round}
              </FilterPill>
            );
          })}
        </div>

        {matches === null ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--mute)', fontSize: '0.9rem' }}>Chargement…</div>
        ) : (
          displayed.map(group => (
            <div key={group.round} className="round-group">
              <div className="round-group-head">{group.round}</div>
              <div className="stages-list">
                {group.matches.map(m => (
                  <MatchRow
                    key={m.num}
                    match={m}
                    comp={comp}
                    latest={m.num === latestNum && m.available}
                    onClick={() => onPlay(m, comp)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <div className="stages-end">
          <div className="stages-end-text">
            <NoEye size={16} /> &nbsp; Tu es à jour. Prochain résumé dès qu&apos;il sort.
          </div>
          <AlertFlow onSubscribe={onSubscribe} topic={comp.id} variant="bottom" inputId="matches-bottom-email" />
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

function MatchRow({ match, comp, latest, onClick }) {
  const tbd = match.player1 === 'À déterminer';

  const meta = (
    <div className="stage-route" style={{ paddingLeft: 0 }}>
      <div className="stage-route-top">
        <span className="stage-from">{match.player1}</span>
        <span className="stage-arrow" style={{ padding: '0 8px', fontWeight: 400, opacity: 0.5 }}>vs</span>
        <span className="stage-to">{match.player2}</span>
      </div>
      <div className="stage-route-meta">
        {match.dateLabel && <span className="stage-date">{match.dateLabel}</span>}
      </div>
    </div>
  );

  if (tbd || !match.available) {
    const goToAlert = () => {
      const input = document.getElementById('matches-bottom-email');
      if (input) { input.scrollIntoView({ behavior: 'smooth', block: 'center' }); input.focus(); }
    };
    return (
      <button className="stage-row stage-row--soon" onClick={tbd ? undefined : goToAlert}>
        {meta}
        <div className="stage-right">
          {tbd
            ? <div className="stage-soon-badge" style={{ opacity: 0.5 }}>À déterminer</div>
            : <div className="stage-soon-badge">🔔 M&apos;alerter</div>
          }
        </div>
      </button>
    );
  }

  return (
    <button className="stage-row" onClick={onClick}>
      {meta}
      <div className="stage-right">
        {latest && <div className="latest-badge"><span className="dot-live" /> Dernier résumé</div>}
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
