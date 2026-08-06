import Link from 'next/link'
import { BRAND } from '../lib/brand'
import Logo from '../components/Logo'
import SiteNav from '../components/SiteNav'
import TryQR from '../components/TryQR'
import { TIERS, TOP_TIER, formatPrice } from '../lib/pricing'

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.pitch,
}

const STEPS = [
  { ic: '🔳', title: 'Scannez le QR', sub: "Vos invités ouvrent l'appareil dans leur navigateur. Aucune appli à installer." },
  { ic: '📸', title: 'Prenez vos clichés', sub: 'Un nombre limité de photos par invité. Chaque cliché compte vraiment.' },
  { ic: '🎞️', title: 'La révélation', sub: 'Tout se développe et se révèle après la fête, pour tout le monde d\'un coup.' },
]

// Ce que l'organisateur garde sous contrôle. Deux testeurs ont posé la question
// spontanément : la fonction existait déjà, elle n'était juste écrite nulle part.
const CONTROL = [
  { ic: '👀', title: 'Vous validez avant la révélation', sub: 'Vous découvrez les photos en avant-première et masquez celles que vous ne voulez pas voir apparaître. Personne ne le saura.' },
  { ic: '🤝', title: 'À plusieurs si besoin', sub: 'Invitez des co-organisateurs — les mariés, un témoin — pour gérer la galerie et faire le tri ensemble.' },
  { ic: '🎞️', title: 'Chacun maîtrise ses clichés', sub: 'Un invité peut supprimer une photo ratée et en reprendre une. Sans jamais dépasser la limite que vous avez fixée.' },
]

const REASSURE = [
  { ic: '🇪🇺', title: 'Hébergé en Europe', sub: 'Vos photos restent sur des serveurs européens.' },
  { ic: '🔒', title: 'Personne d\'autre que vos invités', sub: 'Votre galerie n\'est accessible que par votre lien privé. Elle n\'est jamais publique.' },
  { ic: '📱', title: 'Aucune appli', sub: 'Tout se passe dans le navigateur, même pour vos invités.' },
  { ic: '🗓️', title: 'Suppression auto', sub: 'Photos effacées 6 mois après la révélation. On vous prévient avant.' },
]

const FAQ = [
  { q: 'Mes invités doivent-ils installer une application ?', a: 'Non. Ils scannent le QR code et la caméra s\'ouvre directement dans leur navigateur. Aucun compte, aucune installation.' },
  { q: 'Combien de temps dure un événement ?', a: 'Aussi longtemps que vous voulez. Vous choisissez la date de début et la date de révélation : une soirée, un week-end, ou une semaine entière de vacances.' },
  { q: 'C\'est réservé aux mariages ?', a: 'Non. Anniversaires, baptêmes, EVJF, vacances entre amis, séminaires — tout événement où les gens sortent leur téléphone pour prendre des photos.' },
  { q: 'Combien de photos chacun peut-il prendre ?', a: 'Vous fixez la limite entre 3 et 15 clichés par invité. Vous pouvez aussi prévoir une recharge de 1 à 5 photos, offerte à ceux qui ont épuisé leur quota — soit 20 photos maximum. C\'est la contrainte « argentique » qui rend chaque cliché précieux.' },
  { q: 'Un invité peut-il supprimer une photo ratée ?', a: 'Oui. La photo supprimée libère une place, il peut en reprendre une autre. En revanche, il ne dépassera jamais la limite que vous avez fixée.' },
  { q: 'Puis-je retirer une photo avant que tout le monde la voie ?', a: 'Oui. Avant la révélation, vous êtes seul à voir les photos et vous pouvez en masquer autant que vous le souhaitez. Vous pouvez aussi inviter des co-organisateurs pour faire ce tri à plusieurs.' },
  { q: 'Quand les photos sont-elles visibles ?', a: 'Elles restent cachées jusqu\'à la date de révélation que vous choisissez — comme une pellicule qu\'on développe. Ensuite, la galerie s\'ouvre pour tout le monde.' },
  { q: 'C\'est un abonnement ?', a: 'Non. Vous payez une seule fois pour votre événement, selon le nombre d\'invités. Sans renouvellement.' },
]

function PriceCard({ tier }) {
  const isFree = tier.priceCents === 0
  return (
    <div className={`price-card ${tier.popular ? 'popular' : ''}`}>
      {tier.popular && <span className="price-pop">LE PLUS CHOISI</span>}
      <div className="price-guests">{isFree ? 'Pour tester' : 'Jusqu\'à'}</div>
      <div className="price-amount">{tier.maxGuests}<span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}> invités</span></div>
      <div className="price-unit">{isFree ? 'Gratuit · sans carte' : `${formatPrice(tier.priceCents)} · paiement unique`}</div>
      <Link href={`/create?tier=${tier.maxGuests}`} className={`btn ${tier.popular ? 'btn-accent' : 'btn-ghost'}`}>
        {isFree ? 'Essayer gratuitement' : 'Choisir cette formule'}
      </Link>
    </div>
  )
}

export default function Home() {
  return (
    <div className="site">
      <TryQR />
      <SiteNav />

      {/* <main> : repère qui permet aux lecteurs d'écran de sauter directement
          au contenu principal, en passant la navigation. */}
      <main className="site-inner">
        {/* HERO */}
        <section className="hero">
          <div className="eyebrow">Appareil photo jetable · événements</div>
          <h1>L'appareil photo<br />jetable de vos<br />événements.</h1>
          <p>{BRAND.pitch}</p>
          {/* Deux testeurs ont cru à une contrainte de 24 h : la durée se dit ici. */}
          <p style={{ marginTop: 10 }}>Une soirée, un week-end ou une semaine entière : vous choisissez la durée et le nombre de clichés.</p>
          <div className="hero-cta">
            <Link href="#tarifs" className="btn btn-accent">Voir les formules →</Link>
            <span className="mono small muted">Gratuit jusqu'à 5 invités</span>
          </div>
          {/* Sur téléphone, la pastille flottante « Essayer » tombait pile sous
              le bouton « Créer mon événement ». L'essai se propose donc ici,
              dans la lecture, plutôt qu'en bas de l'écran. */}
          <Link href="/essai" className="hero-try">✱ Essayer l'appareil photo tout de suite</Link>
          {/* « Que pour les mariages ? » — la réponse tient sur une ligne. */}
          <div className="mono small muted" style={{ marginTop: 20 }}>
            Mariages · Anniversaires · Baptêmes · EVJF · Vacances · Séminaires
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Comment ça marche</div>
          <h2 className="section-title">Trois étapes, zéro friction</h2>
          <div className="section-sub">Vous créez l'événement, vos invités scannent, et la magie opère après la fête.</div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{s.ic}</div>
                <h3>{s.title}</h3>
                <p>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VOUS GARDEZ LA MAIN */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Vous gardez la main</div>
          <h2 className="section-title">Rien ne se révèle sans votre accord</h2>
          <div className="section-sub">Une photo gênante ? Vous la retirez avant que qui que ce soit ne la voie.</div>
          <div className="steps-grid">
            {CONTROL.map((c, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{c.ic}</div>
                <h3>{c.title}</h3>
                <p>{c.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TARIFS */}
        <section className="section" id="tarifs">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Tarifs</div>
          <h2 className="section-title">Un prix unique par événement</h2>
          <div className="section-sub">Pas d'abonnement. Vous choisissez selon le nombre d'invités, vous payez une fois.</div>
          <div className="price-grid">
            {TIERS.map((t) => <PriceCard key={t.maxGuests} tier={t} />)}
          </div>
          <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
            Plus de {TOP_TIER.maxGuests} invités ? Écrivez-nous.
          </p>
        </section>

        {/* RÉASSURANCE */}
        <section className="section">
          <h2 className="section-title">Pensé pour vos souvenirs</h2>
          <div className="section-sub">La confiance avant tout : vos photos vous appartiennent.</div>
          <div className="reassure">
            {REASSURE.map((r, i) => (
              <div key={i} className="reassure-item">
                <span className="ic">{r.ic}</span>
                <div><h3>{r.title}</h3><p>{r.sub}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <h2 className="section-title">Questions fréquentes</h2>
          <div className="section-sub" />
          {FAQ.map((f, i) => (
            <div key={i} className="faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {/* CTA FINAL */}
        <section className="cta-band">
          <h3>Un événement à immortaliser ?</h3>
          <p>Créez votre appareil jetable en 2 minutes.</p>
          <Link href="/create?tier=5" className="btn btn-accent">Créer mon événement →</Link>
        </section>
      </main>

      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
          <nav className="vfooter-links">
            <Link href="/generateur-qr-code-mariage">Générateur de QR code</Link>
            <Link href="/aide">Aide</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/cgv">CGV</Link>
            <Link href="/politique-de-confidentialite">Confidentialité</Link>
          </nav>
          <span className="mono">© 2026 · Hébergé en UE · RGPD</span>
        </div>
      </footer>
    </div>
  )
}
