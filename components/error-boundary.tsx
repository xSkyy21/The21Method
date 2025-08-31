"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return (
        <div className="min-h-screen webazio-bg flex items-center justify-center p-4">
          <Card className="webazio-card p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-white mb-4">Erreur inattendue</h2>
            <p className="text-white/80 mb-6">Une erreur s'est produite dans l'application. Veuillez réessayer.</p>
            <div className="space-y-3">
              <Button onClick={this.resetError} className="webazio-button-primary w-full">
                Réessayer
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="webazio-button-secondary w-full"
              >
                Recharger la page
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-white/60 cursor-pointer">Détails de l'erreur</summary>
                <pre className="text-xs text-red-400 mt-2 overflow-auto">{this.state.error.stack}</pre>
              </details>
            )}
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
