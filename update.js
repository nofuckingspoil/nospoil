// ─────────────────────────────────────────────────────────────────
//  update.js — Détection automatique des highlights officiels
//  Usage : node update.js
//  Requires : Node.js 14+  (aucune dépendance npm)
// ─────────────────────────────────────────────────────────────────

const https = require('https');
const fs    = require('fs');

// ── Config par compétition ────────────────────────────────────────

const COMPETITIONS_CONFIG = {
  'giro-2026': {
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',  // Eurosport France
    keyword:   'giro',
    filter:    '[eé]tape',
  },
  'tdf-2026': {
    channelId: 'UCqCarplmFBfhFhBFGFGQJzA',   // Eurosport France (même chaîne)
    keyword:   'tour de france',
    filter:    '[eé]tape',
  },
};

// ─────────────────────────────────────────────────────────────────

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => resolve(data));
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  return entries.map(entry => {
    const id    = (entry.match(/<yt:videoId>([^<]+)/)    || [])[1] || '';
    const raw   = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const pub   = (entry.match(/<published>([^<]+)/)      || [])[1] || '';
    const title = raw
      .replace(/&amp;/g,  '&')
      .replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g,  "'");
    const date  = pub ? pub.substring(0, 10) : '';
    return { id, title, date };
  }).filter(v => v.id);
}

function isAccepted(title, config) {
  const t = title.toLowerCase();
  return t.includes(config.keyword) && new RegExp(config.filter, 'i').test(t);
}

function getStageNumber(title) {
  const t = title.toLowerCase();
  const patterns = [
    /stage\s+(\d+)/,
    /[eé]tape\s+(\d+)/,
    /(\d+)[eè]?[rn]?[de]?\s+[eé]tape/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) return parseInt(m[1]);
  }
  return null;
}

function loadData() {
  try {
    const content = fs.readFileSync('data.js', 'utf8');
    const m = content.match(/const DATA\s*=\s*(\{[\s\S]*?\});\s*$/m);
    if (m) return JSON.parse(m[1]);
  } catch (_) {}
  return { sports: [] };
}

function findCompetition(data, compId) {
  for (const sport of data.sports) {
    const comp = sport.competitions.find(c => c.id === compId);
    if (comp) return comp;
  }
  return null;
}

async function main() {
  console.log('🔍  Recherche de nouvelles vidéos...\n');

  const data  = loadData();
  let changed = false;

  for (const [compId, config] of Object.entries(COMPETITIONS_CONFIG)) {
    const comp = findCompetition(data, compId);
    if (!comp) continue;

    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${config.channelId}`;
    let xml;
    try {
      xml = await fetchText(url);
    } catch (err) {
      console.warn(`  ⚠️  ${compId} inaccessible : ${err.message}`);
      continue;
    }

    const videos  = parseRSS(xml);
    const byNum   = {};
    comp.stages.forEach(s => { byNum[s.id] = s; });

    for (const v of videos) {
      if (!isAccepted(v.title, config)) continue;
      const n = getStageNumber(v.title);
      if (!n) continue;

      if (!byNum[n]) {
        byNum[n] = { id: n, label: `Étape ${n}`, date: v.date, video: v.id };
        console.log(`  [${compId}] Étape ${String(n).padStart(2)} → ${v.id} (${v.date})`);
        console.log(`           "${v.title}"`);
        changed = true;
      } else if (byNum[n].video !== v.id) {
        byNum[n].video = v.id;
        if (!byNum[n].date) byNum[n].date = v.date;
        changed = true;
      }
    }

    comp.stages = Object.values(byNum).sort((a, b) => a.id - b.id);
  }

  if (!changed) {
    console.log('  Aucune nouvelle vidéo trouvée.');
    return;
  }

  const output = [
    `// Mis à jour automatiquement — ${new Date().toLocaleString('fr-FR')}`,
    `const DATA = ${JSON.stringify(data, null, 2)};`,
  ].join('\n');

  fs.writeFileSync('data.js', output, 'utf8');
  console.log('\n✅  data.js mis à jour.');
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
