// ============================================================
//  Envoi de mails transactionnels via Brevo.
//  À n'utiliser QUE dans les routes API (clé secrète).
// ============================================================
import 'server-only'
import { BRAND } from './brand'

const API = 'https://api.brevo.com/v3/smtp/email'

export function siteUrl() {
  return (process.env.SITE_URL || 'https://timetoflash.fr').replace(/\/$/, '')
}

// Envoie un mail. Ne fait jamais planter l'appelant : renvoie { ok, error }.
export async function sendMail({ to, subject, html }) {
  const key = process.env.BREVO_API_KEY
  const from = process.env.BREVO_SENDER_EMAIL
  if (!key || !from) {
    console.error('mail: configuration Brevo manquante (BREVO_API_KEY / BREVO_SENDER_EMAIL)')
    return { ok: false, error: 'mail-not-configured' }
  }
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: from, name: BRAND.name },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      cache: 'no-store',
    })
    if (res.status >= 300) {
      const detail = await res.text().catch(() => '')
      console.error('mail: échec Brevo', res.status, detail)
      return { ok: false, error: 'send-failed' }
    }
    return { ok: true }
  } catch (err) {
    console.error('mail: erreur réseau', err)
    return { ok: false, error: 'network' }
  }
}

// ---------- Gabarit commun (compatible clients mail : tableaux + styles en ligne) ----------
function layout({ title, intro, body, footer }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#E7E1D4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E7E1D4;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FCF8F0;border-radius:20px;padding:32px 28px;">
        <tr><td style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#EC5B33;font-weight:700;padding-bottom:18px;">${BRAND.name}</td></tr>
        <tr><td style="font-size:24px;line-height:1.25;font-weight:800;color:#221A12;padding-bottom:14px;">${title}</td></tr>
        <tr><td style="font-size:15px;line-height:1.6;color:#5f5341;padding-bottom:24px;">${intro}</td></tr>
        <tr><td>${body}</td></tr>
        <tr><td style="font-size:13px;line-height:1.6;color:#8a7c69;padding-top:26px;border-top:1px solid rgba(34,26,18,.1);margin-top:20px;">${footer}</td></tr>
      </table>
      <div style="font-size:12px;color:#8a7c69;padding-top:18px;">${BRAND.name} — ${BRAND.tagline}</div>
    </td></tr>
  </table>
</body></html>`
}

function bigButton(url, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
    <a href="${url}" style="display:block;background:#EC5B33;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 24px;border-radius:14px;text-align:center;">${label}</a>
  </td></tr></table>`
}

// ---------- Mail de connexion : bouton + code, les deux marchent ----------
export function loginEmail({ code, link }) {
  const spaced = String(code).replace(/(\d{3})(\d{3})/, '$1 $2')
  return {
    subject: `${code} — votre code de connexion ${BRAND.name}`,
    html: layout({
      title: 'Connexion à votre espace',
      intro: `Cliquez sur le bouton ci-dessous pour accéder à vos événements.`,
      body: `${bigButton(link, 'Me connecter →')}
        <div style="text-align:center;font-size:14px;color:#8a7c69;padding:22px 0 10px;">ou saisissez ce code sur la page ouverte :</div>
        <div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:.14em;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${spaced}</div>`,
      footer: `Ce lien et ce code sont valables 15 minutes et ne servent qu'une fois.<br>Si vous n'avez pas demandé cette connexion, ignorez ce message.`,
    }),
  }
}

// ---------- Mail de vérification à la création (code seul, avant création) ----------
export function verifyEmail({ code }) {
  const spaced = String(code).replace(/(\d{3})(\d{3})/, '$1 $2')
  return {
    subject: `${code} — votre code de vérification ${BRAND.name}`,
    html: layout({
      title: 'Confirmez votre adresse',
      intro: `Saisissez ce code sur la page pour créer votre événement. Il confirme que cette adresse est bien la vôtre.`,
      body: `<div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:.14em;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${spaced}</div>`,
      footer: `Ce code est valable 15 minutes et ne sert qu'une fois.<br>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    }),
  }
}

// ---------- Alerte avant suppression définitive des photos ----------
// `remaining` : 'un mois' ou 'une semaine'. `purgeDate` : date lisible.
export function purgeWarningEmail({ eventName, galleryUrl, remaining, purgeDate, photoCount }) {
  const urgent = remaining === 'une semaine'
  const count = photoCount > 0
    ? `${photoCount} photo${photoCount > 1 ? 's' : ''}`
    : 'Vos photos'
  return {
    subject: urgent
      ? `⏳ Dernière semaine pour récupérer les photos de « ${eventName} »`
      : `Vos photos de « ${eventName} » seront supprimées dans un mois`,
    html: layout({
      title: urgent
        ? `Plus qu'une semaine`
        : `Encore un mois pour télécharger vos photos`,
      intro: `${count} de l'événement « <strong>${eventName}</strong> » seront <strong>définitivement supprimées le ${purgeDate}</strong>, comme prévu lors de la création de votre événement.`,
      body: `${bigButton(galleryUrl, 'Télécharger mes photos →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Téléchargez l'album complet en une fois depuis votre galerie, et conservez-le
          à l'abri (ordinateur, disque externe, cloud).
        </div>`,
      footer: urgent
        ? `Passé le ${purgeDate}, la suppression est définitive et irréversible : nous ne pourrons pas récupérer ces photos.`
        : `Cette suppression automatique protège la vie privée de vos invités (RGPD). Elle est définitive et irréversible.`,
    }),
  }
}

// ---------- Mail envoyé à la création d'un événement (filet de sécurité) ----------
export function eventCreatedEmail({ eventName, ownerUrl, joinUrl, revealAt }) {
  const date = (() => {
    try {
      return new Date(revealAt).toLocaleString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    } catch { return '' }
  })()
  return {
    subject: `Votre événement « ${eventName} » est prêt 🎞️`,
    html: layout({
      title: `« ${eventName} » est en ligne`,
      intro: `Gardez ce mail : c'est votre accès organisateur. Il vous permet de retrouver votre tableau de bord depuis n'importe quel appareil.`,
      body: `${bigButton(ownerUrl, 'Ouvrir mon tableau de bord →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          <strong style="color:#221A12;">Le lien à donner à vos invités :</strong><br>
          <a href="${joinUrl}" style="color:#C9431F;word-break:break-all;">${joinUrl}</a>
        </div>
        ${date ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">Révélation des photos :</strong><br>${date}</div>` : ''}`,
      footer: `Ne transmettez pas le lien du tableau de bord à vos invités — il donne accès à la gestion de l'événement.`,
    }),
  }
}
