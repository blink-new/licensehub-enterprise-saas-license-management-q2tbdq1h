import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, Zap, Target, CheckCircle, ArrowRight, 
  Sparkles, TrendingUp, Shield, Clock, Award, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import blink from '@/blink/client'
import { toast } from '@/hooks/use-toast'

interface PMEOnboardingProps {
  onComplete: () => void
}

const PMEOnboarding: React.FC<PMEOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [companyData, setCompanyData] = useState({
    name: '',
    size: '',
    industry: '',
    currentTools: [] as string[],
    painPoints: [] as string[],
    goals: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [detectedTools, setDetectedTools] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue dans LicenseHub !',
      subtitle: 'La plateforme gratuite qui optimise vos coûts logiciels',
      icon: Sparkles
    },
    {
      id: 'company',
      title: 'Parlez-nous de votre entreprise',
      subtitle: 'Pour personnaliser votre expérience',
      icon: Building2
    },
    {
      id: 'detection',
      title: 'Détection automatique',
      subtitle: 'Nous analysons vos outils actuels',
      icon: Zap
    },
    {
      id: 'goals',
      title: 'Vos objectifs',
      subtitle: 'Que souhaitez-vous accomplir ?',
      icon: Target
    },
    {
      id: 'complete',
      title: 'C\'est parti !',
      subtitle: 'Votre tableau de bord est prêt',
      icon: CheckCircle
    }
  ]

  const companySizes = [
    { value: '10-25', label: '10-25 collaborateurs', popular: false },
    { value: '26-50', label: '26-50 collaborateurs', popular: true },
    { value: '51-100', label: '51-100 collaborateurs', popular: true },
    { value: '101-250', label: '101-250 collaborateurs', popular: false }
  ]

  const industries = [
    'Services', 'E-commerce', 'Industrie', 'Santé', 'Finance', 
    'Immobilier', 'Marketing', 'Consulting', 'Tech', 'Autre'
  ]

  const commonTools = useMemo(() => [
    'Microsoft 365', 'Google Workspace', 'Slack', 'Zoom', 'Teams',
    'Salesforce', 'HubSpot', 'Adobe Creative', 'Figma', 'Notion',
    'Trello', 'Asana', 'Monday.com', 'Dropbox', 'OneDrive'
  ], [])

  const painPoints = [
    'Coûts logiciels trop élevés',
    'Licences inutilisées',
    'Manque de visibilité',
    'Renouvellements oubliés',
    'Conformité RGPD',
    'Gestion des accès'
  ]

  const goals = [
    'Réduire les coûts de 20%',
    'Optimiser les licences',
    'Améliorer la sécurité',
    'Automatiser les processus',
    'Préparer les audits',
    'Centraliser la gestion'
  ]

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100)
  }, [currentStep, steps.length])

  // Simulation de détection automatique des outils
  useEffect(() => {
    if (currentStep === 2) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        // Simulation de détection basée sur des patterns courants PME
        const detected = commonTools.slice(0, Math.floor(Math.random() * 8) + 3)
        setDetectedTools(detected)
        setCompanyData(prev => ({ ...prev, currentTools: detected }))
        setIsLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, commonTools])

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Sauvegarder les données et terminer l'onboarding
      try {
        await blink.db.companies.create({
          id: `comp_${Date.now()}`,
          name: companyData.name,
          size: companyData.size,
          industry: companyData.industry,
          employee_count: parseInt(companyData.size.split('-')[1]) || 50,
          created_at: new Date().toISOString()
        })

        // Créer des données d'exemple basées sur la détection
        for (const tool of detectedTools) {
          await blink.db.software_licenses.create({
            id: `lic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            software_name: tool,
            vendor: tool.includes('Microsoft') ? 'Microsoft' : tool.includes('Google') ? 'Google' : 'Divers',
            category: 'Productivité',
            license_type: 'subscription',
            total_seats: Math.floor(Math.random() * 50) + 10,
            used_seats: Math.floor(Math.random() * 40) + 5,
            cost_per_seat: Math.floor(Math.random() * 20) + 5,
            total_cost: (Math.floor(Math.random() * 20) + 5) * (Math.floor(Math.random() * 50) + 10),
            status: 'active',
            created_at: new Date().toISOString()
          })
        }

        toast({
          title: "Bienvenue dans LicenseHub !",
          description: "Votre compte est configuré. Découvrez vos économies potentielles !",
        })

        onComplete()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        toast({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive"
        })
      }
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Optimisez vos coûts logiciels en 2 minutes
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Rejoignez 2,500+ PME qui économisent en moyenne <strong>€18,000/an</strong> 
                grâce à LicenseHub
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Économies immédiates</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">100% gratuit</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Setup en 2 min</p>
              </div>
            </div>
          </div>
        )

      case 1: // Company Info
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre entreprise
                </label>
                <Input
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: TechCorp Solutions"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de votre entreprise
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {companySizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setCompanyData(prev => ({ ...prev, size: size.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        companyData.size === size.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{size.label}</span>
                        {size.popular && (
                          <Badge variant="secondary" className="text-xs">Populaire</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setCompanyData(prev => ({ ...prev, industry }))}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        companyData.industry === industry
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Auto-detection
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Détection en cours...
                  </h3>
                  <p className="text-gray-600">
                    Nous analysons vos outils actuels pour personnaliser vos recommandations
                  </p>
                </div>
                <div className="max-w-xs mx-auto">
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {detectedTools.length} outils détectés !
                  </h3>
                  <p className="text-gray-600">
                    Nous avons identifié vos principaux logiciels
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {detectedTools.map((tool, index) => (
                    <motion.div
                      key={tool}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {tool.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{tool}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Économies potentielles identifiées
                      </p>
                      <p className="text-sm text-blue-700">
                        Basé sur votre stack, vous pourriez économiser jusqu'à{' '}
                        <strong>€{Math.floor(detectedTools.length * 150)}/mois</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Goals
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quels sont vos objectifs prioritaires ?
              </h3>
              <p className="text-gray-600">
                Sélectionnez vos défis principaux (plusieurs choix possibles)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Défis actuels :</h4>
                <div className="grid grid-cols-2 gap-2">
                  {painPoints.map((point) => (
                    <button
                      key={point}
                      onClick={() => {
                        const newPainPoints = companyData.painPoints.includes(point)
                          ? companyData.painPoints.filter(p => p !== point)
                          : [...companyData.painPoints, point]
                        setCompanyData(prev => ({ ...prev, painPoints: newPainPoints }))
                      }}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        companyData.painPoints.includes(point)
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {point}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Objectifs souhaités :</h4>
                <div className="grid grid-cols-2 gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => {
                        const newGoals = companyData.goals.includes(goal)
                          ? companyData.goals.filter(g => g !== goal)
                          : [...companyData.goals, goal]
                        setCompanyData(prev => ({ ...prev, goals: newGoals }))
                      }}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        companyData.goals.includes(goal)
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Félicitations {companyData.name} !
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Votre tableau de bord personnalisé est prêt. Découvrez vos premières 
                recommandations d'optimisation.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    €{Math.floor(detectedTools.length * 150)}
                  </div>
                  <div className="text-xs text-gray-600">Économies/mois</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {detectedTools.length}
                  </div>
                  <div className="text-xs text-gray-600">Outils détectés</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {companyData.goals.length}
                  </div>
                  <div className="text-xs text-gray-600">Objectifs définis</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Prochaines étapes recommandées
                </span>
              </div>
              <p className="text-sm text-blue-700">
                • Explorez vos économies potentielles<br/>
                • Configurez les alertes de renouvellement<br/>
                • Invitez votre équipe pour plus de données
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true
      case 1: return companyData.name && companyData.size && companyData.industry
      case 2: return !isLoading
      case 3: return companyData.painPoints.length > 0 || companyData.goals.length > 0
      case 4: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% terminé
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    {React.createElement(steps[currentStep].icon, {
                      className: "w-8 h-8 text-blue-600"
                    })}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-gray-600">
                    {steps[currentStep].subtitle}
                  </p>
                </div>

                {/* Step Content */}
                {renderStep()}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="px-6"
                  >
                    Précédent
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Accéder au tableau de bord
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continuer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Déjà utilisé par 2,500+ PME françaises
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>RGPD compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>Support français</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PMEOnboarding