// api/subscribe.js — Vercel serverless function
// Enregistre un email + topic dans la table Supabase `subscribers`

const https = require('https');

function supabaseRequest(path, method, body, apiKey, baseUrl) {
  return new Promise((resolve, reject) => {
    const url     = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method,
      headers: {
        'apikey':        apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Prefer':        'resolution=ignore-duplicates,return=minimal',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end',  () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, topic = 'all' } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    return res.status(500).json({ error: 'Configuration serveur manquante.' });
  }

  try {
    const result = await supabaseRequest(
      '/rest/v1/subscribers',
      'POST',
      { email, topic },
      serviceKey,
      supabaseUrl
    );

    if (result.status === 200 || result.status === 201) {
      return res.status(200).json({ success: true });
    }

    console.error('Supabase error:', result.status, result.body);
    return res.status(500).json({ error: "Erreur lors de l'inscription." });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};
