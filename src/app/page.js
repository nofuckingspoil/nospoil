'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SportsSection from '@/components/SportsSection'
import CommunityStrip from '@/components/CommunityStrip'
import { HowItWorks, EmailBand, FAQ, StatsStrip, Feedback, Footer, FloatingFeedback } from '@/components/Sections'
import { getNsData } from '@/lib/nsData'
import { captureRefFromUrl } from '@/lib/referral'

const SUPABASE_URL  = 'https://qdxthnlummnbtzdfkyby.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHRobmx1bW1uYnR6ZGZreWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDI3MDEsImV4cCI6MjA5NTQxODcwMX0.PIYyqnBsiWIQWfxcX23C7aEpE04urfXNvzqAoS3ed08';

export default function HomePage() {
  const [videoMap, setVideoMap] = useState(null);
  const nsData = getNsData();

  useEffect(() => {
    // Capturer le code de parrainage depuis l'URL dès le chargement
    captureRefFromUrl();

    // Apply brand accent
    document.documentElement.style.setProperty('--accent',     '#00E27A');
    document.documentElement.style.setProperty('--accent-ink', '#001A0E');
    document.documentElement.classList.add('dark-hero');

    // Fetch videos from Supabase
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

  // Utilisé uniquement pour les formulaires rapides des sport-cards
  const quickSubscribe = (email, topic = 'all') => {
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
        <Hero />
        <SportsSection sports={nsData.sports} onSubscribe={quickSubscribe} videoMap={videoMap} />
        <HowItWorks />
        <StatsStrip />
        <CommunityStrip />
        <EmailBand />
        <FAQ />
        <Feedback />
        <Footer />
      </main>
      <FloatingFeedback />
    </div>
  );
}
