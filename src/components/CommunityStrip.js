'use client'
import { useEffect, useState } from 'react'

const MIN_DISPLAY = 500;

export default function CommunityStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/community-stats')
      .then(r => r.json())
      .then(d => !d.error && setStats(d))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const { total = 0, sharers = 0, ambassadeurs = 0, vips = 0 } = stats;
  const pctAmb = total > 0 ? Math.round(ambassadeurs / total * 100) : 0;
  const pctVip = total > 0 ? Math.max(Math.round(vips / total * 100), vips > 0 ? 1 : 0) : 0;

  return (
    <section className="community-strip">
      <div className="container cs-inner">
        {total >= MIN_DISPLAY && (
          <p className="cs-headline">
            Vous êtes <strong>{total.toLocaleString('fr-FR')}</strong> à vivre les événements sans spoil.
          </p>
        )}
        <div className="cs-pills">
          <span className="cs-pill">
            <span className="cs-n">{sharers.toLocaleString('fr-FR')}</span>
            <span className="cs-l">ont partagé à la communauté</span>
          </span>
          <span className="cs-dot">·</span>
          <span className="cs-pill">
            <span className="cs-n">{pctAmb}%</span>
            <span className="cs-l">Ambassadeurs</span>
          </span>
          <span className="cs-dot">·</span>
          <span className="cs-pill">
            <span className="cs-n">moins de {pctVip + 1}%</span>
            <span className="cs-l">VIP</span>
          </span>
        </div>
      </div>
    </section>
  );
}
