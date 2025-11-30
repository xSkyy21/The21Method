"use client"

import type { Seat } from "@/lib/types"
import { Card } from "./card"
import { getHandDisplay, isBlackjack, isBusted } from "@/lib/hand"

interface SeatCardProps {
  seat: Seat
  isActive?: boolean
  activeHandIndex?: number
  dealingCards?: Set<string>
  isDealing?: boolean
  onCardClick?: (card: any) => void
  showBasicStrategy?: boolean
  getBasicStrategyAdvice?: (playerCards: any[], dealerUpCard: any) => string | null
  hideBet?: boolean
  learningMode?: 'counting' | 'practice'
}

export function SeatCard({ seat, isActive = false, activeHandIndex = 0, dealingCards = new Set(), isDealing = false, onCardClick, showBasicStrategy = false, getBasicStrategyAdvice, hideBet = false, learningMode }: SeatCardProps) {
  const shouldHideBet = hideBet || learningMode === 'counting'
  return (
    <div
      className={`casino-card rounded-2xl p-4 min-h-[200px] transition-all duration-300 ${
        isActive 
          ? "border-yellow-500/60 shadow-2xl shadow-yellow-500/25 ring-2 ring-yellow-500/20 jackpot-effect" 
          : "border-yellow-500/30"
      }`}
    >
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg casino-neon-gold text-yellow-400">
          Siège {seat.id + 1}
        </h3>
      </div>

      <div className="space-y-4">
        {seat.hands.map((hand, handIndex) => {
          const hasBlackjack = isBlackjack(hand.cards)
          const isBust = isBusted(hand.cards)

          return (
            <div
              key={hand.id}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                isActive && handIndex === activeHandIndex
                  ? "bg-gradient-to-br from-yellow-500/20 to-red-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/25"
                  : "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-yellow-500/30"
              }`}
            >
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {hand.cards.map((card, cardIndex) => {
                  const cardId = `player-${seat.id}-${cardIndex}`
                  const isCardDealing = dealingCards.has(cardId)
                  
                  return (
                    <Card 
                      key={`seat-${seat.id}-hand-${handIndex}-card-${cardIndex}-${card.rank}-${card.suit}`} 
                      card={card} 
                      index={cardIndex}
                      isDealing={isCardDealing}
                      onClick={onCardClick ? () => onCardClick(card) : undefined}
                    />
                  )
                })}
              </div>

              <div className="text-center text-sm space-y-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="font-bold text-white text-lg casino-neon-gold text-yellow-400">
                    {getHandDisplay(hand.cards)}
                  </div>

                  {/* Status badges */}
                  {hasBlackjack && (
                    <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-green-500/25">
                      🎉 Blackjack !
                    </div>
                  )}
                  {isBust && (
                    <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/25">
                      💥 Bust
                    </div>
                  )}
                  {hand.finished && !hasBlackjack && !isBust && (
                    <div className="inline-block bg-gradient-to-r from-slate-600 to-slate-700 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✋ Terminé
                    </div>
                  )}
                </div>

                {!shouldHideBet && (
                  <>
                    <div className="text-yellow-400 font-semibold casino-neon-gold">💰 Mise: {hand.bet}€</div>
                    {hand.insuranceBet && <div className="text-red-400 font-semibold casino-neon-red">🛡️ Assurance: {hand.insuranceBet}€</div>}
                  </>
                )}
                
                {/* Affichage de la stratégie de base */}
                {showBasicStrategy && getBasicStrategyAdvice && hand.cards.length > 0 && !hand.finished && (
                  <div className="mt-2 p-2 bg-casino-gold/20 border border-casino-gold/30 rounded-lg">
                    <div className="text-casino-gold text-xs font-medium mb-1">💡 Conseil stratégie de base:</div>
                    <div className="text-casino-gold-light text-sm font-semibold">
                      {getBasicStrategyAdvice(hand.cards, { rank: 'A' }) || 'Analyser...'}
                    </div>
                  </div>
                )}

                {!shouldHideBet && hand.result && (
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
    </div>
  )
}
