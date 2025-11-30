"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BettingSettingsDialog } from "@/components/betting-settings-dialog"
import { Settings, Play, RotateCcw } from "lucide-react"

interface MobileActionsProps {
  phase: string
  onNewHand: () => void
  onNewShoe: () => void
}

export function MobileActions({ phase, onNewHand, onNewShoe }: MobileActionsProps) {
  return (
    <div className="md:hidden">
      <Card className="casino-card p-4">
        <div className="space-y-3">
          {/* Boutons principaux */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onNewHand}
              disabled={phase === "DEAL" || phase === "PLAYER" || phase === "DEALER"}
              className="casino-button-gold py-3 px-4 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              {phase === "INIT" ? "Commencer" : "Nouvelle main"}
            </Button>

            <Button
              onClick={onNewShoe}
              className="casino-button-red py-3 px-4 font-bold text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Nouveau sabot
            </Button>
          </div>

          {/* Paramètres */}
          <div className="flex justify-center">
            <BettingSettingsDialog>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-yellow-500/20 hover:text-yellow-400"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </BettingSettingsDialog>
          </div>
        </div>
      </Card>
    </div>
  )
}
