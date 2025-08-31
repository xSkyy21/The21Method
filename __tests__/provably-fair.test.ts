import { describe, it, expect } from "vitest"
import { createProvablyFairShoe } from "@/lib/deck"
import { sha256 } from "@/lib/crypto"
import type { Rules } from "@/lib/types"

describe("Provably Fair System", () => {
  const mockRules: Rules = {
    decks: 1,
    seats: 3,
    penetrationPct: 75,
    blackjackPayout: "3:2",
    dealerStandsOnSoft17: true,
    holeCardUSPeek: false,
    doubleRule: "9-11",
    allowDAS: false,
    allowResplit: true,
    maxHandsAfterSplit: 4,
    splitAcesOneCardOnly: true,
    insuranceAllowed: true,
    surrender: "none",
  }

  it("should create verifiable commitment hash", async () => {
    const seedClient = "client-seed-123"
    const seedSystem = "system-seed-456"
    const nonce = 0

    const shoe = createProvablyFairShoe(1, seedClient, seedSystem, nonce)

    const commitmentData = {
      shoeOrder: shoe,
      nonce,
      rulesSnapshot: mockRules,
    }

    const hash1 = await sha256(JSON.stringify(commitmentData))
    const hash2 = await sha256(JSON.stringify(commitmentData))

    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
  })

  it("should produce different hashes for different data", async () => {
    const shoe1 = createProvablyFairShoe(1, "seed1", "system1", 0)
    const shoe2 = createProvablyFairShoe(1, "seed2", "system2", 0)

    const data1 = { shoeOrder: shoe1, nonce: 0, rulesSnapshot: mockRules }
    const data2 = { shoeOrder: shoe2, nonce: 0, rulesSnapshot: mockRules }

    const hash1 = await sha256(JSON.stringify(data1))
    const hash2 = await sha256(JSON.stringify(data2))

    expect(hash1).not.toBe(hash2)
  })

  it("should be reproducible with same inputs", async () => {
    const seedClient = "reproducible-client"
    const seedSystem = "reproducible-system"
    const nonce = 42

    const shoe1 = createProvablyFairShoe(2, seedClient, seedSystem, nonce)
    const shoe2 = createProvablyFairShoe(2, seedClient, seedSystem, nonce)

    expect(shoe1).toEqual(shoe2)
    expect(shoe1).toHaveLength(104) // 2 decks = 104 cards
  })

  it("should handle different nonces correctly", () => {
    const seedClient = "test-client"
    const seedSystem = "test-system"

    const shoes = Array.from({ length: 5 }, (_, i) => createProvablyFairShoe(1, seedClient, seedSystem, i))

    // All shoes should be different
    for (let i = 0; i < shoes.length; i++) {
      for (let j = i + 1; j < shoes.length; j++) {
        expect(shoes[i]).not.toEqual(shoes[j])
      }
    }
  })

  it("should maintain card integrity", () => {
    const shoe = createProvablyFairShoe(1, "integrity-test", "system", 0)

    // Should have exactly 52 cards
    expect(shoe).toHaveLength(52)

    // Should have 4 of each rank
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
    ranks.forEach((rank) => {
      const count = shoe.filter((card) => card.rank === rank).length
      expect(count).toBe(4)
    })

    // Should have 13 of each suit
    const suits = ["S", "H", "D", "C"]
    suits.forEach((suit) => {
      const count = shoe.filter((card) => card.suit === suit).length
      expect(count).toBe(13)
    })
  })
})
