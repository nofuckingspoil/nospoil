// ─────────────────────────────────────────────────────────────────
//  update.js — Détection automatique des highlights officiels
//  Usage : node update.js
//  Appelé toutes les 5 min par GitHub Actions
// ─────────────────────────────────────────────────────────────────

const https = require('https');
const fs    = require('fs');

// ── Charger .env (utile en local) ────────────────────────────────
try {
  fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  });
} catch (_) {}

// ── Config par compétition ────────────────────────────────────────
const COMPETITIONS_CONFIG = {
  'giro-2026': {
    sportId:   'cyclisme',
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',
    keyword:   'giro',
    filter:    '[eé]tape',
  },
  'tdf-2026': {
    sportId:   'cyclisme',
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',
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

// ── Supabase : horodatage du dernier scan ─────────────────────────
async function updateLastScan() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return;
  try {
    await fetchAPI(`${supabaseUrl}/rest/v1/settings?key=eq.last_scan`, {
      method:  'PATCH',
      headers: {
        apikey:         serviceKey,
        Authorization:  `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn(`  ⚠️  Erreur mise à jour last_scan : ${e.message}`);
  }
}

// ── Supabase : enregistre les nouvelles vidéos + log ─────────────
async function writeToSupabase(compId, newStages) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  for (const stage of newStages) {
    try {
      // Retrouver l'id de l'étape
      const etapeRes = await fetchAPI(
        `${supabaseUrl}/rest/v1/etapes?competition_id=eq.${compId}&numero=eq.${stage.id}&select=id`,
        { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const etapes = JSON.parse(etapeRes.body);
      if (!etapes || !etapes.length) {
        console.warn(`  ⚠️  Étape ${stage.id} introuvable en base — résumé non enregistré`);
        continue;
      }

      // Insérer dans resumes (écrase si déjà présent)
      await fetchAPI(`${supabaseUrl}/rest/v1/resumes`, {
        method: 'POST',
        headers: {
          apikey:          serviceKey,
          Authorization:   `Bearer ${serviceKey}`,
          'Content-Type':  'application/json',
          Prefer:          'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ etape_id: etapes[0].id, video_id: stage.video }),
      });
      console.log(`  📦  Étape ${stage.id} → résumé enregistré en base.`);
    } catch (e) {
      console.warn(`  ⚠️  Erreur Supabase pour étape ${stage.id} : ${e.message}`);
    }
  }

  // Log de détection
  try {
    await fetchAPI(`${supabaseUrl}/rest/v1/detection_logs`, {
      method:  'POST',
      headers: {
        apikey:         serviceKey,
        Authorization:  `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competition_id: compId,
        videos_found:   newStages.length,
        message:        newStages.map(s => `Étape ${s.id}`).join(', '),
      }),
    });
  } catch (e) {
    console.warn(`  ⚠️  Erreur log Supabase : ${e.message}`);
  }
}

// ── Emails : abonnés filtrés par topic ────────────────────────────
async function getSubscribers(compId, sportId) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return [];

  const topics = ['all', sportId, compId].filter(Boolean);
  const res = await fetchAPI(
    `${supabaseUrl}/rest/v1/subscribers?unsubscribed=eq.false&topic=in.(${topics.join(',')})&select=email`,
    { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  if (res.status !== 200) throw new Error(`Supabase HTTP ${res.status}`);
  return JSON.parse(res.body) || [];
}

async function sendNotifications(newStages, compId, sportId, compName) {
  const brevoKey    = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'alerte@nospoilersports.app';
  const siteUrl     = process.env.SITE_URL || 'https://nospoil.vercel.app';

  if (!brevoKey) {
    console.log('  ℹ️  BREVO_API_KEY non défini — notifications ignorées.');
    return;
  }

  let subscribers = [];
  try {
    subscribers = await getSubscribers(compId, sportId);
  } catch (err) {
    console.warn(`  ⚠️  Impossible de récupérer les abonnés : ${err.message}`);
    return;
  }

  if (subscribers.length === 0) {
    console.log('  ℹ️  Aucun abonné pour ce topic — aucune notification.');
    return;
  }

  const name = compName || compId;

  const subject = newStages.length === 1
    ? `${name} — ${newStages[0].label} — nouveau résumé sur NoSpoil`
    : `${name} — ${newStages.length} nouvelles étapes sur NoSpoil`;

  const stagesLinks = newStages.map(s => {
    const stageUrl = `${siteUrl}?sport=${sportId}&comp=${compId}&stage=${s.id}`;
    return `<p style="margin:0.6rem 0">Sans spoiler, comme toujours, voici <strong>${s.label}</strong> :<br>
     <a href="${stageUrl}" style="color:#00E27A;font-weight:600">Regarder sur NoSpoil →</a></p>`;
  }).join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0d1a12;color:#f0ede8;padding:2rem;border-radius:12px">
      <div style="margin-bottom:1.5rem">
        <span style="font-size:0.8rem;color:#00E27A;font-weight:600;letter-spacing:0.05em">NO.SPOIL</span>
      </div>
      ${stagesLinks}
      <hr style="margin:2rem 0;border:none;border-top:1px solid #1e2e20">
      <p style="font-size:0.72rem;color:#6b7e6e;margin:0">
        Tu reçois cet email car tu t'es inscrit sur NoSpoil.<br>
        <a href="${siteUrl}/api/unsubscribe?email=EMAIL" style="color:#6b7e6e">Se désabonner</a>
      </p>
    </div>`;

  let sent = 0;
  for (const sub of subscribers) {
    const emailHtml = html.replace('EMAIL', encodeURIComponent(sub.email));
    try {
      const res = await fetchAPI('https://api.brevo.com/v3/smtp/email', {
        method:  'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender:      { name: 'NoSpoil', email: senderEmail },
          replyTo:     { email: 'nofuckingspoil@proton.me' },
          to:          [{ email: sub.email }],
          subject,
          htmlContent: emailHtml,
        }),
      });
      if (res.status === 201) sent++;
      else console.warn(`  ⚠️  Email non envoyé à ${sub.email} : HTTP ${res.status}`);
    } catch (err) {
      console.warn(`  ⚠️  Erreur envoi à ${sub.email} : ${err.message}`);
    }
  }
  console.log(`  📧  ${sent}/${subscribers.length} notification(s) envoyée(s).`);
}

// ── Parsing RSS YouTube ───────────────────────────────────────────
function parseRSS(xml) {
  return (xml.match(/<entry>([\s\S]*?)<\/entry>/g) || []).map(entry => {
    const id    = (entry.match(/<yt:videoId>([^<]+)/)    || [])[1] || '';
    const raw   = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const pub   = (entry.match(/<published>([^<]+)/)      || [])[1] || '';
    const title = raw.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
    return { id, title, date: pub ? pub.slice(0, 10) : '', published: pub };
  }).filter(v => v.id);
}

function isAccepted(title, config) {
  return title.toLowerCase().includes(config.keyword) && new RegExp(config.filter, 'i').test(title);
}

function getStageNumber(title) {
  for (const p of [/stage\s+(\d+)/, /[eé]tape\s+(\d+)/, /(\d+)[eè]?[rn]?[de]?\s+[eé]tape/]) {
    const m = title.toLowerCase().match(p);
    if (m) return parseInt(m[1]);
  }
  return null;
}

function loadData() {
  const content = fs.readFileSync('data.js', 'utf8');
  const m = content.match(/const DATA\s*=\s*(\{[\s\S]+\});?\s*$/m);
  if (!m) throw new Error('Format data.js non reconnu');
  try {
    return JSON.parse(m[1]);
  } catch (_) {
    return new Function('return (' + m[1] + ')')();
  }
}

function findCompetition(data, compId) {
  for (const sport of data.sports) {
    const comp = sport.competitions.find(c => c.id === compId);
    if (comp) return comp;
  }
  return null;
}

// ── Chargement des résumés existants depuis Supabase ─────────────
async function loadExistingResumes() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return {};
  try {
    const res = await fetchAPI(
      `${supabaseUrl}/rest/v1/etapes?select=competition_id,numero,resumes(video_id)`,
      { method: 'GET', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = JSON.parse(res.body);
    const map = {};
    (rows || []).forEach(r => {
      if (!map[r.competition_id]) map[r.competition_id] = {};
      const vid = r.resumes?.video_id;
      if (vid) map[r.competition_id][r.numero] = vid;
    });
    return map;
  } catch (e) {
    console.warn(`  ⚠️  Impossible de charger les résumés existants : ${e.message}`);
    return {};
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  Recherche de nouvelles vidéos...\n');

  await updateLastScan();

  const data            = loadData();
  const existingResumes = await loadExistingResumes();
  let   changed         = false;

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
    const existing = existingResumes[compId] || {};

    const newStages = [];
    for (const v of videos) {
      if (!isAccepted(v.title, config)) continue;
      const n = getStageNumber(v.title);
      if (!n) continue;

      if (!existing[n]) {
        console.log(`  [${compId}] Étape ${String(n).padStart(2)} → ${v.id}`);
        console.log(`           "${v.title}"`);
        newStages.push({ id: n, label: `Étape ${n}`, video: v.id, date: v.date, published: v.published });
        existing[n] = v.id; // évite les doublons dans le même run
        changed = true;
      }
    }

    if (newStages.length > 0) {
      await writeToSupabase(compId, newStages);
      await sendNotifications(newStages, compId, config.sportId, comp.label);
    }
  }

  if (!changed) {
    console.log('  Aucune nouvelle vidéo trouvée.');
    return;
  }

  console.log('\n✅  Supabase mis à jour — aucun redéploiement nécessaire.');
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
