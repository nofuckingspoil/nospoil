// robots.txt généré automatiquement — autorise Google à indexer le site public,
// et lui indique où trouver le plan du site (sitemap).
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // On n'indexe pas les espaces privés / techniques.
        //
        // /g/ (galeries) et /j/ (invitations) ne sont volontairement PAS listés
        // ici : les robots des messageries (Messenger, WhatsApp…) lisent ce
        // fichier avant de fabriquer l'aperçu d'un lien collé dans une
        // conversation, et une interdiction ici leur faisait rendre une carte
        // vide. Ces deux pages portent déjà un « noindex » dans leurs
        // métadonnées — c'est lui qui les tient hors des moteurs de recherche,
        // et leur adresse reste une suite de caractères indevinable.
        disallow: ['/admin', '/api/', '/event/', '/mes-photos', '/mes-evenements', '/create/paiement', '/connexion', '/avis'],
      },
    ],
    sitemap: 'https://timetoflash.fr/sitemap.xml',
    host: 'https://timetoflash.fr',
  }
}
