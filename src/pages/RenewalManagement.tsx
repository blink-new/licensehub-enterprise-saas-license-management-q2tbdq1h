import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  Target,
  Zap,
  BarChart3,
  Users,
  FileText,
  Bell
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import blink from '@/blink/client'
import { toast } from '@/hooks/use-toast'

interface RenewalItem {
  id: string
  license_id: string
  contract_id?: string
  software_name: string
  vendor: string
  renewal_date: string
  notification_date: string
  renewal_type: 'automatic' | 'manual' | 'negotiation_required'
  estimated_cost: number
  actual_cost?: number
  current_cost: number
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to: string
  assigned_name: string
  notes: string
  days_until_renewal: number
  utilization_rate: number
  recommendation: string
  potential_savings: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
}

interface RenewalStats {
  total: number
  upcoming_30_days: number
  upcoming_60_days: number
  upcoming_90_days: number
  in_progress: number
  completed_this_month: number
  total_estimated_cost: number
  potential_savings: number
  average_utilization: number
}

// Composant RenewalCard
const RenewalCard: React.FC<{
  renewal: RenewalItem
  onView: (renewal: RenewalItem) => void
  onStartNegotiation: (renewalId: string) => void
  getStatusBadge: (status: string) => JSX.Element
  getPriorityBadge: (priority: string) => JSX.Element
  getUrgencyColor: (days: number) => string
}> = ({ renewal, onView, onStartNegotiation, getStatusBadge, getPriorityBadge, getUrgencyColor }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{renewal.software_name}</h3>
              {getStatusBadge(renewal.status)}
              {getPriorityBadge(renewal.priority)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Fournisseur</p>
                <p className="font-medium">{renewal.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de renouvellement</p>
                <p className={`font-medium ${getUrgencyColor(renewal.days_until_renewal)}`}>
                  {new Date(renewal.renewal_date).toLocaleDateString('fr-FR')}
                  {renewal.days_until_renewal > 0 && (
                    <span className="text-sm ml-2">({renewal.days_until_renewal}j)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coût estimé</p>
                <p className="font-medium">€{renewal.estimated_cost.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisation</p>
                <div className="flex items-center gap-2">
                  <Progress value={renewal.utilization_rate} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{renewal.utilization_rate}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Économies potentielles</p>
                <p className="font-medium text-green-600">€{renewal.potential_savings.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Recommandation IA</p>
                  <p className="text-sm text-blue-700">{renewal.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Assigné à: {renewal.assigned_name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(renewal)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            
            {renewal.status === 'upcoming' && renewal.renewal_type === 'negotiation_required' && (
              <Button
                size="sm"
                onClick={() => onStartNegotiation(renewal.id)}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Négocier
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant RenewalDetailView
const RenewalDetailView: React.FC<{
  renewal: RenewalItem
  onUpdate: (renewalId: string, updates: Partial<RenewalItem>) => void
  getStatusBadge: (status: string) => JSX.Element
  getPriorityBadge: (priority: string) => JSX.Element
}> = ({ renewal, onUpdate, getStatusBadge, getPriorityBadge }) => {
  const [notes, setNotes] = useState(renewal.notes)
  const [estimatedCost, setEstimatedCost] = useState(renewal.estimated_cost.toString())
  const [status, setStatus] = useState(renewal.status)

  const handleSave = () => {
    onUpdate(renewal.id, {
      notes,
      estimated_cost: parseFloat(estimatedCost),
      status: status as any
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{renewal.software_name}</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              {getStatusBadge(renewal.status)}
              {getPriorityBadge(renewal.priority)}
            </div>
            <p className="text-sm text-gray-600">Fournisseur: {renewal.vendor}</p>
            <p className="text-sm text-gray-600">
              Date de renouvellement: {new Date(renewal.renewal_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">À venir</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="estimated_cost">Coût estimé (€)</Label>
            <Input
              id="estimated_cost"
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{renewal.utilization_rate}%</p>
              <p className="text-sm text-gray-600">Utilisation</p>
              <Progress value={renewal.utilization_rate} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">€{renewal.potential_savings.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Économies potentielles</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{renewal.days_until_renewal}</p>
              <p className="text-sm text-gray-600">Jours restants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Recommandation IA</h4>
            <p className="text-blue-700">{renewal.recommendation}</p>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes et commentaires</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Ajoutez vos notes sur ce renouvellement..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {}}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}

const RenewalManagement: React.FC = () => {
  const { t } = useLanguage()
  const [renewals, setRenewals] = useState<RenewalItem[]>([])
  const [stats, setStats] = useState<RenewalStats>({
    total: 0,
    upcoming_30_days: 0,
    upcoming_60_days: 0,
    upcoming_90_days: 0,
    in_progress: 0,
    completed_this_month: 0,
    total_estimated_cost: 0,
    potential_savings: 0,
    average_utilization: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')

  const loadRenewals = useCallback(async () => {
    try {
      setLoading(true)
      
      // Simuler des données de renouvellements avec calculs intelligents
      const mockRenewals: RenewalItem[] = [
        {
          id: 'ren_001',
          license_id: 'lic_001',
          contract_id: 'cont_001',
          software_name: 'Microsoft Office 365',
          vendor: 'Microsoft',
          renewal_date: '2024-03-15',
          notification_date: '2024-02-15',
          renewal_type: 'negotiation_required',
          estimated_cost: 25000,
          current_cost: 28000,
          status: 'upcoming',
          assigned_to: 'user_001',
          assigned_name: 'Marie Dubois',
          notes: 'Négociation en cours pour réduction du nombre de licences',
          days_until_renewal: 45,
          utilization_rate: 78,
          recommendation: 'Réduire de 50 à 40 licences basé sur l\'utilisation',
          potential_savings: 5600,
          priority: 'high',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        },
        {
          id: 'ren_002',
          license_id: 'lic_002',
          software_name: 'Salesforce Professional',
          vendor: 'Salesforce',
          renewal_date: '2024-02-28',
          notification_date: '2024-01-28',
          renewal_type: 'automatic',
          estimated_cost: 18000,
          current_cost: 18000,
          status: 'in_progress',
          assigned_to: 'user_002',
          assigned_name: 'Pierre Martin',
          notes: 'Renouvellement automatique confirmé',
          days_until_renewal: 28,
          utilization_rate: 95,
          recommendation: 'Maintenir le nombre actuel de licences',
          potential_savings: 0,
          priority: 'medium',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-25T00:00:00Z'
        },
        {
          id: 'ren_003',
          license_id: 'lic_003',
          software_name: 'Adobe Creative Suite',
          vendor: 'Adobe',
          renewal_date: '2024-04-30',
          notification_date: '2024-03-30',
          renewal_type: 'manual',
          estimated_cost: 12000,
          current_cost: 15000,
          status: 'upcoming',
          assigned_to: 'user_003',
          assigned_name: 'Sophie Laurent',
          notes: 'Évaluation de l\'utilisation en cours',
          days_until_renewal: 90,
          utilization_rate: 45,
          recommendation: 'Réduire de 20 à 12 licences',
          potential_savings: 4800,
          priority: 'critical',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 'ren_004',
          license_id: 'lic_004',
          software_name: 'Slack Business+',
          vendor: 'Slack',
          renewal_date: '2024-01-31',
          notification_date: '2024-01-01',
          renewal_type: 'negotiation_required',
          estimated_cost: 8000,
          actual_cost: 7200,
          current_cost: 9000,
          status: 'completed',
          assigned_to: 'user_001',
          assigned_name: 'Marie Dubois',
          notes: 'Négociation réussie - 20% de réduction obtenue',
          days_until_renewal: -1,
          utilization_rate: 88,
          recommendation: 'Renouvellement effectué avec succès',
          potential_savings: 1800,
          priority: 'low',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-31T00:00:00Z'
        },
        {
          id: 'ren_005',
          license_id: 'lic_005',
          software_name: 'Zoom Pro',
          vendor: 'Zoom',
          renewal_date: '2024-02-15',
          notification_date: '2024-01-15',
          renewal_type: 'manual',
          estimated_cost: 3600,
          current_cost: 4200,
          status: 'upcoming',
          assigned_to: 'user_002',
          assigned_name: 'Pierre Martin',
          notes: 'Analyse d\'utilisation post-COVID en cours',
          days_until_renewal: 15,
          utilization_rate: 35,
          recommendation: 'Réduire significativement ou annuler',
          potential_savings: 2520,
          priority: 'high',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-28T00:00:00Z'
        }
      ]

      setRenewals(mockRenewals)
      
      // Calculer les statistiques
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      
      const upcoming30 = mockRenewals.filter(r => {
        const renewalDate = new Date(r.renewal_date)
        return renewalDate <= thirtyDaysFromNow && renewalDate >= now && r.status === 'upcoming'
      }).length
      
      const upcoming60 = mockRenewals.filter(r => {
        const renewalDate = new Date(r.renewal_date)
        return renewalDate <= sixtyDaysFromNow && renewalDate >= now && r.status === 'upcoming'
      }).length
      
      const upcoming90 = mockRenewals.filter(r => {
        const renewalDate = new Date(r.renewal_date)
        return renewalDate <= ninetyDaysFromNow && renewalDate >= now && r.status === 'upcoming'
      }).length

      const totalEstimatedCost = mockRenewals
        .filter(r => r.status !== 'completed')
        .reduce((sum, r) => sum + r.estimated_cost, 0)
      
      const totalPotentialSavings = mockRenewals
        .reduce((sum, r) => sum + r.potential_savings, 0)
      
      const averageUtilization = mockRenewals
        .reduce((sum, r) => sum + r.utilization_rate, 0) / mockRenewals.length

      setStats({
        total: mockRenewals.length,
        upcoming_30_days: upcoming30,
        upcoming_60_days: upcoming60,
        upcoming_90_days: upcoming90,
        in_progress: mockRenewals.filter(r => r.status === 'in_progress').length,
        completed_this_month: mockRenewals.filter(r => r.status === 'completed').length,
        total_estimated_cost: totalEstimatedCost,
        potential_savings: totalPotentialSavings,
        average_utilization: averageUtilization
      })
      
    } catch (error) {
      console.error('Error loading renewals:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les renouvellements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRenewals()
  }, [loadRenewals])

  const filteredRenewals = renewals.filter(renewal => {
    const matchesSearch = renewal.software_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         renewal.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         renewal.assigned_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || renewal.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || renewal.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      upcoming: 'À venir',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique'
    }
    
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    )
  }

  const getUrgencyColor = (daysUntilRenewal: number) => {
    if (daysUntilRenewal <= 7) return 'text-red-600'
    if (daysUntilRenewal <= 30) return 'text-orange-600'
    if (daysUntilRenewal <= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleUpdateRenewal = async (renewalId: string, updates: Partial<RenewalItem>) => {
    try {
      // Simuler la mise à jour
      setRenewals(prev => prev.map(r => 
        r.id === renewalId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      ))
      
      toast({
        title: "Succès",
        description: "Renouvellement mis à jour avec succès"
      })
      
      setIsDialogOpen(false)
      setSelectedRenewal(null)
    } catch (error) {
      console.error('Error updating renewal:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le renouvellement",
        variant: "destructive"
      })
    }
  }

  const handleStartNegotiation = async (renewalId: string) => {
    await handleUpdateRenewal(renewalId, { 
      status: 'in_progress',
      notes: 'Négociation démarrée - En attente de réponse du fournisseur'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('renewalManagement')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestion proactive des renouvellements avec optimisation des coûts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Renouvellements 30j</p>
                <p className="text-2xl font-bold text-red-600">{stats.upcoming_30_days}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                Action requise urgente
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Économies Potentielles</p>
                <p className="text-2xl font-bold text-green-600">€{stats.potential_savings.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Target className="h-4 w-4 mr-1" />
                Optimisation identifiée
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût Total Estimé</p>
                <p className="text-2xl font-bold text-blue-600">€{stats.total_estimated_cost.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 className="h-4 w-4 mr-1" />
                Budget prévisionnel
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisation Moyenne</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(stats.average_utilization)}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.average_utilization} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par logiciel, fournisseur ou responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="upcoming">À venir</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Renewals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">À Venir ({renewals.filter(r => r.status === 'upcoming').length})</TabsTrigger>
          <TabsTrigger value="in_progress">En Cours ({renewals.filter(r => r.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Terminés ({renewals.filter(r => r.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="all">Tous ({renewals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredRenewals.filter(r => r.status === 'upcoming').map((renewal) => (
            <RenewalCard 
              key={renewal.id} 
              renewal={renewal} 
              onView={setSelectedRenewal}
              onStartNegotiation={handleStartNegotiation}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getUrgencyColor={getUrgencyColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {filteredRenewals.filter(r => r.status === 'in_progress').map((renewal) => (
            <RenewalCard 
              key={renewal.id} 
              renewal={renewal} 
              onView={setSelectedRenewal}
              onStartNegotiation={handleStartNegotiation}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getUrgencyColor={getUrgencyColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredRenewals.filter(r => r.status === 'completed').map((renewal) => (
            <RenewalCard 
              key={renewal.id} 
              renewal={renewal} 
              onView={setSelectedRenewal}
              onStartNegotiation={handleStartNegotiation}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getUrgencyColor={getUrgencyColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredRenewals.map((renewal) => (
            <RenewalCard 
              key={renewal.id} 
              renewal={renewal} 
              onView={setSelectedRenewal}
              onStartNegotiation={handleStartNegotiation}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getUrgencyColor={getUrgencyColor}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Renewal Detail Dialog */}
      <Dialog open={!!selectedRenewal} onOpenChange={(open) => !open && setSelectedRenewal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Renouvellement</DialogTitle>
          </DialogHeader>
          {selectedRenewal && (
            <RenewalDetailView 
              renewal={selectedRenewal} 
              onUpdate={handleUpdateRenewal}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RenewalManagement