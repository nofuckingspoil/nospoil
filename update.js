// ─────────────────────────────────────────────────────────────────
//  update.js — Détection automatique des highlights officiels
//  Usage : node update.js
//  Requires : Node.js 14+  (aucune dépendance npm)
// ─────────────────────────────────────────────────────────────────

const https = require('https');
const fs    = require('fs');

// ── Config — seul endroit à toucher ──────────────────────────────

const CHANNELS = {
  fr: 'UCozt5iXNqmhU1I7tcjJ0UFQ',  // Eurosport France (@EurosportFrance)
  en: 'UCe10BxbsFg9Kbmkg-ean_Dg',  // Giro d'Italia officiel
};

// Le script ne retient que les vidéos qui contiennent ce mot dans le titre
const RACE_KEYWORD = 'giro';

// Types de vidéos acceptés pour la chaîne EN (Giro officiel)
const ACCEPTED_TYPES_EN = ['highlights', 'giro express'];

// Mots à éviter pour la chaîne EN (live, interviews, shorts...)
const IGNORED_TYPES_EN  = ['live', 'preview', 'the route', 'last km', 'interview', '#giro'];

// Pour Eurosport FR : on prend tout ce qui contient "étape" dans le titre
const FR_STAGE_FILTER   = '[eé]tape';

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
    const id  = (entry.match(/<yt:videoId>([^<]+)/)    || [])[1] || '';
    const raw = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const title = raw
      .replace(/&amp;/g,  '&')
      .replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g,  "'");
    return { id, title };
  }).filter(v => v.id);
}

function isAcceptedFR(title) {
  const t = title.toLowerCase();
  return t.includes(RACE_KEYWORD) && new RegExp(FR_STAGE_FILTER).test(t);
}

function isAcceptedEN(title) {
  const t = title.toLowerCase();
  return t.includes(RACE_KEYWORD)
    && ACCEPTED_TYPES_EN.some(k => t.includes(k))
    && !IGNORED_TYPES_EN.some(k => t.includes(k));
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

function loadExistingStages() {
  try {
    const content = fs.readFileSync('data.js', 'utf8');
    const m = content.match(/const STAGES\s*=\s*(\[[\s\S]*?\]);/);
    if (m) return JSON.parse(m[1]);
  } catch (_) {}
  return [];
}

async function main() {
  console.log('🔍  Recherche de nouvelles vidéos Giro...\n');

  const found = { fr: {}, en: {} };

  for (const [lang, channelId] of Object.entries(CHANNELS)) {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    let xml;
    try {
      xml = await fetchText(url);
    } catch (err) {
      console.warn(`  ⚠️  Chaîne ${lang.toUpperCase()} inaccessible : ${err.message}`);
      continue;
    }

    const videos = parseRSS(xml);
    const accept = lang === 'fr' ? isAcceptedFR : isAcceptedEN;

    for (const v of videos) {
      if (!accept(v.title)) continue;
      const n = getStageNumber(v.title);
      if (!n || found[lang][n]) continue;
      found[lang][n] = v.id;
      console.log(`  [${lang.toUpperCase()}] Étape ${String(n).padStart(2)} → ${v.id}`);
      console.log(`           "${v.title}"`);
    }
  }

  const allNums = [...new Set([
    ...Object.keys(found.fr).map(Number),
    ...Object.keys(found.en).map(Number),
  ])];

  if (allNums.length === 0) {
    console.log('  Aucune vidéo trouvée pour le moment.');
    return;
  }

  const existing = loadExistingStages();
  const byNum = {};
  existing.forEach(s => { byNum[s.etape] = s; });

  let added = 0;
  for (const n of allNums) {
    if (!byNum[n]) {
      byNum[n] = {
        etape: n,
        label: `Étape ${n}`,
        videos: {
          fr: found.fr[n] || found.en[n] || '',
          en: found.en[n] || found.fr[n] || '',
        }
      };
      added++;
    } else {
      if (found.fr[n]) byNum[n].videos.fr = found.fr[n];
      if (found.en[n]) byNum[n].videos.en = found.en[n];
    }
  }

  const stages = Object.values(byNum).sort((a, b) => a.etape - b.etape);

  const output = [
    `// Mis à jour automatiquement — ${new Date().toLocaleString('fr-FR')}`,
    `// FR : Eurosport France | EN : Giro officiel | Changer de course : RACE_KEYWORD`,
    ``,
    `const STAGES = ${JSON.stringify(stages, null, 2)};`,
  ].join('\n');

  fs.writeFileSync('data.js', output, 'utf8');
  console.log(`\n✅  data.js mis à jour — ${added} nouvelle(s) étape(s) sur ${stages.length} au total.`);
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
