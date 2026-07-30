/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirige l'ancien domaine no-spoil.fr vers timetoflash.fr (301, en gardant le chemin).
  // Les anciens liens / QR codes partagés continuent donc de fonctionner.
  async redirects() {
    return [
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
