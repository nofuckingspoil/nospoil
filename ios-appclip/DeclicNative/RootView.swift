import SwiftUI

// Aiguille vers le bon écran selon la phase (comme le switch du site).
struct RootView: View {
    @StateObject private var state: AppState

    init(eventId: String) {
        _state = StateObject(wrappedValue: AppState(eventId: eventId))
    }

    var body: some View {
        Group {
            switch state.phase {
            case .loading:
                ZStack { Color.declicCream.ignoresSafeArea(); ProgressView("Chargement…") }
            case .error:
                ZStack {
                    Color.declicCream.ignoresSafeArea()
                    Text(state.errorText.isEmpty ? "Événement introuvable." : state.errorText)
                        .padding(24).multilineTextAlignment(.center)
                }
            case .cover:
                CoverView(state: state)
            case .name:
                NameView(state: state)
            case .camera:
                CameraScreen(state: state)
            }
        }
        .task { await state.load() }
    }
}
