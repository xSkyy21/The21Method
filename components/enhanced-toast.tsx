"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  X,
  Star,
  Target,
  Brain,
  DollarSign
} from "lucide-react"
import { useEffect, useState } from "react"

interface EnhancedToastProps {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info' | 'warning' | 'achievement'
  duration?: number
  onClose?: () => void
}

export function EnhancedToast({ 
  title, 
  description, 
  type = 'info', 
  duration = 4000,
  onClose 
}: EnhancedToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-casino-gold" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'error':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      default:
        return 'bg-gradient-to-r from-casino-gold/20 to-casino-gold-dark/20 border-casino-gold/30'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-20 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <Card className={`casino-card p-4 border-2 ${getBackgroundColor()}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {title}
            </h4>
            {description && (
              <p className="text-xs text-slate-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-white flex-shrink-0"
            onClick={handleClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Hook pour utiliser les toasts améliorés
export function useEnhancedToast() {
  const { toast } = useToast()

  const showToast = (props: Omit<EnhancedToastProps, 'onClose'>) => {
    // Pour l'instant, on utilise le toast standard
    // Dans une vraie implémentation, on pourrait gérer un système de queue
    toast({
      title: props.title,
      description: props.description,
      duration: props.duration,
    })
  }

  return {
    success: (title: string, description?: string) => 
      showToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) => 
      showToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) => 
      showToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) => 
      showToast({ title, description, type: 'info' }),
    achievement: (title: string, description?: string) => 
      showToast({ title, description, type: 'achievement' }),
  }
}
