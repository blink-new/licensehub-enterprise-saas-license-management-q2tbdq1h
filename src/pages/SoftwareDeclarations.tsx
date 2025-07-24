import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, Search, Filter, FileText, Clock, CheckCircle, 
  XCircle, AlertTriangle, User, Calendar, Eye, 
  ArrowRight, HelpCircle, Lightbulb, Shield, DollarSign,
  Workflow, MessageSquare, History
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface Declaration {
  id: string
  userId: string
  softwareName: string
  vendor: string
  version: string
  usageFrequency: string
  businessJustification: string
  alternativeConsidered: string
  declaredDate: string
  reviewedBy?: string
  reviewedDate?: string
  status: string
  priority: string
  estimatedCost: number
  approvalNotes?: string
}

interface WorkflowStep {
  step: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: React.ReactNode
}

const SoftwareDeclarations: React.FC = () => {
  const { t } = useLanguage()
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newDeclaration, setNewDeclaration] = useState({
    softwareName: '',
    vendor: '',
    version: '',
    usageFrequency: 'daily',
    businessJustification: '',
    alternativeConsidered: '',
    priority: 'medium',
    estimatedCost: 0
  })

  // Workflow steps for declaration process
  const workflowSteps: WorkflowStep[] = [
    {
      step: 1,
      title: "Informations de base",
      description: "Nom, éditeur et version du logiciel",
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
      icon: <FileText className="h-4 w-4" />
    },
    {
      step: 2,
      title: "Usage et justification",
      description: "Fréquence d'utilisation et justification métier",
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
      icon: <User className="h-4 w-4" />
    },
    {
      step: 3,
      title: "Évaluation et coût",
      description: "Alternatives, priorité et budget",
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      step: 4,
      title: "Révision et soumission",
      description: "Vérification finale avant envoi",
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ]

  const loadDeclarations = async () => {
    try {
      setLoading(true)
      const data = await blink.db.softwareDeclarations.list({
        orderBy: { declaredDate: 'desc' }
      })
      setDeclarations(data)
    } catch (error) {
      console.error('Error loading declarations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les déclarations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeclarations()
  }, [])

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddDeclaration = async () => {
    try {
      const user = await blink.auth.me()
      const declarationData = {
        ...newDeclaration,
        id: `decl_${Date.now()}`,
        userId: user.id,
        declaredDate: new Date().toISOString(),
        status: 'pending'
      }

      await blink.db.softwareDeclarations.create(declarationData)
      
      // Create approval workflow
      const workflowData = {
        id: `workflow_${Date.now()}`,
        workflowName: `Déclaration: ${newDeclaration.softwareName}`,
        workflowType: 'software_declaration',
        requestId: declarationData.id,
        requesterId: user.id,
        currentStep: 1,
        totalSteps: newDeclaration.priority === 'critical' ? 3 : 2,
        status: 'pending',
        priority: newDeclaration.priority,
        createdAt: new Date().toISOString(),
        workflowData: JSON.stringify({
          softwareName: newDeclaration.softwareName,
          estimatedCost: newDeclaration.estimatedCost,
          priority: newDeclaration.priority
        })
      }

      await blink.db.approvalWorkflows.create(workflowData)
      
      toast({
        title: "✅ Déclaration soumise !",
        description: `Votre demande pour ${newDeclaration.softwareName} a été envoyée pour approbation.`
      })
      
      setIsAddDialogOpen(false)
      setCurrentStep(1)
      setNewDeclaration({
        softwareName: '',
        vendor: '',
        version: '',
        usageFrequency: 'daily',
        businessJustification: '',
        alternativeConsidered: '',
        priority: 'medium',
        estimatedCost: 0
      })
      loadDeclarations()
    } catch (error) {
      console.error('Error adding declaration:', error)
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la déclaration",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>
      case 'needs_license':
        return <Badge className="bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" />Licence requise</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">🔥 Critique</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">⚡ Élevé</Badge>
      case 'medium':
        return <Badge variant="secondary">📋 Moyen</Badge>
      case 'low':
        return <Badge variant="outline">📝 Faible</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredDeclarations = declarations.filter(declaration => {
    const matchesSearch = declaration.softwareName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || declaration.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || declaration.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const pendingCount = declarations.filter(d => d.status === 'pending').length
  const approvedCount = declarations.filter(d => d.status === 'approved').length
  const rejectedCount = declarations.filter(d => d.status === 'rejected').length
  const needsLicenseCount = declarations.filter(d => d.status === 'needs_license').length

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="softwareName">Nom du logiciel *</Label>
                <Input
                  id="softwareName"
                  value={newDeclaration.softwareName}
                  onChange={(e) => setNewDeclaration({...newDeclaration, softwareName: e.target.value})}
                  placeholder="Ex: Adobe Photoshop, Figma, Slack..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Éditeur *</Label>
                <Input
                  id="vendor"
                  value={newDeclaration.vendor}
                  onChange={(e) => setNewDeclaration({...newDeclaration, vendor: e.target.value})}
                  placeholder="Ex: Adobe, Figma Inc, Slack Technologies..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version (optionnel)</Label>
              <Input
                id="version"
                value={newDeclaration.version}
                onChange={(e) => setNewDeclaration({...newDeclaration, version: e.target.value})}
                placeholder="Ex: 2024, v3.2, CC 2024..."
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Conseil</h4>
                  <p className="text-sm text-blue-700">
                    Soyez précis dans le nom du logiciel pour faciliter l'identification et éviter les doublons.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usageFrequency">Fréquence d'utilisation *</Label>
              <Select value={newDeclaration.usageFrequency} onValueChange={(value) => setNewDeclaration({...newDeclaration, usageFrequency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">📅 Quotidien - Utilisation tous les jours</SelectItem>
                  <SelectItem value="weekly">📊 Hebdomadaire - Plusieurs fois par semaine</SelectItem>
                  <SelectItem value="monthly">📋 Mensuel - Quelques fois par mois</SelectItem>
                  <SelectItem value="rarely">⏰ Rarement - Utilisation ponctuelle</SelectItem>
                  <SelectItem value="never">❌ Jamais - Plus utilisé actuellement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessJustification">Justification métier *</Label>
              <Textarea
                id="businessJustification"
                value={newDeclaration.businessJustification}
                onChange={(e) => setNewDeclaration({...newDeclaration, businessJustification: e.target.value})}
                placeholder="Expliquez en détail pourquoi ce logiciel est nécessaire pour votre travail :
• Quelles tâches accomplissez-vous avec ?
• En quoi améliore-t-il votre productivité ?
• Y a-t-il des fonctionnalités spécifiques requises ?"
                rows={4}
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Sécurité & Conformité</h4>
                  <p className="text-sm text-green-700">
                    Votre demande sera évaluée selon nos politiques de sécurité et de conformité RGPD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alternativeConsidered">Alternatives considérées</Label>
              <Textarea
                id="alternativeConsidered"
                value={newDeclaration.alternativeConsidered}
                onChange={(e) => setNewDeclaration({...newDeclaration, alternativeConsidered: e.target.value})}
                placeholder="Avez-vous évalué d'autres solutions ? Pourquoi ne conviennent-elles pas ?
• Solutions gratuites ou open source
• Outils déjà disponibles dans l'entreprise
• Alternatives moins coûteuses"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité *</Label>
                <Select value={newDeclaration.priority} onValueChange={(value) => setNewDeclaration({...newDeclaration, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">📝 Faible - Amélioration de confort</SelectItem>
                    <SelectItem value="medium">📋 Moyen - Nécessaire pour le travail</SelectItem>
                    <SelectItem value="high">⚡ Élevé - Impact sur la productivité</SelectItem>
                    <SelectItem value="critical">🔥 Critique - Bloque le travail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Coût estimé (€/mois)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  value={newDeclaration.estimatedCost}
                  onChange={(e) => setNewDeclaration({...newDeclaration, estimatedCost: parseFloat(e.target.value) || 0})}
                  placeholder="Ex: 29.99"
                />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Impact Budgétaire</h4>
                  <p className="text-sm text-orange-700">
                    Les demandes supérieures à 100€/mois nécessitent une validation budgétaire supplémentaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Récapitulatif de votre demande</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Logiciel:</span> {newDeclaration.softwareName}
                </div>
                <div>
                  <span className="font-medium">Éditeur:</span> {newDeclaration.vendor}
                </div>
                <div>
                  <span className="font-medium">Fréquence:</span> {newDeclaration.usageFrequency}
                </div>
                <div>
                  <span className="font-medium">Priorité:</span> {newDeclaration.priority}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Coût estimé:</span> {newDeclaration.estimatedCost > 0 ? `${newDeclaration.estimatedCost}€/mois` : 'Non spécifié'}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Workflow className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Processus d'approbation</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Votre demande suivra ce processus :
                  </p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>1. Validation par votre manager direct</div>
                    <div>2. Validation IT (si critique)</div>
                    <div>3. Validation budgétaire (si coût élevé)</div>
                    <div>4. Décision finale et notification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Déclarations Logicielles</h2>
          <p className="text-muted-foreground">
            Déclarez et gérez vos demandes de logiciels professionnels
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle déclaration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle déclaration logicielle</DialogTitle>
              <DialogDescription>
                Suivez les étapes pour déclarer un nouveau logiciel
              </DialogDescription>
            </DialogHeader>
            
            {/* Workflow Progress */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.step} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                      step.status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                      'bg-gray-100 border-gray-300 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : step.icon}
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h3 className="font-medium">{workflowSteps[currentStep - 1].title}</h3>
                <p className="text-sm text-muted-foreground">{workflowSteps[currentStep - 1].description}</p>
              </div>
            </div>

            {/* Step Content */}
            <div className="py-4">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                {currentStep < 4 ? (
                  <Button 
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && (!newDeclaration.softwareName || !newDeclaration.vendor)) ||
                      (currentStep === 2 && !newDeclaration.businessJustification)
                    }
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleAddDeclaration}>
                    Soumettre la déclaration
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{declarations.length}</div>
            <p className="text-xs text-muted-foreground">
              Déclarations totales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              En cours d'approbation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Validées et disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licence requise</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{needsLicenseCount}</div>
            <p className="text-xs text-muted-foreground">
              Achat en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Declarations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Déclarations</CardTitle>
          <CardDescription>
            Historique et statut de toutes vos demandes de logiciels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Toutes ({declarations.length})</TabsTrigger>
              <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approuvées ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées ({rejectedCount})</TabsTrigger>
              <TabsTrigger value="needs_license">Licence requise ({needsLicenseCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center space-x-4">
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
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Priorité" />
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logiciel</TableHead>
                      <TableHead>Éditeur</TableHead>
                      <TableHead>Fréquence</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Coût estimé</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeclarations.map((declaration) => (
                      <TableRow key={declaration.id}>
                        <TableCell className="font-medium">
                          {declaration.softwareName}
                          {declaration.version && (
                            <span className="text-sm text-muted-foreground ml-2">
                              v{declaration.version}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{declaration.vendor}</TableCell>
                        <TableCell className="capitalize">{declaration.usageFrequency}</TableCell>
                        <TableCell>{getPriorityBadge(declaration.priority)}</TableCell>
                        <TableCell>{formatDate(declaration.declaredDate)}</TableCell>
                        <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                        <TableCell>
                          {declaration.estimatedCost ? `${declaration.estimatedCost.toLocaleString('fr-FR')} €/mois` : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDeclaration(declaration)
                              setIsDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la déclaration</DialogTitle>
            <DialogDescription>
              {selectedDeclaration?.softwareName} - {selectedDeclaration?.vendor}
            </DialogDescription>
          </DialogHeader>
          {selectedDeclaration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedDeclaration.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priorité</Label>
                  <div className="mt-1">{getPriorityBadge(selectedDeclaration.priority)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Justification métier</Label>
                <p className="mt-1 text-sm text-gray-700">{selectedDeclaration.businessJustification}</p>
              </div>
              {selectedDeclaration.alternativeConsidered && (
                <div>
                  <Label className="text-sm font-medium">Alternatives considérées</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedDeclaration.alternativeConsidered}</p>
                </div>
              )}
              {selectedDeclaration.approvalNotes && (
                <div>
                  <Label className="text-sm font-medium">Notes d'approbation</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedDeclaration.approvalNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SoftwareDeclarations