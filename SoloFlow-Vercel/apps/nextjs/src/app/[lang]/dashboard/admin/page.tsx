import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Locale } from '~/config/i18n-config';

interface AdminDashboardPageProps {
  params: {
    lang: Locale;
  };
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect(`/${params.lang}/login-clerk`);
  }

  const user = await currentUser();
  if (!user) {
    redirect(`/${params.lang}/login-clerk`);
  }

  // Vérifier si l'utilisateur est vraiment admin
  const isAdmin = user.emailAddresses.some(
    email => process.env.ADMIN_EMAIL?.split(',').includes(email.emailAddress)
  );

  if (!isAdmin) {
    redirect(`/${params.lang}/dashboard/client`);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Administrateur
            </h1>
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded text-xs font-semibold text-red-800 dark:text-red-200">
                ADMIN
              </div>
              <img 
                src={user.imageUrl} 
                alt={user.firstName || 'Admin'} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Utilisateurs
              </h3>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                0
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Utilisateurs actifs
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Projets
              </h3>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                0
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Projets en cours
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Revenus
              </h3>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                €0
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Ce mois
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Système
              </h3>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                ✓
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Opérationnel
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Actions Administrateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Gérer les utilisateurs
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Voir les analytics
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Configuration système
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}