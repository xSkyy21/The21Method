"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Brain,
  Award
} from "lucide-react"

interface LearningStatsProps {
  totalCards: number
  correctCounts: number
  accuracy: number
  timeSpent: number
  level: number
  xp: number
  nextLevelXp: number
}

export function LearningStats({
  totalCards,
  correctCounts,
  accuracy,
  timeSpent,
  level,
  xp,
  nextLevelXp
}: LearningStatsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getLevelColor = (level: number) => {
    if (level < 5) return 'from-green-500 to-green-600'
    if (level < 10) return 'from-casino-gold to-casino-gold-dark'
    if (level < 15) return 'from-purple-500 to-purple-600'
    return 'from-yellow-500 to-yellow-600'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400'
    if (accuracy >= 75) return 'text-yellow-400'
    if (accuracy >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Niveau et XP */}
      <Card className="casino-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${getLevelColor(level)} rounded-xl flex items-center justify-center`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Niveau {level}</h3>
              <p className="text-sm text-slate-400">Compteur de cartes</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{xp} XP</div>
            <div className="text-xs text-slate-400">Prochain niveau</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progression</span>
            <span className="text-slate-300">{xp}/{nextLevelXp}</span>
          </div>
          <Progress 
            value={(xp / nextLevelXp) * 100} 
            className="h-2 bg-slate-700"
          />
        </div>
      </Card>

      {/* Statistiques de performance */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="casino-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Précision</div>
              <div className={`text-sm font-bold ${getAccuracyColor(accuracy)}`}>
                {accuracy.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>

        <Card className="casino-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Cartes comptées</div>
              <div className="text-sm font-bold text-white">
                {correctCounts}/{totalCards}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Temps d'apprentissage */}
      <Card className="casino-card p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Temps d'apprentissage</div>
            <div className="text-sm font-bold text-white">
              {formatTime(timeSpent)}
            </div>
          </div>
        </div>
      </Card>

      {/* Conseils d'amélioration */}
      {accuracy < 90 && (
        <Card className="casino-card p-3 border-yellow-500/30">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-yellow-300 mb-1">Conseil d'amélioration</div>
              <div className="text-xs text-slate-300">
                {accuracy < 60 
                  ? "Pratiquez plus lentement et vérifiez chaque carte"
                  : accuracy < 75
                  ? "Concentrez-vous sur la précision avant la vitesse"
                  : "Vous progressez bien ! Continuez à pratiquer"
                }
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
