import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Building, Zap } from 'lucide-react'
import { usePlan, PlanType } from '@/contexts/PlanContext'

interface PlanSelectorProps {
  onPlanSelect?: (plan: PlanType) => void
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ onPlanSelect }) => {
  const { currentPlan, setPlan } = usePlan()

  const plans = [
    {
      id: 'tpe' as PlanType,
      name: 'TPE',
      description: 'Pour les petites entreprises (1-10 employés)',
      price: '29€',
      period: '/mois',
      icon: Building,
      color: 'green',
      features: [
        'Jusqu\'à 10 utilisateurs',
        'Jusqu\'à 50 licences',
        'Tableau de bord simplifié',
        'Gestion des licences',
        'Déclarations logicielles',
        'Support par email'
      ],
      limitations: [
        'Pas de workflows d\'approbation',
        'Analytics limités',
        'Pas d\'intégrations'
      ]
    },
    {
      id: 'pme' as PlanType,
      name: 'PME',
      description: 'Pour les moyennes entreprises (11-250 employés)',
      price: '99€',
      period: '/mois',
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        'Jusqu\'à 250 utilisateurs',
        'Jusqu\'à 500 licences',
        'Tous les modules essentiels',
        'Workflows d\'approbation',
        'Analytics avancés',
        'Gestion budgétaire',
        'Support prioritaire'
      ],
      limitations: [
        'Intégrations limitées',
        'Pas de personnalisation'
      ]
    },
    {
      id: 'enterprise' as PlanType,
      name: 'Enterprise',
      description: 'Pour les grandes entreprises (250+ employés)',
      price: '299€',
      period: '/mois',
      icon: Crown,
      color: 'purple',
      features: [
        'Utilisateurs illimités',
        'Licences illimitées',
        'Tous les 18 modules',
        'Workflows avancés',
        'Analytics complets',
        'Intégrations natives',
        'Personnalisation complète',
        'Support dédié 24/7',
        'Formation incluse'
      ],
      limitations: []
    }
  ]

  const handlePlanSelect = (planId: PlanType) => {
    setPlan(planId)
    onPlanSelect?.(planId)
  }

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      green: {
        border: isSelected ? 'border-green-500' : 'border-green-200',
        bg: 'bg-green-50',
        text: 'text-green-700',
        button: 'bg-green-600 hover:bg-green-700'
      },
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choisissez votre Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Sélectionnez le plan qui correspond le mieux à la taille de votre entreprise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = currentPlan === plan.id
          const colorClasses = getColorClasses(plan.color, isSelected)
          const Icon = plan.icon

          return (
            <Card 
              key={plan.id} 
              className={`relative ${colorClasses.border} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''} transition-all duration-200 hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    Le plus populaire
                  </Badge>
                </div>
              )}

              <CardHeader className={`${colorClasses.bg} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                    <CardTitle className={`text-xl ${colorClasses.text}`}>
                      {plan.name}
                    </CardTitle>
                  </div>
                  {isSelected && (
                    <Badge variant="outline" className="bg-white">
                      Actuel
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-3xl font-bold ${colorClasses.text}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Fonctionnalités incluses :
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Limitations :
                      </h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-gray-500 dark:text-gray-400">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isSelected}
                    className={`w-full ${colorClasses.button} text-white`}
                  >
                    {isSelected ? 'Plan Actuel' : `Passer à ${plan.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Tous les plans incluent une période d'essai gratuite de 14 jours</p>
        <p>Changement de plan possible à tout moment • Support client inclus</p>
      </div>
    </div>
  )
}

export default PlanSelector