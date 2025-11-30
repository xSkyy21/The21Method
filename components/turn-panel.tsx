"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useShoe } from "@/store/useShoe"
import { StrategyDrawer } from "@/components/strategy-drawer"
import { useEffect, useState } from "react"
import { Clock, User, Users, AlertTriangle, History, ChevronDown, ChevronUp } from "lucide-react"

export function TurnPanel() {
  const { currentTurn, turnDeadlineAt, phase, queue, seats, stand, ui } = useShoe()
  const [timeLeft, setTimeLeft] = useState(0)
  const [showFullTimeline, setShowFullTimeline] = useState(false)
  const [hasNewEvents, setHasNewEvents] = useState(false)
  const [lastEventCount, setLastEventCount] = useState(0)

  useEffect(() => {
    if (!turnDeadlineAt) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((turnDeadlineAt - now) / 1000))
      setTimeLeft(remaining)
    }, 100)

    return () => clearInterval(interval)
  }, [turnDeadlineAt])

  useEffect(() => {
    if (queue.length > lastEventCount) {
      setHasNewEvents(true)
      setLastEventCount(queue.length)
    }
  }, [queue.length, lastEventCount])

  const handleTimelineToggle = () => {
    setShowFullTimeline(!showFullTimeline)
    if (hasNewEvents) {
      setHasNewEvents(false)
    }
  }

  const getCurrentPlayerInfo = () => {
    if (phase === "DEALER") return "Tour du croupier"
    if (phase === "RESOLVE") return "Résolution des mains"
    if (phase === "END") return "Fin de la main"
    if (!currentTurn) return "En attente..."

    const seat = seats[currentTurn.seatIndex]
    const handLabel = seat.hands.length > 1 ? ` - Main ${currentTurn.handIndex + 1}` : ""
    return `Siège ${currentTurn.seatIndex + 1}${handLabel}`
  }

  const getNextPlayerInfo = () => {
    if (phase !== "PLAYER" || !currentTurn) return null

    const { seatIndex, handIndex } = currentTurn
    const currentSeat = seats[seatIndex]

    if (handIndex + 1 < currentSeat.hands.length) {
      const nextHand = currentSeat.hands[handIndex + 1]
      if (!nextHand.finished) {
        return `Siège ${seatIndex + 1} - Main ${handIndex + 2}`
      }
    }

    for (let nextSeatIndex = seatIndex + 1; nextSeatIndex < seats.length; nextSeatIndex++) {
      const nextSeat = seats[nextSeatIndex]
      for (let nextHandIndex = 0; nextHandIndex < nextSeat.hands.length; nextHandIndex++) {
        const nextHand = nextSeat.hands[nextHandIndex]
        if (!nextHand.finished) {
          const handLabel = nextSeat.hands.length > 1 ? ` - Main ${nextHandIndex + 1}` : ""
          return `Siège ${nextSeatIndex + 1}${handLabel}`
        }
      }
    }

    return "Croupier"
  }

  const progressPercentage = turnDeadlineAt ? Math.max(0, (timeLeft / ui.turnSeconds) * 100) : 0
  const isUrgent = timeLeft <= 10 && timeLeft > 0
  const isCritical = timeLeft <= 5 && timeLeft > 0

  const getTimerDisplay = () => {
    if (!turnDeadlineAt || phase !== "PLAYER" || !currentTurn) return null

    const circumference = 2 * Math.PI * 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-100 ${
              isCritical ? "text-destructive timer-urgent" : isUrgent ? "text-yellow-400" : "text-accent"
            }`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold text-xl ${
              isCritical ? "text-destructive" : isUrgent ? "text-yellow-400" : "text-accent"
            }`}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    )
  }

  const formatEventTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getEventPriority = (label: string) => {
    if (label.includes("Blackjack") || label.includes("dépasse")) return "high"
    if (label.includes("double") || label.includes("sépare")) return "medium"
    return "low"
  }

  const getEventBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const displayEvents = showFullTimeline ? queue.slice(-50) : queue.slice(-5)

  return (
    <Card className="webazio-card p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="hidden sm:inline">Tour & Timers</span>
          <span className="sm:hidden">Tour</span>
        </h3>

        <div className="space-y-2 sm:space-y-3">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Maintenant:
            </div>
            <div className="font-semibold text-foreground text-sm sm:text-base">{getCurrentPlayerInfo()}</div>
          </div>

          {phase === "PLAYER" && currentTurn && (
            <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Décision dans:</div>
              <div className="flex items-center justify-center scale-75 sm:scale-100">{getTimerDisplay()}</div>
              {isUrgent && (
                <div
                  className={`text-xs mt-2 font-medium text-center flex items-center justify-center gap-1 ${
                    isCritical ? "text-destructive animate-pulse" : "text-yellow-400"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {isCritical ? "URGENT !" : "Temps presque écoulé !"}
                </div>
              )}
            </div>
          )}

          {getNextPlayerInfo() && (
            <div className="p-2 sm:p-3 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                Ensuite:
              </div>
              <div className="font-semibold text-foreground text-sm sm:text-base">{getNextPlayerInfo()}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {phase === "PLAYER" && currentTurn && (
            <Button
              onClick={stand}
              variant="outline"
              size="sm"
              className="flex-1 webazio-button-secondary bg-transparent"
            >
              Passer (Rester)
            </Button>
          )}
          <StrategyDrawer />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
            <History className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            Timeline
            {queue.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {queue.length}
              </Badge>
            )}
          </h4>

          <Button
            onClick={handleTimelineToggle}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-primary/20"
          >
            {showFullTimeline ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Tout voir
                {hasNewEvents && <Badge className="ml-1 h-4 w-4 p-0 bg-accent text-accent-foreground text-xs">!</Badge>}
              </>
            )}
          </Button>
        </div>

        <div
          className={`space-y-1 overflow-y-auto text-xs sm:text-sm transition-all duration-300 ${
            showFullTimeline ? "max-h-60 sm:max-h-80" : "max-h-24 sm:max-h-32"
          }`}
        >
          {displayEvents.length === 0 ? (
            <div className="text-muted-foreground text-center py-4 text-xs">Aucun événement pour le moment</div>
          ) : (
            displayEvents
              .slice()
              .reverse()
              .map((event, index) => {
                const priority = getEventPriority(event.label)
                return (
                  <div
                    key={`${event.ts}-${index}-${event.label?.slice(0, 10)}`}
                    className="flex items-start gap-2 p-2 bg-muted/20 rounded border border-muted/30 hover:bg-muted/30 transition-colors"
                  >
                    <div className="text-xs text-muted-foreground font-mono min-w-[60px]">
                      {formatEventTime(event.ts)}
                    </div>
                    <div className="flex-1 text-xs text-foreground">{event.label}</div>
                    {priority !== "low" && (
                      <Badge className={`h-4 px-1 text-xs ${getEventBadgeColor(priority)}`}>
                        {priority === "high" ? "!" : "•"}
                      </Badge>
                    )}
                  </div>
                )
              })
          )}
        </div>

        {queue.length > 50 && showFullTimeline && (
          <div className="text-xs text-muted-foreground text-center mt-2 py-1">
            Affichage des 50 derniers événements
          </div>
        )}
      </div>
    </Card>
  )
}
