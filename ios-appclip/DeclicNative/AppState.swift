import Combine
import SwiftUI
import UIKit

// Reproduit la logique de src/app/j/[id]/page.js (les "phases").
enum Phase { case loading, cover, name, camera, error }

@MainActor
final class AppState: ObservableObject {
    let eventId: String

    @Published var phase: Phase = .loading
    @Published var meta: API.EventMeta?
    @Published var errorText = ""

    // Invité courant
    @Published var guestId: String?
    @Published var shotsTaken = 0
    @Published var shotsPerGuest = 0

    // Pellicule
    @Published var myPhotos: [API.Photo] = []
    @Published var pending: [PendingShot] = []   // photos en cours d'envoi
    @Published var busy = false

    struct PendingShot: Identifiable { let id = UUID(); let image: UIImage }

    init(eventId: String) { self.eventId = eventId }

    var remaining: Int { max(0, shotsPerGuest - shotsTaken) }
    var full: Bool { remaining <= 0 }
    var coupleLabel: String { meta?.hostNames ?? meta?.name ?? "" }

    // Chargement initial de l'événement.
    func load() async {
        do {
            let m = try await API.event(id: eventId)
            meta = m
            if let saved = Device.guestName(eventId: eventId), !saved.isEmpty {
                await join(name: saved)
            } else {
                phase = .cover
            }
        } catch let e as API.APIError {
            errorText = e.message; phase = .error
        } catch {
            errorText = "Connexion impossible."; phase = .error
        }
    }

    // Rejoindre l'événement (créer / retrouver l'invité).
    func join(name: String) async {
        busy = true; errorText = ""
        do {
            let r = try await API.join(eventId: eventId, displayName: name)
            Device.saveGuestName(eventId: eventId, name: r.displayName ?? name)
            guestId = r.guestId
            shotsTaken = r.shotsTaken
            shotsPerGuest = r.shotsPerGuest
            await loadMyPhotos()
            phase = .camera
        } catch let e as API.APIError {
            errorText = e.message; phase = .name
        } catch {
            errorText = "Erreur."; phase = .name
        }
        busy = false
    }

    // Recharge mes photos + synchronise le compteur depuis le serveur.
    func loadMyPhotos() async {
        do {
            let r = try await API.myPhotos(eventId: eventId)
            myPhotos = r.photos
            shotsTaken = r.shotsTaken
        } catch { /* silencieux, comme le site */ }
    }

    // Capture optimiste : on affiche tout de suite, on envoie en arrière-plan.
    func capture(image: UIImage, jpeg: Data) async {
        guard let guestId else { return }
        let shot = PendingShot(image: image)
        pending.insert(shot, at: 0)
        shotsTaken = min(shotsPerGuest, shotsTaken + 1)
        do {
            let r = try await API.uploadPhoto(eventId: eventId, guestId: guestId, jpeg: jpeg)
            if r.full == true {
                errorText = "Pellicule pleine — supprime une photo pour en reprendre une."
            }
        } catch {
            errorText = "Échec de l'envoi."
        }
        pending.removeAll { $0.id == shot.id }
        await loadMyPhotos()
    }

    func deletePhoto(id: String) async {
        do {
            try await API.deletePhoto(photoId: id)
            await loadMyPhotos()
        } catch let e as API.APIError {
            errorText = e.message
        } catch {
            errorText = "Suppression impossible."
        }
    }
}
