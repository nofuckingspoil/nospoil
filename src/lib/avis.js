// ============================================================
//  Le questionnaire de satisfaction, en un seul endroit.
//
//  Les libellés servent trois écrans à la fois : l'encart dans l'album, la
//  page d'enquête ouverte depuis un mail, et l'admin qui relit les réponses.
//  Les garder ici évite qu'un intitulé change d'un côté et pas de l'autre, 
//  auquel cas les réponses d'avant et d'après ne se compareraient plus.
//
//  Aucune dépendance serveur : ce fichier est lu par le navigateur.
// ============================================================

// Trois choses en face d'une case cochée : ce qu'on affiche, ce qu'on
// redemande derrière, et un exemple. L'exemple n'est pas décoratif : sans lui
// on récolte « ça marchait pas », avec lui on apprend où les gens ont cherché.
//
// La case « tout allait bien » n'est plus affichée : la question se pose
// maintenant par oui ou par non, et cette liste n'apparaît qu'après un « oui ».
// L'entrée reste ici pour que les réponses déjà enregistrées gardent un nom.
export const SOUCIS_INVITE = [
  { id: 'ok', label: 'Tout a marché du premier coup', ok: true },
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
  { id: 'ok', label: 'Tout a marché, personne ne m’a rien signalé', ok: true },
  {
    id: 'qr',
    label: "Des participants n'ont pas réussi à scanner le QR code",
    relance: 'Combien, à peu près, et avec quels téléphones ?',
    exemple: 'Ex. : deux ou trois personnes, plutôt des iPhone…',
  },
  {
    id: 'camera',
    label: "Des participants n'ont pas réussi à ouvrir l'appareil photo",
    relance: "Qu'est-ce qu'ils voyaient à l'écran ?",
    exemple: "Ex. : un écran noir, un message d'autorisation…",
  },
  {
    id: 'lien',
    label: "Des participants n'ont pas retrouvé le lien de l'album",
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
  { id: 'invite', label: 'J’étais participant à un événement Time to Flash' },
  { id: 'article', label: 'Un article de blog' },
  { id: 'autre', label: 'Autre' },
]

// Cinq étoiles, depuis le 9 septembre 2026. Avant, c'étaient quatre crans à
// émojis (Bof, Moyen, Bien, Génial) : les réponses d'avant cette date sont sur
// l'ancienne échelle et ne se comparent pas aux nouvelles, l'admin le rappelle.
//
// Cinq étoiles parce que c'est le geste que tout le monde a déjà fait cent
// fois, et qu'il ne demande aucune lecture : on tape la troisième étoile sans
// avoir lu un seul mot. Quatre libellés à comparer, c'était déjà un effort.
export const NOTES = [
  { valeur: 1, emoji: '★', mot: 'Décevant' },
  { valeur: 2, emoji: '★', mot: 'Moyen' },
  { valeur: 3, emoji: '★', mot: 'Bien' },
  { valeur: 4, emoji: '★', mot: 'Très bien' },
  { valeur: 5, emoji: '★', mot: 'Génial' },
]

/** La date du passage aux cinq étoiles, pour que l'admin sache lire les vieux avis. */
export const NOTES_DEPUIS = '2026-09-09'

// La grande question ouverte, reformulée selon la note qu'on vient de donner.
//
// « Un commentaire ? » posé à tout le monde ne récolte rien : la question est
// trop vaste, on ne sait pas par quel bout la prendre. Reprendre la note dans
// la question fait le travail à la place du répondant : quelqu'un qui vient de
// cliquer « Bof » a déjà quelque chose sur le cœur, il suffit de lui ouvrir la
// porte. Et le mécontent comme l'enthousiaste ne racontent pas la même chose :
// à l'un on demande ce qui a raté, à l'autre ce qu'il ne faut pas casser.
const REACTIONS_INVITE = {
  1: { q: 'Qu’est-ce qui vous a déçu ?', ph: 'Dites-le franchement : c’est ce qui nous fait le plus avancer.' },
  2: { q: 'Qu’est-ce qui aurait rendu ça vraiment bien ?', ph: 'Le détail qui manquait, le moment où c’est retombé…' },
  3: { q: 'Qu’est-ce qui vous a plu, et qu’est-ce qui manquait pour que ce soit génial ?', ph: 'Les deux nous intéressent, même en une phrase.' },
  4: { q: 'Qu’est-ce qui vous a plu, et qu’est-ce qui manquait pour la cinquième étoile ?', ph: 'Les deux nous intéressent, même en une phrase.' },
  5: { q: 'Qu’est-ce qui vous a le plus plu ?', ph: 'Le moment, le détail, la surprise… Racontez.' },
}

const REACTIONS_ORGA = {
  1: { q: 'Qu’est-ce qui n’a pas marché ?', ph: 'Soyez direct, on préfère l’entendre de vous.' },
  2: { q: 'Qu’est-ce qui vous a laissé sur votre faim ?', ph: 'Ce que vous attendiez et qui n’est pas venu…' },
  3: { q: 'Qu’est-ce qui a bien marché, et qu’est-ce qui a manqué pour que ce soit génial ?', ph: 'Les deux nous intéressent, même en une phrase.' },
  4: { q: 'Qu’est-ce qui a bien marché, et qu’est-ce qui manquait pour la cinquième étoile ?', ph: 'Les deux nous intéressent, même en une phrase.' },
  5: { q: 'Racontez-nous : qu’est-ce qui a le mieux marché ?', ph: 'Le moment où vous avez vu que ça prenait, la réaction des participants…' },
}

export function reactionA(role, note, langue) {
  const l = lg(langue)
  const orga = role === 'organisateur'
  const table = l === 'fr'
    ? (orga ? REACTIONS_ORGA : REACTIONS_INVITE)
    : TRAD[l][orga ? 'reactionsOrga' : 'reactionsInvite']
  return table[note] || null
}

// Le oui/non qui commande la liste des soucis.
export const PROBLEME = [
  { id: 'non', label: 'Non, tout a marché' },
  { id: 'oui', label: 'Oui' },
]

export const REFERAIT = [
  { id: 'oui', label: 'Oui' },
  { id: 'peut-etre', label: 'Peut-être' },
  { id: 'non', label: 'Non' },
]

// Le cadrage promis aux répondants : ils font partie des tout premiers, et
// c'est vrai. C'est la seule raison pour laquelle on se permet de les
// interrompre : autant le dire au même endroit partout.
export const ACCROCHE = 'Vous faites partie des 1000 premiers utilisateurs de Time to Flash.'

const par = (liste) => Object.fromEntries(liste.map((x) => [x.id, x.label]))
const LIB = {
  ...par(SOUCIS_INVITE), ...par(SOUCIS_ORGA), ...par(PREFEREES), ...par(SOURCES),
  // Répondu « oui, j'ai eu un problème » sans cocher lequel. Ça reste un
  // problème : il doit compter dans les alertes comme dans les statistiques.
  nonprecise: 'Un problème, sans plus de précision',
}

export function libelle(id) {
  return LIB[id] || id
}

// ------------------------------------------------------------
//  Traductions (anglais, allemand).
//
//  Les listes ci-dessus restent en français : l'admin les lit, et l'app les
//  importe telles quelles. Pour les AFFICHER à un répondant, passer par les
//  fonctions ci-dessous, qui prennent une langue facultative (sinon celle du
//  navigateur ou de l'app). Les `id` ne changent jamais : ce sont eux qu'on
//  enregistre.
// ------------------------------------------------------------
const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr
const lg = (l) => (l || globalThis.__ttfLangue) === 'en' ? 'en' : (l || globalThis.__ttfLangue) === 'de' ? 'de' : 'fr'

const TRAD = {
  en: {
    invite: {
      ok: { label: 'Everything worked first time' },
      qr: { label: 'I struggled to scan the QR code', relance: 'What did you try with?', exemple: 'E.g. the phone camera, a scanner app, Snapchat…' },
      camera: { label: "The camera wouldn't open", relance: 'Did a window ask you for permission? What did you answer?', exemple: "E.g. I said no without thinking, no window appeared…" },
      lien: { label: "I couldn't find the album link again", relance: 'Where did you look for it first?', exemple: 'E.g. in my emails, in my history, I asked the host again…' },
      autre: { label: 'Other', relance: 'What happened?', exemple: 'In one sentence, even a rough one.' },
    },
    orga: {
      ok: { label: 'Everything worked, nobody reported anything to me' },
      qr: { label: "Some guests couldn't scan the QR code", relance: 'Roughly how many, and with which phones?', exemple: 'E.g. two or three people, mostly iPhones…' },
      camera: { label: "Some guests couldn't open the camera", relance: 'What did they see on screen?', exemple: 'E.g. a black screen, a permission message…' },
      lien: { label: "Some guests couldn't find the album link again", relance: 'How did they end up finding it?', exemple: 'E.g. I sent them the link again myself…' },
      reveal: { label: "I wasn't sure when the photos would be revealed", relance: 'At what point were you unsure?', exemple: 'E.g. when creating the event, when choosing the date…' },
      paiement: { label: 'I had a problem with the plan or the payment', relance: 'At what point did it get stuck?', exemple: 'E.g. when paying, when changing plan…' },
      autre: { label: 'Other', relance: 'What happened?', exemple: 'In one sentence, even a rough one.' },
    },
    preferees: {
      limite: 'The limited number of photos',
      suspense: 'The suspense: nobody sees anything before the reveal',
      jetable: 'The disposable camera look',
      sansappli: 'No app to install',
      album: 'The shared album at the end',
      autre: 'Something else',
    },
    sources: {
      google: 'Google',
      reseaux: 'Instagram / TikTok',
      bouche: 'A friend told me about it',
      invite: 'I was a guest at a Time to Flash event',
      article: 'A blog post',
      autre: 'Other',
    },
    notes: { 1: 'Disappointing', 2: 'Average', 3: 'Good', 4: 'Very good', 5: 'Brilliant' },
    reactionsInvite: {
      1: { q: 'What disappointed you?', ph: 'Be honest: that is what helps us improve the most.' },
      2: { q: 'What would have made it really good?', ph: 'The missing detail, the moment it fell flat…' },
      3: { q: 'What did you like, and what was missing to make it brilliant?', ph: 'We want to hear both, even in one sentence.' },
      4: { q: 'What did you like, and what was missing for the fifth star?', ph: 'We want to hear both, even in one sentence.' },
      5: { q: 'What did you like most?', ph: 'The moment, the detail, the surprise… Tell us.' },
    },
    reactionsOrga: {
      1: { q: "What didn't work?", ph: "Be direct, we'd rather hear it from you." },
      2: { q: 'What left you wanting more?', ph: "What you expected and didn't get…" },
      3: { q: 'What worked well, and what was missing to make it brilliant?', ph: 'We want to hear both, even in one sentence.' },
      4: { q: 'What worked well, and what was missing for the fifth star?', ph: 'We want to hear both, even in one sentence.' },
      5: { q: 'Tell us: what worked best?', ph: 'The moment you saw it catching on, how your guests reacted…' },
    },
    probleme: { non: 'No, everything worked', oui: 'Yes' },
    referait: { oui: 'Yes', 'peut-etre': 'Maybe', non: 'No' },
    accroche: 'You are one of the first 1,000 people to use Time to Flash.',
  },
  de: {
    invite: {
      ok: { label: 'Alles hat auf Anhieb funktioniert' },
      qr: { label: 'Ich hatte Mühe, den QR-Code zu scannen', relance: 'Womit haben Sie es versucht?', exemple: 'Z. B. mit der Handykamera, einer Scanner-App, Snapchat…' },
      camera: { label: 'Die Kamera wollte sich nicht öffnen', relance: 'Hat ein Fenster Sie um eine Erlaubnis gebeten? Was haben Sie geantwortet?', exemple: 'Z. B. ich habe ohne nachzudenken abgelehnt, es ist kein Fenster erschienen…' },
      lien: { label: 'Ich habe den Link zum Album nicht wiedergefunden', relance: 'Wo haben Sie zuerst danach gesucht?', exemple: 'Z. B. in meinen E-Mails, in meinem Verlauf, ich habe den Gastgeber noch einmal gefragt…' },
      autre: { label: 'Sonstiges', relance: 'Was ist passiert?', exemple: 'In einem Satz, auch gern ungefähr.' },
    },
    orga: {
      ok: { label: 'Alles hat funktioniert, niemand hat mir etwas gemeldet' },
      qr: { label: 'Einige Gäste konnten den QR-Code nicht scannen', relance: 'Ungefähr wie viele, und mit welchen Handys?', exemple: 'Z. B. zwei oder drei Personen, eher iPhones…' },
      camera: { label: 'Einige Gäste konnten die Kamera nicht öffnen', relance: 'Was haben sie auf dem Bildschirm gesehen?', exemple: 'Z. B. einen schwarzen Bildschirm, eine Berechtigungsanfrage…' },
      lien: { label: 'Einige Gäste haben den Link zum Album nicht wiedergefunden', relance: 'Wie haben sie ihn schließlich gefunden?', exemple: 'Z. B. ich habe ihnen den Link selbst noch einmal geschickt…' },
      reveal: { label: 'Mir war nicht klar, wann die Fotos präsentiert werden', relance: 'An welcher Stelle waren Sie unsicher?', exemple: 'Z. B. beim Erstellen, bei der Wahl des Datums…' },
      paiement: { label: 'Ich hatte ein Problem mit dem Paket oder der Zahlung', relance: 'An welcher Stelle hat es gehakt?', exemple: 'Z. B. beim Bezahlen, beim Wechsel des Pakets…' },
      autre: { label: 'Sonstiges', relance: 'Was ist passiert?', exemple: 'In einem Satz, auch gern ungefähr.' },
    },
    preferees: {
      limite: 'Die begrenzte Anzahl an Fotos',
      suspense: 'Die Spannung: Niemand sieht etwas vor der Präsentation',
      jetable: 'Der Look einer Einwegkamera',
      sansappli: 'Keine App zu installieren',
      album: 'Das gemeinsame Album am Ende',
      autre: 'Etwas anderes',
    },
    sources: {
      google: 'Google',
      reseaux: 'Instagram / TikTok',
      bouche: 'Ein Freund hat mir davon erzählt',
      invite: 'Ich war Gast bei einem Time to Flash Event',
      article: 'Ein Blogartikel',
      autre: 'Sonstiges',
    },
    notes: { 1: 'Enttäuschend', 2: 'Mittelmäßig', 3: 'Gut', 4: 'Sehr gut', 5: 'Großartig' },
    reactionsInvite: {
      1: { q: 'Was hat Sie enttäuscht?', ph: 'Sagen Sie es ehrlich: Das hilft uns am meisten weiter.' },
      2: { q: 'Was hätte es richtig gut gemacht?', ph: 'Das fehlende Detail, der Moment, in dem die Stimmung kippte…' },
      3: { q: 'Was hat Ihnen gefallen, und was hat gefehlt, damit es großartig wird?', ph: 'Beides interessiert uns, auch in einem Satz.' },
      4: { q: 'Was hat Ihnen gefallen, und was hat für den fünften Stern gefehlt?', ph: 'Beides interessiert uns, auch in einem Satz.' },
      5: { q: 'Was hat Ihnen am besten gefallen?', ph: 'Der Moment, das Detail, die Überraschung… Erzählen Sie.' },
    },
    reactionsOrga: {
      1: { q: 'Was hat nicht funktioniert?', ph: 'Seien Sie direkt, wir hören es lieber von Ihnen.' },
      2: { q: 'Was hat Ihnen gefehlt?', ph: 'Was Sie erwartet haben und was nicht kam…' },
      3: { q: 'Was hat gut funktioniert, und was hat gefehlt, damit es großartig wird?', ph: 'Beides interessiert uns, auch in einem Satz.' },
      4: { q: 'Was hat gut funktioniert, und was hat für den fünften Stern gefehlt?', ph: 'Beides interessiert uns, auch in einem Satz.' },
      5: { q: 'Erzählen Sie: Was hat am besten funktioniert?', ph: 'Der Moment, in dem Sie gemerkt haben, dass es ankommt, die Reaktion Ihrer Gäste…' },
    },
    probleme: { non: 'Nein, alles hat funktioniert', oui: 'Ja' },
    referait: { oui: 'Ja', 'peut-etre': 'Vielleicht', non: 'Nein' },
    accroche: 'Sie gehören zu den ersten 1.000 Nutzern von Time to Flash.',
  },
}

// Liste des soucis (invité ou organisateur), dans la langue voulue.
export function souciDe(role, langue) {
  const base = role === 'organisateur' ? SOUCIS_ORGA : SOUCIS_INVITE
  const l = lg(langue)
  if (l === 'fr') return base
  const table = TRAD[l][role === 'organisateur' ? 'orga' : 'invite']
  return base.map((x) => ({ ...x, ...(table[x.id] || {}) }))
}

const traduireListe = (liste, cle, langue) => {
  const l = lg(langue)
  if (l === 'fr') return liste
  return liste.map((x) => ({ ...x, label: TRAD[l][cle][x.id] ?? x.label }))
}

export function preferees(langue) { return traduireListe(PREFEREES, 'preferees', langue) }
export function sources(langue) { return traduireListe(SOURCES, 'sources', langue) }
export function probleme(langue) { return traduireListe(PROBLEME, 'probleme', langue) }
export function referait(langue) { return traduireListe(REFERAIT, 'referait', langue) }

export function notes(langue) {
  const l = lg(langue)
  if (l === 'fr') return NOTES
  return NOTES.map((n) => ({ ...n, mot: TRAD[l].notes[n.valeur] ?? n.mot }))
}

export function accroche(langue) {
  return tr({ fr: ACCROCHE, en: TRAD.en.accroche, de: TRAD.de.accroche }, langue)
}

// L'identité technique brute est illisible : on en tire les deux seules
// informations qui servent à reproduire une panne : la machine et le
// navigateur. C'est la combinaison des deux qui trahit un bug (« la caméra ne
// s'ouvre pas dans le navigateur d'Instagram sur iPhone »), jamais l'une seule.
export function resumeAppareil(ua) {
  if (!ua) return null
  // L'app et l'extrait d'app ne sont pas des navigateurs : leur identité est
  // celle du moteur réseau du téléphone (« Clip/55 CFNetwork/… Darwin/… » sur
  // iPhone, « okhttp/4… » sur Android). L'extrait s'appelle « Clip ».
  if (/CFNetwork|Darwin/i.test(ua)) return /^Clip\//.test(ua) ? "iPhone · extrait d'app" : 'iPhone · app'
  if (/^okhttp/i.test(ua)) return 'Android · app'
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
