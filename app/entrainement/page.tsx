"use client"

import { useEffect, useState } from "react"
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
  } = useShoe()
  const { toast } = useToast()
  const [currentInsuranceSeat, setCurrentInsuranceSeat] = useState<number | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)

  useEffect(() => {
    document.title = "S'entraîner — Blackjack Trainer (WebaZio)"
  }, [])

  useEffect(() => {
    if (!ui.playerName && !gameInitialized) {
      setShowWelcome(true)
    } else if (!gameInitialized) {
      initShoe()
      setGameInitialized(true)
    }
  }, [ui.playerName, gameInitialized, initShoe])

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

  const handleNewHand = () => {
    if (phase === "END" || phase === "INIT") {
      newHand()
    }
  }

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
    <div className="min-h-screen webazio-bg pt-20">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 lg:space-y-6">
        <StatsBar />

        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full border border-primary/20">
              <span className="text-green-400">💰</span>
              <span className="text-white font-medium">Banque: {bankroll.toLocaleString()}€</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full border border-accent/20">
              <span className="text-accent">🎲</span>
              <span className="text-white font-medium">Exposition: {exposure.toLocaleString()}€</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full border border-green-400/20">
              <span className="text-green-400">✅</span>
              <span className="text-white font-medium">Disponible: {available().toLocaleString()}€</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          <div className="xl:col-span-3 space-y-4 lg:space-y-6">
            <DealerArea dealer={dealer} hideHoleCard={phase === "PLAYER"} />

            <div className={`space-y-4 ${getSeatContainerClass()}`}>
              {seats.length === 1 ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[380px] sm:max-w-[420px]">
                    <SeatCard
                      seat={seats[0]}
                      isActive={currentTurn?.seatIndex === 0}
                      activeHandIndex={currentTurn?.handIndex}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="webazio-card p-3 sm:p-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
                    <Button
                      onClick={handleNewHand}
                      disabled={phase === "DEAL" || phase === "PLAYER" || phase === "DEALER"}
                      className="webazio-button-primary w-full sm:w-auto px-8 py-3 font-medium text-lg"
                    >
                      {phase === "INIT" ? "Commencer" : "Nouvelle main"}
                    </Button>

                    <Button
                      onClick={newShoeSame}
                      variant="outline"
                      className="webazio-button-secondary w-full sm:w-auto px-8 py-3 font-medium text-lg bg-transparent"
                    >
                      Nouveau sabot
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <BettingSettingsDialog>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary">
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
