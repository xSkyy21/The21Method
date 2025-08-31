"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Download, Eye, EyeOff, HelpCircle, Lock, Unlock } from "lucide-react"
import { useShoe } from "@/store/useShoe"
import type { ProofExport } from "@/lib/types"

export function FairnessPanel() {
  const { fair, generateCommittedShoe, revealShoe, newFairSeeds } = useShoe()
  const [clientSeed, setClientSeed] = useState(fair.seedClient)
  const [showProof, setShowProof] = useState(false)
  const [proofData, setProofData] = useState<ProofExport | null>(null)

  const handleGenerateSeeds = () => {
    newFairSeeds(clientSeed || undefined)
  }

  const handleCommitShoe = () => {
    generateCommittedShoe()
  }

  const handleRevealShoe = () => {
    const proof = revealShoe()
    setProofData(proof)
    setShowProof(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadProof = () => {
    if (!proofData) return

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blackjack-proof-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          {fair.revealed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          Équité Prouvable
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Système cryptographique qui prouve que les cartes étaient fixées avant le jeu, empêchant toute
                  manipulation.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seeds & Hash Section */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="client-seed" className="text-sm font-medium">
              Seed Client (optionnel)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="client-seed"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="Votre seed personnalisé..."
                className="text-sm"
                disabled={!!fair.sha256Commitment}
              />
              <Button onClick={handleGenerateSeeds} disabled={!!fair.sha256Commitment} size="sm" variant="outline">
                Générer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Seed Système</Label>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded border">{fair.seedSystem || "Non généré"}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nonce</Label>
              <div className="font-mono text-xs bg-muted/50 p-2 rounded border">{fair.nonce}</div>
            </div>
          </div>

          {fair.sha256Commitment && (
            <div>
              <Label className="text-xs text-muted-foreground">Hash du Sabot (Engagement)</Label>
              <div className="flex items-center gap-2">
                <div className="font-mono text-xs bg-muted/50 p-2 rounded border flex-1 break-all">
                  {fair.sha256Commitment}
                </div>
                <Button
                  onClick={() => copyToClipboard(fair.sha256Commitment)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center justify-between">
          <Badge variant={fair.revealed ? "secondary" : fair.sha256Commitment ? "default" : "outline"}>
            {fair.revealed ? "Révélé 🔓" : fair.sha256Commitment ? "Engagement actif ✅" : "En attente"}
          </Badge>

          <div className="flex gap-2">
            {!fair.sha256Commitment && (
              <Button onClick={handleCommitShoe} size="sm">
                Créer l'engagement
              </Button>
            )}

            {fair.sha256Commitment && !fair.revealed && (
              <Button onClick={handleRevealShoe} size="sm" variant="outline">
                Révéler maintenant
              </Button>
            )}

            {fair.revealed && proofData && (
              <Button onClick={downloadProof} size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Exporter JSON
              </Button>
            )}
          </div>
        </div>

        {/* Verification Instructions */}
        {fair.sha256Commitment && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Eye className="h-3 w-3 mr-1" />
                Instructions de vérification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vérification de l'équité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Étapes de vérification :</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Recalculer le mélange Fisher-Yates avec Mulberry32(seedClient:seedSystem:nonce)</li>
                    <li>Calculer SHA-256 sur l'ordre des cartes + nonce + règles</li>
                    <li>Comparer le hash avec l'engagement initial</li>
                    <li>Vérifier que les cartes distribuées correspondent à l'ordre prévu</li>
                  </ol>
                </div>
                <Textarea
                  readOnly
                  value={`// Code de vérification JavaScript
const crypto = require('crypto');

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function hash32(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Utiliser les données du JSON exporté pour vérifier`}
                  className="font-mono text-xs"
                  rows={10}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Proof Display */}
        {showProof && proofData && (
          <div className="mt-4 p-3 bg-muted/30 rounded border">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Preuve complète</Label>
              <Button onClick={() => setShowProof(!showProof)} size="sm" variant="ghost" className="h-6 w-6 p-0">
                {showProof ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="text-xs font-mono bg-background/50 p-2 rounded border overflow-auto max-h-32">
              {JSON.stringify(proofData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
