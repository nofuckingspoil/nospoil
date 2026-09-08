// ============================================================
//  Compte organisateur : retrouver ses événements à partir d'un mail.
//  Pas de mot de passe : l'identité est prouvée par le mail (lien + code).
// ============================================================
import 'server-only'
import { selectRows, updateRow, insertRow } from './supabase'

const MAX_ATTEMPTS = 6

// Vérifie un code à 6 chiffres pour un mail, et le consomme s'il est correct.
// Renvoie { ok:true } ou { ok:false, status, error }.
export async function verifyAndConsumeCode(email, code, purpose = 'connexion') {
  const clean = (code || '').toString().replace(/\D/g, '')
  if (!isValidEmail(email) || clean.length !== 6) {
    return { ok: false, status: 400, error: 'Mail ou code manquant.' }
  }
  const enc = encodeURIComponent(email)
  // Le motif compte : un code reçu pour se connecter ne doit pas pouvoir
  // effacer un compte. Les deux vivent dans la même table, seule cette
  // colonne les distingue.
  const { data } = await selectRows(
    'login_codes',
    `email=eq.${enc}&purpose=eq.${encodeURIComponent(purpose)}&used_at=is.null&order=created_at.desc&limit=1&select=*`
  )
  const row = Array.isArray(data) ? data[0] : null
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 401, error: 'Ce code a expiré. Demandez-en un nouveau.' }
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
    return { ok: false, status: 429, error: 'Trop de tentatives. Demandez un nouveau code.' }
  }
  if (row.code !== clean) {
    await updateRow('login_codes', `id=eq.${row.id}`, { attempts: row.attempts + 1 })
    return { ok: false, status: 401, error: 'Code incorrect.' }
  }
  await updateRow('login_codes', `id=eq.${row.id}`, { used_at: new Date().toISOString() })
  return { ok: true }
}

export function normalizeEmail(v) {
  return (v || '').toString().trim().toLowerCase()
}

// ------------------------------------------------------------
//  Comptes : une personne, une adresse.
//
//  Appelé dès qu'une adresse est connue, quel que soit le rôle : organisateur,
//  co-organisateur ou participant. Une même personne peut être les trois, et c'est
//  précisément ce que l'adresse permet de recoller.
//
//  Ne fait jamais échouer l'appelant : un compte manquant n'empêche ni de créer
//  un événement, ni de prendre une photo.
// ------------------------------------------------------------
// `demo` : la personne vient d'essayer l'appareil depuis le site. On horodate
// ce premier contact : l'album d'essai, lui, disparaîtra le lendemain.
export async function ensureAccount(email, name, { demo = false } = {}) {
  const mail = normalizeEmail(email)
  if (!isValidEmail(mail)) return null
  const nom = (name || '').toString().trim().slice(0, 80) || null
  const maintenant = new Date().toISOString()

  try {
    const { data } = await selectRows('accounts', `email=eq.${encodeURIComponent(mail)}&select=id,name,tried_demo_at&limit=1`)
    const existant = Array.isArray(data) ? data[0] : null

    if (existant) {
      // On complète un nom manquant, on n'écrase jamais celui qui est là :
      // un prénom saisi à la volée ne vaut pas un nom déjà enregistré.
      const patch = { last_seen_at: maintenant }
      if (nom && !existant.name) patch.name = nom
      // Le premier essai fait foi : on ne réécrit pas la date à chaque passage.
      if (demo && !existant.tried_demo_at) patch.tried_demo_at = maintenant
      await updateRow('accounts', `id=eq.${existant.id}`, patch)
      return existant.id
    }

    const cree = await insertRow('accounts', {
      email: mail,
      name: nom,
      last_seen_at: maintenant,
      tried_demo_at: demo ? maintenant : null,
    })
    if (cree.ok && cree.data?.id) return cree.data.id

    // Course entre deux requêtes simultanées : l'autre a gagné, on la relit.
    const relu = await selectRows('accounts', `email=eq.${encodeURIComponent(mail)}&select=id&limit=1`)
    return Array.isArray(relu.data) && relu.data[0] ? relu.data[0].id : null
  } catch (err) {
    console.error('compte:', err)
    return null
  }
}

export function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
}

const FIELDS = 'id,name,host_names,reveal_at,created_at,owner_token'

// L'adresse de l'équipe : en se connectant avec elle, on retrouve tous les
// événements du site, pas seulement les siens. Sert au dépannage : quand un
// organisateur décrit un souci, on regarde son album depuis son propre point de vue.
// La connexion reste protégée comme les autres : il faut recevoir le code sur cette boîte.
const SUPER_ADMIN = 'clement@timetoflash.fr'

export function estSuperAdmin(email) {
  return normalizeEmail(email) === SUPER_ADMIN
}

// Y a-t-il quelque chose derrière cette adresse ? Simple constat, sans aucun
// effet de bord : contrairement à eventsForEmail, cette fonction ne crée pas de
// compte au passage. La page de connexion ne doit rien laisser voir de celui
// qui s'y présente, pas même une ligne apparue en base.
export async function aDesEvenements(email) {
  if (!isValidEmail(email)) return false
  if (estSuperAdmin(email)) return true
  const enc = encodeURIComponent(email)

  const owned = await selectRows('events', `owner_email=eq.${enc}&status=eq.active&select=id&limit=1`)
  if (Array.isArray(owned.data) && owned.data.length) return true

  const admin = await selectRows('event_admins', `email=eq.${enc}&select=id&limit=1`)
  return Array.isArray(admin.data) && admin.data.length > 0
}

// Tous les événements liés à ce mail : ceux qu'il a créés + ceux où il est co-organisateur.
//
// Le jeton renvoyé dépend du lien : le propriétaire reçoit celui de l'événement,
// le co-admin le sien. Auparavant tout le monde recevait celui du propriétaire,
// ce qui donnait à n'importe quel co-admin le droit de tout supprimer.
export async function eventsForEmail(email) {
  const enc = encodeURIComponent(email)
  // Se connecter, c'est se manifester : le compte existe au plus tard ici.
  await ensureAccount(email)

  // L'équipe voit tout. Les albums d'essai du site sont écartés : ils
  // s'effacent le lendemain et noieraient les vrais événements.
  if (estSuperAdmin(email)) {
    const tous = await selectRows(
      'events',
      `status=eq.active&is_demo=is.false&order=created_at.desc&limit=200&select=${FIELDS}`
    )
    return (Array.isArray(tous.data) ? tous.data : []).map((e) => ({
      id: e.id,
      name: e.name,
      hostNames: e.host_names,
      revealAt: e.reveal_at,
      ownerToken: e.owner_token,
    }))
  }

  const owned = await selectRows('events', `owner_email=eq.${enc}&status=eq.active&select=${FIELDS}`)
  const list = (Array.isArray(owned.data) ? owned.data : []).map((e) => ({ ...e, _token: e.owner_token }))

  const admin = await selectRows('event_admins', `email=eq.${enc}&select=id,event_id,token,joined_at`)

  // Se connecter, c'est rejoindre : c'est le seul moment où l'on sait que la
  // personne a bien reçu son invitation et s'en est servie.
  for (const a of Array.isArray(admin.data) ? admin.data : []) {
    if (a.joined_at) continue
    try { await updateRow('event_admins', `id=eq.${a.id}`, { joined_at: new Date().toISOString() }) } catch {}
  }
  const parEvenement = new Map(
    (Array.isArray(admin.data) ? admin.data : [])
      .filter((a) => a.event_id && a.token && !list.some((e) => e.id === a.event_id))
      .map((a) => [a.event_id, a.token])
  )

  if (parEvenement.size) {
    const ids = [...parEvenement.keys()]
    const co = await selectRows('events', `id=in.(${ids.join(',')})&status=eq.active&select=${FIELDS}`)
    for (const e of Array.isArray(co.data) ? co.data : []) {
      list.push({ ...e, _token: parEvenement.get(e.id) })
    }
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return list.map((e) => ({
    id: e.id,
    name: e.name,
    hostNames: e.host_names,
    revealAt: e.reveal_at,
    ownerToken: e._token,
  }))
}

// Code à 6 chiffres, tiré au sort de façon sûre.
export function makeCode() {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return String(buf[0] % 1000000).padStart(6, '0')
}

export function makeToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8)
}

// ------------------------------------------------------------
//  Participant qui cherche ses photos.
//
//  La page de connexion ne connaissait que les organisateurs : un invité qui
//  avait perdu le lien de l'album (nouveau téléphone, mail effacé) tapait son
//  adresse, voyait « vérifiez vos mails », et n'a jamais rien reçu. Il n'avait
//  alors plus aucun chemin vers ses propres photos.
//
//  On regarde donc aussi du côté des participations. Le jeton renvoyé est celui
//  de la fiche invité : c'est la clé de /mes-photos, qui rattache d'un coup
//  toutes les participations de l'adresse au téléphone du moment.
//
//  Renvoie null si l'adresse n'a participé à rien de vivant.
// ------------------------------------------------------------
export async function participationsDe(email) {
  if (!isValidEmail(email)) return null
  const enc = encodeURIComponent(email)

  const { data } = await selectRows('guests', `email=eq.${enc}&select=id,token,event_id&order=created_at.asc`)
  const fiches = Array.isArray(data) ? data : []
  if (!fiches.length) return null

  // Un événement supprimé ou dont les photos ont été purgées ne mène nulle part :
  // mieux vaut ne pas écrire du tout que d'envoyer vers une page vide.
  const ids = [...new Set(fiches.map((g) => g.event_id).filter(Boolean))]
  if (!ids.length) return null
  const evRes = await selectRows(
    'events',
    `id=in.(${ids.join(',')})&status=eq.active&purged_at=is.null&select=id,name,reveal_at`
  )
  const vivants = new Map((Array.isArray(evRes.data) ? evRes.data : []).map((e) => [e.id, e]))

  const utiles = fiches.filter((g) => vivants.has(g.event_id))
  if (!utiles.length) return null

  // Le jeton est posé à la première demande d'accès : les participations les
  // plus anciennes n'en ont pas toujours un. On en fabrique un au besoin.
  const porteuse = utiles.find((g) => g.token) || utiles[0]
  let token = porteuse.token
  if (!token) {
    token = makeToken()
    const res = await updateRow('guests', `id=eq.${porteuse.id}`, { token })
    if (!res?.ok) return null
  }

  const albums = [...new Set(utiles.map((g) => g.event_id))]
    .map((id) => vivants.get(id))
    .sort((a, b) => new Date(b.reveal_at || 0) - new Date(a.reveal_at || 0))
    .map((e) => ({ name: e.name, revele: new Date(e.reveal_at || 0).getTime() <= Date.now() }))

  return { token, albums }
}
