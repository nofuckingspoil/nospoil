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
    // Accepte "étape" (FR) ET "stage" (EN) — les highlights officiels sont souvent en anglais
    filter:    '[eé]tape|\\bstage\\b',
    // Mots qui signalent un preview/présentation → rejeter
    exclude:   ['preview', 'percorso', 'parcours', 'présentation', 'presentation', 'stage route', 'route stage'],
    // Mots qui signalent un vrai résumé → priorité haute
    prefer:    ['highlights', 'résumé', 'resume', 'finish', 'arrivée'],
  },
  'tdf-2026': {
    sportId:   'cyclisme',
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',
    keyword:   'tour de france',
    filter:    '[eé]tape|\\bstage\\b',
    exclude:   ['preview', 'parcours', 'présentation', 'presentation', 'stage route'],
    prefer:    ['highlights', 'résumé', 'resume', 'finish', 'arrivée'],
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
    const stageUrl = `${siteUrl}/cyclisme/${compId}?stage=${s.id}`;
    return `<p style="margin:0.6rem 0">Sans spoiler, comme toujours, voici <strong>${s.label}</strong> :<br>
     <a href="${stageUrl}" style="color:#00E27A;font-weight:600">Regarder sur no-spoil.fr →</a></p>`;
  }).join('\n');

  const stagesText = newStages.map(s => {
    const stageUrl = `${siteUrl}/cyclisme/${compId}?stage=${s.id}`;
    return `${s.label} dispo — ${stageUrl}`;
  }).join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0d1a12;color:#f0ede8;padding:2rem;border-radius:12px">
      <div style="margin-bottom:1.5rem">
        <span style="font-size:0.8rem;color:#00E27A;font-weight:600;letter-spacing:0.05em">NO.SPOIL</span>
      </div>
      ${stagesLinks}
      <hr style="margin:2rem 0;border:none;border-top:1px solid #1e2e20">
      <p style="font-size:0.72rem;color:#6b7e6e;margin:0">
        Tu reçois cet email car tu t'es inscrit sur no-spoil.fr.<br>
        <a href="${siteUrl}/api/unsubscribe?email=EMAIL" style="color:#6b7e6e">Se désabonner</a>
      </p>
    </div>`;

  const replyEmail = process.env.REPLY_TO_EMAIL || 'contact@no-spoil.fr';

  let sent = 0;
  for (const sub of subscribers) {
    const emailHtml = html.replace('EMAIL', encodeURIComponent(sub.email));
    const emailText = `NO.SPOIL\n\n${stagesText}\n\nTu reçois cet email car tu t'es inscrit sur no-spoil.fr.\nSe désabonner : ${siteUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
    try {
      const res = await fetchAPI('https://api.brevo.com/v3/smtp/email', {
        method:  'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender:      { name: 'no-spoil.fr', email: senderEmail },
          replyTo:     { email: replyEmail },
          to:          [{ email: sub.email }],
          subject,
          htmlContent: emailHtml,
          textContent: emailText,
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
  const lower = title.toLowerCase();
  if (!lower.includes(config.keyword)) return false;
  if (!new RegExp(config.filter, 'i').test(title)) return false;
  if (config.exclude) {
    for (const ex of config.exclude) {
      if (lower.includes(ex.toLowerCase())) return false;
    }
  }
  return true;
}

function scoreVideo(title, config) {
  const lower = title.toLowerCase();
  let score = 0;
  if (config.prefer) {
    for (const p of config.prefer) {
      if (lower.includes(p.toLowerCase())) score += 2;
    }
  }
  return score;
}

function getStageDate(comp, stageNum) {
  if (!comp || !comp.stages) return null;
  const stage = comp.stages.find(s => s.id === stageNum);
  return stage ? stage.date : null;
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

// ═══════════════════════════════════════════════════════════════════
//  TENNIS — Config
// ═══════════════════════════════════════════════════════════════════

const FRANCE_TV_CHANNEL_ID = 'UCRm-DLbhzojKd10edotYxMg';

const TENNIS_COMPS = [
  { id: 'rg2026-h', rgCode: 'SM', sportId: 'tennis', label: 'Roland Garros 2026 — Simple Hommes' },
  { id: 'rg2026-f', rgCode: 'SD', sportId: 'tennis', label: 'Roland Garros 2026 — Simple Dames' },
];

// Tour → numéro dans l'URL RG, préfixe de numéro Supabase, total de matchs
const ROUND_CONFIG = [
  { round: '1er tour',        urlNum: 1, prefix: 101, total: 64 },
  { round: '2ème tour',       urlNum: 2, prefix: 201, total: 32 },
  { round: '3ème tour',       urlNum: 3, prefix: 301, total: 16 },
  { round: '4ème tour',       urlNum: 4, prefix: 401, total: 8  },
  { round: 'Quart de finale', urlNum: 5, prefix: 501, total: 4  },
  { round: 'Demi-finale',     urlNum: 6, prefix: 601, total: 2  },
  { round: 'Finale',          urlNum: 7, prefix: 701, total: 1  },
];

// ── Gemini Flash ──────────────────────────────────────────────────
function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents:         [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path:     `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = parsed.candidates[0].content.parts[0].text;
          resolve(text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim());
        } catch (e) { reject(new Error(`Gemini invalide: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Fetch via Jina.ai (rendu JS) ─────────────────────────────────
function fetchJina(url) {
  return new Promise((resolve, reject) => {
    https.get(`https://r.jina.ai/${url}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJina(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ── Charge les matchs tennis depuis Supabase ──────────────────────
async function loadTennisMatches(supabaseUrl, serviceKey, compId) {
  const res = await fetchAPI(
    `${supabaseUrl}/rest/v1/etapes?competition_id=eq.${compId}&select=id,numero,depart,arrivee,type,resumes(video_id)&order=numero`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  return JSON.parse(res.body) || [];
}

// ── Extrait le nom de famille d'une entrée "P. Nom" ou "P.Q. Nom-Composé" ─
function extractLastName(playerStr) {
  // "J.M. Cerundolo" → "Cerundolo", "F. Auger-Aliassime" → "Auger-Aliassime"
  const parts = playerStr.trim().split(/\s+/);
  return parts[parts.length - 1].toLowerCase();
}

// ── Identifie un match par noms de famille dans le titre (rapide, sans IA) ─
function matchByLastName(videoTitle, candidates) {
  const titleLower = videoTitle.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, ''); // strip accents

  const scored = candidates.map(m => {
    const ln1 = extractLastName(m.depart).normalize('NFD').replace(/[̀-ͯ]/g, '');
    const ln2 = extractLastName(m.arrivee).normalize('NFD').replace(/[̀-ͯ]/g, '');
    const found1 = titleLower.includes(ln1);
    const found2 = titleLower.includes(ln2);
    return { m, score: (found1 ? 1 : 0) + (found2 ? 1 : 0) };
  }).filter(x => x.score === 2); // les deux noms doivent être dans le titre

  if (scored.length === 1) return scored[0].m.numero; // match unique → confiant
  return null;
}

// ── Identifie quel match correspond à un titre YouTube ────────────
// Essaie d'abord par nom (gratuit), puis Gemini en fallback
async function identifyTennisMatch(apiKey, videoTitle, candidates) {
  // 1. Tentative rapide par noms de famille
  const byName = matchByLastName(videoTitle, candidates);
  if (byName) return byName;

  // 2. Fallback Gemini (seulement si nécessaire)
  if (!apiKey) return null;
  const matchList = candidates.map(m =>
    `${m.numero} | ${m.depart} vs ${m.arrivee} | ${m.type}`
  ).join('\n');

  const prompt = `Un résumé de match Roland Garros 2026 vient d'être publié par France TV Sport sur YouTube.
Titre de la vidéo : "${videoTitle}"

Matchs en base sans résumé (numero | Joueur1 vs Joueur2 | Tour) :
${matchList}

Quel numéro de match correspond à cette vidéo ?
Réponds UNIQUEMENT avec le numéro entier (ex: 312), ou null si tu n'es pas certain.`;

  try {
    // Petite pause pour respecter le quota Gemini
    await new Promise(r => setTimeout(r, 2000));
    const raw = await callGemini(apiKey, prompt);
    const n = parseInt(raw.trim());
    return isNaN(n) ? null : n;
  } catch (e) {
    console.warn(`  ⚠️  Gemini identification échouée : ${e.message}`);
    return null;
  }
}

// ── Enregistre une vidéo tennis dans resumes ──────────────────────
async function writeTennisVideo(supabaseUrl, serviceKey, etapeDbId, videoId, compId, matchNum) {
  await fetchAPI(`${supabaseUrl}/rest/v1/resumes`, {
    method:  'POST',
    headers: {
      apikey:         serviceKey,
      Authorization:  `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer:         'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ etape_id: etapeDbId, video_id: videoId }),
  });
  await fetchAPI(`${supabaseUrl}/rest/v1/detection_logs`, {
    method:  'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ competition_id: compId, videos_found: 1, message: `Match ${matchNum}` }),
  });
}

// ── Emails tennis ─────────────────────────────────────────────────
async function sendTennisNotifications(matches, compId, sportId, compName) {
  const brevoKey    = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'alerte@nospoilersports.app';
  const replyEmail  = process.env.REPLY_TO_EMAIL || 'contact@no-spoil.fr';
  const siteUrl     = process.env.SITE_URL || 'https://nospoil.vercel.app';
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!brevoKey || !supabaseUrl || !serviceKey) return;

  let subscribers = [];
  try {
    const topics = ['all', sportId, compId].filter(Boolean);
    const res = await fetchAPI(
      `${supabaseUrl}/rest/v1/subscribers?unsubscribed=eq.false&topic=in.(${topics.join(',')})&select=email`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    subscribers = JSON.parse(res.body) || [];
  } catch (e) { return; }
  if (!subscribers.length) { console.log('  ℹ️  Aucun abonné tennis — skip.'); return; }

  const subject = matches.length === 1
    ? `${compName} — ${matches[0].depart} vs ${matches[0].arrivee} — résumé sur NoSpoil`
    : `${compName} — ${matches.length} nouveaux résumés disponibles`;

  const links = matches.map(m =>
    `<p style="margin:0.6rem 0">Sans spoiler, voici <strong>${m.depart} vs ${m.arrivee}</strong> (${m.type}) :<br>
     <a href="${siteUrl}/tennis/${compId}" style="color:#00E27A;font-weight:600">Regarder sur no-spoil.fr →</a></p>`
  ).join('\n');

  const html = `<div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0d1a12;color:#f0ede8;padding:2rem;border-radius:12px">
    <div style="margin-bottom:1.5rem"><span style="font-size:0.8rem;color:#00E27A;font-weight:600;letter-spacing:0.05em">NO.SPOIL 🎾</span></div>
    ${links}
    <hr style="margin:2rem 0;border:none;border-top:1px solid #1e2e20">
    <p style="font-size:0.72rem;color:#6b7e6e;margin:0">Tu reçois cet email car tu t'es inscrit sur no-spoil.fr.<br>
    <a href="${siteUrl}/api/unsubscribe?email=EMAIL" style="color:#6b7e6e">Se désabonner</a></p>
  </div>`;

  let sent = 0;
  for (const sub of subscribers) {
    try {
      const res = await fetchAPI('https://api.brevo.com/v3/smtp/email', {
        method:  'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender:      { name: 'no-spoil.fr', email: senderEmail },
          replyTo:     { email: replyEmail },
          to:          [{ email: sub.email }],
          subject,
          htmlContent: html.replace('EMAIL', encodeURIComponent(sub.email)),
          textContent: `NO.SPOIL\n${matches.map(m => `${m.depart} vs ${m.arrivee} — ${siteUrl}/tennis/${compId}`).join('\n')}\nSe désabonner : ${siteUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`,
        }),
      });
      if (res.status === 201) sent++;
    } catch (e) { /* silent */ }
  }
  console.log(`  📧  ${sent}/${subscribers.length} notification(s) tennis envoyée(s).`);
}

// ── Extrait les matchs d'un tour depuis une page RG (via Gemini) ──
async function extractBracketRound(apiKey, content, roundName) {
  const prompt = `Extrait les matchs du "${roundName}" de Roland Garros 2026 depuis ce contenu de page web.
Réponds UNIQUEMENT avec un tableau JSON ([] si le tour n'est pas visible ou pas encore joué) :
[{"joueur1": "Prénom Nom", "joueur2": "Prénom Nom", "date": "YYYY-MM-DD"}]
N'inclus que les matchs où les deux joueurs sont identifiés (pas TBD / À déterminer).
Contenu :
${content.slice(0, 40000)}`;

  try {
    const raw = await callGemini(apiKey, prompt);
    const matches = JSON.parse(raw);
    if (!Array.isArray(matches)) return [];
    return matches.filter(m => m.joueur1 && m.joueur2 && !m.joueur1.includes('TBD') && !m.joueur2.includes('TBD'));
  } catch (e) { return []; }
}

// ── Vérifie et met à jour le tableau tennis (toutes les heures) ───
async function updateTennisBracket() {
  const apiKey      = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!apiKey || !supabaseUrl || !serviceKey) return;

  // Limiter à 1 vérification par heure
  try {
    const res = await fetchAPI(
      `${supabaseUrl}/rest/v1/settings?key=eq.last_bracket_update&select=value`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const rows = JSON.parse(res.body);
    if (rows?.length && rows[0].value) {
      const diffMin = (Date.now() - new Date(rows[0].value)) / 60000;
      if (diffMin < 60) {
        console.log(`  🎾  Tableau déjà vérifié il y a ${Math.round(diffMin)}min — skip.`);
        return;
      }
    }
  } catch (e) { /* première exécution */ }

  // Horodater
  try {
    await fetchAPI(`${supabaseUrl}/rest/v1/settings`, {
      method:  'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body:    JSON.stringify({ key: 'last_bracket_update', value: new Date().toISOString(), updated_at: new Date().toISOString() }),
    });
  } catch (e) { /* ignore */ }

  console.log('\n🎾  Vérification du tableau Roland Garros...\n');

  for (const comp of TENNIS_COMPS) {
    const etapesRes = await fetchAPI(
      `${supabaseUrl}/rest/v1/etapes?competition_id=eq.${comp.id}&select=numero,type&order=numero`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const existing = JSON.parse(etapesRes.body) || [];
    const countByRound = {};
    existing.forEach(e => { countByRound[e.type] = (countByRound[e.type] || 0) + 1; });

    let anyNew = false;

    for (const rc of ROUND_CONFIG) {
      const current = countByRound[rc.round] || 0;
      if (current >= rc.total) continue; // tour complet

      const url = `https://www.rolandgarros.com/fr-fr/results/${comp.rgCode}?round=${rc.urlNum}`;
      let content;
      try {
        content = await fetchJina(url);
        if (!content || content.length < 500) continue;
      } catch (e) { continue; }

      const matches = await extractBracketRound(apiKey, content, rc.round);
      const toInsert = matches.slice(current);
      if (!toInsert.length) continue;

      for (let i = 0; i < toInsert.length; i++) {
        const m = toInsert[i];
        const numero = rc.prefix + current + i;
        try {
          await fetchAPI(`${supabaseUrl}/rest/v1/etapes`, {
            method:  'POST',
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body:    JSON.stringify({ competition_id: comp.id, numero, date: m.date || null, depart: m.joueur1, arrivee: m.joueur2, km: 0, type: rc.round }),
          });
          console.log(`  [${comp.id}] Nouveau match → ${rc.round} : ${m.joueur1} vs ${m.joueur2} (n°${numero})`);
          anyNew = true;
        } catch (e) {
          console.warn(`  ⚠️  Insertion échouée : ${e.message}`);
        }
      }
    }

    if (!anyNew) console.log(`  [${comp.id}] Tableau à jour — aucun nouveau match.`);
  }
}

// ── Détecte les nouvelles vidéos tennis sur France TV Sport ───────
async function detectTennisVideos() {
  const apiKey      = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  console.log('\n🎾  Détection vidéos tennis (France TV Sport)...\n');

  let xml;
  try {
    xml = await fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${FRANCE_TV_CHANNEL_ID}`);
  } catch (e) {
    console.warn(`  ⚠️  France TV RSS inaccessible : ${e.message}`);
    return;
  }

  const MATCH_SIGNALS = ['résumé', 'resume', 'highlights', ' vs ', ' / ', 'élimine',
    'bat ', 'renverse', 's\'incline', 'qualif', 'victoire', 'tour', 'finale'];
  const SKIP_SIGNALS  = ['photographe', 'coulisses', 'journée', 'derrière', 'programme', 'preview', 'présentation'];

  const videos = parseRSS(xml).filter(v => {
    const lower = v.title.toLowerCase();
    if (!lower.includes('roland') || !lower.includes('garros')) return false;
    if (SKIP_SIGNALS.some(s => lower.includes(s))) return false;
    return MATCH_SIGNALS.some(s => lower.includes(s));
  });

  if (!videos.length) {
    console.log('  Aucune vidéo Roland Garros dans le RSS France TV.');
    return;
  }
  console.log(`  ${videos.length} vidéo(s) Roland Garros trouvée(s).\n`);

  // Charger tous les matchs (hommes + femmes) en une fois
  const allMatchesByComp = {};
  for (const comp of TENNIS_COMPS) {
    try {
      allMatchesByComp[comp.id] = await loadTennisMatches(supabaseUrl, serviceKey, comp.id);
    } catch (e) {
      console.warn(`  ⚠️  Erreur chargement matchs ${comp.id} : ${e.message}`);
      allMatchesByComp[comp.id] = [];
    }
  }

  // IDs déjà liés (toutes compétitions confondues)
  const linkedVideoIds = new Set(
    Object.values(allMatchesByComp).flat().map(m => m.resumes?.video_id).filter(Boolean)
  );

  // Résultats par compétition : { compId → [match] }
  const newMatchesByComp = {};

  for (const v of videos) {
    if (linkedVideoIds.has(v.id)) continue;

    let foundComp = null;
    let foundMatch = null;

    // 1. Essai par noms de famille dans toutes les compétitions
    for (const comp of TENNIS_COMPS) {
      const candidates = allMatchesByComp[comp.id].filter(m => !m.resumes?.video_id && m.depart !== 'À déterminer');
      const num = matchByLastName(v.title, candidates);
      if (num) {
        foundMatch = candidates.find(m => m.numero === num);
        foundComp  = comp;
        break;
      }
    }

    // 2. Fallback Gemini (une seule tentative, sur l'ensemble des candidats)
    if (!foundMatch && apiKey) {
      const allCandidates = TENNIS_COMPS.flatMap(comp =>
        allMatchesByComp[comp.id]
          .filter(m => !m.resumes?.video_id && m.depart !== 'À déterminer')
          .map(m => ({ ...m, _compId: comp.id }))
      );
      if (allCandidates.length) {
        await new Promise(r => setTimeout(r, 2000)); // respecter le quota
        const matchNum = await identifyTennisMatch(apiKey, v.title, allCandidates);
        if (matchNum) {
          const hit = allCandidates.find(m => m.numero === matchNum);
          if (hit) {
            foundComp  = TENNIS_COMPS.find(c => c.id === hit._compId);
            foundMatch = hit;
          }
        }
      }
    }

    if (!foundMatch || !foundComp) {
      console.log(`  Non identifiée : "${v.title}"`);
      continue;
    }

    console.log(`  [${foundComp.id}] Match ${foundMatch.numero} (${foundMatch.depart} vs ${foundMatch.arrivee}) → ${v.id}`);
    console.log(`             "${v.title}"`);

    try {
      await writeTennisVideo(supabaseUrl, serviceKey, foundMatch.id, v.id, foundComp.id, foundMatch.numero);
      linkedVideoIds.add(v.id);
      foundMatch.resumes = { video_id: v.id };
      if (!newMatchesByComp[foundComp.id]) newMatchesByComp[foundComp.id] = [];
      newMatchesByComp[foundComp.id].push(foundMatch);
    } catch (e) {
      console.warn(`  ⚠️  Erreur écriture : ${e.message}`);
    }
  }

  // Notifications par compétition
  for (const comp of TENNIS_COMPS) {
    const newMatches = newMatchesByComp[comp.id] || [];
    if (newMatches.length > 0) {
      await sendTennisNotifications(newMatches, comp.id, comp.sportId, comp.label);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  Recherche de nouvelles vidéos...\n');

  await updateLastScan();

  // ── Vélo ──
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

    const candidates = {};
    for (const v of videos) {
      if (!isAccepted(v.title, config)) continue;
      const n = getStageNumber(v.title);
      if (!n) continue;

      const stageDate = getStageDate(comp, n);
      if (stageDate && v.date < stageDate) {
        console.log(`  [${compId}] Étape ${String(n).padStart(2)} ignorée — publiée le ${v.date}, étape le ${stageDate} : "${v.title}"`);
        continue;
      }

      const score = scoreVideo(v.title, config);
      if (!candidates[n]) candidates[n] = [];
      candidates[n].push({ ...v, score });
    }

    const newStages = [];
    for (const [key, cands] of Object.entries(candidates)) {
      const n = parseInt(key);
      if (existing[n]) continue;

      cands.sort((a, b) => b.score - a.score || b.published.localeCompare(a.published));
      const best = cands[0];

      console.log(`  [${compId}] Étape ${String(n).padStart(2)} → ${best.id} (score: ${best.score})`);
      console.log(`           "${best.title}"`);
      if (cands.length > 1) console.log(`           (${cands.length - 1} autre(s) candidat(s) écartés)`);

      newStages.push({ id: n, label: `Étape ${n}`, video: best.id, date: best.date, published: best.published });
      existing[n] = best.id;
      changed = true;
    }

    if (newStages.length > 0) {
      await writeToSupabase(compId, newStages);
      await sendNotifications(newStages, compId, config.sportId, comp.label);
    }
  }

  // ── Tennis ──
  await detectTennisVideos();
  await updateTennisBracket();

  if (!changed) console.log('\n  Aucune nouvelle vidéo vélo trouvée.');
  console.log('\n✅  Scan terminé.');
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
