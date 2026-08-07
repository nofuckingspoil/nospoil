'use client'
// ============================================================
//  Le questionnaire, en un seul composant.
//
//  Il sert l'encart posé dans l'album et la page ouverte depuis un mail : ce
//  sont les mêmes questions, et elles doivent le rester si l'on veut pouvoir
//  comparer les réponses des deux canaux.
//
//  Tout est visible d'un coup, sans étapes. Un questionnaire découpé en pages
//  cache son propre coût : on accepte de commencer sans savoir combien il en
//  reste, et l'on abandonne au milieu. Ici on voit tout de suite ce qu'on
//  s'engage à donner — et une seule question est obligatoire.
//
//  Deux choses s'ouvrent en cours de route, et seulement en cours de route :
//  la grande question ouverte, reformulée d'après la note qu'on vient de
//  donner, et la liste des soucis, qui n'apparaît qu'à celui qui a répondu
//  « oui » à « avez-vous eu un problème ? ». Les afficher d'emblée reviendrait
//  à demander à tout le monde de lire sept cases qui ne concernent qu'une
//  personne sur cinq.
// ============================================================
import { useState } from 'react'
import { NOTES, REFERAIT, PREFEREES, SOURCES, PROBLEME, souciDe, reactionA } from '../lib/avis'

function Choix({ options, valeur, onChange, cle = 'id' }) {
  return (
    <div className="avis-choix">
      {options.map((o) => {
        const v = o[cle]
        return (
          <button key={v} type="button"
            className={`avis-opt ${valeur === v ? 'on' : ''}`}
            aria-pressed={valeur === v}
            onClick={() => onChange(valeur === v ? null : v)}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export default function Avis({ role = 'invite', payload = {}, onClose = null, compact = false }) {
  const orga = role === 'organisateur'
  // La case « tout allait bien » a été remplacée par le oui/non : elle n'a plus
  // à figurer dans la liste, qui ne s'ouvre déjà qu'en cas de « oui ».
  const SOUCIS = souciDe(role).filter((s) => !s.ok)

  const [note, setNote] = useState(null)
  const [reaction, setReaction] = useState('')
  const [aEuProbleme, setAEuProbleme] = useState(null) // null | 'non' | 'oui'
  const [soucis, setSoucis] = useState(() => new Set())
  const [detail, setDetail] = useState('')
  const [referait, setReferait] = useState(null)
  const [nps, setNps] = useState(null)
  const [npsRaison, setNpsRaison] = useState('')
  const [preferee, setPreferee] = useState(null)
  const [source, setSource] = useState(null)
  const [appel, setAppel] = useState(false)
  const [tel, setTel] = useState('')

  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [fini, setFini] = useState(false)

  function basculerSouci(id) {
    setSoucis((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  // Répondre « non » efface les cases éventuellement cochées avant de changer
  // d'avis : les deux réponses ensemble ne veulent rien dire, et la
  // contradiction fausserait le compte des problèmes.
  function repondreProbleme(v) {
    setAEuProbleme(v)
    if (v !== 'oui') { setSoucis(new Set()); setDetail('') }
  }

  // Ce qui part vraiment. « Oui » sans aucune case cochée reste un problème :
  // il compte dans les alertes, sous un nom qui dit qu'il n'a pas été précisé.
  const issues = aEuProbleme === 'non'
    ? ['ok']
    : aEuProbleme === 'oui'
      ? (soucis.size ? [...soucis] : ['nonprecise'])
      : []

  const problemes = SOUCIS.filter((s) => soucis.has(s.id))
  // Une seule relance, même si plusieurs cases sont cochées : trois champs
  // libres d'affilée et personne ne remplit le premier.
  const relance = problemes.length === 1
    ? problemes[0]
    : problemes.length > 1
      ? { relance: "Racontez-nous en une phrase ce qui s'est passé.", exemple: 'Le plus concret possible, même approximatif.' }
      : null

  async function envoyer() {
    if (!note || envoi) return
    setEnvoi(true); setErreur('')
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          rating: note,
          issues,
          issueDetail: detail,
          suggestion: reaction,
          ...(orga
            ? {
                nps, npsReason: npsRaison, favorite: preferee,
                source, callOk: appel, phone: tel,
              }
            : { wouldHost: referait }),
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (d.error) { setErreur(d.error); setEnvoi(false); return }
      setFini(true)
    } catch {
      setErreur('Connexion impossible. Réessayez dans un instant.')
      setEnvoi(false)
    }
  }

  if (fini) {
    return (
      <div className={`avis ${compact ? 'avis-compact' : ''}`}>
        <div className="avis-merci">
          <div className="avis-merci-ic" aria-hidden="true">🎞️</div>
          <h3 className="h3" style={{ margin: '0 0 6px' }}>Merci, vraiment.</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {orga
              ? 'Chaque réponse est lue. Si vous avez accepté l’appel, on vous écrit très vite.'
              : 'C’est avec ça qu’on corrige ce qui ne va pas encore.'}
          </p>
        </div>

        {onClose && (
          <button className="btn btn-dark" style={{ marginTop: 18, width: '100%' }} onClick={onClose}>
            {compact ? 'Revenir aux photos' : 'Fermer'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`avis ${compact ? 'avis-compact' : ''}`}>
      {onClose && compact && (
        <button className="avis-fermer" onClick={onClose} aria-label="Fermer">×</button>
      )}

      {/* 1 — La note. La seule question obligatoire : celle à laquelle tout le
          monde répond, et qui suffit à mesurer la satisfaction dans le temps. */}
      <div className="avis-q">
        <div className="avis-lbl">{orga ? 'Dans l’ensemble, comment s’est passée votre soirée ?' : 'Vous avez aimé ?'}</div>
        <div className="avis-notes">
          {NOTES.map((n) => (
            <button key={n.valeur} type="button"
              className={`avis-note ${note === n.valeur ? 'on' : ''}`}
              aria-pressed={note === n.valeur} title={n.mot}
              onClick={() => setNote(n.valeur)}>
              <span aria-hidden="true">{n.emoji}</span>
              <em>{n.mot}</em>
            </button>
          ))}
        </div>
      </div>

      {/* 2 — La question ouverte, et de la place pour y répondre. Elle se
          reformule d'après la note qui vient d'être donnée : c'est la même
          case, mais on ne demande pas la même chose à quelqu'un qui a mis
          « Bof » et à quelqu'un qui a mis « Génial ». */}
      {note && (
        <div className="avis-q avis-ouvert">
          <div className="avis-lbl">{reactionA(role, note)?.q}</div>
          <textarea rows={4} value={reaction} onChange={(e) => setReaction(e.target.value)}
            placeholder={reactionA(role, note)?.ph} />
          <div className="avis-sous" style={{ margin: '6px 0 0' }}>
            Facultatif, mais c’est ce qu’on lit en premier.
          </div>
        </div>
      )}

      {/* 3 — La recommandation, organisateur seulement. C'est la question qui
          se compare d'un mois sur l'autre : elle ne changera plus. */}
      {orga && (
        <div className="avis-q">
          <div className="avis-lbl">Recommanderiez-vous Time to Flash à un ami qui organise une fête ?</div>
          <div className="avis-nps">
            {Array.from({ length: 11 }, (_, i) => (
              <button key={i} type="button" className={`avis-num ${nps === i ? 'on' : ''}`}
                aria-pressed={nps === i} onClick={() => setNps(i)}>{i}</button>
            ))}
          </div>
          <div className="avis-nps-ext"><span>Jamais</span><span>Sans hésiter</span></div>
          {nps !== null && (
            <input type="text" value={npsRaison} onChange={(e) => setNpsRaison(e.target.value)}
              placeholder="En une phrase, pourquoi cette note ? (facultatif)" style={{ marginTop: 10 }} />
          )}
        </div>
      )}

      {/* 4 — Les difficultés. Un oui/non d'abord, la liste seulement après :
          celui qui n'a rien eu répond en un clic et passe à la suite, celui qui
          a eu un souci se voit proposer des cases plutôt qu'une page blanche.

          Les cases restent indispensables — « qu'est-ce qui a coincé ? » en
          texte libre ne récolte que des « rien ». La liste, elle, force à se
          souvenir. */}
      <div className="avis-q">
        <div className="avis-lbl">{orga ? 'Avez-vous eu un problème technique, vous ou vos invités ?' : 'Avez-vous eu un problème technique ?'}</div>
        <Choix options={PROBLEME} valeur={aEuProbleme} onChange={repondreProbleme} />

        {aEuProbleme === 'oui' && (
          <div className="avis-suite">
            <div className="avis-lbl" style={{ fontSize: 14 }}>Lequel ?</div>
            <div className="avis-sous">Plusieurs réponses possibles.</div>
            <div className="avis-choix">
              {SOUCIS.map((s) => (
                <button key={s.id} type="button"
                  className={`avis-opt ${soucis.has(s.id) ? 'on' : ''}`}
                  aria-pressed={soucis.has(s.id)}
                  onClick={() => basculerSouci(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            {relance && (
              <div className="avis-relance">
                <label>{relance.relance}</label>
                <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} />
                <div className="hint">{relance.exemple}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {orga ? (
        <>
          {/* 5 — Ce qui a plu : sert à savoir ce qu'on ne doit surtout pas casser. */}
          <div className="avis-q">
            <div className="avis-lbl">Qu’est-ce qui a le plus plu, chez vous ?</div>
            <Choix options={PREFEREES} valeur={preferee} onChange={setPreferee} />
          </div>

          <div className="avis-q">
            <div className="avis-lbl">Comment avez-vous connu Time to Flash ?</div>
            <Choix options={SOURCES} valeur={source} onChange={setSource} />
          </div>

          {/* Le champ du numéro n'apparaît qu'après la case cochée : un
              téléphone visible d'emblée fait fuir, même présenté comme
              facultatif. */}
          <div className="avis-appel">
            <label className="avis-case">
              <input type="checkbox" checked={appel} onChange={(e) => setAppel(e.target.checked)} />
              <span>J’accepte qu’on m’appelle <strong>5 minutes</strong> pour en parler.</span>
            </label>
            {appel && (
              <div className="field" style={{ margin: '12px 0 0' }}>
                <label>Votre numéro <span className="field-tag">facultatif</span></label>
                <input type="tel" inputMode="tel" autoComplete="tel" value={tel}
                  onChange={(e) => setTel(e.target.value)} placeholder="06 12 34 56 78" />
                <div className="hint">Utilisé uniquement pour cet appel, puis supprimé.</div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* 5 bis — La question qui compte pour la suite : chaque invité est un
           organisateur en puissance, et c'est là que ça se joue. */
        <div className="avis-q">
          <div className="avis-lbl">Utiliseriez-vous Time to Flash pour votre propre fête ?</div>
          <Choix options={REFERAIT} valeur={referait} onChange={setReferait} />
        </div>
      )}

      {erreur && <div className="err" style={{ marginTop: 8 }}>{erreur}</div>}

      <button className="btn btn-accent avis-envoi" onClick={envoyer} disabled={!note || envoi}>
        {envoi ? 'Envoi…' : note ? 'Envoyer' : 'Choisissez une réponse ci-dessus'}
      </button>
      <p className="avis-pied">
        {orga
          ? 'Une seule question est obligatoire, les autres sont libres.'
          : 'Anonyme pour l’organisateur : lui ne verra jamais votre réponse.'}
      </p>
    </div>
  )
}
