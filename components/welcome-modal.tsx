"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useShoe } from "@/store/useShoe"

interface WelcomeModalProps {
  open: boolean
  onComplete: () => void
}

export function WelcomeModal({ open, onComplete }: WelcomeModalProps) {
  const { ui, updateSettings } = useShoe()
  const [playerName, setPlayerName] = useState(ui.playerName || "")
  const [bankroll, setBankroll] = useState(ui.bankroll.toString())
  const [baseBet, setBaseBet] = useState(ui.baseBet.toString())
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!playerName.trim()) {
      newErrors.playerName = "Le pseudo est obligatoire"
    }

    const bankrollValue = Number.parseFloat(bankroll)
    if (isNaN(bankrollValue) || bankrollValue <= 0) {
      newErrors.bankroll = "La bankroll doit être un nombre positif"
    }

    const baseBetValue = Number.parseFloat(baseBet)
    if (isNaN(baseBetValue) || baseBetValue <= 0) {
      newErrors.baseBet = "La mise doit être un nombre positif"
    } else if (baseBetValue > bankrollValue) {
      newErrors.baseBet = "La mise ne peut pas dépasser la bankroll"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      updateSettings({
        playerName: playerName.trim(),
        bankroll: Number.parseFloat(bankroll),
        baseBet: Number.parseFloat(baseBet),
      })
      onComplete()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground text-xl">
            Bienvenue au Blackjack Trainer Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 bg-secondary/10 border-secondary/20">
            <p className="text-sm text-muted-foreground text-center">
              Configurez votre profil de joueur pour commencer l'entraînement au comptage Hi-Lo
            </p>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-foreground">
                Pseudo *
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Votre pseudo"
                className={`bg-background/50 ${errors.playerName ? "border-destructive" : ""}`}
              />
              {errors.playerName && <p className="text-xs text-destructive">{errors.playerName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankroll" className="text-foreground">
                  Bankroll (€) *
                </Label>
                <Input
                  id="bankroll"
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="25000"
                  className={`bg-background/50 ${errors.bankroll ? "border-destructive" : ""}`}
                />
                {errors.bankroll && <p className="text-xs text-destructive">{errors.bankroll}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseBet" className="text-foreground">
                  Mise par siège (€) *
                </Label>
                <Input
                  id="baseBet"
                  type="number"
                  value={baseBet}
                  onChange={(e) => setBaseBet(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="10"
                  className={`bg-background/50 ${errors.baseBet ? "border-destructive" : ""}`}
                />
                {errors.baseBet && <p className="text-xs text-destructive">{errors.baseBet}</p>}
              </div>
            </div>
          </div>

          <Card className="p-3 bg-accent/10 border-accent/20">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Bankroll par défaut : 25 000 €</p>
              <p>• Mise recommandée : 1-2% de la bankroll</p>
              <p>• Vous pourrez modifier ces paramètres plus tard</p>
            </div>
          </Card>

          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-lg py-3">
            Commencer l'entraînement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
