"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Target, 
  Trophy, 
  History, 
  BookOpen, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  Play,
  Star,
  Award,
  CheckCircle,
  ArrowRight,
  Crown,
  BarChart3,
  Brain,
  Clock
} from "lucide-react"
import { CasinoHero } from "@/components/casino-hero"
import { BigWins } from "@/components/big-wins"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Valeurs fixes pour les particules pour éviter l'erreur d'hydratation
  const particleData = [
    { left: "15%", delay: "0.5s", duration: "6s" },
    { left: "25%", delay: "1.2s", duration: "7s" },
    { left: "35%", delay: "0.8s", duration: "8s" },
    { left: "45%", delay: "1.5s", duration: "6.5s" },
    { left: "55%", delay: "0.3s", duration: "7.5s" },
    { left: "65%", delay: "1.8s", duration: "6.8s" },
    { left: "75%", delay: "0.7s", duration: "8.2s" },
    { left: "85%", delay: "1.1s", duration: "7.2s" },
    { left: "95%", delay: "0.9s", duration: "6.3s" },
    { left: "5%", delay: "1.6s", duration: "7.8s" },
    { left: "12%", delay: "0.4s", duration: "8.5s" },
    { left: "22%", delay: "1.3s", duration: "6.7s" },
    { left: "32%", delay: "0.6s", duration: "7.9s" },
    { left: "42%", delay: "1.7s", duration: "6.4s" },
    { left: "52%", delay: "0.2s", duration: "8.1s" },
    { left: "62%", delay: "1.4s", duration: "7.1s" },
    { left: "72%", delay: "0.1s", duration: "6.9s" },
    { left: "82%", delay: "1.9s", duration: "7.6s" },
    { left: "92%", delay: "0.8s", duration: "8.3s" },
    { left: "2%", delay: "1.0s", duration: "6.6s" }
  ]

  const features = [
    {
      icon: Target,
      title: "Stratégie de Base",
      description: "Apprenez et maîtrisez la stratégie optimale pour chaque situation de jeu",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Comptage Hi-Lo",
      description: "Entraînez-vous au comptage de cartes avec le système Hi-Lo le plus populaire",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Brain,
      title: "Quiz Interactifs",
      description: "Testez vos connaissances avec des quiz adaptatifs et progressifs",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Shield,
      title: "Provably Fair",
      description: "Système de génération de cartes vérifiable et transparent",
      color: "from-slate-500 to-slate-600"
    },
    {
      icon: Users,
      title: "Multi-Sièges",
      description: "Jouez sur 1 à 4 sièges simultanément pour un entraînement intensif",
      color: "from-casino-gold to-casino-gold-dark"
    },
    {
      icon: TrendingUp,
      title: "Statistiques Avancées",
      description: "Suivez vos progrès avec des métriques détaillées et des graphiques",
      color: "from-pink-500 to-rose-600"
    }
  ]

  const stats = [
    { label: "Joueurs Actifs", value: "2,847", icon: Users },
    { label: "Mains Jouées", value: "1.2M+", icon: Target },
    { label: "Heures d'Entraînement", value: "45K+", icon: Clock },
    { label: "Note Moyenne", value: "4.9/5", icon: Star }
  ]

  return (
    <div className="min-h-screen">
      {/* Casino Particles Effect - Compatible SSR */}
      {isClient && (
        <div className="casino-particles">
          {particleData.map((particle, i) => (
            <div
              key={i}
              className="casino-particle"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
      )}

      {/* Hero Section - Plus aéré */}
      <section className="relative pt-8 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Casino Hero avec images */}
          <div className="mb-24 smooth-fade-in">
            <CasinoHero />
          </div>
        </div>
      </section>

      {/* Titre principal - Section séparée */}
      <section className="py-20 bg-gradient-to-br from-black/30 to-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center smooth-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 font-display">
              <span className="casino-neon-gold">
                Blackjack
              </span>
              <br />
              <span className="casino-neon-gold-light">Trainer Pro</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Maîtrisez l'art du Blackjack avec le meilleur outil d'entraînement. 
              Stratégie de base, comptage de cartes, et bien plus encore.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/entrainement">
                <Button className="casino-button-gold py-4 px-8 rounded-xl text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Commencer l'entraînement
                </Button>
              </Link>
              
              <Link href="/apprentissage">
                <Button className="casino-button-light py-4 px-8 rounded-xl text-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Apprendre le comptage
                </Button>
              </Link>
              
              <Link href="/connexion">
                <Button className="casino-button-dark py-4 px-8 rounded-xl text-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Plus aérée */}
      <section className="py-20 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="casino-neon-gold-light">Statistiques</span> Impressionnantes
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Rejoignez une communauté de joueurs passionnés et motivés
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center casino-card p-8 rounded-2xl smooth-fade-in float-gentle" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-2xl flex items-center justify-center shadow-xl chip-stack glow-pulse">
                    {index === 0 ? (
                      <Image
                        src="/images/casino/playing-card-symbols-clubs.png"
                        alt="Symbole trèfle 3D"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : index === 1 ? (
                      <Image
                        src="/images/casino/casino-game.png"
                        alt="Dé de casino"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <stat.icon className="w-8 h-8 text-casino-black" />
                    )}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-casino-gold-light mb-2">{stat.value}</div>
                <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Plus aérée */}
      <section className="py-24 bg-gradient-to-br from-gray-900/60 to-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Fonctionnalités <span className="casino-neon-gold-light">Avancées</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Tout ce dont vous avez besoin pour devenir un expert du Blackjack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="casino-card p-8 smooth-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-2xl flex items-center justify-center shadow-xl mb-8 chip-stack glow-pulse mx-auto">
                    <feature.icon className="w-10 h-10 text-casino-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-casino-gold-light mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Big Wins Section - Plus aérée */}
      <section className="py-24 bg-gradient-to-br from-gray-900/80 to-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BigWins />
        </div>
      </section>

      {/* CTA Section - Plus aérée */}
      <section className="py-24 bg-gradient-to-br from-black/40 to-gray-800/40">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Prêt à <span className="casino-neon-gold-light">dominer</span> le Blackjack ?
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez des milliers de joueurs qui ont déjà amélioré leurs compétences avec Blackjack Trainer Pro
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/entrainement">
              <Button className="casino-button-gold py-5 px-10 rounded-xl text-xl jackpot-effect">
                <Play className="w-6 h-6 mr-3" />
                Commencer maintenant
              </Button>
            </Link>
            
            <Link href="/histoire">
              <Button className="casino-button-light py-5 px-10 rounded-xl text-xl">
                <BookOpen className="w-6 h-6 mr-3" />
                Découvrir l'histoire
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Plus aéré */}
      <footer className="bg-gradient-to-br from-black to-gray-900 border-t border-casino-gold/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-300 mb-6 casino-neon-gold text-lg">
              © 2024 Blackjack Trainer Pro. Tous droits réservés.
            </p>
            <p className="text-slate-400 text-base">
              Édité et développé par <span className="casino-neon-gold-light font-medium">WebaZio</span> mon agence web
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
