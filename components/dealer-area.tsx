"use client"

import type { Hand } from "@/lib/types"
import { Card } from "./card"
import { getHandDisplay, isBlackjack, isBusted } from "@/lib/hand"

interface DealerAreaProps {
  dealer: Hand
  hideHoleCard?: boolean
  dealingCards?: Set<string>
  isDealing?: boolean
  phase?: string
  onCardClick?: (card: any) => void
}

export function DealerArea({ dealer, hideHoleCard = false, dealingCards = new Set(), isDealing = false, phase, onCardClick }: DealerAreaProps) {
  const hasBlackjack = isBlackjack(dealer.cards)
  const isBust = isBusted(dealer.cards)
  
  // RÈGLE FRANÇAISE : La deuxième carte du croupier est cachée sauf si :
  // 1. La phase est "END" (fin de main - tous les joueurs ont fini)
  // 2. La phase est "DEALER" (le croupier joue - révèle sa carte cachée)
  // 3. La phase est "INIT" (début de partie - pas encore de cartes)
  const shouldShowHoleCard = phase === "END" || phase === "DEALER" || phase === "INIT"
  
  return (
    <div className="casino-table p-6 text-center">
      <h2 className="text-white text-2xl font-bold mb-6 flex items-center justify-center gap-3">
        <span className="casino-neon-gold text-yellow-400">
          Croupier
        </span>
        {hasBlackjack && shouldShowHoleCard && (
          <div className="inline-block casino-celebration bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-500/25">
            🎉 Blackjack !
          </div>
        )}
        {isBust && shouldShowHoleCard && (
          <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-red-500/25">
            💥 Bust
          </div>
        )}
      </h2>

      <div className="flex gap-3 justify-center mb-6 overflow-hidden">
        {dealer.cards.map((card, index) => {
          const cardId = `dealer-${index}`
          const isCardDealing = dealingCards.has(cardId)
          
          return (
            <div 
              key={`dealer-card-${index}-${card.rank}-${card.suit}`}
              className="flex-shrink-0"
              style={{ 
                transform: `translateX(${index * 0}px)`,
                zIndex: index 
              }}
            >
              <Card 
                card={card} 
                hidden={!shouldShowHoleCard && index === 1} 
                index={index}
                isDealing={isCardDealing}
                shouldFlip={false}
                onClick={onCardClick ? () => onCardClick(card) : undefined}
              />
            </div>
          )
        })}
      </div>

      <div className="text-white text-lg font-semibold">
        {dealer.cards.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-2xl casino-neon-gold text-yellow-400 font-bold">
              Total:{" "}
              {!shouldShowHoleCard && dealer.cards.length > 1 && !dealer.finished
                ? getHandDisplay([dealer.cards[0]]) + " + ?"
                : getHandDisplay(dealer.cards)}
            </div>

            {dealer.finished && shouldShowHoleCard && (
              <div className="text-sm text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full">
                {isBust ? "💥 Le croupier dépasse" : hasBlackjack ? "🎉 Blackjack croupier" : "✋ Croupier reste"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
