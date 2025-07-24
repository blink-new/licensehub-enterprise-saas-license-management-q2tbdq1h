import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Plus, Search, Filter, Download, Key, Calendar, 
  Users, DollarSign, AlertTriangle, CheckCircle, Edit, Trash2
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface License {
  id: string
  softwareName: string
  vendor: string
  category: string
  licenseType: string
  totalSeats: number
  usedSeats: number
  costPerSeat: number
  totalCost: number
  currency: string
  purchaseDate: string
  renewalDate: string
  status: string
  autoRenewal: boolean
  createdAt: string
}

const LicenseManagement: React.FC = () => {
  const { t } = useLanguage()
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLicense, setNewLicense] = useState({
    softwareName: '',
    vendor: '',
    category: '',
    licenseType: 'subscription',
    totalSeats: 1,
    costPerSeat: 0,
    totalCost: 0,
    currency: 'EUR',
    purchaseDate: '',
    renewalDate: '',
    autoRenewal: false
  })

  const loadLicenses = async () => {
    try {
      setLoading(true)
      const data = await blink.db.softwareLicenses.list({
        orderBy: { createdAt: 'desc' }
      })
      setLicenses(data)
    } catch (error) {
      console.error('Error loading licenses:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les licences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLicenses()
  }, [])

  const handleAddLicense = async () => {
    try {
      const licenseData = {
        ...newLicense,
        id: `lic_${Date.now()}`,
        usedSeats: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await blink.db.softwareLicenses.create(licenseData)
      
      toast({
        title: "Succès",
        description: "Licence ajoutée avec succès"
      })
      
      setIsAddDialogOpen(false)
      setNewLicense({
        softwareName: '',
        vendor: '',
        category: '',
        licenseType: 'subscription',
        totalSeats: 1,
        costPerSeat: 0,
        totalCost: 0,
        currency: 'EUR',
        purchaseDate: '',
        renewalDate: '',
        autoRenewal: false
      })
      loadLicenses()
    } catch (error) {
      console.error('Error adding license:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la licence",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.softwareName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(l => l.status === 'active').length
  const totalCost = licenses.reduce((sum, l) => sum + (l.totalCost || 0), 0)
  const totalSeats = licenses.reduce((sum, l) => sum + (l.totalSeats || 0), 0)
  const usedSeats = licenses.reduce((sum, l) => sum + (l.usedSeats || 0), 0)

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
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Licences</h2>
          <p className="text-muted-foreground">
            Gérez vos licences logicielles et leur attribution
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une licence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle licence</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle licence logicielle dans le système
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="softwareName">Nom du logiciel</Label>
                    <Input
                      id="softwareName"
                      value={newLicense.softwareName}
                      onChange={(e) => setNewLicense({...newLicense, softwareName: e.target.value})}
                      placeholder="Microsoft Office 365"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Éditeur</Label>
                    <Input
                      id="vendor"
                      value={newLicense.vendor}
                      onChange={(e) => setNewLicense({...newLicense, vendor: e.target.value})}
                      placeholder="Microsoft"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={newLicense.category}
                      onChange={(e) => setNewLicense({...newLicense, category: e.target.value})}
                      placeholder="Productivité"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">Type de licence</Label>
                    <Select value={newLicense.licenseType} onValueChange={(value) => setNewLicense({...newLicense, licenseType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Abonnement</SelectItem>
                        <SelectItem value="perpetual">Perpétuelle</SelectItem>
                        <SelectItem value="concurrent">Concurrente</SelectItem>
                        <SelectItem value="named_user">Utilisateur nommé</SelectItem>
                        <SelectItem value="site_license">Licence site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalSeats">Nombre de sièges</Label>
                    <Input
                      id="totalSeats"
                      type="number"
                      value={newLicense.totalSeats}
                      onChange={(e) => setNewLicense({...newLicense, totalSeats: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerSeat">Coût par siège</Label>
                    <Input
                      id="costPerSeat"
                      type="number"
                      step="0.01"
                      value={newLicense.costPerSeat}
                      onChange={(e) => setNewLicense({...newLicense, costPerSeat: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalCost">Coût total</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      step="0.01"
                      value={newLicense.totalCost}
                      onChange={(e) => setNewLicense({...newLicense, totalCost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Date d'achat</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newLicense.purchaseDate}
                      onChange={(e) => setNewLicense({...newLicense, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renewalDate">Date de renouvellement</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={newLicense.renewalDate}
                      onChange={(e) => setNewLicense({...newLicense, renewalDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddLicense}>
                  Ajouter la licence
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
            <CardTitle className="text-sm font-medium">Total Licences</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              {activeLicenses} actives
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalCost / 12)}/mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedSeats}/{totalSeats}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((usedSeats / Math.max(totalSeats, 1)) * 100)}% utilisés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renouvellements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Licences Logicielles</CardTitle>
          <CardDescription>
            Liste complète de toutes les licences avec filtres et recherche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou éditeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logiciel</TableHead>
                  <TableHead>Éditeur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sièges</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Renouvellement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-medium">
                      {license.softwareName}
                    </TableCell>
                    <TableCell>{license.vendor}</TableCell>
                    <TableCell className="capitalize">{license.licenseType}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{license.usedSeats}/{license.totalSeats}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((license.usedSeats / Math.max(license.totalSeats, 1)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(license.totalCost, license.currency)}</TableCell>
                    <TableCell>{formatDate(license.renewalDate)}</TableCell>
                    <TableCell>{getStatusBadge(license.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LicenseManagement