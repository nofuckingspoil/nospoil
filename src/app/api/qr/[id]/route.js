// ============================================================
//  Le QR code d'un événement, en image PNG, pour les mails.
//
//  Une image intégrée au mail (data:) est bloquée par Gmail et Outlook : il
//  faut une vraie adresse. Le QR ne contient que le lien participant de
//  l'événement, déjà public (c'est celui des cartons) : rien à protéger.
// ============================================================
import QRCode from 'qrcode'
import { siteUrl } from '../../../../lib/mail'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_request, { params }) {
  const { id } = await params
  if (!UUID.test(id || '')) return new Response('Not found', { status: 404 })
  const png = await QRCode.toBuffer(`${siteUrl()}/j/${id}`, {
    type: 'png', margin: 1, width: 360, errorCorrectionLevel: 'M',
    color: { dark: '#221A12', light: '#ffffff' },
  })
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      // Le lien d'un événement ne change jamais.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
