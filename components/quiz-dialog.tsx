"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useShoe } from "@/store/useShoe"

interface QuizDialogProps {
  open: boolean
  onClose: () => void
}

export function QuizDialog({ open, onClose }: QuizDialogProps) {
  const { running, trueCount, recordQuiz } = useShoe()
  const [inputRunning, setInputRunning] = useState("")
  const [inputTrue, setInputTrue] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    runningCorrect: boolean
    trueCorrect: boolean
    runningDiff: number
    trueDiff: number
  } | null>(null)

  const handleSubmit = () => {
    const runningVal = Number.parseFloat(inputRunning) || 0
    const trueVal = Number.parseFloat(inputTrue) || 0
    const actualTrue = trueCount()

    const runningDiff = Math.abs(runningVal - running)
    const trueDiff = Math.abs(trueVal - actualTrue)

    const quizResults = {
      runningCorrect: runningDiff === 0,
      trueCorrect: trueDiff <= 0.5,
      runningDiff,
      trueDiff,
    }

    setResults(quizResults)
    setShowResults(true)
    recordQuiz(runningVal, trueVal)
  }

  const handleClose = () => {
    setInputRunning("")
    setInputTrue("")
    setShowResults(false)
    setResults(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">Quiz Comptage Hi-Lo</DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">Quel est votre comptage actuel ?</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Running Count</label>
                <Input
                  type="number"
                  value={inputRunning}
                  onChange={(e) => setInputRunning(e.target.value)}
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">True Count</label>
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

            <div className="flex gap-3 justify-center">
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                Valider
              </Button>
              <Button onClick={handleClose} variant="outline">
                Passer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-bold text-foreground mb-2">Résultats</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Running Count:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{running}</span>
                    <Badge variant={results?.runningCorrect ? "default" : "destructive"}>
                      {results?.runningCorrect ? "✅ Correct" : `❌ Écart ${results?.runningDiff}`}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">True Count:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{trueCount().toFixed(1)}</span>
                    <Badge
                      variant={
                        results?.trueCorrect
                          ? "default"
                          : results?.trueDiff && results.trueDiff <= 0.5
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {results?.trueCorrect
                        ? "✅ Correct"
                        : results?.trueDiff && results.trueDiff <= 0.5
                          ? "±0,5 OK"
                          : `❌ Écart ${results?.trueDiff.toFixed(1)}`}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
              Continuer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
