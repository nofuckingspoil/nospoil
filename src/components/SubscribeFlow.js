'use client'
import { useState } from 'react'
import { getStoredRef, clearStoredRef, getFingerprint } from '@/lib/referral'
import ShareButton from './ShareButton'

export default function SubscribeFlow({ variant = 'hero' }) {
  const [step, setStep]               = useState('email');
  const [email, setEmail]             = useState('');
  const [pseudo, setPseudo]           = useState('');
  const [wantCommunity, setWant]      = useState(false);
  const [refCode, setRefCode]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  async function submitEmail(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    setError(null);
    try {
      const [fp, ref] = [await getFingerprint(), getStoredRef()];
      const res  = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, refCode: ref, fingerprint: fp }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error ?? 'Une erreur est survenue.'); return; }
      clearStoredRef();
      setRefCode(data.refCode);
      setStep('community');
    } catch { setError('Erreur réseau. Réessaie.'); }
    finally   { setLoading(false); }
  }

  async function submitCommunity(e) {
    e.preventDefault();
    if (!wantCommunity) { setStep('done'); return; }
    const trimmed = pseudo.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError('Le pseudo doit faire entre 3 et 20 caractères.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fp  = await getFingerprint();
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, pseudo: trimmed, communityOptIn: true, fingerprint: fp }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error ?? 'Une erreur est survenue.'); return; }
      setStep('done');
    } catch { setError('Erreur réseau. Réessaie.'); }
    finally   { setLoading(false); }
  }

  const base = `subscribe-flow sf-${variant}`;

  // ── Étape 1 : saisie email ─────────────────────────────────
  if (step === 'email') {
    return (
      <form className={base} onSubmit={submitEmail}>
        <div className="sf-email-row">
          <input
            type="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Adresse email"
            className="sf-input"
          />
          <button
            type="submit"
            className={`btn ${variant === 'hero' ? 'btn-ghost' : 'btn-accent btn-lg'}`}
            disabled={loading}
          >
            {loading ? '…' : variant === 'hero' ? "M'alerter" : "M'inscrire →"}
          </button>
        </div>
        {error && <p className="sf-error">{error}</p>}
      </form>
    );
  }

  // ── Étape 2 : opt-in communauté ───────────────────────────
  if (step === 'community') {
    return (
      <div className={`${base} sf-panel`}>
        <div className="sf-ok">✓ Inscrit à l'alerte anti-spoil !</div>
        <form onSubmit={submitCommunity}>
          <p className="sf-q">Rejoindre la communauté et grimper au classement ?</p>
          <label className="sf-opt-label">
            <input
              type="checkbox"
              checked={wantCommunity}
              onChange={e => { setWant(e.target.checked); setError(null); }}
            />
            <span>Oui — afficher mon badge dans le classement</span>
          </label>
          {wantCommunity && (
            <input
              type="text"
              placeholder="Ton pseudo (3–20 caractères)"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              className="sf-input sf-pseudo-input"
              autoFocus
            />
          )}
          {error && <p className="sf-error">{error}</p>}
          <div className="sf-row-btns">
            <button type="button" className="btn btn-ghost sf-pass" onClick={() => setStep('done')}>
              Passer
            </button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? '…' : wantCommunity ? 'Rejoindre →' : 'Continuer →'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Étape 3 : confirmation + partage ──────────────────────
  return (
    <div className={`${base} sf-panel`}>
      <div className="sf-ok">✓ C'est bon, tu seras alerté !</div>
      {refCode && (
        <div className="sf-share">
          <p className="sf-share-intro">no-spoil t'a sauvé ? Protège tes potes :</p>
          <ShareButton refCode={refCode} />
        </div>
      )}
    </div>
  );
}
