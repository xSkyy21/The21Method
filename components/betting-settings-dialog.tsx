"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { useShoe } from "@/store/useShoe"
import { useToast } from "@/hooks/use-toast"

interface BettingSettingsDialogProps {
  children: React.ReactNode
}

export function BettingSettingsDialog({ children }: BettingSettingsDialogProps) {
  const { ui, rules, phase, updateSettings } = useShoe()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [bankroll, setBankroll] = useState(ui.bankroll.toString())
  const [baseBet, setBaseBet] = useState(ui.baseBet.toString())
  const [seatOverrides, setSeatOverrides] = useState<{ [key: number]: string }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const presetBets = [5, 10, 25, 50, 100]
  const isGameActive = phase === "PLAYER" || phase === "DEALER" || phase === "DEAL"

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const bankrollValue = Number.parseFloat(bankroll)
    const baseBetValue = Number.parseFloat(baseBet)

    if (isNaN(bankrollValue) || bankrollValue <= 0) {
      newErrors.bankroll = "Bankroll invalide"
    }

    if (isNaN(baseBetValue) || baseBetValue <= 0) {
      newErrors.baseBet = "Mise invalide"
    } else if (baseBetValue > bankrollValue) {
      newErrors.baseBet = "Mise > bankroll"
    }

    // Validate seat overrides
    Object.entries(seatOverrides).forEach(([seatIndex, value]) => {
      if (value.trim()) {
        const overrideValue = Number.parseFloat(value)
        if (isNaN(overrideValue) || overrideValue <= 0) {
          newErrors[`seat-${seatIndex}`] = "Mise invalide"
        } else if (overrideValue > bankrollValue) {
          newErrors[`seat-${seatIndex}`] = "Mise > bankroll"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (isGameActive) {
      toast({
        title: "Modification bloquée",
        description: "Impossible de modifier les mises pendant une partie",
        variant: "destructive",
      })
      return
    }

    if (validateForm()) {
      const newBankroll = Number.parseFloat(bankroll)
      const newBaseBet = Number.parseFloat(baseBet)

      // Process seat overrides
      const processedOverrides: { [key: number]: number } = {}
      Object.entries(seatOverrides).forEach(([seatIndex, value]) => {
        if (value.trim()) {
          const overrideValue = Number.parseFloat(value)
          if (!isNaN(overrideValue) && overrideValue > 0) {
            processedOverrides[Number.parseInt(seatIndex)] = overrideValue
          }
        }
      })

      updateSettings({
        bankroll: newBankroll,
        baseBet: newBaseBet,
        seatBetOverrides: processedOverrides,
      })

      toast({
        title: "Paramètres sauvegardés",
        description: "Les nouvelles mises seront appliquées à la prochaine main",
      })

      setOpen(false)
    }
  }

  const handlePresetBet = (amount: number) => {
    setBaseBet(amount.toString())
    setErrors({})
  }

  const handleSeatOverride = (seatIndex: number, value: string) => {
    setSeatOverrides((prev) => ({
      ...prev,
      [seatIndex]: value,
    }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[`seat-${seatIndex}`]
      return newErrors
    })
  }

  const calculateRecommendedBet = () => {
    const bankrollValue = Number.parseFloat(bankroll)
    if (isNaN(bankrollValue)) return 0
    return Math.floor(bankrollValue * 0.02) // 2% of bankroll
  }

  const getBankrollStatus = () => {
    const current = ui.bankroll
    const initial = 25000 // Default starting bankroll
    const percentage = ((current - initial) / initial) * 100

    if (percentage > 10) return { status: "profit", color: "text-green-400", icon: TrendingUp }
    if (percentage < -20) return { status: "danger", color: "text-red-400", icon: AlertCircle }
    return { status: "stable", color: "text-yellow-400", icon: DollarSign }
  }

  const bankrollStatus = getBankrollStatus()
  const StatusIcon = bankrollStatus.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-sm border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Mises & Bankroll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bankroll Status */}
          <Card className="webazio-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <StatusIcon className={`h-4 w-4 ${bankrollStatus.color}`} />
                État de la bankroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{ui.bankroll.toLocaleString()}€</p>
                  <p className="text-sm text-muted-foreground">Bankroll actuelle</p>
                </div>
                <Badge
                  variant={
                    bankrollStatus.status === "profit"
                      ? "default"
                      : bankrollStatus.status === "danger"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {bankrollStatus.status === "profit"
                    ? "Bénéfice"
                    : bankrollStatus.status === "danger"
                      ? "Attention"
                      : "Stable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bankroll Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankroll" className="text-foreground font-medium">
                Nouvelle bankroll (€)
              </Label>
              <Input
                id="bankroll"
                type="number"
                value={bankroll}
                onChange={(e) => setBankroll(e.target.value)}
                className={`bg-background/50 ${errors.bankroll ? "border-destructive" : ""}`}
                disabled={isGameActive}
              />
              {errors.bankroll && <p className="text-xs text-destructive">{errors.bankroll}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseBet" className="text-foreground font-medium">
                Mise globale (€)
              </Label>
              <div className="space-y-3">
                <Input
                  id="baseBet"
                  type="number"
                  value={baseBet}
                  onChange={(e) => setBaseBet(e.target.value)}
                  className={`bg-background/50 ${errors.baseBet ? "border-destructive" : ""}`}
                  disabled={isGameActive}
                />
                {errors.baseBet && <p className="text-xs text-destructive">{errors.baseBet}</p>}

                <div className="flex flex-wrap gap-2">
                  {presetBets.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handlePresetBet(amount)}
                      variant="outline"
                      size="sm"
                      className="webazio-button-secondary text-xs"
                      disabled={isGameActive}
                    >
                      {amount}€
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePresetBet(calculateRecommendedBet())}
                    variant="outline"
                    size="sm"
                    className="webazio-accent-button text-xs"
                    disabled={isGameActive}
                  >
                    Recommandé ({calculateRecommendedBet()}€)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seat Overrides */}
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground font-medium mb-2">Mises par siège (optionnel)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Personnalisez la mise pour chaque siège. Laissez vide pour utiliser la mise globale.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: rules.seats }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`seat-${index}`} className="text-sm text-muted-foreground">
                    Siège {index + 1}
                  </Label>
                  <Input
                    id={`seat-${index}`}
                    type="number"
                    placeholder={`${ui.baseBet}€`}
                    value={seatOverrides[index] || ""}
                    onChange={(e) => handleSeatOverride(index, e.target.value)}
                    className={`bg-background/50 text-sm ${errors[`seat-${index}`] ? "border-destructive" : ""}`}
                    disabled={isGameActive}
                  />
                  {errors[`seat-${index}`] && <p className="text-xs text-destructive">{errors[`seat-${index}`]}</p>}
                </div>
              ))}
            </div>
          </div>

          {isGameActive && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Modifications bloquées pendant une partie en cours</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 webazio-button-primary" disabled={isGameActive}>
              Sauvegarder
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline" className="webazio-button-secondary">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
