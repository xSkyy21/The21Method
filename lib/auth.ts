import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function createUser(email: string, username: string, password: string) {
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      displayName: username,
      settings: {
        create: {
          theme: 'dark',
          soundEnabled: true,
          soundVolume: 0.7,
          defaultSeats: 1,
          defaultBankroll: 25000,
          basicAdviceEnabled: true,
          autoAdvance: true,
          showMyCount: false,
          countDisplayMode: 'both',
          emailNotifications: false,
          achievementAlerts: true,
        }
      }
    },
    include: {
      settings: true
    }
  })

  // Créer les achievements de base
  await createInitialAchievements(user.id)

  return user
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true }
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return user
}

async function createInitialAchievements(userId: string) {
  const initialAchievements = [
    {
      type: 'FIRST_HAND' as const,
      name: 'Première Main',
      description: 'Jouez votre première main de Blackjack',
      icon: '🎯',
      maxProgress: 1,
      points: 10
    },
    {
      type: 'FIRST_WIN' as const,
      name: 'Première Victoire',
      description: 'Remportez votre première main',
      icon: '🏆',
      maxProgress: 1,
      points: 25
    },
    {
      type: 'FIRST_BLACKJACK' as const,
      name: 'Premier Blackjack',
      description: 'Obtenez votre premier Blackjack',
      icon: '🃏',
      maxProgress: 1,
      points: 50
    },
    {
      type: 'HANDS_100' as const,
      name: 'Centenaire',
      description: 'Jouez 100 mains',
      icon: '💯',
      maxProgress: 100,
      points: 100
    },
    {
      type: 'BASIC_STRATEGY_MASTER' as const,
      name: 'Maître de la Stratégie',
      description: 'Atteignez 95% de précision en stratégie de base',
      icon: '🧠',
      maxProgress: 95,
      points: 200
    }
  ]

  await prisma.achievement.createMany({
    data: initialAchievements.map(achievement => ({
      userId,
      ...achievement
    }))
  })
}

export async function updateUserStats(userId: string, stats: {
  handsPlayed?: number
  winnings?: number
  losses?: number
  runningCount?: number
  trueCount?: number
  decisionsMade?: number
  correctDecisions?: number
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: true }
  })

  if (!user) return

  // Calculer les nouvelles statistiques
  const newTotalHands = user.totalHandsPlayed + (stats.handsPlayed || 0)
  const newTotalWinnings = user.totalWinnings + (stats.winnings || 0)
  const newTotalLosses = user.totalLosses + (stats.losses || 0)
  const newTotalDecisions = user.totalDecisions + (stats.decisionsMade || 0)
  const newCorrectDecisions = user.correctDecisions + (stats.correctDecisions || 0)
  
  // Calculer la précision de stratégie
  const newAccuracy = newTotalDecisions > 0 ? (newCorrectDecisions / newTotalDecisions) * 100 : 0

  // Mettre à jour l'utilisateur
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalHandsPlayed: newTotalHands,
      totalWinnings: newTotalWinnings,
      totalLosses: newTotalLosses,
      totalDecisions: newTotalDecisions,
      correctDecisions: newCorrectDecisions,
      basicStrategyAccuracy: newAccuracy,
      // Mettre à jour les comptages si fournis
      ...(stats.runningCount && { totalRunningCount: user.totalRunningCount + stats.runningCount }),
      ...(stats.trueCount && { 
        totalTrueCount: user.totalTrueCount + stats.trueCount,
        averageTrueCount: (user.totalTrueCount + stats.trueCount) / (user.totalHandsPlayed + (stats.handsPlayed || 0))
      })
    }
  })

  // Vérifier et mettre à jour les achievements
  await checkAndUpdateAchievements(userId, {
    handsPlayed: newTotalHands,
    accuracy: newAccuracy,
    winnings: newTotalWinnings
  })
}

async function checkAndUpdateAchievements(userId: string, stats: {
  handsPlayed: number
  accuracy: number
  winnings: number
}) {
  const achievements = await prisma.achievement.findMany({
    where: { userId }
  })

  const updates = []

  // Vérifier les achievements de mains jouées
  const handsAchievements = [
    { type: 'HANDS_100' as const, threshold: 100 },
    { type: 'HANDS_500' as const, threshold: 500 },
    { type: 'HANDS_1000' as const, threshold: 1000 },
    { type: 'HANDS_5000' as const, threshold: 5000 }
  ]

  for (const achievement of handsAchievements) {
    const existing = achievements.find(a => a.type === achievement.type)
    if (existing && !existing.completed && stats.handsPlayed >= achievement.threshold) {
      updates.push(
        prisma.achievement.update({
          where: { id: existing.id },
          data: { 
            progress: achievement.threshold,
            completed: true,
            unlockedAt: new Date()
          }
        })
      )
    }
  }

  // Vérifier l'achievement de stratégie de base
  const strategyAchievement = achievements.find(a => a.type === 'BASIC_STRATEGY_MASTER')
  if (strategyAchievement && !strategyAchievement.completed && stats.accuracy >= 95) {
    updates.push(
      prisma.achievement.update({
        where: { id: strategyAchievement.id },
        data: { 
          progress: 95,
          completed: true,
          unlockedAt: new Date()
        }
      })
    )
  }

  // Vérifier les achievements de gains
  const winningsAchievements = [
    { type: 'PROFIT_1000' as const, threshold: 1000 },
    { type: 'PROFIT_5000' as const, threshold: 5000 },
    { type: 'PROFIT_10000' as const, threshold: 10000 },
    { type: 'PROFIT_50000' as const, threshold: 50000 }
  ]

  for (const achievement of winningsAchievements) {
    const existing = achievements.find(a => a.type === achievement.type)
    if (existing && !existing.completed && stats.winnings >= achievement.threshold) {
      updates.push(
        prisma.achievement.update({
          where: { id: existing.id },
          data: { 
            progress: achievement.threshold,
            completed: true,
            unlockedAt: new Date()
          }
        })
      )
    }
  }

  // Exécuter toutes les mises à jour
  if (updates.length > 0) {
    await prisma.$transaction(updates)
  }
}
