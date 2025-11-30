"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Calculator, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Zap
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface HiLoGuideProps {
  onClose?: () => void
  isVisible?: boolean
}

export function HiLoGuide({ onClose, isVisible = true }: HiLoGuideProps) {
  const [activeSection, setActiveSection] = useState<string | null>("basics")

  if (!isVisible) return null

  return (
    <Card className="casino-card p-4 sm:p-6 mb-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg sm:text-xl">Guide Complet du Comptage Hi-Lo</h3>
            <p className="text-sm text-slate-400">Maîtrisez le système de comptage le plus populaire</p>
          </div>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible value={activeSection || undefined} onValueChange={setActiveSection} className="w-full">
        {/* Section 1: Les Bases */}
        <AccordionItem value="basics" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">1. Les Bases du Système Hi-Lo</div>
                <div className="text-xs text-slate-400">Comprendre les valeurs de comptage</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  Valeurs des Cartes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-green-500/20 border-2 border-green-500/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-300 mb-2">2, 3, 4, 5, 6</div>
                    <div className="text-3xl font-bold text-green-200 mb-2">+1</div>
                    <div className="text-xs text-green-300">Cartes Basses</div>
                    <div className="text-xs text-slate-300 mt-2">Favorables au joueur</div>
                  </div>
                  <div className="bg-slate-500/20 border-2 border-slate-500/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-300 mb-2">7, 8, 9</div>
                    <div className="text-3xl font-bold text-slate-200 mb-2">0</div>
                    <div className="text-xs text-slate-300">Cartes Neutres</div>
                    <div className="text-xs text-slate-300 mt-2">Aucun effet</div>
                  </div>
                  <div className="bg-red-500/20 border-2 border-red-500/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-300 mb-2">10, J, Q, K, A</div>
                    <div className="text-3xl font-bold text-red-200 mb-2">-1</div>
                    <div className="text-xs text-red-300">Cartes Hautes</div>
                    <div className="text-xs text-slate-300 mt-2">Favorables au croupier</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">Pourquoi ces valeurs ?</p>
                    <p className="mb-2">
                      Les cartes basses (2-6) aident le joueur car elles augmentent les chances que le croupier dépasse 21.
                      Les cartes hautes (10-A) aident le croupier car elles augmentent ses chances de faire un blackjack ou une main forte.
                    </p>
                    <p>
                      <strong className="text-white">Le système Hi-Lo est équilibré :</strong> Dans un jeu complet de 52 cartes, 
                      il y a autant de cartes +1 que de cartes -1, donc le comptage total est 0.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Running Count */}
        <AccordionItem value="running" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">2. Le Running Count (Comptage Brut)</div>
                <div className="text-xs text-slate-400">Comptage cumulatif depuis le début du sabot</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Comment calculer le Running Count</h4>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-white">Étape 1 :</strong> Commencez à 0 au début d'un nouveau sabot
                    </p>
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <code className="text-green-400 font-mono">Running Count = 0</code>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-white">Étape 2 :</strong> À chaque carte distribuée, ajoutez sa valeur Hi-Lo
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Carte distribuée : <strong className="text-white">5♠</strong></span>
                        <span className="text-green-400 font-mono">+1</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Carte distribuée : <strong className="text-white">K♥</strong></span>
                        <span className="text-red-400 font-mono">-1</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Carte distribuée : <strong className="text-white">8♦</strong></span>
                        <span className="text-slate-400 font-mono">0</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-white">Exemple complet :</strong>
                    </p>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Début :</span>
                        <span className="text-white">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">+ 5♠ (+1) :</span>
                        <span className="text-green-400">+1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">+ K♥ (-1) :</span>
                        <span className="text-white">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">+ 3♣ (+1) :</span>
                        <span className="text-green-400">+1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">+ A♠ (-1) :</span>
                        <span className="text-white">0</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                        <span className="text-white font-bold">Running Count final :</span>
                        <span className="text-green-400 font-bold">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">💡 Astuce de pratique</p>
                    <p>
                      Entraînez-vous à compter mentalement à chaque carte. Commencez lentement, puis accélérez progressivement.
                      Le Running Count vous indique si le sabot est favorable ou défavorable, mais il ne tient pas compte du nombre de paquets restants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: True Count */}
        <AccordionItem value="true" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">3. Le True Count (Comptage Réel)</div>
                <div className="text-xs text-slate-400">Le comptage ajusté selon les paquets restants</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Pourquoi le True Count est essentiel</h4>
                <p className="text-sm text-slate-300 mb-4">
                  Le Running Count seul n'est pas suffisant car il ne tient pas compte de la profondeur du sabot.
                  Un Running Count de +6 avec 6 paquets restants est très différent d'un Running Count de +6 avec 1 paquet restant.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-white mb-2">Formule du True Count :</h5>
                  <div className="bg-slate-900/50 rounded p-3 text-center mb-2">
                    <code className="text-lg text-blue-400 font-mono">
                      True Count = Running Count ÷ Paquets Restants
                    </code>
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Arrondi à 1 décimale près
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-white">Exemple 1 :</strong> Début de sabot
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Running Count :</span>
                        <span className="text-white font-mono">+6</span>
                      </div>
                      <div className="flex justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Paquets restants :</span>
                        <span className="text-white font-mono">6.0</span>
                      </div>
                      <div className="flex justify-between bg-green-500/20 rounded p-2 border border-green-500/30">
                        <span className="text-white font-semibold">True Count :</span>
                        <span className="text-green-400 font-mono font-bold">+1.0</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        ⚠️ Situation peu favorable : Le comptage est dilué sur beaucoup de cartes
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong className="text-white">Exemple 2 :</strong> Fin de sabot
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Running Count :</span>
                        <span className="text-white font-mono">+6</span>
                      </div>
                      <div className="flex justify-between bg-slate-900/50 rounded p-2">
                        <span className="text-slate-300">Paquets restants :</span>
                        <span className="text-white font-mono">1.0</span>
                      </div>
                      <div className="flex justify-between bg-green-500/20 rounded p-2 border border-green-500/30">
                        <span className="text-white font-semibold">True Count :</span>
                        <span className="text-green-400 font-mono font-bold">+6.0</span>
                      </div>
                      <p className="text-xs text-green-400 mt-2">
                        ✅ Situation très favorable : Le comptage est concentré sur peu de cartes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">🎯 Règle d'or</p>
                    <p>
                      <strong>Utilisez toujours le True Count pour vos décisions de mise et de stratégie.</strong>
                      Le True Count normalise le comptage selon la profondeur du sabot, ce qui le rend comparable 
                      quelle que soit la quantité de cartes déjà jouées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Application Pratique */}
        <AccordionItem value="practice" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">4. Application Pratique</div>
                <div className="text-xs text-slate-400">Comment utiliser le comptage en jeu</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Stratégie de Mise selon le True Count</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">True Count ≤ 0</span>
                        <Badge variant="destructive" className="text-xs">Défavorable</Badge>
                      </div>
                      <p className="text-xs text-slate-300">Mise minimale ou quitter la table</p>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">True Count +1 à +2</span>
                        <Badge variant="secondary" className="text-xs">Neutre</Badge>
                      </div>
                      <p className="text-xs text-slate-300">Mise de base (1 unité)</p>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">True Count +3 à +4</span>
                        <Badge className="bg-green-500 text-white text-xs">Favorable</Badge>
                      </div>
                      <p className="text-xs text-slate-300">Mise augmentée (2-3 unités)</p>
                    </div>
                    <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">True Count ≥ +5</span>
                        <Badge className="bg-emerald-500 text-white text-xs">Très Favorable</Badge>
                      </div>
                      <p className="text-xs text-slate-300">Mise maximale (4-6 unités)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Ajustements de Stratégie de Base</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-300 mb-2">
                      <strong className="text-white">True Count élevé (+3 ou plus) :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Rester sur 12 contre 2 ou 3 (au lieu de tirer)</li>
                      <li>Doubler sur 9 contre 2 (au lieu de tirer)</li>
                      <li>Doubler sur 10 contre 10 ou A (au lieu de tirer)</li>
                      <li>Doubler sur 11 contre A (au lieu de tirer)</li>
                      <li>Prendre l'assurance si True Count ≥ +3</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-300 mb-2">
                      <strong className="text-white">True Count faible (≤ 0) :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Rester sur 16 contre 10 (au lieu de tirer)</li>
                      <li>Ne pas doubler sur 9 contre 2</li>
                      <li>Ne pas prendre l'assurance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: Techniques Avancées */}
        <AccordionItem value="advanced" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">5. Techniques Avancées</div>
                <div className="text-xs text-slate-400">Astuces pour les compteurs expérimentés</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Estimation des Paquets Restants</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    Pour calculer le True Count, vous devez estimer le nombre de paquets restants dans le sabot.
                  </p>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="mb-2"><strong className="text-white">Méthode simple :</strong></p>
                    <div className="space-y-1">
                      <p>• Comptez les cartes distribuées (approximativement)</p>
                      <p>• Divisez par 52 pour obtenir les paquets joués</p>
                      <p>• Soustrayez du nombre total de paquets</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 mt-2 text-center">
                      <code className="text-blue-400 font-mono text-xs">
                        Paquets restants = Paquets totaux - (Cartes jouées ÷ 52)
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Gestion de l'Erreur</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-slate-300 mb-2">
                      <strong className="text-white">⚠️ Erreurs courantes :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Oublier de compter une carte</li>
                      <li>Compter deux fois la même carte</li>
                      <li>Mauvaise estimation des paquets restants</li>
                      <li>Utiliser le Running Count au lieu du True Count</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-slate-300 mb-2">
                      <strong className="text-white">✅ Comment réduire les erreurs :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Pratiquez régulièrement pour automatiser le comptage</li>
                      <li>Vérifiez votre comptage avec l'affichage de l'application</li>
                      <li>Commencez lentement et augmentez la vitesse progressivement</li>
                      <li>Utilisez des techniques de mémorisation (paquets de 5, 10, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Comptage en Équipe</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Dans un contexte d'équipe, un compteur peut suivre le comptage pendant que d'autres jouent.
                  Le compteur signale au "grand joueur" (big player) quand le True Count est favorable.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Note :</strong> Cette application vous permet de pratiquer 
                    le comptage individuellement. Dans un vrai casino, le comptage en équipe peut être considéré 
                    comme de la triche selon les règles du casino.
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 6: Exercices Pratiques */}
        <AccordionItem value="exercises" className="border-slate-700/50">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">6. Exercices Pratiques</div>
                <div className="text-xs text-slate-400">Entraînez-vous avec des exemples concrets</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Exercice 1 : Calcul du Running Count</h4>
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-slate-300 mb-2">
                    <strong className="text-white">Cartes distribuées :</strong> 5♠, K♥, 3♣, A♠, 8♦, 2♥, Q♣, 4♠
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">5♠</span>
                      <span className="text-green-400 font-mono">+1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">K♥</span>
                      <span className="text-red-400 font-mono">-1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">3♣</span>
                      <span className="text-green-400 font-mono">+1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">A♠</span>
                      <span className="text-red-400 font-mono">-1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">8♦</span>
                      <span className="text-slate-400 font-mono">0</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">2♥</span>
                      <span className="text-green-400 font-mono">+1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">Q♣</span>
                      <span className="text-red-400 font-mono">-1</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 rounded p-2">
                      <span className="text-slate-300">4♠</span>
                      <span className="text-green-400 font-mono">+1</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-500/20 rounded p-2 border border-green-500/30 mt-2">
                      <span className="text-white font-semibold">Running Count :</span>
                      <span className="text-green-400 font-mono font-bold">+1</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Exercice 2 : Calcul du True Count</h4>
                <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-slate-300 mb-2">
                    <strong className="text-white">Situation :</strong> Running Count = +8, 4 paquets restants
                  </p>
                  <div className="bg-slate-900/50 rounded p-3 text-center">
                    <div className="text-sm text-slate-300 mb-1">True Count = Running Count ÷ Paquets Restants</div>
                    <div className="text-lg text-blue-400 font-mono mb-1">True Count = 8 ÷ 4</div>
                    <div className="text-xl text-green-400 font-bold">True Count = +2.0</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    ✅ Situation favorable : Augmentez votre mise
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Info className="w-4 h-4" />
            <span>Utilisez la page "Apprentissage" pour pratiquer avec des explications en temps réel</span>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              className="casino-button-gold text-sm"
            >
              Fermer le guide
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

