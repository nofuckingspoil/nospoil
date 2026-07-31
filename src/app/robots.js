// robots.txt généré automatiquement — autorise Google à indexer le site public,
// et lui indique où trouver le plan du site (sitemap).
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // On n'indexe pas les espaces privés / techniques.
        disallow: ['/admin', '/api/', '/event/', '/create/paiement', '/connexion'],
      },
    ],
    sitemap: 'https://timetoflash.fr/sitemap.xml',
    host: 'https://timetoflash.fr',
  }
}
