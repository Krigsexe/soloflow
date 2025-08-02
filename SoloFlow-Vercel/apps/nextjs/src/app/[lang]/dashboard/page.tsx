import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Locale } from '~/config/i18n-config';

interface DashboardPageProps {
  params: {
    lang: Locale;
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect(`/${params.lang}/login-clerk`);
  }

  const user = await currentUser();
  if (!user) {
    redirect(`/${params.lang}/login-clerk`);
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = user.emailAddresses.some(
    email => process.env.ADMIN_EMAIL?.split(',').includes(email.emailAddress)
  );

  // Rediriger vers le dashboard approprié
  if (isAdmin) {
    redirect(`/${params.lang}/dashboard/admin`);
  } else {
    redirect(`/${params.lang}/dashboard/client`);
  }
}