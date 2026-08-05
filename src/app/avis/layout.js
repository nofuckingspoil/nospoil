// Le questionnaire s'ouvre depuis un lien personnel : il n'a rien à faire
// dans un moteur de recherche, et une page d'enquête indexée attirerait des
// réponses d'inconnus qui fausseraient la mesure.
export const metadata = {
  title: 'Votre avis',
  description: 'Quelques questions sur votre expérience Time to Flash.',
  robots: { index: false, follow: false },
}

export default function AvisLayout({ children }) {
  return children
}
