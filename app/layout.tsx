import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { AudioUnlock } from "@/components/audio-unlock"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Blackjack Trainer Pro — Stratégie de base & comptage Hi-Lo",
  description:
    "Apprends la stratégie de base et le comptage Hi-Lo. Entraîne-toi sur un sabot prouvé équitable, croupier auto, aide visuelle, jusqu'à 4 sièges.",
  keywords: ["blackjack", "comptage", "hi-lo", "casino", "entraînement", "cartes", "stratégie"],
  authors: [{ name: "Blackjack Trainer Pro" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#d4af37",
  openGraph: {
    title: "Blackjack Trainer Pro",
    description: "Apprends la stratégie de base et le comptage Hi-Lo avec notre trainer professionnel",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blackjack Trainer Pro",
    description: "Entraînement professionnel au Blackjack avec comptage Hi-Lo",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AudioUnlock />
          <Sidebar />
          <Header />
          <main className="md:ml-64 pt-16 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {children}
          </main>
          <Toaster />

          {/* Footer */}
          <footer className="md:ml-64 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-8 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} — Édité et développé par{" "}
                <span className="text-casino-gold font-medium">WebaZio</span> mon agence web
              </p>
            </div>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  )
}
