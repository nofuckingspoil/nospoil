export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Config manquante.' }, { status: 500 });
  }
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/leaderboard?select=pseudo,tier,qualified_referrals,tier_name,tier_color&order=qualified_referrals.desc,created_at.asc&limit=100`,
      {
        headers: {
          apikey:        serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    const data = await res.json();
    return Response.json(Array.isArray(data) ? data : [], {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    });
  } catch {
    return Response.json([], { status: 500 });
  }
}
