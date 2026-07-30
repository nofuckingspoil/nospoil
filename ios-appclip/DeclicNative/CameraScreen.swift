import SwiftUI
import PhotosUI

// Écran caméra natif (phase 'camera' du site) : viseur en direct,
// compteur de poses, flash, pellicule, déclencheur, import galerie,
// visionneuse + suppression.
struct CameraScreen: View {
    @ObservedObject var state: AppState
    @StateObject private var cam = CameraModel()
    @State private var viewer: API.Photo?
    @State private var deleting = false
    @State private var flashFx = false
    @State private var flashOn = false
    @State private var pickerItem: PhotosPickerItem?

    private var roll: [RollItem] {
        state.pending.map { RollItem(pending: $0) } + state.myPhotos.map { RollItem(photo: $0) }
    }
    private var frameNo: String {
        let n = min((state.shotsTaken) + (state.full ? 0 : 1), state.shotsPerGuest)
        return String(format: "%02d", max(0, n))
    }

    var body: some View {
        ZStack {
            Color.declicDark.ignoresSafeArea()
            VStack(spacing: 12) {
                // Bandeau haut
                HStack {
                    Label(state.coupleLabel, systemImage: "dot.radiowaves.left.and.right")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white)
                    Spacer()
                    // Flash
                    Button { flashOn.toggle() } label: {
                        Image(systemName: flashOn ? "bolt.fill" : "bolt.slash.fill")
                            .foregroundStyle(flashOn ? .yellow : .white).padding(8)
                            .background(.white.opacity(0.12)).clipShape(Circle())
                    }
                    // Retourner la caméra
                    Button { cam.flip() } label: {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .foregroundStyle(.white).padding(8)
                            .background(.white.opacity(0.12)).clipShape(Circle())
                    }
                }
                .padding(.horizontal, 16).padding(.top, 8)

                // Viseur
                ZStack {
                    if cam.permissionDenied {
                        VStack(spacing: 10) {
                            Image(systemName: "camera.fill").font(.largeTitle).foregroundStyle(.white.opacity(0.5))
                            Text("Autorisez la caméra dans Réglages.").foregroundStyle(.white.opacity(0.7))
                        }
                    } else {
                        CameraPreview(session: cam.session)
                    }
                    // Repères de viseur
                    Text("DÉCLIC 400")
                        .font(.system(size: 10, weight: .bold)).tracking(1)
                        .foregroundStyle(.white.opacity(0.7))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).padding(14)
                    Text("№ \(frameNo)")
                        .font(.system(size: 12, weight: .bold)).foregroundStyle(.white.opacity(0.8))
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing).padding(14)
                    HStack(spacing: 4) {
                        Text(String(format: "%02d", state.remaining)).font(.system(size: 22, weight: .heavy)).foregroundStyle(.white)
                        Text("/ \(state.shotsPerGuest) restants").font(.system(size: 11)).foregroundStyle(.white.opacity(0.7))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading).padding(14)

                    if flashFx { Color.white.opacity(0.85).ignoresSafeArea() }
                }
                .clipShape(RoundedRectangle(cornerRadius: 18))
                .padding(.horizontal, 12)

                if !state.errorText.isEmpty {
                    Text(state.errorText).font(.footnote).foregroundStyle(.orange).padding(.horizontal, 16)
                }

                // Bas : pellicule + déclencheur
                HStack {
                    // Pellicule (miniatures)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            if roll.isEmpty {
                                Text("pellicule vide…").font(.caption).foregroundStyle(.white.opacity(0.4))
                            }
                            ForEach(roll) { item in
                                Button {
                                    if let p = item.photo { viewer = p }
                                } label: {
                                    rollThumb(item)
                                }
                                .disabled(item.photo == nil)
                            }
                        }
                    }
                    .frame(width: 110)

                    Spacer()

                    // Déclencheur
                    Button { snap() } label: {
                        ZStack {
                            Circle().stroke(.white, lineWidth: 4).frame(width: 74, height: 74)
                            Circle().fill(.white).frame(width: 60, height: 60)
                        }
                    }
                    .disabled(state.busy || state.full || !cam.isReady)
                    .opacity((state.full || !cam.isReady) ? 0.4 : 1)

                    Spacer()

                    VStack(spacing: 2) {
                        Text("\(state.shotsTaken)").font(.system(size: 13, weight: .bold)).foregroundStyle(.white)
                        Text("prises").font(.system(size: 10)).foregroundStyle(.white.opacity(0.5))
                    }
                    .frame(width: 54)
                }
                .padding(.horizontal, 16)

                // Import depuis la galerie (compte dans le solde, comme le site)
                PhotosPicker(selection: $pickerItem, matching: .images) {
                    Label("Importer une photo de ma galerie", systemImage: "photo.on.rectangle")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(.white.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(state.busy || state.full)
                .opacity((state.busy || state.full) ? 0.4 : 1)
                .padding(.horizontal, 16).padding(.bottom, 8)

                if state.full {
                    Text("Pellicule pleine — touche une photo pour la supprimer et en reprendre une.")
                        .font(.caption).foregroundStyle(.white.opacity(0.6))
                        .multilineTextAlignment(.center).padding(.horizontal, 24)
                }
            }
        }
        .onAppear { cam.start() }
        .onDisappear { cam.stop() }
        .onChange(of: pickerItem) { _, newItem in
            if let newItem { importFromGallery(newItem) }
        }
        // Visionneuse plein écran
        .fullScreenCover(item: $viewer) { photo in
            PhotoViewer(photo: photo, deleting: deleting) {
                viewer = nil
            } onDelete: {
                deleting = true
                Task {
                    await state.deletePhoto(id: photo.id)
                    deleting = false
                    viewer = nil
                }
            }
        }
    }

    private func snap() {
        guard !state.busy, !state.full else { return }
        state.busy = true; state.errorText = ""
        // Éclat blanc à l'écran si le flash est activé (effet visuel, comme le site).
        if flashOn {
            flashFx = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) { flashFx = false }
        }
        Task {
            do {
                let jpeg = try await cam.capture()
                let image = UIImage(data: jpeg) ?? UIImage()
                await state.capture(image: image, jpeg: jpeg)
            } catch {
                state.errorText = "Photo non enregistrée — \(error.localizedDescription)"
            }
            state.busy = false
        }
    }

    // Importe une photo de la galerie et l'envoie (compte dans le solde).
    private func importFromGallery(_ item: PhotosPickerItem) {
        Task {
            if state.full {
                state.errorText = "Pellicule pleine — supprime une photo pour en importer une."
                pickerItem = nil
                return
            }
            state.busy = true; state.errorText = ""
            do {
                if let data = try await item.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    let jpeg = CameraModel.compress(image, maxWidth: 1920, quality: 0.8)
                    let finalImage = UIImage(data: jpeg) ?? image
                    await state.capture(image: finalImage, jpeg: jpeg)
                } else {
                    state.errorText = "Import impossible."
                }
            } catch {
                state.errorText = "Import impossible."
            }
            state.busy = false
            pickerItem = nil
        }
    }

    @ViewBuilder
    private func rollThumb(_ item: RollItem) -> some View {
        Group {
            if let img = item.pending?.image {
                Image(uiImage: img).resizable().scaledToFill().opacity(0.5)
            } else if let url = item.photo?.url, let u = URL(string: url) {
                AsyncImage(url: u) { img in img.resizable().scaledToFill() } placeholder: { Color.white.opacity(0.1) }
            }
        }
        .frame(width: 48, height: 48)
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
}

// Élément de pellicule : soit une photo confirmée, soit une en cours d'envoi.
struct RollItem: Identifiable {
    let id = UUID()
    var photo: API.Photo?
    var pending: AppState.PendingShot?
    init(photo: API.Photo) { self.photo = photo }
    init(pending: AppState.PendingShot) { self.pending = pending }
}

// Visionneuse d'une photo + bouton supprimer.
struct PhotoViewer: View {
    let photo: API.Photo
    let deleting: Bool
    let onClose: () -> Void
    let onDelete: () -> Void

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack {
                HStack {
                    Spacer()
                    Button { onClose() } label: {
                        Image(systemName: "xmark").font(.title2).foregroundStyle(.white).padding()
                    }
                }
                Spacer()
                if let u = URL(string: photo.url) {
                    AsyncImage(url: u) { img in img.resizable().scaledToFit() } placeholder: { ProgressView().tint(.white) }
                }
                Spacer()
                HStack(spacing: 12) {
                    Button("Garder") { onClose() }
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(.white.opacity(0.3)))
                        .foregroundStyle(.white)
                    Button(deleting ? "Suppression…" : "Supprimer") { onDelete() }
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .background(Color.red).foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .disabled(deleting)
                }
                .padding()
            }
        }
    }
}
