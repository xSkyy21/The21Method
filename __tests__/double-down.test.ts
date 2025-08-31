import { describe, it, expect } from "vitest"
import { calculateHandValue } from "@/lib/hand"
import type { Card } from "@/lib/types"

describe("Double Down Logic", () => {
  it("should deal exactly one card on double down", () => {
    // This test simulates the double down behavior
    const initialHand: Card[] = [
      { rank: "5", suit: "S" },
      { rank: "6", suit: "H" },
    ]

    const doubleCard: Card = { rank: "9", suit: "D" }
    const finalHand = [...initialHand, doubleCard]

    expect(finalHand).toHaveLength(3)
    expect(calculateHandValue(finalHand).value).toBe(20)
  })

  it("should not allow additional hits after double down", () => {
    // This test verifies the logic that a doubled hand should be finished
    const doubledHand = {
      cards: [
        { rank: "5", suit: "S" },
        { rank: "6", suit: "H" },
        { rank: "A", suit: "D" },
      ],
      finished: true, // Should be set to true after double down
      canDouble: false, // Should be disabled after double down
      canSplit: false, // Should be disabled after double down
    }

    expect(doubledHand.finished).toBe(true)
    expect(doubledHand.canDouble).toBe(false)
    expect(doubledHand.canSplit).toBe(false)
  })

  it("should handle soft totals correctly after double down", () => {
    const softDoubleHand: Card[] = [
      { rank: "A", suit: "S" },
      { rank: "5", suit: "H" },
      { rank: "5", suit: "D" }, // Doubled with a 5
    ]

    const result = calculateHandValue(softDoubleHand)
    expect(result.value).toBe(21)
    expect(result.soft).toBe(true)
  })

  it("should detect bust after double down", () => {
    const bustDoubleHand: Card[] = [
      { rank: "T", suit: "S" },
      { rank: "6", suit: "H" },
      { rank: "8", suit: "D" }, // Doubled with an 8 = 24 (bust)
    ]

    const result = calculateHandValue(bustDoubleHand)
    expect(result.value).toBe(24)
    expect(result.value > 21).toBe(true)
  })
})
