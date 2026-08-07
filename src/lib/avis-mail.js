// ============================================================
//  Les mails de l'enquête de satisfaction.
//
//  Deux qui sortent (vers l'organisateur, vers l'invité qui n'est jamais allé
//  jusqu'à l'album) et deux qui rentrent (l'alerte immédiate et le récap du
//  lendemain, vers vous).
//
//  Le tri entre « tout de suite » et « demain » est ce qui rend l'ensemble
//  tenable : sans lui, un mariage de cent invités noierait la boîte, et
//  l'alerte qui comptait passerait avec le reste.
// ============================================================
import 'server-only'
import { BRAND } from './brand'
import { CONTACT_EMAIL } from './pricing'
import { sendMail, layout, bigButton, siteUrl } from './mail'
import { ACCROCHE, libelle, resumeAppareil, NOTES } from './avis'

// Votre adresse de réception. Réglable, mais jamais vide : une enquête dont
// les alertes ne partent nulle part n'alerte personne.
export function adminEmail() {
  return (process.env.ADMIN_EMAIL || '').trim() || CONTACT_EMAIL
}

export function lienAvisOrga(ownerToken) {
  return `${siteUrl()}/avis?o=${encodeURIComponent(ownerToken)}`
}

export function lienAvisInvite(token) {
  return `${siteUrl()}/avis?i=${encodeURIComponent(token)}`
}

// ---------- Vers l'organisateur, deux jours après la révélation ----------
export function surveyOrgaEmail({ eventName, link }) {
  return {
    subject: `Vous faites partie des 1000 premiers — 2 minutes ?`,
    html: layout({
      title: 'Votre avis, vraiment',
      intro: `${ACCROCHE} On construit encore beaucoup de choses, et ce que vous direz après « <strong>${eventName}</strong> » pèse lourd à ce stade.`,
      body: `${bigButton(link, 'Répondre — 2 minutes →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Ce qui vous a plu, ce qui a coincé, ce qui vous a manqué — et un
          espace pour tout dire librement.
          Rien à créer, rien à installer — le lien vous reconnaît.
        </div>`,
      footer: `Vous ne recevrez ce message qu'une seule fois, et aucune relance ne suivra.`,
    }),
  }
}

// ---------- Vers l'invité qui n'a jamais ouvert l'album ----------
// Ceux-là sont invisibles pour la question posée dans l'album, et ce sont
// probablement ceux qui ont rencontré le plus de difficultés : c'est
// exactement pour eux que ce mail existe.
export function surveyInviteEmail({ eventName, link, stopLink }) {
  return {
    subject: `Vous faites partie des 1000 premiers — 30 secondes ?`,
    html: layout({
      title: 'Dites-nous ce que vous en avez pensé',
      intro: `Vous avez participé à l'album de « <strong>${eventName}</strong> ». ${ACCROCHE} Votre avis nous aide à corriger ce qui ne va pas encore.`,
      body: `${bigButton(link, 'Répondre — 30 secondes →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Trois questions rapides, et un espace pour nous dire librement
          ce que vous en avez pensé — c'est celui qu'on lit en premier.
        </div>`,
      footer: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement. C'est le seul message de ce type que nous vous enverrons, et aucune relance ne suivra. <a href="${stopLink}" style="color:#8a7c69;">Ne plus recevoir de message de ce type</a>.`,
    }),
  }
}

// ---------- Vers vous : ce qui ne peut pas attendre demain ----------
function ligne(cle, valeur) {
  if (!valeur) return ''
  return `<tr>
    <td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap;">${cle}</td>
    <td style="font-size:14px;color:#221A12;padding:4px 0;">${valeur}</td>
  </tr>`
}

function noteLisible(n) {
  const trouve = NOTES.find((x) => x.valeur === n)
  return trouve ? `${trouve.emoji} ${trouve.mot}` : null
}

function soucisLisibles(issues) {
  const vrais = (issues || []).filter((i) => i !== 'ok')
  if (!vrais.length) return null
  return vrais.map((i) => `⚠️ ${libelle(i)}`).join('<br>')
}

export async function alerterAdmin({ avis, eventName, guestName }) {
  const qui = avis.role === 'organisateur'
    ? 'L’organisateur'
    : guestName ? `${guestName} (invité)` : 'Un invité'
  const soucis = soucisLisibles(avis.issues)

  const corps = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    ${ligne('Événement', eventName || '—')}
    ${ligne('Qui', qui)}
    ${ligne('Arrivé par', avis.canal === 'mail' ? 'le mail d’enquête' : 'l’album')}
    ${ligne('Note', noteLisible(avis.rating))}
    ${ligne('Recommandation', Number.isFinite(avis.nps) ? `${avis.nps}/10` : null)}
    ${ligne('Pourquoi', avis.nps_reason)}
    ${ligne('Problèmes', soucis)}
    ${ligne('Détail', avis.issue_detail)}
    ${ligne('Ce qui a plu', avis.favorite ? libelle(avis.favorite) : null)}
    ${ligne('En toutes lettres', avis.suggestion)}
    ${ligne('Connu par', avis.source ? libelle(avis.source) : null)}
    ${ligne('Referait ?', avis.would_host)}
    ${ligne('Appareil', resumeAppareil(avis.device))}
    ${ligne('Rappel accepté', avis.call_ok ? (avis.phone || 'oui, sans numéro') : null)}
    ${ligne('Son adresse', avis.contact_email)}
  </table>`

  const mail = {
    subject: soucis
      ? `⚠️ Problème signalé — ${eventName || 'événement'}`
      : `Nouvel avis — ${eventName || 'événement'}`,
    html: layout({
      title: soucis ? 'Un problème vient d’être signalé' : 'Nouvel avis',
      intro: soucis
        ? `Quelqu’un a coché une difficulté en répondant à l’enquête.`
        : `Une réponse vient d’arriver.`,
      body: `${corps}
        <div style="padding-top:22px;">${bigButton(`${siteUrl()}/admin/avis`, 'Voir tous les avis →')}</div>`,
      footer: `Les avis sans problème et sans note basse ne déclenchent pas d’alerte : vous les retrouvez dans le récap du lendemain.`,
    }),
  }
  return sendMail({ to: adminEmail(), subject: mail.subject, html: mail.html })
}

// ---------- Vers vous : le récap du lendemain ----------
// Tout ce qui n'a pas alerté. Envoyé seulement s'il y a de quoi le remplir —
// un récap quotidien vide finit par ne plus être ouvert du tout.
export async function recapAdmin(avisDuJour) {
  const liste = Array.isArray(avisDuJour) ? avisDuJour : []
  if (!liste.length) return { ok: false, error: 'rien-a-dire' }

  const notes = liste.map((a) => a.rating).filter((n) => Number.isFinite(n))
  const moyenne = notes.length ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1) : null
  const npsList = liste.map((a) => a.nps).filter((n) => Number.isFinite(n))
  const npsMoyen = npsList.length ? (npsList.reduce((s, n) => s + n, 0) / npsList.length).toFixed(1) : null
  const problemes = liste.filter((a) => (a.issues || []).some((i) => i !== 'ok')).length
  const mots = liste
    .map((a) => a.suggestion || a.nps_reason || a.issue_detail)
    .filter(Boolean)
    .slice(0, 8)

  const stat = (v, l) => `<td align="center" style="padding:10px 6px;">
      <div style="font-size:26px;font-weight:800;color:#221A12;">${v}</div>
      <div style="font-size:12px;color:#8a7c69;">${l}</div>
    </td>`

  const html = layout({
    title: `${liste.length} avis hier`,
    intro: `Voici ce qui est arrivé depuis le dernier récap. Les problèmes signalés vous ont déjà été envoyés à part.`,
    body: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:14px;">
        <tr>
          ${stat(liste.length, 'avis')}
          ${stat(moyenne ? `${moyenne}/4` : '—', 'note moyenne')}
          ${stat(npsMoyen ? `${npsMoyen}/10` : '—', 'recommandation')}
          ${stat(problemes, problemes > 1 ? 'problèmes' : 'problème')}
        </tr>
      </table>
      ${mots.length ? `<div style="padding-top:22px;">
        <div style="font-size:14px;font-weight:700;color:#221A12;padding-bottom:8px;">Ce qu'ils ont écrit</div>
        ${mots.map((m) => `<div style="font-size:14px;line-height:1.6;color:#5f5341;border-left:3px solid #EC5B33;padding:2px 0 2px 12px;margin-bottom:10px;">« ${m} »</div>`).join('')}
      </div>` : ''}
      <div style="padding-top:22px;">${bigButton(`${siteUrl()}/admin/avis`, 'Ouvrir la synthèse →')}</div>`,
    footer: `${BRAND.name} — récap automatique, envoyé uniquement les jours où il y a eu des réponses.`,
  })

  return sendMail({ to: adminEmail(), subject: `${liste.length} avis hier — ${BRAND.name}`, html })
}
