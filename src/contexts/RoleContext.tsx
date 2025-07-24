import React, { createContext, useContext, useState, useEffect } from 'react'

interface UserRole {
  id: string
  name: string
  nameEn: string
  permissions: string[]
  modules: string[]
  restrictions: string[]
}

interface RoleContextType {
  currentRole: string
  setCurrentRole: (role: string) => void
  hasPermission: (permission: string) => boolean
  hasModuleAccess: (module: string) => boolean
  canApprove: (type: string) => boolean
  canManageUsers: () => boolean
  canManageBudgets: () => boolean
  canViewAnalytics: () => boolean
  isAdmin: () => boolean
  isManager: () => boolean
  isEmployee: () => boolean
}

const rolePermissions = {
  super_admin: {
    permissions: ['*'], // Toutes les permissions
    modules: ['*'], // Tous les modules
    canApprove: ['*'],
    canManageUsers: true,
    canManageBudgets: true,
    canViewAnalytics: true
  },
  it_manager: {
    permissions: ['license_management', 'approval_workflows', 'budget_management', 'analytics', 'renewal_management', 'contract_management', 'software_catalog', 'reports'],
    modules: ['licenses', 'approvals', 'budget', 'analytics', 'renewals', 'contracts', 'catalog', 'reports', 'notifications'],
    canApprove: ['license_request', 'software_declaration', 'budget_approval'],
    canManageUsers: false,
    canManageBudgets: true,
    canViewAnalytics: true
  },
  department_manager: {
    permissions: ['team_management', 'department_approvals', 'department_budget', 'team_declarations'],
    modules: ['users', 'approvals', 'budget', 'declarations', 'licenses', 'notifications'],
    canApprove: ['software_declaration', 'user_invitation'],
    canManageUsers: 'department_only',
    canManageBudgets: 'department_only',
    canViewAnalytics: 'department_only'
  },
  employee: {
    permissions: ['software_declarations', 'personal_licenses', 'personal_profile', 'notifications'],
    modules: ['declarations', 'licenses', 'notifications', 'settings'],
    canApprove: [],
    canManageUsers: false,
    canManageBudgets: false,
    canViewAnalytics: false
  },
  service_provider: {
    permissions: ['support_tickets', 'assigned_software', 'documentation', 'maintenance'],
    modules: ['support', 'catalog', 'licenses', 'notifications'],
    canApprove: [],
    canManageUsers: false,
    canManageBudgets: false,
    canViewAnalytics: false
  }
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<string>('employee') // Par défaut : employé

  // Sauvegarder le rôle dans localStorage pour persistance
  useEffect(() => {
    const savedRole = localStorage.getItem('simulatedRole')
    if (savedRole && rolePermissions[savedRole as keyof typeof rolePermissions]) {
      setCurrentRole(savedRole)
    }
  }, [])

  const updateRole = (role: string) => {
    setCurrentRole(role)
    localStorage.setItem('simulatedRole', role)
  }

  const getRoleConfig = () => {
    return rolePermissions[currentRole as keyof typeof rolePermissions] || rolePermissions.employee
  }

  const hasPermission = (permission: string): boolean => {
    const config = getRoleConfig()
    return config.permissions.includes('*') || config.permissions.includes(permission)
  }

  const hasModuleAccess = (module: string): boolean => {
    const config = getRoleConfig()
    return config.modules.includes('*') || config.modules.includes(module)
  }

  const canApprove = (type: string): boolean => {
    const config = getRoleConfig()
    return config.canApprove.includes('*') || config.canApprove.includes(type)
  }

  const canManageUsers = (): boolean => {
    const config = getRoleConfig()
    return config.canManageUsers === true
  }

  const canManageBudgets = (): boolean => {
    const config = getRoleConfig()
    return config.canManageBudgets === true
  }

  const canViewAnalytics = (): boolean => {
    const config = getRoleConfig()
    return config.canViewAnalytics === true
  }

  const isAdmin = (): boolean => {
    return currentRole === 'super_admin'
  }

  const isManager = (): boolean => {
    return currentRole === 'it_manager' || currentRole === 'department_manager'
  }

  const isEmployee = (): boolean => {
    return currentRole === 'employee'
  }

  return (
    <RoleContext.Provider value={{
      currentRole,
      setCurrentRole: updateRole,
      hasPermission,
      hasModuleAccess,
      canApprove,
      canManageUsers,
      canManageBudgets,
      canViewAnalytics,
      isAdmin,
      isManager,
      isEmployee
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export { RoleContext }