"use client"

import { Search, Bell, Globe, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl shadow-gray-900/50 transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-6">
        {/* Titre de la page actuelle */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-bold text-white">
              Blackjack Trainer Pro
            </h1>
            <p className="text-sm text-gray-400">
              Maîtrisez l'art du Blackjack
            </p>
          </div>
        </div>

        {/* Actions de droite */}
        <div className="flex items-center space-x-3">
          {/* Bouton de recherche */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            onClick={() => {
              // TODO: Implémenter la recherche
            }}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Bouton notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 relative"
            onClick={() => {
              // TODO: Implémenter les notifications
            }}
          >
            <Bell className="w-4 h-4" />
            {/* Badge de notification */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </div>
          </Button>

          {/* Bouton langue */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            onClick={() => {
              // TODO: Implémenter le sélecteur de langue
            }}
          >
            <Globe className="w-4 h-4" />
          </Button>

          {/* Bouton connexion */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-gray-300 border-gray-700 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-300"
            onClick={() => {
              // TODO: Implémenter la connexion
            }}
          >
            Se connecter
          </Button>

          {/* Bouton inscription */}
          <Button
            size="sm"
            className="h-9 px-4 bg-gradient-to-r from-casino-gold to-casino-gold-dark text-casino-black hover:from-casino-gold-light hover:to-casino-gold rounded-xl transition-all duration-300 font-medium"
            onClick={() => {
              // TODO: Implémenter l'inscription
            }}
          >
            S'inscrire
          </Button>
        </div>
      </div>

      {/* Sidebar mobile */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  )
}
