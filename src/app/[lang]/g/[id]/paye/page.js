import { langueDeParams } from '../../../../../lib/langue-lien'
import { t, langueValide } from '../../../../../lib/i18n'

// ============================================================
//  Retour du paiement des tirages, quand la commande vient de l'app iPhone.
//
//  L'app ouvre la page Stripe dans une fenêtre posée par-dessus elle. Avant,
//  Stripe ramenait ensuite sur l'album du site, dans cette même fenêtre :
//  l'invité se croyait renvoyé sur le site web. Désormais il arrive ici, sur
//  une page qui dit seulement que c'est payé ; l'app, qui guette le paiement
//  de son côté, referme la fenêtre d'elle-même et affiche son écran de fin.
//  Rien n'est confirmé depuis cette page : c'est l'app qui s'en charge.
// ============================================================

export async function generateMetadata({ params, searchParams }) {
  const sp = await searchParams
  const lang = langueValide(sp?.l) || await langueDeParams(params)
  return {
    title: t({ fr: 'Paiement des tirages', en: 'Print payment', de: 'Zahlung der Abzüge' }, lang),
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params, searchParams }) {
  const sp = await searchParams
  const lang = langueValide(sp?.l) || await langueDeParams(params)
  const annule = sp?.annule === '1'
  // Le bouton qui referme la fenêtre de Safari dans l'app, selon la langue
  // du téléphone.
  const bouton = t({ fr: '«\u00a0OK\u00a0»', en: '“Done”', de: '„Fertig“' }, lang)
  return (
    <main style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', textAlign: 'center', background: 'var(--bg)', color: 'var(--ink)',
    }}>
      <div aria-hidden="true" style={{ fontSize: 46, lineHeight: 1 }}>{annule ? '↩︎' : '✓'}</div>
      <h1 style={{ margin: '18px 0 0', fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.2 }}>
        {annule
          ? t({ fr: 'Paiement annulé', en: 'Payment cancelled', de: 'Zahlung abgebrochen' }, lang)
          : t({ fr: 'Paiement reçu, merci !', en: 'Payment received, thank you!', de: 'Zahlung erhalten, vielen Dank!' }, lang)}
      </h1>
      <p style={{ margin: '12px auto 0', maxWidth: '34ch', fontSize: 15.5, lineHeight: 1.55, color: 'var(--text2)' }}>
        {annule
          ? t({ fr: 'Rien n\'a été débité. Vous retrouvez votre sélection dans l\'application.', en: 'Nothing has been charged. Your selection is waiting for you in the app.', de: 'Es wurde nichts abgebucht. Ihre Auswahl wartet in der App auf Sie.' }, lang)
          : t({ fr: 'Votre commande de tirages est enregistrée. Retour à l\'application…', en: 'Your print order is confirmed. Taking you back to the app…', de: 'Ihre Bestellung von Abzügen ist eingegangen. Zurück zur App…' }, lang)}
      </p>
      <p style={{ margin: '22px auto 0', maxWidth: '34ch', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text3)' }}>
        {t({
          fr: `Si cette fenêtre reste ouverte, touchez ${bouton} en haut de l'écran.`,
          en: `If this window stays open, tap ${bouton} at the top of the screen.`,
          de: `Falls dieses Fenster offen bleibt, tippen Sie oben auf ${bouton}.`,
        }, lang)}
      </p>
    </main>
  )
}
