import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, Clock, AlertTriangle, XCircle, Plus, Search, Filter,
  ArrowRight, User, Calendar, DollarSign, FileText, Users, Building,
  Zap, Eye, MessageSquare, RotateCcw, CheckCheck, X
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface WorkflowStep {
  id: string
  step_number: number
  approver_id: string
  approver_name: string
  approver_role: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  approved_at?: string
  comments?: string
  due_date: string
}

interface ApprovalWorkflow {
  id: string
  workflow_name: string
  workflow_type: 'license_request' | 'software_declaration' | 'budget_approval' | 'contract_renewal' | 'user_invitation'
  request_id: string
  requester_id: string
  requester_name: string
  current_step: number
  total_steps: number
  current_approver_id: string
  current_approver_name: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  created_at: string
  completed_at?: string
  workflow_data: any
  steps: WorkflowStep[]
}

interface WorkflowTemplate {
  id: string
  name: string
  type: string
  description: string
  steps: {
    step_number: number
    role_required: string
    conditions?: string
    auto_approve?: boolean
  }[]
}

// Composant WorkflowCard
interface WorkflowCardProps {
  workflow: ApprovalWorkflow
  onApprove: (workflowId: string, stepId: string, comments?: string) => void
  onReject: (workflowId: string, stepId: string, comments: string) => void
  onView: (workflow: ApprovalWorkflow) => void
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  getTypeIcon: (type: string) => React.ReactNode
  isOverdue: (dueDate: string, status: string) => boolean
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onApprove,
  onReject,
  onView,
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
  getTypeIcon,
  isOverdue
}) => {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionComments, setRejectionComments] = useState('')
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)

  const currentStep = workflow.steps.find(step => step.step_number === workflow.current_step)
  const progress = (workflow.current_step / workflow.total_steps) * 100

  const handleApproveClick = () => {
    if (currentStep) {
      onApprove(workflow.id, currentStep.id, approvalComments)
      setShowApprovalDialog(false)
      setApprovalComments('')
    }
  }

  const handleRejectClick = () => {
    if (currentStep && rejectionComments.trim()) {
      onReject(workflow.id, currentStep.id, rejectionComments)
      setShowRejectionDialog(false)
      setRejectionComments('')
    }
  }

  return (
    <Card className={`${isOverdue(workflow.due_date, workflow.status) ? 'border-red-300 bg-red-50 dark:bg-red-950' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(workflow.workflow_type)}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.workflow_name}
                </h3>
              </div>
              
              <Badge className={getStatusColor(workflow.status)}>
                {getStatusIcon(workflow.status)}
                <span className="ml-1 capitalize">{workflow.status}</span>
              </Badge>
              
              <Badge className={getPriorityColor(workflow.priority)}>
                {workflow.priority}
              </Badge>

              {isOverdue(workflow.due_date, workflow.status) && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  En retard
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>Demandeur: {workflow.requester_name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>Approbateur: {workflow.current_approver_name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Échéance: {new Date(workflow.due_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progression</span>
                <span>{workflow.current_step}/{workflow.total_steps} étapes</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Workflow Data */}
            {workflow.workflow_data && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Détails de la demande:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(workflow.workflow_data).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace('_', ' ')}: 
                      </span>
                      <span className="text-gray-900 dark:text-white ml-1">
                        {typeof value === 'number' && key.includes('cost') ? `${value}€` : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => onView(workflow)}>
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </Button>
            
            {workflow.status === 'pending' && currentStep && (
              <>
                <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approuver le workflow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="approval-comments">Commentaires (optionnel)</Label>
                        <Textarea
                          id="approval-comments"
                          value={approvalComments}
                          onChange={(e) => setApprovalComments(e.target.value)}
                          placeholder="Ajoutez vos commentaires..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleApproveClick} className="bg-green-600 hover:bg-green-700">
                          Approuver
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <X className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rejeter le workflow</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rejection-comments">Motif du rejet *</Label>
                        <Textarea
                          id="rejection-comments"
                          value={rejectionComments}
                          onChange={(e) => setRejectionComments(e.target.value)}
                          placeholder="Expliquez pourquoi vous rejetez cette demande..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                          Annuler
                        </Button>
                        <Button 
                          onClick={handleRejectClick} 
                          variant="destructive"
                          disabled={!rejectionComments.trim()}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant WorkflowDetailDialog
interface WorkflowDetailDialogProps {
  workflow: ApprovalWorkflow
  onClose: () => void
  onApprove: (workflowId: string, stepId: string, comments?: string) => void
  onReject: (workflowId: string, stepId: string, comments: string) => void
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  getTypeIcon: (type: string) => React.ReactNode
}

const WorkflowDetailDialog: React.FC<WorkflowDetailDialogProps> = ({
  workflow,
  onClose,
  onApprove,
  onReject,
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
  getTypeIcon
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getTypeIcon(workflow.workflow_type)}
            <span>{workflow.workflow_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Workflow Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(workflow.status)}>
                  {getStatusIcon(workflow.status)}
                  <span className="ml-1 capitalize">{workflow.status}</span>
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priorité</Label>
              <div className="mt-1">
                <Badge className={getPriorityColor(workflow.priority)}>
                  {workflow.priority}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Demandeur</Label>
              <p className="mt-1 text-gray-900 dark:text-white">{workflow.requester_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Créé le</Label>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(workflow.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Progression ({workflow.current_step}/{workflow.total_steps})
            </Label>
            <Progress value={(workflow.current_step / workflow.total_steps) * 100} className="mt-2" />
          </div>

          {/* Workflow Steps */}
          <div>
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
              Étapes du workflow
            </Label>
            <div className="space-y-3">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {step.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                    {step.status === 'pending' && workflow.current_step === step.step_number && (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    {step.status === 'pending' && workflow.current_step !== step.step_number && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Étape {step.step_number}: {step.approver_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.approver_role}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Échéance: {new Date(step.due_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    {step.comments && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        {step.comments}
                      </div>
                    )}
                    
                    {step.approved_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.status === 'approved' ? 'Approuvé' : 'Rejeté'} le{' '}
                        {new Date(step.approved_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Data */}
          {workflow.workflow_data && (
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 block">
                Détails de la demande
              </Label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(workflow.workflow_data).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace('_', ' ')}
                      </Label>
                      <p className="text-gray-900 dark:text-white">
                        {typeof value === 'number' && key.includes('cost') ? `${value}€` : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ApprovalWorkflows: React.FC = () => {
  const { t } = useLanguage()
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    overdue: 0,
    avgProcessingTime: 0
  })

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      
      // Charger les workflows avec leurs étapes
      const workflowsData = await blink.db.approvalWorkflows.list({
        orderBy: { created_at: 'desc' },
        limit: 100
      })

      // Simuler des données complètes pour la démo
      const mockWorkflows: ApprovalWorkflow[] = [
        {
          id: 'wf_001',
          workflow_name: 'Demande Microsoft Office 365 - 50 licences',
          workflow_type: 'license_request',
          request_id: 'req_001',
          requester_id: 'user_001',
          requester_name: 'Marie Dubois',
          current_step: 2,
          total_steps: 3,
          current_approver_id: 'user_003',
          current_approver_name: 'Pierre Martin (IT Manager)',
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          workflow_data: {
            software_name: 'Microsoft Office 365',
            quantity: 50,
            estimated_cost: 15000,
            justification: 'Nouvelle équipe marketing - 50 personnes'
          },
          steps: [
            {
              id: 'step_001',
              step_number: 1,
              approver_id: 'user_002',
              approver_name: 'Jean Dupont',
              approver_role: 'Department Manager',
              status: 'approved',
              approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Approuvé - Besoin justifié pour la nouvelle équipe',
              due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'step_002',
              step_number: 2,
              approver_id: 'user_003',
              approver_name: 'Pierre Martin',
              approver_role: 'IT Manager',
              status: 'pending',
              due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'step_003',
              step_number: 3,
              approver_id: 'user_004',
              approver_name: 'Sophie Bernard',
              approver_role: 'Finance Manager',
              status: 'pending',
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'wf_002',
          workflow_name: 'Déclaration Slack Premium',
          workflow_type: 'software_declaration',
          request_id: 'decl_001',
          requester_id: 'user_005',
          requester_name: 'Thomas Leroy',
          current_step: 1,
          total_steps: 2,
          current_approver_id: 'user_002',
          current_approver_name: 'Jean Dupont (Manager)',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          workflow_data: {
            software_name: 'Slack Premium',
            usage_frequency: 'daily',
            estimated_cost: 8,
            justification: 'Communication équipe développement'
          },
          steps: [
            {
              id: 'step_004',
              step_number: 1,
              approver_id: 'user_002',
              approver_name: 'Jean Dupont',
              approver_role: 'Department Manager',
              status: 'pending',
              due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'step_005',
              step_number: 2,
              approver_id: 'user_003',
              approver_name: 'Pierre Martin',
              approver_role: 'IT Manager',
              status: 'pending',
              due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'wf_003',
          workflow_name: 'Budget Q2 2024 - Département IT',
          workflow_type: 'budget_approval',
          request_id: 'budget_001',
          requester_id: 'user_003',
          requester_name: 'Pierre Martin',
          current_step: 3,
          total_steps: 3,
          current_approver_id: 'user_006',
          current_approver_name: 'Directeur Général',
          status: 'approved',
          priority: 'high',
          due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          workflow_data: {
            budget_amount: 250000,
            category: 'software_licenses',
            fiscal_year: '2024',
            justification: 'Renouvellement licences + nouvelles acquisitions'
          },
          steps: [
            {
              id: 'step_006',
              step_number: 1,
              approver_id: 'user_004',
              approver_name: 'Sophie Bernard',
              approver_role: 'Finance Manager',
              status: 'approved',
              approved_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Budget cohérent avec les prévisions',
              due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'step_007',
              step_number: 2,
              approver_id: 'user_005',
              approver_name: 'Directeur IT',
              approver_role: 'IT Director',
              status: 'approved',
              approved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Approuvé - Investissements nécessaires',
              due_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'step_008',
              step_number: 3,
              approver_id: 'user_006',
              approver_name: 'Directeur Général',
              approver_role: 'CEO',
              status: 'approved',
              approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              comments: 'Validation finale - Budget approuvé',
              due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]

      setWorkflows(mockWorkflows)
      
      // Calculer les statistiques
      const now = new Date()
      const totalWorkflows = mockWorkflows.length
      const pendingWorkflows = mockWorkflows.filter(w => w.status === 'pending').length
      const approvedWorkflows = mockWorkflows.filter(w => w.status === 'approved').length
      const rejectedWorkflows = mockWorkflows.filter(w => w.status === 'rejected').length
      const overdueWorkflows = mockWorkflows.filter(w => 
        w.status === 'pending' && new Date(w.due_date) < now
      ).length

      setStats({
        total: totalWorkflows,
        pending: pendingWorkflows,
        approved: approvedWorkflows,
        rejected: rejectedWorkflows,
        overdue: overdueWorkflows,
        avgProcessingTime: 3.2 // jours moyens
      })

    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les workflows d'approbation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const handleApprove = async (workflowId: string, stepId: string, comments?: string) => {
    try {
      // Simuler l'approbation
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedSteps = workflow.steps.map(step => {
            if (step.id === stepId) {
              return {
                ...step,
                status: 'approved' as const,
                approved_at: new Date().toISOString(),
                comments: comments || 'Approuvé'
              }
            }
            return step
          })

          // Vérifier si c'est la dernière étape
          const isLastStep = workflow.current_step === workflow.total_steps
          const nextStep = workflow.current_step + 1

          return {
            ...workflow,
            steps: updatedSteps,
            current_step: isLastStep ? workflow.current_step : nextStep,
            status: isLastStep ? 'approved' as const : workflow.status,
            completed_at: isLastStep ? new Date().toISOString() : workflow.completed_at,
            current_approver_id: isLastStep ? workflow.current_approver_id : workflow.steps[nextStep - 1]?.approver_id,
            current_approver_name: isLastStep ? workflow.current_approver_name : workflow.steps[nextStep - 1]?.approver_name
          }
        }
        return workflow
      }))

      toast({
        title: "Succès",
        description: "Workflow approuvé avec succès",
      })
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le workflow",
        variant: "destructive"
      })
    }
  }

  const handleReject = async (workflowId: string, stepId: string, comments: string) => {
    try {
      // Simuler le rejet
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedSteps = workflow.steps.map(step => {
            if (step.id === stepId) {
              return {
                ...step,
                status: 'rejected' as const,
                approved_at: new Date().toISOString(),
                comments: comments
              }
            }
            return step
          })

          return {
            ...workflow,
            steps: updatedSteps,
            status: 'rejected' as const,
            completed_at: new Date().toISOString()
          }
        }
        return workflow
      }))

      toast({
        title: "Workflow rejeté",
        description: "Le workflow a été rejeté avec succès",
      })
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le workflow",
        variant: "destructive"
      })
    }
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.requester_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
    const matchesType = typeFilter === 'all' || workflow.workflow_type === typeFilter
    const matchesPriority = priorityFilter === 'all' || workflow.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license_request': return <FileText className="w-4 h-4" />
      case 'software_declaration': return <Zap className="w-4 h-4" />
      case 'budget_approval': return <DollarSign className="w-4 h-4" />
      case 'contract_renewal': return <Calendar className="w-4 h-4" />
      case 'user_invitation': return <Users className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date()
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('approvalWorkflows')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des workflows d'approbation multi-niveaux
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowTemplateDialog(true)} variant="outline">
            <Building className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Retard</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temps Moyen</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgProcessingTime}j</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="license_request">Demande de licence</SelectItem>
                <SelectItem value="software_declaration">Déclaration logicielle</SelectItem>
                <SelectItem value="budget_approval">Approbation budget</SelectItem>
                <SelectItem value="contract_renewal">Renouvellement contrat</SelectItem>
                <SelectItem value="user_invitation">Invitation utilisateur</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">En Attente ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approuvés ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredWorkflows.filter(w => w.status === 'pending').map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={setSelectedWorkflow}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTypeIcon={getTypeIcon}
              isOverdue={isOverdue}
            />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredWorkflows.filter(w => w.status === 'approved').map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={setSelectedWorkflow}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTypeIcon={getTypeIcon}
              isOverdue={isOverdue}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filteredWorkflows.filter(w => w.status === 'rejected').map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={setSelectedWorkflow}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTypeIcon={getTypeIcon}
              isOverdue={isOverdue}
            />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
              onReject={handleReject}
              onView={setSelectedWorkflow}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              getTypeIcon={getTypeIcon}
              isOverdue={isOverdue}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Dialog */}
      {selectedWorkflow && (
        <WorkflowDetailDialog 
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getTypeIcon={getTypeIcon}
        />
      )}
    </div>
  )
}

export default ApprovalWorkflows