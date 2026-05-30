'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { Footer } from '@/components/Sections'

const TIER_COLOR = { 1: '#6B7280', 2: '#CD7F32', 3: '#B8B8B8', 4: '#FFD700' };
const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function CommunautePage() {
  const [entries, setEntries] = useState(null);
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .catch(() => setEntries([]));

    fetch('/api/community-stats')
      .then(r => r.json())
      .then(d => !d.error && setStats(d))
      .catch(() => {});
  }, []);

  const vips   = entries?.filter(e => e.tier === 4) ?? [];
  const hasVip = vips.length > 0;

  return (
    <div className="comm-page">
      <Header />
      <main>

        {/* ── Hero ────────────────────────────────────────── */}
        <section className="comm-hero">
          <div className="container comm-hero-inner">
            <div className="comm-eyebrow">Communauté no.spoil</div>
            <h1 className="comm-title">Classement</h1>
            <p className="comm-sub">
              Ceux qui protègent le plus leurs potes des spoils.
            </p>
            {stats && (
              <div className="comm-stat-pills">
                <span className="comm-stat-pill">
                  <strong>{Number(stats.total).toLocaleString('fr-FR')}</strong> membres
                </span>
                <span className="comm-stat-sep">·</span>
                <span className="comm-stat-pill">
                  <strong>{Number(stats.sharers).toLocaleString('fr-FR')}</strong> ont partagé
                </span>
                {stats.ambassadeurs > 0 && <>
                  <span className="comm-stat-sep">·</span>
                  <span className="comm-stat-pill">
                    <strong>{stats.ambassadeurs}</strong> Ambassadeurs
                  </span>
                </>}
                {stats.vips > 0 && <>
                  <span className="comm-stat-sep">·</span>
                  <span className="comm-stat-pill comm-stat-vip">
                    <strong>{stats.vips}</strong> VIP
                  </span>
                </>}
              </div>
            )}
          </div>
        </section>

        {/* ── Hall of Fame — VIP ──────────────────────────── */}
        {hasVip && (
          <section className="hof-section">
            <div className="container">
              <div className="hof-label">✦ Hall of Fame — VIP</div>
              <div className="hof-grid">
                {vips.map(e => (
                  <div key={e.pseudo} className="hof-card">
                    <span className="hof-star">★</span>
                    <span className="hof-pseudo">{e.pseudo}</span>
                    <span className="hof-count">
                      {e.qualified_referrals} filleul{e.qualified_referrals > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Classement ──────────────────────────────────── */}
        <section className="lb-section">
          <div className="container">
            {entries === null && (
              <div className="lb-loading">Chargement du classement…</div>
            )}
            {entries !== null && entries.length === 0 && (
              <div className="lb-empty">
                <p>Pas encore de classement public.</p>
                <p>Inscris-toi et rejoins la communauté pour apparaître ici !</p>
              </div>
            )}
            {entries !== null && entries.length > 0 && (
              <div className="lb-list">
                {entries.map((entry, i) => {
                  const rank    = i + 1;
                  const isVip   = entry.tier === 4;
                  const color   = TIER_COLOR[entry.tier] ?? '#6B7280';
                  const medal   = RANK_MEDAL[rank];
                  return (
                    <div key={entry.pseudo} className={`lb-row${isVip ? ' lb-row-vip' : ''}`}>
                      <span className="lb-rank">
                        {medal ?? <span className="lb-rank-n">#{rank}</span>}
                      </span>
                      <span className="lb-dot" style={{ background: color }} />
                      <span className="lb-pseudo">{entry.pseudo}</span>
                      <span className="lb-tier" style={{ color }}>
                        {isVip && '★ '}{entry.tier_name}
                      </span>
                      <span className="lb-count">
                        {entry.qualified_referrals}
                        <span className="lb-count-lbl"> filleul{entry.qualified_referrals > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA rejoindre ───────────────────────────────── */}
        <section className="comm-cta-section">
          <div className="container comm-cta-inner">
            <div>
              <p className="comm-cta-t">Ton pseudo n'est pas là ?</p>
              <p className="comm-cta-sub">
                Inscris-toi à l'alerte anti-spoil et rejoins la communauté pour apparaître dans le classement.
              </p>
            </div>
            <a href="/#email" className="btn btn-accent btn-lg">
              Rejoindre la communauté →
            </a>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
