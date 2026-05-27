// Views: Home, CompetitionList, StageList, VideoPlayer
const { useState: useStateV, useEffect: useEffectV, useMemo: useMemoV, useRef: useRefV } = React;

// ───────────────────────────────────────── HEADER
function Header({ go, onFeedback }) {
  return (
    <header className="site-header">
      <div className="container header-row">
        <button className="brand-btn" onClick={() => go({ view: 'home' })} aria-label="Accueil">
          <Wordmark size={28} />
        </button>
        <nav className="nav">
          <button className="nav-link" onClick={() => go({ view: 'home', scroll: 'sports' })}>Sports</button>
          <button className="nav-link" onClick={() => go({ view: 'home', scroll: 'how' })}>Comment ça marche</button>
          <button className="nav-link" onClick={() => go({ view: 'home', scroll: 'faq' })}>FAQ</button>
          <button className="nav-link nav-cta" onClick={onFeedback}>
            <span className="dot-live" /> Une idée ? Un bug ?
          </button>
        </nav>
      </div>
    </header>
  );
}

// ───────────────────────────────────────── HERO
function Hero({ go, onSubscribe }) {
  const [email, setEmail] = useStateV('');
  const [done, setDone] = useStateV(false);
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
            <span className="pill-live"><span className="dot-live" /> Giro d'Italia · Étape 17 en ligne</span>
          </div>
          <h1 className="hero-title">
            Ne sachez rien<br />
            avant d'appuyer<br />
            sur <span className="hero-play">▶ Play.</span>
          </h1>
          <p className="hero-lede">
            On regarde les résumés des courses sans titre, sans miniature, sans recos YouTube qui balancent le résultat.<br />
            Juste le sport, comme si tu l'avais vu en direct.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => go({ view: 'home', scroll: 'sports' })}>
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

// ───────────────────────────────────────── SPORTS PICKER
function SportsSection({ go, sports, onSubscribe }) {
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
            <SportCard key={s.id} sport={s} onSubscribe={onSubscribe} onClick={() => s.status === 'live' && go({ view: 'competitions', sport: s.id })} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SportCard({ sport, onClick, onSubscribe }) {
  const [email, setEmail] = useStateV('');
  const [done, setDone] = useStateV(false);
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
            <button type="submit" className="card-alert-submit">M'alerter</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────── COMPETITIONS VIEW
function CompetitionsView({ go, sportId, onSubscribe, videoMap }) {
  const sport = window.NS_DATA.sports.find(s => s.id === sportId);
  const rawComps = window.NS_DATA.competitions[sportId] || [];
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
        <Breadcrumb items={[{ label: 'Sports', go: () => go({ view: 'home', scroll: 'sports' }) }, { label: sport.name }]} />
        <h1 className="view-title">{sport.emoji} {sport.name}</h1>
        <p className="view-lede">Choisis ta course. Les résumés se chargent au clic — sans rien révéler avant.</p>

        {live.length > 0 && (
          <div className="comp-group">
            <div className="group-head"><span className="dot-live" /> En cours</div>
            <div className="comp-grid">
              {live.map(c => <CompetitionCard key={c.id} c={c} onClick={() => go({ view: 'stages', sport: sportId, comp: c.id })} onSubscribe={onSubscribe} />)}
            </div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="comp-group">
            <div className="group-head">À venir</div>
            <div className="comp-grid">
              {upcoming.map(c => <CompetitionCard key={c.id} c={c} disabled onSubscribe={onSubscribe} />)}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div className="comp-group">
            <div className="group-head">Archives 2026</div>
            <div className="comp-grid">
              {past.map(c => <CompetitionCard key={c.id} c={c} onClick={() => go({ view: 'stages', sport: sportId, comp: c.id })} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CompetitionCard({ c, onClick, disabled, onSubscribe }) {
  const [email, setEmail] = useStateV('');
  const [done, setDone] = useStateV(false);

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
        <div className="comp-progress-label">{c.stagesDone} / {c.stagesTotal} étapes</div>
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
              <button type="submit" className="card-alert-submit">M'alerter</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────── STAGES VIEW
function StagesView({ go, sportId, compId, onPlay, onSubscribe, videoMap }) {
  const sport    = window.NS_DATA.sports.find(s => s.id === sportId);
  const compBase = window.NS_DATA.competitions[sportId].find(c => c.id === compId);

  // Inject live video data from Supabase videoMap
  const vids   = videoMap ? (videoMap[compId] || {}) : null;
  const latestNum = vids
    ? Math.max(0, ...Object.entries(vids).filter(([, v]) => v).map(([n]) => Number(n)))
    : 0;
  const stagesDone = vids ? Object.keys(vids).length : 0;
  const comp = { ...compBase, stagesDone };

  const stages = (window.NS_DATA.stages[compId] || []).map(s => ({
    ...s,
    available: vids ? !!vids[s.num] : false,
    videoId:   vids ? (vids[s.num] || null) : null,
    latest:    vids ? s.num === latestNum : false,
  }));

  const [filter, setFilter] = useStateV('all');
  const [alertEmail, setAlertEmail] = useStateV('');
  const [alertDone, setAlertDone] = useStateV(false);
  const [bottomEmail, setBottomEmail] = useStateV('');
  const [bottomDone, setBottomDone] = useStateV(false);
  const filtered = filter === 'all'
    ? stages
    : stages.filter(s => s.type === filter || (filter === 'mountain' && (s.type === 'montagne' || s.type === 'haute-montagne')));

  const submitAlert = (e) => {
    e.preventDefault();
    if (!alertEmail.includes('@')) return;
    onSubscribe(alertEmail, comp.id);
    setAlertDone(true);
    setAlertEmail('');
  };

  const submitBottom = (e) => {
    e.preventDefault();
    if (!bottomEmail.includes('@')) return;
    onSubscribe(bottomEmail, comp.id);
    setBottomDone(true);
    setBottomEmail('');
  };

  return (
    <section className="section view-section">
      <div className="container">
        <Breadcrumb items={[
          { label: 'Sports', go: () => go({ view: 'home', scroll: 'sports' }) },
          { label: sport.name, go: () => go({ view: 'competitions', sport: sportId }) },
          { label: comp.name },
        ]} />

        <div className="comp-hero" style={{ '--comp-accent': comp.accent }}>
          <div className="comp-hero-left">
            <div className="comp-hero-flag">{comp.country}</div>
            <h1 className="view-title comp-hero-title">{comp.name}</h1>
            <div className="comp-hero-sub">{comp.edition} · {comp.dates}</div>
            {alertDone ? (
              <div className="hero-alert-ok">✓ Inscrit — on t'écrit dès que la prochaine étape sort.</div>
            ) : (
              <form className="hero-alert-form" onSubmit={submitAlert}>
                <input type="email" placeholder="ton@email.fr" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} />
                <button type="submit" className="hero-alert-btn">🔔 M'alerter des derniers résumés →</button>
              </form>
            )}
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
            <NoEye size={16} /> &nbsp; Tu es à jour. Prochaine étape dès qu'elle sort.
          </div>
          {bottomDone ? (
            <div className="card-alert-ok">✓ Inscrit — on t'écrit dès que la prochaine étape sort.</div>
          ) : (
            <form className="stages-end-form" onSubmit={submitBottom}>
              <input id="stages-bottom-email" type="email" placeholder="ton@email.fr" value={bottomEmail} onChange={e => setBottomEmail(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
                🔔 M'alerter des prochains résumés
              </button>
            </form>
          )}
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
          <div className="stage-soon-badge">🔔 M'alerter</div>
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

// ───────────────────────────────────────── BREADCRUMB
function Breadcrumb({ items }) {
  return (
    <div className="breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="bc-item">
          {it.go ? <button className="bc-link" onClick={it.go}>{it.label}</button> : <span className="bc-current">{it.label}</span>}
          {i < items.length - 1 && <span className="bc-sep">/</span>}
        </span>
      ))}
    </div>
  );
}

// ───────────────────────────────────────── VIDEO MODAL (anti-spoil)
function VideoModal({ stage, comp, onClose }) {
  const [started, setStarted] = useStateV(true);
  const [playing, setPlaying] = useStateV(false);
  const [progress, setProgress] = useStateV(0);
  const [duration, setDuration] = useStateV(0);
  const [muted, setMuted] = useStateV(false);
  const [revealed, setRevealed] = useStateV(false);
  const [speed, setSpeed] = useStateV(1);
  const [speedOpen, setSpeedOpen] = useStateV(false);
  const playerRef = useRefV(null);
  const speedWrapRef = useRefV(null);
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const timerRef = useRefV(null);

  useEffectV(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearInterval(timerRef.current);
      if (playerRef.current) try { playerRef.current.destroy(); } catch (_) {}
    };
  }, []);

  useEffectV(() => {
    if (!speedOpen) return;
    const close = (e) => {
      if (speedWrapRef.current && !speedWrapRef.current.contains(e.target)) setSpeedOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [speedOpen]);

  // Init YT player once the div is in the DOM (after started = true)
  useEffectV(() => {
    if (!started) return;

    function init() {
      if (playerRef.current) return;
      playerRef.current = new YT.Player('yt-player', {
        videoId: stage.videoId,
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1,
          rel: 0, modestbranding: 1, playsinline: 1,
          fs: 0, iv_load_policy: 3, cc_load_policy: 0,
        },
        events: {
          onReady(e) {
            setDuration(e.target.getDuration());
            timerRef.current = setInterval(() => {
              if (!playerRef.current?.getCurrentTime) return;
              setProgress(playerRef.current.getCurrentTime() || 0);
              setDuration(playerRef.current.getDuration() || 0);
            }, 500);
          },
          onStateChange(e) {
            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) setPlaying(false);
          },
        },
      });
    }

    if (window.YT?.Player) {
      init();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); init(); };
    }
  }, [started]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="video-modal" role="dialog" aria-modal="true">
      <div className="video-shell">
        <div className="video-topbar">
          <div className="video-meta">
            <Wordmark size={18} white />
            <span className="video-sep">·</span>
            <span className="video-stage-id">Étape {stage.num}</span>
            {revealed && (
              <>
                <span className="video-sep">·</span>
                <span className="video-stage-route">{stage.from} → {stage.to}</span>
              </>
            )}
          </div>
          <div className="video-topbar-right">
            <button className="video-iconbtn" onClick={() => setRevealed(r => !r)} title={revealed ? 'Masquer les infos' : 'Afficher les infos'}>
              <NoEye size={16} color={revealed ? '#FFD400' : '#F6F4EE'} />
              <span>{revealed ? 'Masquer' : 'Infos'}</span>
            </button>
            <button className="video-iconbtn" onClick={onClose} aria-label="Fermer">✕</button>
          </div>
        </div>

        <div className="video-stage">
          {started && (
            <div className="yt-container">
              <div id="yt-player" />
              <div className="yt-glass" />
            </div>
          )}
          {!started && (
            <div className="video-poster">
              <div className="poster-shield">
                <NoEye size={28} color="#F6F4EE" />
                <div className="poster-shield-text">Aucune miniature.<br/>Aucun titre.<br/>Aucun spoil.</div>
              </div>
              <button className="poster-play" onClick={() => setStarted(true)}>
                <span className="poster-play-tri" />
              </button>
              <div className="poster-foot">
                Tu vas regarder le résumé de l'<strong>Étape {stage.num}</strong>.<br />
                <span className="poster-foot-tiny">Rien n'est révélé tant que tu n'as pas appuyé.</span>
              </div>
            </div>
          )}
        </div>

        <div className="video-controls">
          <button className="video-ctrl" onClick={() => {
            if (!playerRef.current) return;
            playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
          }} aria-label={playing ? 'Pause' : 'Lecture'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <div className="video-time">{fmt(progress)}</div>
          <div className="video-bar" onClick={(e) => {
            if (!playerRef.current || !duration) return;
            const r = e.currentTarget.getBoundingClientRect();
            playerRef.current.seekTo((e.clientX - r.left) / r.width * duration, true);
          }}>
            <div className="video-bar-fill" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
          </div>
          <div className="video-time">{fmt(duration)}</div>
          <button className="video-ctrl" onClick={() => {
            if (!playerRef.current) return;
            muted ? playerRef.current.unMute() : playerRef.current.mute();
            setMuted(m => !m);
          }} aria-label={muted ? 'Activer le son' : 'Couper le son'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="video-speed-wrap" ref={speedWrapRef}>
            {speedOpen && (
              <div className="video-speed-menu">
                {SPEEDS.map(s => (
                  <button key={s} className={`video-speed-option${s === speed ? ' video-speed-option--active' : ''}`} onClick={() => {
                    setSpeed(s);
                    setSpeedOpen(false);
                    if (playerRef.current) playerRef.current.setPlaybackRate(s);
                  }}>
                    {s === 1 ? 'Normal' : `${s}×`}
                  </button>
                ))}
              </div>
            )}
            <button className="video-ctrl video-ctrl--speed" onClick={() => setSpeedOpen(o => !o)} aria-label="Vitesse de lecture" style={{ color: speed !== 1 ? 'var(--accent)' : undefined }}>
              {speed}×
            </button>
          </div>
          <button className="video-ctrl" onClick={() => {
            const el = document.querySelector('.video-shell');
            document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen().catch(() => {});
          }} aria-label="Plein écran">⛶</button>
        </div>

        <div className="video-foot">
          Source : Eurosport France · YouTube · Lecture isolée — aucune recommandation, aucun titre, aucune miniature.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Header, Hero, SportsSection, CompetitionsView, StagesView, VideoModal, Breadcrumb,
});
