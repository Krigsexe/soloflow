import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@soloflow/ui/card';
import { getUserByClerkId } from '~/lib/database/queries';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/login-clerk');
  }

  try {
    // Vérifier les droits administrateur
    const user = await getUserByClerkId(userId);
    
    if (!user || user.role !== 'admin') {
      return (
        <div className="container mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Accès Refusé</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Vous n'avez pas les droits administrateur nécessaires pour accéder à cette section.
              </p>
              <p className="text-sm text-red-600 mt-2">
                Contactez l'administrateur système si vous pensez qu'il s'agit d'une erreur.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Barre de navigation admin */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">
                Administration SoloFlow
              </h1>
              <div className="ml-auto">
                <span className="text-sm text-gray-600">
                  Connecté en tant que: <strong>{user.name}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  } catch (error) {
    console.error('Erreur layout admin:', error);
    
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Erreur Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Une erreur est survenue lors de la vérification des droits d'accès.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Veuillez réessayer ou contacter le support technique.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}