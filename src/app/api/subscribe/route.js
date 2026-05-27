// src/app/api/subscribe/route.js — Next.js Route Handler
// Enregistre un email + topic dans la table Supabase `subscribers`

async function supabaseRequest(path, method, body, apiKey, baseUrl) {
  const url     = new URL(path, baseUrl);
  const payload = body ? JSON.stringify(body) : null;

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'apikey':        apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
      'Prefer':        'resolution=ignore-duplicates,return=minimal',
    },
    body: payload,
  });

  return { status: res.status, body: await res.text() };
}

export async function POST(request) {
  const body = await request.json();
  const { email, topic = 'all' } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    return Response.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
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
      return Response.json({ success: true });
    }

    console.error('Supabase error:', result.status, result.body);
    return Response.json({ error: "Erreur lors de l'inscription." }, { status: 500 });
  } catch (err) {
    console.error('Subscribe error:', err.message);
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
