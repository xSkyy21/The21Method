"use client"

import { Button } from "@/components/ui/button"
import type { Hand, Rules } from "@/lib/types"
import { canDouble, canSplit, isBlackjack, calculateHandValue } from "@/lib/hand"
import { useShoe } from "@/store/useShoe"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { sfx } from "@/lib/sfx"
import { getHandSnapshot, recommendActions } from "@/lib/strategy"
import { cn } from "@/lib/utils"
import { useEffect, useState, useMemo } from "react"
import { 
  Play, 
  Square, 
  RotateCcw, 
  Scissors,
  Lightbulb,
  Zap,
  Star,
  Target
} from "lucide-react"

interface DecisionBarProps {
  hand: Hand
  seatIndex: number
  handIndex: number
  rules: Rules
  dealerUpCard?: string
  showBasicStrategy?: boolean
  getBasicStrategyAdvice?: (playerCards: any[], dealerUpCard: any) => string | null
}

export function DecisionBar({ hand, seatIndex, handIndex, rules, dealerUpCard, showBasicStrategy = false, getBasicStrategyAdvice }: DecisionBarProps) {
  const { hit, stand, doubleDown, split, handleInsuranceDecision, phase, ui, currentTurn, dealer } = useShoe()

  // Use useMemo to prevent infinite re-renders - recalculé à CHAQUE changement pertinent
  const recommendedActions = useMemo(() => {
    if (!ui.basicAdvice || !dealerUpCard || isBlackjack(hand.cards) || hand.finished) {
      return []
    }

    const handSnapshot = getHandSnapshot(hand)
    const recommendations = recommendActions(handSnapshot, dealerUpCard)

    // Filter recommendations based on what's actually available
    const canDoubleNow = !hand.finished && canDouble(hand) && ui.bankroll >= hand.bet && hand.cards.length === 2
    const canSplitNow = !hand.finished && canSplit(hand) && ui.bankroll >= hand.bet
    const canHitNow = !hand.finished
    const canStandNow = !hand.finished

    return recommendations.filter((action) => {
      switch (action) {
        case "hit":
          return canHitNow
        case "stand":
          return canStandNow
        case "double":
          return canDoubleNow
        case "split":
          return canSplitNow
        default:
          return false
      }
    })
  }, [
    ui.basicAdvice, 
    dealerUpCard, 
    hand.cards, 
    hand.finished, 
    hand.bet, 
    ui.bankroll, 
    hand.canDouble,
    hand.canSplit,
    rules.dealerStandsOnSoft17,
    rules.allowDAS,
    rules.allowResplit,
    rules.surrender
  ])

  const isCurrentTurn = currentTurn?.seatIndex === seatIndex && currentTurn?.handIndex === handIndex
  const hasBlackjack = isBlackjack(hand.cards)
  const isFinished = hand.finished

  // Don't show decision bar for blackjack hands during player phase
  if (hasBlackjack && phase === "PLAYER") {
    return null
  }

  const canDoubleNow =
    !hasBlackjack && !isFinished && canDouble(hand) && ui.bankroll >= hand.bet && hand.cards.length === 2
  const canSplitNow = !hasBlackjack && !isFinished && canSplit(hand) && ui.bankroll >= hand.bet
  const canHitNow = !hasBlackjack && !isFinished
  const canStandNow = !isFinished

  if (phase !== "PLAYER" && phase !== "INSURANCE") return null

  if (!isCurrentTurn && phase === "PLAYER") return null

  // Calculate hand info for display
  const handValue = calculateHandValue(hand.cards)
  const handType = handValue.soft ? "Soft" : "Hard"
  const handDisplay = `${handType} ${handValue.value}`

  // Get recommended action for display
  const recommendedAction = recommendedActions[0] || null
  const getActionDisplay = (action: string) => {
    switch (action) {
      case "hit": return "Tirer"
      case "stand": return "Rester"
      case "double": return "Doubler"
      case "split": return "Séparer"
      default: return ""
    }
  }

  if (phase === "INSURANCE") {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-center">
        <h3 className="text-white font-bold text-lg mb-3">Assurance disponible</h3>
        <p className="text-sm text-white/70 mb-4">
          Le croupier montre un As. Voulez-vous prendre une assurance ?
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              sfx.click()
              handleInsuranceDecision(seatIndex, true)
            }}
            className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            Prendre l'assurance
          </Button>
          <Button
            onClick={() => {
              sfx.click()
              handleInsuranceDecision(seatIndex, false)
            }}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            Refuser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="casino-card p-6">
        {/* Header with hand info and recommendation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              <span className="text-white font-semibold text-sm sm:text-base">Main actuelle:</span>
              <span className="text-white font-bold text-lg sm:text-xl casino-neon-gold text-yellow-400">{handDisplay}</span>
            </div>
            {dealerUpCard && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-sm">🎯 vs</span>
                <span className="text-white font-semibold text-sm sm:text-base">Croupier: {dealerUpCard}</span>
              </div>
            )}
          </div>
          
          {ui.basicAdvice && recommendedAction && (
            <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/20 to-red-500/20 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-yellow-500/30 shadow-lg shadow-yellow-500/25 w-full sm:w-auto">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse flex-shrink-0" />
              <span className="text-white font-semibold text-xs sm:text-sm casino-neon-gold">
                ⭐ Recommandé: {getActionDisplay(recommendedAction)}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Hit Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  sfx.click()
                  hit()
                }}
                disabled={!canHitNow}
                className={cn(
                  "h-14 sm:h-16 px-3 sm:px-4 rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg relative overflow-hidden",
                  "decision-button-hit disabled:opacity-50 disabled:cursor-not-allowed",
                  recommendedAction === "hit" && ui.basicAdvice && "ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900/50 animate-pulse shadow-2xl shadow-yellow-400/50"
                )}
                              >
                {recommendedAction === "hit" && ui.basicAdvice && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 animate-pulse" />
                )}
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <Play className="w-5 h-5" />
                  <span>Tirer</span>
                  {recommendedAction === "hit" && ui.basicAdvice && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-4 h-4 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tirer une carte supplémentaire</p>
            </TooltipContent>
          </Tooltip>

          {/* Stand Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  sfx.click()
                  stand()
                }}
                disabled={!canStandNow}
                className={cn(
                  "h-14 sm:h-16 px-3 sm:px-4 rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg relative overflow-hidden",
                  "decision-button-stand disabled:opacity-50 disabled:cursor-not-allowed",
                  recommendedAction === "stand" && ui.basicAdvice && "ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900/50 animate-pulse shadow-2xl shadow-yellow-400/50"
                )}
              >
                {recommendedAction === "stand" && ui.basicAdvice && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 animate-pulse" />
                )}
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <Square className="w-5 h-5" />
                  <span>Rester</span>
                  {recommendedAction === "stand" && ui.basicAdvice && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-4 h-4 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Garder votre main actuelle</p>
            </TooltipContent>
          </Tooltip>

          {/* Double Down Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  sfx.click()
                  doubleDown()
                }}
                disabled={!canDoubleNow}
                className={cn(
                  "h-14 sm:h-16 px-3 sm:px-4 rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg relative overflow-hidden",
                  "decision-button-double disabled:opacity-50 disabled:cursor-not-allowed",
                  recommendedAction === "double" && ui.basicAdvice && "ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900/50 animate-pulse shadow-2xl shadow-yellow-400/50"
                )}
              >
                {recommendedAction === "double" && ui.basicAdvice && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 animate-pulse" />
                )}
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <RotateCcw className="w-5 h-5" />
                  <span>Doubler</span>
                  {recommendedAction === "double" && ui.basicAdvice && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-4 h-4 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Doubler votre mise et tirer une seule carte</p>
            </TooltipContent>
          </Tooltip>

          {/* Split Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  sfx.click()
                  split()
                }}
                disabled={!canSplitNow}
                className={cn(
                  "h-14 sm:h-16 px-3 sm:px-4 rounded-xl font-semibold text-sm sm:text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg relative overflow-hidden",
                  "decision-button-split disabled:opacity-50 disabled:cursor-not-allowed",
                  recommendedAction === "split" && ui.basicAdvice && "ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 ring-offset-slate-900/50 animate-pulse shadow-2xl shadow-yellow-400/50"
                )}
              >
                {recommendedAction === "split" && ui.basicAdvice && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-red-400/20 animate-pulse" />
                )}
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <Scissors className="w-5 h-5" />
                  <span>Séparer</span>
                  {recommendedAction === "split" && ui.basicAdvice && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-4 h-4 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Séparer votre main en deux mains distinctes</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Strategy info */}
        {ui.basicAdvice && (
          <div className="mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              <span className="text-accent font-semibold text-sm">Stratégie de base</span>
            </div>
            <p className="text-white/80 text-sm">
              {recommendedAction 
                ? `Main ${handType.toLowerCase()} ${handValue.value}, croupier ${dealerUpCard} → ${getActionDisplay(recommendedAction)}`
                : "Aucune recommandation disponible"
              }
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
