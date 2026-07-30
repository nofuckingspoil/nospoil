import SwiftUI

// Application Déclic 100 % NATIVE (caméra Apple, écrans Apple).
// Pour le TEST : on fixe ici l'identifiant d'un événement de test.
// >>> Remplacez "8b9309c2-973f-4995-8e3f-17ee8327bdae" par l'id d'un vrai événement créé
//     sur no-spoil.fr (la partie après /j/ dans le lien d'invitation).
//
// Plus tard (version App Clip), cet identifiant sera lu automatiquement
// depuis l'URL scannée — voir DeclicAppClip/.

@main
struct DeclicNativeApp: App {
    static let eventId = "8b9309c2-973f-4995-8e3f-17ee8327bdae"

    var body: some Scene {
        WindowGroup {
            RootView(eventId: DeclicNativeApp.eventId)
                .preferredColorScheme(.light)
        }
    }
}
