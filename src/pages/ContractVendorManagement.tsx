import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const ContractVendorManagement: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('contractVendorManagement')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Base de données fournisseurs avec gestion contractuelle
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gestion complète des contrats fournisseurs avec suivi des SLA,
            négociation assistée et évaluation des performances.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContractVendorManagement