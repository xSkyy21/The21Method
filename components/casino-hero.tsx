"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function CasinoHero() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Valeurs fixes pour les particules
  const heroParticleData = [
    { left: "10%", top: "20%", delay: "0.5s", duration: "2.5s" },
    { left: "20%", top: "80%", delay: "1.2s", duration: "3.2s" },
    { left: "30%", top: "40%", delay: "0.8s", duration: "2.8s" },
    { left: "40%", top: "90%", delay: "1.5s", duration: "3.5s" },
    { left: "50%", top: "10%", delay: "0.3s", duration: "2.3s" },
    { left: "60%", top: "70%", delay: "1.8s", duration: "3.8s" },
    { left: "70%", top: "30%", delay: "0.7s", duration: "2.7s" },
    { left: "80%", top: "60%", delay: "1.1s", duration: "3.1s" },
    { left: "90%", top: "50%", delay: "0.9s", duration: "2.9s" },
    { left: "5%", top: "75%", delay: "1.6s", duration: "3.6s" },
    { left: "15%", top: "15%", delay: "0.4s", duration: "2.4s" },
    { left: "25%", top: "85%", delay: "1.3s", duration: "3.3s" },
    { left: "35%", top: "25%", delay: "0.6s", duration: "2.6s" },
    { left: "45%", top: "95%", delay: "1.7s", duration: "3.7s" },
    { left: "55%", top: "5%", delay: "0.2s", duration: "2.2s" },
    { left: "65%", top: "65%", delay: "1.4s", duration: "3.4s" },
    { left: "75%", top: "35%", delay: "0.1s", duration: "2.1s" },
    { left: "85%", top: "55%", delay: "1.9s", duration: "3.9s" },
    { left: "95%", top: "45%", delay: "0.8s", duration: "2.8s" },
    { left: "2%", top: "85%", delay: "1.0s", duration: "3.0s" }
  ]
  return (
    <div className="relative w-full min-h-[800px] overflow-hidden rounded-2xl casino-card border-2 border-casino-gold/20">
      {/* Background avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-casino-black via-casino-dark to-casino-darker" />
      
      {/* Particules dorées flottantes - Compatible SSR */}
      {isClient && (
        <div className="absolute inset-0">
          {heroParticleData.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-casino-gold rounded-full opacity-30 animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative z-10 h-full p-8 md:p-12">
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Battez les</span>
            <br />
            <span className="casino-neon-gold-light">Casinos</span>
          </h1>
        </div>

        {/* Section avec paragraphes et images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Paragraphe 1 - Système Hi-Lo */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/casino/playing-card-symbols-clubs.png"
                  alt="Système Hi-Lo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-casino-gold-light">Système Hi-Lo Éprouvé</h2>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              Maîtrisez l'art du comptage de cartes avec le système Hi-Lo, la méthode la plus populaire 
              et efficace pour développer votre avantage sur la maison. Apprenez à compter les cartes 
              comme un professionnel et maximisez vos chances de victoire.
            </p>
            <div className="flex items-center gap-2 text-casino-gold-light">
              <div className="w-2 h-2 bg-casino-gold rounded-full" />
              <span className="text-sm font-medium">Méthode utilisée par les pros</span>
            </div>
          </div>

          {/* Image 1 - Cartes et système */}
          <div className="flex justify-center">
            <div className="relative float-gentle">
              <div className="w-80 h-60 relative overflow-hidden rounded-xl border-2 border-casino-gold/20 shadow-2xl glow-pulse">
                <Image
                  src="/images/casino/casino-game.png"
                  alt="Système de comptage Hi-Lo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-casino-gold/20 blur-xl -z-10" />
            </div>
          </div>

          {/* Image 2 - Machine à sous */}
          <div className="flex justify-center lg:order-first">
            <div className="relative float-gentle" style={{ animationDelay: '0.5s' }}>
              <div className="w-80 h-60 relative overflow-hidden rounded-xl border-2 border-casino-gold/20 shadow-2xl glow-pulse">
                <Image
                  src="/images/casino/casino-slot-machine.png"
                  alt="Casino et jeux"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-casino-gold/20 blur-xl -z-10" />
            </div>
          </div>

          {/* Paragraphe 2 - Stratégie de base */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/casino/slot-machine.png"
                  alt="Stratégie de base"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-casino-gold-light">Stratégie de Base Optimale</h2>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              Développez votre expertise avec la stratégie de base optimale. Apprenez les décisions 
              parfaites pour chaque situation de jeu et réduisez l'avantage de la maison. 
              Devenez un expert du Blackjack avec nos outils d'entraînement avancés.
            </p>
            <div className="flex items-center gap-2 text-casino-gold-light">
              <div className="w-2 h-2 bg-casino-gold rounded-full" />
              <span className="text-sm font-medium">Décisions optimales garanties</span>
            </div>
          </div>

          {/* Paragraphe 3 - Récompenses */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/casino/pot-of-gold.png"
                  alt="Récompenses"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-casino-gold-light">Récompenses et Victoires</h2>
            </div>
            <p className="text-lg text-slate-300 leading-relaxed">
              Rejoignez des milliers de joueurs qui ont déjà amélioré leurs compétences et augmenté 
              leurs gains. Avec la bonne stratégie et l'entraînement, vous pouvez aussi battre les casinos 
              et réaliser des profits consistants.
            </p>
            <div className="flex items-center gap-2 text-casino-gold-light">
              <div className="w-2 h-2 bg-casino-gold rounded-full" />
              <span className="text-sm font-medium">Gains réels documentés</span>
            </div>
          </div>

          {/* Image 3 - Pot d'or */}
          <div className="flex justify-center">
            <div className="relative float-gentle" style={{ animationDelay: '1s' }}>
              <div className="w-80 h-60 relative overflow-hidden rounded-xl border-2 border-casino-gold/20 shadow-2xl glow-pulse">
                <Image
                  src="/images/casino/pot-of-gold.png"
                  alt="Récompenses et gains"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-casino-gold/20 blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Effet de particules en mouvement - Compatible SSR */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "10%", top: "20%", duration: "3.2s", delay: "0.5s" },
            { left: "30%", top: "60%", duration: "4.1s", delay: "1.2s" },
            { left: "50%", top: "10%", duration: "3.8s", delay: "0.8s" },
            { left: "70%", top: "80%", duration: "3.5s", delay: "1.5s" },
            { left: "90%", top: "40%", duration: "4.3s", delay: "0.3s" },
            { left: "15%", top: "75%", duration: "3.7s", delay: "1.8s" },
            { left: "35%", top: "25%", duration: "4.0s", delay: "0.7s" },
            { left: "55%", top: "85%", duration: "3.3s", delay: "1.1s" },
            { left: "75%", top: "15%", duration: "3.9s", delay: "0.9s" },
            { left: "95%", top: "65%", duration: "3.6s", delay: "1.6s" }
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-casino-gold rounded-full opacity-40"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float ${particle.duration} ease-in-out infinite`,
                animationDelay: particle.delay
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
