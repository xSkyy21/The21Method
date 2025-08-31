"use client"

import type React from "react"

import { motion } from "framer-motion"

interface CardSvgProps {
  rank: string
  suit: "S" | "H" | "D" | "C"
  faceDown?: boolean
  className?: string
  style?: React.CSSProperties
}

const suitSymbols = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
}

const suitColors = {
  S: "#000000",
  H: "#DC2626",
  D: "#DC2626",
  C: "#000000",
}

export function CardSvg({ rank, suit, faceDown = false, className = "", style }: CardSvgProps) {
  if (faceDown) {
    return (
      <motion.div
        className={`relative w-16 h-24 ${className}`}
        style={style}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 64 96" className="drop-shadow-md">
          {/* Card background */}
          <rect x="2" y="2" width="60" height="92" rx="6" ry="6" fill="#AA71F3" stroke="#564B64" strokeWidth="2" />

          {/* WebaZio pattern */}
          <defs>
            <pattern id="webazio-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="#22DFF2" opacity="0.3" />
            </pattern>
          </defs>
          <rect x="6" y="6" width="52" height="84" rx="3" fill="url(#webazio-pattern)" />

          {/* WebaZio logo text */}
          <text
            x="32"
            y="50"
            textAnchor="middle"
            fontSize="8"
            fill="#FFFFFF"
            fontWeight="bold"
            transform="rotate(-45 32 50)"
          >
            WebaZio
          </text>
        </svg>
      </motion.div>
    )
  }

  const displayRank = rank === "T" ? "10" : rank
  const suitSymbol = suitSymbols[suit]
  const suitColor = suitColors[suit]

  return (
    <motion.div
      className={`relative w-16 h-24 ${className}`}
      style={style}
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 64 96" className="drop-shadow-md">
        {/* Card background */}
        <rect x="2" y="2" width="60" height="92" rx="6" ry="6" fill="#FFFFFF" stroke="#564B64" strokeWidth="2" />

        {/* Top left rank and suit */}
        <text x="8" y="16" fontSize="12" fontWeight="bold" fill={suitColor} textAnchor="start">
          {displayRank}
        </text>
        <text x="8" y="28" fontSize="10" fill={suitColor} textAnchor="start">
          {suitSymbol}
        </text>

        {/* Center suit symbol */}
        <text x="32" y="55" fontSize="24" fill={suitColor} textAnchor="middle">
          {suitSymbol}
        </text>

        {/* Bottom right rank and suit (rotated) */}
        <text
          x="56"
          y="88"
          fontSize="12"
          fontWeight="bold"
          fill={suitColor}
          textAnchor="end"
          transform="rotate(180 56 88)"
        >
          {displayRank}
        </text>
        <text x="56" y="76" fontSize="10" fill={suitColor} textAnchor="end" transform="rotate(180 56 76)">
          {suitSymbol}
        </text>
      </svg>
    </motion.div>
  )
}
