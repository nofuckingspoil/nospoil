// ============================================================
//  Aperçu du mail « vos photos sur papier », en local seulement.
//
//  /api/tirages/apercu-mail?e=<id d'album> affiche le mail tel qu'il partirait,
//  avec les vraies photos de l'album, sans rien envoyer à personne.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { tiragesEmail, tiragesConfirmationEmail, tiragesExpeditionEmail } from '../../../../lib/mail'
import { contenuTirages } from '../../../../lib/relance-tirages'
import { contenuConfirmation } from '../../../../lib/commande-tirages'
import { estUuid } from '../../../../lib/params'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  if (process.env.NODE_ENV === 'production') return new Response('Introuvable.', { status: 404 })

  const e = new URL(request.url).searchParams.get('e') || ''
  if (!estUuid(e)) return new Response('Ajoutez ?e=<identifiant de l\'album> à l\'adresse.', { status: 400 })

  const { data } = await selectRows('events', `id=eq.${e}&select=id,name`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return new Response('Album introuvable.', { status: 404 })

  // ?type=confirmation ou ?type=expedition : les mails d'une commande, avec
  // la dernière commande passée sur cet album.
  const type = new URL(request.url).searchParams.get('type')
  if (type === 'confirmation' || type === 'expedition') {
    const r = await selectRows('tirages_commandes', `event_id=eq.${e}&select=*&order=created_at.desc&limit=1`)
    const c = Array.isArray(r.data) ? r.data[0] : null
    if (!c) return new Response('Aucune commande sur cet album.', { status: 404 })
    const ids = c.lignes.map((l) => l.photoId)
    const ph = await selectRows('photos', `id=in.(${ids.join(',')})&select=id,storage_path,thumb_path,taken_at`)
    const mail = type === 'confirmation'
      ? tiragesConfirmationEmail(await contenuConfirmation(c, ph.data || []))
      : tiragesExpeditionEmail({ prenom: 'Julie', nombre: c.nombre, transporteur: 'Royal Mail', suiviUrl: 'https://www.royalmail.com/track-your-item', suiviNumero: 'AB123456789GB', reference: c.id.slice(0, 8).toUpperCase() })
    return new Response(mail.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const contenu = await contenuTirages(ev)
  if (!contenu) return new Response('Cet album n\'a aucune photo.', { status: 404 })

  const mail = tiragesEmail({ ...contenu, stopLink: '#' })
  return new Response(mail.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
