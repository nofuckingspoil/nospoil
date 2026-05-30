// src/app/api/scan/route.js — Détection automatique des highlights
// Appelé par cron-job.org toutes les 5 minutes
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import DATA from '../../../lib/data.js';

// ── Config par compétition ──────────────────────────────────────────
const COMPETITIONS_CONFIG = {
  'giro-2026': {
    sportId:   'cyclisme',
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',
    keyword:   'giro',
    // Vidéos à ignorer : réactions, analyses, décryptages
    exclude:   ['réactions', 'réaction', 'décrypt', 'analyse', 'preview', 'percorso', 'parcours', 'présentation'],
    // Mots qui confirment que c'est un highlights → priorité haute
    prefer:    ['highlights', 'résumé', 'resume'],
  },
  'tdf-2026': {
    sportId:   'cyclisme',
    channelId: 'UCozt5iXNqmhU1I7tcjJ0UFQ',
    keyword:   'tour de france',
    exclude:   ['réactions', 'réaction', 'décrypt', 'analyse', 'preview', 'parcours', 'présentation'],
    prefer:    ['highlights', 'résumé', 'resume'],
  },
};

// ── RSS ─────────────────────────────────────────────────────────────
function parseRSS(xml) {
  return (xml.match(/<entry>([\s\S]*?)<\/entry>/g) || []).map(entry => {
    const id  = (entry.match(/<yt:videoId>([^<]+)/)    || [])[1] || '';
    const raw = (entry.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const pub = (entry.match(/<published>([^<]+)/)      || [])[1] || '';
    const title = raw
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return { id, title, date: pub ? pub.slice(0, 10) : '', published: pub };
  }).filter(v => v.id);
}

// ── Filtrage et scoring ─────────────────────────────────────────────
function isCandidate(title, config) {
  const lower = title.toLowerCase();
  if (!lower.includes(config.keyword)) return false;
  for (const ex of (config.exclude || [])) {
    if (lower.includes(ex)) return false;
  }
  return true;
}

function scoreVideo(title, config) {
  const lower = title.toLowerCase();
  let score = 0;
  for (const p of (config.prefer || [])) {
    if (lower.includes(p)) score += 2;
  }
  return score;
}

// Extrait le numéro d'étape depuis le titre ("Stage 17", "Étape 17", "17e étape")
function getStageNumber(title) {
  for (const p of [/stage\s+(\d+)/i, /[eé]tape\s+(\d+)/i, /(\d+)[eè]?[rn]?[de]?\s+[eé]tape/i]) {
    const m = title.match(p);
    if (m) return parseInt(m[1]);
  }
  return null;
}

// Date de publication → numéro d'étape (fallback quand le titre ne contient pas de numéro)
function getStageNumByDate(videoDate, dateToStage) {
  // Exact : vidéo publiée le jour de l'étape
  if (dateToStage[videoDate]) return dateToStage[videoDate];
  // J+1 : highlights parfois publiés le lendemain
  const d = new Date(videoDate);
  d.setDate(d.getDate() - 1);
  const dayBefore = d.toISOString().slice(0, 10);
  return dateToStage[dayBefore] || null;
}

function buildDateToStageMap(comp) {
  const map = {};
  for (const s of (comp.stages || [])) {
    if (s.date) map[s.date] = s.id;
  }
  return map;
}

function findCompetition(compId) {
  for (const sport of DATA.sports) {
    const comp = sport.competitions.find(c => c.id === compId);
    if (comp) return comp;
  }
  return null;
}

// ── Supabase ────────────────────────────────────────────────────────
async function supabaseFetch(path, method = 'GET', body = null) {
  const url     = `${process.env.SUPABASE_URL}/rest/v1/${path}`;
  const key     = process.env.SUPABASE_SERVICE_KEY;
  const headers = {
    apikey:         key,
    Authorization:  `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (method === 'POST')  headers['Prefer'] = 'resolution=merge-duplicates,return=minimal';
  if (method === 'PATCH') headers['Prefer'] = 'return=minimal';

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.text() };
}

async function loadExistingResumes() {
  const res  = await supabaseFetch('etapes?select=competition_id,numero,resumes(video_id)');
  const rows = JSON.parse(res.body);
  const map  = {};
  (rows || []).forEach(r => {
    if (!map[r.competition_id]) map[r.competition_id] = {};
    const vid = r.resumes?.video_id;
    if (vid) map[r.competition_id][r.numero] = vid;
  });
  return map;
}

async function writeResume(compId, stage) {
  const res    = await supabaseFetch(`etapes?competition_id=eq.${compId}&numero=eq.${stage.id}&select=id`);
  const etapes = JSON.parse(res.body);
  if (!etapes?.length) return;
  await supabaseFetch('resumes', 'POST', { etape_id: etapes[0].id, video_id: stage.video });
  await supabaseFetch('detection_logs', 'POST', {
    competition_id: compId,
    videos_found:   1,
    message:        `Étape ${stage.id} — ${stage.video}`,
  }).catch(() => {});
}

// ── Notifications ───────────────────────────────────────────────────
async function getSubscribers(compId, sportId) {
  const topics = ['all', sportId, compId].join(',');
  const res    = await supabaseFetch(`subscribers?unsubscribed=eq.false&topic=in.(${topics})&select=email`);
  if (res.status !== 200) return [];
  return JSON.parse(res.body) || [];
}

async function sendNotifications(newStages, compId, sportId, compName) {
  const brevoKey    = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'alerte@nospoilersports.app';
  const replyEmail  = process.env.REPLY_TO_EMAIL     || 'contact@no-spoil.fr';
  const siteUrl     = process.env.SITE_URL            || 'https://nospoil.vercel.app';
  if (!brevoKey) return;

  const subscribers = await getSubscribers(compId, sportId).catch(() => []);
  if (!subscribers.length) return;

  const name    = compName || compId;
  const subject = newStages.length === 1
    ? `${name} — ${newStages[0].label} — nouveau résumé sur NoSpoil`
    : `${name} — ${newStages.length} nouvelles étapes sur NoSpoil`;

  const stagesLinks = newStages.map(s => {
    const url = `${siteUrl}/cyclisme/${compId}?stage=${s.id}`;
    return `<p style="margin:0.6rem 0">Sans spoiler, comme toujours, voici <strong>${s.label}</strong> :<br>
     <a href="${url}" style="color:#00E27A;font-weight:600">Regarder sur no-spoil.fr →</a></p>`;
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

  for (const sub of subscribers) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sender:      { name: 'no-spoil.fr', email: senderEmail },
        replyTo:     { email: replyEmail },
        to:          [{ email: sub.email }],
        subject,
        htmlContent: html.replace('EMAIL', encodeURIComponent(sub.email)),
      }),
    }).catch(() => {});
  }
}

// ── Handler principal ───────────────────────────────────────────────
export async function GET(request) {
  const secret = request.headers.get('x-scan-secret')
    || new URL(request.url).searchParams.get('secret');

  if (!process.env.SCAN_SECRET || secret !== process.env.SCAN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log     = [];
  const results = {};

  try {
    // Mettre à jour l'horodatage du dernier scan
    await supabaseFetch('settings?key=eq.last_scan', 'PATCH', {
      value:      new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).catch(() => {});

    const existingResumes = await loadExistingResumes();

    for (const [compId, config] of Object.entries(COMPETITIONS_CONFIG)) {
      const comp = findCompetition(compId);
      if (!comp || !comp.stages?.length) continue;

      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${config.channelId}`;
      const rssText = await fetch(rssUrl).then(r => r.text()).catch(() => '');
      if (!rssText) { log.push(`[${compId}] RSS inaccessible`); continue; }

      const videos       = parseRSS(rssText);
      const existing     = existingResumes[compId] || {};
      const dateToStage  = buildDateToStageMap(comp);
      const candidates   = {};  // stageNum → [{ ...video, score }]

      for (const v of videos) {
        if (!isCandidate(v.title, config)) continue;

        // Numéro d'étape : par titre d'abord, puis par date de publication
        let n = getStageNumber(v.title) || getStageNumByDate(v.date, dateToStage);
        if (!n) continue;

        // Rejeter si publié avant le jour de l'étape (c'est un preview)
        const stageDate = comp.stages.find(s => s.id === n)?.date;
        if (stageDate && v.date < stageDate) {
          log.push(`[${compId}] Étape ${n} ignorée — publiée le ${v.date}, étape le ${stageDate}`);
          continue;
        }

        if (!candidates[n]) candidates[n] = [];
        candidates[n].push({ ...v, score: scoreVideo(v.title, config) });
      }

      // Pour chaque étape sans résumé, choisir la vidéo au score le plus élevé
      const newStages = [];
      for (const [key, cands] of Object.entries(candidates)) {
        const n = parseInt(key);
        if (existing[n]) continue;

        cands.sort((a, b) => b.score - a.score || b.published.localeCompare(a.published));
        const best = cands[0];

        log.push(`[${compId}] Étape ${n} → ${best.id} (score:${best.score}) "${best.title}"`);
        newStages.push({ id: n, label: `Étape ${n}`, video: best.id });
        existing[n] = best.id;
      }

      if (newStages.length > 0) {
        for (const s of newStages) await writeResume(compId, s);
        await sendNotifications(newStages, compId, config.sportId, comp.label);
      }

      results[compId] = { found: newStages.length };
    }

    return Response.json({ ok: true, log, results });
  } catch (err) {
    return Response.json({ ok: false, error: err.message, log }, { status: 500 });
  }
}
