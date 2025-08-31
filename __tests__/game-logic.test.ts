import { describe, it, expect } from "vitest"
import { calculateHandValue, isBlackjack, isBusted, canDouble, canSplit, isSoft } from "@/lib/hand"
import { hiLoValue, calculateRunningCount, calculateTrueCount } from "@/lib/count"
import type { Card, Hand } from "@/lib/types"

describe("Game Logic", () => {
  describe("Hand Calculations", () => {
    it("should calculate hard totals correctly", () => {
      const hand: Card[] = [
        { rank: "K", suit: "S" },
        { rank: "7", suit: "H" },
      ]
      const result = calculateHandValue(hand)
      expect(result.value).toBe(17)
      expect(result.soft).toBe(false)
    })

    it("should calculate soft totals correctly", () => {
      const hand: Card[] = [
        { rank: "A", suit: "S" },
        { rank: "6", suit: "H" },
      ]
      const result = calculateHandValue(hand)
      expect(result.value).toBe(17)
      expect(result.soft).toBe(true)
    })

    it("should handle multiple aces correctly", () => {
      const hand: Card[] = [
        { rank: "A", suit: "S" },
        { rank: "A", suit: "H" },
        { rank: "9", suit: "D" },
      ]
      const result = calculateHandValue(hand)
      expect(result.value).toBe(21)
      expect(result.soft).toBe(true)
    })

    it("should detect blackjack correctly", () => {
      const blackjackHand: Card[] = [
        { rank: "A", suit: "S" },
        { rank: "K", suit: "H" },
      ]
      expect(isBlackjack(blackjackHand)).toBe(true)

      const nonBlackjackHand: Card[] = [
        { rank: "T", suit: "S" },
        { rank: "T", suit: "H" },
        { rank: "A", suit: "D" },
      ]
      expect(isBlackjack(nonBlackjackHand)).toBe(false)
    })

    it("should detect bust correctly", () => {
      const bustHand: Card[] = [
        { rank: "K", suit: "S" },
        { rank: "Q", suit: "H" },
        { rank: "5", suit: "D" },
      ]
      expect(isBusted(bustHand)).toBe(true)

      const validHand: Card[] = [
        { rank: "K", suit: "S" },
        { rank: "A", suit: "H" },
      ]
      expect(isBusted(validHand)).toBe(false)
    })

    it("should detect soft hands correctly", () => {
      const softHand: Card[] = [
        { rank: "A", suit: "S" },
        { rank: "6", suit: "H" },
      ]
      expect(isSoft(softHand)).toBe(true)

      const hardHand: Card[] = [
        { rank: "K", suit: "S" },
        { rank: "6", suit: "H" },
      ]
      expect(isSoft(hardHand)).toBe(false)
    })
  })

  describe("Game Actions", () => {
    it("should allow double on valid hands", () => {
      const validDoubleHand: Hand = {
        id: "test",
        cards: [
          { rank: "5", suit: "S" },
          { rank: "6", suit: "H" },
        ],
        bet: 10,
        finished: false,
        busted: false,
        blackjack: false,
        canDouble: true,
        canSplit: false,
      }
      expect(canDouble(validDoubleHand)).toBe(true)

      const invalidDoubleHand: Hand = {
        ...validDoubleHand,
        cards: [
          { rank: "5", suit: "S" },
          { rank: "6", suit: "H" },
          { rank: "2", suit: "D" },
        ],
      }
      expect(canDouble(invalidDoubleHand)).toBe(false)
    })

    it("should allow split on pairs", () => {
      const pairHand: Hand = {
        id: "test",
        cards: [
          { rank: "8", suit: "S" },
          { rank: "8", suit: "H" },
        ],
        bet: 10,
        finished: false,
        busted: false,
        blackjack: false,
        canDouble: false,
        canSplit: true,
      }
      expect(canSplit(pairHand)).toBe(true)

      const nonPairHand: Hand = {
        ...pairHand,
        cards: [
          { rank: "8", suit: "S" },
          { rank: "7", suit: "H" },
        ],
      }
      expect(canSplit(nonPairHand)).toBe(false)
    })
  })

  describe("Hi-Lo Counting", () => {
    it("should assign correct Hi-Lo values", () => {
      expect(hiLoValue("2")).toBe(1)
      expect(hiLoValue("3")).toBe(1)
      expect(hiLoValue("4")).toBe(1)
      expect(hiLoValue("5")).toBe(1)
      expect(hiLoValue("6")).toBe(1)
      expect(hiLoValue("7")).toBe(0)
      expect(hiLoValue("8")).toBe(0)
      expect(hiLoValue("9")).toBe(0)
      expect(hiLoValue("T")).toBe(-1)
      expect(hiLoValue("J")).toBe(-1)
      expect(hiLoValue("Q")).toBe(-1)
      expect(hiLoValue("K")).toBe(-1)
      expect(hiLoValue("A")).toBe(-1)
    })

    it("should calculate running count correctly", () => {
      const cards: Card[] = [
        { rank: "2", suit: "S" }, // +1
        { rank: "K", suit: "H" }, // -1
        { rank: "5", suit: "D" }, // +1
        { rank: "A", suit: "C" }, // -1
      ]

      let runningCount = 0
      cards.forEach((card) => {
        runningCount = calculateRunningCount(runningCount, card)
      })

      expect(runningCount).toBe(0) // +1 -1 +1 -1 = 0
    })

    it("should calculate true count correctly", () => {
      const runningCount = 6
      const remainingDecks = 3
      const trueCount = calculateTrueCount(runningCount, remainingDecks)

      expect(trueCount).toBe(2) // 6 / 3 = 2
    })

    it("should handle edge cases in true count calculation", () => {
      expect(calculateTrueCount(0, 1)).toBe(0)
      expect(calculateTrueCount(5, 0.5)).toBe(10)
      expect(calculateTrueCount(-3, 1.5)).toBe(-2)
    })
  })
})
