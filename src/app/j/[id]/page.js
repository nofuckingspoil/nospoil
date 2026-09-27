import { redirect } from 'next/navigation'
import { albumOuvert } from '../../../lib/evenement-serveur'
import Appareil from './Appareil'

// Le tri se fait sur le serveur, avant d'envoyer quoi que ce soit.
//
// Le QR code mène ici, même une fois l'album révélé. La page de l'appareil se
// chargeait alors en entier, demandait où en était la soirée, puis rechargeait
// l'album : deux écrans d'attente l'un après l'autre. Désormais l'album
// s'ouvre directement.
//
// Sauf avec un lien personnel (?t=…) : c'est la page de l'appareil qui
// rattache la participation au téléphone, avant de filer vers l'album.
export default async function Page({ params, searchParams }) {
  const { id } = await params
  const { t } = await searchParams
  if (!t && (await albumOuvert(id))) redirect(`/g/${id}`)
  return <Appareil params={params} />
}
