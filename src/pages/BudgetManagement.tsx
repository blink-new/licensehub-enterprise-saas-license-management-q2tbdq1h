import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, Plus, 
  Search, Filter, Building, AlertTriangle, CheckCircle,
  Calendar, BarChart3, Target, Wallet
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface Budget {
  id: string
  departmentId: string
  fiscalYear: string
  budgetCategory: string
  allocatedAmount: number
  spentAmount: number
  committedAmount: number
  availableAmount: number
  currency: string
  createdAt: string
}

interface Department {
  id: string
  name: string
}

const BudgetManagement: React.FC = () => {
  const { t } = useLanguage()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({
    departmentId: '',
    fiscalYear: '2024',
    budgetCategory: 'software_licenses',
    allocatedAmount: 0,
    currency: 'EUR'
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [budgetData, departmentData] = await Promise.all([
        blink.db.departmentBudgets.list({
          orderBy: { createdAt: 'desc' }
        }),
        blink.db.departments.list()
      ])
      setBudgets(budgetData)
      setDepartments(departmentData)
    } catch (error) {
      console.error('Error loading budget data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données budgétaires",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddBudget = async () => {
    try {
      const user = await blink.auth.me()
      const budgetData = {
        ...newBudget,
        id: `budget_${Date.now()}`,
        spentAmount: 0,
        committedAmount: 0,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.departmentBudgets.create(budgetData)
      
      toast({
        title: "Succès",
        description: "Budget créé avec succès"
      })
      
      setIsAddDialogOpen(false)
      setNewBudget({
        departmentId: '',
        fiscalYear: '2024',
        budgetCategory: 'software_licenses',
        allocatedAmount: 0,
        currency: 'EUR'
      })
      loadData()
    } catch (error) {
      console.error('Error adding budget:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le budget",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'software_licenses':
        return <Badge className="bg-blue-100 text-blue-800">Licences Logicielles</Badge>
      case 'hardware':
        return <Badge className="bg-green-100 text-green-800">Matériel</Badge>
      case 'services':
        return <Badge className="bg-purple-100 text-purple-800">Services</Badge>
      case 'training':
        return <Badge className="bg-orange-100 text-orange-800">Formation</Badge>
      case 'other':
        return <Badge variant="secondary">Autre</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-red-600', icon: AlertTriangle, status: 'Critique' }
    if (percentage >= 75) return { color: 'text-orange-600', icon: AlertTriangle, status: 'Attention' }
    if (percentage >= 50) return { color: 'text-blue-600', icon: TrendingUp, status: 'Normal' }
    return { color: 'text-green-600', icon: CheckCircle, status: 'Optimal' }
  }

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept?.name || 'Département inconnu'
  }

  const filteredBudgets = budgets.filter(budget => {
    const deptName = getDepartmentName(budget.departmentId)
    const matchesSearch = deptName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || budget.budgetCategory === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Calculate totals
  const totalAllocated = budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0)
  const totalCommitted = budgets.reduce((sum, b) => sum + (b.committedAmount || 0), 0)
  const totalAvailable = totalAllocated - totalSpent - totalCommitted
  const utilizationRate = Math.round((totalSpent / Math.max(totalAllocated, 1)) * 100)

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
          <h2 className="text-3xl font-bold tracking-tight">Gestion Budgétaire</h2>
          <p className="text-muted-foreground">
            Contrôlez les budgets et dépenses par département
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau budget</DialogTitle>
                <DialogDescription>
                  Allouez un budget pour un département et une catégorie
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Département</Label>
                    <Select value={newBudget.departmentId} onValueChange={(value) => setNewBudget({...newBudget, departmentId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Année fiscale</Label>
                    <Select value={newBudget.fiscalYear} onValueChange={(value) => setNewBudget({...newBudget, fiscalYear: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetCategory">Catégorie</Label>
                    <Select value={newBudget.budgetCategory} onValueChange={(value) => setNewBudget({...newBudget, budgetCategory: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software_licenses">Licences Logicielles</SelectItem>
                        <SelectItem value="hardware">Matériel</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="training">Formation</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allocatedAmount">Montant alloué (€)</Label>
                    <Input
                      id="allocatedAmount"
                      type="number"
                      step="0.01"
                      value={newBudget.allocatedAmount}
                      onChange={(e) => setNewBudget({...newBudget, allocatedAmount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddBudget}>
                  Créer le budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAllocated)}</div>
            <p className="text-xs text-muted-foreground">Année fiscale 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépensé</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">{utilizationRate}% du budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponible</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">{100 - utilizationRate}% restant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Budgets actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Utilisation Budgétaire par Département</CardTitle>
            <CardDescription>
              Répartition des dépenses et budgets disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.slice(0, 5).map((dept) => {
              const deptBudgets = budgets.filter(b => b.departmentId === dept.id)
              const allocated = deptBudgets.reduce((sum, b) => sum + b.allocatedAmount, 0)
              const spent = deptBudgets.reduce((sum, b) => sum + b.spentAmount, 0)
              const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
              const status = getUtilizationStatus(percentage)
              
              return (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <Badge variant="outline" className={status.color}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(allocated)}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {percentage}% utilisé
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alertes Budgétaires</CardTitle>
            <CardDescription>
              Notifications importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Budget IT dépassé</p>
                <p className="text-xs text-muted-foreground">105% du budget utilisé</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Budget RH en alerte</p>
                <p className="text-xs text-muted-foreground">92% du budget utilisé</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Budget Finance optimal</p>
                <p className="text-xs text-muted-foreground">65% du budget utilisé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets Départementaux</CardTitle>
          <CardDescription>
            Détail des budgets par département et catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="software_licenses">Licences Logicielles</SelectItem>
                <SelectItem value="hardware">Matériel</SelectItem>
                <SelectItem value="services">Services</SelectItem>
                <SelectItem value="training">Formation</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Département</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Budget Alloué</TableHead>
                  <TableHead>Dépensé</TableHead>
                  <TableHead>Engagé</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Année</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => {
                  const utilizationPercentage = Math.round((budget.spentAmount / Math.max(budget.allocatedAmount, 1)) * 100)
                  const status = getUtilizationStatus(utilizationPercentage)
                  
                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getDepartmentName(budget.departmentId)}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(budget.budgetCategory)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(budget.allocatedAmount, budget.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(budget.spentAmount, budget.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(budget.committedAmount, budget.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(budget.availableAmount, budget.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilizationPercentage >= 90 ? 'bg-red-500' :
                                utilizationPercentage >= 75 ? 'bg-orange-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm ${status.color}`}>
                            {utilizationPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {budget.fiscalYear}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BudgetManagement