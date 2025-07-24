import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, TrendingDown, DollarSign, Key, Users, AlertTriangle,
  Calendar, CheckCircle, Clock, BarChart3, PieChart, Activity
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { usePlan } from '@/contexts/PlanContext'
import SimplifiedDashboard from './SimplifiedDashboard'
import blink from '@/blink/client'

interface DashboardMetrics {
  totalLicenses: number
  activeLicenses: number
  expiredLicenses: number
  pendingDeclarations: number
  totalCost: number
  monthlyCost: number
  complianceScore: number
  utilizationRate: number
  renewalsThisMonth: number
  budgetUtilization: number
}

const ExecutiveDashboard: React.FC = () => {
  const { t } = useLanguage()
  const { currentPlan } = usePlan()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLicenses: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    pendingDeclarations: 0,
    totalCost: 0,
    monthlyCost: 0,
    complianceScore: 0,
    utilizationRate: 0,
    renewalsThisMonth: 0,
    budgetUtilization: 0
  })
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load licenses data
      const licenses = await blink.db.softwareLicenses.list()
      const declarations = await blink.db.softwareDeclarations.list({
        where: { status: 'pending' }
      })
      const budgets = await blink.db.departmentBudgets.list({
        where: { fiscalYear: '2024' }
      })

      // Calculate metrics
      const activeLicenses = licenses.filter(l => l.status === 'active').length
      const expiredLicenses = licenses.filter(l => l.status === 'expired').length
      const totalCost = licenses.reduce((sum, l) => sum + (l.totalCost || 0), 0)
      const totalBudget = budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0)
      const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0)

      setMetrics({
        totalLicenses: licenses.length,
        activeLicenses,
        expiredLicenses,
        pendingDeclarations: declarations.length,
        totalCost,
        monthlyCost: totalCost / 12,
        complianceScore: Math.round((activeLicenses / Math.max(licenses.length, 1)) * 100),
        utilizationRate: 85, // Mock data - would calculate from usage metrics
        renewalsThisMonth: 12, // Mock data
        budgetUtilization: Math.round((totalSpent / Math.max(totalBudget, 1)) * 100)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Use simplified dashboard for TPE
  if (currentPlan === 'tpe') {
    return <SimplifiedDashboard />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'neutral',
    format = 'number'
  }: {
    title: string
    value: number
    change?: number
    icon: any
    trend?: 'up' | 'down' | 'neutral'
    format?: 'number' | 'currency' | 'percentage'
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return formatCurrency(val)
        case 'percentage':
          return `${val}%`
        default:
          return val.toLocaleString()
      }
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change !== undefined && (
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
              {change > 0 ? '+' : ''}{change}% par rapport au mois dernier
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord Exécutif</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de la gouvernance des licences logicielles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('totalLicenses')}
          value={metrics.totalLicenses}
          change={8}
          icon={Key}
          trend="up"
        />
        <MetricCard
          title={t('totalCost')}
          value={metrics.totalCost}
          change={-12}
          icon={DollarSign}
          trend="down"
          format="currency"
        />
        <MetricCard
          title={t('complianceScore')}
          value={metrics.complianceScore}
          change={5}
          icon={CheckCircle}
          trend="up"
          format="percentage"
        />
        <MetricCard
          title={t('utilizationRate')}
          value={metrics.utilizationRate}
          change={3}
          icon={TrendingUp}
          trend="up"
          format="percentage"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('activeLicenses')}
          value={metrics.activeLicenses}
          icon={CheckCircle}
        />
        <MetricCard
          title={t('expiredLicenses')}
          value={metrics.expiredLicenses}
          icon={AlertTriangle}
        />
        <MetricCard
          title={t('pendingDeclarations')}
          value={metrics.pendingDeclarations}
          icon={Clock}
        />
        <MetricCard
          title={t('renewalsThisMonth')}
          value={metrics.renewalsThisMonth}
          icon={Calendar}
        />
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Budget Utilization */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Utilisation du Budget</CardTitle>
            <CardDescription>
              Répartition des dépenses par département
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">IT Department</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Human Resources</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Finance</span>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Dernières actions importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Licence Office 365 renouvelée</p>
                <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Nouvelle déclaration Salesforce</p>
                <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Budget IT dépassé de 5%</p>
                <p className="text-xs text-muted-foreground">Hier</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Licence Adobe expirée</p>
                <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Alertes et Notifications
          </CardTitle>
          <CardDescription>
            Actions requises et points d'attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="destructive">Urgent</Badge>
                <div>
                  <p className="font-medium">12 licences expirent dans les 30 jours</p>
                  <p className="text-sm text-muted-foreground">
                    Renouvellements requis pour maintenir la conformité
                  </p>
                </div>
              </div>
              <Button size="sm">Voir détails</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="secondary">Moyen</Badge>
                <div>
                  <p className="font-medium">8 déclarations en attente d'approbation</p>
                  <p className="text-sm text-muted-foreground">
                    Demandes de logiciels nécessitant une validation
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">Traiter</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Info</Badge>
                <div>
                  <p className="font-medium">Rapport de conformité mensuel disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Score de conformité: 94% (+2% vs mois précédent)
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">Télécharger</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExecutiveDashboard