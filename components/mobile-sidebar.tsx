"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Target, 
  History, 
  Trophy, 
  Crown,
  Brain,
  X,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react"
import { useShoe } from "@/store/useShoe"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { ui, updateSettings } = useShoe()
  const { toast } = useToast()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "S'entraîner", href: "/entrainement", icon: Target },
    { name: "Apprentissage", href: "/apprentissage", icon: Brain },
    { name: "Comptage Rapide", href: "/comptage-rapide", icon: Zap },
    { name: "Histoire", href: "/histoire", icon: History },
    { name: "Classement", href: "/classement", icon: Trophy },
  ]

  const toggleSound = () => {
    const newSoundEnabled = !ui.soundEnabled
    updateSettings({ soundEnabled: newSoundEnabled })
    toast({
      title: newSoundEnabled ? "🔊 Son activé" : "🔇 Son désactivé",
      description: newSoundEnabled ? "Les effets sonores sont maintenant actifs" : "Les effets sonores sont désactivés",
      duration: 2000,
    })
  }

  const handleLogout = () => {
    toast({
      title: "👋 Déconnexion",
      description: "Vous avez été déconnecté avec succès",
      duration: 3000,
    })
    setIsUserMenuOpen(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Sidebar mobile */}
      <div className="fixed left-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-gray-800/50 shadow-2xl shadow-gray-900/50 md:hidden">
        <div className="flex flex-col h-full">
          {/* Header avec logo */}
          <div className="p-4 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group" onClick={onClose}>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/25 group-hover:shadow-gray-900/40 transition-all duration-300 group-hover:scale-105">
                    <Crown className="w-6 h-6 text-casino-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">v23</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-casino-gold">
                    Blackjack Trainer
                  </h1>
                  <p className="text-xs text-casino-silver font-medium">Pro</p>
                </div>
              </Link>
              
              {/* Bouton fermer */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 group",
                    isActive
                      ? "bg-gradient-to-r from-casino-gold/20 to-casino-gold-dark/20 text-casino-gold border border-casino-gold/20 shadow-lg shadow-casino-gold/10"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-casino-gold rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions utilisateur */}
          <div className="p-4 border-t border-gray-800/50 space-y-2">
            {/* Bouton d'aide */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 px-3"
              onClick={() => {
                toast({
                  title: "🎯 Aide au jeu",
                  description: "Utilisez les recommandations de stratégie de base pour optimiser vos décisions",
                  duration: 4000,
                })
              }}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3">Aide</span>
            </Button>

            {/* Bouton son */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 px-3"
              onClick={toggleSound}
            >
              {ui.soundEnabled ? (
                <Volume2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <VolumeX className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="ml-3">Son</span>
            </Button>

            {/* Bouton paramètres */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 px-3"
              onClick={() => {
                toast({
                  title: "⚙️ Paramètres",
                  description: "Fonctionnalité en cours de développement",
                  duration: 3000,
                })
              }}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3">Paramètres</span>
            </Button>

            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 px-3"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">Profil</span>
              </Button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl shadow-gray-900/50 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-800/50">
                    <p className="text-sm font-medium text-white">
                      {ui.playerName || "Joueur"}
                    </p>
                    <p className="text-xs text-gray-400">Joueur invité</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
