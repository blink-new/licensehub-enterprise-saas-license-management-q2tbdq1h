import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import blink from './blink/client'
import Layout from './components/layout/Layout'

// Import all 18 modules
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import PMEDashboard from './pages/PMEDashboard'
import LicenseManagement from './pages/LicenseManagement'
import SoftwareDeclarations from './pages/SoftwareDeclarations'
import UserManagement from './pages/UserManagement'
import UserInvitations from './pages/UserInvitations'
import NotificationCenter from './pages/NotificationCenter'
import BudgetManagement from './pages/BudgetManagement'
import ApprovalWorkflows from './pages/ApprovalWorkflows'
import RenewalManagement from './pages/RenewalManagement'
import DepartmentManagement from './pages/DepartmentManagement'
import ContractVendorManagement from './pages/ContractVendorManagement'
import SoftwareCatalog from './pages/SoftwareCatalog'
import SoftwareReviews from './pages/SoftwareReviews'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import ReportsAudits from './pages/ReportsAudits'
import Integrations from './pages/Integrations'
import SupportIncidents from './pages/SupportIncidents'
import Settings from './pages/Settings'

import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PlanProvider } from './contexts/PlanContext'
import { RoleProvider } from './contexts/RoleContext'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  name?: string
  role?: string
  company_id?: string
  department?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Setting up auth state listener...')
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout reached, stopping loading...')
      setLoading(false)
    }, 10000) // 10 seconds timeout
    
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      console.log('Auth state changed:', state)
      clearTimeout(timeout) // Clear timeout when auth state changes
      
      try {
        setUser(state.user)
        setLoading(state.isLoading)

        if (state.user && !state.isLoading) {
          console.log('User authenticated, creating/updating user record...')
          // Create/update user in database with enterprise fields
          await blink.db.users.upsert({
            id: state.user.id,
            name: state.user.name || state.user.email,
            email: state.user.email,
            role: 'employee', // Default role, will be updated by admin
            is_active: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString()
          }).catch(console.error)
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const handleSignIn = () => {
    try {
      blink.auth.login()
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">LicenseHub Enterprise</h2>
          <p className="text-gray-500">Chargement de votre plateforme...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              LicenseHub Enterprise
            </h2>
            <p className="text-gray-600 mb-6">
              Plateforme de gouvernance des licences logicielles
            </p>
          </div>
          <button
            onClick={handleSignIn}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Se connecter avec Blink
          </button>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlanProvider>
          <RoleProvider>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Layout user={user}>
                <Routes>
                  <Route path="/" element={<PMEDashboard user={user} />} />
                  <Route path="/licenses" element={<LicenseManagement />} />
                  <Route path="/declarations" element={<SoftwareDeclarations />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/invitations" element={<UserInvitations />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
                  <Route path="/budget" element={<BudgetManagement />} />
                  <Route path="/approvals" element={<ApprovalWorkflows />} />
                  <Route path="/renewals" element={<RenewalManagement />} />
                  <Route path="/departments" element={<DepartmentManagement />} />
                  <Route path="/contracts" element={<ContractVendorManagement />} />
                  <Route path="/catalog" element={<SoftwareCatalog />} />
                  <Route path="/reviews" element={<SoftwareReviews />} />
                  <Route path="/analytics" element={<AdvancedAnalytics />} />
                  <Route path="/reports" element={<ReportsAudits />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/support" element={<SupportIncidents />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
              <Toaster />
            </div>
            </Router>
          </RoleProvider>
        </PlanProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App