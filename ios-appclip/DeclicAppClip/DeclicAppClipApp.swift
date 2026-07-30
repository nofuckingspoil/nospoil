import SwiftUI

// Point d'entrée de l'App Clip.
// Au scan du QR, iOS lance l'App Clip avec l'URL de l'invitation
// (ex. https://no-spoil.fr/j/ABC123). On récupère cette URL et on
// l'affiche dans une vue web qui réutilise votre site existant.

@main
struct DeclicAppClipApp: App {
    @State private var inviteURL: URL = URL(string: "https://no-spoil.fr/")!

    var body: some Scene {
        WindowGroup {
            ContentView(url: inviteURL)
                // iOS transmet l'URL scannée via cette "activité".
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
                    if let url = activity.webpageURL {
                        inviteURL = url
                    }
                }
        }
    }
}
