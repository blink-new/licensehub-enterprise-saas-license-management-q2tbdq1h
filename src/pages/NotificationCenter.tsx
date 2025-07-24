import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, AlertTriangle, CheckCircle, Info, Search, Filter,
  Clock, Calendar, User, ExternalLink, Check, Trash2,
  Settings, Plus, X, Eye, EyeOff
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from '@/hooks/use-toast'
import blink from '@/blink/client'

interface Notification {
  id: string
  userId?: string
  type: string
  title: string
  message: string
  priority: string
  category?: string
  actionUrl?: string
  actionLabel?: string
  isRead: boolean
  isDismissed: boolean
  expiresAt?: string
  metadata?: string
  createdAt: string
  readAt?: string
}

const NotificationCenter: React.FC = () => {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showRead, setShowRead] = useState(true)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      const data = await blink.db.notifications.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await blink.db.notifications.update(notificationId, {
        isRead: true,
        readAt: new Date().toISOString()
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      )
      
      toast({
        title: "Succès",
        description: "Notification marquée comme lue"
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme lue",
        variant: "destructive"
      })
    }
  }

  const handleDismiss = async (notificationId: string) => {
    try {
      await blink.db.notifications.update(notificationId, {
        isDismissed: true
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isDismissed: true } : n)
      )
      
      toast({
        title: "Succès",
        description: "Notification supprimée"
      })
    } catch (error) {
      console.error('Error dismissing notification:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead && !n.isDismissed)
      
      for (const notification of unreadNotifications) {
        await blink.db.notifications.update(notification.id, {
          isRead: true,
          readAt: new Date().toISOString()
        })
      }
      
      setNotifications(prev => 
        prev.map(n => !n.isRead && !n.isDismissed ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      )
      
      toast({
        title: "Succès",
        description: "Toutes les notifications marquées comme lues"
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes comme lues",
        variant: "destructive"
      })
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Élevé</Badge>
      case 'medium':
        return <Badge variant="secondary"><Info className="h-3 w-3 mr-1" />Moyen</Badge>
      case 'low':
        return <Badge variant="outline"><Info className="h-3 w-3 mr-1" />Faible</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license_expiry':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'approval_request':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'budget_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'compliance_issue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'system_update':
        return <Info className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'license_expiry':
        return 'Expiration de licence'
      case 'approval_request':
        return 'Demande d\'approbation'
      case 'budget_alert':
        return 'Alerte budgétaire'
      case 'compliance_issue':
        return 'Problème de conformité'
      case 'system_update':
        return 'Mise à jour système'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'À l\'instant'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return 'Hier'
    return date.toLocaleDateString('fr-FR')
  }

  const filteredNotifications = notifications.filter(notification => {
    if (notification.isDismissed) return false
    if (!showRead && notification.isRead) return false
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    
    return matchesSearch && matchesType && matchesPriority
  })

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length
  const criticalCount = notifications.filter(n => ['urgent', 'high'].includes(n.priority) && !n.isDismissed).length
  const resolvedCount = notifications.filter(n => n.isRead).length
  const systemCount = notifications.filter(n => n.type === 'system_update' && !n.isDismissed).length

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
          <h2 className="text-3xl font-bold tracking-tight">Centre de Notifications</h2>
          <p className="text-muted-foreground">
            Alertes et notifications système en temps réel
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowRead(!showRead)}>
            {showRead ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showRead ? 'Masquer lues' : 'Afficher lues'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lues</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Notifications actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Système</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemCount}</div>
            <p className="text-xs text-muted-foreground">Mises à jour</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Liste de toutes vos notifications avec filtres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="license_expiry">Expiration licence</SelectItem>
                <SelectItem value="approval_request">Approbation</SelectItem>
                <SelectItem value="budget_alert">Alerte budget</SelectItem>
                <SelectItem value="compliance_issue">Conformité</SelectItem>
                <SelectItem value="system_update">Système</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Aucune notification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vous êtes à jour ! Aucune notification ne correspond à vos filtres.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        <p className={`text-sm ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(notification.createdAt)}
                          </div>
                          {notification.readAt && (
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              Lu {formatDate(notification.readAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.actionUrl && notification.actionLabel && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {notification.actionLabel}
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationCenter