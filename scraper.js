// scraper.js — Extrait les étapes d'une compétition depuis une URL
// Usage : node scraper.js <comp_id> <url>
// Ex :    node scraper.js giro-2026 https://www.procyclingstats.com/race/giro-d-italia/2026/stages

const https    = require('https');
const http     = require('http');
const fs       = require('fs');
const readline = require('readline');

// ── Charger .env ──────────────────────────────────────────────────
function loadEnv() {
  try {
    fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    });
  } catch (_) {}
}

// ── Fetch texte brut ──────────────────────────────────────────────
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => resolve(data));
    }).on('error', reject);
  });
}

// ── Fetch via Jina (force le rendu JS) ───────────────────────────
function fetchJina(url) {
  return fetchText(`https://r.jina.ai/${url}`);
}

// ── Appel Gemini Flash (gratuit) ──────────────────────────────────
function callGemini(apiKey, content) {
  const prompt = `Extrais toutes les étapes de cette compétition cycliste.
Réponds UNIQUEMENT avec un tableau JSON valide, aucun texte autour, aucun markdown.
Chaque objet doit avoir ces champs (utilise null si l'info est absente) :
[{
  "numero": number,
  "date": "YYYY-MM-DD",
  "depart": "Ville de départ",
  "arrivee": "Ville d'arrivée",
  "km": number,
  "type": "sprint|montagne|haute-montagne|mi-montagne|contre-la-montre|vallonnée"
}]

Contenu de la page :
${content.slice(0, 50000)}`;

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents:         [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path:     `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = parsed.candidates[0].content.parts[0].text;
          // Nettoyer les balises markdown si présentes
          const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          resolve(clean);
        } catch (e) {
          reject(new Error(`Réponse Gemini invalide : ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Chargement / sauvegarde de data.js ───────────────────────────
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

function saveData(data) {
  const output = [
    `// Mis à jour automatiquement — ${new Date().toLocaleString('fr-FR')}`,
    `const DATA = ${JSON.stringify(data, null, 2)};`,
  ].join('\n');
  fs.writeFileSync('data.js', output, 'utf8');
}

// ── Confirmation console ──────────────────────────────────────────
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  loadEnv();

  const [,, compId, url] = process.argv;
  if (!compId || !url) {
    console.error('Usage : node scraper.js <comp_id> <url>');
    console.error('Ex :    node scraper.js giro-2026 https://www.procyclingstats.com/...');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌  GEMINI_API_KEY manquant dans .env');
    console.error('   → Récupère ta clé gratuite sur https://aistudio.google.com/app/apikey');
    process.exit(1);
  }

  // Vérifier que la compétition existe dans data.js
  const data = loadData();
  let comp = null;
  for (const sport of data.sports) {
    comp = sport.competitions.find(c => c.id === compId);
    if (comp) break;
  }
  if (!comp) {
    console.error(`❌  Compétition "${compId}" introuvable dans data.js`);
    process.exit(1);
  }

  console.log(`\n🔍  Récupération de la page...`);
  let content;
  try {
    content = await fetchText(url);
    if (content.length < 1000) {
      console.log('  ⚠️  Contenu trop court, tentative via Jina.ai...');
      content = await fetchJina(url);
    }
  } catch (err) {
    console.log(`  ⚠️  Échec direct (${err.message}), tentative via Jina.ai...`);
    try {
      content = await fetchJina(url);
    } catch (e) {
      console.error(`❌  Impossible de récupérer la page : ${e.message}`);
      process.exit(1);
    }
  }
  console.log(`  ✅  ${content.length.toLocaleString()} caractères récupérés.\n`);

  console.log('🤖  Extraction des étapes via Gemini...');
  let stages;
  try {
    const raw = await callGemini(apiKey, content);
    stages = JSON.parse(raw);
    if (!Array.isArray(stages)) throw new Error("La réponse n'est pas un tableau");
  } catch (err) {
    console.error(`❌  Erreur d'extraction : ${err.message}`);
    process.exit(1);
  }

  console.log(`\n✅  ${stages.length} étapes extraites :\n`);
  stages.forEach(s => {
    const km   = s.km   ? `${s.km} km`  : '?';
    const type = s.type || '?';
    console.log(`  Étape ${String(s.numero).padStart(2)} — ${s.date || '?'} — ${s.depart} → ${s.arrivee} (${km}, ${type})`);
  });

  const answer = await confirm(`\nValider et insérer ces ${stages.length} étapes dans data.js ? (o/n) `);
  if (answer !== 'o' && answer !== 'oui') {
    console.log('\n⛔  Annulé. Aucune modification.');
    process.exit(0);
  }

  // Fusionner : garder les vidéos déjà connues pour les étapes existantes
  const existingByNum = {};
  (comp.stages || []).forEach(s => { existingByNum[s.id] = s; });

  comp.stages = stages.map(s => {
    const existing = existingByNum[s.numero] || {};
    return {
      id:    s.numero,
      label: `Étape ${s.numero}`,
      date:  s.date    || existing.date || '',
      from:  s.depart  || existing.from || '',
      to:    s.arrivee || existing.to   || '',
      km:    s.km      || existing.km   || 0,
      type:  s.type    || existing.type || '',
      ...(existing.video ? { video: existing.video } : {}),
    };
  }).sort((a, b) => a.id - b.id);

  saveData(data);
  console.log(`\n✅  data.js mis à jour avec ${comp.stages.length} étapes pour "${compId}".`);
}

main().catch(err => {
  console.error('\n❌  Erreur :', err.message);
  process.exit(1);
});
