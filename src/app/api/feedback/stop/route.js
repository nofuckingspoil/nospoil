// ============================================================
//  Désinscription des mails d'enquête.
//
//  Un invité n'a jamais demandé à recevoir un questionnaire : le lien qui
//  permet de dire non doit donc marcher en un clic, sans page de confirmation
//  ni compte à créer. Il ne touche qu'à l'enquête — le lien de l'album, lui,
//  reste dû à l'invité, c'est la contrepartie de son adresse.
// ============================================================
import { selectRows, updateRow } from '../../../../lib/supabase'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const token = (body.t || '').toString().trim()
  if (!token) return Response.json({ error: 'Lien incomplet.' }, { status: 400 })

  const { data } = await selectRows('guests', `token=eq.${encodeURIComponent(token)}&select=id&limit=1`)
  const g = Array.isArray(data) ? data[0] : null
  // On répond « c'est noté » même si le jeton ne correspond à rien : dire à un
  // inconnu qu'une adresse existe ou non serait une fuite en soi.
  if (!g) return Response.json({ ok: true })

  await updateRow('guests', `id=eq.${g.id}`, { survey_optout: true })
  return Response.json({ ok: true })
}
