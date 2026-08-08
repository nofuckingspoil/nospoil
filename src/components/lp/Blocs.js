// ============================================================
//  Les briques communes aux pages d'atterrissage publicitaires.
//
//  Une page d'angle n'écrit que ce qui la distingue : son titre, son constat
//  de départ, sa question de fin. Tout le reste (le déroulé, la révélation,
//  le contrôle, les prix, les retours) est le même produit décrit une fois.
// ============================================================

import Link from 'next/link'
import Logo from '../Logo'
import ConsentReset from '../ConsentReset'
import { BRAND } from '../../lib/brand'
import { formatPrice } from '../../lib/pricing'
import { CTA, ETAPES, FORMULES_MARIAGE, CONVERSATIONS, RETOURS_AUTORISES, FAQ_COMMUNE } from '../../lib/lp'
// La planche des pellicules sert aussi à l'accueil : elle vit donc à part,
// et transite ici pour que les pages d'atterrissage l'importent comme avant.
export { default as Pellicules } from '../Pellicules'

export function Bouton({ children = 'Créer mon album (gratuit)' }) {
  return <Link href={CTA} className="btn btn-accent">{children}</Link>
}

// En-tête réduit au strict minimum : le logo rassure, mais il ne mène nulle
// part. Chaque lien de plus est une occasion de partir.
export function Entete() {
  return (
    <header className="lp-head">
      <Logo nameSize={20} size={32} />
      <span className="mono small muted lp-head-note">Gratuit jusqu'à 5 invités</span>
    </header>
  )
}

export function Etapes({ titre, sousTitre }) {
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Comment ça se passe</div>
      <h2 className="section-title">{titre}</h2>
      <div className="section-sub">{sousTitre}</div>
      <div className="steps-grid">
        {ETAPES.map((e, i) => (
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
      <div className="lp-mid-cta"><Bouton /></div>
    </section>
  )
}

// Les retours, présentés comme la conversation dont ils sortent.
export function Retours() {
  if (!RETOURS_AUTORISES) return null
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Les premiers retours</div>
      <h2 className="section-title">Ce qu'ils ont écrit le lendemain</h2>
      <div className="section-sub">Extraits des messages reçus après leur fête, une fois l'album ouvert.</div>
      <div className={`lp-convs ${CONVERSATIONS.length > 1 ? 'multi' : ''}`}>
        {CONVERSATIONS.map((c, k) => (
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
export function Revelation({ cible = 'maries' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section">
      <div className="split split-inverse">
        <div className="split-text">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>Le moment qu'on n'oublie pas</div>
          <h2>{temoins ? "Le cadeau s'ouvre le lendemain" : "Tout arrive d'un coup, le lendemain"}</h2>
          <p>
            {temoins
              ? "Pendant la fête, personne ne voit rien, pas même les mariés. Puis, à l'heure que vous avez choisie, l'album s'ouvre d'un coup : leur journée vue par ceux qui l'ont vécue avec eux."
              : "Pendant la fête, personne ne voit les photos des autres : un compte à rebours retient tout le monde. Puis, à l'heure que vous avez choisie, l'album s'ouvre pour tous en même temps."}
          </p>
          <ul className="split-list">
            <li><span className="ic">⏳</span><div><b>L'attente fait partie du cadeau</b>, comme une pellicule qu'on porte à développer.</div></li>
            <li><span className="ic">👥</span><div>
              {temoins
                ? <><b>Tout le monde découvre ensemble</b> : les mariés et leurs invités reçoivent le même lien.</>
                : <><b>Tout le monde découvre ensemble</b> : vos invités reçoivent le même lien que vous.</>}
            </div></li>
            <li><span className="ic">📥</span><div>
              {temoins
                ? <><b>Ils gardent tout</b> : en pleine définition, téléchargeable d'un seul clic.</>
                : <><b>Vous téléchargez tout</b> : en pleine définition, d'un seul clic.</>}
            </div></li>
          </ul>
        </div>
        <div className="phone phone-tilt">
          <img src="/accueil/album-partage.webp" width="640" height="1385" loading="lazy"
            alt="L'album partagé pendant la soirée : le compte à rebours avant la révélation et le nombre d'invités." />
        </div>
      </div>
    </section>
  )
}

// L'objection numéro un d'un mariage : et si une photo me gêne ? Pour le
// témoin, la même mécanique répond à une inquiétude différente : ne pas
// offrir aux mariés une photo qui les embarrasse.
export function Controle({ cible = 'maries' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section">
      <div className="split">
        <div className="phone phone-tilt">
          <img src="/accueil/bilan.webp" width="640" height="1393" loading="lazy"
            alt="Le bilan du mariage : nombre de photos prises, premier et dernier cliché, photographe le plus prolifique." />
        </div>
        <div className="split-text">
          <div className="eyebrow-mute" style={{ marginBottom: 10 }}>
            {temoins ? 'Vous maîtrisez la surprise' : 'Vous gardez la main'}
          </div>
          <h2>{temoins ? 'Rien ne leur arrive sans que vous l\'ayez vu' : 'Rien ne se montre sans votre accord'}</h2>
          <p>
            {temoins
              ? "Avant la révélation, vous êtes seul à voir ce qui a été pris. Une photo ratée, un cliché qui les gênerait le jour de leur mariage ? Vous le retirez, et personne n'en saura jamais rien."
              : "C'est votre mariage : vous découvrez les photos en avant-première et vous décidez de ce qui apparaît. Une photo ratée, un moment gênant ? Vous le retirez avant que qui que ce soit ne le voie."}
          </p>
          <ul className="split-list">
            <li><span className="ic">👀</span><div><b>Vous validez en premier</b>, et personne ne saura ce que vous avez masqué.</div></li>
            <li><span className="ic">🤝</span><div>
              {temoins
                ? <><b>À plusieurs si vous voulez</b> : invitez les autres témoins à trier avec vous.</>
                : <><b>À plusieurs si vous voulez</b> : un témoin peut vous aider à trier.</>}
            </div></li>
            <li><span className="ic">🔒</span><div><b>Jamais public</b> : l'album n'existe que pour ceux qui ont le lien.</div></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export function Tarifs({ cible = 'maries' }) {
  const temoins = cible === 'temoins'
  return (
    <section className="section" id="tarifs">
      <h2 className="section-title">Un prix, une fois</h2>
      <div className="section-sub">
        {temoins
          ? "Selon le nombre d'invités attendus. Sans abonnement, et facile à partager entre témoins."
          : "Selon le nombre d'invités que vous attendez. Sans abonnement."}
      </div>
      <div className="price-grid lp-prices">
        {FORMULES_MARIAGE.map((t) => (
          <div key={t.maxGuests} className={`price-card ${t.popular ? 'popular' : ''}`}>
            {t.popular && <span className="price-pop">LE PLUS CHOISI</span>}
            <div className="price-guests">Jusqu'à</div>
            <div className="price-amount">
              {t.maxGuests}
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}> invités</span>
            </div>
            <div className="price-unit">{formatPrice(t.priceCents)} · paiement unique</div>
            <Link href={`/create?tier=${t.maxGuests}`} className={`btn ${t.popular ? 'btn-accent' : 'btn-ghost'}`}>
              Choisir
            </Link>
          </div>
        ))}
      </div>
      <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
        {temoins
          ? "À ce prix, cotisez-vous à deux ou trois et le cadeau est réglé. La formule 5 invités reste gratuite pour l'essayer avant."
          : "Vous voulez d'abord essayer ? La formule 5 invités est gratuite, sans carte bancaire."}
      </p>
    </section>
  )
}

// `enPlus` : la question que fait naître l'angle de la page, et qu'elle est
// seule à devoir traiter.
export function Faq({ enPlus = [] }) {
  return (
    <section className="section">
      <h2 className="section-title">Ce qu'on nous demande le plus</h2>
      <div className="section-sub" />
      {[...enPlus, ...FAQ_COMMUNE].map((f, i) => (
        <div key={i} className="faq-item">
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  )
}

export function Confiance() {
  return (
    <section className="section">
      <div className="lp-trust">
        <span>🇪🇺 Hébergé en Europe</span>
        <span>🔒 Album privé, jamais public</span>
        <span>🗓️ Supprimé au bout de 6 mois</span>
        <span>💳 Paiement sécurisé Stripe</span>
      </div>
    </section>
  )
}

export function CtaFinal({ titre, sous }) {
  return (
    <section className="cta-band">
      <h3>{titre}</h3>
      <p>{sous}</p>
      <Bouton />
    </section>
  )
}

// Pied de page réduit à ce que la loi exige.
export function PiedLp() {
  return (
    <footer className="vfooter">
      <div className="vfooter-inner">
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>
          {BRAND.name}
        </span>
        <nav className="vfooter-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgv">CGV</Link>
          <Link href="/politique-de-confidentialite">Confidentialité</Link>
          <ConsentReset />
        </nav>
        <span className="mono">© 2026 · Hébergé en UE · RGPD</span>
      </div>
    </footer>
  )
}

// Téléphone : le geste reste sous le pouce, du début à la fin.
export function Sticky({ children = 'Créer mon album (gratuit) →' }) {
  return <Link href={CTA} className="lp-sticky">{children}</Link>
}
