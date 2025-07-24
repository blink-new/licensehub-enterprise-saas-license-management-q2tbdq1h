import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Key, FileText, Users, UserPlus, Bell, DollarSign,
  CheckCircle, Calendar, Building, FileCheck, Package, Star,
  TrendingUp, BarChart3, Zap, HelpCircle, Settings, LogOut,
  ChevronDown, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import blink from '@/blink/client'
import { useLanguage } from '@/hooks/useLanguage'
import { useRole } from '@/hooks/useRole'

interface SidebarProps {
  user: any
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation()
  const { t } = useLanguage()
  const { hasModuleAccess, currentRole } = useRole()
  const [expandedSections, setExpandedSections] = useState<string[]>(['governance', 'users', 'licenses', 'communication'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const navigationSections = [
    {
      id: 'governance',
      name: t('governance'),
      icon: TrendingUp,
      items: [
        { name: t('executiveDashboard'), path: '/', icon: LayoutDashboard, module: '*' },
        { name: t('budgetManagement'), path: '/budget', icon: DollarSign, module: 'budget' },
        { name: t('advancedAnalytics'), path: '/analytics', icon: TrendingUp, module: 'analytics' },
        { name: t('reportsAudits'), path: '/reports', icon: BarChart3, module: 'reports' }
      ]
    },
    {
      id: 'users',
      name: t('userManagement'),
      icon: Users,
      items: [
        { name: t('userManagement'), path: '/users', icon: Users, module: 'users' },
        { name: t('userInvitations'), path: '/invitations', icon: UserPlus, module: 'users' },
        { name: t('departmentManagement'), path: '/departments', icon: Building, module: 'users' }
      ]
    },
    {
      id: 'licenses',
      name: t('licenseManagement'),
      icon: Key,
      items: [
        { name: t('licenseManagement'), path: '/licenses', icon: Key, module: 'licenses' },
        { name: t('softwareDeclarations'), path: '/declarations', icon: FileText, module: 'declarations' },
        { name: t('renewalManagement'), path: '/renewals', icon: Calendar, module: 'renewals' },
        { name: t('contractVendorManagement'), path: '/contracts', icon: FileCheck, module: 'contracts' },
        { name: t('softwareCatalog'), path: '/catalog', icon: Package, module: 'catalog' }
      ]
    },
    {
      id: 'communication',
      name: t('communication'),
      icon: Bell,
      items: [
        { name: t('notificationCenter'), path: '/notifications', icon: Bell, module: 'notifications' },
        { name: t('approvalWorkflows'), path: '/approvals', icon: CheckCircle, module: 'approvals' },
        { name: t('softwareReviews'), path: '/reviews', icon: Star, module: 'reviews' },
        { name: t('supportIncidents'), path: '/support', icon: HelpCircle, module: 'support' }
      ]
    },
    {
      id: 'system',
      name: t('system'),
      icon: Settings,
      items: [
        { name: t('integrations'), path: '/integrations', icon: Zap, module: 'integrations' },
        { name: t('settings'), path: '/settings', icon: Settings, module: 'settings' }
      ]
    }
  ]

  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Key className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LicenseHub</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationSections.map((section) => {
          const SectionIcon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          // Filtrer les éléments selon les permissions
          const accessibleItems = section.items.filter(item => 
            item.module === '*' || hasModuleAccess(item.module)
          )
          
          // Ne pas afficher la section si aucun élément n'est accessible
          if (accessibleItems.length === 0) return null
          
          return (
            <div key={section.id} className="space-y-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <SectionIcon className="w-4 h-4 mr-3" />
                  {section.name}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role || 'Employee'}
            </p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-green-600 font-medium">
                Mode: {currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Sidebar