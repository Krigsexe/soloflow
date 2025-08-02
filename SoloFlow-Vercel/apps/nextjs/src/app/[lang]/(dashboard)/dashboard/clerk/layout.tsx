import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface ClerkDashboardLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default async function ClerkDashboardLayout({
  children,
  params: { lang },
}: ClerkDashboardLayoutProps) {
  const { userId } = auth();
  
  if (!userId) {
    redirect(`/${lang}/login-clerk`);
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">SoloFlow Dashboard</h1>
            <span className="text-sm text-muted-foreground">Clerk Auth</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}