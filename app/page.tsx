"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Shield, Brain, Target, Zap, CheckCircle, Play } from "lucide-react"
import { useState } from "react"

const floatingCards = [
  { suit: "♠", rank: "A", delay: 0 },
  { suit: "♥", rank: "K", delay: 0.5 },
  { suit: "♦", rank: "Q", delay: 1 },
  { suit: "♣", rank: "J", delay: 1.5 },
]

const features = [
  {
    icon: Brain,
    title: "Stratégie de base",
    description: "Joue mathématiquement optimal selon ta main et la carte visible du croupier.",
  },
  {
    icon: Target,
    title: "Comptage Hi-Lo",
    description: "Suis la balance de cartes hautes/basses pour estimer l'avantage.",
  },
  {
    icon: Zap,
    title: "Pratique guidée",
    description: "Timer, quiz de comptage, et conseils visuels sur l'action idéale.",
  },
]

const rules = [
  "S17/H17 configurable",
  "Double 9-11 / 10-11 / tous",
  "Split & re-split",
  "As split 1 carte",
  "Assurance 2:1",
  "FR no-hole ou US peek",
]

const faqItems = [
  {
    question: "Le comptage est-il légal ?",
    answer:
      "Oui dans la plupart des pays tant que tu n'utilises pas d'appareil. C'est une compétence mentale légitime.",
  },
  {
    question: "S17 vs H17 ?",
    answer: "S17 : croupier reste sur 17 souple; H17 : il tire sur 17 souple. S17 est plus favorable au joueur.",
  },
  {
    question: "Pourquoi le 3:2 est mieux que 6:5 ?",
    answer:
      "Le paiement 3:2 pour Blackjack donne 1,5x ta mise, tandis que 6:5 ne donne que 1,2x. Évite les tables 6:5.",
  },
  {
    question: "No-hole (France) ?",
    answer: "Le croupier ne vérifie pas le Blackjack avant la fin. Différent des règles US où il 'peek' immédiatement.",
  },
]

export default function HomePage() {
  const [remainingDecks, setRemainingDecks] = useState(4.5)
  const runningCount = 8
  const trueCount = Math.round((runningCount / remainingDecks) * 10) / 10

  return (
    <div className="min-h-screen webazio-bg pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Cards Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingCards.map((card, index) => (
            <motion.div
              key={index}
              className="absolute w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold"
              style={{
                left: `${20 + index * 20}%`,
                top: `${30 + (index % 2) * 40}%`,
              }}
              initial={{ opacity: 0, y: 100, rotate: -10 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [100, -20, -40, -100],
                rotate: [-10, 5, -5, 10],
              }}
              transition={{
                duration: 4,
                delay: card.delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 2,
              }}
            >
              <span className={card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"}>
                {card.rank}
                {card.suit}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance">
              Apprends à battre le{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent webazio-glow">
                Blackjack
              </span>{" "}
              comme un pro
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 text-pretty max-w-3xl mx-auto">
              Stratégie de base, comptage Hi-Lo, sabot prouvé équitable. Entraîne-toi avec un croupier automatique et
              une aide visuelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="webazio-button-primary text-lg px-8 py-4">
                <Link href="/entrainement">
                  <Play className="mr-2 h-5 w-5" />
                  S'entraîner maintenant
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 bg-transparent border-accent/50 hover:border-accent"
              >
                <Link href="/histoire">
                  Histoire du Blackjack
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comment ça marche</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Trois piliers pour maîtriser le Blackjack professionnel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="webazio-card h-full hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Règles configurables</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">Adapte ton entraînement aux variantes de casino</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 gap-4">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-white/80">{rule}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="webazio-card">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-accent" />
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      Sabot prouvé équitable
                    </Badge>
                  </div>
                  <CardTitle className="text-white">Preuve d'équité</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70">
                    Avant chaque sabot, nous publions le hash SHA-256 de l'ordre des cartes. À la fin, nous révélons
                    l'ordre + seeds pour vérification indépendante.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Counting Demo Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comptage Hi-Lo</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Comprends la différence entre Running Count et True Count
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="webazio-card">
                <CardHeader>
                  <CardTitle className="text-white">Système Hi-Lo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-white/80">
                    <p className="mb-2">
                      <strong>2–6 = +1</strong> (cartes basses)
                    </p>
                    <p className="mb-2">
                      <strong>7–9 = 0</strong> (neutres)
                    </p>
                    <p className="mb-4">
                      <strong>10/J/Q/K/A = −1</strong> (cartes hautes)
                    </p>
                    <p className="text-accent">
                      <strong>True Count = Running Count ÷ Paquets restants</strong>
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-white/80 text-sm">
                      <strong>Exemple :</strong> A + 4 = 5 / 15 (souple)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="webazio-card">
                <CardHeader>
                  <CardTitle className="text-white">Calculateur interactif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm">Paquets restants: {remainingDecks}</label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.5}
                      value={remainingDecks}
                      onChange={(e) => setRemainingDecks(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-white">{runningCount}</div>
                      <div className="text-sm text-white/70">Running Count</div>
                    </div>
                    <div className="bg-accent/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-accent">{trueCount}</div>
                      <div className="text-sm text-white/70">True Count</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Prêt à commencer ?</h2>
            <p className="text-xl text-white/70 mb-8">Lance une table jusqu'à 4 sièges et commence à compter.</p>
            <Button asChild size="lg" className="webazio-button-primary text-lg px-12 py-4">
              <Link href="/entrainement">
                <Play className="mr-2 h-5 w-5" />
                S'entraîner maintenant
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Questions fréquentes</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="webazio-card border-0 px-6 py-2">
                  <AccordionTrigger className="text-white hover:text-primary text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/70 pt-2">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
