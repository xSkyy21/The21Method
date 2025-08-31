"use client"

import type { Card as CardType } from "@/lib/types"
import { CardSvg } from "@/components/card-svg"
import { motion } from "framer-motion"

interface CardProps {
  card: CardType
  hidden?: boolean
  index?: number
}

export function Card({ card, hidden = false, index = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: Math.random() * 4 - 2 }}
      transition={{ delay: index * 0.1 }}
    >
      <CardSvg rank={card.rank} suit={card.suit} faceDown={hidden} className="drop-shadow-lg" />
    </motion.div>
  )
}
