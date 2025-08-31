"use client"

import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useShoe } from "@/store/useShoe"
import { BookOpen, Filter } from "lucide-react"

interface StrategyTableProps {
  dealerStandsOnSoft17: boolean
  doubleRule: "9-11" | "10-11" | "any"
  allowDAS: boolean
}

const getHardTotalStrategy = (playerTotal: number, dealerUpCard: string, rules: StrategyTableProps): string => {
  const dealerValue =
    dealerUpCard === "A"
      ? 11
      : dealerUpCard === "T" || dealerUpCard === "J" || dealerUpCard === "Q" || dealerUpCard === "K"
        ? 10
        : Number.parseInt(dealerUpCard)

  if (playerTotal <= 8) return "T"
  if (playerTotal === 9) {
    if (rules.doubleRule === "any" || rules.doubleRule === "9-11") {
      return dealerValue >= 3 && dealerValue <= 6 ? "D" : "T"
    }
    return "T"
  }
  if (playerTotal === 10) {
    if (rules.doubleRule === "any" || rules.doubleRule === "9-11" || rules.doubleRule === "10-11") {
      return dealerValue >= 2 && dealerValue <= 9 ? "D" : "T"
    }
    return "T"
  }
  if (playerTotal === 11) {
    if (rules.doubleRule === "any" || rules.doubleRule === "9-11" || rules.doubleRule === "10-11") {
      return dealerValue >= 2 && dealerValue <= 10 ? "D" : "T"
    }
    return "T"
  }
  if (playerTotal === 12) return dealerValue >= 4 && dealerValue <= 6 ? "R" : "T"
  if (playerTotal >= 13 && playerTotal <= 16) return dealerValue >= 2 && dealerValue <= 6 ? "R" : "T"
  return "R"
}

const getSoftTotalStrategy = (playerTotal: number, dealerUpCard: string, rules: StrategyTableProps): string => {
  const dealerValue =
    dealerUpCard === "A"
      ? 11
      : dealerUpCard === "T" || dealerUpCard === "J" || dealerUpCard === "Q" || dealerUpCard === "K"
        ? 10
        : Number.parseInt(dealerUpCard)

  if (playerTotal <= 13) return "T"
  if (playerTotal === 14 || playerTotal === 15) return dealerValue === 5 || dealerValue === 6 ? "D" : "T"
  if (playerTotal === 16 || playerTotal === 17) return dealerValue >= 4 && dealerValue <= 6 ? "D" : "T"
  if (playerTotal === 18) {
    if (dealerValue >= 3 && dealerValue <= 6) return "D"
    if (dealerValue >= 9 || dealerValue === 11) return "T"
    return "R"
  }
  return "R"
}

const getPairStrategy = (pairRank: string, dealerUpCard: string, rules: StrategyTableProps): string => {
  const dealerValue =
    dealerUpCard === "A"
      ? 11
      : dealerUpCard === "T" || dealerUpCard === "J" || dealerUpCard === "Q" || dealerUpCard === "K"
        ? 10
        : Number.parseInt(dealerUpCard)

  if (pairRank === "A" || pairRank === "8") return "DIV"
  if (pairRank === "T" || pairRank === "J" || pairRank === "Q" || pairRank === "K" || pairRank === "5") return "R"
  if (pairRank === "9") return dealerValue === 7 || dealerValue >= 10 ? "R" : "DIV"
  if (pairRank === "7") return dealerValue >= 2 && dealerValue <= 7 ? "DIV" : "T"
  if (pairRank === "6") return dealerValue >= 2 && dealerValue <= 6 ? "DIV" : "T"
  if (pairRank === "4") return dealerValue === 5 || dealerValue === 6 ? "DIV" : "T"
  if (pairRank === "3" || pairRank === "2") return dealerValue >= 2 && dealerValue <= 7 ? "DIV" : "T"
  return "T"
}

export function StrategyDrawer() {
  const { rules } = useShoe()
  const [open, setOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [localRules, setLocalRules] = useState({
    dealerStandsOnSoft17: rules.dealerStandsOnSoft17,
    doubleRule: rules.doubleRule,
    allowDAS: rules.allowDAS,
  })

  const dealerCards = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "A"]
  const hardTotals = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  const softTotals = [13, 14, 15, 16, 17, 18, 19, 20, 21]
  const pairs = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T"]

  const getActionColor = (action: string) => {
    switch (action) {
      case "R":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "T":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "D":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "DIV":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "R":
        return "Rester"
      case "T":
        return "Tirer"
      case "D":
        return "Doubler"
      case "DIV":
        return "Diviser"
      default:
        return action
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="border-accent/50 hover:border-accent bg-transparent">
          <BookOpen className="w-4 h-4 mr-2" />
          Stratégie de base
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] bg-card/95 backdrop-blur-sm border-primary/20">
        <DrawerHeader>
          <DrawerTitle className="text-center text-foreground">Tableau de Stratégie de Base</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Legend */}
          <Card className="p-4 bg-secondary/10 border-secondary/20">
            <h4 className="font-bold mb-3 text-foreground">Légende</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge className={getActionColor("R")}>R = Rester</Badge>
              <Badge className={getActionColor("T")}>T = Tirer</Badge>
              <Badge className={getActionColor("D")}>D = Doubler</Badge>
              <Badge className={getActionColor("DIV")}>DIV = Diviser</Badge>
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-4 bg-accent/10 border-accent/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground">Règles</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-accent hover:text-accent/80"
              >
                <Filter className="w-4 h-4 mr-1" />
                {showFilters ? "Masquer" : "Modifier"}
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Croupier reste sur Soft 17</span>
                  <Switch
                    checked={localRules.dealerStandsOnSoft17}
                    onCheckedChange={(checked) => setLocalRules((prev) => ({ ...prev, dealerStandsOnSoft17: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Double après séparation</span>
                  <Switch
                    checked={localRules.allowDAS}
                    onCheckedChange={(checked) => setLocalRules((prev) => ({ ...prev, allowDAS: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Règle de double</span>
                  <div className="flex gap-2">
                    {(["9-11", "10-11", "any"] as const).map((rule) => (
                      <Button
                        key={rule}
                        variant={localRules.doubleRule === rule ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocalRules((prev) => ({ ...prev, doubleRule: rule }))}
                        className="text-xs"
                      >
                        {rule === "any" ? "Toutes" : rule}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Hard Totals */}
          <Card className="p-4 bg-card/50 border-primary/20">
            <h4 className="font-bold mb-3 text-foreground">Totaux Durs</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-muted-foreground">Joueur</th>
                    {dealerCards.map((card) => (
                      <th key={card} className="p-1 text-center text-muted-foreground">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hardTotals.map((total) => (
                    <tr key={total}>
                      <td className="p-1 font-mono font-bold text-foreground">{total}</td>
                      {dealerCards.map((dealerCard) => {
                        const action = getHardTotalStrategy(total, dealerCard, localRules)
                        return (
                          <td key={dealerCard} className="p-1 text-center">
                            <div className={`px-1 py-0.5 rounded text-xs font-bold border ${getActionColor(action)}`}>
                              {action}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Soft Totals */}
          <Card className="p-4 bg-card/50 border-primary/20">
            <h4 className="font-bold mb-3 text-foreground">Totaux Souples</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-muted-foreground">Joueur</th>
                    {dealerCards.map((card) => (
                      <th key={card} className="p-1 text-center text-muted-foreground">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {softTotals.map((total) => (
                    <tr key={total}>
                      <td className="p-1 font-mono font-bold text-foreground">A,{total - 11}</td>
                      {dealerCards.map((dealerCard) => {
                        const action = getSoftTotalStrategy(total, dealerCard, localRules)
                        return (
                          <td key={dealerCard} className="p-1 text-center">
                            <div className={`px-1 py-0.5 rounded text-xs font-bold border ${getActionColor(action)}`}>
                              {action}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pairs */}
          <Card className="p-4 bg-card/50 border-primary/20">
            <h4 className="font-bold mb-3 text-foreground">Paires</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-left text-muted-foreground">Paire</th>
                    {dealerCards.map((card) => (
                      <th key={card} className="p-1 text-center text-muted-foreground">
                        {card}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pairs.map((pair) => (
                    <tr key={pair}>
                      <td className="p-1 font-mono font-bold text-foreground">
                        {pair},{pair}
                      </td>
                      {dealerCards.map((dealerCard) => {
                        const action = getPairStrategy(pair, dealerCard, localRules)
                        return (
                          <td key={dealerCard} className="p-1 text-center">
                            <div className={`px-1 py-0.5 rounded text-xs font-bold border ${getActionColor(action)}`}>
                              {action}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
