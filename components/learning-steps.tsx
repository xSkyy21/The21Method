"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"

interface LearningStepsProps {
  currentStep: number
  onNextStep: () => void
  onPrevStep: () => void
  onReset: () => void
  isPlaying: boolean
  onTogglePlay: () => void
}

export function LearningSteps({ 
  currentStep, 
  onNextStep, 
  onPrevStep, 
  onReset, 
  isPlaying, 
  onTogglePlay 
}: LearningStepsProps) {
  const steps = [
    {
      id: 0,
      title: "Comprendre le Système Hi-Lo",
      description: "Apprenez les valeurs de comptage : 2-6 = +1, 7-9 = 0, 10-A = -1",
      icon: Calculator,
      action: "Cliquez sur les cartes pour voir leur valeur"
    },
    {
      id: 1,
      title: "Comptage en Temps Réel",
      description: "Pratiquez le comptage pendant que les cartes sont distribuées",
      icon: Target,
      action: "Suivez le comptage automatique et vérifiez le vôtre"
    },
    {
      id: 2,
      title: "Stratégie de Base",
      description: "Apprenez les décisions optimales selon votre main et la carte du croupier",
      icon: CheckCircle,
      action: "Observez les conseils de stratégie de base"
    },
    {
      id: 3,
      title: "Pratique Libre",
      description: "Jouez librement en appliquant ce que vous avez appris",
      icon: Play,
      action: "Jouez à votre rythme sans aide"
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <Card className="casino-card p-6 mb-6 border-2 border-casino-gold/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center">
            <currentStepData.icon className="w-6 h-6 text-casino-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-casino-gold-light">
              Étape {currentStep + 1}/4
            </h3>
            <p className="text-sm text-slate-400">Mode Apprentissage</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-casino-gold"
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-casino-gold"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xl font-semibold text-white mb-2">
          {currentStepData.title}
        </h4>
        <p className="text-slate-300 mb-3">
          {currentStepData.description}
        </p>
        <div className="flex items-center gap-2 text-casino-gold-light text-sm">
          <ArrowRight className="w-4 h-4" />
          <span>{currentStepData.action}</span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progression</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-casino-gold to-casino-gold-light h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-casino-gold"
          onClick={onPrevStep}
          disabled={currentStep === 0}
        >
          ← Précédent
        </Button>
        
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-casino-gold' 
                  : index < currentStep 
                    ? 'bg-casino-gold-dark' 
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-casino-gold"
          onClick={onNextStep}
          disabled={currentStep === steps.length - 1}
        >
          Suivant →
        </Button>
      </div>
    </Card>
  )
}
