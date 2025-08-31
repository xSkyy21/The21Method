"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useShoe } from "@/store/useShoe"

export function SeatSelector() {
  const { rules, updateRules, phase } = useShoe()

  const handleSeatChange = (seats: number) => {
    if (phase === "INIT" || phase === "END") {
      updateRules({ seats })
    }
  }

  const isDisabled = phase !== "INIT" && phase !== "END"

  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
      <div className="space-y-3">
        <h3 className="text-foreground font-bold text-center">Nombre de sièges</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 4].map((seatCount) => (
            <Button
              key={seatCount}
              onClick={() => handleSeatChange(seatCount)}
              disabled={isDisabled}
              variant={rules.seats === seatCount ? "default" : "outline"}
              className={
                rules.seats === seatCount
                  ? "bg-primary hover:bg-primary/90"
                  : "border-accent/50 hover:border-accent bg-transparent"
              }
              size="sm"
            >
              {seatCount}
            </Button>
          ))}
        </div>
        {isDisabled && (
          <p className="text-xs text-muted-foreground text-center">Changement possible uniquement entre les mains</p>
        )}
        <p className="text-xs text-muted-foreground text-center">Maximum 4 sièges pour une expérience optimale</p>
      </div>
    </Card>
  )
}
