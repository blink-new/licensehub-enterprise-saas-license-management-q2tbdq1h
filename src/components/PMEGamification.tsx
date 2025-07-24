import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Star, Target, TrendingUp, Users, Shield, 
  Award, Zap, CheckCircle, BarChart3, Sparkles, Crown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import blink from '@/blink/client'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  points: number
  unlocked: boolean
  progress: number
  maxProgress: number
  category: 'data' | 'optimization' | 'engagement' | 'milestone'
}

interface PMEGamificationProps {
  user: any
}

const PMEGamification: React.FC<PMEGamificationProps> = ({ user }) => {
  const [userScore, setUserScore] = useState(0)
  const [userLevel, setUserLevel] = useState(1)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [companyRank, setCompanyRank] = useState(0)
  const [industryBenchmark, setIndustryBenchmark] = useState(0)
  const [weeklyChallenge, setWeeklyChallenge] = useState<any>(null)

  const achievementsList: Achievement[] = useMemo(() => [
    {
      id: 'first_license',
      title: 'Premier pas',
      description: 'Ajoutez votre première licence',
      icon: Star,
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'data'
    },
    {
      id: 'data_collector',
      title: 'Collecteur de données',
      description: 'Renseignez 10 licences',
      icon: BarChart3,
      points: 500,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      category: 'data'
    },
    {
      id: 'cost_optimizer',
      title: 'Optimiseur de coûts',
      description: 'Identifiez €1000 d\'économies',
      icon: TrendingUp,
      points: 750,
      unlocked: false,
      progress: 0,
      maxProgress: 1000,
      category: 'optimization'
    },
    {
      id: 'team_builder',
      title: 'Bâtisseur d\'équipe',
      description: 'Invitez 5 collaborateurs',
      icon: Users,
      points: 300,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      category: 'engagement'
    }
  ], [])

  const weeklyChallengeSamples = useMemo(() => [
    {
      title: 'Semaine de l\'optimisation',
      description: 'Identifiez 3 licences sous-utilisées',
      reward: 200,
      progress: 0,
      maxProgress: 3,
      deadline: '2024-01-28'
    },
    {
      title: 'Défi collaboration',
      description: 'Invitez 2 nouveaux collaborateurs',
      reward: 150,
      progress: 0,
      maxProgress: 2,
      deadline: '2024-01-28'
    }
  ], [])

  const loadGamificationData = useCallback(async () => {
    try {
      // Charger les données de gamification depuis la base
      const licenses = await blink.db.software_licenses.list({
        where: { company_id: user?.company_id }
      })
      
      const invitations = await blink.db.user_invitations.list({
        where: { company_id: user?.company_id }
      })

      // Calculer le score et les achievements
      let score = 0
      const updatedAchievements = achievementsList.map(achievement => {
        let progress = 0
        let unlocked = false

        switch (achievement.id) {
          case 'first_license':
            progress = Math.min(licenses.length, 1)
            unlocked = licenses.length >= 1
            break
          case 'data_collector':
            progress = Math.min(licenses.length, 10)
            unlocked = licenses.length >= 10
            break
          case 'team_builder':
            progress = Math.min(invitations.length, 5)
            unlocked = invitations.length >= 5
            break
          default:
            // Simulation pour les autres achievements
            progress = Math.floor(Math.random() * achievement.maxProgress)
            unlocked = progress >= achievement.maxProgress
        }

        if (unlocked) {
          score += achievement.points
        }

        return { ...achievement, progress, unlocked }
      })

      setAchievements(updatedAchievements)
      setUserScore(score)
      setUserLevel(Math.floor(score / 500) + 1)
      
      // Simulation des données de benchmark
      setCompanyRank(Math.floor(Math.random() * 100) + 1)
      setIndustryBenchmark(Math.floor(Math.random() * 100) + 1)
      
      // Défi hebdomadaire aléatoire
      setWeeklyChallenge(weeklyChallengeSamples[Math.floor(Math.random() * weeklyChallengeSamples.length)])

    } catch (error) {
      console.error('Erreur lors du chargement des données de gamification:', error)
    }
  }, [user?.company_id, achievementsList, weeklyChallengeSamples])

  useEffect(() => {
    loadGamificationData()
  }, [loadGamificationData])

  const getLevelProgress = () => {
    const currentLevelMin = (userLevel - 1) * 500
    const nextLevelMin = userLevel * 500
    const progress = ((userScore - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
    return Math.min(progress, 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 2000) return 'text-purple-600'
    if (score >= 1000) return 'text-blue-600'
    if (score >= 500) return 'text-green-600'
    return 'text-gray-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data': return BarChart3
      case 'optimization': return TrendingUp
      case 'engagement': return Users
      case 'milestone': return Trophy
      default: return Star
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data': return 'bg-blue-100 text-blue-700'
      case 'optimization': return 'bg-green-100 text-green-700'
      case 'engagement': return 'bg-purple-100 text-purple-700'
      case 'milestone': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Score et Niveau */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Score total</p>
                <p className={`text-2xl font-bold ${getScoreColor(userScore)}`}>
                  {userScore.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Niveau {userLevel}</p>
                  <p className="text-xs text-gray-500">
                    {userScore}/{userLevel * 500}
                  </p>
                </div>
                <Progress value={getLevelProgress()} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Classement</p>
                <p className="text-2xl font-bold text-yellow-600">
                  #{companyRank}
                </p>
                <p className="text-xs text-gray-500">sur votre secteur</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Défi Hebdomadaire */}
      {weeklyChallenge && (
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900">Défi de la semaine</span>
              <Badge variant="secondary" className="ml-auto">
                +{weeklyChallenge.reward} pts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-blue-900">{weeklyChallenge.title}</h4>
                <p className="text-sm text-blue-700">{weeklyChallenge.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <Progress 
                    value={(weeklyChallenge.progress / weeklyChallenge.maxProgress) * 100} 
                    className="h-2"
                  />
                </div>
                <span className="text-sm text-blue-600">
                  {weeklyChallenge.progress}/{weeklyChallenge.maxProgress}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Se termine le {new Date(weeklyChallenge.deadline).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Succès débloqués</span>
            <Badge variant="secondary">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon
              const CategoryIcon = getCategoryIcon(achievement.category)
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.unlocked
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        achievement.unlocked
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${
                          achievement.unlocked
                            ? 'text-green-900'
                            : 'text-gray-700'
                        }`}>
                          {achievement.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={getCategoryColor(achievement.category)}
                          >
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {achievement.category}
                          </Badge>
                          <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                            +{achievement.points}
                          </Badge>
                        </div>
                      </div>
                      <p className={`text-sm mb-2 ${
                        achievement.unlocked
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      )}
                      {achievement.unlocked && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Débloqué !</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Sectoriel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Benchmark sectoriel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-semibold text-blue-900">Votre position</p>
                <p className="text-sm text-blue-700">
                  Vous êtes dans le top {100 - industryBenchmark}% de votre secteur
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">#{companyRank}</p>
                <p className="text-sm text-blue-500">sur 1,247 entreprises</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">92%</p>
                <p className="text-sm text-green-700">Complétude des données</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">€18,400</p>
                <p className="text-sm text-purple-700">Économies identifiées</p>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Voir le rapport complet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PMEGamification