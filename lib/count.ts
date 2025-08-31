import type { Card, Rank } from "./types"

export function getHiLoValue(rank: Rank): number {
  switch (rank) {
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return 1
    case "7":
    case "8":
    case "9":
      return 0
    case "T":
    case "J":
    case "Q":
    case "K":
    case "A":
      return -1
    default:
      return 0
  }
}

export const hiLoValue = getHiLoValue

export function updateRunningCount(currentCount: number, card: Card): number {
  return currentCount + getHiLoValue(card.rank)
}

export function calculateRunningCount(cards: Card[]): number {
  return cards.reduce((count, card) => count + getHiLoValue(card.rank), 0)
}

export function calculateTrueCount(runningCount: number, remainingDecks: number): number {
  if (remainingDecks <= 0) return 0
  return Math.round((runningCount / remainingDecks) * 10) / 10
}

export function estimateRemainingDecks(remainingCards: number): number {
  return Math.max(0.1, Math.round((remainingCards / 52) * 10) / 10)
}
