import Combine
import AVFoundation
import UIKit

// Caméra 100 % native (AVFoundation) — remplace getUserMedia du web.
// Toute la configuration se fait sur sa propre file (queue) ; les infos
// affichées (isReady, permissionDenied) sont publiées sur le fil principal.

nonisolated final class CameraModel: NSObject, ObservableObject {
    let session = AVCaptureSession()
    private let output = AVCapturePhotoOutput()
    private var position: AVCaptureDevice.Position = .back
    private let queue = DispatchQueue(label: "declic.camera")
    private var captureContinuation: CheckedContinuation<Data, Error>?

    @Published var isReady = false
    @Published var permissionDenied = false

    func start() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            configureAndRun()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                if granted { self?.configureAndRun() }
                else { self?.publish { $0.permissionDenied = true } }
            }
        default:
            publish { $0.permissionDenied = true }
        }
    }

    func stop() {
        queue.async { [weak self] in
            guard let self else { return }
            if self.session.isRunning { self.session.stopRunning() }
        }
    }

    func flip() {
        queue.async { [weak self] in
            guard let self else { return }
            self.position = (self.position == .back) ? .front : .back
            self.reconfigureInput()
        }
    }

    private func configureAndRun() {
        queue.async { [weak self] in
            guard let self else { return }
            self.session.beginConfiguration()
            self.session.sessionPreset = .photo
            self.reconfigureInput()
            if self.session.canAddOutput(self.output) { self.session.addOutput(self.output) }
            self.session.commitConfiguration()
            if !self.session.isRunning { self.session.startRunning() }
            self.publish { $0.isReady = true }
        }
    }

    private func reconfigureInput() {
        for input in session.inputs { session.removeInput(input) }
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else { return }
        session.addInput(input)
    }

    // Prend une photo (avec flash optionnel) et renvoie un JPEG compressé.
    func capture(flashOn: Bool) async throws -> Data {
        try await withCheckedThrowingContinuation { cont in
            self.captureContinuation = cont
            self.queue.async { [weak self] in
                guard let self else { return }
                let settings = AVCapturePhotoSettings()
                let wanted: AVCaptureDevice.FlashMode = flashOn ? .on : .off
                if self.output.supportedFlashModes.contains(wanted) {
                    settings.flashMode = wanted
                }
                self.output.capturePhoto(with: settings, delegate: self)
            }
        }
    }

    // Publie une modification sur le fil principal (pour SwiftUI).
    private func publish(_ change: @escaping (CameraModel) -> Void) {
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            change(self)
        }
    }
}

extension CameraModel: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput,
                     didFinishProcessingPhoto photo: AVCapturePhoto,
                     error: Error?) {
        let cont = captureContinuation
        captureContinuation = nil
        if let error { cont?.resume(throwing: error); return }
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else {
            cont?.resume(throwing: API.APIError(message: "Capture échouée.", status: 0))
            return
        }
        // Redimensionne (~1920 de large) + compresse, comme le site.
        let jpeg = CameraModel.compress(image, maxWidth: 1920, quality: 0.8)
        cont?.resume(returning: jpeg)
    }

    static func compress(_ image: UIImage, maxWidth: CGFloat, quality: CGFloat) -> Data {
        let scale = min(1, maxWidth / max(image.size.width, 1))
        let target = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let renderer = UIGraphicsImageRenderer(size: target)
        let resized = renderer.image { _ in image.draw(in: CGRect(origin: .zero, size: target)) }
        return resized.jpegData(compressionQuality: quality) ?? (image.jpegData(compressionQuality: quality) ?? Data())
    }
}
