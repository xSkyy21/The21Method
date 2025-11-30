"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

export function BigWins() {
  const wins = [
    { game: "BLACKJACK PRO", player: "Alex M.", amount: "47,250€", time: "2 min" },
    { game: "HI-LO MASTER", player: "Sarah K.", amount: "32,180€", time: "5 min" },
    { game: "CARD COUNTER", player: "Mike R.", amount: "28,950€", time: "8 min" },
    { game: "STRATEGY PRO", player: "Emma L.", amount: "25,670€", time: "12 min" },
    { game: "BLACKJACK ACE", player: "Tom B.", amount: "22,340€", time: "15 min" },
  ]

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          <span className="casino-neon-gold-light">Grandes Victoires</span> Récentes
        </h2>
        <p className="text-slate-400 text-sm">
          Nos joueurs dominent les casinos avec leurs compétences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wins.map((win, index) => (
          <Card key={index} className="casino-card p-4 border border-casino-gold/20 hover:border-casino-gold/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-full flex items-center justify-center">
                  <Image
                    src="/images/casino/playing-card-symbols-clubs.png"
                    alt="Symbole trèfle 3D"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{win.game}</div>
                  <div className="text-xs text-slate-400">{win.player}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">{win.time}</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold casino-neon-gold-light mb-1">
                {win.amount}
              </div>
              <div className="text-xs text-slate-400">Gain réalisé</div>
            </div>

            {/* Effet de lueur au survol */}
            <div className="absolute inset-0 rounded-lg bg-casino-gold/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* Message d'encouragement */}
      <div className="mt-6 text-center">
          <div className="casino-card p-6 border border-casino-gold/30">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-full flex items-center justify-center">
                <Image
                  src="/images/casino/slot-machine.png"
                  alt="Jetons de casino"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Votre Tour Arrive</h3>
                <p className="text-sm text-slate-400">Rejoignez les gagnants</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              Avec la bonne stratégie et l'entraînement, vous pouvez aussi battre les casinos. 
              Commencez votre formation dès maintenant !
            </p>
          </div>
      </div>
    </div>
  )
}
