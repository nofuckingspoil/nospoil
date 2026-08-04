// robots.txt généré automatiquement — autorise Google à indexer le site public,
// et lui indique où trouver le plan du site (sitemap).
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // On n'indexe pas les espaces privés / techniques.
        // /g/ (galeries) et /j/ (invitations) contiennent les photos et les
        // noms des invités : un lien partagé publiquement ne doit jamais
        // finir dans les résultats de recherche.
        disallow: ['/admin', '/api/', '/event/', '/g/', '/j/', '/mes-photos', '/mes-evenements', '/create/paiement', '/connexion'],
      },
    ],
    sitemap: 'https://timetoflash.fr/sitemap.xml',
    host: 'https://timetoflash.fr',
  }
}
