export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K"
export type Suit = "S" | "H" | "D" | "C"

export interface Card {
  rank: Rank
  suit: Suit
}

export interface Hand {
  id: string
  cards: Card[]
  bet: number
  finished: boolean
  busted: boolean
  blackjack: boolean
  canDouble: boolean
  canSplit: boolean
  isSplitAce?: boolean
  insuranceBet?: number
  result?: string
  payout?: number
}

export interface Seat {
  id: number
  hands: Hand[]
  name?: string // Added name field for pseudo display
}

export interface Rules {
  decks: number
  seats: number // Limited to 1-4 in UI
  penetrationPct: number
  blackjackPayout: "3:2" | "6:5"
  dealerStandsOnSoft17: boolean
  holeCardUSPeek: boolean
  doubleRule: "9-11" | "10-11" | "any"
  allowDAS: boolean
  allowResplit: boolean
  maxHandsAfterSplit: number
  splitAcesOneCardOnly: boolean
  insuranceAllowed: boolean
  surrender: "none" | "late" | "early"
}

export interface Settings {
  showRunning: boolean
  showTrue: boolean
  showRemaining: boolean
  showMyCount: boolean // Added toggle for player count display
  quizEveryXHands: number
  basicAdvice: boolean // Toggle for visual game advice
  tutorialMode: boolean
  turnSeconds: number
  baseBet: number
  bankroll: number
  playerName: string // Added player name field
}

export type Phase = "INIT" | "DEAL" | "INSURANCE" | "PLAYER" | "DEALER" | "RESOLVE" | "END"

export interface Turn {
  seatIndex: number
  handIndex: number
}

export interface Event {
  ts: number
  label: string
}

export interface QuizResult {
  running: number
  true: number
  timestamp: number
}

export interface CountAccuracy {
  runningCorrect: boolean
  trueCorrect: boolean
  runningDiff: number
  trueDiff: number
}

export interface FairProof {
  seedClient: string
  seedSystem: string
  nonce: number
  sha256Commitment: string
  revealed: boolean
  shoeOrder?: Card[]
  rulesSnapshot?: Rules
  tsCreated: number
}

export interface ProofExport {
  shoeOrder: Card[]
  seedClient: string
  seedSystem: string
  nonce: number
  sha256Commitment: string
  rulesSnapshot: Rules
  tsCreated: number
  verification: string
}

export interface Wallet {
  bankroll: number
  exposure: number
  available(): number
}

export type Advice = "hit" | "stand" | "double" | "split" | "insurance" | "none"

export interface HandTotals {
  hard: number
  soft?: number
}
