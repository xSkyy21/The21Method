"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSlider,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BettingSettingsDialog } from "@/components/betting-settings-dialog"
import { Menu, Volume2, Settings, HelpCircle } from "lucide-react"
import { sfx } from "@/lib/sfx"
import { cn } from "@/lib/utils"
import { useShoe } from "@/store/useShoe"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const [volume, setVolume] = useState(70)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { ui, updateSettings } = useShoe()

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    sfx.setVolume(newVolume / 100)
  }

  const toggleSound = () => {
    const newEnabled = !soundEnabled
    setSoundEnabled(newEnabled)
    sfx.enable(newEnabled)
  }

  const toggleGameHelp = () => {
    updateSettings({ basicAdvice: !ui.basicAdvice })
  }

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/entrainement", label: "S'entraîner" },
    { href: "/histoire", label: "Histoire" },
    { href: "/classement", label: "Classement" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 safe-area-inset-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/images/the-method-logo.png" alt="The Method" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold text-accent webazio-accent-glow">WebaZio</span>
            <span className="text-lg font-medium text-white">Blackjack Trainer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-white/80 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-2">
            {pathname === "/entrainement" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleGameHelp}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-colors",
                  ui.basicAdvice
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "text-white/80 hover:text-white hover:bg-primary/20",
                )}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Aide au jeu
              </Button>
            )}

            {/* Audio Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={toggleSound}>
                  {soundEnabled ? "Désactiver les sons" : "Activer les sons"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1">
                  <div className="text-xs text-muted-foreground mb-2">Volume: {volume}%</div>
                  <DropdownMenuSlider value={volume} onValueChange={handleVolumeChange} min={0} max={100} step={5} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <BettingSettingsDialog>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/20">
                <Settings className="h-4 w-4" />
              </Button>
            </BettingSettingsDialog>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card/95 backdrop-blur-md">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                      pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-white/80 hover:text-white hover:bg-white/5",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="border-t border-white/10 pt-4 mt-4">
                  {pathname === "/entrainement" && (
                    <Button
                      variant="ghost"
                      onClick={toggleGameHelp}
                      className={cn(
                        "w-full justify-start mb-2",
                        ui.basicAdvice ? "text-primary bg-primary/10" : "text-white/80 hover:text-white",
                      )}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      {ui.basicAdvice ? "Désactiver l'aide" : "Activer l'aide au jeu"}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={toggleSound}
                    className="w-full justify-start text-white/80 hover:text-white"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    {soundEnabled ? "Désactiver les sons" : "Activer les sons"}
                  </Button>

                  <div className="px-4 py-2">
                    <div className="text-sm text-muted-foreground mb-2">Volume: {volume}%</div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <BettingSettingsDialog>
                    <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white mt-2">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Button>
                  </BettingSettingsDialog>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
