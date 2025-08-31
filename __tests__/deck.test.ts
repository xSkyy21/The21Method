import { describe, it, expect, beforeEach } from "vitest"
import { createDeck, createShoe, shuffleDeck, createProvablyFairShoe, shuffleDeckDeterministic } from "@/lib/deck"
import { mulberry32, hash32 } from "@/lib/crypto"
import type { Card } from "@/lib/types"

describe("Deck Functions", () => {
  let deck: Card[]

  beforeEach(() => {
    deck = createDeck()
  })

  it("should create a standard 52-card deck", () => {
    expect(deck).toHaveLength(52)
  })

  it("should have 13 cards of each suit", () => {
    const suits = ["S", "H", "D", "C"]
    suits.forEach((suit) => {
      const suitCards = deck.filter((card) => card.suit === suit)
      expect(suitCards).toHaveLength(13)
    })
  })

  it("should have 4 cards of each rank", () => {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
    ranks.forEach((rank) => {
      const rankCards = deck.filter((card) => card.rank === rank)
      expect(rankCards).toHaveLength(4)
    })
  })

  it("should create multiple decks when specified", () => {
    const sixDeckShoe = createShoe(6)
    expect(sixDeckShoe).toHaveLength(312) // 52 * 6
  })

  it("should shuffle deck differently each time", () => {
    const originalOrder = [...deck]
    const shuffled1 = shuffleDeck([...deck])
    const shuffled2 = shuffleDeck([...deck])

    expect(shuffled1).not.toEqual(originalOrder)
    expect(shuffled2).not.toEqual(originalOrder)
    expect(shuffled1).not.toEqual(shuffled2)
  })

  describe("Provably Fair System", () => {
    it("should create identical shoes with same seeds", () => {
      const seedClient = "test-client-seed"
      const seedSystem = "test-system-seed"
      const nonce = 0

      const shoe1 = createProvablyFairShoe(1, seedClient, seedSystem, nonce)
      const shoe2 = createProvablyFairShoe(1, seedClient, seedSystem, nonce)

      expect(shoe1).toEqual(shoe2)
      expect(shoe1).toHaveLength(52)
    })

    it("should create different shoes with different seeds", () => {
      const shoe1 = createProvablyFairShoe(1, "seed1", "system1", 0)
      const shoe2 = createProvablyFairShoe(1, "seed2", "system2", 0)

      expect(shoe1).not.toEqual(shoe2)
      expect(shoe1).toHaveLength(52)
      expect(shoe2).toHaveLength(52)
    })

    it("should create different shoes with different nonces", () => {
      const seedClient = "test-client"
      const seedSystem = "test-system"

      const shoe1 = createProvablyFairShoe(1, seedClient, seedSystem, 0)
      const shoe2 = createProvablyFairShoe(1, seedClient, seedSystem, 1)

      expect(shoe1).not.toEqual(shoe2)
    })

    it("should use deterministic PRNG correctly", () => {
      const seed = hash32("test-seed")
      const rng = mulberry32(seed)

      const deck1 = createDeck()
      const deck2 = createDeck()

      const shuffled1 = shuffleDeckDeterministic([...deck1], mulberry32(seed))
      const shuffled2 = shuffleDeckDeterministic([...deck2], mulberry32(seed))

      expect(shuffled1).toEqual(shuffled2)
      expect(shuffled1).not.toEqual(deck1)
    })
  })
})
