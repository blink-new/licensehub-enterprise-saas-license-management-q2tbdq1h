import React, { createContext, useContext, useState } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const translations = {
  fr: {
    // Navigation Sections
    governance: 'Gouvernance & Stratégie',
    userManagement: 'Gestion des Utilisateurs',
    licenseManagement: 'Gestion des Licences',
    communication: 'Communication & Support',
    system: 'Système',

    // Main Navigation
    executiveDashboard: 'Tableau de Bord Exécutif',
    budgetManagement: 'Gestion Budgétaire',
    advancedAnalytics: 'Analytics Avancés',
    reportsAudits: 'Rapports & Audits',
    userInvitations: 'Invitations Utilisateurs',
    departmentManagement: 'Gestion des Départements',
    softwareDeclarations: 'Déclarations Logicielles',
    renewalManagement: 'Gestion des Renouvellements',
    contractVendorManagement: 'Contrats & Fournisseurs',
    softwareCatalog: 'Catalogue Logiciels',
    notificationCenter: 'Centre de Notifications',
    approvalWorkflows: 'Workflows d\'Approbation',
    softwareReviews: 'Avis Logiciels',
    supportIncidents: 'Support & Incidents',
    integrations: 'Intégrations',
    settings: 'Paramètres',
    logout: 'Déconnexion',

    // Common Actions
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    create: 'Créer',
    update: 'Mettre à jour',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    approve: 'Approuver',
    reject: 'Rejeter',
    assign: 'Assigner',
    revoke: 'Révoquer',
    renew: 'Renouveler',
    view: 'Voir',
    download: 'Télécharger',
    upload: 'Téléverser',

    // Status Values
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    expired: 'Expiré',
    cancelled: 'Annulé',
    completed: 'Terminé',
    inProgress: 'En cours',

    // Dashboard Metrics
    totalLicenses: 'Licences Totales',
    activeLicenses: 'Licences Actives',
    expiredLicenses: 'Licences Expirées',
    pendingDeclarations: 'Déclarations en Attente',
    complianceScore: 'Score de Conformité',
    totalCost: 'Coût Total',
    monthlyCost: 'Coût Mensuel',
    annualCost: 'Coût Annuel',
    costSavings: 'Économies Réalisées',
    utilizationRate: 'Taux d\'Utilisation',
    renewalsThisMonth: 'Renouvellements ce Mois',
    budgetUtilization: 'Utilisation du Budget',

    // License Fields
    softwareName: 'Nom du Logiciel',
    vendor: 'Éditeur',
    category: 'Catégorie',
    licenseType: 'Type de Licence',
    totalSeats: 'Sièges Totaux',
    usedSeats: 'Sièges Utilisés',
    availableSeats: 'Sièges Disponibles',
    costPerSeat: 'Coût par Siège',
    purchaseDate: 'Date d\'Achat',
    renewalDate: 'Date de Renouvellement',
    contractId: 'ID Contrat',
    autoRenewal: 'Renouvellement Automatique',
    notificationDays: 'Jours de Notification',

    // User Fields
    userName: 'Nom d\'Utilisateur',
    email: 'Email',
    role: 'Rôle',
    department: 'Département',
    manager: 'Responsable',
    employeeId: 'ID Employé',
    jobTitle: 'Titre du Poste',
    location: 'Localisation',
    costCenter: 'Centre de Coût',
    lastLogin: 'Dernière Connexion',
    isActive: 'Actif',

    // User Roles
    superAdmin: 'Super Administrateur',
    itManager: 'Responsable IT',
    departmentManager: 'Responsable de Département',
    employee: 'Employé',
    serviceProvider: 'Prestataire de Service',

    // Success Messages
    saveSuccess: 'Enregistré avec succès',
    updateSuccess: 'Mis à jour avec succès',
    deleteSuccess: 'Supprimé avec succès',

    // Error Messages
    saveError: 'Erreur lors de l\'enregistrement',
    updateError: 'Erreur lors de la mise à jour',
    deleteError: 'Erreur lors de la suppression',
    loadError: 'Erreur lors du chargement',
    networkError: 'Erreur de réseau',
    validationError: 'Erreur de validation',
    permissionError: 'Permissions insuffisantes'
  },
  en: {
    // Navigation Sections
    governance: 'Governance & Strategy',
    userManagement: 'User Management',
    licenseManagement: 'License Management',
    communication: 'Communication & Support',
    system: 'System',

    // Main Navigation
    executiveDashboard: 'Executive Dashboard',
    budgetManagement: 'Budget Management',
    advancedAnalytics: 'Advanced Analytics',
    reportsAudits: 'Reports & Audits',
    userInvitations: 'User Invitations',
    departmentManagement: 'Department Management',
    softwareDeclarations: 'Software Declarations',
    renewalManagement: 'Renewal Management',
    contractVendorManagement: 'Contracts & Vendors',
    softwareCatalog: 'Software Catalog',
    notificationCenter: 'Notification Center',
    approvalWorkflows: 'Approval Workflows',
    softwareReviews: 'Software Reviews',
    supportIncidents: 'Support & Incidents',
    integrations: 'Integrations',
    settings: 'Settings',
    logout: 'Logout',

    // Common Actions
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    approve: 'Approve',
    reject: 'Reject',
    assign: 'Assign',
    revoke: 'Revoke',
    renew: 'Renew',
    view: 'View',
    download: 'Download',
    upload: 'Upload',

    // Status Values
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    cancelled: 'Cancelled',
    completed: 'Completed',
    inProgress: 'In Progress',

    // Dashboard Metrics
    totalLicenses: 'Total Licenses',
    activeLicenses: 'Active Licenses',
    expiredLicenses: 'Expired Licenses',
    pendingDeclarations: 'Pending Declarations',
    complianceScore: 'Compliance Score',
    totalCost: 'Total Cost',
    monthlyCost: 'Monthly Cost',
    annualCost: 'Annual Cost',
    costSavings: 'Cost Savings',
    utilizationRate: 'Utilization Rate',
    renewalsThisMonth: 'Renewals This Month',
    budgetUtilization: 'Budget Utilization',

    // License Fields
    softwareName: 'Software Name',
    vendor: 'Vendor',
    category: 'Category',
    licenseType: 'License Type',
    totalSeats: 'Total Seats',
    usedSeats: 'Used Seats',
    availableSeats: 'Available Seats',
    costPerSeat: 'Cost per Seat',
    purchaseDate: 'Purchase Date',
    renewalDate: 'Renewal Date',
    contractId: 'Contract ID',
    autoRenewal: 'Auto Renewal',
    notificationDays: 'Notification Days',

    // User Fields
    userName: 'User Name',
    email: 'Email',
    role: 'Role',
    department: 'Department',
    manager: 'Manager',
    employeeId: 'Employee ID',
    jobTitle: 'Job Title',
    location: 'Location',
    costCenter: 'Cost Center',
    lastLogin: 'Last Login',
    isActive: 'Active',

    // User Roles
    superAdmin: 'Super Administrator',
    itManager: 'IT Manager',
    departmentManager: 'Department Manager',
    employee: 'Employee',
    serviceProvider: 'Service Provider',

    // Success Messages
    saveSuccess: 'Saved successfully',
    updateSuccess: 'Updated successfully',
    deleteSuccess: 'Deleted successfully',

    // Error Messages
    saveError: 'Error saving',
    updateError: 'Error updating',
    deleteError: 'Error deleting',
    loadError: 'Error loading',
    networkError: 'Network error',
    validationError: 'Validation error',
    permissionError: 'Insufficient permissions'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('fr') // Default to French

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.fr] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export { LanguageContext }