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
import { Settings, Brain, Target, BookOpen, Lightbulb, CheckCircle, XCircle, Info } from "lucide-react"
import { MobileStats } from "@/components/mobile-stats"
import { MobileActions } from "@/components/mobile-actions"
import { LearningGuide } from "@/components/learning-guide"
import { LearningSteps } from "@/components/learning-steps"
import { HiLoGuide } from "@/components/hi-lo-guide"
import { calculateHandValue, isBlackjack, isBusted } from "@/lib/hand"
import { updateRunningCount, calculateTrueCount, estimateRemainingDecks } from "@/lib/count"

export default function ApprentissagePage() {
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
    running,
    trueCount,
    myRunning,
    myTrue,
    setMyCount,
    addEvent,
    stand,
  } = useShoe()
  const { toast } = useToast()
  const [currentInsuranceSeat, setCurrentInsuranceSeat] = useState<number | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)
  const [showHelp, setShowHelp] = useState(true)
  const [currentCard, setCurrentCard] = useState<any>(null)
  const [cardValue, setCardValue] = useState<number>(0)
  const [showCardValue, setShowCardValue] = useState(false)
  const [learningMode, setLearningMode] = useState<'counting' | 'practice'>('counting')
  const [currentStep, setCurrentStep] = useState(0)
  const [showStepGuide, setShowStepGuide] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHiLoGuide, setShowHiLoGuide] = useState(false)
  
  // Sequential deal orchestrator
  const dealQueueRef = useRef<boolean>(false)

  useEffect(() => {
    document.title = "Apprentissage du Comptage — Blackjack Trainer Pro"
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

  // Fonction pour obtenir la valeur de comptage d'une carte
  const getCardCountValue = (card: any) => {
    if (!card) return 0
    const rank = card.rank
    if (['2', '3', '4', '5', '6'].includes(rank)) return 1
    if (['7', '8', '9'].includes(rank)) return 0
    if (['T', 'J', 'Q', 'K', 'A'].includes(rank)) return -1
    return 0
  }

  // Fonction pour afficher l'aide au comptage
  const showCountingHelp = (card: any) => {
    if (!card) return
    const countValue = getCardCountValue(card)
    const cardDisplay = `${card.rank}${card.suit === "S" ? "♠" : card.suit === "H" ? "♥" : card.suit === "D" ? "♦" : "♣"}`
    
    setCurrentCard(card)
    setCardValue(countValue)
    setShowCardValue(true)
    
    addEvent(`💡 ${cardDisplay}: ${countValue > 0 ? '+' : ''}${countValue} (Hi-Lo)`)
    
    setTimeout(() => {
      setShowCardValue(false)
    }, 3000)
  }

  // Fonction pour obtenir le conseil de stratégie de base
  const getBasicStrategyAdvice = (playerCards: any[], dealerUpCard: any) => {
    if (!playerCards || !dealerUpCard) return null
    
    const { value, soft } = calculateHandValue(playerCards)
    const dealerValue = dealerUpCard.rank === 'A' ? 11 : 
                       ['T', 'J', 'Q', 'K'].includes(dealerUpCard.rank) ? 10 : 
                       parseInt(dealerUpCard.rank)
    
    // Stratégie de base simplifiée
    if (soft && value <= 17) return "Tirer (Soft)"
    if (value <= 11) return "Tirer"
    if (value === 12 && dealerValue >= 4 && dealerValue <= 6) return "Rester"
    if (value >= 13 && value <= 16 && dealerValue >= 2 && dealerValue <= 6) return "Rester"
    if (value >= 17) return "Rester"
    return "Tirer"
  }

  // Fonctions de gestion des étapes d'apprentissage
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleResetSteps = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
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

      {/* Guidage pas à pas */}
      <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-4">
        {showStepGuide && (
          <LearningSteps
            currentStep={currentStep}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onReset={handleResetSteps}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />
        )}

        {/* Guide d'apprentissage */}
        {showHelp && (
          <LearningGuide 
            onToggleGuide={() => setShowHelp(false)}
            isVisible={showHelp}
          />
        )}

        {/* Guide Hi-Lo détaillé */}
        {showHiLoGuide && (
          <HiLoGuide 
            onClose={() => setShowHiLoGuide(false)}
            isVisible={showHiLoGuide}
          />
        )}

        {/* Bouton pour ouvrir le guide Hi-Lo */}
        {!showHiLoGuide && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={() => setShowHiLoGuide(true)}
              className="casino-button-gold text-sm sm:text-base"
            >
              📚 Ouvrir le Guide Complet Hi-Lo
            </Button>
          </div>
        )}

        {/* Affichage de la valeur de la carte */}
        {showCardValue && currentCard && (
          <div className="casino-card p-6 mb-6 border-2 border-yellow-500/50">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl">
                {currentCard.rank}{currentCard.suit === "S" ? "♠" : currentCard.suit === "H" ? "♥" : currentCard.suit === "D" ? "♦" : "♣"}
              </div>
              <div className="text-6xl font-bold casino-neon-gold">
                {cardValue > 0 ? '+' : ''}{cardValue}
              </div>
              <div className="text-lg text-slate-300">
                Valeur Hi-Lo
              </div>
            </div>
          </div>
        )}

        <StatsBar />
        
        {/* Mobile Stats */}
        <MobileStats />


        {/* Affichage des stats financières uniquement en mode pratique */}
        {learningMode === 'practice' && (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
                <span className="text-casino-gold">💰</span>
                <span className="text-white font-medium casino-neon-gold">Banque: {bankroll.toLocaleString()}€</span>
              </div>
              <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
                <span className="text-casino-gold-dark">🎲</span>
                <span className="text-white font-medium casino-neon-gold-dark">Exposition: {exposure.toLocaleString()}€</span>
              </div>
              <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
                <span className="text-casino-gold-light">✅</span>
                <span className="text-white font-medium casino-neon-gold-light">Disponible: {available().toLocaleString()}€</span>
              </div>
            </div>
          </div>
        )}

        {/* Affichage du comptage en mode comptage */}
        {learningMode === 'counting' && (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
                <span className="text-casino-silver">🧮</span>
                <span className="text-white font-medium">Running Count: {ui.showRunning ? (running > 0 ? `+${running}` : running) : "?"}</span>
              </div>
              <div className="flex items-center gap-2 casino-card px-3 py-2 rounded-full">
                <span className="text-casino-silver">📊</span>
                <span className="text-white font-medium">True Count: {ui.showTrue ? (trueCount() > 0 ? `+${trueCount().toFixed(1)}` : trueCount().toFixed(1)) : "?"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
            <DealerArea 
              dealer={dealer} 
              hideHoleCard={phase === "PLAYER"} 
              dealingCards={dealingCards}
              isDealing={isDealing}
              phase={phase}
              onCardClick={showCountingHelp}
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
                      onCardClick={showCountingHelp}
                      showBasicStrategy={learningMode === 'practice'}
                      getBasicStrategyAdvice={getBasicStrategyAdvice}
                      learningMode={learningMode}
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
                        onCardClick={showCountingHelp}
                        showBasicStrategy={learningMode === 'practice'}
                        getBasicStrategyAdvice={getBasicStrategyAdvice}
                        learningMode={learningMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Barre de décision - toujours disponible */}
            {currentHand && currentTurn && (
              <DecisionBar
                hand={currentHand}
                seatIndex={currentTurn.seatIndex}
                handIndex={currentTurn.handIndex}
                rules={rules}
                dealerUpCard={dealer.cards[0]?.rank}
                showBasicStrategy={learningMode === 'practice'}
                getBasicStrategyAdvice={getBasicStrategyAdvice}
              />
            )}

            {/* Info supplémentaire en mode comptage */}
            {learningMode === 'counting' && phase === "PLAYER" && currentTurn && (
              <Card className="casino-card p-4 sm:p-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold text-base sm:text-lg">Mode Apprentissage du Comptage</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Running Count actuel</div>
                      <div className="text-xl font-bold text-green-400">
                        {ui.showRunning ? (running > 0 ? `+${running}` : running) : "?"}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">True Count actuel</div>
                      <div className="text-xl font-bold text-blue-400">
                        {ui.showTrue ? (trueCount() > 0 ? `+${trueCount().toFixed(1)}` : trueCount().toFixed(1)) : "?"}
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                    <p className="text-xs text-slate-300">
                      <strong className="text-yellow-400">💡 Astuce :</strong> Cliquez sur chaque carte pour voir sa valeur Hi-Lo. 
                      Les mises sont masquées pour vous concentrer sur le comptage.
                    </p>
                  </div>
                </div>
              </Card>
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
                  {/* Sélecteur de mode d'apprentissage */}
                  <div className="w-full">
                    <div className="text-xs text-slate-400 mb-2 text-center">Mode d'apprentissage</div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setLearningMode('counting')}
                        variant={learningMode === 'counting' ? 'default' : 'outline'}
                        className={`flex-1 ${learningMode === 'counting' ? 'casino-button-gold' : 'border-slate-600 text-slate-300'}`}
                        size="sm"
                      >
                        🧮 Comptage
                      </Button>
                      <Button
                        onClick={() => setLearningMode('practice')}
                        variant={learningMode === 'practice' ? 'default' : 'outline'}
                        className={`flex-1 ${learningMode === 'practice' ? 'casino-button-gold' : 'border-slate-600 text-slate-300'}`}
                        size="sm"
                      >
                        🎮 Pratique
                      </Button>
                    </div>
                  </div>

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
