import SwiftUI
import WebKit

// Affiche votre site Déclic dans l'App Clip, en autorisant la caméra.
// C'est le composant CLÉ : c'est lui qui détermine si "prendre une photo"
// fonctionne depuis l'App Clip (le fameux risque n°1).

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        // Autorise la caméra à tourner en plein écran, sans clic préalable forcé.
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = context.coordinator
        webView.scrollView.bounces = false
        webView.allowsBackForwardNavigationGestures = false
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // Si l'URL d'invitation change (nouveau scan), on recharge.
        if webView.url != url {
            webView.load(URLRequest(url: url))
        }
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, WKUIDelegate {
        // Accorde automatiquement l'accès caméra demandé par le site
        // (après que l'utilisateur ait accepté la pop-up système iOS).
        func webView(_ webView: WKWebView,
                     requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo,
                     type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            decisionHandler(.grant)
        }
    }
}
