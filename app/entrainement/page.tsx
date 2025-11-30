"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useShoe } from "@/store/useShoe"
import { StatsBar } from "@/components/stats-bar"
import { DealerArea } from "@/components/dealer-area"
import { SeatCard } from "@/components/seat-card"
import { DecisionBar } from "@/components/decision-bar"
import { TurnPanel } from "@/components/turn-panel"
import { InsuranceDialog } from "@/components/insurance-dialog"
import { CountInput } from "@/components/count-input"
import { SeatSelector } from "@/components/seat-selector"
import { WelcomeModal } from "@/components/welcome-modal"
import { QuizDialog } from "@/components/quiz-dialog"
import { FairnessPanel } from "@/components/fairness-panel"
import { BettingSettingsDialog } from "@/components/betting-settings-dialog"
import { useToast } from "@/hooks/use-toast"
import { Settings } from "lucide-react"
import { MobileStats } from "@/components/mobile-stats"
import { MobileActions } from "@/components/mobile-actions"
import { HiLoGuide } from "@/components/hi-lo-guide"

export default function EntrainementPage() {
  const {
    seats,
    dealer,
    phase,
    currentTurn,
    ui,
    rules,
    initShoe,
    newHand,
    tick,
    newShoeSame,
    insuranceOffered,
    insuranceDecisions,
    handleInsuranceDecision,
    shouldQuiz,
    fair,
    bankroll,
    exposure,
    available,
    dealInitial,
    dealCardToPlayer,
    dealCardToDealer,
    completeInitialDeal,
    startRound,
    resetRoundState,
    isDealing,
    dealingCards,
    dealProgress,
  } = useShoe()
  const { toast } = useToast()
  const [currentInsuranceSeat, setCurrentInsuranceSeat] = useState<number | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [showHiLoGuide, setShowHiLoGuide] = useState(false)
  
  // Sequential deal orchestrator
  const dealQueueRef = useRef<boolean>(false)

  useEffect(() => {
    document.title = "S'entraîner — Blackjack Trainer Pro"
  }, [])

  useEffect(() => {
    if (!ui.playerName && !gameInitialized) {
      setShowWelcome(true)
    } else if (!gameInitialized) {
      // IMPORTANT: Ne pas réinitialiser le sabot si déjà en place
      if (seats.length === 0) {
        initShoe()
      }
      setGameInitialized(true)
    }
  }, [ui.playerName, gameInitialized, initShoe, seats.length])

  useEffect(() => {
    const interval = setInterval(() => {
      tick(Date.now())
    }, 100)

    return () => clearInterval(interval)
  }, [tick])

  useEffect(() => {
    const checkTimeout = () => {
      const { currentTurn, turnDeadlineAt, phase } = useShoe.getState()
      if (phase === "PLAYER" && currentTurn && turnDeadlineAt && Date.now() >= turnDeadlineAt) {
        toast({
          title: "Temps écoulé !",
          description: `Siège ${currentTurn.seatIndex + 1} reste automatiquement`,
          duration: 3000,
        })
      }
    }

    const interval = setInterval(checkTimeout, 1000)
    return () => clearInterval(interval)
  }, [toast])

  useEffect(() => {
    if (phase === "INSURANCE" && insuranceOffered.length > 0) {
      for (let i = 0; i < seats.length; i++) {
        if (insuranceOffered[i] && !insuranceDecisions.has(i)) {
          setCurrentInsuranceSeat(i)
          return
        }
      }
      setCurrentInsuranceSeat(null)
    } else {
      setCurrentInsuranceSeat(null)
    }
  }, [phase, insuranceOffered, insuranceDecisions, seats.length])

  useEffect(() => {
    if (phase === "END" && shouldQuiz()) {
      setTimeout(() => setShowQuiz(true), 1000)
    }
  }, [phase, shouldQuiz])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const startSequentialDeal = useCallback(async () => {
    if (dealQueueRef.current) return
    
    dealQueueRef.current = true

    try {
      // Step 1: Start round and initialize deal
      await startRound()
      await sleep(150)

      const totalCards = seats.length * 2 + 2 // 2 cards per player + 2 for dealer
      let currentCard = 0
      
      // Récupérer la vitesse de distribution depuis le store
      const dealSpeed = useShoe.getState().ui.dealSpeed

      // Step 2: Deal first round (one card each)
      for (let seatIndex = 0; seatIndex < seats.length; seatIndex++) {
        // Deal to player
        await dealCardToPlayer(seatIndex)
        currentCard++
        await sleep(dealSpeed)
      }

      // Deal first card to dealer
      await dealCardToDealer(true)
      currentCard++
      await sleep(dealSpeed)

      // Step 3: Deal second round (one card each)
      for (let seatIndex = 0; seatIndex < seats.length; seatIndex++) {
        // Deal to player
        await dealCardToPlayer(seatIndex)
        currentCard++
        await sleep(dealSpeed)
      }

      // Deal second card to dealer (hole card)
      await dealCardToDealer(false)
      currentCard++
      await sleep(dealSpeed)

      // Step 4: Complete deal and check for blackjacks
      await sleep(200)
      await completeInitialDeal()
      
    } catch (error) {
      console.error("Error during sequential deal:", error)
    } finally {
      // Ensure all cards are visible after dealing is complete
      await sleep(200) // Small delay to ensure animations complete
      dealQueueRef.current = false
    }
  }, [phase, seats.length, dealInitial, dealCardToPlayer, dealCardToDealer, completeInitialDeal])

  const handleNewHand = useCallback(async () => {
    // IMPORTANT: Nouvelle main ne doit PAS remonter à "Commencer"
    if (phase === "END" || phase === "INIT") {
      // Reset uniquement roundState, pas shoeState
      resetRoundState()
      
      // Démarrer immédiatement le deal
      await sleep(100)
      await startSequentialDeal()
    }
  }, [phase, resetRoundState, startSequentialDeal])

  const getCurrentHand = () => {
    if (!currentTurn) return null
    return seats[currentTurn.seatIndex]?.hands[currentTurn.handIndex]
  }

  const onInsuranceDecision = (seatIndex: number, takeInsurance: boolean) => {
    handleInsuranceDecision(seatIndex, takeInsurance)
    setCurrentInsuranceSeat(null)
  }

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    initShoe()
    setGameInitialized(true)
  }

  const currentHand = getCurrentHand()

  const getSeatGridClass = () => {
    const seatCount = seats.length
    if (seatCount === 1) return "flex justify-center"
    if (seatCount === 2) return "grid grid-cols-2 gap-4 max-w-2xl mx-auto"
    if (seatCount === 3) return "grid grid-cols-3 gap-4 max-w-3xl mx-auto"
    if (seatCount === 4) return "grid grid-cols-2 lg:grid-cols-4 gap-4"
    return "grid grid-cols-2 lg:grid-cols-4 gap-4" // Fallback for any edge cases
  }

  const getSeatContainerClass = () => {
    const seatCount = seats.length
    return ""
  }

  if (!gameInitialized) {
    return (
      <div className="min-h-screen webazio-bg flex items-center justify-center">
        <WelcomeModal open={showWelcome} onComplete={handleWelcomeComplete} />
      </div>
    )
  }

  return (
    <div className="min-h-screen casino-bg pt-20">
      {/* Casino Particles Effect */}
      <div className="casino-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="casino-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Guide Hi-Lo détaillé */}
        {showHiLoGuide && (
          <HiLoGuide 
            onClose={() => setShowHiLoGuide(false)}
            isVisible={showHiLoGuide}
          />
        )}

        {/* Bouton pour ouvrir le guide Hi-Lo */}
        {!showHiLoGuide && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowHiLoGuide(true)}
              className="casino-button-gold text-sm sm:text-base"
            >
              📚 Guide Complet Hi-Lo
            </Button>
          </div>
        )}

        <StatsBar />
        
        {/* Mobile Stats */}
        <MobileStats />

        {/* Deal Progress Bar */}
        {isDealing && (
          <div className="w-full max-w-md mx-auto">
            <div className="casino-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-white casino-neon-gold">🎯 Distribution des cartes...</span>
                <span className="text-lg font-bold casino-neon-red text-red-400">
                  {Math.round(dealProgress)}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-500 via-red-500 to-green-500 h-3 rounded-full shadow-lg transition-all duration-300 ease-out"
                  style={{ width: `${dealProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
              <span className="text-yellow-400">💰</span>
              <span className="text-white font-medium casino-neon-gold">Banque: {bankroll.toLocaleString()}€</span>
            </div>
            <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
              <span className="text-red-400">🎲</span>
              <span className="text-white font-medium casino-neon-red">Exposition: {exposure.toLocaleString()}€</span>
            </div>
            <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
              <span className="text-green-400">✅</span>
              <span className="text-white font-medium casino-neon-green">Disponible: {available().toLocaleString()}€</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
            <DealerArea 
              dealer={dealer} 
              hideHoleCard={phase === "PLAYER"} 
              dealingCards={dealingCards}
              isDealing={isDealing}
              phase={phase}
            />

            <div className={`space-y-4 ${getSeatContainerClass()}`}>
              {seats.length === 1 ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[380px] sm:max-w-[420px]">
                    <SeatCard
                      seat={seats[0]}
                      isActive={currentTurn?.seatIndex === 0}
                      activeHandIndex={currentTurn?.handIndex}
                      dealingCards={dealingCards}
                      isDealing={isDealing}
                    />
                  </div>
                </div>
              ) : (
                <div className={`${getSeatGridClass()} overflow-x-auto snap-x snap-mandatory lg:overflow-visible`}>
                  {seats.map((seat, index) => (
                    <div key={seat.id} className="snap-center min-w-0">
                      <SeatCard
                        seat={seat}
                        isActive={currentTurn?.seatIndex === index}
                        activeHandIndex={currentTurn?.handIndex}
                        dealingCards={dealingCards}
                        isDealing={isDealing}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentHand && currentTurn && (
              <DecisionBar
                hand={currentHand}
                seatIndex={currentTurn.seatIndex}
                handIndex={currentTurn.handIndex}
                rules={rules}
                dealerUpCard={dealer.cards[0]?.rank}
              />
            )}

            {/* Actions mobile */}
            <MobileActions 
              phase={phase}
              onNewHand={handleNewHand}
              onNewShoe={newShoeSame}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="casino-card p-3 sm:p-4 hidden md:block">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
                    <Button
                      onClick={handleNewHand}
                      disabled={phase === "DEAL" || phase === "PLAYER" || phase === "DEALER"}
                      className="w-full sm:w-auto px-8 py-4 font-bold text-lg casino-button-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phase === "INIT" ? "🎯 Commencer" : "🔄 Nouvelle main"}
                    </Button>

                    <Button
                      onClick={newShoeSame}
                      className="w-full sm:w-auto px-8 py-4 font-bold text-lg casino-button-red"
                    >
                      🎴 Nouveau sabot
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <BettingSettingsDialog>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-500/20 hover:text-yellow-400">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </BettingSettingsDialog>
                  </div>
                </div>
              </Card>

              <SeatSelector />
            </div>

            {ui.showMyCount && (
              <div className="lg:hidden">
                <CountInput />
              </div>
            )}
          </div>

          <div className="xl:col-span-1 space-y-4">
            <TurnPanel />

            <FairnessPanel />

            {ui.showMyCount && (
              <div className="hidden lg:block">
                <CountInput />
              </div>
            )}
          </div>
        </div>

        {currentInsuranceSeat !== null && (
          <InsuranceDialog open={true} seatIndex={currentInsuranceSeat} onDecision={onInsuranceDecision} />
        )}

        <QuizDialog open={showQuiz} onClose={() => setShowQuiz(false)} />
      </div>
    </div>
  )
}
