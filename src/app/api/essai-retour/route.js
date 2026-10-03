// ============================================================
//  Réponse à « Vous avez pu essayer Time to Flash ? »
//
//  Ouverte depuis le mail envoyé aux soirées gratuites restées sans photo
//  (voir relanceEssais dans lib/avis-envoi). Le jeton organisateur du lien
//  suffit à savoir qui répond. Un souci, ou un mot laissé, part aussitôt
//  par mail à l'admin : c'est le genre de retour qu'on veut lire le jour même.
// ============================================================
import { after } from 'next/server'
import { selectRows, updateRow } from '../../../lib/supabase'
import { sendMail } from '../../../lib/mail'
import { adminEmail } from '../../../lib/avis-mail'
import { t } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'

export const runtime = 'nodejs'

const REPONSES = ['test', 'temps', 'souci', 'pas_pour_moi']
const LIBELLES = {
  test: 'Je teste avant ma vraie soirée',
  temps: "Je n'ai pas encore eu le temps",
  souci: "J'ai eu un souci",
  pas_pour_moi: "Ce n'est pas pour moi",
}

const ech = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export async function POST(request) {
  const langue = langueRequete(request)
  const body = await request.json().catch(() => ({}))
  const jeton = typeof body.o === 'string' ? body.o.trim() : ''
  if (!jeton) return Response.json({ error: t({ fr: 'Lien incomplet.', en: 'Incomplete link.', de: 'Unvollständiger Link.' }, langue) }, { status: 400 })

  const { data } = await selectRows('events', `owner_token=eq.${encodeURIComponent(jeton)}&select=id,name,owner_email,essai_reponse&limit=1`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ev) return Response.json({ error: t({ fr: 'Lien inconnu ou expiré.', en: 'Unknown or expired link.', de: 'Unbekannter oder abgelaufener Link.' }, langue) }, { status: 404 })

  const reponse = REPONSES.includes(body.r) ? body.r : null
  const detail = typeof body.detail === 'string' ? body.detail.trim().slice(0, 1000) : ''
  const patch = {}
  if (reponse) { patch.essai_reponse = reponse; patch.essai_reponse_at = new Date().toISOString() }
  if (detail) patch.essai_reponse_detail = detail
  if (Object.keys(patch).length) await updateRow('events', `id=eq.${ev.id}`, patch)

  // Un souci, ou un mot laissé : l'admin le lit le jour même.
  const final = reponse || ev.essai_reponse
  if ((reponse === 'souci' && reponse !== ev.essai_reponse) || detail) {
    after(async () => {
      try {
        await sendMail({
          to: adminEmail(),
          subject: `Essai « ${ev.name} » : ${LIBELLES[final] || 'réponse'}`,
          html: `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;">
            Soirée gratuite <strong>${ech(ev.name)}</strong> (aucune photo), organisateur ${ech(ev.owner_email)}.<br>
            Réponse : <strong>${ech(LIBELLES[final] || '-')}</strong>
            ${detail ? `<br><br>« ${ech(detail)} »` : ''}
          </p>`,
        })
      } catch (err) { console.error('essai-retour : alerte admin', err) }
    })
  }

  return Response.json({ ok: true, id: ev.id, name: ev.name, reponse: final })
}
