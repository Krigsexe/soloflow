import { createClient } from '~/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TestSupabasePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Test de connexion simple
  let connectionStatus = 'Échec'
  let error = null
  let userCount = 0

  try {
    // Test simple de connexion en essayant d'accéder aux métadonnées
    const { data, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      error = testError.message
    } else {
      connectionStatus = 'Succès'
      userCount = data?.length || 0
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erreur inconnue'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test Intégration Supabase</h1>
      
      <div className="grid gap-6">
        {/* Statut de connexion */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Statut de connexion</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'Succès' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`font-medium ${
              connectionStatus === 'Succès' ? 'text-green-700' : 'text-red-700'
            }`}>
              {connectionStatus}
            </span>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">URL Supabase:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurée' : '❌ Manquante'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clé Anon:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante'}
              </span>
            </div>
          </div>
        </div>

        {/* Informations de test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Informations de test</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> Cette page teste la connexion à Supabase.
                Si vous voyez des erreurs, vérifiez que :
              </p>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm space-y-1">
                <li>Les variables d'environnement sont correctement configurées</li>
                <li>La table 'users' existe dans votre base Supabase</li>
                <li>Les politiques RLS sont configurées si nécessaire</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-700 text-sm">
                <strong>Prochaines étapes:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 text-sm space-y-1">
                <li>Exécuter le script <code className="bg-gray-200 px-1 rounded">create-tables.sql</code> dans Supabase</li>
                <li>Configurer l'authentification si nécessaire</li>
                <li>Tester les opérations CRUD</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-2 text-sm">
            <p>🔧 <strong>Scripts disponibles:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
              <li><code className="bg-gray-100 px-1 rounded">node check-database.js</code> - Vérifier la base de données</li>
              <li><code className="bg-gray-100 px-1 rounded">node setup-database.js</code> - Configurer les tables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}