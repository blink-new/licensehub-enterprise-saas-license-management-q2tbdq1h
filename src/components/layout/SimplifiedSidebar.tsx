import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Key, FileText, Settings, LogOut, Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import blink from '@/blink/client'
import { useLanguage } from '@/hooks/useLanguage'
import { usePlan } from '@/contexts/PlanContext'
import { Badge } from '@/components/ui/badge'

interface SimplifiedSidebarProps {
  user: any
}

const SimplifiedSidebar: React.FC<SimplifiedSidebarProps> = ({ user }) => {
  const location = useLocation()
  const { t } = useLanguage()
  const { currentPlan, getSimplifiedModules } = usePlan()

  const modules = getSimplifiedModules()

  const handleLogout = () => {
    blink.auth.logout()
  }

  const getPlanBadge = () => {
    switch (currentPlan) {
      case 'tpe':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">TPE</Badge>
      case 'pme':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">PME</Badge>
      case 'enterprise':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Enterprise</Badge>
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons = {
      LayoutDashboard,
      Key,
      FileText,
      Settings
    }
    return icons[iconName as keyof typeof icons] || LayoutDashboard
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Key className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">LicenseHub</h1>
            {getPlanBadge()}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {modules.map((module) => {
          const Icon = getIconComponent(module.icon)
          const isActive = location.pathname === module.path
          
          return (
            <Link
              key={module.path}
              to={module.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {module.name}
            </Link>
          )
        })}

        {/* Upgrade CTA for TPE/PME */}
        {currentPlan !== 'enterprise' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center mb-2">
              <Crown className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Passer à Enterprise
              </span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
              Débloquez tous les modules et fonctionnalités avancées
            </p>
            <button className="w-full px-3 py-2 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
              Découvrir Enterprise
            </button>
          </div>
        )}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role || 'Utilisateur'}
            </p>
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

export default SimplifiedSidebar