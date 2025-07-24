import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

const SoftwareCatalog: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('softwareCatalog')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Catalogue approuvé avec évaluation sécuritaire
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Module en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Catalogue de logiciels approuvés avec évaluation sécuritaire,
            alternatives recommandées et processus de validation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SoftwareCatalog