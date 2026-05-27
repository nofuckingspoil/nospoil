'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import CompetitionsView from '@/components/CompetitionsView'
import { Footer, FloatingFeedback } from '@/components/Sections'

const SUPABASE_URL  = 'https://qdxthnlummnbtzdfkyby.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHRobmx1bW1uYnR6ZGZreWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDI3MDEsImV4cCI6MjA5NTQxODcwMX0.PIYyqnBsiWIQWfxcX23C7aEpE04urfXNvzqAoS3ed08';

export default function SportPage() {
  const { sport: sportId } = useParams();
  const [videoMap, setVideoMap] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent',     '#00E27A');
    document.documentElement.style.setProperty('--accent-ink', '#001A0E');

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

  const subscribe = (email, topic = 'all') => {
    fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, topic }),
    }).catch(() => {});
  };

  return (
    <div className="app">
      <Header />
      <main>
        <CompetitionsView sportId={sportId} onSubscribe={subscribe} videoMap={videoMap} />
        <Footer />
      </main>
      <FloatingFeedback />
    </div>
  );
}
