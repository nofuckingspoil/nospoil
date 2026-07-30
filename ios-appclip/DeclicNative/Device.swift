import Foundation

// Équivalent natif de src/lib/device.js
// Un jeton unique par appareil, mémorisé durablement (UserDefaults).
enum Device {
    private static let tokenKey = "pellicule_device"

    static var token: String {
        let d = UserDefaults.standard
        if let t = d.string(forKey: tokenKey) { return t }
        let t = UUID().uuidString
        d.set(t, forKey: tokenKey)
        return t
    }

    // Mémorise l'identité d'invité (prénom) par événement.
    static func saveGuestName(eventId: String, name: String) {
        UserDefaults.standard.set(name, forKey: "pellicule_guest_\(eventId)")
    }
    static func guestName(eventId: String) -> String? {
        UserDefaults.standard.string(forKey: "pellicule_guest_\(eventId)")
    }
}
