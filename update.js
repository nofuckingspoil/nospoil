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

function fetchAPI(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(url);
    const payload = options.body ? Buffer.from(options.body, 'utf8') : null;
    const reqOptions = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   options.method || 'GET',
      headers:  Object.assign(
        payload ? { 'Content-Length': payload.length } : {},
        options.headers || {}
      ),
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function sendNotifications(newStages) {
  const supabaseUrl    = process.env.SUPABASE_URL;
  const serviceKey     = process.env.SUPABASE_SERVICE_KEY;
  const brevoKey       = process.env.BREVO_API_KEY;
  const senderEmail    = process.env.BREVO_SENDER_EMAIL || 'alerte@nospoil.app';
  const siteUrl        = process.env.SITE_URL || 'https://nospoil.vercel.app';

  if (!supabaseUrl || !serviceKey || !brevoKey) {
    console.log('  ℹ️  Variables email non définies (SUPABASE_URL/SERVICE_KEY/BREVO_API_KEY) — notifications ignorées.');
    return;
  }

  // Récupérer les abonnés actifs depuis Supabase
  let subscribers = [];
  try {
    const res = await fetchAPI(
      `${supabaseUrl}/rest/v1/subscribers?unsubscribed=eq.false&select=email`,
      {
        method:  'GET',
        headers: {
          'apikey':        serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    );
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    subscribers = JSON.parse(res.body) || [];
  } catch (err) {
    console.warn(`  ⚠️  Impossible de récupérer les abonnés : ${err.message}`);
    return;
  }

  if (subscribers.length === 0) {
    console.log('  ℹ️  Aucun abonné — aucune notification envoyée.');
    return;
  }

  // Corps HTML de l'email
  const stagesList = newStages.map(s => {
    const route = s.from ? ` · ${s.from} → ${s.to} · ${s.km} km` : '';
    return `<li><strong>${s.label}</strong>${route}</li>`;
  }).join('\n');

  const htmlTemplate = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a1714;padding:2rem">
      <h2 style="color:#e8453c;margin-bottom:0.5rem">🎬 Nouveau(x) résumé(s) sur NoSpoil</h2>
      <p style="color:#6e6860;margin-bottom:1rem">Sans spoiler, comme toujours.</p>
      <ul style="line-height:2;padding-left:1.2rem">${stagesList}</ul>
      <p style="margin-top:1.5rem">
        <a href="${siteUrl}" style="background:#e8453c;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Regarder sur NoSpoil →
        </a>
      </p>
      <hr style="margin:2rem 0;border:none;border-top:1px solid #e4dfd7">
      <p style="font-size:0.72rem;color:#9e9890">
        Tu reçois cet email car tu t'es inscrit sur NoSpoil.<br>
        <a href="${siteUrl}?unsubscribe=EMAIL" style="color:#9e9890">Se désabonner</a>
      </p>
    </div>
  `;

  // Envoyer via Brevo
  let sent = 0;
  for (const sub of subscribers) {
    const emailAddr = sub.email;
    const html      = htmlTemplate.replace('EMAIL', encodeURIComponent(emailAddr));
    try {
      const res = await fetchAPI('https://api.brevo.com/v3/smtp/email', {
        method:  'POST',
        headers: {
          'api-key':      brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender:      { name: 'NoSpoil', email: senderEmail },
          to:          [{ email: emailAddr }],
          subject:     '🎬 Nouveau(x) résumé(s) disponible(s) sur NoSpoil',
          htmlContent: html,
        }),
      });
      if (res.status === 201) {
        sent++;
      } else {
        console.warn(`  ⚠️  Email non envoyé à ${emailAddr} : HTTP ${res.status} — ${res.body}`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Erreur envoi à ${emailAddr} : ${err.message}`);
    }
  }

  console.log(`  📧  ${sent}/${subscribers.length} notification(s) envoyée(s).`);
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
    return { id, title, date, published: pub };
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

  const data      = loadData();
  let changed     = false;
  const newStages = [];

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
        byNum[n] = { id: n, label: `Étape ${n}`, date: v.date, published: v.published, video: v.id };
        console.log(`  [${compId}] Étape ${String(n).padStart(2)} → ${v.id} (${v.date})`);
        console.log(`           "${v.title}"`);
        newStages.push(byNum[n]);
        changed = true;
      } else if (byNum[n].video !== v.id) {
        byNum[n].video = v.id;
        if (!byNum[n].date)      byNum[n].date      = v.date;
        if (!byNum[n].published) byNum[n].published = v.published;
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

  // Envoyer les notifications uniquement pour les nouvelles étapes
  if (newStages.length > 0) {
    await sendNotifications(newStages);
  }
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
