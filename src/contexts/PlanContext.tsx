import React, { createContext, useContext, useState, useEffect } from 'react'
import blink from '@/blink/client'

export type PlanType = 'tpe' | 'pme' | 'enterprise'

interface PlanFeatures {
  maxUsers: number
  maxLicenses: number
  modules: string[]
  workflows: boolean
  analytics: boolean
  integrations: boolean
  support: 'basic' | 'standard' | 'premium'
  customization: boolean
}

interface PlanContextType {
  currentPlan: PlanType
  setPlan: (plan: PlanType) => void
  features: PlanFeatures
  isFeatureEnabled: (feature: string) => boolean
  getSimplifiedModules: () => any[]
}

const planFeatures: Record<PlanType, PlanFeatures> = {
  tpe: {
    maxUsers: 10,
    maxLicenses: 50,
    modules: ['licenses', 'declarations', 'dashboard'],
    workflows: false,
    analytics: false,
    integrations: false,
    support: 'basic',
    customization: false
  },
  pme: {
    maxUsers: 250,
    maxLicenses: 500,
    modules: ['licenses', 'declarations', 'dashboard', 'users', 'budget', 'renewals', 'notifications'],
    workflows: true,
    analytics: true,
    integrations: false,
    support: 'standard',
    customization: false
  },
  enterprise: {
    maxUsers: -1, // Unlimited
    maxLicenses: -1, // Unlimited
    modules: ['all'],
    workflows: true,
    analytics: true,
    integrations: true,
    support: 'premium',
    customization: true
  }
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('enterprise') // Default to enterprise for demo

  useEffect(() => {
    // Load user's plan from database or API
    const loadUserPlan = async () => {
      try {
        const user = await blink.auth.me()
        if (user) {
          // Check user's company size or subscription plan
          const company = await blink.db.companies.list({
            where: { id: user.company_id },
            limit: 1
          })
          
          if (company.length > 0) {
            const companySize = company[0].size
            switch (companySize) {
              case 'startup':
                setCurrentPlan('tpe')
                break
              case 'sme':
                setCurrentPlan('pme')
                break
              case 'enterprise':
              case 'corporation':
                setCurrentPlan('enterprise')
                break
              default:
                setCurrentPlan('pme')
            }
          }
        }
      } catch (error) {
        console.error('Error loading user plan:', error)
      }
    }

    loadUserPlan()
  }, [])

  const setPlan = (plan: PlanType) => {
    setCurrentPlan(plan)
    // Save to user preferences or company settings
  }

  const features = planFeatures[currentPlan]

  const isFeatureEnabled = (feature: string): boolean => {
    if (currentPlan === 'enterprise') return true
    return features.modules.includes(feature) || features.modules.includes('all')
  }

  const getSimplifiedModules = () => {
    const allModules = [
      { id: 'dashboard', name: 'Tableau de Bord', icon: 'LayoutDashboard', path: '/', essential: true },
      { id: 'licenses', name: 'Mes Licences', icon: 'Key', path: '/licenses', essential: true },
      { id: 'declarations', name: 'Déclarer un Logiciel', icon: 'FileText', path: '/declarations', essential: true },
      { id: 'users', name: 'Équipe', icon: 'Users', path: '/users', essential: false },
      { id: 'budget', name: 'Budget', icon: 'DollarSign', path: '/budget', essential: false },
      { id: 'renewals', name: 'Renouvellements', icon: 'Calendar', path: '/renewals', essential: false },
      { id: 'notifications', name: 'Notifications', icon: 'Bell', path: '/notifications', essential: false },
      { id: 'approvals', name: 'Approbations', icon: 'CheckCircle', path: '/approvals', essential: false },
      { id: 'analytics', name: 'Analytics', icon: 'TrendingUp', path: '/analytics', essential: false },
      { id: 'settings', name: 'Paramètres', icon: 'Settings', path: '/settings', essential: true }
    ]

    switch (currentPlan) {
      case 'tpe':
        return allModules.filter(module => 
          ['dashboard', 'licenses', 'declarations', 'settings'].includes(module.id)
        )
      case 'pme':
        return allModules.filter(module => 
          features.modules.includes(module.id) || module.essential
        )
      case 'enterprise':
      default:
        return allModules
    }
  }

  return (
    <PlanContext.Provider value={{
      currentPlan,
      setPlan,
      features,
      isFeatureEnabled,
      getSimplifiedModules
    }}>
      {children}
    </PlanContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePlan = () => {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}