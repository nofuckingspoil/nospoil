'use client'

// ============================================================
//  La file d'attente d'envoi des photos, côté navigateur.
//
//  LE PROBLÈME
//  Jusqu'ici, le site envoyait la photo dans la seconde du déclic. Une
//  coupure de réseau de trois secondes, et la photo était perdue : un message
//  d'erreur, et il fallait la reprendre. Dans une salle de réception, ça arrive
//  tout le temps. L'application, elle, gardait ses photos dans une file
//  d'attente et n'en perdait aucune. Les invités les mieux protégés étaient
//  donc ceux qui avaient installé l'app, c'est-à-dire une minorité.
//
//  LE PRINCIPE, LE MÊME QUE DANS L'APP
//  On sépare « prendre » et « envoyer ». Prendre est instantané : la photo est
//  rangée dans la mémoire du navigateur (IndexedDB, qui accepte les fichiers
//  binaires et survit à la fermeture de l'onglet), puis inscrite dans la file.
//  Envoyer se fait après, tout seul, et autant de fois qu'il le faut.
//
//  CE QUE LE NAVIGATEUR SAIT FAIRE, ET CE QU'IL NE SAIT PAS
//  Tant que la page est ouverte, la file tourne : c'est ce qui couvre le cas
//  le plus fréquent de très loin, la coupure de quelques secondes ou minutes.
//  Page fermée, rien ne tourne : un site n'est pas une application, iOS ne lui
//  laisse aucune vie en arrière-plan.
//
//  D'où la reprise à la visite suivante : les photos restent en mémoire, et
//  repartent dès que la personne rouvre le lien, même le lendemain. Le mail de
//  révélation ramène tout le monde sur le site, et la file se vide aussi
//  depuis la page de l'album : une photo coincée le samedi soir arrive au
//  moment où l'on clique dans son mail le mercredi.
//
//  LES MÊMES RÈGLES QUE L'APP, AU CHIFFRE PRÈS
//  Les tentatives s'espacent (4 s, 8, 16, 32, 64, puis une par minute), on
//  cesse d'insister au bout de quarante essais, et une photo de plus de sept
//  jours est abandonnée. La grâce du serveur après la révélation vaut elle
//  aussi sept jours : aucune photo légitime ne se fait refuser.
// ============================================================

const BASE = 'ttf-envois'
const MAGASIN = 'photos'
const VERSION = 1

const ATTENTE_MIN = 4000
const ATTENTE_MAX = 60000
const ESSAIS_MAX = 40
const AGE_MAX = 7 * 24 * 60 * 60 * 1000

/** Au bout de combien d'échecs on considère que ça coince pour de bon. */
export const ESSAIS_COINCE = 5

let _base = null
let pompeActive = false
let minuteur = null
const abonnes = new Set()
/** Les adresses temporaires des aperçus, pour ne pas les fabriquer deux fois. */
const apercus = new Map()

// --------------------------------------------------------------- la mémoire

function ouvrir() {
  if (_base) return _base
  _base = new Promise((resoudre, rejeter) => {
    if (typeof indexedDB === 'undefined') return rejeter(new Error('sans mémoire'))
    const dem = indexedDB.open(BASE, VERSION)
    dem.onupgradeneeded = () => {
      const b = dem.result
      if (!b.objectStoreNames.contains(MAGASIN)) {
        b.createObjectStore(MAGASIN, { keyPath: 'id' })
      }
    }
    dem.onsuccess = () => resoudre(dem.result)
    dem.onerror = () => rejeter(dem.error)
  }).catch((e) => {
    _base = null
    throw e
  })
  return _base
}

function transaction(mode) {
  return ouvrir().then((b) => b.transaction(MAGASIN, mode).objectStore(MAGASIN))
}

function attendre(dem) {
  return new Promise((resoudre, rejeter) => {
    dem.onsuccess = () => resoudre(dem.result)
    dem.onerror = () => rejeter(dem.error)
  })
}

async function toutes() {
  try {
    const m = await transaction('readonly')
    const liste = await attendre(m.getAll())
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
}

async function ecrire(entree) {
  try {
    const m = await transaction('readwrite')
    await attendre(m.put(entree))
  } catch {}
}

async function effacer(id) {
  try {
    const m = await transaction('readwrite')
    await attendre(m.delete(id))
  } catch {}
  const url = apercus.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    apercus.delete(id)
  }
}

// ------------------------------------------------------------ les abonnés

function apercu(e) {
  let url = apercus.get(e.id)
  if (!url) {
    url = URL.createObjectURL(e.blob)
    apercus.set(e.id, url)
  }
  return url
}

async function diffuser(ev) {
  const liste = await toutes()
  const file = liste
    .sort((a, b) => a.creeLe - b.creeLe)
    .map((e) => ({ id: e.id, eventId: e.eventId, url: apercu(e), essais: e.essais || 0 }))
  for (const fn of Array.from(abonnes)) {
    try {
      fn({ type: 'file', enAttente: file })
      if (ev) fn(ev)
    } catch {}
  }
}

/**
 * Écouter la file. Reçoit tout de suite l'état courant, puis chaque
 * changement. Renvoie la fonction pour se désabonner.
 */
export function sabonnerALaFile(fn) {
  abonnes.add(fn)
  toutes().then((liste) => {
    const file = liste
      .sort((a, b) => a.creeLe - b.creeLe)
      .map((e) => ({ id: e.id, eventId: e.eventId, url: apercu(e), essais: e.essais || 0 }))
    try { fn({ type: 'file', enAttente: file }) } catch {}
  })
  return () => abonnes.delete(fn)
}

// --------------------------------------------------------------- la pompe

function planifier(delai) {
  if (minuteur) clearTimeout(minuteur)
  minuteur = setTimeout(() => {
    minuteur = null
    void pomper()
  }, delai)
}

/**
 * Envoie les photos une par une, de la plus ancienne à la plus récente.
 *
 * L'ordre compte : un lot pris hors réseau doit arriver dans l'album collectif
 * dans l'ordre où il a été pris, et si la pellicule se remplit en cours de
 * route, c'est la dernière photo prise qui se voit refusée, pas la première.
 */
async function pomper() {
  if (pompeActive) return
  pompeActive = true
  try {
    for (;;) {
      const liste = (await toutes()).sort((a, b) => a.creeLe - b.creeLe)
      if (!liste.length) return

      const maintenant = Date.now()
      const eligibles = liste.filter((e) => (e.prochainEssai || 0) <= maintenant)
      if (!eligibles.length) {
        const attente = Math.min(...liste.map((e) => e.prochainEssai || 0)) - maintenant
        planifier(Math.max(1000, attente))
        return
      }
      await envoyer(eligibles[0])
    }
  } finally {
    pompeActive = false
  }
}

async function envoyer(e) {
  // Trop vieille : le serveur la refuserait, et le navigateur la garderait pour
  // rien. On la laisse partir, comme l'app le fait au bout de sept jours.
  if (Date.now() - (e.creeLe || 0) > AGE_MAX) {
    await effacer(e.id)
    await diffuser({ type: 'perdue', id: e.id, eventId: e.eventId })
    return
  }

  try {
    const fd = new FormData()
    fd.append('file', e.blob, 'photo.jpg')
    if (e.thumb) fd.append('thumb', e.thumb, 'thumb.jpg')
    fd.append('eventId', e.eventId)
    fd.append('guestId', e.guestId)
    fd.append('deviceToken', e.deviceToken)

    const res = await fetch('/api/photo', { method: 'POST', body: fd })
    const d = await res.json().catch(() => ({}))

    // Pellicule pleine : elle ne sera jamais acceptée, on ne la garde pas. Le
    // message, lui, remonte à l'écran.
    if (res.status === 409) {
      await effacer(e.id)
      await diffuser({ type: 'refus', id: e.id, eventId: e.eventId, message: d.error || '' })
      return
    }

    // Un succès n'est pas un code 200 : le wifi d'une salle de réception répond
    // 200 avec sa page de connexion. Un envoi n'est réussi que si le serveur
    // renvoie le compteur de la pellicule, qu'il n'écrit qu'après avoir
    // vraiment enregistré la photo.
    if (res.ok && typeof d.shotsTaken === 'number') {
      await effacer(e.id)
      await diffuser({
        type: 'arrivee',
        id: e.id,
        eventId: e.eventId,
        shotsTaken: d.shotsTaken,
        shotsPerGuest: d.shotsPerGuest,
      })
      return
    }

    await reporter(e, d.error)
  } catch {
    // Pas de réseau, coupure en plein transfert : on retentera, et la photo
    // reste où elle est.
    await reporter(e)
  }
}

async function reporter(e, message) {
  const essais = (e.essais || 0) + 1
  // On cesse d'insister, sans rien détruire : la photo repartira à la
  // prochaine visite, quand le réseau sera peut-être revenu.
  const attente =
    essais >= ESSAIS_MAX
      ? AGE_MAX
      : Math.min(ATTENTE_MAX, ATTENTE_MIN * 2 ** Math.min(essais - 1, 5))
  await ecrire({ ...e, essais, dernierMot: message || e.dernierMot, prochainEssai: Date.now() + attente })
  await diffuser()
  planifier(attente)
}

// ---------------------------------------------------------------- l'entrée

let _n = 0

/**
 * Ranger une photo et rendre la main tout de suite.
 *
 * Le déclencheur est libre dès l'écriture : l'envoi se fait après, tout seul.
 */
export async function ajouterALaFile({ eventId, guestId, deviceToken, blob, thumb }) {
  const id = `w-${Date.now().toString(36)}-${++_n}`
  const entree = { id, eventId, guestId, deviceToken, blob, thumb: thumb || null, creeLe: Date.now(), essais: 0, prochainEssai: 0 }
  await ecrire(entree)
  await diffuser()
  planifier(0)
  return id
}

/**
 * Réveiller la file : au chargement d'une page, au retour du réseau, au retour
 * de l'onglet au premier plan. Chaque réveil rend leur chance aux photos qui
 * avaient été laissées de côté.
 */
export async function demarrerFileEnvoi() {
  if (typeof window === 'undefined') return
  const liste = await toutes()
  for (const e of liste) {
    if ((e.prochainEssai || 0) > Date.now()) await ecrire({ ...e, prochainEssai: 0 })
  }
  await diffuser()
  planifier(0)
}

let branche = false

/** Les trois moments où le réseau peut être revenu sans qu'on le sache. */
export function brancherLesReveils() {
  if (typeof window === 'undefined' || branche) return
  branche = true
  window.addEventListener('online', () => void demarrerFileEnvoi())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void demarrerFileEnvoi()
  })
  window.addEventListener('pageshow', () => void demarrerFileEnvoi())
}

/** Combien de photos attendent, tous événements confondus. */
export async function combienEnAttente() {
  return (await toutes()).length
}
