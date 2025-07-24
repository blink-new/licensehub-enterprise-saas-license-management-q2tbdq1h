import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  UserPlus, Mail, Clock, CheckCircle, XCircle, Send, RotateCcw, 
  Search, Filter, Download, Upload, Calendar, AlertCircle, Users,
  Building, Shield, Eye, Trash2, Copy, RefreshCw
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface Invitation {
  id: string
  email: string
  role: string
  department_id?: string
  invited_by: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  created_at: string
  expires_at: string
  message?: string
  reminder_sent_at?: string
}

interface Department {
  id: string
  name: string
}

const UserInvitations: React.FC = () => {
  const { t } = useLanguage()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([])

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    department_id: '',
    message: ''
  })
  const [bulkEmails, setBulkEmails] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    thisMonth: 0,
    acceptanceRate: 0
  })

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const data = await blink.db.userInvitations.list({
        orderBy: { createdAt: 'desc' }
      })
      setInvitations(data)
    } catch (error) {
      console.error('Error loading invitations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les invitations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await blink.db.departments.list({
        where: { isActive: "1" }
      })
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  const calculateStats = useCallback(() => {
    const total = invitations.length
    const pending = invitations.filter(inv => inv.status === 'pending').length
    const accepted = invitations.filter(inv => inv.status === 'accepted').length
    const expired = invitations.filter(inv => inv.status === 'expired').length
    
    const thisMonth = invitations.filter(inv => {
      const inviteDate = new Date(inv.created_at)
      const now = new Date()
      return inviteDate.getMonth() === now.getMonth() && inviteDate.getFullYear() === now.getFullYear()
    }).length

    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0

    setStats({ total, pending, accepted, expired, thisMonth, acceptanceRate })
  }, [invitations])

  const handleInviteUser = async () => {
    try {
      if (!inviteForm.email || !inviteForm.role) {
        toast({
          title: "Erreur",
          description: "Email et rôle sont requis",
          variant: "destructive"
        })
        return
      }

      const user = await blink.auth.me()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

      const newInvitation = {
        id: `inv_${Date.now()}`,
        email: inviteForm.email,
        role: inviteForm.role,
        department_id: inviteForm.department_id || null,
        invited_by: user.id,
        status: 'pending' as const,
        expires_at: expiresAt.toISOString(),
        message: inviteForm.message || null,
        invitation_token: `token_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      }

      await blink.db.userInvitations.create(newInvitation)
      
      // Simuler l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Invitation envoyée",
        description: `Invitation envoyée à ${inviteForm.email}`,
      })

      setInviteForm({ email: '', role: 'employee', department_id: '', message: '' })
      setShowInviteDialog(false)
      loadInvitations()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation",
        variant: "destructive"
      })
    }
  }

  const handleBulkInvite = async () => {
    try {
      const emails = bulkEmails.split('\n').filter(email => email.trim())
      if (emails.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun email valide trouvé",
          variant: "destructive"
        })
        return
      }

      const user = await blink.auth.me()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      for (const email of emails) {
        const newInvitation = {
          id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          email: email.trim(),
          role: inviteForm.role,
          department_id: inviteForm.department_id || null,
          invited_by: user.id,
          status: 'pending' as const,
          expires_at: expiresAt.toISOString(),
          message: inviteForm.message || null,
          invitation_token: `token_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        }

        await blink.db.userInvitations.create(newInvitation)
        await new Promise(resolve => setTimeout(resolve, 100)) // Délai entre les invitations
      }

      toast({
        title: "Invitations envoyées",
        description: `${emails.length} invitations envoyées avec succès`,
      })

      setBulkEmails('')
      setShowBulkDialog(false)
      loadInvitations()
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des invitations en masse",
        variant: "destructive"
      })
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await blink.db.userInvitations.update(invitationId, {
        reminderSentAt: new Date().toISOString()
      })

      toast({
        title: "Rappel envoyé",
        description: "Rappel d'invitation envoyé avec succès",
      })

      loadInvitations()
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel",
        variant: "destructive"
      })
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await blink.db.userInvitations.update(invitationId, {
        status: 'cancelled'
      })

      toast({
        title: "Invitation annulée",
        description: "L'invitation a été annulée avec succès",
      })

      loadInvitations()
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'invitation",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'En attente' },
      accepted: { variant: 'default' as const, icon: CheckCircle, text: 'Acceptée' },
      expired: { variant: 'destructive' as const, icon: XCircle, text: 'Expirée' },
      cancelled: { variant: 'outline' as const, icon: XCircle, text: 'Annulée' }
    }
    
    const config = variants[status as keyof typeof variants]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      super_admin: 'bg-red-100 text-red-800',
      it_manager: 'bg-blue-100 text-blue-800',
      department_manager: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800',
      service_provider: 'bg-purple-100 text-purple-800'
    }
    
    const roleNames = {
      super_admin: 'Super Admin',
      it_manager: 'IT Manager',
      department_manager: 'Manager',
      employee: 'Employé',
      service_provider: 'Prestataire'
    }

    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {roleNames[role as keyof typeof roleNames] || role}
      </Badge>
    )
  }

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesRole = roleFilter === 'all' || invitation.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 2 && diffDays > 0
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  useEffect(() => {
    loadInvitations()
    loadDepartments()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [invitations, calculateStats])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invitations Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les invitations et l'onboarding automatisé des nouveaux utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invitations en masse
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvelle invitation
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} ce mois
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Non acceptées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptanceRate}% taux d'acceptation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirées</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              À renouveler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acceptance Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Taux d'Acceptation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Acceptation globale</span>
              <span className="font-medium">{stats.acceptanceRate}%</span>
            </div>
            <Progress value={stats.acceptanceRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.accepted} acceptées sur {stats.total} invitations envoyées
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Acceptées</SelectItem>
                <SelectItem value="expired">Expirées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="employee">Employé</SelectItem>
                <SelectItem value="department_manager">Manager</SelectItem>
                <SelectItem value="it_manager">IT Manager</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invitations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Invité par</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune invitation trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {invitation.email}
                          {isExpiringSoon(invitation.expires_at) && (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(invitation.role)}
                      </TableCell>
                      <TableCell>
                        {departments.find(d => d.id === invitation.department_id)?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invitation.invited_by}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={isExpired(invitation.expires_at) ? 'text-red-600' : ''}>
                          {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendInvitation(invitation.id)}
                                title="Renvoyer l'invitation"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                title="Annuler l'invitation"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Copier le lien d'invitation"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Single Invitation Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouvelle Invitation</DialogTitle>
            <DialogDescription>
              Invitez un nouvel utilisateur à rejoindre la plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="utilisateur@entreprise.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employé</SelectItem>
                  <SelectItem value="department_manager">Manager de Département</SelectItem>
                  <SelectItem value="it_manager">IT Manager</SelectItem>
                  <SelectItem value="super_admin">Super Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Département</Label>
              <Select value={inviteForm.department_id} onValueChange={(value) => setInviteForm(prev => ({ ...prev, department_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message personnalisé</Label>
              <Textarea
                id="message"
                placeholder="Message d'accueil personnalisé (optionnel)"
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleInviteUser}>
              <Send className="h-4 w-4 mr-2" />
              Envoyer l'invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invitation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invitations en Masse</DialogTitle>
            <DialogDescription>
              Invitez plusieurs utilisateurs en une seule fois
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-emails">Emails (un par ligne) *</Label>
              <Textarea
                id="bulk-emails"
                placeholder="utilisateur1@entreprise.com&#10;utilisateur2@entreprise.com&#10;utilisateur3@entreprise.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {bulkEmails.split('\n').filter(email => email.trim()).length} emails détectés
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-role">Rôle par défaut *</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employé</SelectItem>
                  <SelectItem value="department_manager">Manager de Département</SelectItem>
                  <SelectItem value="it_manager">IT Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-department">Département par défaut</Label>
              <Select value={inviteForm.department_id} onValueChange={(value) => setInviteForm(prev => ({ ...prev, department_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-message">Message personnalisé</Label>
              <Textarea
                id="bulk-message"
                placeholder="Message d'accueil pour tous les invités"
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkInvite}>
              <Users className="h-4 w-4 mr-2" />
              Envoyer les invitations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserInvitations