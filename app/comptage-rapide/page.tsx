"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { getHiLoValue } from "@/lib/count"
import { Card as CardComponent } from "@/components/card"
import { ChevronDown, ChevronUp, Play, RotateCcw, CheckCircle, XCircle, Clock, Settings, Eye, EyeOff } from "lucide-react"
import type { Card as CardType, Rank, Suit } from "@/lib/types"

type GameState = 'idle' | 'running' | 'finished' | 'result'

const suits: Suit[] = ['S', 'H', 'D', 'C']
const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

function generateRandomCard(): CardType {
  return {
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    suit: suits[Math.floor(Math.random() * suits.length)]
  }
}

function generateDeck(): CardType[] {
  const deck: CardType[] = []
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit })
    }
  }
  // Mélanger le paquet
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export default function ComptageRapidePage() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [cards, setCards] = useState<CardType[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [userCount, setUserCount] = useState<string>('')
  const [actualCount, setActualCount] = useState<number>(0)
  const [showHelp, setShowHelp] = useState(true)
  const [showCards, setShowCards] = useState(false)
  const [showCardValue, setShowCardValue] = useState(true)
  const [hideValueByDefault, setHideValueByDefault] = useState(false)
  
  // Paramètres configurables
  const [numCards, setNumCards] = useState(20)
  const [duration, setDuration] = useState(30)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    document.title = "Comptage Rapide — Blackjack Trainer Pro"
  }, [])

  const startGame = useCallback(() => {
    // Générer un nouveau jeu de cartes
    const deck = generateDeck()
    const selectedCards = deck.slice(0, numCards)
    setCards(selectedCards)
    setCurrentCardIndex(0)
    setUserCount('')
    setActualCount(0)
    setGameState('running')
    setTimeLeft(duration)
    setShowCards(false)
    setShowCardValue(!hideValueByDefault) // Utiliser le paramètre par défaut

    // Calculer le comptage réel
    const count = selectedCards.reduce((sum, card) => sum + getHiLoValue(card.rank), 0)
    setActualCount(count)

    // Calculer la vitesse automatique pour que toutes les cartes soient affichées dans le temps imparti
    // On laisse un peu de marge (95% du temps) pour que la dernière carte soit visible avant la fin
    const effectiveDuration = duration * 0.95
    const calculatedSpeed = Math.max(200, Math.floor((effectiveDuration * 1000) / selectedCards.length))
    
    // Timer principal
    let remainingTime = duration
    timerRef.current = setInterval(() => {
      remainingTime--
      setTimeLeft(remainingTime)
      if (remainingTime <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        // Arrêter aussi le défilement des cartes si ce n'est pas déjà fait
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setGameState('finished')
      }
    }, 1000)

    // Défilement des cartes synchronisé avec le timer
    let cardIndex = 0
    // Afficher la première carte immédiatement
    setCurrentCardIndex(0)
    
    intervalRef.current = setInterval(() => {
      if (cardIndex < selectedCards.length - 1) {
        cardIndex++
        setCurrentCardIndex(cardIndex)
        
        // Si on a affiché toutes les cartes (dernière carte), arrêter le timer et passer à l'état finished
        if (cardIndex >= selectedCards.length - 1) {
          // Attendre un peu pour que la dernière carte soit visible
          setTimeout(() => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            // Arrêter le timer aussi
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            setTimeLeft(0)
            setGameState('finished')
          }, calculatedSpeed) // Attendre le temps d'une carte pour que la dernière soit visible
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, calculatedSpeed)
  }, [numCards, duration, hideValueByDefault])

  const stopGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setGameState('finished')
  }, [])

  const resetGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setGameState('idle')
    setCards([])
    setCurrentCardIndex(0)
    setTimeLeft(0)
    setUserCount('')
    setActualCount(0)
    setShowCards(false)
  }, [])

  const submitCount = useCallback(() => {
    const userValue = parseInt(userCount, 10)
    if (isNaN(userValue)) return
    
    setGameState('result')
  }, [userCount])

  const getAccuracy = () => {
    const userValue = parseInt(userCount, 10)
    if (isNaN(userValue)) return null
    
    const diff = Math.abs(userValue - actualCount)
    if (diff === 0) return { status: 'perfect', message: 'Parfait ! 🎯' }
    if (diff <= 1) return { status: 'good', message: 'Excellent ! ✅' }
    if (diff <= 3) return { status: 'ok', message: 'Bien ! 👍' }
    return { status: 'bad', message: 'À améliorer 💪' }
  }

  const accuracy = gameState === 'result' ? getAccuracy() : null
  const currentCard = cards[currentCardIndex]
  const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0

  return (
    <div className="min-h-screen casino-bg pt-20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* En-tête */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white casino-neon-gold">
            🧮 Comptage Rapide
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Entraînez-vous à compter rapidement les cartes avec le système Hi-Lo
          </p>
        </div>

        {/* Paramètres (affichés uniquement en mode idle) */}
        {gameState === 'idle' && (
          <Card className="casino-card p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-yellow-400" />
                  Paramètres
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Nombre de cartes : <span className="text-yellow-400 font-bold">{numCards}</span>
                  </label>
                  <Slider
                    value={[numCards]}
                    onValueChange={(value) => setNumCards(value[0])}
                    min={10}
                    max={52}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>10</span>
                    <span>52</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Durée (secondes) : <span className="text-yellow-400 font-bold">{duration}s</span>
                  </label>
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={10}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>10s</span>
                    <span>120s</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Vitesse des cartes : <span className="text-yellow-400 font-bold">Automatique</span>
                  </label>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400">
                    <p className="mb-1">
                      La vitesse est calculée automatiquement pour afficher toutes les cartes dans le temps imparti.
                    </p>
                    <p className="text-xs">
                      Vitesse estimée : ~{numCards > 0 && duration > 0 ? Math.max(200, Math.floor((duration * 0.95 * 1000) / numCards)) : 0}ms par carte
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block flex items-center justify-between">
                    <span>Masquer la valeur Hi-Lo par défaut</span>
                    <input
                      type="checkbox"
                      checked={hideValueByDefault}
                      onChange={(e) => setHideValueByDefault(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-slate-800"
                    />
                  </label>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400">
                    <p>
                      Si activé, la valeur Hi-Lo sera masquée dès le début de l'exercice. 
                      Vous pourrez toujours l'afficher avec le bouton pendant l'exercice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Aide masquable */}
        <Card className="casino-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📚 Aide - Valeurs Hi-Lo</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="text-slate-300 hover:text-white"
            >
              {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          {showHelp && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-green-500/20 border-2 border-green-500/40 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-300 mb-1">2-6</div>
                <div className="text-2xl font-bold text-green-200">+1</div>
                <div className="text-xs text-green-300 mt-1">Cartes Basses</div>
              </div>
              <div className="bg-slate-500/20 border-2 border-slate-500/40 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-slate-300 mb-1">7-9</div>
                <div className="text-2xl font-bold text-slate-200">0</div>
                <div className="text-xs text-slate-300 mt-1">Cartes Neutres</div>
              </div>
              <div className="bg-red-500/20 border-2 border-red-500/40 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-300 mb-1">10-A</div>
                <div className="text-2xl font-bold text-red-200">-1</div>
                <div className="text-xs text-red-300 mt-1">Cartes Hautes</div>
              </div>
            </div>
          )}
        </Card>

        {/* Zone de jeu */}
        {gameState !== 'idle' && (
          <Card className="casino-card p-6 sm:p-8">
            <div className="space-y-6">
              {/* Timer et progression */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Temps restant :</span>
                    <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-300">
                      Carte {currentCardIndex + 1} / {cards.length}
                    </div>
                    {gameState === 'running' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCardValue(!showCardValue)}
                        className="text-slate-300 hover:text-white border border-slate-600 hover:border-yellow-500/50"
                        title={showCardValue ? "Masquer la valeur Hi-Lo" : "Afficher la valeur Hi-Lo"}
                      >
                        {showCardValue ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Masquer valeur</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Afficher valeur</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-slate-700/50 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Carte actuelle */}
              {currentCard && gameState === 'running' && (
                <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                  <div className="text-center">
                    <div className="text-6xl sm:text-8xl mb-4">
                      <CardComponent
                        card={currentCard}
                        index={0}
                        isDealing={false}
                      />
                    </div>
                    {showCardValue ? (
                      <>
                        <div className="text-3xl font-bold text-yellow-400 mt-4">
                          {getHiLoValue(currentCard.rank) > 0 ? '+' : ''}{getHiLoValue(currentCard.rank)}
                        </div>
                        <div className="text-sm text-slate-400 mt-2">Valeur Hi-Lo</div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-600 mt-4 italic">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bouton arrêter */}
              {gameState === 'running' && (
                <div className="flex justify-center">
                  <Button
                    onClick={stopGame}
                    className="casino-button-red px-8 py-3 text-lg"
                  >
                    Arrêter
                  </Button>
                </div>
              )}

              {/* Formulaire de saisie */}
              {gameState === 'finished' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Temps écoulé !</h3>
                    <p className="text-slate-300">Entrez votre comptage final</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Input
                      type="number"
                      value={userCount}
                      onChange={(e) => setUserCount(e.target.value)}
                      placeholder="Votre comptage"
                      className="text-center text-2xl font-bold max-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          submitCount()
                        }
                      }}
                    />
                    <Button
                      onClick={submitCount}
                      className="casino-button-gold px-8 py-3 text-lg"
                      disabled={!userCount}
                    >
                      Valider
                    </Button>
                  </div>
                </div>
              )}

              {/* Résultats */}
              {gameState === 'result' && accuracy && (
                <div className="space-y-6">
                  <div className={`text-center p-6 rounded-xl border-2 ${
                    accuracy.status === 'perfect' ? 'bg-green-500/20 border-green-500/50' :
                    accuracy.status === 'good' ? 'bg-blue-500/20 border-blue-500/50' :
                    accuracy.status === 'ok' ? 'bg-yellow-500/20 border-yellow-500/50' :
                    'bg-red-500/20 border-red-500/50'
                  }`}>
                    <div className="text-3xl font-bold text-white mb-2">
                      {accuracy.message}
                    </div>
                    <div className="text-xl text-slate-300 mt-4">
                      Votre comptage : <span className="text-white font-bold">{userCount}</span>
                    </div>
                    <div className="text-xl text-slate-300">
                      Comptage réel : <span className="text-yellow-400 font-bold">{actualCount}</span>
                    </div>
                    <div className="text-lg text-slate-400 mt-2">
                      Écart : <span className="font-bold">{Math.abs(parseInt(userCount, 10) - actualCount)}</span>
                    </div>
                  </div>

                  {/* Récapitulatif des cartes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">Récapitulatif des cartes</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCards(!showCards)}
                        className="text-slate-300 hover:text-white"
                      >
                        {showCards ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Afficher
                          </>
                        )}
                      </Button>
                    </div>

                    {showCards && (
                      <div className="flex flex-wrap gap-2 p-4 bg-slate-800/50 rounded-lg justify-center">
                        {cards.map((card, index) => {
                          const value = getHiLoValue(card.rank)
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center space-y-1"
                            >
                              <div className="text-2xl sm:text-3xl">
                                <CardComponent card={card} index={index} isDealing={false} />
                              </div>
                              <Badge
                                variant={
                                  value > 0 ? 'default' :
                                  value < 0 ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {value > 0 ? '+' : ''}{value}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Calcul détaillé */}
                    {showCards && (
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-300 space-y-1">
                          <div className="flex justify-between">
                            <span>Cartes +1 (2-6) :</span>
                            <span className="text-green-400 font-bold">
                              {cards.filter(c => getHiLoValue(c.rank) === 1).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cartes 0 (7-9) :</span>
                            <span className="text-slate-400 font-bold">
                              {cards.filter(c => getHiLoValue(c.rank) === 0).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cartes -1 (10-A) :</span>
                            <span className="text-red-400 font-bold">
                              {cards.filter(c => getHiLoValue(c.rank) === -1).length}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                            <span className="font-bold text-white">Total :</span>
                            <span className="text-yellow-400 font-bold text-lg">{actualCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {gameState === 'idle' && (
            <Button
              onClick={startGame}
              className="casino-button-gold px-8 py-4 text-lg font-bold"
            >
              <Play className="w-5 h-5 mr-2" />
              Commencer l'exercice
            </Button>
          )}

          {(gameState === 'result' || gameState === 'finished') && (
            <Button
              onClick={resetGame}
              className="casino-button-gold px-8 py-4 text-lg font-bold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Nouvel exercice
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

