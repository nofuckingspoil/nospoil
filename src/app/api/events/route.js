import { insertRow } from '../../../lib/supabase'

const DAY = 24 * 60 * 60 * 1000

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { ownerToken, name, hostNames, revealAt, shotsPerGuest } = body

  if (!ownerToken) {
    return Response.json({ error: 'Appareil non identifié.' }, { status: 400 })
  }
  if (!name || !name.trim()) {
    return Response.json({ error: "Donne un nom à ton événement." }, { status: 400 })
  }

  const reveal = new Date(revealAt)
  if (!revealAt || isNaN(reveal.getTime())) {
    return Response.json({ error: 'Date de révélation invalide.' }, { status: 400 })
  }
  if (reveal.getTime() < Date.now() - 60 * 1000) {
    return Response.json({ error: 'La date de révélation doit être dans le futur.' }, { status: 400 })
  }

  const shots = Math.min(50, Math.max(1, parseInt(shotsPerGuest, 10) || 10))
  const expires = new Date(reveal.getTime() + 60 * DAY) // rétention : 60 jours après la révélation

  const { ok, data } = await insertRow('events', {
    owner_token: ownerToken,
    name: name.trim().slice(0, 80),
    host_names: hostNames ? hostNames.trim().slice(0, 80) : null,
    shots_per_guest: shots,
    reveal_at: reveal.toISOString(),
    expires_at: expires.toISOString(),
    status: 'active',
  })

  if (!ok || !data?.id) {
    console.error('create event error:', data)
    return Response.json({ error: "Erreur lors de la création de l'événement." }, { status: 500 })
  }

  return Response.json({ id: data.id })
}
