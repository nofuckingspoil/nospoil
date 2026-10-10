// ============================================================
//  Les briques communes aux pages d'atterrissage publicitaires.
//
//  Une page d'angle n'écrit que ce qui la distingue : son titre, son constat
//  de départ, sa question de fin. Tout le reste (le déroulé, la révélation,
//  le contrôle, les prix, les retours) est le même produit décrit une fois.
//
//  Chaque brique reçoit `lang` (fr, en, de) : ce sont des composants rendus
//  sur le serveur, ils ne peuvent pas deviner la langue tout seuls.
// ============================================================

import Link from 'next/link'
import Logo from '../Logo'
import ConsentReset from '../ConsentReset'
import { SelecteurLangue } from '../Langue'
import { BRAND } from '../../lib/brand'
import { t } from '../../lib/i18n'
import { lien } from '../../lib/langue-lien'
import { CTA, FORMULES_MARIAGE, RETOURS_AUTORISES, etapes, conversations, faqCommune, prix } from '../../lib/lp'
// La planche des pellicules sert aussi à l'accueil : elle vit donc à part,
// et transite ici pour que les pages d'atterrissage l'importent comme avant.
export { default as Pellicules } from '../Pellicules'

export function Bouton({ children, lang = 'fr' }) {
  const texte = children ?? t({ fr: 'Créer mon album (gratuit)', en: 'Create my album (free)', de: 'Mein Album erstellen (kostenlos)' }, lang)
  return <Link href={CTA} className="btn btn-accent">{texte}</Link>
}

// En-tête réduit au strict minimum : le logo rassure, mais il ne mène nulle
// part. Chaque lien de plus est une occasion de partir.
export function Entete({ lang = 'fr' }) {
  return (
    <header className="lp-head">
      <Logo nameSize={20} size={32} />
      <span className="mono small muted lp-head-note">
        {t({ fr: "Gratuit jusqu'à 5 invités", en: 'Free for up to 5 guests', de: 'Kostenlos bis 5 Gäste' }, lang)}
      </span>
    </header>
  )
}

export function Etapes({ titre, sousTitre, lang = 'fr' }) {
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>
        {t({ fr: 'Comment ça se passe', en: 'How it works', de: "So funktioniert's" }, lang)}
      </div>
      <h2 className="section-title">{titre}</h2>
      <div className="section-sub">{sousTitre}</div>
      <div className="steps-grid">
        {etapes(lang).map((e, i) => (
          <div key={i} className="step-card">
            <div className="step-shot">
              <span className="step-num">{e.n}</span>
              <img src={e.img} alt={e.alt} loading="lazy" style={{ objectPosition: e.pos }} />
            </div>
            <h3>{e.t}</h3>
            <p>{e.s}</p>
          </div>
        ))}
      </div>
      <div className="lp-mid-cta"><Bouton lang={lang} /></div>
    </section>
  )
}

// Les retours, présentés comme la conversation dont ils sortent.
export function Retours({ lang = 'fr' }) {
  if (!RETOURS_AUTORISES) return null
  const convs = conversations(lang)
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>
        {t({ fr: 'Les premiers retours', en: 'First feedback', de: 'Erste Rückmeldungen' }, lang)}
      </div>
      <h2 className="section-title">
        {t({ fr: "Ce qu'ils ont écrit le lendemain", en: 'What they wrote the next day', de: 'Was sie uns am nächsten Tag schrieben' }, lang)}
      </h2>
      {/* Hors français, on dit que les messages sont traduits : ils ont été
          écrits en français, et le laisser croire autrement serait mentir. */}
      <div className="section-sub">
        {t({
          fr: "Extraits des messages reçus après leur fête, une fois l'album ouvert.",
          en: 'Excerpts from messages we received after their party, once the album had opened. Translated from French.',
          de: 'Auszüge aus Nachrichten, die wir nach ihrer Feier erhielten, als das Album geöffnet war. Aus dem Französischen übersetzt.',
        }, lang)}
      </div>
      <div className={`lp-convs ${convs.length > 1 ? 'multi' : ''}`}>
        {convs.map((c, k) => (
          <div key={k} className="lp-conv">
            {c.blocs.map((r, i) => (
              <div key={i} className="lp-conv-bloc">
                <span className="lp-conv-qui">{r.qui}</span>
                {r.mots.map((m, j) => (
                  <p key={j} className="lp-bulle">
                    {m}
                    {/* Le cœur ne se pose que sur le dernier message d'un bloc,
                        là où il l'a été dans la vraie conversation. */}
                    {r.coeur && j === r.mots.length - 1 && <span className="lp-coeur" aria-hidden="true">❤️</span>}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// Le cœur émotionnel : l'attente, puis tout d'un coup.
//
// `cible` : à qui la page s'adresse. Aux mariés, l'album est le leur. Au
// témoin qui l'offre, c'est le moment où il le leur tend qui compte, et ce
// n'est pas la même phrase.
export function Revelation({ cible = 'maries', lang = 'fr' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section">
      <div className="split split-inverse">
        <div className="split-text">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>
            {t({ fr: "Le moment qu'on n'oublie pas", en: 'The moment nobody forgets', de: 'Der Moment, den niemand vergisst' }, lang)}
          </div>
          <h2>
            {temoins
              ? t({ fr: "Le cadeau s'ouvre le lendemain", en: 'The gift opens the next day', de: 'Das Geschenk öffnet sich am nächsten Tag' }, lang)
              : t({ fr: "Tout arrive d'un coup, le lendemain", en: 'It all arrives at once, the next day', de: 'Am nächsten Tag kommt alles auf einmal' }, lang)}
          </h2>
          <p>
            {temoins
              ? t({
                  fr: "Pendant la fête, personne ne voit rien, pas même les mariés. Puis, à l'heure que vous avez choisie, l'album s'ouvre d'un coup : leur journée vue par ceux qui l'ont vécue avec eux.",
                  en: 'During the party, nobody sees a thing, not even the couple. Then, at the time you chose, the album opens all at once: their day, seen by the people who lived it with them.',
                  de: 'Während der Feier sieht niemand etwas, nicht einmal das Brautpaar. Dann, zur von Ihnen gewählten Uhrzeit, öffnet sich das Album auf einen Schlag: ihr Tag, gesehen von denen, die ihn mit ihnen erlebt haben.',
                }, lang)
              : t({
                  fr: "Pendant la fête, personne ne voit les photos des autres : un compte à rebours retient tout le monde. Puis, à l'heure que vous avez choisie, l'album s'ouvre pour tous en même temps.",
                  en: "During the party, nobody sees anyone else's photos: a countdown keeps everyone waiting. Then, at the time you chose, the album opens for everyone at the same moment.",
                  de: 'Während der Feier sieht niemand die Fotos der anderen: Ein Countdown lässt alle warten. Dann, zur von Ihnen gewählten Uhrzeit, öffnet sich das Album für alle gleichzeitig.',
                }, lang)}
          </p>
          <ul className="split-list">
            <li><span className="ic">⏳</span><div>
              {t({
                fr: <><b>L'attente fait partie du cadeau</b>, comme une pellicule qu'on porte à développer.</>,
                en: <><b>The wait is part of the gift</b>, like a roll of film dropped off to be developed.</>,
                de: <><b>Das Warten gehört zum Geschenk</b>, wie ein Film, den man zum Entwickeln bringt.</>,
              }, lang)}
            </div></li>
            <li><span className="ic">👥</span><div>
              {temoins
                ? t({
                    fr: <><b>Tout le monde découvre ensemble</b> : les mariés et leurs invités reçoivent le même lien.</>,
                    en: <><b>Everyone discovers it together</b>: the couple and their guests get the same link.</>,
                    de: <><b>Alle entdecken es gemeinsam</b>: Das Brautpaar und seine Gäste erhalten denselben Link.</>,
                  }, lang)
                : t({
                    fr: <><b>Tout le monde découvre ensemble</b> : vos invités reçoivent le même lien que vous.</>,
                    en: <><b>Everyone discovers it together</b>: your guests get the same link as you.</>,
                    de: <><b>Alle entdecken es gemeinsam</b>: Ihre Gäste erhalten denselben Link wie Sie.</>,
                  }, lang)}
            </div></li>
            <li><span className="ic">📥</span><div>
              {temoins
                ? t({
                    fr: <><b>Ils gardent tout</b> : en pleine définition, téléchargeable d'un seul clic.</>,
                    en: <><b>They keep everything</b>: in full resolution, downloadable in one click.</>,
                    de: <><b>Sie behalten alles</b>: in voller Auflösung, mit einem Klick heruntergeladen.</>,
                  }, lang)
                : t({
                    fr: <><b>Vous téléchargez tout</b> : en pleine définition, d'un seul clic.</>,
                    en: <><b>You download everything</b>: in full resolution, in one click.</>,
                    de: <><b>Sie laden alles herunter</b>: in voller Auflösung, mit einem Klick.</>,
                  }, lang)}
            </div></li>
          </ul>
        </div>
        <div className="phone phone-tilt">
          <img src="/accueil/album-partage.webp" width="640" height="1385" loading="lazy"
            alt={t({
              fr: "L'album partagé pendant la soirée : le compte à rebours avant la révélation et le nombre d'invités.",
              en: 'The shared album during the party: the countdown to the reveal and the number of guests.',
              de: 'Das gemeinsame Album während der Feier: der Countdown bis zur Präsentation und die Anzahl der Gäste.',
            }, lang)} />
        </div>
      </div>
    </section>
  )
}

// L'objection numéro un d'un mariage : et si une photo me gêne ? Pour le
// témoin, la même mécanique répond à une inquiétude différente : ne pas
// offrir aux mariés une photo qui les embarrasse.
export function Controle({ cible = 'maries', lang = 'fr' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section">
      <div className="split">
        <div className="phone phone-tilt">
          <img src="/accueil/bilan.webp" width="640" height="1393" loading="lazy"
            alt={t({
              fr: 'Le bilan du mariage : nombre de photos prises, premier et dernier cliché, photographe le plus prolifique.',
              en: 'The wedding recap: number of photos taken, first and last shot, most prolific photographer.',
              de: 'Die Hochzeitsbilanz: Anzahl der Fotos, erste und letzte Aufnahme, fleißigster Fotograf.',
            }, lang)} />
        </div>
        <div className="split-text">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>
            {temoins
              ? t({ fr: 'Vous maîtrisez la surprise', en: 'You control the surprise', de: 'Sie haben die Überraschung in der Hand' }, lang)
              : t({ fr: 'Vous gardez la main', en: "You're in control", de: 'Sie behalten die Kontrolle' }, lang)}
          </div>
          <h2>
            {temoins
              ? t({ fr: 'Rien ne leur arrive sans que vous l\'ayez vu', en: "Nothing reaches them before you've seen it", de: 'Nichts erreicht sie, bevor Sie es gesehen haben' }, lang)
              : t({ fr: 'Rien ne se montre sans votre accord', en: 'Nothing is shown without your approval', de: 'Nichts wird ohne Ihre Zustimmung gezeigt' }, lang)}
          </h2>
          <p>
            {temoins
              ? t({
                  fr: "Avant la révélation, vous êtes seul à voir ce qui a été pris. Une photo ratée, un cliché qui les gênerait le jour de leur mariage ? Vous le retirez, et personne n'en saura jamais rien.",
                  en: "Before the reveal, you're the only one who sees what has been taken. A blurry photo, a shot that would embarrass them on their wedding day? You remove it, and nobody will ever know.",
                  de: 'Vor der Präsentation sehen nur Sie, was aufgenommen wurde. Ein missglücktes Foto, eine Aufnahme, die ihnen an ihrem Hochzeitstag peinlich wäre? Sie entfernen sie, bevor jemand anderes sie sieht.',
                }, lang)
              : t({
                  fr: "C'est votre mariage : vous découvrez les photos en avant-première et vous décidez de ce qui apparaît. Une photo ratée, un moment gênant ? Vous le retirez avant que qui que ce soit ne le voie.",
                  en: "It's your wedding: you get a sneak peek at the photos and decide what appears. A blurry photo, an awkward moment? You remove it before anyone sees it.",
                  de: 'Es ist Ihre Hochzeit: Sie sehen die Fotos als Erste und entscheiden, was erscheint. Ein missglücktes Foto, ein peinlicher Moment? Sie entfernen es, bevor jemand anderes es sieht.',
                }, lang)}
          </p>
          <ul className="split-list">
            <li><span className="ic">👀</span><div>
              {t({
                fr: <><b>Vous validez en premier</b>, et personne ne saura ce que vous avez masqué.</>,
                en: <><b>You approve first</b>, and nobody will know what you hid.</>,
                de: <><b>Sie geben zuerst frei</b>: Was Sie ausblenden, sieht sonst niemand.</>,
              }, lang)}
            </div></li>
            <li><span className="ic">🤝</span><div>
              {temoins
                ? t({
                    fr: <><b>À plusieurs si vous voulez</b> : invitez les autres témoins à trier avec vous.</>,
                    en: <><b>Together if you like</b>: invite the rest of the wedding party to sort through them with you.</>,
                    de: <><b>Gern auch zu mehreren</b>: Laden Sie die anderen Trauzeugen ein, mit Ihnen auszuwählen.</>,
                  }, lang)
                : t({
                    fr: <><b>À plusieurs si vous voulez</b> : un témoin peut vous aider à trier.</>,
                    en: <><b>Together if you like</b>: a best man or bridesmaid can help you sort through them.</>,
                    de: <><b>Gern auch zu mehreren</b>: Ein Trauzeuge kann Ihnen beim Aussortieren helfen.</>,
                  }, lang)}
            </div></li>
            <li><span className="ic">🔒</span><div>
              {t({
                fr: <><b>Jamais public</b> : l'album n'existe que pour ceux qui ont le lien.</>,
                en: <><b>Never public</b>: the album only exists for people who have the link.</>,
                de: <><b>Niemals öffentlich</b>: Das Album existiert nur für die, die den Link haben.</>,
              }, lang)}
            </div></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Tarifs({ cible = 'maries', lang = 'fr' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section" id="tarifs">
      <h2 className="section-title">{t({ fr: 'Un prix, une fois', en: 'One price, paid once', de: 'Ein Preis, einmal bezahlt' }, lang)}</h2>
      <div className="section-sub">
        {temoins
          ? t({
              fr: "Selon le nombre d'invités attendus. Sans abonnement, et facile à partager entre témoins.",
              en: 'Based on the number of guests expected. No subscription, and easy to split within the wedding party.',
              de: 'Je nach Anzahl der erwarteten Gäste. Ohne Abo, und leicht unter Trauzeugen aufzuteilen.',
            }, lang)
          : t({
              fr: "Selon le nombre d'invités que vous attendez. Sans abonnement.",
              en: 'Based on the number of guests you expect. No subscription.',
              de: 'Je nach Anzahl der Gäste, die Sie erwarten. Ohne Abo.',
            }, lang)}
      </div>
      <div className="price-grid lp-prices">
        {FORMULES_MARIAGE.map((f) => (
          <div key={f.maxGuests} className={`price-card ${f.popular ? 'popular' : ''}`}>
            {f.popular && <span className="price-pop">{t({ fr: 'LE PLUS CHOISI', en: 'MOST POPULAR', de: 'AM BELIEBTESTEN' }, lang)}</span>}
            <div className="price-guests">{t({ fr: "Jusqu'à", en: 'Up to', de: 'Bis zu' }, lang)}</div>
            <div className="price-amount">
              {f.maxGuests}
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}>
                {t({ fr: ' invités', en: ' guests', de: ' Gäste' }, lang)}
              </span>
            </div>
            <div className="price-unit">
              {prix(f.priceCents, lang)}{t({ fr: ' · paiement unique', en: ' · one-off payment', de: ' · einmalige Zahlung' }, lang)}
            </div>
            <Link href={`/create?tier=${f.maxGuests}`} className={`btn ${f.popular ? 'btn-accent' : 'btn-ghost'}`}>
              {t({ fr: 'Choisir', en: 'Choose', de: 'Auswählen' }, lang)}
            </Link>
          </div>
        ))}
      </div>
      <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
        {temoins
          ? t({
              fr: "À ce prix, cotisez-vous à deux ou trois et le cadeau est réglé. La formule 5 invités reste gratuite pour l'essayer avant.",
              en: 'At this price, split it between two or three of you and the gift is sorted. The 5-guest plan stays free so you can try it first.',
              de: 'Bei diesem Preis legen zwei oder drei von Ihnen zusammen, und das Geschenk ist erledigt. Das Paket für 5 Gäste bleibt kostenlos, zum Ausprobieren.',
            }, lang)
          : t({
              fr: "Vous voulez d'abord essayer ? La formule 5 invités est gratuite, sans carte bancaire.",
              en: 'Want to try it first? The 5-guest plan is free, no card needed.',
              de: 'Erst einmal ausprobieren? Das Paket für 5 Gäste ist kostenlos, ohne Kreditkarte.',
            }, lang)}
      </p>
    </section>
  )
}

// `enPlus` : la question que fait naître l'angle de la page, et qu'elle est
// seule à devoir traiter.
export function Faq({ enPlus = [], lang = 'fr' }) {
  return (
    <section className="section">
      <h2 className="section-title">
        {t({ fr: "Ce qu'on nous demande le plus", en: 'What people ask us most', de: 'Was man uns am häufigsten fragt' }, lang)}
      </h2>
      <div className="section-sub" />
      {[...enPlus, ...faqCommune(lang)].map((f, i) => (
        <div key={i} className="faq-item">
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  )
}

export function Confiance({ lang = 'fr' }) {
  return (
    <section className="section">
      <div className="lp-trust">
        <span>🇪🇺 {t({ fr: 'Hébergé en Europe', en: 'Hosted in Europe', de: 'In Europa gehostet' }, lang)}</span>
        <span>🔒 {t({ fr: 'Album privé, jamais public', en: 'Private album, never public', de: 'Privates Album, nie öffentlich' }, lang)}</span>
        <span>🗓️ {t({ fr: 'Supprimé au bout de 6 mois', en: 'Deleted after 6 months', de: 'Nach 6 Monaten gelöscht' }, lang)}</span>
        <span>💳 {t({ fr: 'Paiement sécurisé Stripe', en: 'Secure payment by Stripe', de: 'Sichere Zahlung über Stripe' }, lang)}</span>
      </div>
    </section>
  )
}

export function CtaFinal({ titre, sous, lang = 'fr' }) {
  return (
    <section className="cta-band">
      <h3>{titre}</h3>
      <p>{sous}</p>
      <Bouton lang={lang} />
    </section>
  )
}

// Pied de page réduit à ce que la loi exige, plus le choix de la langue :
// un visiteur arrivé d'une publicité dans la mauvaise langue doit pouvoir
// en changer sans chercher.
export function PiedLp({ lang = 'fr' }) {
  return (
    <footer className="vfooter">
      <div className="vfooter-inner">
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>
          {BRAND.name}
        </span>
        <nav className="vfooter-links">
          <Link href={lien('/mentions-legales', lang)}>{t({ fr: 'Mentions légales', en: 'Legal notice', de: 'Impressum' }, lang)}</Link>
          <Link href={lien('/cgv', lang)}>{t({ fr: 'CGV', en: 'Terms of sale', de: 'AGB' }, lang)}</Link>
          <Link href={lien('/politique-de-confidentialite', lang)}>{t({ fr: 'Confidentialité', en: 'Privacy', de: 'Datenschutz' }, lang)}</Link>
          <ConsentReset />
        </nav>
        <SelecteurLangue style={{ color: '#fff' }} />
        <span className="mono">{t({ fr: '© 2026 · Hébergé en UE · RGPD', en: '© 2026 · Hosted in the EU · GDPR', de: '© 2026 · In der EU gehostet · DSGVO' }, lang)}</span>
      </div>
    </footer>
  )
}

// Téléphone : le geste reste sous le pouce, du début à la fin.
export function Sticky({ children, lang = 'fr' }) {
  const texte = children ?? t({ fr: 'Créer mon album (gratuit) →', en: 'Create my album (free) →', de: 'Mein Album erstellen (kostenlos) →' }, lang)
  return <Link href={CTA} className="lp-sticky">{texte}</Link>
}
