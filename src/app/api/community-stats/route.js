export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Config manquante.' }, { status: 500 });
  }
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_community_stats`, {
      method:  'POST',
      headers: {
        apikey:         serviceKey,
        Authorization:  `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    const data = await res.json();
    return Response.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return Response.json({ error: 'Erreur.' }, { status: 500 });
  }
}
