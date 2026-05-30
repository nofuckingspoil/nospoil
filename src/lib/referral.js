const REF_KEY = 'nospoil_ref';
const REF_TTL = 30 * 24 * 60 * 60 * 1000; // 30 jours

export function captureRefFromUrl() {
  if (typeof window === 'undefined') return;
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (!ref) return;
  try {
    localStorage.setItem(REF_KEY, JSON.stringify({
      code: ref.toUpperCase().trim(),
      expires: Date.now() + REF_TTL,
    }));
  } catch {}
}

export function getStoredRef() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const { code, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(REF_KEY); return null; }
    return code;
  } catch { return null; }
}

export function clearStoredRef() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(REF_KEY); } catch {}
  }
}

export async function getFingerprint() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      new Date().getTimezoneOffset(),
    ].join('|');
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    }
    let h = 0;
    for (const c of raw) { h = Math.imul(31, h) + c.charCodeAt(0) | 0; }
    return Math.abs(h).toString(36);
  } catch { return null; }
}
