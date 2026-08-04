// ============================================================
//  Envoi de mails transactionnels via Brevo.
//  À n'utiliser QUE dans les routes API (clé secrète).
// ============================================================
import 'server-only'
import { BRAND } from './brand'
import { CONTACT_EMAIL } from './pricing'

const API = 'https://api.brevo.com/v3/smtp/email'

// Adresse du site telle qu'elle apparaît aux clients.
const CANONIQUE = 'https://timetoflash.fr'

// SITE_URL permet de surcharger cette adresse, mais elle survit mal aux
// changements de domaine : restée braquée sur l'adresse technique de
// déploiement (*.vercel.app), elle envoyait aux clients des liens portant
// l'ancien nom de la marque. On ne laisse jamais ces adresses sortir.
export function siteUrl() {
  const brut = (process.env.SITE_URL || '').trim().replace(/\/$/, '')
  if (!brut) return CANONIQUE
  try {
    if (/\.vercel\.app$/i.test(new URL(brut).hostname)) return CANONIQUE
  } catch {
    return CANONIQUE // valeur inexploitable : mieux vaut le domaine connu
  }
  return brut
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

// ---------- Invitation d'un co-organisateur ----------
// Ne transporte aucun secret : c'est la connexion par mail qui prouvera son
// identité. Un lien d'invitation volé ne donnerait donc accès à rien.
export function adminInviteEmail({ eventName, loginUrl }) {
  return {
    subject: `Vous co-organisez « ${eventName} » sur ${BRAND.name}`,
    html: layout({
      title: 'Vous êtes co-organisateur',
      intro: `On vous a confié la gestion de « <strong>${eventName}</strong> ». Vous pourrez inviter les convives, veiller sur l'album et régler les dates.`,
      body: `${bigButton(loginUrl, 'Accéder à l’événement →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Connectez-vous avec <strong style="color:#221A12;">cette adresse mail</strong> : vous recevrez un code, sans mot de passe à retenir.
        </div>`,
      footer: `Vous avez accès à toute la gestion de l'événement, sauf à sa suppression, qui reste réservée à son organisateur.`,
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
        ${date ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">Révélation des photos :</strong><br>${date}</div>` : ''}
        <!-- « Et maintenant ? » est la question qui suit immédiatement la
             création. On y répond ici plutôt que d'alourdir le tableau de bord. -->
        <div style="margin-top:26px;padding:18px 20px;background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:14px;">
          <div style="font-size:15px;font-weight:700;color:#221A12;margin-bottom:6px;">Et maintenant, comment ça se passe ?</div>
          <div style="font-size:14px;line-height:1.6;color:#5f5341;">
            Où poser le QR code, quoi faire dire au micro, ce que voient vos invités
            pendant la soirée, et comment relire l'album avant la révélation.
          </div>
          <div style="padding-top:12px;">
            <a href="${siteUrl()}/journal/evenement-cree-et-maintenant" style="color:#C9431F;font-weight:700;font-size:14px;text-decoration:underline;">Lire le déroulé complet (6 min) →</a>
          </div>
          <div style="padding-top:10px;font-size:13px;color:#6E6252;">
            Un invité bloqué le jour J ? Gardez
            <a href="${siteUrl()}/aide" style="color:#6E6252;">la page d'aide</a>
            sous la main : elle se transfère telle quelle.
          </div>
        </div>`,
      footer: `Ne transmettez pas le lien du tableau de bord à vos invités — il donne accès à la gestion de l'événement.`,
    }),
  }
}

// ---------- Rappel le matin de l'événement ----------
// Objectif : que l'organisateur ouvre son tableau de bord au bon moment,
// avec le QR sous la main. C'est le seul rappel avant la fête.
export function eventDayEmail({ eventName, ownerUrl, shotsPerGuest }) {
  return {
    subject: `C'est aujourd'hui : « ${eventName} » 📸`,
    html: layout({
      title: `C'est aujourd'hui`,
      intro: `Vos invités vont pouvoir scanner. Chacun aura <strong>${shotsPerGuest} photos</strong>, pas une de plus — et personne ne verra rien avant la révélation.`,
      body: `${bigButton(ownerUrl, 'Ouvrir mon tableau de bord →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          <strong style="color:#221A12;">Les deux choses à ne pas oublier :</strong><br>
          1. Poser les cartons QR là où on passe : l'entrée, le bar, les tables.<br>
          2. Demander à quelqu'un d'annoncer le jeu au début du repas — c'est ce qui fait décoller la participation.
        </div>
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;">
          Un retardataire ? Votre tableau de bord affiche le QR en plein écran, à faire scanner directement.
        </div>`,
      footer: `Vous pouvez suivre en direct qui joue et combien de photos ont été prises, depuis votre tableau de bord.`,
    }),
  }
}

// ---------- Rappel le lendemain : les photos attendent ----------
// C'est ce mail qui déclenche le partage de l'album : sans lui, beaucoup
// d'organisateurs ne reviennent jamais et l'album reste invisible.
export function afterPartyEmail({ eventName, ownerUrl, photoCount, guestCount, revealDate, quota }) {
  // `quota` (facultatif) : { maxGuests } quand la formule souscrite est dépassée.
  // On le dit ici, le lendemain de la fête — c'est le dernier moment où
  // l'organisateur peut encore agir tranquillement avant la révélation.
  const alerte = quota ? `
    <div style="margin-top:22px;padding:16px;border:2px solid #EC5B33;border-radius:14px;background:#fff;">
      <div style="font-size:15px;font-weight:700;color:#221A12;">Votre formule est dépassée</div>
      <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:6px;">
        Vous étiez <strong style="color:#221A12;">${guestCount} invités</strong> pour une formule
        de <strong style="color:#221A12;">${quota.maxGuests}</strong>. Personne n'a été bloqué pendant
        la fête, et toutes les photos sont bien là. En revanche,
        <strong style="color:#221A12;">l'album ne s'ouvrira pas</strong> tant que votre formule
        ne correspond pas au nombre réel d'invités. Vous ne réglerez que la différence.
      </div>
    </div>` : ''

  return {
    subject: quota
      ? `Action requise avant la révélation — « ${eventName} »`
      : `${photoCount} photos vous attendent — « ${eventName} »`,
    html: layout({
      title: `${photoCount} photos vous attendent`,
      intro: `${guestCount} invité${guestCount > 1 ? 's ont' : ' a'} joué le jeu hier soir. <strong>Vous seul pouvez déjà les voir</strong> — vos invités devront patienter jusqu'à la révélation.`,
      body: `${bigButton(ownerUrl, 'Voir les photos →')}
        ${alerte}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Profitez-en pour <strong style="color:#221A12;">masquer celles qui gênent</strong> avant que tout le monde les découvre :
          dans l'album, un bouton sur chaque photo suffit.
        </div>
        ${revealDate ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">Révélation prévue :</strong><br>${revealDate}</div>` : ''}`,
      footer: `Le jour de la révélation, votre tableau de bord vous proposera un message tout prêt à envoyer à vos invités.`,
    }),
  }
}

// ---------- Alerte immédiate : quelqu'un attend à la porte ----------
// Part à la seconde où un invité de trop scanne le QR code. Ce mail est le seul
// lien entre cette personne restée sur le pas de la porte et celui qui peut la
// faire entrer : il doit se lire d'un coup d'œil, au milieu d'une fête, et ne
// demander qu'un seul geste. D'où le prénom dans l'objet — c'est quelqu'un de
// précis qui attend, pas un compteur qui clignote.
export function quotaEmail({ eventName, ownerUrl, guestCount, maxGuests, prenom, upgradeMaxGuests, upgradePrice }) {
  const qui = prenom ? `<strong>${prenom}</strong>` : `Un invité`
  // Pas de palier au-dessus : on est au plus grand format, le tarif se fait à la
  // main. Le bouton mène alors vers nous, pas vers un paiement qui n'existe pas.
  const surMesure = !upgradeMaxGuests
  const offre = surMesure
    ? 'Nous écrire pour agrandir →'
    : `Passer à ${upgradeMaxGuests} invités${upgradePrice ? ` — ${upgradePrice}` : ''} →`
  const lien = surMesure ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Plus de ${maxGuests} invités — ${eventName}`)}` : ownerUrl
  return {
    subject: prenom
      ? `${prenom} attend d’entrer — « ${eventName} »`
      : `Un invité attend d’entrer — « ${eventName} »`,
    html: layout({
      title: prenom ? `${prenom} attend d’entrer` : `Un invité attend d’entrer`,
      intro: `${qui} vient de scanner le QR code de « <strong>${eventName}</strong> », mais votre formule est complète : elle couvre <strong>${maxGuests} invités</strong> et ils sont déjà ${guestCount}.`,
      body: `${bigButton(lien, offre)}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${surMesure
            ? `Au-delà de ${maxGuests} invités, nous établissons un tarif sur mesure — écrivez-nous et
               nous ouvrons l’accès dans la foulée. <strong style="color:#221A12;">Vos autres invités
               continuent de photographier normalement</strong> pendant ce temps.`
            : `Un seul geste et ${prenom ? 'elle' : 'la personne'} entre aussitôt : son écran s’ouvrira
               tout seul, elle n’a rien à refaire. <strong style="color:#221A12;">Vos autres invités
               continuent de photographier normalement</strong> pendant ce temps.`}
        </div>`,
      footer: surMesure
        ? `Répondez simplement à ce message si c’est plus simple : nous vous recontactons vite.`
        : `Vous ne réglez que la différence : ce que vous avez déjà payé reste acquis.`,
    }),
  }
}

// ---------- Lien d'accès personnel d'un invité ----------
// Part dès qu'il laisse son adresse, pendant la soirée. Son identité ne tenait
// jusque-là que dans son navigateur : perdue avec un téléphone changé, elle
// emportait ses poses restantes et l'accès à ses propres photos.
export function guestAccessEmail({ eventName, link, shotsPerGuest }) {
  return {
    subject: `Votre accès aux photos de « ${eventName} »`,
    html: layout({
      title: 'Gardez ce lien',
      intro: `Vous participez à l'album de « <strong>${eventName}</strong> ». Ce message est votre accès personnel : il vous permet de retrouver vos photos et vos poses restantes, même en changeant de téléphone.`,
      body: `${bigButton(link, 'Retrouver mes photos →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${shotsPerGuest ? `Vous disposez de <strong style="color:#221A12;">${shotsPerGuest} photos</strong> pour cette soirée. ` : ''}
          Vous recevrez l'album complet dès sa révélation, sans rien avoir à faire.
        </div>`,
      footer: `Ce lien vous est personnel : il donne accès à vos photos, ne le transférez pas. Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement, et pour cela uniquement. Elle sera supprimée avec l'album.`,
    }),
  }
}

// ---------- Envoi du lien de l'album aux invités qui ont laissé leur mail ----------
// C'est la seule raison pour laquelle on demande leur adresse : le message
// le dit, et le pied de page le rappelle.
export function albumReadyEmail({ eventName, galleryUrl, photoCount, guestName }) {
  const bonjour = guestName ? `Bonjour ${guestName},` : 'Bonjour,'
  return {
    subject: `Les photos de « ${eventName} » sont en ligne 📸`,
    html: layout({
      title: `Les photos sont sorties`,
      intro: `${bonjour} l'album de « <strong>${eventName}</strong> » vient de s'ouvrir : <strong>${photoCount} photo${photoCount > 1 ? 's' : ''}</strong> prises par tous les invités, y compris les vôtres.`,
      body: `${bigButton(galleryUrl, "Voir l'album →")}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Vous pouvez les regarder, les télécharger, et retrouver celles que vous avez prises.
        </div>`,
      footer: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement, uniquement pour cela. Elle n'est utilisée pour rien d'autre et sera supprimée avec l'album.`,
    }),
  }
}
