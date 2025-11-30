import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "S'entraîner — Blackjack Trainer Pro",
  description:
    "Entraîne-toi au Blackjack avec comptage Hi-Lo, stratégie de base et sabot prouvé équitable. Jusqu'à 4 sièges, croupier automatique, aide visuelle.",
  openGraph: {
    title: "S'entraîner — Blackjack Trainer Pro",
    description: "Entraîne-toi au Blackjack avec comptage Hi-Lo et stratégie de base",
  },
}

export default function EntrainementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
