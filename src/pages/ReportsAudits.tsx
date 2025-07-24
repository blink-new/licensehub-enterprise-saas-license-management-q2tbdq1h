import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const ReportsAudits: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('reportsAudits')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Conformité réglementaire et audit trail complet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Rapports de conformité automatisés avec audit trail complet
            pour RGPD, SOX et ISO 27001.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsAudits