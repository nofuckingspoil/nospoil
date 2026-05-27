// Main App — production version (no tweaks panel)
const { useState: useStateA, useEffect: useEffectA } = React;

const SUPABASE_URL  = 'https://qdxthnlummnbtzdfkyby.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHRobmx1bW1uYnR6ZGZreWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDI3MDEsImV4cCI6MjA5NTQxODcwMX0.PIYyqnBsiWIQWfxcX23C7aEpE04urfXNvzqAoS3ed08';

function App() {
  const [nav, setNav]             = useStateA({ view: 'home' });
  const [video, setVideo]         = useStateA(null);
  const [videoMap, setVideoMap]   = useStateA(null); // null = chargement, {} = chargé
  const [pendingVideo, setPendingVideo] = useStateA(null); // { sport, comp, stage } depuis lien email

  // Apply brand accent on mount + fetch videos from Supabase
  useEffectA(() => {
    document.documentElement.style.setProperty('--accent',     '#00E27A');
    document.documentElement.style.setProperty('--accent-ink', '#001A0E');
    document.documentElement.classList.add('dark-hero');

    // Navigation directe depuis les liens email (?sport=cyclisme&comp=giro-2026&stage=17)
    const params = new URLSearchParams(window.location.search);
    const pSport = params.get('sport'), pComp = params.get('comp'), pStage = params.get('stage');
    if (pSport && pComp) setNav({ view: 'stages', sport: pSport, comp: pComp });
    else if (pSport)     setNav({ view: 'competitions', sport: pSport });
    if (pSport && pComp && pStage) setPendingVideo({ sport: pSport, comp: pComp, stage: parseInt(pStage) });

    fetch(`${SUPABASE_URL}/rest/v1/etapes?select=competition_id,numero,resumes(video_id)`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    })
      .then(r => r.json())
      .then(rows => {
        const map = {};
        (rows || []).forEach(r => {
          if (!map[r.competition_id]) map[r.competition_id] = {};
          const vid = r.resumes?.video_id || null;
          if (vid) map[r.competition_id][r.numero] = vid;
        });
        setVideoMap(map);
      })
      .catch(() => setVideoMap({}));
  }, []);

  // Ouvrir automatiquement la vidéo quand videoMap est chargé (lien email avec ?stage=)
  useEffectA(() => {
    if (!videoMap || !pendingVideo) return;
    const { sport, comp, stage: num } = pendingVideo;
    const videoId = (videoMap[comp] || {})[num];
    if (!videoId) return;
    const stageData  = (window.NS_DATA.stages[comp] || []).find(s => s.num === num);
    const compData   = (window.NS_DATA.competitions[sport] || []).find(c => c.id === comp);
    if (!stageData || !compData) return;
    setVideo({
      stage: { ...stageData, videoId, available: true },
      comp:  { ...compData, stagesDone: Object.keys(videoMap[comp] || {}).length },
    });
    setPendingVideo(null);
  }, [videoMap]);

  // Scroll / reset on nav change
  useEffectA(() => {
    if (nav.scroll) {
      const el = document.getElementById(nav.scroll);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [nav]);

  const go = (next) => setNav(next);

  const subscribe = (email, topic = 'all') => {
    fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, topic }),
    }).catch(() => {});
  };

  return (
    <div className="app">
      <Header go={go} onFeedback={() => go({ view: 'home', scroll: 'feedback' })} />

      {nav.view === 'home' && (
        <main>
          <Hero go={go} onSubscribe={subscribe} />
          <SportsSection go={go} sports={window.NS_DATA.sports} onSubscribe={subscribe} videoMap={videoMap} />
          <HowItWorks />
          <StatsStrip />
          <EmailBand onSubscribe={subscribe} />
          <FAQ />
          <Feedback />
          <Footer />
        </main>
      )}

      {nav.view === 'competitions' && (
        <main>
          <CompetitionsView go={go} sportId={nav.sport} onSubscribe={subscribe} videoMap={videoMap} />
          <Footer />
        </main>
      )}

      {nav.view === 'stages' && (
        <main>
          <StagesView
            go={go}
            sportId={nav.sport}
            compId={nav.comp}
            onPlay={(stage, comp) => setVideo({ stage, comp })}
            onSubscribe={subscribe}
            videoMap={videoMap}
          />
          <Footer />
        </main>
      )}

      {video && <VideoModal stage={video.stage} comp={video.comp} onClose={() => setVideo(null)} />}
      <FloatingFeedback onClick={() => go({ view: 'home', scroll: 'feedback' })} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
