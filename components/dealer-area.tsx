"use client"

import type { Hand } from "@/lib/types"
import { Card } from "./card"
import { getHandDisplay, isBlackjack, isBusted } from "@/lib/hand"
import { motion } from "framer-motion"

interface DealerAreaProps {
  dealer: Hand
  hideHoleCard?: boolean
}

export function DealerArea({ dealer, hideHoleCard = false }: DealerAreaProps) {
  const hasBlackjack = isBlackjack(dealer.cards)
  const isBust = isBusted(dealer.cards)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-6 text-center"
    >
      <h2 className="text-foreground text-xl font-bold mb-4 flex items-center justify-center gap-2">
        <span>Croupier</span>
        {hasBlackjack && (
          <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
            Blackjack !
          </div>
        )}
        {isBust && (
          <div className="inline-block bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
            Bust
          </div>
        )}
      </h2>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {dealer.cards.map((card, index) => (
          <Card key={index} card={card} hidden={hideHoleCard && index === 1} index={index} />
        ))}
      </div>

      <div className="text-foreground text-lg font-semibold">
        {dealer.cards.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-xl">
              Total:{" "}
              {hideHoleCard && dealer.cards.length > 1 && !dealer.finished
                ? getHandDisplay([dealer.cards[0]]) + " + ?"
                : getHandDisplay(dealer.cards)}
            </div>

            {dealer.finished && (
              <div className="text-sm text-muted-foreground">
                {isBust ? "Le croupier dépasse" : hasBlackjack ? "Blackjack croupier" : "Croupier reste"}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
