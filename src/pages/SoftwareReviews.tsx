import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const SoftwareReviews: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('softwareReviews')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Évaluations internes détaillées des logiciels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Système d'évaluation interne des logiciels avec notation,
            commentaires utilisateurs et recommandations d'amélioration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SoftwareReviews