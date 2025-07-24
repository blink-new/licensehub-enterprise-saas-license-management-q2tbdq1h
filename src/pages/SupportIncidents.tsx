import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const SupportIncidents: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('supportIncidents')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Système de tickets avec escalade et base de connaissances
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Système de support avancé avec gestion des tickets, escalade automatique
            et base de connaissances intégrée.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SupportIncidents