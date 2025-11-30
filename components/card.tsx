"use client"

import type { Card as CardType } from "@/lib/types"
import { CardSvg } from "@/components/card-svg"

interface CardProps {
  card: CardType
  hidden?: boolean
  index?: number
  isDealing?: boolean
  onAnimationComplete?: () => void
  shouldFlip?: boolean
  onClick?: () => void
}

export function Card({ card, hidden = false, index = 0, isDealing = false, onAnimationComplete, shouldFlip = false, onClick }: CardProps) {
  // La carte est face cachée si elle est explicitement cachée (hidden=true)
  const isFaceDown = hidden
  
  return (
    <div
      className="transform-gpu relative"
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div
        className={`w-16 h-24 rounded-lg shadow-xl border-2 transition-all duration-300 ease-out transform-gpu hover:scale-105 hover:-translate-y-1 ${
          isFaceDown
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600/50 shadow-slate-900/50' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/30 shadow-gray-900/20'
        } ${onClick ? 'cursor-pointer' : ''}`}
        style={{
          transform: isFaceDown ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out'
        }}
        onClick={onClick}
      >
        {isFaceDown ? (
          // Carte cachée avec design simple
          <div className="w-full h-full flex items-center justify-center p-2">
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600/50 flex items-center justify-center">
              <div className="w-8 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded border border-slate-500/50 flex items-center justify-center">
                <div className="w-4 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded border border-slate-400/50"></div>
              </div>
            </div>
          </div>
        ) : (
          // Carte visible
          <CardSvg 
            rank={card.rank} 
            suit={card.suit} 
            faceDown={false} 
            className="w-full h-full rounded-lg" 
          />
        )}
      </div>
    </div>
  )
}
