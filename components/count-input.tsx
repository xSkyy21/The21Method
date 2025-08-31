"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useShoe } from "@/store/useShoe"
import type { CountAccuracy } from "@/lib/types"

export function CountInput() {
  const { running, trueCount, myRunning, myTrue, setMyCount, ui } = useShoe()
  const [inputRunning, setInputRunning] = useState("")
  const [inputTrue, setInputTrue] = useState("")

  if (!ui.showMyCount) return null

  const handleSubmit = () => {
    const runningVal = inputRunning ? Number.parseFloat(inputRunning) : undefined
    const trueVal = inputTrue ? Number.parseFloat(inputTrue) : undefined
    setMyCount(runningVal, trueVal)
    setInputRunning("")
    setInputTrue("")
  }

  const getAccuracy = (): CountAccuracy => {
    const actualTrue = trueCount()
    const runningDiff = myRunning !== undefined ? Math.abs(myRunning - running) : 0
    const trueDiff = myTrue !== undefined ? Math.abs(myTrue - actualTrue) : 0

    return {
      runningCorrect: myRunning !== undefined && runningDiff === 0,
      trueCorrect: myTrue !== undefined && trueDiff <= 0.5,
      runningDiff,
      trueDiff,
    }
  }

  const accuracy = getAccuracy()

  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        <h3 className="text-foreground font-bold text-center">Mon Comptage</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Running</label>
            <Input
              type="number"
              value={inputRunning}
              onChange={(e) => setInputRunning(e.target.value)}
              placeholder="0"
              className="bg-background/50"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">True</label>
            <Input
              type="number"
              step="0.5"
              value={inputTrue}
              onChange={(e) => setInputTrue(e.target.value)}
              placeholder="0.0"
              className="bg-background/50"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
          Valider
        </Button>

        {(myRunning !== undefined || myTrue !== undefined) && (
          <div className="space-y-2">
            <div className="text-center text-sm text-muted-foreground">Précision</div>
            <div className="flex gap-2 justify-center">
              {myRunning !== undefined && (
                <Badge variant={accuracy.runningCorrect ? "default" : "destructive"}>
                  Running: {accuracy.runningCorrect ? "✅ Correct" : `❌ Écart ${accuracy.runningDiff}`}
                </Badge>
              )}
              {myTrue !== undefined && (
                <Badge
                  variant={accuracy.trueCorrect ? "default" : accuracy.trueDiff <= 0.5 ? "secondary" : "destructive"}
                >
                  True:{" "}
                  {accuracy.trueCorrect
                    ? "✅ Correct"
                    : accuracy.trueDiff <= 0.5
                      ? "±0,5 OK"
                      : `❌ Écart ${accuracy.trueDiff.toFixed(1)}`}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
