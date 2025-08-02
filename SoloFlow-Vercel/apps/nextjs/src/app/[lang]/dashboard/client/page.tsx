import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Locale } from '~/config/i18n-config';

interface ClientDashboardPageProps {
  params: {
    lang: Locale;
  };
}

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect(`/${params.lang}/login-clerk`);
  }

  const user = await currentUser();
  if (!user) {
    redirect(`/${params.lang}/login-clerk`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Client
            </h1>
            <div className="flex items-center space-x-2">
              <img 
                src={user.imageUrl} 
                alt={user.firstName || 'User'} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Bienvenue
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Vous êtes connecté en tant que client.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Statut
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Compte actif
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Actions
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                Gérez votre profil et vos paramètres.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}