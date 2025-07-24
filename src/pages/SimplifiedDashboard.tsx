import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Key, FileText, AlertTriangle, TrendingUp, Plus, 
  Calendar, DollarSign, Users, CheckCircle
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import blink from '@/blink/client'
import { Link } from 'react-router-dom'

const SimplifiedDashboard: React.FC = () => {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalLicenses: 0,
    activeLicenses: 0,
    pendingDeclarations: 0,
    totalCost: 0,
    expiringLicenses: 0
  })
  const [recentLicenses, setRecentLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await blink.auth.me()
        if (!user) return

        // Load licenses
        const licenses = await blink.db.softwareLicenses.list({
          where: { companyId: user.company_id || 'comp_001' },
          limit: 100
        })

        // Load declarations
        const declarations = await blink.db.softwareDeclarations.list({
          where: { userId: user.id },
          limit: 100
        })

        // Calculate stats
        const activeLicenses = licenses.filter(l => l.status === 'active')
        const expiringLicenses = licenses.filter(l => {
          if (!l.renewalDate) return false
          const renewalDate = new Date(l.renewalDate)
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
          return renewalDate <= thirtyDaysFromNow
        })

        const totalCost = activeLicenses.reduce((sum, license) => sum + (license.totalCost || 0), 0)
        const pendingDeclarations = declarations.filter(d => d.status === 'pending').length

        setStats({
          totalLicenses: licenses.length,
          activeLicenses: activeLicenses.length,
          pendingDeclarations,
          totalCost,
          expiringLicenses: expiringLicenses.length
        })

        // Get recent licenses for quick view
        setRecentLicenses(licenses.slice(0, 5))

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue sur LicenseHub TPE
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gérez vos licences logicielles en toute simplicité. Interface optimisée pour les petites entreprises.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licences Actives</CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeLicenses}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.totalLicenses} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Mensuel</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats.totalCost / 12).toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCost.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0
              })} /an
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À Renouveler</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringLicenses}</div>
            <p className="text-xs text-muted-foreground">
              dans les 30 prochains jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Déclarations</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.pendingDeclarations}</div>
            <p className="text-xs text-muted-foreground">
              en attente d'approbation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Les actions les plus courantes pour gérer vos licences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/declarations">
              <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Déclarer un Logiciel</span>
              </Button>
            </Link>
            
            <Link to="/licenses">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <Key className="w-6 h-6" />
                <span className="text-sm font-medium">Voir mes Licences</span>
              </Button>
            </Link>

            {stats.expiringLicenses > 0 && (
              <Link to="/renewals">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm font-medium">Renouvellements</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Licenses */}
      {recentLicenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Key className="w-5 h-5 mr-2 text-blue-600" />
                Mes Licences Récentes
              </span>
              <Link to="/licenses">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLicenses.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {license.softwareName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {license.vendor} • {license.usedSeats || 0}/{license.totalSeats} utilisés
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={license.status === 'active' ? 'default' : 'secondary'}
                      className={license.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {license.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    {license.totalSeats && (
                      <div className="w-16">
                        <Progress 
                          value={(license.usedSeats || 0) / license.totalSeats * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for TPE */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800 dark:text-green-300">
            <CheckCircle className="w-5 h-5 mr-2" />
            Conseils pour Optimiser vos Licences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
            <p>• Déclarez tous vos logiciels pour une visibilité complète</p>
            <p>• Surveillez les renouvellements pour éviter les interruptions</p>
            <p>• Vérifiez régulièrement l'utilisation pour optimiser les coûts</p>
            <p>• Passez à PME pour débloquer les workflows d'approbation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SimplifiedDashboard