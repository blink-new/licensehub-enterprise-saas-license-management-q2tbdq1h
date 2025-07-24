import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  User, Shield, Settings, Users, Wrench, 
  Eye, Lock, CheckCircle, AlertTriangle, Info
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

interface UserRole {
  id: string
  name: string
  nameEn: string
  icon: React.ComponentType<any>
  color: string
  permissions: string[]
  description: string
  descriptionEn: string
  modules: string[]
  restrictions: string[]
}

const userRoles: UserRole[] = [
  {
    id: 'super_admin',
    name: 'Super Administrateur',
    nameEn: 'Super Administrator',
    icon: Shield,
    color: 'bg-red-500',
    permissions: ['Accès complet', 'Configuration système', 'Gestion utilisateurs', 'Tous les modules'],
    description: 'Accès complet à toutes les fonctionnalités, configuration système, gestion des utilisateurs et des permissions.',
    descriptionEn: 'Full access to all features, system configuration, user and permission management.',
    modules: ['Tous les 18 modules', 'Configuration avancée', 'Audit complet', 'Intégrations système'],
    restrictions: ['Aucune restriction']
  },
  {
    id: 'it_manager',
    name: 'Responsable IT',
    nameEn: 'IT Manager',
    icon: Settings,
    color: 'bg-blue-500',
    permissions: ['Gestion licences', 'Approbations', 'Budgets IT', 'Analytics avancés'],
    description: 'Gestion complète des licences, approbation des demandes, contrôle des budgets IT et accès aux analytics.',
    descriptionEn: 'Complete license management, request approvals, IT budget control and analytics access.',
    modules: ['License Management', 'Approval Workflows', 'Budget Management', 'Advanced Analytics', 'Renewal Management', 'Contract Management', 'Software Catalog', 'Reports & Audits'],
    restrictions: ['Pas de gestion utilisateurs globale', 'Pas de configuration système']
  },
  {
    id: 'department_manager',
    name: 'Responsable de Département',
    nameEn: 'Department Manager',
    icon: Users,
    color: 'bg-green-500',
    permissions: ['Équipe département', 'Approbations équipe', 'Budget département', 'Déclarations équipe'],
    description: 'Gestion de son équipe, approbation des demandes de son département, contrôle du budget départemental.',
    descriptionEn: 'Team management, department request approvals, departmental budget control.',
    modules: ['User Management (équipe)', 'Approval Workflows (département)', 'Budget Management (département)', 'Software Declarations (équipe)', 'License Management (lecture)', 'Notification Center'],
    restrictions: ['Accès limité à son département', 'Pas de configuration globale', 'Analytics limités']
  },
  {
    id: 'employee',
    name: 'Employé',
    nameEn: 'Employee',
    icon: User,
    color: 'bg-gray-500',
    permissions: ['Déclarations logicielles', 'Consultation licences', 'Profil personnel', 'Notifications'],
    description: 'Déclaration de besoins logiciels, consultation de ses licences assignées, gestion de son profil.',
    descriptionEn: 'Software needs declaration, assigned license consultation, personal profile management.',
    modules: ['Software Declarations', 'License Management (personnel)', 'Notification Center', 'Settings (profil)'],
    restrictions: ['Accès en lecture seule', 'Pas d\'approbations', 'Pas de gestion budgétaire', 'Données personnelles uniquement']
  },
  {
    id: 'service_provider',
    name: 'Prestataire de Service',
    nameEn: 'Service Provider',
    icon: Wrench,
    color: 'bg-purple-500',
    permissions: ['Support logiciels assignés', 'Tickets support', 'Documentation', 'Maintenance'],
    description: 'Support technique pour les logiciels assignés, gestion des tickets de support, accès à la documentation.',
    descriptionEn: 'Technical support for assigned software, support ticket management, documentation access.',
    modules: ['Support & Incidents', 'Software Catalog (assigné)', 'License Management (support)', 'Notification Center'],
    restrictions: ['Accès limité aux logiciels assignés', 'Pas de gestion budgétaire', 'Pas d\'approbations', 'Support uniquement']
  }
]

interface RoleSimulatorProps {
  currentRole: string
  onRoleChange: (role: string) => void
}

const RoleSimulator: React.FC<RoleSimulatorProps> = ({ currentRole, onRoleChange }) => {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const getCurrentRole = () => userRoles.find(role => role.id === currentRole) || userRoles[3]

  const handleRoleChange = (newRole: string) => {
    onRoleChange(newRole)
    setIsOpen(false)
  }

  const currentRoleData = getCurrentRole()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>Simuler Rôle</span>
          <Badge variant="secondary" className={`${currentRoleData.color} text-white`}>
            {language === 'fr' ? currentRoleData.name : currentRoleData.nameEn}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Simulateur de Rôles - Test UX</span>
          </DialogTitle>
          <DialogDescription>
            Basculez entre les différents rôles pour tester l'expérience utilisateur de chaque type d'utilisateur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rôle Actuel */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentRoleData.icon className="h-5 w-5" />
                <span>Rôle Actuel</span>
                <Badge className={`${currentRoleData.color} text-white`}>
                  {language === 'fr' ? currentRoleData.name : currentRoleData.nameEn}
                </Badge>
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? currentRoleData.description : currentRoleData.descriptionEn}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Permissions
                  </h4>
                  <ul className="space-y-1">
                    {currentRoleData.permissions.map((permission, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2 flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Restrictions
                  </h4>
                  <ul className="space-y-1">
                    {currentRoleData.restrictions.map((restriction, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center">
                        <Lock className="h-3 w-3 mr-2" />
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélecteur de Rôle */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Changer de Rôle pour Tester</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRoles.map((role) => {
                const Icon = role.icon
                const isActive = role.id === currentRole
                
                return (
                  <Card 
                    key={role.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <div className={`p-2 rounded-full ${role.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span>{language === 'fr' ? role.name : role.nameEn}</span>
                        {isActive && <Badge variant="secondary">Actuel</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3">
                        {language === 'fr' ? role.description : role.descriptionEn}
                      </p>
                      
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-xs font-medium text-green-700 mb-1">Modules Accessibles</h5>
                          <div className="flex flex-wrap gap-1">
                            {role.modules.slice(0, 3).map((module, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                            {role.modules.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.modules.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Guide de Test */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <Info className="h-5 w-5" />
                <span>Guide de Test par Rôle</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <strong>Super Admin :</strong> Testez la configuration système, la gestion globale des utilisateurs, tous les modules et les intégrations.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <strong>IT Manager :</strong> Focalisez sur les approbations, la gestion des licences, les budgets IT et les analytics.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <strong>Department Manager :</strong> Testez la gestion d'équipe, les approbations départementales et le budget de votre département.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <strong>Employee :</strong> Concentrez-vous sur les déclarations logicielles, la consultation de vos licences et votre profil.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <strong>Service Provider :</strong> Testez le support technique, la gestion des tickets et l'accès aux logiciels assignés.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleSimulator