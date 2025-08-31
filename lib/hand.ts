import type { Card, Hand, Rank, HandTotals } from "./types"

export function getCardValue(rank: Rank): number {
  switch (rank) {
    case "A":
      return 11
    case "K":
    case "Q":
    case "J":
    case "T":
      return 10
    default:
      return Number.parseInt(rank)
  }
}

export function calculateHandValue(cards: Card[]): { value: number; soft: boolean } {
  let value = 0
  let aces = 0

  for (const card of cards) {
    if (card.rank === "A") {
      aces++
      value += 11
    } else {
      value += getCardValue(card.rank)
    }
  }

  // Convert aces from 11 to 1 if needed
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }

  const soft = aces > 0 && value <= 21
  return { value, soft }
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  const { value } = calculateHandValue(cards)
  return value === 21
}

export function isBusted(cards: Card[]): boolean {
  const { value } = calculateHandValue(cards)
  return value > 21
}

export function isBust(hand: Hand): boolean {
  return isBusted(hand.cards)
}

export function isSoft(hand: Hand): boolean {
  const { soft } = calculateHandValue(hand.cards)
  return soft
}

export function canDouble(hand: Hand): boolean {
  return hand.cards.length === 2 && !hand.finished
}

export function canSplit(hand: Hand): boolean {
  if (hand.cards.length !== 2) return false
  return getCardValue(hand.cards[0].rank) === getCardValue(hand.cards[1].rank)
}

export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false
  return cards[0].rank === cards[1].rank
}

export function getHandDisplay(cards: Card[]): string {
  const { value, soft } = calculateHandValue(cards)
  if (isBusted(cards)) return `${value} (Bust)`
  if (isBlackjack(cards)) return "Blackjack"
  return `${value}${soft ? " (souple)" : " (dur)"}`
}

export function handTotals(cards: Card[]): HandTotals {
  let sums = [0]
  for (const c of cards) {
    const vals = c.rank === "A" ? [1, 11] : [Math.min(10, Number.parseInt(c.rank) || 10)]
    const next: number[] = []
    for (const s of sums) for (const v of vals) next.push(s + v)
    sums = Array.from(new Set(next))
  }

  const underOrEq21 = sums.filter((s) => s <= 21).sort((a, b) => a - b)
  const hard = Math.min(...sums)
  const maxUnder = underOrEq21.length ? underOrEq21[underOrEq21.length - 1] : hard

  const hasAce = cards.some((c) => c.rank === "A")
  return {
    hard,
    soft: hasAce && maxUnder !== hard ? maxUnder : undefined,
  }
}

export function formatTotalLabel(hand: Hand): string {
  const { hard, soft } = handTotals(hand.cards)
  if (soft && soft !== hard) return `${hard} / ${soft} (souple)`
  return `${hard} (dur)`
}

export function isNaturalBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandValue(cards).value === 21
}
