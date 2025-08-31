import type { Card, Hand, Rules, Advice } from "./types"
import { handTotals, isPair } from "./hand"

export function getHandSnapshot(hand: Hand) {
  const { hard, soft } = handTotals(hand.cards)
  const total = soft && soft !== hard ? soft : hard
  const isSoft = soft && soft !== hard
  const isPairHand = hand.cards.length === 2 && isPair(hand.cards)

  return {
    total,
    isSoft,
    isPair: isPairHand,
    canDouble: hand.canDouble,
    canSplit: hand.canSplit,
  }
}

export function recommendActions(handSnapshot: any, dealerUpCard: string): string[] {
  const dealerValue = dealerUpCard === "A" ? 11 : Math.min(10, Number.parseInt(dealerUpCard) || 10)

  // Split recommendations
  if (handSnapshot.isPair && handSnapshot.canSplit) {
    const pairValue = handSnapshot.total / 2
    if (pairValue === 11 || pairValue === 8) return ["split"]
    if (pairValue === 9 && dealerValue !== 7 && dealerValue !== 10 && dealerValue !== 11) return ["split"]
    if (pairValue === 7 && dealerValue <= 7) return ["split"]
    if (pairValue === 6 && dealerValue <= 6) return ["split"]
    if (pairValue === 4 && (dealerValue === 5 || dealerValue === 6)) return ["split"]
    if (pairValue === 2 && dealerValue <= 7) return ["split"]
    if (pairValue === 10) return ["stand"]
  }

  // Soft totals
  if (handSnapshot.isSoft) {
    if (handSnapshot.total >= 19) return ["stand"]
    if (handSnapshot.total === 18) {
      if (handSnapshot.canDouble && dealerValue >= 3 && dealerValue <= 6) return ["double", "stand"]
      if (dealerValue >= 9 || dealerValue === 11) return ["hit"]
      return ["stand"]
    }
    if (handSnapshot.total === 17 || handSnapshot.total === 16) {
      if (handSnapshot.canDouble && dealerValue >= 3 && dealerValue <= 6) return ["double", "hit"]
      return ["hit"]
    }
    if (handSnapshot.total === 15 || handSnapshot.total === 14) {
      if (handSnapshot.canDouble && dealerValue >= 4 && dealerValue <= 6) return ["double", "hit"]
      return ["hit"]
    }
    if (handSnapshot.total === 13 || handSnapshot.total === 12) {
      if (handSnapshot.canDouble && dealerValue >= 5 && dealerValue <= 6) return ["double", "hit"]
      return ["hit"]
    }
  }

  // Hard totals
  const t = handSnapshot.total
  if (t >= 17) return ["stand"]
  if (t >= 13 && t <= 16) {
    if (dealerValue <= 6) return ["stand"]
    return ["hit"]
  }
  if (t === 12) {
    return dealerValue >= 4 && dealerValue <= 6 ? ["stand"] : ["hit"]
  }
  if (t === 11 && handSnapshot.canDouble) return ["double"]
  if (t === 10 && handSnapshot.canDouble && dealerValue <= 9) return ["double", "hit"]
  if (t === 9 && handSnapshot.canDouble && dealerValue >= 3 && dealerValue <= 6) return ["double", "hit"]
  return ["hit"]
}

export function basicStrategyAdvice(hand: Hand, dealerUp: Card, rules: Rules): Advice {
  if (!dealerUp || hand.finished || hand.busted || hand.blackjack) return "none"

  const { hard, soft } = handTotals(hand.cards)
  const dealerValue = dealerUp.rank === "A" ? 11 : Math.min(10, Number.parseInt(dealerUp.rank) || 10)

  // Insurance check
  if (dealerUp.rank === "A" && rules.insuranceAllowed && hand.cards.length === 2) {
    // Generally not recommended unless counting
    return "none"
  }

  // Pairs
  if (hand.cards.length === 2 && isPair(hand.cards) && hand.canSplit) {
    const pairRank = hand.cards[0].rank
    switch (pairRank) {
      case "A":
      case "8":
        return "split"
      case "2":
      case "3":
      case "7":
        return dealerValue <= 7 ? "split" : "hit"
      case "4":
        return dealerValue === 5 || dealerValue === 6 ? "split" : "hit"
      case "6":
        return dealerValue <= 6 ? "split" : "hit"
      case "9":
        return dealerValue <= 6 || (dealerValue >= 8 && dealerValue <= 9) ? "split" : "stand"
      case "T":
      case "J":
      case "Q":
      case "K":
        return "stand"
      default:
        return "hit"
    }
  }

  // Soft totals (with Ace counted as 11)
  if (soft && soft !== hard) {
    switch (soft) {
      case 13:
      case 14:
        return (dealerValue === 5 || dealerValue === 6) && hand.canDouble ? "double" : "hit"
      case 15:
      case 16:
        return dealerValue >= 4 && dealerValue <= 6 && hand.canDouble ? "double" : "hit"
      case 17:
        return dealerValue >= 3 && dealerValue <= 6 && hand.canDouble ? "double" : "hit"
      case 18:
        if (dealerValue >= 3 && dealerValue <= 6 && hand.canDouble) return "double"
        if (dealerValue >= 9 || dealerValue === 11) return "hit"
        return "stand"
      case 19:
      case 20:
      case 21:
        return "stand"
      default:
        return "hit"
    }
  }

  // Hard totals
  const total = hard
  if (total <= 8) return "hit"
  if (total === 9) {
    return dealerValue >= 3 && dealerValue <= 6 && hand.canDouble ? "double" : "hit"
  }
  if (total === 10) {
    return dealerValue <= 9 && hand.canDouble ? "double" : "hit"
  }
  if (total === 11) {
    return hand.canDouble ? "double" : "hit"
  }
  if (total === 12) {
    return dealerValue >= 4 && dealerValue <= 6 ? "stand" : "hit"
  }
  if (total >= 13 && total <= 16) {
    return dealerValue <= 6 ? "stand" : "hit"
  }
  if (total >= 17) {
    return "stand"
  }

  return "hit"
}
