import { describe, it, expect } from "vitest"
import { getHiLoValue, calculateRunningCount, calculateTrueCount } from "@/lib/count"
import type { Card } from "@/lib/types"

describe("Hi-Lo Counting System", () => {
  const createCard = (rank: string, suit = "♠"): Card => ({ rank, suit })

  describe("getHiLoValue", () => {
    it("should return +1 for low cards (2-6)", () => {
      expect(getHiLoValue(createCard("2"))).toBe(1)
      expect(getHiLoValue(createCard("3"))).toBe(1)
      expect(getHiLoValue(createCard("4"))).toBe(1)
      expect(getHiLoValue(createCard("5"))).toBe(1)
      expect(getHiLoValue(createCard("6"))).toBe(1)
    })

    it("should return 0 for neutral cards (7-9)", () => {
      expect(getHiLoValue(createCard("7"))).toBe(0)
      expect(getHiLoValue(createCard("8"))).toBe(0)
      expect(getHiLoValue(createCard("9"))).toBe(0)
    })

    it("should return -1 for high cards (10, J, Q, K, A)", () => {
      expect(getHiLoValue(createCard("10"))).toBe(-1)
      expect(getHiLoValue(createCard("J"))).toBe(-1)
      expect(getHiLoValue(createCard("Q"))).toBe(-1)
      expect(getHiLoValue(createCard("K"))).toBe(-1)
      expect(getHiLoValue(createCard("A"))).toBe(-1)
    })
  })

  describe("calculateRunningCount", () => {
    it("should calculate running count correctly", () => {
      const cards = [
        createCard("2"), // +1
        createCard("K"), // -1
        createCard("5"), // +1
        createCard("A"), // -1
        createCard("7"), // 0
      ]
      expect(calculateRunningCount(cards)).toBe(0)
    })

    it("should handle positive running count", () => {
      const cards = [
        createCard("2"), // +1
        createCard("3"), // +1
        createCard("4"), // +1
      ]
      expect(calculateRunningCount(cards)).toBe(3)
    })

    it("should handle negative running count", () => {
      const cards = [
        createCard("K"), // -1
        createCard("Q"), // -1
        createCard("A"), // -1
      ]
      expect(calculateRunningCount(cards)).toBe(-3)
    })
  })

  describe("calculateTrueCount", () => {
    it("should calculate true count correctly", () => {
      expect(calculateTrueCount(6, 3)).toBe(2)
      expect(calculateTrueCount(-6, 3)).toBe(-2)
      expect(calculateTrueCount(3, 2)).toBe(1.5)
    })

    it("should handle edge cases", () => {
      expect(calculateTrueCount(0, 3)).toBe(0)
      expect(calculateTrueCount(6, 1)).toBe(6)
    })

    it("should handle very small deck counts", () => {
      expect(calculateTrueCount(2, 0.5)).toBe(4)
    })
  })
})
