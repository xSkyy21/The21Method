import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useShoe } from "@/store/useShoe"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Eye, EyeOff } from "lucide-react"

export function StatsBar() {
  const {
    handsDealt,
    remainingCards,
    remainingDecks,
    running,
    trueCount,
    ui,
    rules,
    discard,
    myRunning,
    myTrue,
    updateSettings,
  } = useShoe()

  const penetrationPct = Math.round((discard / (rules.decks * 52)) * 100)
  const cutCardReached = penetrationPct >= rules.penetrationPct
  const trueCountValue = trueCount()
  const runningValue = running

  const getTrendIcon = (count: number) => {
    if (count > 2) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (count < -2) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-yellow-400" />
  }

  const getAccuracyBadge = (playerValue: number | undefined, machineValue: number, isTrueCount = false) => {
    if (playerValue === undefined) return null

    const diff = Math.abs(playerValue - machineValue)
    const tolerance = isTrueCount ? 0.5 : 0

    if (diff <= tolerance) {
      return <span className="text-xs bg-green-500/20 text-green-400 px-1 rounded">✓</span>
    } else if (isTrueCount && diff <= 0.5) {
      return <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 rounded">±</span>
    } else {
      return <span className="text-xs bg-red-500/20 text-red-400 px-1 rounded">✗</span>
    }
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Toggle Controls */}
      <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Switch checked={ui.showRunning} onCheckedChange={(checked) => updateSettings({ showRunning: checked })} />
            <span className="text-sm text-muted-foreground">Running Count</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={ui.showTrue} onCheckedChange={(checked) => updateSettings({ showTrue: checked })} />
            <span className="text-sm text-muted-foreground">True Count</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={ui.showRemaining}
              onCheckedChange={(checked) => updateSettings({ showRemaining: checked })}
            />
            <span className="text-sm text-muted-foreground">Paquets restants</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={ui.showMyCount} onCheckedChange={(checked) => updateSettings({ showMyCount: checked })} />
            <span className="text-sm text-muted-foreground">Mon comptage</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-3 text-center bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-sm text-muted-foreground">Mains jouées</div>
          <div className="text-xl font-bold text-foreground">{handsDealt}</div>
        </Card>

        <Card
          className={`p-3 text-center bg-card/90 backdrop-blur-sm ${
            cutCardReached ? "border-destructive bg-destructive/10" : "border-primary/20"
          }`}
        >
          <div className="text-sm text-muted-foreground">Pénétration</div>
          <div
            className={`text-xl font-bold flex items-center justify-center gap-1 ${
              cutCardReached ? "text-destructive" : "text-foreground"
            }`}
          >
            {cutCardReached && <AlertTriangle className="w-4 h-4" />}
            {penetrationPct}%
          </div>
        </Card>

        <Card className="p-3 text-center bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-sm text-muted-foreground">Paquets restants</div>
          <div className="text-xl font-bold text-foreground">
            {ui.showRemaining ? remainingDecks().toFixed(1) : "?"}
          </div>
        </Card>

        <Card className="p-3 text-center bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Running Count (Machine)
            {ui.showRunning ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </div>
          <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
            {ui.showRunning && getTrendIcon(runningValue)}
            {ui.showRunning ? (runningValue > 0 ? `+${runningValue}` : runningValue) : "?"}
            {ui.showMyCount && getAccuracyBadge(myRunning, runningValue)}
          </div>
          {ui.showMyCount && myRunning !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">Mon: {myRunning > 0 ? `+${myRunning}` : myRunning}</div>
          )}
        </Card>

        <Card className="p-3 text-center bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            True Count (Machine)
            {ui.showTrue ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </div>
          <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
            {ui.showTrue && getTrendIcon(trueCountValue)}
            {ui.showTrue ? (trueCountValue > 0 ? `+${trueCountValue.toFixed(1)}` : trueCountValue.toFixed(1)) : "?"}
            {ui.showMyCount && getAccuracyBadge(myTrue, trueCountValue, true)}
          </div>
          {ui.showMyCount && myTrue !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">
              Mon: {myTrue > 0 ? `+${myTrue.toFixed(1)}` : myTrue.toFixed(1)}
            </div>
          )}
        </Card>

        <Card
          className={`p-3 text-center bg-card/90 backdrop-blur-sm ${
            cutCardReached ? "border-destructive bg-destructive/10" : "border-primary/20"
          }`}
        >
          <div className="text-sm text-muted-foreground">Cut Card</div>
          <div className={`text-xl font-bold ${cutCardReached ? "text-destructive" : "text-accent"}`}>
            {cutCardReached ? "ATTEINTE" : "OK"}
          </div>
        </Card>
      </div>
    </div>
  )
}
