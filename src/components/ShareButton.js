'use client'
import { useState } from 'react'

export default function ShareButton({ refCode }) {
  const [copied, setCopied] = useState(false);
  const url = `https://no-spoil.fr?ref=${refCode}`;

  function copy() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function share() {
    if (navigator.share) {
      navigator.share({
        title: 'no.spoil — le sport sans spoilers',
        text:  "Je regarde les résumés de sport sans spoil grâce à no-spoil.fr — rejoins-moi !",
        url,
      }).catch(() => {});
    } else {
      copy();
    }
  }

  return (
    <div className="share-wrap">
      <div className="share-url-row">
        <span className="share-url">{url}</span>
        <button className="btn btn-ghost share-copy" onClick={copy}>
          {copied ? '✓' : 'Copier'}
        </button>
      </div>
      <button className="btn btn-accent share-main-btn" onClick={share}>
        Partager →
      </button>
    </div>
  );
}
