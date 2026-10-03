// ============================================================
//  Le lundi matin : combien de personnes se sont désinscrites de nos mails
//  la semaine passée, et depuis quel mail.
//
//  Remplace les alertes une par une : une désinscription n'appelle aucune
//  action, seule la tendance compte. Un chiffre qui monte dit qu'un mail
//  part trop souvent, ou à des gens qui ne l'attendaient pas.
//
//  Mail interne, en français seulement. Protégée par CRON_SECRET.
// ============================================================
import { synchroniserAdresses, bilanDesinscriptions } from '../../../../lib/adresses-brevo'
import { selectRows } from '../../../../lib/supabase'
import { sendMail } from '../../../../lib/mail'
import { adminEmail } from '../../../../lib/avis-mail'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

const pct = (n, total) => (total ? `${(Math.round((n / total) * 1000) / 10).toString().replace('.', ',')} %` : '0 %')
const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Le nombre d’adresses distinctes qui répondent à un filtre.
async function compter(filtre) {
  const { data } = await selectRows('guests', `${filtre}&select=email`)
  return Array.isArray(data) ? new Set(data.map((g) => (g.email || '').toLowerCase())).size : 0
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    // Les fiches d'abord à jour, pour que le cumul compte la semaine écoulée.
    await synchroniserAdresses(7)
    const semaine = await bilanDesinscriptions(7)
    const [avecAdresse, desinscritsTotal, adressesKo] = await Promise.all([
      compter('email=not.is.null'),
      compter('email_desinscrit_at=not.is.null'),
      compter('email_ko_at=not.is.null'),
    ])

    const taux = pct(semaine.desinscrits, semaine.destinataires)
    const lignes = Object.entries(semaine.parMail)
      .sort((a, b) => b[1] - a[1])
      .map(([sujet, n]) => `<li>${n} × « ${echapper(sujet || 'sans objet')} »</li>`)
      .join('')

    const html = `
      <div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#1d1d1f;max-width:560px">
        <h2 style="margin:0 0 12px">Désinscriptions de la semaine : ${taux}</h2>
        <p style="margin:0 0 12px"><strong>${semaine.desinscrits}</strong> personne${semaine.desinscrits > 1 ? 's' : ''} sur
          <strong>${semaine.destinataires}</strong> à qui Time to Flash a écrit ces 7 derniers jours
          (${semaine.envois} mail${semaine.envois > 1 ? 's' : ''} envoyé${semaine.envois > 1 ? 's' : ''}).</p>
        ${lignes ? `<p style="margin:0 0 4px">Depuis quel mail :</p><ul style="margin:0 0 12px;padding-left:20px">${lignes}</ul>` : ''}
        <p style="margin:0 0 12px;color:#6e6e73">Depuis le début : ${desinscritsTotal} désinscrit${desinscritsTotal > 1 ? 's' : ''}
          sur ${avecAdresse} adresse${avecAdresse > 1 ? 's' : ''} de participants (${pct(desinscritsTotal, avecAdresse)}).
          Adresses incorrectes repérées : ${adressesKo}.</p>
        <p style="margin:0;color:#6e6e73;font-size:13px">Repère : au-dessus de 0,5 % par envoi, Gmail commence à regarder de près.</p>
      </div>`

    const sent = await sendMail({
      to: adminEmail(),
      subject: `Désinscriptions : ${taux} cette semaine (${semaine.desinscrits}/${semaine.destinataires})`,
      html,
    })
    return Response.json({ ok: !!sent?.ok, ...semaine, desinscritsTotal, avecAdresse, adressesKo })
  } catch (err) {
    console.error('cron/desinscriptions:', err)
    return Response.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
