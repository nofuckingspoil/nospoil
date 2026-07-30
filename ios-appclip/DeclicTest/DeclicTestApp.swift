import SwiftUI

// VERSION DE TEST GRATUITE (sans App Clip).
// But unique : vérifier que la CAMÉRA fonctionne quand votre site Déclic
// est affiché dans une app iOS. Aucun compte payant nécessaire.
//
// On ouvre directement une page d'invitation de test.
// >>> Remplacez l'identifiant ci-dessous par un VRAI événement de test
//     (l'adresse que vous obtenez en créant un événement sur no-spoil.fr).

@main
struct DeclicTestApp: App {
    // 👇 Mettez ici l'adresse d'une vraie invitation de test.
    static let testURL = URL(string: "https://no-spoil.fr/j/REMPLACER_PAR_ID")!

    var body: some Scene {
        WindowGroup {
            ContentView(url: DeclicTestApp.testURL)
        }
    }
}
