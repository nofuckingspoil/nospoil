/* ============================================================
 *  Le veilleur : le petit programme qui reste allumé dans le navigateur.
 *
 *  Il n'a qu'un seul rôle, et c'est voulu : afficher les notifications que le
 *  serveur envoie, et ouvrir la bonne page quand on les touche. Il n'intercepte
 *  AUCUNE requête réseau. Pas de cache, pas de mode hors-ligne, rien : un
 *  service worker qui met en cache est le meilleur moyen de servir une vieille
 *  version du site à quelqu'un, et l'appareil photo n'a rien à y gagner.
 *
 *  Ce fichier n'est pas compilé : il est servi tel quel depuis /sw.js. Il doit
 *  donc rester du JavaScript ordinaire, sans import ni syntaxe moderne exotique.
 * ============================================================ */

// Prendre la main tout de suite, sans attendre que tous les onglets se ferment.
// Sans cela, une correction apportée ici n'arriverait qu'à la visite suivante.
self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim())
})

// --- L'arrivée d'une notification ---
self.addEventListener('push', function (e) {
  var d = {}
  try { d = e.data ? e.data.json() : {} } catch (err) { d = {} }

  var titre = d.titre || 'Time to Flash'
  var options = {
    body: d.corps || '',
    icon: '/icone-192.png',
    badge: '/badge-96.png',
    // Le même tag remplace la notification précédente au lieu d'en empiler une
    // nouvelle : trois rappels non lus ne doivent pas faire trois lignes.
    tag: d.tag || 'timetoflash',
    renotify: true,
    // Vibration courte : on est en soirée, le téléphone est dans une poche.
    vibrate: [80, 40, 80],
    data: { url: d.url || '/' },
  }
  e.waitUntil(self.registration.showNotification(titre, options))
})

// ============================================================
//  Les photos restées en route, reprises quand le réseau revient.
//
//  Sur Android, le navigateur sait réveiller ce petit programme dès que la
//  connexion est de retour, même si l'onglet est fermé depuis longtemps. C'est
//  la seule façon, sur le web, de finir un envoi sans que personne ne revienne
//  sur la page. Sur iPhone, ça n'existe pas : là-bas, c'est la visite suivante
//  qui vide la file, et le mail de révélation y ramène tout le monde.
//
//  Il lit la même mémoire que la page (IndexedDB « ttf-envois »), il envoie au
//  même endroit, et il applique la même règle du succès : un code 200 ne suffit
//  pas, le serveur doit renvoyer le compteur de la pellicule.
// ============================================================
var BASE_ENVOIS = 'ttf-envois'
var MAGASIN_ENVOIS = 'photos'

function ouvrirLesEnvois() {
  return new Promise(function (ok, ko) {
    var d = indexedDB.open(BASE_ENVOIS, 1)
    d.onsuccess = function () { ok(d.result) }
    d.onerror = function () { ko(d.error) }
  })
}

function lireLesEnvois(base) {
  return new Promise(function (ok) {
    var d = base.transaction(MAGASIN_ENVOIS, 'readonly').objectStore(MAGASIN_ENVOIS).getAll()
    d.onsuccess = function () { ok(d.result || []) }
    d.onerror = function () { ok([]) }
  })
}

function effacerUnEnvoi(base, id) {
  return new Promise(function (ok) {
    var d = base.transaction(MAGASIN_ENVOIS, 'readwrite').objectStore(MAGASIN_ENVOIS).delete(id)
    d.onsuccess = function () { ok() }
    d.onerror = function () { ok() }
  })
}

function viderLaFile() {
  // Un onglet est ouvert : c'est lui qui pompe, on ne s'en mêle pas. Deux
  // envois de la même photo la feraient apparaître deux fois dans l'album.
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (fenetres) {
    if (fenetres.length > 0) return
    return ouvrirLesEnvois().then(function (base) {
      return lireLesEnvois(base).then(function (liste) {
        liste.sort(function (a, b) { return a.creeLe - b.creeLe })
        var reste = 0
        var suite = Promise.resolve()
        liste.forEach(function (e) {
          suite = suite.then(function () {
            var fd = new FormData()
            fd.append('file', e.blob, 'photo.jpg')
            if (e.thumb) fd.append('thumb', e.thumb, 'thumb.jpg')
            fd.append('eventId', e.eventId)
            fd.append('guestId', e.guestId)
            fd.append('deviceToken', e.deviceToken)
            return fetch('/api/photo', { method: 'POST', body: fd })
              .then(function (r) { return r.json().catch(function () { return {} }).then(function (d) { return { r: r, d: d } }) })
              .then(function (rep) {
                // Pellicule pleine : elle ne sera jamais acceptée.
                if (rep.r.status === 409) return effacerUnEnvoi(base, e.id)
                if (rep.r.ok && typeof rep.d.shotsTaken === 'number') return effacerUnEnvoi(base, e.id)
                reste++
              })
              .catch(function () { reste++ })
          })
        })
        return suite.then(function () {
          if (reste === 0 || Notification.permission !== 'granted') return
          return self.registration.showNotification(
            reste > 1 ? reste + ' photos en cours de dépôt' : '1 photo en cours de dépôt',
            {
              body: reste > 1
                ? 'Elles sont bien sur ton téléphone. Rouvre la page avec du réseau et elles s\'enregistreront toutes seules.'
                : 'Elle est bien sur ton téléphone. Rouvre la page avec du réseau et elle s\'enregistrera toute seule.',
              icon: '/icone-192.png',
              badge: '/badge-96.png',
              tag: 'ttf-envois',
              data: { url: '/' },
            }
          )
        })
      })
    })
  }).catch(function () {})
}

self.addEventListener('sync', function (e) {
  if (e.tag === 'ttf-envois') e.waitUntil(viderLaFile())
})

// --- Le doigt sur la notification ---
//
// Si la page est déjà ouverte quelque part, on la ramène au premier plan
// plutôt que d'en ouvrir une deuxième : deux appareils photo côte à côte,
// c'est le meilleur moyen de perdre ses photos en cours d'envoi.
self.addEventListener('notificationclick', function (e) {
  e.notification.close()
  var cible = (e.notification.data && e.notification.data.url) || '/'

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (fenetres) {
      for (var i = 0; i < fenetres.length; i++) {
        var f = fenetres[i]
        if (f.url.indexOf(cible) !== -1 && 'focus' in f) return f.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(cible)
    })
  )
})
