"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Target, 
  History, 
  Trophy, 
  Brain,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "S'entraîner", href: "/entrainement", icon: Target },
    { name: "Apprentissage", href: "/apprentissage", icon: Brain },
    { name: "Histoire", href: "/histoire", icon: History },
    { name: "Classement", href: "/classement", icon: Trophy },
  ]

  return (
    <>
      {/* Bouton hamburger */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu mobile */}
          <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl shadow-slate-900/50">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-casino-gold">♠</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-casino-gold">
                      Blackjack Trainer
                    </h1>
                    <p className="text-xs text-casino-silver font-medium">Pro</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-slate-700/30 to-slate-600/30 text-white border border-slate-600/30 shadow-lg"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-casino-gold rounded-full" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 text-center">
                  © 2024 Blackjack Trainer Pro
                </p>
                <p className="text-xs text-slate-500 text-center mt-1">
                  Développé par <span className="text-casino-gold">WebaZio</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
