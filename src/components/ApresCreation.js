'use client'

import { useState } from 'react'
import { useLangue } from './Langue'
import { getOwnerToken } from '../lib/device'
import { lireProvenance } from '../lib/provenance'
import QuestionDecouverte from './QuestionDecouverte'

// ============================================================
//  Juste après la création, sur le tableau de bord.
//
//  1. « Comment avez-vous découvert Time to Flash ? » : posée maintenant, une
//     fois la vente faite, elle ne peut plus en coûter une. Choix multiple,
//     voir components/QuestionDecouverte.
//  2. Après la création courte (/create/express), l'invitation à régler le
//     reste : fin, clichés, révélation, couverture. Les valeurs par défaut
//     sont déjà en place, rien n'est obligatoire.
// ============================================================


export default function ApresCreation({ eventId, court, onPersonnaliser }) {
  const { t } = useLangue()
  const [envoi, setEnvoi] = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [ferme, setFerme] = useState(false)

  async function envoyer(reponse) {
    setEnvoi(true)
    try {
      await fetch(`/api/events/${eventId}/decouverte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(eventId) },
        body: JSON.stringify({ ...reponse, provenance: lireProvenance() || {} }),
      })
    } catch {}
    setEnvoi(false)
    setEnvoye(true)
  }

  if (ferme) return null

  return (
    <div className="apres-crea">
      <button type="button" className="db-mail-parti-x" onClick={() => setFerme(true)} aria-label={t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}>×</button>

      {court && (
        <div className="apres-crea-bloc">
          <strong>{t({ fr: '🎉 Votre soirée est prête', en: '🎉 Your event is ready', de: '🎉 Ihr Event ist bereit' })}</strong>
          <p>{t({
            fr: "On a choisi pour vous : 5 photos par personne et une couverture par défaut. Tout se change ici jusqu'au jour J : nombre de photos, fin de la soirée, couverture, photos visibles ou non avant la révélation.",
            en: 'We have chosen for you: 5 photos per person and a default cover. You can change everything here until the big day: number of photos, end of the event, cover, whether photos can be seen before the reveal.',
            de: 'Wir haben für Sie gewählt: 5 Fotos pro Person und ein Standard-Titelbild. Bis zum großen Tag können Sie hier alles ändern: Anzahl der Fotos, Ende des Events, Titelbild, ob Fotos vor der Enthüllung sichtbar sind.',
          })}</p>
          <button type="button" className="btn btn-dark apres-crea-btn" onClick={onPersonnaliser}>
            {t({ fr: 'Personnaliser ma soirée →', en: 'Customise my event →', de: 'Mein Event anpassen →' })}
          </button>
        </div>
      )}

      <div className="apres-crea-bloc">
        {envoye ? (
          <strong>{t({ fr: 'Merci, ça nous aide beaucoup 🙏', en: 'Thank you, that helps us a lot 🙏', de: 'Danke, das hilft uns sehr 🙏' })}</strong>
        ) : (
          <>
            <strong style={{ marginBottom: 10 }}>{t({ fr: 'Une question : comment avez-vous découvert Time to Flash ?', en: 'One question: how did you hear about Time to Flash?', de: 'Eine Frage: Wie haben Sie Time to Flash entdeckt?' })}</strong>
            <QuestionDecouverte envoi={envoi} onEnvoyer={envoyer} onPasser={() => setFerme(true)} />
          </>
        )}
      </div>
    </div>
  )
}
