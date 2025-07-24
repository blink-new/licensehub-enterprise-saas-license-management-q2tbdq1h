import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Crown, Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { usePlan } from '@/contexts/PlanContext'
import { useTheme } from '@/hooks/useTheme'
import PlanSelector from '@/components/PlanSelector'

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage()
  const { currentPlan } = usePlan()
  const { theme, setTheme } = useTheme()
  const [showPlanSelector, setShowPlanSelector] = useState(false)

  const getPlanBadge = () => {
    switch (currentPlan) {
      case 'tpe':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">TPE</Badge>
      case 'pme':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PME</Badge>
      case 'enterprise':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Enterprise</Badge>
    }
  }

  if (showPlanSelector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Changer de Plan
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sélectionnez le plan qui correspond le mieux à vos besoins
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowPlanSelector(false)}>
            Retour aux Paramètres
          </Button>
        </div>
        <PlanSelector onPlanSelect={() => setShowPlanSelector(false)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('settings')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configuration et paramètres de la plateforme
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Général</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Plan</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Sécurité</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Thème</Label>
                  <p className="text-sm text-gray-500">Choisissez entre le mode clair et sombre</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <p className="text-sm text-gray-500">Langue de l'interface utilisateur</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Plan Actuel
                </span>
                {getPlanBadge()}
              </CardTitle>
              <CardDescription>
                Gérez votre abonnement et vos fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Plan {currentPlan.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentPlan === 'tpe' && 'Interface simplifiée pour petites entreprises'}
                      {currentPlan === 'pme' && 'Fonctionnalités avancées pour moyennes entreprises'}
                      {currentPlan === 'enterprise' && 'Plateforme complète pour grandes entreprises'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {currentPlan === 'tpe' && '29€'}
                      {currentPlan === 'pme' && '99€'}
                      {currentPlan === 'enterprise' && '299€'}
                    </p>
                    <p className="text-sm text-gray-500">/mois</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h4 className="font-medium">Fonctionnalités incluses :</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {currentPlan === 'tpe' && (
                      <>
                        <li>• Jusqu'à 10 utilisateurs</li>
                        <li>• Gestion des licences simplifiée</li>
                        <li>• Déclarations logicielles</li>
                        <li>• Support par email</li>
                      </>
                    )}
                    {currentPlan === 'pme' && (
                      <>
                        <li>• Jusqu'à 250 utilisateurs</li>
                        <li>• Workflows d'approbation</li>
                        <li>• Analytics avancés</li>
                        <li>• Gestion budgétaire</li>
                        <li>• Support prioritaire</li>
                      </>
                    )}
                    {currentPlan === 'enterprise' && (
                      <>
                        <li>• Utilisateurs illimités</li>
                        <li>• Tous les 18 modules</li>
                        <li>• Intégrations natives</li>
                        <li>• Personnalisation complète</li>
                        <li>• Support dédié 24/7</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button 
                  onClick={() => setShowPlanSelector(true)}
                  className="w-full"
                >
                  {currentPlan === 'enterprise' ? 'Voir tous les plans' : 'Passer à un plan supérieur'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Préférences de Notification
              </CardTitle>
              <CardDescription>
                Configurez quand et comment recevoir les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <p className="text-sm text-gray-500">Recevoir les alertes importantes par email</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="license-expiry">Expiration des licences</Label>
                  <p className="text-sm text-gray-500">Alertes 30, 15 et 7 jours avant expiration</p>
                </div>
                <Switch id="license-expiry" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Alertes budgétaires</Label>
                  <p className="text-sm text-gray-500">Notifications de dépassement de budget</p>
                </div>
                <Switch id="budget-alerts" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approval-requests">Demandes d'approbation</Label>
                  <p className="text-sm text-gray-500">Notifications pour les workflows en attente</p>
                </div>
                <Switch id="approval-requests" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Sécurité et Confidentialité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et de confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                  <p className="text-sm text-gray-500">Sécurité renforcée pour votre compte</p>
                </div>
                <Switch id="two-factor" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-logs">Journaux d'audit</Label>
                  <p className="text-sm text-gray-500">Enregistrer toutes les actions utilisateur</p>
                </div>
                <Switch id="audit-logs" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-export">Export des données</Label>
                  <p className="text-sm text-gray-500">Permettre l'export des données personnelles</p>
                </div>
                <Switch id="data-export" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings