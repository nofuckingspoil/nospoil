// api/unsubscribe.js — Désinscription par lien email
// GET /api/unsubscribe?email=xxx

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
        apikey:          apiKey,
        Authorization:   `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
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
  const email = req.query?.email || new URL(req.url, 'http://x').searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send(page('Lien invalide', 'Ce lien de désinscription est invalide.'));
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).send(page('Erreur', 'Erreur de configuration serveur.'));
  }

  try {
    await supabaseRequest(
      `/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
      'PATCH',
      { unsubscribed: true },
      serviceKey,
      supabaseUrl
    );
    return res.status(200).send(page(
      'Désinscription confirmée',
      `Tu ne recevras plus d'emails de NoSpoil pour <strong>${email}</strong>.`
    ));
  } catch (err) {
    return res.status(500).send(page('Erreur', 'Une erreur est survenue. Réessaie plus tard.'));
  }
};

function page(title, message) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — NoSpoil</title>
  <style>
    body { font-family: sans-serif; background: #0d1a12; color: #f0ede8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { max-width: 480px; padding: 2.5rem; text-align: center; }
    .logo { color: #00E27A; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 1.5rem; }
    h1 { font-size: 1.4rem; margin: 0 0 1rem; }
    p { color: #a0b0a4; line-height: 1.6; }
    a { color: #00E27A; }
  </style>
</head>
<body>
  <div class="box">
    <div class="logo">NO.SPOIL</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p style="margin-top:2rem"><a href="/">← Retour au site</a></p>
  </div>
</body>
</html>`;
}
