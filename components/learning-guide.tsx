"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Target, 
  Calculator, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"

interface LearningGuideProps {
  onToggleGuide: () => void
  isVisible: boolean
}

export function LearningGuide({ onToggleGuide, isVisible }: LearningGuideProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: 'hi-lo',
      title: 'Système Hi-Lo',
      icon: Calculator,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center">
              <div className="font-bold text-green-300">2-6</div>
              <div className="text-green-200">+1</div>
            </div>
            <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-2 text-center">
              <div className="font-bold text-slate-300">7-9</div>
              <div className="text-slate-200">0</div>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-center">
              <div className="font-bold text-red-300">10-A</div>
              <div className="text-red-200">-1</div>
            </div>
          </div>
          <p className="text-sm text-slate-300">
            Comptez +1 pour les cartes basses (2-6), 0 pour les cartes neutres (7-9), 
            et -1 pour les cartes hautes (10-A).
          </p>
        </div>
      )
    },
    {
      id: 'basic-strategy',
      title: 'Stratégie de Base',
      icon: Target,
      content: (
        <div className="space-y-3">
          <div className="text-sm text-slate-300">
            <p className="mb-2">Conseils généraux :</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Toujours diviser les As et les 8</li>
              <li>Ne jamais diviser les 10, J, Q, K</li>
              <li>Doubler sur 11 contre 2-10</li>
              <li>Rester sur 17+ contre toute carte du croupier</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'counting-tips',
      title: 'Conseils de Comptage',
      icon: Lightbulb,
      content: (
        <div className="space-y-3">
          <div className="text-sm text-slate-300">
            <p className="mb-2">Techniques efficaces :</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Comptez mentalement à chaque carte distribuée</li>
              <li>Vérifiez votre comptage avec l'affichage</li>
              <li>Pratiquez régulièrement pour automatiser</li>
              <li>Commencez lentement, puis accélérez</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  if (!isVisible) return null

  return (
    <Card className="casino-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Guide d'Apprentissage</h3>
            <p className="text-sm text-slate-400">Maîtrisez le comptage de cartes</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          onClick={onToggleGuide}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="border border-slate-700/50 rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto text-left"
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-4 h-4 text-slate-400" />
                <span className="text-white font-medium">{section.title}</span>
              </div>
              {activeSection === section.id ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </Button>
            
            {activeSection === section.id && (
              <div className="px-3 pb-3 border-t border-slate-700/50 pt-3">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Lightbulb className="w-4 h-4" />
          <span>Cliquez sur les cartes pour voir leur valeur de comptage</span>
        </div>
      </div>
    </Card>
  )
}
