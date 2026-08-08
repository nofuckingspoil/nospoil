import { selectRows } from '../../../../../lib/supabase'

// Compteurs publics légers (participants + photos), rafraîchis en temps réel
// par l'écran album des participants. Volontairement minimal : pas de signature de
// couverture ni d'infos privées, pour rester rapide même appelé souvent.
export async function GET(request, { params }) {
  const { id } = await params

  const [guests, photos] = await Promise.all([
    selectRows('guests', `event_id=eq.${id}&select=id`),
    selectRows('photos', `event_id=eq.${id}&select=id`),
  ])

  return Response.json({
    guestCount: Array.isArray(guests.data) ? guests.data.length : 0,
    photoCount: Array.isArray(photos.data) ? photos.data.length : 0,
  })
}
