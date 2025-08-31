import type { Card, Rank, Suit } from "./types"
import { mulberry32, hash32 } from "./crypto"

const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
const SUITS: Suit[] = ["S", "H", "D", "C"]

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  return deck
}

export function createShoe(decks: number): Card[] {
  const shoe: Card[] = []
  for (let i = 0; i < decks; i++) {
    shoe.push(...createDeck())
  }
  return shuffleDeck(shoe)
}

export function createProvablyFairShoe(decks: number, seedClient: string, seedSystem: string, nonce: number): Card[] {
  const shoe: Card[] = []
  for (let i = 0; i < decks; i++) {
    shoe.push(...createDeck())
  }

  const combinedSeed = `${seedClient}:${seedSystem}:${nonce}`
  const seedHash = hash32(combinedSeed)
  const rng = mulberry32(seedHash)

  return shuffleDeckDeterministic(shoe, rng)
}

export function shuffleDeckDeterministic(deck: Card[], rng: () => number): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getCardDisplay(card: Card): string {
  const suitSymbols = {
    S: "♠",
    H: "♥",
    D: "♦",
    C: "♣",
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function getCardColor(suit: Suit): "red" | "black" {
  return suit === "H" || suit === "D" ? "red" : "black"
}
