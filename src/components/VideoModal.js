'use client'
import { useState, useEffect, useRef } from 'react'
import { Wordmark, NoEye } from './Brand'

export default function VideoModal({ stage, comp, onClose }) {
  const isTennis = comp?.sport === 'tennis';
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const playerRef = useRef(null);
  const speedWrapRef = useRef(null);
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const timerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (!speedOpen) return;
    const close = (e) => {
      if (speedWrapRef.current && !speedWrapRef.current.contains(e.target)) setSpeedOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [speedOpen]);

  // Init YT player once the div is in the DOM (after started = true)
  useEffect(() => {
    if (!started) return;

    function init() {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player('yt-player', {
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
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setPlaying(false);
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

    return () => {
      clearInterval(timerRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [started, stage.videoId]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className="video-modal" role="dialog" aria-modal="true">
      <div className="video-shell">
        <div className="video-topbar">
          <div className="video-meta">
            <Wordmark size={18} white />
            <span className="video-sep">·</span>
            <span className="video-stage-id">{isTennis ? stage.round : `Étape ${stage.num}`}</span>
            {revealed && (
              <>
                <span className="video-sep">·</span>
                <span className="video-stage-route">
                  {isTennis ? `${stage.player1} vs ${stage.player2}` : `${stage.from} → ${stage.to}`}
                </span>
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
                {isTennis
                  ? <>Tu vas regarder <strong>{stage.player1} vs {stage.player2}</strong>.<br /></>
                  : <>Tu vas regarder le résumé de l&apos;<strong>Étape {stage.num}</strong>.<br /></>
                }
                <span className="poster-foot-tiny">Rien n&apos;est révélé tant que tu n&apos;as pas appuyé.</span>
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
          Source : {isTennis ? 'France TV Sport' : 'Eurosport France'} · YouTube · Lecture isolée — aucune recommandation, aucun titre, aucune miniature.
        </div>
      </div>
    </div>
  );
}
