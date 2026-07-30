import SwiftUI

// Écran d'accueil = la "pochette" (équivalent de la phase 'cover' du site).
struct CoverView: View {
    @ObservedObject var state: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Label("\(BRAND_NAME) · jetable", systemImage: "circle.fill")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(state.meta?.shotsPerGuest ?? 0) poses")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
            .padding(.bottom, 18)

            // La pochette colorée
            ZStack(alignment: .bottomLeading) {
                RoundedRectangle(cornerRadius: 20).fill(coverGradient)
                VStack(alignment: .leading, spacing: 6) {
                    Text("ÉVÉNEMENT PRIVÉ")
                        .font(.system(size: 11, weight: .bold)).tracking(2)
                        .foregroundStyle(.white.opacity(0.85))
                    Text(state.coupleLabel)
                        .font(.system(size: 30, weight: .heavy))
                        .foregroundStyle(.white)
                }
                .padding(22)
            }
            .frame(height: 260)

            Text("\(state.coupleLabel) vous invite\(state.coupleLabel.contains("&") ? "nt" : "") dans l'objectif.")
                .font(.system(size: 22, weight: .bold))
                .padding(.top, 22).padding(.bottom, 8)

            if let m = state.meta {
                Text("Prenez \(m.shotsPerGuest) photos pendant la soirée. Elles resteront cachées jusqu'à la révélation, le \(formatReveal(m.revealAt)).")
                    .font(.system(size: 15))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                state.phase = .name
            } label: {
                Text("Rejoindre l'appareil →")
                    .font(.system(size: 17, weight: .semibold))
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(Color.declicAccent).foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }

            Text("AUCUNE APPLI · DEPUIS VOTRE TÉLÉPHONE")
                .font(.system(size: 10, weight: .semibold)).tracking(1.5)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity).padding(.top, 14)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.declicCream)
    }
}
