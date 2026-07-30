import SwiftUI

// Écran "Comment vous appelez-vous ?" (phase 'name' du site).
struct NameView: View {
    @ObservedObject var state: AppState
    @State private var name = ""
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button("‹ retour") { state.phase = .cover }
                .font(.system(size: 11, weight: .semibold)).tracking(1.5)
                .foregroundStyle(.secondary).textCase(.uppercase)
                .padding(.bottom, 30)

            Text("Étape 1 / 1")
                .font(.system(size: 12, weight: .bold)).tracking(1.5)
                .foregroundStyle(Color.declicAccent).padding(.bottom, 12)

            Text("Comment vous\nappelez-vous ?")
                .font(.system(size: 26, weight: .bold)).padding(.bottom, 10)

            Text("Pour qu'on sache qui a pris quelle photo dans la galerie finale.")
                .font(.system(size: 15)).foregroundStyle(.secondary)
                .padding(.bottom, 26)

            TextField("Votre prénom", text: $name)
                .focused($focused)
                .font(.system(size: 17))
                .padding(14)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.black.opacity(0.1)))

            if !state.errorText.isEmpty {
                Text(state.errorText).font(.footnote).foregroundStyle(.red).padding(.top, 12)
            }

            Button {
                let trimmed = name.trimmingCharacters(in: .whitespaces)
                if !trimmed.isEmpty { Task { await state.join(name: trimmed) } }
            } label: {
                Text(state.busy ? "Un instant…" : "Ouvrir l'appareil →")
                    .font(.system(size: 17, weight: .semibold))
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(Color.declicDark).foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(.top, 16)
            .disabled(state.busy || name.trimmingCharacters(in: .whitespaces).isEmpty)

            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.declicCream)
        .onAppear { focused = true }
    }
}
