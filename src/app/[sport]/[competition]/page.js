'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import StagesView from '@/components/StagesView'
import MatchesView from '@/components/MatchesView'
import VideoModal from '@/components/VideoModal'
import { Footer, FloatingFeedback } from '@/components/Sections'
import { NS_DATA } from '@/lib/nsData'

const SUPABASE_URL  = 'https://qdxthnlummnbtzdfkyby.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHRobmx1bW1uYnR6ZGZreWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDI3MDEsImV4cCI6MjA5NTQxODcwMX0.PIYyqnBsiWIQWfxcX23C7aEpE04urfXNvzqAoS3ed08';

export default function CompetitionPage() {
  const { sport: sportId, competition: compId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [videoMap, setVideoMap] = useState(null);
  const [video, setVideo] = useState(null);
  const [pendingStage, setPendingStage] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent',     '#00E27A');
    document.documentElement.style.setProperty('--accent-ink', '#001A0E');

    // Lire le param ?stage=X pour ouvrir automatiquement
    const stageParam = searchParams.get('stage');
    if (stageParam) {
      setPendingStage(parseInt(stageParam));
    }

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

  // Ouvrir automatiquement la vidéo quand videoMap est chargé (depuis ?stage=X)
  useEffect(() => {
    if (!videoMap || !pendingStage) return;
    const vids = videoMap[compId] || {};
    const videoId = vids[pendingStage];
    if (!videoId) return;

    const compBase = (NS_DATA.competitions[sportId] || []).find(c => c.id === compId);
    const stagesDone = Object.keys(vids).length;
    const comp = { ...compBase, stagesDone };

    const stageData = (NS_DATA.stages[compId] || []).find(s => s.num === pendingStage);
    if (!stageData || !compBase) return;

    setVideo({
      stage: { ...stageData, videoId, available: true },
      comp,
    });
    setPendingStage(null);
  }, [videoMap, pendingStage]);

  const subscribe = (email, topic = 'all') => {
    fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, topic }),
    }).catch(() => {});
  };

  const handlePlay = (stage, comp) => {
    setVideo({ stage, comp, autoStart: true });
    // Mettre à jour l'URL avec ?stage=X sans recharger la page
    const url = new URL(window.location.href);
    url.searchParams.set('stage', stage.num);
    window.history.pushState({}, '', url.toString());
  };

  const handleClose = () => {
    setVideo(null);
    // Retirer ?stage de l'URL
    const url = new URL(window.location.href);
    url.searchParams.delete('stage');
    window.history.pushState({}, '', url.toString());
  };

  const isTennis = sportId === 'tennis';

  return (
    <div className="app">
      <Header />
      <main>
        {isTennis ? (
          <MatchesView
            sportId={sportId}
            compId={compId}
            onPlay={handlePlay}
            onSubscribe={subscribe}
          />
        ) : (
          <StagesView
            sportId={sportId}
            compId={compId}
            onPlay={handlePlay}
            onSubscribe={subscribe}
            videoMap={videoMap}
          />
        )}
        <Footer />
      </main>
      <FloatingFeedback />
      {video && <VideoModal stage={video.stage} comp={video.comp} onClose={handleClose} autoStart={video.autoStart ?? false} />}
    </div>
  );
}
