import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Histoire du Blackjack — Blackjack Trainer Pro",
  description:
    "Découvre l'histoire fascinante du Blackjack, des origines aux stratégies modernes. Règles, comptage de cartes et techniques avancées.",
  openGraph: {
    title: "Histoire du Blackjack — Blackjack Trainer Pro",
    description: "L'histoire complète du Blackjack et ses stratégies",
  },
}

export default function HistoireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
