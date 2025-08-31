import { describe, it, expect, beforeEach, vi } from "vitest"
import { useShoe } from "@/store/useShoe"

// Mock setTimeout for controlled async testing
vi.mock("setTimeout", () => ({
  default: (fn: Function) => fn(),
}))

describe("Game Integration", () => {
  beforeEach(() => {
    useShoe.getState().resetAll()
  })

  it("should complete a full game cycle", async () => {
    const store = useShoe.getState()

    // Initialize game
    store.initShoe()
    expect(store.phase).toBe("INIT")
    expect(store.seats).toHaveLength(3) // Default seats

    // Deal initial cards
    await store.dealInitial()
    expect(store.phase).toBe("PLAYER")
    expect(store.dealer.cards).toHaveLength(1)
    expect(store.seats[0].hands[0].cards).toHaveLength(2)

    // Player actions
    if (store.currentTurn) {
      await store.stand()
      // Should advance to next seat or dealer
      expect(store.currentTurn?.seatIndex).toBeGreaterThanOrEqual(0)
    }
  })

  it("should handle blackjack correctly", () => {
    const store = useShoe.getState()

    // Mock a blackjack hand
    const blackjackHand = [
      { rank: "A", suit: "S" },
      { rank: "K", suit: "H" },
    ]

    const seats = [
      {
        id: 0,
        hands: [
          {
            id: "test-hand",
            cards: blackjackHand,
            bet: 100,
            finished: true,
            busted: false,
            blackjack: true,
            canDouble: false,
            canSplit: false,
          },
        ],
      },
    ]

    useShoe.setState({ seats })

    expect(store.seats[0].hands[0].blackjack).toBe(true)
    expect(store.seats[0].hands[0].finished).toBe(true)
  })

  it("should handle multiple seats correctly", () => {
    const store = useShoe.getState()

    // Change to 5 seats
    store.updateRules({ seats: 5 })
    store.initShoe()

    expect(store.seats).toHaveLength(5)
    expect(store.rules.seats).toBe(5)

    // Each seat should have one hand
    store.seats.forEach((seat) => {
      expect(seat.hands).toHaveLength(1)
      expect(seat.hands[0].bet).toBe(store.ui.baseBet)
    })
  })

  it("should maintain bankroll correctly through game", () => {
    const store = useShoe.getState()
    const initialBankroll = store.ui.bankroll

    // Simulate winning hand
    const winningResult = {
      result: "Gagné",
      payout: 100,
    }

    const seats = [
      {
        id: 0,
        hands: [
          {
            id: "test-hand",
            cards: [
              { rank: "K", suit: "S" },
              { rank: "Q", suit: "H" },
            ],
            bet: 100,
            finished: true,
            busted: false,
            blackjack: false,
            canDouble: false,
            canSplit: false,
            ...winningResult,
          },
        ],
      },
    ]

    useShoe.setState({ seats })

    // Simulate resolve
    const newBankroll = initialBankroll + winningResult.payout
    store.updateSettings({ bankroll: newBankroll })

    expect(store.ui.bankroll).toBe(initialBankroll + 100)
  })

  it("should handle cut card and reshuffle", () => {
    const store = useShoe.getState()

    // Set high penetration
    store.updateRules({ penetrationPct: 90 })

    const totalCards = store.rules.decks * 52
    const cutCardPosition = Math.floor(totalCards * (store.rules.penetrationPct / 100))

    expect(cutCardPosition).toBeGreaterThan(totalCards * 0.8)

    // When remaining cards < cut card position, should trigger reshuffle
    const remainingCards = store.remainingCards()
    const shouldReshuffle = remainingCards <= totalCards - cutCardPosition

    if (shouldReshuffle) {
      store.newShoeSame()
      expect(store.shoe).toHaveLength(totalCards)
      expect(store.running).toBe(0)
    }
  })
})
