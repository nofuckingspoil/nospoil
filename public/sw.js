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
