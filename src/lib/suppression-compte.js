// ============================================================
//  Supprimer un compte, et ce qui s'y rattache.
//
//  Apple l'exige (règle 5.1.1 v) : une application qui permet de créer un
//  compte doit permettre de le supprimer depuis l'application. Le règlement
//  européen dit la même chose, en plus large.
//
//  LE PARTAGE, ET SA RAISON
//
//  Un compte n'est qu'une adresse mail, mais elle est accrochée à trois rôles :
//  organisateur, participant, co-organisateur. Or les événements qu'on organise
//  contiennent les photos des AUTRES. Effacer un compte ne peut donc pas vouloir
//  dire « tout brûler » par défaut.
//
//    · Toujours : l'identité disparaît partout. Ligne de compte, codes de
//      connexion, prénom et adresse dans les participations, coordonnées de
//      l'organisateur sur ses événements.
//    · Sur demande seulement : les événements organisés et leurs photos.
//
//  Décoché, l'album promis aux invités continue de vivre jusqu'à sa suppression
//  automatique à six mois (CGV art. 8), mais plus personne ne l'administre.
//  Coché, tout part, y compris les photos des invités.
// ============================================================
import 'server-only'
import { selectRows, updateRow, deleteRows } from './supabase'
import { deletePhotos } from './r2'
import { normalizeEmail } from './account'

/** Le prénom qui remplace celui d'une personne partie. */
const ANONYME = 'Participant'

/**
 * Efface un événement et tout ce qu'il contient, fichiers compris.
 *
 * Reprend exactement la suppression du tableau de bord (DELETE
 * /api/events/[id]), en ajoutant les vignettes et les tables satellites que
 * celle-ci laissait aux contraintes de clés.
 */
async function supprimerEvenement(id) {
  const ph = await selectRows('photos', `event_id=eq.${id}&select=storage_path,thumb_path`)
  const lignes = Array.isArray(ph.data) ? ph.data : []
  const fichiers = []
  for (const p of lignes) {
    if (p.storage_path) fichiers.push(p.storage_path)
    if (p.thumb_path) fichiers.push(p.thumb_path)
  }

  const ev = await selectRows('events', `id=eq.${id}&select=cover_url`)
  const couverture = Array.isArray(ev.data) ? ev.data[0]?.cover_url : null
  if (couverture) fichiers.push(couverture)

  if (fichiers.length) await deletePhotos(fichiers)

  // Les enfants d'abord, l'événement ensuite : les clés étrangères l'imposent.
  await deleteRows('favorites', `event_id=eq.${id}`)
  await deleteRows('downloads', `event_id=eq.${id}`)
  await deleteRows('feedback', `event_id=eq.${id}`)
  await deleteRows('event_admins', `event_id=eq.${id}`)
  await deleteRows('photos', `event_id=eq.${id}`)
  await deleteRows('guests', `event_id=eq.${id}`)
  const del = await deleteRows('events', `id=eq.${id}`)
  return del.ok
}

/**
 * Supprime le compte d'une adresse.
 *
 * @param {string} adresse             l'adresse du compte, déjà prouvée par un code
 * @param {boolean} supprimerEvenements  effacer aussi les événements organisés
 * @returns {Promise<{ok: boolean, evenementsSupprimes: number, evenementsDetaches: number, participations: number}>}
 */
export async function supprimerCompte(adresse, { supprimerEvenements = false } = {}) {
  const email = normalizeEmail(adresse)
  if (!email) return { ok: false, evenementsSupprimes: 0, evenementsDetaches: 0, participations: 0 }
  const enc = encodeURIComponent(email)

  // Le compte peut ne pas exister : quelqu'un a pu participer sans jamais
  // laisser d'adresse, ou l'avoir déjà supprimé. Ce n'est pas une erreur, on
  // nettoie quand même tout ce qui porte cette adresse.
  const compte = await selectRows('accounts', `email=eq.${enc}&select=id`)
  const compteId = Array.isArray(compte.data) ? compte.data[0]?.id : null

  // ---- 1. Les événements organisés ----
  //
  // On les retrouve par le compte ET par l'adresse : les plus anciens sont
  // antérieurs à la table des comptes et ne portent que `owner_email`.
  const parCompte = compteId
    ? await selectRows('events', `owner_account_id=eq.${compteId}&select=id`)
    : { data: [] }
  const parAdresse = await selectRows('events', `owner_email=eq.${enc}&select=id`)
  const ids = new Set()
  for (const source of [parCompte.data, parAdresse.data]) {
    for (const e of Array.isArray(source) ? source : []) if (e?.id) ids.add(e.id)
  }

  let evenementsSupprimes = 0
  let evenementsDetaches = 0
  for (const id of ids) {
    if (supprimerEvenements) {
      if (await supprimerEvenement(id)) evenementsSupprimes++
    } else {
      // L'album survit pour les invités, mais il n'a plus de propriétaire :
      // ni nom, ni adresse, ni rattachement au compte.
      await updateRow('events', `id=eq.${id}`, {
        owner_account_id: null,
        owner_email: null,
        owner_name: null,
      })
      evenementsDetaches++
    }
  }

  // ---- 2. Les participations ----
  //
  // Les photos restent : elles appartiennent à la soirée de quelqu'un d'autre,
  // qui les attend. C'est le NOM et l'ADRESSE qui s'en vont.
  let participations = 0
  const invites = new Set()
  const invitesParCompte = compteId
    ? await selectRows('guests', `account_id=eq.${compteId}&select=id`)
    : { data: [] }
  const invitesParAdresse = await selectRows('guests', `email=eq.${enc}&select=id`)
  for (const source of [invitesParCompte.data, invitesParAdresse.data]) {
    for (const g of Array.isArray(source) ? source : []) if (g?.id) invites.add(g.id)
  }
  for (const id of invites) {
    const maj = await updateRow('guests', `id=eq.${id}`, {
      display_name: ANONYME,
      email: null,
      phone: null,
      account_id: null,
    })
    if (maj.ok) participations++
  }

  // ---- 3. Les co-organisations ----
  //
  // Une invitation à co-gérer est une donnée personnelle de bout en bout
  // (adresse, code d'accès) : elle se supprime, elle ne s'anonymise pas.
  if (compteId) await deleteRows('event_admins', `account_id=eq.${compteId}`)
  await deleteRows('event_admins', `email=eq.${enc}`)

  // ---- 4. Les avis laissés ----
  //
  // On garde la réponse, qui est anonyme et sert à améliorer le service, mais
  // on efface les coordonnées laissées pour être rappelé.
  await updateRow('feedback', `contact_email=eq.${enc}`, { contact_email: null, phone: null, call_ok: false })

  // ---- 5. Le compte lui-même, et ses codes ----
  await deleteRows('login_codes', `email=eq.${enc}`)
  if (compteId) await deleteRows('accounts', `id=eq.${compteId}`)

  return { ok: true, evenementsSupprimes, evenementsDetaches, participations }
}
