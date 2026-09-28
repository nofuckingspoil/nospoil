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
//  s'engage à donner, et une seule question est obligatoire.
//
//  Deux choses s'ouvrent en cours de route, et seulement en cours de route :
//  la grande question ouverte, reformulée d'après la note qu'on vient de
//  donner, et la liste des soucis, qui n'apparaît qu'à celui qui a répondu
//  « oui » à « avez-vous eu un problème ? ». Les afficher d'emblée reviendrait
//  à demander à tout le monde de lire sept cases qui ne concernent qu'une
//  personne sur cinq.
// ============================================================
import { useState } from 'react'
import { notes, referait as referaitListe, preferees, sources, probleme, souciDe, reactionA } from '../lib/avis'
import { useLangue } from './Langue'

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

export default function Avis({ role = 'invite', payload = {}, onClose = null, compact = false, accroche = null }) {
  const { t, lang } = useLangue()
  const NOTES = notes(lang)
  const orga = role === 'organisateur'
  // La case « tout allait bien » a été remplacée par le oui/non : elle n'a plus
  // à figurer dans la liste, qui ne s'ouvre déjà qu'en cas de « oui ».
  const SOUCIS = souciDe(role, lang).filter((s) => !s.ok)

  const [note, setNote] = useState(null)
  // L'identifiant de la ligne créée dès la première étoile, en mode pop-up.
  // Le questionnaire complet viendra la compléter au lieu d'en créer une autre.
  const [ligneId, setLigneId] = useState(null)
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
      ? {
        relance: t({ fr: "Racontez-nous en une phrase ce qui s'est passé.", en: 'Tell us in one sentence what happened.', de: 'Erzählen Sie uns in einem Satz, was passiert ist.' }),
        exemple: t({ fr: 'Le plus concret possible, même approximatif.', en: 'As specific as possible, even if rough.', de: 'So konkret wie möglich, auch wenn nur ungefähr.' }),
      }
      : null

  // La note part dès la première étoile, sans attendre le reste. Celui qui
  // referme la pop-up juste après a quand même répondu à la seule question
  // obligatoire : ne rien garder reviendrait à perdre l'essentiel pour avoir
  // réclamé le détail.
  async function poserLaNote(v) {
    setNote(v)
    if (!compact || ligneId) return
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, rating: v }),
      })
      const d = await r.json().catch(() => ({}))
      if (d.id) setLigneId(d.id)
    } catch {}
  }

  async function envoyer() {
    if (!note || envoi) return
    setEnvoi(true); setErreur('')
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          ...(ligneId ? { feedbackId: ligneId } : null),
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
      setErreur(t({ fr: 'Connexion impossible. Réessayez dans un instant.', en: 'Could not connect. Please try again in a moment.', de: 'Keine Verbindung möglich. Bitte versuchen Sie es gleich noch einmal.' }))
      setEnvoi(false)
    }
  }

  if (fini) {
    return (
      <div className={`avis ${compact ? 'avis-compact' : ''}`}>
        <div className="avis-merci">
          <div className="avis-merci-ic" aria-hidden="true">🎞️</div>
          <h3 className="h3" style={{ margin: '0 0 6px' }}>{t({ fr: 'Merci, vraiment.', en: 'Thank you, truly.', de: 'Vielen Dank, wirklich.' })}</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {orga
              ? t({ fr: 'Chaque réponse est lue. Si vous avez accepté l’appel, on vous écrit très vite.', en: 'Every answer gets read. If you agreed to a call, we will be in touch very soon.', de: 'Jede Antwort wird gelesen. Wenn Sie dem Anruf zugestimmt haben, melden wir uns sehr bald.' })
              : t({ fr: 'C’est avec ça qu’on corrige ce qui ne va pas encore.', en: 'This is how we fix what is not quite right yet.', de: 'Genau damit verbessern wir, was noch nicht rund läuft.' })}
          </p>
        </div>

        {onClose && (
          <button className="btn btn-dark" style={{ marginTop: 18, width: '100%' }} onClick={onClose}>
            {compact ? t({ fr: 'Revenir aux photos', en: 'Back to the photos', de: 'Zurück zu den Fotos' }) : t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`avis ${compact ? 'avis-compact' : ''}`}>
      {onClose && compact && (
        <button className="avis-fermer" onClick={onClose} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>×</button>
      )}
      {/* La raison pour laquelle on se permet d'interrompre, écrite avant la
          question et non après : « vous faites partie des mille premiers ». */}
      {accroche && <p className="avis-pop-accroche">{accroche}</p>}

      {/* 1. La note. La seule question obligatoire : celle à laquelle tout le
          monde répond, et qui suffit à mesurer la satisfaction dans le temps. */}
      <div className="avis-q">
        <div className="avis-lbl">{orga ? t({ fr: 'Dans l’ensemble, comment s’est passée votre soirée ?', en: 'Overall, how did your event go?', de: 'Wie ist Ihre Feier insgesamt gelaufen?' }) : t({ fr: 'Vous avez aimé ?', en: 'Did you enjoy it?', de: 'Hat es Ihnen gefallen?' })}</div>
        {/* Cinq étoiles : le geste se fait sans rien lire. Elles s'allument
            jusqu'à celle qu'on touche, comme partout ailleurs, et le mot
            correspondant s'affiche dessous une fois le choix fait. */}
        <div className="avis-etoiles" role="radiogroup"
          aria-label={orga ? t({ fr: 'Note de votre soirée', en: 'Your event rating', de: 'Bewertung Ihrer Feier' }) : t({ fr: 'Votre note', en: 'Your rating', de: 'Ihre Bewertung' })}>
          {NOTES.map((n) => (
            <button key={n.valeur} type="button"
              className={`avis-etoile ${note >= n.valeur ? 'on' : ''}`}
              role="radio" aria-checked={note === n.valeur}
              aria-label={t({ fr: `${n.valeur} étoile${n.valeur > 1 ? 's' : ''} sur 5 : ${n.mot}`, en: `${n.valeur} star${n.valeur > 1 ? 's' : ''} out of 5: ${n.mot}`, de: `${n.valeur} von 5 Sternen: ${n.mot}` })}
              onClick={() => poserLaNote(n.valeur)}>
              <span aria-hidden="true">★</span>
            </button>
          ))}
        </div>
        <div className="avis-etoiles-mot">{note ? NOTES.find((n) => n.valeur === note)?.mot : t({ fr: 'Notez de 1 à 5 étoiles', en: 'Rate from 1 to 5 stars', de: 'Bewerten Sie mit 1 bis 5 Sternen' })}</div>
      </div>

      {/* En pop-up, tout ce qui suit reste plié tant qu'aucune étoile n'est
          touchée. Le questionnaire entier posé d'un coup sur l'album, c'est un
          mur : on voit ce que ça coûte avant de voir ce que ça demande, et on
          referme. Une seule étoile à toucher, et la suite se déplie pour qui
          veut bien continuer. La note, elle, est déjà enregistrée. */}
      {(!compact || note) && (<>

      {/* 2. La question ouverte, et de la place pour y répondre. Elle se
          reformule d'après la note qui vient d'être donnée : c'est la même
          case, mais on ne demande pas la même chose à quelqu'un qui a mis
          une étoile et à quelqu'un qui en a mis cinq. */}
      {note && (
        <div className="avis-q avis-ouvert">
          <div className="avis-lbl">{reactionA(role, note, lang)?.q}</div>
          <textarea rows={4} value={reaction} onChange={(e) => setReaction(e.target.value)}
            placeholder={reactionA(role, note, lang)?.ph} />
          <div className="avis-sous" style={{ margin: '6px 0 0' }}>
            {t({ fr: 'Facultatif, mais c’est ce qu’on lit en premier.', en: 'Optional, but it is the first thing we read.', de: 'Freiwillig, aber das lesen wir als Erstes.' })}
          </div>
        </div>
      )}

      {/* 3. La recommandation, organisateur seulement. C'est la question qui
          se compare d'un mois sur l'autre : elle ne changera plus. */}
      {orga && (
        <div className="avis-q">
          <div className="avis-lbl">{t({ fr: 'Recommanderiez-vous Time to Flash à un ami qui organise une fête ?', en: 'Would you recommend Time to Flash to a friend planning a party?', de: 'Würden Sie Time to Flash einem Freund empfehlen, der eine Feier plant?' })}</div>
          <div className="avis-nps">
            {Array.from({ length: 11 }, (_, i) => (
              <button key={i} type="button" className={`avis-num ${nps === i ? 'on' : ''}`}
                aria-pressed={nps === i} onClick={() => setNps(i)}>{i}</button>
            ))}
          </div>
          <div className="avis-nps-ext"><span>{t({ fr: 'Jamais', en: 'Never', de: 'Niemals' })}</span><span>{t({ fr: 'Sans hésiter', en: 'Without hesitation', de: 'Auf jeden Fall' })}</span></div>
          {nps !== null && (
            <input type="text" value={npsRaison} onChange={(e) => setNpsRaison(e.target.value)}
              placeholder={t({ fr: 'En une phrase, pourquoi cette note ? (facultatif)', en: 'In one sentence, why this score? (optional)', de: 'In einem Satz: Warum diese Bewertung? (freiwillig)' })} style={{ marginTop: 10 }} />
          )}
        </div>
      )}

      {/* 4. Les difficultés. Un oui/non d'abord, la liste seulement après :
          celui qui n'a rien eu répond en un clic et passe à la suite, celui qui
          a eu un souci se voit proposer des cases plutôt qu'une page blanche.

          Les cases restent indispensables : « qu'est-ce qui a coincé ? » en
          texte libre ne récolte que des « rien ». La liste, elle, force à se
          souvenir. */}
      <div className="avis-q">
        <div className="avis-lbl">{orga ? t({ fr: 'Avez-vous eu un problème technique, vous ou vos participants ?', en: 'Did you or your guests have any technical problems?', de: 'Hatten Sie oder Ihre Gäste ein technisches Problem?' }) : t({ fr: 'Avez-vous eu un problème technique ?', en: 'Did you have any technical problems?', de: 'Hatten Sie ein technisches Problem?' })}</div>
        <Choix options={probleme(lang)} valeur={aEuProbleme} onChange={repondreProbleme} />

        {aEuProbleme === 'oui' && (
          <div className="avis-suite">
            <div className="avis-lbl" style={{ fontSize: 14 }}>{t({ fr: 'Lequel ?', en: 'Which one?', de: 'Welches?' })}</div>
            <div className="avis-sous">{t({ fr: 'Plusieurs réponses possibles.', en: 'You can choose more than one.', de: 'Mehrere Antworten möglich.' })}</div>
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
          {/* 5. Ce qui a plu : sert à savoir ce qu'on ne doit surtout pas casser. */}
          <div className="avis-q">
            <div className="avis-lbl">{t({ fr: 'Qu’est-ce qui a le plus plu, chez vous ?', en: 'What did people like most at your event?', de: 'Was hat bei Ihnen am besten gefallen?' })}</div>
            <Choix options={preferees(lang)} valeur={preferee} onChange={setPreferee} />
          </div>

          <div className="avis-q">
            <div className="avis-lbl">{t({ fr: 'Comment avez-vous connu Time to Flash ?', en: 'How did you hear about Time to Flash?', de: 'Wie haben Sie von Time to Flash erfahren?' })}</div>
            <Choix options={sources(lang)} valeur={source} onChange={setSource} />
          </div>

          {/* Le champ du numéro n'apparaît qu'après la case cochée : un
              téléphone visible d'emblée fait fuir, même présenté comme
              facultatif. */}
          <div className="avis-appel">
            <label className="avis-case">
              <input type="checkbox" checked={appel} onChange={(e) => setAppel(e.target.checked)} />
              <span>{t({ fr: <>J’accepte qu’on m’appelle <strong>5 minutes</strong> pour en parler.</>, en: <>I am happy to take a <strong>5-minute</strong> call to talk about it.</>, de: <>Ich bin mit einem <strong>5-minütigen</strong> Anruf dazu einverstanden.</> })}</span>
            </label>
            {appel && (
              <div className="field" style={{ margin: '12px 0 0' }}>
                <label>{t({ fr: 'Votre numéro', en: 'Your number', de: 'Ihre Nummer' })} <span className="field-tag">{t({ fr: 'facultatif', en: 'optional', de: 'freiwillig' })}</span></label>
                <input type="tel" inputMode="tel" autoComplete="tel" value={tel}
                  onChange={(e) => setTel(e.target.value)} placeholder={t({ fr: '06 12 34 56 78', en: '07700 900123', de: '0151 23456789' })} />
                <div className="hint">{t({ fr: 'Utilisé uniquement pour cet appel, puis supprimé.', en: 'Used only for this call, then deleted.', de: 'Wird nur für diesen Anruf verwendet und danach gelöscht.' })}</div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* 5 bis. La question qui compte pour la suite : chaque participant est un
           organisateur en puissance, et c'est là que ça se joue. */
        <div className="avis-q">
          <div className="avis-lbl">{t({ fr: 'Utiliseriez-vous Time to Flash pour votre propre fête ?', en: 'Would you use Time to Flash for your own party?', de: 'Würden Sie Time to Flash für Ihre eigene Feier nutzen?' })}</div>
          <Choix options={referaitListe(lang)} valeur={referait} onChange={setReferait} />
        </div>
      )}

      {erreur && <div className="err" style={{ marginTop: 8 }}>{erreur}</div>}

      <button className="btn btn-accent avis-envoi" onClick={envoyer} disabled={!note || envoi}>
        {envoi ? t({ fr: 'Envoi…', en: 'Sending…', de: 'Wird gesendet…' }) : note ? t({ fr: 'Envoyer', en: 'Send', de: 'Senden' }) : t({ fr: 'Choisissez une réponse ci-dessus', en: 'Choose an answer above', de: 'Wählen Sie oben eine Antwort' })}
      </button>
      <p className="avis-pied">
        {orga
          ? t({ fr: 'Une seule question est obligatoire, les autres sont libres.', en: 'Only one question is required, the rest are up to you.', de: 'Nur eine Frage ist Pflicht, die anderen sind freiwillig.' })
          : t({ fr: 'Anonyme pour l’organisateur : lui ne verra jamais votre réponse.', en: 'Anonymous for the host: they will never see your answer.', de: 'Anonym für den Gastgeber: Er sieht Ihre Antwort nie.' })}
      </p>

      </>)}

    </div>
  )
}
