import type { Metadata } from "next"
import { Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Classement - WebaZio Blackjack Trainer",
  description: "Tableau de classement des joueurs - Fonctionnalité à venir",
}

export default function ClassementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Classement</h1>
          <div className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium mb-6">
            🔒 À venir dans les prochaines mises à jour
          </div>
        </div>

        <div className="space-y-6 text-white/80">
          <p className="text-lg">Le tableau de classement arrivera bientôt avec le suivi de vos performances :</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">📊 Statistiques</h3>
              <ul className="text-sm space-y-1">
                <li>• Bankroll maximum atteint</li>
                <li>• Taux de réussite des décisions</li>
                <li>• Vitesse de prise de décision</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">🎯 Comptage</h3>
              <ul className="text-sm space-y-1">
                <li>• Précision du Running Count</li>
                <li>• Exactitude du True Count</li>
                <li>• Comparaison avec la machine</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              Être notifié du lancement
            </h3>
            <p className="text-sm mb-4">Recevez un email dès que le classement sera disponible</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                type="email"
                placeholder="votre@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button className="bg-primary hover:bg-primary/90">Notifier</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
