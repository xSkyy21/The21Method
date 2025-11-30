import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Card,
  Hand,
  Seat,
  Rules,
  Settings,
  Phase,
  Turn,
  Event,
  QuizResult,
  FairProof,
  ProofExport,
  Wallet,
} from "@/lib/types"
import { createShoe, createProvablyFairShoe } from "@/lib/deck"
import { updateRunningCount, calculateTrueCount, estimateRemainingDecks } from "@/lib/count"
import { calculateHandValue, isBlackjack, isBusted, canDouble, canSplit } from "@/lib/hand"
import { generateSeed, sha256 } from "@/lib/crypto"
import { sfx } from "@/lib/sfx"

const DEFAULT_RULES: Rules = {
  decks: 6,
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

const DEFAULT_SETTINGS: Settings = {
  showRunning: false,
  showTrue: false,
  showRemaining: false,
  showMyCount: false,
  quizEveryXHands: 5,
  basicAdvice: false,
  tutorialMode: false,
  turnSeconds: 30,
  baseBet: 10,
  bankroll: 1500,
  playerName: "",
  dealSpeed: 180, // Délai en millisecondes entre chaque carte distribuée
  soundEnabled: true, // Effets sonores activés par défaut
}

// ==================================================
// 1. SHOE STATE (PERSISTANT - survit aux mains)
// ==================================================
interface ShoeState {
  // Sabot et comptage
  shoe: Card[]
  discard: number
  running: number
  handsDealt: number
  cutCardPosition: number
  
  // Configuration
  rules: Rules
  ui: Settings
  fair: FairProof
  
  // Comptage utilisateur
  myRunning?: number
  myTrue?: number
  
  // Bankroll (persistante)
  bankroll: number
  exposure: number
  
  // Événements et quiz
  queue: Event[]
  quizResults: QuizResult[]
  eventKeys: Set<string>
}

// ==================================================
// 2. ROUND STATE (ÉPHÉMÈRE - reset à chaque main)
// ==================================================
interface RoundState {
  // État de la manche actuelle
  phase: Phase
  currentTurn?: Turn
  turnDeadlineAt?: number
  
  // Mains des joueurs et croupier
  seats: Seat[]
  dealer: Hand
  
  // Assurance
  insuranceOffered: boolean[]
  insuranceDecisions: Map<number, boolean>
  
  // Animations et UI
  isDealing: boolean
  dealingCards: Set<string>
  dealProgress: number
}

// ==================================================
// 3. STORE COMPLET
// ==================================================
interface GameState extends ShoeState, RoundState, Wallet {
  // Méthodes de bankroll
  available(): number
  canAfford(amount: number): boolean
  engageBet(hand: Hand, amount: number, reason: string): void
  engageInsurance(hand: Hand, amount: number): void
  credit(amount: number, reason: string): void
  settleLoss(hand: Hand): void
  settlePush(hand: Hand): void
  settleWin(hand: Hand): void
  settleBlackjack(hand: Hand, payout?: number): void
  settleInsuranceWin(hand: Hand): void
  settleInsuranceLose(hand: Hand): void
  
  // Méthodes de sabot (persistantes)
  newFairSeeds: (seedClient?: string) => void
  generateCommittedShoe: () => Promise<void>
  revealShoe: () => ProofExport
  initShoe: () => void
  newShoeSame: () => void
  resetAll: () => void
  updateRules: (newRules: Partial<Rules>) => void
  updateSettings: (newSettings: Partial<Settings>) => void
  
  // Méthodes de manche (éphémères)
  resetRoundState: () => void
  adjustSeatsForNewCount: (newSeatCount: number) => void
  startRound: () => Promise<void>
  dealInitial: () => Promise<void>
  dealCardToPlayer: (seatIndex: number) => Promise<boolean>
  dealCardToDealer: (faceUp: boolean) => Promise<boolean>
  completeInitialDeal: () => Promise<void>
  
  // Méthodes de jeu
  offerInsuranceIfNeeded: () => boolean
  handleInsuranceDecision: (seatIndex: number, takeInsurance: boolean) => void
  checkAllInsuranceDecisions: () => void
  setTurn: (turn: Turn | null) => void
  tick: (now: number) => void
  hit: () => Promise<void>
  stand: () => Promise<void>
  doubleDown: () => Promise<void>
  split: () => Promise<void>
  dealerPlay: () => Promise<void>
  resolve: () => void
  advanceTurn: () => void
  
  // Méthodes utilitaires
  remainingCards: () => number
  remainingDecks: () => number
  trueCount: () => number
  shouldQuiz: () => boolean
  recordQuiz: (running?: number, trueCount?: number) => void
  addEvent: (label: string) => void
  logEventOnce: (key: string, label: string, windowMs?: number) => void
  clearEvents: () => void
  newHand: () => void
  setMyCount: (running?: number, trueCount?: number) => void
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function dealOneTo(hand: Hand, state: GameState) {
  if (state.shoe.length === 0) return

  const card = state.shoe.pop()!
  hand.cards.push(card)
  state.discard++
  state.running = updateRunningCount(state.running, card)

  const cardDisplay = `${card.rank}${card.suit === "S" ? "♠" : card.suit === "H" ? "♥" : card.suit === "D" ? "♦" : "♣"}`
  const { value } = calculateHandValue(hand.cards)
  state.queue.push({
    ts: Date.now(),
    label: `+ ${cardDisplay} → Total: ${value}`,
  })
}

export const useShoe = create<GameState>()(
  persist(
    (set, get) => ({
      // ==================================================
      // ÉTAT INITIAL
      // ==================================================
      
      // Shoe State (persistant)
      shoe: [],
      discard: 0,
      running: 0,
      handsDealt: 0,
      cutCardPosition: 0,
      rules: DEFAULT_RULES,
      ui: DEFAULT_SETTINGS,
      fair: {
        seedClient: "",
        seedSystem: "",
        nonce: 0,
        sha256Commitment: "",
        revealed: false,
        tsCreated: Date.now(),
      },
      myRunning: undefined,
      myTrue: undefined,
      bankroll: 1500,
      exposure: 0,
      queue: [],
      quizResults: [],
      eventKeys: new Set(),

      // Round State (éphémère)
      phase: "INIT",
      currentTurn: undefined,
      turnDeadlineAt: undefined,
      seats: [],
      dealer: {
        id: "dealer",
        cards: [],
        bet: 0,
        finished: false,
        busted: false,
        blackjack: false,
        canDouble: false,
        canSplit: false,
      },
      insuranceOffered: [],
      insuranceDecisions: new Map(),
      isDealing: false,
      dealingCards: new Set(),
      dealProgress: 0,

      // ==================================================
      // MÉTHODES DE BANKROLL
      // ==================================================
      available() {
        const state = get()
        return Math.max(state.bankroll - state.exposure, 0)
      },

      canAfford(amount: number) {
        return get().available() >= amount
      },

      engageBet(hand: Hand, amount: number, reason: string) {
        const state = get()
        if (!state.canAfford(amount)) return

        hand.bet += amount
        set({
          bankroll: state.bankroll - amount,
          exposure: state.exposure + amount,
        })
        get().addEvent(`${reason}: -${amount}€`)
      },

      engageInsurance(hand: Hand, amount: number) {
        const state = get()
        if (!state.canAfford(amount)) return

        hand.insuranceBet = amount
        set({
          bankroll: state.bankroll - amount,
          exposure: state.exposure + amount,
        })
        get().addEvent(`Assurance: -${amount}€`)
      },

      credit(amount: number, reason: string) {
        const state = get()
        set({ bankroll: state.bankroll + amount })
        get().addEvent(`${reason}: +${amount}€`)
      },

      settleLoss(hand: Hand) {
        const state = get()
        const totalLoss = hand.bet + (hand.insuranceBet || 0)
        set({ exposure: state.exposure - totalLoss })
      },

      settlePush(hand: Hand) {
        const state = get()
        get().credit(hand.bet, "Égalité")
        const totalExposure = hand.bet + (hand.insuranceBet || 0)
        set({ exposure: state.exposure - totalExposure })
      },

      settleWin(hand: Hand) {
        const state = get()
        get().credit(hand.bet * 2, "Victoire")
        const totalExposure = hand.bet + (hand.insuranceBet || 0)
        set({ exposure: state.exposure - totalExposure })
      },

      settleBlackjack(hand: Hand, payout = 1.5) {
        const state = get()
        const winAmount = hand.bet * (1 + payout)
        get().credit(winAmount, "Blackjack")
        const totalExposure = hand.bet + (hand.insuranceBet || 0)
        set({ exposure: state.exposure - totalExposure })
      },

      settleInsuranceWin(hand: Hand) {
        const state = get()
        if (hand.insuranceBet) {
          get().credit(hand.insuranceBet * 2, "Assurance gagnée")
          set({ exposure: state.exposure - hand.insuranceBet })
        }
      },

      settleInsuranceLose(hand: Hand) {
        const state = get()
        if (hand.insuranceBet) {
          set({ exposure: state.exposure - hand.insuranceBet })
        }
      },

      // ==================================================
      // MÉTHODES DE SABOT (PERSISTANTES)
      // ==================================================
      newFairSeeds: (seedClient?: string) => {
        const state = get()
        if (state.fair.sha256Commitment) return

        set({
          fair: {
            ...state.fair,
            seedClient: seedClient || generateSeed(),
            seedSystem: generateSeed(),
            nonce: 0,
            revealed: false,
            tsCreated: Date.now(),
          },
        })
      },

      generateCommittedShoe: async () => {
        const state = get()
        if (state.fair.sha256Commitment) return

        if (!state.fair.seedClient || !state.fair.seedSystem) {
          get().newFairSeeds()
        }

        const updatedState = get()
        const shoe = createProvablyFairShoe(
          updatedState.rules.decks,
          updatedState.fair.seedClient,
          updatedState.fair.seedSystem,
          updatedState.fair.nonce,
        )

        const commitmentData = {
          shoeOrder: shoe,
          nonce: updatedState.fair.nonce,
          rulesSnapshot: updatedState.rules,
        }

        const commitment = await sha256(JSON.stringify(commitmentData))

        set({
          shoe,
          fair: {
            ...updatedState.fair,
            sha256Commitment: commitment,
            shoeOrder: shoe,
            rulesSnapshot: { ...updatedState.rules },
          },
        })

        get().addEvent("Engagement cryptographique créé ✅")
      },

      revealShoe: (): ProofExport => {
        const state = get()
        if (!state.fair.sha256Commitment || !state.fair.shoeOrder) {
          throw new Error("No commitment to reveal")
        }

        const proof: ProofExport = {
          shoeOrder: state.fair.shoeOrder,
          seedClient: state.fair.seedClient,
          seedSystem: state.fair.seedSystem,
          nonce: state.fair.nonce,
          sha256Commitment: state.fair.sha256Commitment,
          rulesSnapshot: state.fair.rulesSnapshot!,
          tsCreated: state.fair.tsCreated,
          verification:
            "Recalculer Fisher-Yates avec Mulberry32(seedClient:seedSystem:nonce) puis SHA-256 sur l'ordre + nonce. Le hash doit égaler l'engagement initial.",
        }

        set({
          fair: { ...state.fair, revealed: true },
        })

        get().addEvent("Sabot révélé - Preuve d'équité disponible 🔓")
        return proof
      },

      initShoe: () => {
        const { rules } = get()
        const shoe = createShoe(rules.decks)
        const cutCardPosition = Math.floor(shoe.length * (rules.penetrationPct / 100))
        
        const seats: Seat[] = []
        for (let i = 0; i < rules.seats; i++) {
          seats.push({
            id: i,
            hands: [
              {
                id: `seat-${i}-hand-0`,
                cards: [],
                bet: get().ui.baseBet,
                finished: false,
                busted: false,
                blackjack: false,
                canDouble: false,
                canSplit: false,
              },
            ],
          })
        }

        // Migration de la bankroll vers 1500€ si nécessaire
        const currentBankroll = get().bankroll
        if (currentBankroll !== 1500) {
          console.log(`Migration bankroll: ${currentBankroll}€ → 1500€`)
        }

        set({
          shoe,
          discard: 0,
          running: 0,
          handsDealt: 0,
          cutCardPosition,
          seats,
          dealer: {
            id: "dealer",
            cards: [],
            bet: 0,
            finished: false,
            busted: false,
            blackjack: false,
            canDouble: false,
            canSplit: false,
          },
          phase: "INIT",
          currentTurn: undefined,
          turnDeadlineAt: undefined,
          queue: [],
          insuranceOffered: [],
          insuranceDecisions: new Map(),
          myRunning: undefined,
          myTrue: undefined,
          eventKeys: new Set(),
          isDealing: false,
          dealingCards: new Set(),
          dealProgress: 0,
          // Forcer la bankroll à 1500€
          bankroll: 1500,
        })
      },

      newShoeSame: () => {
        get().initShoe()
      },

      resetAll: () => {
        set({
          rules: DEFAULT_RULES,
          ui: DEFAULT_SETTINGS,
          quizResults: [],
          myRunning: undefined,
          myTrue: undefined,
          eventKeys: new Set(),
        })
        get().initShoe()
      },

      updateRules: (newRules) => {
        const state = get()
        const updatedRules = { ...state.rules, ...newRules }

        if (updatedRules.seats > 4) {
          updatedRules.seats = 4
          if (typeof window !== "undefined") {
            const { toast } = require("@/hooks/use-toast")
            toast({
              title: "Limite de sièges",
              description: "Maximum 4 sièges autorisés pour une expérience optimale",
              duration: 3000,
            })
          }
        }

        if (newRules.seats && newRules.seats !== state.rules.seats) {
          if (state.phase !== "INIT" && state.phase !== "END") {
            if (typeof window !== "undefined") {
              const { toast } = require("@/hooks/use-toast")
              toast({
                title: "Changement impossible",
                description: "Changez le nombre de sièges entre deux mains",
                duration: 3000,
              })
            }
            return
          }
          set({ rules: updatedRules })
          // IMPORTANT: Ne pas réinitialiser le sabot, juste ajuster les sièges
          get().adjustSeatsForNewCount(newRules.seats)
        } else {
          set({ rules: updatedRules })
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({ ui: { ...state.ui, ...newSettings } }))
      },

      // ==================================================
      // MÉTHODES DE MANCHE (ÉPHÉMÈRES)
      // ==================================================
      adjustSeatsForNewCount: (newSeatCount: number) => {
        const state = get()
        const currentSeats = state.seats
        const newSeats: Seat[] = []
        
        // Créer les nouveaux sièges en préservant les mains existantes si possible
        for (let i = 0; i < newSeatCount; i++) {
          if (i < currentSeats.length) {
            // Garder le siège existant avec ses mains
            newSeats.push(currentSeats[i])
          } else {
            // Créer un nouveau siège vide
            newSeats.push({
              id: i,
              hands: [
                {
                  id: `seat-${i}-hand-0`,
                  cards: [],
                  bet: 0,
                  finished: false,
                  busted: false,
                  blackjack: false,
                  canDouble: false,
                  canSplit: false,
                },
              ],
            })
          }
        }

        set({
          seats: newSeats,
          phase: "INIT",
          currentTurn: undefined,
          turnDeadlineAt: undefined,
          insuranceOffered: [],
          insuranceDecisions: new Map(),
          eventKeys: new Set(),
          isDealing: false,
          dealingCards: new Set(),
          dealProgress: 0,
        })

        get().addEvent(`Ajustement des sièges: ${currentSeats.length} → ${newSeatCount} (sabot préservé)`)
      },

      resetRoundState: () => {
        const state = get()
        const newSeats: Seat[] = []
        for (let i = 0; i < state.rules.seats; i++) {
          newSeats.push({
            id: i,
            hands: [
              {
                id: `seat-${i}-hand-0`,
                cards: [],
                bet: 0,
                finished: false,
                busted: false,
                blackjack: false,
                canDouble: false,
                canSplit: false,
              },
            ],
          })
        }

        const newDealer: Hand = {
          id: "dealer",
          cards: [],
          bet: 0,
          finished: false,
          busted: false,
          blackjack: false,
          canDouble: false,
          canSplit: false,
        }

        set({
          seats: newSeats,
          dealer: newDealer,
          phase: "INIT",
          currentTurn: undefined,
          turnDeadlineAt: undefined,
          insuranceOffered: [],
          insuranceDecisions: new Map(),
          eventKeys: new Set(),
          isDealing: false,
          dealingCards: new Set(),
          dealProgress: 0,
        })

        get().addEvent("Nouvelle main - Cartes retirées")
      },

      startRound: async () => {
        const state = get()
        if (state.phase !== "INIT") return
        
        // Vérifier si on doit reshuffle
        if (state.shoe.length <= state.cutCardPosition) {
          get().addEvent("Cut card atteinte - Reshuffle automatique")
          get().initShoe()
        }
        
        await get().dealInitial()
      },

      dealInitial: async () => {
        const state = get()
        if (state.phase !== "INIT") return

        set({ phase: "DEAL" })
        get().addEvent("Distribution des cartes...")

        const newSeats = [...state.seats]

        // Engage bets for all seats before dealing
        for (let i = 0; i < newSeats.length; i++) {
          const hand = newSeats[i].hands[0]
          if (hand.bet === 0) {
            hand.bet = state.ui.baseBet
            get().engageBet(hand, hand.bet, "Mise initiale")
          }
        }

        set({ seats: newSeats })
        get().addEvent("Mises engagées - Distribution séquentielle")
      },

      dealCardToPlayer: async (seatIndex: number) => {
        const state = get()
        if (state.phase !== "DEAL" || state.shoe.length === 0) return false

        const card = state.shoe.pop()!
        const newSeats = [...state.seats]
        newSeats[seatIndex].hands[0].cards.push(card)
        
        const newRunning = updateRunningCount(state.running, card)
        
        console.log(`dealCardToPlayer: Siège ${seatIndex + 1} reçoit ${card.rank}${card.suit}, cartes:`, newSeats[seatIndex].hands[0].cards)
        
        set({ 
          seats: newSeats, 
          shoe: [...state.shoe],
          running: newRunning
        })
        
        sfx.card()
        return true
      },

      dealCardToDealer: async (faceUp: boolean = true) => {
        const state = get()
        if (state.phase !== "DEAL" || state.shoe.length === 0) return false

        const card = state.shoe.pop()!
        const newDealer = { ...state.dealer }
        newDealer.cards.push(card)
        
        const newRunning = updateRunningCount(state.running, card)
        
        set({ 
          dealer: newDealer, 
          shoe: [...state.shoe],
          running: newRunning
        })
        
        sfx.card()
        return true
      },

      completeInitialDeal: async () => {
        const state = get()
        if (state.phase !== "DEAL") return

        // Calculate hand values and check for blackjacks
        const newSeats = [...state.seats]
        for (const seat of newSeats) {
          const hand = seat.hands[0]
          const { value } = calculateHandValue(hand.cards)
          hand.blackjack = isBlackjack(hand.cards)
          hand.canDouble = canDouble(hand)
          hand.canSplit = canSplit(hand)

          if (hand.blackjack) {
            hand.finished = true
            hand.canDouble = false
            hand.canSplit = false
            get().addEvent(`Siège ${seat.id + 1} a un Blackjack naturel !`)
          }
        }

        // RÈGLE FRANÇAISE : On ne révèle PAS la deuxième carte du croupier même s'il a un Blackjack
        // On attend que tous les joueurs finissent leurs choix avant de la révéler
        const newDealer = { ...state.dealer }
        newDealer.blackjack = isBlackjack(newDealer.cards)
        
        // Si le croupier a un Blackjack, on le marque mais on ne révèle pas encore la carte
        if (newDealer.blackjack) {
          get().addEvent("🎯 Le croupier a potentiellement un Blackjack (carte cachée)")
        }

        set({ seats: newSeats, handsDealt: state.handsDealt + 1 })

        if (get().offerInsuranceIfNeeded()) {
          const insuranceOffered = new Array(newSeats.length).fill(true)
          set({
            phase: "INSURANCE",
            insuranceOffered,
            insuranceDecisions: new Map(),
          })
          get().addEvent("Assurance proposée à tous les sièges")
        } else {
          set({ phase: "PLAYER" })
          get().setTurn({ seatIndex: 0, handIndex: 0 })
        }
      },

      // ==================================================
      // MÉTHODES DE JEU
      // ==================================================
      offerInsuranceIfNeeded: () => {
        const { dealer, rules } = get()
        return rules.insuranceAllowed && dealer.cards.length > 0 && dealer.cards[0].rank === "A"
      },

      handleInsuranceDecision: (seatIndex: number, takeInsurance: boolean) => {
        const state = get()
        if (state.phase !== "INSURANCE") return

        const newDecisions = new Map(state.insuranceDecisions)
        newDecisions.set(seatIndex, takeInsurance)

        if (takeInsurance) {
          const seat = state.seats[seatIndex]
          const hand = seat.hands[0]
          const insuranceCost = hand.bet * 0.5

          if (get().canAfford(insuranceCost)) {
            get().engageInsurance(hand, insuranceCost)
            get().addEvent(`Siège ${seatIndex + 1} prend l'assurance (${insuranceCost}€)`)
          }
        } else {
          get().addEvent(`Siège ${seatIndex + 1} refuse l'assurance`)
        }

        set({ insuranceDecisions: newDecisions })
        get().checkAllInsuranceDecisions()
      },

      checkAllInsuranceDecisions: () => {
        const state = get()
        const totalSeats = state.seats.length

        if (state.insuranceDecisions.size >= totalSeats) {
          // Vérifier s'il y a des mains avec Blackjack avant de passer au tour des joueurs
          const newSeats = [...state.seats]
          let hasBlackjackHands = false
          
          for (const seat of newSeats) {
            for (const hand of seat.hands) {
              if (hand.blackjack && !hand.finished) {
                hand.finished = true
                hasBlackjackHands = true
                get().addEvent(`Blackjack automatique - Siège ${seat.id + 1} passe`)
              }
            }
          }
          
          if (hasBlackjackHands) {
            set({ seats: newSeats })
          }
          
          set({ phase: "PLAYER" })
          get().setTurn({ seatIndex: 0, handIndex: 0 })
          get().addEvent("Phase d'assurance terminée - Tour des joueurs")
        }
      },

      setTurn: (turn) => {
        const { ui } = get()
        
        // Vérifier si la main actuelle est un Blackjack
        let shouldSetTimer = true
        if (turn) {
          const seat = get().seats[turn.seatIndex]
          const hand = seat.hands[turn.handIndex]
          if (hand.blackjack) {
            shouldSetTimer = false
            get().addEvent(`Blackjack automatique - Siège ${turn.seatIndex + 1} passe`)
            // Avancer automatiquement après un court délai
            setTimeout(() => {
              get().advanceTurn()
            }, 1000)
          }
        }
        
        const deadline = turn && shouldSetTimer ? Date.now() + ui.turnSeconds * 1000 : undefined
        set({ currentTurn: turn || undefined, turnDeadlineAt: deadline })
      },

      tick: (now) => {
        const { currentTurn, turnDeadlineAt, phase } = get()
        if (phase === "PLAYER" && currentTurn && turnDeadlineAt && now >= turnDeadlineAt) {
          get().addEvent(`Temps écoulé - Siège ${currentTurn.seatIndex + 1} reste automatiquement`)
          if (typeof window !== "undefined") {
            // Toast will be handled by the component
          }
          get().stand()
        }
      },

      hit: async () => {
        const state = get()
        if (state.phase !== "PLAYER" || !state.currentTurn) return

        const { seatIndex, handIndex } = state.currentTurn
        const seat = state.seats[seatIndex]
        const hand = seat.hands[handIndex]

        if (hand.blackjack || state.shoe.length === 0 || hand.finished) return

        const card = state.shoe.pop()!
        const newRunning = updateRunningCount(state.running, card)

        hand.cards.push(card)
        const { value } = calculateHandValue(hand.cards)

        sfx.card()

        const cardDisplay = `${card.rank}${card.suit === "S" ? "♠" : card.suit === "H" ? "♥" : card.suit === "D" ? "♦" : "♣"}`
        get().logEventOnce(`hit-${seatIndex}-${handIndex}`, `Siège ${seatIndex + 1} tire ${cardDisplay} (Total: ${value})`)

        if (isBusted(hand.cards)) {
          hand.busted = true
          hand.finished = true
          get().logEventOnce(`bust-${seatIndex}-${handIndex}`, `Siège ${seatIndex + 1} dépasse (${value})`)
        } else if (value === 21) {
          hand.finished = true
          get().logEventOnce(`21-${seatIndex}-${handIndex}`, `Siège ${seatIndex + 1} fait 21`)
        }

        hand.canDouble = false
        hand.canSplit = false

        set({
          seats: [...state.seats],
          shoe: [...state.shoe],
          running: newRunning,
        })

        await sleep(600)

        if (hand.finished) {
          get().advanceTurn()
        }
      },

      stand: async () => {
        const state = get()
        if (state.phase !== "PLAYER" || !state.currentTurn) return

        const { seatIndex, handIndex } = state.currentTurn
        const hand = state.seats[seatIndex].hands[handIndex]

        hand.finished = true
        get().logEventOnce(`stand-${seatIndex}-${handIndex}`, `Siège ${seatIndex + 1} reste`)

        set({ seats: [...state.seats] })
        await sleep(100)

        get().advanceTurn()
      },

      doubleDown: async () => {
        const state = get()
        if (state.phase !== "PLAYER" || !state.currentTurn) return

        const { seatIndex, handIndex } = state.currentTurn
        const seat = state.seats[seatIndex]
        const hand = seat.hands[handIndex]

        if (hand.blackjack || !hand.canDouble || state.shoe.length === 0 || hand.finished) return

        const doubleAmount = hand.bet
        if (!get().canAfford(doubleAmount)) return

        get().engageBet(hand, doubleAmount, "Double")

        get().logEventOnce(`double-${seatIndex}-${handIndex}`, `Siège ${seatIndex + 1} double (mise: ${hand.bet}€)`)

        set({ turnDeadlineAt: undefined })

        await dealOneTo(hand, state)

        hand.finished = true
        hand.canDouble = false
        hand.canSplit = false

        if (isBusted(hand.cards)) {
          hand.busted = true
          const { value } = calculateHandValue(hand.cards)
          get().logEventOnce(
            `double-bust-${seatIndex}-${handIndex}`,
            `Siège ${seatIndex + 1} dépasse après double (${value})`,
          )
        }

        set({ seats: [...state.seats] })
        await sleep(250)

        get().advanceTurn()
      },

      split: async () => {
        const state = get()
        if (state.phase !== "PLAYER" || !state.currentTurn) return

        const { seatIndex, handIndex } = state.currentTurn
        const seat = state.seats[seatIndex]
        const hand = seat.hands[handIndex]

        if (hand.blackjack || !hand.canSplit || seat.hands.length >= state.rules.maxHandsAfterSplit) return

        const splitAmount = hand.bet
        if (!get().canAfford(splitAmount)) return

        const secondCard = hand.cards.pop()!
        const newHand: Hand = {
          id: `seat-${seatIndex}-hand-${seat.hands.length}`,
          cards: [secondCard],
          bet: 0,
          finished: false,
          busted: false,
          blackjack: false,
          canDouble: true,
          canSplit: false,
          isSplitAce: secondCard.rank === "A",
        }

        get().engageBet(newHand, splitAmount, "Split")

        seat.hands.push(newHand)
        hand.canSplit = false

        get().addEvent(`Siège ${seatIndex + 1} sépare (${seat.hands.length} mains)`)

        if (state.shoe.length >= 2) {
          const card1 = state.shoe.pop()!
          const card2 = state.shoe.pop()!
          let newRunning = updateRunningCount(state.running, card1)
          newRunning = updateRunningCount(newRunning, card2)

          hand.cards.push(card1)
          newHand.cards.push(card2)

          if (hand.isSplitAce || newHand.isSplitAce) {
            hand.finished = true
            newHand.finished = true
            hand.canDouble = false
            newHand.canDouble = false
          }

          set({
            seats: [...state.seats],
            shoe: [...state.shoe],
            running: newRunning,
          })
        }

        await sleep(350)

        if (hand.finished) {
          get().advanceTurn()
        }
      },

      dealerPlay: async () => {
        const state = get()
        if (state.phase !== "DEALER") return

        get().addEvent("Tour du croupier")

        // Flip the hole card first
        if (state.dealer.cards.length === 2) {
          get().addEvent("Révélation de la carte du croupier")
          await sleep(600)
        }

        if (state.dealer.cards.length === 1 && state.shoe.length > 0) {
          const secondCard = state.shoe.pop()!
          const newRunning = updateRunningCount(state.running, secondCard)

          state.dealer.cards.push(secondCard)

          sfx.card()

          get().addEvent(
            `Croupier reçoit sa 2e carte: ${secondCard.rank}${secondCard.suit === "S" ? "♠" : secondCard.suit === "H" ? "♥" : secondCard.suit === "D" ? "♦" : "♣"}`,
          )

          set({
            dealer: { ...state.dealer },
            shoe: [...state.shoe],
            running: newRunning,
          })

          await sleep(450)
        }

        let { value } = calculateHandValue(state.dealer.cards)

        if (isBlackjack(state.dealer.cards)) {
          state.dealer.blackjack = true
          get().addEvent("Le croupier a un Blackjack !")

          for (let seatIndex = 0; seatIndex < state.seats.length; seatIndex++) {
            const seat = state.seats[seatIndex]
            const hand = seat.hands[0]

            if (hand.insuranceBet && hand.insuranceBet > 0) {
              const insurancePayout = hand.insuranceBet * 2
              const newBankroll = state.ui.bankroll + insurancePayout
              set({ ui: { ...state.ui, bankroll: newBankroll } })
              get().addEvent(`Siège ${seatIndex + 1} - Assurance payée: +${insurancePayout}€`)
            }
          }
        }

        while (
          value < 17 ||
          (value === 17 && !state.rules.dealerStandsOnSoft17 && calculateHandValue(state.dealer.cards).soft)
        ) {
          if (state.shoe.length === 0) break

          await sleep(450)

          const card = state.shoe.pop()!
          const newRunning = updateRunningCount(state.running, card)

          state.dealer.cards.push(card)
          const handValue = calculateHandValue(state.dealer.cards)
          value = handValue.value

          sfx.card()

          get().addEvent(
            `Croupier tire ${card.rank}${card.suit === "S" ? "♠" : card.suit === "H" ? "♥" : card.suit === "D" ? "♦" : "♣"} (Total: ${value})`,
          )

          set({
            dealer: { ...state.dealer },
            shoe: [...state.shoe],
            running: newRunning,
          })
        }

        if (isBusted(state.dealer.cards)) {
          state.dealer.busted = true
          get().addEvent(`Croupier dépasse (${value})`)
        } else {
          get().addEvent(`Croupier reste sur ${value}`)
        }

        state.dealer.finished = true
        set({ dealer: { ...state.dealer }, phase: "RESOLVE" })

        await sleep(500)
        get().resolve()
      },

      resolve: () => {
        const state = get()

        for (const seat of state.seats) {
          for (const hand of seat.hands) {
            const playerValue = calculateHandValue(hand.cards).value
            const dealerValue = calculateHandValue(state.dealer.cards).value

            let result = ""

            if (state.dealer.blackjack && !hand.blackjack) {
              result = "Croupier Blackjack"
              get().settleLoss(hand)
            } else if (hand.busted) {
              result = "Perdu"
              get().settleLoss(hand)
            } else if (state.dealer.busted) {
              if (hand.blackjack) {
                result = "Blackjack gagne"
                const payout = state.rules.blackjackPayout === "3:2" ? 1.5 : 1.2
                get().settleBlackjack(hand, payout)
              } else {
                result = "Gagné"
                get().settleWin(hand)
              }
            } else if (hand.blackjack && !state.dealer.blackjack) {
              result = "Blackjack gagne"
              const payout = state.rules.blackjackPayout === "3:2" ? 1.5 : 1.2
              get().settleBlackjack(hand, payout)
            } else if (playerValue > dealerValue) {
              result = "Gagné"
              get().settleWin(hand)
            } else if (playerValue < dealerValue) {
              result = "Perdu"
              get().settleLoss(hand)
            } else {
              result = "Égalité"
              get().settlePush(hand)
            }

            hand.result = result
            get().addEvent(`Siège ${seat.id + 1}: ${result}`)
          }

          // Handle insurance resolution
          const hand = seat.hands[0]
          if (hand.insuranceBet) {
            if (state.dealer.blackjack) {
              get().settleInsuranceWin(hand)
            } else {
              get().settleInsuranceLose(hand)
            }
          }
        }

        set({
          phase: "END",
          seats: [...state.seats],
        })

        // Clear all cards after resolution
        setTimeout(() => {
          get().addEvent("Main terminée - Cartes retirées")
        }, 2000)
      },

      advanceTurn: () => {
        const state = get()
        if (state.phase !== "PLAYER") return

        const { seatIndex, handIndex } = state.currentTurn || { seatIndex: 0, handIndex: 0 }

        let nextSeatIndex = seatIndex
        let nextHandIndex = handIndex + 1

        // Check if current seat has more hands
        if (nextHandIndex >= state.seats[seatIndex].hands.length) {
          nextSeatIndex++
          nextHandIndex = 0
        }

        // Find next unfinished hand, skipping natural Blackjacks
        while (nextSeatIndex < state.seats.length) {
          const seat = state.seats[nextSeatIndex]
          if (nextHandIndex < seat.hands.length) {
            const hand = seat.hands[nextHandIndex]
            if (!hand.finished && !hand.blackjack) {
              break
            }
            // Si c'est un Blackjack, le marquer comme terminé et passer au suivant
            if (hand.blackjack && !hand.finished) {
              hand.finished = true
              get().addEvent(`Blackjack automatique - Siège ${nextSeatIndex + 1} passe`)
            }
          }

          nextHandIndex++
          if (nextHandIndex >= seat.hands.length) {
            nextSeatIndex++
            nextHandIndex = 0
          }
        }

        if (nextSeatIndex >= state.seats.length) {
          // All player turns done, move to dealer
          set({ phase: "DEALER", currentTurn: undefined, turnDeadlineAt: undefined })
          get().dealerPlay()
        } else {
          get().setTurn({ seatIndex: nextSeatIndex, handIndex: nextHandIndex })
        }
      },

      // ==================================================
      // MÉTHODES UTILITAIRES
      // ==================================================
      remainingCards: () => {
        return get().shoe.length
      },

      remainingDecks: () => {
        return estimateRemainingDecks(get().remainingCards())
      },

      trueCount: () => {
        return calculateTrueCount(get().running, get().remainingDecks())
      },

      shouldQuiz: () => {
        const { handsDealt, ui } = get()
        return ui.quizEveryXHands > 0 && handsDealt % ui.quizEveryXHands === 0 && handsDealt > 0
      },

      recordQuiz: (running, trueCount) => {
        const result: QuizResult = {
          running: running || 0,
          true: trueCount || 0,
          timestamp: Date.now(),
        }
        set((state) => ({ quizResults: [...state.quizResults, result] }))
      },

      addEvent: (label) => {
        const event: Event = {
          ts: Date.now(),
          label,
        }
        set((state) => ({ queue: [...state.queue.slice(-199), event] }))
      },

      logEventOnce: (key: string, label: string, windowMs = 300) => {
        const state = get()
        const now = Date.now()
        const eventKey = `${key}-${Math.floor(now / windowMs)}`

        if (state.eventKeys.has(eventKey)) return

        const newEventKeys = new Set(state.eventKeys)
        newEventKeys.add(eventKey)

        // Clean old keys (keep only last 100)
        if (newEventKeys.size > 100) {
          const keysArray = Array.from(newEventKeys)
          const recentKeys = keysArray.slice(-50)
          newEventKeys.clear()
          recentKeys.forEach((k) => newEventKeys.add(k))
        }

        const event: Event = {
          ts: now,
          label,
        }

        set({
          queue: [...state.queue.slice(-199), event],
          eventKeys: newEventKeys,
        })
      },

      clearEvents: () => {
        set({ queue: [] })
      },

      newHand: () => {
        // IMPORTANT: Ne réinitialise que roundState, pas shoeState
        get().resetRoundState()
        
        // Vérifier si on doit reshuffle (cut card atteinte)
        const state = get()
        if (state.shoe.length <= state.cutCardPosition) {
          get().addEvent("Cut card atteinte - Reshuffle automatique")
          get().initShoe()
        }
        
        get().addEvent("Nouvelle main prête - Distribution en cours...")
      },

      setMyCount: (running?: number, trueCount?: number) => {
        set({ myRunning: running, myTrue: trueCount })
      },
    }),
    {
      name: "blackjack-shoe-state",
      partialize: (state) => ({
        // Persister seulement shoeState, pas roundState
        shoe: state.shoe,
        discard: state.discard,
        running: state.running,
        handsDealt: state.handsDealt,
        cutCardPosition: state.cutCardPosition,
        rules: state.rules,
        ui: state.ui,
        fair: state.fair,
        myRunning: state.myRunning,
        myTrue: state.myTrue,
        bankroll: state.bankroll,
        exposure: state.exposure,
        queue: state.queue,
        quizResults: state.quizResults,
        eventKeys: state.eventKeys,
      }),
    }
  )
)
