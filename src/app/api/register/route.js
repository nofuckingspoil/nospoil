import { createHash } from 'crypto';

async function rpc(fnName, params, key, url) {
  const res = await fetch(`${url}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return { ok: res.status < 300, status: res.status, data };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, refCode, pseudo, communityOptIn = false, fingerprint } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  }

  const forwarded = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '';
  const ip = forwarded.split(',')[0].trim() || 'unknown';
  const ipHash = createHash('sha256')
    .update(ip + (process.env.IP_SALT ?? 'nospoil-salt-2026'))
    .digest('hex')
    .slice(0, 16);

  try {
    const { ok, data } = await rpc('register_subscriber', {
      p_email:            email,
      p_ref_code_used:    refCode    ?? null,
      p_pseudo:           pseudo     ?? null,
      p_community_opt_in: Boolean(communityOptIn),
      p_fingerprint:      fingerprint ?? null,
      p_ip_hash:          ipHash,
    }, serviceKey, supabaseUrl);

    if (!ok) {
      console.error('register_subscriber error:', data);
      return Response.json({ error: "Erreur lors de l'inscription." }, { status: 500 });
    }
    if (data?.status === 'error') {
      return Response.json({ error: data.message }, { status: 400 });
    }

    // Écriture dans subscribers pour la compatibilité avec les alertes email
    await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method:  'POST',
      headers: {
        apikey:          serviceKey,
        Authorization:   `Bearer ${serviceKey}`,
        'Content-Type':  'application/json',
        Prefer:          'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ email, topic: 'all' }),
    }).catch(() => {});

    return Response.json({
      success: true,
      refCode: data.ref_code,
      isNew:   data.status === 'created',
    });
  } catch (err) {
    console.error('Register error:', err);
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
