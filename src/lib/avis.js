// ============================================================
//  Le questionnaire de satisfaction, en un seul endroit.
//
//  Les libellés servent trois écrans à la fois : l'encart dans l'album, la
//  page d'enquête ouverte depuis un mail, et l'admin qui relit les réponses.
//  Les garder ici évite qu'un intitulé change d'un côté et pas de l'autre —
//  auquel cas les réponses d'avant et d'après ne se compareraient plus.
//
//  Aucune dépendance serveur : ce fichier est lu par le navigateur.
// ============================================================

// Trois choses en face d'une case cochée : ce qu'on affiche, ce qu'on
// redemande derrière, et un exemple. L'exemple n'est pas décoratif — sans lui
// on récolte « ça marchait pas », avec lui on apprend où les gens ont cherché.
export const SOUCIS_INVITE = [
  { id: 'ok', label: "Non, c'était fluide", ok: true },
  {
    id: 'qr',
    label: "J'ai galéré à scanner le QR code",
    relance: 'Avec quoi avez-vous essayé ?',
    exemple: "Ex. : l'appareil photo du téléphone, une appli de scan, Snapchat…",
  },
  {
    id: 'camera',
    label: "L'appareil photo n'a pas voulu s'ouvrir",
    relance: 'Une fenêtre vous a-t-elle demandé une autorisation ? Qu’avez-vous répondu ?',
    exemple: "Ex. : j'ai refusé sans faire attention, aucune fenêtre n'est apparue…",
  },
  {
    id: 'lien',
    label: "Je n'ai pas retrouvé le lien de l'album",
    relance: 'Où êtes-vous allé le chercher en premier ?',
    exemple: "Ex. : dans mes mails, dans mon historique, j'ai redemandé à l'organisateur…",
  },
  {
    id: 'autre',
    label: 'Autre',
    relance: "Qu'est-ce qui s'est passé ?",
    exemple: 'En une phrase, même approximative.',
  },
]

export const SOUCIS_ORGA = [
  { id: 'ok', label: "Non, tout s'est bien passé", ok: true },
  {
    id: 'qr',
    label: "Des invités n'ont pas réussi à scanner le QR code",
    relance: 'Combien, à peu près, et avec quels téléphones ?',
    exemple: 'Ex. : deux ou trois personnes, plutôt des iPhone…',
  },
  {
    id: 'camera',
    label: "Des invités n'ont pas réussi à ouvrir l'appareil photo",
    relance: "Qu'est-ce qu'ils voyaient à l'écran ?",
    exemple: "Ex. : un écran noir, un message d'autorisation…",
  },
  {
    id: 'lien',
    label: "Des invités n'ont pas retrouvé le lien de l'album",
    relance: 'Comment ont-ils fini par le retrouver ?',
    exemple: 'Ex. : je leur ai renvoyé le lien moi-même…',
  },
  {
    id: 'reveal',
    label: "Je n'ai pas bien compris quand les photos allaient se révéler",
    relance: 'À quel moment avez-vous hésité ?',
    exemple: "Ex. : à la création, en choisissant la date…",
  },
  {
    id: 'paiement',
    label: 'J’ai eu un souci avec la formule ou le paiement',
    relance: 'À quel moment ça a bloqué ?',
    exemple: 'Ex. : au moment de payer, en changeant de formule…',
  },
  {
    id: 'autre',
    label: 'Autre',
    relance: "Qu'est-ce qui s'est passé ?",
    exemple: 'En une phrase, même approximative.',
  },
]

export const PREFEREES = [
  { id: 'limite', label: 'Le nombre de photos limité' },
  { id: 'suspense', label: 'Le suspense : personne ne voit rien avant la révélation' },
  { id: 'jetable', label: 'Le rendu façon appareil jetable' },
  { id: 'sansappli', label: 'Pas d’application à installer' },
  { id: 'album', label: 'L’album partagé à la fin' },
  { id: 'autre', label: 'Autre chose' },
]

export const SOURCES = [
  { id: 'google', label: 'Google' },
  { id: 'reseaux', label: 'Instagram / TikTok' },
  { id: 'bouche', label: 'Un ami m’en a parlé' },
  { id: 'invite', label: 'J’étais invité à un événement Time to Flash' },
  { id: 'article', label: 'Un article de blog' },
  { id: 'autre', label: 'Autre' },
]

export const NOTES = [
  { valeur: 1, emoji: '😞', mot: 'Bof' },
  { valeur: 2, emoji: '😐', mot: 'Moyen' },
  { valeur: 3, emoji: '🙂', mot: 'Bien' },
  { valeur: 4, emoji: '😍', mot: 'Génial' },
]

export const REFERAIT = [
  { id: 'oui', label: 'Oui' },
  { id: 'peut-etre', label: 'Peut-être' },
  { id: 'non', label: 'Non' },
]

// Le cadrage promis aux répondants : ils font partie des tout premiers, et
// c'est vrai. C'est la seule raison pour laquelle on se permet de les
// interrompre — autant le dire au même endroit partout.
export const ACCROCHE = 'Vous faites partie des 1000 premiers utilisateurs de Time to Flash.'

const par = (liste) => Object.fromEntries(liste.map((x) => [x.id, x.label]))
const LIB = {
  ...par(SOUCIS_INVITE), ...par(SOUCIS_ORGA), ...par(PREFEREES), ...par(SOURCES),
}

export function libelle(id) {
  return LIB[id] || id
}

export function souciDe(role) {
  return role === 'organisateur' ? SOUCIS_ORGA : SOUCIS_INVITE
}

// L'identité technique brute est illisible : on en tire les deux seules
// informations qui servent à reproduire une panne — la machine et le
// navigateur. C'est la combinaison des deux qui trahit un bug (« la caméra ne
// s'ouvre pas dans le navigateur d'Instagram sur iPhone »), jamais l'une seule.
export function resumeAppareil(ua) {
  if (!ua) return null
  const machine =
    /iPhone/i.test(ua) ? 'iPhone'
      : /iPad/i.test(ua) ? 'iPad'
        : /Android/i.test(ua) ? 'Android'
          : /Macintosh/i.test(ua) ? 'Mac'
            : /Windows/i.test(ua) ? 'Windows'
              : 'Appareil inconnu'
  // Ordre important : ces navigateurs se déclarent tous « Safari » ou
  // « Chrome » en plus de leur propre nom. Le premier reconnu gagne.
  const nav =
    /Instagram/i.test(ua) ? 'dans Instagram'
      : /FBAV|FBAN/i.test(ua) ? 'dans Facebook'
        : /Snapchat/i.test(ua) ? 'dans Snapchat'
          : /EdgA?\//i.test(ua) ? 'Edge'
            : /(FxiOS|Firefox)/i.test(ua) ? 'Firefox'
              : /(CriOS|Chrome)/i.test(ua) ? 'Chrome'
                : /Safari/i.test(ua) ? 'Safari'
                  : null
  return nav ? `${machine} · ${nav}` : machine
}

// Ce qui doit vous réveiller tout de suite, par opposition à ce qui peut
// attendre le récap du lendemain : un problème signalé, ou quelqu'un de
// mécontent. Le reste, aussi agréable soit-il, n'appelle aucune réaction.
export function estUneAlerte(avis) {
  if (!avis) return false
  const soucis = (avis.issues || []).filter((i) => i !== 'ok')
  if (soucis.length) return true
  if (Number.isFinite(avis.nps) && avis.nps <= 6) return true
  if (Number.isFinite(avis.rating) && avis.rating <= 2) return true
  return false
}
