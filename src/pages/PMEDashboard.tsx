import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle, Plus, 
  Target, Award, Sparkles, ArrowRight, BarChart3, 
  DollarSign, Calendar, Shield, Zap, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/hooks/useLanguage'
import blink from '@/blink/client'
import PMEOnboarding from '@/components/PMEOnboarding'
import PMEGamification from '@/components/PMEGamification'

interface PMEDashboardProps {
  user: any
}

const PMEDashboard: React.FC<PMEDashboardProps> = ({ user }) => {
  const { t } = useLanguage()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showGamification, setShowGamification] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    totalLicenses: 0,
    totalCost: 0,
    potentialSavings: 0,
    utilizationRate: 0,
    expiringLicenses: 0,
    pendingDeclarations: 0,
    teamSize: 0,
    complianceScore: 0
  })
  const [quickActions, setQuickActions] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [isFirstTime, setIsFirstTime] = useState(false)

  const generateRecommendations = useCallback((licenses: any[], utilizationRate: number, savings: number) => {
    const recs = []

    if (utilizationRate < 70) {
      recs.push({
        id: 'optimize_licenses',
        title: 'Optimisez vos licences sous-utilisées',
        description: `${Math.floor((100 - utilizationRate))}% de vos sièges sont inutilisés`,
        impact: `€${Math.floor(savings)}/mois d'économies`,
        action: 'Analyser',
        priority: 'high',
        icon: TrendingUp
      })
    }

    if (licenses.length < 5) {
      recs.push({
        id: 'add_more_data',
        title: 'Ajoutez plus de licences pour de meilleures recommandations',
        description: 'Plus de données = recommandations plus précises',
        impact: 'Économies supplémentaires identifiées',
        action: 'Ajouter',
        priority: 'medium',
        icon: Plus
      })
    }

    if (dashboardData.teamSize < 3) {
      recs.push({
        id: 'invite_team',
        title: 'Invitez votre équipe',
        description: 'Obtenez une vue complète de votre parc logiciel',
        impact: 'Visibilité améliorée',
        action: 'Inviter',
        priority: 'medium',
        icon: Users
      })
    }

    recs.push({
      id: 'security_audit',
      title: 'Audit sécurité gratuit',
      description: 'Identifiez les risques dans votre stack logiciel',
      impact: 'Conformité RGPD',
      action: 'Démarrer',
      priority: 'low',
      icon: Shield
    })

    setRecommendations(recs.slice(0, 3))
  }, [dashboardData.teamSize])

  const generateQuickActions = useCallback((licenseCount: number, declarationCount: number) => {
    const actions = [
      {
        id: 'add_license',
        title: 'Ajouter une licence',
        description: 'Référencez un nouveau logiciel',
        icon: Plus,
        color: 'bg-blue-500',
        path: '/licenses'
      },
      {
        id: 'declare_software',
        title: 'Déclarer un logiciel',
        description: 'Demandez une nouvelle licence',
        icon: Target,
        color: 'bg-green-500',
        path: '/declarations'
      }
    ]

    if (licenseCount > 0) {
      actions.push({
        id: 'view_renewals',
        title: 'Gérer les renouvellements',
        description: 'Optimisez vos coûts',
        icon: Calendar,
        color: 'bg-purple-500',
        path: '/renewals'
      })
    }

    if (declarationCount > 0) {
      actions.push({
        id: 'approve_declarations',
        title: 'Approuver les demandes',
        description: `${declarationCount} en attente`,
        icon: CheckCircle,
        color: 'bg-orange-500',
        path: '/approvals'
      })
    }

    setQuickActions(actions.slice(0, 4))
  }, [])

  const checkFirstTimeUser = useCallback(async () => {
    try {
      const licenses = await blink.db.software_licenses.list({
        where: { company_id: user?.company_id },
        limit: 1
      })
      
      if (licenses.length === 0) {
        setIsFirstTime(true)
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
    }
  }, [user?.company_id])

  const loadDashboardData = useCallback(async () => {
    try {
      // Charger les données depuis la base
      const [licenses, declarations, invitations] = await Promise.all([
        blink.db.software_licenses.list({
          where: { company_id: user?.company_id }
        }),
        blink.db.software_declarations.list({
          where: { status: 'pending' }
        }),
        blink.db.user_invitations.list({
          where: { company_id: user?.company_id }
        })
      ])

      // Calculer les métriques
      const totalCost = licenses.reduce((sum, license) => sum + (license.total_cost || 0), 0)
      const totalSeats = licenses.reduce((sum, license) => sum + (license.total_seats || 0), 0)
      const usedSeats = licenses.reduce((sum, license) => sum + (license.used_seats || 0), 0)
      const utilizationRate = totalSeats > 0 ? (usedSeats / totalSeats) * 100 : 0
      
      // Calculer les économies potentielles (simulation)
      const potentialSavings = licenses.reduce((sum, license) => {
        const unusedSeats = (license.total_seats || 0) - (license.used_seats || 0)
        const costPerSeat = license.cost_per_seat || 0
        return sum + (unusedSeats * costPerSeat * 0.7) // 70% des sièges inutilisés
      }, 0)

      // Licences expirant dans les 30 jours (simulation)
      const expiringLicenses = Math.floor(licenses.length * 0.15)

      setDashboardData({
        totalLicenses: licenses.length,
        totalCost,
        potentialSavings,
        utilizationRate,
        expiringLicenses,
        pendingDeclarations: declarations.length,
        teamSize: invitations.filter(inv => inv.status === 'accepted').length + 1,
        complianceScore: Math.min(95, 60 + (licenses.length * 2)) // Score basé sur les données
      })

      // Générer des recommandations intelligentes
      generateRecommendations(licenses, utilizationRate, potentialSavings)
      generateQuickActions(licenses.length, declarations.length)

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    }
  }, [user?.company_id, generateRecommendations, generateQuickActions])

  useEffect(() => {
    checkFirstTimeUser()
    loadDashboardData()
  }, [checkFirstTimeUser, loadDashboardData])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setIsFirstTime(false)
    loadDashboardData()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50'
      case 'medium': return 'border-yellow-300 bg-yellow-50'
      case 'low': return 'border-green-300 bg-green-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (showOnboarding) {
    return <PMEOnboarding onComplete={handleOnboardingComplete} />
  }

  if (showGamification) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vos Succès</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowGamification(false)}
          >
            Retour au tableau de bord
          </Button>
        </div>
        <PMEGamification user={user} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec CTA Gamification */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord PME
          </h1>
          <p className="text-gray-600">
            Optimisez vos coûts logiciels en temps réel
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowGamification(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Award className="w-4 h-4 mr-2" />
            Voir mes succès
          </Button>
          {isFirstTime && (
            <Button
              onClick={() => setShowOnboarding(true)}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Relancer l'onboarding
            </Button>
          )}
        </div>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Licences totales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.totalLicenses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Économies potentielles</p>
                <p className="text-2xl font-bold text-green-600">
                  €{Math.floor(dashboardData.potentialSavings)}
                </p>
                <p className="text-xs text-gray-500">/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Utilisation</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.floor(dashboardData.utilizationRate)}%
                </p>
                <Progress 
                  value={dashboardData.utilizationRate} 
                  className="h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Score conformité</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.complianceScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>Actions rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action: any) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left"
                onClick={() => window.location.href = action.path}
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Recommandations personnalisées</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              IA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec: any) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-full">
                    <rec.icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {rec.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityBadge(rec.priority)}
                      >
                        {rec.priority === 'high' ? 'Urgent' : 
                         rec.priority === 'medium' ? 'Important' : 'Optionnel'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        💡 {rec.impact}
                      </span>
                      <Button size="sm" variant="outline">
                        {rec.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Collecte de Données */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Débloquez plus de recommandations
              </h3>
              <p className="text-sm text-blue-700">
                Plus vous renseignez de données, plus nos recommandations sont précises. 
                Invitez votre équipe pour une vue complète !
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Inviter l'équipe
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Ajouter des licences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PMEDashboard