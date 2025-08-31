"use client"

import { useEffect } from "react"
import { sfx } from "@/lib/sfx"

export function AudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      sfx.enable(true)
      window.removeEventListener("pointerdown", unlock)
    }
    window.addEventListener("pointerdown", unlock, { once: true })
  }, [])

  return null
}
