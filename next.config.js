/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16.3 dépose sinon un AGENTS.md et un CLAUDE.md à la racine à chaque
  // lancement. Rien ne les utilise ici, et ils reviennent salir le dossier
  // après chaque `npm run dev`.
  agentRules: false,

  // sharp taille les mini-versions des photos arrivées sans (celles de l'app
  // native). C'est du code natif : il doit rester en dehors du paquet compilé,
  // sinon la mise en ligne se retrouve avec un module illisible.
  serverExternalPackages: ['sharp'],

  // Redirige l'ancien domaine no-spoil.fr vers timetoflash.fr (301, en gardant le chemin).
  // Les anciens liens / QR codes partagés continuent donc de fonctionner.
  async redirects() {
    // Adresses courtes à poster sur les réseaux. Elles renvoient vers l'accueil
    // en y accrochant l'étiquette de mesure, invisible pour le visiteur mais
    // lue par Google Analytics. Le lien affiché dans la bio reste propre.
    // Redirections temporaires (307) exprès : les navigateurs ne les mettent
    // pas en cache, on peut donc changer l'étiquette sans casser les liens
    // déjà postés.
    const reseaux = [
      ['/ig', 'instagram', 'bio'],
      ['/ig-story', 'instagram', 'story'],
      ['/fb', 'facebook', 'post'],
      ['/tt', 'tiktok', 'bio'],
      ['/yt', 'youtube', 'short'],
    ].map(([source, source_utm, medium]) => ({
      source,
      destination: `/?utm_source=${source_utm}&utm_medium=${medium}`,
      permanent: false,
    }))

    return [
      ...reseaux,
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'no-spoil.fr' }],
        destination: 'https://timetoflash.fr/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.no-spoil.fr' }],
        destination: 'https://timetoflash.fr/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
