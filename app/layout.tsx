import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { AudioUnlock } from "@/components/audio-unlock"
import { Header } from "@/components/header"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Blackjack Trainer — Stratégie de base & comptage Hi-Lo (WebaZio)",
  description:
    "Apprends la stratégie de base et le comptage Hi-Lo. Entraîne-toi sur un sabot prouvé équitable, croupier auto, aide visuelle, jusqu'à 4 sièges.",
  keywords: ["blackjack", "comptage", "hi-lo", "casino", "entraînement", "cartes", "stratégie", "webaZio"],
  authors: [{ name: "WebaZio" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#aa71f3",
  openGraph: {
    title: "WebaZio Blackjack Trainer",
    description: "Apprends la stratégie de base et le comptage Hi-Lo avec notre trainer professionnel",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebaZio Blackjack Trainer",
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
          <Header />
          {children}
          <Toaster />

          {/* Footer */}
          <footer className="border-t border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 py-8 text-center">
              <p className="text-muted-foreground">
                © {new Date().getFullYear()} — Développé par{" "}
                <span className="text-primary font-medium webazio-glow">WebaZio</span>
              </p>
            </div>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  )
}
