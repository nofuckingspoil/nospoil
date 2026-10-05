// ============================================================
//  Les écrans de l'appli, redessinés en code pour les pages par occasion.
//
//  Les captures de l'accueil montrent un mariage (« Mariage Paul & Claire »,
//  l'album de Charlotte). Sur la page des 30 ans, elles juraient. Ici, les
//  mêmes écrans affichent le nom de la fête de la page et ses photos, dans
//  la langue de la page. Tout est en pourcentages et en unités de conteneur :
//  un écran se dessine pareil à n'importe quelle taille.
// ============================================================

import QRCode from 'qrcode'
import { t } from '../../lib/i18n'

// L'appareil photo : le titre de la fête, le viseur avec une photo de la
// fête, le compteur, le déclencheur.
export function EcranAppareil({ titre, photo, lang }) {
  return (
    <div className="ecr ecr-app" aria-hidden="true"><div className="ecr-app-in">
      <div className="ecr-app-tete">
        <span className="ecr-app-bouton">←</span>
        <div className="ecr-app-titres">
          <b>{titre}</b>
          <span>{t({ fr: 'révélation dans 2 j 20 h', en: 'reveal in 2 d 20 h', de: 'Enthüllung in 2 T 20 Std' }, lang)}</span>
        </div>
        <span className="ecr-app-bouton">▦</span>
      </div>
      <div className="ecr-app-viseur" style={{ backgroundImage: `url(${photo})` }}>
        <span className="ecr-app-flash">FLASH 400</span>
        <span className="ecr-app-num">№ 01</span>
        <span className="ecr-app-coin ecr-app-coin-hg" />
        <span className="ecr-app-coin ecr-app-coin-hd" />
        <span className="ecr-app-coin ecr-app-coin-bg" />
        <span className="ecr-app-coin ecr-app-coin-bd" />
        <span className="ecr-app-mise"><span /></span>
        <span className="ecr-app-reste"><b>03</b> / {t({ fr: '3 restants', en: '3 left', de: '3 übrig' }, lang)}</span>
      </div>
      <div className="ecr-app-outils">
        <span className="ecr-app-pilule">⚡ OFF</span>
        <span className="ecr-app-rond">⟳</span>
      </div>
      <div className="ecr-app-declencheur"><span /></div>
    </div></div>
  )
}

// L'affiche à poser sur les tables, avec un vrai QR code (il ouvre l'essai
// de l'appareil photo).
export async function EcranAffiche({ titre, lang }) {
  const svg = await QRCode.toString('https://timetoflash.fr/essai', { type: 'svg', margin: 0, color: { dark: '#14161F', light: '#0000' } })
  return (
    <div className="ecr ecr-affiche" aria-hidden="true">
      <span className="ecr-affiche-film" />
      <div className="ecr-affiche-corps">
        <span className="ecr-affiche-sur">◉ {t({ fr: 'Appareil photo jetable', en: 'Disposable camera', de: 'Einwegkamera' }, lang)}</span>
        <b className="ecr-affiche-titre">{titre}</b>
        <i>{t({ fr: "Ce soir, le photographe c'est vous.", en: "Tonight, you're the photographer.", de: 'Heute Abend sind Sie der Fotograf.' }, lang)}</i>
        <span className="ecr-affiche-qr" dangerouslySetInnerHTML={{ __html: svg }} />
        <span className="ecr-affiche-mots">{t({ fr: 'Scannez · photographiez · disparaissez', en: 'Scan · shoot · vanish', de: 'Scannen · knipsen · verschwinden' }, lang)}</span>
        <span className="ecr-affiche-cliches">{t({ fr: '5 clichés chacun, pas un de plus', en: '5 shots each, not one more', de: '5 Fotos pro Person, keins mehr' }, lang)}</span>
      </div>
      <span className="ecr-affiche-film" />
    </div>
  )
}

// Deux cartes de l'album révélé : la photo, le prénom de qui l'a prise,
// l'heure, la date incrustée façon jetable.
export function EcranAlbum({ photos, prenoms, jour, lang }) {
  const heures = ['21:42', '23:17']
  return (
    <div className="ecr ecr-album" aria-hidden="true"><div className="ecr-album-in">
      {photos.slice(0, 2).map((p, i) => (
        <div key={p} className="ecr-album-carte">
          <div className="ecr-album-photo" style={{ backgroundImage: `url(${p})` }}>
            <span className="ecr-album-date">{jour.tampon}</span>
            <span className="ecr-album-coeur">♥ {i + 1}</span>
          </div>
          <div className="ecr-album-legende">
            <b>{prenoms[i]}</b>
            <span>{t(jour.texte, lang)} · {heures[i]}</span>
          </div>
        </div>
      ))}
    </div></div>
  )
}
