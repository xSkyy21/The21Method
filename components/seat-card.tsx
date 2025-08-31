"use client"

import type { Seat } from "@/lib/types"
import { Card } from "./card"
import { getHandDisplay, isBlackjack, isBusted } from "@/lib/hand"
import { motion } from "framer-motion"

interface SeatCardProps {
  seat: Seat
  isActive?: boolean
  activeHandIndex?: number
}

export function SeatCard({ seat, isActive = false, activeHandIndex = 0 }: SeatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/90 backdrop-blur-sm border-2 rounded-xl p-4 min-h-[200px] ${
        isActive ? "border-accent shadow-lg webazio-accent-glow" : "border-primary/30"
      }`}
    >
      <div className="text-center mb-3">
        <h3 className="text-foreground font-bold">Siège {seat.id + 1}</h3>
      </div>

      <div className="space-y-4">
        {seat.hands.map((hand, handIndex) => {
          const hasBlackjack = isBlackjack(hand.cards)
          const isBust = isBusted(hand.cards)

          return (
            <div
              key={hand.id}
              className={`p-3 rounded-lg border ${
                isActive && handIndex === activeHandIndex
                  ? "bg-accent/20 border-accent webazio-accent-glow"
                  : "bg-secondary/10 border-secondary/30"
              }`}
            >
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {hand.cards.map((card, cardIndex) => (
                  <Card key={cardIndex} card={card} index={cardIndex} />
                ))}
              </div>

              <div className="text-center text-sm space-y-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="font-semibold text-foreground text-base">{getHandDisplay(hand.cards)}</div>

                  {/* Status badges */}
                  {hasBlackjack && (
                    <div className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                      Blackjack !
                    </div>
                  )}
                  {isBust && (
                    <div className="inline-block bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-bold">
                      Bust
                    </div>
                  )}
                  {hand.finished && !hasBlackjack && !isBust && (
                    <div className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                      Terminé
                    </div>
                  )}
                </div>

                <div className="text-accent font-medium">Mise: {hand.bet}€</div>
                {hand.insuranceBet && <div className="text-primary font-medium">Assurance: {hand.insuranceBet}€</div>}

                {hand.result && (
                  <div
                    className={`font-bold text-sm ${
                      hand.payout && hand.payout > 0
                        ? "text-green-400"
                        : hand.payout && hand.payout < 0
                          ? "text-red-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {hand.result}{" "}
                    {hand.payout !== undefined && (
                      <span>
                        ({hand.payout > 0 ? "+" : ""}
                        {hand.payout}€)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
