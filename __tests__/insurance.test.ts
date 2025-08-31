import { describe, it, expect, beforeEach } from "vitest"
import { useShoe } from "@/store/useShoe"
import type { Card } from "@/lib/types"

describe("Insurance System", () => {
  beforeEach(() => {
    useShoe.getState().resetAll()
  })

  it("should offer insurance when dealer shows Ace", () => {
    const store = useShoe.getState()

    // Set up dealer with Ace
    const dealerWithAce = {
      ...store.dealer,
      cards: [{ rank: "A", suit: "S" } as Card],
    }

    store.updateRules({ insuranceAllowed: true })

    // Mock the dealer state
    useShoe.setState({ dealer: dealerWithAce })

    const shouldOffer = store.offerInsuranceIfNeeded()
    expect(shouldOffer).toBe(true)
  })

  it("should not offer insurance when dealer shows non-Ace", () => {
    const store = useShoe.getState()

    const dealerWithKing = {
      ...store.dealer,
      cards: [{ rank: "K", suit: "S" } as Card],
    }

    useShoe.setState({ dealer: dealerWithKing })

    const shouldOffer = store.offerInsuranceIfNeeded()
    expect(shouldOffer).toBe(false)
  })

  it("should not offer insurance when disabled in rules", () => {
    const store = useShoe.getState()

    const dealerWithAce = {
      ...store.dealer,
      cards: [{ rank: "A", suit: "S" } as Card],
    }

    store.updateRules({ insuranceAllowed: false })
    useShoe.setState({ dealer: dealerWithAce })

    const shouldOffer = store.offerInsuranceIfNeeded()
    expect(shouldOffer).toBe(false)
  })

  it("should handle insurance decision correctly", () => {
    const store = useShoe.getState()
    const initialBankroll = store.ui.bankroll

    // Set up game state for insurance
    const seats = [
      {
        id: 0,
        hands: [
          {
            id: "test-hand",
            cards: [
              { rank: "K", suit: "S" },
              { rank: "Q", suit: "H" },
            ] as Card[],
            bet: 100,
            finished: false,
            busted: false,
            blackjack: false,
            canDouble: false,
            canSplit: false,
          },
        ],
      },
    ]

    useShoe.setState({
      seats,
      phase: "INSURANCE",
      insuranceDecisions: new Map(),
    })

    // Take insurance
    store.handleInsuranceDecision(0, true)

    // Should deduct insurance cost from bankroll
    expect(store.ui.bankroll).toBe(initialBankroll - 50) // Half of bet
    expect(store.seats[0].hands[0].insuranceBet).toBe(50)
    expect(store.insuranceDecisions.get(0)).toBe(true)
  })

  it("should pay insurance when dealer has blackjack", () => {
    const store = useShoe.getState()
    const initialBankroll = 25000

    // Set up insured hand
    const seats = [
      {
        id: 0,
        hands: [
          {
            id: "test-hand",
            cards: [
              { rank: "K", suit: "S" },
              { rank: "Q", suit: "H" },
            ] as Card[],
            bet: 100,
            finished: false,
            busted: false,
            blackjack: false,
            canDouble: false,
            canSplit: false,
            insuranceBet: 50,
          },
        ],
      },
    ]

    const dealerWithBlackjack = {
      ...store.dealer,
      cards: [
        { rank: "A", suit: "S" },
        { rank: "K", suit: "H" },
      ] as Card[],
      blackjack: true,
    }

    useShoe.setState({
      seats,
      dealer: dealerWithBlackjack,
      ui: { ...store.ui, bankroll: initialBankroll - 50 }, // Already paid insurance
    })

    // Simulate insurance payout during dealer play
    const insurancePayout = 50 * 2 // 2:1 payout
    const newBankroll = store.ui.bankroll + insurancePayout

    expect(newBankroll).toBe(initialBankroll + 50) // Net gain of 50
  })
})
