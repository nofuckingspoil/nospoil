import SwiftUI

struct ContentView: View {
    let url: URL

    var body: some View {
        WebView(url: url)
            .ignoresSafeArea()
    }
}
