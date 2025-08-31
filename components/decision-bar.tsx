"use client"

import { Button } from "@/components/ui/button"
import type { Hand, Rules } from "@/lib/types"
import { canDouble, canSplit, isBlackjack } from "@/lib/hand"
import { useShoe } from "@/store/useShoe"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { sfx } from "@/lib/sfx"
import { getHandSnapshot, recommendActions } from "@/lib/strategy"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface DecisionBarProps {
  hand: Hand
  seatIndex: number
  handIndex: number
  rules: Rules
  dealerUpCard?: string
}

export function DecisionBar({ hand, seatIndex, handIndex, rules, dealerUpCard }: DecisionBarProps) {
  const { hit, stand, doubleDown, split, handleInsuranceDecision, phase, ui, currentTurn, dealer } = useShoe()
  const [vibratingActions, setVibratingActions] = useState<string[]>([])

  useEffect(() => {
    if (!ui.basicAdvice || !dealerUpCard || isBlackjack(hand.cards) || hand.finished) {
      setVibratingActions([])
      return
    }

    const handSnapshot = getHandSnapshot(hand)
    const recommendations = recommendActions(handSnapshot, dealerUpCard)

    // Filter recommendations based on what's actually available
    const canDoubleNow = !hand.finished && canDouble(hand) && ui.bankroll >= hand.bet && hand.cards.length === 2
    const canSplitNow = !hand.finished && canSplit(hand) && ui.bankroll >= hand.bet
    const canHitNow = !hand.finished
    const canStandNow = !hand.finished

    const availableRecommendations = recommendations.filter((action) => {
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

    setVibratingActions(availableRecommendations)

    const timer = setTimeout(() => setVibratingActions([]), 3000)
    return () => clearTimeout(timer)
  }, [ui.basicAdvice, dealerUpCard, hand]) // Updated dependency to include the entire hand object

  const isCurrentTurn = currentTurn?.seatIndex === seatIndex && currentTurn?.handIndex === handIndex
  const hasBlackjack = isBlackjack(hand.cards)
  const isFinished = hand.finished

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

  if (phase === "INSURANCE") {
    return (
      <div className="bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg p-4 text-center">
        <h3 className="text-foreground font-bold mb-3">Assurance disponible</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Le croupier montre un As. Voulez-vous prendre une assurance ?
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => {
              sfx.click()
              handleInsuranceDecision(seatIndex, true)
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Prendre l'assurance
          </Button>
          <Button
            onClick={() => {
              sfx.click()
              handleInsuranceDecision(seatIndex, false)
            }}
            variant="outline"
            className="border-accent/50 hover:border-accent"
          >
            Refuser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div id="table-root" className="bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg p-4">
      <div className="text-center mb-3">
        <h3 className="text-foreground font-bold">
          Siège {seatIndex + 1} - Main {handIndex + 1}
        </h3>
        <p className="text-muted-foreground">Que voulez-vous faire ?</p>
        {isFinished && !hasBlackjack && (
          <div className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold mt-2">
            Main terminée
          </div>
        )}
        {ui.basicAdvice && vibratingActions.length > 0 && (
          <div className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium mt-2">
            💡{" "}
            {vibratingActions.includes("hit")
              ? "Tirer recommandé"
              : vibratingActions.includes("stand")
                ? "Rester recommandé"
                : vibratingActions.includes("double")
                  ? "Doubler recommandé"
                  : vibratingActions.includes("split")
                    ? "Séparer recommandé"
                    : "Stratégie recommandée"}
          </div>
        )}
      </div>

      <TooltipProvider>
        <div id="round-controls" className="flex flex-wrap gap-2 justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  id="btn-hit"
                  onClick={() => {
                    sfx.click()
                    hit()
                  }}
                  disabled={!canHitNow}
                  className={cn(
                    "bg-primary hover:bg-primary/90 disabled:opacity-50",
                    vibratingActions.includes("hit") && "vibrate",
                  )}
                >
                  Tirer
                </Button>
              </div>
            </TooltipTrigger>
            {!canHitNow && (
              <TooltipContent>
                <p>
                  {hasBlackjack
                    ? "Impossible avec un Blackjack"
                    : isFinished
                      ? "Main terminée"
                      : "Action non disponible"}
                </p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  id="btn-stand"
                  onClick={() => {
                    sfx.click()
                    stand()
                  }}
                  disabled={!canStandNow}
                  variant="outline"
                  className={cn(
                    "border-accent/50 hover:border-accent hover:bg-accent/10 bg-transparent disabled:opacity-50",
                    vibratingActions.includes("stand") && "vibrate",
                  )}
                >
                  Rester
                </Button>
              </div>
            </TooltipTrigger>
            {!canStandNow && (
              <TooltipContent>
                <p>Main déjà terminée</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  id="btn-double"
                  onClick={() => {
                    sfx.click()
                    doubleDown()
                  }}
                  disabled={!canDoubleNow}
                  variant="secondary"
                  className={cn(
                    "bg-secondary hover:bg-secondary/90 disabled:opacity-50",
                    vibratingActions.includes("double") && "vibrate",
                  )}
                >
                  Doubler
                </Button>
              </div>
            </TooltipTrigger>
            {!canDoubleNow && (
              <TooltipContent>
                <p>
                  {hasBlackjack
                    ? "Impossible avec un Blackjack"
                    : isFinished
                      ? "Main terminée"
                      : hand.cards.length > 2
                        ? "Seulement sur les 2 premières cartes"
                        : ui.bankroll < hand.bet
                          ? "Bankroll insuffisante"
                          : "Double non autorisé"}
                </p>
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  id="btn-split"
                  onClick={() => {
                    sfx.click()
                    split()
                  }}
                  disabled={!canSplitNow}
                  variant="secondary"
                  className={cn(
                    "bg-secondary hover:bg-secondary/90 disabled:opacity-50",
                    vibratingActions.includes("split") && "vibrate",
                  )}
                >
                  Séparer
                </Button>
              </div>
            </TooltipTrigger>
            {!canSplitNow && (
              <TooltipContent>
                <p>
                  {hasBlackjack
                    ? "Impossible avec un Blackjack"
                    : isFinished
                      ? "Main terminée"
                      : ui.bankroll < hand.bet
                        ? "Bankroll insuffisante"
                        : "Séparation non disponible"}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
