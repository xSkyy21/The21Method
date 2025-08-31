import { describe, it, expect } from "vitest"
import { calculateHandValue, isBlackjack, isBust, isSoft, canSplit } from "@/lib/hand"
import type { Card, Hand } from "@/lib/types"

describe("Hand Calculations", () => {
  const createCard = (rank: string, suit = "♠"): Card => ({ rank, suit })

  describe("calculateHandValue", () => {
    it("should calculate simple hand values", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("5"), createCard("7")],
        bet: 10,
        status: "playing",
      }
      expect(calculateHandValue(hand)).toBe(12)
    })

    it("should handle Ace as 11 when possible", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("9")],
        bet: 10,
        status: "playing",
      }
      expect(calculateHandValue(hand)).toBe(20)
    })

    it("should handle Ace as 1 when necessary", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("K"), createCard("5")],
        bet: 10,
        status: "playing",
      }
      expect(calculateHandValue(hand)).toBe(16)
    })

    it("should handle multiple Aces", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("A"), createCard("9")],
        bet: 10,
        status: "playing",
      }
      expect(calculateHandValue(hand)).toBe(21)
    })

    it("should handle face cards as 10", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("Q")],
        bet: 10,
        status: "playing",
      }
      expect(calculateHandValue(hand)).toBe(20)
    })
  })

  describe("isBlackjack", () => {
    it("should identify blackjack with Ace and 10", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("10")],
        bet: 10,
        status: "playing",
      }
      expect(isBlackjack(hand)).toBe(true)
    })

    it("should identify blackjack with Ace and face card", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("K")],
        bet: 10,
        status: "playing",
      }
      expect(isBlackjack(hand)).toBe(true)
    })

    it("should not identify 21 with more than 2 cards as blackjack", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("7"), createCard("7"), createCard("7")],
        bet: 10,
        status: "playing",
      }
      expect(isBlackjack(hand)).toBe(false)
    })
  })

  describe("isBust", () => {
    it("should identify bust hands", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("Q"), createCard("5")],
        bet: 10,
        status: "playing",
      }
      expect(isBust(hand)).toBe(true)
    })

    it("should not identify non-bust hands", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("A")],
        bet: 10,
        status: "playing",
      }
      expect(isBust(hand)).toBe(false)
    })
  })

  describe("isSoft", () => {
    it("should identify soft hands", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("A"), createCard("6")],
        bet: 10,
        status: "playing",
      }
      expect(isSoft(hand)).toBe(true)
    })

    it("should not identify hard hands as soft", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("6")],
        bet: 10,
        status: "playing",
      }
      expect(isSoft(hand)).toBe(false)
    })
  })

  describe("canSplit", () => {
    it("should allow splitting pairs", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("8"), createCard("8")],
        bet: 10,
        status: "playing",
      }
      expect(canSplit(hand)).toBe(true)
    })

    it("should allow splitting 10-value cards", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("Q")],
        bet: 10,
        status: "playing",
      }
      expect(canSplit(hand)).toBe(true)
    })

    it("should not allow splitting non-pairs", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("K"), createCard("9")],
        bet: 10,
        status: "playing",
      }
      expect(canSplit(hand)).toBe(false)
    })

    it("should not allow splitting with more than 2 cards", () => {
      const hand: Hand = {
        id: "1",
        cards: [createCard("8"), createCard("8"), createCard("3")],
        bet: 10,
        status: "playing",
      }
      expect(canSplit(hand)).toBe(false)
    })
  })
})
