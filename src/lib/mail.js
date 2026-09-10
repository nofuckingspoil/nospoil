// ============================================================
//  Envoi de mails transactionnels via Brevo.
//  À n'utiliser QUE dans les routes API (clé secrète).
// ============================================================
import 'server-only'
import { BRAND } from './brand'
import { CONTACT_EMAIL } from './pricing'

const API = 'https://api.brevo.com/v3/smtp/email'

// Domaines réservés à la démonstration (RFC 2606 / 6761) : aucune boîte n'existe
// derrière. Un envoi y revient en « hard bounce », et ces retours se comptent
// contre la réputation du domaine expéditeur : quelques-uns suffisent à faire
// tomber les vrais messages en spam. Les jeux d'essai laissés en base ne doivent
// donc jamais atteindre l'API : on les arrête ici plutôt que chez Brevo.
const DOMAINES_FICTIFS = /@(?:[^@]*\.)?(?:example\.(?:com|org|net)|test|invalid|localhost|local)$/i

export function adresseFictive(email) {
  return DOMAINES_FICTIFS.test(String(email || '').trim())
}

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
export async function sendMail({ to, subject, html, text }) {
  const key = process.env.BREVO_API_KEY
  const from = process.env.BREVO_SENDER_EMAIL
  if (!key || !from) {
    console.error('mail: configuration Brevo manquante (BREVO_API_KEY / BREVO_SENDER_EMAIL)')
    return { ok: false, error: 'mail-not-configured' }
  }
  if (adresseFictive(to)) {
    console.warn('mail: adresse de démonstration ignorée', to)
    return { ok: false, error: 'test-address' }
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
        // Version texte : elle sert aux clients qui n'affichent pas le HTML,
        // et surtout aux téléphones, qui y lisent le code sans se battre avec
        // la mise en page pour proposer « Saisir le code » au-dessus du clavier.
        ...(text ? { textContent: text } : {}),
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
// Exporté pour les mails d'enquête (voir ./avis-mail), qui doivent avoir
// exactement la même allure que les autres : un questionnaire qui ne ressemble
// pas au reste passe pour un message d'un autre expéditeur.
export function layout({ title, intro, body, footer }) {
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
      <div style="font-size:12px;color:#8a7c69;padding-top:18px;">${BRAND.name} | ${BRAND.tagline}</div>
    </td></tr>
  </table>
</body></html>`
}

export function bigButton(url, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
    <a href="${url}" style="display:block;background:#EC5B33;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 24px;border-radius:14px;text-align:center;">${label}</a>
  </td></tr></table>`
}

// Version texte des mails qui portent un code.
//
// L'iPhone (Mail + Safari) sait proposer « Saisir le code » au-dessus du
// clavier, comme pour un SMS, à condition de reconnaître le code dans le
// message. Il le cherche à côté des mots « code de vérification », en début de
// message, et sans rien qui le coupe : d'où cette phrase, toujours la même,
// placée en tête.
function codeEnTexte(code, suite) {
  return `Votre code de vérification ${BRAND.name} est ${code}.\n${suite}\n\n` +
    `Ce code est valable 15 minutes et ne sert qu'une fois.`
}

// ---------- Mail de connexion : bouton + code, les deux marchent ----------
export function loginEmail({ code, link }) {
  return {
    subject: `${code} : votre code de connexion ${BRAND.name}`,
    text: codeEnTexte(code, 'Saisissez-le sur la page ouverte pour accéder à vos événements.'),
    html: layout({
      title: 'Connexion à votre espace',
      intro: `Votre code de vérification est <strong>${code}</strong>. Ou cliquez sur le bouton ci-dessous pour accéder directement à vos événements.`,
      body: `${bigButton(link, 'Me connecter →')}
        <div style="text-align:center;font-size:14px;color:#8a7c69;padding:22px 0 10px;">ou saisissez ce code sur la page ouverte :</div>
        <div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:.2em;text-indent:.2em;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${code}</div>`,
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
  return {
    subject: `${code} : votre code de vérification ${BRAND.name}`,
    text: codeEnTexte(code, 'Saisissez-le sur la page pour créer votre événement.'),
    html: layout({
      title: 'Confirmez votre adresse',
      intro: `Votre code de vérification est <strong>${code}</strong>. Saisissez-le sur la page pour créer votre événement : il confirme que cette adresse est bien la vôtre.`,
      body: `<div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:.2em;text-indent:.2em;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${code}</div>`,
      footer: `Ce code est valable 15 minutes et ne sert qu'une fois.<br>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    }),
  }
}

// ---------- Une photo vient d'être signalée ----------
//
// Apple l'exige (règle 1.2) : il faut un moyen de signaler un contenu choquant
// ET une réponse rapide. La réponse rapide, ici, c'est que la photo est retirée
// de l'album SANS ATTENDRE. Ce mail prévient l'organisateur de ce qui a été
// fait, et lui dit comment revenir dessus : c'est lui qui tranche au final,
// c'est sa soirée.
export function photoSignaleeEmail({ eventName, galleryUrl, motif }) {
  return {
    subject: `Une photo a été signalée : ${eventName}`,
    html: layout({
      title: 'Une photo a été signalée',
      intro:
        `Un participant de « ${eventName} » a signalé une photo de l'album. ` +
        'Elle a été <strong>masquée immédiatement</strong>, le temps que vous la regardiez.',
      body:
        (motif ? `<p style="margin:0 0 14px"><strong>Motif indiqué :</strong> ${motif}</p>` : '') +
        `<p style="margin:0 0 14px">Vous seul la voyez désormais. Depuis votre album, vous pouvez la ` +
        `<strong>rétablir</strong> si le signalement n'était pas fondé, ou la <strong>supprimer</strong> ` +
        `définitivement.</p>` +
        `<p style="margin:0"><a href="${galleryUrl}">Ouvrir l'album</a></p>`,
      footer:
        'Vous recevez ce message parce que vous organisez cet événement. ' +
        'Un doute, une question ? Écrivez-nous à support@timetoflash.fr.',
    }),
  }
}

// ---------- Code de confirmation pour supprimer un compte ----------
//
// Un code à part, avec ses propres mots : celui de la vérification d'adresse
// annonce « pour créer votre événement », ce qui serait trompeur ici, et même
// inquiétant. Un mail qui ne dit pas ce qu'il autorise est un mauvais mail.
export function deleteAccountEmail({ code }) {
  return {
    subject: `${code} : confirmer la suppression de votre compte ${BRAND.name}`,
    text: codeEnTexte(code, 'Saisissez-le dans l\'application pour confirmer la suppression de votre compte.'),
    html: layout({
      title: 'Supprimer votre compte',
      intro:
        `Votre code de vérification est <strong>${code}</strong>. Saisissez-le dans l'application ` +
        'pour confirmer la suppression de votre compte. Cette opération est définitive.',
      body: `<div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:.2em;text-indent:.2em;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${code}</div>`,
      footer:
        'Ce code est valable 15 minutes et ne sert qu\'une fois.<br>' +
        '<strong>Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message :</strong> ' +
        'sans ce code, rien ne sera supprimé.',
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
        : `Cette suppression automatique protège la vie privée de vos participants (RGPD). Elle est définitive et irréversible.`,
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
          <strong style="color:#221A12;">Le lien à donner à vos participants :</strong><br>
          <a href="${joinUrl}" style="color:#C9431F;word-break:break-all;">${joinUrl}</a>
        </div>
        ${date ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">Révélation des photos :</strong><br>${date}</div>` : ''}
        <!-- « Et maintenant ? » est la question qui suit immédiatement la
             création. On y répond ici plutôt que d'alourdir le tableau de bord. -->
        <div style="margin-top:26px;padding:18px 20px;background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:14px;">
          <div style="font-size:15px;font-weight:700;color:#221A12;margin-bottom:6px;">Et maintenant, comment ça se passe ?</div>
          <div style="font-size:14px;line-height:1.6;color:#5f5341;">
            Où poser le QR code, quoi faire dire au micro, ce que voient vos participants
            pendant la soirée, et comment relire l'album avant la révélation.
          </div>
          <div style="padding-top:12px;">
            <a href="${siteUrl()}/journal/evenement-cree-et-maintenant" style="color:#C9431F;font-weight:700;font-size:14px;text-decoration:underline;">Lire le déroulé complet (6 min) →</a>
          </div>
          <div style="padding-top:10px;font-size:13px;color:#6E6252;">
            Pour aller plus loin, <a href="${siteUrl()}/guide?orga=1" style="color:#6E6252;">le guide de l'organisateur</a>
            vous est ouvert : sept chapitres, rien à redonner.
          </div>
          <div style="padding-top:10px;font-size:13px;color:#6E6252;">
            Un participant bloqué le jour J ? Gardez
            <a href="${siteUrl()}/aide" style="color:#6E6252;">la page d'aide</a>
            sous la main : elle se transfère telle quelle.
          </div>
        </div>`,
      footer: `Ne transmettez pas le lien du tableau de bord à vos participants : il donne accès à la gestion de l'événement.`,
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
      intro: `Vos participants vont pouvoir scanner. Chacun aura <strong>${shotsPerGuest} photos</strong>, pas une de plus, et personne ne verra rien avant la révélation.`,
      body: `${bigButton(ownerUrl, 'Ouvrir mon tableau de bord →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          <strong style="color:#221A12;">Les deux choses à ne pas oublier :</strong><br>
          1. Poser les cartons QR là où on passe : l'entrée, le bar, les tables.<br>
          2. Demander à quelqu'un d'annoncer le jeu au début du repas : c'est ce qui fait décoller la participation.
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
  // On le dit ici, le lendemain de la fête : c'est le dernier moment où
  // l'organisateur peut encore agir tranquillement avant la révélation.
  const alerte = quota ? `
    <div style="margin-top:22px;padding:16px;border:2px solid #EC5B33;border-radius:14px;background:#fff;">
      <div style="font-size:15px;font-weight:700;color:#221A12;">Votre formule est dépassée</div>
      <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:6px;">
        Vous étiez <strong style="color:#221A12;">${guestCount} participants</strong> pour une formule
        de <strong style="color:#221A12;">${quota.maxGuests}</strong>. Personne n'a été bloqué pendant
        la fête, et toutes les photos sont bien là. En revanche,
        <strong style="color:#221A12;">l'album ne s'ouvrira pas</strong> tant que votre formule
        ne correspond pas au nombre réel de participants. Vous ne réglerez que la différence.
      </div>
    </div>` : ''

  return {
    subject: quota
      ? `Action requise avant la révélation : « ${eventName} »`
      : `${photoCount} photos vous attendent : « ${eventName} »`,
    html: layout({
      title: `${photoCount} photos vous attendent`,
      intro: `${guestCount} participant${guestCount > 1 ? 's ont' : ' a'} joué le jeu hier soir. <strong>Vous seul pouvez déjà les voir</strong> : vos participants devront patienter jusqu'à la révélation.`,
      body: `${bigButton(ownerUrl, 'Voir les photos →')}
        ${alerte}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Profitez-en pour <strong style="color:#221A12;">masquer celles qui gênent</strong> avant que tout le monde les découvre :
          dans l'album, un bouton sur chaque photo suffit.
        </div>
        ${revealDate ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">Révélation prévue :</strong><br>${revealDate}</div>` : ''}`,
      footer: `Le jour de la révélation, votre tableau de bord vous proposera un message tout prêt à envoyer à vos participants.`,
    }),
  }
}

// ---------- Alerte immédiate : quelqu'un attend à la porte ----------
// Part à la seconde où un participant de trop scanne le QR code. Ce mail est le seul
// lien entre cette personne restée sur le pas de la porte et celui qui peut la
// faire entrer : il doit se lire d'un coup d'œil, au milieu d'une fête, et ne
// demander qu'un seul geste. D'où le prénom dans l'objet : c'est quelqu'un de
// précis qui attend, pas un compteur qui clignote.
// `coOrga` : { ownerName } quand le destinataire est un co-organisateur. Il a
// exactement le même bouton que le propriétaire : il peut régler, et c'est
// heureux : la formule se remplit en pleine soirée, quand celui qui a créé
// l'événement danse ou dort. Une seule chose change, en pied de message : on
// lui dit qui d'autre a été prévenu, pour que deux personnes ne paient pas la
// même chose en même temps.
export function quotaEmail({ eventName, ownerUrl, guestCount, maxGuests, prenom, upgradeMaxGuests, upgradePrice, coOrga }) {
  const qui = prenom ? `<strong>${prenom}</strong>` : `Un participant`
  // Pas de palier au-dessus : on est au plus grand format, le tarif se fait à la
  // main. Le bouton mène alors vers nous, pas vers un paiement qui n'existe pas.
  const surMesure = !upgradeMaxGuests
  const offre = surMesure
    ? 'Nous écrire pour agrandir →'
    : `Passer à ${upgradeMaxGuests} participants${upgradePrice ? ` (${upgradePrice})` : ''} →`
  const lien = surMesure ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Plus de ${maxGuests} participants : ${eventName}`)}` : ownerUrl
  return {
    subject: prenom
      ? `${prenom} attend d’entrer : « ${eventName} »`
      : `Un participant attend d’entrer : « ${eventName} »`,
    html: layout({
      title: prenom ? `${prenom} attend d’entrer` : `Un participant attend d’entrer`,
      intro: `${qui} vient de scanner le QR code de « <strong>${eventName}</strong> », mais la formule est complète : elle couvre <strong>${maxGuests} participants</strong> et ils sont déjà ${guestCount}.`,
      body: `${bigButton(lien, offre)}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${surMesure
            ? `Au-delà de ${maxGuests} participants, nous établissons un tarif sur mesure : écrivez-nous et
               nous ouvrons l’accès dans la foulée. <strong style="color:#221A12;">Vos autres participants
               continuent de photographier normalement</strong> pendant ce temps.`
            : `Un seul geste et ${prenom ? 'elle' : 'la personne'} entre aussitôt : son écran s’ouvrira
               tout seul, elle n’a rien à refaire. <strong style="color:#221A12;">Vos autres participants
               continuent de photographier normalement</strong> pendant ce temps.`}
        </div>
        ${coOrga ? `<div style="margin-top:20px;padding:14px 16px;background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:12px;font-size:13.5px;line-height:1.6;color:#5f5341;">
          <strong style="color:#221A12;">${coOrga.ownerName || 'L’organisateur'} a reçu la même alerte.</strong>
          Un seul de vous deux a besoin de régler : voyez avec ${coOrga.ownerName || 'lui'} si vous
          êtes ensemble, sinon n’attendez pas : la personne est à la porte.
        </div>` : ''}`,
      footer: surMesure
        ? `Répondez simplement à ce message si c’est plus simple : nous vous recontactons vite.`
        : `Vous ne réglez que la différence : ce qui a déjà été payé reste acquis.`,
    }),
  }
}

// ---------- Lien d'accès personnel d'un participant ----------
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

// ---------- Envoi du lien de l'album aux participants qui ont laissé leur mail ----------
// C'est la seule raison pour laquelle on demande leur adresse : le message
// le dit, et le pied de page le rappelle.
export function albumReadyEmail({ eventName, galleryUrl, photoCount, guestName }) {
  const bonjour = guestName ? `Bonjour ${guestName},` : 'Bonjour,'
  return {
    subject: `Les photos de « ${eventName} » sont en ligne 📸`,
    html: layout({
      title: `Les photos sont sorties`,
      intro: `${bonjour} l'album de « <strong>${eventName}</strong> » vient de s'ouvrir : <strong>${photoCount} photo${photoCount > 1 ? 's' : ''}</strong> prises par tous les participants, y compris les vôtres.`,
      body: `${bigButton(galleryUrl, "Voir l'album →")}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Vous pouvez les regarder, les télécharger, et retrouver celles que vous avez prises.
        </div>
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;">
          Une photo vous marque ? Touchez le <strong>cœur</strong> en bas à droite.
          Les préférées du groupe seront réunies et vous seront envoyées dans quelques jours.
        </div>`,
      // Le pied de page ne peut plus dire « uniquement pour cela » : le mail des
      // photos préférées part quelques jours plus tard. Il dit maintenant la
      // même chose que la phrase affichée quand on laisse son adresse.
      footer: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement, pour les informations liées à celui-ci et rien d'autre. Elle n'est ni utilisée à des fins publicitaires, ni transmise à qui que ce soit, et sera supprimée avec l'album.`,
    }),
  }
}

// ---------- Les photos préférées, quelques jours après ----------
//
// Le seul autre envoi que reçoit un participant. Il rend un service (les
// images que le groupe a élues, qu'on n'aurait pas retrouvées seul) et il
// ramène du monde dans l'album, ce qui fait remonter les votes.
//
// À n'envoyer qu'aux adresses laissées APRÈS le 10 septembre 2026 : avant
// cette date, la phrase affichée sous le champ mail ne promettait qu'un seul
// envoi, et elle engage.
export function photosPrefereesEmail({ eventName, galleryUrl, top = [], votants }) {
  const vignettes = top
    .filter((t) => t.url)
    .slice(0, 3)
    .map((t) => `<td width="33%" style="padding:0 4px;">
        <img src="${t.url}" width="140" alt="" style="display:block;width:100%;border-radius:10px;" />
      </td>`)
    .join('')

  const combien = votants > 1
    ? `Vous étiez <strong>${votants}</strong> à voter.`
    : 'Les votes sont tombés.'

  return {
    subject: `Les photos préférées de « ${eventName} » ♥`,
    html: layout({
      title: 'Les photos que vous avez préférées',
      intro: `${combien} Voici les clichés de « <strong>${eventName}</strong> » qui ont rassemblé le plus de cœurs.`,
      body: `${vignettes ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;"><tr>${vignettes}</tr></table>` : ''}
        ${bigButton(galleryUrl, "Revoir l'album →")}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Le classement bouge encore : touchez le cœur sous une photo pour ajouter votre voix.
        </div>`,
      footer: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement, pour les informations liées à celui-ci et rien d'autre. Elle n'est ni utilisée à des fins publicitaires, ni transmise à qui que ce soit, et sera supprimée avec l'album.`,
    }),
  }
}

// ---------- Le participant a demandé à retrouver ses photos ----------
// Répond à la page de connexion quand l'adresse n'est pas celle d'un
// organisateur, mais celle de quelqu'un qui a photographié une soirée.
// Pas de code à saisir ici : un seul lien, qui rattache toutes ses
// participations au téléphone sur lequel il l'ouvre.
export function retrouverPhotosEmail({ albums, link }) {
  const liste = albums
    .map((a) => `<li style="margin-bottom:6px;"><strong style="color:#221A12;">${a.name}</strong>${a.revele ? '' : ' (album pas encore ouvert)'}</li>`)
    .join('')
  const pluriel = albums.length > 1
  return {
    subject: 'Retrouvez vos photos 📸',
    text:
      `Voici votre lien pour retrouver vos photos : ${link}\n\n` +
      `Ouvrez-le sur le téléphone avec lequel vous voulez voir vos photos : il y rattache vos participations.`,
    html: layout({
      title: 'Vos photos vous attendent',
      intro: pluriel
        ? `Vous avez participé à ces albums :<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`
        : `Vous avez participé à l'album de :<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
      body: `${bigButton(link, 'Retrouver mes photos →')}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          Ouvrez ce lien sur le téléphone où vous voulez voir vos photos : il y rattache
          ${pluriel ? 'vos participations' : 'votre participation'}, vos poses restantes comprises.
          Aucun code à saisir.
        </div>`,
      footer: `Vous recevez ce message parce que quelqu'un a demandé à retrouver les photos liées à cette adresse. Si ce n'est pas vous, ignorez ce mail : il ne donne accès qu'aux albums auxquels vous avez participé. Ce lien vous est personnel, ne le transférez pas.`,
    }),
  }
}
