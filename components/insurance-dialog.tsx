"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useShoe } from "@/store/useShoe"

interface InsuranceDialogProps {
  open: boolean
  seatIndex: number
  onDecision: (seatIndex: number, takeInsurance: boolean) => void
}

export function InsuranceDialog({ open, seatIndex, onDecision }: InsuranceDialogProps) {
  const { ui } = useShoe()
  const [isDeciding, setIsDeciding] = useState(false)

  const handleDecision = async (takeInsurance: boolean) => {
    setIsDeciding(true)
    await new Promise((resolve) => setTimeout(resolve, 200))
    onDecision(seatIndex, takeInsurance)
    setIsDeciding(false)
  }

  const insuranceCost = ui.baseBet / 2

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">Assurance - Siège {seatIndex + 1}</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Le croupier montre un As. Voulez-vous prendre l'assurance ?</p>

          <div className="bg-secondary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Coût de l'assurance :</p>
            <p className="text-lg font-bold text-accent">{insuranceCost}€</p>
            <p className="text-xs text-muted-foreground">(Paiement 2:1 si le croupier a Blackjack)</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => handleDecision(true)}
              disabled={isDeciding || ui.bankroll < insuranceCost}
              className="bg-primary hover:bg-primary/90"
            >
              Prendre l'assurance
            </Button>
            <Button
              onClick={() => handleDecision(false)}
              disabled={isDeciding}
              variant="outline"
              className="border-accent/50 hover:border-accent"
            >
              Refuser
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
