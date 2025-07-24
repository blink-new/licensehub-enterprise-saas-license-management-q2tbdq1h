import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const DepartmentManagement: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('departmentManagement')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Organisation multi-sites avec structure hiérarchique
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gestion des départements avec structure hiérarchique, allocation budgétaire
            et reporting par entité organisationnelle.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DepartmentManagement