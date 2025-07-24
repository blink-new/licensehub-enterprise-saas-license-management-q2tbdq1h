import React from 'react'
import Sidebar from './Sidebar'
import SimplifiedSidebar from './SimplifiedSidebar'
import Header from './Header'
import { usePlan } from '@/contexts/PlanContext'

interface LayoutProps {
  children: React.ReactNode
  user: any
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const { currentPlan } = usePlan()

  // Use simplified sidebar for TPE, regular sidebar for PME/Enterprise
  const SidebarComponent = currentPlan === 'tpe' ? SimplifiedSidebar : Sidebar

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarComponent user={user} />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout