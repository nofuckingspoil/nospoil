'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wordmark } from './Brand'

// ───────────────────────────────────────── HOW IT WORKS
export function HowItWorks() {
  const steps = [
    { n: '01', t: 'Tu choisis ton sport.', d: "Cyclisme, tennis, foot, il y en a pour tous les goûts.", icon: '🏁' },
    { n: '02', t: "Tu sélectionnes ton étape/match.", d: "Pas de titre, pas de miniature, pas de \"vous avez aimé… vous adorerez\". Juste le nom de l'événement.", icon: '👀' },
    { n: '03', t: 'Tu regardes, peinard.', d: "Pas de spoil, juste des émotions et du suspens, comme si tu y étais !", icon: '☕' },
  ];
  return (
    <section className="section section-tinted" id="how">
      <div className="container">
        <div className="section-head">
          <div>
            <h2 className="h2">Trois clics. Zéro spoil.</h2>
          </div>
        </div>
        <div className="how-grid">
          {steps.map(s => (
            <div key={s.n} className="how-card">
              <div className="how-top">
                <span className="how-n">{s.n}</span>
                <span className="how-icon">{s.icon}</span>
              </div>
              <div className="how-t">{s.t}</div>
              <div className="how-d">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="bot-note">
          <div className="bot-icon">🤖</div>
          <div>
            <div className="bot-title">Et derrière, un petit robot.</div>
            <div className="bot-text">Toutes les 5 minutes, on scanne les meilleures chaînes de sport. Dès qu&apos;un résumé sort, il apparaît ici — et un mail part aux abonnés. Tu n&apos;as littéralement rien à faire.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────── EMAIL CTA BAND
export function EmailBand({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    onSubscribe(email);
    setDone(true);
    setEmail('');
    setTimeout(() => setDone(false), 5000);
  };
  return (
    <section className="section email-band" id="email">
      <div className="container email-inner">
        <div className="email-left">
          <h2 className="h2 h2-light">Reçois un mail dès qu&apos;un résumé est dispo.</h2>
          <p className="email-lede">
            Le mail dit juste « <strong>Étape X dispo, lien ici</strong> ». Pas d&apos;objet qui spoile.<br />
            Pas de pub. Pas de tracking. Désinscription en un clic.
          </p>
        </div>
        <form className="email-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="ton@email.fr"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-accent btn-lg">
            {done ? '✓ Inscrit, merci' : "M'inscrire →"}
          </button>
          <div className="email-tiny">Hébergé en 🇫🇷. RGPD. Tes infos restent ici.</div>
        </form>
      </div>
    </section>
  );
}

// ───────────────────────────────────────── FAQ
export function FAQ() {
  const items = [
    {
      q: "C'est vraiment gratuit ?",
      a: "Oui. Aucun pixel d'écran n'est vendu, aucune pub, aucun affiliate. Si un jour ça change, je préviens d'abord — pas l'inverse.",
    },
    {
      q: 'Comment vous empêchez YouTube de spoiler ?',
      a: "L'iframe est en mode \"nocookie\", sans miniature, sans titre, sans recommandations, sans bouton de partage. Le lecteur est encapsulé dans une bulle qui masque tout le reste avant et après la lecture. La barre d'URL ne contient même pas le titre de l'étape.",
    },
    {
      q: "L'email aussi est anti-spoil ?",
      a: "Oui. L'objet, c'est « Étape 17 dispo ». Pas de classement, pas de nom de coureur. Juste un lien.",
    },
    {
      q: 'Et si je veux savoir le numéro mais pas le reste ?',
      a: "C'est exactement comme ça que c'est fait. La liste te dit le numéro, le départ, l'arrivée, la distance, le type d'étape, la date. Rien d'autre.",
    },
    {
      q: "Quand est-ce que Roland Garros / la Coupe du Monde arrivent ?",
      a: "Roland Garros : pour l'édition en cours, dès que je trouve un canal de résumés fiable. Coupe du Monde : avant le coup d'envoi du 11 juin. Le robot est déjà prêt.",
    },
    {
      q: 'Vous stockez quoi sur moi ?',
      a: "Ton email. C'est tout. Pas de cookies de tracking, pas d'analytics tiers, pas de fingerprinting.",
    },
    {
      q: 'Comment je propose un nouveau sport ?',
      a: "En bas de page, Twitter ou nofuckingspoil@proton.me. Plus la demande est précise (chaîne YouTube source, format des résumés), plus vite ça arrive.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container faq-inner">
        <div className="section-head">
          <div>
            <p className="eyebrow">04 — FAQ</p>
            <h2 className="h2">Les questions qu&apos;on me pose.</h2>
          </div>
        </div>
        <div className="faq-list">
          {items.map((it, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{it.q}</span>
                <span className="faq-toggle">{open === i ? '–' : '+'}</span>
              </button>
              {open === i && <div className="faq-a">{it.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────── STATS
export function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="container stats-inner">
        <div className="stat-block">
          <div className="stat-big">+4 127</div>
          <div className="stat-lbl">abonnés au mail</div>
        </div>
        <div className="stat-block">
          <div className="stat-big">+38 419</div>
          <div className="stat-lbl">résumés servis sans spoil</div>
        </div>
        <div className="stat-block">
          <div className="stat-big">100 %</div>
          <div className="stat-lbl">indépendant — pas de pub</div>
        </div>
        <div className="stat-block">
          <div className="stat-big">5 min</div>
          <div className="stat-lbl">délai max après publication YouTube</div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────── FEEDBACK
export function Feedback() {
  return (
    <section className="section feedback-section" id="feedback">
      <div className="container">
        <div className="feedback-card">
          <div className="feedback-left">
            <p className="eyebrow">05 — On parle ?</p>
            <h2 className="h2">T&apos;as une idée. Un bug. Un sport à ajouter. Dis-moi.</h2>
            <p className="feedback-lede">
              no.spoil est fait par <strong>une personne</strong>. Pas de support de niveau 3, pas de bot. Tu m&apos;écris, je te réponds (souvent le jour même).
            </p>
            <div className="feedback-channels">
              <a className="ch-card ch-mail" href="mailto:nofuckingspoil@proton.me?subject=no.spoil%20—%20feedback">
                <div className="ch-icon">✉️</div>
                <div className="ch-body">
                  <div className="ch-t">Email direct</div>
                  <div className="ch-v">nofuckingspoil@proton.me</div>
                </div>
                <div className="ch-arr">→</div>
              </a>
              <a className="ch-card ch-tw" href="https://twitter.com/nofuckingspoil" target="_blank" rel="noreferrer">
                <div className="ch-icon">𝕏</div>
                <div className="ch-body">
                  <div className="ch-t">Twitter / X</div>
                  <div className="ch-v">@nofuckingspoil — DMs ouverts</div>
                </div>
                <div className="ch-arr">→</div>
              </a>
            </div>
            <p className="feedback-tiny">
              Réponses moyennes en moins de 4 h les jours d&apos;étape. Promesse de fan, pas de SLA.
            </p>
          </div>
          <div className="feedback-right">
            <div className="quote-card">
              <div className="quote-mark">&quot;</div>
              <div className="quote-text">
                « J&apos;ai créé ce site parce que je suis arrivé chez moi, fatigué, j&apos;ai ouvert YouTube pour le résumé de l&apos;étape, et la première vignette m&apos;a balancé qui avait gagné. Plus jamais. »
              </div>
              <div className="quote-sig">— le mec derrière no.spoil</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────────────────── FOOTER
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Wordmark size={36} white />
            <p className="footer-tag">Le sport, sans savoir.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <div className="footer-col-t">Sports</div>
              <a>Cyclisme</a>
              <a className="muted">Roland Garros — bientôt</a>
              <a className="muted">Coupe du Monde — bientôt</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-t">Le projet</div>
              <a href="#how">Comment ça marche</a>
              <a href="#faq">FAQ</a>
              <a href="#feedback">Feedback</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-t">Contact</div>
              <a href="mailto:nofuckingspoil@proton.me">nofuckingspoil@proton.me</a>
              <a href="https://twitter.com/nofuckingspoil" target="_blank" rel="noreferrer">𝕏 @nofuckingspoil</a>
            </div>
          </div>
        </div>
        <div className="footer-mark">
          <div className="footer-mega">NO.SPOIL</div>
          <div className="footer-meta">
            <span>© 2026 · Fait avec ☕ et beaucoup de patience à Paris</span>
            <span className="footer-meta-sep">·</span>
            <span>Mentions légales</span>
            <span className="footer-meta-sep">·</span>
            <span>RGPD</span>
            <span className="footer-meta-sep">·</span>
            <span>Pas affilié à Eurosport, l&apos;UCI, le Giro, l&apos;ATP ou la FIFA.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Floating feedback button
export function FloatingFeedback() {
  const router = useRouter()
  return (
    <button className="float-feedback" onClick={() => router.push('/#feedback')} aria-label="Feedback">
      <span className="float-icon">💬</span>
      <span className="float-label">Feedback</span>
    </button>
  );
}
