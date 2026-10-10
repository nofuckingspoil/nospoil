// ============================================================
//  Programme partenaires : ce que partagent les pages /pro/*, le formulaire
//  de fiche, l'API et la page /partenaires.
//
//  L'offre (décision de Clément, 10/10/2026) : 3 codes PAR DÉPARTEMENT, un
//  code par professionnel validé. Un code = un événement offert, jusqu'à 200
//  participants. Les textes de la maquette (« 3 codes pour chacun ») ont été
//  adaptés en conséquence : ne jamais promettre plus d'un code par pro.
//
//  Les fiches vivent dans la table demandes_pro (colonnes ajoutées par
//  partenaires.sql). Seules les colonnes publiques sortent sur le site :
//  jamais le prénom, le nom, l'e-mail ni le téléphone.
//
//  Pages en français seulement pour l'instant (/en/pro et /de/pro gardent
//  l'ancienne page de demande).
// ============================================================

import { TIERS, formatPrice } from './pricing'

// Les trois métiers de la maquette. `id` = valeur stockée (même liste que
// lib/pro.js), `slug` = adresse de la landing.
export const METIERS_FICHE = {
  planner: { id: 'wedding_planner', slug: 'wedding-planners', label: 'Wedding planner', pluriel: 'Wedding planners' },
  lieu: { id: 'lieu', slug: 'lieux-de-reception', label: 'Lieu de réception', pluriel: 'Lieux de réception' },
  photo: { id: 'photographe', slug: 'photographes', label: 'Photographe', pluriel: 'Photographes' },
}
export const CLE_PAR_ID = Object.fromEntries(Object.entries(METIERS_FICHE).map(([k, m]) => [m.id, k]))
export const CLE_PAR_SLUG = Object.fromEntries(Object.entries(METIERS_FICHE).map(([k, m]) => [m.slug, k]))
export const estCleMetier = (k) => Object.prototype.hasOwnProperty.call(METIERS_FICHE, k)

// L'événement offert : la formule jusqu'à 200 participants.
const TIER_OFFERT = TIERS.find((t) => t.maxGuests === 200) || TIERS[TIERS.length - 1]
export const OFFRE = {
  invites: TIER_OFFERT.maxGuests,
  valeur: formatPrice(TIER_OFFERT.priceCents, 'fr'),
  codesParDepartement: 3,
  annee: 2027,
}

// ---------- Départements ----------
export const DEPTS = Object.fromEntries('01:Ain,02:Aisne,03:Allier,04:Alpes-de-Haute-Provence,05:Hautes-Alpes,06:Alpes-Maritimes,07:Ardèche,08:Ardennes,09:Ariège,10:Aube,11:Aude,12:Aveyron,13:Bouches-du-Rhône,14:Calvados,15:Cantal,16:Charente,17:Charente-Maritime,18:Cher,19:Corrèze,2A:Corse-du-Sud,2B:Haute-Corse,21:Côte-d’Or,22:Côtes-d’Armor,23:Creuse,24:Dordogne,25:Doubs,26:Drôme,27:Eure,28:Eure-et-Loir,29:Finistère,30:Gard,31:Haute-Garonne,32:Gers,33:Gironde,34:Hérault,35:Ille-et-Vilaine,36:Indre,37:Indre-et-Loire,38:Isère,39:Jura,40:Landes,41:Loir-et-Cher,42:Loire,43:Haute-Loire,44:Loire-Atlantique,45:Loiret,46:Lot,47:Lot-et-Garonne,48:Lozère,49:Maine-et-Loire,50:Manche,51:Marne,52:Haute-Marne,53:Mayenne,54:Meurthe-et-Moselle,55:Meuse,56:Morbihan,57:Moselle,58:Nièvre,59:Nord,60:Oise,61:Orne,62:Pas-de-Calais,63:Puy-de-Dôme,64:Pyrénées-Atlantiques,65:Hautes-Pyrénées,66:Pyrénées-Orientales,67:Bas-Rhin,68:Haut-Rhin,69:Rhône,70:Haute-Saône,71:Saône-et-Loire,72:Sarthe,73:Savoie,74:Haute-Savoie,75:Paris,76:Seine-Maritime,77:Seine-et-Marne,78:Yvelines,79:Deux-Sèvres,80:Somme,81:Tarn,82:Tarn-et-Garonne,83:Var,84:Vaucluse,85:Vendée,86:Vienne,87:Haute-Vienne,88:Vosges,89:Yonne,90:Territoire de Belfort,91:Essonne,92:Hauts-de-Seine,93:Seine-Saint-Denis,94:Val-de-Marne,95:Val-d’Oise,971:Guadeloupe,972:Martinique,973:Guyane,974:La Réunion,976:Mayotte'.split(',').map((s) => s.split(':')))

// « 60500 » → { num: '60', nom: 'Oise' }. Corse : 200-201 → 2A, sinon 2B.
export function deptDuCodePostal(cp) {
  if (!/^\d{5}$/.test(cp || '')) return null
  let k = cp.slice(0, 2)
  if (k === '20') k = +cp.slice(0, 3) < 202 ? '2A' : '2B'
  else if (k === '97') k = cp.slice(0, 3)
  return DEPTS[k] ? { num: k, nom: DEPTS[k] } : null
}
export const codePostalDansAdresse = (adresse) => ((adresse || '').match(/\b\d{5}\b/) || [])[0] || ''

// ---------- Réseaux sociaux ----------
// Le lien d'un profil, tel que le pro l'a collé (ou reconstruit depuis un
// @pseudo tapé à la main). Renvoie '' si rien, null si ce n'est pas un lien
// du bon réseau (une adresse Facebook dans la case Instagram, par exemple).
const HOTES_RESEAUX = { instagram: /(^|\.)instagram\.com$/i, tiktok: /(^|\.)tiktok\.com$/i, facebook: /(^|\.)(facebook\.com|fb\.com)$/i }
export function versLienReseau(reseau, brut) {
  const v = String(brut || '').trim()
  if (!v) return ''
  if (/[./]/.test(v) && !/^@/.test(v)) {
    let u
    try { u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`) } catch { return null }
    if (!HOTES_RESEAUX[reseau]?.test(u.hostname)) return null
    const chemin = u.pathname.replace(/\/+$/, '')
    if (!chemin) return null
    // Facebook range parfois le profil dans ?id= : on le garde, le reste s'en va.
    const id = reseau === 'facebook' && u.searchParams.get('id') ? `?id=${u.searchParams.get('id')}` : ''
    const hote = /^vm\./i.test(u.hostname) ? u.hostname : /(^|\.)fb\.com$/i.test(u.hostname) ? 'www.facebook.com' : u.hostname.replace(/^(m|web|fr-fr|fr)\./i, 'www.').replace(/^(?!www\.)/, 'www.')
    return `https://${hote}${chemin}${id}`
  }
  const pseudo = v.replace(/^@+/, '')
  return /^[\w.\-]{1,60}$/.test(pseudo) ? lienReseau(reseau, pseudo) : null
}

export function lienReseau(reseau, pseudo) {
  if (/^https?:\/\//i.test(String(pseudo || ''))) return pseudo
  const p = String(pseudo || '').replace(/^@/, '')
  if (!p) return null
  if (reseau === 'instagram') return `https://www.instagram.com/${encodeURIComponent(p)}/`
  if (reseau === 'tiktok') return `https://www.tiktok.com/@${encodeURIComponent(p)}`
  if (reseau === 'facebook') return `https://www.facebook.com/${encodeURIComponent(p)}`
  return null
}
export const siteAffiche = (v) => String(v || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')
export function siteLien(v) {
  const s = String(v || '').trim()
  if (!s) return null
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

// « Plan'On Event » → « plan-on-event »
export function slugifier(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' et ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'partenaire'
}

// ---------- Limites et validation (formulaire et serveur, mêmes règles) ----------
export const LIMITES_FICHE = {
  entreprise: 120, description: 220, site: 200, instagram: 200, tiktok: 200, facebook: 200,
  prenom: 60, nom: 80, email: 160, telephone: 30, adresse: 200,
}

export function validerFiche(f, cle) {
  const e = {}
  if (!String(f.entreprise || '').trim()) e.entreprise = 'Indiquez le nom qui apparaîtra sur la fiche.'
  const job = cle === 'general' ? f.metier : cle
  if (cle === 'general' && !estCleMetier(f.metier)) e.metier = 'Choisissez votre métier.'
  if (job === 'lieu') {
    if (!/\b\d{5}\b/.test(f.adresse || '') || !deptDuCodePostal(codePostalDansAdresse(f.adresse))) e.adresse = 'Ajoutez l’adresse complète, avec le code postal.'
  } else if (!deptDuCodePostal(f.codePostal)) e.codePostal = 'Code postal à 5 chiffres.'
  if (!String(f.description || '').trim()) e.description = 'Deux phrases suffisent.'
  if (!String(f.prenom || '').trim()) e.prenom = 'Requis.'
  if (!String(f.nom || '').trim()) e.nom = 'Requis.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email || '').trim())) e.email = 'Email invalide.'
  if (String(f.telephone || '').replace(/\D/g, '').length < 10) e.telephone = 'Numéro à 10 chiffres.'
  if (!f.accord) e.accord = 'Cochez la case pour que votre fiche puisse être publiée.'
  for (const [k, nom] of [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']]) {
    if (f[k] && versLienReseau(k, f[k]) === null) e[k] = `Ce lien ne ressemble pas à un profil ${nom}.`
  }
  for (const [k, max] of Object.entries(LIMITES_FICHE)) {
    if (f[k] && String(f[k]).length > max && !e[k]) e[k] = 'Texte trop long.'
  }
  return e
}

// ---------- Textes des landings (maquette, adaptés à l'offre) ----------
const FAQ_COMMUNE = [
  { q: 'Est-ce vraiment gratuit ?', a: `Oui. Le code couvre un événement complet, jusqu’à ${OFFRE.invites} participants, sans carte bancaire. Nous en offrons ${OFFRE.codesParDepartement} par département, aux premières fiches validées. La seule chose demandée est votre fiche de présentation.` },
  { q: 'Les invités doivent-ils installer une application ?', a: 'Non. Ils scannent le QR code et l’appareil photo s’ouvre dans leur navigateur.' },
  { q: 'Qui voit les photos ?', a: 'Les mariés et leurs invités, par un lien privé. Avant la révélation, seuls les mariés (et les proches qu’ils ajoutent) voient toutes les photos et peuvent en masquer. Elles sont hébergées dans l’Union européenne et supprimées automatiquement six mois après.' },
]
const QUESTION_PLUS_DE_CODE = { q: `Et si les ${OFFRE.codesParDepartement} codes de mon département sont déjà partis ?`, a: 'Votre fiche peut tout de même être publiée sur notre page partenaires, et nous vous proposons une remise pour vos mariés.' }
const etape1 = (quoi, photo) => ({ n: '01', t: 'Vous présentez ' + quoi, d: 'Quelques lignes et ' + photo + '. C’est la fiche qui apparaîtra sur notre page partenaires.' })
const ETAPE2 = { n: '02', t: 'Nous validons votre fiche', d: 'Chaque fiche est relue par notre équipe avant d’être publiée.' }
const etape3 = (a) => ({ n: '03', t: 'Vous recevez votre code', d: `Par email. Vous l’offrez ${a}, qui crée son événement en quelques minutes.` })
const cite = (qui) => ({ k: 'C', t: qui + ' cité sur un autre site', d: 'Votre fiche est publiée sur notre page partenaires, avec un lien vers votre site.' })
const intro = (qui, quoi) => `Time to Flash transforme le téléphone de chaque invité en appareil photo jetable. Nous ouvrons le programme aux ${qui} : présentez ${quoi}, nous validons votre fiche et vous recevez un événement à offrir à l’un de vos mariés de ${OFFRE.annee}.`

export const LANDINGS = {
  general: {
    titreMeta: 'Programme partenaires : un mariage offert pour vos mariés',
    description: `Wedding planners, lieux de réception, photographes : présentez votre activité et recevez un événement Time to Flash à offrir à l’un de vos mariés de ${OFFRE.annee}. ${OFFRE.codesParDepartement} codes par département.`,
    eyebrow: 'Ouverture du programme partenaires',
    titre: `Un événement offert pour l’un de vos mariés de ${OFFRE.annee}.`,
    intro: 'Time to Flash transforme le téléphone de chaque invité en appareil photo jetable. Nous ouvrons le programme aux professionnels du mariage : présentez votre activité, nous validons votre fiche et vous recevez votre code.',
    etapes: [etape1('votre activité', 'une photo'), ETAPE2, etape3('à l’un de vos mariés')],
    faq: [FAQ_COMMUNE[0], { q: 'Ma fiche est-elle publiée tout de suite ?', a: 'Non. Nous relisons chaque fiche avant de la publier et de vous envoyer votre code.' }, FAQ_COMMUNE[1], FAQ_COMMUNE[2], QUESTION_PLUS_DE_CODE],
    ctaTitre: 'Un mariage à venir ? Offrez-lui Time to Flash.',
  },
  planner: {
    titreMeta: 'Wedding planners : offrez à vos mariés les photos de leurs invités',
    description: `Programme partenaires Time to Flash pour les wedding planners : un événement offert pour l’un de vos mariés de ${OFFRE.annee}, ${OFFRE.codesParDepartement} codes par département.`,
    eyebrow: 'Programme partenaires · Wedding planners',
    titre: 'Offrez à vos mariés les photos de tous leurs invités.',
    intro: intro('wedding planners', 'votre activité'),
    pourLabel: 'Pour les wedding planners',
    avantages: [
      { k: 'A', t: 'Un cadeau qui vous distingue', d: 'Vous offrez l’événement à l’un de vos mariés. C’est une attention de plus dans votre accompagnement, sans coût pour vous.' },
      { k: 'B', t: 'Une question en moins dans le rétroplanning', d: 'Comment récupérer les photos des invités ? La réponse est prête : un QR code sur les tables, un album commun après la fête.' },
      cite('Votre nom'),
    ],
    etapes: [etape1('votre activité', 'une photo'), ETAPE2, etape3('à l’un de vos mariés')],
    faq: [{ q: 'Qui crée l’événement, vous ou vos mariés ?', a: 'Comme vous préférez. Vous transmettez le code à vos mariés, qui créent leur événement en quelques minutes, ou vous le créez vous-même pour eux.' }, ...FAQ_COMMUNE, QUESTION_PLUS_DE_CODE],
    ctaTitre: 'Un mariage à venir ? Offrez-lui Time to Flash.',
  },
  lieu: {
    titreMeta: 'Lieux de réception : un service en plus pour chaque mariage',
    description: `Programme partenaires Time to Flash pour les lieux de réception : rien à installer, un événement offert pour l’un de vos mariés de ${OFFRE.annee}.`,
    eyebrow: 'Programme partenaires · Lieux de réception',
    titre: 'Un service en plus pour chaque mariage que vous accueillez.',
    intro: intro('lieux de réception', 'votre lieu'),
    pourLabel: 'Pour les lieux de réception',
    avantages: [
      { k: 'A', t: 'Un plus dans votre offre', d: 'Vous l’incluez dans la location ou le proposez en option. Le premier événement est offert.' },
      { k: 'B', t: 'Rien à installer, rien à gérer', d: 'Une affiche QR code imprimée sur les tables suffit. Les invités utilisent leur propre téléphone.' },
      cite('Votre lieu'),
    ],
    etapes: [etape1('votre lieu', 'une photo'), ETAPE2, etape3('à l’un des mariés que vous accueillez')],
    faq: [{ q: 'Faut-il du matériel sur place ?', a: 'Non. Une affiche QR code imprimée suffit, et les invités utilisent leur propre téléphone.' }, ...FAQ_COMMUNE, QUESTION_PLUS_DE_CODE],
    ctaTitre: `Un mariage réservé en ${OFFRE.annee} ? Offrez-lui Time to Flash.`,
  },
  photo: {
    titreMeta: 'Photographes de mariage : les invités photographient, vous signez le reportage',
    description: `Programme partenaires Time to Flash pour les photographes de mariage : un complément spontané à votre reportage, un événement offert pour l’un de vos mariés de ${OFFRE.annee}.`,
    eyebrow: 'Programme partenaires · Photographes de mariage',
    titre: 'Les invités photographient la soirée. Vous signez le reportage.',
    intro: intro('photographes de mariage', 'votre travail'),
    pourLabel: 'Pour les photographes',
    avantages: [
      { k: 'A', t: 'Le complément de votre reportage', d: 'Les invités captent ce que vous ne pouvez pas couvrir : les tables, les coulisses, la piste à 3 h du matin.' },
      { k: 'B', t: 'Des images qui ne se comparent pas aux vôtres', d: 'Clichés limités, rendu d’appareil jetable : c’est un souvenir spontané, pas un reportage. Le vôtre reste la référence.' },
      cite('Votre nom'),
    ],
    etapes: [etape1('votre travail', 'une de vos photos'), ETAPE2, etape3('à l’un de vos mariés')],
    faq: [{ q: 'Est-ce que cela concurrence mon travail ?', a: 'Non. Les invités prennent un nombre limité de clichés au téléphone, avec un rendu d’appareil jetable. C’est un complément spontané à votre reportage, pas un remplacement.' }, ...FAQ_COMMUNE, QUESTION_PLUS_DE_CODE],
    ctaTitre: `Un mariage à couvrir en ${OFFRE.annee} ? Offrez-lui Time to Flash.`,
  },
}

// Ce que voit le formulaire selon le métier.
export const FORMULAIRES = {
  general: { titre: 'Votre fiche de présentation', nomLabel: 'Nom de votre structure', nomPh: 'Nom de votre structure', descLabel: 'Votre activité en deux phrases', sitePh: 'votresite.fr', photoLabel: 'Photo ou logo', photoPh: 'Votre photo ou logo' },
  planner: { titre: 'Votre fiche de wedding planner', nomLabel: 'Nom de votre agence', nomPh: 'Nom de votre agence', descLabel: 'Votre accompagnement en deux phrases', sitePh: 'votresite.fr', photoLabel: 'Photo d’un de vos mariages, ou logo', photoPh: 'Votre photo ou logo' },
  lieu: { titre: 'La fiche de votre lieu', nomLabel: 'Nom de votre lieu', nomPh: 'Nom de votre lieu', descLabel: 'Votre lieu en deux phrases', sitePh: 'votrelieu.fr', photoLabel: 'Photo de votre lieu', photoPh: 'La photo de votre lieu' },
  photo: { titre: 'Votre fiche de photographe', nomLabel: 'Votre nom ou celui de votre studio', nomPh: 'Votre nom ou studio', descLabel: 'Votre style en deux phrases', sitePh: 'votresite.fr', photoLabel: 'Une de vos photos de mariage', photoPh: 'Une de vos photos' },
}

// Les cartes « Pour qui » de la page générale.
export const POUR_QUI = [
  { cle: 'planner', t: 'Un cadeau qui vous distingue', d: 'Vous offrez l’événement à l’un de vos mariés. Ils n’ont plus à relancer leurs invités pour récupérer les photos, et c’est à vous qu’ils le doivent.', cta: 'Voir la page wedding planners →' },
  { cle: 'lieu', t: 'Un service en plus dans votre offre', d: 'Le QR code est sur les tables à l’arrivée des invités. Vous l’incluez dans la location, sans matériel ni personnel supplémentaire.', cta: 'Voir la page lieux de réception →' },
  { cle: 'photo', t: 'Le complément de votre reportage', d: 'Les invités captent ce que vous ne pouvez pas couvrir : les tables, les coulisses, la piste à 3 h du matin. Votre reportage reste la référence.', cta: 'Voir la page photographes →' },
]

// Adresses des pages.
export const cheminLanding = (cle) => (cle === 'general' ? '/pro' : `/pro/${METIERS_FICHE[cle].slug}`)
export const cheminFiche = (cle) => (cle === 'general' ? '/pro/fiche' : `/pro/fiche?metier=${cle}`)
