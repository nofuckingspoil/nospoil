// ============================================================
//  D'où vient ce visiteur ?
//
//  Retenu à la première page vue, dans le navigateur seulement, pour 30
//  jours : la campagne (étiquettes utm_ des liens de pub), sinon le site qui
//  a envoyé ici (Google, Instagram…), sinon « direct ». Rien ne part au
//  serveur tant que la personne ne lance pas un essai : c'est alors l'essai
//  qui emporte sa provenance (voir src/app/essai/route.js).
//
//  Le premier contact gagne : quelqu'un arrivé par une pub Instagram, revenu
//  trois jours plus tard en tapant l'adresse, reste « instagram ». C'est la
//  pub qui l'a fait venir.
// ============================================================
const CLE = 'ttf_provenance'
const DUREE = 30 * 24 * 60 * 60 * 1000

// Les noms qu'on lit dans les journaux de référents, ramenés à un mot.
const SITES = [
  [/(^|\.)google\./, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)qwant\.com$/, 'qwant'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook'],
  [/(^|\.)pinterest\./, 'pinterest'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'x'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)chatgpt\.com$/, 'chatgpt'],
]

function nomDuSite(hote) {
  const h = hote.replace(/^www\./, '').toLowerCase()
  const trouve = SITES.find(([motif]) => motif.test(h))
  return trouve ? trouve[1] : h
}

/** À appeler à chaque page : ne fait quelque chose qu'à la première. */
export function retenirProvenance() {
  try {
    const deja = JSON.parse(localStorage.getItem(CLE) || 'null')
    if (deja && Date.now() - deja.at < DUREE) return

    const url = new URL(window.location.href)
    const q = url.searchParams
    let source = q.get('utm_source') || ''
    let medium = q.get('utm_medium') || ''
    const campagne = q.get('utm_campaign') || ''
    // Les clics de pub sans étiquettes se reconnaissent à leur identifiant.
    if (!source && q.get('fbclid')) { source = 'facebook'; medium = medium || 'clic' }
    if (!source && q.get('gclid')) { source = 'google'; medium = medium || 'pub' }
    if (!source && document.referrer) {
      try {
        const ref = new URL(document.referrer)
        if (ref.host !== url.host) { source = nomDuSite(ref.host); medium = medium || 'lien' }
      } catch {}
    }

    localStorage.setItem(CLE, JSON.stringify({
      s: (source || 'direct').slice(0, 80),
      m: medium.slice(0, 80),
      c: campagne.slice(0, 120),
      p: url.pathname.slice(0, 200),
      at: Date.now(),
    }))
  } catch {}
}

/** Les paramètres à ajouter au lien de l'essai : « s=google&m=lien&p=/ ». */
export function parametresProvenance() {
  try {
    const p = JSON.parse(localStorage.getItem(CLE) || 'null')
    if (!p) return ''
    const q = new URLSearchParams()
    if (p.s) q.set('s', p.s)
    if (p.m) q.set('m', p.m)
    if (p.c) q.set('c', p.c)
    if (p.p) q.set('p', p.p)
    return q.toString()
  } catch {
    return ''
  }
}

/** La provenance retenue, telle quelle : { s, m, c, p } ou null. */
export function lireProvenance() {
  try { return JSON.parse(localStorage.getItem(CLE) || 'null') } catch { return null }
}
