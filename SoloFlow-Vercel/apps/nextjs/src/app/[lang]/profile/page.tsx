import { ClerkUserProfile } from "~/components/auth/clerk-wrapper";
import { getDictionary } from "~/lib/get-dictionary";

interface ProfilePageProps {
  params: {
    lang: string;
  };
}

export default async function ProfilePage({
  params: { lang },
}: ProfilePageProps) {
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {dict?.profile?.title || "Profil Utilisateur"}
        </h1>
        <p className="text-muted-foreground">
          {dict?.profile?.description || "Gérez vos informations personnelles et préférences"}
        </p>
      </div>
      
      <div className="flex justify-center">
        <ClerkUserProfile className="w-full max-w-2xl" />
      </div>
    </div>
  );
}

export async function generateMetadata({
  params: { lang },
}: ProfilePageProps) {
  const dict = await getDictionary(lang);
  
  return {
    title: dict?.profile?.title || "Profil Utilisateur",
    description: dict?.profile?.description || "Gérez vos informations personnelles et préférences",
  };
}