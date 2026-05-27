// src/app/api/unsubscribe/route.js — Désinscription par lien email
// GET /api/unsubscribe?email=xxx

async function supabaseRequest(path, method, body, apiKey, baseUrl) {
  const url     = new URL(path, baseUrl);
  const payload = body ? JSON.stringify(body) : null;

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'apikey':        apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: payload,
  });

  return { status: res.status, body: await res.text() };
}

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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(page('Lien invalide', 'Ce lien de désinscription est invalide.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(page('Erreur', 'Erreur de configuration serveur.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    await supabaseRequest(
      `/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
      'PATCH',
      { unsubscribed: true },
      serviceKey,
      supabaseUrl
    );
    return new Response(page(
      'Désinscription confirmée',
      `Tu ne recevras plus d'emails de NoSpoil pour <strong>${email}</strong>.`
    ), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    return new Response(page('Erreur', 'Une erreur est survenue. Réessaie plus tard.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
