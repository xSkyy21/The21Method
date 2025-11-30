"use client"

import { useShoe } from "@/store/useShoe"
import { Card } from "@/components/ui/card"
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Calculator,
  Eye,
  EyeOff
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MobileStats() {
  const { 
    bankroll, 
    exposure, 
    available, 
    running, 
    myRunning, 
    myTrue, 
    ui, 
    updateSettings 
  } = useShoe()
  const [showDetails, setShowDetails] = useState(false)

  const toggleShowRunning = () => {
    updateSettings({ showRunning: !ui.showRunning })
  }

  const toggleShowTrue = () => {
    updateSettings({ showTrue: !ui.showTrue })
  }

  const toggleShowMyCount = () => {
    updateSettings({ showMyCount: !ui.showMyCount })
  }

  return (
    <div className="md:hidden space-y-3">
      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="casino-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Banque</div>
              <div className="text-sm font-bold text-white casino-neon-gold">
                {bankroll.toLocaleString()}€
              </div>
            </div>
          </div>
        </Card>

        <Card className="casino-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Disponible</div>
              <div className="text-sm font-bold text-white casino-neon-green">
                {available().toLocaleString()}€
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats secondaires */}
      <Card className="casino-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Exposition</div>
              <div className="text-sm font-bold text-white casino-neon-red">
                {exposure.toLocaleString()}€
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Détails du comptage */}
      {showDetails && (
        <Card className="casino-card p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Comptage Hi-Lo</div>
                  <div className="text-sm font-bold text-white">
                    {ui.showRunning ? running : '***'}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                onClick={toggleShowRunning}
              >
                {ui.showRunning ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>

            {ui.showMyCount && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Mon comptage</div>
                    <div className="text-sm font-bold text-white">
                      {myRunning !== undefined ? myRunning : 'Non défini'}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  onClick={toggleShowMyCount}
                >
                  <EyeOff className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
