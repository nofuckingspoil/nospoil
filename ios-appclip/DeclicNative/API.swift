import Foundation

// Reproduit fidèlement les appels de votre site vers votre serveur.
// Base : https://no-spoil.fr — on ne change RIEN côté serveur.

enum API {
    static let base = URL(string: "https://no-spoil.fr")!

    // ---- Modèles de données (mêmes champs que vos réponses JSON) ----
    struct EventMeta: Codable {
        let id: String
        let name: String?
        let hostNames: String?
        let shotsPerGuest: Int
        let revealAt: String
        let status: String?
        let revealed: Bool?
        let isOwner: Bool?
    }
    struct JoinResponse: Codable {
        let guestId: String
        let displayName: String?
        let shotsTaken: Int
        let shotsPerGuest: Int
        let eventName: String?
        let hostNames: String?
        let revealAt: String?
    }
    struct Photo: Codable, Identifiable, Equatable {
        let id: String
        let url: String
    }
    struct MyPhotosResponse: Codable {
        let photos: [Photo]
        let shotsTaken: Int
    }
    struct TakePhotoResponse: Codable {
        let shotsTaken: Int?
        let shotsPerGuest: Int?
        let full: Bool?
        let error: String?
    }
    struct ErrorBody: Codable { let error: String? }

    struct APIError: Error { let message: String; let status: Int }

    // ---- GET /api/events/{id} ----
    static func event(id: String) async throws -> EventMeta {
        let url = base.appendingPathComponent("api/events/\(id)")
        let (data, resp) = try await URLSession.shared.data(from: url)
        guard let http = resp as? HTTPURLResponse else { throw APIError(message: "Connexion impossible.", status: 0) }
        if http.statusCode != 200 {
            let e = try? JSONDecoder().decode(ErrorBody.self, from: data)
            throw APIError(message: e?.error ?? "Événement introuvable.", status: http.statusCode)
        }
        return try JSONDecoder().decode(EventMeta.self, from: data)
    }

    // ---- POST /api/join ----
    static func join(eventId: String, displayName: String) async throws -> JoinResponse {
        let body: [String: Any] = [
            "eventId": eventId,
            "deviceToken": Device.token,
            "displayName": displayName,
        ]
        let (data, http) = try await postJSON(path: "api/join", body: body)
        if http.statusCode != 200 {
            let e = try? JSONDecoder().decode(ErrorBody.self, from: data)
            throw APIError(message: e?.error ?? "Erreur.", status: http.statusCode)
        }
        return try JSONDecoder().decode(JoinResponse.self, from: data)
    }

    // ---- POST /api/my-photos ----
    static func myPhotos(eventId: String) async throws -> MyPhotosResponse {
        let body: [String: Any] = ["eventId": eventId, "deviceToken": Device.token]
        let (data, _) = try await postJSON(path: "api/my-photos", body: body)
        return try JSONDecoder().decode(MyPhotosResponse.self, from: data)
    }

    // ---- POST /api/photo (envoi multipart d'une image JPEG) ----
    // Renvoie (full, response). full == true → pellicule pleine (409).
    static func uploadPhoto(eventId: String, guestId: String, jpeg: Data) async throws -> TakePhotoResponse {
        let boundary = "Boundary-\(UUID().uuidString)"
        var req = URLRequest(url: base.appendingPathComponent("api/photo"))
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        func field(_ name: String, _ value: String) {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(value)\r\n".data(using: .utf8)!)
        }
        // Le fichier
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(jpeg)
        body.append("\r\n".data(using: .utf8)!)
        // Les champs texte
        field("eventId", eventId)
        field("guestId", guestId)
        field("deviceToken", Device.token)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        let (data, resp) = try await URLSession.shared.upload(for: req, from: body)
        let decoded = (try? JSONDecoder().decode(TakePhotoResponse.self, from: data)) ?? TakePhotoResponse(shotsTaken: nil, shotsPerGuest: nil, full: nil, error: nil)
        if let http = resp as? HTTPURLResponse, http.statusCode == 409 {
            return TakePhotoResponse(shotsTaken: decoded.shotsTaken, shotsPerGuest: decoded.shotsPerGuest, full: true, error: decoded.error)
        }
        return decoded
    }

    // ---- POST /api/photo/delete ----
    static func deletePhoto(photoId: String) async throws {
        let body: [String: Any] = ["photoId": photoId, "deviceToken": Device.token]
        let (data, http) = try await postJSON(path: "api/photo/delete", body: body)
        if http.statusCode != 200 {
            let e = try? JSONDecoder().decode(ErrorBody.self, from: data)
            throw APIError(message: e?.error ?? "Suppression impossible.", status: http.statusCode)
        }
    }

    // ---- Utilitaire commun POST JSON ----
    private static func postJSON(path: String, body: [String: Any]) async throws -> (Data, HTTPURLResponse) {
        var req = URLRequest(url: base.appendingPathComponent(path))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw APIError(message: "Connexion impossible.", status: 0) }
        return (data, http)
    }
}
