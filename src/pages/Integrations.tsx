import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const Integrations: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('integrations')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connecteurs API natifs (AD, HR, SSO, monitoring)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Intégrations natives avec Active Directory, systèmes RH, SSO
            et outils de monitoring pour une synchronisation automatique.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Integrations