import SwiftUI

// Couleurs de la marque Déclic (reprises de votre brand.js / CSS).
extension Color {
    static let declicAccent = Color(hex: 0xEE7A45)
    static let declicCream  = Color(hex: 0xF4EBDA)
    static let declicDark   = Color(hex: 0x14161F)

    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue: Double(hex & 0xff) / 255,
            opacity: alpha
        )
    }
}

// Dégradé de la pochette (cover) : F7C26B → EE7A45 → A23D5C
let coverGradient = LinearGradient(
    colors: [Color(hex: 0xF7C26B), Color(hex: 0xEE7A45), Color(hex: 0xA23D5C)],
    startPoint: .topLeading, endPoint: .bottomTrailing
)

let BRAND_NAME = "Déclic"

// Formate la date de révélation en français.
func formatReveal(_ iso: String) -> String {
    let parser = ISO8601DateFormatter()
    parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let date = parser.date(from: iso) ?? ISO8601DateFormatter().date(from: iso)
    guard let date else { return iso }
    let f = DateFormatter()
    f.locale = Locale(identifier: "fr_FR")
    f.dateFormat = "EEEE d MMMM 'à' HH'h'mm"
    return f.string(from: date)
}
